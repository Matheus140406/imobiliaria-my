import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@imobiliaria/db/server";
import { validarUploadSeguro } from "@/lib/uploadSeguranca";

const BUCKET = "imoveis-midia";
const MENSAGEM_GENERICA = "Arquivo inválido.";

// Bytes suficientes pra cobrir a maior assinatura que checamos (WEBP olha o
// offset 8-11) com folga; não precisamos baixar o arquivo inteiro pra
// confirmar a assinatura, só o cabeçalho.
const BYTES_PARA_CHECAR = 64;

type CorpoConfirmar = {
  path?: unknown;
  imovelId?: unknown;
  ordem?: unknown;
  nomeOriginal?: unknown;
  mimeInformado?: unknown;
};

function extrairTamanhoDoContentRange(header: string | null): number | null {
  // Formato: "bytes 0-63/193482"
  const match = header?.match(/\/(\d+)$/);
  return match ? Number(match[1]) : null;
}

function registrarRejeicao(dados: {
  request: NextRequest;
  userId: string | null;
  path: string;
  nomeOriginal: string;
  mimeInformado: string;
  tipoDetectado: string | null;
  motivoInterno: string;
}) {
  const ip =
    dados.request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    dados.request.headers.get("x-real-ip") ??
    "desconhecido";
  const extensaoEnviada = dados.nomeOriginal.includes(".")
    ? dados.nomeOriginal.split(".").pop()
    : "(sem extensão)";

  // Log estruturado — só aqui o motivo real aparece; a resposta HTTP pro
  // cliente é sempre a mensagem genérica, por design (requisito de nunca
  // expor detalhe interno de validação).
  console.warn(
    "[upload-seguranca:rejeitado]",
    JSON.stringify({
      data: new Date().toISOString(),
      ip,
      usuario: dados.userId ?? "desconhecido",
      path: dados.path,
      nomeOriginal: dados.nomeOriginal,
      extensaoEnviada,
      mimeInformado: dados.mimeInformado,
      tipoDetectado: dados.tipoDetectado ?? "desconhecido",
      motivo: dados.motivoInterno,
    }),
  );
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: MENSAGEM_GENERICA }, { status: 401 });
  }

  let corpo: CorpoConfirmar;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ error: MENSAGEM_GENERICA }, { status: 400 });
  }

  const { path, imovelId, ordem, nomeOriginal, mimeInformado } = corpo;

  if (
    typeof path !== "string" ||
    typeof imovelId !== "string" ||
    typeof ordem !== "number" ||
    typeof nomeOriginal !== "string" ||
    typeof mimeInformado !== "string" ||
    // O path é sempre gerado por nós mesmos no formato "<imovelId>/<uuid>" —
    // qualquer coisa fora desse formato indica um path forjado pelo cliente.
    !path.startsWith(`${imovelId}/`)
  ) {
    return NextResponse.json({ error: MENSAGEM_GENERICA }, { status: 400 });
  }

  // O arquivo já está no bucket (upload direto via signed URL, que não passa
  // pelo nosso servidor — evita o limite de tamanho de corpo de requisição
  // das Functions da Vercel). Aqui buscamos só o cabeçalho via Range request
  // pra confirmar a assinatura real, sem baixar o arquivo inteiro.
  const { data: assinada, error: erroAssinatura } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60);

  if (erroAssinatura || !assinada) {
    registrarRejeicao({
      request,
      userId: user.id,
      path,
      nomeOriginal,
      mimeInformado,
      tipoDetectado: null,
      motivoInterno: `não foi possível gerar URL assinada para leitura: ${erroAssinatura?.message}`,
    });
    return NextResponse.json({ error: MENSAGEM_GENERICA }, { status: 422 });
  }

  const resposta = await fetch(assinada.signedUrl, {
    headers: { Range: `bytes=0-${BYTES_PARA_CHECAR - 1}` },
  });

  if (!resposta.ok) {
    registrarRejeicao({
      request,
      userId: user.id,
      path,
      nomeOriginal,
      mimeInformado,
      tipoDetectado: null,
      motivoInterno: `falha ao ler cabeçalho do arquivo enviado (status ${resposta.status})`,
    });
    await supabase.storage.from(BUCKET).remove([path]);
    return NextResponse.json({ error: MENSAGEM_GENERICA }, { status: 422 });
  }

  const bytes = new Uint8Array(await resposta.arrayBuffer());
  const tamanhoReal =
    extrairTamanhoDoContentRange(resposta.headers.get("content-range")) ??
    Number(resposta.headers.get("content-length") ?? 0);

  const resultado = validarUploadSeguro({
    bytes,
    tamanhoReal,
    nomeOriginal,
    mimeInformado,
  });

  if (!resultado.valido) {
    registrarRejeicao({
      request,
      userId: user.id,
      path,
      nomeOriginal,
      mimeInformado,
      tipoDetectado: resultado.tipoDetectado,
      motivoInterno: resultado.motivoInterno,
    });
    // Remove imediatamente o arquivo rejeitado — nada inválido fica hospedado
    // publicamente no bucket, mesmo que o upload direto já tenha concluído.
    await supabase.storage.from(BUCKET).remove([path]);
    return NextResponse.json({ error: resultado.motivoPublico }, { status: 422 });
  }

  // A tabela "midias" só tem espaço pra "imagem"/"video" hoje (não existe
  // upload de documento em nenhuma tela do produto) — PDF é validado pelo
  // módulo por ser um formato pedido explicitamente e pra deixar a função
  // reutilizável no futuro, mas essa rota não tem onde guardar um PDF ainda.
  if (resultado.categoria === "documento") {
    registrarRejeicao({
      request,
      userId: user.id,
      path,
      nomeOriginal,
      mimeInformado,
      tipoDetectado: resultado.tipoDetectado,
      motivoInterno: "categoria 'documento' válida, mas sem suporte nesta rota (midias só aceita imagem/video)",
    });
    await supabase.storage.from(BUCKET).remove([path]);
    return NextResponse.json({ error: MENSAGEM_GENERICA }, { status: 422 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { data: midia, error: erroInsert } = await supabase
    .from("midias")
    .insert({
      imovel_id: imovelId,
      url: publicUrl,
      tipo: resultado.categoria,
      ordem,
    })
    .select()
    .single();

  if (erroInsert || !midia) {
    await supabase.storage.from(BUCKET).remove([path]);
    return NextResponse.json({ error: MENSAGEM_GENERICA }, { status: 500 });
  }

  return NextResponse.json({ midia });
}

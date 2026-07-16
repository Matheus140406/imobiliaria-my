import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@imobiliaria/db/types";
import { comprimirImagemSeNecessario } from "@/lib/imageCompression";
import { validarUploadSeguro } from "@/lib/uploadSeguranca";

const MENSAGEM_GENERICA = "Arquivo inválido.";

/**
 * Envia um único arquivo (imagem ou vídeo) para o bucket "imoveis-midia" e
 * cria o registro correspondente na tabela "midias". Usado tanto pelo
 * MediaManager (edição de imóvel existente) quanto pelo fluxo de
 * cadastro rápido / sincronização offline, para manter o mesmo caminho de
 * upload em todos os lugares.
 *
 * O upload em si (client -> Storage via signed URL) continua direto, sem
 * passar pelo nosso servidor, pra não esbarrar no limite de tamanho de
 * corpo de requisição das Functions da Vercel. Quem decide se o arquivo é
 * aceito é sempre `/api/midias/confirmar` — ele lê de volta a assinatura
 * binária real do que foi parar no bucket antes de criar o registro em
 * "midias", então mesmo que este cliente seja pulado (chamada direta à API
 * do Supabase), nada inválido fica exposto publicamente por muito tempo.
 */
export async function uploadMidiaParaImovel(
  supabase: SupabaseClient<Database>,
  imovelId: string,
  arquivo: File | Blob,
  nomeArquivo: string,
  ordem: number,
): Promise<Tables<"midias">> {
  const tipoMime =
    arquivo instanceof File ? arquivo.type : (arquivo as Blob).type;
  const ehVideo = tipoMime.startsWith("video");

  // Checagem rápida no cliente: só pra dar feedback instantâneo (sem
  // round-trip) num arquivo obviamente errado. Não é o portão de segurança
  // real — isso é o /api/midias/confirmar, que roda depois do upload.
  const bytesIniciais = new Uint8Array(
    await arquivo.slice(0, 64).arrayBuffer(),
  );
  const preCheck = validarUploadSeguro({
    bytes: bytesIniciais,
    tamanhoReal: arquivo.size,
    nomeOriginal: nomeArquivo,
    mimeInformado: tipoMime,
  });
  if (!preCheck.valido) {
    throw new Error(preCheck.motivoPublico);
  }

  const arquivoFinal =
    !ehVideo && arquivo instanceof File
      ? await comprimirImagemSeNecessario(arquivo)
      : arquivo;

  // Sem extensão vinda do nome do usuário: o path de armazenamento é gerado
  // só com um UUID. A extensão "de verdade" só é decidida no servidor, com
  // base na assinatura binária real, não no que o cliente chamou o arquivo.
  const path = `${imovelId}/${crypto.randomUUID()}`;

  const { data: signed, error: signedError } = await supabase.storage
    .from("imoveis-midia")
    .createSignedUploadUrl(path);

  if (signedError || !signed) {
    throw new Error(`Falha ao preparar upload de ${nomeArquivo}.`);
  }

  const { error: uploadError } = await supabase.storage
    .from("imoveis-midia")
    .uploadToSignedUrl(path, signed.token, arquivoFinal);

  if (uploadError) {
    throw new Error(`Falha ao enviar ${nomeArquivo}.`);
  }

  const resposta = await fetch("/api/midias/confirmar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path,
      imovelId,
      ordem,
      nomeOriginal: nomeArquivo,
      mimeInformado: tipoMime,
    }),
  });

  const corpo = await resposta.json().catch(() => null);

  if (!resposta.ok || !corpo?.midia) {
    throw new Error(
      typeof corpo?.error === "string" ? corpo.error : MENSAGEM_GENERICA,
    );
  }

  return corpo.midia as Tables<"midias">;
}

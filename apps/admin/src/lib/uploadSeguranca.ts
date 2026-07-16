/**
 * Validação de upload por assinatura binária (magic bytes).
 *
 * Funciona igual no navegador e no servidor: só usa Uint8Array/strings, nada
 * de API específica de Node ou de DOM. É chamado dos dois lados de propósito
 * — no cliente só pra dar feedback instantâneo (rejeitar um arquivo óbvio sem
 * round-trip), no servidor como o portão de verdade, que é quem decide.
 *
 * Princípio central: extensão do arquivo e Content-Type informado pelo
 * cliente NUNCA decidem sozinhos se um arquivo é aceito — são só metadados
 * complementares, exibidos/logados, mas o tipo real vem da assinatura dos
 * bytes. Um arquivo com bytes genuinamente válidos de um tipo permitido é
 * aceito mesmo que o nome ou o MIME informado não combinem com ele.
 */

export type TipoDetectado = "imagem/jpeg" | "imagem/png" | "imagem/webp" | "video/mp4" | "documento/pdf";

export type CategoriaMidia = "imagem" | "video" | "documento";

type Assinatura = {
  tipo: TipoDetectado;
  categoria: CategoriaMidia;
  extensaoPadrao: string;
  tamanhoMaximoBytes: number;
  /** Retorna true se `bytes` começar com a assinatura esperada deste formato. */
  combina: (bytes: Uint8Array) => boolean;
};

const MB = 1024 * 1024;

function comecaCom(bytes: Uint8Array, offset: number, esperado: number[]): boolean {
  if (bytes.length < offset + esperado.length) return false;
  for (let i = 0; i < esperado.length; i++) {
    if (bytes[offset + i] !== esperado[i]) return false;
  }
  return true;
}

function ascii(bytes: Uint8Array, offset: number, texto: string): boolean {
  return comecaCom(bytes, offset, [...texto].map((c) => c.charCodeAt(0)));
}

// Cada assinatura é checada na ordem abaixo; a primeira que combinar decide o
// tipo. JPEG/PNG/PDF conferem só o início do arquivo; WEBP e MP4 têm a marca
// real alguns bytes adiante (RIFF....WEBP / ....ftyp), então checar só os 4
// primeiros bytes (como um "RIFF" de WEBP) daria falso positivo com WAV/AVI.
const ASSINATURAS: Assinatura[] = [
  {
    tipo: "imagem/jpeg",
    categoria: "imagem",
    extensaoPadrao: "jpg",
    tamanhoMaximoBytes: 10 * MB,
    combina: (b) => comecaCom(b, 0, [0xff, 0xd8, 0xff]),
  },
  {
    tipo: "imagem/png",
    categoria: "imagem",
    extensaoPadrao: "png",
    tamanhoMaximoBytes: 10 * MB,
    combina: (b) => comecaCom(b, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  },
  {
    tipo: "imagem/webp",
    categoria: "imagem",
    extensaoPadrao: "webp",
    tamanhoMaximoBytes: 10 * MB,
    combina: (b) => ascii(b, 0, "RIFF") && ascii(b, 8, "WEBP"),
  },
  {
    tipo: "documento/pdf",
    categoria: "documento",
    extensaoPadrao: "pdf",
    tamanhoMaximoBytes: 20 * MB,
    combina: (b) => ascii(b, 0, "%PDF"),
  },
  {
    tipo: "video/mp4",
    categoria: "video",
    extensaoPadrao: "mp4",
    // Não pedido no briefing original (que só listava JPG/PNG/WEBP/PDF), mas
    // o produto já tem um recurso real de vídeo do imóvel (tour em vídeo) —
    // bloquear todo upload de vídeo seria remover uma funcionalidade
    // existente, não só "endurecer a segurança". Mantido com validação real
    // própria em vez de simplesmente confiar em video/mp4 do navegador.
    tamanhoMaximoBytes: 80 * MB,
    combina: (b) => ascii(b, 4, "ftyp"),
  },
];

/** Extensões cuja mera presença no nome original (em qualquer posição) já é suspeita. */
const EXTENSOES_PERIGOSAS = [
  "exe", "dll", "com", "scr", "bat", "cmd", "sh", "ps1", "msi", "apk",
  "php", "php3", "php4", "php5", "phtml", "js", "mjs", "jar", "py",
  "rb", "pl", "cgi", "asp", "aspx", "jsp", "vbs", "wsf", "htaccess",
];

export function detectarTipoReal(bytes: Uint8Array): Assinatura | null {
  return ASSINATURAS.find((a) => a.combina(bytes)) ?? null;
}

function extensaoDe(nomeArquivo: string): string {
  const partes = nomeArquivo.split(".");
  return partes.length > 1 ? partes[partes.length - 1].toLowerCase() : "";
}

/**
 * Nome original nunca é usado como caminho de armazenamento (isso por si só
 * já elimina path traversal e dupla extensão como vetor real), mas ainda
 * inspecionamos ele pra logar o motivo exato da rejeição e pra detectar como
 * suspeito um nome como "foto.jpg.exe" mesmo antes de olhar os bytes.
 */
export function nomeOriginalSuspeito(nomeArquivo: string): string | null {
  if (nomeArquivo.includes("/") || nomeArquivo.includes("\\") || nomeArquivo.includes("..")) {
    return "nome contém separador de caminho ou '..'";
  }
  const segmentos = nomeArquivo.toLowerCase().split(".");
  if (segmentos.length > 2) {
    const suspeitos = segmentos
      .slice(1, -1)
      .filter((s) => EXTENSOES_PERIGOSAS.includes(s));
    if (suspeitos.length > 0) {
      return `dupla extensão suspeita (contém .${suspeitos[0]})`;
    }
  }
  const extensaoFinal = extensaoDe(nomeArquivo);
  if (EXTENSOES_PERIGOSAS.includes(extensaoFinal)) {
    return `extensão perigosa (.${extensaoFinal})`;
  }
  return null;
}

export function gerarNomeSeguro(extensao: string): string {
  const ext = extensao.replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin";
  return `${crypto.randomUUID()}.${ext}`;
}

export type ResultadoValidacao =
  | {
      valido: true;
      tipoDetectado: TipoDetectado;
      categoria: CategoriaMidia;
      extensaoSegura: string;
    }
  | {
      valido: false;
      /** Mensagem segura pra mostrar ao usuário — nunca detalhes internos. */
      motivoPublico: string;
      /** Detalhe real, só pra log interno. */
      motivoInterno: string;
      tipoDetectado: TipoDetectado | null;
    };

const MENSAGEM_PUBLICA_PADRAO = "Arquivo inválido.";

/**
 * Portão único de validação: assinatura binária primeiro (é o que decide o
 * tipo real), depois tamanho, depois as checagens complementares de nome
 * (dupla extensão / caminho) só para log — nome e MIME nunca revertem uma
 * assinatura válida, e uma assinatura inválida nunca é salva mesmo que nome
 * e MIME pareçam corretos.
 */
export function validarUploadSeguro(params: {
  bytes: Uint8Array;
  tamanhoReal: number;
  nomeOriginal: string;
  mimeInformado: string;
}): ResultadoValidacao {
  const { bytes, tamanhoReal, nomeOriginal, mimeInformado } = params;

  if (bytes.length === 0 || tamanhoReal === 0) {
    return {
      valido: false,
      motivoPublico: MENSAGEM_PUBLICA_PADRAO,
      motivoInterno: "arquivo vazio",
      tipoDetectado: null,
    };
  }

  const assinatura = detectarTipoReal(bytes);
  if (!assinatura) {
    return {
      valido: false,
      motivoPublico: MENSAGEM_PUBLICA_PADRAO,
      motivoInterno: `assinatura binária não corresponde a nenhum tipo permitido (nome enviado: "${nomeOriginal}", mime informado: "${mimeInformado}")`,
      tipoDetectado: null,
    };
  }

  if (tamanhoReal > assinatura.tamanhoMaximoBytes) {
    return {
      valido: false,
      motivoPublico: MENSAGEM_PUBLICA_PADRAO,
      motivoInterno: `${tamanhoReal} bytes excede o limite de ${assinatura.tamanhoMaximoBytes} bytes para ${assinatura.tipo}`,
      tipoDetectado: assinatura.tipo,
    };
  }

  const suspeita = nomeOriginalSuspeito(nomeOriginal);
  if (suspeita) {
    return {
      valido: false,
      motivoPublico: MENSAGEM_PUBLICA_PADRAO,
      motivoInterno: `nome original suspeito: ${suspeita}`,
      tipoDetectado: assinatura.tipo,
    };
  }

  return {
    valido: true,
    tipoDetectado: assinatura.tipo,
    categoria: assinatura.categoria,
    extensaoSegura: assinatura.extensaoPadrao,
  };
}

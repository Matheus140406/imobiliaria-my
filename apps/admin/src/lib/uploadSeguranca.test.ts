import { describe, expect, it } from "vitest";
import { validarUploadSeguro, detectarTipoReal, gerarNomeSeguro } from "./uploadSeguranca";

const MB = 1024 * 1024;

function bytes(...valores: number[]): Uint8Array {
  return new Uint8Array(valores);
}

function textoParaBytes(texto: string): Uint8Array {
  return new TextEncoder().encode(texto);
}

// Cabeçalhos mínimos reais de cada formato permitido — só o suficiente pra
// bater a assinatura, o resto do "arquivo" não importa pra este módulo (ele
// só olha os primeiros bytes, como faz qualquer verificação de magic bytes).
const JPEG_REAL = bytes(0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46);
const PNG_REAL = bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00);
const WEBP_REAL = new Uint8Array([
  ...textoParaBytes("RIFF"),
  0x24, 0x00, 0x00, 0x00, // tamanho (irrelevante pra assinatura)
  ...textoParaBytes("WEBP"),
]);
const PDF_REAL = textoParaBytes("%PDF-1.4\n%âãÏÓ\n");
const MP4_REAL = new Uint8Array([
  0x00, 0x00, 0x00, 0x18,
  ...textoParaBytes("ftyp"),
  ...textoParaBytes("isom"),
]);

// Bytes iniciais de arquivos maliciosos disfarçados por extensão/MIME.
const EXE_REAL = bytes(0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00); // "MZ..."
const ZIP_REAL = bytes(0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00); // "PK\x03\x04"
const PHP_SCRIPT = textoParaBytes("<?php system($_GET['c']); ?>");

function validar(overrides: Partial<Parameters<typeof validarUploadSeguro>[0]>) {
  return validarUploadSeguro({
    bytes: JPEG_REAL,
    tamanhoReal: JPEG_REAL.length,
    nomeOriginal: "foto.jpg",
    mimeInformado: "image/jpeg",
    ...overrides,
  });
}

describe("arquivos reais permitidos", () => {
  it("aceita um JPG verdadeiro", () => {
    const r = validar({ bytes: JPEG_REAL, tamanhoReal: JPEG_REAL.length, nomeOriginal: "foto.jpg", mimeInformado: "image/jpeg" });
    expect(r.valido).toBe(true);
    expect(r.valido && r.tipoDetectado).toBe("imagem/jpeg");
  });

  it("aceita um PNG verdadeiro", () => {
    const r = validar({ bytes: PNG_REAL, tamanhoReal: PNG_REAL.length, nomeOriginal: "foto.png", mimeInformado: "image/png" });
    expect(r.valido).toBe(true);
    expect(r.valido && r.tipoDetectado).toBe("imagem/png");
  });

  it("aceita um WEBP verdadeiro", () => {
    const r = validar({ bytes: WEBP_REAL, tamanhoReal: WEBP_REAL.length, nomeOriginal: "foto.webp", mimeInformado: "image/webp" });
    expect(r.valido).toBe(true);
    expect(r.valido && r.tipoDetectado).toBe("imagem/webp");
  });

  it("aceita um PDF verdadeiro", () => {
    const r = validar({ bytes: PDF_REAL, tamanhoReal: PDF_REAL.length, nomeOriginal: "contrato.pdf", mimeInformado: "application/pdf" });
    expect(r.valido).toBe(true);
    expect(r.valido && r.tipoDetectado).toBe("documento/pdf");
  });

  it("aceita um MP4 verdadeiro (tour em vídeo do imóvel)", () => {
    const r = validar({ bytes: MP4_REAL, tamanhoReal: MP4_REAL.length, nomeOriginal: "tour.mp4", mimeInformado: "video/mp4" });
    expect(r.valido).toBe(true);
    expect(r.valido && r.tipoDetectado).toBe("video/mp4");
  });
});

describe("arquivos maliciosos disfarçados — todos devem ser rejeitados", () => {
  it("rejeita um EXE renomeado para .jpg", () => {
    const r = validar({ bytes: EXE_REAL, tamanhoReal: EXE_REAL.length, nomeOriginal: "foto.jpg", mimeInformado: "image/jpeg" });
    expect(r.valido).toBe(false);
    expect(r.valido || r.motivoPublico).toBe("Arquivo inválido.");
  });

  it("rejeita um ZIP renomeado para .png", () => {
    const r = validar({ bytes: ZIP_REAL, tamanhoReal: ZIP_REAL.length, nomeOriginal: "imagem.png", mimeInformado: "image/png" });
    expect(r.valido).toBe(false);
  });

  it("rejeita um script PHP renomeado para .pdf", () => {
    const r = validar({ bytes: PHP_SCRIPT, tamanhoReal: PHP_SCRIPT.length, nomeOriginal: "arquivo.pdf", mimeInformado: "application/pdf" });
    expect(r.valido).toBe(false);
  });

  it("rejeita arquivo vazio", () => {
    const vazio = new Uint8Array(0);
    const r = validar({ bytes: vazio, tamanhoReal: 0, nomeOriginal: "vazio.jpg", mimeInformado: "image/jpeg" });
    expect(r.valido).toBe(false);
  });

  it("rejeita arquivo corrompido (bytes sem assinatura reconhecível)", () => {
    const corrompido = bytes(0x00, 0x01, 0x02);
    const r = validar({ bytes: corrompido, tamanhoReal: 3, nomeOriginal: "foto.jpg", mimeInformado: "image/jpeg" });
    expect(r.valido).toBe(false);
  });

  it("rejeita arquivo acima do limite de tamanho mesmo com assinatura válida", () => {
    const r = validar({ bytes: JPEG_REAL, tamanhoReal: 11 * MB, nomeOriginal: "foto.jpg", mimeInformado: "image/jpeg" });
    expect(r.valido).toBe(false);
  });

  it("rejeita arquivo com dupla extensão (foto.jpg.exe), mesmo com bytes de imagem válidos", () => {
    const r = validar({ bytes: JPEG_REAL, tamanhoReal: JPEG_REAL.length, nomeOriginal: "foto.jpg.exe", mimeInformado: "image/jpeg" });
    expect(r.valido).toBe(false);
  });

  it("rejeita nome com path traversal", () => {
    const r = validar({ bytes: JPEG_REAL, tamanhoReal: JPEG_REAL.length, nomeOriginal: "../../etc/passwd.jpg", mimeInformado: "image/jpeg" });
    expect(r.valido).toBe(false);
  });
});

describe("MIME e extensão são só metadado complementar, não decidem sozinhos", () => {
  it("aceita um arquivo com bytes reais válidos mesmo com MIME informado falso", () => {
    // PNG de verdade, mas o navegador (ou um atacante) informou um MIME
    // completamente diferente — a assinatura real é quem manda.
    const r = validar({
      bytes: PNG_REAL,
      tamanhoReal: PNG_REAL.length,
      nomeOriginal: "foto.png",
      mimeInformado: "application/x-msdownload",
    });
    expect(r.valido).toBe(true);
  });

  it("aceita um arquivo com bytes reais válidos mesmo com extensão informada falsa", () => {
    // WEBP de verdade, nomeado como .txt — a extensão sozinha não decide.
    const r = validar({
      bytes: WEBP_REAL,
      tamanhoReal: WEBP_REAL.length,
      nomeOriginal: "documento.txt",
      mimeInformado: "text/plain",
    });
    expect(r.valido).toBe(true);
    expect(r.valido && r.tipoDetectado).toBe("imagem/webp");
  });
});

describe("detectarTipoReal", () => {
  it("retorna null para bytes sem assinatura conhecida", () => {
    expect(detectarTipoReal(bytes(0x01, 0x02, 0x03))).toBeNull();
  });

  it("não confunde WEBP com outros formatos baseados em RIFF (ex: WAV)", () => {
    const wav = new Uint8Array([...textoParaBytes("RIFF"), 0, 0, 0, 0, ...textoParaBytes("WAVE")]);
    expect(detectarTipoReal(wav)).toBeNull();
  });
});

describe("gerarNomeSeguro", () => {
  it("nunca usa o nome original, gera um novo com a extensão informada", () => {
    const nome = gerarNomeSeguro("jpg");
    expect(nome).toMatch(/^[0-9a-f-]{36}\.jpg$/);
  });

  it("sanitiza uma extensão com caracteres inesperados", () => {
    const nome = gerarNomeSeguro("jpg/../../etc");
    expect(nome).toMatch(/^[0-9a-f-]{36}\.jpgetc$/);
  });
});

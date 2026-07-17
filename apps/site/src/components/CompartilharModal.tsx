"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";

const BG_FUNDO = "#0B2545";
const DOURADO_CLARO = "#E0B23A";
const DOURADO_SUAVE = "#C7B27C";
const BORDA_DOURADA = "rgba(201,151,0,0.35)";
const GRADIENTE_CTA = "linear-gradient(135deg, #E0B23A, #B8860B)";

/**
 * QR code gerado localmente (lib qrcode) em vez de uma API pública tipo
 * api.qrserver.com — não depende de rede externa em produção e não manda o
 * link do imóvel pra um serviço de terceiro só pra desenhar um QR code.
 */
export function CompartilharModal({
  url,
  titulo,
  onClose,
}: {
  url: string;
  titulo: string;
  onClose: () => void;
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [erroCopia, setErroCopia] = useState(false);
  const [montado, setMontado] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMontado(true);
    QRCode.toDataURL(url, {
      width: 220,
      margin: 1,
      color: { dark: "#0B2545", light: "#F8F9FA" },
    })
      .then((dataUrl) => setQrDataUrl(dataUrl))
      .catch(() => setQrDataUrl(null));
  }, [url]);

  async function copiarLink() {
    setErroCopia(false);
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
      return;
    } catch {
      // Clipboard API bloqueada (permissão negada, contexto sem foco, etc.)
      // — cai pro fallback abaixo em vez de desistir em silêncio.
    }

    // execCommand é deprecated mas funciona em muito mais navegadores/
    // contextos restritos do que a Clipboard API moderna — só cai aqui
    // quando a Clipboard API já falhou.
    try {
      inputRef.current?.select();
      const copiou = document.execCommand("copy");
      if (copiou) {
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
        return;
      }
    } catch {
      // segue pro estado de erro abaixo
    }

    // Nenhum dos dois caminhos funcionou: em vez de o botão não fazer nada
    // visível (o que parecia "não dá pra compartilhar"), seleciona o texto
    // e avisa que a cópia precisa ser manual.
    inputRef.current?.select();
    setErroCopia(true);
    setTimeout(() => setErroCopia(false), 4000);
  }

  if (!montado) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4"
      style={{ backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 text-center sm:p-8"
        style={{ background: BG_FUNDO, border: `1px solid ${BORDA_DOURADA}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2
            className="text-base font-semibold"
            style={{ fontFamily: "var(--font-serif)", color: DOURADO_CLARO }}
          >
            Compartilhar imóvel
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-lg leading-none transition hover:brightness-125"
            style={{ color: DOURADO_SUAVE }}
          >
            ✕
          </button>
        </div>

        <p className="mb-4 truncate text-sm" style={{ color: DOURADO_SUAVE }}>
          {titulo}
        </p>

        <div
          className="mx-auto mb-5 flex h-[236px] w-[236px] items-center justify-center rounded-xl p-2"
          style={{ background: "#F8F9FA" }}
        >
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URL gerada em tempo real, não é um asset otimizável pelo next/image
            <img src={qrDataUrl} alt="QR code para abrir este imóvel no celular" width={220} height={220} />
          ) : (
            <span className="text-xs" style={{ color: "#5B6B82" }}>Gerando QR code...</span>
          )}
        </div>

        <p className="mb-4 text-xs" style={{ color: DOURADO_SUAVE }}>
          Aponte a câmera do celular para o QR code ou copie o link abaixo.
        </p>

        <div
          className="mb-4 flex items-center gap-2 rounded-lg px-3 py-2.5"
          style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDA_DOURADA}` }}
        >
          <input
            ref={inputRef}
            type="text"
            readOnly
            value={url}
            onFocus={(e) => e.target.select()}
            className="w-full truncate bg-transparent text-xs outline-none"
            style={{ color: DOURADO_CLARO }}
          />
        </div>

        <button
          type="button"
          onClick={copiarLink}
          className="w-full rounded-lg py-3 text-sm font-bold uppercase tracking-wider text-black transition hover:brightness-110"
          style={{ background: GRADIENTE_CTA }}
        >
          {copiado ? "Link copiado!" : erroCopia ? "Selecionado — use Ctrl+C" : "Copiar link"}
        </button>
        {erroCopia && (
          <p className="mt-2 text-xs" style={{ color: DOURADO_SUAVE }}>
            Não conseguimos copiar automaticamente. O link já está selecionado no campo acima — use Ctrl+C (ou Cmd+C no Mac).
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
}

"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { createClient } from "@imobiliaria/db/client";
import { whatsappLink, formatPreco } from "@/lib/format";
import type { ImovelComMidias } from "@/lib/types";

const DURACAO_TRANSICAO_MS = 200;

// Paleta "luxo escuro" — deliberadamente diferente do verde/dourado do
// resto do site: essa superfície existe só pra maximizar conversão de
// lead, então usa um tratamento visual mais forte/exclusivo.
const BG_FUNDO = "#080808";
const DOURADO_CLARO = "#C9A063";
const DOURADO_SUAVE = "#AA8C56";
const BORDA_DOURADA = "rgba(201,160,99,0.3)";
const GRADIENTE_CTA = "linear-gradient(135deg, #B28F47, #6A532B)";

function IconeEdificio() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M6 24V6l8-3.5L22 6v18" stroke={DOURADO_CLARO} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6 24h16" stroke={DOURADO_CLARO} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10 10h2M16 10h2M10 14h2M16 14h2M10 18h2M16 18h2" stroke={DOURADO_CLARO} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function ContactModal({
  imovel,
  onClose,
}: {
  imovel: ImovelComMidias;
  onClose: () => void;
}) {
  const [galeriaIndex, setGaleriaIndex] = useState(0);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [consentiu, setConsentiu] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [visivel, setVisivel] = useState(false);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    // Precisa distinguir "primeiro render no cliente" de "já montado":
    // createPortal falha se chamado antes do efeito rodar, então não dá
    // pra resolver isso com um lazy initializer no useState.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMontado(true);
    const frame = requestAnimationFrame(() => setVisivel(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  function handleClose() {
    setVisivel(false);
    setTimeout(onClose, DURACAO_TRANSICAO_MS);
  }

  function formatarTelefone(valor: string) {
    const digits = valor.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  const midias = imovel.midias;
  const midiaAtual = midias[galeriaIndex];
  const whatsapp = imovel.corretor?.whatsapp;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !telefone.trim() || !consentiu || !whatsapp) return;

    setEnviando(true);
    setErro(null);

    const supabase = createClient();
    const { error } = await supabase.from("leads").insert({
      imovel_id: imovel.id,
      nome: nome.trim(),
      telefone: telefone.trim(),
      origem: "modal-whatsapp",
    });

    setEnviando(false);

    if (error) {
      setErro("Não foi possível enviar seu contato. Tente novamente.");
      return;
    }

    const local = imovel.localizacao ? ` (${imovel.localizacao})` : "";
    const mensagem = `Olá! Tudo bem? 😊\n\nTenho interesse no imóvel "${imovel.titulo}"${local} da Imobiliária M&Y.\n\nPoderia me dar mais informações sobre valores e condições?`;
    window.open(whatsappLink(whatsapp, mensagem), "_blank", "noopener,noreferrer");
    handleClose();
  }

  if (!montado) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/80 transition-opacity sm:items-center sm:p-4"
      style={{
        opacity: visivel ? 1 : 0,
        transitionDuration: `${DURACAO_TRANSICAO_MS}ms`,
        backdropFilter: "blur(4px)",
      }}
      onClick={handleClose}
    >
      <div
        className="flex h-full w-full flex-col overflow-hidden shadow-2xl transition-all sm:h-auto sm:max-h-[92vh] sm:max-w-xl sm:rounded-2xl"
        style={{
          background: BG_FUNDO,
          border: `1px solid ${BORDA_DOURADA}`,
          opacity: visivel ? 1 : 0,
          transform: visivel ? "scale(1) translateY(0)" : "scale(0.97) translateY(10px)",
          transitionDuration: `${DURACAO_TRANSICAO_MS}ms`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho: logo M&Y à esquerda, Fechar à direita */}
        <div
          className="flex shrink-0 items-center justify-between px-5 py-4"
          style={{ borderBottom: `1px solid ${BORDA_DOURADA}` }}
        >
          <div className="flex items-center gap-2">
            <IconeEdificio />
            <span
              className="text-base tracking-wide"
              style={{ fontFamily: "var(--font-sans)", color: DOURADO_CLARO }}
            >
              <strong className="font-semibold">M&amp;Y</strong>{" "}
              <span style={{ color: DOURADO_SUAVE }}>Imobiliária</span>
            </span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar"
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-black transition hover:brightness-110"
            style={{ background: GRADIENTE_CTA }}
          >
            <span aria-hidden="true">✕</span> Fechar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {midias.length > 0 && midiaAtual ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-950 sm:aspect-video">
              {midiaAtual.tipo === "video" ? (
                <video
                  src={midiaAtual.url}
                  controls
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={midiaAtual.url}
                  alt={imovel.titulo}
                  fill
                  className="object-cover"
                />
              )}

              {midias.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setGaleriaIndex((i) => (i === 0 ? midias.length - 1 : i - 1))
                    }
                    className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80"
                    aria-label="Foto anterior"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setGaleriaIndex((i) => (i === midias.length - 1 ? 0 : i + 1))
                    }
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80"
                    aria-label="Próxima foto"
                  >
                    ›
                  </button>
                  <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                    {midias.map((m, i) => (
                      <span
                        key={m.id}
                        className="h-1 rounded-full transition-all"
                        style={{
                          width: i === galeriaIndex ? "16px" : "6px",
                          background: i === galeriaIndex ? DOURADO_CLARO : "rgba(255,255,255,0.3)",
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex aspect-[4/3] w-full items-center justify-center bg-neutral-950 text-4xl text-white/10 sm:aspect-video">
              🏠
            </div>
          )}

          <div className="px-5 py-6 sm:px-7">
            <h2
              className="text-left text-2xl leading-snug sm:text-3xl"
              style={{ fontFamily: "var(--font-serif)", color: DOURADO_CLARO }}
            >
              {imovel.titulo}
            </h2>
            {imovel.localizacao && (
              <p className="mt-1 text-sm" style={{ color: DOURADO_SUAVE }}>
                📍 {imovel.localizacao}
              </p>
            )}
            <p
              className="mt-3 text-2xl font-bold sm:text-3xl"
              style={{ fontFamily: "var(--font-sans)", color: DOURADO_CLARO }}
            >
              {formatPreco(imovel.preco)}
            </p>

            <div className="my-6 h-px w-full" style={{ background: BORDA_DOURADA }} />

            {imovel.descricao && (
              <p
                className="mb-6 text-sm leading-relaxed"
                style={{ color: DOURADO_SUAVE, fontFamily: "var(--font-sans)" }}
              >
                {imovel.descricao}
              </p>
            )}

            {!whatsapp ? (
              <p className="text-sm text-red-400">
                Este imóvel não tem um corretor responsável configurado.
              </p>
            ) : (
              <form id="form-contato-imovel" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      className="mb-1.5 block text-xs font-medium uppercase tracking-wider"
                      style={{ color: DOURADO_SUAVE }}
                    >
                      Nome
                    </label>
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full rounded-md bg-white/[0.03] px-3 py-2.5 text-base outline-none transition focus:bg-white/[0.06]"
                      style={{ border: `1px solid ${BORDA_DOURADA}`, color: DOURADO_CLARO }}
                    />
                  </div>
                  <div>
                    <label
                      className="mb-1.5 block text-xs font-medium uppercase tracking-wider"
                      style={{ color: DOURADO_SUAVE }}
                    >
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      required
                      value={telefone}
                      onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                      placeholder="(61) 99999-9999"
                      className="w-full rounded-md bg-white/[0.03] px-3 py-2.5 text-base outline-none transition focus:bg-white/[0.06]"
                      style={{ border: `1px solid ${BORDA_DOURADA}`, color: DOURADO_CLARO }}
                    />
                  </div>
                </div>
                <label
                  className="flex items-start gap-2 text-xs leading-relaxed"
                  style={{ color: DOURADO_SUAVE }}
                >
                  <input
                    type="checkbox"
                    required
                    checked={consentiu}
                    onChange={(e) => setConsentiu(e.target.checked)}
                    className="mt-0.5"
                  />
                  Ao enviar, você concorda em ser contatado via WhatsApp pela Imobiliária
                  M&amp;Y sobre este imóvel.
                </label>

                {erro && <p className="text-sm text-red-400">{erro}</p>}
              </form>
            )}
          </div>
        </div>

        {whatsapp && (
          <div
            className="shrink-0 px-5 py-4 sm:static sm:px-7 sm:pb-7 sm:pt-0"
            style={{ borderTop: "1px solid rgba(201,160,99,0.15)" }}
          >
            <button
              type="submit"
              form="form-contato-imovel"
              disabled={enviando}
              className="w-full rounded-lg py-4 text-base font-bold uppercase tracking-wider text-black transition hover:brightness-110 disabled:opacity-50"
              style={{ background: GRADIENTE_CTA }}
            >
              {enviando ? "Enviando..." : "Falar no WhatsApp"}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

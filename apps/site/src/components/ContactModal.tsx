"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { createClient } from "@imobiliaria/db/client";
import { whatsappLink, formatPreco } from "@/lib/format";
import type { ImovelComMidias } from "@/lib/types";

const DURACAO_TRANSICAO_MS = 200;

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 transition-opacity"
      style={{
        opacity: visivel ? 1 : 0,
        transitionDuration: `${DURACAO_TRANSICAO_MS}ms`,
        backdropFilter: "blur(4px)",
      }}
      onClick={handleClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl shadow-2xl transition-all"
        style={{
          background: "var(--dark3)",
          border: "1px solid rgba(200,164,74,0.25)",
          opacity: visivel ? 1 : 0,
          transform: visivel ? "scale(1) translateY(0)" : "scale(0.96) translateY(8px)",
          transitionDuration: `${DURACAO_TRANSICAO_MS}ms`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative shrink-0">
          {midias.length > 0 && midiaAtual ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-900 sm:aspect-video">
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
                    className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
                    aria-label="Foto anterior"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setGaleriaIndex((i) => (i === midias.length - 1 ? 0 : i + 1))
                    }
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
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
                          background:
                            i === galeriaIndex ? "var(--gold)" : "rgba(255,255,255,0.4)",
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex aspect-[4/3] w-full items-center justify-center bg-neutral-900 text-4xl text-white/20 sm:aspect-video">
              🏠
            </div>
          )}

          <button
            onClick={handleClose}
            aria-label="Fechar"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-xl leading-none text-white backdrop-blur-sm transition hover:bg-black/70"
          >
            &times;
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <h2
            className="text-xl font-semibold leading-snug text-white"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {imovel.titulo}
          </h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            {imovel.localizacao && (
              <span className="text-sm text-white/50">📍 {imovel.localizacao}</span>
            )}
            <span className="text-base font-medium" style={{ color: "var(--gold-light)" }}>
              {formatPreco(imovel.preco)}
            </span>
          </div>

          <div className="my-4 h-px w-full bg-white/10" />

          {!whatsapp ? (
            <p className="text-sm text-red-400">
              Este imóvel não tem um corretor responsável configurado.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-white/80">
                    Nome
                  </label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full rounded border border-white/15 bg-white/5 px-3 py-2 text-base text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-white/80">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(61) 99999-9999"
                    className="w-full rounded border border-white/15 bg-white/5 px-3 py-2 text-base text-white"
                  />
                </div>
              </div>
              <label className="flex items-start gap-2 text-xs text-white/50">
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

              <button type="submit" disabled={enviando} className="imovel-contact-btn">
                {enviando ? "Enviando..." : "Falar no WhatsApp"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@imobiliaria/db/client";
import { whatsappLink } from "@/lib/format";
import type { ImovelComMidias } from "@/lib/types";

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
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg p-6 shadow-xl"
        style={{ background: "var(--dark3)", border: "1px solid rgba(200,164,74,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-white" style={{ fontFamily: "var(--font-serif)" }}>
            {imovel.titulo}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 text-2xl leading-none text-white/60 hover:text-white"
          >
            &times;
          </button>
        </div>

        {midias.length > 0 && midiaAtual && (
          <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-800">
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
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-1 text-white"
                  aria-label="Anterior"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setGaleriaIndex((i) => (i === midias.length - 1 ? 0 : i + 1))
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-1 text-white"
                  aria-label="Próxima"
                >
                  ›
                </button>
              </>
            )}
          </div>
        )}

        {!whatsapp ? (
          <p className="text-sm text-red-400">
            Este imóvel não tem um corretor responsável configurado.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-white/80">
                Nome
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
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
                className="w-full rounded border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
              />
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
  );
}

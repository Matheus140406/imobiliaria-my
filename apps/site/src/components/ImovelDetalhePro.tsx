"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@imobiliaria/db/client";
import { whatsappLink, formatPreco } from "@/lib/format";
import type { ImovelComMidias } from "@/lib/types";
import { WhatsappIcon } from "./WhatsappIcon";
import { CompartilharModal } from "./CompartilharModal";

// Mensagem exata levantada pelo trigger trg_rate_limit_leads no banco
// (private.checar_rate_limit_leads) quando o mesmo IP excede 5 envios em
// 10 minutos — comparação exata, pra nunca repassar ao usuário um erro
// interno diferente disfarçado de "aguarde".
const MENSAGEM_RATE_LIMIT_BANCO = "Muitas solicitações. Tente novamente em alguns minutos.";

// Mesma identidade "banco premium europeu" do ContactModal e do resto do
// site. Centralizada aqui em vez de duplicada porque esta página e o modal
// compartilham a mesma linguagem visual.
const BG_FUNDO = "#0B2545";
const BG_FUNDO_2 = "#0F3460";
const DOURADO_CLARO = "#E0B23A";
const DOURADO_SUAVE = "#C7B27C";
const BORDA_DOURADA = "rgba(201,151,0,0.35)";
const BORDA_DOURADA_SUTIL = "rgba(201,151,0,0.18)";
const GRADIENTE_CTA = "linear-gradient(135deg, #E0B23A, #B8860B)";

function IconeEdificio() {
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M6 24V6l8-3.5L22 6v18" stroke={DOURADO_CLARO} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6 24h16" stroke={DOURADO_CLARO} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10 10h2M16 10h2M10 14h2M16 14h2M10 18h2M16 18h2" stroke={DOURADO_CLARO} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconePlay() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 5.5v13l11-6.5-11-6.5z" fill={DOURADO_CLARO} />
    </svg>
  );
}

function IconeCadeado() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke={DOURADO_CLARO} strokeWidth="1.8" />
      <path d="M8 11V7a4 4 0 018 0v4" stroke={DOURADO_CLARO} strokeWidth="1.8" />
    </svg>
  );
}

function IconeCompartilhar() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="18" cy="5" r="3" stroke={DOURADO_SUAVE} strokeWidth="1.8" />
      <circle cx="6" cy="12" r="3" stroke={DOURADO_SUAVE} strokeWidth="1.8" />
      <circle cx="18" cy="19" r="3" stroke={DOURADO_SUAVE} strokeWidth="1.8" />
      <path d="M8.6 10.5l6.8-3.9M8.6 13.5l6.8 3.9" stroke={DOURADO_SUAVE} strokeWidth="1.8" />
    </svg>
  );
}

function IconeSelo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l2.4 2.1 3.1-.5.9 3 2.7 1.6-1 3 1 3-2.7 1.6-.9 3-3.1-.5L12 22l-2.4-2.1-3.1.5-.9-3-2.7-1.6 1-3-1-3 2.7-1.6.9-3 3.1.5L12 2z" stroke={DOURADO_SUAVE} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke={DOURADO_SUAVE} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ImovelDetalhePro({
  imovel,
  similares = [],
}: {
  imovel: ImovelComMidias;
  similares?: ImovelComMidias[];
}) {
  const midiasOrdenadas = useMemo(
    () => [...imovel.midias].sort((a, b) => a.ordem - b.ordem),
    [imovel.midias],
  );
  const capa = midiasOrdenadas.find((m) => m.tipo === "imagem") ?? midiasOrdenadas[0] ?? null;
  const temMidiaExtra = midiasOrdenadas.length > 1;

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [tourAvisado, setTourAvisado] = useState(false);
  const [compartilharAberto, setCompartilharAberto] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const whatsapp = imovel.corretor?.whatsapp;
  const vendida = imovel.status !== "disponivel";

  function formatarTelefone(valor: string) {
    const digits = valor.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  function handleTourClick() {
    // Gatilho de curiosidade: o tour/vídeo completo não abre direto — o
    // clique leva até o formulário, que é o que de fato gera o lead.
    setTourAvisado(true);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function handleCompartilhar() {
    const url = window.location.href;
    const dados = {
      title: imovel.titulo,
      text: `Confira este imóvel: ${imovel.titulo}`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(dados);
      } catch {
        // Usuário cancelou o compartilhamento nativo — não é um erro.
      }
      return;
    }

    // Sem Web Share API (a maioria dos navegadores de desktop): em vez de só
    // copiar o link silenciosamente, mostra um link copiável + QR code — útil
    // pro corretor mostrar o imóvel num computador e o cliente escanear com
    // o próprio celular na hora.
    setCompartilharAberto(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !telefone.trim() || !whatsapp) return;

    setEnviando(true);
    setErro(null);

    // Insert direto do navegador: o rate limit por IP já existe como
    // trigger no banco (trg_rate_limit_leads) e só enxerga o IP real do
    // visitante quando a chamada chega direto do navegador.
    const supabase = createClient();
    const { error } = await supabase.from("leads").insert({
      imovel_id: imovel.id,
      nome: nome.trim(),
      telefone: telefone.trim(),
      origem: "pagina-imovel-pro",
    });

    setEnviando(false);

    if (error) {
      setErro(
        error.message === MENSAGEM_RATE_LIMIT_BANCO
          ? "Muitas tentativas. Aguarde alguns minutos e tente novamente."
          : "Não foi possível enviar seu contato. Tente novamente.",
      );
      return;
    }

    const local = imovel.localizacao ? ` (${imovel.localizacao})` : "";
    const mensagem = `Olá! Tudo bem? 😊\n\nTenho interesse no imóvel "${imovel.titulo}"${local} da Imobiliária M&Y.\n\nPoderia me dar mais informações, incluindo o tour completo?`;
    window.open(whatsappLink(whatsapp, mensagem), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="min-h-screen" id="conteudo-principal" tabIndex={-1} style={{ background: BG_FUNDO, fontFamily: "var(--font-sans)", outline: "none" }}>
      {/* Topo minimalista */}
      <header
        className="flex items-center justify-between px-5 py-5 sm:px-10"
        style={{ borderBottom: `1px solid ${BORDA_DOURADA_SUTIL}` }}
      >
        <Link href="/" className="flex items-center gap-2">
          <IconeEdificio />
          <span className="text-base tracking-wide" style={{ color: DOURADO_CLARO }}>
            <strong className="font-semibold">M&amp;Y</strong>{" "}
            <span style={{ color: DOURADO_SUAVE }}>Imobiliária</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCompartilhar}
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider transition hover:brightness-125"
            style={{ border: `1px solid ${BORDA_DOURADA}`, color: DOURADO_SUAVE }}
          >
            <IconeCompartilhar />
            Compartilhar
          </button>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wider transition hover:brightness-125"
            style={{ border: `1px solid ${BORDA_DOURADA}`, color: DOURADO_SUAVE }}
          >
            ← Voltar ao Catálogo
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20 pt-8 sm:px-10 sm:pt-14">
       <div className="lg:grid lg:grid-cols-[1.15fr_1fr] lg:items-start lg:gap-12">
        {/* Bloco de mídia instigante — no desktop fica "grudado" (sticky) na
            coluna esquerda enquanto a coluna de informações rola ao lado,
            em vez de uma coluna única estreita flutuando isolada na tela. */}
        <div
          className="group relative aspect-[4/3] w-full overflow-hidden sm:aspect-video lg:sticky lg:top-8"
          style={{
            borderRadius: 12,
            border: `1px solid ${BORDA_DOURADA}`,
            background: `radial-gradient(circle at 50% 40%, ${BG_FUNDO_2}, ${BG_FUNDO} 75%)`,
          }}
        >
          {capa && capa.tipo === "imagem" ? (
            <Image
              src={capa.url}
              alt={imovel.titulo}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover transition duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl text-white/10">🏠</div>
          )}

          {/* Vinheta pra dar profundidade e destacar o botão de play */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.45) 100%)" }}
          />

          {!vendida && temMidiaExtra && (
            <button
              type="button"
              onClick={handleTourClick}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 transition"
              aria-label="Ver tour exclusivo"
            >
              <span
                className="flex h-16 w-16 items-center justify-center rounded-full backdrop-blur-sm transition group-hover:scale-110"
                style={{
                  background: "rgba(8,8,8,0.55)",
                  border: `1.5px solid ${BORDA_DOURADA}`,
                  boxShadow: "0 4px 25px rgba(178,143,71,0.35)",
                }}
              >
                <IconePlay />
              </span>
              <span
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[2px]"
                style={{ background: "rgba(8,8,8,0.6)", color: DOURADO_CLARO, border: `1px solid ${BORDA_DOURADA_SUTIL}` }}
              >
                <IconeCadeado /> Tour Exclusivo 3D
              </span>
            </button>
          )}

          <span
            className="absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[2px]"
            style={{
              background: vendida ? "rgba(120,120,120,0.6)" : "rgba(8,8,8,0.6)",
              color: vendida ? "#ddd" : DOURADO_CLARO,
              border: `1px solid ${BORDA_DOURADA_SUTIL}`,
            }}
          >
            {vendida ? "Indisponível" : "Oportunidade Exclusiva"}
          </span>
        </div>

        <div>
        {tourAvisado && !vendida && (
          <p className="mt-3 text-center text-xs" style={{ color: DOURADO_SUAVE }}>
            O tour completo é liberado pelo corretor no WhatsApp — deixe seu contato abaixo.
          </p>
        )}

        {/* Informações e escassez */}
        <div className="mt-10 sm:mt-14">
          <span
            className="text-[11px] font-semibold uppercase tracking-[3px]"
            style={{ color: DOURADO_SUAVE }}
          >
            {vendida ? "[ Imóvel Indisponível ]" : "[ Oportunidade Exclusiva ]"}
          </span>

          <h1
            className="mt-3 text-3xl leading-snug sm:text-5xl"
            style={{ fontFamily: "var(--font-serif)", color: DOURADO_CLARO }}
          >
            {imovel.titulo}
          </h1>

          {imovel.localizacao && (
            <p className="mt-2 text-sm sm:text-base" style={{ color: DOURADO_SUAVE }}>
              📍 {imovel.localizacao}
            </p>
          )}

          <p
            className="mt-5 text-3xl font-extrabold sm:text-4xl"
            style={{ color: DOURADO_CLARO }}
          >
            {formatPreco(imovel.preco)}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="flex items-center gap-1.5 text-xs" style={{ color: DOURADO_SUAVE }}>
              <IconeSelo /> Corretor CRECI verificado
            </span>
            <span className="flex items-center gap-1.5 text-xs" style={{ color: DOURADO_SUAVE }}>
              <IconeCadeado /> Dados protegidos (LGPD)
            </span>
          </div>

          <div className="my-8 h-px w-full" style={{ background: BORDA_DOURADA }} />

          {imovel.descricao && (
            <p className="text-sm leading-relaxed sm:text-base" style={{ color: "rgba(230,220,200,0.85)" }}>
              {imovel.descricao}
            </p>
          )}
        </div>

        {/* Formulário de captação rápida */}
        <div
          ref={formRef}
          className="mt-12 rounded-2xl p-6 sm:p-8"
          style={{ background: BG_FUNDO_2, border: `1px solid ${BORDA_DOURADA_SUTIL}` }}
        >
          {vendida ? (
            <p className="text-sm" style={{ color: DOURADO_SUAVE }}>
              Este imóvel já não está mais disponível. Explore outras oportunidades no nosso catálogo.
            </p>
          ) : !whatsapp ? (
            <p className="text-sm text-red-400">
              Este imóvel não tem um corretor responsável configurado.
            </p>
          ) : (
            <>
              <h2 className="mb-5 text-lg font-semibold sm:text-xl" style={{ color: DOURADO_CLARO }}>
                Fale agora com um corretor
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="imovel-nome"
                      className="mb-1.5 block text-xs font-medium uppercase tracking-wider"
                      style={{ color: DOURADO_SUAVE }}
                    >
                      Nome
                    </label>
                    <input
                      id="imovel-nome"
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full rounded-md px-3.5 py-3 text-base outline-none transition focus:bg-white/[0.06]"
                      style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDA_DOURADA}`, color: DOURADO_CLARO }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="imovel-whatsapp"
                      className="mb-1.5 block text-xs font-medium uppercase tracking-wider"
                      style={{ color: DOURADO_SUAVE }}
                    >
                      WhatsApp
                    </label>
                    <input
                      id="imovel-whatsapp"
                      type="tel"
                      required
                      value={telefone}
                      onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                      placeholder="(61) 99999-9999"
                      className="w-full rounded-md px-3.5 py-3 text-base outline-none transition focus:bg-white/[0.06]"
                      style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDA_DOURADA}`, color: DOURADO_CLARO }}
                    />
                  </div>
                </div>

                {erro && <p className="text-sm text-red-400">{erro}</p>}

                <button
                  type="submit"
                  disabled={enviando}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-4 text-base font-bold uppercase tracking-wider text-black transition hover:brightness-110 disabled:opacity-50"
                  style={{ background: GRADIENTE_CTA, boxShadow: "0 4px 15px rgba(178,143,71,0.4)" }}
                >
                  <WhatsappIcon />
                  {enviando ? "Enviando..." : "Falar no WhatsApp"}
                </button>
                <p className="text-center text-[11px]" style={{ color: "rgba(170,140,86,0.7)" }}>
                  Ao enviar, você concorda em ser contatado via WhatsApp pela Imobiliária M&amp;Y.
                </p>
              </form>
            </>
          )}
        </div>
        </div>
       </div>

        {similares.length > 0 && (
          <div className="mt-16">
            <h2
              className="mb-5 text-xl sm:text-2xl"
              style={{ fontFamily: "var(--font-serif)", color: DOURADO_CLARO }}
            >
              Imóveis semelhantes
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {similares.map((s) => {
                const capaSimilar = [...s.midias]
                  .filter((m) => m.tipo === "imagem")
                  .sort((a, b) => a.ordem - b.ordem)[0];
                return (
                  <Link
                    key={s.id}
                    href={`/imoveis/${s.slug}`}
                    className="group block overflow-hidden rounded-lg transition hover:brightness-110"
                    style={{ border: `1px solid ${BORDA_DOURADA_SUTIL}`, background: BG_FUNDO_2 }}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {capaSimilar ? (
                        <Image
                          src={capaSimilar.url}
                          alt={s.titulo}
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl text-white/10">🏠</div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="truncate text-sm" style={{ color: DOURADO_CLARO }}>{s.titulo}</p>
                      <p className="mt-1 text-xs" style={{ color: DOURADO_SUAVE }}>{formatPreco(s.preco)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {compartilharAberto && (
        <CompartilharModal
          url={typeof window !== "undefined" ? window.location.href : ""}
          titulo={imovel.titulo}
          onClose={() => setCompartilharAberto(false)}
        />
      )}
    </div>
  );
}

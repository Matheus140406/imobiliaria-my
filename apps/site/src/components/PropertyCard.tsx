"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { formatPreco } from "@/lib/format";
import type { ImovelComMidias } from "@/lib/types";
import { ContactModal } from "./ContactModal";
import { BotaoFavorito } from "./BotaoFavorito";

export function PropertyCard({
  imovel,
  vendida = false,
}: {
  imovel: ImovelComMidias;
  vendida?: boolean;
}) {
  const [modalAberto, setModalAberto] = useState(false);
  const [galeriaIndex, setGaleriaIndex] = useState(0);
  const reduzMovimento = useReducedMotion();

  const midias = [...imovel.midias].sort((a, b) => a.ordem - b.ordem);
  const midiaAtual = midias[galeriaIndex] ?? null;
  const temVariasMidias = midias.length > 1;
  const href = `/imoveis/${imovel.slug}`;

  // As setas ficam fora do <Link> (são irmãs, não filhas) por dois motivos:
  // <button> dentro de <a> é HTML inválido, e precisamos que o clique nelas
  // troque a foto sem navegar pro detalhe do imóvel.
  function trocarMidia(e: React.MouseEvent, direcao: 1 | -1) {
    e.preventDefault();
    e.stopPropagation();
    setGaleriaIndex((atual) => (atual + direcao + midias.length) % midias.length);
  }

  return (
    <div className="imovel-card reveal" style={vendida ? { opacity: 0.75 } : undefined}>
      <div className="imovel-card-media">
        <Link href={href} className="block h-full w-full" aria-label={`Ver detalhes de ${imovel.titulo}`}>
          {midiaAtual ? (
            <AnimatePresence mode="wait" initial={false}>
              {/* Transição "líquida": desfoque + leve zoom no lugar de um corte
                  seco entre fotos — dá a sensação de dissolver de uma imagem
                  pra outra em vez de trocar de golpe. */}
              <motion.div
                key={midiaAtual.id}
                className="absolute inset-0"
                initial={reduzMovimento ? false : { opacity: 0, scale: 1.06, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={reduzMovimento ? undefined : { opacity: 0, scale: 0.97, filter: "blur(6px)" }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
              >
                {midiaAtual.tipo === "imagem" ? (
                  <Image
                    src={midiaAtual.thumbnail_url ?? midiaAtual.url}
                    alt={imovel.titulo}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <video
                    src={midiaAtual.url}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                  />
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div
              className="flex h-full items-center justify-center text-sm"
              style={{ background: "var(--cream2)", color: "var(--text-muted)" }}
            >
              Sem foto
            </div>
          )}
        </Link>

        {temVariasMidias && (
          <>
            <button
              type="button"
              onClick={(e) => trocarMidia(e, -1)}
              aria-label="Foto anterior"
              className="imovel-card-seta"
              style={{ left: "0.5rem" }}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={(e) => trocarMidia(e, 1)}
              aria-label="Próxima foto"
              className="imovel-card-seta"
              style={{ right: "0.5rem" }}
            >
              ›
            </button>
            <div className="imovel-card-pontos" aria-hidden="true">
              {midias.map((m, i) => (
                <span
                  key={m.id}
                  className={i === galeriaIndex ? "imovel-card-ponto ativo" : "imovel-card-ponto"}
                />
              ))}
            </div>
          </>
        )}

        <span className={vendida ? "imovel-badge imovel-badge-indisponivel" : "imovel-badge imovel-badge-disponivel"}>
          {vendida ? "Indisponível" : "Disponível"}
        </span>
        <BotaoFavorito imovelId={imovel.id} />
      </div>

      <div className="imovel-card-body">
        <Link href={href} className="block">
          <h3>{imovel.titulo}</h3>
          {imovel.localizacao && (
            <p className="imovel-loc">{imovel.localizacao}</p>
          )}
          <p className="imovel-preco">{formatPreco(imovel.preco)}</p>
        </Link>

        {!vendida && (
          <button onClick={() => setModalAberto(true)} className="imovel-contact-btn">
            Entrar em Contato
          </button>
        )}
      </div>

      {modalAberto && (
        <ContactModal imovel={imovel} onClose={() => setModalAberto(false)} />
      )}
    </div>
  );
}

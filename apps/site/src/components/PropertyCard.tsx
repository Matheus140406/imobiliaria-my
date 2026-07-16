"use client";

import { useState } from "react";
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
  const capa =
    [...imovel.midias].sort((a, b) => a.ordem - b.ordem)[0] ?? null;
  const href = `/imoveis/${imovel.slug}`;

  return (
    <div className="imovel-card reveal" style={vendida ? { opacity: 0.75 } : undefined}>
      <div className="imovel-card-media">
        {/* Link separado da mídia em vez de envolver o card inteiro: um
            <button> (Entrar em Contato / favoritar) dentro de um <a> é HTML
            inválido e quebra o foco de teclado. */}
        <Link href={href} className="block h-full w-full" aria-label={`Ver detalhes de ${imovel.titulo}`}>
          {capa && capa.tipo === "imagem" ? (
            <Image
              src={capa.thumbnail_url ?? capa.url}
              alt={imovel.titulo}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-white/40">
              Sem foto
            </div>
          )}
        </Link>

        <span className={vendida ? "imovel-badge imovel-badge-ocupada" : "imovel-badge imovel-badge-disponivel"}>
          {vendida ? "Ocupada" : "Disponível"}
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

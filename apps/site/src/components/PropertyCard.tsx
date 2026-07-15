"use client";

import { useState } from "react";
import Image from "next/image";
import { formatPreco } from "@/lib/format";
import type { ImovelComMidias } from "@/lib/types";
import { ContactModal } from "./ContactModal";

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

  return (
    <div className="imovel-card reveal" style={vendida ? { opacity: 0.75 } : undefined}>
      <div className="imovel-card-media">
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

        <span className={vendida ? "imovel-badge imovel-badge-ocupada" : "imovel-badge imovel-badge-disponivel"}>
          {vendida ? "Ocupada" : "Disponível"}
        </span>
      </div>

      <div className="imovel-card-body">
        <h3>{imovel.titulo}</h3>
        {imovel.localizacao && (
          <p className="imovel-loc">{imovel.localizacao}</p>
        )}
        <p className="imovel-preco">{formatPreco(imovel.preco)}</p>

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

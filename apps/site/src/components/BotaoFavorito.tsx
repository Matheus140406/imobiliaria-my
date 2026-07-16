"use client";

import { useFavorito } from "@/lib/favoritos";

export function BotaoFavorito({ imovelId }: { imovelId: string }) {
  const { favorito, alternar } = useFavorito(imovelId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        alternar();
      }}
      aria-pressed={favorito}
      aria-label={favorito ? "Remover dos favoritos" : "Salvar nos favoritos"}
      className="imovel-fav-btn"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={favorito ? "#e0554f" : "none"}
        stroke={favorito ? "#e0554f" : "currentColor"}
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M12 21s-6.7-4.35-9.3-8.1C.86 10.1 1.4 6.6 4.2 5.1c2.2-1.2 4.7-.5 6.2 1.3.5.6 1.4.6 1.9 0 1.5-1.8 4-2.5 6.2-1.3 2.8 1.5 3.34 5 1.5 7.8C18.7 16.65 12 21 12 21z" />
      </svg>
    </button>
  );
}

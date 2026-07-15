"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export function AvisoImovelIndisponivel() {
  const searchParams = useSearchParams();
  const [visivel, setVisivel] = useState(
    () => searchParams.get("imovel_indisponivel") === "1",
  );

  useEffect(() => {
    if (searchParams.get("imovel_indisponivel") !== "1") return;
    // Limpa o parâmetro só na barra de endereço, sem passar pelo router do
    // Next (que dispararia uma navegação/refetch e remontaria este
    // componente, perdendo o estado "visivel" antes de aparecer).
    const url = new URL(window.location.href);
    url.searchParams.delete("imovel_indisponivel");
    window.history.replaceState({}, "", url.pathname + url.hash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!visivel) return;
    const timer = setTimeout(() => setVisivel(false), 6000);
    return () => clearTimeout(timer);
  }, [visivel]);

  if (!visivel) return null;

  return (
    <div className="aviso-toast" role="status">
      <span>
        Este imóvel foi vendido ou não está mais disponível, continue
        explorando nossas opções ativas!
      </span>
      <button onClick={() => setVisivel(false)} aria-label="Fechar aviso">
        &times;
      </button>
    </div>
  );
}

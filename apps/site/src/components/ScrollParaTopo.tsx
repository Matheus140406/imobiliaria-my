"use client";

import { useEffect } from "react";

/**
 * O reset de scroll do App Router ao navegar por <Link> não é confiável
 * aqui: com `html { scroll-behavior: smooth }` no CSS global, a chamada
 * scrollTo(0,0) do Next roda animada e, vindo de uma posição de scroll alta
 * (ex: clicar num link do rodapé), acaba não completando antes da página
 * ser considerada "carregada" — a página de destino abre no meio do scroll.
 * Forçar aqui, sem animação, garante que sempre abra do topo.
 */
export function ScrollParaTopo() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  return null;
}

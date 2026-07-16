"use client";

import { useMemo, useState } from "react";
import { PropertyCard } from "./PropertyCard";
import { useListaDeFavoritos } from "@/lib/favoritos";
import type { ImovelComMidias } from "@/lib/types";

type Filtro = "todos" | "disponivel" | "ocupado" | "favoritos";

const OPCOES: { valor: Filtro; label: string }[] = [
  { valor: "todos", label: "Todos" },
  { valor: "disponivel", label: "Disponível" },
  { valor: "ocupado", label: "Indisponível" },
  { valor: "favoritos", label: "Favoritos" },
];

export function ImoveisFiltro({
  disponiveis,
  vendidos,
}: {
  disponiveis: ImovelComMidias[];
  vendidos: ImovelComMidias[];
}) {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const favoritos = useListaDeFavoritos();

  // Combina os dois conjuntos numa lista só, marcando cada item, pra dar pra
  // filtrar no cliente sem recarregar a página nem refazer fetch nenhum.
  const todos = useMemo(
    () => [
      ...disponiveis.map((imovel) => ({ imovel, vendida: false })),
      ...vendidos.map((imovel) => ({ imovel, vendida: true })),
    ],
    [disponiveis, vendidos],
  );

  const filtrados = useMemo(() => {
    if (filtro === "disponivel") return todos.filter((i) => !i.vendida);
    if (filtro === "ocupado") return todos.filter((i) => i.vendida);
    if (filtro === "favoritos")
      return todos.filter((i) => favoritos.includes(i.imovel.id));
    return todos;
  }, [todos, filtro, favoritos]);

  if (todos.length === 0) {
    return (
      <p className="py-16 text-center" style={{ color: "var(--text-muted)" }}>
        Nenhum imóvel cadastrado ainda.
      </p>
    );
  }

  return (
    <div>
      <div className="imoveis-filtros" role="tablist" aria-label="Filtrar imóveis por status">
        {OPCOES.map((opcao) => (
          <button
            key={opcao.valor}
            type="button"
            role="tab"
            aria-selected={filtro === opcao.valor}
            onClick={() => setFiltro(opcao.valor)}
            className={filtro === opcao.valor ? "filtro-btn ativo" : "filtro-btn"}
          >
            {opcao.label}
            {opcao.valor === "favoritos" && favoritos.length > 0 && (
              <span className="filtro-contagem">{favoritos.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="imoveis-grid-animada" key={filtro} aria-live="polite">
        {filtrados.length === 0 ? (
          <p className="col-span-full py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            {filtro === "favoritos"
              ? "Você ainda não salvou nenhum imóvel. Toque no coração de um card para salvar."
              : "Nenhum imóvel encontrado para esse filtro."}
          </p>
        ) : (
          filtrados.map(({ imovel, vendida }) => (
            <div key={imovel.id} className="imovel-card-anim">
              <PropertyCard imovel={imovel} vendida={vendida} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

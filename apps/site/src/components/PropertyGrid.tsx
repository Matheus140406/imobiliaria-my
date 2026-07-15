import { PropertyCard } from "./PropertyCard";
import type { ImovelComMidias } from "@/lib/types";

export function PropertyGrid({
  titulo,
  imoveis,
  vendida = false,
}: {
  titulo: string;
  imoveis: ImovelComMidias[];
  vendida?: boolean;
}) {
  if (imoveis.length === 0) return null;

  return (
    <div>
      <div className="imoveis-header reveal">
        <h2 className="section-title">{titulo}</h2>
      </div>
      <div className="imoveis-grid">
        {imoveis.map((imovel) => (
          <PropertyCard key={imovel.id} imovel={imovel} vendida={vendida} />
        ))}
      </div>
    </div>
  );
}

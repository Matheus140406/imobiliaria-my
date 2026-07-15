"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@imobiliaria/db/client";
import type { Tables } from "@imobiliaria/db/types";
import { formatPreco } from "@/lib/format";

type ImovelComRelacoes = Tables<"imoveis"> & {
  corretor: { nome: string } | null;
  midias: Pick<Tables<"midias">, "id" | "url" | "tipo" | "ordem">[];
};

export function ImovelCard({
  imovel,
  mostrarCorretor,
}: {
  imovel: ImovelComRelacoes;
  mostrarCorretor: boolean;
}) {
  const router = useRouter();
  const [excluindo, setExcluindo] = useState(false);

  const capa = [...(imovel.midias ?? [])]
    .filter((m) => m.tipo === "imagem")
    .sort((a, b) => a.ordem - b.ordem)[0];

  const disponivel = imovel.status === "disponivel";

  async function handleExcluir() {
    if (
      !confirm(
        `Excluir "${imovel.titulo}"? O imóvel sai do site, mas o histórico é mantido.`,
      )
    )
      return;

    setExcluindo(true);
    const supabase = createClient();
    await supabase
      .from("imoveis")
      .update({ deletado_em: new Date().toISOString() })
      .eq("id", imovel.id);
    setExcluindo(false);
    router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="relative aspect-[4/3] w-full bg-neutral-100 dark:bg-neutral-900">
        {capa ? (
          <Image
            src={capa.url}
            alt={imovel.titulo}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl text-neutral-300 dark:text-neutral-700">
            🏠
          </div>
        )}
        <span
          className={`absolute left-2 top-2 rounded-full px-3 py-1 text-xs font-semibold text-white shadow ${
            disponivel ? "bg-green-500" : "bg-neutral-600"
          }`}
        >
          {disponivel ? "Disponível" : "Ocupada"}
        </span>
      </div>

      <div className="p-4">
        <h2 className="mb-1 truncate text-lg font-semibold">
          {imovel.titulo}
        </h2>
        <p className="mb-3 text-xl font-bold text-neutral-900 dark:text-white">
          {formatPreco(imovel.preco)}
        </p>
        {mostrarCorretor && (
          <p className="mb-3 text-sm text-neutral-500">
            Corretor: {imovel.corretor?.nome ?? "-"}
          </p>
        )}

        <div className="flex gap-2">
          <Link
            href={`/dashboard/imoveis/${imovel.id}`}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-neutral-900 px-3 py-3 text-sm font-semibold text-white dark:bg-white dark:text-neutral-900"
          >
            ✏️ Editar
          </Link>
          <button
            type="button"
            onClick={handleExcluir}
            disabled={excluindo}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-red-200 px-3 py-3 text-sm font-semibold text-red-600 disabled:opacity-50 dark:border-red-900 dark:text-red-400"
          >
            🗑️ Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

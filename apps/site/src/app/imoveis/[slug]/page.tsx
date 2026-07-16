import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getImovelPorSlug, getImoveisDisponiveis } from "@/lib/imoveis";
import { formatPreco } from "@/lib/format";
import { ImovelDetalhePro } from "@/components/ImovelDetalhePro";
import { SeoJsonLd } from "@/components/SeoJsonLd";

// Sem isso, essa rota pode ser cacheada pela Vercel e mostrar um imóvel
// já removido/vendido como se ainda existisse, ou não refletir uma troca
// de preço/status recente.
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const imovel = await getImovelPorSlug(slug);
  if (!imovel) return {};

  const capa = [...imovel.midias]
    .filter((m) => m.tipo === "imagem")
    .sort((a, b) => a.ordem - b.ordem)[0];

  const titulo = `${imovel.titulo} — ${formatPreco(imovel.preco)}`;
  const descricao =
    imovel.descricao ??
    `${imovel.titulo}${imovel.localizacao ? ` em ${imovel.localizacao}` : ""}. Oportunidade exclusiva com a Imobiliária M&Y.`;

  return {
    title: titulo,
    description: descricao,
    openGraph: {
      title: titulo,
      description: descricao,
      ...(capa ? { images: [{ url: capa.url }] } : {}),
    },
    twitter: {
      title: titulo,
      description: descricao,
      ...(capa ? { images: [capa.url] } : {}),
    },
  };
}

export default async function ImovelPage({ params }: Params) {
  const { slug } = await params;
  const imovel = await getImovelPorSlug(slug);

  if (!imovel) {
    redirect("/?imovel_indisponivel=1");
  }

  const disponiveis = await getImoveisDisponiveis();
  const similares = disponiveis
    .filter((i) => i.id !== imovel.id)
    .slice(0, 3);

  return (
    <>
      <SeoJsonLd whatsapp={imovel.corretor?.whatsapp} imoveis={[imovel]} />
      <ImovelDetalhePro imovel={imovel} similares={similares} />
    </>
  );
}

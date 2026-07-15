import { Suspense } from "react";
import type { Metadata } from "next";
import { getImoveisDisponiveis, getImoveisVendidos } from "@/lib/imoveis";
import { whatsappLink } from "@/lib/format";
import { Navbar } from "@/components/Navbar";
import { AvisoImovelIndisponivel } from "@/components/AvisoImovelIndisponivel";
import { SeoJsonLd } from "@/components/SeoJsonLd";
import { Hero } from "@/components/Hero";
import { Sobre } from "@/components/Sobre";
import { Servicos } from "@/components/Servicos";
import { TunnelScene } from "@/components/tunnel3d/TunnelScene";
import type { TunnelItem } from "@/components/tunnel3d/types";
import { PropertyGrid } from "@/components/PropertyGrid";
import { Depoimentos } from "@/components/Depoimentos";
import { CtaSection } from "@/components/CtaSection";
import { Footer } from "@/components/Footer";
import { WhatsappFloat } from "@/components/WhatsappFloat";
import { RevealObserver } from "@/components/RevealObserver";

const MENSAGEM_GERAL =
  "Olá! Tudo bem? 😊\n\nEntrei em contato pois tenho interesse em conhecer os imóveis disponíveis na Imobiliária M&Y.\n\nPoderia me apresentar as opções e me dar mais informações sobre valores e condições?";

export async function generateMetadata(): Promise<Metadata> {
  const disponiveis = await getImoveisDisponiveis();
  const capa = disponiveis[0]?.midias
    ?.filter((m) => m.tipo === "imagem")
    .sort((a, b) => a.ordem - b.ordem)[0];

  if (!capa) return {};

  return {
    openGraph: { images: [{ url: capa.url }] },
    twitter: { images: [capa.url] },
  };
}

export default async function Home() {
  const [disponiveis, vendidos] = await Promise.all([
    getImoveisDisponiveis(),
    getImoveisVendidos(),
  ]);

  const contatoGeral = disponiveis[0]?.corretor ?? vendidos[0]?.corretor ?? null;
  const whatsappGeralUrl = contatoGeral?.whatsapp
    ? whatsappLink(contatoGeral.whatsapp, MENSAGEM_GERAL)
    : null;

  const capaDe = (imovel: (typeof disponiveis)[number]) =>
    [...imovel.midias]
      .filter((m) => m.tipo === "imagem")
      .sort((a, b) => a.ordem - b.ordem)[0] ?? null;

  const heroImageUrl = disponiveis.length > 0 ? capaDe(disponiveis[0])?.url : null;

  const paraTunnelItem = (imovel: (typeof disponiveis)[number], vendida: boolean) => {
    const capa = capaDe(imovel);
    if (!capa) return null;
    const item: TunnelItem = {
      id: imovel.id,
      url: capa.url,
      titulo: imovel.titulo,
      localizacao: imovel.localizacao,
      vendida,
      imovel,
    };
    return item;
  };

  const tunnelItems: TunnelItem[] = [
    ...disponiveis.map((i) => paraTunnelItem(i, false)),
    ...vendidos.map((i) => paraTunnelItem(i, true)),
  ].filter((i): i is TunnelItem => i !== null);

  const semImoveis = disponiveis.length === 0 && vendidos.length === 0;

  return (
    <>
      <SeoJsonLd
        whatsapp={contatoGeral?.whatsapp}
        imoveis={[...disponiveis, ...vendidos]}
      />
      <RevealObserver />
      <Suspense fallback={null}>
        <AvisoImovelIndisponivel />
      </Suspense>
      <Navbar />

      <Hero
        whatsappUrl={whatsappGeralUrl}
        heroImageUrl={heroImageUrl}
        totalDisponiveis={disponiveis.length}
        totalVendidos={vendidos.length}
      />

      <Sobre imageUrl={heroImageUrl} />
      <Servicos />

      <TunnelScene items={tunnelItems} />

      <div className="imoveis-section" id="imoveis">
        <PropertyGrid titulo="Casas Disponíveis" imoveis={disponiveis} />
        <div className="h-12" />
        <PropertyGrid titulo="Casas Vendidas" imoveis={vendidos} vendida />

        {semImoveis && (
          <p className="py-16 text-center text-white/50">
            Nenhum imóvel cadastrado ainda.
          </p>
        )}
      </div>

      <Depoimentos />
      <CtaSection whatsappUrl={whatsappGeralUrl} whatsappNumero={contatoGeral?.whatsapp} />
      <Footer whatsapp={contatoGeral?.whatsapp} />
      <WhatsappFloat whatsappUrl={whatsappGeralUrl} />
    </>
  );
}

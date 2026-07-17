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
import { ChavesParallax } from "@/components/ChavesParallax";
import { ImoveisFiltro } from "@/components/ImoveisFiltro";
import { Depoimentos } from "@/components/Depoimentos";
import { CtaSection } from "@/components/CtaSection";
import { Footer } from "@/components/Footer";
import { WhatsappFloat } from "@/components/WhatsappFloat";
import { RevealObserver } from "@/components/RevealObserver";

// Sem isso, o Next.js trata essa rota como estática por padrão (nenhuma
// API dinâmica é usada) e a Vercel serve o HTML do cache de borda
// indefinidamente entre deploys — um imóvel novo no Supabase não aparece
// até o próximo deploy, mesmo sem nenhum cache de fetch configurado.
export const dynamic = "force-dynamic";

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

      <Sobre />
      <Servicos />
      <ChavesParallax whatsappUrl={whatsappGeralUrl} />

      <div className="imoveis-section" id="imoveis">
        <div className="imoveis-header">
          <h2 className="section-title">Imóveis</h2>
          <p className="section-text">
            Filtre por disponibilidade e encontre a oportunidade certa para você.
          </p>
        </div>
        <ImoveisFiltro disponiveis={disponiveis} vendidos={vendidos} />
      </div>

      <Depoimentos />
      <CtaSection whatsappUrl={whatsappGeralUrl} whatsappNumero={contatoGeral?.whatsapp} />
      <Footer whatsapp={contatoGeral?.whatsapp} />
      <WhatsappFloat whatsappUrl={whatsappGeralUrl} />
    </>
  );
}

import { SITE_URL, SITE_NAME } from "@/lib/site";
import type { ImovelComMidias } from "@/lib/types";

// JSON.stringify não escapa "<", então um título/descrição de imóvel
// contendo "</script>" quebraria para fora da tag e injetaria HTML/JS na
// página pública. < é indistinguível de "<" para o parser de JSON.
function jsonLdSeguro(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function NegocioJsonLd({ whatsapp }: { whatsapp?: string | null }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: SITE_NAME,
    url: SITE_URL,
    image: `${SITE_URL}/icon-512.png`,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Águas Lindas de Goiás",
      addressRegion: "GO",
      addressCountry: "BR",
    },
    // Coordenadas aproximadas do centro de Águas Lindas de Goiás — dado
    // geográfico público, não específico de um endereço comercial real.
    geo: {
      "@type": "GeoCoordinates",
      latitude: -15.7561,
      longitude: -48.2814,
    },
    areaServed: {
      "@type": "City",
      name: "Águas Lindas de Goiás",
    },
    ...(whatsapp
      ? {
          telephone: whatsapp,
          contactPoint: {
            "@type": "ContactPoint",
            telephone: whatsapp,
            contactType: "customer service",
            areaServed: "BR",
            availableLanguage: "Portuguese",
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdSeguro(data) }}
    />
  );
}

function BreadcrumbJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Início",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Imóveis",
        item: `${SITE_URL}/#imoveis`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdSeguro(data) }}
    />
  );
}

function imovelParaJsonLd(imovel: ImovelComMidias) {
  const capa = [...imovel.midias]
    .filter((m) => m.tipo === "imagem")
    .sort((a, b) => a.ordem - b.ordem)[0];

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: imovel.titulo,
    description: imovel.descricao ?? undefined,
    url: `${SITE_URL}/imoveis/${imovel.slug}`,
    ...(capa ? { image: capa.url } : {}),
    ...(imovel.preco != null
      ? {
          offers: {
            "@type": "Offer",
            price: imovel.preco,
            priceCurrency: "BRL",
            availability:
              imovel.status === "disponivel"
                ? "https://schema.org/InStock"
                : "https://schema.org/SoldOut",
          },
        }
      : {}),
    ...(imovel.localizacao
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: imovel.localizacao,
            addressLocality: "Águas Lindas de Goiás",
            addressRegion: "GO",
            addressCountry: "BR",
          },
        }
      : {}),
  };
}

export function SeoJsonLd({
  whatsapp,
  imoveis,
}: {
  whatsapp?: string | null;
  imoveis: ImovelComMidias[];
}) {
  return (
    <>
      <NegocioJsonLd whatsapp={whatsapp} />
      <BreadcrumbJsonLd />
      {imoveis.map((imovel) => (
        <script
          key={imovel.id}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdSeguro(imovelParaJsonLd(imovel)),
          }}
        />
      ))}
    </>
  );
}

import { SITE_URL, SITE_NAME } from "@/lib/site";
import type { ImovelComMidias } from "@/lib/types";

function NegocioJsonLd({ whatsapp }: { whatsapp?: string | null }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: SITE_NAME,
    url: SITE_URL,
    image: `${SITE_URL}/icon-512.png`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Águas Lindas de Goiás",
      addressRegion: "GO",
      addressCountry: "BR",
    },
    areaServed: {
      "@type": "City",
      name: "Águas Lindas de Goiás",
    },
    ...(whatsapp ? { telephone: whatsapp } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
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
      {imoveis.map((imovel) => (
        <script
          key={imovel.id}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(imovelParaJsonLd(imovel)),
          }}
        />
      ))}
    </>
  );
}

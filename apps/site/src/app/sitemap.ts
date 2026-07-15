import type { MetadataRoute } from "next";
import { getImoveisDisponiveis, getImoveisVendidos } from "@/lib/imoveis";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [disponiveis, vendidos] = await Promise.all([
    getImoveisDisponiveis(),
    getImoveisVendidos(),
  ]);

  const imoveis = [...disponiveis, ...vendidos].map((imovel) => ({
    url: `${SITE_URL}/imoveis/${imovel.slug}`,
    lastModified: imovel.atualizado_em,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...imoveis,
  ];
}

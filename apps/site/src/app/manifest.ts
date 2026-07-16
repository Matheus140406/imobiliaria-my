import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Imobiliária M&Y",
    short_name: "M&Y",
    description: "Imóveis em Águas Lindas de Goiás - GO",
    start_url: "/",
    display: "standalone",
    background_color: "#0d1a12",
    theme_color: "#c8a44a",
    icons: [
      // "maskable" sozinho faz launchers Android/desktop aplicarem a
      // moldura de corte de segurança do maskable também no ícone normal,
      // cortando a logo. Precisa de uma entrada "any" separada pro ícone
      // pleno aparecer certo fora do contexto adaptável.
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

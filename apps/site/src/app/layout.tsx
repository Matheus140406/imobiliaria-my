import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { SITE_URL, SITE_NAME, SITE_DESCRICAO } from "@/lib/site";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const TITULO = `${SITE_NAME} — Realize o Sonho da Casa Própria`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITULO,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRICAO,
  keywords: [
    "imobiliária Águas Lindas de Goiás",
    "casas à venda Águas Lindas de Goiás",
    "imóveis Águas Lindas de Goiás",
    "comprar casa Goiás",
    "alugar casa Águas Lindas",
    "Imobiliária M&Y",
  ],
  authors: [{ name: SITE_NAME }],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITULO,
    description: SITE_DESCRICAO,
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO,
    description: SITE_DESCRICAO,
    images: ["/icon-512.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0d1a12",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}

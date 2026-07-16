import type { Metadata, Viewport } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { CookieConsent } from "@/components/CookieConsent";
import { SITE_URL, SITE_NAME, SITE_DESCRICAO } from "@/lib/site";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const lato = Lato({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
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
    "apartamentos à venda Águas Lindas de Goiás",
    "casas para alugar Águas Lindas de Goiás",
    "comprar casa Goiás",
    "alugar casa Águas Lindas",
    "corretor de imóveis Águas Lindas de Goiás",
    "financiamento imobiliário Goiás",
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
  themeColor: "#0B2545",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${lato.variable}`}>
      <body>
        <a href="#conteudo-principal" className="skip-link">
          Pular para o conteúdo
        </a>
        {children}
        <CookieConsent />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}

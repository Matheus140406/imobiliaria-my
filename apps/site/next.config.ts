import path from "path";
import type { NextConfig } from "next";

// Sem essa CSP e sem X-Frame-Options, o site pode ser carregado dentro de um
// <iframe> em outro domínio (clickjacking) e não há nenhuma política restringindo
// de onde scripts/imagens/conexões podem vir. 'unsafe-inline' em script/style é
// necessário porque o Next.js App Router injeta o payload do RSC e o CSS do
// Tailwind via tags inline — restringir isso exigiria infraestrutura de nonce.
// 'unsafe-eval' só em dev: o HMR/overlay do Turbopack usa eval() para
// reconstruir stack traces; o React confirma que isso nunca roda em produção.
const scriptSrc =
  process.env.NODE_ENV === "development"
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";

const CSP = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://metzhlilouokuvkilgrw.supabase.co",
  "media-src 'self' https://metzhlilouokuvkilgrw.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://metzhlilouokuvkilgrw.supabase.co https://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  transpilePackages: ["@imobiliaria/db"],
  turbopack: {
    root: path.join(__dirname, "..", ".."),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "metzhlilouokuvkilgrw.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(), camera=(), microphone=()" },
          { key: "Content-Security-Policy", value: CSP },
        ],
      },
    ];
  },
};

export default nextConfig;

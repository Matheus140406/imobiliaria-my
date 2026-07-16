import path from "path";
import type { NextConfig } from "next";

// Painel interno: nunca deve ser indexado nem carregado num iframe de outro
// domínio. X-Robots-Tag é reforço além do `robots` do metadata (cobre PDFs,
// imagens e qualquer rota que não passe pelo React Metadata API).
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
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;

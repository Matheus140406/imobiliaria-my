importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/7.1.0/workbox-sw.js",
);

if (workbox) {
  workbox.setConfig({ debug: false });

  const { registerRoute } = workbox.routing;
  const { NetworkFirst, CacheFirst } = workbox.strategies;
  const { ExpirationPlugin } = workbox.expiration;
  const { CacheableResponsePlugin } = workbox.cacheableResponse;

  // Páginas: busca da rede primeiro (imóveis publicados/atualizados no admin
  // aparecem na hora), com um teto curto de espera. Só cai pro cache
  // (visita anterior) se a rede falhar ou demorar demais — é o que mantém
  // o site utilizável offline sem deixar conteúdo desatualizado no ar
  // enquanto há conexão.
  registerRoute(
    ({ request }) => request.mode === "navigate",
    new NetworkFirst({
      cacheName: "paginas",
      networkTimeoutSeconds: 3,
      plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
    }),
  );

  // Fontes e estilos/scripts gerados pelo Next: raramente mudam de conteúdo
  // (nome do arquivo tem hash), então cache-first é seguro e rápido.
  registerRoute(
    ({ url }) => url.pathname.startsWith("/_next/static/"),
    new CacheFirst({
      cacheName: "assets-estaticos",
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
        new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }),
      ],
    }),
  );

  // Fotos/vídeos dos imóveis (Supabase Storage) e imagens otimizadas pelo
  // Next: cache-first para não redownload a cada visita.
  registerRoute(
    ({ url }) =>
      url.pathname.startsWith("/_next/image") ||
      url.hostname.endsWith("supabase.co"),
    new CacheFirst({
      cacheName: "midias-imoveis",
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
        new ExpirationPlugin({ maxEntries: 150, maxAgeSeconds: 60 * 60 * 24 * 14 }),
      ],
    }),
  );

  self.addEventListener("install", () => self.skipWaiting());
  self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
}

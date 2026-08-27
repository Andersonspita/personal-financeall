const CACHE_NAME = "bussola-shell-v2";
// Importante: nunca incluir "/" (ou qualquer rota de página) aqui. Essas páginas mostram
// saldo, orçamento e score de vulnerabilidade — servir uma versão em cache seria mostrar
// dados financeiros desatualizados sem o usuário perceber. Só ativos verdadeiramente estáticos.
const SHELL_URLS = ["/manifest.json", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

// Cache-first para o app shell, com fallback de rede para tudo o mais (dados sempre atuais).
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (SHELL_URLS.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached ?? fetch(event.request)),
    );
  }
});

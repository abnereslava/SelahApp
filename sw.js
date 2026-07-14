const CACHE_NAME = 'selah-pwa-spa-v44'; // troca cor de destaque de dourado/marrom para azul
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './modules/registros.js',
  './modules/oracoes.js',
  './modules/igreja.js',
  './modules/bencaos.js'
];

// Imagem de fundo (Unsplash) — mesma URL usada no CSS. Cacheada para uso offline.
const BG_IMAGE_URL = 'https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?q=80&w=1527&auto=format&fit=crop';

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        await cache.addAll(urlsToCache);
        // Cache da imagem de fundo isolado em try/catch: se falhar (offline no
        // primeiro acesso, CORS, etc.), não deve quebrar a instalação do SW.
        try {
          await cache.add(new Request(BG_IMAGE_URL, { mode: 'cors' }));
        } catch (err) {
          console.log('Fundo não pôde ser cacheado agora (seguirá com fallback):', err);
        }
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Apagando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Assume o controle das abas abertas imediatamente
  );
});

// --- ESTRATÉGIA: NETWORK FIRST (Rede Primeiro) ---
self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  // Imagem de fundo (cross-origin): cache-first para funcionar offline.
  if (request.url.startsWith('https://images.unsplash.com/')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(resp => {
          if (resp && (resp.ok || resp.type === 'opaque')) {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return resp;
        }).catch(() => cached);
      })
    );
    return;
  }

  // Demais requisições: só lida com GET de mesma origem.
  // Firebase, fontes, CDNs e POSTs passam direto.
  if (new URL(request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then(networkResponse => {
        // Só guarda respostas válidas (200, mesma origem, sem ser opaca)
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return networkResponse;
      })
      .catch(() => caches.match(request))
  );
});

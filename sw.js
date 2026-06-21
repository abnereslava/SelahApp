const CACHE_NAME = 'selah-pwa-spa-v39'; // quill: botão único de título (cicla T1/T2/T3), fontes de h1/h2 menores + h3
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

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
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

  // Só lida com GET de mesma origem. Firebase, fontes, CDNs e POSTs passam direto.
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
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

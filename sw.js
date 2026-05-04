const CACHE_NAME = 'selah-pwa-v9'; // Fix bolinhas e posição acima do texto
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js'
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
    })
  );
});

// --- NOVA ESTRATÉGIA: NETWORK FIRST (Rede Primeiro) ---
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Se a internet funcionou, pega o arquivo novo do GitHub
        // E já salva uma cópia atualizada no cache silenciosamente
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // Se falhar (você estiver offline), ele puxa da memória do celular
        return caches.match(event.request);
      })
  );
});
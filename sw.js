const CACHE_NAME = 'selah-pwa-v2';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Força o novo Service Worker a assumir imediatamente
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  // Apaga as versões antigas do cache (ex: selah-pwa-v1)
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

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna o cache ou faz a requisição na rede
        return response || fetch(event.request);
      })
  );
});
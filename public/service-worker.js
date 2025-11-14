
const CACHE_NAME = 'trusty-cabs-cache-v1';
const OFFLINE_URL = './index.html';
const FILES_TO_CACHE = [
  './index.html',
  './manifest.json'
];

// On install, cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => {
    return cache.addAll(FILES_TO_CACHE);
  }));
  self.skipWaiting();
});

// On activate, clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => {
    return Promise.all(keys.map(key => {
      if (key !== CACHE_NAME) return caches.delete(key);
    }));
  }));
  self.clients.claim();
});

// Fetch: try network first, then cache, fallback to offline page
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then(response => {
      const resClone = response.clone();
      caches.open(CACHE_NAME).then(cache => {
        cache.put(event.request, resClone);
      });
      return response;
    }).catch(() => {
      return caches.match(event.request).then(resp => resp || caches.match(OFFLINE_URL));
    })
  );
});

// Increment the CACHE_VERSION to trigger a cache update when any of the cached files change.
const CACHE_VERSION = 'v2';
const CACHE_NAME = `morse-trainer-${CACHE_VERSION}`;
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/js/main.js',
  '/js/char-to-morse.js',
  '/js/morse-to-char.js',
  '/js/sound-to-char.js',
  '/js/learn.js',
  '/js/settings.js',
  '/js/statistics.js',
  '/js/morse-code.js',
  '/js/ui.js',
  '/js/session-tracker.js',
  '/html/char-to-morse.html',
  '/html/morse-to-char.html',
  '/html/sound-to-char.html',
  '/html/learn.html',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // IMPORTANT: Clone the response. A response is a stream
        // and because we want the browser to consume the response
        // as well as the cache consuming the response, we need
        // to clone it so we have two streams.
        var responseToCache = response.clone();

        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then(response => {
            // Cache hit - return response
            if (response) {
              return response;
            }
          });
      })
  );
});

// Versioned cache name
const CACHE_NAME = 'todo-cache-v1';

// Files to cache
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/sounds/click.mp3',
  '/sounds/added.mp3',
  '/sounds/delete.mp3',
  '/sounds/complete.mp3',
  '/sounds/success.mp3',
  '/sounds/switch.mp3',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install event - cache all necessary files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Caching app files');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - remove old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache:', key);
          return caches.delete(key);
        }
      })
    ))
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) return response;
        // Otherwise, fetch from network
        return fetch(event.request)
          .catch(() => {
            // If offline and requesting a page, fallback to index.html
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

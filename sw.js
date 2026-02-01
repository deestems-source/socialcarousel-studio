const CACHE_NAME = 'social-carousel-v5-offline';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  // Cache the specific external libraries used in index.html
  'https://cdn.tailwindcss.com',
  // Note: Fonts and other dynamic ESM modules will be cached at runtime by the fetch handler
];

// Install Event
self.addEventListener('install', (event) => {
  // Do NOT skipWaiting automatically. We wait for user to confirm update.
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline page');
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Message Event - Listen for SKIP_WAITING
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  // 1. Navigation requests (HTML): Network First, fallback to Cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('./index.html');
        })
    );
    return;
  }

  // 2. Assets (JS, CSS, Images, Fonts): Stale-While-Revalidate
  // This ensures we serve content fast from cache, but update it in the background
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Check if valid response
        if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors' && networkResponse.type !== 'opaque')) {
          return networkResponse;
        }

        // Cache the new response
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
            // Only cache valid http/https schemes (avoid chrome-extension:// etc)
            if (event.request.url.startsWith('http')) {
                cache.put(event.request, responseToCache);
            }
        });

        return networkResponse;
      }).catch((err) => {
        // Network failed, nothing to do. If cachedResponse is undefined, request fails.
      });

      return cachedResponse || fetchPromise;
    })
  );
});
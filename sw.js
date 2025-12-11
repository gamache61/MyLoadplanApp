const CACHE_NAME = 'loadmaster-v1';
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json',
  './icon.svg'
];

// Install Event: Cache core files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Fetch Event: Cache-First Strategy + Tailwind Handling
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Special handling for the Tailwind CDN to make sure it works offline
  if (requestUrl.hostname === 'cdn.tailwindcss.com') {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          // Return cached tailwind if available, otherwise fetch and cache it
          return response || fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Standard caching for your app files
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

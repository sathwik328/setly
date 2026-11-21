const CACHE_NAME = "pushpa-v1-cache";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/main.css",
  "./app.js",
  "./icons.js",
  "./audio.js",
  "./moves.js",
  "./logbook-engine.js",
  "./engine.js",
  "./storage.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Network-first for document (index.html) so updates are immediate on deploy
self.addEventListener("fetch", (e) => {
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Cache-first for other assets
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});

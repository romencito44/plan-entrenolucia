// Service worker para que la app funcione sin conexión (PWA).
// Sube CACHE_NAME (ej. "plan-lucia-v2") cada vez que cambies
// el contenido de las páginas para forzar a los dispositivos a descargar
// la versión nueva.
const CACHE_NAME = "plan-lucia-v4";

const ARCHIVOS_CACHE = [
  "./",
  "./index.html",
  "./Plan de Entrenamiento - Lucía.html",
  "./Plan de Nutricion y Descanso - Lucía.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARCHIVOS_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((claves) =>
      Promise.all(
        claves
          .filter((clave) => clave !== CACHE_NAME)
          .map((clave) => caches.delete(clave))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((respuestaCache) => {
      const fetchPromise = fetch(event.request)
        .then((respuestaRed) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, respuestaRed.clone());
          });
          return respuestaRed;
        })
        .catch(() => respuestaCache || caches.match("./index.html"));

      return respuestaCache || fetchPromise;
    })
  );
});

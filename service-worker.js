const CACHE_NAME = "caffeine-goblin-v1";

const APP_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// INSTALL
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_ASSETS))
  );
});

// ACTIVATE
self.addEventListener("activate", (event) => {

  event.waitUntil(
    caches.keys().then((keys) => {

      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );

    })
  );

  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", (event) => {

  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(

    caches.match(event.request)
      .then((cachedResponse) => {

        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((networkResponse) => {

            if (
              networkResponse &&
              networkResponse.status === 200
            ) {

              const clonedResponse =
                networkResponse.clone();

              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(
                    event.request,
                    clonedResponse
                  );
                });
            }

            return networkResponse;

          });

      })
      .catch(() => {

        return caches.match("./index.html");

      })

  );

});

// OPTIONAL MESSAGE HANDLER
self.addEventListener("message", (event) => {

  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }

});

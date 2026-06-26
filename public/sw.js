const CACHE = "jarvis-presentation-v2";
const STATIC_PATHS = [
  "",
  "slides/zh/01.webp", "slides/zh/02.webp", "slides/zh/03.webp", "slides/zh/04.webp", "slides/zh/05.webp",
  "slides/zh/06.webp", "slides/zh/07.webp", "slides/zh/08.webp", "slides/zh/09.webp", "slides/zh/10.webp",
  "slides/zh/11.webp", "slides/zh/12.webp", "slides/zh/13.webp", "slides/zh/14.webp", "slides/zh/15.webp",
  "slides/zh/16.webp", "slides/zh/17.webp", "slides/zh/18.webp", "slides/zh/19.webp", "slides/zh/20.webp",
  "slides/zh/21.webp", "slides/zh/22.webp", "slides/zh/23.webp", "slides/zh/24.webp", "slides/zh/25.webp",
  "slides/zh/01.png", "slides/zh/02.png", "slides/zh/03.png", "slides/zh/04.png", "slides/zh/05.png",
  "slides/zh/06.png", "slides/zh/07.png", "slides/zh/08.png", "slides/zh/09.png", "slides/zh/10.png",
  "slides/zh/11.png", "slides/zh/12.png", "slides/zh/13.png", "slides/zh/14.png", "slides/zh/15.png",
  "slides/zh/16.png", "slides/zh/17.png", "slides/zh/18.png", "slides/zh/19.png", "slides/zh/20.png",
  "slides/zh/21.png", "slides/zh/22.png", "slides/zh/23.png", "slides/zh/24.png", "slides/zh/25.png",
  "slides/zh-thumbs/01.webp", "slides/zh-thumbs/02.webp", "slides/zh-thumbs/03.webp", "slides/zh-thumbs/04.webp", "slides/zh-thumbs/05.webp",
  "slides/zh-thumbs/06.webp", "slides/zh-thumbs/07.webp", "slides/zh-thumbs/08.webp", "slides/zh-thumbs/09.webp", "slides/zh-thumbs/10.webp",
  "slides/zh-thumbs/11.webp", "slides/zh-thumbs/12.webp", "slides/zh-thumbs/13.webp", "slides/zh-thumbs/14.webp", "slides/zh-thumbs/15.webp",
  "slides/zh-thumbs/16.webp", "slides/zh-thumbs/17.webp", "slides/zh-thumbs/18.webp", "slides/zh-thumbs/19.webp", "slides/zh-thumbs/20.webp",
  "slides/zh-thumbs/21.webp", "slides/zh-thumbs/22.webp", "slides/zh-thumbs/23.webp", "slides/zh-thumbs/24.webp", "slides/zh-thumbs/25.webp",
  "case-previews/pluto.webp", "case-previews/quote-log.webp", "case-previews/family-growth-tree.webp",
  "case-previews/zaha.webp", "case-previews/onelaser-booth.webp", "case-previews/world-cup.webp",
  "demo/before.webp", "demo/after.webp",
];

const scoped = (path) => new URL(path, self.registration.scope).toString();

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(STATIC_PATHS.map(scoped)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(scoped(""))));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok && !response.headers.get("content-type")?.includes("text/html")) {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    }))
  );
});

const CACHE = "ice-10-6-build32";
const ASSETS = ["./","./index.html","./manifest.webmanifest","./ice-photo.jpg","./icon-180.png","./icon-192.png","./icon-512.png","./ice-app-icon.png","./ice-hero-dark.jpg"];
self.addEventListener("install", event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener("activate", event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then(r => { const c=r.clone(); caches.open(CACHE).then(cache=>cache.put("./index.html",c)); return r; }).catch(()=>caches.match("./index.html")));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(r => { const c=r.clone(); caches.open(CACHE).then(cache=>cache.put(event.request,c)); return r; })));
});

const CACHE = "field-manual-1-0-rc14";
const ASSETS = ["./index.html","./manifest.webmanifest","./ice-photo.jpg","./ilo-photo.jpg","./fm-icon-180-rc5.png","./fm-icon-192-rc5.png","./fm-icon-512-rc5.png","./ice-hero-dark.jpg"];
self.addEventListener("install", event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener("activate", event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))); self.clients.claim(); });
self.addEventListener("fetch", event => {
 if(event.request.method!=="GET") return;
 if(event.request.mode==="navigate"){
  event.respondWith(fetch(event.request,{cache:"no-store"}).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put("./index.html",c));return r}).catch(()=>caches.match("./index.html")));
  return;
 }
 const u=new URL(event.request.url);
 if(u.origin===self.location.origin && (u.pathname.endsWith("/sw.js")||u.pathname.endsWith("/manifest.webmanifest"))){event.respondWith(fetch(event.request,{cache:"no-store"}));return;}
 event.respondWith(caches.match(event.request).then(c=>c||fetch(event.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(x=>x.put(event.request,copy));return r})));
});

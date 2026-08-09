const CACHE = "field-manual-1-0-rc2-rescue-roadmap";
const ASSETS = ["./","./index.html","./manifest.webmanifest","./ice-photo.jpg","./ilo-photo.jpg","./icon-180.png","./icon-192.png","./icon-512.png","./ice-app-icon.png","./ice-hero-dark.jpg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html"))));});

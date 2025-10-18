
const CACHE_NAME = 'alphaverse-v1';
const ASSETS = [
  './','./index.html','./marketing.html','./styles.css','./marketing.css','./app.js','./data.js','./config.js','./logo.svg',
  './icons/icon-32.png','./icons/icon-64.png','./icons/icon-128.png','./icons/icon-180.png','./icons/icon-256.png','./icons/icon-512.png'
];
self.addEventListener('install', (event) => { event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(self.skipWaiting())); });
self.addEventListener('activate', (event) => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(self.clients.claim())); });
function isAPI(url){ return url.includes('supabase.co'); }
self.addEventListener('fetch', (event) => {
  const req = event.request; const url = new URL(req.url);
  if (isAPI(url.href) && url.origin !== self.location.origin) { return; }
  event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(res => { const copy=res.clone(); caches.open(CACHE_NAME).then(cache => cache.put(req, copy)); return res; }).catch(()=> caches.match('./index.html'))));
});

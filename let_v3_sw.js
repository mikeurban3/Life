self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open('let-v3').then(c=> c.addAll([
    './life_expectancy_tool_v3.html',
    './let_v3_manifest.json',
    './let_v3_sw.js',
    './icon-192.png',
    './icon-512.png'
  ])));
});
self.addEventListener('activate', e => { self.clients.claim(); });
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
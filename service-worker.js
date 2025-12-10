const CACHE_NAME = 'tcc-gestor-cache-v2'
const ASSETS = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'scales.js',
  'charts.js',
  'predictive.js',
  'pdf.js',
  'manifest.json',
  'icon.svg'
]
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)))
  self.skipWaiting()
})
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))))
  self.clients.claim()
})
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
    const reqUrl = new URL(e.request.url)
    if (e.request.method === 'GET' && reqUrl.origin === location.origin) {
      const copy = res.clone()
      caches.open(CACHE_NAME).then(c => c.put(e.request, copy))
    }
    return res
  }).catch(() => caches.match('index.html'))))
})

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting()
})

/* MIND+ service worker: precache the whole app, serve it cache-first so it opens offline,
   and replace the cache when a new version ships.
   >>> Bump VERSION on every deploy, or phones keep showing the old copy. <<< */
const VERSION = 'mindplus-2026-11-26b';
const ASSETS = [
  './', 'index.html', 'css/app.css', 'js/app.js',
  'content/power.js', 'content/stoic.js', 'content/mind.js', 'content/habits.js',
  'content/talk.js', 'content/money.js', 'content/build.js', 'content/drive.js',
  'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION)
      .then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => (req.mode === 'navigate' ? caches.match('index.html') : Response.error())))
  );
});

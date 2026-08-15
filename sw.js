const CACHE_NAME = 'harmony-music-app-v89';
const ASSETS = [
  './', './index.html', './login.html', './dashboard.html', './profile.html', './daily-riyaz.html',
  './pitch-monitor.html', './pitch-monitor.css',
  './progress.html', './owner-console.html', './practice-tool.html', './metronome.html',
  './shared/theme.css', './shared/app-shell.css', './shared/components.css',
  './shared/app-shell.js', './shared/supabase-client.js', './shared/utils.js',
  './manifest.json', './icon-192.png', './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first: always try to get the freshest version when online.
// Only fall back to cache when offline.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        const clone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});

const CACHE_NAME = 'harmony-music-app-v105';
const ASSETS = [
  './', './index.html', './login.html', './dashboard.html', './profile.html', './daily-riyaz.html',
  './pitch-monitor.html', './pitch-monitor.css',
  './progress.html', './owner-console.html', './practice-tool.html', './metronome.html', './tabla.html',
  './shared/theme.css', './shared/app-shell.css', './shared/components.css',
  './shared/app-shell.js', './shared/supabase-client.js', './shared/utils.js',
  './manifest.json', './icon-192.png', './icon-512.png',
  './shared/audio/bols/Dha.mp3', './shared/audio/bols/Dhi.mp3', './shared/audio/bols/Dhin.mp3', './shared/audio/bols/Dhit.mp3', './shared/audio/bols/Dhun.mp3',
  './shared/audio/bols/Di.mp3', './shared/audio/bols/Ga.mp3', './shared/audio/bols/Ge.mp3', './shared/audio/bols/Ghe.mp3', './shared/audio/bols/Gi.mp3',
  './shared/audio/bols/Ka.mp3', './shared/audio/bols/Kat.mp3', './shared/audio/bols/Ke.mp3', './shared/audio/bols/Ki.mp3', './shared/audio/bols/Na.mp3',
  './shared/audio/bols/Ra.mp3', './shared/audio/bols/Re.mp3', './shared/audio/bols/Ta.mp3', './shared/audio/bols/Te.mp3', './shared/audio/bols/Ti.mp3',
  './shared/audio/bols/Tin.mp3', './shared/audio/bols/Tit.mp3', './shared/audio/bols/Tra.mp3', './shared/audio/bols/Tu.mp3', './shared/audio/bols/Tun.mp3',
  './shared/audio/tanpura/c3.mp3', './shared/audio/tanpura/cs3.mp3', './shared/audio/tanpura/d3.mp3', './shared/audio/tanpura/ds3.mp3',
  './shared/audio/tanpura/e3.mp3', './shared/audio/tanpura/f3.mp3', './shared/audio/tanpura/fs3.mp3', './shared/audio/tanpura/g3.mp3',
  './shared/audio/tanpura/gs3.mp3', './shared/audio/tanpura/a3.mp3', './shared/audio/tanpura/as3.mp3', './shared/audio/tanpura/b3.mp3'
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

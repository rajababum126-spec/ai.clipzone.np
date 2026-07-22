// AI Clipzone Nepal Service Worker for PWA Support
const CACHE_NAME = 'aiclipzone-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through fetch for dynamic app applet
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

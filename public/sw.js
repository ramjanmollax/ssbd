// Service Worker for Ss Seed Shop: High-Speed Image Caching & Push Notifications
const CACHE_NAME = 'seed-admin-pwa-v2';
const IMAGE_CACHE_NAME = 'seed-shop-images-v2';

const ASSETS_TO_CACHE = [
  '/',
  '/admin.html',
  '/manifest.json',
  '/pwa-192x192.svg',
  '/pwa-512x512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== IMAGE_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Cache-First Strategy for Images to deliver instantaneous loading
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Identify images: proxy endpoints, uploads, abseed CDN, or standard image extensions
  const isImage =
    req.destination === 'image' ||
    url.pathname.startsWith('/api/image-proxy') ||
    url.pathname.startsWith('/uploads/') ||
    url.hostname.includes('abseed.com.bd') ||
    /\.(webp|png|jpe?g|svg|gif|avif)(\?.*)?$/i.test(url.pathname);

  if (isImage) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) {
          return cached;
        }

        try {
          const res = await fetch(req);
          if (res && (res.status === 200 || res.type === 'opaque')) {
            cache.put(req, res.clone());
          }
          return res;
        } catch (err) {
          return cached || new Response('', { status: 408, statusText: 'Network Timeout' });
        }
      })
    );
    return;
  }
});

// Handle Push & Notification Events
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/admin.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/admin.html#orders');
      }
    })
  );
});

// ── GARDA HITAM SERVICE WORKER ──
// Versi cache — naikkan angka ini setiap deploy biar cache lama dibersihkan
const CACHE_VERSION = 'garda-hitam-v1';

// File-file yang di-cache untuk akses offline
const STATIC_ASSETS = [
  '/gardahitam/',
  '/gardahitam/index.html',
  '/gardahitam/drive-monitoring.html',
  '/gardahitam/manifest.json',
  '/gardahitam/icon-192.png',
  '/gardahitam/icon-512.png',
  // Font Google (opsional — kalau offline font fallback ke system font)
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap',
];

// ── INSTALL: cache semua static asset
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Garda Hitam v1...');
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      // Gunakan addAll tapi abaikan error per-file supaya tidak gagal total
      return Promise.allSettled(
        STATIC_ASSETS.map(url => cache.add(url).catch(() => {}))
      );
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: hapus cache lama
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_VERSION)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: Strategi Network First untuk API, Cache First untuk asset statis
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API Google Apps Script — selalu network, jangan di-cache
  if (url.hostname.includes('script.google.com')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Tidak ada koneksi internet. Data tidak dapat dimuat.' }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // Font & CDN — Cache First (jarang berubah)
  if (
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('cdnjs.cloudflare.com')
  ) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Asset lokal — Network First, fallback ke cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Simpan ke cache kalau berhasil
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline — ambil dari cache
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // Fallback halaman offline
          if (event.request.destination === 'document') {
            return caches.match('/gardahitam/index.html');
          }
        });
      })
  );
});

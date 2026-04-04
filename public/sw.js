// SnapQuote Service Worker — offline-capable PWA
// Cache-first for static assets, network-first for pages/API, background sync for failed POSTs.

const CACHE_VERSION = 2;
const CACHE_NAME = `snapquote-v${CACHE_VERSION}`;
const RUNTIME_CACHE = `snapquote-runtime-v${CACHE_VERSION}`;

// App shell routes to pre-cache on install
// Only cache public pages — protected routes redirect to login and can't be cached reliably
const APP_SHELL = [
  '/',
  '/auth/login',
];

// Static asset extensions that use cache-first
const STATIC_EXT = /\.(js|css|woff2?|ttf|otf|eot|png|jpg|jpeg|gif|webp|avif|svg|ico)$/;

// ─── IndexedDB helpers for offline request queue ───────────────────────────────

function openQueue() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('snapquote-offline-queue', 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('requests')) {
        db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function enqueueRequest(request) {
  const body = await request.clone().text();
  const db = await openQueue();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('requests', 'readwrite');
    tx.objectStore('requests').add({
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body,
      timestamp: Date.now(),
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function replayQueue() {
  const db = await openQueue();
  const entries = await new Promise((resolve, reject) => {
    const tx = db.transaction('requests', 'readonly');
    const req = tx.objectStore('requests').getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  for (const entry of entries) {
    try {
      const response = await fetch(entry.url, {
        method: entry.method,
        headers: entry.headers,
        body: entry.method !== 'GET' ? entry.body : undefined,
      });

      if (response.ok) {
        // Remove from queue on success
        const delTx = db.transaction('requests', 'readwrite');
        delTx.objectStore('requests').delete(entry.id);
        await new Promise((r) => { delTx.oncomplete = r; });
      }
    } catch {
      // Still offline or server error — leave in queue for next attempt
      break;
    }
  }
}

// ─── Install — pre-cache app shell ─────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// ─── Activate — clean up old caches ────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );

  // Replay any queued offline requests now that we're active
  replayQueue().catch(() => {});
});

// ─── Fetch ─────────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET/POST, chrome-extension, etc.
  if (url.origin !== self.location.origin && !url.hostname.includes('vercel')) return;

  // ── POST requests: try network, queue on failure ──
  if (request.method === 'POST') {
    event.respondWith(
      fetch(request.clone()).catch(async () => {
        await enqueueRequest(request);
        return new Response(
          JSON.stringify({ queued: true, message: 'Saved offline. Will sync when you reconnect.' }),
          { status: 202, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // Only handle GET from here
  if (request.method !== 'GET') return;

  // ── Static assets: cache-first ──
  if (STATIC_EXT.test(url.pathname) || url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // ── API calls & HTML pages: network-first ──
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache successful (non-redirect) GET responses for offline fallback
        if (response.ok && !response.redirected) {
          const clone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;

          // For navigation requests, fall back to cached app shell index
          if (request.mode === 'navigate') {
            return caches.match('/');
          }

          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
      })
  );
});

// ─── Listen for online event from clients to replay queue ──────────────────────

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'ONLINE') {
    replayQueue().catch(() => {});
  }
});

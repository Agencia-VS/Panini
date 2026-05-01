const CACHE_VERSION = 'panini-v1';
const APP_SHELL_CACHE = `${CACHE_VERSION}-app-shell`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const scopePath = new URL(self.registration.scope).pathname;
    const appShellUrls = [scopePath, `${scopePath}index.html`];
    const cache = await caches.open(APP_SHELL_CACHE);

    for (const url of appShellUrls) {
      try {
        const response = await fetch(url, { cache: 'reload' });
        if (response.ok) {
          await cache.put(url, response.clone());
        }
      } catch {
        // Si falla durante install, se seguirá llenando en runtime.
      }
    }

    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const expected = new Set([APP_SHELL_CACHE, ASSET_CACHE]);
    const keys = await caches.keys();

    await Promise.all(
      keys.map((key) => (expected.has(key) ? Promise.resolve() : caches.delete(key))),
    );

    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const scopePath = new URL(self.registration.scope).pathname;
  const isInAppScope = url.pathname.startsWith(scopePath);
  if (!isInAppScope) return;

  // Navegaciones: network-first + fallback al shell cacheado.
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.ok) {
          const appShell = await caches.open(APP_SHELL_CACHE);
          await appShell.put(`${scopePath}index.html`, networkResponse.clone());
        }
        return networkResponse;
      } catch {
        const appShell = await caches.open(APP_SHELL_CACHE);
        return (
          (await appShell.match(`${scopePath}index.html`))
          || (await appShell.match(scopePath))
          || Response.error()
        );
      }
    })());
    return;
  }

  const staticDestinations = new Set(['script', 'style', 'image', 'font', 'audio', 'video']);
  const isStaticAsset = staticDestinations.has(request.destination);

  if (!isStaticAsset) return;

  // Assets estáticos: cache-first con actualización en background.
  event.respondWith((async () => {
    const cache = await caches.open(ASSET_CACHE);
    const cached = await cache.match(request);

    const networkFetch = fetch(request)
      .then((response) => {
        if (response && response.ok) {
          void cache.put(request, response.clone());
        }
        return response;
      })
      .catch(() => null);

    if (cached) {
      void networkFetch;
      return cached;
    }

    const network = await networkFetch;
    return network || Response.error();
  })());
});

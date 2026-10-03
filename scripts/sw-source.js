/**
 * Toolzum service-worker source (built by scripts/gen-sw.js).
 *
 * Pipeline: workbox-build injectManifest (precache manifest injected at the
 * Workbox manifest placeholder) → esbuild bundle → out/sw.js. Runs as a
 * classic worker script; registration is src/components/ServiceWorkerRegister.tsx.
 *
 * Two production bugs this replaces (diagnosed Oct 2026):
 *
 * 1. generateSW's navigateFallback registers NavigationRoute BEFORE all
 *    runtime routes, so every navigation to a non-precached URL was served
 *    /offline — even online — once the SW activated (SPA-shell recipe; the
 *    export is a multi-page build). Runtime routes now run first, and the
 *    offline page is a *catch* handler: it fires only when a handler
 *    rejects (offline + not cached), never for requests a route served.
 *
 * 2. Workbox precache install has no per-fetch timeout: under both `serve`
 *    and Cloudflare, some of the 782 concurrent fetches hang forever and
 *    the SW never activates (prod measured 759/782 then stalled). Every
 *    fetch is raced against a 30s timeout with up to 3 attempts.
 */
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { RangeRequestsPlugin } from 'workbox-range-requests';
import { skipWaiting, clientsClaim } from 'workbox-core';

const DAY = 86400;

// See header: hung fetches must not wedge install forever. Races each
// fetch against a timeout and retries on a fresh connection.
const nativeFetch = self.fetch.bind(self);
self.fetch = (input, init) => {
  const attempt = (n) =>
    Promise.race([
      nativeFetch(input, init),
      new Promise((_, reject) => setTimeout(() => reject(new Error('sw fetch timeout')), 30000)),
    ]).catch((err) => {
      if (n <= 1) throw err;
      return attempt(n - 1);
    });
  return attempt(3);
};

precacheAndRoute(self.__WB_MANIFEST, {});
cleanupOutdatedCaches();
skipWaiting();
clientsClaim();

function strategy({ handler, options = {} }) {
  const plugins = [];
  if (options.expiration) plugins.push(new ExpirationPlugin(options.expiration));
  if (options.rangeRequests) plugins.push(new RangeRequestsPlugin());
  const opts = { cacheName: options.cacheName, plugins };
  if (options.networkTimeoutSeconds) opts.networkTimeoutSeconds = options.networkTimeoutSeconds;
  if (handler === 'CacheFirst') return new CacheFirst(opts);
  if (handler === 'StaleWhileRevalidate') return new StaleWhileRevalidate(opts);
  return new NetworkFirst(opts);
}

// Route order is load-bearing: exact '/' before the same-origin catch-all.
const routes = [
  { urlPattern: '/', handler: 'NetworkFirst', options: { cacheName: 'start-url' } },
  {
    // #10 pre-emptive: versioned library/model CDNs are immutable
    // (pinned versions in URLs) — cache them for months, not the 1h
    // cross-origin default. This is what keeps FFmpeg/MediaPipe/TF.js
    // tools working offline instead of evicting mid-week.
    urlPattern: /^https:\/\/(cdn\.jsdelivr\.net|unpkg\.com|cdnjs\.cloudflare\.com|storage\.googleapis\.com)\/.*/i,
    handler: 'CacheFirst',
    options: { cacheName: 'immutable-cdn', expiration: { maxEntries: 48, maxAgeSeconds: 90 * DAY } },
  },
  {
    urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
    handler: 'CacheFirst',
    options: { cacheName: 'google-fonts-webfonts', expiration: { maxEntries: 4, maxAgeSeconds: 365 * DAY } },
  },
  {
    urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
    handler: 'StaleWhileRevalidate',
    options: { cacheName: 'google-fonts-stylesheets', expiration: { maxEntries: 4, maxAgeSeconds: 7 * DAY } },
  },
  {
    urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
    handler: 'StaleWhileRevalidate',
    options: { cacheName: 'static-font-assets', expiration: { maxEntries: 4, maxAgeSeconds: 7 * DAY } },
  },
  {
    urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
    handler: 'StaleWhileRevalidate',
    options: { cacheName: 'static-image-assets', expiration: { maxEntries: 64, maxAgeSeconds: 30 * DAY } },
  },
  {
    urlPattern: /\/_next\/static.+\.js$/i,
    handler: 'CacheFirst',
    options: { cacheName: 'next-static-js-assets', expiration: { maxEntries: 64, maxAgeSeconds: DAY } },
  },
  {
    urlPattern: /\/_next\/image\?url=.+$/i,
    handler: 'StaleWhileRevalidate',
    options: { cacheName: 'next-image', expiration: { maxEntries: 64, maxAgeSeconds: DAY } },
  },
  {
    urlPattern: /\.(?:mp3|wav|ogg)$/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'static-audio-assets',
      rangeRequests: true,
      expiration: { maxEntries: 32, maxAgeSeconds: DAY },
    },
  },
  {
    urlPattern: /\.(?:mp4|webm)$/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'static-video-assets',
      rangeRequests: true,
      expiration: { maxEntries: 32, maxAgeSeconds: DAY },
    },
  },
  {
    urlPattern: /\.(?:js)$/i,
    handler: 'StaleWhileRevalidate',
    options: { cacheName: 'static-js-assets', expiration: { maxEntries: 48, maxAgeSeconds: DAY } },
  },
  {
    urlPattern: /\.(?:css|less)$/i,
    handler: 'StaleWhileRevalidate',
    options: { cacheName: 'static-style-assets', expiration: { maxEntries: 32, maxAgeSeconds: DAY } },
  },
  {
    urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
    handler: 'StaleWhileRevalidate',
    options: { cacheName: 'next-data', expiration: { maxEntries: 32, maxAgeSeconds: DAY } },
  },
  {
    urlPattern: /\.(?:json|xml|csv)$/i,
    handler: 'NetworkFirst',
    options: { cacheName: 'static-data-assets', expiration: { maxEntries: 32, maxAgeSeconds: DAY } },
  },
  {
    // Same-origin API calls except the auth callback (mirrors previous sw.js).
    urlPattern: ({ sameOrigin, url }) =>
      sameOrigin && url.pathname.startsWith('/api/') && !url.pathname.startsWith('/api/auth/callback'),
    handler: 'NetworkFirst',
    options: { cacheName: 'apis', networkTimeoutSeconds: 10, expiration: { maxEntries: 16, maxAgeSeconds: DAY } },
  },
  {
    // Next.js RSC prefetch + navigations (same-origin, non-API).
    urlPattern: ({ request, url, sameOrigin }) =>
      request.headers.get('RSC') === '1' && request.headers.get('Next-Router-Prefetch') === '1' && sameOrigin && !url.pathname.startsWith('/api/'),
    handler: 'NetworkFirst',
    options: { cacheName: 'pages-rsc-prefetch', expiration: { maxEntries: 32, maxAgeSeconds: DAY } },
  },
  {
    urlPattern: ({ request, url, sameOrigin }) =>
      request.headers.get('RSC') === '1' && sameOrigin && !url.pathname.startsWith('/api/'),
    handler: 'NetworkFirst',
    options: { cacheName: 'pages-rsc', expiration: { maxEntries: 32, maxAgeSeconds: DAY } },
  },
  {
    urlPattern: ({ url, sameOrigin }) => sameOrigin && !url.pathname.startsWith('/api/'),
    handler: 'NetworkFirst',
    options: { cacheName: 'pages', expiration: { maxEntries: 32, maxAgeSeconds: DAY } },
  },
  {
    urlPattern: ({ sameOrigin }) => !sameOrigin,
    handler: 'NetworkFirst',
    options: { cacheName: 'cross-origin', networkTimeoutSeconds: 10, expiration: { maxEntries: 16, maxAgeSeconds: 3600 } },
  },
];

for (const { urlPattern, handler, options } of routes) {
  registerRoute(urlPattern, strategy({ handler, options }), 'GET');
}

// Offline fallback for navigations whose handler rejected (not cached, no
// network). #10 contract: APIs must fail honestly — never serve HTML to
// fetch(), so only mode 'navigate' gets the fallback page.
const offlineHandler = createHandlerBoundToURL('/offline');
setCatchHandler(({ event, request, url }) => {
  if (request.mode === 'navigate') return offlineHandler({ event, request, url });
  return Response.error();
});

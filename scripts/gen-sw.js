/**
 * Generates a fresh Workbox service worker after every production build (B1.6).
 *
 * Why not @ducanh2912/next-pwa: it injects a webpack config, which
 * hard-errors under this repo's Turbopack-default Next 16 build. This script
 * uses workbox-build directly (same Workbox engine, same route set as the
 * previously committed sw.js) with zero build-pipeline coupling.
 *
 * Run: node scripts/gen-sw.js (wired as the last step of `npm run build`).
 * Reads: out/ (built site). Writes: out/sw.js + out/workbox-*.js.
 * Registration: src/components/ServiceWorkerRegister.tsx (prod only).
 */
const { generateSW } = require('workbox-build');

const DAY = 86400;

const runtimeCaching = [
  { urlPattern: '/', handler: 'NetworkFirst', options: { cacheName: 'start-url' } },
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

async function main() {
  const { count, size, warnings } = await generateSW({
    globDirectory: 'out/',
    globPatterns: [
      '_next/static/**/*.{js,css}',
      '_next/static/media/*',
      'manifest.json',
      'robots.txt',
      'sitemap.xml',
      '_redirects',
      '*.png',
      '*.svg',
      '*.ico',
      'favicon*',
    ],
    swDest: 'out/sw.js',
    skipWaiting: true,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
    runtimeCaching,
  });
  for (const w of warnings) console.warn('[gen-sw]', w);
  console.log(`[gen-sw] precached ${count} files, out/sw.js written`);
  void size;
}

main().catch((e) => {
  console.error('[gen-sw] failed:', e);
  process.exit(1);
});

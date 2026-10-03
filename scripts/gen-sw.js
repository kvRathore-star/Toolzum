/**
 * Generates a fresh Workbox service worker after every production build (B1.6).
 *
 * Why not @ducanh2912/next-pwa: it injects a webpack config, which
 * hard-errors under this repo's Turbopack-default Next 16 build. This script
 * uses workbox-build directly with zero build-pipeline coupling.
 *
 * Pipeline (since Oct 2026 — see scripts/sw-source.js header for the two
 * bugs this shape fixes): injectManifest injects the precache manifest into
 * scripts/sw-source.js, then esbuild bundles the result (workbox modules
 * inlined) into a single classic worker script.
 *
 * Run: node scripts/gen-sw.js (wired as the last step of `npm run build`).
 * Reads: out/ (built site), public/offline.html, scripts/sw-source.js.
 * Writes: out/sw.js (+ intermediate under node_modules/.cache/gen-sw/).
 * Registration: src/components/ServiceWorkerRegister.tsx (prod only).
 */
const { injectManifest } = require('workbox-build');
const esbuild = require('esbuild');
const { readFileSync, existsSync, mkdirSync } = require('node:fs');
const { createHash } = require('node:crypto');
const path = require('node:path');

async function main() {
  // #10 recheck: the canonical URL is /offline (/offline.html 308s to it
  // on Pages pretty URLs, and a redirected precache-put throws). Hash the
  // file so the fallback entry invalidates on change. The SW source binds
  // createHandlerBoundToURL('/offline') at load — without the entry the
  // worker would throw on install, so missing file = hard failure here.
  const offlineHtml = 'public/offline.html';
  if (!existsSync(offlineHtml)) {
    throw new Error(`${offlineHtml} missing — the SW offline fallback requires it`);
  }
  const offlineRevision = createHash('sha256')
    .update(readFileSync(offlineHtml))
    .digest('hex')
    .slice(0, 16);

  const cacheDir = path.join('node_modules', '.cache', 'gen-sw');
  mkdirSync(cacheDir, { recursive: true });
  const injectedPath = path.join(cacheDir, 'sw-injected.js');

  const { count, warnings } = await injectManifest({
    globDirectory: 'out/',
    globPatterns: [
      '_next/static/**/*.{js,css}',
      '_next/static/media/*',
      'manifest.json',
      'offline.html',
      'robots.txt',
      'sitemap.xml',
      // Note: '_redirects' is NOT precached — Cloudflare Pages consumes it
      // and serves 404 for the URL, which fails workbox install outright.
      '*.png',
      '*.svg',
      '*.ico',
      'favicon*',
      // pdf.js worker (same-origin since Sep 2026): the editor, OCR, and
      // every PDF tool need it offline. Without this entry the first
      // offline open fails even though everything else is cached.
      'pdf.worker.min.mjs',
    ],
    additionalManifestEntries: [
      { url: '/offline', revision: offlineRevision },
      // Shell routes: always revalidate on SW install (revision null),
      // so first offline launch after install has the boot set even if
      // the user never revisits. Three small pages, not 2,563.
      { url: '/', revision: null },
      { url: '/tools/', revision: null },
    ],
    swSrc: path.join('scripts', 'sw-source.js'),
    swDest: injectedPath,
  });
  for (const w of warnings) console.warn('[gen-sw]', w);
  if (count === 0) {
    throw new Error('precached 0 files — out/ build output missing or empty, refusing to write sw.js');
  }

  await esbuild.build({
    entryPoints: [injectedPath],
    bundle: true,
    minify: true,
    format: 'iife',
    target: 'es2020',
    outfile: path.join('out', 'sw.js'),
    logLevel: 'warning',
  });
  console.log(`[gen-sw] precached ${count} files, out/sw.js written`);
}

main().catch((e) => {
  console.error('[gen-sw] failed:', e);
  process.exit(1);
});

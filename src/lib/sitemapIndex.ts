/**
 * Sitemap index splitting — shared by functions/api/sitemap-crawl.ts
 * (builds the chunked output) and its unit tests. The sitemap protocol
 * allows 50,000 URLs per file; we split at 500 so files stay small enough
 * for Search Console to process quickly and for users to inspect.
 *
 * Change the chunk size here, never inline — backend output and any future
 * client-side splitting must agree or file N won't match the index.
 */

/** URLs per sitemap file. */
export const SITEMAP_URLS_PER_FILE = 500;

/** 0-based chunk index → filename: sitemap-1.xml, sitemap-2.xml, … */
export function sitemapFileName(chunkIndex: number): string {
  return `sitemap-${chunkIndex + 1}.xml`;
}

/** Number of files needed for urlCount URLs (0 URLs → 0 files). */
export function sitemapFileCount(urlCount: number): number {
  if (!Number.isFinite(urlCount) || urlCount <= 0) return 0;
  return Math.ceil(urlCount / SITEMAP_URLS_PER_FILE);
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Standards-compliant sitemap index referencing fileCount chunk files
 * hosted next to it (same directory as the site root the user crawled).
 * Returns null when a single file suffices — no index needed.
 */
export function buildSitemapIndexXml(fileCount: number, baseUrl: string): string | null {
  if (!Number.isFinite(fileCount) || fileCount < 2) return null;
  const root = baseUrl.replace(/\/$/, '');
  const entries = Array.from({ length: fileCount }, (_, i) => `
  <sitemap>
    <loc>${escapeXml(`${root}/${sitemapFileName(i)}`)}</loc>
  </sitemap>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}
</sitemapindex>`;
}

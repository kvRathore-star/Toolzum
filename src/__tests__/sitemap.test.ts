import { describe, it, expect } from 'vitest';
import sitemap from '@/app/sitemap';
import { TOOL_REDIRECTS, SEO_PERMUTATIONS } from '@/registry/tools';

const BASE = 'https://toolzum.com';

// Regression: the sitemap once fed Google ~100 URLs that 301/404 by design
// (stub→tool redirects + SEO landing slugs), burning crawl budget into the
// "Page with redirect" exclusion bucket. Only canonical 200-pages allowed.
describe('sitemap', () => {
  it('excludes stub-redirect sources and SEO landing slugs', () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls.length).toBeGreaterThan(1000);

    const seoSlugs = new Set(SEO_PERMUTATIONS.map((p) => p.slug));
    const bad: string[] = [];
    for (const url of urls) {
      const slug = url.slice(BASE.length + 1).split('/')[1];
      if (!slug) continue;
      const redirect = TOOL_REDIRECTS[slug];
      if (redirect && redirect.slug !== slug) bad.push(url + ' (stub redirect)');
      if (seoSlugs.has(slug)) bad.push(url + ' (SEO landing redirect)');
    }
    expect(bad).toEqual([]);
  });

  it('lists canonical trailing-slash URLs (server 308s non-slashed variants)', () => {
    // Static pages were the last holdout: this test was deliberately scoped
    // to deep URLs on Sep 15 ("statics = separate cleanup") and the cleanup
    // never landed until Oct 5. Now covers everything — only the bare origin
    // (which serves 200 directly) may omit the slash.
    const urls = sitemap().map((e) => e.url);
    expect(urls.filter((u) => u !== BASE && !u.endsWith('/'))).toEqual([]);
  });

  it('contains no duplicate URLs (static + category can collide)', () => {
    // /extension existed as both a static entry and the Extension category
    // page — slash alignment on Oct 5 turned the pair into an exact dupe.
    const urls = sitemap().map((e) => e.url);
    const dupes = urls.filter((u, i) => urls.indexOf(u) !== i);
    expect(dupes).toEqual([]);
  });

  it('lists every non-redirect registry tool exactly once', async () => {
    const { toolsRegistry } = await import('@/registry/tools');
    const urls = new Set(sitemap().map((e) => e.url));
    const seoSlugs = new Set(SEO_PERMUTATIONS.map((p) => p.slug));
    const missing = toolsRegistry
      .filter((t) => {
        const r = TOOL_REDIRECTS[t.slug];
        return (!r || r.slug === t.slug) && !seoSlugs.has(t.slug);
      })
      .map((t) => t.slug)
      .filter((slug) => ![...urls].some((full) => full.endsWith('/' + slug + '/')));
    expect(missing).toEqual([]);
  });
});

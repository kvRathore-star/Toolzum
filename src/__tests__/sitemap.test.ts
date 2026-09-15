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
    // Scoped to tool + category URLs: static pages carry their own mixed
    // canonicals (see per-route layouts) and are a separate cleanup.
    const urls = sitemap().map((e) => e.url);
    const deep = urls.filter((u) => u.slice(BASE.length + 1).split('/').length > 1);
    expect(deep.filter((u) => !u.endsWith('/'))).toEqual([]);
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

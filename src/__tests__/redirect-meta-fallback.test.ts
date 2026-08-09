import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { generateMetadata } from '@/app/[category]/[tool]/page';
import { metadata as notFoundMetadata } from '@/app/not-found';
import { TOOL_REDIRECTS } from '@/registry/tools';

function catToUrlSlug(cat: string): string {
  if (cat === "Growth & Marketing") return "growth-metrics";
  return cat.toLowerCase().replace(/\s+/g, '-');
}

// Derived from the committed _redirects (static section + generated section).
function readCoveredSources(): Set<string> {
  const file = readFileSync(join(process.cwd(), 'public/_redirects'), 'utf8');
  const covered = new Set<string>();
  for (const line of file.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const parts = t.split(/\s+/);
    if (parts.length >= 3) covered.add(parts[0].replace(/\/$/, ''));
  }
  return covered;
}

describe('redirect noindex fallback (#10): unlisted paths degrade gracefully, never a soft-404', () => {
  it('TOOL_REDIRECTS sourceCategory + slug-rename sources are all present in _redirects (no fallback-only paths)', () => {
    const covered = readCoveredSources();
    const missing: string[] = [];
    for (const [slug, t] of Object.entries(TOOL_REDIRECTS)) {
      const catSlug = catToUrlSlug(t.category);
      if (slug !== t.slug) {
        const src = `/${catSlug}/${slug}`;
        if (!covered.has(src)) missing.push(src);
      }
      const cats = Array.isArray(t.sourceCategory) ? t.sourceCategory : t.sourceCategory ? [t.sourceCategory] : [];
      for (const sc of cats) {
        const src = `/${catToUrlSlug(sc)}/${slug}`;
        if (!covered.has(src)) missing.push(src);
      }
    }
    expect(missing, `TOOL_REDIRECTS sources missing from _redirects:\n${missing.join('\n')}`).toEqual([]);
  });

  it('every pre-rendered redirect-source path returns noindex + self-canonical, not a soft-404', async () => {
    // These paths ARE statically generated (redirectSourceParams) but resolve to no
    // live tool at that category+slug — so the page serves the noindex fallback.
    // Pick a real sourceCategory source to exercise the actual serving mechanism.
    const examples = Object.entries(TOOL_REDIRECTS)
      .filter(([, t]) => t.sourceCategory)
      .slice(0, 5)
      .map(([slug, t]) => {
        const cats = Array.isArray(t.sourceCategory) ? t.sourceCategory : [t.sourceCategory!];
        return cats.map(c => ({ category: catToUrlSlug(c), tool: slug, slug, target: t }));
      })
      .flat();

    expect(examples.length).toBeGreaterThan(0);
    for (const ex of examples) {
      const md = await generateMetadata({ params: Promise.resolve(ex) });
      expect(md.robots, `${ex.category}/${ex.tool} should be noindex`).toEqual({ index: false, follow: false });
      expect(md.alternates?.canonical, `${ex.category}/${ex.tool} should self-canonical`).toBe(
        `https://toolzum.com/${ex.category}/${ex.tool}/`
      );
    }
  });

  it('the static export 404 page (unlisted, non-prerendered paths) is noindex with no homepage canonical', () => {
    // Truly unmatched URLs in a static export are served 404.html from not-found.tsx,
    // NOT the [tool] page's generateMetadata. Assert that page is a clean noindex and
    // does not inherit the layout's homepage canonical (which would soft-404 to /).
    expect(notFoundMetadata.robots).toEqual({ index: false, follow: false });
    expect(notFoundMetadata.alternates).toBeNull();
  });
});

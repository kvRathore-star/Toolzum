import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { generateMetadata } from '@/app/[category]/[tool]/page';
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

describe('redirect noindex fallback (#10): unlisted paths degrade gracefully, never a bare 404', () => {
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

  it('a hypothetical path (not a live tool, not a redirect source) returns noindex + self-canonical', async () => {
    const md = await generateMetadata({ params: Promise.resolve({ category: 'hypothetical-category', tool: 'not-a-real-tool' }) });
    expect(md.robots).toEqual({ index: false, follow: false });
    expect(md.alternates?.canonical).toBe('https://toolzum.com/hypothetical-category/not-a-real-tool/');
  });
});

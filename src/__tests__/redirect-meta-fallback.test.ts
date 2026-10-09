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

  it('_redirects keeps all dynamic rules (splats/placeholders) after every static rule', () => {
    // Cloudflare's _redirects parser treats everything after the FIRST splat/placeholder
    // as dynamic and silently drops the tail past 100 dynamic rules (workers-sdk #14694).
    // The generator must sink dynamic rules to the end so all 2,000-static budget applies.
    const file = readFileSync(join(process.cwd(), 'public/_redirects'), 'utf8');
    const rules = file
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#') && l.split(/\s+/).length >= 3);
    const dynamic = /\*|:[\w-]/;
    let seenDynamic = false;
    const dynamicBeforeStatic: string[] = [];
    for (const rule of rules) {
      if (dynamic.test(rule)) seenDynamic = true;
      else if (seenDynamic) dynamicBeforeStatic.push(rule);
    }
    expect(dynamicBeforeStatic, `static rules appear after the first dynamic rule:\n${dynamicBeforeStatic.join('\n')}`).toEqual([]);
    expect(rules.filter(r => dynamic.test(r)).length).toBeLessThanOrEqual(100);
  });

  it('merged video-converter redirects preserve format intent (?from=)', () => {    // 11b merge: retired /converter/<fmt>-to-mp4 URLs must land on
    // /converter/video-converter/ with the source format preselected.
    const file = readFileSync(join(process.cwd(), 'public/_redirects'), 'utf8');
    const targets = new Map<string, string>();
    for (const line of file.split('\n')) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 3) targets.set(parts[0].replace(/\/$/, ''), parts[1]);
    }
    for (const fmt of ['avi', 'webm', 'mov']) {
      expect(targets.get(`/converter/${fmt}-to-mp4`),
        `${fmt}-to-mp4 must redirect with ?from=${fmt}`).toBe(`/converter/video-converter/?from=${fmt}`);
    }
  });

  it('_redirects stays under the 2,000-static ceiling (silent-drop postmortem)', () => {
    // Cloudflare silently drops rules past ~2,000 statics — the exact
    // failure mode of the redirects-dynamic-budget postmortem. Fail loud
    // at 1,800 so growth never sneaks into the drop zone unnoticed.
    const file = readFileSync(join(process.cwd(), 'public/_redirects'), 'utf8');
    const rules = file
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#') && l.split(/\s+/).length >= 3);
    expect(rules.length, `redirect rules (${rules.length}) approaching the 2,000 silent-drop ceiling`).toBeLessThanOrEqual(1800);
  });
});

// @vitest-environment node
/**
 * OG image existence gate (closes depth-audit finding 6c: "no test covers the
 * registry × OG combination — a slug rename would sail through CI green").
 *
 * The generator writes public/og/<categorySlug>/<slug>.{png,webp} for every
 * registry entry plus a category index and the home card; metadata points at
 * /og/... URLs. If a slug/category changes without regenerating (or the
 * generator and metadata disagree on the directory, as they did for
 * "Growth & Marketing" → growth-metrics), shares silently 404 in production.
 * This asserts the COMMITTED files exist — CI runs it before any build.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { toolsRegistry } from '@/registry/tools';
import { categorySlug } from '@/lib/categorySlugs';

const OG_ROOT = path.join(process.cwd(), 'public', 'og');

describe('OG images exist for every registry entry', () => {
  it('every tool has a committed png + webp share card', () => {
    const missing: string[] = [];
    for (const t of toolsRegistry) {
      const dir = path.join(OG_ROOT, categorySlug(t.category));
      for (const ext of ['png', 'webp']) {
        const f = path.join(dir, `${t.slug}.${ext}`);
        if (!fs.existsSync(f)) missing.push(path.relative(path.join(process.cwd(), 'public'), f));
      }
    }
    expect(missing, `${missing.length} missing OG images (run: npm run gen:og)\n${missing.slice(0, 20).join('\n')}`).toEqual([]);
  });

  it('every category has an index card and the home card exists', () => {
    const categories = [...new Set(toolsRegistry.map((t) => t.category))];
    const missing: string[] = [];
    for (const cat of categories) {
      for (const ext of ['png', 'webp']) {
        const f = path.join(OG_ROOT, categorySlug(cat), `index.${ext}`);
        if (!fs.existsSync(f)) missing.push(path.relative(path.join(process.cwd(), 'public'), f));
      }
    }
    for (const ext of ['png', 'webp']) {
      const f = path.join(OG_ROOT, 'home', `index.${ext}`);
      if (!fs.existsSync(f)) missing.push(path.relative(path.join(process.cwd(), 'public'), f));
    }
    expect(missing, `${missing.length} missing index/home OG images (run: npm run gen:og)\n${missing.join('\n')}`).toEqual([]);
  });
});

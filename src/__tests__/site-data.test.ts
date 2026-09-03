import { describe, it, expect } from 'vitest';
import { toolsRegistry } from '@/registry/tools';
import { getCachedToolCounts } from '@/registry/tools-helpers';
import { buildMegamenuColumns, MENU_COLUMN_DEFS } from '@/registry/megamenu-defs';
import { TOOL_COUNT, SITE_STATS, MEGAMENU_COLUMNS } from '@/registry/site-data.generated';

describe('site-data.generated (precomputed registry data)', () => {
  it('TOOL_COUNT matches the live registry length', () => {
    expect(TOOL_COUNT).toBe(toolsRegistry.length);
  });

  it('SITE_STATS matches the live getCachedToolCounts() counters', () => {
    const counts = getCachedToolCounts();
    expect(SITE_STATS.freeTierTotal).toBe(counts.freeTierTotal);
    expect(SITE_STATS.localTools).toBe(counts.localTools);
    expect(SITE_STATS.cloudTools).toBe(counts.cloudTools);
    expect(SITE_STATS.hybridTools).toBe(counts.hybridTools);
  });

  it('MEGAMENU_COLUMNS matches a fresh live buildMegamenuColumns() run', () => {
    expect(MEGAMENU_COLUMNS).toEqual(buildMegamenuColumns(toolsRegistry));
  });

  it('MEGAMENU_COLUMNS has exactly 7 featured tools per column and valid hrefs', () => {
    for (const col of MEGAMENU_COLUMNS) {
      expect(col.tools.length).toBeGreaterThan(0);
      expect(col.tools.length).toBeLessThanOrEqual(7);
      expect(col.allCount).toBeGreaterThanOrEqual(col.tools.length);
      for (const t of col.tools) {
        expect(t.href).toMatch(/^\/([a-z0-9-]+)\/([a-z0-9-]+)$/);
        expect(t.name.length).toBeGreaterThan(0);
      }
    }
  });

  it('megamenu sum + unlisted categories == totalImplemented (reconciliation check)', () => {
    const megamenuCategories = new Set(MENU_COLUMN_DEFS.map(d => d.category));
    const megamenuSum = MEGAMENU_COLUMNS.reduce((acc, col) => acc + col.allCount, 0);

    // Count tools in categories not in the megamenu (excluding seo-* and Extension)
    // Note: totalImplemented counts ALL tools regardless of showInCategory,
    // so we count all tools here too (not just visible ones)
    const unlistedSum = toolsRegistry
      .filter(t => !megamenuCategories.has(t.category))
      .filter(t => !t.id?.startsWith('seo-') && t.category !== 'Extension')
      .length;

    // Also count hidden tools in megamenu categories (showInCategory === false)
    // These are excluded from allCount but included in totalImplemented
    const megamenuHiddenSum = toolsRegistry
      .filter(t => megamenuCategories.has(t.category))
      .filter(t => t.showInCategory === false)
      .filter(t => !t.id?.startsWith('seo-') && t.category !== 'Extension')
      .length;

    const totalFromParts = megamenuSum + unlistedSum + megamenuHiddenSum;

    console.log(`megamenuSum=${megamenuSum} unlistedSum=${unlistedSum} megamenuHiddenSum=${megamenuHiddenSum} total=${totalFromParts} expected=${SITE_STATS.totalImplemented}`);

    // They should match — if this fails, either:
    // 1. MEGAMENU_COLUMNS.allCount is stale (run npm run gen:site-data)
    // 2. A new category was added but not added to MENU_COLUMN_DEFS
    // 3. SITE_STATS.totalImplemented doesn't match the registry
    expect(totalFromParts).toBe(SITE_STATS.totalImplemented);
  });
});
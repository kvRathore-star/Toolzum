import { describe, it, expect } from 'vitest';
import { toolsRegistry } from '@/registry/tools';
import { getCachedToolCounts } from '@/registry/tools-helpers';
import { buildMegamenuColumns } from '@/registry/megamenu-defs';
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
});
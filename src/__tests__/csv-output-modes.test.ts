// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { MODES, parseCsv, CSV_HUB_TABS } from '@/components/tools/modules/shared/CsvOutputConverter';
import { CONVERTER_CONFIG } from '@/components/tools/modules/shared/converterConfig';

const HUB_SLUGS = CSV_HUB_TABS.map(t => t.slug);

function routedCsvSlugs(): string[] {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/tools/modules/DynamicModuleWrapper.tsx'),
    'utf8',
  );
  const closureRe = /'([a-z0-9-]+)': dynamic\(\(\) => import\('@\/components\/tools\/modules\/shared\/CsvHubConverter'\)/g;
  return [...src.matchAll(closureRe)].map(m => m[1]);
}

describe('CsvOutputConverter MODES contract', () => {
  it('has a mode for every hub tab so the CSV hub never renders an unknown mode', () => {
    for (const tab of CSV_HUB_TABS) {
      expect(MODES[tab.slug], `missing MODES entry for hub tab ${tab.slug}`).toBeDefined();
    }
  });

  it('routes every csv-output slug via MODULE_REGISTRY closures and exposes exactly the six real modes (no dead csv-formatter stub)', () => {
    const routed = routedCsvSlugs();
    for (const tab of HUB_SLUGS) {
      expect(routed, `hub tab ${tab} missing from MODULE_REGISTRY`).toContain(tab);
    }
    expect(Object.keys(MODES).sort()).toEqual(HUB_SLUGS.slice().sort());
    expect(MODES['csv-formatter']).toBeUndefined();
    expect(CONVERTER_CONFIG).not.toHaveProperty('csv-formatter');
  });

  it('every MODULE_REGISTRY csv-output closure resolves to a valid mode via the hub fallback', () => {
    for (const slug of routedCsvSlugs()) {
      const resolved = HUB_SLUGS.includes(slug) ? slug : 'csv-to-markdown';
      expect(MODES[resolved], `slug ${slug} resolves to missing mode ${resolved}`).toBeDefined();
    }
  });

  it('parseCsv parses quoted commas and headers/rows correctly', () => {
    const { headers, rows } = parseCsv('name,note\nWidget,"has, comma"\nGadget,plain');
    expect(headers).toEqual(['name', 'note']);
    expect(rows).toEqual([['Widget', 'has, comma'], ['Gadget', 'plain']]);
  });

  it('each mode transform emits output in its expected format', () => {
    const headers = ['name', 'price'];
    const rows = [['Widget', '29.99'], ['Gadget', '49.99']];

    expect(MODES['csv-to-markdown'].transform(headers, rows)).toContain('| Widget |');
    expect(MODES['csv-to-ndjson'].transform(headers, rows)).toBe(
      '{"name":"Widget","price":"29.99"}\n{"name":"Gadget","price":"49.99"}',
    );
    expect(MODES['csv-to-sql'].transform(headers, rows)).toContain('INSERT INTO data');
    expect(MODES['csv-html-table-converter'].transform(headers, rows)).toContain('<table>');
    expect(MODES['csv-statistics'].transform(headers, rows)).toContain('Rows: 2');
    expect(MODES['csv-data-cleaner'].transform(headers, rows)).toBe('No issues found.');
  });
});

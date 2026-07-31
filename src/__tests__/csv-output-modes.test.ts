// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { MODES, parseCsv, CSV_HUB_TABS } from '@/components/tools/modules/shared/CsvOutputConverter';
import { CONVERTER_CONFIG } from '@/components/tools/modules/shared/converterConfig';

const HUB_SLUGS = CSV_HUB_TABS.map(t => t.slug);

describe('CsvOutputConverter MODES contract', () => {
  it('has a mode for every hub tab so the CSV hub never renders an unknown mode', () => {
    for (const tab of CSV_HUB_TABS) {
      expect(MODES[tab.slug], `missing MODES entry for hub tab ${tab.slug}`).toBeDefined();
    }
  });

  it('exposes exactly the six csv-output modes (no dead csv-formatter stub)', () => {
    const csvOutputSlugs = Object.keys(CONVERTER_CONFIG).filter(s => CONVERTER_CONFIG[s].category === 'csv-output');
    expect(HUB_SLUGS.every(s => csvOutputSlugs.includes(s))).toBe(true);
    expect(Object.keys(MODES).sort()).toEqual(HUB_SLUGS.slice().sort());
    expect(MODES['csv-formatter']).toBeUndefined();
  });

  it('every slug routed to the csv-output category resolves to a valid mode via the hub fallback', () => {
    for (const slug of Object.keys(CONVERTER_CONFIG)) {
      if (CONVERTER_CONFIG[slug].category !== 'csv-output') continue;
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

// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { SLUG_MAP as DATA_SLUG_MAP } from '@/components/tools/modules/converter/DataConverter';

const DATA_CLOSURE_SLUGS = ['xml-to-json', 'xml-to-csv', 'json-to-xml', 'json-to-csv', 'csv-to-json', 'csv-to-xml'];

function routedDataSlugs(): string[] {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/tools/modules/DynamicModuleWrapper.tsx'),
    'utf8',
  );
  const closureRe = /'([a-z0-9-]+)': dynamic\(\(\) => import\('@\/components\/tools\/modules\/converter\/DataConverter'\)\.then\(m => \(\{ default: \(\) => <m\.DataConverterFromSlug slug=/g;
  return [...src.matchAll(closureRe)].map(m => m[1]);
}

describe('DataConverter slug-closure contract', () => {
  it('routes all six per-pair DataConverter slugs via MODULE_REGISTRY', () => {
    const routed = routedDataSlugs().sort();
    expect(routed).toEqual(DATA_CLOSURE_SLUGS.slice().sort());
  });

  it('every routed slug is a DataConverter SLUG_MAP entry (Design B: former redirect sources are now per-pair pages)', () => {
    for (const slug of DATA_CLOSURE_SLUGS) {
      expect(DATA_SLUG_MAP, `slug ${slug} not a DataConverter SLUG_MAP entry`).toHaveProperty(slug);
    }
  });
});

// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { CONVERTER_CONFIG } from '@/components/tools/modules/shared/converterConfig';
import { SLUG_MAP as DATA_SLUG_MAP } from '@/components/tools/modules/converter/DataConverter';

const DATA_CLOSURE_SLUGS = ['xml-to-json', 'xml-to-csv'];
const DATA_REDIRECT_SOURCE_SLUGS = ['json-to-csv', 'csv-to-json', 'json-to-xml', 'csv-to-xml'];

function routedDataSlugs(): string[] {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/tools/modules/DynamicModuleWrapper.tsx'),
    'utf8',
  );
  const closureRe = /'([a-z0-9-]+)': dynamic\(\(\) => import\('@\/components\/tools\/modules\/converter\/DataConverter'\)\.then\(m => \(\{ default: \(\) => <m\.DataConverterFromSlug slug=/g;
  return [...src.matchAll(closureRe)].map(m => m[1]);
}

describe('DataConverter slug-closure contract', () => {
  it('routes xml-to-json and xml-to-csv via MODULE_REGISTRY and drops them from CONVERTER_CONFIG', () => {
    const routed = routedDataSlugs().sort();
    expect(routed).toEqual(DATA_CLOSURE_SLUGS.slice().sort());
    for (const slug of DATA_CLOSURE_SLUGS) {
      expect(CONVERTER_CONFIG, `data slug ${slug} still routed by CONVERTER_CONFIG`).not.toHaveProperty(slug);
    }
  });

  it('the routed slugs are SLUG_MAP entries; redirect-source pairs are not closure-routed', () => {
    for (const slug of DATA_CLOSURE_SLUGS) {
      expect(DATA_SLUG_MAP, `slug ${slug} not a DataConverter SLUG_MAP entry`).toHaveProperty(slug);
    }
    for (const slug of DATA_REDIRECT_SOURCE_SLUGS) {
      expect(routedDataSlugs()).not.toContain(slug);
    }
  });
});

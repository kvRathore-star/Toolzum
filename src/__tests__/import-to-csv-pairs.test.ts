// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { MODES as IMPORT_CSV_MODES } from '@/components/tools/modules/shared/ImportToCsvConverter';

const IMPORT_CSV_CLOSURE_SLUGS = ['import-to-csv', 'tsv-csv-converter'];
const SEPARATE_MODULE_SLUGS = ['xlsx-csv-converter', 'vcf-csv-converter', 'ics-csv-converter'];

function routedImportCsvSlugs(): string[] {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/tools/modules/DynamicModuleWrapper.tsx'),
    'utf8',
  );
  const closureRe = /'([a-z0-9-]+)': dynamic\(\(\) => import\('@\/components\/tools\/modules\/shared\/ImportToCsvConverter'\)/g;
  return [...src.matchAll(closureRe)].map(m => m[1]);
}

describe('ImportToCsvConverter slug-closure contract', () => {
  it('routes import-to-csv and tsv-csv-converter via MODULE_REGISTRY', () => {
    const routed = routedImportCsvSlugs().sort();
    expect(routed).toEqual(IMPORT_CSV_CLOSURE_SLUGS.slice().sort());
  });

  it('the closure-routed slugs are MODES entries; xlsx/vcf/ics stay separate module components', () => {
    for (const slug of IMPORT_CSV_CLOSURE_SLUGS) {
      expect(IMPORT_CSV_MODES, `slug ${slug} not an ImportToCsvConverter MODES entry`).toHaveProperty(slug);
      expect(SEPARATE_MODULE_SLUGS).not.toContain(slug);
    }
    for (const slug of SEPARATE_MODULE_SLUGS) {
      expect(routedImportCsvSlugs()).not.toContain(slug);
    }
  });
});

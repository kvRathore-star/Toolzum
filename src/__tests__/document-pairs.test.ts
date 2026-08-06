// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { FORMAT_PAIRS, FORMATS } from '@/components/tools/modules/shared/DocumentFormatConverter';

const PAIR_SLUGS = FORMAT_PAIRS.map(p => p.slug);
// epub-to-pdf is a FORMAT_PAIRS tab but stays a MODULE_REGISTRY slug via EpubToPdf,
// so the 12 slug closures below are FORMAT_PAIRS minus epub-to-pdf.
const DOC_CLOSURE_SLUGS = PAIR_SLUGS.filter(s => s !== 'epub-to-pdf');

function routedDocumentSlugs(): string[] {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/tools/modules/DynamicModuleWrapper.tsx'),
    'utf8',
  );
  const closureRe = /'([a-z0-9-]+)': dynamic\(\(\) => import\('@\/components\/tools\/modules\/shared\/DocumentFormatConverter'\)/g;
  return [...src.matchAll(closureRe)].map(m => m[1]);
}

describe('DocumentFormatConverter pairs contract', () => {
  it('routes every document slug via MODULE_REGISTRY closures', () => {
    const routed = routedDocumentSlugs().sort();
    expect(routed).toEqual(DOC_CLOSURE_SLUGS.slice().sort());
  });

  it('every routed document closure resolves to a real FORMAT_PAIRS entry', () => {
    const pairSet = new Set(PAIR_SLUGS);
    for (const slug of routedDocumentSlugs()) {
      expect(pairSet, `slug ${slug} has no FORMAT_PAIRS entry (renders pdf-to-word fallback)`).toContain(slug);
    }
  });

  it('FORMAT_PAIRS are internally consistent (valid formats, matching slug, unique)', () => {
    const seen = new Set<string>();
    for (const p of FORMAT_PAIRS) {
      expect(seen.has(p.slug), `duplicate FORMAT_PAIRS slug ${p.slug}`).toBe(false);
      seen.add(p.slug);
      const [input, output] = p.slug.split('-to-');
      expect(FORMATS[input], `pair ${p.slug} has unknown input format ${input}`).toBeDefined();
      expect(FORMATS[output], `pair ${p.slug} has unknown output format ${output}`).toBeDefined();
      expect(p.slug).toBe(`${input}-to-${output}`);
    }
  });
});

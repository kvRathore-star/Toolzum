// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { TRANSFORM_CONFIG } from '@/components/tools/modules/shared/textTransformConfig';
import { CONVERTER_CONFIG } from '@/components/tools/modules/shared/converterConfig';

// The 11 text-transform slugs migrated to MODULE_REGISTRY slug closures.
// TRANSFORM_CONFIG is broader than this list (28 entries — it also drives
// css-preprocessor / html-text / text-binary / serializer / json-output slugs
// that remain routed via CONVERTER_CONFIG), so the routed set is explicit here.
const TT_CLOSURE_SLUGS = [
  'text-tools',
  'tailwind-to-css-converter',
  'svg-to-css',
  'html-to-jsx',
  'code-to-curl-converter',
  'hex-text-converter',
  'hex-ascii-converter',
  'number-base-converter',
  'case-converter',
  'time-zone-converter',
  'unix-time-converter',
];

function routedTextTransformSlugs(): string[] {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/tools/modules/DynamicModuleWrapper.tsx'),
    'utf8',
  );
  const closureRe = /'([a-z0-9-]+)': dynamic\(\(\) => import\('@\/components\/tools\/modules\/shared\/TextTransformConverter'\)/g;
  return [...src.matchAll(closureRe)].map(m => m[1]);
}

describe('TextTransformConverter slug-closure contract', () => {
  it('routes exactly the 11 text-transform slugs via MODULE_REGISTRY and drops them from CONVERTER_CONFIG', () => {
    const routed = routedTextTransformSlugs().sort();
    expect(routed).toEqual(TT_CLOSURE_SLUGS.slice().sort());
    for (const slug of TT_CLOSURE_SLUGS) {
      expect(CONVERTER_CONFIG, `text-transform slug ${slug} still routed by CONVERTER_CONFIG`).not.toHaveProperty(slug);
    }
  });

  it('every routed text-transform closure resolves to a real TRANSFORM_CONFIG entry', () => {
    for (const slug of routedTextTransformSlugs()) {
      expect(TRANSFORM_CONFIG[slug], `slug ${slug} has no TRANSFORM_CONFIG entry (renders "Unknown transform" fallback)`).toBeDefined();
    }
  });

  it('migrated TRANSFORM_CONFIG entries are internally consistent', () => {
    const seen = new Set<string>();
    for (const slug of TT_CLOSURE_SLUGS) {
      const def = TRANSFORM_CONFIG[slug];
      expect(def, `missing TRANSFORM_CONFIG entry for ${slug}`).toBeDefined();
      expect(seen.has(slug)).toBe(false);
      seen.add(slug);
      expect(def!.slug).toBe(slug);
      expect(typeof def!.name).toBe('string');
      expect(typeof def!.convert).toBe('function');
    }
  });
});

// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { CSS_PREPROCESSOR_SLUGS } from '@/components/tools/modules/shared/CssPreprocessorHub';
import { TRANSFORM_CONFIG } from '@/components/tools/modules/shared/textTransformConfig';
import { CONVERTER_CONFIG } from '@/components/tools/modules/shared/converterConfig';

// The 6 css-preprocessor slugs migrated to MODULE_REGISTRY slug closures.
// CSS_PREPROCESSOR_SLUGS is exactly this set (no cross-listed tabs like the
// serializer/json-output hubs have), so the routed set is explicit here.
const CSS_PREPROCESSOR_CLOSURE_SLUGS = [
  'css-to-scss-converter',
  'scss-to-css-converter',
  'less-to-css-converter',
  'css-to-less-converter',
  'stylus-to-css-converter',
  'css-to-stylus-converter',
];

function routedCssPreprocessorSlugs(): string[] {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/tools/modules/DynamicModuleWrapper.tsx'),
    'utf8',
  );
  const closureRe = /'([a-z0-9-]+)': dynamic\(\(\) => import\('@\/components\/tools\/modules\/shared\/CssPreprocessorHub'\)/g;
  return [...src.matchAll(closureRe)].map(m => m[1]);
}

describe('CssPreprocessorHub slug-closure contract', () => {
  it('routes exactly the 6 css-preprocessor slugs via MODULE_REGISTRY and drops them from CONVERTER_CONFIG', () => {
    const routed = routedCssPreprocessorSlugs().sort();
    expect(routed).toEqual(CSS_PREPROCESSOR_CLOSURE_SLUGS.slice().sort());
    for (const slug of CSS_PREPROCESSOR_CLOSURE_SLUGS) {
      expect(CONVERTER_CONFIG, `css-preprocessor slug ${slug} still routed by CONVERTER_CONFIG`).not.toHaveProperty(slug);
    }
  });

  it('every routed css-preprocessor closure resolves to a real TRANSFORM_CONFIG entry', () => {
    for (const slug of routedCssPreprocessorSlugs()) {
      expect(TRANSFORM_CONFIG[slug], `slug ${slug} has no TRANSFORM_CONFIG entry`).toBeDefined();
    }
  });

  it('every routed css-preprocessor closure is an in-app CSS_PREPROCESSOR_SLUGS tab', () => {
    const tabSet = new Set(CSS_PREPROCESSOR_SLUGS);
    for (const slug of routedCssPreprocessorSlugs()) {
      expect(tabSet, `slug ${slug} not rendered as a CssPreprocessorHub tab`).toContain(slug);
    }
  });

  it('migrated TRANSFORM_CONFIG entries are internally consistent', () => {
    const seen = new Set<string>();
    for (const slug of CSS_PREPROCESSOR_CLOSURE_SLUGS) {
      const def = TRANSFORM_CONFIG[slug];
      expect(def, `missing TRANSFORM_CONFIG entry for ${slug}`).toBeDefined();
      expect(seen.has(def!.slug)).toBe(false);
      seen.add(def!.slug);
      expect(def!.slug).toBe(slug);
      expect(typeof def!.name).toBe('string');
      expect(typeof def!.convert).toBe('function');
    }
  });
});

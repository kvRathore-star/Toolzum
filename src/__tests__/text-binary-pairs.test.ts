// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { MODES } from '@/components/tools/modules/shared/TextBinaryHub';
import { CONVERTER_CONFIG } from '@/components/tools/modules/shared/converterConfig';

// The 3 text-binary slugs migrated to MODULE_REGISTRY slug closures.
const TEXT_BINARY_CLOSURE_SLUGS = ['binary-to-text', 'text-to-binary', 'text-binary-converter'];

// Only 2 of the 3 are TextBinaryHub MODES tabs. text-binary-converter is NOT a tab:
// it is a catch-all slug that renders the hub's default mode (text-to-binary), exactly
// as ConverterRouter rendered it before the migration (same pattern as image-format-converter).
const TEXT_BINARY_TAB_SLUGS = ['binary-to-text', 'text-to-binary'];
const TEXT_BINARY_CATCH_ALL = 'text-binary-converter';
const TEXT_BINARY_DEFAULT_TAB = 'text-to-binary';

function routedTextBinarySlugs(): string[] {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/tools/modules/DynamicModuleWrapper.tsx'),
    'utf8',
  );
  const closureRe = /'([a-z0-9-]+)': dynamic\(\(\) => import\('@\/components\/tools\/modules\/shared\/TextBinaryHub'\)/g;
  return [...src.matchAll(closureRe)].map(m => m[1]);
}

describe('TextBinaryHub slug-closure contract', () => {
  it('routes exactly the 3 text-binary slugs via MODULE_REGISTRY and drops them from CONVERTER_CONFIG', () => {
    const routed = routedTextBinarySlugs().sort();
    expect(routed).toEqual(TEXT_BINARY_CLOSURE_SLUGS.slice().sort());
    for (const slug of TEXT_BINARY_CLOSURE_SLUGS) {
      expect(CONVERTER_CONFIG, `text-binary slug ${slug} still routed by CONVERTER_CONFIG`).not.toHaveProperty(slug);
    }
  });

  it('every routed slug is a MODES tab or the documented catch-all fallback', () => {
    for (const slug of routedTextBinarySlugs()) {
      if (TEXT_BINARY_TAB_SLUGS.includes(slug)) {
        expect(MODES, `tab slug ${slug} missing from MODES`).toContain(slug);
      } else {
        expect(slug).toBe(TEXT_BINARY_CATCH_ALL);
        expect(MODES).not.toContain(slug);
      }
    }
  });

  it('the catch-all slug renders the default mode, not an undefined mode', () => {
    expect(MODES).toContain(TEXT_BINARY_DEFAULT_TAB);
    expect(MODES).not.toContain(TEXT_BINARY_CATCH_ALL);
  });

  it('MODES and their mode configs are internally consistent', () => {
    expect(MODES).toHaveLength(2);
    for (const mode of MODES) {
      expect(['text-to-binary', 'binary-to-text']).toContain(mode);
    }
  });
});

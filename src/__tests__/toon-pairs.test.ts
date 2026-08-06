// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { CONVERTER_CONFIG } from '@/components/tools/modules/shared/converterConfig';
import { SLUG_TO_MODE as TOON_SLUG_TO_MODE } from '@/components/tools/modules/converter/DataFormatTools';

const TOON_CLOSURE_SLUGS = ['json-toon-converter'];
const TOON_REDIRECT_SOURCE_SLUGS = ['yaml-to-toon', 'toon-to-json', 'toon-to-yaml'];

function routedToonSlugs(): string[] {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/tools/modules/DynamicModuleWrapper.tsx'),
    'utf8',
  );
  const closureRe = /'([a-z0-9-]+)': dynamic\(\(\) => import\('@\/components\/tools\/modules\/converter\/DataFormatTools'\)\.then\(m => \(\{ default: \(\) => <m\.default slug=/g;
  return [...src.matchAll(closureRe)].map(m => m[1]);
}

describe('ToonConverter slug-closure contract', () => {
  it('routes json-toon-converter via MODULE_REGISTRY and drops it from CONVERTER_CONFIG', () => {
    const routed = routedToonSlugs().sort();
    expect(routed).toEqual(TOON_CLOSURE_SLUGS.slice().sort());
    for (const slug of TOON_CLOSURE_SLUGS) {
      expect(CONVERTER_CONFIG, `toon slug ${slug} still routed by CONVERTER_CONFIG`).not.toHaveProperty(slug);
    }
  });

  it('json-toon-converter is a SLUG_TO_MODE entry; redirect-source modes are not closure-routed', () => {
    for (const slug of TOON_CLOSURE_SLUGS) {
      expect(TOON_SLUG_TO_MODE, `slug ${slug} not a ToonConverter SLUG_TO_MODE entry`).toHaveProperty(slug);
    }
    for (const slug of TOON_REDIRECT_SOURCE_SLUGS) {
      expect(routedToonSlugs()).not.toContain(slug);
    }
  });
});

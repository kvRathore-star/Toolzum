// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { UNIT_FAMILIES } from '@/components/tools/modules/shared/UnitConverter';
import { CONVERTER_CONFIG } from '@/components/tools/modules/shared/converterConfig';

// The 16 unit slugs migrated to MODULE_REGISTRY slug closures.
// UNIT_FAMILIES is broader than this list (17 keys — it also holds the "unit-converter"
// umbrella entry that stays a MODULE_REGISTRY slug), so the routed set is explicit here.
const UNIT_CLOSURE_SLUGS = [
  'length-converter',
  'weight-converter',
  'volume-converter',
  'area-converter',
  'speed-converter',
  'power-converter',
  'pressure-converter',
  'temperature-converter',
  'time-converter',
  'data-size-converter',
  'cooking-measurement-converter',
  'fuel-consumption-converter',
  'paper-size-converter',
  'clothing-size-converter',
  'shoe-size-converter',
  'degree-radian-converter',
];

function routedUnitSlugs(): string[] {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/tools/modules/DynamicModuleWrapper.tsx'),
    'utf8',
  );
  const closureRe = /'([a-z0-9-]+)': dynamic\(\(\) => import\('@\/components\/tools\/modules\/shared\/UnitConverter'\)/g;
  return [...src.matchAll(closureRe)].map(m => m[1]);
}

describe('UnitConverter slug-closure contract', () => {
  it('routes exactly the 16 unit slugs via MODULE_REGISTRY and drops them from CONVERTER_CONFIG', () => {
    const routed = routedUnitSlugs().sort();
    expect(routed).toEqual(UNIT_CLOSURE_SLUGS.slice().sort());
    for (const slug of UNIT_CLOSURE_SLUGS) {
      expect(CONVERTER_CONFIG, `unit slug ${slug} still routed by CONVERTER_CONFIG`).not.toHaveProperty(slug);
    }
  });

  it('every routed unit closure resolves to a real UNIT_FAMILIES entry', () => {
    for (const slug of routedUnitSlugs()) {
      expect(UNIT_FAMILIES[slug], `slug ${slug} has no UNIT_FAMILIES entry (renders "Unknown converter" fallback)`).toBeDefined();
    }
  });

  it('migrated UNIT_FAMILIES entries are internally consistent', () => {
    for (const slug of UNIT_CLOSURE_SLUGS) {
      const def = UNIT_FAMILIES[slug];
      expect(def, `missing UNIT_FAMILIES entry for ${slug}`).toBeDefined();
      expect(typeof def!.title).toBe('string');
      expect(typeof def!.desc).toBe('string');
      expect(def!.units.length).toBeGreaterThan(1);
      const keys = def!.units.map(u => u.key);
      expect(new Set(keys).size, `duplicate unit key in ${slug}`).toBe(keys.length);
      expect(def!.customConvert ?? def!.multipliers, `${slug} needs customConvert or multipliers`).toBeDefined();
    }
  });
});

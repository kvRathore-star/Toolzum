// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { FORMAT_SLUGS } from '@/components/tools/modules/shared/FormatSerializerHub';
import { TRANSFORM_CONFIG } from '@/components/tools/modules/shared/textTransformConfig';
import { CONVERTER_CONFIG } from '@/components/tools/modules/shared/converterConfig';

// The 6 serializer slugs migrated to MODULE_REGISTRY slug closures.
// FORMAT_SLUGS is broader than this list (7 tabs — it also holds "json-to-code",
// which is slug-routed via MODULE_REGISTRY -> JsonToCode, not via CONFIG),
// so the routed set is explicit here.
const SERIALIZER_CLOSURE_SLUGS = [
  'yaml-json-converter',
  'json-to-yaml-converter',
  'ini-json-converter',
  'json-to-ini-converter',
  'toml-converter',
  'json-to-toml-converter',
];

function routedSerializerSlugs(): string[] {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/tools/modules/DynamicModuleWrapper.tsx'),
    'utf8',
  );
  const closureRe = /'([a-z0-9-]+)': dynamic\(\(\) => import\('@\/components\/tools\/modules\/shared\/FormatSerializerHub'\)/g;
  return [...src.matchAll(closureRe)].map(m => m[1]);
}

describe('FormatSerializerHub slug-closure contract', () => {
  it('routes exactly the 6 serializer slugs via MODULE_REGISTRY and drops them from CONVERTER_CONFIG', () => {
    const routed = routedSerializerSlugs().sort();
    expect(routed).toEqual(SERIALIZER_CLOSURE_SLUGS.slice().sort());
    for (const slug of SERIALIZER_CLOSURE_SLUGS) {
      expect(CONVERTER_CONFIG, `serializer slug ${slug} still routed by CONVERTER_CONFIG`).not.toHaveProperty(slug);
    }
  });

  it('every routed serializer closure resolves to a real TRANSFORM_CONFIG entry', () => {
    for (const slug of routedSerializerSlugs()) {
      expect(TRANSFORM_CONFIG[slug], `slug ${slug} has no TRANSFORM_CONFIG entry`).toBeDefined();
    }
  });

  it('every routed serializer closure is an in-app FORMAT_SLUGS tab', () => {
    const tabSet = new Set(FORMAT_SLUGS);
    for (const slug of routedSerializerSlugs()) {
      expect(tabSet, `slug ${slug} not rendered as a FormatSerializerHub tab`).toContain(slug);
    }
  });

  it('the json-to-code cross-listed tab stays registry-routed (not reachable via CONFIG)', () => {
    expect(FORMAT_SLUGS).toContain('json-to-code');
    expect(SERIALIZER_CLOSURE_SLUGS).not.toContain('json-to-code');
    expect(CONVERTER_CONFIG).not.toHaveProperty('json-to-code');
  });

  it('migrated TRANSFORM_CONFIG entries are internally consistent', () => {
    const seen = new Set<string>();
    for (const slug of SERIALIZER_CLOSURE_SLUGS) {
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

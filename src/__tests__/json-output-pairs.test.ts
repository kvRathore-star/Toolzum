// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { MODES } from '@/components/tools/modules/shared/JsonOutputConverter';
import { CONVERTER_CONFIG } from '@/components/tools/modules/shared/converterConfig';

// The 8 json-output slugs migrated to MODULE_REGISTRY slug closures.
// MODES is broader than this list (9 entries — it also holds the "json-formatter"
// mode, which is slug-routed via MODULE_REGISTRY -> JsonFormatter, not via CONFIG),
// so the routed set is explicit here.
const JSON_OUTPUT_CLOSURE_SLUGS = [
  'json-to-zod',
  'json-to-url-params',
  'json-flattener',
  'json-ld-generator',
  'json-schema-generator',
  'json-size-analyzer',
  'ndjson-to-json',
  'json-formatter-tool',
];

function routedJsonOutputSlugs(): string[] {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/tools/modules/DynamicModuleWrapper.tsx'),
    'utf8',
  );
  const closureRe = /'([a-z0-9-]+)': dynamic\(\(\) => import\('@\/components\/tools\/modules\/shared\/JsonOutputConverter'\)/g;
  return [...src.matchAll(closureRe)].map(m => m[1]);
}

describe('JsonOutputConverter slug-closure contract', () => {
  it('routes exactly the 8 json-output slugs via MODULE_REGISTRY and drops them from CONVERTER_CONFIG', () => {
    const routed = routedJsonOutputSlugs().sort();
    expect(routed).toEqual(JSON_OUTPUT_CLOSURE_SLUGS.slice().sort());
    for (const slug of JSON_OUTPUT_CLOSURE_SLUGS) {
      expect(CONVERTER_CONFIG, `json-output slug ${slug} still routed by CONVERTER_CONFIG`).not.toHaveProperty(slug);
    }
  });

  it('every routed json-output closure resolves to a real MODES entry', () => {
    for (const slug of routedJsonOutputSlugs()) {
      expect(MODES[slug], `slug ${slug} has no MODES entry (renders "Unknown JSON mode" fallback)`).toBeDefined();
    }
  });

  it('the json-formatter cross-listed mode stays registry-routed (not reachable via CONFIG)', () => {
    expect(MODES['json-formatter'], 'json-formatter mode must exist for the in-app hub tab').toBeDefined();
    expect(JSON_OUTPUT_CLOSURE_SLUGS).not.toContain('json-formatter');
    expect(CONVERTER_CONFIG).not.toHaveProperty('json-formatter');
  });

  it('migrated MODES entries are internally consistent', () => {
    const seen = new Set<string>();
    for (const slug of JSON_OUTPUT_CLOSURE_SLUGS) {
      const def = MODES[slug];
      expect(def, `missing MODES entry for ${slug}`).toBeDefined();
      expect(seen.has(def!.slug)).toBe(false);
      seen.add(def!.slug);
      expect(def!.slug).toBe(slug);
      expect(typeof def!.name).toBe('string');
      expect(typeof def!.transform).toBe('function');
    }
  });
});

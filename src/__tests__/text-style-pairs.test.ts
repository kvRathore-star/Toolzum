// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { CONVERTER_CONFIG } from '@/components/tools/modules/shared/converterConfig';
import { STYLING_SLUGS } from '@/components/tools/modules/shared/TextStylingConverter';

const TEXT_STYLE_CLOSURE_SLUGS = [...STYLING_SLUGS];

function routedTextStyleSlugs(): string[] {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/tools/modules/DynamicModuleWrapper.tsx'),
    'utf8',
  );
  const closureRe = /'([a-z0-9-]+)': dynamic\(\(\) => import\('@\/components\/tools\/modules\/shared\/TextStylingConverter'\)/g;
  return [...src.matchAll(closureRe)].map(m => m[1]);
}

describe('TextStylingConverter slug-closure contract', () => {
  it('routes exactly the STYLING_SLUGS via MODULE_REGISTRY and drops them from CONVERTER_CONFIG', () => {
    const routed = routedTextStyleSlugs().sort();
    expect(routed).toEqual(TEXT_STYLE_CLOSURE_SLUGS.slice().sort());
    for (const slug of TEXT_STYLE_CLOSURE_SLUGS) {
      expect(CONVERTER_CONFIG, `text-style slug ${slug} still routed by CONVERTER_CONFIG`).not.toHaveProperty(slug);
    }
  });

  it('text-style-generator is neither CONFIG-routed nor closure-routed (dead alias)', () => {
    expect(CONVERTER_CONFIG).not.toHaveProperty('text-style-generator');
    expect(routedTextStyleSlugs()).not.toContain('text-style-generator');
  });
});

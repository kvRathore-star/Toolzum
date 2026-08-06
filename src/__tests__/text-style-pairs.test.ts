// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
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
  it('routes exactly the STYLING_SLUGS via MODULE_REGISTRY', () => {
    const routed = routedTextStyleSlugs().sort();
    expect(routed).toEqual(TEXT_STYLE_CLOSURE_SLUGS.slice().sort());
  });

  it('text-style-generator is neither CONFIG-routed nor closure-routed (dead alias)', () => {
    expect(routedTextStyleSlugs()).not.toContain('text-style-generator');
  });
});

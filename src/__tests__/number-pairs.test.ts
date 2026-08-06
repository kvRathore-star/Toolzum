// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { MODES as NUMBER_MODES } from '@/components/tools/modules/shared/NumberWordsConverter';

const NUMBER_CLOSURE_SLUGS = ['number-to-words-converter'];

function routedNumberSlugs(): string[] {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/tools/modules/DynamicModuleWrapper.tsx'),
    'utf8',
  );
  const closureRe = /'([a-z0-9-]+)': dynamic\(\(\) => import\('@\/components\/tools\/modules\/shared\/NumberWordsConverter'\)/g;
  return [...src.matchAll(closureRe)].map(m => m[1]);
}

describe('NumberWordsConverter slug-closure contract', () => {
  it('routes exactly the number-to-words-converter slug via MODULE_REGISTRY', () => {
    const routed = routedNumberSlugs().sort();
    expect(routed).toEqual(NUMBER_CLOSURE_SLUGS.slice().sort());
  });

  it('the routed slug is a NumberWordsConverter MODES entry; roman-numeral-converter stays registry-routed', () => {
    const routed = routedNumberSlugs();
    for (const slug of routed) {
      expect(NUMBER_MODES, `slug ${slug} not a NumberWordsConverter MODES entry`).toHaveProperty(slug);
    }
    expect(NUMBER_MODES).toHaveProperty('roman-numeral-converter');
    expect(routed).not.toContain('roman-numeral-converter');
  });
});

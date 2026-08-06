// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { MODES as COLOR_MODES } from '@/components/tools/modules/shared/ColorConverter';

const COLOR_CLOSURE_SLUGS = ['color-converter', 'hex-to-rgb-converter'];

function routedColorSlugs(): string[] {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/tools/modules/DynamicModuleWrapper.tsx'),
    'utf8',
  );
  const closureRe = /'([a-z0-9-]+)': dynamic\(\(\) => import\('@\/components\/tools\/modules\/shared\/ColorConverter'\)/g;
  return [...src.matchAll(closureRe)].map(m => m[1]);
}

describe('ColorConverter slug-closure contract', () => {
  it('routes exactly the 2 color slugs via MODULE_REGISTRY', () => {
    const routed = routedColorSlugs().sort();
    expect(routed).toEqual(COLOR_CLOSURE_SLUGS.slice().sort());
  });

  it('every routed color slug is a ColorConverter MODES entry', () => {
    for (const slug of routedColorSlugs()) {
      expect(COLOR_MODES, `slug ${slug} not a ColorConverter MODES entry`).toHaveProperty(slug);
    }
  });
});

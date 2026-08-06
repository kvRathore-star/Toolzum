// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { HUB_DESCRIPTIONS } from '@/components/tools/modules/shared/hubDescriptions';

const WRAPPER_PATH = path.resolve(
  process.cwd(),
  'src/components/tools/modules/DynamicModuleWrapper.tsx',
);

function closurePassedSlugs(): string[] {
  const src = fs.readFileSync(WRAPPER_PATH, 'utf8');
  return [...src.matchAll(/HUB_DESCRIPTIONS\['([a-z0-9-]+)'\]/g)].map(m => m[1]);
}

describe('HUB_DESCRIPTIONS parity vs MODULE_REGISTRY closures', () => {
  it('every HUB_DESCRIPTIONS key is passed by a closure in DynamicModuleWrapper', () => {
    const mapKeys = Object.keys(HUB_DESCRIPTIONS).sort();
    const closureSlugs = closurePassedSlugs().sort();
    expect(mapKeys, 'every HUB_DESCRIPTIONS key must be passed by a MODULE_REGISTRY closure').toEqual(
      closureSlugs,
    );
    // and no duplicate closure references
    expect(new Set(closureSlugs).size).toBe(closureSlugs.length);
  });
});

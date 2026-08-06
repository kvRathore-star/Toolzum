// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { CONVERTER_CONFIG } from '@/components/tools/modules/shared/converterConfig';
import { HUB_DESCRIPTIONS } from '@/components/tools/modules/shared/hubDescriptions';

const WRAPPER_PATH = path.resolve(
  process.cwd(),
  'src/components/tools/modules/DynamicModuleWrapper.tsx',
);

function closurePassedSlugs(): string[] {
  const src = fs.readFileSync(WRAPPER_PATH, 'utf8');
  return [...src.matchAll(/HUB_DESCRIPTIONS\['([a-z0-9-]+)'\]/g)].map(m => m[1]);
}

describe('HUB_DESCRIPTIONS parity vs CONVERTER_CONFIG', () => {
  it('byte-matches the description for every slug still in CONVERTER_CONFIG', () => {
    const mismatches: string[] = [];
    for (const [slug, entry] of Object.entries(CONVERTER_CONFIG)) {
      if (entry.description === undefined) continue;
      const mapValue = HUB_DESCRIPTIONS[slug];
      if (mapValue !== entry.description) {
        mismatches.push(
          `${slug}: map ${mapValue === undefined ? 'MISSING' : JSON.stringify(mapValue.slice(0, 60))} ` +
          `!= config ${JSON.stringify(entry.description.slice(0, 60))}`,
        );
      }
    }
    expect(mismatches, mismatches.join('\n')).toEqual([]);
  });

  it('every HUB_DESCRIPTIONS key is either a current CONFIG slug or a closure-passed slug', () => {
    const mapKeys = Object.keys(HUB_DESCRIPTIONS).sort();
    const configKeys = Object.keys(CONVERTER_CONFIG).sort();
    const closureSlugs = closurePassedSlugs().sort();
    const mapOnly = mapKeys.filter(k => !configKeys.includes(k));
    expect(mapOnly, 'map keys not in CONFIG should exactly be the closure-passed slugs').toEqual(
      closureSlugs,
    );
    // and no duplicate closure references
    expect(new Set(closureSlugs).size).toBe(closureSlugs.length);
  });
});

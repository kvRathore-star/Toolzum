// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { DESCRIPTIONS as AUDIO_DESCRIPTIONS } from '@/components/tools/modules/shared/AudioFormatConverter';
import { DESCRIPTIONS as IMAGE_DESCRIPTIONS } from '@/components/tools/modules/shared/ImageCatchAllConverter';
import { DESCRIPTIONS as VIDEO_DESCRIPTIONS } from '@/components/tools/modules/shared/VideoFormatConverter';
import { DESCRIPTIONS as V2A_DESCRIPTIONS } from '@/components/tools/modules/shared/VideoToAudioConverter';

const WRAPPER_PATH = path.resolve(
  process.cwd(),
  'src/components/tools/modules/DynamicModuleWrapper.tsx',
);

function routedSlugs(modulePath: string): string[] {
  const src = fs.readFileSync(WRAPPER_PATH, 'utf8');
  const escaped = modulePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`'([a-z0-9-]+)': dynamic\\(\\(\\) => import\\('${escaped}'\\)`, 'g');
  return [...src.matchAll(re)].map(m => m[1]);
}

const HUB_MODULES: Array<[string, string, Record<string, string>]> = [
  ['AudioFormatConverter', '@/components/tools/modules/shared/AudioFormatConverter', AUDIO_DESCRIPTIONS],
  ['ImageCatchAllConverter', '@/components/tools/modules/shared/ImageCatchAllConverter', IMAGE_DESCRIPTIONS],
  ['VideoFormatConverter', '@/components/tools/modules/shared/VideoFormatConverter', VIDEO_DESCRIPTIONS],
  ['VideoToAudioConverter', '@/components/tools/modules/shared/VideoToAudioConverter', V2A_DESCRIPTIONS],
];

describe('hub-owned DESCRIPTIONS parity vs MODULE_REGISTRY closures', () => {
  it('every closure slug has a DESCRIPTIONS entry in its hub (banner never lost)', () => {
    for (const [name, modPath, map] of HUB_MODULES) {
      const routed = routedSlugs(modPath);
      for (const slug of routed) {
        expect(map, `${name} slug ${slug} missing from hub DESCRIPTIONS`).toHaveProperty(slug);
      }
    }
  });

  it('every DESCRIPTIONS key is a real closure slug in its hub (no orphan banner data)', () => {
    for (const [name, modPath, map] of HUB_MODULES) {
      const routed = new Set(routedSlugs(modPath));
      const orphans = Object.keys(map).filter(s => !routed.has(s));
      expect(
        orphans.map(s => `${name}: DESCRIPTIONS key ${s} has no closure`),
      ).toEqual([]);
    }
  });

  it('total DESCRIPTIONS entries is stable at 208', () => {
    const total =
      Object.keys(AUDIO_DESCRIPTIONS).length +
      Object.keys(IMAGE_DESCRIPTIONS).length +
      Object.keys(VIDEO_DESCRIPTIONS).length +
      Object.keys(V2A_DESCRIPTIONS).length;
    expect(total).toBe(208);
  });
});

// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { CONVERTER_CONFIG } from '@/components/tools/modules/shared/converterConfig';
import { HUB_DESCRIPTIONS } from '@/components/tools/modules/shared/hubDescriptions';
import { FORMAT_PAIRS } from '@/components/tools/modules/shared/AudioFormatConverter';

// Slugs with no own FORMAT_PAIRS entry; the hub's `|| FORMAT_PAIRS[0]` fallback
// (mp3-to-wav) applies. audio-converter is the consolidated hub; the six
// m4a<->wma/opus/aiff pairs are simply absent from FORMAT_PAIRS. Both cases are
// pre-existing ConverterRouter behavior (same component + slug prop), preserved
// byte-identically by the closures.
const FALLBACK_SLUGS = [
  'audio-converter', 'm4a-to-wma', 'm4a-to-opus', 'm4a-to-aiff',
  'wma-to-m4a', 'opus-to-m4a', 'aiff-to-m4a',
];

const AUDIO_FORMAT_SLUGS = [
  'audio-converter', 'mp3-to-wav', 'wav-to-mp3', 'flac-to-mp3', 'ogg-to-mp3', 'm4a-to-mp3',
  'aac-to-mp3', 'wma-to-mp3', 'opus-to-mp3', 'aiff-to-mp3', 'mp3-to-flac', 'mp3-to-ogg',
  'mp3-to-m4a', 'mp3-to-aac', 'mp3-to-wma', 'mp3-to-opus', 'mp3-to-aiff', 'wav-to-flac',
  'wav-to-ogg', 'wav-to-m4a', 'wav-to-aac', 'wav-to-wma', 'wav-to-opus', 'wav-to-aiff',
  'flac-to-wav', 'flac-to-ogg', 'flac-to-m4a', 'flac-to-aac', 'ogg-to-wav', 'ogg-to-flac',
  'ogg-to-m4a', 'ogg-to-aac', 'm4a-to-wav', 'm4a-to-flac', 'm4a-to-ogg', 'm4a-to-aac',
  'aac-to-wav', 'aac-to-flac', 'aac-to-ogg', 'aac-to-m4a', 'aac-to-opus', 'aac-to-wma',
  'aac-to-aiff', 'flac-to-wma', 'flac-to-opus', 'flac-to-aiff', 'ogg-to-wma', 'ogg-to-opus',
  'ogg-to-aiff', 'm4a-to-wma', 'm4a-to-opus', 'm4a-to-aiff', 'wma-to-wav', 'wma-to-flac',
  'wma-to-ogg', 'wma-to-m4a', 'wma-to-aac', 'wma-to-opus', 'wma-to-aiff', 'opus-to-wav',
  'opus-to-flac', 'opus-to-ogg', 'opus-to-m4a', 'opus-to-aac', 'opus-to-wma', 'opus-to-aiff',
  'aiff-to-wav', 'aiff-to-flac', 'aiff-to-ogg', 'aiff-to-m4a', 'aiff-to-aac', 'aiff-to-wma',
  'aiff-to-opus',
];

function routedSlugs(modulePath: string): string[] {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/tools/modules/DynamicModuleWrapper.tsx'),
    'utf8',
  );
  const escaped = modulePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`'([a-z0-9-]+)': dynamic\\(\\(\\) => import\\('${escaped}'\\)`, 'g');
  return [...src.matchAll(re)].map(m => m[1]);
}

describe('audio hub slug-closure contract', () => {
  it('routes every audio-format slug via AudioFormatConverter and drops all from CONVERTER_CONFIG', () => {
    const routed = routedSlugs('@/components/tools/modules/shared/AudioFormatConverter').sort();
    expect(routed).toEqual(AUDIO_FORMAT_SLUGS.slice().sort());
    for (const slug of AUDIO_FORMAT_SLUGS) {
      expect(CONVERTER_CONFIG, `audio slug ${slug} still routed by CONVERTER_CONFIG`).not.toHaveProperty(slug);
    }
  });

  it('every audio slug has a HUB_DESCRIPTIONS entry (banner preserved)', () => {
    for (const slug of AUDIO_FORMAT_SLUGS) {
      expect(HUB_DESCRIPTIONS, `audio slug ${slug} missing from HUB_DESCRIPTIONS`).toHaveProperty(slug);
      expect(HUB_DESCRIPTIONS[slug].length).toBeGreaterThan(10);
    }
  });

  it('every routed audio slug resolves to its own FORMAT_PAIRS entry or the documented fallback', () => {
    const pairSlugs = FORMAT_PAIRS.map(p => p.slug);
    const noOwnEntry = AUDIO_FORMAT_SLUGS.filter(s => !pairSlugs.includes(s));
    expect(noOwnEntry.slice().sort(), 'audio slugs without their own FORMAT_PAIRS entry').toEqual(
      FALLBACK_SLUGS.slice().sort(),
    );
    // the fallback target is FORMAT_PAIRS[0], the same pair ConverterRouter produced
    expect(FORMAT_PAIRS[0].slug).toBe('mp3-to-wav');
  });
});

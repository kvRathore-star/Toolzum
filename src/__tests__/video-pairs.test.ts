// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { DESCRIPTIONS as VIDEO_FORMAT_DESCRIPTIONS } from '@/components/tools/modules/shared/VideoFormatConverter';
import { DESCRIPTIONS as VIDEO_TO_AUDIO_DESCRIPTIONS } from '@/components/tools/modules/shared/VideoToAudioConverter';

const ALL_DESCRIPTIONS = { ...VIDEO_FORMAT_DESCRIPTIONS, ...VIDEO_TO_AUDIO_DESCRIPTIONS };

const VIDEO_FORMAT_SLUGS = [
  'video-converter', 'video-converter-tool',
  'mkv-to-mp4', 'mov-to-mp4', 'webm-to-mp4', 'avi-to-mp4', 'mp4-to-mkv', 'mp4-to-mov',
  'mkv-to-mov', 'mov-to-mkv', 'mkv-to-webm', 'mkv-to-avi', 'mp4-to-webm', 'mp4-to-avi',
  'mov-to-webm', 'mov-to-avi', 'webm-to-mkv', 'webm-to-mov', 'webm-to-avi', 'avi-to-mkv',
  'avi-to-mov', 'avi-to-webm',
];

const VIDEO_TO_AUDIO_SLUGS = ['mp4-to-mp3', 'mov-to-mp3', 'webm-to-mp3'];

const ALL_SLUGS = [...VIDEO_FORMAT_SLUGS, ...VIDEO_TO_AUDIO_SLUGS];

function routedSlugs(modulePath: string): string[] {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/tools/modules/DynamicModuleWrapper.tsx'),
    'utf8',
  );
  const escaped = modulePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`'([a-z0-9-]+)': dynamic\\(\\(\\) => import\\('${escaped}'\\)`, 'g');
  return [...src.matchAll(re)].map(m => m[1]);
}

describe('video hub slug-closure contract', () => {
  it('routes every video-format slug via VideoFormatConverter', () => {
    const routed = routedSlugs('@/components/tools/modules/shared/VideoFormatConverter').sort();
    expect(routed).toEqual(VIDEO_FORMAT_SLUGS.slice().sort());
  });

  it('routes every video-to-audio slug via VideoToAudioConverter', () => {
    const routed = routedSlugs('@/components/tools/modules/shared/VideoToAudioConverter').sort();
    expect(routed).toEqual(VIDEO_TO_AUDIO_SLUGS.slice().sort());
  });

  it('every video slug has a hub-owned DESCRIPTIONS entry (banner preserved)', () => {
    for (const slug of ALL_SLUGS) {
      expect(ALL_DESCRIPTIONS, `video slug ${slug} missing from hub DESCRIPTIONS`).toHaveProperty(slug);
      expect(ALL_DESCRIPTIONS[slug].length).toBeGreaterThan(10);
    }
  });
});

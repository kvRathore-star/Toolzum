// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { HUB_DESCRIPTIONS } from '@/components/tools/modules/shared/hubDescriptions';
import { FORMAT_PAIRS } from '@/components/tools/modules/shared/ImageCatchAllConverter';

// All 110 image-format slugs in CONVERTER_CONFIG order (from before the split).
const IMAGE_FORMAT_SLUGS = [
  'image-format-converter', 'png-to-jpg', 'jpg-to-png', 'png-to-webp', 'jpg-to-webp',
  'webp-to-png', 'heic-to-jpg', 'heic-to-png', 'png-to-avif', 'jpg-to-avif', 'webp-to-jpg',
  'svg-to-png', 'svg-to-jpg', 'png-to-gif', 'jpg-to-gif', 'webp-to-gif', 'bmp-to-jpg',
  'bmp-to-png', 'tiff-to-jpg', 'tiff-to-png', 'gif-to-jpg', 'gif-to-png', 'ico-to-png',
  'jxl-to-png', 'jxl-to-jpg', 'avif-to-png', 'avif-to-jpg', 'bmp-to-webp', 'bmp-to-gif',
  'bmp-to-avif', 'gif-to-webp', 'gif-to-avif', 'heic-to-webp', 'heic-to-avif', 'heic-to-gif',
  'ico-to-jpg', 'ico-to-webp', 'jxl-to-webp', 'jxl-to-gif', 'png-to-jxl', 'jpg-to-jxl',
  'svg-to-webp', 'svg-to-avif', 'svg-to-gif', 'tiff-to-webp', 'tiff-to-gif', 'tiff-to-avif',
  'webp-to-avif', 'png-to-heic', 'png-to-bmp', 'png-to-tiff', 'png-to-ico', 'jpg-to-heic',
  'jpg-to-svg', 'jpg-to-bmp', 'jpg-to-tiff', 'jpg-to-ico', 'webp-to-heic', 'webp-to-svg',
  'webp-to-bmp', 'webp-to-tiff', 'webp-to-ico', 'webp-to-jxl', 'heic-to-svg', 'heic-to-bmp',
  'heic-to-tiff', 'heic-to-ico', 'heic-to-jxl', 'avif-to-webp', 'avif-to-heic', 'avif-to-svg',
  'avif-to-bmp', 'avif-to-tiff', 'avif-to-gif', 'avif-to-ico', 'avif-to-jxl', 'svg-to-heic',
  'svg-to-bmp', 'svg-to-tiff', 'svg-to-ico', 'svg-to-jxl', 'bmp-to-heic', 'bmp-to-svg',
  'bmp-to-tiff', 'bmp-to-ico', 'bmp-to-jxl', 'tiff-to-heic', 'tiff-to-svg', 'tiff-to-bmp',
  'tiff-to-ico', 'tiff-to-jxl', 'gif-to-heic', 'gif-to-svg', 'gif-to-bmp', 'gif-to-tiff',
  'gif-to-ico', 'gif-to-jxl', 'ico-to-heic', 'ico-to-avif', 'ico-to-svg', 'ico-to-bmp',
  'ico-to-tiff', 'ico-to-gif', 'ico-to-jxl', 'jxl-to-heic', 'jxl-to-avif', 'jxl-to-svg',
  'jxl-to-bmp', 'jxl-to-tiff', 'jxl-to-ico',
];

// image-format-converter is the only slug without its own FORMAT_PAIRS entry
// (the hub's || FORMAT_PAIRS[0] fallback applies — pre-existing ConverterRouter
// behavior, preserved by the closures). png-to-svg lives in FORMAT_PAIRS but is
// intentionally NOT here: it was already a standalone MODULE_REGISTRY slug
// (PngToSvg, ssr:false) and never routed via ConverterRouter.
const FALLBACK_SLUGS = ['image-format-converter'];

function routedSlugs(modulePath: string): string[] {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/tools/modules/DynamicModuleWrapper.tsx'),
    'utf8',
  );
  const escaped = modulePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`'([a-z0-9-]+)': dynamic\\(\\(\\) => import\\('${escaped}'\\)`, 'g');
  return [...src.matchAll(re)].map(m => m[1]);
}

describe('image hub slug-closure contract', () => {
  it('every migrated image slug is closure-routed via ImageCatchAllConverter', () => {
    const routed = routedSlugs('@/components/tools/modules/shared/ImageCatchAllConverter');
    const canonical = new Set(IMAGE_FORMAT_SLUGS);
    for (const slug of routed) {
      expect(canonical.has(slug), `image slug ${slug} routed but not in canonical 110`).toBe(true);
    }
  });

  it('every migrated image slug has a HUB_DESCRIPTIONS entry (banner preserved)', () => {
    const routed = routedSlugs('@/components/tools/modules/shared/ImageCatchAllConverter');
    for (const slug of routed) {
      expect(HUB_DESCRIPTIONS, `image slug ${slug} missing from HUB_DESCRIPTIONS`).toHaveProperty(slug);
      expect(HUB_DESCRIPTIONS[slug].length).toBeGreaterThan(10);
    }
  });

  it('image-format-converter is the only routed slug without its own FORMAT_PAIRS entry', () => {
    const routed = routedSlugs('@/components/tools/modules/shared/ImageCatchAllConverter');
    const pairSlugs = FORMAT_PAIRS.map(p => p.slug);
    const noOwnEntry = routed.filter(s => !pairSlugs.includes(s)).sort();
    expect(noOwnEntry, 'routed image slugs without their own FORMAT_PAIRS entry').toEqual(
      FALLBACK_SLUGS.slice().sort(),
    );
    // the fallback target is FORMAT_PAIRS[0], the same pair ConverterRouter produced
    expect(FORMAT_PAIRS[0].slug).toBe('png-to-jpg');
    // png-to-svg stays untouched: it is in FORMAT_PAIRS but routed separately via PngToSvg
    expect(routed).not.toContain('png-to-svg');
  });
});

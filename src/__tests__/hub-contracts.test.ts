// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { TRANSFORM_CONFIG } from '@/components/tools/modules/shared/textTransformConfig';
import { CSS_PREPROCESSOR_SLUGS } from '@/components/tools/modules/shared/CssPreprocessorHub';
import { FORMAT_SLUGS } from '@/components/tools/modules/shared/FormatSerializerHub';
import { MODES as HTML_TEXT_MODES } from '@/components/tools/modules/shared/HtmlTextHub';
import {
  FORMAT_PAIRS as IMAGE_PAIRS,
  FORMATS as IMAGE_FORMATS,
} from '@/components/tools/modules/shared/ImageCatchAllConverter';
import { FORMAT_PAIRS as DOC_PAIRS } from '@/components/tools/modules/shared/DocumentFormatConverter';
import { SLUG_MAP } from '@/components/tools/modules/converter/DataConverter';

function sorted(list: string[]): string[] {
  return [...list].sort();
}

describe('hub contract: every routed slug resolves to a real hub mode', () => {
  it('HtmlTextHub — every routed slug is a MODULES tab with a TRANSFORM_CONFIG entry; pairs contract lives in html-text-pairs.test.ts', () => {
    for (const mode of HTML_TEXT_MODES) {
      expect(TRANSFORM_CONFIG[mode], `html-text tab ${mode} has no transform config`).toBeDefined();
    }
  });

  it('CssPreprocessorHub — every routed slug is a CSS_PREPROCESSOR_SLUGS tab with a TRANSFORM_CONFIG entry; pairs contract lives in css-preprocessor-pairs.test.ts', () => {
    for (const mode of CSS_PREPROCESSOR_SLUGS) {
      expect(TRANSFORM_CONFIG[mode], `css-preprocessor tab ${mode} has no transform config`).toBeDefined();
    }
  });

  it('FormatSerializerHub — every routed slug is a FORMAT_SLUGS tab with a TRANSFORM_CONFIG entry; pairs contract lives in serializer-pairs.test.ts', () => {
    for (const mode of FORMAT_SLUGS) {
      expect(TRANSFORM_CONFIG[mode], `serializer tab ${mode} has no transform config`).toBeDefined();
    }
  });

  it('DataConverter — every routed slug is a valid SLUG_MAP pair; pairs contract lives in data-pairs.test.ts', () => {
    const formats = ['JSON', 'CSV', 'XML', 'YAML', 'TSV'];
    for (const [slug, [from, to]] of Object.entries(SLUG_MAP)) {
      expect(formats, `SLUG_MAP ${slug} has invalid from ${from}`).toContain(from);
      expect(formats, `SLUG_MAP ${slug} has invalid to ${to}`).toContain(to);
      expect(slug).toBe(`${from.toLowerCase()}-to-${to.toLowerCase()}`);
    }
  });

  it('DocumentFormatConverter — every routed slug is a FORMAT_PAIRS entry; pairs contract lives in document-pairs.test.ts', () => {
    // All 12 document slugs now route via MODULE_REGISTRY slug closures; epub-to-pdf
    // remains a MODULE_REGISTRY slug (EpubToPdf). FORMAT_PAIRS validity is asserted
    // in document-pairs.test.ts.
    const pairSlugs = new Set(DOC_PAIRS.map((p) => p.slug));
    expect(pairSlugs.has('epub-to-pdf')).toBe(true);
    expect(pairSlugs.has('word-to-pdf')).toBe(true);
  });

  it('ImageCatchAllConverter — every routed slug is a FORMAT_PAIRS entry (except the fallback); pairs contract lives in image-pairs.test.ts', () => {
    // image-format-converter is the only FORMAT_PAIRS fallback slug; asserted in
    // image-pairs.test.ts. png-to-svg stays a standalone PngToSvg slug, not here.
    const pairSlugs = new Set(IMAGE_PAIRS.map((p) => p.slug));
    expect(pairSlugs.has('png-to-jpg')).toBe(true);
    expect(pairSlugs.has('image-format-converter')).toBe(false);
  });

  it('ImageCatchAllConverter — FORMAT_PAIRS are internally consistent (valid formats, matching slug, unique)', () => {
    const seen = new Set<string>();
    for (const p of IMAGE_PAIRS) {
      expect(seen.has(p.slug), `duplicate FORMAT_PAIRS slug ${p.slug}`).toBe(false);
      seen.add(p.slug);
      expect(IMAGE_FORMATS[p.input], `pair ${p.slug} has unknown input format ${p.input}`).toBeDefined();
      expect(IMAGE_FORMATS[p.output], `pair ${p.slug} has unknown output format ${p.output}`).toBeDefined();
      expect(p.slug).toBe(`${p.input}-to-${p.output}`);
    }
  });
});

// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { CONVERTER_CONFIG } from '@/components/tools/modules/shared/converterConfig';
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
import { TOOL_REDIRECTS } from '@/registry/tools';

function categorySlugs(category: string): string[] {
  return Object.keys(CONVERTER_CONFIG)
    .filter((s) => CONVERTER_CONFIG[s].category === category)
    .sort();
}

function sorted(list: string[]): string[] {
  return [...list].sort();
}

describe('hub contract: every routed slug resolves to a real hub mode', () => {
  it('HtmlTextHub — html-text category matches its tabs exactly and each tab has a transform', () => {
    expect(categorySlugs('html-text')).toEqual(sorted(HTML_TEXT_MODES));
    for (const mode of HTML_TEXT_MODES) {
      expect(TRANSFORM_CONFIG[mode], `html-text tab ${mode} has no transform config`).toBeDefined();
    }
  });

  it('CssPreprocessorHub — css-preprocessor category matches its tabs exactly and each tab has a transform', () => {
    expect(categorySlugs('css-preprocessor')).toEqual(sorted(CSS_PREPROCESSOR_SLUGS));
    for (const mode of CSS_PREPROCESSOR_SLUGS) {
      expect(TRANSFORM_CONFIG[mode], `css-preprocessor tab ${mode} has no transform config`).toBeDefined();
    }
  });

  it('FormatSerializerHub — every serializer slug is a tab and every tab has a transform', () => {
    const serializer = categorySlugs('serializer');
    for (const slug of serializer) {
      expect(FORMAT_SLUGS, `serializer slug ${slug} missing from hub tabs`).toContain(slug);
    }
    for (const mode of FORMAT_SLUGS) {
      expect(TRANSFORM_CONFIG[mode], `serializer tab ${mode} has no transform config`).toBeDefined();
    }
  });

  it('DataConverter — data category routes exactly the SLUG_MAP pairs that are not redirect-owned, and all pairs are valid', () => {
    const formats = ['JSON', 'CSV', 'XML', 'YAML', 'TSV'];
    const routablePairs = Object.keys(SLUG_MAP)
      .filter((s) => !TOOL_REDIRECTS[s])
      .sort();
    expect(categorySlugs('data')).toEqual(routablePairs);
    for (const [slug, [from, to]] of Object.entries(SLUG_MAP)) {
      expect(formats, `SLUG_MAP ${slug} has invalid from ${from}`).toContain(from);
      expect(formats, `SLUG_MAP ${slug} has invalid to ${to}`).toContain(to);
      expect(slug).toBe(`${from.toLowerCase()}-to-${to.toLowerCase()}`);
    }
  });

  it('DocumentFormatConverter — fully migrated to MODULE_REGISTRY (no CONVERTER_CONFIG document routes); pairs contract lives in document-pairs.test.ts', () => {
    // All 12 document slugs now route via MODULE_REGISTRY slug closures; epub-to-pdf
    // remains a MODULE_REGISTRY slug (EpubToPdf). FORMAT_PAIRS validity is asserted
    // in document-pairs.test.ts.
    expect(categorySlugs('document')).toEqual([]);
    const pairSlugs = new Set(DOC_PAIRS.map((p) => p.slug));
    expect(pairSlugs.has('epub-to-pdf')).toBe(true);
    expect(pairSlugs.has('word-to-pdf')).toBe(true);
  });

  it('ImageCatchAllConverter — every image-format slug is a known pair except the intentional catch-all', () => {
    const imageSlugs = categorySlugs('image-format');
    const pairSlugs = new Set(IMAGE_PAIRS.map((p) => p.slug));
    const fallbackOnly = ['image-format-converter'];
    const unexpectedFallbacks = imageSlugs.filter((s) => !pairSlugs.has(s) && !fallbackOnly.includes(s));
    expect(unexpectedFallbacks, `image-format slugs missing from FORMAT_PAIRS: ${unexpectedFallbacks.join(', ')}`).toEqual([]);
    expect(imageSlugs).toContain('image-format-converter');
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

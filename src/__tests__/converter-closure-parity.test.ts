import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';

const nav = vi.hoisted(() => ({ slug: 'smoke' }));

vi.mock('next/navigation', () => ({
  useParams: () => ({ tool: nav.slug, category: 'smoke' }),
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {}, back: () => {} }),
  usePathname: () => '/smoke',
  redirect: () => { throw new Error('redirect called'); },
  permanentRedirect: () => { throw new Error('permanentRedirect called'); },
}));

vi.mock('next/image', () => {
  function NextImageMock() { return React.createElement('img'); }
  return { __esModule: true, default: NextImageMock };
});

vi.mock('next/link', () => {
  function NextLinkMock({ href, children }: { href?: unknown; children?: unknown }) {
    return React.createElement('a', { href: String(href ?? '') }, children as React.ReactNode);
  }
  return { __esModule: true, default: NextLinkMock };
});

vi.mock('react-hot-toast', () => {
  const noop = () => 'smoke-noop-toast';
  const toast = new Proxy(noop, { get: () => noop, apply: () => noop() });
  return { __esModule: true, default: toast, toast };
});

vi.mock('@ffmpeg/ffmpeg', () => {
  class FFmpeg {
    loaded = false;
    on() {} off() {} exec() {} writeFile() {} readFile() {} deleteFile() {} load() {} terminate() {}
  }
  return { FFmpeg };
});

vi.mock('@ffmpeg/util', () => ({
  toBlobURL: async () => 'blob:mock',
  fetchFile: async (input: unknown) => input,
}));

vi.mock('heic2any', () => ({ __esModule: true, default: async () => new Blob(['smoke']) }));

vi.mock('openpgp', () => ({
  generateKey: async () => ({ privateKey: 'smoke', publicKey: 'smoke', revocationCertificate: '' }),
  readKey: async () => ({}),
  createMessage: async () => ({}),
  encrypt: async () => ({}),
  decrypt: async () => ({}),
  createCleartextMessage: async () => ({}),
  sign: async () => ({}),
  verify: async () => ({}),
}));

describe('Phase 2: closure-wrapper render parity (old ConverterRouter path vs direct hub + description)', () => {
  it('renders byte-identical HTML for every CONVERTER_CONFIG slug', async () => {
    const { CONVERTER_CONFIG } = await import('@/components/tools/modules/shared/converterConfig');
    const { default: ConverterRouter } = await import('@/components/tools/modules/converter/ConverterRouter');
    const { ErrorBoundary } = await import('@/components/ErrorBoundary');
    const { default: VideoFormatConverter } = await import('@/components/tools/modules/shared/VideoFormatConverter');
    const { default: VideoToAudioConverter } = await import('@/components/tools/modules/shared/VideoToAudioConverter');
    const { default: AudioFormatConverter } = await import('@/components/tools/modules/shared/AudioFormatConverter');
    const { default: ImageCatchAllConverter } = await import('@/components/tools/modules/shared/ImageCatchAllConverter');
    const { DataConverterFromSlug } = await import('@/components/tools/modules/converter/DataConverter');
    const { default: DocumentFormatConverter } = await import('@/components/tools/modules/shared/DocumentFormatConverter');
    const { default: TextTransformConverter } = await import('@/components/tools/modules/shared/TextTransformConverter');
    const { default: HtmlTextHub } = await import('@/components/tools/modules/shared/HtmlTextHub');
    const { default: TextBinaryHub } = await import('@/components/tools/modules/shared/TextBinaryHub');
    const { default: CssPreprocessorHub } = await import('@/components/tools/modules/shared/CssPreprocessorHub');
    const { default: FormatSerializerHub } = await import('@/components/tools/modules/shared/FormatSerializerHub');
    const { default: JsonOutputConverter } = await import('@/components/tools/modules/shared/JsonOutputConverter');
    const { default: CsvHubConverter } = await import('@/components/tools/modules/shared/CsvHubConverter');
    const { default: TextStylingConverter } = await import('@/components/tools/modules/shared/TextStylingConverter');
    const { default: UnitConverter } = await import('@/components/tools/modules/shared/UnitConverter');
    const { default: ImportToCsvConverter } = await import('@/components/tools/modules/shared/ImportToCsvConverter');
    const { default: ColorConverter } = await import('@/components/tools/modules/shared/ColorConverter');
    const { default: NumberWordsConverter } = await import('@/components/tools/modules/shared/NumberWordsConverter');
    const { default: ToonConverter } = await import('@/components/tools/modules/converter/DataFormatTools');
    const COMPONENT_MAP: Record<string, React.ComponentType<{ slug: string; description?: string }>> = {
      'video-format': VideoFormatConverter,
      'video-to-audio': VideoToAudioConverter,
      'audio-format': AudioFormatConverter,
      'image-format': ImageCatchAllConverter,
      'data': DataConverterFromSlug,
      'document': DocumentFormatConverter,
      'text-transform': TextTransformConverter,
      'html-text': HtmlTextHub,
      'text-binary': TextBinaryHub,
      'css-preprocessor': CssPreprocessorHub,
      'serializer': FormatSerializerHub,
      'json-output': JsonOutputConverter,
      'csv-output': CsvHubConverter,
      'text-style': TextStylingConverter,
      'unit': UnitConverter,
      'import-to-csv': ImportToCsvConverter,
      'color': ColorConverter,
      'number': NumberWordsConverter,
      'toon': ToonConverter,
    };

    const mismatches: string[] = [];
    const slugList = Object.keys(CONVERTER_CONFIG);
    for (const slug of slugList) {
      nav.slug = slug;
      const config = CONVERTER_CONFIG[slug];
      const Hub = COMPONENT_MAP[config.category];
      try {
        const oldHtml = renderToString(React.createElement(ConverterRouter, { slug }));
        const newHtml = renderToString(
          React.createElement(
            ErrorBoundary,
            null,
            React.createElement(Hub, { slug, description: config.description }),
          ),
        );
        if (oldHtml !== newHtml) {
          let i = 0;
          while (i < oldHtml.length && i < newHtml.length && oldHtml[i] === newHtml[i]) i++;
          mismatches.push(
            `${slug} (${config.category}): diff at char ${i}; old len ${oldHtml.length}, new len ${newHtml.length}\n` +
            `  old ...${oldHtml.slice(Math.max(0, i - 60), i + 60)}\n` +
            `  new ...${newHtml.slice(Math.max(0, i - 60), i + 60)}`,
          );
        }
      } catch (e) {
        mismatches.push(`${slug} (${config.category}): THREW ${(e as Error).message.split('\n')[0]}`);
      }
    }
    console.log(`checked ${slugList.length} converter slugs`);
    expect(mismatches, mismatches.join('\n')).toEqual([]);
  }, 180000);
});

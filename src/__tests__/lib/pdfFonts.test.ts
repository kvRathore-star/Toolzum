import { describe, it, expect } from 'vitest';
import { detectFontFamily, detectBold, PDF_FONTS, faceUrl, fontCss, fontDef, classicFonts, type PdfFont } from '@/lib/pdfFonts';

describe('font list (10 families × 4 faces)', () => {
  it('ships 10 unique families with unique picker labels', () => {
    expect(PDF_FONTS).toHaveLength(10);
    expect(new Set(PDF_FONTS.map((f) => f.id)).size).toBe(10);
    expect(new Set(PDF_FONTS.map((f) => f.label)).size).toBe(10);
    expect(new Set(PDF_FONTS.map((f) => f.family)).size).toBe(10);
  });

  it('classic trio is exactly sans/serif/mono (what retype detection maps into)', () => {
    expect(classicFonts().map((f) => f.id)).toEqual(['sans', 'serif', 'mono']);
    expect(detectFontFamily('Arial')).toBe('sans');
    expect(detectFontFamily('TimesNewRoman')).toBe('serif');
    expect(detectFontFamily('CourierNew')).toBe('mono');
  });

  it('every family has an open license and four distinct face URLs', () => {
    for (const f of PDF_FONTS) {
      expect(['OFL', 'Apache-2.0']).toContain(f.license);
      const urls = [false, true].flatMap((b) => [false, true].map((i) => faceUrl(f.id as PdfFont, b, i)));
      expect(new Set(urls).size, `${f.id} faces`).toBe(4);
    }
  });

  it('faceUrl builds the fontsource layout exactly', () => {
    expect(faceUrl('open-sans', true, true)).toBe('https://cdn.jsdelivr.net/fontsource/fonts/open-sans@latest/latin-700-italic.ttf');
    expect(faceUrl('sans', false, false)).toBe('https://cdn.jsdelivr.net/fontsource/fonts/arimo@latest/latin-400-normal.ttf');
  });

  it('fontCss resolves via the table; unknown ids fall back to the sans stack', () => {
    expect(fontCss('sans')).toContain('Arimo');
    expect(fontCss('dm-sans')).toContain('"DM Sans"');
    expect(fontDef('not-a-font' as PdfFont).id).toBe('sans');
  });
});

describe('detectFontFamily', () => {
  it('maps Arial/Helvetica to sans (incl. subset prefixes)', () => {
    expect(detectFontFamily('ABCDEF+Arial-BoldMT')).toBe('sans');
    expect(detectFontFamily('Helvetica')).toBe('sans');
    expect(detectFontFamily('NimbusSans')).toBe('sans');
  });

  it('maps Times/Georgia/serifs to serif', () => {
    expect(detectFontFamily('TimesNewRomanPSMT')).toBe('serif');
    expect(detectFontFamily('ABCDEF+Georgia-Bold')).toBe('serif');
    expect(detectFontFamily('LiberationSerif')).toBe('serif');
  });

  it('maps Courier/mono to mono', () => {
    expect(detectFontFamily('CourierNewPSMT')).toBe('mono');
    expect(detectFontFamily('Consolas')).toBe('mono');
  });

  it('defaults unknown/empty to sans (never throws)', () => {
    expect(detectFontFamily('SomeObscureFontXYZ')).toBe('sans');
    expect(detectFontFamily('')).toBe('sans');
    expect(detectFontFamily(null)).toBe('sans');
    expect(detectFontFamily(undefined)).toBe('sans');
  });
});

describe('detectBold', () => {
  it('catches weight keywords', () => {
    expect(detectBold('Arial-BoldMT')).toBe(true);
    expect(detectBold('Helvetica-Black')).toBe(true);
    expect(detectBold('ArialMT')).toBe(false);
    expect(detectBold(null)).toBe(false);
  });
});

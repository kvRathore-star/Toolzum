import { describe, it, expect } from 'vitest';
import { detectFontFamily, detectBold } from '@/lib/pdfFonts';

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

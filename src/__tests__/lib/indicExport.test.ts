import { describe, it, expect } from 'vitest';
// fontkit's dist references regeneratorRuntime (Next.js polyfills it for
// the browser; vitest does not) — the subset/embed paths need the global.
import 'regenerator-runtime/runtime';
import fs from 'node:fs';
import path from 'node:path';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkitPkg from '@pdf-lib/fontkit';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import {
  detectIndicScript,
  splitFontRuns,
  measureRuns,
  uncoveredGlyphChars,
  indicFaceUrl,
} from '@/lib/pdfFonts';

/**
 * Glyph-encoding release gate (Oct 2026) — the Hindi/Tamil market proof.
 *
 * The 10 picker families ship LATIN SUBSETS ONLY: Devanagari/Tamil export
 * used to encode as blank .notdef boxes (or throw on base-14). This file
 * proves the corrected pipeline with fixtures pulled from the same
 * fontsource URLs the editor fetches at runtime:
 *   1. pure helpers (script detection, run splitting, layout, gaps)
 *   2. FULL ROUND-TRIP: pdf-lib draw + subset embed → pdf.js extraction —
 *      a Hindi and a Tamil annotation, plus a mixed Latin+Hindi run-split,
 *      exactly as exportPdf draws them.
 *
 * Extraction is compared as a character MULTISET (whitespace ignored):
 * Devanagari matras reorder visually vs. logically, so exact-string
 * equality would be a false negative — the multiset still catches blank
 * boxes (missing chars) and .notdef garbage (extra chars).
 */

const FIX = (f: string) =>
  new Uint8Array(fs.readFileSync(path.join(process.cwd(), 'src/__tests__/fixtures/fonts', f)));

// jsdom realm: fs returns a Buffer whose instanceof Uint8Array fails
// against the window's Uint8Array — copy into a same-realm view above.
// Custom-font embeds also need fontkit registered (as the app does).
const makeDoc = async (): Promise<PDFDocument> => {
  const doc = await PDFDocument.create();
  const fk = (fontkitPkg as unknown as { default?: typeof fontkitPkg }).default ?? fontkitPkg;
  doc.registerFontkit(fk as Parameters<typeof doc.registerFontkit>[0]);
  return doc;
};

const multiset = (s: string) => [...s.replace(/\s/g, '')].sort().join('');

const extract = async (bytes: Uint8Array): Promise<string> => {
  const pdf = await pdfjsLib.getDocument({ data: bytes.slice() }).promise;
  const page = await pdf.getPage(1);
  const tc = await page.getTextContent();
  return tc.items.map((it) => ('str' in it ? it.str : '')).join('');
};

describe('detectIndicScript (script routing)', () => {
  it('Hindi/Marathi → devanagari, Tamil → tamil', () => {
    expect(detectIndicScript('नमस्ते')).toBe('devanagari');
    expect(detectIndicScript('नं. 1234 — Invoice')).toBe('devanagari');
    expect(detectIndicScript('தமிழ்')).toBe('tamil');
    expect(detectIndicScript('வணக்கம் உலகம்')).toBe('tamil');
  });

  it('Latin, digits, emoji → null (stay on the picker font)', () => {
    expect(detectIndicScript('Hello world')).toBe(null);
    expect(detectIndicScript('₹100 only')).toBe(null);
    expect(detectIndicScript('')).toBe(null);
    expect(detectIndicScript('😀 ok')).toBe(null);
  });

  it('Devanagari extended block (U+A8E0–A8FF) counts', () => {
    expect(detectIndicScript('\u{a8e6}')).toBe('devanagari');
  });
});

describe('splitFontRuns (mixed-script export runs)', () => {
  it('splits Latin vs Devanagari and merges adjacent same-class chars', () => {
    expect(splitFontRuns('Hello दुनिया')).toEqual([
      { text: 'Hello ', cls: 'default' },
      { text: 'दुनिया', cls: 'devanagari' },
    ]);
  });

  it('₹ gets its own run so it can route when the face lacks it (Arimo does)', () => {
    expect(splitFontRuns('₹50')).toEqual([
      { text: '₹', cls: 'rupee' },
      { text: '50', cls: 'default' },
    ]);
  });

  it('Tamil and Latin alternate per script change', () => {
    expect(splitFontRuns('Bill தமிழ்!')).toEqual([
      { text: 'Bill ', cls: 'default' },
      { text: 'தமிழ்', cls: 'tamil' },
      { text: '!', cls: 'default' },
    ]);
  });

  it('pure Latin stays a single default run; empty text → no runs', () => {
    expect(splitFontRuns('Plain 123')).toEqual([{ text: 'Plain 123', cls: 'default' }]);
    expect(splitFontRuns('')).toEqual([]);
  });
});

describe('measureRuns (sequential advance layout)', () => {
  const width10 = (t: string) => t.length * 10;

  it('boxes advance cumulatively and total is the sum', () => {
    const runs = splitFontRuns('AB₹CD');
    const { boxes, total } = measureRuns(runs, width10);
    expect(boxes).toHaveLength(3);
    expect(boxes[0]).toMatchObject({ text: 'AB', x: 0, w: 20 });
    expect(boxes[1]).toMatchObject({ text: '₹', x: 20, w: 10 });
    expect(boxes[2]).toMatchObject({ text: 'CD', x: 30, w: 20 });
    expect(total).toBe(50);
  });

  it('zero-width runs do not stall the advance', () => {
    const { boxes, total } = measureRuns(
      [{ text: 'a', cls: 'default' }, { text: 'b', cls: 'devanagari' }],
      (t, cls) => (cls === 'devanagari' ? 0 : t.length * 10),
    );
    expect(boxes[1]!.x).toBe(10);
    expect(total).toBe(10);
  });
});

describe('uncoveredGlyphChars (gap warning — what latin subsets cannot show)', () => {
  it('flags CJK, Arabic, Greek, Cyrillic, Thai, emoji, unsupported Indic', () => {
    expect(uncoveredGlyphChars('你好').length).toBeGreaterThan(0);
    expect(uncoveredGlyphChars('مرحبا').length).toBeGreaterThan(0);
    expect(uncoveredGlyphChars('αβ').length).toBeGreaterThan(0);
    expect(uncoveredGlyphChars('Привет').length).toBeGreaterThan(0);
    expect(uncoveredGlyphChars('สวัสดี').length).toBeGreaterThan(0);
    expect(uncoveredGlyphChars('😀').length).toBeGreaterThan(0);
    expect(uncoveredGlyphChars('অ').length).toBeGreaterThan(0); // Bengali — not routed
  });

  it('does NOT flag what routes or renders: Latin, Hindi, Tamil, ₹', () => {
    expect(uncoveredGlyphChars('Hello, World! ₹1,234.56 — “quotes” ’apostrophes’…')).toEqual([]);
    expect(uncoveredGlyphChars('नमस्ते दुनिया')).toEqual([]);
    expect(uncoveredGlyphChars('தமிழ் வணக்கம்')).toEqual([]);
    expect(uncoveredGlyphChars('')).toEqual([]);
  });
});

describe('indicFaceUrl (fontsource URLs the runtime fetches)', () => {
  it('hits the exact subset files (verified 200 on jsdelivr)', () => {
    expect(indicFaceUrl('devanagari', false)).toBe(
      'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-devanagari@latest/devanagari-400-normal.ttf',
    );
    expect(indicFaceUrl('tamil', true)).toBe(
      'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-tamil@latest/tamil-700-normal.ttf',
    );
  });
});

describe('Hindi/Tamil export round-trip (release gate — pdf-lib → pdf.js)', () => {
  it('draws a Hindi annotation and extraction returns every character', async () => {
    const doc = await makeDoc();
    const page = doc.addPage([612, 792]);
    const font = await doc.embedFont(FIX('noto-sans-devanagari-400.ttf'), { subset: true });
    const text = 'नमस्ते दुनिया';
    page.drawText(text, { x: 72, y: 700, size: 18, font, color: rgb(0, 0, 0) });
    const out = await extract(await doc.save());
    expect(out.replace(/\uFFFD/g, '')).not.toBe('');
    expect(multiset(out)).toBe(multiset(text));
  }, 30000);

  it('draws a Tamil annotation and extraction returns every character', async () => {
    const doc = await makeDoc();
    const page = doc.addPage([612, 792]);
    const font = await doc.embedFont(FIX('noto-sans-tamil-400.ttf'), { subset: true });
    const text = 'தமிழ் வணக்கம்';
    page.drawText(text, { x: 72, y: 700, size: 18, font, color: rgb(0, 0, 0) });
    const out = await extract(await doc.save());
    expect(out.replace(/\uFFFD/g, '')).not.toBe('');
    expect(multiset(out)).toBe(multiset(text));
  }, 30000);

  it('mixed Latin+Hindi run-split exports both parts (the exact exportPdf layout)', async () => {
    const doc = await makeDoc();
    const page = doc.addPage([612, 792]);
    const latin = await doc.embedFont(FIX('arimo-latin-400.ttf'), { subset: true });
    const deva = await doc.embedFont(FIX('noto-sans-devanagari-400.ttf'), { subset: true });
    const text = 'Invoice नंबर 42';
    const { boxes } = measureRuns(splitFontRuns(text), (t, cls) =>
      (cls === 'devanagari' ? deva : latin).widthOfTextAtSize(t, 16),
    );
    const x = 72;
    for (const b of boxes) {
      const font = b.cls === 'devanagari' ? deva : latin;
      page.drawText(b.text, { x: x + b.x, y: 700, size: 16, font, color: rgb(0, 0, 0) });
    }
    const out = await extract(await doc.save());
    expect(out.replace(/\uFFFD/g, '')).not.toBe('');
    expect(multiset(out)).toBe(multiset(text));
  }, 30000);
});

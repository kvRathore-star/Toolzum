/**
 * Font pipeline for the PDF editor.
 *
 * 10 families, four faces each (regular / bold / italic / bold-italic —
 * all shipped up front, never bolted on later):
 *
 *   Classic trio — Arimo ≈ Arial, Tinos ≈ Times New Roman, Cousine ≈
 *   Courier New. Metrically identical to the originals, which is what
 *   retype detection maps into and what offline documents expect.
 *
 *   Popular seven — Roboto, Montserrat, Open Sans, Lato, Poppins, Inter,
 *   DM Sans: the families people actually look for in the picker instead
 *   of Helvetica-only.
 *
 * Licenses: OFL for all except Roboto (Apache-2.0). Both permit
 * redistribution and offline caching; files come from the fontsource CDN
 * and land in IndexedDB after first fetch.
 *
 * Honest boundaries (stated in FAQs, enforced here):
 * - Only these 10 families. Arbitrary /BaseFont fetching would redistribute
 *   commercial fonts and break offline use — refused by design.
 * - Offline first run falls back to base-14 (Helvetica oblique etc.),
 *   never fails.
 */

const CDN = 'https://cdn.jsdelivr.net/fontsource/fonts';
const VER = 'v2';

export interface FontDef {
  /** Stable id — persisted in annotations + saved sessions. */
  id: string;
  /** Picker label. */
  label: string;
  /** FontFace/CSS family name (what canvas and the inline editor resolve). */
  family: string;
  /** fontsource CDN slug. */
  slug: string;
  /** CSS family stack with an offline system fallback. */
  css: string;
  /** Font license — OFL unless noted. */
  license: 'OFL' | 'Apache-2.0';
  /** Metric-compatible trio: preloaded at document open for WYSIWYG. */
  classic: boolean;
}

export const PDF_FONTS: readonly FontDef[] = [
  { id: 'sans', label: 'Sans (Arimo ≈ Arial)', family: 'Arimo', slug: 'arimo', css: 'Arimo, Arial, Helvetica, sans-serif', license: 'OFL', classic: true },
  { id: 'serif', label: 'Serif (Tinos ≈ Times)', family: 'Tinos', slug: 'tinos', css: 'Tinos, "Times New Roman", Times, serif', license: 'OFL', classic: true },
  { id: 'mono', label: 'Mono (Cousine ≈ Courier)', family: 'Cousine', slug: 'cousine', css: 'Cousine, "Courier New", Courier, monospace', license: 'OFL', classic: true },
  { id: 'roboto', label: 'Roboto', family: 'Roboto', slug: 'roboto', css: 'Roboto, Arial, sans-serif', license: 'Apache-2.0', classic: false },
  { id: 'montserrat', label: 'Montserrat', family: 'Montserrat', slug: 'montserrat', css: 'Montserrat, Arial, sans-serif', license: 'OFL', classic: false },
  { id: 'open-sans', label: 'Open Sans', family: 'Open Sans', slug: 'open-sans', css: '"Open Sans", Arial, sans-serif', license: 'OFL', classic: false },
  { id: 'lato', label: 'Lato', family: 'Lato', slug: 'lato', css: 'Lato, Arial, sans-serif', license: 'OFL', classic: false },
  { id: 'poppins', label: 'Poppins', family: 'Poppins', slug: 'poppins', css: 'Poppins, Arial, sans-serif', license: 'OFL', classic: false },
  { id: 'inter', label: 'Inter', family: 'Inter', slug: 'inter', css: 'Inter, Arial, sans-serif', license: 'OFL', classic: false },
  { id: 'dm-sans', label: 'DM Sans', family: 'DM Sans', slug: 'dm-sans', css: '"DM Sans", Arial, sans-serif', license: 'OFL', classic: false },
];

export type PdfFont = 'sans' | 'serif' | 'mono' | 'roboto' | 'montserrat' | 'open-sans' | 'lato' | 'poppins' | 'inter' | 'dm-sans';

const BY_ID = new Map<string, FontDef>(PDF_FONTS.map((f) => [f.id, f]));

export function fontDef(fam: PdfFont): FontDef {
  return BY_ID.get(fam) || BY_ID.get('sans')!;
}

export function fontCss(fam: PdfFont = 'sans'): string {
  return fontDef(fam).css;
}

/** The metric-compatible trio — preloaded at open (see PDF_FONTS.classic). */
export function classicFonts(): readonly FontDef[] {
  return PDF_FONTS.filter((f) => f.classic);
}

/**
 * Face URL for one of the four shipped faces per family.
 * fontsource layout: latin-{400,700}-{normal,italic}.ttf — all 40 files
 * verified present before this list shipped.
 */
export function faceUrl(fam: PdfFont, bold: boolean, italic: boolean): string {
  const d = fontDef(fam);
  return `${CDN}/${d.slug}@latest/latin-${bold ? 700 : 400}-${italic ? 'italic' : 'normal'}.ttf`;
}

/**
 * Map a PDF /BaseFont or font name to one of the classic trio by keyword.
 * Subset prefixes (ABCDEE+Arial-BoldMT) are stripped first. Unknown →
 * 'sans'. Pure — tested. (Retype is metric-detection, so it never lands
 * on the popular seven.)
 */
export function detectFontFamily(fontName: string | null | undefined): 'sans' | 'serif' | 'mono' {
  const n = (fontName || '').replace(/^[A-Z]{6}\+/, '').toLowerCase();
  if (/courier|mono|consolas|menlo|fixedsys|lucida.*typewriter|nimbusmono/.test(n)) return 'mono';
  if (/times|georgia|garamond|serif|palatino|bookman|charter|freeserif|liberationserif/.test(n)) return 'serif';
  return 'sans';
}

/** Bold detection from a font name (Bold/Black/Heavy/Demi/BoldItalic…). Pure — tested. */
export function detectBold(fontName: string | null | undefined): boolean {
  return /bold|black|heavy|demi|extra bold/i.test(fontName || '');
}

// Fonts live in their OWN database. They used to share
// 'toolzum-pdf-editor' with the draft store — whichever module opened it
// first created the schema, so the editor's mount-time open (which only
// creates 'sessions') could win and leave no 'fonts' store; every later
// cache access then threw NotFoundError and, because the error escaped
// before fetch(), killed export instead of degrading. Separate name =
// no shared schema, no opener race, no migration.
const FONT_DB = 'toolzum-fonts';

function idb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(FONT_DB, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains('fonts')) req.result.createObjectStore('fonts');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Fetch one face with IndexedDB caching (keyed with version so future
 * swaps invalidate). Throws on NETWORK failure — callers fall back.
 * Cache problems (private mode, missing store, quota) never throw: they
 * degrade to a plain fetch, so a broken store can't block an export.
 */
export async function loadFontBytes(fam: PdfFont, bold: boolean, italic: boolean): Promise<ArrayBuffer> {
  const key = `font-${VER}-${fam}-${bold ? '700' : '400'}-${italic ? 'italic' : 'normal'}`;
  return cachedFontFetch(faceUrl(fam, bold, italic), key);
}

async function cachedFontFetch(url: string, key: string): Promise<ArrayBuffer> {
  let db: IDBDatabase | null = null;
  try {
    db = await idb();
    const database = db;
    const hit = await new Promise<ArrayBuffer | null>((resolve, reject) => {
      const tx = database.transaction('fonts', 'readonly');
      const req = tx.objectStore('fonts').get(key);
      req.onsuccess = () => resolve((req.result as ArrayBuffer) || null);
      req.onerror = () => reject(req.error);
    });
    if (hit && hit.byteLength > 1000) {
      database.close();
      return hit;
    }
  } catch {
    db = null; // absent/broken cache → plain fetch below
  }
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = await res.arrayBuffer();
    if (buf.byteLength < 1000) throw new Error('truncated font');
    if (db) {
      try {
        const database = db;
        const tx2 = database.transaction('fonts', 'readwrite');
        tx2.objectStore('fonts').put(buf, key);
        await new Promise<void>((resolve, reject) => {
          tx2.oncomplete = () => resolve();
          tx2.onerror = () => reject(tx2.error);
          tx2.onabort = () => reject(tx2.error);
        });
      } catch {
        /* cache write is best-effort */
      }
      try {
        db.close();
      } catch {
        /* ignore */
      }
    }
    return buf;
  } catch (e) {
    throw e instanceof Error ? e : new Error('font load failed');
  }
}

/**
 * Indic scripts (Hindi/Marathi/Nepali = Devanagari, Tamil) — the release
 * gate for the Indian market. The 10 picker families ship LATIN SUBSETS
 * ONLY: Devanagari/Tamil text encodes as .notdef (blank boxes) or throws
 * on base-14. These two Noto faces (OFL, fontsource CDN + the same IDB
 * cache) are fetched on demand at export — never shown in the picker;
 * mixed text is run-split against them (the Noto subset files carry no
 * Latin glyphs, so a whole-string swap would blank the English).
 */
export type IndicScript = 'devanagari' | 'tamil';

const INDIC_SLUG: Record<IndicScript, string> = {
  devanagari: 'noto-sans-devanagari',
  tamil: 'noto-sans-tamil',
};

/** First supported Indic script present in the text (code-point scan). */
export function detectIndicScript(text: string): IndicScript | null {
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    if ((cp >= 0x0900 && cp <= 0x097f) || (cp >= 0xa8e0 && cp <= 0xa8ff)) return 'devanagari';
    if (cp >= 0x0b80 && cp <= 0x0bff) return 'tamil';
  }
  return null;
}

export function indicFaceUrl(script: IndicScript, bold: boolean): string {
  return `${CDN}/${INDIC_SLUG[script]}@latest/${script}-${bold ? 700 : 400}-normal.ttf`;
}

/** Same IDB-cached fetch as the picker families. Throws offline-uncached. */
export async function loadIndicFontBytes(script: IndicScript, bold: boolean): Promise<ArrayBuffer> {
  return cachedFontFetch(indicFaceUrl(script, bold), `font-${VER}-indic-${script}-${bold ? '700' : '400'}`);
}

/**
 * Make one face usable for canvas/DOM preview via FontFace (best-effort —
 * preview falls back to the CSS stack's system font silently on failure).
 * No-op when the face is already registered.
 */
export async function ensurePreviewFont(fam: PdfFont, bold: boolean, italic: boolean): Promise<void> {
  try {
    const d = fontDef(fam);
    const weight = bold ? '700' : '400';
    const style = italic ? 'italic' : 'normal';
    for (const f of document.fonts) {
      if (f.family === d.family && f.weight === weight && f.style === style && f.status === 'loaded') return;
    }
    const buf = await loadFontBytes(fam, bold, italic);
    const face = new FontFace(d.family, buf, { weight, style });
    await face.load();
    document.fonts.add(face);
  } catch {
    /* preview fallback — export path handles its own fallback */
  }
}

/** Font class for one run of text (see splitFontRuns). */
export type FontRunCls = 'default' | 'devanagari' | 'tamil' | 'rupee';

/**
 * Split text into maximal same-font runs for export drawing. The Noto
 * subset files carry NO Latin, and the picker faces carry NO Indic and
 * (typically) no ₹ (U+20B9) — drawing a mixed string with any single
 * font blanks the other part. Pure — tested.
 */
export function splitFontRuns(text: string): { text: string; cls: FontRunCls }[] {
  const cls = (ch: string): FontRunCls => {
    const cp = ch.codePointAt(0) ?? 0;
    if ((cp >= 0x0900 && cp <= 0x097f) || (cp >= 0xa8e0 && cp <= 0xa8ff)) return 'devanagari';
    if (cp >= 0x0b80 && cp <= 0x0bff) return 'tamil';
    if (cp === 0x20b9) return 'rupee';
    return 'default';
  };
  const runs: { text: string; cls: FontRunCls }[] = [];
  for (const ch of text) {
    const c = cls(ch);
    const last = runs[runs.length - 1];
    if (last && last.cls === c) last.text += ch;
    else runs.push({ text: ch, cls: c });
  }
  return runs;
}

/**
 * Sequential advance across runs with a per-class width measure — the
 * layout the export draw loop uses (alignment off `total`, underline
 * spans `total`). Pure — tested with a fake measure.
 */
export function measureRuns(
  runs: readonly { text: string; cls: FontRunCls }[],
  widthOf: (_text: string, _cls: FontRunCls) => number,
): { boxes: { text: string; cls: FontRunCls; x: number; w: number }[]; total: number } {
  let x = 0;
  const boxes = runs.map((r) => {
    const w = widthOf(r.text, r.cls);
    const box = { text: r.text, cls: r.cls, x, w };
    x += w;
    return box;
  });
  return { boxes, total: x };
}

/**
 * Chars the fetched latin-subset faces cannot show (scripts outside the
 * fontsource `latin` unicode range). Devanagari/Tamil are excluded —
 * they route to Noto — and so is ₹, which routes as its own run when the
 * chosen face lacks it (Arimo's latin subset does). Callers WARN with
 * the affected pages; these chars would otherwise encode as blank .notdef
 * boxes. Pure — tested.
 */
const GAP_RANGES: ReadonlyArray<readonly [number, number]> = [
  [0x0370, 0x03ff], // Greek
  [0x0400, 0x052f], // Cyrillic
  [0x0590, 0x05ff], // Hebrew
  [0x0600, 0x06ff], // Arabic
  [0x0750, 0x077f], // Arabic Supplement
  [0x0980, 0x09ff], // Bengali (no font routed)
  [0x0a00, 0x0a7f], // Gurmukhi
  [0x0a80, 0x0aff], // Gujarati
  [0x0b00, 0x0b7f], // Oriya
  [0x0c00, 0x0c7f], // Telugu
  [0x0c80, 0x0cff], // Kannada
  [0x0d00, 0x0d7f], // Malayalam
  [0x0d80, 0x0dff], // Sinhala
  [0x0e00, 0x0e7f], // Thai
  [0x0e80, 0x0eff], // Lao
  [0x1000, 0x109f], // Myanmar
  [0x1100, 0x11ff], // Hangul jamo
  [0x2e80, 0x9fff], // CJK radicals, kana, Han
  [0xac00, 0xd7af], // Hangul syllables
  [0xf900, 0xfaff], // CJK compatibility
  [0xff00, 0xffef], // Fullwidth forms
  [0xfe00, 0xfe0f], // Variation selectors
  [0x1f000, 0x1fbff], // Emoji planes
  [0x2600, 0x27bf], // Dingbats
  [0x2b00, 0x2bff], // Miscellaneous symbols-and-arrows
];

export function uncoveredGlyphChars(text: string): string[] {
  const seen = new Set<string>();
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    if (cp === 0x20b9) continue; // routed, never a gap
    if (GAP_RANGES.some(([lo, hi]) => cp >= lo && cp <= hi)) seen.add(ch);
    if (seen.size >= 8) break;
  }
  return [...seen];
}

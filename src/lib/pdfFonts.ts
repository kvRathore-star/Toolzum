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

function idb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('toolzum-pdf-editor', 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains('sessions')) req.result.createObjectStore('sessions');
      if (!req.result.objectStoreNames.contains('fonts')) req.result.createObjectStore('fonts');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Fetch one face with IndexedDB caching (keyed with version so future
 * swaps invalidate). Throws on network failure — callers fall back.
 */
export async function loadFontBytes(fam: PdfFont, bold: boolean, italic: boolean): Promise<ArrayBuffer> {
  const key = `font-${VER}-${fam}-${bold ? '700' : '400'}-${italic ? 'italic' : 'normal'}`;
  try {
    const db = await idb();
    const hit = await new Promise<ArrayBuffer | null>((resolve, reject) => {
      const tx = db.transaction('fonts', 'readonly');
      const req = tx.objectStore('fonts').get(key);
      req.onsuccess = () => resolve((req.result as ArrayBuffer) || null);
      req.onerror = () => reject(req.error);
    });
    if (hit && hit.byteLength > 1000) {
      db.close();
      return hit;
    }
    const res = await fetch(faceUrl(fam, bold, italic));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = await res.arrayBuffer();
    if (buf.byteLength < 1000) throw new Error('truncated font');
    const tx2 = db.transaction('fonts', 'readwrite');
    tx2.objectStore('fonts').put(buf, key);
    await new Promise<void>((resolve, reject) => {
      tx2.oncomplete = () => resolve();
      tx2.onerror = () => reject(tx2.error);
    });
    db.close();
    return buf;
  } catch (e) {
    throw e instanceof Error ? e : new Error('font load failed');
  }
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

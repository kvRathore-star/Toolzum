/**
 * Metric-compatible font pipeline for the PDF editor.
 *
 * Problem: pdf-lib's built-in fonts (Helvetica/Times/Courier) look wrong
 * on modern documents set in Arial/Georgia/etc. Solution: Arimo (≈Arial),
 * Tinos (≈Times New Roman), Cousine (≈Courier New) — metrically identical,
 * openly licensed, fetched from the fontsource CDN, cached in IndexedDB.
 *
 * Honest boundaries (stated in FAQs, enforced here):
 * - Only these 3 families. Arbitrary /BaseFont fetching would redistribute
 *   commercial fonts and break offline use — refused by design.
 * - Offline first run falls back to base-14 (previous behavior), never fails.
 */

export type PdfFont = 'sans' | 'serif' | 'mono';

const CDN = 'https://cdn.jsdelivr.net/fontsource/fonts';
const VER = 'v1';

const FILES: Record<PdfFont, { plain: string; bold: string; css: string }> = {
  sans: {
    plain: `${CDN}/arimo@latest/latin-400-normal.ttf`,
    bold: `${CDN}/arimo@latest/latin-700-normal.ttf`,
    css: 'Arimo, Arial, Helvetica, sans-serif',
  },
  serif: {
    plain: `${CDN}/tinos@latest/latin-400-normal.ttf`,
    bold: `${CDN}/tinos@latest/latin-700-normal.ttf`,
    css: 'Tinos, "Times New Roman", Times, serif',
  },
  mono: {
    plain: `${CDN}/cousine@latest/latin-400-normal.ttf`,
    bold: `${CDN}/cousine@latest/latin-700-normal.ttf`,
    css: 'Cousine, "Courier New", Courier, monospace',
  },
};

export function fontCss(fam: PdfFont = 'sans'): string {
  return FILES[fam].css;
}

/**
 * Map a PDF /BaseFont or font name to one of the 3 families by keyword.
 * Subset prefixes (ABCDEE+Arial-BoldMT) are stripped first. Unknown →
 * 'sans'. Pure — tested.
 */
export function detectFontFamily(fontName: string | null | undefined): PdfFont {
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
 * Fetch a font file with IndexedDB caching (keyed with version so future
 * swaps invalidate). Throws on network failure — callers fall back.
 */
export async function loadFontBytes(fam: PdfFont, bold: boolean): Promise<ArrayBuffer> {
  const key = `font-${VER}-${fam}-${bold ? '700' : '400'}`;
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
    const res = await fetch(FILES[fam][bold ? 'bold' : 'plain']);
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
 * Make the family usable for canvas preview via FontFace (best-effort —
 * preview falls back to system fonts silently on failure).
 */
export async function ensurePreviewFont(fam: PdfFont, bold: boolean): Promise<void> {
  try {
    const name = fam === 'sans' ? 'Arimo' : fam === 'serif' ? 'Tinos' : 'Cousine';
    const style = `${bold ? '700' : '400'}`;
    for (const f of document.fonts) {
      if (f.family === name && f.weight === style && f.status === 'loaded') return;
    }
    const buf = await loadFontBytes(fam, bold);
    const face = new FontFace(name, buf, { weight: style });
    await face.load();
    document.fonts.add(face);
  } catch {
    /* preview fallback — export path handles its own fallback */
  }
}

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { PDFDocument, StandardFonts } from 'pdf-lib';

/**
 * Privacy claims tied to evidence — docs/pdf-editor-claims.md rows 6/7/8/12.
 *
 *  6. "the original file on your device is never touched"
 *  7. "Your PDF never leaves this device" — TIGHTENED: every network call
 *     site in the editor is enumerated; file bytes never enter a payload.
 *  8. Signature "stored locally, never uploaded" — localStorage-only + the
 *     disclosure and one-click clear both exist.
 * 12. Site-wide sweep — zero sendBeacon in src/; XMLHttpRequest only inside
 *     developer-toolkit snippet strings, never as runtime code.
 */

const editor = readFileSync('src/components/tools/modules/pdf/editor/PdfEditorCore.tsx', 'utf8');

describe('row 6 — "the original file on your device is never touched"', () => {
  it('impl: every PDFDocument.load in the editor loads a copy (.slice())', () => {
    const total = (editor.match(/PDFDocument\.load\(/g) || []).length;
    const sliced = (editor.match(/PDFDocument\.load\([A-Za-z0-9_.]+\.slice\(\)/g) || []).length;
    expect(total).toBeGreaterThanOrEqual(2);
    expect(sliced).toBe(total);
    expect(editor).not.toMatch(/PDFDocument\.load\(fileBytes\)/);
  });

  it('behavior: mutating a loaded copy leaves the input bytes byte-identical', async () => {
    const src = await PDFDocument.create();
    const font = await src.embedFont(StandardFonts.Helvetica);
    const page = src.addPage([200, 100]);
    page.drawText('secret', { x: 10, y: 50, size: 12, font });
    const bytes = await src.save();
    const before = Uint8Array.from(bytes);
    // Exactly the editor's pipeline: load a slice, edit, save.
    const doc = await PDFDocument.load(bytes.slice());
    doc.removePage(0);
    await doc.save();
    expect(bytes.length).toBe(before.length);
    for (let i = 0; i < bytes.length; i++) expect(bytes[i]).toBe(before[i]);
  });
});

describe('row 7 — "never leaves this device" (tightened)', () => {
  it('impl: the editor has exactly three network calls — email, asset HEAD, data: decode', () => {
    const sites = [...editor.matchAll(/fetch\(([\s\S]{0,160}?)[,)]/g)].map((m) => m[1] ?? '');
    expect(sites.length).toBe(3);
    expect(sites).toContain("'/api/notify-me'"); // { email, tool, captcha } only
    expect(sites).toContain("'/pdf.worker.min.mjs'"); // asset prewarm HEAD
    expect(sites).toContain('a.dataUrl'); // data: URL decode — no network
  });

  it('impl: file bytes never enter a payload; no beacons/XHR in the editor', () => {
    expect(editor).not.toMatch(/sendBeacon|XMLHttpRequest/);
    expect(editor).not.toMatch(/body:\s*JSON\.stringify\(\{[^}]*fileBytes/);
    expect(editor).not.toMatch(/fetch\([\s\S]{0,400}fileBytes/);
  });

  it('claim: tour/load/FAQ copy stays device-scoped', () => {
    expect(editor).toMatch(/never leaves this device/);
    expect(editor).toMatch(/everything stays in your browser/);
    expect(editor).toMatch(/file is never uploaded/);
  });
});

describe('row 8 — signature "stored locally, never uploaded"', () => {
  it('impl: SIG_KEY touches only localStorage (plus its declaration)', () => {
    const lines = editor.split('\n').filter((l) => l.includes('SIG_KEY'));
    expect(lines.length).toBeGreaterThanOrEqual(4);
    for (const l of lines) {
      if (l.includes('const SIG_KEY')) continue;
      expect(l).toMatch(/localStorage\.(getItem|setItem|removeItem)\(SIG_KEY/);
    }
  });

  it('impl: the disclosure and a one-click clear both exist', () => {
    expect(editor).toMatch(/stored locally, never uploaded/);
    expect(editor).toMatch(/Saved signature forgotten on this device/);
  });

  it('impl: no fetch payload references the signature', () => {
    expect(editor).not.toMatch(/fetch\([\s\S]{0,400}SIG_KEY/);
  });
});

describe('row 12 — site-wide privacy-claim sweep', () => {
  const files = (readdirSync('src', { recursive: true }) as string[])
    .filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'))
    .filter((f) => !f.split(path.sep).includes('__tests__'));

  it('impl: zero sendBeacon anywhere in src/', () => {
    expect(files.length).toBeGreaterThan(100);
    for (const f of files) {
      expect(readFileSync(path.join('src', f), 'utf8'), f).not.toMatch(/sendBeacon/);
    }
  });

  it('impl: XMLHttpRequest appears only inside developer-toolkit snippet strings', () => {
    const hits = files.filter((f) => readFileSync(path.join('src', f), 'utf8').includes('new XMLHttpRequest('));
    for (const f of hits) expect(f.replace(/\\/g, '/')).toMatch(/^components\/tools\/modules\/developer\//);
  });
});

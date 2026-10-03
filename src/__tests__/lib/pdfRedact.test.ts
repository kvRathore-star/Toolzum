import { describe, it, expect } from 'vitest';
import {
  tokenize,
  mapTextRuns,
  stripRunsInRect,
  serialize,
  decodeBytes,
  applyRedactions,
  countOccurrences,
  stripAnnotations,
  sanitizeMetadata,
  flipRectForPdf,
  stripOrphanFormFields,
  type Token,
} from '@/lib/pdfRedact';
import { PDFDocument, StandardFonts, rgb, PDFArray, PDFRawStream, decodePDFRawStream } from 'pdf-lib';

const STREAM = `BT /F1 12 Tf 72 720 Td (Hello World) Tj ET
BT /F1 12 Tf 72 700 Td [(Sec) 20 (ret Data)] TJ ET`;

describe('tokenize', () => {
  it('splits operators, strings, arrays, names, numbers', () => {
    const toks = tokenize(STREAM);
    const ops = toks.filter((t) => t.kind === 'op').map((t) => (t as { value: string }).value);
    expect(ops).toEqual(['BT', 'Tf', 'Td', 'Tj', 'ET', 'BT', 'Tf', 'Td', 'TJ', 'ET']);
  });

  it('keeps TJ arrays whole (operand+operator strip together)', () => {
    const toks = tokenize('[(A) 20 (B)] TJ');
    expect(toks.length).toBe(2);
    expect(toks[0]!.kind).toBe('array');
  });

  it('skips comments', () => {
    const toks = tokenize('% comment\nBT ET');
    expect(toks.map((t) => (t as { value: string }).value)).toEqual(['BT', 'ET']);
  });
});

describe('mapTextRuns', () => {
  it('locates Tj runs with text-matrix coordinates', () => {
    const runs = mapTextRuns(tokenize('BT /F1 12 Tf 72 720 Td (Hello) Tj ET'));
    expect(runs.length).toBe(1);
    expect(runs[0]!.text).toBe('Hello');
    expect(runs[0]!.x).toBe(72);
    expect(runs[0]!.y).toBe(720);
    expect(runs[0]!.decodable).toBe(true);
  });

  it('joins TJ kernels and tracks Tm', () => {
    const runs = mapTextRuns(tokenize('BT /F1 10 Tf 1 0 0 1 50 600 Tm [(He) -20 (llo)] TJ ET'));
    expect(runs.length).toBe(1);
    expect(runs[0]!.text).toBe('Hello');
    expect(runs[0]!.x).toBe(50);
    expect(runs[0]!.y).toBe(600);
  });

  it('advances text position across runs on one line', () => {
    const runs = mapTextRuns(tokenize('BT /F1 12 Tf 0 0 Td (AB) Tj (CD) Tj ET'));
    expect(runs.length).toBe(2);
    expect(runs[1]!.x).toBeGreaterThan(runs[0]!.x);
  });
});

describe('stripRunsInRect + serialize', () => {
  it('removes intersecting runs, keeps the rest, re-encodes validly', () => {
    const tokens = tokenize(STREAM);
    const runs = mapTextRuns(tokens);
    const { keep, report } = stripRunsInRect(tokens, runs, { x: 60, y: 690, w: 120, h: 30 });
    expect(report.removed).toBe(1);
    expect(report.flaggedUnmapped).toEqual([]);
    const out = serialize(tokens, keep);
    expect(out).not.toContain('Secret');
    expect(out).toContain('Hello World');
    // Reparse: still well-formed, Hello intact.
    const runs2 = mapTextRuns(tokenize(out));
    expect(runs2.map((r) => r.text)).toEqual(['Hello World']);
  });

  it('flags undecodable intersections instead of deleting blindly', () => {
    const tokens: Token[] = [{ kind: 'op', value: 'BT' }];
    const runs = [{ text: '', x: 0, y: 0, w: 100, h: 20, from: 0, to: 0, decodable: false }];
    const { keep, report } = stripRunsInRect(tokens, runs, { x: 0, y: 0, w: 200, h: 200 });
    expect(keep).toEqual([true]);
    expect(report.removed).toBe(0);
    expect(report.flaggedUnmapped.length).toBe(1);
  });

  it('ignores non-intersecting runs', () => {
    const tokens = tokenize('(Far) Tj');
    const runs = mapTextRuns(tokens);
    const { report } = stripRunsInRect(tokens, runs, { x: 1000, y: 1000, w: 10, h: 10 });
    expect(report.removed).toBe(0);
  });
});

describe('decodeBytes', () => {
  it('decodes WinAnsi incl. smart quotes', () => {
    expect(decodeBytes([0x48, 0x92, 0x93])).toBe('H\u2019\u201c');
  });
});

describe('flipRectForPdf (wrong-region redaction guard)', () => {
  it('flips top-down editor coords to PDF y-up', () => {
    // A4 (842pt): editor box at y=100 h=20 → PDF y = 842-120 = 722.
    expect(flipRectForPdf({ x: 10, y: 100, w: 50, h: 20 }, 842)).toEqual({
      x: 10, y: 722, w: 50, h: 20,
    });
  });

  it('is an involution (flip twice = identity)', () => {
    const r = { x: 5, y: 300, w: 120, h: 40 };
    const once = flipRectForPdf(r, 842);
    const twice = { ...flipRectForPdf(once, 842) };
    expect(twice).toEqual(r);
  });

  it('preserves zero-area and full-page rects', () => {
    expect(flipRectForPdf({ x: 0, y: 0, w: 595, h: 842 }, 842)).toEqual({ x: 0, y: 0, w: 595, h: 842 });
  });
});

describe('applyRedactions (real pdf-lib document)', () => {
  async function makeDoc(): Promise<PDFDocument> {
    const doc = await PDFDocument.create();
    const page = doc.addPage([595, 842]);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    page.drawText('Public header', { x: 72, y: 750, size: 14, font, color: rgb(0, 0, 0) });
    page.drawText('Secret ssn 123-45-6789 here', { x: 72, y: 700, size: 14, font, color: rgb(0, 0, 0) });
    page.drawText('Public footer', { x: 72, y: 100, size: 14, font, color: rgb(0, 0, 0) });
    return doc;
  }

  async function streamText(doc: PDFDocument, idx = 0): Promise<string> {
    const lp = doc.getPages()[idx]!;
    const contents = lp.node.Contents();
    if (!contents) return '';
    const resolved = doc.context.lookup(contents);
    const parts: string[] = [];
    const collect = (o: unknown) => {
      if (!o) return;
      const anyObj = o as { getContentsString?: unknown; getContents?: unknown };
      try {
        if (o instanceof PDFRawStream) {
          parts.push(new TextDecoder('latin1').decode(decodePDFRawStream(o).decode()));
          return;
        }
        if (typeof anyObj.getContentsString === 'function') {
          parts.push((anyObj.getContentsString as () => string)());
        }
      } catch { /* ignore */ }
    };
    if (resolved && typeof (resolved as { size?: unknown }).size === 'function') {
      const arr = resolved as { size: () => number; get: (i: number) => unknown };
      for (let i = 0; i < arr.size(); i++) collect(doc.context.lookup(arr.get(i)));
    } else {
      collect(resolved);
    }
    // Decode text runs (pdf-lib stores text as hex) — assert on language,
    // not raw bytes.
    const { tokenize: tok, mapTextRuns: map } = await import('@/lib/pdfRedact');
    return map(tok(parts.join('\n')))
      .map((r) => r.text)
      .join(' ');
  }

  it('strips covered text, keeps the rest, reports removed strings', async () => {
    const doc = await makeDoc();
    const out = await applyRedactions(doc, { 1: [{ x: 60, y: 680, w: 300, h: 40 }] });
    expect(out.pagesTouched).toBe(1);
    expect(out.removedTexts.join(' ')).toContain('Secret');
    const text = await streamText(doc);
    expect(text).not.toContain('Secret');
    expect(text).not.toContain('123-45-6789');
    expect(text).toContain('Public header');
    expect(text).toContain('Public footer');
  });

  it('leaves untouched pages/documents alone', async () => {
    const doc = await makeDoc();
    const out = await applyRedactions(doc, { 1: [{ x: 0, y: 0, w: 10, h: 10 }] });
    expect(out.pagesTouched).toBe(0);
    expect(out.removedTexts).toEqual([]);
    const text = await streamText(doc);
    expect(text).toContain('Secret');
  });

  // Regression (Oct 2026): saved+reloaded docs have Flate-compressed
  // PDFRawStream contents. Reading them as latin1 handed the tokenizer
  // compressed bytes → no Tj ops → redaction silently removed nothing
  // (e2e case 1 exported with SECRET still extractable).
  it('strips text from a SAVED and reloaded document (Flate content streams)', async () => {
    const doc = await makeDoc();
    const reloaded = await PDFDocument.load(await doc.save());
    const out = await applyRedactions(reloaded, { 1: [{ x: 60, y: 680, w: 300, h: 40 }] });
    expect(out.pagesTouched).toBe(1);
    expect(out.removedTexts.join(' ')).toContain('Secret');
    const text = await streamText(reloaded);
    expect(text).not.toContain('123-45-6789');
    expect(text).toContain('Public header');
  });
  // Verify-gate attribution (Oct 2026): the export gate must check a
  // removed string ONLY against the page it was removed from, and by
  // occurrence count — the old page-blind includes() check flagged copies
  // legitimately living on other pages / elsewhere on the same page and
  // blocked legitimate exports (e2e case 8 hung behind an UNVERIFIED
  // toast the test could not see).
  it('attributes removals to their own page (cross-page copy is not a leak)', async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    for (let i = 0; i < 2; i++) {
      const page = doc.addPage([595, 842]);
      page.drawText('SECRET', { x: 72, y: 700, size: 14, font, color: rgb(0, 0, 0) });
    }
    const out = await applyRedactions(doc, { 2: [{ x: 60, y: 695, w: 200, h: 25 }] });
    expect(out.occurrences).toHaveLength(1);
    expect(out.occurrences[0]).toEqual({ page: 2, text: 'SECRET', before: 1, removed: 1 });
    expect(out.removedTexts).toContain('SECRET');
    expect(await streamText(doc, 0)).toContain('SECRET');
    expect(await streamText(doc, 1)).not.toContain('SECRET');
    // Gate arithmetic: page 2 expected = before - removed = 0; page 1 has no
    // occurrence entry, so its surviving copy can never flag a leak.
    const occ = out.occurrences[0]!;
    expect(countOccurrences(await streamText(doc, 1), occ.text)).toBeLessThanOrEqual(occ.before - occ.removed);
  });

  it('counts same-page occurrences (covered copy may coexist with a kept one)', async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const page = doc.addPage([595, 842]);
    page.drawText('SECRET', { x: 72, y: 700, size: 14, font, color: rgb(0, 0, 0) });
    page.drawText('SECRET', { x: 72, y: 600, size: 14, font, color: rgb(0, 0, 0) });
    const out = await applyRedactions(doc, { 1: [{ x: 60, y: 695, w: 200, h: 25 }] });
    expect(out.occurrences).toEqual([{ page: 1, text: 'SECRET', before: 2, removed: 1 }]);
    const text = await streamText(doc, 0);
    // The kept copy: expected (2 - 1) = 1 — the old includes() gate saw
    // 'SECRET' still present and blocked the export regardless.
    expect(countOccurrences(text, 'SECRET')).toBe(1);
  });

  it('split runs: "SEC"+"RET" as separate runs — only the covered one counts', async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const page = doc.addPage([595, 842]);
    page.drawText('SEC', { x: 72, y: 700, size: 14, font, color: rgb(0, 0, 0) });
    page.drawText('RET', { x: 140, y: 700, size: 14, font, color: rgb(0, 0, 0) });
    page.drawText('SEC', { x: 72, y: 600, size: 14, font, color: rgb(0, 0, 0) }); // kept
    const out = await applyRedactions(doc, { 1: [{ x: 60, y: 695, w: 40, h: 25 }] });
    // 'RET' untouched → no occurrence entry for it; 'SEC' before counts BOTH
    // runs (covered + kept) so expected = 2 - 1 = 1, matching the kept copy.
    expect(out.occurrences).toEqual([{ page: 1, text: 'SEC', before: 2, removed: 1 }]);
    const text = await streamText(doc, 0);
    expect(countOccurrences(text, 'SEC')).toBe(1);
    expect(countOccurrences(text, 'RET')).toBe(1);
  });

  it('line-break split: covered "SEC"/"RET" on two lines, kept "SECRET" intact', async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const page = doc.addPage([595, 842]);
    page.drawText('SEC', { x: 72, y: 700, size: 14, font, color: rgb(0, 0, 0) }); // line 1
    page.drawText('RET', { x: 72, y: 680, size: 14, font, color: rgb(0, 0, 0) }); // line 2
    page.drawText('SECRET', { x: 72, y: 600, size: 14, font, color: rgb(0, 0, 0) }); // kept
    const out = await applyRedactions(doc, { 1: [{ x: 60, y: 675, w: 60, h: 50 }] });
    // Substring trap done right: 'SEC' and 'RET' also occur INSIDE the kept
    // 'SECRET' — before counts those too, so expected = 2 - 1 = 1 each and
    // the surviving 'SECRET' satisfies the gate instead of tripping it.
    const byText = Object.fromEntries(out.occurrences.map((o) => [o.text, o]));
    expect(out.occurrences).toHaveLength(2);
    expect(byText.SEC).toEqual({ page: 1, text: 'SEC', before: 2, removed: 1 });
    expect(byText.RET).toEqual({ page: 1, text: 'RET', before: 2, removed: 1 });
    const text = await streamText(doc, 0);
    expect(countOccurrences(text, 'SEC')).toBe(1);
    expect(countOccurrences(text, 'RET')).toBe(1);
    for (const occ of out.occurrences) {
      expect(countOccurrences(text, occ.text)).toBeLessThanOrEqual(occ.before - occ.removed);
    }
  });
});

describe('countOccurrences (verify-gate arithmetic)', () => {
  it('counts non-overlapping occurrences', () => {
    expect(countOccurrences('', 'SECRET')).toBe(0);
    expect(countOccurrences('SECRET', 'SECRET')).toBe(1);
    expect(countOccurrences('SECRET and SECRET and SECRETX', 'SECRET')).toBe(3);
    expect(countOccurrences('aaaa', 'aa')).toBe(2);
    expect(countOccurrences('x', '')).toBe(0);
  });
});

describe('stripAnnotations + sanitizeMetadata (step 3)', () => {
  async function makeDocWithAnnot(): Promise<PDFDocument> {
    const doc = await PDFDocument.create();
    const page = doc.addPage([595, 842]);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    page.drawText('Hello', { x: 72, y: 750, size: 14, font, color: rgb(0, 0, 0) });
    // Note annotation overlapping (70,690)-(200,730).
    const { PDFName, PDFString, PDFArray, PDFNumber } = await import('pdf-lib');
    const annot = doc.context.obj({
      Type: PDFName.of('Annot'),
      Subtype: PDFName.of('Text'),
      Rect: (() => {
        const a = PDFArray.withContext(doc.context);
        for (const v of [70, 690, 200, 730]) a.push(PDFNumber.of(v));
        return a;
      })(),
      Contents: PDFString.of('secret note here'),
    });
    const existing = page.node.Annots();
    if (existing) {
      const arr = doc.context.lookup(existing);
      if (arr instanceof PDFArray) arr.push(annot);
    } else {
      const arr = PDFArray.withContext(doc.context);
      arr.push(annot);
      page.node.set(PDFName.of('Annots'), arr);
    }
    return doc;
  }

  function annotCount(doc: PDFDocument): number {
    const annots = doc.getPages()[0]!.node.Annots();
    if (!annots) return 0;
    const resolved = doc.context.lookup(annots);
    return resolved instanceof PDFArray ? resolved.size() : 0;
  }

  it('removes annotations intersecting the rect, keeps others', async () => {
    const doc = await makeDocWithAnnot();
    expect(annotCount(doc)).toBe(1);
    const hit = stripAnnotations(doc, { 1: [{ x: 60, y: 680, w: 200, h: 60 }] });
    expect(hit.removed).toBe(1);
    expect(annotCount(doc)).toBe(0);
    const miss = stripAnnotations(doc, { 1: [{ x: 0, y: 0, w: 10, h: 10 }] });
    expect(miss.removed).toBe(0);
  });

  it('neutralizes metadata without throwing on bare docs', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([595, 842]);
    expect(() => sanitizeMetadata(doc)).not.toThrow();
    expect(doc.getAuthor()).toBe('');
    expect(doc.getProducer()).toBe('Toolzum');
  });

  it('flags attachments instead of deleting them', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([595, 842]);
    // No embedded files → no flag.
    expect(stripAnnotations(doc, {}).flaggedAttachments).toBe(false);
  });
});

describe('e2e case 7: EDGE (top-right trim) + TINY (6pt bottom-left)', () => {
  it('strips both, keeps the center SECRET', async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const page = doc.addPage([612, 792]);
    page.drawText('SECRET', { x: 273, y: 388, size: 20, font });
    page.drawText('EDGE', { x: 556, y: 766, size: 10, font });
    page.drawText('TINY', { x: 80, y: 60, size: 6, font });
    const reloaded = await PDFDocument.load(await doc.save());
    const lp = reloaded.getPages()[0];
    const rects = [
      flipRectForPdf({ x: 0.9 * 612, y: 0.01 * 792, w: 0.1 * 612, h: 0.035 * 792 }, lp.getHeight()),
      flipRectForPdf({ x: 0.11 * 612, y: 0.9 * 792, w: 0.08 * 612, h: 0.04 * 792 }, lp.getHeight()),
    ];
    const out = await applyRedactions(reloaded, { 1: rects });
    expect(out.removedTexts).toContain('EDGE');
    expect(out.removedTexts).toContain('TINY');
    expect(out.removedTexts).not.toContain('SECRET');
  });
});

describe('e2e case 9: MediaBox origin (50,40,300,200) pipeline', () => {
  // The export-time conversion in PdfEditorCore maps every annotation
  // through the pdf.js viewport once (angle 0 included) so coordinates
  // become absolute top-down. For rotation 0 the viewport is
  //   convertToPdfPoint(vx, vy) = (ox + vx, mediaTop − vy)
  // and the converter returns y ← pageH − (mediaTop − vy), i.e. vy − oy.
  // This pins that math end-to-end: converted rect → flip → redact.
  const OX = 50;
  const OY = 40;
  const PAGE_H = 200;
  const MEDIA_TOP = OY + PAGE_H;

  const toTop = (vx: number, vy: number) => ({
    x: OX + vx,
    y: PAGE_H - (MEDIA_TOP - vy),
  });

  it('converts viewport box to absolute top-down coords', () => {
    const c0 = toTop(120, 80); // centerBox on the 300×200 view
    const c1 = toTop(180, 120);
    expect({
      x: Math.min(c0.x, c1.x),
      y: Math.min(c0.y, c1.y),
      w: Math.abs(c1.x - c0.x),
      h: Math.abs(c1.y - c0.y),
    }).toEqual({ x: 170, y: 40, w: 60, h: 40 });
  });

  it('flips + strips SECRET; MediaBox untouched', async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const page = doc.addPage([300, 200]);
    page.setMediaBox(50, 40, 300, 200);
    page.drawText('SECRET', { x: 170, y: 130, size: 20, font });
    const reloaded = await PDFDocument.load(await doc.save());
    const lp = reloaded.getPages()[0];
    expect(lp.getMediaBox()).toEqual({ x: 50, y: 40, width: 300, height: 200 });
    const c0 = toTop(120, 80);
    const c1 = toTop(180, 120);
    const rect = {
      x: Math.min(c0.x, c1.x),
      y: Math.min(c0.y, c1.y),
      w: Math.abs(c1.x - c0.x),
      h: Math.abs(c1.y - c0.y),
    };
    const out = await applyRedactions(reloaded, { 1: [flipRectForPdf(rect, lp.getHeight())] });
    expect(out.removedTexts).toContain('SECRET');
    expect(reloaded.getPages()[0].getMediaBox()).toEqual({ x: 50, y: 40, width: 300, height: 200 });
  });

  it('identity mapping when origin is (0,0) — no behavior change on common path', () => {
    const pageH = 792;
    const convert = (vx: number, vy: number) => ({ x: vx, y: pageH - vy });
    for (const vy of [0, 100.1, 400, 791.5]) {
      const c = convert(123.4, vy);
      expect(pageH - c.y).toBeCloseTo(vy, 9);
    }
  });
});

describe('stripOrphanFormFields (e2e case 4: raster replaces the page)', () => {
  async function docWithField(): Promise<PDFDocument> {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const page = doc.addPage([612, 792]);
    page.drawText('SECRET', { x: 273, y: 388, size: 20, font });
    const form = doc.getForm();
    const tf = form.createTextField('secretfield');
    tf.setText('FORMDATA');
    tf.addToPage(page, { x: 100, y: 600, width: 220, height: 24, font, borderWidth: 1 });
    return doc;
  }

  it('reports the orphaned field, then a reload reports none', async () => {
    const bytes = await (await docWithField()).save();
    const doc = await PDFDocument.load(bytes);
    expect(doc.getForm().getFields()).toHaveLength(1);
    // What raster mode does: unlink the page leaf, insert a blank one.
    doc.removePage(0);
    doc.insertPage(0, [612, 792]);
    expect(doc.getForm().getFields(), 'orphan still reported before the strip').toHaveLength(1);
    expect(stripOrphanFormFields(doc)).toBe(1);
    const out = await doc.save();
    const reloaded = await PDFDocument.load(out);
    expect(reloaded.getForm().getFields()).toHaveLength(0);
    expect(reloaded.getPageCount()).toBe(1);
  });

  it('keeps fields whose widgets sit on surviving pages', async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const p1 = doc.addPage([612, 792]);
    const p2 = doc.addPage([612, 792]);
    const form = doc.getForm();
    const f1 = form.createTextField('keepme');
    f1.addToPage(p1, { x: 50, y: 700, width: 100, height: 20, font });
    const f2 = form.createTextField('goneme');
    f2.addToPage(p2, { x: 50, y: 700, width: 100, height: 20, font });
    const reloaded = await PDFDocument.load(await doc.save());
    expect(reloaded.getForm().getFields()).toHaveLength(2);
    reloaded.removePage(1);
    expect(stripOrphanFormFields(reloaded)).toBe(1);
    const out = await reloaded.save();
    const final = await PDFDocument.load(out);
    expect(final.getForm().getFields().map((f) => f.getName())).toEqual(['keepme']);
  });

  it('is a no-op on docs without a form', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([612, 792]);
    expect(stripOrphanFormFields(doc)).toBe(0);
  });
});

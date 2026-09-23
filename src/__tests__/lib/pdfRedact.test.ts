import { describe, it, expect } from 'vitest';
import {
  tokenize,
  mapTextRuns,
  stripRunsInRect,
  serialize,
  decodeBytes,
  applyRedactions,
  stripAnnotations,
  sanitizeMetadata,
  type Token,
} from '@/lib/pdfRedact';
import { PDFDocument, StandardFonts, rgb, PDFArray } from 'pdf-lib';

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

  async function streamText(doc: PDFDocument): Promise<string> {
    const lp = doc.getPages()[0]!;
    const contents = lp.node.Contents();
    if (!contents) return '';
    const resolved = doc.context.lookup(contents);
    const parts: string[] = [];
    const collect = (o: unknown) => {
      if (!o) return;
      const anyObj = o as { getContentsString?: unknown; getContents?: unknown };
      try {
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

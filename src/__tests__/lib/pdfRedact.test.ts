import { describe, it, expect } from 'vitest';
import {
  tokenize,
  mapTextRuns,
  stripRunsInRect,
  serialize,
  decodeBytes,
  type Token,
} from '@/lib/pdfRedact';

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

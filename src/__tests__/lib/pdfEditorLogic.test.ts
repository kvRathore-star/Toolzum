import { describe, it, expect } from 'vitest';
import {
  hitTestText,
  pruneEmptyAnnos,
  moveLayerIndex,
  wrapLines,
  type Anno,
} from '@/components/tools/modules/pdf/PdfEditor';

const text = (over: Partial<Extract<Anno, { kind: 'text' }>> = {}): Anno => ({
  kind: 'text', x: 100, y: 100, text: 'Hello', size: 14, color: '#000', bold: false, ...over,
});

describe('hitTestText (overlap-stacking regression)', () => {
  it('returns null on empty space', () => {
    expect(hitTestText([text()], 10, 10)).toBeNull();
    expect(hitTestText([], 100, 100)).toBeNull();
  });

  it('hits inside a text box', () => {
    expect(hitTestText([text()], 120, 95)).toBe(0);
  });

  it('topmost box wins on overlap (z-order tiebreak, Figma rule)', () => {
    const a = text({ x: 100, y: 100, text: 'A' });
    const b = text({ x: 105, y: 105, text: 'B' });
    expect(hitTestText([a, b], 120, 100)).toBe(1);
  });

  it('has generous grace for tiny/thin boxes (single char)', () => {
    const tiny = text({ x: 100, y: 100, text: 'I', size: 10 });
    // 8px outside the true glyph bounds must still select.
    expect(hitTestText([tiny], 100 - 5, 100)).toBe(0);
    expect(hitTestText([tiny], 100, 100 + 5)).toBe(0);
  });

  it('hits flow boxes by wrapped height, not single line', () => {
    const flow: Anno = { kind: 'flow', x: 50, y: 200, w: 200, text: 'one two three four five six', size: 12, color: '#000', bold: false };
    // Second wrapped line — would miss with single-line math.
    expect(hitTestText([flow], 60, 200 + 12 * 1.25 * 1.5)).toBe(0);
  });

  it('hits note icons', () => {
    const note: Anno = { kind: 'note', x: 300, y: 300, text: 'hi', color: '#fff3a3' };
    expect(hitTestText([note], 310, 310)).toBe(0);
    expect(hitTestText([note], 10, 10)).toBeNull();
  });
});

describe('pruneEmptyAnnos (ghost-box regression)', () => {
  it('drops empty text/flow boxes, keeps everything else', () => {
    const list: Anno[] = [
      text({ text: '  ' }),
      text({ text: 'keep' }),
      { kind: 'flow', x: 0, y: 0, w: 10, text: '', size: 12, color: '#000', bold: false },
      { kind: 'note', x: 0, y: 0, text: '', color: '#fff3a3' },
      { kind: 'draw', points: [0, 0, 1, 1], color: '#000', width: 1 },
    ];
    const out = pruneEmptyAnnos(list);
    expect(out.length).toBe(3);
    expect(out[0]).toBe(list[1]);
  });
});

describe('moveLayerIndex (z-order)', () => {
  it('moves one step and tracks the index', () => {
    const r = moveLayerIndex(['a', 'b', 'c'], 0, 1);
    expect(r.list).toEqual(['b', 'a', 'c']);
    expect(r.index).toBe(1);
  });

  it('is a no-op at the edges (never throws)', () => {
    expect(moveLayerIndex(['a'], 0, 1)).toEqual({ list: ['a'], index: 0 });
    expect(moveLayerIndex(['a'], 0, -1)).toEqual({ list: ['a'], index: 0 });
    expect(moveLayerIndex([], 0, 1)).toEqual({ list: [], index: 0 });
  });
});

describe('wrapLines (preview/export agreement)', () => {
  it('splits paragraphs independently', () => {
    expect(wrapLines('ab\ncdef gh', 1000, (s) => s.length)).toEqual(['ab', 'cdef gh']);
  });
});

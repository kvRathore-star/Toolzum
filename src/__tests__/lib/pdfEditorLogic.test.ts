import { describe, it, expect } from 'vitest';
import {
  hitTestText,
  pruneEmptyAnnos,
  moveLayerIndex,
  wrapLines,
  pushVersion,
  splitAiLines,
  parseSensitiveList,
  mapOcrWords,
  MAX_VERSIONS,
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

describe('pushVersion (retention ceiling)', () => {
  it(`keeps at most ${MAX_VERSIONS} versions, evicting oldest`, () => {
    let vs: ReturnType<typeof pushVersion> = [];
    for (let i = 0; i < MAX_VERSIONS + 5; i++) {
      vs = pushVersion(vs, { at: i, annos: {}, page: 1, label: `v${i}` });
    }
    expect(vs.length).toBe(MAX_VERSIONS);
    expect(vs[0]!.label).toBe('v5');
    expect(vs[MAX_VERSIONS - 1]!.label).toBe(`v${MAX_VERSIONS + 4}`);
  });
});

describe('splitAiLines (AI insert shaping)', () => {
  it('wraps long prose and caps lines', () => {
    const out = splitAiLines('word '.repeat(100), 75, 20);
    expect(out.length).toBeLessThanOrEqual(20);
    expect(out.every((l) => l.length <= 80)).toBe(true);
  });

  it('empty/AI-garbage input yields no phantom annotations', () => {
    expect(splitAiLines('   ')).toEqual([]);
    expect(splitAiLines('')).toEqual([]);
  });
});

describe('parseSensitiveList (malformed-AI degradation)', () => {
  it('parses bare and fenced JSON', () => {
    expect(parseSensitiveList('["a@b.c"]')).toEqual(['a@b.c']);
    expect(parseSensitiveList('```json\n["a@b.c"]\n```')).toEqual(['a@b.c']);
  });

  it('degrades every malformed shape to [] (never throws, never corrupts)', () => {
    expect(parseSensitiveList('')).toEqual([]);
    expect(parseSensitiveList('no json here')).toEqual([]);
    expect(parseSensitiveList('{"not": "an array"}')).toEqual([]);
    expect(parseSensitiveList('[1,2')).toEqual([]);
    expect(parseSensitiveList('[\"ok\", 42, null]')).toEqual(['ok']);
  });

  it('caps at 60 entries', () => {
    const big = `[${Array.from({ length: 100 }, (_, i) => `"s${i}"`).join(',')}]`;
    expect(parseSensitiveList(big).length).toBe(60);
  });
});

describe('mapOcrWords (geometry mapping)', () => {
  it('maps bboxes with size clamping and drops blanks', () => {
    const out = mapOcrWords([
      { text: 'hi', confidence: 95.4, bbox: { x0: 10, y0: 20, x1: 50, y1: 40 } },
      { text: '   ', confidence: 10, bbox: { x0: 0, y0: 0, x1: 1, y1: 1 } },
      { text: 'tall', confidence: 80, bbox: { x0: 0, y0: 0, x1: 10, y1: 1000 } },
    ], 2);
    expect(out.length).toBe(2);
    expect(out[0]).toEqual({ text: 'hi', x: 20, y: 40, size: 40, conf: 95 });
    expect(out[1]!.size).toBe(48); // clamped
  });
});

import { describe, it, expect } from 'vitest';
import {
  hitTestText,
  hitTestAnno,
  restructureAnnos,
  capStructuralHistory,
  inlineEditBox,
  pruneEmptyAnnos,
  moveLayerIndex,
  wrapLines,
  pushVersion,
  splitAiLines,
  parseSensitiveList,
  mapOcrWords,
  groupParagraphs,
  annoFlag,
  MAX_VERSIONS,
  MAX_STRUCTURAL_UNDO,
  type Anno,
  type HistEntry,
} from '@/components/tools/modules/pdf/PdfEditor';

const text = (over: Partial<Extract<Anno, { kind: 'text' }>> = {}): Anno => ({
  kind: 'text', x: 100, y: 100, text: 'Hello', size: 14, color: '#000', bold: false, ...over,
});

describe('hitTestAnno (unselectable-shape regression)', () => {
  const shape = (over: Partial<Extract<Anno, { kind: 'shape' }>> = {}): Anno => ({
    kind: 'shape', shape: 'rect', x: 100, y: 100, w: 200, h: 120, color: '#000', width: 1, ...over,
  });

  it('hits the INTERIOR of an unfilled rect (was: only the 1px border)', () => {
    expect(hitTestAnno([shape()], 200, 160)).toBe(0);
    expect(hitTestAnno([shape()], 105, 105)).toBe(0);
  });

  it('misses far outside the shape', () => {
    expect(hitTestAnno([shape()], 10, 10)).toBeNull();
    expect(hitTestAnno([shape()], 400, 300)).toBeNull();
  });

  it('hits ellipse by bbox interior too', () => {
    expect(hitTestAnno([shape({ shape: 'ellipse' })], 200, 160)).toBe(0);
  });

  it('hits a line near the stroke, not its whole bbox', () => {
    const line = shape({ shape: 'line', x: 0, y: 0, w: 100, h: 100 });
    expect(hitTestAnno([line], 50, 50)).toBe(0); // on the diagonal
    expect(hitTestAnno([line], 5, 95)).toBeNull(); // inside bbox, off the line
  });

  it('hits image/highlight interior', () => {
    expect(hitTestAnno([{ kind: 'image', x: 10, y: 10, w: 50, h: 50, dataUrl: 'x' }], 30, 30)).toBe(0);
    expect(hitTestAnno([{ kind: 'highlight', x: 10, y: 10, w: 50, h: 50, color: '#ff0' }], 30, 30)).toBe(0);
  });

  it('still hits text via the same topmost-wins rule', () => {
    const a = shape({ x: 0, y: 0, w: 400, h: 400 });
    const b = text({ x: 100, y: 100 });
    expect(hitTestAnno([a, b], 120, 95)).toBe(1);
  });

  it('returns null on empty list', () => {
    expect(hitTestAnno([], 0, 0)).toBeNull();
  });
});

describe('restructureAnnos (page-op annotation-wipe regression)', () => {
  const annos = (): Record<number, Anno[]> => ({
    1: [text({ x: 10, y: 20 }), { kind: 'highlight', x: 5, y: 5, w: 50, h: 20, color: '#ff0' }],
    2: [{ kind: 'note', x: 30, y: 40, text: 'n', color: '#fff' }],
    3: [{ kind: 'draw', points: [1, 2, 3, 4], color: '#000', width: 1 }],
  });

  it('delete: drops the page, shifts later pages down, keeps the rest', () => {
    const out = restructureAnnos(annos(), 'delete', 1, 3);
    expect(out[1]![0]).toMatchObject({ kind: 'note' }); // old page 2
    expect(out[2]![0]).toMatchObject({ kind: 'draw' }); // old page 3
    expect(out[3]).toBeUndefined();
  });

  it('duplicate: copies the page’s annos and shifts later pages up', () => {
    const out = restructureAnnos(annos(), 'duplicate', 1, 3);
    expect(out[1]).toHaveLength(2);
    expect(out[2]).toHaveLength(2); // copy
    expect(out[2]![0]).toMatchObject({ kind: 'text' });
    expect(out[3]![0]).toMatchObject({ kind: 'note' }); // old page 2
    expect(out[4]![0]).toMatchObject({ kind: 'draw' }); // old page 3
  });

  it('left/right: swaps annotation lists with the neighbor page', () => {
    const out = restructureAnnos(annos(), 'right', 1, 3);
    expect(out[1]![0]).toMatchObject({ kind: 'note' });
    expect(out[2]![0]).toMatchObject({ kind: 'text' });
    expect(out[3]![0]).toMatchObject({ kind: 'draw' });
  });

  it('rotate: never wipes — remaps rect coords 90° CW (H = 800)', () => {
    const out = restructureAnnos(annos(), 'rotate', 1, 3, 800);
    // highlight (5,5,50,20) → x' = 800−5−20=775, y'=5, w'=20, h'=50
    expect(out[1]![1]).toMatchObject({ kind: 'highlight', x: 775, y: 5, w: 20, h: 50 });
    // text anchor (10,20) → (800−20, 10) = (780, 10)
    expect(out[1]![0]).toMatchObject({ kind: 'text', x: 780, y: 10 });
    // other pages untouched by key, coords transformed per-list
    expect(out[2]).toHaveLength(1);
    expect(out[3]![0]).toMatchObject({ kind: 'draw' });
    // draw points (1,2,3,4) → (800−2,1, 800−4,3) = (798,1,796,3)
    expect((out[3]![0] as Extract<Anno, { kind: 'draw' }>).points).toEqual([798, 1, 796, 3]);
  });

  it('rotate with H=0 is still non-destructive (keys and counts preserved)', () => {
    const out = restructureAnnos(annos(), 'rotate', 1, 3, 0);
    expect(Object.keys(out).sort()).toEqual(['1', '2', '3']);
    expect(out[1]).toHaveLength(2);
    expect(out[2]).toHaveLength(1);
    expect(out[3]).toHaveLength(1);
  });
});

describe('capStructuralHistory (silent-cap / orphaned-undo regression)', () => {
  const anno = (): HistEntry => ({ annos: {} });
  const structural = (): HistEntry => ({ annos: {}, bytes: new Uint8Array([1]), pageCount: 3, page: 1 });
  const kinds = (stack: HistEntry[]) => stack.map((e) => (e.bytes ? 'p' : 'n'));

  it('is a no-op at or under the cap', () => {
    const stack = [structural(), structural(), structural()];
    const r = capStructuralHistory(stack);
    expect(r.dropped).toBe(false);
    expect(r.stack).toBe(stack);
  });

  it('on overflow drops the oldest structural entry AND everything older than it', () => {
    const stack = [
      anno(), structural(), anno(), // n, p1, n — the trailing n sits AFTER p1
      structural(), structural(), structural(), structural(), structural(), // p2..p6
    ];
    const r = capStructuralHistory(stack);
    expect(r.dropped).toBe(true);
    // Up through p1 gone (including the pre-p1 anno); the post-p1 anno and p2..p6 stay.
    expect(kinds(r.stack)).toEqual(['n', 'p', 'p', 'p', 'p', 'p']);
    expect(r.stack.filter((e) => e.bytes)).toHaveLength(MAX_STRUCTURAL_UNDO);
  });

  it('never leaves an annos-only entry older than the oldest structural anchor', () => {
    // Worst case: annotation entries piled up BEFORE the first page op.
    const stack = [
      anno(), anno(), structural(),
      structural(), structural(), structural(), structural(), structural(),
    ];
    const r = capStructuralHistory(stack);
    expect(r.dropped).toBe(true);
    const oldestStructural = r.stack.findIndex((e) => e.bytes);
    expect(oldestStructural).toBe(0); // pre-p1 annos orphaned along with p1
    expect(r.stack.filter((e) => e.bytes)).toHaveLength(MAX_STRUCTURAL_UNDO);
  });

  it('empty / annos-only stacks pass through untouched', () => {
    expect(capStructuralHistory([])).toEqual({ stack: [], dropped: false });
    const annosOnly = [anno(), anno()];
    const r = capStructuralHistory(annosOnly);
    expect(r.dropped).toBe(false);
    expect(r.stack).toBe(annosOnly);
  });
});

describe('inlineEditBox (in-place edit overlay geometry)', () => {
  const text = (over: Partial<Extract<Anno, { kind: 'text' }>> = {}): Anno => ({
    kind: 'text', x: 100, y: 200, text: 'Hello', size: 12, color: '#000', bold: false, ...over,
  });

  it('text: top sits one ascent above the baseline; left-align anchors at x', () => {
    const box = inlineEditBox(text(), 2)!;
    expect(box.top).toBe((200 - 12) * 2);
    expect(box.left).toBe(100 * 2);
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeCloseTo(12 * 2 * 1.4);
  });

  it('text: center/right alignment shift left edge by the estimated width', () => {
    const left = inlineEditBox(text({ align: 'left' }), 1)!;
    const center = inlineEditBox(text({ align: 'center' }), 1)!;
    const right = inlineEditBox(text({ align: 'right' }), 1)!;
    expect(center.left).toBeLessThan(left.left);
    expect(right.left).toBeLessThan(center.left);
    // center shifts by half the estimate; right shifts by the full width
    expect(left.left - center.left).toBeCloseTo(center.width / 2);
    expect(center.left - right.left).toBeCloseTo(right.width / 2);
    expect(left.left - right.left).toBeCloseTo(right.width);
  });

  it('flow: width follows the box, height follows wrapped line count', () => {
    const flow: Anno = { kind: 'flow', x: 50, y: 60, w: 200, text: 'word '.repeat(80), size: 10, color: '#000', bold: false };
    const box = inlineEditBox(flow, 2)!;
    expect(box.left).toBe(100);
    expect(box.width).toBe(400);
    expect(box.top).toBe((60 - 10) * 2);
    const oneLine: Anno = { ...(flow as Extract<Anno, { kind: 'flow' }>), text: 'hi' };
    const small = inlineEditBox(oneLine, 2)!;
    expect(box.height).toBeGreaterThan(small.height);
  });

  it('note: expands to the full sticky editable area from the icon origin', () => {
    const box = inlineEditBox({ kind: 'note', x: 10, y: 20, text: 'n', color: '#fff3a3' }, 2)!;
    expect(box).toEqual({ left: 20, top: 40, width: 392, height: 220 });
  });

  it('non-text kinds return null (no inline editor)', () => {
    expect(inlineEditBox({ kind: 'highlight', x: 0, y: 0, w: 1, h: 1, color: '#ff0' }, 1)).toBeNull();
    expect(inlineEditBox({ kind: 'draw', points: [0, 0, 1, 1], color: '#000', width: 1 }, 1)).toBeNull();
    expect(inlineEditBox({ kind: 'image', x: 0, y: 0, w: 1, h: 1, dataUrl: 'data:,' }, 1)).toBeNull();
  });
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

describe('annoFlag (format-bar state without casts)', () => {
  it('reads text flags, flow bold-only, nothing else', () => {
    expect(annoFlag(text({ bold: true }), 'bold')).toBe(true);
    expect(annoFlag(text({ bold: false }), 'bold')).toBe(false);
    expect(annoFlag(text({ italic: true } as Partial<Extract<Anno, { kind: 'text' }>> as Extract<Anno, { kind: 'text' }>), 'italic')).toBe(true);
    const flow: Anno = { kind: 'flow', x: 0, y: 0, w: 10, text: 'x', size: 12, color: '#000', bold: true };
    expect(annoFlag(flow, 'bold')).toBe(true);
    expect(annoFlag(flow, 'italic')).toBe(false);
    expect(annoFlag(undefined, 'bold')).toBe(false);
    expect(annoFlag({ kind: 'draw', points: [], color: '#000', width: 1 }, 'bold')).toBe(false);
  });
});

describe('groupParagraphs', () => {  const item = (x: number, yTop: number, str: string, size = 12): Parameters<typeof groupParagraphs>[0][number] => ({
    x, yTop, w: 50, size, bold: false, str, fontName: 'Arial',
  });

  it('groups one visual line, splits on paragraph gaps', () => {
    const groups = groupParagraphs([
      item(0, 100, 'a'),
      item(60, 100, 'b'),
      item(0, 150, 'c'),
    ]);
    expect(groups.length).toBe(2);
    expect(groups[0]!.map((i) => i.str)).toEqual(['a', 'b']);
    expect(groups[1]!.map((i) => i.str)).toEqual(['c']);
  });

  it('handles empty input', () => {
    expect(groupParagraphs([])).toEqual([]);
  });
});

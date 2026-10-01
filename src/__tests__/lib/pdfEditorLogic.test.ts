import { describe, it, expect } from 'vitest';
import {
  hitTestText,
  hitTestAnno,
  restructureAnnos,
  moveAnnosPage,
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
  handlePoints,
  hitHandle,
  resizeRect,
  isResizableAnno,
  matchBoxes,
  piiItemHit,
  bytesEqual,
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

describe('moveAnnosPage (drag-reorder annotation-follow)', () => {
  const annos = (): Record<number, Anno[]> => ({
    1: [text({ x: 10, y: 20 })], // A
    2: [{ kind: 'note', x: 30, y: 40, text: 'n', color: '#fff' }], // B
    3: [{ kind: 'draw', points: [1, 2, 3, 4], color: '#000', width: 1 }], // C
  });

  it('move first page to end: later pages shift up, mover lands last', () => {
    const out = moveAnnosPage(annos(), 0, 2, 3);
    expect(out[1]![0]).toMatchObject({ kind: 'note' }); // B
    expect(out[2]![0]).toMatchObject({ kind: 'draw' }); // C
    expect(out[3]![0]).toMatchObject({ kind: 'text' }); // A follows itself
  });

  it('move last page to front: earlier pages shift down', () => {
    const out = moveAnnosPage(annos(), 2, 0, 3);
    expect(out[1]![0]).toMatchObject({ kind: 'draw' }); // C
    expect(out[2]![0]).toMatchObject({ kind: 'text' }); // A
    expect(out[3]![0]).toMatchObject({ kind: 'note' }); // B
  });

  it('middle → later slot shifts only the in-between range (4-page doc)', () => {
    const four: Record<number, Anno[]> = {
      1: [text({ text: 'A' })],
      2: [text({ text: 'B' })],
      3: [text({ text: 'C' })],
      4: [text({ text: 'D' })],
    };
    // pdf-lib semantics: remove B, insert at post-removal index 2 → A C B D?
    // j(C)=1 <2 → stays 1; j(D)=2 ≥2 → 3; moving at 2 → A C B D.
    const out = moveAnnosPage(four, 1, 2, 4);
    expect(out[1]![0]).toMatchObject({ text: 'A' });
    expect(out[2]![0]).toMatchObject({ text: 'C' });
    expect(out[3]![0]).toMatchObject({ text: 'B' });
    expect(out[4]![0]).toMatchObject({ text: 'D' });
  });

  it('no-op and out-of-range return equivalent copies (never corrupt)', () => {
    const a = annos();
    expect(moveAnnosPage(a, 1, 1, 3)).toEqual(a);
    expect(moveAnnosPage(a, -1, 0, 3)).toEqual(a);
    expect(moveAnnosPage(a, 0, 3, 3)).toEqual(a); // to past end
    expect(moveAnnosPage(a, 3, 0, 3)).toEqual(a); // from past end
    expect(moveAnnosPage(a, 0, 2, 3)).not.toBe(a); // real moves are new maps
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
  it('reads text and flow flags, nothing else', () => {
    expect(annoFlag(text({ bold: true }), 'bold')).toBe(true);
    expect(annoFlag(text({ bold: false }), 'bold')).toBe(false);
    expect(annoFlag(text({ italic: true } as Partial<Extract<Anno, { kind: 'text' }>> as Extract<Anno, { kind: 'text' }>), 'italic')).toBe(true);
    const flow: Anno = { kind: 'flow', x: 0, y: 0, w: 10, text: 'x', size: 12, color: '#000', bold: true };
    expect(annoFlag(flow, 'bold')).toBe(true);
    expect(annoFlag(flow, 'italic')).toBe(false);
    const flowStyled: Anno = { kind: 'flow', x: 0, y: 0, w: 10, text: 'x', size: 12, color: '#000', bold: false, italic: true, underline: true, strike: true };
    expect(annoFlag(flowStyled, 'italic')).toBe(true);
    expect(annoFlag(flowStyled, 'underline')).toBe(true);
    expect(annoFlag(flowStyled, 'strike')).toBe(true);
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

describe('resize handles (eight-way bbox geometry)', () => {
  const box = { x: 100, y: 100, w: 200, h: 120 };

  it('handlePoints: 4 corners + 4 edge midpoints', () => {
    const pts = handlePoints(box);
    expect(pts.nw).toEqual({ x: 100, y: 100 });
    expect(pts.ne).toEqual({ x: 300, y: 100 });
    expect(pts.se).toEqual({ x: 300, y: 220 });
    expect(pts.sw).toEqual({ x: 100, y: 220 });
    expect(pts.n).toEqual({ x: 200, y: 100 });
    expect(pts.e).toEqual({ x: 300, y: 160 });
    expect(pts.s).toEqual({ x: 200, y: 220 });
    expect(pts.w).toEqual({ x: 100, y: 160 });
  });

  it('hitHandle: finds handles within grace, misses center and outside', () => {
    expect(hitHandle(box, 102, 98, 6)).toBe('nw');
    expect(hitHandle(box, 300, 160, 6)).toBe('e');
    expect(hitHandle(box, 200, 220, 6)).toBe('s');
    expect(hitHandle(box, 200, 160, 6)).toBeNull(); // center
    expect(hitHandle(box, 90, 90, 6)).toBeNull(); // outside grace
    expect(hitHandle(box, 0, 0, 6)).toBeNull();
  });

  it('resizeRect: se grows from anchored top-left; nw shrinks from anchored bottom-right', () => {
    expect(resizeRect(box, 'se', { x: 350, y: 260 })).toEqual({ x: 100, y: 100, w: 250, h: 160 });
    expect(resizeRect(box, 'nw', { x: 140, y: 130 })).toEqual({ x: 140, y: 130, w: 160, h: 90 });
  });

  it('resizeRect: edge handles move one axis only', () => {
    const e = resizeRect(box, 'e', { x: 340, y: 999 });
    expect(e).toEqual({ x: 100, y: 100, w: 240, h: 120 });
    const n = resizeRect(box, 'n', { x: -999, y: 140 });
    expect(n).toEqual({ x: 100, y: 140, w: 200, h: 80 });
  });

  it('resizeRect: never collapses below minSize (no flip, no zero-area)', () => {
    const se = resizeRect(box, 'se', { x: 50, y: 50 }, 8);
    expect(se.w).toBeGreaterThanOrEqual(8);
    expect(se.h).toBeGreaterThanOrEqual(8);
    expect(se.x).toBe(100);
    const nw = resizeRect(box, 'nw', { x: 500, y: 500 }, 8);
    expect(nw.w).toBeGreaterThanOrEqual(8);
    expect(nw.h).toBeGreaterThanOrEqual(8);
    expect(nw.x + nw.w).toBe(300);
  });

  it('isResizableAnno: shape/image only — text-family edits inline instead', () => {
    expect(isResizableAnno({ kind: 'shape', shape: 'rect', x: 0, y: 0, w: 1, h: 1, color: '#000', width: 1 })).toBe(true);
    expect(isResizableAnno({ kind: 'shape', shape: 'line', x: 0, y: 0, w: 1, h: 1, color: '#000', width: 1 })).toBe(true);
    expect(isResizableAnno({ kind: 'image', x: 0, y: 0, w: 1, h: 1, dataUrl: 'x' })).toBe(true);
    expect(isResizableAnno(text())).toBe(false);
    expect(isResizableAnno({ kind: 'highlight', x: 0, y: 0, w: 1, h: 1, color: '#ff0' })).toBe(false);
    expect(isResizableAnno({ kind: 'flow', x: 0, y: 0, w: 1, text: 'x', size: 12, color: '#000', bold: false })).toBe(false);
    expect(isResizableAnno(undefined)).toBe(false);
  });
});

// Find/replace sub-rects (release-blocking data-loss fix, Oct 2026):
// the old code whited out the ENTIRE text item and retypeset only the
// replacement, so "Hello world" → replace "world" with "there" destroyed
// "Hello " as well. Every test here pins the split-by-offset contract.
describe('matchBoxes (find/replace sub-rects)', () => {
  const item = { x: 100, yTop: 200, w: 110, size: 12, str: 'Hello world' };
  const measure10 = (s: string) => s.length * 10; // "Hello world" → 110 == item.w

  it('“world” gets only its own sub-rect — prefix “Hello ” stays untouched', () => {
    const boxes = matchBoxes(item, 'world', measure10);
    expect(boxes).toHaveLength(1);
    const b = boxes[0]!;
    expect(b.x).toBeCloseTo(160); // 100 + measure("Hello ") ratio
    expect(b.w).toBeCloseTo(50); // measure("world")
    expect(b.start).toBe(6);
    expect(b.x + b.w).toBeCloseTo(item.x + item.w); // right edge lands on the item edge
  });

  it('regression: box never spans the whole item (old whiteout did)', () => {
    const b = matchBoxes(item, 'world', measure10)[0]!;
    expect(b.x).not.toBeCloseTo(item.x);
    expect(b.w).not.toBeCloseTo(item.w);
  });

  it('every occurrence in one item gets a box (old code replaced once)', () => {
    const boxes = matchBoxes({ x: 0, yTop: 0, w: 130, size: 10, str: 'aa aa aa' }, 'aa', measure10);
    expect(boxes).toHaveLength(3);
    expect(boxes.map((bx) => bx.start)).toEqual([0, 3, 6]);
  });

  it('case-insensitive needle, original-casing geometry', () => {
    const b = matchBoxes({ x: 0, yTop: 0, w: 110, size: 10, str: 'Hello World' }, 'world', measure10)[0]!;
    expect(b.start).toBe(6);
    expect(b.x).toBeCloseTo(60);
    expect(b.w).toBeCloseTo(50);
  });

  it('degenerate measure falls back to char-count ratio (no NaN, no slide)', () => {
    const b = matchBoxes(item, 'world', () => 0)[0]!;
    expect(b.x).toBeCloseTo(item.x + (6 / 11) * 110);
    expect(b.w).toBeCloseTo((5 / 11) * 110);
    expect(Number.isFinite(b.x)).toBe(true);
    expect(Number.isFinite(b.w)).toBe(true);
  });

  it('no match → empty list; empty needle → empty list', () => {
    expect(matchBoxes(item, 'zzz', measure10)).toEqual([]);
    expect(matchBoxes(item, '', measure10)).toEqual([]);
  });

  it('semantic: "Hello world" − "world" + "there" composes to "Hello there"', () => {
    const [b] = matchBoxes(item, 'world', measure10);
    expect(b).toBeTruthy();
    const prefix = item.str.slice(0, b!.start); // untouched head
    const suffix = item.str.slice(b!.start + 'world'.length); // untouched tail
    expect(prefix + 'there' + suffix).toBe('Hello there');
  });
});

// PII sweep false-positive guard: a one-char or whitespace item used to
// satisfy s.includes(t) for nearly every needle, whiting out whole pages.
describe('piiItemHit (sweep match guard)', () => {
  const needles = ['john@x.com', '+1-555-0100'];

  it('short items never match (old s.includes(t) avalanche)', () => {
    expect(piiItemHit('a', needles)).toBe(false);
    expect(piiItemHit(' 1', needles)).toBe(false);
    expect(piiItemHit('   ', needles)).toBe(false);
    expect(piiItemHit('', needles)).toBe(false);
  });

  it('needle inside item → hit', () => {
    expect(piiItemHit('My email is john@x.com here', needles)).toBe(true);
    expect(piiItemHit('call +1-555-0100 now', needles)).toBe(true);
  });

  it('item inside needle → hit only when item is substantial', () => {
    expect(piiItemHit('john@', needles)).toBe(true); // 5 chars, prefix of needle
    expect(piiItemHit('555-0100', needles)).toBe(true);
    expect(piiItemHit('+1-', needles)).toBe(false); // 3 chars — too brittle
  });

  it('sub-4-char needles are ignored (AI noise like “a”, “12”)', () => {
    expect(piiItemHit('The quick brown fox', ['a'])).toBe(false);
    expect(piiItemHit('Invoice 12345', ['12'])).toBe(false);
  });
});

// Export-gate equality (Phase 1: page-only edits must export with 0 annos).
describe('bytesEqual (export gate "did the file change?")', () => {
  it('identical content from different objects → true', () => {
    expect(bytesEqual(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 3]))).toBe(true);
  });

  it('same reference → true', () => {
    const a = new Uint8Array([9]);
    expect(bytesEqual(a, a)).toBe(true);
  });

  it('different length → false (no OOB read)', () => {
    expect(bytesEqual(new Uint8Array([1, 2]), new Uint8Array([1, 2, 3]))).toBe(false);
    expect(bytesEqual(new Uint8Array([]), new Uint8Array([1]))).toBe(false);
  });

  it('differs only at the LAST byte → false (loop must reach the end)', () => {
    const a = new Uint8Array(1000).fill(7);
    const b = new Uint8Array(1000).fill(7);
    b[999] = 8;
    expect(bytesEqual(a, b)).toBe(false);
  });

  it('page-op output vs original → false (gate opens)', () => {
    const original = new Uint8Array([137, 80, 78, 71, 13, 10]);
    const afterRotate = new Uint8Array([137, 80, 78, 71, 13, 11]);
    expect(bytesEqual(original, afterRotate)).toBe(false);
  });
});

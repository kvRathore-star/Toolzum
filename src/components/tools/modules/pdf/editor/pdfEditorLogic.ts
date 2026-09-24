// Pure, DOM-free PDF-editor logic: annotation model, geometry hit-tests,
// page-op remaps (restructure/move), undo/version caps, OCR/AI text helpers.
// Unit-tested headlessly (pdfEditorLogic.test.ts). Core imports these;
// UI leaves must consume them through Core, never re-implement them.
import { fontCss, type PdfFont } from '@/lib/pdfFonts';

export const HIGHLIGHT_COLORS = ['#ffff00', '#00ff00', '#00ccff', '#ff99cc', '#ff9900'];
export const INK_COLORS = ['#000000', '#1a56db', '#c81e1e', '#047857'];

export type Tool = 'text' | 'highlight' | 'draw' | 'whiteout' | 'image' | 'sign' | 'shape' | 'note' | 'retype' | 'select' | 'redact';

export interface TextAnno { kind: 'text'; x: number; y: number; text: string; size: number; color: string; bold: boolean; italic?: boolean; underline?: boolean; strike?: boolean; align?: 'left' | 'center' | 'right'; font?: PdfFont }
interface RectAnno { kind: 'highlight' | 'whiteout'; x: number; y: number; w: number; h: number; color: string; opacity?: number }
interface DrawAnno { kind: 'draw'; points: number[]; color: string; width: number }
interface ImageAnno { kind: 'image'; x: number; y: number; w: number; h: number; dataUrl: string }
interface ShapeAnno { kind: 'shape'; shape: 'rect' | 'ellipse' | 'line' | 'arrow'; x: number; y: number; w: number; h: number; color: string; width: number }
interface NoteAnno { kind: 'note'; x: number; y: number; text: string; color: string }
export interface FlowAnno { kind: 'flow'; x: number; y: number; w: number; text: string; size: number; color: string; bold: boolean; font?: PdfFont }
// RedactAnno marks TRUE redaction regions (black burn + text-byte stripping
// on export) — visually distinct from whiteout cover-up by design.
interface RedactAnno { kind: 'redact'; x: number; y: number; w: number; h: number }
type Anno = TextAnno | RectAnno | DrawAnno | ImageAnno | ShapeAnno | NoteAnno | FlowAnno | RedactAnno;
export type { Anno };

/**
 * Pure geometry helpers (module scope = unit-testable without a DOM).
 * These encode the regression classes from the field: overlap stacking,
 * ghost boxes, z-order.
 */

/** Topmost text-family box containing the point (6pt grace), or null. */
export function hitTestText(
  list: Anno[],
  x: number,
  y: number,
): number | null {
  for (let i = list.length - 1; i >= 0; i--) {
    const a = list[i]!;
    if (a.kind === 'text') {
      const w = Math.max(20, a.text.length * a.size * 0.55);
      if (x >= a.x - 6 && x <= a.x + w + 6 && y >= a.y - a.size - 6 && y <= a.y + 6) return i;
    } else if (a.kind === 'flow') {
      const lines = wrapLines(a.text || 'x', a.w, (s) => s.length * a.size * 0.55);
      const h = lines.length * a.size * 1.25 + 8;
      if (x >= a.x - 6 && x <= a.x + a.w + 6 && y >= a.y - a.size - 6 && y <= a.y + h) return i;
    } else if (a.kind === 'note') {
      if (x >= a.x - 6 && x <= a.x + 196 && y >= a.y - 6 && y <= a.y + 116) return i;
    }
  }
  return null;
}

/** Drop text/flow boxes with no content (stray-click litter). */
export function pruneEmptyAnnos(list: Anno[]): Anno[] {
  return list.filter((a) => {
    if (a.kind === 'text' || a.kind === 'flow') return a.text.trim().length > 0;
    return true;
  });
}

/**
 * CSS box (screen px) for the inline-edit overlay of a text-family
 * annotation. Coordinates mirror drawOverlay: points × scale, y down,
 * text baseline at a.y → control top sits one ascent above it. Returns
 * null for kinds that don't edit inline. Pure — tested.
 */
export function inlineEditBox(
  a: Anno,
  scale: number,
): { left: number; top: number; width: number; height: number } | null {
  if (a.kind === 'text') {
    // Same width estimate as hitTestText so the control covers the ink.
    const estW = Math.max(48, (a.text.length + 2) * a.size * 0.55);
    const leftPt = a.align === 'center' ? a.x - estW / 2 : a.align === 'right' ? a.x - estW : a.x;
    return { left: leftPt * scale, top: (a.y - a.size) * scale, width: estW * scale, height: a.size * scale * 1.4 };
  }
  if (a.kind === 'flow') {
    const lines = Math.max(1, wrapLines(a.text || 'x', a.w, (s) => s.length * a.size * 0.55).length);
    return {
      left: a.x * scale,
      top: (a.y - a.size) * scale,
      width: a.w * scale,
      height: (lines * a.size * 1.25 + a.size * 0.5) * scale,
    };
  }
  if (a.kind === 'note') {
    // hitTestText grace box (196×116 from the icon origin) — the sticky
    // expands to its full editable area while typing.
    return { left: a.x * scale, top: a.y * scale, width: 196 * scale, height: 110 * scale };
  }
  return null;
}

/** Move index one step; out-of-range is a no-op (never throws). */
export function moveLayerIndex<T>(list: T[], index: number, dir: 1 | -1): { list: T[]; index: number } {
  const j = index + dir;
  if (index < 0 || index >= list.length || j < 0 || j >= list.length) return { list, index };
  const next = [...list];
  const [a] = next.splice(index, 1);
  next.splice(j, 0, a!);
  return { list: next, index: j };
}

/**
 * Remap annotations through a page-structure op so they are NEVER wiped.
 * - rotate: 90° CW in viewport space (old viewport height H): point
 *   (x,y) → (H−y, x); rects also swap w/h. Storage stays in the current
 *   viewport frame, which is what placement and (via convertToPdfPoint)
 *   export already use.
 * - duplicate/delete/left/right: pure key remaps; annotations follow
 *   their pages. Same mapping applies to undo/redo snapshots so history
 *   stays consistent with the new page order.
 * Pure — tested.
 */
export function restructureAnnos(
  annos: Record<number, Anno[]>,
  op: 'rotate' | 'duplicate' | 'delete' | 'left' | 'right',
  page: number,
  pageCount: number,
  oldVpH = 0,
): Record<number, Anno[]> {
  const next: Record<number, Anno[]> = {};
  if (op === 'rotate') {
    const H = oldVpH;
    for (const [k, list] of Object.entries(annos)) {
      next[Number(k)] = list.map((a): Anno => {
        if (a.kind === 'draw') {
          const pts: number[] = [];
          for (let i = 0; i < a.points.length; i += 2) pts.push(H - a.points[i + 1]!, a.points[i]!);
          return { ...a, points: pts };
        }
        if (a.kind === 'text' || a.kind === 'note' || a.kind === 'flow') {
          return { ...a, x: H - a.y, y: a.x };
        }
        return { ...a, x: H - a.y - a.h, y: a.x, w: a.h, h: a.w };
      });
    }
    return next;
  }
  if (op === 'duplicate') {
    for (let p = 1; p <= pageCount + 1; p++) {
      if (p < page) next[p] = annos[p] || [];
      else if (p === page) next[p] = annos[page] || [];
      else if (p === page + 1) next[p] = [...(annos[page] || [])];
      else next[p] = annos[p - 1] || [];
    }
    return next;
  }
  if (op === 'delete') {
    for (let p = 1; p <= pageCount - 1; p++) {
      next[p] = p < page ? annos[p] || [] : annos[p + 1] || [];
    }
    return next;
  }
  const other = op === 'left' ? page - 1 : page + 1;
  for (let p = 1; p <= pageCount; p++) {
    if (p === page) next[p] = annos[other] || [];
    else if (p === other) next[p] = annos[page] || [];
    else next[p] = annos[p] || [];
  }
  return next;
}

/**
 * Remap annos for moving page `from` to insert index `to` (both 0-based,
 * pdf-lib remove+insert semantics — `to` is the index in the POST-removal
 * array, so `to === pageCount - 1` lands at the end). Annotations follow
 * their pages; the in-between range shifts by one slot. No-op (equivalent
 * copy) on self-moves and out-of-range input. Pure — tested.
 */
export function moveAnnosPage(
  annos: Record<number, Anno[]>,
  from: number,
  to: number,
  pageCount: number,
): Record<number, Anno[]> {
  if (
    from === to ||
    from < 0 || from >= pageCount ||
    to < 0 || to >= pageCount
  ) {
    return { ...annos };
  }
  const next: Record<number, Anno[]> = {};
  const moving = annos[from + 1] || [];
  for (let p = 1; p <= pageCount; p++) {
    const i = p - 1;
    if (i === from) continue;
    const j = i < from ? i : i - 1; // after removePage(from)
    const new0 = j >= to ? j + 1 : j; // after insertPage(to, …)
    next[new0 + 1] = annos[p] || [];
  }
  next[to + 1] = moving;
  return next;
}

function distToSeg(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

/**
 * Topmost annotation containing the point, ANY kind — the reselection path.
 * Unfilled shapes/images/highlights hit on the whole interior (bbox + grace),
 * not just the 1px border: an empty outline used to be unclickable inside,
 * trapping users who could not re-select it to delete. Lines/arrows/freehand
 * hit near the stroke. Pure — tested.
 */
export function hitTestAnno(list: Anno[], x: number, y: number, grace = 6): number | null {
  for (let i = list.length - 1; i >= 0; i--) {
    const a = list[i]!;
    if (a.kind === 'text') {
      const w = Math.max(20, a.text.length * a.size * 0.55);
      if (x >= a.x - grace && x <= a.x + w + grace && y >= a.y - a.size - grace && y <= a.y + grace) return i;
    } else if (a.kind === 'flow') {
      const lines = wrapLines(a.text || 'x', a.w, (s) => s.length * a.size * 0.55);
      const h = lines.length * a.size * 1.25 + 8;
      if (x >= a.x - grace && x <= a.x + a.w + grace && y >= a.y - a.size - grace && y <= a.y + h) return i;
    } else if (a.kind === 'note') {
      if (x >= a.x - grace && x <= a.x + 196 && y >= a.y - grace && y <= a.y + 116) return i;
    } else if (a.kind === 'draw') {
      const p = a.points;
      const tol = grace + a.width;
      if (p.length >= 4) {
        let hit = false;
        for (let j = 0; j + 3 < p.length; j += 2) {
          if (distToSeg(x, y, p[j]!, p[j + 1]!, p[j + 2]!, p[j + 3]!) <= tol) { hit = true; break; }
        }
        if (hit) return i;
      } else if (p.length === 2 && Math.hypot(x - p[0]!, y - p[1]!) <= tol) {
        return i;
      }
    } else if (a.kind === 'shape' && (a.shape === 'line' || a.shape === 'arrow')) {
      if (distToSeg(x, y, a.x, a.y, a.x + a.w, a.y + a.h) <= grace + a.width) return i;
    } else if (
      a.kind === 'highlight' || a.kind === 'whiteout' || a.kind === 'redact' ||
      a.kind === 'image' || a.kind === 'shape'
    ) {
      if (x >= a.x - grace && x <= a.x + a.w + grace && y >= a.y - grace && y <= a.y + a.h + grace) return i;
    }
  }
  return null;
}

export interface TextItem {
  x: number;
  yTop: number;
  w: number;
  size: number;
  bold: boolean;
  str: string;
  fontName: string;
}

/**
 * Resize handles (P1): eight-way bbox resize for shape + image annos,
 * Select tool only. All geometry is pure so the contract lives in tests,
 * not pointer arithmetic. Text-family annos edit inline instead of
 * resizing (their bbox is derived from content, not stored).
 */
export type ResizeHandleId = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export const RESIZE_HANDLES: ResizeHandleId[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

/** Screen cursor per handle (classic eight-way resize affordance). */
export const HANDLE_CURSORS: Record<ResizeHandleId, string> = {
  nw: 'nwse-resize',
  n: 'ns-resize',
  ne: 'nesw-resize',
  e: 'ew-resize',
  se: 'nwse-resize',
  s: 'ns-resize',
  sw: 'nesw-resize',
  w: 'ew-resize',
};

/** Only these kinds expose a resizable bbox (text-family edits inline). */
export function isResizableAnno(a: Anno | undefined): a is ShapeAnno | ImageAnno {
  return a?.kind === 'shape' || a?.kind === 'image';
}

/** Handle centers in the same units as the bbox (PDF points). */
export function handlePoints(a: {
  x: number;
  y: number;
  w: number;
  h: number;
}): Record<ResizeHandleId, { x: number; y: number }> {
  const { x, y, w, h } = a;
  return {
    nw: { x, y },
    n: { x: x + w / 2, y },
    ne: { x: x + w, y },
    e: { x: x + w, y: y + h / 2 },
    se: { x: x + w, y: y + h },
    s: { x: x + w / 2, y: y + h },
    sw: { x, y: y + h },
    w: { x, y: y + h / 2 },
  };
}

/** Nearest handle whose center is within `grace` of the point, else null. */
export function hitHandle(
  a: { x: number; y: number; w: number; h: number },
  x: number,
  y: number,
  grace = 6,
): ResizeHandleId | null {
  const pts = handlePoints(a);
  for (const id of RESIZE_HANDLES) {
    const p = pts[id]!;
    if (Math.abs(x - p.x) <= grace && Math.abs(y - p.y) <= grace) return id;
  }
  return null;
}

/**
 * Grow/shrink a bbox by dragging `handle` to `pointer`: the opposite
 * edge stays anchored, size never drops below `minSize` (no flip, no
 * zero-area collapse — the line/arrow endpoints ride the bbox corners).
 * Pure — tested.
 */
export function resizeRect(
  a: { x: number; y: number; w: number; h: number },
  handle: ResizeHandleId,
  pointer: { x: number; y: number },
  minSize = 8,
): { x: number; y: number; w: number; h: number } {
  let left = a.x;
  let top = a.y;
  let right = a.x + a.w;
  let bottom = a.y + a.h;
  if (handle.includes('w')) left = Math.min(pointer.x, right - minSize);
  if (handle.includes('e')) right = Math.max(pointer.x, left + minSize);
  if (handle.includes('n')) top = Math.min(pointer.y, bottom - minSize);
  if (handle.includes('s')) bottom = Math.max(pointer.y, top + minSize);
  return { x: left, y: top, w: right - left, h: bottom - top };
}

/**
 * Group text-layer items into paragraphs: sort by y, cluster lines whose
 * baselines sit within half a line-height, then split clusters separated
 * by a full line-height gap or a short last line. Heuristic, not typesetting
 * — good enough for select-paragraph and retype scoping. Pure — tested.
 */
export function groupParagraphs(items: TextItem[]): TextItem[][] {
  if (items.length === 0) return [];
  const sorted = [...items].sort((a, b) => a.yTop - b.yTop || a.x - b.x);
  const lines: TextItem[][] = [];
  for (const it of sorted) {
    const last = lines[lines.length - 1];
    const prev = last?.[last.length - 1];
    if (last && prev && Math.abs(it.yTop - prev.yTop) <= Math.max(it.size, prev.size) * 0.6) {
      last.push(it);
    } else {
      lines.push([it]);
    }
  }
  const paras: TextItem[][] = [];
  for (const line of lines) {
    const prev = paras[paras.length - 1];
    const prevLine = prev ? [prev[prev.length - 1]!] : null;
    const gap = prevLine ? line[0]!.yTop - (prevLine[0]!.yTop + prevLine[0]!.size) : 0;
    const prevSize = prevLine ? prevLine[0]!.size : 0;
    if (prev && gap <= prevSize * 1.1) {
      prev.push(...line);
    } else {
      paras.push([...line]);
    }
  }
  return paras;
}

/** Read a style flag off a text/flow annotation (flow supports bold only). */
export function annoFlag(a: Anno | undefined, key: 'bold' | 'italic' | 'underline' | 'strike'): boolean {
  if (!a) return false;
  if (a.kind === 'text') return !!a[key];
  if (a.kind === 'flow') return key === 'bold' ? a.bold : false;
  return false;
}
/** A version-history entry: full annotations + page + label. */
export interface EditorVersion {
  at: number;
  annos: Record<number, Anno[]>;
  page: number;
  label: string;
  /** Page count when saved — restore warns if the document has changed shape. */
  pageCount?: number;
}

/** Max retained versions (session-only, in-memory — see retention note). */
export const MAX_VERSIONS = 10;

/** Append a version, evicting oldest beyond the cap. Pure — tested. */
export function pushVersion(
  prev: EditorVersion[],
  entry: EditorVersion,
): EditorVersion[] {
  return [...prev, entry].slice(-MAX_VERSIONS);
}

/**
 * One undo-stack entry. Annotation-only entries are just a prior annos
 * snapshot. Structural entries (page rotate/delete/move/duplicate) also
 * carry the pre-op PDF bytes + page indices so undo can restore the old
 * document wholesale — never remapped annos on new bytes.
 */
export interface HistEntry {
  annos: Record<number, Anno[]>;
  bytes?: Uint8Array;
  pageCount?: number;
  page?: number;
}

/** Structural (bytes-carrying) undo entries each pin a full file copy. */
export const MAX_STRUCTURAL_UNDO = 5;

/**
 * Enforce the structural-undo cap. When the newest push makes structural
 * entries exceed the max: drop the OLDEST structural entry AND everything
 * older than it. Older annotation-only snapshots reference pre-op page
 * numbering — once their structural anchor is gone they can never be
 * applied correctly (silent corruption), so they go with it. Entries
 * newer than the cutoff (annotation edits between later page ops) stay.
 * Returns `dropped` so the caller can say so out loud instead of
 * silently shrinking history. Pure — tested.
 */
export function capStructuralHistory(stack: HistEntry[]): { stack: HistEntry[]; dropped: boolean } {
  let structural = 0;
  let oldest = -1;
  for (let i = 0; i < stack.length; i++) {
    if (stack[i]!.bytes) {
      structural++;
      if (oldest < 0) oldest = i;
    }
  }
  if (structural <= MAX_STRUCTURAL_UNDO || oldest < 0) return { stack, dropped: false };
  return { stack: stack.slice(oldest + 1), dropped: true };
}

/** Split AI prose into short exportable lines. Pure — tested. */
export function splitAiLines(out: string, maxChars = 75, maxLines = 20): string[] {
  const words = out.replace(/\s+/g, ' ').split(' ').filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const trial = cur ? `${cur} ${w}` : w;
    if (trial.length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = trial;
    }
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines.slice(0, maxLines);
}

/** Parse the PII-sweep JSON (fenced or bare). Never throws — malformed AI output degrades to []. */
export function parseSensitiveList(out: string): string[] {
  try {
    const cleaned = out.replace(/```json|```/g, '').trim();
    const parsed: unknown = JSON.parse(cleaned.slice(cleaned.indexOf('[')));
    if (Array.isArray(parsed)) return parsed.filter((s): s is string => typeof s === 'string').slice(0, 60);
    return [];
  } catch {
    return [];
  }
}

/** Map OCR words (image px) to page points. Pure — tested. */
export function mapOcrWords(
  words: { text: string; confidence: number; bbox: { x0: number; y0: number; x1: number; y1: number } }[],
  kx: number,
): { text: string; x: number; y: number; size: number; conf: number }[] {
  return words
    .filter((w) => w.text.trim().length > 0)
    .map((w) => ({
      text: w.text.trim(),
      x: w.bbox.x0 * kx,
      y: w.bbox.y0 * kx,
      size: Math.max(6, Math.min(48, (w.bbox.y1 - w.bbox.y0) * kx)),
      conf: Math.round(w.confidence),
    }));
}
/**
 * Word-wrap shared by canvas preview and pdf-lib export — one function so
 * the two can never disagree on line breaks. measure must draw with the
 * same font string the renderer uses.
 */
export function wrapLines(
  text: string,
  maxWidth: number,
  measure: (_line: string) => number,
): string[] {
  const out: string[] = [];
  for (const para of text.split('\n')) {
    const words = para.replace(/\s+/g, ' ').split(' ').filter(Boolean);
    let cur = '';
    for (const w of words) {
      const trial = cur ? `${cur} ${w}` : w;
      if (measure(trial) > maxWidth && cur) {
        out.push(cur);
        cur = w;
      } else {
        cur = trial;
      }
    }
    out.push(cur);
  }
  return out.length > 0 ? out : [''];
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return {
    r: parseInt(v.slice(0, 2), 16) / 255,
    g: parseInt(v.slice(2, 4), 16) / 255,
    b: parseInt(v.slice(4, 6), 16) / 255,
  };
}

// Canvas preview stacks use the metric-compatible webfonts (Arimo/Tinos/
// Cousine) with system fallbacks — same metrics as the embedded export
// fonts, so preview and output agree.
export function canvasFont(sizePx: number, bold: boolean, italic: boolean, font: PdfFont = 'sans'): string {
  return `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${sizePx}px ${fontCss(font)}`;
}

// Emoji stamps: Helvetica can't render color emoji, so rasterize each
// glyph to a PNG on an offscreen canvas and stamp it as an image —
// exports identically everywhere, no font dependency.
export const EMOJI_SET = ['✅', '⭐', '❤️', '➡️', '⚠️', '✔️', '❌', '💡', '📌', '🎉', '👍', '🔥'];
export const EMOJI_ALL: { emoji: string; name: string; cat: string }[] = [
  { emoji: '✅', name: 'check', cat: 'Symbols' }, { emoji: '✔️', name: 'heavy check', cat: 'Symbols' },
  { emoji: '❌', name: 'cross', cat: 'Symbols' }, { emoji: '⚠️', name: 'warning', cat: 'Symbols' },
  { emoji: '⭐', name: 'star', cat: 'Symbols' }, { emoji: '❤️', name: 'heart', cat: 'Smileys' },
  { emoji: '➡️', name: 'arrow right', cat: 'Symbols' }, { emoji: '💡', name: 'idea', cat: 'Objects' },
  { emoji: '📌', name: 'pin', cat: 'Objects' }, { emoji: '🎉', name: 'party', cat: 'Objects' },
  { emoji: '👍', name: 'thumbs up', cat: 'Gestures' }, { emoji: '🔥', name: 'fire', cat: 'Objects' },
  { emoji: '😀', name: 'grin', cat: 'Smileys' }, { emoji: '😂', name: 'joy', cat: 'Smileys' },
  { emoji: '😍', name: 'heart eyes', cat: 'Smileys' }, { emoji: '🤔', name: 'thinking', cat: 'Smileys' },
  { emoji: '😢', name: 'cry', cat: 'Smileys' }, { emoji: '😎', name: 'cool', cat: 'Smileys' },
  { emoji: '👏', name: 'clap', cat: 'Gestures' }, { emoji: '🙏', name: 'pray', cat: 'Gestures' },
  { emoji: '👎', name: 'thumbs down', cat: 'Gestures' }, { emoji: '✋', name: 'hand', cat: 'Gestures' },
  { emoji: '👀', name: 'eyes', cat: 'Smileys' }, { emoji: '💯', name: 'hundred', cat: 'Symbols' },
  { emoji: '❓', name: 'question', cat: 'Symbols' }, { emoji: '❗', name: 'exclaim', cat: 'Symbols' },
  { emoji: '💰', name: 'money', cat: 'Objects' }, { emoji: '📅', name: 'calendar', cat: 'Objects' },
  { emoji: '📞', name: 'phone', cat: 'Objects' }, { emoji: '✉️', name: 'mail', cat: 'Objects' },
  { emoji: '🔒', name: 'lock', cat: 'Objects' },
  { emoji: '🚀', name: 'rocket', cat: 'Objects' }, { emoji: '🏆', name: 'trophy', cat: 'Objects' },
  { emoji: '📝', name: 'memo', cat: 'Objects' },
  { emoji: '⚡', name: 'zap', cat: 'Symbols' }, { emoji: '🌟', name: 'glow star', cat: 'Symbols' },
  { emoji: '⭕', name: 'circle', cat: 'Symbols' }, { emoji: '🔴', name: 'red circle', cat: 'Symbols' },
  { emoji: '🟢', name: 'green circle', cat: 'Symbols' }, { emoji: '🔵', name: 'blue circle', cat: 'Symbols' },
  { emoji: '⬆️', name: 'arrow up', cat: 'Symbols' }, { emoji: '⬇️', name: 'arrow down', cat: 'Symbols' },
  { emoji: '©️', name: 'copyright', cat: 'Symbols' }, { emoji: '®️', name: 'registered', cat: 'Symbols' },
  { emoji: '™️', name: 'trademark', cat: 'Symbols' },
];

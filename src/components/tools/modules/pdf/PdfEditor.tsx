"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { PDFDocument, StandardFonts, rgb, degrees, type PDFFont } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { setupPdfWorker } from '@/lib/pdfjsWorker';
import { Type, Highlighter, PenLine, Image as ImageIcon, PenTool, Eraser, Undo2, Redo2, Download, ChevronLeft, ChevronRight, Trash2, Square, StickyNote, RotateCw, CopyPlus, FileMinus2, Sparkles, ScanText, MousePointerClick, TextSelect, Copy, ClipboardPaste, Layers, Maximize2, Minimize2, Keyboard, MoveLeft, MoveRight, Save, Search, BringToFront, SendToBack, History, Flag, MessageCircleQuestion, EyeOff } from 'lucide-react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { clipboardWrite } from '@/lib/clipboard';
import { inputCls, labelCls } from '../Calculators.shared';
import { useAiProvider } from '@/hooks/useAiProvider';
import { useProStatus } from '@/hooks/useProStatus';
import { useSession } from '@/lib/auth-client';
import { Turnstile } from '@marsidev/react-turnstile';
import type { PdfFont } from '@/lib/pdfFonts';
import { fontCss, detectFontFamily, detectBold, loadFontBytes, ensurePreviewFont } from '@/lib/pdfFonts';
import Link from 'next/link';

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

// Demand-gate: posts an email to the shared notify-me waitlist (same table
// as ComingSoon pages). Used for OCR languages beyond the big three and for
// real-time collaboration interest — features get built on votes, not guesses.
function RequestFeature({ tool, prompt, placeholder }: { tool: string; prompt: string; placeholder: string }) {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const send = async () => {
    const addr = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(addr)) {
      toast.error('Enter a valid email to get notified.');
      return;
    }
    if (TURNSTILE_SITE_KEY && !token) {
      toast.error('Complete the verification first.');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/notify-me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: addr, tool, captcha: token }),
      });
      const data = await res.json().catch(() => ({})) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setDone(true);
        setEmail('');
      } else if (data.error === 'captcha_failed') {
        toast.error('Verification failed — please try again.');
        setToken(null);
      } else {
        toast.error("Couldn't save that — please try again.");
      }
    } catch {
      toast.error('Network error — check your connection and try again.');
    } finally {
      setSending(false);
    }
  };
  if (done) return <p className="text-xs text-green-600 dark:text-green-400 font-semibold">✓ Noted — you&apos;ll hear from us if it ships.</p>;
  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--text-secondary)]">{prompt}</p>
      <div className="flex flex-wrap gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          aria-label="Email for launch notification"
          className="flex-1 min-w-[180px] bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        />
        <button onClick={send} disabled={sending} className="px-4 py-2 rounded-xl bg-[var(--accent-ink)] text-white text-xs font-bold disabled:opacity-50">
          {sending ? 'Saving…' : 'Notify me'}
        </button>
      </div>
      {TURNSTILE_SITE_KEY && (
        <Turnstile siteKey={TURNSTILE_SITE_KEY} onSuccess={setToken} onExpire={() => setToken(null)} />
      )}
    </div>
  );
}

setupPdfWorker(pdfjsLib);

const RENDER_SCALE = 1.5;
// Upload caps: generous across the board — the browser (not our server)
// does the work, so size costs us nothing. guests 125MB, signed-in 125MB,
// Pro unlimited (device memory is the only real ceiling; huge files may
// still crawl on weak hardware and the editor says so).
const FREE_MAX_MB = 125;
// Page caps are device-memory honesty, not pricing: rendering + thumbs for
// hundreds of pages will OOM mobile browsers whichever plan pays. Tiers
// reflect likely hardware (Pro skews desktop), capped where physics bites.
const MAX_PAGES_ANON = 150;
const MAX_PAGES_SIGNED = 300;
const MAX_PAGES_PRO = 500;
const THUMB_INITIAL = 60;
const HIGHLIGHT_COLORS = ['#ffff00', '#00ff00', '#00ccff', '#ff99cc', '#ff9900'];
const INK_COLORS = ['#000000', '#1a56db', '#c81e1e', '#047857'];

type Tool = 'text' | 'highlight' | 'draw' | 'whiteout' | 'image' | 'sign' | 'shape' | 'note' | 'retype' | 'select' | 'redact';

interface TextAnno { kind: 'text'; x: number; y: number; text: string; size: number; color: string; bold: boolean; italic?: boolean; underline?: boolean; strike?: boolean; align?: 'left' | 'center' | 'right'; font?: PdfFont }
interface RectAnno { kind: 'highlight' | 'whiteout'; x: number; y: number; w: number; h: number; color: string; opacity?: number }
interface DrawAnno { kind: 'draw'; points: number[]; color: string; width: number }
interface ImageAnno { kind: 'image'; x: number; y: number; w: number; h: number; dataUrl: string }
interface ShapeAnno { kind: 'shape'; shape: 'rect' | 'ellipse' | 'line' | 'arrow'; x: number; y: number; w: number; h: number; color: string; width: number }
interface NoteAnno { kind: 'note'; x: number; y: number; text: string; color: string }
interface FlowAnno { kind: 'flow'; x: number; y: number; w: number; text: string; size: number; color: string; bold: boolean; font?: PdfFont }
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

function hexToRgb(hex: string): { r: number; g: number; b: number } {
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
function canvasFont(sizePx: number, bold: boolean, italic: boolean, font: PdfFont = 'sans'): string {
  return `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${sizePx}px ${fontCss(font)}`;
}

export default function PdfEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  // Zoom: annotations are stored in PDF points (scale-independent), so the
  // render scale can change freely — multiply by `scale` to draw, divide to
  // capture, export uses points directly.
  const [scale, setScale] = useState(RENDER_SCALE);
  const [tool, setTool] = useState<Tool>('text');
  const [annos, setAnnos] = useState<Record<number, Anno[]>>({});
  const [selected, setSelected] = useState<{ page: number; index: number } | null>(null);
  const [textColor, setTextColor] = useState('#000000');
  const [textSize, setTextSize] = useState(14);
  const [textBold, setTextBold] = useState(false);
  const [textItalic, setTextItalic] = useState(false);
  const [textUnderline, setTextUnderline] = useState(false);
  const [textStrike, setTextStrike] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [textFont, setTextFont] = useState<PdfFont>('sans');
  const [markColor, setMarkColor] = useState(HIGHLIGHT_COLORS[0]!);
  const [markOpacity, setMarkOpacity] = useState(0.4);
  const [inkColor, setInkColor] = useState(INK_COLORS[0]!);
  const [brushWidth, setBrushWidth] = useState(1.7);
  const [shapeVariant, setShapeVariant] = useState<'rect' | 'ellipse' | 'line' | 'arrow'>('rect');
  const [shapeWidth, setShapeWidth] = useState(1.5);
  const [exporting, setExporting] = useState(false);
  const [showSignPad, setShowSignPad] = useState(false);
  // Thumbnails: first window immediately, then only the ±25 pages around
  // the current one (a 300-pager never needs 300 dataURLs at once). "Show
  // all" fills the rest idle. Nulls stay as placeholders so indexes always
  // match page numbers.
  const [thumbUrls, setThumbUrls] = useState<(string | null)[]>([]);
  const [thumbsAll, setThumbsAll] = useState(false);
  const loadedRef = useRef<Set<number>>(new Set());
  const [aiWorking, setAiWorking] = useState(false);
  const isPro = useProStatus();
  const [ocrWords, setOcrWords] = useState<{ text: string; x: number; y: number; size: number; conf: number }[]>([]);
  const [ocrRunning, setOcrRunning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrLang, setOcrLang] = useState('eng');
  // Redaction mode: Selective strips text bytes (keeps the page live);
  // Maximum rasterizes redacted pages to images (nothing extractable at
  // all, but text selection dies with it). Explicit user choice, stated.
  const [redactMode, setRedactMode] = useState<'selective' | 'maximum'>('selective');
  const redactCount = Object.values(annos).reduce((n, l) => n + l.filter((a) => a.kind === 'redact').length, 0);
  const [showShortcuts, setShowShortcuts] = useState(false);
  // One-time "what changed" banner per release marker (not per version —
  // bump the marker only when the toolbar actually moves again). Lazy
  // initializer (no setState-in-effect); module is client-only (ssr:false).
  const [showNews, setShowNews] = useState<boolean>(() => {
    try {
      return localStorage.getItem('toolzum:pdf-editor-news') !== 'toolbar-2';
    } catch {
      return true;
    }
  });
  const dismissNews = () => {
    try {
      localStorage.setItem('toolzum:pdf-editor-news', 'toolbar-2');
    } catch { /* ignore */ }
    setShowNews(false);
  };
  // Screen-reader page text: canvas pixels expose nothing to AT. Fed from
  // the cached text layer; empty on scanned pages until OCR runs.
  const [pageText, setPageText] = useState('');
  // Draft text for the selected-text field: commits on Enter/blur, Escape
  // reverts (live-per-keystroke re-rendered the overlay on every press).
  const [textDraft, setTextDraft] = useState<string | null>(null);
  // Inline in-place edit (double-click / place-and-type): a real
  // <input>/<textarea> overlay inside the canvas div — NOT canvas-drawn
  // text — so the window listener's typing guard suspends global
  // shortcuts automatically. There is deliberately NO suspend flag:
  // a flag needs a clear path per exit, and a missed one silences the
  // whole keyboard (the leak class this architecture refuses).
  const [inlineEdit, setInlineEdit] = useState<{ page: number; index: number } | null>(null);
  const [inlineDraft, setInlineDraft] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasColRef = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState(false);

  // Autosave (IndexedDB — file-sized data doesn't fit localStorage):
  // debounced after edits, explicit Save button, recovery on mount.
  // "Save" persists working state; "Download PDF" exports flattened output.
  // Dirty-ness is DERIVED (last-saved identity vs current), never set in an
  // effect — the repo's hooks rules forbid setState-in-effect bodies.
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const lastSaved = useRef<{ annos: Record<number, Anno[]>; page: number } | null>(null);
  // Live inline draft counts as unsaved work: without this, typing in the
  // overlay leaves `dirty` false (annos unchanged until flush), so the
  // beforeunload guard stays silent and a tab close mid-edit loses the
  // draft with no warning. (Single ref read — React Compiler fans out
  // one warning per repeated `lastSaved.current` access on this line.)
  const inlineUnsaved = (() => {
    if (!inlineEdit) return false;
    const a = annos[inlineEdit.page]?.[inlineEdit.index];
    if (!a || (a.kind !== 'text' && a.kind !== 'flow' && a.kind !== 'note')) return false;
    const v = a.kind === 'note' ? inlineDraft.slice(0, 240) : inlineDraft;
    return v !== a.text;
  })();
  const dirty =
    (!!fileBytes && (lastSaved.current === null || lastSaved.current.annos !== annos)) ||
    (!!fileBytes && inlineUnsaved);

  const idb = () =>
    new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open('toolzum-pdf-editor', 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore('sessions');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

  const writeDraft = async (annosSnap: Record<number, Anno[]>, bytes: Uint8Array | null, name: string | undefined, pg: number) => {
    if (!bytes) return false;
    setSaving(true);
    try {
      const db = await idb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('sessions', 'readwrite');
        tx.objectStore('sessions').put(
          { bytes: bytes.slice().buffer as ArrayBuffer, name: name || 'document.pdf', annos: annosSnap, page: pg, updatedAt: Date.now() },
          'draft',
        );
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      db.close();
      lastSaved.current = { annos: annosSnap, page: pg };
      setSavedAt(Date.now());
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveNow = async (silent = false, annosOverride?: Record<number, Anno[]>) => {
    if (!fileBytes) return;
    if (!silent) toast.loading('Saving…', { id: 'pdfedit-save' });
    // Override lets callers flush a live inline edit first — otherwise a
    // Ctrl+S mid-edit would persist the annotation's last-committed text
    // while the screen shows something newer (autosave-never-loses-what-
    // you-see, applied to the save seam too).
    const snapshot = annosOverride ?? annos;
    const ok = await writeDraft(snapshot, fileBytes, file?.name, page);
    if (!silent) {
      if (ok) toast.success('Saved — pick up where you left off anytime.', { id: 'pdfedit-save' });
      else toast.error('Save failed — browser storage may be full or blocked.', { id: 'pdfedit-save' });
    }
  };

  // Version history: timestamped snapshots beside the rolling draft.
  // Autosave protects against crashes; history protects against mistakes
  // (deleted blocks, bad replaces) that autosave would otherwise cement.
  // Retention ceiling: last MAX_VERSIONS, session-only (in-memory, never
  // IndexedDB) — each entry is full annos + page, tiny vs the PDF, and
  // nothing accumulates across visits to fill browser storage.
  const [versions, setVersions] = useState<EditorVersion[]>([]);
  const [showVersions, setShowVersions] = useState(false);

  const takeVersion = (label: string) => {
    setVersions((prev) => pushVersion(prev, { at: Date.now(), annos: structuredClone(annos), page, label, pageCount }));
  };

  const restoreVersion = (at: number) => {
    const v = versions.find((e) => e.at === at);
    if (!v) return;
    takeVersion('before restore');
    setAnnos(structuredClone(v.annos));
    setPage(Math.max(1, Math.min(v.page, pageCount)));
    setSelected(null);
    setShowVersions(false);
    const shapeChanged = v.pageCount !== undefined && v.pageCount !== pageCount;
    toast.success(
      `Restored “${v.label}”. Previous state kept as newest version.` +
      (shapeChanged
        ? ` ⚠ Saved on ${v.pageCount} page(s); document now has ${pageCount} — versions don't store the file itself, so use Undo (Ctrl+Z) if the page layout also needs to go back.`
        : ''),
      { duration: shapeChanged ? 8000 : 4000 },
    );
  };

  const fmtAge = (at: number) => {
    const m = Math.max(0, Math.round((Date.now() - at) / 60000));
    return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : `${Math.round(m / 60)}h ago`;
  };
  // Multi-tab conflict guard: two tabs editing means last-writer-wins data
  // loss. Each tab announces its writes; a tab that sees a NEWER external
  // write while holding unsaved local edits warns instead of overwriting.
  const tabId = useRef(`${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`);
  const [conflict, setConflict] = useState(false);
  const externalWriteRef = useRef(0);
  const saveStampRef = useRef(0);

  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('toolzum-pdf-editor');
      channel.onmessage = (e: MessageEvent<{ from?: string; at?: number }>) => {
        if (!e.data || e.data.from === tabId.current) return;
        externalWriteRef.current = Math.max(externalWriteRef.current, e.data.at || Date.now());
        // Warn only if we hold unsaved edits the other tab can't see.
        if (dirtyRef.current) setConflict(true);
      };
    } catch {
      /* BroadcastChannel absent — single-tab assumption stands */
    }
    return () => channel?.close();
  }, []);

  const announceWrite = () => {
    try {
      new BroadcastChannel('toolzum-pdf-editor').postMessage({ from: tabId.current, at: Date.now() });
    } catch { /* ignore */ }
  };

  // Load the other tab's version (used by the conflict banner). Overwrites
  // local unsaved edits — stated on the button, never silent.
  const loadExternalDraft = async () => {
    try {
      const db = await idb();
      const row = await new Promise<{
        bytes?: ArrayBuffer; name?: string; annos?: Record<number, Anno[]>; page?: number;
      } | null>((resolve, reject) => {
        const tx = db.transaction('sessions', 'readonly');
        const req = tx.objectStore('sessions').get('draft');
        req.onsuccess = () => resolve((req.result as typeof row) || null);
        req.onerror = () => reject(req.error);
      });
      db.close();
      if (!row || !row.bytes) {
        toast.error('No saved version found.');
        return;
      }
      await openBytes(new Uint8Array(row.bytes), row.name || 'document.pdf');
      setAnnos(row.annos || {});
      if (row.page) setPage(row.page);
      lastSaved.current = { annos: row.annos || {}, page: row.page || 1 };
      externalWriteRef.current = 0;
      setConflict(false);
      toast.success('Loaded the other tab’s version.');
    } catch {
      toast.error('Could not load the saved version.');
    }
  };

  // Ref mirror of dirty for the channel handler (updated in an effect —
  // refs must not be written during render).
  const dirtyRef = useRef(false);
  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  // Debounced autosave on edits (3s idle). Skips when neither annos nor
  // page moved since the last write (page turns alone don't rewrite 100MB).
  // Pre-write conflict check: if another tab wrote since our last save and
  // we hold unsaved edits, skip silently (banner already warns) — never
  // clobber. Announce every write we do make.
  useEffect(() => {
    if (!fileBytes) return;
    const last = lastSaved.current;
    if (last && last.annos === annos && last.page === page) return;
    const bytes = fileBytes;
    const name = file?.name;
    const pg = page;
    const snap = annos;
    const t = setTimeout(async () => {
      // Another tab wrote after our last save and we still hold unsaved
      // edits → skip this write (banner already warns). Never clobber.
      if (externalWriteRef.current > saveStampRef.current && dirtyRef.current) {
        setConflict(true);
        return;
      }
      const ok = await writeDraft(snap, bytes, name, pg);
      if (ok) {
        saveStampRef.current = Date.now();
        announceWrite();
      }
    }, 3000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annos, page]);

  // Create-PDF handoff: ?from=create-pdf + IDB key written by the Create
  // PDF tool's "Continue editing" button. Consumed on read; the draft
  // recovery below ignores it (separate keys, separate flows).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('from') !== 'create-pdf') return;
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
          const req = indexedDB.open('toolzum-handoff', 1);
          req.onupgradeneeded = () => req.result.createObjectStore('files');
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
        const row = await new Promise<{ bytes?: ArrayBuffer; name?: string } | null>((resolve, reject) => {
          const tx = db.transaction('files', 'readwrite');
          const store = tx.objectStore('files');
          const get = store.get('create-pdf→editor');
          get.onsuccess = () => {
            const val = (get.result as typeof row) || null;
            try { store.delete('create-pdf→editor'); } catch { /* ignore */ }
            resolve(val);
          };
          get.onerror = () => reject(get.error);
        });
        db.close();
        if (!row || !row.bytes || cancelled) return;
        await openBytes(new Uint8Array(row.bytes), row.name || 'created.pdf');
        if (!cancelled) toast.success('Created document loaded — annotate away.');
      } catch {
        /* no handoff — normal direct visit */
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Recovery on mount: restore last draft and say so (with age).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const db = await idb();
        const row = await new Promise<{
          bytes?: ArrayBuffer; name?: string; annos?: Record<number, Anno[]>; page?: number; updatedAt?: number;
        } | null>((resolve, reject) => {
          const tx = db.transaction('sessions', 'readonly');
          const req = tx.objectStore('sessions').get('draft');
          req.onsuccess = () => resolve((req.result as typeof row) || null);
          req.onerror = () => reject(req.error);
        });
        db.close();
        if (!row || !row.bytes || cancelled) return;
        const ageMin = Math.round((Date.now() - (row.updatedAt || Date.now())) / 60000);
        if (Date.now() - (row.updatedAt || 0) > 7 * 24 * 3600 * 1000) return; // stale
        await openBytes(new Uint8Array(row.bytes), row.name || 'recovered.pdf');
        if (cancelled) return;
        setAnnos(row.annos || {});
        if (row.page) setPage(row.page);
        lastSaved.current = { annos: row.annos || {}, page: row.page || 1 };
        setSavedAt(row.updatedAt || null);
        toast.success(`Recovered your last session${ageMin > 1 ? ` — ${ageMin} min ago` : ''}.`, { duration: 5000 });
      } catch {
        /* no draft or IDB unavailable — start clean */
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fit-to-width / fit-to-page: derive scale from the live column size and
  // the page's point dimensions (viewport units ÷ current scale).
  const fitZoom = (mode: 'width' | 'page') => {
    const col = canvasColRef.current;
    if (!col || !pdfDoc) return;
    const availW = col.clientWidth - 32;
    const availH = 640;
    const ptW = viewportRef.current.w / scale;
    const ptH = viewportRef.current.h / scale;
    if (!ptW || !ptH) return;
    const z = mode === 'width' ? availW / ptW : Math.min(availW / ptW, availH / ptH);
    setScale(Math.max(0.25, Math.min(3, Math.round(z * 100) / 100)));
  };

  // Focus = true browser fullscreen on the editor root (Google-Docs-style):
  // site chrome disappears, toolbar + canvas + thumbs stay. Falls back to
  // the panels-hidden layout where the Fullscreen API is unavailable.
  const toggleFocus = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (rootRef.current?.requestFullscreen) {
        setFocus(true);
        await rootRef.current.requestFullscreen();
      } else {
        setFocus((f) => !f);
      }
    } catch {
      setFocus((f) => !f);
    }
  };

  useEffect(() => {
    const sync = () => setFocus(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [replaceScope, setReplaceScope] = useState<'page' | 'all'>('page');
  const [replacing, setReplacing] = useState(false);
  // Find navigation: non-persisted match boxes (never exported), current in
  // solid amber, rest dashed. Cross-page when scope is All.
  const [findNav, setFindNav] = useState<{ page: number; rects: { x: number; y: number; w: number; h: number }[]; idx: number } | null>(null);

  const findMatchesOn = async (pg: number, needle: string) => {
    const items = await ensureTextLayer(pg);
    const q = needle.toLowerCase();
    return items
      .filter((it) => it.str.toLowerCase().includes(q))
      .map((it) => ({ x: it.x - 2, y: it.yTop - 2, w: it.w + 4, h: it.size + 5 }));
  };

  const findHighlight = async () => {
    const needle = findText.trim();
    if (needle.length < 2) {
      toast.error('Enter at least 2 characters to find.');
      return;
    }
    try {
      const rects = await findMatchesOn(page, needle);
      if (rects.length === 0) {
        const scopeMsg = replaceScope === 'all' ? ' on this page — try Next to scan onward' : '';
        toast.error(`No matches${scopeMsg}.`);
        setFindNav(null);
        return;
      }
      setFindNav({ page, rects, idx: 0 });
      toast.success(`${rects.length} match${rects.length === 1 ? '' : 'es'} on this page.`);
    } catch {
      toast.error('Could not read the text layer — scanned pages need OCR first.');
    }
  };

  const findStep = async (dir: 1 | -1) => {
    const needle = findText.trim();
    if (needle.length < 2 || !pdfDoc) return;
    const cur = findNav;
    const pages = replaceScope === 'all'
      ? Array.from({ length: pageCount }, (_, i) => i + 1)
      : [page];
    // Order pages starting from current, wrapping in the step direction.
    const start = pages.indexOf(cur?.page ?? page);
    const ordered: number[] = [];
    for (let k = 0; k < pages.length; k++) {
      ordered.push(pages[(start + dir * k % pages.length + pages.length) % pages.length]!);
    }
    for (const pg of ordered) {
      try {
        const rects = await findMatchesOn(pg, needle);
        if (rects.length === 0) continue;
        let idx = dir === 1 ? 0 : rects.length - 1;
        if (pg === cur?.page) {
          idx = (cur.idx + dir + rects.length) % rects.length;
        }
        if (pg !== page) goPage(pg);
        setFindNav({ page: pg, rects, idx });
        return;
      } catch { /* next page */ }
    }
    toast.error('No matches in scope.');
  };
  const ocrWorkerRef = useRef<{ recognize: (_img: string) => Promise<{ data: { words?: { text: string; confidence: number; bbox: { x0: number; y0: number; x1: number; y1: number } }[] } }> } | null>(null);
  const { generateCompletion } = useAiProvider();
  const { data: session } = useSession();
  const isSignedIn = !!session?.user;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const signPadRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ x: number; y: number; points?: number[] } | null>(null);
  const viewportRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const imagePickRef = useRef<HTMLInputElement>(null);
  const pendingImageRef = useRef<string | null>(null);

  const openBytes = async (bytes: Uint8Array, name: string) => {
    const toastId = toast.loading('Opening PDF…');
    // NOTE: isPro/isSignedIn read live here (not cached) so a mid-session
    // upgrade applies to the next file opened, no refresh needed.
    const pageCap = isPro ? MAX_PAGES_PRO : isSignedIn ? MAX_PAGES_SIGNED : MAX_PAGES_ANON;
    try {
      // A private copy goes to pdf.js (it detaches whatever buffer it parses);
      // the original stays intact for pdf-lib export. 45s timeout separates
      // "worker/file too slow" from "unparseable" in the error below.
      const doc = await Promise.race([
        pdfjsLib.getDocument({ data: bytes.slice() }).promise,
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 45000)),
      ]);
      if (doc.numPages > pageCap) {
        toast.error(`This PDF has ${doc.numPages} pages (limit ${pageCap}${isPro ? '' : ' — Pro opens up to 500'}) — split it first, then edit in parts.`, { id: toastId });
        try { await doc.destroy(); } catch { /* ignore */ }
        return;
      }
      setFile(new File([bytes as unknown as BlobPart], name, { type: 'application/pdf' }));
      setFileBytes(bytes);
      setPdfDoc(doc);
      setPageCount(doc.numPages);
      setPage(1);
      setAnnos({});
      setSelected(null);
      setThumbUrls([]);
      setThumbsAll(false);
      loadedRef.current = new Set();
      undoStack.current = [];
      redoStack.current = [];
      toast.success(`${doc.numPages}-page PDF loaded — everything stays in your browser.`, { id: toastId });
      // Preload text fonts for WYSIWYG preview (fire-and-forget; export and
      // preview fall back to base-14 offline without failing).
      (['sans', 'serif', 'mono'] as PdfFont[]).forEach((fam) => {
        ensurePreviewFont(fam, false);
        ensurePreviewFont(fam, true);
      });
      const intent = intentRef.current;
      intentRef.current = null;
      if (intent) applyPreset(intent);
    } catch (e) {
      toast.error(
        e instanceof Error && e.message === 'timeout'
          ? 'Opening is taking too long — the file may be huge or the worker failed to load. Retry, or try a smaller file.'
          : 'Could not open this PDF — it may be encrypted or corrupted.',
        { id: toastId },
      );
    }
  };

  // Warm the pdf.js worker on mount: first open raced a cold 1.4MB worker
  // load and failed intermittently ("opens after refresh" reports).
  useEffect(() => {
    fetch('/pdf.worker.min.mjs', { method: 'HEAD' }).catch(() => {});
  }, []);

  const loadFile = async (f: File) => {
    const capMB = isPro ? Infinity : FREE_MAX_MB;
    if (f.size > capMB * 1024 * 1024) {
      toast.error(`File exceeds the ${FREE_MAX_MB} MB limit — compress or split it first. Pro has no size limit.`);
      return;
    }
    await openBytes(new Uint8Array(await f.arrayBuffer()), f.name);
  };

  // Blank document: brand-new A4/Letter PDF built locally — no upload needed.
  const newBlankDoc = async (size: 'a4' | 'letter') => {
    try {
      const { PDFDocument: Lib } = await import('pdf-lib');
      const doc = await Lib.create();
      doc.addPage(size === 'a4' ? [595.28, 841.89] : [612, 792]);
      const bytes = new Uint8Array(await doc.save());
      await openBytes(bytes, size === 'a4' ? 'blank-a4.pdf' : 'blank-letter.pdf');
    } catch {
      toast.error('Could not create a blank document.');
    }
  };

  // Render current page + thumbs. `rendering` drives a progress veil so a
  // slow first paint (cold worker, heavy page) never looks like a broken
  // narrow strip — the exact confusion from field reports.
  const [rendering, setRendering] = useState(false);
  useEffect(() => {
    if (!pdfDoc) return;
    let cancelled = false;
    (async () => {
      setRendering(true);
      const pg = await pdfDoc.getPage(page);
      const viewport = pg.getViewport({ scale });
      viewportRef.current = { w: viewport.width, h: viewport.height };
      const canvas = canvasRef.current;
      const overlay = overlayRef.current;
      if (!canvas || !overlay) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (const c of [canvas, overlay]) {
        c.width = Math.floor(viewport.width * dpr);
        c.height = Math.floor(viewport.height * dpr);
        c.style.width = `${viewport.width}px`;
        c.style.height = `${viewport.height}px`;
      }
      const ctx = canvas.getContext('2d')!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      try {
        await pg.render({ canvasContext: ctx, viewport }).promise;
      } finally {
        if (!cancelled) setRendering(false);
      }
      if (!cancelled) {
        // Silent-blank guard: a resolved render can still leave an unpainted
        // canvas (worker/transform edge cases). Sample the center pixel —
        // transparent means nothing painted. One auto-retry, then console
        // diagnostics, instead of a mysterious white sliver.
        let painted = true;
        try {
          const sample = ctx.getImageData(Math.floor(viewport.width / 2), Math.floor(viewport.height / 2), 1, 1).data;
          painted = sample[3]! > 0;
        } catch {
          painted = true; // tainted canvas — can't sample, assume painted
        }
        if (!painted) {
          console.warn('[pdf-editor] blank paint detected, retrying render', { w: viewport.width, h: viewport.height, scale });
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          await pg.render({ canvasContext: ctx, viewport }).promise;
        }
        drawOverlay();
        ensureTextLayer(page).then((items) => {
          if (!cancelled) setPageText(items.map((it) => it.str).join(' '));
        }).catch(() => {});
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfDoc, page, scale]);

  // Thumbnails: first window immediately, rest idle (a 300-page doc would
  // jank for seconds rendering all at once).
  useEffect(() => {
    if (!pdfDoc) return;
    let cancelled = false;
    const renderThumb = async (n: number): Promise<string | null> => {
      try {
        const pg = await pdfDoc.getPage(n);
        const vp = pg.getViewport({ scale: 0.22 });
        const c = document.createElement('canvas');
        c.width = Math.floor(vp.width);
        c.height = Math.floor(vp.height);
        await pg.render({ canvasContext: c.getContext('2d')!, viewport: vp }).promise;
        return c.toDataURL('image/jpeg', 0.6);
      } catch {
        return null;
      }
    };
    (async () => {
      const total = pdfDoc.numPages;
      const want = new Set<number>();
      if (thumbsAll) {
        for (let n = 1; n <= total; n++) want.add(n);
      } else {
        for (let n = 1; n <= Math.min(total, THUMB_INITIAL); n++) want.add(n);
        for (let n = Math.max(1, page - 25); n <= Math.min(total, page + 25); n++) want.add(n);
      }
      // Seed placeholders so indexes match pages, then fill missing idle.
      // loadedRef mirrors what's rendered (updaters must stay pure).
      const loaded = loadedRef.current;
      setThumbUrls((prev) => (prev.length === total ? prev : Array.from({ length: total }, (_, i) => prev[i] ?? null)));
      for (const n of [...want].sort((a, b) => a - b)) {
        if (cancelled) break;
        if (loaded.has(n)) continue;
        await new Promise((r) => setTimeout(r, 0));
        const u = await renderThumb(n);
        if (cancelled) break;
        loaded.add(n);
        setThumbUrls((prev) => {
          const next = [...prev];
          next[n - 1] = u;
          return next;
        });
      }
    })();
    return () => { cancelled = true; };
  }, [pdfDoc, page, thumbsAll]);

  const drawOverlay = useCallback(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const S = scale;
    const px = (pt: number) => pt * S;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const ctx = overlay.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, viewportRef.current.w, viewportRef.current.h);
    // Find-match overlay (ephemeral: drawn, never stored or exported).
    if (findNav && findNav.page === page) {
      findNav.rects.forEach((r, i) => {
        ctx.strokeStyle = i === findNav.idx ? '#f59e0b' : 'rgba(245,158,11,0.55)';
        ctx.lineWidth = i === findNav.idx ? 2.5 : 1.5;
        if (i !== findNav.idx) ctx.setLineDash([4, 3]);
        ctx.strokeRect(px(r.x), px(r.y), px(r.w), px(r.h));
        ctx.setLineDash([]);
      });
    }
    const list = annos[page] || [];
    // While the inline overlay owns a text-family box, skip drawing its
    // content (the real input renders it) but keep the selection outline.
    const editingIdx = inlineEdit && inlineEdit.page === page ? inlineEdit.index : -1;
    list.forEach((a, i) => {
      const isSel = selected?.page === page && selected?.index === i;
      const hide = i === editingIdx && (a.kind === 'text' || a.kind === 'flow' || a.kind === 'note');
      if (a.kind === 'text') {
        ctx.font = canvasFont(px(a.size), a.bold, !!a.italic, a.font);
        if (!hide) {
          // Alignment anchors at the click point: left grows rightward,
          // center grows both ways, right grows leftward.
          ctx.fillStyle = a.color;
          ctx.textAlign = a.align || 'left';
          ctx.fillText(a.text || '…', px(a.x), px(a.y));
          const tw = ctx.measureText(a.text || '…').width;
          const bx = a.align === 'center' ? px(a.x) - tw / 2 : a.align === 'right' ? px(a.x) - tw : px(a.x);
          ctx.textAlign = 'left';
          const deco = (dy: number) => {
            ctx.strokeStyle = a.color;
            ctx.lineWidth = Math.max(1, px(a.size) / 14);
            ctx.beginPath();
            ctx.moveTo(bx, dy);
            ctx.lineTo(bx + tw, dy);
            ctx.stroke();
          };
          if (a.underline) deco(px(a.y) + 2);
          if (a.strike) deco(px(a.y) - px(a.size) * 0.3);
        }
      } else if (a.kind === 'highlight') {
        ctx.globalAlpha = a.opacity ?? 0.4;
        ctx.fillStyle = a.color;
        ctx.fillRect(px(a.x), px(a.y), px(a.w), px(a.h));
        ctx.globalAlpha = 1;
      } else if (a.kind === 'whiteout') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px(a.x), px(a.y), px(a.w), px(a.h));
      } else if (a.kind === 'redact') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(px(a.x), px(a.y), px(a.w), px(a.h));
        ctx.strokeStyle = '#ef4444';
        ctx.setLineDash([4, 3]);
        ctx.lineWidth = 1;
        ctx.strokeRect(px(a.x), px(a.y), px(a.w), px(a.h));
        ctx.setLineDash([]);
      } else if (a.kind === 'draw') {
        ctx.strokeStyle = a.color;
        ctx.lineWidth = px(a.width);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        a.points.forEach((p, j) => { if (j % 2 === 0) { const y = a.points[j + 1]!; if (j === 0) ctx.moveTo(px(p), px(y)); else ctx.lineTo(px(p), px(y)); } });
        ctx.stroke();
      } else if (a.kind === 'image') {
        const img = new Image();
        img.src = a.dataUrl;
        if (img.complete && img.naturalWidth > 0) ctx.drawImage(img, px(a.x), px(a.y), px(a.w), px(a.h));
        else img.onload = () => drawOverlay();
      } else if (a.kind === 'shape') {
        ctx.strokeStyle = a.color;
        ctx.lineWidth = px(a.width);
        ctx.lineCap = 'round';
        const sx = px(a.x);
        const sy = px(a.y);
        const sw = px(a.w);
        const sh = px(a.h);
        ctx.beginPath();
        if (a.shape === 'rect') ctx.rect(sx, sy, sw, sh);
        else if (a.shape === 'ellipse') ctx.ellipse(sx + sw / 2, sy + sh / 2, Math.abs(sw) / 2, Math.abs(sh) / 2, 0, 0, Math.PI * 2);
        else { ctx.moveTo(sx, sy); ctx.lineTo(sx + sw, sy + sh); }
        ctx.stroke();
        if (a.shape === 'arrow') {
          const ang = Math.atan2(sh, sw);
          const head = Math.min(12, Math.hypot(sw, sh) / 4);
          const ex = sx + sw;
          const ey = sy + sh;
          ctx.beginPath();
          ctx.moveTo(ex, ey);
          ctx.lineTo(ex - head * Math.cos(ang - 0.4), ey - head * Math.sin(ang - 0.4));
          ctx.moveTo(ex, ey);
          ctx.lineTo(ex - head * Math.cos(ang + 0.4), ey - head * Math.sin(ang + 0.4));
          ctx.stroke();
        }
      } else if (a.kind === 'note') {
        if (!hide) {
          ctx.fillStyle = a.color;
          ctx.fillRect(px(a.x), px(a.y), 22, 22);
          ctx.fillStyle = '#000';
          ctx.font = 'bold 14px Helvetica, Arial, sans-serif';
          ctx.fillText('!', px(a.x) + 8, px(a.y) + 16);
        }
      } else if (a.kind === 'flow') {
        if (!hide) {
          ctx.font = canvasFont(px(a.size), a.bold, false, a.font);
          const lines = wrapLines(a.text || 'Type here…', px(a.w), (s) => ctx.measureText(s).width);
          ctx.fillStyle = a.color;
          lines.forEach((line, li) => {
            ctx.fillText(line, px(a.x), px(a.y) + li * px(a.size) * 1.25);
          });
          ctx.strokeStyle = 'rgba(26,86,219,0.5)';
          ctx.setLineDash([4, 3]);
          ctx.lineWidth = 1;
          ctx.strokeRect(px(a.x) - 4, px(a.y) - px(a.size) - 4, px(a.w) + 8, lines.length * px(a.size) * 1.25 + 8);
          ctx.setLineDash([]);
        }
      }
      if (isSel) {
        ctx.strokeStyle = '#1a56db';
        ctx.setLineDash([4, 3]);
        ctx.lineWidth = 1;
        if (a.kind === 'text') {
          const w = ctx.measureText(a.text || '…').width;
          ctx.strokeRect(px(a.x) - 2, px(a.y) - px(a.size) - 2, w + 4, px(a.size) + 6);
        } else if (a.kind === 'image' || a.kind === 'highlight' || a.kind === 'whiteout' || a.kind === 'shape' || a.kind === 'redact') {
          ctx.strokeRect(px(a.x) - 2, px(a.y) - 2, px(a.w) + 4, px(a.h) + 4);
        } else if (a.kind === 'flow') {
          const lines = wrapLines(a.text || 'x', a.w, (s) => s.length * a.size * 0.55);
          ctx.strokeRect(px(a.x) - 4, px(a.y) - px(a.size) - 4, px(a.w) + 8, lines.length * px(a.size) * 1.25 + 8);
        } else if (a.kind === 'note') {
          ctx.strokeRect(px(a.x) - 2, px(a.y) - 2, 26, 26);
        }
        ctx.setLineDash([]);
      }
    });
  }, [annos, page, selected, scale, findNav, inlineEdit]);

  useEffect(() => { drawOverlay(); }, [drawOverlay]);

  // Chat handoff: the standalone ai-chat-pdf tool answers questions, but
  // opening it fresh loses the open file + scroll + unsaved work. Instead,
  // stash the bytes in a dedicated handoff DB and navigate with ?from= —
  // the chat tool picks the file up on mount and consumes the key.
  // (Separate DB name on purpose: no version migration on the editor DB.)
  const askAboutDoc = async () => {
    if (!fileBytes) return;
    try {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const req = indexedDB.open('toolzum-handoff', 1);
        req.onupgradeneeded = () => req.result.createObjectStore('files');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('files', 'readwrite');
        tx.objectStore('files').put(
          { bytes: fileBytes.slice().buffer as ArrayBuffer, name: file?.name || 'document.pdf', at: Date.now() },
          'pdf-editor→chat',
        );
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      db.close();
      window.location.href = '/ai/ai-chat-pdf?from=pdf-editor';
    } catch {
      toast.error('Handoff failed — open AI Chat and upload the file there instead.');
    }
  };
  // Preset intents: picked before a file exists, applied right after open.
  const intentRef = useRef<'sign' | 'watermark' | 'review' | null>(null);
  const pickPreset = (intent: 'sign' | 'watermark' | 'review') => {
    if (!pdfDoc) {
      intentRef.current = intent;
      toast.success(
        intent === 'sign' ? 'Open a PDF — the Sign tool will be ready.'
          : intent === 'watermark' ? 'Open a PDF — the Text tool will be ready for your stamp.'
            : 'Open a PDF — highlights and sticky notes will be ready.',
      );
      return;
    }
    applyPreset(intent);
  };
  const applyPreset = (intent: 'sign' | 'watermark' | 'review') => {
    if (intent === 'sign') {
      setTool('sign');
      if (!signPadDataRef.current) setShowSignPad(true);
      toast.success('Step 1 of 2: save a signature, click to place it, then Download.');
    } else if (intent === 'watermark') {
      setTool('text');
      setTextColor('#9ca3af');
      setTextSize(48);
      toast.success('Step 1 of 2: click the page center and type your watermark, then Download.');
    } else {
      setTool('highlight');
      toast.success('Step 1 of 2: drag over key passages, add notes where needed, then Download.');
    }
  };

  // Unsaved-work guard: fires only when there are actual unsaved edits —
  // a clean open document should never block refresh.
  useEffect(() => {
    if (!pdfDoc) return;
    const guard = (e: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      e.preventDefault();
    };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [pdfDoc]);

  // OCR words belong to the visible page — clear on navigation (done in the
  // setter call sites, not an effect, to avoid cascading renders).
  const goPage = (n: number) => {
    setPage(Math.max(1, Math.min(pageCount, n)));
    setOcrWords([]);
    setSelection([]);
    setTextDraft(null);
    setFindNav(null);
  };

  const canvasPos = (e: React.PointerEvent) => {
    const rect = overlayRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const pushAnno = (p: number, a: Anno) => {
    commitAnnos((prev) => ({ ...prev, [p]: [...(prev[p] || []), a] }));
    setSelected({ page: p, index: (annos[p] || []).length });
  };

  const onPointerDown = async (e: React.PointerEvent) => {
    if (!pdfDoc) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    const pos = canvasPos(e);
    // Capture in PDF points (viewport px ÷ scale) so zoom never moves ink.
    const x = pos.x / scale;
    const y = pos.y / scale;
    if (tool === 'text') {
      // Hit first: clicking an existing box selects it for editing instead
      // of stacking a new one on top (the overlapping-boxes bug).
      const hit = hitTextAnno(x, y);
      if (hit !== null) {
        // Double-click edits in place; single click selects (left panel).
        if (e.detail >= 2) beginInlineEdit(page, hit);
        else selectBox(page, hit);
        return;
      }
      // Blank-page writing: no text layer + no annotations yet → one flowing
      // box (wraps, grows) instead of sticker-style single lines.
      const items = await ensureTextLayer(page).catch(() => []);
      const existing = annos[page] || [];
      if (items.length === 0 && existing.length === 0 && file) {
        const pageW = viewportRef.current.w / scale;
        const margin = Math.min(72, pageW * 0.12);
        const newIdx = existing.length;
        pushAnno(page, { kind: 'flow', x: margin, y: pos.y, w: pageW - margin * 2, text: '', size: textSize, color: textColor, bold: textBold, font: textFont });
        setInlineDraft('');
        setInlineEdit({ page, index: newIdx });
        toast.success('Flowing text box — type right here, it wraps and grows.');
      } else {
        const newIdx = existing.length;
        pushAnno(page, { kind: 'text', x, y, text: 'New text', size: textSize, color: textColor, bold: textBold, italic: textItalic, underline: textUnderline, strike: textStrike, align: textAlign, font: textFont });
        setInlineDraft('New text');
        setInlineEdit({ page, index: newIdx });
      }
    } else if (tool === 'retype') {
      retypeAt(x, y);
    } else if (tool === 'note') {
      pushAnno(page, { kind: 'note', x, y, text: 'Note', color: '#fff3a3' });
    } else if (tool === 'image' || tool === 'sign') {
      const dataUrl = tool === 'image' ? pendingImageRef.current : signPadDataRef.current;
      if (!dataUrl) {
        if (tool === 'image') imagePickRef.current?.click();
        else setShowSignPad(true);
        return;
      }
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const w = 150;
        const h = (150 * img.naturalHeight) / Math.max(1, img.naturalWidth);
        pushAnno(page, { kind: 'image', x: x - w / 2, y: y - h / 2, w, h, dataUrl });
        if (tool === 'image') pendingImageRef.current = null;
      };
    } else {
      // Select tool: hit-test existing annotations FIRST (any kind).
      // Without this, shapes/images/highlights were unselectable after
      // deselecting — an empty outline trapped users with no way to
      // re-select it to delete. Unfilled shapes hit on the interior,
      // not just the border. Double-click still falls through to
      // paragraph select when nothing is under the cursor.
      if (tool === 'select') {
        const hit = hitTestAnno(annos[page] || [], x, y);
        if (hit !== null) {
          // Double-click a text-family annotation → edit in place;
          // shapes/images just select (no text to edit).
          if (e.detail >= 2) beginInlineEdit(page, hit);
          else selectBox(page, hit);
          return;
        }
      }
      // Double-click with Select grabs the whole paragraph; single drag
      // selects a rect. Both feed the same AI/selection pipeline.
      if (tool === 'select' && e.detail >= 2) {
        try {
          const items = await ensureTextLayer(page);
          const hit = items.find((it) => x >= it.x - 4 && x <= it.x + it.w + 4 && y >= it.yTop - 4 && y <= it.yTop + it.size + 4);
          if (hit) {
            const para = groupParagraphs(items).find((g) => g.includes(hit));
            const strs = (para || [hit]).map((it) => it.str);
            setSelection(strs);
            toast.success(`${strs.length} text runs selected (paragraph) — AI actions now use the selection.`);
            return;
          }
        } catch {
          /* fall through to rect select */
        }
      }
      dragRef.current = { x, y, points: tool === 'draw' ? [x, y] : undefined };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const pos = canvasPos(e);
    if (tool === 'draw' && drag.points) {
      drag.points.push(pos.x / scale, pos.y / scale);
      drawOverlay();
      const ctx = overlayRef.current!.getContext('2d')!;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.strokeStyle = inkColor;
      ctx.lineWidth = brushWidth * scale;
      ctx.lineCap = 'round';
      const n = drag.points.length;
      ctx.beginPath();
      ctx.moveTo(drag.points[n - 4]! * scale, drag.points[n - 3]! * scale);
      ctx.lineTo(drag.points[n - 2]! * scale, drag.points[n - 1]! * scale);
      ctx.stroke();
    } else {
      // Live rubber-band for highlight/whiteout (viewport px, display only).
      drawOverlay();
      const ctx = overlayRef.current!.getContext('2d')!;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const x = Math.min(drag.x * scale, pos.x);
      const y = Math.min(drag.y * scale, pos.y);
      const w = Math.abs(pos.x - drag.x * scale);
      const h = Math.abs(pos.y - drag.y * scale);
      if (tool === 'highlight') {
        ctx.globalAlpha = markOpacity;
        ctx.fillStyle = markColor;
        ctx.fillRect(x, y, w, h);
        ctx.globalAlpha = 1;
      } else if (tool === 'redact') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, y, w, h);
      } else if (tool === 'shape') {
        ctx.strokeStyle = inkColor;
        ctx.lineWidth = shapeWidth * scale;
        ctx.beginPath();
        if (shapeVariant === 'rect') ctx.rect(x, y, w, h);
        else if (shapeVariant === 'ellipse') ctx.ellipse(x + w / 2, y + h / 2, Math.abs(w) / 2, Math.abs(h) / 2, 0, 0, Math.PI * 2);
        else { ctx.moveTo(x, y); ctx.lineTo(pos.x, pos.y); }
        ctx.stroke();
      } else if (tool === 'select') {
        ctx.strokeStyle = '#1a56db';
        ctx.setLineDash([5, 4]);
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, w, h);
        ctx.setLineDash([]);
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, w, h);
      }
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    const pos = canvasPos(e);
    if (tool === 'draw' && drag.points && drag.points.length >= 4) {
      pushAnno(page, { kind: 'draw', points: drag.points, color: inkColor, width: brushWidth });
    } else if ((tool === 'highlight' || tool === 'whiteout' || tool === 'shape' || tool === 'select' || tool === 'redact')) {
      const w = Math.abs(pos.x / scale - drag.x);
      const h = Math.abs(pos.y / scale - drag.y);
      if (w > 3 && h > 3) {
        const x = Math.min(drag.x, pos.x / scale);
        const y = Math.min(drag.y, pos.y / scale);
        if (tool === 'highlight') pushAnno(page, { kind: 'highlight', x, y, w, h, color: markColor, opacity: markOpacity });
        else if (tool === 'whiteout') pushAnno(page, { kind: 'whiteout', x, y, w, h, color: '#ffffff' });
        else if (tool === 'redact') {
          pushAnno(page, { kind: 'redact', x, y, w, h });
          toast.success('Redaction region marked — text bytes are stripped on export and verified.', { duration: 4000 });
        }
        else if (tool === 'select') selectInRect(x, y, w, h);
        else pushAnno(page, { kind: 'shape', shape: shapeVariant, x, y, w, h, color: inkColor, width: shapeWidth });
      } else if (tool === 'select') {
        // Tiny drag / plain click with nothing under it → clear selection
        // (deselect), matching every other editor.
        selectBox(page, null);
      } else {
        drawOverlay();
      }
    }
  };

  // In-editor AI: acts on the drag-selection when present, else the whole
  // page. 1 credit via /api/ai/generate — signed-in only, never auto-retried.
  // Gating matches the standalone tools exactly (translator/paraphraser are
  // signed-in-spend-credits, never Pro): per-surface locks would be arbitrary.
  // Only editor-exclusive automation (PII sweep) is Pro — nothing else to
  // compare it against.
  const runAiAction = async (action: 'summarize' | 'grammar' | 'translate') => {
    if (!pdfDoc) return;
    if (!isSignedIn) {
      toast.error('AI actions cost 1 credit — sign in to use them.');
      return;
    }
    setAiWorking(true);
    try {
      let raw: string;
      if (selection.length > 0) {
        raw = selection.join(' ').replace(/\s+/g, ' ').trim().slice(0, 4000);
      } else {
        const pg = await pdfDoc.getPage(page);
        const tc = await pg.getTextContent();
        raw = tc.items.map((it) => ('str' in it ? String(it.str) : '')).join(' ').replace(/\s+/g, ' ').trim();
      }
      if (raw.length < 20) {
        toast.error(selection.length > 0 ? 'Selection is too short.' : 'No readable text on this page — scanned pages need OCR first.');
        return;
      }
      const clipped = raw.slice(0, 6000);
      const prompt = action === 'summarize'
        ? `Summarize this PDF ${selection.length > 0 ? 'selection' : 'page text'} in 3-5 short bullet lines, plain text, no markdown:\n\n${clipped}`
        : action === 'grammar'
          ? `Fix the grammar and spelling of this PDF text. Return only the corrected text, no commentary:\n\n${clipped}`
          : `Translate this PDF text to English. Return only the translation, no commentary:\n\n${clipped}`;
      const out = await generateCompletion([{ role: 'user', content: prompt }], 0.3);
      // drawText doesn't wrap: split into short stacked lines (shared helper
      // keeps preview/export/tests on identical breaks).
      const capped = splitAiLines(out);
      commitAnnos((prev) => {
        const list = [...(prev[page] || [])];
        capped.forEach((line, i) => {
          list.push({ kind: 'text', x: 36, y: 60 + i * 16, text: line, size: 11, color: '#1a56db', bold: false });
        });
        return { ...prev, [page]: list };
      });
      toast.success(`AI ${action === 'summarize' ? 'summary' : 'correction'} inserted — 1 credit used. Drag lines where needed.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'AI action failed.');
    } finally {
      setAiWorking(false);
    }
  };

  // OCR for scanned pages: render the page to an image, recognize words in
  // the browser (engine downloads on first use — needs internet once, cached
  // after), then offer each word as an insertable editable text box.
  const runOcr = async () => {
    if (!pdfDoc) return;
    setOcrRunning(true);
    setOcrProgress(0);
    setOcrWords([]);
    try {
      const { createWorker } = await import('tesseract.js');
      // One worker per language — recreated when the language changes.
      const workerAny = ocrWorkerRef.current as unknown as { _lang?: string } | null;
      if (!ocrWorkerRef.current || workerAny?._lang !== ocrLang) {
        try { await (ocrWorkerRef.current as unknown as { terminate?: () => Promise<void> } | null)?.terminate?.(); } catch { /* ignore */ }
        toast.loading('Loading OCR engine (one-time download per language)…', { id: 'pdfedit-ocr' });
        const worker = await createWorker(undefined, undefined, {
          logger: (m: { status: string; progress: number }) => {
            if (m.status === 'recognizing text') setOcrProgress(Math.round(m.progress * 100));
          },
        });
        await worker.reinitialize(ocrLang);
        (worker as unknown as { _lang?: string })._lang = ocrLang;
        ocrWorkerRef.current = worker as typeof ocrWorkerRef.current;
        toast.dismiss('pdfedit-ocr');
      }
      const pg = await pdfDoc.getPage(page);
      const vp = pg.getViewport({ scale: 2 });
      const c = document.createElement('canvas');
      c.width = Math.floor(vp.width);
      c.height = Math.floor(vp.height);
      await pg.render({ canvasContext: c.getContext('2d')!, viewport: vp }).promise;
      const { data } = await ocrWorkerRef.current!.recognize(c.toDataURL('image/png'));
      const pageWpt = viewportRef.current.w / scale;
      const kx = pageWpt / c.width;
      const words = mapOcrWords(data.words || [], kx);
      setOcrWords(words);
      toast.success(words.length > 0 ? `${words.length} words recognized — click one to insert it as editable text.` : 'No words recognized on this page.');
    } catch {
      toast.error('OCR failed — needs internet on first run (engine download), then works offline.');
    } finally {
      setOcrRunning(false);
    }
  };

  const insertOcrWord = (w: { text: string; x: number; y: number; size: number }) => {
    // Arabic honesty: Helvetica (the only embedded font) has no Arabic
    // glyphs — inserting would render blank boxes. Copy instead, stated.
    if (ocrLang === 'ara') {
      clipboardWrite(w.text).then((ok) => {
        if (ok) toast.success('Copied — paste where needed (Arabic can’t render in Helvetica).');
        else toast.error('Copy blocked by the browser — select the text manually.');
      });
      return;
    }
    pushAnno(page, { kind: 'text', x: w.x, y: w.y, text: w.text, size: w.size, color: '#000000', bold: false });
  };

  const insertAllOcr = () => {
    if (ocrLang === 'ara') {
      clipboardWrite(ocrWords.map((w) => w.text).join(' ')).then((ok) => {
        if (ok) toast.success('All words copied as text.');
        else toast.error('Copy blocked by the browser — select the text manually.');
      });
      return;
    }
    ocrWords.slice(0, 300).forEach((w) => insertOcrWord(w));
    toast.success(`${Math.min(ocrWords.length, 300)} words inserted as editable text.`);
  };

  const textLayerRef = useRef<Record<number, TextItem[]>>({});
  const [selection, setSelection] = useState<string[]>([]);

  // Cached text-layer items in PDF points (shared by retype, select, AI).
  const ensureTextLayer = async (pg: number) => {
    if (!pdfDoc) return [];
    if (!textLayerRef.current[pg]) {
      const pageObj = await pdfDoc.getPage(pg);
      const vp1 = pageObj.getViewport({ scale: 1 });
      const tc = await pageObj.getTextContent();
      const meas = document.createElement('canvas').getContext('2d')!;
      const items: TextItem[] = [];
      for (const it of tc.items) {
        if (!('str' in it) || !it.str.trim()) continue;
        const tx = pdfjsLib.Util.transform(vp1.transform, it.transform);
        const size = Math.max(4, Math.hypot(tx[2], tx[3]));
        meas.font = `${size}px Helvetica, Arial, sans-serif`;
        const w = meas.measureText(it.str).width * 1.1;
        items.push({
          x: tx[4],
          yTop: vp1.height - tx[5] - size,
          w,
          size,
          bold: detectBold(it.fontName),
          str: it.str,
          fontName: it.fontName || '',
        });
      }
      textLayerRef.current[pg] = items;
    }
    return textLayerRef.current[pg] || [];
  };

  // Hit-test: clicking on/near an existing text-family box selects it
  // instead of stacking a new one on top (Google Docs / Canva behavior).
  // Empty-box cleanup: text/flow boxes left with no content are litter
  // (especially from stray clicks pre-hit-test). Pruned on deselect and
  // before export — never while selected (the box being typed in is empty).
  const pruneEmpty = (list: Anno[]): Anno[] => pruneEmptyAnnos(list);

  const selectBox = (page: number, index: number | null) => {
    if (index === null) {
      setAnnos((prev) => {
        const list = prev[page] || [];
        const cleaned = pruneEmpty(list);
        if (cleaned.length === list.length) return prev;
        return { ...prev, [page]: cleaned };
      });
    }
    setSelected(index === null ? null : { page, index });
  };

  // Thin wrapper so call sites read naturally; logic lives in the tested
  // pure helper above (regression classes stay covered without a DOM).
  const hitTextAnno = (x: number, y: number): number | null =>
    hitTestText(annos[page] || [], x, y);

  // In-place editing: open on double-click (select/text tools) or right
  // after placing a new text/flow box. Contract mirrors the left panel
  // (see registry instructions): Enter commits single-line text, Escape
  // reverts, blur commits — element-local keys, never window-bound.
  const beginInlineEdit = (p: number, index: number) => {
    const a = annos[p]?.[index];
    // Always select first — double-click on a shape/image still selects;
    // only text-family kinds open the overlay.
    selectBox(p, index);
    if (!a || (a.kind !== 'text' && a.kind !== 'flow' && a.kind !== 'note')) return;
    setInlineDraft(a.text);
    setInlineEdit({ page: p, index });
  };

  // Flush = commit the live inline draft (if any) as ONE undo entry and
  // return the resulting annos snapshot. Save paths call this first so
  // what's on screen is what hits IndexedDB. No draft / no change →
  // returns current annos untouched (zero junk undo entries).
  const flushInline = (): Record<number, Anno[]> => {
    const target = inlineEdit;
    if (!target) return annos;
    setInlineEdit(null);
    const a = annos[target.page]?.[target.index];
    if (!a || (a.kind !== 'text' && a.kind !== 'flow' && a.kind !== 'note')) return annos;
    const v = a.kind === 'note' ? inlineDraft.slice(0, 240) : inlineDraft;
    if (v === a.text) return annos; // no junk undo entries for no-op blurs
    const next: Record<number, Anno[]> = {
      ...annos,
      [target.page]: (annos[target.page] || []).map((x, i) =>
        i === target.index && (x.kind === 'text' || x.kind === 'flow' || x.kind === 'note')
          ? { ...x, text: v }
          : x,
      ),
    };
    commitAnnos(() => next);
    return next;
  };

  const commitInline = () => {
    flushInline();
  };

  const revertInline = () => setInlineEdit(null);

  // Save with inline flush: Ctrl+S (window) and the toolbar button both
  // route here — keystrokes never bypass the flush, so the draft on
  // screen is always the draft on disk.
  const saveFlushing = (silent = false) => saveNow(silent, flushInline());

  // and drop an editable Helvetica box at the same size/position. Honest
  // label: retypeset, NOT same-font — the original font is matched for size
  // and placement only (see FAQ).
  // Click-to-retype: find the nearest text-layer item, cover it with white,
  // and drop an editable Helvetica box at the same size/position. Honest
  // label: retypeset, NOT same-font — the original font is matched for size
  // and placement only (see FAQ).
  const retypeAt = async (x: number, y: number) => {
    if (!pdfDoc) return;
    try {
      const items = await ensureTextLayer(page);
      let best: (typeof items)[number] | null = null;
      let bestD = 30;
      for (const it of items) {
        const cx = it.x + it.w / 2;
        const cy = it.yTop + it.size / 2;
        const d = Math.hypot(x - cx, y - cy);
        if (d < bestD) { bestD = d; best = it; }
      }
      if (!best) {
        toast.error('No text found here — this may be a scanned page (run OCR) or an image.');
        return;
      }
      commitAnnos((prev) => ({
        ...prev,
        [page]: [
          ...(prev[page] || []),
          { kind: 'whiteout', x: best.x - 2, y: best.yTop - 2, w: best.w + 4, h: best.size + 5, color: '#ffffff' },
          { kind: 'text', x: best.x, y: best.yTop + best.size * 0.85, text: best.str, size: Math.round(best.size), color: '#000000', bold: best.bold, font: detectFontFamily(best.fontName) },
        ],
      }));
      toast.success('Text covered — retype it in the left panel. Rendered in the matched family (Arimo/Tinos/Cousine).');
    } catch {
      toast.error('Could not read this page’s text layer.');
    }
  };

  // Text selection for AI: hit-test cached text-layer items against the
  // dragged rect. Empty selection = whole page (AI buttons state this).
  const selectInRect = async (x: number, y: number, w: number, h: number) => {
    try {
      const items = await ensureTextLayer(page);
      const hits = items.filter((it) =>
        it.x < x + w && it.x + it.w > x && it.yTop < y + h && it.yTop + it.size > y,
      ).map((it) => it.str);
      setSelection(hits);
      drawOverlay();
      toast.success(hits.length > 0 ? `${hits.length} text runs selected — AI actions now use the selection.` : 'No text in that area — try a wider box or run OCR.');
    } catch {
      toast.error('Could not read this page’s text layer.');
    }
  };

  // Pro-only PII sweep: AI lists sensitive substrings, we map them back to
  // text-layer bboxes and cover each with a whiteout box for review. This is
  // SUGGESTED cover-up, not redaction — same recoverability caveat, stated
  // in the toast and FAQ. 1 credit, Pro only (the converter hook).
  const findSensitive = async () => {
    if (!pdfDoc) return;
    if (!isSignedIn) {
      toast.error('PII sweep costs 1 credit — sign in to use it.');
      return;
    }
    if (!isPro) {
      toast.error('PII sweep is a Pro feature — upgrade to unlock. Cover-up boxes stay free for manual use.');
      return;
    }
    setAiWorking(true);
    try {
      const items = await ensureTextLayer(page);
      const raw = items.map((it) => it.str).join(' ').replace(/\s+/g, ' ').trim().slice(0, 6000);
      if (raw.length < 20) {
        toast.error('No readable text on this page — scanned pages need OCR first.');
        return;
      }
      const out = await generateCompletion([{
        role: 'user',
        content: `Find personal data in this PDF page text: email addresses, phone numbers, ID/government numbers, person names, street addresses, account numbers. Return ONLY a JSON array of the exact substrings as they appear, e.g. ["john@x.com", "+1-555-0100"]. Empty array if none:\n\n${raw}`,
      }], 0.1);
      const found = parseSensitiveList(out);
      if (found.length === 0) {
        toast.success('No personal data patterns found on this page.');
        return;
      }
      const lowered = found.map((s) => s.toLowerCase());
      const hits = items.filter((it) => {
        const t = it.str.toLowerCase();
        return lowered.some((s) => s && (s.includes(t) || t.includes(s)));
      });
      if (hits.length === 0) {
        toast.success('AI flagged items, but none matched on-page text exactly — review manually.');
        return;
      }
      commitAnnos((prev) => ({
        ...prev,
        [page]: [
          ...(prev[page] || []),
          ...hits.map((h) => ({ kind: 'whiteout', x: h.x - 2, y: h.yTop - 2, w: h.w + 4, h: h.size + 5, color: '#ffffff' }) as Anno),
        ],
      }));
      toast.success(`${hits.length} spots covered for review — 1 credit used. This hides visually; it does NOT delete text (see FAQ). Verify each box, then export.`);
      takeVersion('PII sweep');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'PII sweep failed.');
    } finally {
      setAiWorking(false);
    }
  };

  // Find & replace: substring match (case-insensitive) against text-layer
  // items, cover each hit with white and retypeset the replacement at the
  // same position/size in Helvetica. Same honesty as Retype: matched layout,
  // not original fonts. Page scope or whole document.
  const findReplace = async () => {
    const needle = findText.trim();
    if (needle.length < 2) {
      toast.error('Enter at least 2 characters to find.');
      return;
    }
    if (!pdfDoc) return;
    setReplacing(true);
    try {
      const pages = replaceScope === 'all'
        ? Array.from({ length: pageCount }, (_, i) => i + 1)
        : [page];
      const needleLower = needle.toLowerCase();
      let total = 0;
      const hitsByPage: Record<number, { x: number; yTop: number; w: number; size: number; bold: boolean }[]> = {};
      for (const pg of pages) {
        const items = await ensureTextLayer(pg);
        hitsByPage[pg] = items.filter((it) => it.str.toLowerCase().includes(needleLower));
      }
      commitAnnos((prev) => {
        const next = { ...prev };
        for (const pg of pages) {
          const hits = hitsByPage[pg] || [];
          if (hits.length === 0) continue;
          total += hits.length;
          next[pg] = [
            ...(next[pg] || []),
            ...hits.flatMap((h) => ([
              { kind: 'whiteout', x: h.x - 2, y: h.yTop - 2, w: h.w + 4, h: h.size + 5, color: '#ffffff' },
              { kind: 'text', x: h.x, y: h.yTop + h.size * 0.85, text: replaceText, size: Math.round(h.size), color: '#000000', bold: h.bold },
            ] as Anno[])),
          ];
        }
        return next;
      });
      toast.success(total > 0
        ? `Replaced ${total} match${total === 1 ? '' : 'es'}${replaceScope === 'all' ? ' across the document' : ''} — Helvetica retypeset, verify placement.`
        : `No matches for “${needle}”.`);
      if (total > 0) takeVersion(`replace “${needle.slice(0, 24)}”`);
    } catch {
      toast.error('Could not read the text layer — scanned pages need OCR first.');
    } finally {
      setReplacing(false);
    }
  };

  // History: every mutating op goes through commitAnnos (snapshots first).
  // Redo stack clears on any new change (standard). Undo/redo restore
  // directly and must never snapshot (hence raw setAnnos there).
  // TWO recovery systems, intentionally different jobs:
  //  - Undo/redo (this stack): fast in-session LIFO. Annos-only entries
  //    for keystroke-level changes; ≤ MAX_STRUCTURAL_UNDO entries with
  //    full PDF bytes for page-structure ops. Cleared on file open.
  //  - Version history panel (EditorVersion[]): ≤10 named checkpoints
  //    for destructive mistakes, annos + page only (never pins file
  //    copies), survives in memory across many edits. Restore warns when
  //    pageCount differs — versions do not carry bytes, so page-shape
  //    changes are covered by structural undo, not the panel.
  const undoStack = useRef<HistEntry[]>([]);
  const redoStack = useRef<HistEntry[]>([]);
  const commitAnnos = (updater: (_prev: Record<number, Anno[]>) => Record<number, Anno[]>) => {
    undoStack.current.push({ annos: structuredClone(annos) });
    if (undoStack.current.length > 100) undoStack.current.shift();
    redoStack.current = [];
    setAnnos(updater);
  };

  const applyHistEntry = async (entry: HistEntry) => {
    if (entry.bytes) {
      const fresh = await pdfjsLib.getDocument({ data: entry.bytes.slice() }).promise;
      setFileBytes(entry.bytes);
      setPdfDoc(fresh);
      setPageCount(entry.pageCount ?? fresh.numPages);
      setPage(Math.max(1, Math.min(entry.page ?? 1, fresh.numPages)));
      setAnnos(entry.annos);
      setThumbUrls([]);
      setThumbsAll(false);
      loadedRef.current = new Set();
      textLayerRef.current = {};
      setOcrWords([]);
      setFindNav(null);
      setSelected(null);
      return true;
    }
    return false;
  };

  const undo = async () => {
    const entry = undoStack.current.pop();
    if (!entry) return;
    const structural = entry.bytes !== undefined;
    redoStack.current.push(structural
      ? { annos: structuredClone(annos), bytes: fileBytes ? fileBytes.slice() : undefined, pageCount, page }
      : { annos: structuredClone(annos) });
    try {
      const didRestore = await applyHistEntry(entry);
      if (!didRestore) {
        setAnnos(entry.annos);
        setSelected(null);
      } else {
        toast.success('Undid page change — document restored.');
      }
    } catch {
      undoStack.current.push(entry);
      toast.error('Undo failed — could not restore the previous document.');
    }
  };

  const redo = async () => {
    const entry = redoStack.current.pop();
    if (!entry) return;
    const structural = entry.bytes !== undefined;
    undoStack.current.push(structural
      ? { annos: structuredClone(annos), bytes: fileBytes ? fileBytes.slice() : undefined, pageCount, page }
      : { annos: structuredClone(annos) });
    try {
      const didRestore = await applyHistEntry(entry);
      if (!didRestore) {
        setAnnos(entry.annos);
        setSelected(null);
      } else {
        toast.success('Redid page change.');
      }
    } catch {
      redoStack.current.push(entry);
      toast.error('Redo failed — could not restore the document.');
    }
  };

  const historyCount = undoStack.current.length;
  const redoCount = redoStack.current.length;

  // Page structure ops (rotate / duplicate / delete / move current page).
  // Annotations are REMAPPED through the op (never wiped) and undo history
  // is kept: the pre-op snapshot carries the old bytes, so undo restores
  // the old document wholesale. Wiping annos here destroyed work on every
  // other page during a routine rotate — silent data loss.
  const restructure = async (op: 'rotate' | 'duplicate' | 'delete' | 'left' | 'right') => {
    if (!fileBytes) return;
    if (op === 'delete' && pageCount <= 1) {
      toast.error('Cannot delete the only page.');
      return;
    }
    if ((op === 'left' && page <= 1) || (op === 'right' && page >= pageCount)) return;
    try {
      const doc = await PDFDocument.load(fileBytes.slice());
      const idx = page - 1;
      let nextPage = page;
      if (op === 'rotate') {
        const pg = doc.getPages()[idx]!;
        pg.setRotation(degrees((pg.getRotation().angle + 90) % 360));
      } else if (op === 'duplicate') {
        const [copy] = await doc.copyPages(doc, [idx]);
        doc.insertPage(idx + 1, copy!);
        nextPage = page + 1;
      } else if (op === 'delete') {
        doc.removePage(idx);
        nextPage = Math.min(page, doc.getPageCount());
      } else {
        // Reorder: remove + reinsert one slot over; annos follow their pages.
        const [moving] = await doc.copyPages(doc, [idx]);
        doc.removePage(idx);
        const at = op === 'left' ? idx - 1 : idx + 1;
        doc.insertPage(Math.max(0, Math.min(at, doc.getPageCount())), moving!);
        nextPage = op === 'left' ? page - 1 : page + 1;
      }
      const bytes = new Uint8Array(await doc.save());
      const fresh = await pdfjsLib.getDocument({ data: bytes.slice() }).promise;
      const prevAnnos = annos;
      const vpH = viewportRef.current.h / scale;
      const mapped = restructureAnnos(prevAnnos, op, page, pageCount, vpH);
      // Pre-op snapshot (with bytes) so undo restores the old document.
      undoStack.current.push({ annos: structuredClone(prevAnnos), bytes: fileBytes.slice(), pageCount, page });
      // Cap structural entries (each pins a full file copy). On overflow,
      // drop the oldest structural anchor + everything older — and SAY SO;
      // silent history shrinkage is the failure mode we don't ship.
      const capped = capStructuralHistory(undoStack.current);
      undoStack.current = capped.stack;
      if (capped.dropped) {
        toast('Undo depth limit — oldest page-operation snapshot dropped. The History panel keeps separate restore points.', { id: 'pdfedit-undo-cap', duration: 6000 });
      }
      redoStack.current = [];
      setFileBytes(bytes);
      setPdfDoc(fresh);
      setPageCount(fresh.numPages);
      setPage(nextPage);
      setAnnos(mapped);
      setSelected(null);
      setThumbUrls([]);
      setThumbsAll(false);
      loadedRef.current = new Set();
      setOcrWords([]);
      textLayerRef.current = {};
      toast.success(
        op === 'rotate' ? 'Page rotated — annotations kept.'
          : op === 'duplicate' ? 'Page duplicated — annotations copied to the new page.'
            : op === 'delete' ? 'Page deleted — annotations on other pages kept.'
              : `Page moved ${op === 'left' ? 'earlier' : 'later'} — annotations followed their pages. Undo restores everything.`,
      );
    } catch {
      toast.error('Page operation failed.');
    }
  };

  // Z-order: the topmost box wins overlap hit-tests, so stacking needs
  // deliberate controls — bring forward / send backward one step each.
  const moveLayer = (dir: 1 | -1) => {
    if (!selected) return;
    const { list, index } = moveLayerIndex([...(annos[selected.page] || [])], selected.index, dir);
    if (index === selected.index) return;
    commitAnnos((prev) => ({ ...prev, [selected.page]: list }));
    setSelected({ page: selected.page, index });
  };

  const deleteSelected = () => {
    if (!selected) return;
    commitAnnos((prev) => {
      const list = (prev[selected.page] || []).filter((_, i) => i !== selected.index);
      return { ...prev, [selected.page]: pruneEmpty(list) };
    });
    setSelected(null);
  };

  const duplicateSelected = () => {
    if (!selected) return;
    const a = annos[selected.page]?.[selected.index];
    if (!a) return;
    const copy = JSON.parse(JSON.stringify(a)) as Anno;
    if (copy.kind === 'text' || copy.kind === 'note') { copy.x += 12; copy.y += 12; }
    else if (copy.kind === 'draw') { copy.points = copy.points.map((p) => p + 12); }
    else { copy.x += 12; copy.y += 12; }
    pushAnno(selected.page, copy);
  };

  const clipboardRef = useRef<Anno | null>(null);

  const copySelected = () => {
    if (!selected) return;
    const a = annos[selected.page]?.[selected.index];
    if (!a) return;
    clipboardRef.current = JSON.parse(JSON.stringify(a)) as Anno;
    toast.success('Copied — paste onto any page.');
  };

  const pasteClipboard = () => {
    const a = clipboardRef.current;
    if (!a) {
      toast.error('Nothing copied yet.');
      return;
    }
    const shift = (n: number) => n + 10;
    const moved = JSON.parse(JSON.stringify(a)) as Anno;
    if (moved.kind === 'text' || moved.kind === 'note') { moved.x = shift(moved.x); moved.y = shift(moved.y); }
    else if (moved.kind === 'draw') { moved.points = moved.points.map((p) => p + 10); }
    else { moved.x = shift(moved.x); moved.y = shift(moved.y); }
    pushAnno(page, moved);
  };

  // Stamp-on-all-pages: clones the selected image/signature onto every page
  // at the same position — the classic "sign every page" flow.
  const stampAllPages = () => {
    if (!selected) return;
    const a = annos[selected.page]?.[selected.index];
    if (!a || a.kind !== 'image') {
      toast.error('Select a signature or image stamp first.');
      return;
    }
    commitAnnos((prev) => {
      const next = { ...prev };
      for (let p = 1; p <= pageCount; p++) {
        if (p === selected.page) continue;
        next[p] = [...(next[p] || []), JSON.parse(JSON.stringify(a)) as Anno];
      }
      return next;
    });
    toast.success(`Stamped on all ${pageCount} pages.`);
  };

  // Keyboard (canvas-scoped): ARROW NUDGE ONLY. Every other shortcut the
  // (?) panel lists binds on window (see the onKey effect further down). Do not
  // add modifier-key handling here — that reintroduces the focus-dependent
  // "global" shortcuts bug class this split eliminated.
  const onCanvasKey = (e: React.KeyboardEvent) => {
    const t = e.target as HTMLElement;
    // isContentEditable matters: inline-edit overlays live INSIDE this div,
    // and a contentEditable the guard misses would arrow-nudge mid-keystroke.
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return;
    if (!selected) return;
    const step = e.shiftKey ? 10 : 1;
    if (e.key.startsWith('Arrow')) {
      e.preventDefault();
      const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
      const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
      commitAnnos((prev) => ({
        ...prev,
        [selected.page]: (prev[selected.page] || []).map((a, i) => {
          if (i !== selected.index) return a;
          if (a.kind === 'draw') return { ...a, points: a.points.map((p, j) => p + (j % 2 === 0 ? dx : dy)) };
          if (a.kind === 'text' || a.kind === 'note') return { ...a, x: a.x + dx, y: a.y + dy };
          return { ...a, x: a.x + dx, y: a.y + dy };
        }),
      }));
    }
  };

  const signPadDataRef = useRef<string | null>(null);
  const [typedName, setTypedName] = useState('');
  const [hasSavedSig, setHasSavedSig] = useState(false);
  // Recently-used emoji (local only): pinned at the top of the picker.
  const [recentEmoji, setRecentEmoji] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('toolzum:recent-emoji');
      if (!raw) return [];
      return (JSON.parse(raw) as unknown[]).filter((e): e is string => typeof e === 'string').slice(0, 8);
    } catch {
      return [];
    }
  });
  const [emojiQuery, setEmojiQuery] = useState('');

  const rememberEmoji = (emoji: string) => {
    setRecentEmoji((prev) => {
      const next = [emoji, ...prev.filter((e) => e !== emoji)].slice(0, 8);
      try {
        localStorage.setItem('toolzum:recent-emoji', JSON.stringify(next));
      } catch { /* private mode */ }
      return next;
    });
  };

  // Preload saved-signature presence whenever the pad opens.
  useEffect(() => {
    if (showSignPad) loadSavedSig();
  }, [showSignPad]);

  // Saved signature: persisted locally (never uploaded) so repeat signing
  // skips redrawing. Loaded lazily on panel open.
  const SIG_KEY = 'toolzum:saved-signature';
  const loadSavedSig = () => {
    try {
      const s = localStorage.getItem(SIG_KEY);
      setHasSavedSig(!!s);
      return s;
    } catch {
      return null;
    }
  };

  const applySavedSig = () => {
    const s = loadSavedSig();
    if (!s) {
      toast.error('No saved signature yet — draw or type one first.');
      return;
    }
    signPadDataRef.current = s;
    setShowSignPad(false);
    setTool('sign');
    toast.success('Saved signature loaded — click on the page to place it.');
  };

  // Typed signature: renders the name in a script font onto the pad, then
  // flows through the same save path as drawn signatures.
  const applyTypedSignature = () => {
    const name = typedName.trim();
    if (name.length < 2) {
      toast.error('Type your name first (2+ characters).');
      return;
    }
    const c = signPadRef.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = '#000000';
    ctx.font = '64px "Brush Script MT", "Segoe Script", "Apple Chancery", cursive';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name.slice(0, 40), c.width / 2, c.height / 2 + 4);
    saveSignPad();
  };

  const saveSignPad = () => {
    const c = signPadRef.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    const px = ctx.getImageData(0, 0, c.width, c.height).data;
    let ink = false;
    for (let i = 3; i < px.length; i += 16) { if (px[i]! > 0) { ink = true; break; } }
    if (!ink) { toast.error('Draw your signature first.'); return; }
    signPadDataRef.current = c.toDataURL('image/png');
    try {
      localStorage.setItem(SIG_KEY, signPadDataRef.current);
      setHasSavedSig(true);
    } catch { /* private mode — session-only */ }
    setShowSignPad(false);
    toast.success('Signature saved — switch to the Sign tool and click to place it.');
    setTool('sign');
  };

  // Emoji stamps: Helvetica can't render color emoji, so rasterize each
  // glyph to a PNG on an offscreen canvas and stamp it as an image —
  // exports identically everywhere, no font dependency.
  const EMOJI_SET = ['✅', '⭐', '❤️', '➡️', '⚠️', '✔️', '❌', '💡', '📌', '🎉', '👍', '🔥'];
  const EMOJI_ALL: { emoji: string; name: string; cat: string }[] = [
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
  const stampEmoji = (emoji: string) => {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext('2d')!;
    ctx.font = '100px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 64, 70);
    pendingImageRef.current = c.toDataURL('image/png');
    setTool('image');
    rememberEmoji(emoji);
    toast.success('Emoji ready — click on the page to stamp it.');
  };

  const onPickImage = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) { toast.error('Pick an image file (PNG or JPG).'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      pendingImageRef.current = String(reader.result);
      toast.success('Image ready — click on the page to stamp it.');
    };
    reader.readAsDataURL(f);
  };

  // Editable-annotations export (FreeText/Highlight/Ink dicts) is deferred:
  // pdf-lib only exposes low-level annotation primitives, and burned
  // output needs validation across readers we can't run headlessly.
  // The button below states flattening explicitly instead of implying it.
  const exportPdf = async () => {
    if (!fileBytes) return;
    // Prune empties at export so stray clicks never ship as ghost boxes.
    const clean: Record<number, Anno[]> = {};
    for (const [p, list] of Object.entries(annos)) clean[Number(p)] = pruneEmpty(list);
    const total = Object.values(clean).reduce((n, l) => n + l.length, 0);
    if (total === 0) { toast.error('Nothing to export yet — add some annotations first.'); return; }
    setExporting(true);
    try {
      let pdfDocLib;
      try {
        pdfDocLib = await PDFDocument.load(fileBytes.slice());
      } catch {
        toast.error('This PDF is encrypted. Unlock it first, then edit.');
        setExporting(false);
        return;
      }
      const helv = await pdfDocLib.embedFont(StandardFonts.Helvetica);
      const helvBold = await pdfDocLib.embedFont(StandardFonts.HelveticaBold);
      // Embedded text fonts: metric-compatible webfonts (Arimo/Tinos/Cousine)
      // fetched + cached, with base-14 fallback when offline. Only families
      // actually used are embedded (faster export, smaller output).
      const usedFams = new Set<PdfFont>();
      for (const list of Object.values(clean)) {
        for (const a of list) {
          if ((a.kind === 'text' || a.kind === 'flow') && a.font) usedFams.add(a.font);
        }
      }
      type famFonts = { plain: PDFFont; bold: PDFFont; italic: PDFFont; boldItalic: PDFFont };
      const embedded = new Map<PdfFont, famFonts | null>();
      let fontNoticeShown = false;
      const noteOfflineFonts = () => {
        if (fontNoticeShown) return;
        fontNoticeShown = true;
        toast.success('Exported with built-in fonts (custom fonts need internet once).');
      };
      const libFontsFor = async (fam: PdfFont) => {
        const hit = embedded.get(fam);
        if (hit !== undefined) return hit;
        try {
          // @pdf-lib/fontkit ships types only as a UMD global (no ESM
          // typings): resolve the default export dynamically and narrow to
          // pdf-lib's Fontkit interface. A mismatch throws here and falls
          // back to base-14 below — never mid-export.
          const mod = (await import('@pdf-lib/fontkit')) as unknown as {
            default?: Parameters<typeof pdfDocLib.registerFontkit>[0];
          };
          const fk = mod.default;
          if (!fk || typeof (fk as { create?: unknown }).create !== 'function') {
            throw new Error('fontkit shape mismatch');
          }
          pdfDocLib.registerFontkit(fk);
          const [plainBytes, boldBytes] = await Promise.all([
            loadFontBytes(fam, false),
            loadFontBytes(fam, true),
          ]);
          // pdf-lib has no oblique custom faces — reuse upright for italics
          // (stated; synthetic slanting would lie about the metrics).
          const plain = await pdfDocLib.embedFont(plainBytes);
          const bold = await pdfDocLib.embedFont(boldBytes);
          const set: famFonts = { plain, bold, italic: plain, boldItalic: bold };
          embedded.set(fam, set);
          return set;
        } catch {
          noteOfflineFonts();
          embedded.set(fam, null);
          return null;
        }
      };
      const libFontFor = async (font: PdfFont | undefined, bold: boolean, _italic: boolean) => {
        void _italic;
        const set = await libFontsFor(font || 'sans');
        if (!set) return bold ? helvBold : helv;
        return bold ? set.bold : set.plain;
      };
      const libPages = pdfDocLib.getPages();
      if (!pdfDoc) throw new Error('PDF not loaded');
      // Rotated pages: annotations live in the *viewport* frame (what you
      // saw while editing). Map them once into unrotated top-down page
      // space so every later draw/flip (which assumes pageH − y) lands on
      // the right region. Identity for angle 0 — zero behavior change on
      // the common path.
      for (const [p, list] of Object.entries(clean)) {
        if (!list.length) continue;
        const n = Number(p);
        const lp = libPages[n - 1];
        if (!lp) continue;
        const angle = ((lp.getRotation().angle % 360) + 360) % 360;
        if (angle === 0) continue;
        const vp1 = await (await pdfDoc.getPage(n)).getViewport({ scale: 1 });
        const pageH = lp.getHeight();
        const toTop = (x: number, y: number) => {
          const [px, py] = vp1.convertToPdfPoint(x, y);
          return { x: px, y: pageH - py };
        };
        clean[n] = list.map((a): Anno => {
          if (a.kind === 'draw') {
            const pts: number[] = [];
            for (let i = 0; i < a.points.length; i += 2) {
              const c = toTop(a.points[i]!, a.points[i + 1]!);
              pts.push(c.x, c.y);
            }
            return { ...a, points: pts };
          }
          if (a.kind === 'text' || a.kind === 'note' || a.kind === 'flow') {
            const c = toTop(a.x, a.y);
            return { ...a, x: c.x, y: c.y };
          }
          const c0 = toTop(a.x, a.y);
          const c1 = toTop(a.x + a.w, a.y + a.h);
          return {
            ...a,
            x: Math.min(c0.x, c1.x),
            y: Math.min(c0.y, c1.y),
            w: Math.abs(c1.x - c0.x),
            h: Math.abs(c1.y - c0.y),
          };
        });
      }
      // True redaction FIRST (before the visual burn): strip text bytes
      // inside redact rects, then verify by re-extracting. Anything the
      // engine can't map blocks "verified" status — stated, never silent.
      const redactRects: Record<number, { x: number; y: number; w: number; h: number }[]> = {};
      for (const [pageNum, list] of Object.entries(clean)) {
        if (!libPages[Number(pageNum) - 1]) continue;
        for (const a of list) {
          if (a.kind !== 'redact') continue;
          // Stored raw (top-down); flipped once via flipRectForPdf below —
          // flipping here too would double-flip onto the wrong region.
          (redactRects[Number(pageNum)] ||= []).push({
            x: a.x,
            y: a.y,
            w: a.w,
            h: a.h,
          });
        }
      }
      let redactOutcome: { removedTexts: string[]; flagged: string[]; pagesTouched: number } | null = null;
      if (Object.keys(redactRects).length > 0) {
        const { applyRedactions, stripAnnotations, sanitizeMetadata, flipRectForPdf } = await import('@/lib/pdfRedact');
        const pdfRects: Record<number, { x: number; y: number; w: number; h: number }[]> = {};
        for (const [pn, list] of Object.entries(redactRects)) {
          const lp = libPages[Number(pn) - 1];
          if (!lp) continue;
          pdfRects[Number(pn)] = list.map((r) => flipRectForPdf(r, lp.getHeight()));
        }
        redactOutcome = await applyRedactions(pdfDocLib, pdfRects);
        // Annotations under rects + metadata ride along on redacted exports.
        // Attachments are flagged, never stripped (see pdfRedact step 3).
        const annotRes = stripAnnotations(pdfDocLib, pdfRects);
        if (annotRes.removed > 0) {
          toast.success(`Removed ${annotRes.removed} annotation(s) inside redaction regions.`);
        }
        if (annotRes.flaggedAttachments) {
          redactOutcome.flagged.push('embedded files detected — inspect manually, never auto-deleted');
        }
        sanitizeMetadata(pdfDocLib);
        // Maximum mode: rasterize every redacted page at ~200 DPI and swap
        // it in. Nothing extractable survives — text, images, hidden layers
        // all become pixels (and page text selection dies with them; stated
        // in the mode picker, not discovered at export).
        if (!pdfDoc) throw new Error('PDF not loaded');
        if (redactMode === 'maximum') {
          const targets = Object.keys(redactRects).map(Number).sort((a, b) => b - a);
          for (const pn of targets) {
            try {
              const vpg = await pdfDoc.getPage(pn);
              const vp = vpg.getViewport({ scale: 200 / 72 });
              const cnv = document.createElement('canvas');
              cnv.width = Math.floor(vp.width);
              cnv.height = Math.floor(vp.height);
              await vpg.render({ canvasContext: cnv.getContext('2d')!, viewport: vp }).promise;
              const blob = await new Promise<Blob | null>((res) => cnv.toBlob(res, 'image/jpeg', 0.92));
              if (!blob) throw new Error('rasterize failed');
              const bytes = new Uint8Array(await blob.arrayBuffer());
              const img = await pdfDocLib.embedJpg(bytes);
              const dims = img.scaleToFit(vp.width, vp.height);
              pdfDocLib.removePage(pn - 1);
              const fresh = pdfDocLib.insertPage(pn - 1, [dims.width, dims.height]);
              fresh.drawImage(img, { x: 0, y: 0, width: dims.width, height: dims.height });
            } catch {
              redactOutcome.flagged.push(`page ${pn}: rasterize failed — kept selective stripping`);
            }
          }
          // Page indices shifted; refresh the lib page handle list.
          libPages.length = 0;
          libPages.push(...pdfDocLib.getPages());
        }
      }
      for (const [pageNum, list] of Object.entries(clean)) {
        const lp = libPages[Number(pageNum) - 1];
        if (!lp) continue;
        const pageH = lp.getHeight();
        // Coords are unrot top-down (converted above when /Rotate ≠ 0).
        // On rotated pages, glyphs drawn at 0° would read sideways vs the
        // on-screen preview — counter-rotate by the page angle so export
        // matches what the user saw.
        const pageAngle = ((lp.getRotation().angle % 360) + 360) % 360;
        for (const a of list) {
          if (a.kind === 'text') {
            const c = hexToRgb(a.color);
            const font = await libFontFor(a.font, a.bold, !!a.italic);
            const tw = font.widthOfTextAtSize(a.text, a.size);
            const tx = a.align === 'center' ? a.x - tw / 2 : a.align === 'right' ? a.x - tw : a.x;
            const ty = pageH - a.y;
            lp.drawText(a.text, {
              x: tx,
              y: ty,
              size: a.size,
              font,
              color: rgb(c.r, c.g, c.b),
              ...(pageAngle ? { rotate: degrees(pageAngle) } : {}),
            });
            const decoPdf = (dy: number) => {
              lp.drawLine({ start: { x: tx, y: dy }, end: { x: tx + tw, y: dy }, thickness: Math.max(0.75, a.size / 14), color: rgb(c.r, c.g, c.b) });
            };
            if (a.underline) decoPdf(ty - 2);
            if (a.strike) decoPdf(ty + a.size * 0.3);
          } else if (a.kind === 'flow') {
            // Same wrapLines as the preview (export measures approximately;
            // maxWidth scales any over-wide line down so nothing overflows).
            const c = hexToRgb(a.color);
            const font = await libFontFor(a.font, a.bold, false);
            const approx = (s: string) => s.length * a.size * 0.55;
            const lines = wrapLines(a.text, a.w, approx);
            lines.forEach((line, li) => {
              lp.drawText(line, {
                x: a.x,
                y: pageH - (a.y + li * a.size * 1.25),
                size: a.size,
                font,
                color: rgb(c.r, c.g, c.b),
                maxWidth: a.w,
              });
            });
          } else if (a.kind === 'highlight') {
            const c = hexToRgb(a.color);
            lp.drawRectangle({
              x: a.x, y: pageH - (a.y + a.h),
              width: a.w, height: a.h,
              color: rgb(c.r, c.g, c.b), opacity: a.opacity ?? 0.4,
            });
          } else if (a.kind === 'whiteout') {
            lp.drawRectangle({
              x: a.x, y: pageH - (a.y + a.h),
              width: a.w, height: a.h,
              color: rgb(1, 1, 1),
            });
          } else if (a.kind === 'redact') {
            lp.drawRectangle({
              x: a.x, y: pageH - (a.y + a.h),
              width: a.w, height: a.h,
              color: rgb(0, 0, 0),
            });
          } else if (a.kind === 'draw') {
            const pts = a.points;
            let d = '';
            for (let j = 0; j + 1 < pts.length; j += 2) {
              const x = pts[j]!.toFixed(1);
              const y = (pageH - pts[j + 1]!).toFixed(1);
              d += j === 0 ? `M ${x} ${y} ` : `L ${x} ${y} `;
            }
            const c = hexToRgb(a.color);
            lp.drawSvgPath(d, { borderColor: rgb(c.r, c.g, c.b), borderWidth: a.width });
          } else if (a.kind === 'shape') {
            const c = hexToRgb(a.color);
            const col = rgb(c.r, c.g, c.b);
            const sy = pageH - (a.y + a.h);
            if (a.shape === 'rect') {
              lp.drawRectangle({ x: a.x, y: sy, width: a.w, height: a.h, borderColor: col, borderWidth: a.width });
            } else if (a.shape === 'ellipse') {
              lp.drawEllipse({ x: a.x + a.w / 2, y: sy + a.h / 2, xScale: Math.abs(a.w) / 2, yScale: Math.abs(a.h) / 2, borderColor: col, borderWidth: a.width });
            } else {
              const x2 = a.x + a.w;
              const y2 = pageH - a.y;
              const y1 = pageH - (a.y + a.h);
              lp.drawLine({ start: { x: a.x, y: y1 }, end: { x: x2, y: y2 }, thickness: a.width, color: col });
              if (a.shape === 'arrow') {
                const ang = Math.atan2(y2 - y1, x2 - a.x);
                const head = Math.min(10, Math.hypot(x2 - a.x, y2 - y1) / 4);
                lp.drawLine({ start: { x: x2, y: y2 }, end: { x: x2 - head * Math.cos(ang - 0.4), y: y2 - head * Math.sin(ang - 0.4) }, thickness: a.width, color: col });
                lp.drawLine({ start: { x: x2, y: y2 }, end: { x: x2 - head * Math.cos(ang + 0.4), y: y2 - head * Math.sin(ang + 0.4) }, thickness: a.width, color: col });
              }
            }
          } else if (a.kind === 'note') {
            // Wrapped lines: export must never silently drop note text.
            const words = a.text.split(/\s+/).filter(Boolean);
            const lines: string[] = [];
            let cur = '';
            for (const w of words) {
              if ((cur + ' ' + w).trim().length > 28) { lines.push(cur.trim()); cur = w; }
              else cur += ' ' + w;
            }
            if (cur.trim()) lines.push(cur.trim());
            const shown = lines.slice(0, 8);
            const boxH = 14 + shown.length * 11;
            lp.drawRectangle({ x: a.x, y: pageH - (a.y + boxH), width: 190, height: boxH, color: rgb(1, 0.95, 0.64), borderColor: rgb(0.85, 0.75, 0.2), borderWidth: 0.75 });
            shown.forEach((line, li) => {
              lp.drawText(line, { x: a.x + 5, y: pageH - (a.y + 22 + li * 11), size: 9, font: helv, color: rgb(0, 0, 0), maxWidth: 180, lineHeight: 11 });
            });
          } else if (a.kind === 'image') {
            const bytes = await fetch(a.dataUrl).then((r) => r.arrayBuffer());
            const img = a.dataUrl.startsWith('data:image/jpeg') || a.dataUrl.startsWith('data:image/jpg')
              ? await pdfDocLib.embedJpg(bytes)
              : await pdfDocLib.embedPng(bytes);
            lp.drawImage(img, {
              x: a.x, y: pageH - (a.y + a.h),
              width: a.w, height: a.h,
            });
          }
        }
      }
      const out = await pdfDocLib.save();
      // Verify gate: re-extract the EXPORTED bytes and assert every removed
      // string is actually gone. A redaction that fails verification fails
      // the whole export loudly — never ships a black box over live text.
      if (redactOutcome && redactOutcome.removedTexts.length > 0) {
        try {
          const check = await pdfjsLib.getDocument({ data: out.slice() }).promise;
          const leaked: string[] = [];
          for (let n = 1; n <= check.numPages; n++) {
            const tc = await (await check.getPage(n)).getTextContent();
            const pageText = tc.items.map((it) => ('str' in it ? String(it.str) : '')).join(' ');
            for (const s of redactOutcome.removedTexts) {
              if (s && pageText.includes(s)) leaked.push(s);
            }
          }
          try { await check.destroy(); } catch { /* ignore */ }
          if (leaked.length > 0) {
            toast.error(`Redaction UNVERIFIED — ${leaked.length} removed string(s) still extractable. Export blocked; adjust regions and retry.`, { duration: 8000 });
            setExporting(false);
            return;
          }
        } catch {
          toast.error('Redaction verify step failed — export blocked rather than shipping unverified.', { duration: 8000 });
          setExporting(false);
          return;
        }
      }
      downloadOrShare(URL.createObjectURL(new Blob([out as unknown as BlobPart], { type: 'application/pdf' })), `edited-${file?.name || 'document.pdf'}`);
      if (redactOutcome && redactOutcome.removedTexts.length > 0) {
        const extra = redactOutcome.flagged.length > 0 ? ` Flagged (verify manually): ${redactOutcome.flagged.slice(0, 3).join('; ')}${redactOutcome.flagged.length > 3 ? '…' : ''}` : '';
        const modeNote = redactMode === 'maximum' ? ' Redacted pages rasterized (no selectable text remains).' : '';
        toast.success(`Exported — redaction VERIFIED clean on ${redactOutcome.pagesTouched} page(s).${modeNote}${extra}`, { duration: 8000 });
      } else {
        toast.success(`Exported with ${total} annotation${total === 1 ? '' : 's'} — additions only, original content untouched.`);
      }
    } catch {
      toast.error('Export failed — try fewer annotations or a smaller file.');
    } finally {
      setExporting(false);
    }
  };

  const selAnno = selected ? annos[selected.page]?.[selected.index] : undefined;
  const selIsText = !!selAnno && (selAnno.kind === 'text' || selAnno.kind === 'flow');
  const showFormatBar = tool === 'text' || selIsText;

  // One bar, two targets: with a text/flow annotation selected it styles the
  // selection; otherwise it sets the defaults for the next box. This is the
  // Word/Google-Docs split — sidebar picks the tool, the bar styles things.
  const patchTextStyle = (patch: Partial<{ color: string; size: number; bold: boolean; italic: boolean; underline: boolean; strike: boolean; align: 'left' | 'center' | 'right'; font: PdfFont }>) => {
    if ('color' in patch && patch.color !== undefined) setTextColor(patch.color);
    if ('size' in patch && patch.size !== undefined) setTextSize(patch.size);
    if ('bold' in patch && patch.bold !== undefined) setTextBold(patch.bold);
    if ('italic' in patch && patch.italic !== undefined) setTextItalic(patch.italic);
    if ('underline' in patch && patch.underline !== undefined) setTextUnderline(patch.underline);
    if ('strike' in patch && patch.strike !== undefined) setTextStrike(patch.strike);
    if ('align' in patch && patch.align !== undefined) setTextAlign(patch.align);
    if ('font' in patch && patch.font !== undefined) setTextFont(patch.font);
    if (selected && selAnno && (selAnno.kind === 'text' || selAnno.kind === 'flow')) {
      commitAnnos((prev) => ({
        ...prev,
        [selected.page]: (prev[selected.page] || []).map((a, i) =>
          i === selected.index && (a.kind === 'text' || a.kind === 'flow') ? { ...a, ...patch } : a,
        ),
      }));
    }
  };

  // Effective values: selection wins, else defaults.
  const effColor = selIsText ? (selAnno as TextAnno | FlowAnno).color : textColor;
  const effSize = selIsText ? (selAnno as TextAnno | FlowAnno).size : textSize;
  const [showFind, setShowFind] = useState(false);
  // Keyboard architecture (audited Sep 2026 after four canvas-only bugs):
  // ONE window listener owns every shortcut the (?) panel lists, except
  // arrow nudge, which stays canvas-scoped on purpose (stealing arrows
  // globally would break scrolling and dropdown navigation). The canvas
  // handler must never grow modifier-key bindings again — focus-dependent
  // shortcuts masquerading as global is the exact failure mode this
  // split exists to prevent. saveNow/actions close over per-render state,
  // so the once-bound listener calls through refs synced after each render
  // (never during render — React Compiler flags render-phase ref writes).
  const saveFlushingRef = useRef(saveFlushing);
  const selectedRef = useRef(selected);
  const actionsRef = useRef({ undo, redo, duplicateSelected, deleteSelected, copySelected, pasteClipboard });
  useEffect(() => {
    saveFlushingRef.current = saveFlushing;
    selectedRef.current = selected;
    actionsRef.current = { undo, redo, duplicateSelected, deleteSelected, copySelected, pasteClipboard };
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      // Save works even mid-typing (the browser save-page dialog is worse)
      // and flushes the live inline draft first — screen == disk.
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void saveFlushingRef.current();
        return;
      }
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      const a = actionsRef.current;
      if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); a.undo(); return; }
      if ((mod && e.key.toLowerCase() === 'y') || (mod && e.shiftKey && e.key.toLowerCase() === 'z')) { e.preventDefault(); a.redo(); return; }
      if ((mod && e.key.toLowerCase() === 'f') || e.key === 'F3') { e.preventDefault(); setShowFind(true); return; }
      if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); a.duplicateSelected(); return; }
      if (mod && e.key.toLowerCase() === 'c') { e.preventDefault(); a.copySelected(); return; }
      if (mod && e.key.toLowerCase() === 'v') { e.preventDefault(); a.pasteClipboard(); return; }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Only swallow Backspace when there's a selection to delete —
        // otherwise we'd block the browser's own back-navigation for nothing.
        if (!selectedRef.current) return;
        e.preventDefault();
        a.deleteSelected();
        return;
      }
      if (e.key === '?') { setShowShortcuts(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const showDrawBar = tool === 'draw' || tool === 'highlight' || tool === 'shape';

  const tools: { id: Tool; label: string; icon: React.ReactNode; group: string }[] = [
    { id: 'text', label: 'Text', icon: <Type className="w-4 h-4" />, group: 'Text & content' },
    { id: 'select', label: 'Select', icon: <TextSelect className="w-4 h-4" />, group: 'Text & content' },
    { id: 'retype', label: 'Retype', icon: <MousePointerClick className="w-4 h-4" />, group: 'Text & content' },
    { id: 'highlight', label: 'Highlight', icon: <Highlighter className="w-4 h-4" />, group: 'Drawing' },
    { id: 'draw', label: 'Draw', icon: <PenLine className="w-4 h-4" />, group: 'Drawing' },
    { id: 'shape', label: 'Shapes', icon: <Square className="w-4 h-4" />, group: 'Drawing' },
    { id: 'note', label: 'Note', icon: <StickyNote className="w-4 h-4" />, group: 'Text & content' },
    { id: 'whiteout', label: 'Cover up', icon: <Eraser className="w-4 h-4" />, group: 'Drawing' },
    { id: 'redact', label: 'Redact', icon: <EyeOff className="w-4 h-4" />, group: 'Drawing' },
    { id: 'image', label: 'Image', icon: <ImageIcon className="w-4 h-4" />, group: 'Media & extras' },
    { id: 'sign', label: 'Sign', icon: <PenTool className="w-4 h-4" />, group: 'Media & extras' },
  ];
  const toolGroups = ['Text & content', 'Drawing', 'Media & extras'];

  if (!pdfDoc) {
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">PDF Editor — add text, highlights, drawings & signatures</h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            Free, no signup, no watermark. Everything runs in your browser — your file is never uploaded.
            Edits are additions on top of the original; existing text can&apos;t be retyped.
          </p>
          <FileUploader accept=".pdf,application/pdf" freeMaxSizeMB={125} maxSizeMB={isPro ? Number.MAX_SAFE_INTEGER : 125} onFileSelect={loadFile} title="Open a PDF to edit" subtitle={isPro ? 'No size limit on Pro · 150–500 pages by plan' : 'Up to 125 MB free · 150–500 pages by plan'} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
            {([
              ['Fill & sign', 'Form + signature, guided', 'sign'],
              ['Mark up', 'Highlight + notes, guided', 'review'],
              ['Stamp copy', 'Big gray text stamp', 'watermark'],
            ] as const).map(([label, desc, intent]) => (
              <button
                key={label}
                onClick={() => pickPreset(intent)}
                className="p-3 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)] transition-colors"
              >
                <span className="block text-xs font-bold text-[var(--text-primary)]">{label}</span>
                <span className="block text-[11px] text-[var(--text-muted)] mt-0.5">{desc}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-[var(--border-subtle)]" />
            <span className="text-xs text-[var(--text-muted)]">or start blank</span>
            <span className="h-px flex-1 bg-[var(--border-subtle)]" />
          </div>
          <div className="flex justify-center gap-2">
            <button onClick={() => newBlankDoc('a4')} className="px-5 py-2.5 rounded-xl border border-[var(--border-subtle)] text-sm font-bold hover:bg-[var(--bg-overlay)] transition-colors">
              New blank A4
            </button>
            <button onClick={() => newBlankDoc('letter')} className="px-5 py-2.5 rounded-xl border border-[var(--border-subtle)] text-sm font-bold hover:bg-[var(--bg-overlay)] transition-colors">
              New blank Letter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="space-y-4 fullscreen:bg-[var(--bg-base)] fullscreen:p-4 fullscreen:overflow-auto fullscreen:h-screen">
      {/* Ribbon: file row + grouped action rows. Wraps always — nothing clips. */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl px-4 py-3 space-y-2.5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold text-[var(--text-primary)] truncate max-w-[220px]" title={file?.name}>{file?.name}</span>
          <span className="text-xs text-[var(--text-muted)]">Page {page}/{pageCount}</span>
          <div className="flex items-center gap-1 ml-2">
            <button onClick={() => goPage(page - 1)} disabled={page <= 1} aria-label="Previous page" title="Previous page" className="p-2 rounded-lg border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-overlay)]">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => goPage(page + 1)} disabled={page >= pageCount} aria-label="Next page" title="Next page" className="p-2 rounded-lg border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-overlay)]">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-1" role="group" aria-label="Zoom">
            {[0.75, 1, 1.5, 2].map((z) => (
              <button
                key={z}
                onClick={() => setScale(z)}
                aria-pressed={scale === z}
                aria-label={`Zoom ${Math.round(z * 100)} percent`}
                title={`Zoom ${Math.round(z * 100)}%`}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border ${scale === z ? 'bg-[var(--accent-ink)] text-white border-transparent' : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)]'}`}
              >
                {Math.round(z * 100)}%
              </button>
            ))}
            <button onClick={() => fitZoom('width')} aria-label="Fit page width" title="Fit to width" className="px-2 py-1.5 rounded-lg text-[11px] font-bold border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)]">
              Fit
            </button>
            <button onClick={() => fitZoom('page')} aria-label="Fit whole page" title="Fit whole page" className="px-2 py-1.5 rounded-lg text-[11px] font-bold border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)]">
              Page
            </button>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {fileBytes && (
              <span className="text-[11px] font-mono text-[var(--text-muted)]" aria-live="polite" title={savedAt ? `Last saved ${new Date(savedAt).toLocaleTimeString()}` : 'Not saved yet'}>
                {saving ? 'Saving…' : dirty ? 'Unsaved changes' : savedAt ? `Saved ${new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
              </span>
            )}
            <button onClick={() => setShowFind(true)} aria-label="Find in document" title="Find & replace (Ctrl+F) — works with any tool" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)]">
              <Search className="w-4 h-4" /> Find
            </button>
            <button onClick={() => saveFlushing()} aria-label="Save working session" title="Save session (Ctrl+S) — persists edits without exporting" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)]">
              <Save className="w-4 h-4" /> Save
            </button>
            <button onClick={() => setShowVersions((v) => !v)} aria-pressed={showVersions} aria-label="Version history" title="Version history — restore earlier states" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)]">
              <History className="w-4 h-4" /> History{versions.length > 0 ? ` ${versions.length}` : ''}
            </button>
            <button onClick={toggleFocus} aria-pressed={focus} aria-label={focus ? 'Exit focus mode' : 'Enter focus mode (editor only)'} title={focus ? 'Exit focus mode' : 'Focus mode — editor only'} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)]">
              {focus ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />} {focus ? 'Exit focus' : 'Focus'}
            </button>
            <button onClick={exportPdf} disabled={exporting} aria-label="Download flattened PDF" title="Download — annotations are flattened permanently" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent-ink)] text-white text-xs font-bold hover:opacity-90 disabled:opacity-50">
              <Download className="w-4 h-4" /> {exporting ? 'Exporting…' : 'Download · flattened'}
            </button>
            <a
              href={`/contact?subject=general&message=${encodeURIComponent(`PDF Editor issue on ${typeof window !== 'undefined' ? window.location.pathname : '/pdf/pdf-editor'}: `)}`}
              title="Report a problem with this tool"
              aria-label="Report a problem with this tool"
              className="p-2 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)] text-[var(--text-secondary)]"
            >
              <Flag className="w-4 h-4" />
            </a>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2.5 border-t border-[var(--border-subtle)] max-sm:flex-nowrap max-sm:overflow-x-auto">
          <div className="flex items-center gap-1.5" role="group" aria-label="AI actions">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]" title="Editing is local. AI actions send only the page text to our server.">AI</span>
            <button onClick={() => runAiAction('summarize')} disabled={aiWorking} aria-label="Summarize this page with AI, 1 credit" title={isSignedIn ? 'Summarize page · 1 credit' : 'Sign in to use AI actions'} className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)] disabled:opacity-50">
              <Sparkles className="w-4 h-4" /> {aiWorking ? '…' : 'Summarize'} <span aria-hidden="true" className="px-1 py-0.5 text-[9px] font-mono rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30">1</span>
            </button>
            <button onClick={() => runAiAction('grammar')} disabled={aiWorking} aria-label="Fix grammar with AI, 1 credit" title={isSignedIn ? 'Fix grammar · 1 credit' : 'Sign in to use AI actions'} className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)] disabled:opacity-50">
              <Sparkles className="w-4 h-4" /> {aiWorking ? '…' : 'Fix grammar'} <span aria-hidden="true" className="px-1 py-0.5 text-[9px] font-mono rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30">1</span>
            </button>
            <button onClick={() => runAiAction('translate')} disabled={aiWorking} aria-label="Translate to English with AI, 1 credit" title={isSignedIn ? 'Translate to English · 1 credit' : 'Sign in to use AI actions'} className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)] disabled:opacity-50">
              <Sparkles className="w-4 h-4" /> {aiWorking ? '…' : 'Translate'} <span aria-hidden="true" className="px-1 py-0.5 text-[9px] font-mono rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30">1</span>
            </button>
            <button onClick={findSensitive} disabled={aiWorking} aria-label="Suggest sensitive-data cover boxes with AI, Pro, 1 credit" title={isPro ? 'Find sensitive data · 1 credit' : 'Pro feature — upgrade to unlock'} className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)] disabled:opacity-50">
              {!isPro && <span aria-hidden="true">👑</span>} {aiWorking ? '…' : 'Find sensitive'} <span aria-hidden="true" className="px-1 py-0.5 text-[9px] font-mono rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30">1</span>
            </button>
            {selection.length > 0 && (
              <button onClick={() => { setSelection([]); drawOverlay(); toast.success('Selection cleared — AI uses the whole page.'); }} aria-label="Clear text selection" title="Clear selection" className="px-2.5 py-2 rounded-lg border border-[var(--accent)]/40 text-xs font-bold text-[var(--accent)] hover:bg-[var(--accent)]/10">
                {selection.length} selected ✕
              </button>
            )}
            <button onClick={askAboutDoc} aria-label="Ask AI chat about this document" title="Open AI Chat with this file loaded" className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)]">
              <MessageCircleQuestion className="w-4 h-4" /> Ask doc
            </button>
            <select
              value={ocrLang}
              onChange={(e) => { setOcrLang(e.target.value); setOcrWords([]); }}
              aria-label="OCR language (choose before running OCR)"
              title="Recognition language — pick before you click OCR"
              className="px-1.5 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[11px] bg-[var(--bg-overlay)] text-[var(--text-secondary)]"
            >
              <option value="eng">OCR: English</option>
              <option value="hin">OCR: Hindi</option>
              <option value="tam">OCR: Tamil</option>
              <option value="deu">OCR: German</option>
              <option value="spa">OCR: Spanish</option>
              <option value="fra">OCR: French</option>
              <option value="pol">OCR: Polish</option>
              <option value="ara">OCR: Arabic</option>
            </select>
            <button onClick={runOcr} disabled={ocrRunning} aria-label="OCR this page" title="Recognize text on scanned pages in the selected language" className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)] disabled:opacity-50">
              <ScanText className="w-4 h-4" /> {ocrRunning ? `${ocrProgress}%` : 'OCR'}
            </button>
          </div>
          <div className="flex items-center gap-1.5" role="group" aria-label="Page actions">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Page</span>
            <button onClick={() => restructure('rotate')} aria-label="Rotate current page" title="Rotate page 90°" className="p-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)]">
              <RotateCw className="w-4 h-4" />
            </button>
            <button onClick={() => restructure('duplicate')} aria-label="Duplicate current page" title="Duplicate page" className="p-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)]">
              <CopyPlus className="w-4 h-4" />
            </button>
            <button onClick={() => restructure('delete')} aria-label="Delete current page" title="Delete page" className="p-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)]">
              <FileMinus2 className="w-4 h-4" />
            </button>
            <button onClick={() => restructure('left')} disabled={page <= 1} aria-label="Move page earlier" title="Move page earlier" className="p-2 rounded-lg border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-overlay)]">
              <MoveLeft className="w-4 h-4" />
            </button>
            <button onClick={() => restructure('right')} disabled={page >= pageCount} aria-label="Move page later" title="Move page later" className="p-2 rounded-lg border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-overlay)]">
              <MoveRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-1.5" role="group" aria-label="Edit actions">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Edit</span>
            <button onClick={undo} disabled={historyCount === 0} aria-label={`Undo last change (${historyCount} in history)`} title="Undo (Ctrl+Z)" className="p-2 rounded-lg border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-overlay)]">
              <Undo2 className="w-4 h-4" />
            </button>
            <button onClick={redo} disabled={redoCount === 0} aria-label="Redo" title="Redo (Ctrl+Y)" className="p-2 rounded-lg border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-overlay)]">
              <Redo2 className="w-4 h-4" />
            </button>
            {historyCount > 0 && (
              <span className="px-2 py-1 text-[10px] font-mono text-[var(--text-muted)]" title="Edits you can undo">{historyCount}</span>
            )}
            <button onClick={() => setShowShortcuts(true)} aria-label="Keyboard shortcuts" title="Keyboard shortcuts (?)" className="p-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)]">
              <Keyboard className="w-4 h-4" />
            </button>
          <button onClick={deleteSelected} disabled={!selected} aria-label="Delete selected annotation" title="Delete selected (Del)" className="p-2 rounded-lg border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-overlay)]">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={() => moveLayer(1)} disabled={!selected} aria-label="Bring forward" title="Bring forward (on top)" className="p-2 rounded-lg border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-overlay)]">
            <BringToFront className="w-4 h-4" />
          </button>
          <button onClick={() => moveLayer(-1)} disabled={!selected} aria-label="Send backward" title="Send backward (behind)" className="p-2 rounded-lg border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-overlay)]">
            <SendToBack className="w-4 h-4" />
          </button>
            <button onClick={copySelected} disabled={!selected} aria-label="Copy selected annotation" title="Copy selected (Ctrl+C)" className="p-2 rounded-lg border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-overlay)]">
              <Copy className="w-4 h-4" />
            </button>
            <button onClick={pasteClipboard} aria-label="Paste copied annotation" title="Paste (Ctrl+V)" className="p-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)]">
              <ClipboardPaste className="w-4 h-4" />
            </button>
            <button onClick={stampAllPages} aria-label="Stamp selected image on all pages" title="Stamp on all pages (select an image/signature first)" className="p-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)]">
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showSignPad && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-[var(--text-primary)]">Draw your signature, then click on the page to place it.</p>
            <button
              onClick={() => applySavedSig()}
              title="Reuse the signature saved on this device (stored locally, never uploaded)"
              className="ml-auto px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)] whitespace-nowrap"
            >
              Use saved{hasSavedSig ? ' ✓' : ''}
            </button>
          </div>
          <canvas
            ref={signPadRef}
            width={480}
            height={160}
            className="w-full max-w-[480px] bg-white rounded-xl border border-[var(--border-subtle)] touch-none cursor-crosshair"
            onPointerDown={(e) => {
              const c = signPadRef.current!;
              const r = c.getBoundingClientRect();
              const ctx = c.getContext('2d')!;
              ctx.strokeStyle = '#000';
              ctx.lineWidth = 2.5;
              ctx.lineCap = 'round';
              ctx.beginPath();
              ctx.moveTo((e.clientX - r.left) * (c.width / r.width), (e.clientY - r.top) * (c.height / r.height));
              const move = (ev: PointerEvent) => {
                ctx.lineTo((ev.clientX - r.left) * (c.width / r.width), (ev.clientY - r.top) * (c.height / r.height));
                ctx.stroke();
              };
              const up = () => {
                window.removeEventListener('pointermove', move);
                window.removeEventListener('pointerup', up);
              };
              window.addEventListener('pointermove', move);
              window.addEventListener('pointerup', up);
            }}
          />
          <div className="flex gap-2">
            <button onClick={saveSignPad} className="px-4 py-2 rounded-xl bg-[var(--accent-ink)] text-white text-xs font-bold">Save signature</button>
            <button onClick={() => { const c = signPadRef.current; c?.getContext('2d')?.clearRect(0, 0, c.width, c.height); }} className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-xs">Clear</button>
            <button onClick={() => setShowSignPad(false)} className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-xs">Close</button>
            {hasSavedSig && (
              <button
                onClick={() => {
                  try { localStorage.removeItem(SIG_KEY); } catch { /* ignore */ }
                  setHasSavedSig(false);
                  toast.success('Saved signature forgotten on this device.');
                }}
                className="px-4 py-2 rounded-xl text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] underline"
              >
                Forget saved
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-[var(--text-muted)]">or type it:</span>
            <input
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') applyTypedSignature(); }}
              placeholder="Your name"
              maxLength={40}
              aria-label="Type name for signature"
              className="flex-1 min-w-[140px] bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            />
            <button onClick={applyTypedSignature} className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)]">Use typed</button>
          </div>
        </div>
      )}

      {ocrWords.length > 0 && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-[var(--text-primary)]">Recognized words (page {page}) — click to insert as editable text</p>
            <select value={ocrLang} onChange={(e) => { setOcrLang(e.target.value); setOcrWords([]); }} aria-label="OCR language" className="ml-auto px-2 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs bg-[var(--bg-overlay)]">
              <option value="eng">English</option>
              <option value="hin">Hindi (हिन्दी)</option>
              <option value="tam">Tamil (தமிழ்)</option>
              <option value="deu">German (Deutsch)</option>
              <option value="spa">Spanish (Español)</option>
              <option value="fra">French (Français)</option>
              <option value="pol">Polish (Polski)</option>
              <option value="ara">Arabic (العربية) — copy only</option>
            </select>
            <button onClick={insertAllOcr} className="px-3 py-1.5 rounded-lg bg-[var(--accent-ink)] text-white text-xs font-bold">Insert all</button>
            <button onClick={() => setOcrWords([])} className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs">Clear</button>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {ocrWords.slice(0, 200).map((w, i) => (
              <button
                key={i}
                onClick={() => insertOcrWord(w)}
                title={`Confidence ${w.conf}% — click to insert`}
                className={`px-2 py-1 rounded-lg text-xs font-mono border ${w.conf < 70 ? 'border-amber-500/50 text-amber-600 dark:text-amber-400' : 'border-[var(--border-subtle)] text-[var(--text-secondary)]'} hover:bg-[var(--bg-overlay)]`}
              >
                {w.text}
              </button>
            ))}
            {ocrWords.length > 200 && <span className="text-xs text-[var(--text-muted)] self-center">+{ocrWords.length - 200} more via Insert all</span>}
          </div>
          <p className="text-xs text-[var(--text-muted)]">Amber words are low-confidence — verify before exporting. {ocrLang === 'ara' ? 'Arabic words copy to clipboard (Helvetica has no Arabic glyphs, so on-page insert would render blank).' : 'Click a word to insert it as editable text.'}</p>
          <div className="pt-1 border-t border-[var(--border-subtle)]">
            <RequestFeature tool="pdf-editor-ocr-language" prompt="Need Telugu, Bengali, or another language? Tell us where to send the launch note — top-voted languages ship first." placeholder="you@example.com" />
          </div>
        </div>
      )}

      {/* Focus keeps the full 3-column workspace and drops only the footer
          strips; true fullscreen comes from the browser API. */}
      {showShortcuts && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
          <button aria-label="Close shortcuts" onClick={() => setShowShortcuts(false)} tabIndex={-1} className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default" />
          <div className="relative bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 max-w-sm w-full space-y-2">
            <p className="text-sm font-bold text-[var(--text-primary)] mb-3">Keyboard shortcuts</p>
            {[
              ['Undo / redo', 'Ctrl+Z · Ctrl+Y'],
              ['Save session', 'Ctrl+S'],
              ['Duplicate selected', 'Ctrl+D'],
              ['Delete selected', 'Del'],
              ['Find panel', 'Ctrl+F'],
              ['Copy / paste', 'Ctrl+C · Ctrl+V'],
              ['Nudge (×10 with Shift)', 'Arrow keys'],
              ['This panel', '?'],
            ].map(([label, keys]) => (
              <div key={label} className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">{label}</span>
                <kbd className="px-2 py-1 rounded-lg bg-[var(--bg-overlay)] border border-[var(--border-subtle)] font-mono text-[var(--text-primary)]">{keys}</kbd>
              </div>
            ))}
            <button onClick={() => setShowShortcuts(false)} className="w-full mt-3 px-4 py-2 rounded-xl bg-[var(--accent-ink)] text-white text-xs font-bold">Done</button>
          </div>
        </div>
      )}

      {/* Contextual format bar: visible only when the Text tool is active
          or a text/flow box is selected. Styles the selection if present,
          else the defaults for the next box. */}
      {showFormatBar && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl px-4 py-2.5" role="toolbar" aria-label="Text formatting">
          <select
            value={selIsText ? ((selAnno as TextAnno | FlowAnno).font || 'sans') : textFont}
            onChange={(e) => patchTextStyle({ font: e.target.value as PdfFont })}
            aria-label="Font family"
            title="Font family"
            className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs font-bold"
          >
                  <option value="sans">Sans (Arimo)</option>
                  <option value="serif">Serif (Tinos)</option>
                  <option value="mono">Mono (Cousine)</option>
          </select>
          <input
            type="range" min={8} max={48}
            value={effSize}
            onChange={(e) => patchTextStyle({ size: Number(e.target.value) })}
            className="w-24" aria-label="Text size" title={`Text size ${effSize}`}
          />
          <div className="flex gap-1" role="group" aria-label="Text style">
            {([
              ['bold', 'B', 'Bold', 'font-bold'],
              ['italic', 'I', 'Italic', 'italic'],
              ['underline', 'U', 'Underline', 'underline'],
              ['strike', 'S', 'Strikethrough', 'line-through'],
            ] as const).map(([key, label, title, cls]) => {
              const active = selIsText
                ? annoFlag(selAnno, key)
                : key === 'bold' ? textBold : key === 'italic' ? textItalic : key === 'underline' ? textUnderline : textStrike;
              return (
                <button
                  key={key}
                  onClick={() => patchTextStyle({ [key]: !active } as { bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean })}
                  aria-pressed={active}
                  title={title}
                  className={`px-2.5 py-2 rounded-lg text-xs font-bold border ${cls} ${active ? 'bg-[var(--accent-ink)] text-white border-transparent' : 'border-[var(--border-subtle)]'}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="flex gap-1" role="group" aria-label="Text alignment">
            {(['left', 'center', 'right'] as const).map((a) => {
              const active = selIsText ? ((selAnno as TextAnno).align || 'left') === a : textAlign === a;
              return (
                <button key={a} onClick={() => patchTextStyle({ align: a })} aria-pressed={active} title={`Align ${a}`} className={`px-2.5 py-2 rounded-lg text-xs font-bold border capitalize ${active ? 'bg-[var(--accent-ink)] text-white border-transparent' : 'border-[var(--border-subtle)]'}`}>
                  {a[0]}
                </button>
              );
            })}
          </div>
          <div className="flex gap-1.5" role="group" aria-label="Text color">
            {INK_COLORS.map((c) => (
              <button key={c} onClick={() => patchTextStyle({ color: c })} aria-label={`Text color ${c}`} title={`Text color ${c}`} className={`w-6 h-6 rounded-full border-2 ${effColor === c ? 'border-[var(--accent)]' : 'border-transparent'}`} style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
      )}
      {showDrawBar && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl px-4 py-2.5" role="toolbar" aria-label={`${tool} options`}>
          {tool === 'draw' && (
            <>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]" htmlFor="pdfed-brush">Brush</label>
              <input id="pdfed-brush" type="range" min={0.5} max={8} step={0.5} value={brushWidth} onChange={(e) => setBrushWidth(Number(e.target.value))} className="w-24" aria-label="Brush width" title={`Brush width ${brushWidth}pt`} />
              <div className="flex gap-1.5" role="group" aria-label="Ink color">
                {INK_COLORS.map((c) => (
                  <button key={c} onClick={() => setInkColor(c)} aria-label={`Ink color ${c}`} title={`Ink color ${c}`} className={`w-6 h-6 rounded-full border-2 ${inkColor === c ? 'border-[var(--accent)]' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </>
          )}
          {tool === 'highlight' && (
            <>
              <div className="flex gap-1.5" role="group" aria-label="Marker color">
                {HIGHLIGHT_COLORS.map((c) => (
                  <button key={c} onClick={() => setMarkColor(c)} aria-label={`Marker color ${c}`} title={`Marker color ${c}`} className={`w-6 h-6 rounded-full border-2 ${markColor === c ? 'border-[var(--accent)]' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                ))}
              </div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]" htmlFor="pdfed-opacity">Opacity</label>
              <input id="pdfed-opacity" type="range" min={0.1} max={0.9} step={0.1} value={markOpacity} onChange={(e) => setMarkOpacity(Number(e.target.value))} className="w-24" aria-label="Highlight opacity" title={`Opacity ${Math.round(markOpacity * 100)}%`} />
            </>
          )}
          {tool === 'shape' && (
            <>
              <div className="flex gap-1" role="group" aria-label="Shape">
                {(['rect', 'ellipse', 'line', 'arrow'] as const).map((s) => (
                  <button key={s} onClick={() => setShapeVariant(s)} aria-pressed={shapeVariant === s} title={s} className={`px-2 py-1.5 rounded-lg text-xs font-bold border capitalize ${shapeVariant === s ? 'bg-[var(--accent-ink)] text-white border-transparent' : 'border-[var(--border-subtle)]'}`}>{s}</button>
                ))}
              </div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]" htmlFor="pdfed-stroke">Stroke</label>
              <input id="pdfed-stroke" type="range" min={0.5} max={6} step={0.5} value={shapeWidth} onChange={(e) => setShapeWidth(Number(e.target.value))} className="w-24" aria-label="Shape stroke width" title={`Stroke ${shapeWidth}pt`} />
              <div className="flex gap-1.5" role="group" aria-label="Shape color">
                {INK_COLORS.map((c) => (
                  <button key={c} onClick={() => setInkColor(c)} aria-label={`Shape color ${c}`} title={`Shape color ${c}`} className={`w-6 h-6 rounded-full border-2 ${inkColor === c ? 'border-[var(--accent)]' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {showVersions && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-4 space-y-2" role="dialog" aria-label="Version history">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-[var(--text-primary)]">Version history</p>
            <button onClick={() => { takeVersion('manual snapshot'); toast.success('Snapshot saved.'); }} className="ml-auto px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)]">
              Snapshot now
            </button>
            <button onClick={() => setShowVersions(false)} aria-label="Close version history" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm px-1">✕</button>
          </div>
          {versions.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)]">No versions yet — destructive actions (replace-all, PII sweep, page delete) snapshot automatically, or take one manually.</p>
          ) : (
            <ul className="space-y-1.5 max-h-48 overflow-y-auto">
              {[...versions].reverse().map((v) => (
                <li key={v.at} className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-[var(--text-muted)]">{fmtAge(v.at)}</span>
                  <span className="flex-1 truncate text-[var(--text-secondary)]">{v.label} · p{v.page}</span>
                  <button onClick={() => restoreVersion(v.at)} className="px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] font-bold hover:bg-[var(--bg-overlay)]">
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="text-[11px] text-[var(--text-muted)]">Versions live in this browser only — same privacy as everything else. Restoring keeps your current state as the newest version.</p>
        </div>
      )}

      {conflict && (
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-xs" role="alert">
          <span className="font-bold text-[var(--text-primary)]">Another tab saved a newer version.</span>
          <span className="text-[var(--text-secondary)]">Autosave is paused here so nothing gets overwritten.</span>
          <span className="ml-auto flex gap-2">
            <button onClick={loadExternalDraft} className="px-3 py-1.5 rounded-lg bg-[var(--accent-ink)] text-white font-bold">
              Load their version (discards my unsaved edits)
            </button>
            <button
              onClick={() => {
                externalWriteRef.current = 0;
                setConflict(false);
                toast.success('Keeping your version — next save overwrites.');
              }}
              className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] font-bold"
            >
              Keep mine
            </button>
          </span>
        </div>
      )}

      {showNews && (
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 rounded-2xl bg-[var(--accent-ink)]/5 border border-[var(--accent)]/20 text-xs" role="status">
          <Sparkles className="w-4 h-4 text-[var(--accent)] shrink-0" />
          <span className="text-[var(--text-secondary)]">
            <strong className="text-[var(--text-primary)]">Toolbar cleaned up:</strong> formatting lives in the top bar when text is active, Find is an overlay (Ctrl+F), emoji search inline. Your muscle memory from last time moved — this is the map.
          </span>
          <button onClick={dismissNews} aria-label="Dismiss update notice" className="ml-auto px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] font-bold hover:bg-[var(--bg-overlay)]">
            Got it
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-3 space-y-3 max-h-[720px] overflow-y-auto">
          {toolGroups.map((g) => (
            <div key={g} className="space-y-1.5">
              <p className="px-1 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{g}</p>
              {tools.filter((t) => t.group === g).map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTool(t.id); if (t.id === 'sign' && !signPadDataRef.current) setShowSignPad(true); if (t.id === 'image' && !pendingImageRef.current) imagePickRef.current?.click(); }}
                  aria-pressed={tool === t.id}
                  aria-label={`${t.label} tool`}
                  title={t.label}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${tool === t.id ? 'bg-[var(--accent-ink)] text-white shadow' : 'bg-[var(--bg-overlay)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'}`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          ))}
          <input ref={imagePickRef} type="file" accept="image/png,image/jpeg" className="hidden" aria-label="Pick stamp image" onChange={(e) => onPickImage(e.target.files?.[0] || null)} />
          <details className="pt-1">
            <summary className="px-1 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-primary)]">Emoji stamps</summary>
            <div className="grid grid-cols-6 gap-1 mt-1.5">
              {EMOJI_SET.map((e) => (
                <button key={e} onClick={() => stampEmoji(e)} aria-label={`Stamp ${e}`} title="Stamp this emoji" className="text-lg leading-none p-1 rounded-lg hover:bg-[var(--bg-overlay)] transition-colors">
                  {e}
                </button>
              ))}
            </div>
            <input
              value={emojiQuery}
              onChange={(e) => setEmojiQuery(e.target.value)}
              placeholder="Search all emoji…"
              aria-label="Search emoji"
              className="mt-1.5 w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            />
            {(emojiQuery.trim() || recentEmoji.length > 0) && (
              <div className="mt-1.5 space-y-1.5 max-h-44 overflow-y-auto">
                {recentEmoji.length > 0 && !emojiQuery.trim() && (
                  <div>
                    <p className="px-1 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Recent</p>
                    <div className="grid grid-cols-8 gap-1 mt-1">
                      {recentEmoji.map((e) => (
                        <button key={e} onClick={() => stampEmoji(e)} aria-label={`Stamp ${e}`} title="Stamp this emoji" className="text-base leading-none p-1 rounded-lg hover:bg-[var(--bg-overlay)] transition-colors">
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {emojiQuery.trim() && (
                  <div className="grid grid-cols-8 gap-1">
                    {EMOJI_ALL.filter((e) => e.name.includes(emojiQuery.trim().toLowerCase()) || e.cat.toLowerCase().includes(emojiQuery.trim().toLowerCase()))
                      .slice(0, 32)
                      .map((e) => (
                        <button key={`${e.emoji}-${e.name}`} onClick={() => stampEmoji(e.emoji)} aria-label={`Stamp ${e.name}`} title={e.name} className="text-base leading-none p-1 rounded-lg hover:bg-[var(--bg-overlay)] transition-colors">
                          {e.emoji}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}
          </details>
          <div className="pt-2 space-y-2">
            {(tool === 'text') && (
              <p className="text-xs text-[var(--text-muted)]">Formatting lives in the bar above — it styles the selected box, or the next one you place.</p>
            )}
            {(tool === 'highlight') && (
              <>
                <span className={labelCls}>Marker color</span>
                <div className="flex gap-1.5 flex-wrap">
                  {HIGHLIGHT_COLORS.map((c) => (
                    <button key={c} onClick={() => setMarkColor(c)} aria-label={`Marker color ${c}`} className={`w-6 h-6 rounded-full border-2 ${markColor === c ? 'border-[var(--accent)]' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </>
            )}
            {(tool === 'draw') && (
              <>
                <span className={labelCls}>Ink color</span>
                <div className="flex gap-1.5 flex-wrap">
                  {INK_COLORS.map((c) => (
                    <button key={c} onClick={() => setInkColor(c)} aria-label={`Ink color ${c}`} className={`w-6 h-6 rounded-full border-2 ${inkColor === c ? 'border-[var(--accent)]' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </>
            )}
            {(tool === 'shape') && (
              <>
                <span className={labelCls}>Shape</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['rect', 'ellipse', 'line', 'arrow'] as const).map((s) => (
                    <button key={s} onClick={() => setShapeVariant(s)} aria-pressed={shapeVariant === s} className={`px-2 py-1.5 rounded-lg text-xs font-bold border capitalize ${shapeVariant === s ? 'bg-[var(--accent-ink)] text-white border-transparent' : 'border-[var(--border-subtle)]'}`}>{s}</button>
                  ))}
                </div>
                <span className={labelCls}>Color</span>
                <div className="flex gap-1.5 flex-wrap">
                  {INK_COLORS.map((c) => (
                    <button key={c} onClick={() => setInkColor(c)} aria-label={`Shape color ${c}`} className={`w-6 h-6 rounded-full border-2 ${inkColor === c ? 'border-[var(--accent)]' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
                <p className="text-xs text-[var(--text-muted)]">Drag on the page to draw. Line and arrow: drag from start to end. Click a shape with the Select tool to re-select it.</p>
              </>
            )}
            {(tool === 'note') && (
              <p className="text-xs text-[var(--text-muted)]">Click the page to drop a sticky note, then edit its text below.</p>
            )}
            {(tool === 'whiteout') && (
              <p className="text-xs text-[var(--text-muted)]">Covers an area with white. Hides visually — does not delete the underlying text.</p>
            )}
            {(tool === 'redact' || redactCount > 0) && (
              <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Redaction mode</span>
                <div className="space-y-1.5" role="radiogroup" aria-label="Redaction mode">
                  <button onClick={() => setRedactMode('selective')} aria-pressed={redactMode === 'selective'} role="radio" aria-checked={redactMode === 'selective'} className={`w-full text-left px-3 py-2 rounded-xl border text-xs ${redactMode === 'selective' ? 'border-[var(--accent)] bg-[var(--accent-ink)]/5' : 'border-[var(--border-subtle)]'}`}>
                    <span className="block font-bold text-[var(--text-primary)]">Selective</span>
                    <span className="block text-[var(--text-muted)] mt-0.5">Strips text bytes, keeps pages live and selectable.</span>
                  </button>
                  <button onClick={() => setRedactMode('maximum')} aria-pressed={redactMode === 'maximum'} role="radio" aria-checked={redactMode === 'maximum'} className={`w-full text-left px-3 py-2 rounded-xl border text-xs ${redactMode === 'maximum' ? 'border-[var(--accent)] bg-[var(--accent-ink)]/5' : 'border-[var(--border-subtle)]'}`}>
                    <span className="block font-bold text-[var(--text-primary)]">Maximum</span>
                    <span className="block text-[var(--text-muted)] mt-0.5">Rasterizes redacted pages — nothing extractable, text selection dies too.</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          {selAnno?.kind === 'text' && selected && (            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
              <span className={labelCls}>Edit selected text</span>
              <input
                value={textDraft ?? selAnno.text}
                onChange={(e) => setTextDraft(e.target.value)}
                onBlur={() => {
                  if (textDraft !== null) {
                    const v = textDraft;
                    commitAnnos((prev) => ({
                      ...prev,
                      [selected.page]: (prev[selected.page] || []).map((a, i) => (i === selected.index && a.kind === 'text' ? { ...a, text: v } : a)),
                    }));
                    setTextDraft(null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                  if (e.key === 'Escape') setTextDraft(null);
                }}
                className={inputCls}
                aria-label="Selected annotation text. Enter commits, Escape reverts."
              />
            </div>
          )}
          {selAnno?.kind === 'flow' && selected && (
            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
              <span className={labelCls}>Flowing text (wraps automatically)</span>
              <textarea
                value={textDraft ?? selAnno.text}
                onChange={(e) => setTextDraft(e.target.value)}
                onBlur={() => {
                  if (textDraft !== null) {
                    const v = textDraft;
                    commitAnnos((prev) => ({
                      ...prev,
                      [selected.page]: (prev[selected.page] || []).map((a, i) => (i === selected.index && a.kind === 'flow' ? { ...a, text: v } : a)),
                    }));
                    setTextDraft(null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setTextDraft(null);
                }}
                className={inputCls}
                rows={6}
                autoFocus
                aria-label="Flowing text. Edits apply when you leave the field, Escape reverts."
              />
            </div>
          )}
          {selAnno?.kind === 'note' && selected && (            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
              <span className={labelCls}>Edit note</span>
              <textarea
                value={selAnno.text}
                onChange={(e) => {
                  const v = e.target.value.slice(0, 240);
                  commitAnnos((prev) => ({
                    ...prev,
                    [selected.page]: (prev[selected.page] || []).map((a, i) => (i === selected.index && a.kind === 'note' ? { ...a, text: v } : a)),
                  }));
                }}
                className={inputCls}
                rows={3}
                maxLength={240}
                aria-label="Selected note text (max 240 characters)"
              />
            </div>
          )}
        </div>

        <div ref={canvasColRef} className="lg:col-span-8 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-4 overflow-auto relative">
          <div className="relative mx-auto w-fit" tabIndex={0} role="application" onKeyDown={onCanvasKey} aria-label="PDF page canvas. Arrow keys nudge the selection (Shift for ×10). Delete, Ctrl+C/V, and Ctrl+Z/Y work anywhere in the editor.">
            <span className="sr-only" aria-live="polite">Page {page} of {pageCount}. Text content: {pageText || 'No readable text on this page.'}</span>
            {rendering && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-[var(--bg-overlay)]/80" role="status" aria-label="Rendering page">
                <span className="w-8 h-8 rounded-full border-[3px] border-[var(--accent)] border-t-transparent animate-spin motion-reduce:animate-none" />
                <span className="text-xs font-semibold text-[var(--text-secondary)]">Rendering page {page}…</span>
              </div>
            )}
            <canvas ref={canvasRef} className="rounded-lg shadow" />
            <canvas
              ref={overlayRef}
              className="absolute inset-0 rounded-lg touch-none"
              style={{ cursor: tool === 'text' ? 'text' : 'crosshair' }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            />
            {inlineEdit && (() => {
              // Stay mounted across page flips: when the target isn't live we
              // render hidden — display:none blurs the field, and onBlur is
              // the single commit path (no lost drafts, no suspend flag).
              const raw = inlineEdit.page === page ? annos[page]?.[inlineEdit.index] : undefined;
              const a = raw && (raw.kind === 'text' || raw.kind === 'flow' || raw.kind === 'note') ? raw : undefined;
              const box = a ? inlineEditBox(a, scale) : null;
              const single = a?.kind === 'text';
              const style: React.CSSProperties | undefined =
                box && a
                  ? {
                      left: box.left,
                      top: box.top,
                      width: box.width,
                      height: box.height,
                      fontSize: (a.kind === 'note' ? 13 : a.size) * scale,
                      lineHeight: 1.25,
                      fontWeight: a.kind !== 'note' && a.bold ? 700 : 400,
                      fontStyle: a.kind === 'text' && a.italic ? 'italic' : undefined,
                      fontFamily: a.kind === 'note' ? undefined : fontCss(a.font ?? 'sans'),
                      color: a.kind === 'note' ? undefined : a.color,
                      background: 'var(--bg-surface)',
                      padding: '2px 4px',
                      resize: 'none',
                      overflow: 'hidden',
                    }
                  : undefined;
              const shared = {
                key: `${inlineEdit.page}:${inlineEdit.index}`,
                value: inlineDraft,
                onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setInlineDraft(e.target.value),
                onBlur: commitInline,
                onKeyDown: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                  if (e.key === 'Escape') {
                    e.stopPropagation();
                    revertInline();
                    return;
                  }
                  // Single-line text: Enter commits (matches left panel).
                  // Flow/note: plain Enter inserts a paragraph break —
                  // forcing a commit here would make multi-line boxes
                  // un-writable (they exist precisely for manual breaks).
                  // Ctrl/Cmd+Enter commits those without leaving the field.
                  if (single && e.key === 'Enter') {
                    e.preventDefault();
                    commitInline();
                    return;
                  }
                  if (!single && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    commitInline();
                  }
                },
                className: box ? 'absolute z-20 rounded border-2 border-[var(--accent)] outline-none' : 'hidden',
                style,
                autoFocus: true,
                'aria-label': single
                  ? 'Edit text in place. Enter commits, Escape reverts.'
                  : 'Edit annotation in place. Enter adds a line, Ctrl+Enter commits, Escape reverts.',
              } as const;
              return a?.kind === 'flow' || a?.kind === 'note' ? (
                <textarea {...shared} rows={a.kind === 'note' ? 5 : 3} maxLength={a.kind === 'note' ? 240 : undefined} />
              ) : (
                <input type="text" {...shared} />
              );
            })()}
          </div>
          <p className="mt-3 text-xs text-[var(--text-muted)] text-center">
            {tool === 'text' && 'Click for a flowing box on blank pages, or place separate boxes on existing PDFs.'}
            {tool === 'retype' && 'Click existing text to cover it and retype in matched-size Helvetica.'}
            {tool === 'highlight' && 'Drag over an area to highlight it.'}
            {tool === 'draw' && 'Drag to draw freehand.'}
            {tool === 'shape' && 'Drag to draw a rectangle, ellipse, line, or arrow.'}
            {tool === 'note' && 'Click to drop a sticky note.'}
            {tool === 'whiteout' && 'Drag over an area to cover it with white (visual cover only).'}
            {tool === 'redact' && 'Drag over text to PERMANENTLY remove it — verified on export. Images underneath are not wiped.'}
            {tool === 'image' && 'Pick an image, then click to stamp it.'}
            {tool === 'sign' && 'Draw a signature above, then click to place it.'}
          </p>
          {showFind && (
            <div className="absolute top-4 right-4 z-20 w-72 p-4 space-y-2 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-xl" role="dialog" aria-label="Find and replace">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[var(--text-primary)]">Find & replace</p>
                <button onClick={() => setShowFind(false)} aria-label="Close find panel" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm px-1">✕</button>
              </div>
              <input
                value={findText}
                onChange={(e) => { setFindText(e.target.value); setFindNav(null); }}
                onKeyDown={(e) => { if (e.key === 'Enter') findStep(1); }}
                placeholder="Find text"
                className={inputCls}
                aria-label="Text to find"
                autoFocus
              />
              <input
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Replace with"
                className={inputCls}
                aria-label="Replacement text"
              />
              <div className="flex gap-1.5" role="group" aria-label="Replace scope">
                {(['page', 'all'] as const).map((s) => (
                  <button key={s} onClick={() => setReplaceScope(s)} aria-pressed={replaceScope === s} className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-bold border ${replaceScope === s ? 'bg-[var(--accent-ink)] text-white border-transparent' : 'border-[var(--border-subtle)]'}`}>
                    {s === 'page' ? 'This page' : 'All pages'}
                  </button>
                ))}
              </div>
              <button onClick={findReplace} disabled={replacing} className="w-full px-3 py-2 rounded-xl bg-[var(--accent-ink)] text-white text-xs font-bold disabled:opacity-50">
                {replacing ? 'Replacing…' : 'Replace all'}
              </button>
              <div className="flex gap-1.5" role="group" aria-label="Find navigation">
                <button onClick={findHighlight} aria-label="Highlight matches" title="Highlight all matches on this page" className="flex-1 px-2 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)]">
                  Highlight
                </button>
                <button onClick={() => findStep(-1)} aria-label="Previous match" title="Previous match" className="flex-1 px-2 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)]">
                  ↑ Prev
                </button>
                <button onClick={() => findStep(1)} aria-label="Next match" title="Next match" className="flex-1 px-2 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)]">
                  Next ↓
                </button>
              </div>
              {findNav && (
                <p className="text-[11px] font-mono text-[var(--text-muted)] text-center" aria-live="polite">
                  Match {findNav.idx + 1} of {findNav.rects.length}{replaceScope === 'all' ? ` · page ${findNav.page}` : ''}
                </p>
              )}
              <p className="text-[11px] text-[var(--text-muted)]">Case-insensitive match; retypeset in Helvetica at matched size.</p>
            </div>
          )}
        </div>

        {!focus && (
        <div className="lg:col-span-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-3 space-y-2 max-h-[560px] overflow-y-auto">
          <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Pages</p>
          {thumbUrls.map((u, i) => (
            <button key={i} onClick={() => goPage(i + 1)} aria-label={`Go to page ${i + 1}`} aria-current={page === i + 1} className={`relative block w-full rounded-lg overflow-hidden border-2 ${page === i + 1 ? 'border-[var(--accent)]' : 'border-transparent'}`}>
              {u ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={u} alt={`Page ${i + 1}`} className="w-full" />
              ) : (
                <span className="flex items-center justify-center w-full h-16 bg-[var(--bg-overlay)] text-xs font-mono text-[var(--text-muted)]">…</span>
              )}
              {(annos[i + 1] || []).length > 0 && (
                <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[var(--accent-ink)] text-white">{(annos[i + 1] || []).length}</span>
              )}
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[10px] font-mono rounded bg-black/50 text-white">{i + 1}</span>
            </button>
          ))}
          {thumbUrls.length < pageCount && (
            <button onClick={() => setThumbsAll(true)} className="w-full px-2 py-2 rounded-lg border border-[var(--border-subtle)] text-[11px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)]">
              Show all {pageCount} thumbnails
            </button>
          )}
        </div>
        )}
      </div>

      {/* Status bar (Voidmark-style): live doc stats, always visible. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-muted)]" aria-label="Document status">
        <span className="truncate max-w-[220px]">{file?.name}</span>
        <span>{fileBytes ? (fileBytes.length / 1024 / 1024).toFixed(1) : '0'} MB</span>
        <span>{pageCount} pages</span>
        <span>{Object.values(annos).reduce((n, l) => n + l.length, 0)} annotations</span>
        <span className="ml-auto">{Math.round(scale * 100)}%</span>
      </div>

      {!focus && (
      <>
      <p className="text-xs text-[var(--text-muted)] text-center">
        Free · no signup · no watermark · file never leaves your browser. Cover-up hides content visually only —
        for true removal see <Link href="/pdf/unlock-pdf" className="underline">Unlock PDF</Link> workflows or redact before sharing.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs text-[var(--text-muted)]">Need more?</span>
        {([
          ['Merge PDFs', '/pdf/pdf-merger'],
          ['Split PDF', '/pdf/pdf-splitter'],
          ['Compress', '/pdf/pdf-compressor'],
          ['Watermark', '/pdf/watermark-pdf'],
          ['Page numbers', '/pdf/add-page-numbers-to-pdf'],
          ['Unlock', '/pdf/unlock-pdf'],
          ['OCR document', '/pdf/pdf-ocr'],
          ['Compare PDFs', '/pdf/compare-pdf-files'],
          ['Metadata', '/pdf/pdf-metadata-editor'],
          ['Fill form', '/pdf/pdf-form-filler'],
          ['E-sign', '/pdf/esign-pdf'],
          ['AI summarize', '/pdf/pdf-ai-summariser'],
          ['AI chat with PDF', '/ai/ai-chat-pdf'],
          ['Protect', '/pdf/protect-pdf'],
          ['True redact', '/pdf/redact-pdf'],
          ['PDF to Word', '/pdf/pdf-to-word'],
          ['Extract images', '/pdf/extract-images-from-pdf'],
          ['Page manager', '/pdf/pdf-page-manager'],
        ] as [string, string][]).map(([label, href]) => (
          <Link key={href} href={href} target="_blank" rel="noopener" title="Opens in a new tab — your editing session stays intact" className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] transition-colors">
            {label}
          </Link>
        ))}
      </div>
      </>
      )}
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { setupPdfWorker } from '@/lib/pdfjsWorker';
import { Type, Highlighter, PenLine, Image as ImageIcon, PenTool, Eraser, Undo2, Download, ChevronLeft, ChevronRight, Trash2, Square, StickyNote, RotateCw, CopyPlus, FileMinus2, Sparkles, ScanText, MousePointerClick, TextSelect, Copy, ClipboardPaste, Layers, Maximize2, Minimize2 } from 'lucide-react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { clipboardWrite } from '@/lib/clipboard';
import { inputCls, labelCls } from '../Calculators.shared';
import { useAiProvider } from '@/hooks/useAiProvider';
import { useProStatus } from '@/hooks/useProStatus';
import { useSession } from '@/lib/auth-client';
import { Turnstile } from '@marsidev/react-turnstile';
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
const MAX_FILE_BYTES = 100 * 1024 * 1024;
// Page caps are device-memory honesty, not pricing: rendering + thumbs for
// hundreds of pages will OOM mobile browsers whichever plan pays. Tiers
// reflect likely hardware (Pro skews desktop), capped where physics bites.
const MAX_PAGES_ANON = 150;
const MAX_PAGES_SIGNED = 300;
const MAX_PAGES_PRO = 500;
const THUMB_INITIAL = 60;
const HIGHLIGHT_COLORS = ['#ffff00', '#00ff00', '#00ccff', '#ff99cc', '#ff9900'];
const INK_COLORS = ['#000000', '#1a56db', '#c81e1e', '#047857'];

type Tool = 'text' | 'highlight' | 'draw' | 'whiteout' | 'image' | 'sign' | 'shape' | 'note' | 'retype' | 'select';

interface TextAnno { kind: 'text'; x: number; y: number; text: string; size: number; color: string; bold: boolean }
interface RectAnno { kind: 'highlight' | 'whiteout'; x: number; y: number; w: number; h: number; color: string }
interface DrawAnno { kind: 'draw'; points: number[]; color: string; width: number }
interface ImageAnno { kind: 'image'; x: number; y: number; w: number; h: number; dataUrl: string }
interface ShapeAnno { kind: 'shape'; shape: 'rect' | 'ellipse' | 'line' | 'arrow'; x: number; y: number; w: number; h: number; color: string; width: number }
interface NoteAnno { kind: 'note'; x: number; y: number; text: string; color: string }
type Anno = TextAnno | RectAnno | DrawAnno | ImageAnno | ShapeAnno | NoteAnno;

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return {
    r: parseInt(v.slice(0, 2), 16) / 255,
    g: parseInt(v.slice(2, 4), 16) / 255,
    b: parseInt(v.slice(4, 6), 16) / 255,
  };
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
  const [markColor, setMarkColor] = useState(HIGHLIGHT_COLORS[0]!);
  const [inkColor, setInkColor] = useState(INK_COLORS[0]!);
  const [shapeVariant, setShapeVariant] = useState<'rect' | 'ellipse' | 'line' | 'arrow'>('rect');
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
  // Screen-reader page text: canvas pixels expose nothing to AT. Fed from
  // the cached text layer; empty on scanned pages until OCR runs.
  const [pageText, setPageText] = useState('');
  // Draft text for the selected-text field: commits on Enter/blur, Escape
  // reverts (live-per-keystroke re-rendered the overlay on every press).
  const [textDraft, setTextDraft] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState(false);

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
  const ocrWorkerRef = useRef<{ recognize: (img: string) => Promise<{ data: { words?: { text: string; confidence: number; bbox: { x0: number; y0: number; x1: number; y1: number } }[] } }> } | null>(null);
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
      toast.success(`${doc.numPages}-page PDF loaded — everything stays in your browser.`, { id: toastId });
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
    if (f.size > MAX_FILE_BYTES) {
      toast.error('File exceeds the 100 MB limit — compress or split it first.');
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

  // Render current page + thumbs.
  useEffect(() => {
    if (!pdfDoc) return;
    let cancelled = false;
    (async () => {
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
      await pg.render({ canvasContext: ctx, viewport }).promise;
      if (!cancelled) {
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
    const list = annos[page] || [];
    list.forEach((a, i) => {
      const isSel = selected?.page === page && selected?.index === i;
      if (a.kind === 'text') {
        ctx.font = `${a.bold ? 'bold ' : ''}${px(a.size)}px Helvetica, Arial, sans-serif`;
        ctx.fillStyle = a.color;
        ctx.fillText(a.text || '…', px(a.x), px(a.y));
      } else if (a.kind === 'highlight') {
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = a.color;
        ctx.fillRect(px(a.x), px(a.y), px(a.w), px(a.h));
        ctx.globalAlpha = 1;
      } else if (a.kind === 'whiteout') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px(a.x), px(a.y), px(a.w), px(a.h));
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
        ctx.fillStyle = a.color;
        ctx.fillRect(px(a.x), px(a.y), 22, 22);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px Helvetica, Arial, sans-serif';
        ctx.fillText('!', px(a.x) + 8, px(a.y) + 16);
      }
      if (isSel) {
        ctx.strokeStyle = '#1a56db';
        ctx.setLineDash([4, 3]);
        ctx.lineWidth = 1;
        if (a.kind === 'text') {
          const w = ctx.measureText(a.text || '…').width;
          ctx.strokeRect(px(a.x) - 2, px(a.y) - px(a.size) - 2, w + 4, px(a.size) + 6);
        } else if (a.kind === 'image' || a.kind === 'highlight' || a.kind === 'whiteout' || a.kind === 'shape') {
          ctx.strokeRect(px(a.x) - 2, px(a.y) - 2, px(a.w) + 4, px(a.h) + 4);
        } else if (a.kind === 'note') {
          ctx.strokeRect(px(a.x) - 2, px(a.y) - 2, 26, 26);
        }
        ctx.setLineDash([]);
      }
    });
  }, [annos, page, selected, scale]);

  useEffect(() => { drawOverlay(); }, [drawOverlay]);

  // OCR words belong to the visible page — clear on navigation (done in the
  // setter call sites, not an effect, to avoid cascading renders).
  const goPage = (n: number) => {
    setPage(Math.max(1, Math.min(pageCount, n)));
    setOcrWords([]);
    setSelection([]);
    setTextDraft(null);
  };

  const canvasPos = (e: React.PointerEvent) => {
    const rect = overlayRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const pushAnno = (p: number, a: Anno) => {
    setAnnos((prev) => ({ ...prev, [p]: [...(prev[p] || []), a] }));
    setSelected({ page: p, index: (annos[p] || []).length });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!pdfDoc) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    const pos = canvasPos(e);
    // Capture in PDF points (viewport px ÷ scale) so zoom never moves ink.
    const x = pos.x / scale;
    const y = pos.y / scale;
    if (tool === 'text') {
      pushAnno(page, { kind: 'text', x, y, text: 'New text', size: textSize, color: textColor, bold: textBold });
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
      ctx.lineWidth = 1.7 * scale;
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
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = markColor;
        ctx.fillRect(x, y, w, h);
        ctx.globalAlpha = 1;
      } else if (tool === 'shape') {
        ctx.strokeStyle = inkColor;
        ctx.lineWidth = 1.5 * scale;
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
      pushAnno(page, { kind: 'draw', points: drag.points, color: inkColor, width: 1.7 });
    } else if ((tool === 'highlight' || tool === 'whiteout' || tool === 'shape' || tool === 'select')) {
      const w = Math.abs(pos.x / scale - drag.x);
      const h = Math.abs(pos.y / scale - drag.y);
      if (w > 3 && h > 3) {
        const x = Math.min(drag.x, pos.x / scale);
        const y = Math.min(drag.y, pos.y / scale);
        if (tool === 'highlight') pushAnno(page, { kind: 'highlight', x, y, w, h, color: markColor });
        else if (tool === 'whiteout') pushAnno(page, { kind: 'whiteout', x, y, w, h, color: '#ffffff' });
        else if (tool === 'select') selectInRect(x, y, w, h);
        else pushAnno(page, { kind: 'shape', shape: shapeVariant, x, y, w, h, color: inkColor, width: 1.5 });
      } else drawOverlay();
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
      // drawText doesn't wrap: split into ~75-char lines, stacked downward.
      const words = out.replace(/\s+/g, ' ').split(' ');
      const lines: string[] = [];
      let cur = '';
      for (const w of words) {
        if ((cur + ' ' + w).trim().length > 75) { lines.push(cur.trim()); cur = w; }
        else cur += ' ' + w;
      }
      if (cur.trim()) lines.push(cur.trim());
      const capped = lines.slice(0, 20);
      setAnnos((prev) => {
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
      const words = (data.words || [])
        .filter((w) => w.text.trim().length > 0)
        .map((w) => ({
          text: w.text.trim(),
          x: w.bbox.x0 * kx,
          y: w.bbox.y0 * kx,
          size: Math.max(6, Math.min(48, (w.bbox.y1 - w.bbox.y0) * kx)),
          conf: Math.round(w.confidence),
        }));
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

  const textLayerRef = useRef<Record<number, { x: number; yTop: number; w: number; size: number; bold: boolean; str: string }[]>>({});
  const [selection, setSelection] = useState<string[]>([]);

  // Cached text-layer items in PDF points (shared by retype, select, AI).
  const ensureTextLayer = async (pg: number) => {
    if (!pdfDoc) return [];
    if (!textLayerRef.current[pg]) {
      const pageObj = await pdfDoc.getPage(pg);
      const vp1 = pageObj.getViewport({ scale: 1 });
      const tc = await pageObj.getTextContent();
      const meas = document.createElement('canvas').getContext('2d')!;
      const items: { x: number; yTop: number; w: number; size: number; bold: boolean; str: string }[] = [];
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
          bold: /bold|black|heavy|demi/i.test(it.fontName || ''),
          str: it.str,
        });
      }
      textLayerRef.current[pg] = items;
    }
    return textLayerRef.current[pg] || [];
  };

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
      setAnnos((prev) => ({
        ...prev,
        [page]: [
          ...(prev[page] || []),
          { kind: 'whiteout', x: best.x - 2, y: best.yTop - 2, w: best.w + 4, h: best.size + 5, color: '#ffffff' },
          { kind: 'text', x: best.x, y: best.yTop + best.size * 0.85, text: best.str, size: Math.round(best.size), color: '#000000', bold: best.bold },
        ],
      }));
      toast.success('Text covered — retype it in the left panel. Rendered in Helvetica at matched size.');
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
      let found: string[] = [];
      try {
        const cleaned = out.replace(/```json|```/g, '').trim();
        const parsed: unknown = JSON.parse(cleaned.slice(cleaned.indexOf('[')));
        if (Array.isArray(parsed)) found = parsed.filter((s): s is string => typeof s === 'string').slice(0, 60);
      } catch {
        found = [];
      }
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
      setAnnos((prev) => ({
        ...prev,
        [page]: [
          ...(prev[page] || []),
          ...hits.map((h) => ({ kind: 'whiteout', x: h.x - 2, y: h.yTop - 2, w: h.w + 4, h: h.size + 5, color: '#ffffff' }) as Anno),
        ],
      }));
      toast.success(`${hits.length} spots covered for review — 1 credit used. This hides visually; it does NOT delete text (see FAQ). Verify each box, then export.`);
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
      setAnnos((prev) => {
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
    } catch {
      toast.error('Could not read the text layer — scanned pages need OCR first.');
    } finally {
      setReplacing(false);
    }
  };

  const undo = () => {
    const list = annos[page] || [];
    if (list.length === 0) return;
    setAnnos((prev) => ({ ...prev, [page]: list.slice(0, -1) }));
    setSelected(null);
  };

  // Page structure ops (rotate / duplicate / delete current page). Annotations
  // are cleared because page indices shift — stated in the toast, not hidden.
  const restructure = async (op: 'rotate' | 'duplicate' | 'delete') => {
    if (!fileBytes) return;
    if (op === 'delete' && pageCount <= 1) {
      toast.error('Cannot delete the only page.');
      return;
    }
    try {
      const doc = await PDFDocument.load(fileBytes.slice());
      const idx = page - 1;
      if (op === 'rotate') {
        const pg = doc.getPages()[idx]!;
        pg.setRotation(degrees((pg.getRotation().angle + 90) % 360));
      } else if (op === 'duplicate') {
        const [copy] = await doc.copyPages(doc, [idx]);
        doc.insertPage(idx + 1, copy!);
      } else {
        doc.removePage(idx);
      }
      const bytes = new Uint8Array(await doc.save());
      const fresh = await pdfjsLib.getDocument({ data: bytes.slice() }).promise;
      setFileBytes(bytes);
      setPdfDoc(fresh);
      setPageCount(fresh.numPages);
      setPage(Math.min(page, fresh.numPages));
      setAnnos({});
      setSelected(null);
      setThumbUrls([]);
      setThumbsAll(false);
      loadedRef.current = new Set();
      setOcrWords([]);
      textLayerRef.current = {};
      toast.success(op === 'rotate' ? 'Page rotated.' : op === 'duplicate' ? 'Page duplicated.' : 'Page deleted. Annotations were cleared (page order changed).');
    } catch {
      toast.error('Page operation failed.');
    }
  };

  const deleteSelected = () => {
    if (!selected) return;
    setAnnos((prev) => ({ ...prev, [selected.page]: (prev[selected.page] || []).filter((_, i) => i !== selected.index) }));
    setSelected(null);
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
    setAnnos((prev) => {
      const next = { ...prev };
      for (let p = 1; p <= pageCount; p++) {
        if (p === selected.page) continue;
        next[p] = [...(next[p] || []), JSON.parse(JSON.stringify(a)) as Anno];
      }
      return next;
    });
    toast.success(`Stamped on all ${pageCount} pages.`);
  };

  // Keyboard: arrows nudge, Delete removes, Ctrl+C/V copies. Ignored while
  // typing in the text/note panels.
  const onCanvasKey = (e: React.KeyboardEvent) => {
    const t = e.target as HTMLElement;
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return;
    const step = e.shiftKey ? 10 : 1;
    if (!selected) return;
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteSelected(); }
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') { e.preventDefault(); copySelected(); }
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') { e.preventDefault(); pasteClipboard(); }
    else if (e.key.startsWith('Arrow')) {
      e.preventDefault();
      const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
      const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
      setAnnos((prev) => ({
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
    setShowSignPad(false);
    toast.success('Signature saved — switch to the Sign tool and click to place it.');
    setTool('sign');
  };

  // Emoji stamps: Helvetica can't render color emoji, so rasterize each
  // glyph to a PNG on an offscreen canvas and stamp it as an image —
  // exports identically everywhere, no font dependency.
  const EMOJI_SET = ['✅', '⭐', '❤️', '➡️', '⚠️', '✔️', '❌', '💡', '📌', '🎉', '👍', '🔥'];
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

  const exportPdf = async () => {
    if (!fileBytes) return;
    const total = Object.values(annos).reduce((n, l) => n + l.length, 0);
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
      const libPages = pdfDocLib.getPages();
      for (const [pageNum, list] of Object.entries(annos)) {
        const lp = libPages[Number(pageNum) - 1];
        if (!lp) continue;
        const pageH = lp.getHeight();
        // Stored coords are already PDF points — no conversion needed.
        for (const a of list) {
          if (a.kind === 'text') {
            const c = hexToRgb(a.color);
            lp.drawText(a.text, {
              x: a.x,
              y: pageH - a.y,
              size: a.size,
              font: a.bold ? helvBold : helv,
              color: rgb(c.r, c.g, c.b),
            });
          } else if (a.kind === 'highlight') {
            const c = hexToRgb(a.color);
            lp.drawRectangle({
              x: a.x, y: pageH - (a.y + a.h),
              width: a.w, height: a.h,
              color: rgb(c.r, c.g, c.b), opacity: 0.4,
            });
          } else if (a.kind === 'whiteout') {
            lp.drawRectangle({
              x: a.x, y: pageH - (a.y + a.h),
              width: a.w, height: a.h,
              color: rgb(1, 1, 1),
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
      downloadOrShare(URL.createObjectURL(new Blob([out as unknown as BlobPart], { type: 'application/pdf' })), `edited-${file?.name || 'document.pdf'}`);
      toast.success(`Exported with ${total} annotation${total === 1 ? '' : 's'} — additions only, original content untouched.`);
    } catch {
      toast.error('Export failed — try fewer annotations or a smaller file.');
    } finally {
      setExporting(false);
    }
  };

  const selAnno = selected ? annos[selected.page]?.[selected.index] : undefined;

  const tools: { id: Tool; label: string; icon: React.ReactNode }[] = [
    { id: 'text', label: 'Text', icon: <Type className="w-4 h-4" /> },
    { id: 'select', label: 'Select', icon: <TextSelect className="w-4 h-4" /> },
    { id: 'retype', label: 'Retype', icon: <MousePointerClick className="w-4 h-4" /> },
    { id: 'highlight', label: 'Highlight', icon: <Highlighter className="w-4 h-4" /> },
    { id: 'draw', label: 'Draw', icon: <PenLine className="w-4 h-4" /> },
    { id: 'shape', label: 'Shapes', icon: <Square className="w-4 h-4" /> },
    { id: 'note', label: 'Note', icon: <StickyNote className="w-4 h-4" /> },
    { id: 'whiteout', label: 'Cover up', icon: <Eraser className="w-4 h-4" /> },
    { id: 'image', label: 'Image', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'sign', label: 'Sign', icon: <PenTool className="w-4 h-4" /> },
  ];

  if (!pdfDoc) {
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">PDF Editor — add text, highlights, drawings & signatures</h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            Free, no signup, no watermark. Everything runs in your browser — your file is never uploaded.
            Edits are additions on top of the original; existing text can&apos;t be retyped.
          </p>
          <FileUploader accept=".pdf,application/pdf" freeMaxSizeMB={30} maxSizeMB={100} onFileSelect={loadFile} title="Open a PDF to edit" subtitle="Up to 30 MB free · 100 MB signed in · 150–500 pages by plan" />
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
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={toggleFocus} aria-pressed={focus} aria-label={focus ? 'Exit focus mode' : 'Enter focus mode (editor only)'} title={focus ? 'Exit focus mode' : 'Focus mode — editor only'} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)]">
              {focus ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />} {focus ? 'Exit focus' : 'Focus'}
            </button>
            <button onClick={exportPdf} disabled={exporting} aria-label="Download edited PDF" title="Download the edited PDF" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent-ink)] text-white text-xs font-bold hover:opacity-90 disabled:opacity-50">
              <Download className="w-4 h-4" /> {exporting ? 'Exporting…' : 'Download PDF'}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2.5 border-t border-[var(--border-subtle)] max-sm:flex-nowrap max-sm:overflow-x-auto">
          <div className="flex items-center gap-1.5" role="group" aria-label="AI actions">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">AI</span>
            <button onClick={() => runAiAction('summarize')} disabled={aiWorking} aria-label="Summarize this page with AI, 1 credit" title={isSignedIn ? 'Summarize page · 1 credit' : 'Sign in to use AI actions'} className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)] disabled:opacity-50">
              <Sparkles className="w-4 h-4" /> {aiWorking ? '…' : 'Summarize'}
            </button>
            <button onClick={() => runAiAction('grammar')} disabled={aiWorking} aria-label="Fix grammar with AI, 1 credit" title={isSignedIn ? 'Fix grammar · 1 credit' : 'Sign in to use AI actions'} className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)] disabled:opacity-50">
              <Sparkles className="w-4 h-4" /> {aiWorking ? '…' : 'Fix grammar'}
            </button>
            <button onClick={() => runAiAction('translate')} disabled={aiWorking} aria-label="Translate to English with AI, 1 credit" title={isSignedIn ? 'Translate to English · 1 credit' : 'Sign in to use AI actions'} className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)] disabled:opacity-50">
              <Sparkles className="w-4 h-4" /> {aiWorking ? '…' : 'Translate'}
            </button>
            <button onClick={findSensitive} disabled={aiWorking} aria-label="Suggest sensitive-data cover boxes with AI, Pro, 1 credit" title={isPro ? 'Find sensitive data · 1 credit' : 'Pro feature — upgrade to unlock'} className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)] disabled:opacity-50">
              {!isPro && <span aria-hidden="true">👑</span>} {aiWorking ? '…' : 'Find sensitive'}
            </button>
            {selection.length > 0 && (
              <button onClick={() => { setSelection([]); drawOverlay(); toast.success('Selection cleared — AI uses the whole page.'); }} aria-label="Clear text selection" title="Clear selection" className="px-2.5 py-2 rounded-lg border border-[var(--accent)]/40 text-xs font-bold text-[var(--accent)] hover:bg-[var(--accent)]/10">
                {selection.length} selected ✕
              </button>
            )}
            <button onClick={runOcr} disabled={ocrRunning} aria-label="OCR this page" title="Recognize text on scanned pages" className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)] disabled:opacity-50">
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
          </div>
          <div className="flex items-center gap-1.5" role="group" aria-label="Edit actions">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Edit</span>
            <button onClick={undo} aria-label="Undo last annotation" title="Undo last annotation" className="p-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)]">
              <Undo2 className="w-4 h-4" />
            </button>
            <button onClick={deleteSelected} disabled={!selected} aria-label="Delete selected annotation" title="Delete selected (Del)" className="p-2 rounded-lg border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-overlay)]">
              <Trash2 className="w-4 h-4" />
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
          <p className="text-sm font-bold text-[var(--text-primary)]">Draw your signature, then click on the page to place it.</p>
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

      {/* Focus keeps all three columns (toolbar is never hidden) and drops
          only the footer strips; true fullscreen comes from the browser API. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-3 space-y-1.5 max-h-[720px] overflow-y-auto">
          {tools.map((t) => (
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
          <input ref={imagePickRef} type="file" accept="image/png,image/jpeg" className="hidden" aria-label="Pick stamp image" onChange={(e) => onPickImage(e.target.files?.[0] || null)} />
          <div className="pt-1">
            <span className={labelCls}>Emoji stamps</span>
            <div className="grid grid-cols-6 gap-1">
              {EMOJI_SET.map((e) => (
                <button key={e} onClick={() => stampEmoji(e)} aria-label={`Stamp ${e}`} title="Stamp this emoji" className="text-lg leading-none p-1 rounded-lg hover:bg-[var(--bg-overlay)] transition-colors">
                  {e}
                </button>
              ))}
            </div>
            <Link href="/utility/emoji-picker" className="text-[11px] text-[var(--accent)] hover:underline">More emoji →</Link>
          </div>
          <div className="pt-2 space-y-2">
            {(tool === 'text') && (
              <>
                <span className={labelCls}>Text color</span>
                <div className="flex gap-1.5 flex-wrap">
                  {INK_COLORS.map((c) => (
                    <button key={c} onClick={() => setTextColor(c)} aria-label={`Text color ${c}`} className={`w-6 h-6 rounded-full border-2 ${textColor === c ? 'border-[var(--accent)]' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
                <label className={labelCls} htmlFor="pdfed-text-size">Size</label>
                <input id="pdfed-text-size" type="range" min={8} max={48} value={textSize} onChange={(e) => setTextSize(Number(e.target.value))} className="w-full" aria-label="Text size" />
                <button onClick={() => setTextBold((b) => !b)} aria-pressed={textBold} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${textBold ? 'bg-[var(--accent-ink)] text-white' : 'border-[var(--border-subtle)]'}`}>Bold</button>
              </>
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
                <p className="text-xs text-[var(--text-muted)]">Drag a line for underline / strikethrough.</p>
              </>
            )}
            {(tool === 'note') && (
              <p className="text-xs text-[var(--text-muted)]">Click the page to drop a sticky note, then edit its text below.</p>
            )}
            {(tool === 'whiteout') && (
              <p className="text-xs text-[var(--text-muted)]">Covers an area with white. Hides visually — does not delete the underlying text.</p>
            )}
          </div>
          {selAnno?.kind === 'text' && selected && (
            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
              <span className={labelCls}>Edit selected text</span>
              <input
                value={textDraft ?? selAnno.text}
                onChange={(e) => setTextDraft(e.target.value)}
                onBlur={() => {
                  if (textDraft !== null) {
                    const v = textDraft;
                    setAnnos((prev) => ({
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
          {selAnno?.kind === 'note' && selected && (            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
              <span className={labelCls}>Edit note</span>
              <textarea
                value={selAnno.text}
                onChange={(e) => {
                  const v = e.target.value.slice(0, 240);
                  setAnnos((prev) => ({
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
          <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
            <span className={labelCls}>Find & replace</span>
            <input
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              placeholder="Find text"
              className={inputCls}
              aria-label="Text to find"
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
            <p className="text-[11px] text-[var(--text-muted)]">Case-insensitive match; retypeset in Helvetica at matched size.</p>
          </div>
        </div>

        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-4 overflow-auto">
          <div className="relative mx-auto w-fit" tabIndex={0} role="application" onKeyDown={onCanvasKey} aria-label="PDF page canvas. Arrow keys nudge the selection, Delete removes it, Control C and V copy and paste.">
            <span className="sr-only" aria-live="polite">Page {page} of {pageCount}. Text content: {pageText || 'No readable text on this page.'}</span>
            <canvas ref={canvasRef} className="rounded-lg shadow" />
            <canvas
              ref={overlayRef}
              className="absolute inset-0 rounded-lg touch-none"
              style={{ cursor: tool === 'text' ? 'text' : 'crosshair' }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            />
          </div>
          <p className="mt-3 text-xs text-[var(--text-muted)] text-center">
            {tool === 'text' && 'Click anywhere to place text, then edit it in the left panel.'}
            {tool === 'retype' && 'Click existing text to cover it and retype in matched-size Helvetica.'}
            {tool === 'highlight' && 'Drag over an area to highlight it.'}
            {tool === 'draw' && 'Drag to draw freehand.'}
            {tool === 'shape' && 'Drag to draw a rectangle, ellipse, line, or arrow.'}
            {tool === 'note' && 'Click to drop a sticky note.'}
            {tool === 'whiteout' && 'Drag over an area to cover it with white (visual cover only).'}
            {tool === 'image' && 'Pick an image, then click to stamp it.'}
            {tool === 'sign' && 'Draw a signature above, then click to place it.'}
          </p>
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
        <span>{file?.name}</span>
        <span>{(fileBytes ? (fileBytes.length / 1024 / 1024).toFixed(1) : '0')} MB</span>
        <span>{pageCount} pages</span>
        <span>{Object.values(annos).reduce((n, l) => n + l.length, 0)} annotations</span>
        <span className="ml-auto">{Math.round(scale * 100)}%</span>
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
          ['Protect', '/pdf/protect-pdf'],
          ['True redact', '/pdf/redact-pdf'],
          ['PDF to Word', '/pdf/pdf-to-word'],
          ['Extract images', '/pdf/extract-images-from-pdf'],
          ['Page manager', '/pdf/pdf-page-manager'],
          ['OCR document', '/pdf/pdf-ocr'],
          ['Compare PDFs', '/pdf/compare-pdf-files'],
          ['Metadata', '/pdf/pdf-metadata-editor'],
          ['Fill form', '/pdf/pdf-form-filler'],
          ['E-sign', '/pdf/esign-pdf'],
          ['AI summarize', '/pdf/pdf-ai-summariser'],
        ] as [string, string][]).map(([label, href]) => (
          <Link key={href} href={href} className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] transition-colors">
            {label}
          </Link>
        ))}
      </div>
      </>
      )}
    </div>
  );
}

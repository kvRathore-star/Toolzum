"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { Type, Highlighter, PenLine, Image as ImageIcon, PenTool, Eraser, Undo2, Download, ChevronLeft, ChevronRight, Trash2, Square, StickyNote, RotateCw, CopyPlus, FileMinus2, Sparkles, ScanText, MousePointerClick } from 'lucide-react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { inputCls, labelCls } from '../../Calculators.shared';
import { useAiProvider } from '@/hooks/useAiProvider';
import { useSession } from '@/lib/auth-client';
import Link from 'next/link';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const RENDER_SCALE = 1.5;
const MAX_FILE_BYTES = 100 * 1024 * 1024;
const HIGHLIGHT_COLORS = ['#ffff00', '#00ff00', '#00ccff', '#ff99cc', '#ff9900'];
const INK_COLORS = ['#000000', '#1a56db', '#c81e1e', '#047857'];

type Tool = 'text' | 'highlight' | 'draw' | 'whiteout' | 'image' | 'sign' | 'shape' | 'note' | 'retype';

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
  const [thumbUrls, setThumbUrls] = useState<string[]>([]);
  const [aiWorking, setAiWorking] = useState(false);
  const [ocrWords, setOcrWords] = useState<{ text: string; x: number; y: number; size: number; conf: number }[]>([]);
  const [ocrRunning, setOcrRunning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
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

  const loadFile = async (f: File) => {
    if (f.size > MAX_FILE_BYTES) {
      toast.error('File exceeds the 100 MB limit — compress or split it first.');
      return;
    }
    try {
      const bytes = new Uint8Array(await f.arrayBuffer());
      const doc = await pdfjsLib.getDocument({ data: bytes.slice() }).promise;
      setFile(f);
      setFileBytes(bytes);
      setPdfDoc(doc);
      setPageCount(doc.numPages);
      setPage(1);
      setAnnos({});
      setSelected(null);
      toast.success(`${doc.numPages}-page PDF loaded — everything stays in your browser.`);
    } catch {
      toast.error('Could not open this PDF — it may be encrypted or corrupted.');
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
      if (!cancelled) drawOverlay();
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfDoc, page, scale]);

  // Thumbnails once per document.
  useEffect(() => {
    if (!pdfDoc) return;
    let cancelled = false;
    (async () => {
      const urls: string[] = [];
      for (let n = 1; n <= pdfDoc.numPages; n++) {
        if (cancelled) break;
        const pg = await pdfDoc.getPage(n);
        const vp = pg.getViewport({ scale: 0.22 });
        const c = document.createElement('canvas');
        c.width = Math.floor(vp.width);
        c.height = Math.floor(vp.height);
        await pg.render({ canvasContext: c.getContext('2d')!, viewport: vp }).promise;
        urls.push(c.toDataURL('image/jpeg', 0.6));
      }
      if (!cancelled) setThumbUrls(urls);
    })();
    return () => { cancelled = true; };
  }, [pdfDoc]);

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
    } else if ((tool === 'highlight' || tool === 'whiteout' || tool === 'shape')) {
      const w = Math.abs(pos.x / scale - drag.x);
      const h = Math.abs(pos.y / scale - drag.y);
      if (w > 3 && h > 3) {
        const x = Math.min(drag.x, pos.x / scale);
        const y = Math.min(drag.y, pos.y / scale);
        if (tool === 'highlight') pushAnno(page, { kind: 'highlight', x, y, w, h, color: markColor });
        else if (tool === 'whiteout') pushAnno(page, { kind: 'whiteout', x, y, w, h, color: '#ffffff' });
        else pushAnno(page, { kind: 'shape', shape: shapeVariant, x, y, w, h, color: inkColor, width: 1.5 });
      } else drawOverlay();
    }
  };

  // In-editor AI (Tier 1 differentiator): extract the page's text layer and
  // run a completion, then insert the result as stacked text annotations.
  // 1 credit via /api/ai/generate — signed-in only, never auto-retried.
  const runAiAction = async (action: 'summarize' | 'grammar') => {
    if (!pdfDoc) return;
    if (!isSignedIn) {
      toast.error('AI actions cost 1 credit — sign in to use them.');
      return;
    }
    setAiWorking(true);
    try {
      const pg = await pdfDoc.getPage(page);
      const tc = await pg.getTextContent();
      const raw = tc.items.map((it) => ('str' in it ? String(it.str) : '')).join(' ').replace(/\s+/g, ' ').trim();
      if (raw.length < 20) {
        toast.error('No readable text on this page — scanned pages need OCR first.');
        return;
      }
      const clipped = raw.slice(0, 6000);
      const prompt = action === 'summarize'
        ? `Summarize this PDF page text in 3-5 short bullet lines, plain text, no markdown:\n\n${clipped}`
        : `Fix the grammar and spelling of this PDF page text. Return only the corrected text, no commentary:\n\n${clipped}`;
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
      if (!ocrWorkerRef.current) {
        toast.loading('Loading OCR engine (one-time download)…', { id: 'pdfedit-ocr' });
        const worker = await createWorker(undefined, undefined, {
          logger: (m: { status: string; progress: number }) => {
            if (m.status === 'recognizing text') setOcrProgress(Math.round(m.progress * 100));
          },
        });
        await worker.reinitialize('eng');
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
    pushAnno(page, { kind: 'text', x: w.x, y: w.y, text: w.text, size: w.size, color: '#000000', bold: false });
  };

  const insertAllOcr = () => {
    ocrWords.slice(0, 300).forEach((w) => insertOcrWord(w));
    toast.success(`${Math.min(ocrWords.length, 300)} words inserted as editable text.`);
  };

  const textLayerRef = useRef<Record<number, { x: number; yTop: number; w: number; size: number; bold: boolean; str: string }[]>>({});

  // Click-to-retype: find the nearest text-layer item, cover it with white,
  // and drop an editable Helvetica box at the same size/position. Honest
  // label: retypeset, NOT same-font — the original font is matched for size
  // and placement only (see FAQ).
  const retypeAt = async (x: number, y: number) => {
    if (!pdfDoc) return;
    try {
      if (!textLayerRef.current[page]) {
        const pg = await pdfDoc.getPage(page);
        const vp1 = pg.getViewport({ scale: 1 });
        const tc = await pg.getTextContent();
        const items: { x: number; yTop: number; w: number; size: number; bold: boolean; str: string }[] = [];
        const meas = document.createElement('canvas').getContext('2d')!;
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
        textLayerRef.current[page] = items;
      }
      const items = textLayerRef.current[page] || [];
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
        pg.setRotation(((pg.getRotation().angle + 90) % 360) as 0 | 90 | 180 | 270);
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

  const signPadDataRef = useRef<string | null>(null);

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
          } else if (a.kind === 'note') {
            lp.drawRectangle({ x: a.x, y: pageH - (a.y + 44), width: 180, height: 44, color: rgb(1, 0.95, 0.64), borderColor: rgb(0.85, 0.75, 0.2), borderWidth: 0.75 });
            lp.drawText(a.text.slice(0, 120), { x: a.x + 5, y: pageH - (a.y + 26), size: 9, font: helv, color: rgb(0, 0, 0), maxWidth: 170, lineHeight: 11 });
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
          <FileUploader accept=".pdf,application/pdf" onFileSelect={loadFile} title="Open a PDF to edit" subtitle="Up to 100 MB · encrypted PDFs need unlocking first" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl px-4 py-3">
        <span className="text-sm font-bold text-[var(--text-primary)] truncate max-w-[220px]" title={file?.name}>{file?.name}</span>
        <span className="text-xs text-[var(--text-muted)]">Page {page}/{pageCount}</span>
        <div className="flex items-center gap-1 ml-2">
          <button onClick={() => goPage(page - 1)} disabled={page <= 1} aria-label="Previous page" className="p-2 rounded-lg border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-overlay)]">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => goPage(page + 1)} disabled={page >= pageCount} aria-label="Next page" className="p-2 rounded-lg border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-overlay)]">
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
              className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border ${scale === z ? 'bg-[var(--accent-ink)] text-white border-transparent' : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)]'}`}
            >
              {Math.round(z * 100)}%
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => runAiAction('summarize')} disabled={aiWorking} aria-label="Summarize this page with AI, 1 credit" title={isSignedIn ? 'Summarize page · 1 credit' : 'Sign in to use AI actions'} className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)] disabled:opacity-50">
            <Sparkles className="w-4 h-4" /> {aiWorking ? '…' : 'Summarize'}
          </button>
          <button onClick={() => runAiAction('grammar')} disabled={aiWorking} aria-label="Fix grammar with AI, 1 credit" title={isSignedIn ? 'Fix grammar · 1 credit' : 'Sign in to use AI actions'} className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)] disabled:opacity-50">
            <Sparkles className="w-4 h-4" /> {aiWorking ? '…' : 'Fix grammar'}
          </button>
          <button onClick={runOcr} disabled={ocrRunning} aria-label="OCR this page" title="Recognize text on scanned pages (English)" className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)] disabled:opacity-50">
            <ScanText className="w-4 h-4" /> {ocrRunning ? `${ocrProgress}%` : 'OCR'}
          </button>
          <button onClick={() => restructure('rotate')} aria-label="Rotate current page" title="Rotate page 90°" className="p-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)]">
            <RotateCw className="w-4 h-4" />
          </button>
          <button onClick={() => restructure('duplicate')} aria-label="Duplicate current page" title="Duplicate page" className="p-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)]">
            <CopyPlus className="w-4 h-4" />
          </button>
          <button onClick={() => restructure('delete')} aria-label="Delete current page" title="Delete page" className="p-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)]">
            <FileMinus2 className="w-4 h-4" />
          </button>
          <button onClick={undo} aria-label="Undo last annotation" title="Undo" className="p-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)]">
            <Undo2 className="w-4 h-4" />
          </button>
          <button onClick={deleteSelected} disabled={!selected} aria-label="Delete selected annotation" title="Delete selected" className="p-2 rounded-lg border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-overlay)]">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={exportPdf} disabled={exporting} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent-ink)] text-white text-xs font-bold hover:opacity-90 disabled:opacity-50">
            <Download className="w-4 h-4" /> {exporting ? 'Exporting…' : 'Download PDF'}
          </button>
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
        </div>
      )}

      {ocrWords.length > 0 && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-[var(--text-primary)]">Recognized words (page {page}) — click to insert as editable text</p>
            <button onClick={insertAllOcr} className="ml-auto px-3 py-1.5 rounded-lg bg-[var(--accent-ink)] text-white text-xs font-bold">Insert all</button>
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
          <p className="text-xs text-[var(--text-muted)]">Amber words are low-confidence — verify before exporting. OCR is English-only in this version.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-3 space-y-1.5">
          {tools.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTool(t.id); if (t.id === 'sign' && !signPadDataRef.current) setShowSignPad(true); if (t.id === 'image' && !pendingImageRef.current) imagePickRef.current?.click(); }}
              aria-pressed={tool === t.id}
              aria-label={`${t.label} tool`}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${tool === t.id ? 'bg-[var(--accent-ink)] text-white shadow' : 'bg-[var(--bg-overlay)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
          <input ref={imagePickRef} type="file" accept="image/png,image/jpeg" className="hidden" aria-label="Pick stamp image" onChange={(e) => onPickImage(e.target.files?.[0] || null)} />
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
                value={selAnno.text}
                onChange={(e) => {
                  const v = e.target.value;
                  setAnnos((prev) => ({
                    ...prev,
                    [selected.page]: (prev[selected.page] || []).map((a, i) => (i === selected.index && a.kind === 'text' ? { ...a, text: v } : a)),
                  }));
                }}
                className={inputCls}
                aria-label="Selected annotation text"
              />
            </div>
          )}
          {selAnno?.kind === 'note' && selected && (
            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
              <span className={labelCls}>Edit note</span>
              <textarea
                value={selAnno.text}
                onChange={(e) => {
                  const v = e.target.value;
                  setAnnos((prev) => ({
                    ...prev,
                    [selected.page]: (prev[selected.page] || []).map((a, i) => (i === selected.index && a.kind === 'note' ? { ...a, text: v } : a)),
                  }));
                }}
                className={inputCls}
                rows={3}
                aria-label="Selected note text"
              />
            </div>
          )}
        </div>

        <div className="lg:col-span-8 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-4 overflow-auto">
          <div className="relative mx-auto w-fit">
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

        <div className="lg:col-span-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-3 space-y-2 max-h-[560px] overflow-y-auto">
          <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Pages</p>
          {thumbUrls.map((u, i) => (
            <button key={i} onClick={() => goPage(i + 1)} aria-label={`Go to page ${i + 1}`} aria-current={page === i + 1} className={`relative block w-full rounded-lg overflow-hidden border-2 ${page === i + 1 ? 'border-[var(--accent)]' : 'border-transparent'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt={`Page ${i + 1}`} className="w-full" />
              {(annos[i + 1] || []).length > 0 && (
                <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[var(--accent-ink)] text-white">{(annos[i + 1] || []).length}</span>
              )}
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[10px] font-mono rounded bg-black/50 text-white">{i + 1}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-[var(--text-muted)] text-center">
        Free · no signup · no watermark · file never leaves your browser. Cover-up hides content visually only —
        for true removal see <Link href="/pdf/unlock-pdf" className="underline">Unlock PDF</Link> workflows or redact before sharing.
      </p>
    </div>
  );
}

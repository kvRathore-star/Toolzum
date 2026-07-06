"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Download, MousePointer, ArrowUp, Square, Circle, Type, Eraser, Redo, Undo, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

type Tool = 'arrow' | 'rect' | 'circle' | 'text' | 'blur' | 'highlight';

interface Annotation {
  type: Tool;
  x: number; y: number;
  w?: number; h?: number;
  color: string;
  text?: string;
  width: number;
}

export default function ScreenshotAnnotator() {
  const [image, setImage] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ w: 0, h: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTool, setActiveTool] = useState<Tool>('arrow');
  const [color, setColor] = useState('#ef4444');
  const [lineWidth, setLineWidth] = useState(3);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [redoStack, setRedoStack] = useState<Annotation[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [showOriginal, setShowOriginal] = useState(false);

  useEffect(() => { redraw(); }, [annotations, image, showOriginal]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = overlayRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const maxDim = 1400;
      let w = img.naturalWidth, h = img.naturalHeight;
      if (w > maxDim || h > maxDim) {
        const ratio = Math.min(maxDim / w, maxDim / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      setImageSize({ w, h });
      setImage(img.src);
      setAnnotations([]);
      setRedoStack([]);

      const base = canvasRef.current;
      const overlay = overlayRef.current;
      if (base && overlay) {
        base.width = overlay.width = w;
        base.height = overlay.height = h;
        const ctx = base.getContext('2d');
        ctx?.drawImage(img, 0, 0, w, h);
      }
    };
    img.src = URL.createObjectURL(file);
  };

  const redraw = () => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    if (showOriginal) return;

    for (const ann of annotations) {
      ctx.strokeStyle = ann.color;
      ctx.fillStyle = ann.color;
      ctx.lineWidth = ann.width;
      ctx.font = `${Math.max(14, ann.width * 5)}px sans-serif`;

      switch (ann.type) {
        case 'arrow': {
          const angle = Math.atan2((ann.h || 0) - ann.y, (ann.w || 0) - ann.x);
          const headLen = 12 + ann.width * 2;
          ctx.beginPath();
          ctx.moveTo(ann.x, ann.y);
          ctx.lineTo(ann.w || 0, ann.h || 0);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(ann.w || 0, ann.h || 0);
          ctx.lineTo((ann.w || 0) - headLen * Math.cos(angle - Math.PI / 6), (ann.h || 0) - headLen * Math.sin(angle - Math.PI / 6));
          ctx.lineTo((ann.w || 0) - headLen * Math.cos(angle + Math.PI / 6), (ann.h || 0) - headLen * Math.sin(angle + Math.PI / 6));
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'rect':
          ctx.strokeRect(ann.x, ann.y, ann.w || 0, ann.h || 0);
          ctx.globalAlpha = 0.15;
          ctx.fillRect(ann.x, ann.y, ann.w || 0, ann.h || 0);
          ctx.globalAlpha = 1;
          break;
        case 'circle': {
          const rx = (ann.w || 0) / 2, ry = (ann.h || 0) / 2;
          ctx.beginPath();
          ctx.ellipse(ann.x + rx, ann.y + ry, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 0.15;
          ctx.fill();
          ctx.globalAlpha = 1;
          break;
        }
        case 'text':
          ctx.fillText(ann.text || 'Text', ann.x, ann.y);
          break;
        case 'blur':
          ctx.fillStyle = '#000';
          ctx.globalAlpha = 1;
          ctx.fillRect(ann.x, ann.y, ann.w || 0, ann.h || 0);
          ctx.globalAlpha = 1;
          break;
        case 'highlight':
          ctx.fillStyle = '#ffeb3b';
          ctx.globalAlpha = 0.4;
          ctx.fillRect(ann.x, ann.y, ann.w || 0, 20 + ann.width * 2);
          ctx.globalAlpha = 1;
          break;
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'text') {
      const pos = getCanvasCoords(e);
      const text = prompt('Enter text:');
      if (!text) return;
      const newAnn: Annotation = { type: 'text', x: pos.x, y: pos.y, color, width: lineWidth, text };
      setAnnotations(prev => [...prev, newAnn]);
      setRedoStack([]);
      return;
    }
    setIsDrawing(true);
    const pos = getCanvasCoords(e);
    setStartPos(pos);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pos = getCanvasCoords(e);
    const overlay = overlayRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, overlay.width, overlay.height);
    for (const ann of annotations) {
      ctx.strokeStyle = ann.color;
      ctx.fillStyle = ann.color;
      ctx.lineWidth = ann.width;
      ctx.font = `${Math.max(14, ann.width * 5)}px sans-serif`;
      ctx.beginPath();
      switch (ann.type) {
        case 'arrow': ctx.moveTo(ann.x, ann.y); ctx.lineTo(ann.w || 0, ann.h || 0); ctx.stroke(); break;
        case 'rect': ctx.strokeRect(ann.x, ann.y, ann.w || 0, ann.h || 0); break;
        case 'circle': ctx.ellipse(ann.x + (ann.w || 0) / 2, ann.y + (ann.h || 0) / 2, Math.abs((ann.w || 0) / 2), Math.abs((ann.h || 0) / 2), 0, 0, Math.PI * 2); ctx.stroke(); break;
        case 'text': ctx.fillText(ann.text || '', ann.x, ann.y); break;
        case 'blur': ctx.fillStyle = '#000'; ctx.fillRect(ann.x, ann.y, ann.w || 0, ann.h || 0); break;
        case 'highlight': ctx.fillStyle = '#ffeb3b'; ctx.globalAlpha = 0.4; ctx.fillRect(ann.x, ann.y, ann.w || 0, 20 + ann.width * 2); ctx.globalAlpha = 1; break;
      }
    }

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth;
    const x = Math.min(startPos.x, pos.x), y = Math.min(startPos.y, pos.y);
    const w = Math.abs(pos.x - startPos.x), h = Math.abs(pos.y - startPos.y);

    if (activeTool === 'arrow') {
      ctx.beginPath(); ctx.moveTo(startPos.x, startPos.y); ctx.lineTo(pos.x, pos.y); ctx.stroke();
    } else if (activeTool === 'rect') {
      ctx.strokeRect(x, y, w, h);
    } else if (activeTool === 'circle') {
      ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); ctx.stroke();
    } else if (activeTool === 'blur') {
      ctx.fillStyle = '#000'; ctx.fillRect(x, y, w, h);
    } else if (activeTool === 'highlight') {
      ctx.fillStyle = '#ffeb3b'; ctx.globalAlpha = 0.4; ctx.fillRect(x, y, w, 20 + lineWidth * 2); ctx.globalAlpha = 1;
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const pos = getCanvasCoords(e);
    const x = Math.min(startPos.x, pos.x), y = Math.min(startPos.y, pos.y);
    const w = Math.abs(pos.x - startPos.x), h = Math.abs(pos.y - startPos.y);
    if (w < 3 && h < 3) return;
    const newAnn: Annotation = { type: activeTool, x, y, w, h, color, width: lineWidth };
    setAnnotations(prev => [...prev, newAnn]);
    setRedoStack([]);
  };

  const undo = () => {
    if (!annotations.length) return;
    const last = annotations[annotations.length - 1];
    setAnnotations(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, last]);
  };

  const redo = () => {
    if (!redoStack.length) return;
    const last = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setAnnotations(prev => [...prev, last]);
  };

  const handleExport = () => {
    const base = canvasRef.current;
    const overlay = overlayRef.current;
    if (!base || !overlay) return;
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = base.width;
    exportCanvas.height = base.height;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(base, 0, 0);
    ctx.drawImage(overlay, 0, 0);
    exportCanvas.toBlob(blob => {
      if (!blob) return toast.error('Export failed');
      const url = URL.createObjectURL(blob);
      downloadOrShare(url, `annotated_${Date.now()}.png`);
      toast.success('Image saved!');
    }, 'image/png');
  };

  const tools: { key: Tool; icon: React.ReactNode; label: string }[] = [
    { key: 'arrow', icon: <ArrowUp className="w-4 h-4" />, label: 'Arrow' },
    { key: 'rect', icon: <Square className="w-4 h-4" />, label: 'Box' },
    { key: 'circle', icon: <Circle className="w-4 h-4" />, label: 'Circle' },
    { key: 'text', icon: <Type className="w-4 h-4" />, label: 'Text' },
    { key: 'blur', icon: <Eraser className="w-4 h-4" />, label: 'Blur' },
    { key: 'highlight', icon: <MousePointer className="w-4 h-4" />, label: 'Highlight' },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <MousePointer className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Screenshot Annotator & Redactor</h3>
      </div>

      {!image ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-12 shadow-xl text-center">
          <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 max-w-md mx-auto cursor-pointer hover:border-orange-500/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-12 h-12 mx-auto mb-3 text-zinc-400" />
            <p className="text-base font-semibold text-zinc-600 dark:text-zinc-400">Upload a screenshot or image</p>
            <p className="text-xs text-zinc-500 mt-1">JPG, PNG, WebP — up to 1400px</p>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black/20">
            <div className="flex items-center gap-1">
              {tools.map(t => (
                <button key={t.key} onClick={() => setActiveTool(t.key)}
                  className={`p-2 rounded-lg transition-colors ${activeTool === t.key ? 'bg-orange-500 text-white' : 'text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
                  title={t.label}>{t.icon}</button>
              ))}
              <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-2" />
              <input type="color" value={color} onChange={e => setColor(e.target.value)}
                className="w-7 h-7 rounded cursor-pointer border-0 p-0.5" />
              <input type="range" min="1" max="8" value={lineWidth} onChange={e => setLineWidth(Number(e.target.value))}
                className="w-16 accent-orange-500 ml-1" title="Line width" />
              <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-2" />
              <button onClick={undo} disabled={!annotations.length} className="p-2 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg disabled:opacity-30" title="Undo"><Undo className="w-4 h-4" /></button>
              <button onClick={redo} disabled={!redoStack.length} className="p-2 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg disabled:opacity-30" title="Redo"><Redo className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowOriginal(!showOriginal)}
                className={`p-2 rounded-lg transition-colors ${showOriginal ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-white' : 'text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
                title={showOriginal ? 'Show annotations' : 'Show original'}>
                {showOriginal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg text-xs transition-colors">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
          </div>

          <div className="relative bg-zinc-100 dark:bg-black/40 flex items-center justify-center p-4"
            style={{ minHeight: '400px' }}>
            <canvas ref={canvasRef} className="absolute max-w-full max-h-[70vh] object-contain" style={{ display: showOriginal ? 'block' : 'none' }} />
            <canvas ref={overlayRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => setIsDrawing(false)}
              className="max-w-full max-h-[70vh] cursor-crosshair shadow-sm rounded-lg"
              style={{ display: showOriginal ? 'none' : 'block' }} />
          </div>
        </div>
      )}

      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/30 rounded-xl p-3">
        <p className="text-[10px] text-orange-600 dark:text-orange-400">
          <strong>Pro:</strong> Remove watermark, batch annotate multiple screenshots, custom annotation presets, AI-powered redaction (auto-detect faces/numbers), and team collaboration.
        </p>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}

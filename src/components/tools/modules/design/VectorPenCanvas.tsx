"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Download, Pencil, Square, Circle, Minus, MousePointer2, Undo2, Trash2, Plus, Layers, Palette, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { getErrorMessage } from '@/utils/error';

export default function VectorPenCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabric, setFabric] = useState<any>(null);
  const [canvas, setCanvas] = useState<any>(null);
  const [mode, setMode] = useState<'select' | 'pen' | 'rect' | 'circle' | 'line'>('pen');
  const [color, setColor] = useState('#6366f1');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [pages, setPages] = useState<number[]>([1]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loadError, setLoadError] = useState('');
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const currentShapeRef = useRef<any>(null);

  const colors = ['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#ffffff', '#a1a1aa'];

  useEffect(() => {
    let cancelled = false;
    import('fabric').then(fabricModule => {
      if (!cancelled) setFabric(fabricModule);
    }).catch(err => {
      if (!cancelled) setLoadError('Failed to load canvas engine: ' + (err?.message || 'unknown error'));
    });
    const timer = setTimeout(() => {
      if (!cancelled && !fabric) setLoadError('Canvas engine load timed out. Check your connection and reload.');
    }, 15000);
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!fabric || !canvasRef.current || canvas) return;

    const resizeCanvas = () => {
      if (!containerRef.current || !canvas) return;
      const w = containerRef.current.clientWidth - 2;
      const h = Math.max(500, window.innerHeight * 0.6);
      canvas.setWidth(w);
      canvas.setHeight(h);
      canvas.renderAll();
    };

    const fCanvas = new fabric.Canvas(canvasRef.current, {
      width: containerRef.current?.clientWidth || 900,
      height: Math.max(500, window.innerHeight * 0.6),
      backgroundColor: '#1a1a2e',
      isDrawingMode: true,
      freeDrawingCursor: 'crosshair',
    });

    fCanvas.freeDrawingBrush.color = color;
    fCanvas.freeDrawingBrush.width = strokeWidth;
    fCanvas.selectionColor = 'rgba(99, 102, 241, 0.15)';
    fCanvas.selectionBorderColor = '#6366f1';

    fCanvas.on('mouse:down', (opt: any) => {
      if (mode === 'rect' || mode === 'circle' || mode === 'line') {
        setIsDrawing(true);
        startPoint.current = fCanvas.getPointer(opt.e);
        const pointer = fCanvas.getPointer(opt.e);
        let shape: any;

        if (mode === 'rect') {
          shape = new fabric.Rect({
            left: pointer.x, top: pointer.y,
            width: 0, height: 0,
            fill: 'transparent',
            stroke: color,
            strokeWidth: strokeWidth,
            strokeUniform: true,
          });
        } else if (mode === 'circle') {
          shape = new fabric.Ellipse({
            left: pointer.x, top: pointer.y,
            rx: 0, ry: 0,
            fill: 'transparent',
            stroke: color,
            strokeWidth: strokeWidth,
            strokeUniform: true,
          });
        } else if (mode === 'line') {
          shape = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
            stroke: color,
            strokeWidth: strokeWidth,
            strokeUniform: true,
          });
        }

        if (shape) {
          currentShapeRef.current = shape;
          fCanvas.add(shape);
        }
      }
    });

    fCanvas.on('mouse:move', (opt: any) => {
      if (!isDrawing || !currentShapeRef.current || !startPoint.current) return;
      const pointer = fCanvas.getPointer(opt.e);
      const start = startPoint.current;

      if (mode === 'rect') {
        currentShapeRef.current.set({
          left: Math.min(start.x, pointer.x),
          top: Math.min(start.y, pointer.y),
          width: Math.abs(pointer.x - start.x),
          height: Math.abs(pointer.y - start.y),
        });
      } else if (mode === 'circle') {
        currentShapeRef.current.set({
          left: Math.min(start.x, pointer.x),
          top: Math.min(start.y, pointer.y),
          rx: Math.abs(pointer.x - start.x) / 2,
          ry: Math.abs(pointer.y - start.y) / 2,
        });
      } else if (mode === 'line') {
        currentShapeRef.current.set({ x2: pointer.x, y2: pointer.y });
      }

      currentShapeRef.current.setCoords();
      fCanvas.renderAll();
    });

    fCanvas.on('mouse:up', () => {
      setIsDrawing(false);
      currentShapeRef.current = null;
      startPoint.current = null;
    });

    fCanvas.on('object:added', () => {
      if (mode === 'pen' || mode === 'select') return;
    });

    setCanvas(fCanvas);

    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      fCanvas.dispose();
    };
  }, [fabric]);

  useEffect(() => {
    if (!canvas) return;
    canvas.isDrawingMode = mode === 'pen';
    if (mode === 'select') {
      canvas.selection = true;
      canvas.defaultCursor = 'default';
    } else {
      canvas.selection = false;
      canvas.defaultCursor = 'crosshair';
    }
  }, [mode, canvas]);

  useEffect(() => {
    if (!canvas || !canvas.freeDrawingBrush) return;
    canvas.freeDrawingBrush.color = color;
    canvas.freeDrawingBrush.width = strokeWidth;
  }, [color, strokeWidth, canvas]);

  const handleUndo = () => {
    if (!canvas) return;
    const objects = canvas.getObjects();
    if (objects.length > 0) {
      canvas.remove(objects[objects.length - 1]);
      canvas.renderAll();
    }
  };

  const handleClear = () => {
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = '#1a1a2e';
    canvas.renderAll();
    toast.success('Canvas cleared');
  };

  const handleExport = (format: 'svg' | 'png') => {
    if (!canvas) return;
    try {
      if (format === 'svg') {
        const svg = canvas.toSVG();
        const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        downloadOrShare(url, `drawing-page-${currentPage + 1}.svg`);
        toast.success('SVG exported!');
      } else {
        const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 2 });
        const blob = dataURLToBlob(dataUrl);
        const url = URL.createObjectURL(blob);
        downloadOrShare(url, `drawing-page-${currentPage + 1}.png`);
        toast.success('PNG exported!');
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Export failed'));
    }
  };

  const dataURLToBlob = (dataUrl: string): Blob => {
    const parts = dataUrl.split(',');
    const mime = parts[0].match(/:(.*?);/)![1];
    const bytes = atob(parts[1]);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return new Blob([arr], { type: mime });
  };

  const addPage = () => {
    if (!canvas) return;
    handleClear();
    setPages(prev => [...prev, prev.length + 1]);
    setCurrentPage(pages.length);
    toast.success(`Page ${pages.length + 1} added`);
  };

  const switchPage = (idx: number) => {
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = '#1a1a2e';
    canvas.renderAll();
    setCurrentPage(idx);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-overlay)] p-5 border border-zinc-200 dark:border-[var(--border-subtle)] rounded-2xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
            <Pencil className="w-5 h-5 text-[var(--accent)]" />
            Vector Pen Canvas
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Draw freehand vectors, shapes, and diagrams — nothing uploaded, 100% local.</p>
        </div>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 p-3 border-b border-[var(--border-subtle)] bg-[var(--bg-overlay)]">
          {/* Drawing modes */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-black/30 rounded-xl">
            <button onClick={() => setMode('select')} className={`p-2 rounded-lg transition-all ${mode === 'select' ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-white hover:bg-zinc-800'}`} title="Select" aria-label="Select tool"><MousePointer2 className="w-4 h-4" /></button>
            <button onClick={() => setMode('pen')} className={`p-2 rounded-lg transition-all ${mode === 'pen' ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-white hover:bg-zinc-800'}`} title="Freehand Pen" aria-label="Freehand pen tool"><Pencil className="w-4 h-4" /></button>
            <button onClick={() => setMode('rect')} className={`p-2 rounded-lg transition-all ${mode === 'rect' ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-white hover:bg-zinc-800'}`} title="Rectangle" aria-label="Rectangle tool"><Square className="w-4 h-4" /></button>
            <button onClick={() => setMode('circle')} className={`p-2 rounded-lg transition-all ${mode === 'circle' ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-white hover:bg-zinc-800'}`} title="Ellipse" aria-label="Ellipse tool"><Circle className="w-4 h-4" /></button>
            <button onClick={() => setMode('line')} className={`p-2 rounded-lg transition-all ${mode === 'line' ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-white hover:bg-zinc-800'}`} title="Line" aria-label="Line tool"><Minus className="w-4 h-4" /></button>
          </div>

          <div className="w-px h-6 bg-zinc-200 dark:bg-[var(--bg-surface)] mx-1" />

          {/* Color */}
          <div className="flex items-center gap-1">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110 shadow-md' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
                title={c}
                aria-label={`Color: ${c}`}
              />
            ))}
            <label className="relative cursor-pointer">
              <Palette className="w-4 h-4 text-[var(--text-muted)] hover:text-white ml-1" />
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="absolute inset-0 opacity-0 w-4 h-4 cursor-pointer" />
            </label>
          </div>

          <div className="w-px h-6 bg-zinc-200 dark:border-zinc-800 mx-1" />

          {/* Stroke width */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--text-secondary)]">{strokeWidth}px</span>
            <input
              type="range" min="1" max="20" value={strokeWidth}
              onChange={e => setStrokeWidth(parseInt(e.target.value))}
              className="w-20 h-1 accent-indigo-500"
            />
          </div>

          <div className="w-px h-6 bg-zinc-200 dark:border-zinc-800 mx-1" />

          {/* Actions */}
          <button onClick={handleUndo} className="p-2 text-[var(--text-muted)] hover:text-white hover:bg-zinc-800 rounded-lg" title="Undo" aria-label="Undo"><Undo2 className="w-4 h-4" /></button>
          <button onClick={handleClear} className="p-2 text-[var(--text-muted)] hover:text-red-700 dark:hover:text-red-400 hover:bg-zinc-800 rounded-lg" title="Clear canvas" aria-label="Clear canvas"><Trash2 className="w-4 h-4" /></button>

          <div className="flex-1" />

          {/* Export */}
          <button onClick={() => handleExport('svg')} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> SVG
          </button>
          <button onClick={() => handleExport('png')} className="text-xs bg-emerald-700 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> PNG
          </button>
        </div>

        {/* Canvas */}
        <div ref={containerRef} className="relative">
          {loadError && (
            <div className="flex items-center justify-center h-[500px] text-xs text-red-700 dark:text-red-400 gap-2 bg-red-500/5">
              <AlertTriangle className="w-4 h-4" />
              {loadError}
            </div>
          )}
          {!fabric && !loadError && (
            <div className="flex items-center justify-center h-[500px] text-xs text-[var(--text-secondary)] gap-2">
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              Loading canvas engine...
            </div>
          )}
          <canvas ref={canvasRef} className={`w-full ${fabric ? '' : 'hidden'}`} />
        </div>

        {/* Pages bar */}
        <div className="flex items-center gap-2 p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-overlay)] overflow-x-auto">
          <Layers className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
          {pages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => switchPage(idx)}
              className={`text-[10px] font-mono px-3 py-1.5 rounded-lg border transition-all ${currentPage === idx ? 'bg-indigo-600 text-white border-indigo-500' : 'text-[var(--text-muted)] border-zinc-800 hover:text-white hover:bg-zinc-800'}`}
            >
              Page {idx + 1}
            </button>
          ))}
          <button onClick={addPage} className="p-1.5 text-[var(--text-muted)] hover:text-white hover:bg-zinc-800 rounded-lg" title="Add Page" aria-label="Add new page">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

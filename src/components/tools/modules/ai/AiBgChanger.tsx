"use client";

import React, { useState, useRef } from 'react';
import { Upload, Download, RotateCcw, Scissors, Image, Eraser, RefreshCw, ZoomIn, Crown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { useSession } from '@/lib/auth-client';
import NextImage from "next/image";

export default function AiBgChanger() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [tolerance, setTolerance] = useState(20);
  const [bgColor, setBgColor] = useState('#10b981');
  const [useTransparent, setUseTransparent] = useState(true);
  const [brushSize, setBrushSize] = useState(20);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { data: session } = useSession();
  const isPro = (session?.user as Record<string, unknown>)?.plan === 'pro';

  const addWatermark = (canvas: HTMLCanvasElement) => {
    if (isPro) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('Processed with Toolzum', canvas.width - 12, canvas.height - 12);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImage(url);
    setResult(null);
  };

  const removeBackgroundAuto = () => {
    try {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    setIsProcessing(true);

    requestAnimationFrame(() => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Edge-aware background removal
      // Detect likely background by sampling edges
      const edgeSamples: number[][] = [];
      const sampleStep = 5;
      for (let y = 0; y < canvas.height; y += sampleStep) {
        for (let x = 0; x < canvas.width; x += sampleStep) {
          // Only sample edges (first/last 5% of width/height)
          if (x < canvas.width * 0.05 || x > canvas.width * 0.95 || y < canvas.height * 0.05 || y > canvas.height * 0.95) {
            const i = (y * canvas.width + x) * 4;
            edgeSamples.push([data[i], data[i + 1], data[i + 2]]);
          }
        }
      }

      // Compute average background color
      const avgR = edgeSamples.reduce((s, p) => s + p[0], 0) / edgeSamples.length;
      const avgG = edgeSamples.reduce((s, p) => s + p[1], 0) / edgeSamples.length;
      const avgB = edgeSamples.reduce((s, p) => s + p[2], 0) / edgeSamples.length;

      const threshold = tolerance * 3;

      for (let i = 0; i < data.length; i += 4) {
        const dr = data[i] - avgR;
        const dg = data[i + 1] - avgG;
        const db = data[i + 2] - avgB;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);

        if (dist < threshold) {
          const alpha = Math.max(0, 1 - (threshold - dist) / threshold);
          if (useTransparent) {
            data[i + 3] = Math.round(alpha < 0.5 ? 0 : alpha * 255);
          } else {
            const br = parseInt(bgColor.slice(1, 3), 16);
            const bg = parseInt(bgColor.slice(3, 5), 16);
            const bb = parseInt(bgColor.slice(5, 7), 16);
            const blend = dist / threshold;
            data[i] = data[i] * blend + br * (1 - blend);
            data[i + 1] = data[i + 1] * blend + bg * (1 - blend);
            data[i + 2] = data[i + 2] * blend + bb * (1 - blend);
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      addWatermark(canvas);
      setResult(canvas.toDataURL('image/png'));
      setIsProcessing(false);
      toast.success('Background removed!');
    });
  } catch (err: unknown) {
      setIsProcessing(false);
      toast.error(err instanceof Error ? err.message : 'Background removal failed');
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = overlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
    ctx.fill();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = overlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fill();
  };

  const stopDrawing = () => setIsDrawing(false);

  const applyManualMask = () => {
    const mainCanvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!mainCanvas || !overlay) return;

    setIsProcessing(true);
    requestAnimationFrame(() => {
      const ctx = mainCanvas.getContext('2d');
      const overCtx = overlay.getContext('2d');
      if (!ctx || !overCtx) return;

      const imageData = ctx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
      const data = imageData.data;
      const overData = overCtx.getImageData(0, 0, overlay.width, overlay.height);
      const oData = overData.data;

      for (let i = 0; i < data.length; i += 4) {
        const oi = (i / 4) * 4;
        if (oData[oi + 3] > 0) {
          // This pixel was painted (marked as foreground)
          continue; // keep it
        } else {
          // Remove background
          if (useTransparent) {
            data[i + 3] = 0;
          } else {
            const br = parseInt(bgColor.slice(1, 3), 16);
            const bg = parseInt(bgColor.slice(3, 5), 16);
            const bb = parseInt(bgColor.slice(5, 7), 16);
            data[i] = br;
            data[i + 1] = bg;
            data[i + 2] = bb;
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      addWatermark(mainCanvas);
      setResult(mainCanvas.toDataURL('image/png'));
      setIsProcessing(false);
      toast.success('Mask applied!');
    });
  };

  const resetAll = () => {
    setImage(null);
    setResult(null);
    setMode('auto');
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <Scissors className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">AI BG Changer</h3>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        {!image ? (
          <div role="button" tabIndex={0} className="border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-12 text-center hover:border-emerald-500/50 transition-colors cursor-pointer bg-[var(--bg-overlay)]/50 dark:bg-black/20"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}>
            <Image className="w-12 h-12 mx-auto mb-3 text-[var(--text-muted)]" />
            <p className="text-base font-semibold text-[var(--text-secondary)]">Upload an image</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">AI-powered background removal + replacement</p>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="space-y-3 lg:col-span-1">
              <div className="bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)] space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Mode</h5>
                  <div className="flex bg-zinc-200 dark:bg-zinc-700 rounded-lg p-0.5">
                    <button onClick={() => setMode('auto')}
                      aria-pressed={mode === 'auto'}
                      className={`px-2.5 py-1 rounded-md text-[9px] font-semibold transition-colors focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-1 ${mode === 'auto' ? 'bg-white dark:bg-zinc-600 text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>
                      Auto
                    </button>
                    <button onClick={() => setMode('manual')}
                      aria-pressed={mode === 'manual'}
                      className={`px-2.5 py-1 rounded-md text-[9px] font-semibold transition-colors focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-1 ${mode === 'manual' ? 'bg-white dark:bg-zinc-600 text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>
                      Manual
                    </button>
                  </div>
                </div>

                {mode === 'auto' ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] text-[var(--text-secondary)] flex justify-between"><span>Detection Sensitivity</span><span className="font-mono">{tolerance}%</span></label>
                      <input type="range" min="1" max="50" value={tolerance} onChange={e => setTolerance(Number(e.target.value))}
                        className="w-full accent-emerald-500" />
                    </div>
                    <button onClick={removeBackgroundAuto} disabled={isProcessing}
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2">
                      {isProcessing ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing...</> : <><Scissors className="w-3.5 h-3.5" /> Remove BG {!isPro ? '(Standard)' : ''}</>}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-[9px] text-[var(--text-secondary)]">Paint over the foreground (subject) to keep it. Everything else will be removed.</p>
                    <div className="space-y-1">
                      <label className="text-[10px] text-[var(--text-secondary)] flex justify-between"><span>Brush Size</span><span className="font-mono">{brushSize}px</span></label>
                      <input type="range" min="5" max="80" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))}
                        className="w-full accent-emerald-500" />
                    </div>
                    <button onClick={applyManualMask} disabled={isProcessing}
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2">
                      <Eraser className="w-3.5 h-3.5" /> Apply Mask
                    </button>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] text-[var(--text-secondary)]">New BG Color</label>
                  <input aria-label="New BG Color" type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                    className="w-full h-9 rounded-xl border border-[var(--border-subtle)] cursor-pointer" />
                </div>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-[10px] text-[var(--text-secondary)]">Transparent BG</span>
                  <input type="checkbox" checked={useTransparent} onChange={e => setUseTransparent(e.target.checked)}
                    className="rounded border-zinc-300 text-emerald-500 focus:ring-emerald-500" />
                </label>

                <button onClick={resetAll}
                  className="w-full py-2 bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[var(--bg-surface)] transition-colors focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2">
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>

              {(result || image) && (
                <button onClick={() => {
                  const url = result || image;
                  if (url) downloadOrShare(url, `bg_changed_${Date.now()}.png`);
                }}
                  className="w-full py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              )}
            </div>

            <div className="lg:col-span-2 space-y-3">
              <div className="bg-[var(--bg-overlay)] rounded-xl p-2 border border-[var(--border-subtle)] relative">
                <NextImage loading="lazy" ref={imageRef} src={image} alt="Processed image" unoptimized={true} className="hidden" onLoad={() => {
                  const img = imageRef.current;
                  const canvas = canvasRef.current;
                  const overlay = overlayRef.current;
                  if (!img || !canvas || !overlay) return;
                  canvas.width = img.naturalWidth;
                  canvas.height = img.naturalHeight;
                  overlay.width = img.naturalWidth;
                  overlay.height = img.naturalHeight;
                  const ctx = canvas.getContext('2d');
                  if (!ctx) return;
                  ctx.drawImage(img, 0, 0);
                }} />
                <div className="relative overflow-auto max-h-[500px] flex items-center justify-center">
                  <canvas ref={canvasRef} className="max-w-full max-h-[500px] rounded-lg" style={{ width: '100%', height: 'auto' }} />
                  {mode === 'manual' && (
                    <canvas ref={overlayRef}
                      onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                      className="absolute inset-0 max-w-full max-h-[500px] cursor-crosshair opacity-0 hover:opacity-100 transition-opacity"
                      style={{ width: '100%', height: 'auto' }} />
                  )}
                </div>
              </div>

              {result && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-3">
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Scissors className="w-3 h-3" /> Background removed successfully! Download or adjust settings.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-3">
          <p className="text-[10px] text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
            <Crown className="w-3 h-3" />
            {!isPro ? 'Free output includes a subtle "Processed with Toolzum" watermark. ' : ''}
            <strong>Pro:</strong> No watermark • 4K export • AI-powered subject isolation • Batch processing • Shadows & reflections • API access.
          </p>
        </div>
      </div>
    </div>
  );
}

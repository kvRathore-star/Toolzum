"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';

type Layout = 'grid-2x2' | 'grid-3x3' | 'horizontal' | 'vertical' | 'featured';
type Format = 'image/png' | 'image/jpeg' | 'image/webp';

interface CollageImage {
  file: File;
  dataUrl: string;
}

const LAYOUTS: { id: Layout; label: string; min: number; max: number }[] = [
  { id: 'grid-2x2', label: 'Grid 2×2', min: 4, max: 4 },
  { id: 'grid-3x3', label: 'Grid 3×3', min: 9, max: 9 },
  { id: 'horizontal', label: 'Horizontal', min: 2, max: 9 },
  { id: 'vertical', label: 'Vertical', min: 2, max: 9 },
  { id: 'featured', label: 'Featured', min: 3, max: 3 },
];

const CANVAS_SIZE = 1200;

const LAYOUT_ICONS: Record<Layout, string> = {
  'grid-2x2': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5 mx-auto mb-1"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>`,
  'grid-3x3': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5 mx-auto mb-1"><rect x="2" y="2" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><rect x="16" y="2" width="6" height="6" rx="1"/><rect x="2" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/><rect x="16" y="9" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/></svg>`,
  horizontal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5 mx-auto mb-1"><rect x="2" y="7" width="5" height="10" rx="1"/><rect x="8.5" y="7" width="5" height="10" rx="1"/><rect x="15" y="7" width="5" height="10" rx="1"/></svg>`,
  vertical: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5 mx-auto mb-1"><rect x="7" y="2" width="10" height="5" rx="1"/><rect x="7" y="8.5" width="10" height="5" rx="1"/><rect x="7" y="15" width="10" height="5" rx="1"/></svg>`,
  featured: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5 mx-auto mb-1"><rect x="2" y="2" width="13" height="20" rx="1"/><rect x="17" y="2" width="5" height="8" rx="1"/><rect x="17" y="13" width="5" height="8" rx="1"/></svg>`,
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default function CollageMaker() {
  const [images, setImages] = useState<CollageImage[]>([]);
  const [layout, setLayout] = useState<Layout>('grid-2x2');
  const [spacing, setSpacing] = useState(8);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [borderWidth, setBorderWidth] = useState(2);
  const [borderColor, setBorderColor] = useState('#ffffff');
  const [radius, setRadius] = useState(0);
  const [format, setFormat] = useState<Format>('image/png');
  const [quality, setQuality] = useState(0.92);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const addImage = (file: File, dataUrl: string) => {
    if (images.length >= 9) {
      toast.error('Maximum 9 images allowed.');
      return;
    }
    setImages(prev => [...prev, { file, dataUrl }]);
    setOutputUrl(null);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setOutputUrl(null);
  };

  const clearAll = () => {
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setImages([]);
    setOutputUrl(null);
  };

  const drawCell = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number, y: number, w: number, h: number
  ) => {
    ctx.fillStyle = borderColor;
    ctx.beginPath();
    if (radius > 0) ctx.roundRect(x, y, w, h, radius);
    else ctx.rect(x, y, w, h);
    ctx.fill();

    const ix = x + borderWidth;
    const iy = y + borderWidth;
    const iw = w - borderWidth * 2;
    const ih = h - borderWidth * 2;

    ctx.save();
    if (radius > 0) {
      ctx.beginPath();
      ctx.roundRect(ix, iy, iw, ih, Math.max(0, radius - borderWidth));
      ctx.clip();
    }

    const ar = img.width / img.height;
    const ca = iw / ih;
    let sx = 0, sy = 0, sw = img.width, sh = img.height;
    if (ar > ca) {
      sw = img.height * ca;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / ca;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, ix, iy, iw, ih);
    ctx.restore();
  };

  const generate = async () => {
    setIsProcessing(true);
    try {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      const n = images.length;

      canvas.width = CANVAS_SIZE;
      canvas.height = CANVAS_SIZE;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      const cells: { x: number; y: number; w: number; h: number }[] = [];

      if (layout === 'featured') {
        const bw2 = borderWidth * 2;
        const leftW = Math.round((CANVAS_SIZE - spacing - bw2 * 3) * 0.66);
        const rightW = CANVAS_SIZE - leftW - spacing - bw2 * 3;
        const smallH = Math.round((CANVAS_SIZE - spacing - bw2 * 3) / 2);
        const ox = Math.floor((CANVAS_SIZE - (leftW + bw2 + spacing + rightW + bw2)) / 2);

        cells.push({ x: ox, y: 0, w: leftW + bw2, h: CANVAS_SIZE });
        cells.push({ x: ox + leftW + bw2 + spacing, y: 0, w: rightW + bw2, h: smallH + bw2 });
        cells.push({ x: ox + leftW + bw2 + spacing, y: smallH + bw2 + spacing, w: rightW + bw2, h: smallH + bw2 });
      } else {
        const [cols, rows] = layout === 'grid-2x2' ? [2, 2] as const : layout === 'grid-3x3' ? [3, 3] as const : layout === 'horizontal' ? [n, 1] as const : [1, n] as const;
        const ac = Math.min(cols, n);
        const ar = Math.ceil(n / ac);
        const bw2 = borderWidth * 2;
        const cellSize = Math.floor(Math.min(
          (CANVAS_SIZE - spacing * (ac - 1) - bw2 * ac) / ac,
          (CANVAS_SIZE - spacing * (ar - 1) - bw2 * ar) / ar
        ));
        const totalW = ac * (cellSize + bw2) + spacing * (ac - 1);
        const totalH = ar * (cellSize + bw2) + spacing * (ar - 1);
        const ox = Math.floor((CANVAS_SIZE - totalW) / 2);
        const oy = Math.floor((CANVAS_SIZE - totalH) / 2);

        let idx = 0;
        for (let r = 0; r < ar && idx < n; r++) {
          for (let c = 0; c < ac && idx < n; c++) {
            cells.push({
              x: ox + c * (cellSize + bw2 + spacing),
              y: oy + r * (cellSize + bw2 + spacing),
              w: cellSize + bw2,
              h: cellSize + bw2,
            });
            idx++;
          }
        }
      }

      for (let i = 0; i < Math.min(cells.length, n); i++) {
        const c = cells[i];
        const img = await loadImage(images[i].dataUrl);
        drawCell(ctx, img, c.x, c.y, c.w, c.h);
      }

      const blob = await new Promise<Blob | null>(resolve => {
        if (format === 'image/png') canvas.toBlob(resolve, format);
        else canvas.toBlob(resolve, format, quality);
      });

      if (!blob) throw new Error('Failed to generate collage');

      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success('Collage generated!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate collage.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (images.length < 2) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm">
          <strong>Collage Maker:</strong> Combine 2–9 images into beautiful grid or strip layouts.
        </div>
        <FileUploader
          accept="image/*"
          onFileSelect={addImage}
          title={images.length === 0 ? 'Upload images for collage' : `Upload image ${images.length + 1} of 9`}
          subtitle={`${images.length}/9 selected`}
        />
        {images.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-[var(--border-subtle)] flex-shrink-0">
                <img src={img.dataUrl} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                >×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{images.length} image{images.length > 1 ? 's' : ''}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">Collage Maker</p>
        </div>
        <button onClick={clearAll}
          className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
        >Change Images</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 h-fit">
          <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">Layout</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LAYOUTS.map(l => {
              const disabled = images.length > l.max || images.length < l.min;
              return (
                <button key={l.id} disabled={disabled}
                  onClick={() => setLayout(l.id)}
                  className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border ${
                    layout === l.id
                      ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                      : disabled
                      ? 'bg-[var(--bg-overlay)]/50 border-[var(--border-subtle)] text-[var(--text-muted)] dark:text-zinc-600 cursor-not-allowed opacity-50'
                      : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)] hover:border-blue-300'
                  }`}
                  dangerouslySetInnerHTML={{ __html: `${LAYOUT_ICONS[l.id]}<span>${l.label}</span>` }}
                />
              );
            })}
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-6 space-y-4">
            <h4 className="text-[var(--text-primary)] font-medium">Settings</h4>

            <div>
              <label className="flex justify-between text-xs text-[var(--text-secondary)] mb-1"><span>Spacing</span><span>{spacing}px</span></label>
              <input type="range" min={0} max={20} value={spacing}
                onChange={e => setSpacing(Number(e.target.value))}
                className="w-full accent-blue-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Background</label>
                <input type="color" value={bgColor}
                  onChange={e => setBgColor(e.target.value)}
                  className="w-full h-9 rounded-lg cursor-pointer border border-[var(--border-subtle)]" />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Border Color</label>
                <input type="color" value={borderColor}
                  onChange={e => setBorderColor(e.target.value)}
                  className="w-full h-9 rounded-lg cursor-pointer border border-[var(--border-subtle)]" />
              </div>
            </div>

            <div>
              <label className="flex justify-between text-xs text-[var(--text-secondary)] mb-1"><span>Border Width</span><span>{borderWidth}px</span></label>
              <input type="range" min={0} max={10} value={borderWidth}
                onChange={e => setBorderWidth(Number(e.target.value))}
                className="w-full accent-blue-500" />
            </div>

            <div>
              <label className="flex justify-between text-xs text-[var(--text-secondary)] mb-1"><span>Corner Radius</span><span>{radius}px</span></label>
              <input type="range" min={0} max={50} value={radius}
                onChange={e => setRadius(Number(e.target.value))}
                className="w-full accent-blue-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Format</label>
                <select value={format}
                  onChange={e => setFormat(e.target.value as Format)}
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-2 py-2 text-sm text-zinc-900 dark:text-zinc-100"
                >
                  <option value="image/png">PNG</option>
                  <option value="image/jpeg">JPG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </div>
              {(format === 'image/jpeg' || format === 'image/webp') && (
                <div>
                  <label className="flex justify-between text-xs text-[var(--text-secondary)] mb-1"><span>Quality</span><span>{Math.round(quality * 100)}%</span></label>
                  <input type="range" min={0.1} max={1} step={0.01} value={quality}
                    onChange={e => setQuality(Number(e.target.value))}
                    className="w-full accent-blue-500" />
                </div>
              )}
            </div>
          </div>

          <button onClick={generate} disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isProcessing ? (
              <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Generating...</>
            ) : 'Generate Collage'}
          </button>
        </div>

        <div className="space-y-6">
          {outputUrl ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                <h4 className="font-bold text-emerald-500">Collage Ready</h4>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-xl overflow-hidden border border-[var(--border-subtle)]">
                <img src={outputUrl} alt="Collage" className="w-full h-auto" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => downloadOrShare(outputUrl, `collage.${format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png'}`)}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download
                </button>
                <button onClick={() => setOutputUrl(null)}
                  className="bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold px-4 py-4 rounded-xl transition-colors"
                >Regenerate</button>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-[var(--text-muted)]">
              <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p>Adjust settings and generate your collage</p>
            </div>
          )}

          {!outputUrl && (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl">
              <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2 mb-4">Images ({images.length})</h4>
              <div className="flex flex-wrap gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-[var(--border-subtle)] flex-shrink-0">
                    <img src={img.dataUrl} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(i)}
                      className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-0.5">{i + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

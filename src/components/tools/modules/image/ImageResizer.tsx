"use client";
import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { usePresetContext } from '@/context/WorkflowPresetContext';
import { useEnterToSubmit } from '@/lib/keyboard';
import { consumeHeroFile } from '@/lib/heroFile';

export default function ImageResizer() {
  const [image, setImage] = useState<string | null>(null);
  const [width, setWidth] = useState('800');
  const [height, setHeight] = useState('600');
  const [lockAspect, setLockAspect] = useState(false);
  const [origAspect, setOrigAspect] = useState<number | null>(null);
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [quality, setQuality] = useState('0.9');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { registerConfig } = usePresetContext();

  useEffect(() => {
    registerConfig(
      () => ({ width, height }),
      (cfg) => {
        if (cfg.width) setWidth(String(cfg.width));
        if (cfg.height) setHeight(String(cfg.height));
      },
    );
  }, [registerConfig, width, height]);

  const loadFile = (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      toast.error(`"${file.name}" exceeds the 50MB image limit.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
       const img = new Image();
       img.onload = () => {
          setWidth(img.width.toString());
          setHeight(img.height.toString());
          setOrigAspect(img.width / img.height);
          setImage(img.src);
        };
       img.onerror = () => toast.error('Failed to load image. The file may be corrupted.');
       img.src = event.target?.result as string;
    };
    reader.onerror = () => toast.error('Failed to read file. Please try another image.');
    reader.readAsDataURL(file);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadFile(file);
  };

  // Hero-box carry: a file dropped on the homepage arrives via IndexedDB (same
  // browser, never uploaded) and enters through loadFile — same decode path
  // as a manual pick. Consume-once + 5-min TTL live in heroFile.ts.
  const heroClaimed = useRef(false);
  useEffect(() => {
    if (heroClaimed.current) return;
    heroClaimed.current = true;
    consumeHeroFile().then((f) => {
      if (f) loadFile(f);
    }).catch(() => {});
  }, []);

  const download = () => {
    if (!image || !canvasRef.current) return;
    const w = parseInt(width);
    const h = parseInt(height);
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
      toast.error('Enter valid positive numbers for width and height.');
      return;
    }
    const img = new Image();
    img.src = image;
    img.onload = () => {
      try {
        const canvas = canvasRef.current!;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const mime = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
        const ext = format === 'jpeg' ? 'jpg' : format;
        const q = format === 'png' ? undefined : Math.min(1, Math.max(0.1, parseFloat(quality) || 0.9));
        downloadOrShare(canvas.toDataURL(mime, q), `resized.${ext}`);
        toast.success('Downloaded!');
      } catch (e) {
        console.error('ImageResizer canvas error:', e);
        toast.error('Failed to resize image. The file may be too large or corrupted.');
      }
    };
    img.onerror = () => toast.error('Failed to load image. The file may be corrupted.');
  };

  const handleKeyDown = useEnterToSubmit(download);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-6 text-center">
         <h2 className="text-2xl font-bold">Image Resizer</h2>
         
         <div className="border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-12 hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer relative">
           <input aria-label="Image Resizer" type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            {image ? <img src={image} alt="Preview" className="max-h-64 mx-auto rounded-lg" /> : <div className="text-[var(--text-secondary)]">Click or Drag Image Here</div>}
         </div>

          {image && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                  <label htmlFor="lbl-imageresizer-width-px" className="block text-sm font-bold text-left mb-2 text-[var(--text-secondary)]">Width (px)</label>
                  <input id="lbl-imageresizer-width-px" aria-label="Width (px)" type="number" value={width} onChange={e => { setWidth(e.target.value); if (lockAspect && origAspect) { const w = parseInt(e.target.value); if (!isNaN(w) && w > 0) setHeight(String(Math.round(w / origAspect))); } }} className="w-full bg-[var(--bg-overlay)] border-2 border-[var(--border-subtle)] rounded-xl px-4 py-3 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
               </div>
               <div>
                  <label htmlFor="lbl-imageresizer-height-px" className="block text-sm font-bold text-left mb-2 text-[var(--text-secondary)]">Height (px)</label>
                  <input id="lbl-imageresizer-height-px" aria-label="Height (px)" type="number" value={height} onChange={e => { setHeight(e.target.value); if (lockAspect && origAspect) { const h = parseInt(e.target.value); if (!isNaN(h) && h > 0) setWidth(String(Math.round(h * origAspect))); } }} className="w-full bg-[var(--bg-overlay)] border-2 border-[var(--border-subtle)] rounded-xl px-4 py-3 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
               </div>
            </div>
          )}

          {image && (
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={lockAspect} onChange={e => setLockAspect(e.target.checked)} aria-label="Lock aspect ratio" /> Lock aspect ratio</label>
              <label className="flex items-center gap-2">Format
                <select value={format} onChange={e => setFormat(e.target.value as 'png' | 'jpeg' | 'webp')} aria-label="Output format" className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-2 py-1">
                  <option value="png">PNG</option>
                  <option value="jpeg">JPEG</option>
                  <option value="webp">WebP</option>
                </select>
              </label>
              {format !== 'png' && (
                <label className="flex items-center gap-2">Quality
                  <input type="number" min="0.1" max="1" step="0.1" value={quality} onChange={e => setQuality(e.target.value)} aria-label="JPEG quality" className="w-20 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-2 py-1" />
                </label>
              )}
            </div>
          )}

         {image && (
           <button 
             onClick={download} 
             onKeyDown={handleKeyDown}
             className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"
             aria-label="Download resized image"
           >
             Download Resized Image
           </button>
         )}
         
         <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
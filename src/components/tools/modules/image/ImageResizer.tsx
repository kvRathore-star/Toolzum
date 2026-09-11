"use client";
import React, { useState, useRef, useEffect } from 'react';
import NextImage from "next/image";
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { usePresetContext } from '@/context/WorkflowPresetContext';
import { useEnterToSubmit } from '@/lib/keyboard';

export default function ImageResizer() {
  const [image, setImage] = useState<string | null>(null);
  const [width, setWidth] = useState('800');
  const [height, setHeight] = useState('600');
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

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
       const img = new Image();
       img.onload = () => {
         setWidth(img.width.toString());
         setHeight(img.height.toString());
         setImage(img.src);
       };
       img.onerror = () => toast.error('Failed to load image. The file may be corrupted.');
       img.src = event.target?.result as string;
    };
    reader.onerror = () => toast.error('Failed to read file. Please try another image.');
    reader.readAsDataURL(file);
  };

  const download = () => {
    if (!image || !canvasRef.current) return;
    const img = new Image();
    img.src = image;
    img.onload = () => {
      try {
        const canvas = canvasRef.current!;
        canvas.width = parseInt(width);
        canvas.height = parseInt(height);
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        downloadOrShare(canvas.toDataURL('image/png'), 'resized.png');
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
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-8 rounded-2xl shadow-xl space-y-6 text-center">
         <h2 className="text-2xl font-bold">Image Resizer</h2>
         
         <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-12 hover:bg-[var(--bg-overlay)] dark:hover:bg-zinc-800 transition-colors cursor-pointer relative">
           <input aria-label="Image Resizer" type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
           {image ? <NextImage unoptimized={true} loading="lazy" src={image} alt="Preview" className="max-h-64 mx-auto rounded-lg" /> : <div className="text-[var(--text-secondary)]">Click or Drag Image Here</div>}
         </div>

         {image && (
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                 <label htmlFor="lbl-imageresizer-width-px" className="block text-sm font-bold text-left mb-2 text-zinc-600">Width (px)</label>
                 <input id="lbl-imageresizer-width-px" aria-label="Width (px)" type="number" value={width} onChange={e => setWidth(e.target.value)} className="w-full bg-[var(--bg-overlay)] border-2 border-[var(--border-subtle)] rounded-xl px-4 py-3 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
              </div>
              <div>
                 <label htmlFor="lbl-imageresizer-height-px" className="block text-sm font-bold text-left mb-2 text-zinc-600">Height (px)</label>
                 <input id="lbl-imageresizer-height-px" aria-label="Height (px)" type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-[var(--bg-overlay)] border-2 border-[var(--border-subtle)] rounded-xl px-4 py-3 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
              </div>
           </div>
         )}

         {image && (
           <button 
             onClick={download} 
             onKeyDown={handleKeyDown}
             className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"
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
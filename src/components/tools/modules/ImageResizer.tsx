"use client";
import React, { useState, useRef, useEffect } from 'react';
import NextImage from "next/image";
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { usePresetContext } from '@/context/WorkflowPresetContext';

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
       img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const download = () => {
    if (!image || !canvasRef.current) return;
    const img = new Image();
    img.src = image;
    img.onload = () => {
      const canvas = canvasRef.current!;
      canvas.width = parseInt(width);
      canvas.height = parseInt(height);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      downloadOrShare(canvas.toDataURL('image/png'), 'resized.png');
      toast.success('Downloaded!');
    };
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-8 rounded-2xl shadow-xl space-y-6 text-center">
         <h2 className="text-2xl font-bold">Image Resizer</h2>
         
         <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-12 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer relative">
           <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
           {image ? <NextImage unoptimized={true} loading="lazy" src={image} alt="Preview" className="max-h-64 mx-auto rounded-lg" /> : <div className="text-zinc-500">Click or Drag Image Here</div>}
         </div>

         {image && (
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                 <label className="block text-sm font-bold text-left mb-2 text-zinc-600">Width (px)</label>
                 <input type="number" value={width} onChange={e => setWidth(e.target.value)} className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none" />
              </div>
              <div>
                 <label className="block text-sm font-bold text-left mb-2 text-zinc-600">Height (px)</label>
                 <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none" />
              </div>
           </div>
         )}

         {image && (
           <button onClick={download} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95">
             Download Resized Image
           </button>
         )}
         
         <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
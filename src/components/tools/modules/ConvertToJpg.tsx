"use client";
import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

export default function ConvertToJpg() {
  const [image, setImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setImage(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const convert = () => {
    if (!image || !canvasRef.current) return;
    const img = new Image();
    img.src = image;
    img.onload = () => {
      const canvas = canvasRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      
      // Draw white background in case of transparency
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const jpgUrl = canvas.toDataURL('image/jpeg', 0.9);
      downloadOrShare(jpgUrl, 'converted.jpg');
      toast.success('Converted to JPG & Downloaded!');
    };
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-8 rounded-2xl shadow-xl space-y-6 text-center">
         <h2 className="text-2xl font-bold">Image to JPG Converter</h2>
         <p className="text-zinc-500">Convert any image (PNG, WebP, BMP, GIF) to standard JPG format.</p>
         
         <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-12 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer relative">
           <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
           {image ? (
             <img loading="lazy" src={image} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-sm" />
           ) : (
             <div className="text-zinc-500">Click or Drag Any Image Here</div>
           )}
         </div>

         {image && (
           <button onClick={convert} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95">
             Convert to JPG
           </button>
         )}
         
         <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}

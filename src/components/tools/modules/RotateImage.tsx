"use client";
import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { RotateCcw, RotateCw, Download } from 'lucide-react';
import { downloadOrShare } from '@/utils/nativeShare';

export default function RotateImage() {
  const [image, setImage] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setRotation(0);
    };
    reader.readAsDataURL(file);
  };

  const handleRotate = (deg: number) => {
    setRotation((prev) => (prev + deg) % 360);
  };

  const download = () => {
    if (!image || !canvasRef.current) return;
    const img = new Image();
    img.src = image;
    img.onload = () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      
      // Calculate new dimensions
      const rad = (rotation * Math.PI) / 180;
      const w = img.width;
      const h = img.height;
      const newWidth = Math.abs(w * Math.cos(rad)) + Math.abs(h * Math.sin(rad));
      const newHeight = Math.abs(w * Math.sin(rad)) + Math.abs(h * Math.cos(rad));
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rad);
      ctx.drawImage(img, -w / 2, -h / 2);
      
      const outUrl = canvas.toDataURL('image/png');
      downloadOrShare(outUrl, 'rotated.png');
      toast.success('Downloaded rotated image!');
    };
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-8 rounded-2xl shadow-xl space-y-6 text-center">
         <h2 className="text-2xl font-bold">Rotate Image Online</h2>
         <p className="text-zinc-500">Rotate images left or right by 90 degrees instantly in your browser.</p>
         
         <div 
           className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-12 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer relative"
           onClick={() => !image && fileInputRef.current?.click()}
         >
           <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
           {image ? (
             <div className="relative inline-block transition-transform duration-300" style={{ transform: `rotate(${rotation}deg)` }}>
               <img loading="lazy" src={image} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-sm" />
             </div>
           ) : (
             <div className="text-zinc-500">Click or Drag Image Here</div>
           )}
         </div>

         {image && (
           <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
             <button onClick={() => handleRotate(-90)} className="flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium py-3 px-6 rounded-xl transition-all shadow-sm">
               <RotateCcw className="w-5 h-5" /> Left
             </button>
             <button onClick={() => handleRotate(90)} className="flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium py-3 px-6 rounded-xl transition-all shadow-sm">
               <RotateCw className="w-5 h-5" /> Right
             </button>
             <button onClick={download} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all active:scale-95 ml-auto sm:ml-4">
               <Download className="w-5 h-5" /> Download
             </button>
             <button onClick={() => {setImage(null); setRotation(0);}} className="text-sm text-zinc-500 underline ml-2">Clear</button>
           </div>
         )}
         
         <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}

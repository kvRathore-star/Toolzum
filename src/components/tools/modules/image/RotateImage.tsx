"use client";
import React, { useState, useRef } from 'react';
import NextImage from "next/image";
import { toast } from 'react-hot-toast';
import { RotateCcw, RotateCw, Download, FlipHorizontal, FlipVertical } from 'lucide-react';
import { downloadOrShare } from '@/utils/nativeShare';
import { useEnterToSubmit } from '@/lib/keyboard';

export default function RotateImage() {
  const [image, setImage] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
    };
    reader.onerror = () => toast.error('Failed to read file. Please try another image.');
    reader.readAsDataURL(file);
  };

  const handleRotate = (deg: number) => {
    setRotation((prev) => (prev + deg + 360) % 360);
  };

  const download = () => {
    if (!image || !canvasRef.current) return;
    const img = new Image();
    img.src = image;
    img.onload = () => {
      try {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        
        const rad = (rotation * Math.PI) / 180;
        const w = img.width;
        const h = img.height;
        const newWidth = Math.abs(w * Math.cos(rad)) + Math.abs(h * Math.sin(rad));
        const newHeight = Math.abs(w * Math.sin(rad)) + Math.abs(h * Math.cos(rad));
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx.rotate(rad);
        ctx.drawImage(img, -w / 2, -h / 2);
        
        const outUrl = canvas.toDataURL('image/png');
        downloadOrShare(outUrl, 'rotated.png');
        toast.success('Downloaded rotated image!');
      } catch (e) {
        console.error('RotateImage canvas error:', e);
        toast.error('Failed to process image. The file may be too large or corrupted.');
      }
    };
    img.onerror = () => toast.error('Failed to load image. The file may be corrupted.');
  };

  const handleKeyDown = useEnterToSubmit(download);

  const previewStyle = {
    transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-8 rounded-2xl shadow-xl space-y-6 text-center">
         <h2 className="text-2xl font-bold">Rotate & Flip Image</h2>
         <p className="text-[var(--text-secondary)]">Rotate to any angle, flip horizontally or vertically. All processing in your browser.</p>
         
          <div 
            role="button" tabIndex={0} aria-label="Upload image"
            className="border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-12 hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer relative"
            onClick={() => !image && fileInputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!image) fileInputRef.current?.click(); } }}
          >
           <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
           {image ? (
             <div className="relative inline-block transition-transform duration-300" style={previewStyle}>
               <NextImage unoptimized={true} loading="lazy" src={image} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-sm" />
             </div>
           ) : (
             <div className="text-[var(--text-secondary)]">Click or Drag Image Here</div>
           )}
         </div>

         {image && (
           <div className="space-y-4">
             {/* Quick rotate buttons */}
             <div className="flex flex-wrap gap-2 items-center justify-center">
                <button 
                  onClick={() => handleRotate(-90)} 
                  className="flex items-center gap-1.5 bg-[var(--bg-overlay)] hover:bg-[var(--bg-overlay)] dark:bg-[var(--bg-elevated)] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium py-2 px-4 rounded-lg transition-all text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"
                  aria-label="Rotate left 90 degrees"
                >
                  <RotateCcw className="w-4 h-4" /> 90° Left
                </button>
                <button 
                  onClick={() => handleRotate(90)} 
                  className="flex items-center gap-1.5 bg-[var(--bg-overlay)] hover:bg-[var(--bg-overlay)] dark:bg-[var(--bg-elevated)] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium py-2 px-4 rounded-lg transition-all text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"
                  aria-label="Rotate right 90 degrees"
                >
                  <RotateCw className="w-4 h-4" /> 90° Right
                </button>
                <button 
                  onClick={() => handleRotate(180)} 
                  className="flex items-center gap-1.5 bg-[var(--bg-overlay)] hover:bg-[var(--bg-overlay)] dark:bg-[var(--bg-elevated)] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium py-2 px-4 rounded-lg transition-all text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"
                  aria-label="Rotate 180 degrees"
                >
                  180°
                </button>
               <div className="w-px h-6 bg-[var(--border-subtle)]" />
                <button 
                  onClick={() => setFlipH(!flipH)} 
                  className={`flex items-center gap-1.5 font-medium py-2 px-4 rounded-lg transition-all text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2 ${flipH ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-overlay)] hover:bg-[var(--bg-overlay)] dark:bg-[var(--bg-elevated)] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-primary)]'}`}
                  aria-label="Flip image horizontally"
                  aria-pressed={flipH}
                >
                  <FlipHorizontal className="w-4 h-4" /> Flip H
                </button>
                <button 
                  onClick={() => setFlipV(!flipV)} 
                  className={`flex items-center gap-1.5 font-medium py-2 px-4 rounded-lg transition-all text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2 ${flipV ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-overlay)] hover:bg-[var(--bg-overlay)] dark:bg-[var(--bg-elevated)] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-primary)]'}`}
                  aria-label="Flip image vertically"
                  aria-pressed={flipV}
                >
                  <FlipVertical className="w-4 h-4" /> Flip V
                </button>
             </div>

             {/* Arbitrary rotation slider */}
             <div className="flex items-center gap-3 px-4">
               <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap">0°</span>
               <input type="range" min={0} max={359} value={rotation}
                 onChange={(e) => setRotation(Number(e.target.value))}
                 className="flex-1 accent-[var(--accent)]" />
               <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap">359°</span>
               <input type="number" min={0} max={359} value={rotation}
                 onChange={(e) => setRotation((Number(e.target.value) % 360 + 360) % 360)}
                 className="w-16 text-center text-sm border border-[var(--border-subtle)] rounded px-1 py-0.5 bg-[var(--bg-surface)]" />
             </div>

             {/* Action buttons */}
             <div className="flex flex-wrap gap-2 items-center justify-center">
               <button onClick={() => { setRotation(0); setFlipH(false); setFlipV(false); }}
                 className="text-sm text-[var(--text-secondary)] underline">Reset All</button>
                <button 
                  onClick={download} 
                  onKeyDown={handleKeyDown}
                  className="flex items-center gap-2 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all active:scale-95 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"
                  aria-label="Download rotated image"
                >
                 <Download className="w-5 h-5" /> Download
               </button>
               <button onClick={() => { setImage(null); setRotation(0); setFlipH(false); setFlipV(false); }}
                 className="text-sm text-[var(--text-secondary)] underline">Clear</button>
             </div>
           </div>
         )}
         
         <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}

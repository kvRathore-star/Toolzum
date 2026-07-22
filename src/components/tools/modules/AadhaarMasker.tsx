"use client";

import React, { useState, useRef, useEffect } from 'react';
import { toast } from "react-hot-toast";
import { FileUploader } from '../FileUploader';
import * as pdfjsLib from 'pdfjs-dist';
import { downloadOrShare } from '@/utils/nativeShare';

// Configure PDF.js worker for client-side parsing
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

export default function AadhaarMasker() {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rects, setRects] = useState<{x: number, y: number, w: number, h: number}[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{x: number, y: number} | null>(null);
  const [currentRect, setCurrentRect] = useState<{x: number, y: number, w: number, h: number} | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFileSelect = async (file: File, dataUrl: string) => {
    setIsProcessing(true);
    setRects([]);
    
    try {
      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1); // Read first page
        
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({ canvasContext: context!, viewport }).promise;
        setImage(canvas.toDataURL('image/jpeg', 0.9));
      } else {
        setImage(dataUrl);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to parse file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#000';
    rects.forEach(r => {
      ctx.fillRect(r.x, r.y, r.w, r.h);
    });

    if (currentRect) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(currentRect.x, currentRect.y, currentRect.w, currentRect.h);
    }
  };

  useEffect(() => {
    if (image) {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        if (canvasRef.current) {
          const containerWidth = canvasRef.current.parentElement?.clientWidth || 800;
          const ratio = img.height / img.width;
          canvasRef.current.width = containerWidth;
          canvasRef.current.height = containerWidth * ratio;
          renderCanvas();
        }
      };
      img.src = image;
    }
  }, [image, rects, currentRect]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPos({ x, y });
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentRect({
      x: Math.min(startPos.x, x),
      y: Math.min(startPos.y, y),
      w: Math.abs(x - startPos.x),
      h: Math.abs(y - startPos.y)
    });
  };

  const handleMouseUp = () => {
    if (isDrawing && currentRect && currentRect.w > 5 && currentRect.h > 5) {
      setRects([...rects, currentRect]);
    }
    setIsDrawing(false);
    setCurrentRect(null);
    setStartPos(null);
  };

  const clearMasks = () => setRects([]);

  const downloadMaskedImage = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.95);
    downloadOrShare(dataUrl, 'masked_aadhaar.jpg');
  };

  if (isProcessing) {
    return <div className="py-20 text-center text-zinc-600 dark:text-[var(--text-muted)]">Parsing document entirely on your device...</div>;
  }

  if (!image) {
    return (
      <div className="space-y-6">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-400 text-sm">
          <strong>Privacy First:</strong> Upload an image or PDF of your Aadhaar. We will render it locally in your browser. You can draw black boxes over the first 8 digits. <strong>Nothing is ever sent to our servers.</strong>
        </div>
        <FileUploader 
          accept="image/*,application/pdf" 
          onFileSelect={handleFileSelect} 
          title="Upload Aadhaar (Image or PDF)"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Draw to Mask</h3>
          <p className="text-sm text-zinc-600 dark:text-[var(--text-muted)]">Click and drag over the first 8 digits to redact them.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={clearMasks} className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm rounded-lg transition-colors">
            Clear Masks
          </button>
          <button onClick={() => setImage(null)} className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm rounded-lg transition-colors">
            Start Over
          </button>
        </div>
      </div>

      <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-white dark:bg-black relative shadow-2xl">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full cursor-crosshair touch-none"
        />
      </div>

      <button 
        onClick={downloadMaskedImage}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
      >
        Download Secure Masked Copy
      </button>
    </div>
  );
}

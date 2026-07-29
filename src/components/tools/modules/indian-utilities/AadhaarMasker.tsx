"use client";

import React, { useState, useRef, useEffect } from 'react';
import { toast } from "react-hot-toast";
import { FileUploader } from '../../FileUploader';
import * as pdfjsLib from 'pdfjs-dist';
import { downloadOrShare } from '@/utils/nativeShare';
import { Eye, EyeOff, ShieldCheck, RotateCcw, Undo2, Download } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

const ACCENT = '#1e3a5f';

export default function AadhaarMasker() {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rects, setRects] = useState<{x: number, y: number, w: number, h: number}[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{x: number, y: number} | null>(null);
  const [currentRect, setCurrentRect] = useState<{x: number, y: number, w: number, h: number} | null>(null);
  const [showMasked, setShowMasked] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFileSelect = async (file: File, dataUrl: string) => {
    setIsProcessing(true);
    setRects([]);
    
    try {
      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);

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

    if (showMasked) {
      ctx.fillStyle = '#000';
      rects.forEach(r => {
        ctx.fillRect(r.x, r.y, r.w, r.h);
      });

      if (currentRect) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(currentRect.x, currentRect.y, currentRect.w, currentRect.h);
      }
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
  }, [image, rects, currentRect, showMasked]);

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

  const undoLastMask = () => {
    setRects(rects.slice(0, -1));
    toast.success('Last mask removed');
  };

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
        <div className="flex items-center gap-3 bg-[#1e3a5f]/10 border border-[#1e3a5f]/20 p-4 rounded-xl">
          <ShieldCheck className="w-5 h-5 text-[#1e3a5f] shrink-0" />
          <p className="text-sm text-[#1e3a5f] dark:text-[#1e3a5f] font-medium">
            <strong>Privacy First:</strong> Upload an image or PDF of your Aadhaar. We render it locally in your browser. Draw black boxes over the first 8 digits. <strong>Nothing leaves your device.</strong>
          </p>
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
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs font-bold px-3 py-1.5 rounded-full border border-[#1e3a5f]/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          Local Processing
        </span>
        <span className="inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold px-3 py-1.5 rounded-full">
          Masked Areas: {rects.length}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Draw to Mask</h3>
          <p className="text-sm text-zinc-600 dark:text-[var(--text-muted)]">Click and drag over digits to redact them.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowMasked(!showMasked)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm rounded-lg transition-colors"
          >
            {showMasked ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showMasked ? 'Hide Masks' : 'Show Masks'}
          </button>
          {rects.length > 0 && (
            <button
              onClick={undoLastMask}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm rounded-lg transition-colors"
            >
              <Undo2 className="w-4 h-4" />
              Undo
            </button>
          )}
          <button onClick={clearMasks} className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm rounded-lg transition-colors">
            <RotateCcw className="w-4 h-4" />
            Clear
          </button>
          <button onClick={() => setImage(null)} className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm rounded-lg transition-colors">
            Start Over
          </button>
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden bg-white dark:bg-black shadow-2xl" style={{ boxShadow: `0 0 0 1px ${ACCENT}33, 0 0 20px ${ACCENT}22` }}>
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
        className="w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 inline-flex items-center justify-center gap-2"
        style={{
          background: `linear-gradient(135deg, ${ACCENT}, #2d5a8a)`,
          boxShadow: `0 4px 24px ${ACCENT}44`
        }}
      >
        <Download className="w-5 h-5" />
        Download Secure Masked Copy
      </button>
    </div>
  );
}

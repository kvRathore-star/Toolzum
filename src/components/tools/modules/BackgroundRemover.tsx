"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FileUploader } from '../FileUploader';
import { Trash2, Download, Sliders, RefreshCw, Eye, Zap, MousePointer } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

export default function BackgroundRemover() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [tolerance, setTolerance] = useState<number>(30);
  const [feather, setFeather] = useState<number>(2);
  const [targetColor, setTargetColor] = useState<{ r: number, g: number, b: number } | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFileSelect = (file: File, url: string) => {
    setImageFile(file);
    setImageSrc(url);
    setTargetColor(null);
    setProcessedUrl(null);
  };

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        runMask();
      };
      img.src = imageSrc;
    }
  }, [imageSrc, tolerance, feather, targetColor]);

  useEffect(() => {
    return () => {
      if (processedUrl) URL.revokeObjectURL(processedUrl);
    };
  }, [processedUrl]);

  const runMask = () => {
    setIsProcessing(true);
    try {
      const canvas = canvasRef.current;
      const img = imageRef.current;
      if (!canvas || !img) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      if (!targetColor) return;

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      const { r: tr, g: tg, b: tb } = targetColor;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean distance in RGB color space
        const distance = Math.sqrt(
          Math.pow(r - tr, 2) +
          Math.pow(g - tg, 2) +
          Math.pow(b - tb, 2)
        );

        // Check distance against tolerance
        if (distance <= tolerance) {
          data[i + 3] = 0; // Transparent
        } else if (distance <= tolerance + feather) {
          // Apply feathering transparency gradient
          const factor = (distance - tolerance) / feather;
          data[i + 3] = Math.min(255, Math.floor(factor * 255));
        }
      }

      ctx.putImageData(imgData, 0, 0);
      
      // Save to url
      canvas.toBlob((blob) => {
        if (blob) {
          if (processedUrl) URL.revokeObjectURL(processedUrl);
          setProcessedUrl(URL.createObjectURL(blob));
        }
      }, 'image/png');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Background removal failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    // Get pixel values
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    setTargetColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
    toast.success("Background color selected! Masking colors...");
  };

  const handleDownload = () => {
    if (!processedUrl) return;
    downloadOrShare(processedUrl, `transparent-${imageFile?.name.replace(/\.[^/.]+$/, "") || 'photo'}.png`);
  };

  const reset = () => {
    setImageFile(null);
    setImageSrc(null);
    setTargetColor(null);
    setProcessedUrl(null);
  };

  if (!imageSrc) {
    return (
      <div className="space-y-6">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-400 shrink-0" />
          <span><strong>Flat Background Removal:</strong> Ideal for passport photos, headshots, and graphics with solid backdrops. Click color to key.</span>
        </div>
        <FileUploader
          accept="image/*"
          onFileSelect={handleFileSelect}
          title="Upload Photo to Remove Background"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-white/5">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{imageFile?.name}</h3>
          <p className="text-xs text-[var(--text-muted)]">Click background color inside workspace to erase it</p>
        </div>
        <button
          onClick={reset}
          className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-[var(--bg-surface)] dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-lg transition-colors cursor-pointer"
        >
          Change Photo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings panel */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-6">
          <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 text-sm uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-indigo-500" />
            Remover Settings
          </h4>

          {/* Tolerance */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[var(--text-secondary)] dark:text-zinc-400">
              <span>Tolerance (Color Range)</span>
              <span className="text-indigo-400 font-bold">{tolerance}</span>
            </div>
            <input
              type="range"
              min="5"
              max="150"
              value={tolerance}
              onChange={(e) => setTolerance(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          {/* Feathering */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[var(--text-secondary)] dark:text-zinc-400">
              <span>Edge Feathering</span>
              <span className="text-indigo-400 font-bold">{feather} px</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={feather}
              onChange={(e) => setFeather(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          {targetColor && (
            <div className="p-4 bg-zinc-50 dark:bg-black/35 rounded-xl border border-zinc-200 dark:border-white/5 space-y-2 text-xs">
              <span className="text-zinc-500 font-bold uppercase block">Selected Key Color</span>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg border border-[var(--border-subtle)] dark:border-zinc-700 shadow"
                  style={{ backgroundColor: `rgb(${targetColor.r}, ${targetColor.g}, ${targetColor.b})` }}
                />
                <span className="font-mono text-zinc-700 dark:text-zinc-300">
                  RGB({targetColor.r}, {targetColor.g}, {targetColor.b})
                </span>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={() => setTargetColor(null)}
              className="w-full py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-[var(--bg-surface)] dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Clear Selected Color
            </button>
          </div>
        </div>

        {/* Workspace */}
        <div className="lg:col-span-2 bg-zinc-950 border border-[var(--border-subtle)] rounded-2xl overflow-hidden min-h-[350px] flex flex-col justify-between p-6">
          <div className="flex-1 flex justify-center items-center relative">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="max-w-full max-h-[350px] object-contain cursor-crosshair border border-dashed border-zinc-800 rounded-xl bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:16px_16px]"
            />
          </div>

          <div className="w-full mt-6 min-h-[48px] flex justify-center">
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 py-2">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : processedUrl && targetColor ? (
              <button
                onClick={handleDownload}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Download className="w-4 h-4" />
                Download Transparent PNG
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-zinc-500 justify-center">
                <MousePointer className="w-4 h-4 text-indigo-500" />
                <span>Click background area to identify key color.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
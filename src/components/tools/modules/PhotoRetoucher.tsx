"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FileUploader } from '../FileUploader';
import { Download, RefreshCw, Sparkles, AlertTriangle, Eye, Sliders, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

export default function PhotoRetoucher() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState<number>(20);
  const [retouchMode, setRetouchMode] = useState<'smooth' | 'redeye'>('smooth');
  const [isDrawing, setIsDrawing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFileSelect = (file: File, url: string) => {
    setImageFile(file);
    setImageSrc(url);
    setProcessedUrl(null);
  };

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        initCanvas();
      };
      img.src = imageSrc;
    }
  }, [imageSrc]);

  useEffect(() => {
    return () => {
      if (processedUrl) URL.revokeObjectURL(processedUrl);
    };
  }, [processedUrl]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const containerWidth = canvas.parentElement?.clientWidth || 600;
    const ratio = img.height / img.width;
    canvas.width = containerWidth;
    canvas.height = containerWidth * ratio;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    applyRetouch(coords.x, coords.y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const coords = getCoordinates(e);
    if (!coords) return;
    applyRetouch(coords.x, coords.y);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    
    // Save state URL
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.toBlob((blob) => {
        if (blob) {
          if (processedUrl) URL.revokeObjectURL(processedUrl);
          setProcessedUrl(URL.createObjectURL(blob));
        }
      }, 'image/jpeg', 0.95);
    }
  };

  const applyRetouch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const radius = brushSize / 2;
    const startX = Math.max(0, Math.floor(x - radius));
    const startY = Math.max(0, Math.floor(y - radius));
    const width = Math.min(canvas.width - startX, brushSize);
    const height = Math.min(canvas.height - startY, brushSize);

    if (width <= 0 || height <= 0) return;

    const imgData = ctx.getImageData(startX, startY, width, height);
    const data = imgData.data;

    if (retouchMode === 'smooth') {
      // Skin smoothing: apply simple box blur/median smoothing locally
      const temp = new Uint8ClampedArray(data);
      for (let cy = 1; cy < height - 1; cy++) {
        for (let cx = 1; cx < width - 1; cx++) {
          const idx = (cy * width + cx) * 4;

          // Only smooth inside the circular brush stroke
          const dx = (startX + cx) - x;
          const dy = (startY + cy) - y;
          if (dx * dx + dy * dy <= radius * radius) {
            let rSum = 0, gSum = 0, bSum = 0, count = 0;

            // 3x3 blur kernel
            for (let ky = -1; ky <= 1; ky++) {
              for (let kx = -1; kx <= 1; kx++) {
                const nIdx = ((cy + ky) * width + (cx + kx)) * 4;
                rSum += temp[nIdx];
                gSum += temp[nIdx + 1];
                bSum += temp[nIdx + 2];
                count++;
              }
            }

            data[idx] = rSum / count;
            data[idx + 1] = gSum / count;
            data[idx + 2] = bSum / count;
          }
        }
      }
    } else {
      // Red-Eye removal: look for highly red pixels in the stroke and desaturate
      for (let cy = 0; cy < height; cy++) {
        for (let cx = 0; cx < width; cx++) {
          const idx = (cy * width + cx) * 4;

          const dx = (startX + cx) - x;
          const dy = (startY + cy) - y;
          if (dx * dx + dy * dy <= radius * radius) {
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            // Threshold: R is dominant over G and B
            if (r > 120 && r > g * 1.5 && r > b * 1.5) {
              const grey = (g + b) / 2;
              data[idx] = grey; // Reduce red to neutral grey
              data[idx + 1] = grey;
              data[idx + 2] = grey;
            }
          }
        }
      }
    }

    ctx.putImageData(imgData, startX, startY);
  };

  const handleDownload = () => {
    if (!processedUrl) return;
    downloadOrShare(processedUrl, `retouched-${imageFile?.name || 'photo.jpg'}`);
  };

  const handleReset = () => {
    initCanvas();
    setProcessedUrl(null);
  };

  if (!imageSrc) {
    return (
      <div className="space-y-6">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-400 shrink-0" />
          <span><strong>100% Client-Side Retouch:</strong> Smooth skin or correct red-eyes using local brush strokes directly inside your browser.</span>
        </div>
        <FileUploader
          accept="image/*"
          onFileSelect={handleFileSelect}
          title="Upload Photo to Retouch"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{imageFile?.name}</h3>
          <p className="text-xs text-[var(--text-muted)]">Paint directly on the image to apply retouch treatments</p>
        </div>
        <button
          onClick={() => {
            setImageFile(null);
            setImageSrc(null);
          }}
          className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs font-bold rounded-lg transition-colors cursor-pointer"
        >
          Change Photo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
          <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 text-sm uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-[var(--accent)]" />
            Retouch Options
          </h4>

          {/* Mode Selector */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-[var(--text-secondary)] block">Retouch Action</span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                onClick={() => setRetouchMode('smooth')}
                className={`py-3 rounded-xl font-bold transition-all cursor-pointer ${
                  retouchMode === 'smooth'
                    ? 'bg-[var(--accent)] text-white shadow-lg'
                    : 'bg-[var(--bg-overlay)] text-zinc-700 dark:text-[var(--text-muted)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)]'
                }`}
              >
                Skin Smoothing
              </button>
              <button
                onClick={() => setRetouchMode('redeye')}
                className={`py-3 rounded-xl font-bold transition-all cursor-pointer ${
                  retouchMode === 'redeye'
                    ? 'bg-[var(--accent)] text-white shadow-lg'
                    : 'bg-[var(--bg-overlay)] text-zinc-700 dark:text-[var(--text-muted)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)]'
                }`}
              >
                Red-Eye Remover
              </button>
            </div>
          </div>

          {/* Brush Size */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[var(--text-secondary)] dark:text-[var(--text-muted)]">
              <span>Brush Size</span>
              <span className="text-[var(--accent)] font-bold">{brushSize} px</span>
            </div>
            <input
              type="range" min="5" max="100" value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleReset}
              className="w-full py-2.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Reset Canvas
            </button>
          </div>
        </div>

        {/* Workspace */}
        <div className="lg:col-span-2 bg-zinc-950 border border-[var(--border-subtle)] rounded-2xl overflow-hidden min-h-[350px] flex flex-col justify-between p-6">
          <div className="flex-1 flex justify-center items-center relative">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="max-w-full cursor-crosshair border border-zinc-800 rounded-xl"
            />
          </div>

          <div className="w-full mt-6 h-12 flex justify-center">
            {processedUrl ? (
              <button
                onClick={handleDownload}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                Download Retouched Photo
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] justify-center">
                <span>Hold click and paint over blemishes/red eyes to retouch.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
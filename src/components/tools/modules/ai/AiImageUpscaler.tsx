"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { Eye, Download, ShieldCheck, Zap, Sliders, Maximize2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

export default function AiImageUpscaler() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [upscaledUrl, setUpscaledUrl] = useState<string | null>(null);
  const [factor, setFactor] = useState<number>(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sliderPos, setSliderPos] = useState<number>(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);

  const handleFileSelect = (file: File, url: string) => {
    setImageFile(file);
    setOriginalUrl(url);
    setUpscaledUrl(null);
  };

  useEffect(() => {
    return () => {
      if (upscaledUrl) URL.revokeObjectURL(upscaledUrl);
    };
  }, [upscaledUrl]);

  // Lanczos-3 resampling filter on canvas context
  const lanczosKernel = (x: number) => {
    if (x === 0) return 1.0;
    const absX = Math.abs(x);
    if (absX >= 3.0) return 0.0;
    const piX = Math.PI * absX;
    return (3.0 * Math.sin(piX) * Math.sin(piX / 3.0)) / (piX * piX);
  };

  const processUpscale = async () => {
    if (!imageFile || !originalUrl) return;

    setIsProcessing(true);
    try {
      const img = new Image();
      img.src = originalUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const srcW = img.naturalWidth;
      const srcH = img.naturalHeight;
      const destW = srcW * factor;
      const destH = srcH * factor;

      // Draw source to temp canvas
      const srcCanvas = document.createElement('canvas');
      srcCanvas.width = srcW;
      srcCanvas.height = srcH;
      const srcCtx = srcCanvas.getContext('2d');
      if (!srcCtx) throw new Error("Canvas support not found.");
      srcCtx.drawImage(img, 0, 0);

      const srcData = srcCtx.getImageData(0, 0, srcW, srcH).data;

      // Create output canvas
      const destCanvas = document.createElement('canvas');
      destCanvas.width = destW;
      destCanvas.height = destH;
      const destCtx = destCanvas.getContext('2d');
      if (!destCtx) throw new Error("Canvas support not found.");
      const destImgData = destCtx.createImageData(destW, destH);
      const destData = destImgData.data;

      // Lanczos scale (chunked to avoid UI freeze)
      const filterSize = 3;
      const yieldInterval = destH > 1000 ? 1 : 4;
      const totalRows = destH;
      for (let y = 0; y < destH; y++) {
        const srcY = y / factor;
        const yMin = Math.floor(srcY) - filterSize + 1;
        const yMax = Math.floor(srcY) + filterSize;

        for (let x = 0; x < destW; x++) {
          const srcX = x / factor;
          const xMin = Math.floor(srcX) - filterSize + 1;
          const xMax = Math.floor(srcX) + filterSize;

          let r = 0, g = 0, b = 0, a = 0;
          let totalWeight = 0;

          for (let sy = yMin; sy <= yMax; sy++) {
            if (sy < 0 || sy >= srcH) continue;
            const weightY = lanczosKernel(srcY - sy);

            for (let sx = xMin; sx <= xMax; sx++) {
              if (sx < 0 || sx >= srcW) continue;
              const weightX = lanczosKernel(srcX - sx);
              const weight = weightX * weightY;

              if (weight > 0) {
                const srcIdx = (sy * srcW + sx) * 4;
                r += srcData[srcIdx]! * weight;
                g += srcData[srcIdx + 1]! * weight;
                b += srcData[srcIdx + 2]! * weight;
                a += srcData[srcIdx + 3]! * weight;
                totalWeight += weight;
              }
            }
          }

          const destIdx = (y * destW + x) * 4;
          destData[destIdx] = Math.max(0, Math.min(255, r / totalWeight));
          destData[destIdx + 1] = Math.max(0, Math.min(255, g / totalWeight));
          destData[destIdx + 2] = Math.max(0, Math.min(255, b / totalWeight));
          destData[destIdx + 3] = Math.max(0, Math.min(255, a / totalWeight));
        }

        if (y % yieldInterval === 0) {
          setProgress(Math.round((y / totalRows) * 100));
          await new Promise(r => setTimeout(r, 0));
        }
      }

      destCtx.putImageData(destImgData, 0, 0);
      
      destCanvas.toBlob((blob) => {
        if (!blob) throw new Error("Failed to create blob");
        const url = URL.createObjectURL(blob);
        setUpscaledUrl(url);
        toast.success(`Upscaled to ${destW}x${destH}!`);
      }, 'image/png');

    } catch (e) {
      console.error(e);
      toast.error('Failed to upscale image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!upscaledUrl) return;
    downloadOrShare(upscaledUrl, `upscaled-${factor}x-${imageFile?.name || 'photo.png'}`);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const reset = () => {
    setImageFile(null);
    setOriginalUrl(null);
    setUpscaledUrl(null);
  };

  if (!imageFile) {
    return (
      <div className="space-y-6">
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm flex items-center gap-2">
          <Zap className="w-5 h-5 text-[var(--accent)] shrink-0" />
          <span><strong>Lanczos-3 Processing:</strong> The high-fidelity mathematical resampler scales image resolution client-side without adding pixel noise. No neural model is used — this is high-quality interpolation, not AI upscaling. Best for 2x on clean art; it cannot restore lost detail.</span>
        </div>
        <FileUploader
          accept="image/*"
          onFileSelect={handleFileSelect}
          title="Upload Photo to Scale"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--bg-overlay)] p-4 rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-[var(--text-primary)]">{imageFile.name}</h3>
          <p className="text-xs text-[var(--text-secondary)]">Original dimensions</p>
        </div>
        <button
          onClick={reset}
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
            Scale Settings
          </h4>

          <div className="space-y-3">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Upscaling Factor</span>
            <div className="grid grid-cols-3 gap-3">
              {[2, 4, 8].map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFactor(f);
                    setUpscaledUrl(null);
                  }}
                  className={`py-3 rounded-xl font-bold transition-all cursor-pointer ${
                    factor === f
                      ? 'bg-[var(--accent-ink)] text-white shadow-lg'
                      : 'bg-[var(--bg-overlay)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)] dark:hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)]'
                  }`}
                >
                  {f}x
                </button>
              ))}
            </div>
          </div>

          {isProcessing && progress > 0 && (
            <div className="w-full bg-[var(--bg-overlay)] rounded-full h-1.5 mb-2">
              <div className="bg-[var(--accent-ink)] h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          )}
          <button
            onClick={processUpscale}
            disabled={isProcessing}
            className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] disabled:bg-[var(--accent-ink)] text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            {isProcessing ? `Upscaling... ${progress}%` : 'Enhance & Scale'}
          </button>
        </div>

        {/* Workspace */}
        <div className="lg:col-span-2 bg-zinc-950 border border-[var(--border-subtle)] rounded-2xl overflow-hidden min-h-[350px] flex flex-col justify-between p-6">
          <div className="flex-1 flex justify-center items-center">
            {upscaledUrl ? (
              <div
                ref={containerRef}
                role="slider" tabIndex={0} aria-label="Original versus upscaled comparison" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(sliderPos)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft') { e.preventDefault(); setSliderPos((p) => Math.max(0, p - 5)); }
                  else if (e.key === 'ArrowRight') { e.preventDefault(); setSliderPos((p) => Math.min(100, p + 5)); }
                }}
                onMouseMove={handleMouseMove}
                onMouseDown={() => setIsResizing(true)}
                onMouseUp={() => setIsResizing(false)}
                onMouseLeave={() => setIsResizing(false)}
                className="relative select-none w-full max-w-[450px] aspect-square border border-zinc-800 rounded-xl overflow-hidden bg-black cursor-ew-resize"
              >
                {/* Right / Upscaled */}
<img
  src={upscaledUrl}
  alt="Processed result"
  
  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
/>

                {/* Left / Original */}
                <div
                  className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none"
                  style={{ width: `${sliderPos}%` }}
                >
<img
  src={originalUrl || ''}
  alt="Uploaded image preview"
  
  className="absolute inset-0 w-[450px] h-[450px] max-w-none object-cover pointer-events-none"
/>
                </div>

                {/* Drag line */}
                <div
                  className="absolute inset-y-0 w-1 bg-white pointer-events-none shadow"
                  style={{ left: `${sliderPos}%` }}
                />
              </div>
            ) : (
              <div className="relative border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-black flex justify-center items-center h-[280px] w-full max-w-[450px]">
                {originalUrl && (
<img
  src={originalUrl}
  alt="Uploaded image preview"
  
  className="max-w-full max-h-full object-contain"
/>
                )}
              </div>
            )}
          </div>

          <div className="w-full mt-6 h-12 flex justify-center">
            {upscaledUrl ? (
              <button
                onClick={handleDownload}
                className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Download className="w-4 h-4" />
                Download Upscaled Photo
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] justify-center">
                <Eye className="w-4 h-4" />
                <span>Adjust settings and enhance to trigger slider comparison.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
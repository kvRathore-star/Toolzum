"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { EmptyState } from '@/components/EmptyState';

type Mode = 'sharpen' | 'blur' | 'motion-blur';
type Format = 'image/jpeg' | 'image/png' | 'image/webp';

function gaussianKernel(size: number): number[] {
  const sigma = size / 6;
  const kernel: number[] = [];
  let sum = 0;
  const center = Math.floor(size / 2);
  for (let i = 0; i < size; i++) {
    const x = i - center;
    const val = Math.exp(-(x * x) / (2 * sigma * sigma));
    kernel.push(val);
    sum += val;
  }
  return kernel.map(v => v / sum);
}

function applyConvolution(
  imageData: ImageData,
  kernel: number[],
  kernelSize: number
): ImageData {
  const { width, height, data } = imageData;
  const output = new Uint8ClampedArray(data);
  const half = Math.floor(kernelSize / 2);

  for (let y = half; y < height - half; y++) {
    for (let x = half; x < width - half; x++) {
      let r = 0, g = 0, b = 0;
      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const idx = ((y + ky - half) * width + (x + kx - half)) * 4;
          const kidx = ky * kernelSize + kx;
          const wt = kernel[kidx] ?? 0;
          r += (data[idx] ?? 0) * wt;
          g += (data[idx + 1] ?? 0) * wt;
          b += (data[idx + 2] ?? 0) * wt;
        }
      }
      const oidx = (y * width + x) * 4;
      output[oidx] = Math.max(0, Math.min(255, r));
      output[oidx + 1] = Math.max(0, Math.min(255, g));
      output[oidx + 2] = Math.max(0, Math.min(255, b));
      output[oidx + 3] = data[oidx + 3] ?? 0;
    }
  }
  return new ImageData(output, width, height);
}

function buildMotionBlurKernel(angleDeg: number, size: number): number[] {
  const kernel = new Array(size * size).fill(0);
  const rad = (angleDeg * Math.PI) / 180;
  const cx = Math.floor(size / 2);
  const cy = Math.floor(size / 2);

  for (let i = 0; i < size; i++) {
    const t = (i / (size - 1)) - 0.5;
    const dx = Math.round(t * Math.cos(rad));
    const dy = Math.round(t * Math.sin(rad));
    const x = cx + dx;
    const y = cy + dy;
    if (x >= 0 && x < size && y >= 0 && y < size) {
      kernel[y * size + x] += 1;
    }
  }
  const sum = kernel.reduce((a, b) => a + b, 0);
  return sum ? kernel.map(v => v / sum) : kernel;
}

function buildSharpenKernel(intensity: number): number[] {
  const factor = Math.max(0.5, intensity);
  return [0, -factor, 0, -factor, 1 + 4 * factor, -factor, 0, -factor, 0];
}

function buildBlurKernel(size: number): number[] {
  const k1d = gaussianKernel(size);
  const kernel: number[] = [];
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      kernel.push((k1d[i] ?? 0) * (k1d[j] ?? 0));
    }
  }
  return kernel;
}

function processImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  mode: Mode,
  intensity: number,
  angle: number
): string {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  ctx.canvas.width = w;
  ctx.canvas.height = h;
  ctx.drawImage(img, 0, 0, w, h);

  let imageData = ctx.getImageData(0, 0, w, h);

  if (mode === 'sharpen') {
    const kernel = buildSharpenKernel(intensity);
    imageData = applyConvolution(imageData, kernel, 3);
  } else if (mode === 'blur') {
    const passes = Math.min(Math.ceil(intensity / 2), 5);
    const size = intensity > 5 ? 5 : 3;
    const kernel = buildBlurKernel(size);
    for (let p = 0; p < passes; p++) {
      imageData = applyConvolution(imageData, kernel, size);
    }
  } else if (mode === 'motion-blur') {
    const kernelSize = Math.min(Math.ceil(intensity * 1.5), 15);
    const kernel = buildMotionBlurKernel(angle, kernelSize);
    imageData = applyConvolution(imageData, kernel, kernelSize);
  }

  ctx.putImageData(imageData, 0, 0);
  return ctx.canvas.toDataURL('image/png');
}

export default function UnblurSharpen() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>('sharpen');
  const [intensity, setIntensity] = useState(5);
  const [angle, setAngle] = useState(0);
  const [format, setFormat] = useState<Format>('image/jpeg');
  const [quality, setQuality] = useState(0.92);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fullCanvasRef = useRef<HTMLCanvasElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [outputUrl, previewUrl]);

  const handleFileSelect = (file: File, dataUrl: string) => {
    setSourceFile(file);
    setSourceImage(dataUrl);
    setOutputUrl(null);
    setPreviewUrl(null);
    setShowOriginal(false);
    setIntensity(5);
    setAngle(0);
    setMode('sharpen');
    setQuality(0.92);
  };

  const clearAll = () => {
    setSourceFile(null);
    setSourceImage(null);
    setOutputUrl(null);
    setPreviewUrl(null);
  };

  const generatePreview = () => {
    if (!sourceImage || !previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const maxDim = 400;
      let pw = img.naturalWidth;
      let ph = img.naturalHeight;
      if (pw > maxDim || ph > maxDim) {
        const scale = Math.min(maxDim / pw, maxDim / ph);
        pw = Math.round(pw * scale);
        ph = Math.round(ph * scale);
      }
      canvas.width = pw;
      canvas.height = ph;
      ctx.drawImage(img, 0, 0, pw, ph);

      const previewData = ctx.getImageData(0, 0, pw, ph);

      let processed: ImageData;
      if (mode === 'sharpen') {
        const kernel = buildSharpenKernel(intensity);
        processed = applyConvolution(previewData, kernel, 3);
      } else if (mode === 'blur') {
        const passes = Math.min(Math.ceil(intensity / 2), 5);
        const size = intensity > 5 ? 5 : 3;
        const kernel = buildBlurKernel(size);
        processed = previewData;
        for (let p = 0; p < passes; p++) {
          processed = applyConvolution(processed, kernel, size);
        }
      } else {
        const kernelSize = Math.min(Math.ceil(intensity * 1.5), 15);
        const kernel = buildMotionBlurKernel(angle, kernelSize);
        processed = applyConvolution(previewData, kernel, kernelSize);
      }

      ctx.putImageData(processed, 0, 0);
      const url = canvas.toDataURL('image/png');
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(url);
    };
    img.src = sourceImage;
  };

  useEffect(() => {
    if (!sourceImage) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(generatePreview, 150);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [sourceImage, mode, intensity, angle]);

  const processFull = async () => {
    if (!sourceImage || !fullCanvasRef.current) return;
    setIsProcessing(true);
    try {
      const canvas = fullCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');

      const img = new Image();
      img.src = sourceImage;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
      });

      const resultDataUrl = processImage(ctx, img, mode, intensity, angle);

      const res = await fetch(resultDataUrl);
      const blob = await res.blob();
      const mimeMap: Record<Format, string> = {
        'image/jpeg': 'image/jpeg',
        'image/png': 'image/png',
        'image/webp': 'image/webp',
      };

      const outCanvas = document.createElement('canvas');
      outCanvas.width = img.naturalWidth;
      outCanvas.height = img.naturalHeight;
      const outCtx = outCanvas.getContext('2d');
      if (!outCtx) throw new Error('Output canvas context unavailable');

      const outImg = new Image();
      outImg.src = resultDataUrl;
      await new Promise<void>((resolve, reject) => {
        outImg.onload = () => resolve();
        outImg.onerror = () => reject(new Error('Failed to load processed image'));
      });
      outCtx.drawImage(outImg, 0, 0);
      const finalDataUrl = outCanvas.toDataURL(mimeMap[format], quality);

      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(finalDataUrl);
      toast.success('Image processed successfully!');
    } catch (e) {
      toast.error('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatLabel: Record<Format, string> = {
    'image/jpeg': 'JPG',
    'image/png': 'PNG',
    'image/webp': 'WebP',
  };

  const extensionMap: Record<Format, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };

  if (!sourceImage) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm">
          <strong>Unblur & Sharpen:</strong> Fix blurry photos or add artistic blur effects using on-device canvas convolution. No uploads needed.
        </div>
        <FileUploader
          accept="image/*"
          onFileSelect={handleFileSelect}
          title="Upload Image to Sharpen or Blur"
          subtitle="Drag & drop your photo here"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--bg-overlay)] p-4 rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-[var(--text-primary)]">{sourceFile?.name || 'Image'}</h3>
          <p className="text-[var(--text-secondary)] text-sm">Canvas-based convolution processing — all in-browser</p>
        </div>
        <button
          onClick={clearAll}
          className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-bold rounded-lg transition-colors cursor-pointer"
        >
          Change Image
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 h-fit">
          <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">Settings</h4>

          <div className="space-y-2">
            <label className="text-xs text-[var(--text-secondary)] font-medium">Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { key: 'sharpen', label: 'Sharpen' },
                { key: 'blur', label: 'Gaussian Blur' },
                { key: 'motion-blur', label: 'Motion Blur' },
              ] as { key: Mode; label: string }[]).map(opt => (
                <button
                  key={opt.key}
                  onClick={() => { setMode(opt.key); setOutputUrl(null); }}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    mode === opt.key
                      ? 'bg-[var(--accent-ink)] border-[var(--accent-ink)] text-white shadow-md'
                      : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[var(--text-secondary)]">
              <span>Intensity</span>
              <span className="text-[var(--accent)] font-bold">{intensity}</span>
            </div>
            <input aria-label="Intensity"
              type="range" min="1" max="10" value={intensity}
              onChange={e => setIntensity(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          {mode === 'motion-blur' && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                <span>Angle</span>
                <span className="text-[var(--accent)] font-bold">{angle}°</span>
              </div>
              <input aria-label="Angle"
                type="range" min="0" max="360" value={angle}
                onChange={e => setAngle(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs text-[var(--text-secondary)] font-medium">Output Format</label>
            <div className="grid grid-cols-3 gap-2">
              {(['image/jpeg', 'image/png', 'image/webp'] as Format[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    format === f
                      ? 'bg-[var(--accent-ink)] border-[var(--accent-ink)] text-white shadow-md'
                      : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
                  }`}
                >
                  {formatLabel[f]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[var(--text-secondary)]">
              <span>Quality</span>
              <span className="text-[var(--accent)] font-bold">{Math.round(quality * 100)}%</span>
            </div>
            <input aria-label="Output Quality"
              type="range" min="0.1" max="1" step="0.01" value={quality}
              onChange={e => setQuality(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </div>

          <button
            onClick={processFull}
            disabled={isProcessing}
            className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Processing...
              </>
            ) : (
              'Process Full Resolution'
            )}
          </button>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden min-h-[400px] flex flex-col items-center justify-center p-4 relative">
            {showOriginal ? (
              <img
                src={sourceImage}
                alt="Original"
                className="max-w-full max-h-[400px] object-contain rounded-lg"
              />
            ) : (
              previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-[400px] object-contain rounded-lg"
                />
              )
            )}
            {!previewUrl && !showOriginal && (
              <p className="text-[var(--text-secondary)] text-sm">Adjust settings to generate preview</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-[var(--text-muted)] cursor-pointer">
              <input
                type="checkbox"
                checked={showOriginal}
                onChange={e => setShowOriginal(e.target.checked)}
                className="accent-blue-500"
              />
              Show Original
            </label>

            <div className="flex gap-2">
              {outputUrl ? (
                <button
                  onClick={() => {
                    const ext = extensionMap[format];
                    downloadOrShare(outputUrl, `processed_${sourceFile?.name?.replace(/\.[^/.]+$/, '') || 'image'}.${ext}`);
                  }}
                  className="bg-emerald-700 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all active:scale-95 cursor-pointer shadow-lg flex items-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download
                </button>
              ) : (
                <div className="border border-dashed border-[var(--border-subtle)] rounded-2xl">
                  <EmptyState
                    title="Processed image will appear here"
                    message="Upload an image above to enhance."
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <canvas ref={previewCanvasRef} className="hidden" />
      <canvas ref={fullCanvasRef} className="hidden" />
    </div>
  );
}

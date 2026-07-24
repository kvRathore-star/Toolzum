"use client";

import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FileUploader } from '../FileUploader';
import { Download, RefreshCw, Upload, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { downloadOrShare } from '@/utils/nativeShare';

type Method = 'chroma' | 'edge';

export default function BackgroundRemover() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [method, setMethod] = useState<Method>('chroma');
  const [tolerance, setTolerance] = useState(60);
  const [format, setFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);
  const resultImgRef = useRef<HTMLImageElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const handleFileSelect = (file: File, url: string) => {
    setImageFile(file);
    setImageSrc(url);
    setResultUrl(null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      if (originalCanvasRef.current) {
        const canvas = originalCanvasRef.current;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.drawImage(img, 0, 0);
      }
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const rgbDist = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) =>
    Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);

  const isGreenish = (r: number, g: number, b: number, tol: number) => {
    const greenDist = rgbDist(r, g, b, 0, 255, 0);
    const whiteDist = rgbDist(r, g, b, 255, 255, 255);
    return greenDist < tol && greenDist < whiteDist;
  };

  const chromaKey = (data: Uint8ClampedArray, width: number, height: number, tol: number) => {
    const len = data.length;
    for (let i = 0; i < len; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (isGreenish(r, g, b, tol)) {
        data[i + 3] = 0;
      }
    }
  };

  const edgeDetect = (data: Uint8ClampedArray, width: number, height: number) => {
    const gray = new Float32Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        gray[y * width + x] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      }
    }

    const edges = new Float32Array(width * height);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const gx =
          -1 * gray[(y - 1) * width + (x - 1)] +
          1 * gray[(y - 1) * width + (x + 1)] +
          -2 * gray[y * width + (x - 1)] +
          2 * gray[y * width + (x + 1)] +
          -1 * gray[(y + 1) * width + (x - 1)] +
          1 * gray[(y + 1) * width + (x + 1)];
        const gy =
          -1 * gray[(y - 1) * width + (x - 1)] +
          -2 * gray[(y - 1) * width + x] +
          -1 * gray[(y - 1) * width + (x + 1)] +
          1 * gray[(y + 1) * width + (x - 1)] +
          2 * gray[(y + 1) * width + x] +
          1 * gray[(y + 1) * width + (x + 1)];
        edges[y * width + x] = Math.sqrt(gx * gx + gy * gy);
      }
    }

    const threshold = 40;
    const bgSamples = new Set<number>();
    const queue: number[] = [];

    const corners = [0, width - 1, (height - 1) * width, height * width - 1];
    for (const c of corners) {
      const y = Math.floor(c / width), x = c % width;
      if (edges[c] < threshold && !bgSamples.has(c)) {
        bgSamples.add(c);
        queue.push(c);
      }
    }

    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    while (queue.length > 0) {
      const idx = queue.shift()!;
      const cy = Math.floor(idx / width), cx = idx % width;
      for (const [dx, dy] of dirs) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const nIdx = ny * width + nx;
        if (!bgSamples.has(nIdx) && edges[nIdx] < threshold) {
          bgSamples.add(nIdx);
          queue.push(nIdx);
        }
      }
    }

    for (const idx of bgSamples) {
      data[idx * 4 + 3] = 0;
    }
  };

  const processImage = () => {
    const img = imgRef.current;
    if (!img) return;
    setIsProcessing(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) { toast.error('Canvas context not available.'); setIsProcessing(false); return; }
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      if (method === 'chroma') {
        chromaKey(data, canvas.width, canvas.height, tolerance);
      } else {
        edgeDetect(data, canvas.width, canvas.height);
      }

      ctx.putImageData(imageData, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) { toast.error('Failed to generate result image.'); setIsProcessing(false); return; }
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        const url = URL.createObjectURL(blob);
        setResultUrl(url);
        toast.success('Background removed!');
        setIsProcessing(false);
      }, 'image/png');
    } catch (e) {
      console.error(e);
      toast.error('Processing failed.');
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!resultUrl || !resultCanvasRef.current) return;
    const img = new Image();
    img.onload = () => {
      resultImgRef.current = img;
      const canvas = resultCanvasRef.current!;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = resultUrl;
  }, [resultUrl]);

  const handleDownload = () => {
    if (!resultUrl) return;
    if (format === 'image/png') {
      downloadOrShare(resultUrl, `bg-removed-${imageFile?.name?.replace(/\.[^.]+$/, '') || 'image'}.png`);
      return;
    }
    const canvas = resultCanvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) { toast.error('Failed to generate download.'); return; }
      const url = URL.createObjectURL(blob);
      downloadOrShare(url, `bg-removed-${imageFile?.name?.replace(/\.[^.]+$/, '') || 'image'}.jpg`);
    }, 'image/jpeg', 0.92);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((z) => Math.max(0.5, Math.min(5, z + delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || zoom <= 1) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  };

  const handleMouseUp = () => setIsPanning(false);

  if (!imageSrc) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm flex items-center gap-2">
          <Upload className="w-5 h-5 shrink-0" />
          <span><strong>100% Client-Side:</strong> Remove backgrounds using chroma-key or edge detection. All processing happens in your browser.</span>
        </div>
        <FileUploader
          accept="image/*"
          onFileSelect={handleFileSelect}
          title="Upload Image to Remove Background"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[280px] sm:max-w-md">{imageFile?.name}</h3>
          <p className="text-xs text-[var(--text-muted)]">{imgRef.current ? `${imgRef.current.naturalWidth} × ${imgRef.current.naturalHeight}px` : ''}</p>
        </div>
        <button
          onClick={() => { setImageFile(null); setImageSrc(null); setResultUrl(null); }}
          className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs font-bold rounded-lg transition-colors cursor-pointer"
        >
          Change Image
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 lg:col-span-1">
          <h4 className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-wider border-b border-[var(--border-subtle)] pb-2">
            Settings
          </h4>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">Method</label>
            <div className="flex gap-2">
              <button
                onClick={() => setMethod('chroma')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${method === 'chroma' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'}`}
              >
                Chroma Key
              </button>
              <button
                onClick={() => setMethod('edge')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${method === 'edge' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'}`}
              >
                Edge Detect
              </button>
            </div>
          </div>

          {method === 'chroma' && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                <span>Tolerance</span>
                <span className="text-[var(--accent)] font-bold">{tolerance}</span>
              </div>
              <input
                type="range"
                min={10}
                max={150}
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <p className="text-[10px] text-[var(--text-muted)]">Lower = stricter green detection</p>
            </div>
          )}

          <button
            onClick={processImage}
            disabled={isProcessing}
            className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:bg-[var(--accent)] text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg text-xs"
          >
            {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {isProcessing ? 'Processing...' : 'Remove Background'}
          </button>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-zinc-950 border border-[var(--border-subtle)] rounded-2xl overflow-hidden p-3">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2">Original</p>
              <div className="flex justify-center">
                <canvas ref={originalCanvasRef} className="max-w-full h-auto rounded-lg" />
              </div>
            </div>

            <div className="border border-[var(--border-subtle)] rounded-2xl overflow-hidden p-3">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2">Result</p>
              <div
                className="relative flex justify-center overflow-hidden rounded-lg"
                style={{
                  backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                }}
              >
                {resultUrl ? (
                  <div
                    style={{
                      transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                      cursor: zoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default',
                    }}
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <canvas ref={resultCanvasRef} className="max-w-full h-auto" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 text-[var(--text-muted)] text-xs">
                    Process the image to see result
                  </div>
                )}
              </div>
              {resultUrl && (
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                      className="p-1 rounded-md bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] cursor-pointer"
                    >
                      <ZoomOut className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                    </button>
                    <span className="text-[10px] text-[var(--text-muted)] w-8 text-center">{Math.round(zoom * 100)}%</span>
                    <button
                      onClick={() => setZoom((z) => Math.min(5, z + 0.25))}
                      className="p-1 rounded-md bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] cursor-pointer"
                    >
                      <ZoomIn className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                    </button>
                  </div>
                  <button
                    onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                    className="p-1 rounded-md bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] cursor-pointer"
                  >
                    <Move className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {resultUrl && (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Format:</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormat('image/png')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${format === 'image/png' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'}`}
                  >
                    PNG (transparent)
                  </button>
                  <button
                    onClick={() => setFormat('image/jpeg')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${format === 'image/jpeg' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'}`}
                  >
                    JPEG (white bg)
                  </button>
                </div>
              </div>
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg text-xs"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

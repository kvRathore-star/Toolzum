"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Upload, Download, RotateCcw, ImageIcon, GripVertical } from 'lucide-react';

type FilterId =
  | 'grayscale' | 'sepia' | 'invert' | 'blur' | 'sharpen'
  | 'emboss' | 'pixelate' | 'vintage' | 'cool' | 'warm';

interface Adjustments {
  brightness: number;
  saturation: number;
  contrast: number;
  hue: number;
  opacity: number;
}

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'grayscale', label: 'Grayscale' },
  { id: 'sepia', label: 'Sepia' },
  { id: 'invert', label: 'Invert' },
  { id: 'blur', label: 'Blur' },
  { id: 'sharpen', label: 'Sharpen' },
  { id: 'emboss', label: 'Emboss' },
  { id: 'pixelate', label: 'Pixelate' },
  { id: 'vintage', label: 'Vintage' },
  { id: 'cool', label: 'Cool' },
  { id: 'warm', label: 'Warm' },
];

const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 0,
  saturation: 0,
  contrast: 0,
  hue: 0,
  opacity: 100,
};

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn;
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h = 0;
  if (mx === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (mx === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const hue2rgb = (p: number, q: number, t: number) => {
    const tt = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgb(p, q, h + 1 / 3) * 255, hue2rgb(p, q, h) * 255, hue2rgb(p, q, h - 1 / 3) * 255];
}

function applyGrayscale(d: Uint8ClampedArray): void {
  for (let i = 0; i < d.length; i += 4) {
    const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    d[i] = d[i + 1] = d[i + 2] = g;
  }
}

function applySepia(d: Uint8ClampedArray): void {
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    d[i] = clamp(0.393 * r + 0.769 * g + 0.189 * b, 0, 255);
    d[i + 1] = clamp(0.349 * r + 0.686 * g + 0.168 * b, 0, 255);
    d[i + 2] = clamp(0.272 * r + 0.534 * g + 0.131 * b, 0, 255);
  }
}

function applyInvert(d: Uint8ClampedArray): void {
  for (let i = 0; i < d.length; i += 4) {
    d[i] = 255 - d[i];
    d[i + 1] = 255 - d[i + 1];
    d[i + 2] = 255 - d[i + 2];
  }
}

function applyConvolution(
  src: Uint8ClampedArray,
  dst: Uint8ClampedArray,
  w: number,
  h: number,
  kernel: number[][],
  divisor: number
): void {
  const half = Math.floor(kernel.length / 2);
  for (let y = half; y < h - half; y++) {
    for (let x = half; x < w - half; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let ky = 0; ky < kernel.length; ky++) {
        for (let kx = 0; kx < kernel.length; kx++) {
          const idx = ((y + ky - half) * w + (x + kx - half)) * 4;
          const k = kernel[ky][kx];
          r += src[idx] * k;
          g += src[idx + 1] * k;
          b += src[idx + 2] * k;
          a += src[idx + 3] * k;
        }
      }
      const oi = (y * w + x) * 4;
      dst[oi] = clamp(Math.round(r / divisor), 0, 255);
      dst[oi + 1] = clamp(Math.round(g / divisor), 0, 255);
      dst[oi + 2] = clamp(Math.round(b / divisor), 0, 255);
      dst[oi + 3] = clamp(Math.round(a / divisor), 0, 255);
    }
  }
}

function applyPixelate(d: Uint8ClampedArray, w: number, h: number, bs: number): void {
  for (let y = 0; y < h; y += bs) {
    for (let x = 0; x < w; x += bs) {
      let r = 0, g = 0, b = 0, a = 0, count = 0;
      const ey = Math.min(y + bs, h), ex = Math.min(x + bs, w);
      for (let py = y; py < ey; py++) {
        for (let px = x; px < ex; px++) {
          const idx = (py * w + px) * 4;
          r += d[idx]; g += d[idx + 1]; b += d[idx + 2]; a += d[idx + 3];
          count++;
        }
      }
      r = Math.round(r / count); g = Math.round(g / count);
      b = Math.round(b / count); a = Math.round(a / count);
      for (let py = y; py < ey; py++) {
        for (let px = x; px < ex; px++) {
          const idx = (py * w + px) * 4;
          d[idx] = r; d[idx + 1] = g; d[idx + 2] = b; d[idx + 3] = a;
        }
      }
    }
  }
}

function applyVintage(d: Uint8ClampedArray, w: number, h: number): void {
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    d[i] = clamp(0.393 * r + 0.769 * g + 0.189 * b, 0, 255);
    d[i + 1] = clamp(0.349 * r + 0.686 * g + 0.168 * b, 0, 255);
    d[i + 2] = clamp(0.272 * r + 0.534 * g + 0.131 * b, 0, 255);
  }
  const fade = 20;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = clamp(d[i] * 0.9 + fade, 0, 255);
    d[i + 1] = clamp(d[i + 1] * 0.85 + fade, 0, 255);
    d[i + 2] = clamp(d[i + 2] * 0.8 + fade, 0, 255);
  }
  const cx = w / 2, cy = h / 2, maxDist = Math.sqrt(cx * cx + cy * cy);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / maxDist;
      const vig = 1 - dist * 0.4;
      d[idx] = clamp(d[idx] * vig, 0, 255);
      d[idx + 1] = clamp(d[idx + 1] * vig, 0, 255);
      d[idx + 2] = clamp(d[idx + 2] * vig, 0, 255);
    }
  }
}

function applyCool(d: Uint8ClampedArray): void {
  for (let i = 0; i < d.length; i += 4) {
    d[i] = clamp(d[i] * 0.8, 0, 255);
    d[i + 2] = clamp(d[i + 2] * 1.2, 0, 255);
  }
}

function applyWarm(d: Uint8ClampedArray): void {
  for (let i = 0; i < d.length; i += 4) {
    d[i] = clamp(d[i] * 1.2, 0, 255);
    d[i + 2] = clamp(d[i + 2] * 0.8, 0, 255);
  }
}

function applyPreset(
  d: Uint8ClampedArray,
  w: number,
  h: number,
  filter: FilterId | null
): void {
  if (!filter) return;
  switch (filter) {
    case 'grayscale': applyGrayscale(d); break;
    case 'sepia': applySepia(d); break;
    case 'invert': applyInvert(d); break;
    case 'blur': {
      const copy = new Uint8ClampedArray(d);
      applyConvolution(copy, d, w, h, [[1, 2, 1], [2, 4, 2], [1, 2, 1]], 16);
      break;
    }
    case 'sharpen': {
      const copy = new Uint8ClampedArray(d);
      applyConvolution(copy, d, w, h, [[0, -1, 0], [-1, 5, -1], [0, -1, 0]], 1);
      break;
    }
    case 'emboss': {
      const copy = new Uint8ClampedArray(d);
      applyConvolution(copy, d, w, h, [[-2, -1, 0], [-1, 1, 1], [0, 1, 2]], 1);
      break;
    }
    case 'pixelate': applyPixelate(d, w, h, 8); break;
    case 'vintage': applyVintage(d, w, h); break;
    case 'cool': applyCool(d); break;
    case 'warm': applyWarm(d); break;
  }
}

function applyAdjustments(
  d: Uint8ClampedArray,
  adj: Adjustments
): void {
  const brightMap = adj.brightness * 2.55;
  const contrastFactor = 1 + adj.contrast / 100;
  const satFactor = 1 + adj.saturation / 100;
  const hueRotate = adj.hue / 360;
  const alphaVal = Math.round((adj.opacity / 100) * 255);

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i], g = d[i + 1], b = d[i + 2];

    r = clamp(r + brightMap, 0, 255);
    g = clamp(g + brightMap, 0, 255);
    b = clamp(b + brightMap, 0, 255);

    r = clamp((r - 128) * contrastFactor + 128, 0, 255);
    g = clamp((g - 128) * contrastFactor + 128, 0, 255);
    b = clamp((b - 128) * contrastFactor + 128, 0, 255);

    if (satFactor !== 1 || hueRotate !== 0) {
      const [h, s, l] = rgbToHsl(r, g, b);
      const ns = clamp(s * satFactor, 0, 1);
      const nh = (h + hueRotate) % 1;
      [r, g, b] = hslToRgb(nh, ns, l);
    }

    d[i] = clamp(Math.round(r), 0, 255);
    d[i + 1] = clamp(Math.round(g), 0, 255);
    d[i + 2] = clamp(Math.round(b), 0, 255);
    d[i + 3] = clamp(d[i + 3], 0, alphaVal);
  }
}

function processImage(
  img: HTMLImageElement,
  filter: FilterId | null,
  adj: Adjustments
): string {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  applyPreset(imageData.data, canvas.width, canvas.height, filter);
  applyAdjustments(imageData.data, adj);
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

export function ImageEffectsStudio() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [processedUrl, setProcessedUrl] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterId | null>(null);
  const [adjustments, setAdjustments] = useState<Adjustments>(DEFAULT_ADJUSTMENTS);
  const [splitPos, setSplitPos] = useState(50);
  const [downloadFormat, setDownloadFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
  const [jpegQuality, setJpegQuality] = useState(0.92);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (processedUrl.startsWith('blob:')) URL.revokeObjectURL(processedUrl);
    };
  }, [originalUrl, processedUrl]);

  const renderProcessed = useCallback(
    (img: HTMLImageElement, filter: FilterId | null, adj: Adjustments) => {
      const url = processImage(img, filter, adj);
      setProcessedUrl(url);
    },
    []
  );

  useEffect(() => {
    if (imgRef.current) {
      renderProcessed(imgRef.current, activeFilter, adjustments);
    }
  }, [activeFilter, adjustments, renderProcessed]);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }
    setFile(f);
    setActiveFilter(null);
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setSplitPos(50);

    const url = URL.createObjectURL(f);
    setOriginalUrl(url);

    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      renderProcessed(img, null, DEFAULT_ADJUSTMENTS);
      toast.success(`Loaded ${f.name}`);
    };
    img.onerror = () => {
      toast.error('Failed to decode image. Try a different file.');
      URL.revokeObjectURL(url);
      setOriginalUrl('');
      setFile(null);
    };
    img.src = url;
  }, [renderProcessed]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
      e.target.value = '';
    },
    [handleFile]
  );

  const setAdjustment = useCallback((key: keyof Adjustments, value: number) => {
    setAdjustments(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleReset = () => {
    setActiveFilter(null);
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setSplitPos(50);
    toast.success('All effects reset');
  };

  const handleSplitMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const onMove = (ev: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      setSplitPos(clamp(pct, 2, 98));
    };

    const onUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, []);

  const handleSplitTouchStart = useCallback((e: React.TouchEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const onMove = (ev: TouchEvent) => {
      const pct = ((ev.touches[0].clientX - rect.left) / rect.width) * 100;
      setSplitPos(clamp(pct, 2, 98));
    };

    const onEnd = () => {
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    };

    document.addEventListener('touchmove', onMove);
    document.addEventListener('touchend', onEnd);
  }, []);

  const handleDownload = () => {
    if (!processedUrl) return;
    const canvas = document.createElement('canvas');
    const img = imgRef.current;
    if (!img) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;

    const tempImg = new Image();
    tempImg.onload = () => {
      ctx.drawImage(tempImg, 0, 0);
      const ext = downloadFormat === 'image/png' ? 'png' : 'jpg';
      const q = downloadFormat === 'image/jpeg' ? jpegQuality : undefined;
      canvas.toBlob(
        blob => {
          if (!blob) {
            toast.error('Failed to generate image');
            return;
          }
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `${file?.name.replace(/\.[^.]+$/, '') || 'image'}-edited.${ext}`;
          link.click();
          URL.revokeObjectURL(link.href);
          toast.success('Download started!');
        },
        downloadFormat,
        q
      );
    };
    tempImg.src = processedUrl;
  };

  // ─── Empty State ───────────────────────────────────────────

  if (!file) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-2xl p-16 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors bg-zinc-50 dark:bg-zinc-900/50"
        >
          <Upload className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-500 mb-4" />
          <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
            Drop an image here or click to browse
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Supports all common image formats
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      </div>
    );
  }

  // ─── Editor State ──────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700/50 rounded-xl px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <ImageIcon className="h-5 w-5 text-blue-500 shrink-0" />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">
            {file.name}
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">
            {formatSize(file.size)}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Change
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* Filter Presets */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
          Preset Filters
        </p>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(prev => (prev === f.id ? null : f.id))}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                activeFilter === f.id
                  ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Adjustments */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {([
          { key: 'brightness', label: 'Brightness', min: -100, max: 100 },
          { key: 'contrast', label: 'Contrast', min: -100, max: 100 },
          { key: 'saturation', label: 'Saturation', min: -100, max: 100 },
          { key: 'hue', label: 'Hue', min: 0, max: 360 },
          { key: 'opacity', label: 'Opacity', min: 0, max: 100 },
        ] as const).map(({ key, label, min, max }) => (
          <div key={key}>
            <label className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              <span>{label}</span>
              <span>{adjustments[key]}</span>
            </label>
            <input
              type="range"
              min={min}
              max={max}
              value={adjustments[key]}
              onChange={e => setAdjustment(key, Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>
        ))}
      </div>

      {/* Before / After Preview */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
          Before / After
        </p>
        <div
          ref={containerRef}
          className="relative rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 select-none"
        >
          <img
            src={originalUrl}
            alt="Original"
            className="w-full h-auto block"
            draggable={false}
          />
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ left: `${splitPos}%`, right: 0, top: 0, bottom: 0 }}
          >
            <img
              src={processedUrl}
              alt="Processed"
              className="block"
              style={{
                width: `${100 / (1 - splitPos / 100)}%`,
                height: '100%',
                objectFit: 'cover',
                objectPosition: `${-splitPos}% 0`,
              }}
              draggable={false}
            />
          </div>
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-md cursor-col-resize z-10"
            style={{ left: `${splitPos}%` }}
            onMouseDown={handleSplitMouseDown}
            onTouchStart={handleSplitTouchStart}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-8 rounded bg-white/90 shadow flex items-center justify-center">
              <GripVertical className="h-4 w-4 text-zinc-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Reset & Download */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={downloadFormat}
            onChange={e => setDownloadFormat(e.target.value as 'image/png' | 'image/jpeg')}
            className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-300"
          >
            <option value="image/png">PNG</option>
            <option value="image/jpeg">JPEG</option>
          </select>

          {downloadFormat === 'image/jpeg' && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-500 dark:text-zinc-400">
                Q: {Math.round(jpegQuality * 100)}%
              </label>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.01}
                value={jpegQuality}
                onChange={e => setJpegQuality(Number(e.target.value))}
                className="w-20 accent-blue-600"
              />
            </div>
          )}

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

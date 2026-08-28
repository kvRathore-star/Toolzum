'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useBatchProgress } from '@/hooks/useBatchProgress';
import { BatchProgressPanel } from '@/components/tools/BatchProgressPanel';
import { downloadOrShare } from '@/utils/nativeShare';
import { withErrorHandling } from '@/lib/withErrorHandling';
import { hasLargeFiles, checkMemory } from '@/lib/fileUtils';
import { ProDownloadButton } from '../utility/ProDownloadButton';
import JSZip from 'jszip';
import { Upload, Download, Zap, Images, X, Loader2, Sparkles, Clock, FileImage, Crop, Move, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ALPHA_NOISE_FLOOR = 3 / 255;
const ALPHA_THRESHOLD = 0.002;
const MAX_ALPHA = 0.99;
const LOGO_VALUE = 255;
const FREE_MONTHLY_LIMIT = 10;

function getFreeUsageCount(): number {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem('toolzum:gwr-free-count');
  if (!stored) return 0;
  const { count, month } = JSON.parse(stored);
  const now = new Date();
  if (month === `${now.getFullYear()}-${now.getMonth()}`) return count;
  return 0;
}

function recordFreeUsage(): boolean {
  const count = getFreeUsageCount();
  if (count >= FREE_MONTHLY_LIMIT) return false;
  const now = new Date();
  localStorage.setItem(
    'toolzum:gwr-free-count',
    JSON.stringify({ count: count + 1, month: `${now.getFullYear()}-${now.getMonth()}` })
  );
  return true;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function calculateAlphaMap(imageData: ImageData): Float32Array {
  const { width, height, data } = imageData;
  const alphaMap = new Float32Array(width * height);
  for (let i = 0; i < alphaMap.length; i++) {
    const idx = i * 4;
    alphaMap[i] = Math.max(data[idx], data[idx + 1], data[idx + 2]) / 255.0;
  }
  return alphaMap;
}

async function loadAlphaMap(size: 48 | 96): Promise<Float32Array> {
  const img = await loadImage('/assets/gemini-alpha-' + size + '.png');
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  return calculateAlphaMap(ctx.getImageData(0, 0, img.width, img.height));
}

function detectWatermarkConfig(width: number, height: number) {
  if (width > 1024 && height > 1024) {
    return { logoSize: 96 as const, marginRight: 64, marginBottom: 64 };
  }
  return { logoSize: 48 as const, marginRight: 32, marginBottom: 32 };
}

function removeWatermarkFromImageData(
  imageData: ImageData,
  alphaMap: Float32Array,
  position: { x: number; y: number; width: number; height: number }
): void {
  const { x, y, width, height } = position;
  const data = imageData.data;
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const imgIdx = ((y + row) * imageData.width + (x + col)) * 4;
      const alphaIdx = row * width + col;
      const rawAlpha = alphaMap[alphaIdx];
      const signalAlpha = Math.max(0, Math.abs(rawAlpha) - ALPHA_NOISE_FLOOR);
      if (signalAlpha < ALPHA_THRESHOLD) continue;
      const alpha = Math.min(Math.abs(rawAlpha), MAX_ALPHA);
      const oneMinusAlpha = 1.0 - alpha;
      for (let c = 0; c < 3; c++) {
        const watermarked = data[imgIdx + c];
        const original = (watermarked - alpha * LOGO_VALUE) / oneMinusAlpha;
        data[imgIdx + c] = Math.max(0, Math.min(255, Math.round(original)));
      }
    }
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

interface CropArea { x: number; y: number; w: number; h: number; }

async function processImage(
  file: File,
  outputFormat: 'png' | 'jpeg' | 'webp',
  quality: number,
  positionOverride: { x: number; y: number } | null,
  crop: CropArea | null
): Promise<{ blob: Blob; time: number }> {
  const start = performance.now();
  const img = await createImageBitmap(file);
  const canvas = document.createElement('canvas');

  if (crop) {
    canvas.width = crop.w;
    canvas.height = crop.h;
  } else {
    canvas.width = img.width;
    canvas.height = img.height;
  }
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  if (crop) {
    ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
  } else {
    ctx.drawImage(img, 0, 0);
  }
  img.close();

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const config = detectWatermarkConfig(canvas.width, canvas.height);
  const alphaMap = await loadAlphaMap(config.logoSize);

  const position = positionOverride
    ? { x: positionOverride.x, y: positionOverride.y, width: config.logoSize, height: config.logoSize }
    : { x: canvas.width - config.marginRight - config.logoSize, y: canvas.height - config.marginBottom - config.logoSize, width: config.logoSize, height: config.logoSize };

  removeWatermarkFromImageData(imageData, alphaMap, position);
  ctx.putImageData(imageData, 0, 0);

  const mimeType = outputFormat === 'jpeg' ? 'image/jpeg' : outputFormat === 'webp' ? 'image/webp' : 'image/png';
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), mimeType, quality);
  });
  return { blob, time: performance.now() - start };
}

function ImageInfo({ file, blob }: { file: File; blob?: Blob | null }) {
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const url = useRef(URL.createObjectURL(file));
  useEffect(() => {
    const img = new Image();
    img.onload = () => setDims({ w: img.width, h: img.height });
    img.src = url.current;
    return () => URL.revokeObjectURL(url.current);
  }, [file]);
  return (
    <div className="flex flex-wrap gap-3 text-xs text-[var(--text-secondary)]">
      <span className="flex items-center gap-1"><FileImage className="w-3 h-3" />{formatFileSize(file.size)}</span>
      {dims && <span>{dims.w} x {dims.h}px</span>}
      <span className="uppercase">{file.type.split('/')[1] || 'unknown'}</span>
      {blob && <span className="text-emerald-600 dark:text-emerald-400">{formatFileSize(file.size)} → {formatFileSize(blob.size)}</span>}
    </div>
  );
}

function SliderCompare({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const updatePos = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPos(Math.max(0, Math.min((clientX - rect.left) / rect.width * 100, 100)));
  }, []);
  useEffect(() => {
    const handleMove = (e: MouseEvent) => { if (dragging.current) updatePos(e.clientX); };
    const handleUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
  }, [updatePos]);
  return (
    <div ref={containerRef} className="relative w-full h-[400px] rounded-xl overflow-hidden cursor-col-resize select-none"
      onMouseDown={(e) => { dragging.current = true; updatePos(e.clientX); }}
      onTouchMove={(e) => updatePos(e.touches[0].clientX)}>
      <img src={after} alt="After" className="absolute inset-0 w-full h-full object-contain" />
      <div className="absolute inset-0 overflow-hidden" style={{ width: pos + '%' }}>
        <img src={before} alt="Before" className="absolute inset-0 h-full object-contain" style={{ width: containerRef.current ? containerRef.current.offsetWidth : '100%' }} />
      </div>
      <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: pos + '%' }}>
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <span className="text-gray-600 text-xs">↔</span>
        </div>
      </div>
      <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">Before</span>
      <span className="absolute top-2 right-2 bg-emerald-600/80 text-white text-xs px-2 py-1 rounded-full">After</span>
    </div>
  );
}

function CropEditor({ url, onCrop, onClear }: { url: string; onCrop: (c: CropArea) => void; onClear: () => void }) {
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [box, setBox] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [active, setActive] = useState(false);
  const startRef = useRef({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setDims({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = url;
  }, [url]);

  const getPos = (e: React.MouseEvent) => {
    if (!imgRef.current) return { x: 0, y: 0 };
    const rect = imgRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const toNatural = (px: { x: number; y: number }) => {
    if (!imgRef.current || !dims) return { x: 0, y: 0 };
    const rect = imgRef.current.getBoundingClientRect();
    return { x: Math.round(px.x / rect.width * dims.w), y: Math.round(px.y / rect.height * dims.h) };
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
        <Crop className="w-3 h-3" /> Draw a box on the image to crop, or skip to use full image
      </div>
      <div className="relative inline-block max-w-full">
        <img ref={imgRef} src={url} alt="Crop source" className="max-h-[350px] max-w-full object-contain cursor-crosshair"
          onMouseDown={(e) => { setActive(true); const p = getPos(e); startRef.current = p; setBox({ x: p.x, y: p.y, w: 0, h: 0 }); }}
          onMouseMove={(e) => { if (!active) return; const p = getPos(e); const s = startRef.current; setBox({ x: Math.min(s.x, p.x), y: Math.min(s.y, p.y), w: Math.abs(p.x - s.x), h: Math.abs(p.y - s.y) }); }}
          onMouseUp={() => { setActive(false); if (box.w > 10 && box.h > 10) { const tl = toNatural({ x: box.x, y: box.y }); const br = toNatural({ x: box.x + box.w, y: box.y + box.h }); onCrop({ x: tl.x, y: tl.y, w: br.x - tl.x, h: br.y - tl.y }); } }} />
        {box.w > 0 && (
          <div className="absolute border-2 border-dashed border-white/80 pointer-events-none" style={{ left: box.x, top: box.y, width: box.w, height: box.h }} />
        )}
      </div>
      <div className="flex gap-2">
        <button onClick={onClear} className="px-3 py-1.5 text-xs bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Skip Crop</button>
      </div>
    </div>
  );
}

export default function GeminiWatermarkRemover() {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [singleImage, setSingleImage] = useState<{ file: File; url: string } | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [freeRemaining, setFreeRemaining] = useState(FREE_MONTHLY_LIMIT);
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [quality, setQuality] = useState(92);
  const [processTime, setProcessTime] = useState<number | null>(null);
  const [compareMode, setCompareMode] = useState<'side' | 'slider'>('side');
  const [isDragging, setIsDragging] = useState(false);
  const [positionOverride, setPositionOverride] = useState<{ x: number; y: number } | null>(null);
  const [showPositionPicker, setShowPositionPicker] = useState(false);
  const [crop, setCrop] = useState<CropArea | null>(null);
  const [showCrop, setShowCrop] = useState(false);

  const batch = useBatchProgress();
  const fileRef = useRef<HTMLInputElement>(null);
  const bulkFileRef = useRef<HTMLInputElement>(null);
  const blobUrlsRef = useRef<string[]>([]);
  const doneBlobsRef = useRef<Blob[]>([]);

  useEffect(() => { setFreeRemaining(FREE_MONTHLY_LIMIT - getFreeUsageCount()); }, []);
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      if (singleImage?.url.startsWith('blob:')) URL.revokeObjectURL(singleImage.url);
      if (processedUrl?.startsWith('blob:')) URL.revokeObjectURL(processedUrl);
    };
  }, [singleImage, processedUrl]);

  const handleFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    const url = URL.createObjectURL(file);
    blobUrlsRef.current.push(url);
    setSingleImage({ file, url });
    setProcessedUrl(null); setProcessedBlob(null); setProcessTime(null);
    setPositionOverride(null); setCrop(null); setShowCrop(false); setShowPositionPicker(false);
  }, []);

  const handleSingleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(Array.from(e.target.files || []));
  }, [handleFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    handleFiles(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')));
  }, [handleFiles]);

  const processSingle = useCallback(async () => {
    if (!singleImage) return;
    if (!recordFreeUsage()) { toast.error('Free limit reached (' + FREE_MONTHLY_LIMIT + '/month).'); return; }
    setIsProcessing(true);
    try {
      const { blob, time } = await processImage(singleImage.file, outputFormat, quality, positionOverride, crop);
      const url = URL.createObjectURL(blob);
      blobUrlsRef.current.push(url);
      setProcessedUrl(url); setProcessedBlob(blob); setProcessTime(time);
      setFreeRemaining(FREE_MONTHLY_LIMIT - getFreeUsageCount());
      toast.success('Watermark removed in ' + (time / 1000).toFixed(1) + 's!');
    } catch (err) { toast.error('Failed to process image'); console.error(err); }
    finally { setIsProcessing(false); }
  }, [singleImage, outputFormat, quality, positionOverride, crop]);

  const handleSingleDownload = useCallback(() => {
    if (!processedUrl || !singleImage) return;
    const ext = outputFormat === 'jpeg' ? '.jpg' : outputFormat === 'webp' ? '.webp' : '.png';
    downloadOrShare(processedUrl, singleImage.file.name.replace(/\.[^.]+$/, '') + '-clean' + ext);
  }, [processedUrl, singleImage, outputFormat]);

  const handleBulkFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const accepted = Array.from(e.target.files || []);
    if (accepted.length === 0) return;
    batch.addFiles(accepted);
    accepted.forEach((f) => { const url = URL.createObjectURL(f); blobUrlsRef.current.push(url); });
    toast.success('Added ' + accepted.length + ' file(s)');
  }, [batch]);

  const bulkProcessor = useCallback(async (file: File, onProgress: (pct: number) => void): Promise<Blob | null> => {
    return withErrorHandling(async () => {
      onProgress(10);
      const { blob } = await processImage(file, outputFormat, quality, null, null);
      onProgress(100); return blob;
    }, { toast: 'Processing error', log: true });
  }, [outputFormat, quality]);

  const handleBulkProcess = useCallback(async () => {
    if (batch.files.length === 0) return;
    if (hasLargeFiles(batch.files.map((f) => f.file))) {
      const mem = checkMemory();
      if (!mem && !window.confirm('Large images detected. Continue?')) return;
    }
    doneBlobsRef.current = [];
    await batch.processBatch(bulkProcessor, {
      onComplete: () => { doneBlobsRef.current = batch.files.filter((f) => f.status === 'done' && f.result).map((f) => f.result!); },
    });
  }, [batch, bulkProcessor]);

  const downloadAll = useCallback(async () => {
    const blobs = doneBlobsRef.current;
    if (blobs.length === 0) return;
    if (blobs.length === 1) { downloadOrShare(URL.createObjectURL(blobs[0]), 'clean.png'); return; }
    const zip = new JSZip();
    const ext = outputFormat === 'jpeg' ? '.jpg' : outputFormat === 'webp' ? '.webp' : '.png';
    batch.files.forEach((bf) => {
      if (bf.status === 'done' && bf.result) zip.file(bf.file.name.replace(/\.[^.]+$/, '') + '-clean' + ext, bf.result);
    });
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content); blobUrlsRef.current.push(url);
    downloadOrShare(url, 'clean-images.zip');
  }, [batch.files, outputFormat]);

  const downloadIndividual = useCallback((index: number) => {
    const bf = batch.files[index];
    if (!bf || bf.status !== 'done' || !bf.result) return;
    const ext = outputFormat === 'jpeg' ? '.jpg' : outputFormat === 'webp' ? '.webp' : '.png';
    const url = URL.createObjectURL(bf.result); blobUrlsRef.current.push(url);
    downloadOrShare(url, bf.file.name.replace(/\.[^.]+$/, '') + '-clean' + ext);
  }, [batch.files, outputFormat]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex bg-[var(--bg-surface)] rounded-xl p-1">
          <button onClick={() => setMode('single')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'single' ? 'bg-[var(--accent-ink)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
            <Sparkles className="w-4 h-4" /> Single Image
          </button>
          <button onClick={() => setMode('bulk')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'bulk' ? 'bg-[var(--accent-ink)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
            <Images className="w-4 h-4" /> Batch Mode
          </button>
        </div>
        <span className="text-xs text-[var(--text-secondary)]">{freeRemaining} free images remaining this month</span>
      </div>

      {/* Settings Bar */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--text-secondary)]">Output:</label>
          <select value={outputFormat} onChange={e => setOutputFormat(e.target.value as typeof outputFormat)}
            className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2">
            <option value="png">PNG</option>
            <option value="jpeg">JPG</option>
            <option value="webp">WebP</option>
          </select>
        </div>
        {outputFormat !== 'png' && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-[var(--text-secondary)]">Quality: {quality}%</label>
            <input type="range" min={10} max={100} value={quality} onChange={e => setQuality(Number(e.target.value))} className="w-24 h-1 accent-[var(--accent-ink)]" />
          </div>
        )}
        {processTime !== null && (
          <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
            <Clock className="w-3 h-3" /> Processed in {(processTime / 1000).toFixed(1)}s
          </span>
        )}
      </div>

      {mode === 'single' ? (
        <div className="space-y-4">
          {!singleImage ? (
            <div onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${isDragging ? 'border-[var(--accent)] bg-[var(--accent)]/5 scale-[1.01]' : 'border-[var(--border-subtle)] hover:border-[var(--accent)]'}`}>
              <Upload className="w-12 h-12 mx-auto mb-4 text-[var(--accent)]" />
              <p className="text-[var(--text-primary)] font-medium">{isDragging ? 'Drop image here' : 'Drag & drop a Gemini image'}</p>
              <p className="text-sm text-[var(--text-secondary)] mt-1">or click to browse</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleSingleUpload} />
            </div>
          ) : (
            <div className="space-y-4">
              <ImageInfo file={singleImage.file} blob={processedBlob} />

              {/* Tools Row */}
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { setShowCrop(!showCrop); setShowPositionPicker(false); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${showCrop ? 'bg-[var(--accent-ink)] text-white border-[var(--accent-ink)]' : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                  <Crop className="w-3 h-3" /> {crop ? 'Crop Applied' : 'Crop Image'}
                </button>
                <button onClick={() => { setShowPositionPicker(!showPositionPicker); setShowCrop(false); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${showPositionPicker ? 'bg-[var(--accent-ink)] text-white border-[var(--accent-ink)]' : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                  <Move className="w-3 h-3" /> {positionOverride ? 'Position Set' : 'Set Watermark Position'}
                </button>
                {(positionOverride || crop) && (
                  <button onClick={() => { setPositionOverride(null); setCrop(null); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>

              {/* Crop Editor */}
              {showCrop && !crop && (
                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4">
                  <CropEditor url={singleImage.url} onCrop={(c) => { setCrop(c); setShowCrop(false); toast.success('Crop applied'); }} onClear={() => setShowCrop(false)} />
                </div>
              )}

              {/* Position Picker */}
              {showPositionPicker && (
                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-3">
                  <p className="text-xs text-[var(--text-secondary)]">Click on the image to set watermark position (bottom-right is default)</p>
                  <div className="relative inline-block">
                    <img src={singleImage.url} alt="Pick position" className="max-h-[300px] max-w-full object-contain cursor-crosshair"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const img = new Image(); img.src = singleImage.url;
                        img.onload = () => {
                          const scaleX = img.naturalWidth / rect.width;
                          const scaleY = img.naturalHeight / rect.height;
                          setPositionOverride({ x: Math.round((e.clientX - rect.left) * scaleX), y: Math.round((e.clientY - rect.top) * scaleY) });
                          setShowPositionPicker(false);
                          toast.success('Watermark position set');
                        };
                      }} />
                    {positionOverride && (
                      <div className="absolute w-6 h-6 border-2 border-red-500 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"
                        style={{ left: '50%', top: '50%' }} />
                    )}
                  </div>
                </div>
              )}

              {/* Compare Mode Toggle */}
              {processedUrl && (
                <div className="flex gap-2">
                  <button onClick={() => setCompareMode('side')} className={`px-3 py-1.5 text-xs font-medium rounded-lg ${compareMode === 'side' ? 'bg-[var(--accent-ink)] text-white' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'}`}>Side by Side</button>
                  <button onClick={() => setCompareMode('slider')} className={`px-3 py-1.5 text-xs font-medium rounded-lg ${compareMode === 'slider' ? 'bg-[var(--accent-ink)] text-white' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'}`}>Slider Compare</button>
                </div>
              )}

              {/* Preview */}
              {compareMode === 'slider' && processedUrl ? (
                <SliderCompare before={singleImage.url} after={processedUrl} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative rounded-xl overflow-hidden bg-[var(--bg-surface)]">
                    <span className="absolute top-2 left-2 z-10 bg-black/60 text-white text-xs px-2 py-1 rounded-full">Before</span>
                    <img src={singleImage.url} alt="Original" className="w-full h-auto max-h-[400px] object-contain" />
                  </div>
                  {processedUrl && (
                    <div className="relative rounded-xl overflow-hidden bg-[var(--bg-surface)]">
                      <span className="absolute top-2 left-2 z-10 bg-emerald-600/80 text-white text-xs px-2 py-1 rounded-full">After</span>
                      <img src={processedUrl} alt="Cleaned" className="w-full h-auto max-h-[400px] object-contain" />
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3">
                {!processedUrl ? (
                  <button onClick={processSingle} disabled={isProcessing}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--accent-ink)] text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                    {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><Zap className="w-4 h-4" /> Remove Watermark</>}
                  </button>
                ) : (
                  <button onClick={handleSingleDownload}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors">
                    <Download className="w-4 h-4" /> Download Clean Image
                  </button>
                )}
                <button onClick={() => { setSingleImage(null); setProcessedUrl(null); setProcessedBlob(null); setProcessTime(null); setPositionOverride(null); setCrop(null); }}
                  className="flex items-center gap-2 px-4 py-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  <X className="w-4 h-4" /> Clear
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => bulkFileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-sm hover:border-[var(--accent)] transition-colors">
              <Upload className="w-4 h-4" /> Add Images
            </button>
            {batch.files.length > 0 && !batch.isProcessing && (
              <button onClick={handleBulkProcess}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-ink)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                <Zap className="w-4 h-4" /> Process All ({batch.files.length})
              </button>
            )}
            {batch.files.filter((f) => f.status === 'done').length > 0 && !batch.isProcessing && (
              <>
                <ProDownloadButton fileCount={batch.files.filter((f) => f.status === 'done').length} onDownloadAll={downloadAll} />
                <span className="text-xs text-[var(--text-muted)]">or download individually ↓</span>
              </>
            )}
            <input ref={bulkFileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleBulkFiles} />
          </div>
          <BatchProgressPanel
            files={batch.files} progress={batch.progress} isProcessing={batch.isProcessing}
            onRemove={batch.removeFile} onClear={() => { batch.clearFiles(); doneBlobsRef.current = []; }}
            onAbort={batch.abort}
          />
          {/* Individual Downloads */}
          {batch.files.filter(f => f.status === 'done').length > 0 && !batch.isProcessing && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-[var(--text-secondary)]">Individual Downloads</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {batch.files.map((bf, i) => bf.status === 'done' && (
                  <button key={i} onClick={() => downloadIndividual(i)}
                    className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors text-left truncate">
                    <Download className="w-3 h-3 shrink-0 text-emerald-500" />
                    <span className="truncate">{bf.file.name.replace(/\.[^.]+$/, '')}-clean</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

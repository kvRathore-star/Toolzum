'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useBatchProgress } from '@/hooks/useBatchProgress';
import { BatchProgressPanel } from '@/components/tools/BatchProgressPanel';
import { downloadOrShare } from '@/utils/nativeShare';
import { withErrorHandling } from '@/lib/withErrorHandling';
import { hasLargeFiles, checkMemory } from '@/lib/fileUtils';
import { ProDownloadButton } from '../utility/ProDownloadButton';
import JSZip from 'jszip';
import { Upload, Download, Zap, Images, X, Loader2, Sparkles } from 'lucide-react';
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
  const img = await loadImage(`/assets/gemini-alpha-${size}.png`);
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

async function processImage(file: File): Promise<Blob> {
  const img = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  img.close();

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const config = detectWatermarkConfig(canvas.width, canvas.height);
  const alphaMap = await loadAlphaMap(config.logoSize);

  const position = {
    x: canvas.width - config.marginRight - config.logoSize,
    y: canvas.height - config.marginBottom - config.logoSize,
    width: config.logoSize,
    height: config.logoSize,
  };

  removeWatermarkFromImageData(imageData, alphaMap, position);
  ctx.putImageData(imageData, 0, 0);

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}

export default function GeminiWatermarkRemover() {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [singleImage, setSingleImage] = useState<{ file: File; url: string } | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [freeRemaining, setFreeRemaining] = useState(FREE_MONTHLY_LIMIT);

  const batch = useBatchProgress();
  const fileRef = useRef<HTMLInputElement>(null);
  const bulkFileRef = useRef<HTMLInputElement>(null);
  const blobUrlsRef = useRef<string[]>([]);
  const doneBlobsRef = useRef<Blob[]>([]);

  useEffect(() => {
    setFreeRemaining(FREE_MONTHLY_LIMIT - getFreeUsageCount());
  }, []);

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      if (singleImage?.url.startsWith('blob:')) URL.revokeObjectURL(singleImage.url);
      if (processedUrl?.startsWith('blob:')) URL.revokeObjectURL(processedUrl);
    };
  }, [singleImage, processedUrl]);

  const handleSingleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    blobUrlsRef.current.push(url);
    setSingleImage({ file, url });
    setProcessedUrl(null);
  }, []);

  const processSingle = useCallback(async () => {
    if (!singleImage) return;
    if (!recordFreeUsage()) {
      toast.error(`Free limit reached (${FREE_MONTHLY_LIMIT}/month). Switch to Pro for unlimited.`);
      return;
    }
    setIsProcessing(true);
    try {
      const blob = await processImage(singleImage.file);
      const url = URL.createObjectURL(blob);
      blobUrlsRef.current.push(url);
      setProcessedUrl(url);
      setFreeRemaining(FREE_MONTHLY_LIMIT - getFreeUsageCount());
      toast.success('Watermark removed!');
    } catch (err) {
      toast.error('Failed to process image');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }, [singleImage]);

  const handleSingleDownload = useCallback(() => {
    if (!processedUrl || !singleImage) return;
    const name = singleImage.file.name.replace(/\.[^.]+$/, '') + '-clean.png';
    downloadOrShare(processedUrl, name);
  }, [processedUrl, singleImage]);

  const handleBulkFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const accepted = Array.from(e.target.files || []);
    if (accepted.length === 0) return;
    batch.addFiles(accepted);
    accepted.forEach((f) => {
      const url = URL.createObjectURL(f);
      blobUrlsRef.current.push(url);
    });
    toast.success(`Added ${accepted.length} file(s)`);
  }, [batch]);

  const bulkProcessor = useCallback(
    async (file: File, onProgress: (pct: number) => void): Promise<Blob | null> => {
      return withErrorHandling(async () => {
        onProgress(10);
        const blob = await processImage(file);
        onProgress(100);
        return blob;
      }, { toast: 'Processing error', log: true });
    },
    []
  );

  const handleBulkProcess = useCallback(async () => {
    if (batch.files.length === 0) return;

    if (hasLargeFiles(batch.files.map((f) => f.file))) {
      const mem = checkMemory();
      if (!mem) {
        const proceed = window.confirm('Large images detected. Processing may be slow on low-memory devices. Continue?');
        if (!proceed) return;
      }
    }

    doneBlobsRef.current = [];
    await batch.processBatch(bulkProcessor, {
      onComplete: () => {
        doneBlobsRef.current = batch.files
          .filter((f) => f.status === 'done' && f.result)
          .map((f) => f.result!);
      },
    });
  }, [batch, bulkProcessor]);

  const downloadAll = useCallback(async () => {
    const blobs = doneBlobsRef.current;
    if (blobs.length === 0) return;
    if (blobs.length === 1) {
      downloadOrShare(URL.createObjectURL(blobs[0]), 'clean.png');
      return;
    }
    const zip = new JSZip();
    batch.files.forEach((bf, i) => {
      if (bf.status === 'done' && bf.result) {
        const name = bf.file.name.replace(/\.[^.]+$/, '') + '-clean.png';
        zip.file(name, bf.result);
      }
    });
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    blobUrlsRef.current.push(url);
    downloadOrShare(url, 'clean-images.zip');
  }, [batch.files]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex bg-[var(--bg-base)] rounded-[var(--radius-lg)] p-1">
          <button
            onClick={() => setMode('single')}
            className={`flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${
              mode === 'single'
                ? 'bg-[var(--accent-ink)] text-white'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Single Image
          </button>
          <button
            onClick={() => setMode('bulk')}
            className={`flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${
              mode === 'bulk'
                ? 'bg-[var(--accent-ink)] text-white'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Images className="w-4 h-4" />
            Batch Mode
          </button>
        </div>
        <span className="text-xs text-[var(--text-secondary)]">
          {freeRemaining} free images remaining this month
        </span>
      </div>

      {mode === 'single' ? (
        <div className="space-y-6">
          {!singleImage ? (
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-[var(--border-default)] rounded-[var(--radius-xl)] p-12 text-center cursor-pointer hover:border-[var(--accent)] transition-colors"
            >
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-[var(--accent)]" />
              <p className="text-[var(--text-primary)] font-medium">Drop a Gemini image here</p>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Removes the visible sparkle watermark using reverse alpha blending
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleSingleUpload}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative rounded-[var(--radius-xl)] overflow-hidden bg-[var(--bg-base)]">
                  <span className="absolute top-2 left-2 z-10 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    Before
                  </span>
                  <img
                    src={singleImage.url}
                    alt="Original"
                    className="w-full h-auto max-h-[400px] object-contain"
                  />
                </div>
                {processedUrl && (
                  <div className="relative rounded-[var(--radius-xl)] overflow-hidden bg-[var(--bg-base)]">
                    <span className="absolute top-2 left-2 z-10 bg-emerald-600/80 text-white text-xs px-2 py-1 rounded-full">
                      After
                    </span>
                    <img
                      src={processedUrl}
                      alt="Cleaned"
                      className="w-full h-auto max-h-[400px] object-contain"
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                {!processedUrl ? (
                  <button
                    onClick={processSingle}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--accent-ink)] text-white rounded-[var(--radius-lg)] font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Remove Watermark
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleSingleDownload}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-[var(--radius-lg)] font-medium hover:bg-emerald-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Clean Image
                  </button>
                )}
                <button
                  onClick={() => {
                    setSingleImage(null);
                    setProcessedUrl(null);
                  }}
                  className="flex items-center gap-2 px-4 py-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => bulkFileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[var(--radius-lg)] text-sm hover:border-[var(--accent)] transition-colors"
            >
              <Upload className="w-4 h-4" />
              Add Images
            </button>
            {batch.files.length > 0 && !batch.isProcessing && (
              <button
                onClick={handleBulkProcess}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-ink)] text-white rounded-[var(--radius-lg)] text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Zap className="w-4 h-4" />
                Process All ({batch.files.length})
              </button>
            )}
            {batch.files.filter((f) => f.status === 'done').length > 0 && !batch.isProcessing && (
              <ProDownloadButton
                fileCount={batch.files.filter((f) => f.status === 'done').length}
                onDownloadAll={downloadAll}
              />
            )}
            <input
              ref={bulkFileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleBulkFiles}
            />
          </div>
          <BatchProgressPanel
            files={batch.files}
            progress={batch.progress}
            isProcessing={batch.isProcessing}
            onRemove={batch.removeFile}
            onClear={() => {
              batch.clearFiles();
              doneBlobsRef.current = [];
            }}
            onAbort={batch.abort}
          />
        </div>
      )}

      <div className="border-t border-[var(--border-default)] pt-4 mt-6">
        <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">How it works</h3>
        <ul className="text-xs text-[var(--text-secondary)] space-y-1">
          <li>• Gemini adds a visible sparkle watermark using alpha blending in the bottom-right corner</li>
          <li>• This tool mathematically reverses the blending formula to recover the original pixels</li>
          <li>• Auto-detects 48×48 and 96×96 watermark sizes based on image dimensions</li>
          <li>• 100% client-side — your images never leave your browser</li>
          <li>• Does not remove invisible SynthID watermarks embedded in pixel data</li>
        </ul>
      </div>
    </div>
  );
}

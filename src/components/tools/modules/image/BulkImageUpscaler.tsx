"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useBatchProgress } from '@/hooks/useBatchProgress';
import { BatchProgressPanel } from '@/components/tools/BatchProgressPanel';
import { ProDownloadButton } from '../utility/ProDownloadButton';
import { hasLargeFiles, checkMemory } from '@/lib/fileUtils';
import { withErrorHandling } from '@/lib/withErrorHandling';
import { downloadOrShare } from '@/utils/nativeShare';
import JSZip from 'jszip';
import { Upload, Zap, ZoomIn, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SCALE_OPTIONS = [
  { value: '2x', label: '2× Upscale', factor: 2 },
  { value: '3x', label: '3× Upscale', factor: 3 },
  { value: '4x', label: '4× Upscale', factor: 4 },
] as const;

const ALGO_OPTIONS = [
  { value: 'lanczos', label: 'Lanczos (sharp)', quality: 'high' },
  { value: 'bicubic', label: 'Bicubic (smooth)', quality: 'medium' },
  { value: 'bilinear', label: 'Bilinear (fast)', quality: 'low' },
] as const;

export default function BulkImageUpscaler() {
  const [scale, setScale] = useState('2x');
  const [algo, setAlgo] = useState('lanczos');
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);
  const [previewOriginal, setPreviewOriginal] = useState<string | null>(null);
  const [previewUpscaled, setPreviewUpscaled] = useState<string | null>(null);

  const batch = useBatchProgress();
  const fileRef = useRef<HTMLInputElement>(null);
  const blobUrlsRef = useRef<string[]>([]);
  const doneBlobsRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const handleFiles = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const accepted = Array.from(e.target.files || []);
      if (accepted.length === 0) return;
      batch.addFiles(accepted);
      accepted.forEach((f) => blobUrlsRef.current.push(URL.createObjectURL(f)));
      toast.success(`Added ${accepted.length} file(s)`);
    },
    [batch]
  );

  const upscaleImage = useCallback(
    async (file: File, targetScale: number, algorithm: string): Promise<Blob> => {
      const img = await createImageBitmap(file);
      const w = Math.round(img.width * targetScale);
      const h = Math.round(img.height * targetScale);

      // For high-quality upscaling, use multi-step approach for large scales
      const steps = targetScale > 2 ? Math.ceil(targetScale / 2) : 1;
      const stepScale = targetScale / steps;

      let currentCanvas = document.createElement('canvas');
      currentCanvas.width = img.width;
      currentCanvas.height = img.height;
      let ctx = currentCanvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = algorithm === 'lanczos' ? 'high' : algorithm === 'bicubic' ? 'medium' : 'low';
      ctx.drawImage(img, 0, 0);
      img.close();

      for (let s = 0; s < steps; s++) {
        const isLast = s === steps - 1;
        const sw = isLast ? w : Math.round(currentCanvas.width * stepScale);
        const sh = isLast ? h : Math.round(currentCanvas.height * stepScale);

        const nextCanvas = document.createElement('canvas');
        nextCanvas.width = sw;
        nextCanvas.height = sh;
        const nextCtx = nextCanvas.getContext('2d')!;
        nextCtx.imageSmoothingEnabled = true;
        nextCtx.imageSmoothingQuality = algorithm === 'lanczos' ? 'high' : algorithm === 'bicubic' ? 'medium' : 'low';
        nextCtx.drawImage(currentCanvas, 0, 0, sw, sh);
        currentCanvas = nextCanvas;
      }

      return new Promise<Blob>((resolve) => {
        currentCanvas.toBlob((b) => resolve(b!), 'image/png');
      });
    },
    []
  );

  const processor = useCallback(
    async (file: File, onProgress: (pct: number) => void): Promise<Blob | null> => {
      return withErrorHandling(async () => {
        const factor = SCALE_OPTIONS.find((s) => s.value === scale)?.factor || 2;
        onProgress(10);
        const blob = await upscaleImage(file, factor, algo);
        onProgress(100);
        return blob;
      }, { toast: 'Upscale error', log: true });
    },
    [scale, algo, upscaleImage]
  );

  const handleProcess = useCallback(async () => {
    if (batch.files.length === 0) return;
    if (hasLargeFiles(batch.files.map((f) => f.file))) {
      if (!checkMemory() && !window.confirm('Large images detected. Upscaling may be slow. Continue?')) return;
    }
    doneBlobsRef.current = [];
    await batch.processBatch(processor, {
      onComplete: () => {
        doneBlobsRef.current = batch.files
          .filter((f) => f.status === 'done' && f.result)
          .map((f) => f.result!);
      },
    });
  }, [batch, processor]);

  const handlePreview = useCallback(
    async (idx: number) => {
      const bf = batch.files[idx];
      if (!bf || !bf.file) return;
      setPreviewIdx(idx);
      const origUrl = URL.createObjectURL(bf.file);
      blobUrlsRef.current.push(origUrl);
      setPreviewOriginal(origUrl);

      if (bf.status === 'done' && bf.result) {
        const upUrl = URL.createObjectURL(bf.result);
        blobUrlsRef.current.push(upUrl);
        setPreviewUpscaled(upUrl);
      } else {
        setPreviewUpscaled(null);
        const factor = SCALE_OPTIONS.find((s) => s.value === scale)?.factor || 2;
        const blob = await upscaleImage(bf.file, factor, algo);
        const upUrl = URL.createObjectURL(blob);
        blobUrlsRef.current.push(upUrl);
        setPreviewUpscaled(upUrl);
      }
    },
    [batch.files, scale, algo, upscaleImage]
  );

  const downloadAll = useCallback(async () => {
    const blobs = doneBlobsRef.current;
    if (blobs.length === 0) return;
    if (blobs.length === 1) {
      downloadOrShare(URL.createObjectURL(blobs[0]!), 'upscaled.png');
      return;
    }
    const zip = new JSZip();
    batch.files.forEach((bf) => {
      if (bf.status === 'done' && bf.result) {
        zip.file(bf.file.name.replace(/\.[^.]+$/, '') + '-upscaled.png', bf.result);
      }
    });
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    blobUrlsRef.current.push(url);
    downloadOrShare(url, 'upscaled-images.zip');
  }, [batch.files]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[var(--radius-lg)] text-sm hover:border-[var(--accent)] transition-colors"
        >
          <Upload className="w-4 h-4" />
          Add Images
        </button>
        {batch.files.length > 0 && !batch.isProcessing && (
          <button
            onClick={handleProcess}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-ink)] text-white rounded-[var(--radius-lg)] text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Zap className="w-4 h-4" />
            Upscale All ({batch.files.length})
          </button>
        )}
        {batch.files.filter((f) => f.status === 'done').length > 0 && !batch.isProcessing && (
          <ProDownloadButton
            fileCount={batch.files.filter((f) => f.status === 'done').length}
            onDownloadAll={downloadAll}
          />
        )}
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      </div>

      <div className="bg-[var(--bg-base)] rounded-[var(--radius-xl)] p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
          <ZoomIn className="w-4 h-4" />
          Upscale Settings
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Scale Factor</label>
            <div className="flex gap-2 mt-1">
              {SCALE_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setScale(s.value)}
                  className={`flex-1 px-3 py-2 rounded-[var(--radius-md)] text-xs font-medium border transition-colors ${
                    scale === s.value
                      ? 'bg-[var(--accent-ink)] text-white border-[var(--accent-ink)]'
                      : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Algorithm</label>
            <div className="flex gap-2 mt-1">
              {ALGO_OPTIONS.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setAlgo(a.value)}
                  className={`flex-1 px-3 py-2 rounded-[var(--radius-md)] text-xs font-medium border transition-colors ${
                    algo === a.value
                      ? 'bg-[var(--accent-ink)] text-white border-[var(--accent-ink)]'
                      : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {batch.files.length > 0 && (
        <div className="bg-[var(--bg-base)] rounded-[var(--radius-xl)] p-4">
          <div className="text-xs font-medium text-[var(--text-secondary)] mb-3">
            Click an image to preview upscale result
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {batch.files.map((bf, idx) => (
              <button
                key={bf.id}
                onClick={() => handlePreview(idx)}
                className={`relative aspect-square rounded-[var(--radius-md)] overflow-hidden border-2 transition-colors ${
                  previewIdx === idx ? 'border-[var(--accent)]' : 'border-transparent hover:border-[var(--border-default)]'
                }`}
              >
                <img
                  src={URL.createObjectURL(bf.file)}
                  alt={bf.file.name}
                  className="w-full h-full object-cover"
                />
                {bf.status === 'done' && (
                  <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-emerald-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {previewIdx !== null && previewOriginal && (
        <div className="bg-[var(--bg-base)] rounded-[var(--radius-xl)] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              <Eye className="w-4 h-4 inline mr-1" />
              Preview: {batch.files[previewIdx]?.file.name}
            </span>
            <button
              onClick={() => { setPreviewIdx(null); setPreviewOriginal(null); setPreviewUpscaled(null); }}
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative rounded-[var(--radius-lg)] overflow-hidden bg-[var(--bg-elevated)]">
              <span className="absolute top-2 left-2 z-10 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                Original
              </span>
              <img src={previewOriginal} alt="Original" className="w-full h-auto max-h-[300px] object-contain" />
            </div>
            <div className="relative rounded-[var(--radius-lg)] overflow-hidden bg-[var(--bg-elevated)]">
              <span className="absolute top-2 left-2 z-10 bg-[var(--accent-ink)]/80 text-white text-xs px-2 py-1 rounded-full">
                Upscaled {scale}
              </span>
              {previewUpscaled ? (
                <img src={previewUpscaled} alt="Upscaled" className="w-full h-auto max-h-[300px] object-contain" />
              ) : (
                <div className="flex items-center justify-center h-[300px] text-[var(--text-secondary)] text-sm">
                  Processing...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <BatchProgressPanel
        files={batch.files}
        progress={batch.progress}
        isProcessing={batch.isProcessing}
        onRemove={batch.removeFile}
        onClear={() => { batch.clearFiles(); doneBlobsRef.current = []; }}
        onAbort={batch.abort}
      />
    </div>
  );
}

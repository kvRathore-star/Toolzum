"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useBatchProgress } from '@/hooks/useBatchProgress';
import { BatchProgressPanel } from '@/components/tools/BatchProgressPanel';
import { ProDownloadButton } from '../utility/ProDownloadButton';
import { hasLargeFiles, checkMemory } from '@/lib/fileUtils';
import { withErrorHandling } from '@/lib/withErrorHandling';
import { downloadOrShare } from '@/utils/nativeShare';
import JSZip from 'jszip';
import { Upload, Zap, Settings2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PRESETS = [
  { label: 'Web (smallest)', maxWidth: 1920, quality: 60 },
  { label: 'Balanced', maxWidth: 2048, quality: 75 },
  { label: 'High Quality', maxWidth: 3000, quality: 85 },
  { label: 'Maximum', maxWidth: 0, quality: 95 },
] as const;

export default function BulkAvifOptimizer() {
  const [preset, setPreset] = useState<number>(1);
  const [customQuality, setCustomQuality] = useState(75);
  const [maxWidth, setMaxWidth] = useState(2048);
  const [stripMeta, setStripMeta] = useState(true);
  const batch = useBatchProgress();
  const fileRef = useRef<HTMLInputElement>(null);
  const blobUrlsRef = useRef<string[]>([]);
  const doneBlobsRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const applyPreset = (idx: number) => {
    setPreset(idx);
    const p = PRESETS[idx]!;
    setCustomQuality(p.quality);
    if (p.maxWidth > 0) setMaxWidth(p.maxWidth);
  };

  const handleFiles = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const accepted = Array.from(e.target.files || []);
      if (accepted.length === 0) return;
      batch.addFiles(accepted);
      accepted.forEach((f) => {
        blobUrlsRef.current.push(URL.createObjectURL(f));
      });
      toast.success(`Added ${accepted.length} file(s)`);
    },
    [batch]
  );

  const processor = useCallback(
    async (file: File, onProgress: (pct: number) => void): Promise<Blob | null> => {
      return withErrorHandling(async () => {
        onProgress(10);
        const img = await createImageBitmap(file);
        let w = img.width;
        let h = img.height;
        if (maxWidth > 0 && w > maxWidth) {
          h = Math.round((h / w) * maxWidth);
          w = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        img.close();
        onProgress(70);
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error('AVIF encoding not supported in this browser'))),
            'image/avif',
            customQuality / 100
          );
        });
        onProgress(100);
        return blob;
      }, { toast: 'Processing error', log: true });
    },
    [customQuality, maxWidth]
  );

  const handleProcess = useCallback(async () => {
    if (batch.files.length === 0) return;
    if (hasLargeFiles(batch.files.map((f) => f.file))) {
      if (!checkMemory() && !window.confirm('Large images detected. Continue?')) return;
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

  const downloadAll = useCallback(async () => {
    const blobs = doneBlobsRef.current;
    if (blobs.length === 0) return;
    if (blobs.length === 1) {
      downloadOrShare(URL.createObjectURL(blobs[0]!), 'optimized.avif');
      return;
    }
    const zip = new JSZip();
    batch.files.forEach((bf, i) => {
      if (bf.status === 'done' && bf.result) {
        zip.file(bf.file.name.replace(/\.[^.]+$/, '') + '.avif', bf.result);
      }
    });
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    blobUrlsRef.current.push(url);
    downloadOrShare(url, 'avif-images.zip');
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
            Optimize All ({batch.files.length})
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
          <Settings2 className="w-4 h-4" />
          AVIF Settings
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => applyPreset(i)}
              className={`px-3 py-2 rounded-[var(--radius-md)] text-xs font-medium border transition-colors ${
                preset === i
                  ? 'bg-[var(--accent-ink)] text-white border-[var(--accent-ink)]'
                  : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Quality: {customQuality}%
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={customQuality}
              onChange={(e) => {
                setCustomQuality(Number(e.target.value));
                setPreset(-1);
              }}
              className="w-full mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Max Width: {maxWidth === 0 ? 'Original' : `${maxWidth}px`}
            </label>
            <input
              type="range"
              min="0"
              max="4000"
              step="100"
              value={maxWidth}
              onChange={(e) => {
                setMaxWidth(Number(e.target.value));
                setPreset(-1);
              }}
              className="w-full mt-1"
            />
          </div>
        </div>
      </div>

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

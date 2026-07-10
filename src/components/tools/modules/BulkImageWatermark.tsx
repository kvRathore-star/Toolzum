"use client";
import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { Upload, Download, Type, Image as ImageIcon, X, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ProDownloadButton } from './ProDownloadButton';
import { withErrorHandling } from '@/lib/withErrorHandling';
import { hasLargeFiles, checkMemory } from '@/lib/fileUtils';
import NextImage from "next/image";

const POSITIONS = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'] as const;

export default function BulkImageWatermark() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkImage, setWatermarkImage] = useState<string | null>(null);
  const [position, setPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'>('bottom-right');
  const [opacity, setOpacity] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedBlobs, setProcessedBlobs] = useState<Blob[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const accepted = Array.from(e.target.files || []);
    if (accepted.length === 0) return;
    setFiles(prev => [...prev, ...accepted]);
    accepted.forEach(f => {
      const url = URL.createObjectURL(f);
      setPreviews(prev => [...prev, url]);
    });
    toast.success(`Added ${accepted.length} file(s)`);
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
    setProcessedBlobs([]);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setWatermarkImage(url);
    toast.success('Logo loaded');
  };

  const handleProcess = async () => {
    if (files.length === 0) { toast.error('Upload images first'); return; }
    if (watermarkType === 'text' && !watermarkText.trim()) { toast.error('Enter watermark text'); return; }
    if (watermarkType === 'image' && !watermarkImage) { toast.error('Upload a logo image'); return; }
    if (hasLargeFiles(files)) {
      const mem = checkMemory();
      const proceed = window.confirm(
        `Large images detected (>100MB).${mem.low ? ` Your device has only ${mem.available} RAM.` : ''} Processing may exceed browser memory limits on low-RAM devices. Continue?`
      );
      if (!proceed) return;
    }
    setIsProcessing(true);
    try {
      const blobs: Blob[] = [];
      for (const file of files) {
        const result = await withErrorHandling(async () => {
          const img = await createImageBitmap(file);
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0);
          img.close();

          const imgEl = new Image();
          imgEl.src = canvas.toDataURL();
          await new Promise<void>(resolve => { imgEl.onload = () => resolve(); });

          return await new Promise<Blob>(resolve => {
            const c = document.createElement('canvas');
            c.width = imgEl.naturalWidth;
            c.height = imgEl.naturalHeight;
            const cx = c.getContext('2d')!;

            cx.drawImage(imgEl, 0, 0);

            cx.globalAlpha = opacity / 100;
            const pad = 20;
            const mSize = Math.min(c.width, c.height) * 0.15;

            if (watermarkType === 'text' && watermarkText) {
              cx.font = `bold ${mSize * 0.2}px sans-serif`;
              cx.fillStyle = 'white';
              cx.strokeStyle = 'black';
              cx.lineWidth = 2;
              const metrics = cx.measureText(watermarkText);
              const tw = metrics.width;
              const th = mSize * 0.2;
              let x: number, y: number;
              switch (position) {
                case 'top-left': x = pad; y = pad + th; break;
                case 'top-right': x = c.width - tw - pad; y = pad + th; break;
                case 'bottom-left': x = pad; y = c.height - pad; break;
                case 'bottom-right': x = c.width - tw - pad; y = c.height - pad; break;
                case 'center': x = (c.width - tw) / 2; y = (c.height + th) / 2; break;
              }
              cx.strokeText(watermarkText, x, y);
              cx.fillText(watermarkText, x, y);
            }

            if (watermarkType === 'image' && watermarkImage) {
              const logo = new Image();
              logo.onload = () => {
                const lw = mSize;
                const lh = (logo.naturalHeight / logo.naturalWidth) * lw;
                let lx: number, ly: number;
                switch (position) {
                  case 'top-left': lx = pad; ly = pad; break;
                  case 'top-right': lx = c.width - lw - pad; ly = pad; break;
                  case 'bottom-left': lx = pad; ly = c.height - lh - pad; break;
                  case 'bottom-right': lx = c.width - lw - pad; ly = c.height - lh - pad; break;
                  case 'center': lx = (c.width - lw) / 2; ly = (c.height + lh) / 2; break;
                }
                cx.drawImage(logo, lx, ly, lw, lh);
                cx.globalAlpha = 1;
                c.toBlob(b => resolve(b!), 'image/png');
              };
              logo.src = watermarkImage;
            } else {
              cx.globalAlpha = 1;
              c.toBlob(b => resolve(b!), 'image/png');
            }
          });
        }, { toast: `Failed to watermark ${file.name}`, log: true });
        if (result) blobs.push(result);
      }
      setProcessedBlobs(blobs);
      if (blobs.length < files.length) {
        toast.error(`${files.length - blobs.length} image(s) failed — memory or processing error`);
      } else {
        toast.success(`Watermarked ${blobs.length} images`);
      }
    } catch {
      toast.error('Browser memory limit reached. Try smaller batches or close other tabs.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    processedBlobs.forEach((blob, i) => {
      zip.file(files[i].name.replace(/\.[^.]+$/, '') + '-watermarked.png', blob);
    });
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'watermarked-images.zip';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('ZIP downloaded');
  };

  const downloadEach = () => {
    processedBlobs.forEach((blob, i) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = files[i].name.replace(/\.[^.]+$/, '') + '-watermarked.png';
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-6 sm:p-8 space-y-6">
        {/* Upload */}
        <div
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[var(--border-subtle)] rounded-[var(--radius-xl)] cursor-pointer hover:border-[var(--accent)]/50 transition-colors bg-[var(--bg-overlay)]"
        >
          <Upload className="w-8 h-8 text-[var(--text-muted)] mb-2" />
          <p className="text-sm text-[var(--text-primary)] font-medium">Upload images</p>
          <p className="text-xs text-[var(--text-muted)]">PNG, JPG, WebP</p>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
        </div>

        {files.length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {files.map((f, i) => (
              <div key={i} className="relative group">
                <NextImage src={previews[i]} alt="" unoptimized={true} className="w-full h-16 object-cover rounded-[var(--radius-md)]" />
                <button onClick={() => removeFile(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
                <span className="text-[10px] text-[var(--text-muted)] truncate block mt-0.5">{f.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Watermark type toggle */}
        <div className="flex gap-2 p-1 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] w-fit">
          <button onClick={() => setWatermarkType('text')} className={`px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] transition-all ${watermarkType === 'text' ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
            <Type className="w-4 h-4 inline mr-1.5" />Text
          </button>
          <button onClick={() => setWatermarkType('image')} className={`px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] transition-all ${watermarkType === 'image' ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
            <ImageIcon className="w-4 h-4 inline mr-1.5" />Logo
          </button>
        </div>

        {watermarkType === 'text' ? (
          <input
            value={watermarkText}
            onChange={e => setWatermarkText(e.target.value)}
            placeholder="Enter watermark text..."
            className="w-full p-3 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
          />
        ) : (
          <div onClick={() => logoRef.current?.click()} className="flex items-center gap-3 p-3 bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] rounded-[var(--radius-lg)] cursor-pointer hover:border-[var(--accent)]/50 transition-colors">
            {watermarkImage ? (
              <>
                <NextImage src={watermarkImage} alt="" unoptimized={true} className="w-10 h-10 object-contain rounded" />
                <span className="text-sm text-[var(--text-primary)]">Logo loaded — click to change</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-[var(--text-muted)]" />
                <span className="text-sm text-[var(--text-muted)]">Upload logo (PNG/SVG)</span>
              </>
            )}
            <input ref={logoRef} type="file" accept="image/png,image/svg+xml" onChange={handleLogoUpload} className="hidden" />
          </div>
        )}

        {/* Position & Opacity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Position</label>
            <select value={position} onChange={e => setPosition(e.target.value as typeof position)} className="w-full p-2.5 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] text-sm text-[var(--text-primary)]">
              {POSITIONS.map(p => <option key={p} value={p}>{p.replace('-', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Opacity: {opacity}%</label>
            <input type="range" min={10} max={100} value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="w-full" />
          </div>
        </div>

        {/* Process */}
        <button
          onClick={handleProcess}
          disabled={isProcessing || files.length === 0}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent)] text-white font-medium rounded-[var(--radius-lg)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
          {isProcessing ? `Watermarking ${files.length} images...` : `Apply Watermark to ${files.length} Image(s)`}
        </button>

        {/* Download */}
        {processedBlobs.length > 0 && (
          <ProDownloadButton
            fileCount={processedBlobs.length}
            onDownloadAll={downloadAll}
            onDownloadEach={downloadEach}
            isProcessing={false}
          />
        )}
      </div>
    </div>
  );
}

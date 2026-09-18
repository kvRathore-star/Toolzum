"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { downloadOrShare } from '@/utils/nativeShare';

interface DecodedQr {
  data: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function QrCodeReader() {
  const [file, setFile] = useState<File | null>(null);
  const [decodedData, setDecodedData] = useState<DecodedQr[]>([]);
  const [preview, setPreview] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const blobUrlRef = useRef<string | null>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const processFile = async (f: File) => {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(f.type) && !f.name.match(/\.(png|jpe?g|webp)$/i)) {
      toast.error('Unsupported format. Use PNG, JPG, or WebP.');
      return;
    }
    setFile(f);
    setError('');
    setDecodedData([]);
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    const url = URL.createObjectURL(f);
    blobUrlRef.current = url;
    setPreview(url);
    decodeQr(f);
  };

  const decodeQr = async (imgFile: File) => {
    setIsProcessing(true);

    try {
      const jsQR = (await import('jsqr')).default;
      const bitmap = await createImageBitmap(imgFile);
      setImageDimensions({ width: bitmap.width, height: bitmap.height });
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { toast.error('Canvas not supported'); return; }
      ctx.drawImage(bitmap, 0, 0);
      const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
      bitmap.close();

      if (code) {
        setDecodedData([{ data: code.data, x: code.location.topLeftCorner.x, y: code.location.topLeftCorner.y, width: code.location.bottomRightCorner.x - code.location.topLeftCorner.x, height: code.location.bottomRightCorner.y - code.location.topLeftCorner.y }]);
        // jsQR returns content + corner location only — it exposes no version
        // or error-correction level, so only real decoded data is shown.
        toast.success('QR code detected!');
      } else {
        setError('No QR code found in the image');
        toast.error('No QR code detected. Try a clearer image.');
      }
    } catch {
      setError('Failed to process image');
      toast.error('Failed to decode QR code');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    processFile(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleCopyData = async (text: string) => {
    try {
      await clipboardWrite(text);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleCopyAll = async () => {
    if (decodedData.length === 0) return;
    try {
      const all = decodedData.map(d => d.data).join('\n---\n');
      await clipboardWrite(all);
      toast.success('All data copied!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleDownloadResult = async () => {
    if (decodedData.length === 0) return;
    try {
      const content = decodedData.map(d => d.data).join('\n---\n');
      const blob = new Blob([content], { type: 'text/plain' });
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
      await downloadOrShare(url, 'qr-codes-decoded.txt');
    } catch {
      toast.error('Download failed');
    }
  };

  const handleReset = () => {
    setFile(null);
    setDecodedData([]);
    setPreview('');
    setError('');
    setImageDimensions({ width: 0, height: 0 });
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    blobUrlRef.current = null;
  };

  const handlePaste = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const blob = await (item.getType('image/png') || item.getType('image/jpeg') || item.getType('image/webp'));
        if (blob) {
          const f = new File([blob], 'pasted-image.png', { type: blob.type });
          processFile(f);
          return;
        }
      }
      toast.error('No image found in clipboard');
    } catch {
      toast.error('Clipboard access denied');
    }
  };

  useEffect(() => {
    if (!overlayRef.current || decodedData.length === 0 || !imageRef.current) return;
    const ov = overlayRef.current;
    const ctx = ov.getContext('2d');
    if (!ctx) return;
    const img = imageRef.current;
    ov.width = img.naturalWidth;
    ov.height = img.naturalHeight;
    ctx.clearRect(0, 0, ov.width, ov.height);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 4]);
    for (const qr of decodedData) {
      ctx.strokeRect(qr.x, qr.y, qr.width, qr.height);
      ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
      ctx.fillRect(qr.x, qr.y, qr.width, qr.height);
    }
  }, [decodedData, preview]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-2xl text-[var(--accent)] text-sm space-y-1">
        <h4 className="font-bold text-[var(--text-primary)]">QR Code Reader</h4>
        <p className="text-[var(--text-secondary)]">Scan QR codes from images. 100% browser-based.</p>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl p-6 space-y-5">
        <div
          ref={dropRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          role="group"
          aria-label="Drop a QR code image here, or tab to the file picker below"
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${dragOver ? 'border-[var(--accent)] bg-[var(--accent)]/5 scale-[1.02]' : 'border-[var(--border-subtle)] hover:border-[var(--accent)]'}`}
        >
          <label className="cursor-pointer">
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileSelect} className="sr-only" aria-label="Upload QR Code Image" />
            <div className="text-[var(--text-muted)] text-sm">
              <p className="font-medium text-[var(--text-secondary)] mb-1">Upload QR Code Image</p>
              <p className="text-xs">Drag & drop or click to select (PNG, JPG, WebP)</p>
            </div>
          </label>
        </div>

        <div className="flex items-center justify-center">
          <button onClick={handlePaste} className="text-xs text-[var(--accent)] hover:text-[var(--accent)] font-bold px-4 py-2 border border-[var(--accent)]/30 rounded-lg hover:bg-[var(--accent)]/10 transition-colors">Paste from Clipboard</button>
        </div>

        {file && (
          <div className="flex items-center justify-between bg-[var(--bg-overlay)]/30 rounded-xl px-4 py-2.5">
            <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
              <span className="font-medium text-[var(--text-primary)]">{file.name}</span>
              <span>({(file.size / 1024).toFixed(1)} KB)</span>
              {imageDimensions.width > 0 && <span className="text-[var(--text-muted)]">| {imageDimensions.width}x{imageDimensions.height}px</span>}
            </div>
            <button onClick={handleReset} className="text-xs text-red-700 dark:text-red-400 hover:text-red-300 font-bold">Clear</button>
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center justify-center py-8">
            <div className="w-7 h-7 border-[3px] border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            <div className="ml-4">
              <p className="text-sm font-medium text-[var(--text-primary)]">Scanning for QR codes...</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Analyzing image data with jsQR engine</p>
            </div>
          </div>
        )}

        {error && !isProcessing && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 flex items-start gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Detection Failed</p>
              <p className="text-xs text-red-500/80 mt-1">{error}</p>
            </div>
            <button onClick={handleReset} className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 underline shrink-0">Try Another</button>
          </div>
        )}

        {preview && !isProcessing && (
          <div className="flex flex-col items-center">
            <div className="relative inline-block max-w-full">
              <img ref={imageRef} src={preview} alt="QR code preview" className="max-h-80 rounded-xl border border-[var(--border-subtle)]" />
              <canvas ref={overlayRef} className="absolute inset-0 pointer-events-none" />
            </div>
            {decodedData.length > 0 && (
              <div className="flex items-center gap-4 mt-3 text-xs text-[var(--text-secondary)]">
                <span>Content length: {decodedData[0]!.data.length} chars</span>
              </div>
            )}
          </div>
        )}

        {decodedData.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-bold text-[var(--text-primary)]">Decoded Data</h5>
              {decodedData.length > 1 && <span className="text-xs text-[var(--text-muted)]">{decodedData.length} QR codes found</span>}
            </div>
            {decodedData.map((qr, i) => (
              <div key={i} className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      {decodedData.length > 1 && <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">QR #{i + 1}</span>}
                      <span className="text-[10px] text-[var(--text-muted)]">at ({qr.x}, {qr.y})</span>
                    </div>
                    <pre className="text-xs font-mono text-[var(--text-primary)] whitespace-pre-wrap break-all max-h-32 overflow-y-auto">{qr.data}</pre>
                  </div>
                  <button onClick={() => handleCopyData(qr.data)} className="shrink-0 text-xs text-[var(--accent)] hover:text-[var(--accent)] font-bold px-2 py-1 border border-[var(--accent)]/30 rounded-lg hover:bg-[var(--accent)]/10 transition-colors">Copy</button>
                </div>
              </div>
            ))}
            <div className="flex gap-3">
              <button onClick={handleCopyAll} className="flex-1 px-4 py-2.5 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-sm font-bold rounded-xl transition-colors">Copy All</button>
              <button onClick={handleDownloadResult} className="flex-1 px-4 py-2.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm font-bold rounded-xl transition-colors">Download</button>
            </div>
          </div>
        )}

        {!file && !isProcessing && !error && (
          <div className="text-center py-6 text-[var(--text-muted)] text-sm border-t border-[var(--border-subtle)]">
            <p>Upload an image containing a QR code to get started.</p>
            <p className="text-xs mt-1">Decodes one QR code per image — the clearest, largest code.</p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { PDFDocument } from 'pdf-lib';

interface ImageItem {
  file: File;
  dataUrl: string;
}

export default function ScanToPdf() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const handleFiles = (files: FileList) => {
    const valid: ImageItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i]!;
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image.`);
        continue;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        valid.push({ file, dataUrl: e.target?.result as string });
        if (valid.length === files.length || (i === files.length - 1 && valid.length > 0)) {
          const totalFiles = files.length;
          const handle = requestAnimationFrame(() => {
            setImages(prev => {
              const existingUrls = new Set(prev.map(p => p.dataUrl));
              const newOnes = valid.filter(v => !existingUrls.has(v.dataUrl));
              return [...prev, ...newOnes];
            });
            setOutputUrl(null);
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setOutputUrl(null);
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= images.length) return;
    setImages(prev => {
      const arr = [...prev];
      [arr[index], arr[newIndex]] = [arr[newIndex]!, arr[index]!];
      return arr;
    });
    setOutputUrl(null);
  };

  const clearAll = () => {
    setImages([]);
    setOutputUrl(null);
  };

  const convertToPdf = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      for (const img of images) {
        const bytes = await img.file.arrayBuffer();
        const uint8 = new Uint8Array(bytes);
        let image;
        if (img.file.type === 'image/png') {
          image = await pdfDoc.embedPng(uint8);
        } else {
          image = await pdfDoc.embedJpg(uint8);
        }
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success("PDF created successfully!");
    } catch {
      toast.error("An error occurred while creating PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (images.length === 0) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-700 dark:text-blue-400 text-sm">
          <strong>Scan to PDF:</strong> Turn photos of documents into a professional PDF document. All processing happens in your browser &mdash; nothing is uploaded.
        </div>
        <div
          role="button" tabIndex={0} aria-label="Upload photos to convert" onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
          className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-3xl transition-all duration-300 ease-in-out cursor-pointer border-zinc-300 dark:border-zinc-700 bg-[var(--bg-overlay)] dark:bg-zinc-900/30 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 hover:border-zinc-400 dark:hover:border-zinc-500"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
          <div className="p-4 rounded-full mb-4 bg-white dark:bg-[var(--bg-surface)] text-[var(--text-secondary)] shadow-sm border border-zinc-100 dark:border-zinc-700">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <p className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Upload Photos to Convert</p>
          <p className="text-sm text-[var(--text-secondary)]">Select multiple images to combine into a single PDF</p>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          Files processed locally
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{images.length} Image{images.length !== 1 ? 's' : ''}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">Arrange images in desired order</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => inputRef.current?.click()}
            className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
          >
            Add More
          </button>
          <button
            onClick={clearAll}
            className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
          >
            Clear All
          </button>
        </div>
        <input aria-label="Clear All"
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 h-fit">
          <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">Image Order</h4>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {images.map((img, idx) => (
              <div key={`${img.dataUrl}-${idx}`} className="flex items-center gap-3 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-2">
                <span className="text-xs font-bold text-[var(--text-muted)] w-5 text-center shrink-0">{idx + 1}</span>
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-200 dark:bg-[var(--bg-surface)] shrink-0">
                  <img src={img.dataUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <span className="text-xs text-zinc-600 dark:text-[var(--text-muted)] truncate flex-1">{img.file.name}</span>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => moveImage(idx, -1)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <button
                    onClick={() => moveImage(idx, 1)}
                    disabled={idx === images.length - 1}
                    className="p-1.5 rounded-lg bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  <button
                    onClick={() => removeImage(idx)}
                    className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={convertToPdf}
            disabled={isProcessing}
            className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            {isProcessing ? "Creating PDF..." : `Create PDF (${images.length} pages)`}
          </button>
        </div>

        <div className="space-y-6">
          {outputUrl ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                <h4 className="font-bold text-emerald-500">PDF Created</h4>
              </div>

              <div className="bg-emerald-700/10 rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-emerald-500">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="font-bold">combined_document.pdf</p>
              </div>

              <button
                onClick={() => downloadOrShare(outputUrl, 'combined_document.pdf')}
                className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download PDF
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-[var(--text-primary)] font-medium">Preview</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img, idx) => (
                  <div key={`${img.dataUrl}-${idx}`} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-200 dark:bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <img src={img.dataUrl} alt="" className="w-full h-full object-cover" />
                    <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

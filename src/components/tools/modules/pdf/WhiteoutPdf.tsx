"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { PDFDocument, rgb } from 'pdf-lib';

function parsePageRange(input: string, max: number): number[] {
  const pages: Set<number> = new Set();
  const parts = input.split(',');
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const from = Math.max(1, Math.min(start, end));
        const to = Math.min(max, Math.max(start, end));
        for (let i = from; i <= to; i++) pages.add(i);
      }
    } else {
      const num = parseInt(trimmed, 10);
      if (!isNaN(num) && num >= 1 && num <= max) pages.add(num);
    }
  }
  return [...pages].sort((a, b) => a - b);
}

export default function WhiteoutPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState(0);

  const [mode, setMode] = useState<'full' | 'custom'>('full');
  const [pageRange, setPageRange] = useState('');
  const [area, setArea] = useState({ x: 50, y: 50, w: 200, h: 100 });
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const handleFileSelect = async (selectedFile: File) => {
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setPageCount(pdfDoc.getPageCount());
      setFileBytes(arrayBuffer);
      setFile(selectedFile);
      setOutputUrl(null);
    } catch (e) {
      toast.error("Failed to load PDF. It might be encrypted or corrupted.");
    }
  };

  const clearAll = () => {
    setFile(null);
    setFileBytes(null);
    setOutputUrl(null);
    setPageCount(0);
  };

  const processWhiteout = async () => {
    if (!fileBytes || !file) return;
    if (!pageRange.trim()) {
      toast.error("Please enter page range.");
      return;
    }
    const pages = parsePageRange(pageRange, pageCount);
    if (pages.length === 0) {
      toast.error("No valid pages found in the page range.");
      return;
    }

    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.load(fileBytes);

      for (const pageNum of pages) {
        const page = pdfDoc.getPage(pageNum - 1);
        const { width, height } = page.getSize();

        if (mode === 'full') {
          page.drawRectangle({
            x: 0,
            y: 0,
            width,
            height,
            color: rgb(1, 1, 1),
            borderColor: rgb(1, 1, 1),
            borderWidth: 0,
          });
        } else {
          page.drawRectangle({
            x: area.x,
            y: height - area.y - area.h,
            width: area.w,
            height: area.h,
            color: rgb(1, 1, 1),
            borderColor: rgb(1, 1, 1),
            borderWidth: 0,
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success("Whiteout applied successfully!");
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while applying whiteout.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-700 dark:text-blue-400 text-sm">
          <strong>Whiteout:</strong> Covers content with white rectangles. This is visual redaction — content is hidden but still in the file. For permanent removal use Redact PDF.
        </div>
        <FileUploader
          accept="application/pdf"
          onFileSelect={handleFileSelect}
          title="Upload PDF to Whiteout"
          subtitle="Drag & drop your document here"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB • {pageCount} Pages</p>
        </div>
        <button
          onClick={clearAll}
          className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
        >
          Change File
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 h-fit">
          <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">Whiteout Settings</h4>

          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode('full')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${mode === 'full' ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)] hover:border-blue-300'}`}
              >
                Full Page
              </button>
              <button
                onClick={() => setMode('custom')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${mode === 'custom' ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)] hover:border-blue-300'}`}
              >
                Custom Area
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Page Range</label>
            <input aria-label="Page Range"
              type="text"
              placeholder="e.g. 1-3,5,7-9"
              value={pageRange}
              onChange={(e) => setPageRange(e.target.value)}
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] font-mono text-sm"
            />
            <p className="text-xs text-[var(--text-secondary)] mt-1">Total pages: {pageCount}</p>
          </div>

          {mode === 'custom' && (
            <div className="grid grid-cols-2 gap-3">
              {(['x', 'y', 'w', 'h'] as const).map((key) => (
                <div key={key}>
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">{key === 'w' ? 'Width' : key === 'h' ? 'Height' : key.toUpperCase()} (pts)</label>
                  <input aria-label={`${key === 'w' ? 'Width' : key === 'h' ? 'Height' : key.toUpperCase()} (pts)`}
                    type="number"
                    min={0}
                    max={5000}
                    value={area[key]}
                    onChange={(e) => setArea({ ...area, [key]: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]"
                  />
                </div>
              ))}
            </div>
          )}

          <button
            onClick={processWhiteout}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {isProcessing ? "Processing..." : "Apply Whiteout"}
          </button>
        </div>

        <div className="space-y-6">
          {outputUrl ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                <h4 className="font-bold text-emerald-500">Whiteout Complete</h4>
              </div>

              <div className="bg-emerald-700/10 rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-emerald-500">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="font-bold text-center">whiteout_{file.name}</p>
              </div>

              <button
                onClick={() => downloadOrShare(outputUrl, `whiteout_${file.name}`)}
                className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download Whiteout PDF
              </button>
            </div>
          ) : (
            <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-[var(--text-muted)]">
              <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p>Whiteout PDF will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

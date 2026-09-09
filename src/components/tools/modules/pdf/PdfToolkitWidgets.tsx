"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { FileUploader } from '../../FileUploader';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { EmptyState } from '@/components/EmptyState';

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 1, 1];
  return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255];
}

export function PdfBackgroundColor() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    return () => { if (outputUrl) URL.revokeObjectURL(outputUrl); };
  }, [outputUrl]);

  const handleFileSelect = async (selectedFile: File) => {
    try {
      const buf = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buf);
      setPageCount(pdfDoc.getPageCount());
      setFileBuffer(buf);
      setFile(selectedFile);
      setOutputUrl(null);
    } catch { toast.error('Failed to load PDF.'); }
  };

  const process = async () => {
    if (!fileBuffer || !file) return;
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const c = hexToRgb(bgColor);
      for (const page of pdfDoc.getPages()) {
        const { width, height } = page.getSize();
        page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(c[0], c[1], c[2]), opacity: 0.15 });
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success('Background color applied!');
    } catch { toast.error('Failed to apply background color.'); }
    finally { setIsProcessing(false); }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-700 dark:text-blue-400 text-sm">
          <strong>PDF Background Color:</strong> Add a subtle color tint to all pages in your PDF.
        </div>
        <FileUploader accept="application/pdf" onFileSelect={handleFileSelect} title="Upload PDF" subtitle="Select a PDF to add background color" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB &middot; {pageCount} Pages</p>
        </div>
        <button onClick={() => { setFile(null); setFileBuffer(null); setOutputUrl(null); setPageCount(0); }}
          className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg">Change File</button>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Background Color (subtle tint)</label>
        <input aria-label="Background Color (subtle tint)" type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
          className="w-full h-12 rounded-lg cursor-pointer border border-[var(--border-subtle)]" />
      </div>
      <button onClick={process} disabled={isProcessing}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50">
        {isProcessing ? 'Processing...' : 'Apply Background Color'}
      </button>
      {outputUrl ? (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4">
          <h4 className="font-bold text-emerald-500">Done</h4>
          <button onClick={() => downloadOrShare(outputUrl, `bg_${file.name}`)}
            className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg">Download PDF</button>
        </div>
      ) : (
        <div className="border border-dashed border-[var(--border-subtle)] rounded-2xl">
          <EmptyState
            title="Colored PDF will appear here"
            message="Pick a background color above to begin."
          />
        </div>
      )}
    </div>
  );
}

const PAGE_SIZES: Record<string, [number, number]> = {
  a4: [595.28, 841.89], letter: [612, 792], legal: [612, 1008], a3: [841.89, 1190.55],
};

export function PdfAddBlankPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [blankCount, setBlankCount] = useState(1);
  const [blankPosition, setBlankPosition] = useState<'before' | 'after'>('after');
  const [blankPage, setBlankPage] = useState(1);
  const [targetSize, setTargetSize] = useState('a4');
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    return () => { if (outputUrl) URL.revokeObjectURL(outputUrl); };
  }, [outputUrl]);

  const handleFileSelect = async (selectedFile: File) => {
    try {
      const buf = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buf);
      setPageCount(pdfDoc.getPageCount());
      setFileBuffer(buf);
      setFile(selectedFile);
      setOutputUrl(null);
    } catch { toast.error('Failed to load PDF.'); }
  };

  const process = async () => {
    if (!fileBuffer || !file) return;
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const pages = pdfDoc.getPages();
      const [pw, ph] = PAGE_SIZES[targetSize] || [595.28, 841.89];
      for (let i = 0; i < blankCount; i++) {
        const blankPageObj = pdfDoc.addPage([pw, ph]);
        const targetIdx = blankPosition === 'before'
          ? Math.min(blankPage - 1, pages.length)
          : Math.min(blankPage, pages.length);
        pages.splice(targetIdx, 0, blankPageObj);
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success('Blank pages added!');
    } catch { toast.error('Failed to add blank pages.'); }
    finally { setIsProcessing(false); }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-700 dark:text-blue-400 text-sm">
          <strong>Add Blank Pages:</strong> Insert blank pages at any position in your PDF.
        </div>
        <FileUploader accept="application/pdf" onFileSelect={handleFileSelect} title="Upload PDF" subtitle="Select a PDF to add blank pages" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB &middot; {pageCount} Pages</p>
        </div>
        <button onClick={() => { setFile(null); setFileBuffer(null); setOutputUrl(null); setPageCount(0); }}
          className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg">Change File</button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Number of Blank Pages</label>
          <input aria-label="Number of Blank Pages" type="number" value={blankCount} onChange={(e) => setBlankCount(Math.max(1, parseInt(e.target.value) || 1))} min={1} max={50}
            className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Page Size</label>
          <select aria-label="Page Size" value={targetSize} onChange={(e) => setTargetSize(e.target.value)}
            className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]">
            <option value="a4">A4</option><option value="letter">Letter</option><option value="legal">Legal</option><option value="a3">A3</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Insert Position</label>
          <select aria-label="Insert Position" value={blankPosition} onChange={(e) => setBlankPosition(e.target.value as 'before' | 'after')}
            className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]">
            <option value="after">After Page</option><option value="before">Before Page</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">At Page</label>
          <input aria-label="At Page" type="number" value={blankPage} onChange={(e) => setBlankPage(Math.max(1, Math.min(pageCount, parseInt(e.target.value) || 1)))} min={1} max={pageCount}
            className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]" />
        </div>
      </div>
      <button onClick={process} disabled={isProcessing}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50">
        {isProcessing ? 'Processing...' : 'Add Blank Pages'}
      </button>
      {outputUrl ? (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4">
          <h4 className="font-bold text-emerald-500">Done</h4>
          <button onClick={() => downloadOrShare(outputUrl, `blank_${file.name}`)}
            className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg">Download PDF</button>
        </div>
      ) : (
        <div className="border border-dashed border-[var(--border-subtle)] rounded-2xl">
          <EmptyState
            title="Updated PDF will appear here"
            message="Add blank pages above to begin."
          />
        </div>
      )}
    </div>
  );
}

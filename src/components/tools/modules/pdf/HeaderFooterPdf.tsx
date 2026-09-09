"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export default function HeaderFooterPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  const [headerText, setHeaderText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [fontSize, setFontSize] = useState(10);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [pageRange, setPageRange] = useState('');
  const [topMargin, setTopMargin] = useState(20);
  const [bottomMargin, setBottomMargin] = useState(20);
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
      setTotalPages(pdfDoc.getPageCount());
      setFileBuffer(arrayBuffer);
      setFile(selectedFile);
      setOutputUrl(null);
    } catch (e) {
      toast.error("Failed to load PDF. It might be encrypted or corrupted.");
    }
  };

  const clearAll = () => {
    setFile(null);
    setFileBuffer(null);
    setOutputUrl(null);
    setTotalPages(0);
  };

  const parsePageRange = (): number[] | null => {
    if (!pageRange.trim()) return null;
    const pages: number[] = [];
    const parts = pageRange.split(',');
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [start = 0, end = 0] = trimmed.split('-').map(s => parseInt(s.trim()));
        if (isNaN(start) || isNaN(end)) return null;
        for (let i = start; i <= end; i++) pages.push(i);
      } else {
        const p = parseInt(trimmed);
        if (isNaN(p)) return null;
        pages.push(p);
      }
    }
    return [...new Set(pages)].filter(p => p >= 1 && p <= totalPages);
  };

  const applyHeaderFooter = async () => {
    if (!fileBuffer || !file) return;
    if (!headerText.trim() && !footerText.trim()) {
      toast.error("Enter at least header or footer text.");
      return;
    }

    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();
      const targetPages = parsePageRange() ?? pages.map((_, i) => i + 1);
      const now = new Date().toLocaleDateString();

      for (const pageNum of targetPages) {
        const page = pages[pageNum - 1]!;
        const { width, height } = page.getSize();

        const resolveText = (text: string) =>
          text
            .replace(/\{\{page\}\}/g, String(pageNum))
            .replace(/\{\{total\}\}/g, String(totalPages))
            .replace(/\{\{date\}\}/g, now);

        if (headerText.trim()) {
          const text = resolveText(headerText);
          const textWidth = font.widthOfTextAtSize(text, fontSize);
          let x: number;
          if (alignment === 'left') x = topMargin;
          else if (alignment === 'right') x = width - topMargin - textWidth;
          else x = width / 2 - textWidth / 2;

          page.drawText(text, {
            x,
            y: height - topMargin - fontSize,
            size: fontSize,
            font: boldFont,
            color: rgb(0.2, 0.2, 0.2),
          });
        }

        if (footerText.trim()) {
          const text = resolveText(footerText);
          const textWidth = font.widthOfTextAtSize(text, fontSize);
          let x: number;
          if (alignment === 'left') x = bottomMargin;
          else if (alignment === 'right') x = width - bottomMargin - textWidth;
          else x = width / 2 - textWidth / 2;

          page.drawText(text, {
            x,
            y: bottomMargin,
            size: fontSize,
            font: font,
            color: rgb(0.3, 0.3, 0.3),
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });

      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success("Header/Footer applied successfully!");
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while adding header/footer.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-700 dark:text-blue-400 text-sm">
          <strong>Header & Footer:</strong> Add consistent header and footer text to every page of your PDF. Supports page numbers, total pages, and date insertion.
        </div>
        <FileUploader
          accept="application/pdf"
          onFileSelect={handleFileSelect}
          title="Upload PDF"
          subtitle="Select document to add headers & footers"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB &bull; {totalPages} Pages</p>
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
          <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">Header & Footer Settings</h4>

          <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl text-[var(--accent)] text-xs space-y-1">
            <p><strong>Template Variables:</strong></p>
            <p><code>{'{{page}}'}</code> &mdash; Current page number &nbsp; <code>{'{{total}}'}</code> &mdash; Total pages &nbsp; <code>{'{{date}}'}</code> &mdash; Today&apos;s date</p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Header Text</label>
            <input aria-label="Header Text"
              type="text"
              placeholder="e.g. Confidential &bull; {{page}}/{{total}}"
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Footer Text</label>
            <input aria-label="Footer Text"
              type="text"
              placeholder="e.g. Page {{page}} of {{total}} &mdash; {{date}}"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Font Size</label>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400">{fontSize}pt</span>
            </div>
            <input aria-label="Font Size"
              type="range"
              min="8"
              max="24"
              step="1"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Alignment</label>
            <div className="grid grid-cols-3 gap-2">
              {(['left', 'center', 'right'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setAlignment(opt)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border capitalize ${alignment === opt ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)] hover:border-blue-300'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Top Margin</label>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400">{topMargin}pt</span>
            </div>
            <input aria-label="Top Margin"
              type="range"
              min="10"
              max="80"
              step="2"
              value={topMargin}
              onChange={(e) => setTopMargin(parseInt(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Bottom Margin</label>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400">{bottomMargin}pt</span>
            </div>
            <input aria-label="Bottom Margin"
              type="range"
              min="10"
              max="80"
              step="2"
              value={bottomMargin}
              onChange={(e) => setBottomMargin(parseInt(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Page Range (leave empty for all)</label>
            <input aria-label="Page Range (leave empty for all)"
              type="text"
              placeholder="e.g. 1-5, 8, 11-13"
              value={pageRange}
              onChange={(e) => setPageRange(e.target.value)}
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] text-sm"
            />
          </div>

          <button
            onClick={applyHeaderFooter}
            disabled={isProcessing || (!headerText.trim() && !footerText.trim())}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 mt-4"
          >
            {isProcessing ? "Processing..." : "Apply Header & Footer"}
          </button>
        </div>

        <div className="space-y-6">
          {outputUrl ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
               <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                  <h4 className="font-bold text-emerald-500">Processing Complete</h4>
               </div>

               <div className="bg-emerald-700/10 rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-emerald-500">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <p className="font-bold text-center">annotated_{file.name}</p>
               </div>

               <button
                  onClick={() => downloadOrShare(outputUrl, `annotated_${file.name}`)}
                  className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download Document
                </button>
            </div>
          ) : (
            <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-[var(--text-muted)]">
               <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <p>Generated PDF will appear here</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

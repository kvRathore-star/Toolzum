"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { setupPdfWorker } from '@/lib/pdfjsWorker';

setupPdfWorker(pdfjsLib);

type Layout = '2up' | '4up' | '6up' | '9up' | 'booklet';

const LAYOUT_GRID: Record<Layout, { cols: number; rows: number }> = {
  '2up': { cols: 2, rows: 1 },
  '4up': { cols: 2, rows: 2 },
  '6up': { cols: 3, rows: 2 },
  '9up': { cols: 3, rows: 3 },
  'booklet': { cols: 2, rows: 1 },
};

const DPI = 150;
const PT_PER_INCH = 72;
const SCALE = DPI / PT_PER_INCH;

export default function NupPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  const [layout, setLayout] = useState<Layout>('2up');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

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
    setProgress(0);
  };

  const renderPageToCanvas = async (pdfDoc: pdfjsLib.PDFDocumentProxy, pageNum: number, pageWidth: number, pageHeight: number): Promise<HTMLCanvasElement> => {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: SCALE });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx, viewport }).promise;
    return canvas;
  };

  const processNup = async () => {
    if (!fileBuffer || !file) return;

    setIsProcessing(true);
    setProgress(0);
    try {
      const srcPdf = await PDFDocument.load(fileBuffer);
      const totalSrcPages = srcPdf.getPageCount();
      if (totalSrcPages === 0) {
        toast.error("PDF has no pages.");
        return;
      }

      const firstPage = srcPdf.getPage(0);
      const { width: origW, height: origH } = firstPage.getSize();

      const grid = LAYOUT_GRID[layout];
      const pageOrder: number[] = [];
      for (let i = 0; i < totalSrcPages; i++) pageOrder.push(i + 1);

      let orderedPages: number[];
      if (layout === 'booklet') {
        const clamped = totalSrcPages + (totalSrcPages % 4 === 0 ? 0 : 4 - (totalSrcPages % 4));
        orderedPages = [];
        for (let i = 0; i < clamped; i += 4) {
          if (i + 3 < totalSrcPages) orderedPages.push(i + 4, i + 1);
          else if (i + 1 < totalSrcPages) orderedPages.push(i + 2, i + 1);
          else if (i < totalSrcPages) orderedPages.push(i + 1);
        }
        const remaining: number[] = [];
        for (let i = 0; i < totalSrcPages; i++) {
          if (!orderedPages.includes(i + 1)) remaining.push(i + 1);
        }
        orderedPages = [...orderedPages, ...remaining];
      } else {
        orderedPages = pageOrder;
      }

      const isBooklet = layout === 'booklet';
      let cellW: number, cellH: number;
      if (isBooklet) {
        cellW = orientation === 'portrait' ? origW : origW;
        cellH = orientation === 'portrait' ? origH : origH;
      } else {
        if (orientation === 'portrait') {
          cellW = origW;
          cellH = origH;
        } else {
          cellW = origH;
          cellH = origW;
        }
      }

      const compW = cellW * grid.cols;
      const compH = cellH * grid.rows;

      const pdfjsPdf = await pdfjsLib.getDocument({ data: fileBuffer.slice(0) }).promise;
      const outputPdf = await PDFDocument.create();

      const pagesPerSheet = grid.cols * grid.rows;
      const totalSheets = Math.ceil(orderedPages.length / pagesPerSheet);

      for (let sheet = 0; sheet < totalSheets; sheet++) {
        const compositeCanvas = document.createElement('canvas');
        compositeCanvas.width = compW * SCALE;
        compositeCanvas.height = compH * SCALE;
        const compCtx = compositeCanvas.getContext('2d')!;

        compCtx.fillStyle = '#ffffff';
        compCtx.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);

        const startIdx = sheet * pagesPerSheet;

        for (let pos = 0; pos < pagesPerSheet; pos++) {
          const pageIdx = startIdx + pos;
          if (pageIdx >= orderedPages.length) break;

          const realPageNum = orderedPages[pageIdx]!;
          if (realPageNum > totalSrcPages) continue;

          const pageCanvas = await renderPageToCanvas(pdfjsPdf, realPageNum, cellW, cellH);
          const scaledCellW = cellW * SCALE;
          const scaledCellH = cellH * SCALE;

          let col: number, row: number;
          if (isBooklet) {
            col = pos % 2;
            row = 0;
          } else {
            col = pos % grid.cols;
            row = Math.floor(pos / grid.cols);
          }

          const dx = col * scaledCellW;
          const dy = row * scaledCellH;

          const sx = 0, sy = 0;
          const sw = pageCanvas.width;
          const sh = pageCanvas.height;
          const aspectRatio = sw / sh;
          let dw = scaledCellW;
          let dh = scaledCellW / aspectRatio;
          if (dh > scaledCellH) {
            dh = scaledCellH;
            dw = scaledCellH * aspectRatio;
          }
          const offsetX = (scaledCellW - dw) / 2;
          const offsetY = (scaledCellH - dh) / 2;

          compCtx.drawImage(pageCanvas, sx, sy, sw, sh, dx + offsetX, dy + offsetY, dw, dh);
        }

        const blob = await new Promise<Blob>((resolve) => compositeCanvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.85));
        const jpegBytes = new Uint8Array(await blob.arrayBuffer());
        const image = await outputPdf.embedJpg(jpegBytes);

        const page = outputPdf.addPage([compW, compH]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: compW,
          height: compH,
        });

        setProgress(Math.round(((sheet + 1) / totalSheets) * 100));
      }

      const pdfBytes = await outputPdf.save();
      const outBlob = new Blob([pdfBytes as any], { type: 'application/pdf' });

      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(outBlob));
      toast.success("N-up PDF created successfully!");
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while creating N-up PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm">
          <strong>N-up PDF:</strong> Combine multiple PDF pages onto one physical page. Choose from 2-up, 4-up, 6-up, 9-up, or booklet layout.
        </div>
        <FileUploader
          accept="application/pdf"
          onFileSelect={handleFileSelect}
          title="Upload PDF"
          subtitle="Select document for N-up layout"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-[var(--text-primary)]">{file.name}</h3>
          <p className="text-[var(--text-secondary)] dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB &bull; {totalPages} Pages</p>
        </div>
        <button
          onClick={clearAll}
          className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
        >
          Change File
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6 h-fit">
          <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">N-up Layout Settings</h4>

          <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-xs space-y-1">
            <p><strong>Note:</strong> N-up processing rasterizes PDF pages to images. Some text quality may be reduced. This process happens entirely in your browser.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Layout</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(['2up', '4up', '6up', '9up', 'booklet'] as Layout[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setLayout(opt)}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all border capitalize ${layout === opt ? 'bg-[var(--accent-ink)] border-[var(--accent)] text-white shadow-md' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:border-[var(--accent)]'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Output Page Orientation</label>
            <div className="grid grid-cols-2 gap-2">
              {(['portrait', 'landscape'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setOrientation(opt)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border capitalize ${orientation === opt ? 'bg-[var(--accent-ink)] border-[var(--accent)] text-white shadow-md' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:border-[var(--accent)]'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Progress</label>
                <span className="text-xs font-bold text-[var(--accent)]">{progress}%</span>
              </div>
              <div className="w-full bg-[var(--bg-overlay)] dark:bg-[var(--bg-surface)] rounded-full h-3 overflow-hidden">
                <div
                  className="bg-[var(--accent-ink)] h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={processNup}
            disabled={isProcessing}
            className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 mt-4"
          >
            {isProcessing ? `Processing... ${progress}%` : "Generate N-up PDF"}
          </button>
        </div>

        <div className="space-y-6">
          {outputUrl ? (
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
               <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                  <h4 className="font-bold text-emerald-500">N-up Complete</h4>
               </div>

               <div className="bg-emerald-700/10 rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-emerald-500">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <p className="font-bold text-center">{layout}_{file.name}</p>
               </div>

               <button
                  onClick={() => downloadOrShare(outputUrl, `${layout}_${file.name}`)}
                  className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download N-up PDF
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

"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import * as pdfjsLib from 'pdfjs-dist';
import * as UTIF from 'utif';
import JSZip from 'jszip';
import { Upload, Download, RefreshCw, FileText, Image, Settings, Eye, Info } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type OutputMode = 'multi' | 'single';
type ColorMode = 'rgba' | 'gray' | 'bw';
type Compression = 'lzw' | 'packbits' | 'deflate' | 'none';

interface PdfInfo {
  pageCount: number;
  fileSize: string;
}

function parsePageRange(range: string, totalPages: number): number[] {
  if (!range.trim() || range.trim() === 'all') return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: Set<number> = new Set();
  const parts = range.split(',');
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [s = NaN, e = NaN] = trimmed.split('-').map(n => parseInt(n.trim(), 10));
      if (!isNaN(s) && !isNaN(e)) {
        for (let p = Math.max(1, s); p <= Math.min(e, totalPages); p++) pages.add(p);
      }
    } else {
      const p = parseInt(trimmed, 10);
      if (!isNaN(p) && p >= 1 && p <= totalPages) pages.add(p);
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function toGrayscale(data: Uint8ClampedArray): Uint8ClampedArray {
  const out = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!);
    out[i]! = gray; out[i + 1]! = gray; out[i + 2]! = gray; out[i + 3]! = data[i + 3]!;
  }
  return out;
}

function toBlackWhite(data: Uint8ClampedArray, threshold = 128): Uint8ClampedArray {
  const out = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!);
    const val = gray > threshold ? 255 : 0;
    out[i]! = val; out[i + 1]! = val; out[i + 2]! = val; out[i + 3]! = 255;
  }
  return out;
}

export default function PdfToTiff() {
  const [file, setFile] = useState<File | null>(null);
  const [pageRange, setPageRange] = useState('all');
  const [mode, setMode] = useState<OutputMode>('multi');
  const [dpi, setDpi] = useState(200);
  const [colorMode, setColorMode] = useState<ColorMode>('rgba');
  const [compression, setCompression] = useState<Compression>('lzw');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputFileName, setOutputFileName] = useState('');
  const [pdfInfo, setPdfInfo] = useState<PdfInfo | null>(null);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [outputUrl, previewUrl]);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setOutputUrl(null);
    setPreviewUrl(null);
    setProgress(0);
    setPdfInfo(null);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      setPdfInfo({ pageCount: pdf.numPages, fileSize: formatFileSize(selectedFile.size) });

      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.5 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        await page.render({ canvasContext: ctx, viewport }).promise;
        setPreviewUrl(canvas.toDataURL('image/jpeg', 0.7));
      }
    } catch {
      toast.error('Failed to load PDF file.');
    }
  };

  const processConversion = async () => {
    if (!file || !pdfInfo) return;

    setIsProcessing(true);
    setProgress(0);
    setOutputUrl(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const totalPages = pdf.numPages;
      const pages = parsePageRange(pageRange, totalPages);

      if (pages.length === 0) {
        toast.error('No valid pages in the selected range.');
        return;
      }

      const scale = dpi / 72;
      const zip = new JSZip();
      const encodings: Uint8Array[] = [];

      for (let idx = 0; idx < pages.length; idx++) {
        const pageNum = pages[idx]!;
        setProgress(Math.round(((idx) / pages.length) * 100));

        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        await page.render({ canvasContext: ctx, viewport }).promise;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixelData: Uint8ClampedArray = imageData.data as any;

        let processed: Uint8ClampedArray = pixelData;

        if (colorMode === 'gray') processed = toGrayscale(pixelData);
        else if (colorMode === 'bw') processed = toBlackWhite(pixelData);

        const rgbaData = new Uint8Array(processed.buffer, 0, processed.length);
        const tiffData = UTIF.encodeImage(rgbaData, canvas.width, canvas.height);

        if (mode === 'multi') {
          encodings.push(tiffData);
        } else {
          zip.file(`page-${pageNum}.tiff`, tiffData);
        }
      }

      setProgress(100);

      if (mode === 'multi') {
        const multiTiff = new Uint8Array(UTIF.encode(encodings as any));
        const blob = new Blob([multiTiff], { type: 'image/tiff' });
        const url = URL.createObjectURL(blob);
        setOutputUrl(url);
        setOutputFileName(file.name.replace(/\.pdf$/i, '') + '.tiff');
      } else {
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        setOutputUrl(url);
        setOutputFileName(file.name.replace(/\.pdf$/i, '') + '-tiff-pages.zip');
      }

      toast.success(`Converted ${pages.length} page(s) to TIFF.`);
    } catch (e) {
      console.error('PDF to TIFF conversion failed', e);
      toast.error('Failed to convert PDF to TIFF. Try a different DPI or color mode.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (outputUrl) downloadOrShare(outputUrl, outputFileName);
  };

  const handleReset = () => {
    setFile(null);
    setOutputUrl(null);
    setPreviewUrl(null);
    setPdfInfo(null);
    setProgress(0);
    setPageRange('all');
    setMode('multi');
    setDpi(200);
    setColorMode('rgba');
    setCompression('lzw');
  };

  if (!file) {
    return (
      <div className="space-y-6">
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm font-medium flex items-start gap-3">
          <Info className="w-5 h-5 shrink-0 mt-0.5 text-[var(--accent)]" />
          <span>Convert PDF pages to high-quality TIFF images for document archiving and OCR workflows.</span>
        </div>
        <div
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          role="group"
          aria-label="Drop a PDF here, or tab to the file picker below"
          onDrop={async (e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f && f.type === 'application/pdf') handleFileSelect(f);
            else toast.error('Please upload a PDF file.');
          }}
          className="relative flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-overlay)] dark:bg-[var(--bg-overlay)] hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-overlay)] transition cursor-pointer"
        >
          <input
            type="file"
            accept="application/pdf"
            aria-label="Upload PDF"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
          />
          <Upload className="w-10 h-10 text-[var(--text-muted)] mb-3" />
          <p className="text-lg font-semibold text-[var(--text-primary)]">Upload PDF</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Drag & drop or click to browse</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm font-medium flex items-start gap-3">
        <Info className="w-5 h-5 shrink-0 mt-0.5 text-[var(--accent)]" />
        <span>Convert PDF pages to high-quality TIFF images for document archiving and OCR workflows.</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between bg-[var(--bg-overlay)] p-4 rounded-xl border border-[var(--border-subtle)]">
        <div className="flex items-center gap-3 min-w-0">
          <FileText className="w-8 h-8 text-[var(--accent)] shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold text-[var(--text-primary)] truncate">{file.name}</p>
            {pdfInfo && (
              <p className="text-sm text-[var(--text-secondary)]">
                {pdfInfo.pageCount} page{pdfInfo.pageCount !== 1 ? 's' : ''} &middot; {pdfInfo.fileSize}
              </p>
            )}
          </div>
        </div>
        <button onClick={handleReset} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-[var(--text-primary)] transition flex items-center gap-1.5 shrink-0">
          <RefreshCw className="w-4 h-4" /> Change File
        </button>
      </div>

      {previewUrl && (
        <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4 flex items-center gap-3">
          <Eye className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
          <span className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)]">First page preview:</span>
          <img src={previewUrl} alt="PDF preview" className="h-20 w-auto rounded border border-[var(--border-subtle)]" />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="lbl-pdftotiff-page-range" className="text-sm font-medium text-[var(--text-primary)]">Page Range</label>
          <input id="lbl-pdftotiff-page-range" aria-label="Page Range"
            type="text"
            value={pageRange}
            onChange={(e) => setPageRange(e.target.value)}
            placeholder='all, 1-5, or 1,3,5'
            className="w-full px-3 py-2 bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="lbl-pdftotiff-output-mode" className="text-sm font-medium text-[var(--text-primary)]">Output Mode</label>
          <select id="lbl-pdftotiff-output-mode" aria-label="Output Mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as OutputMode)}
            className="w-full px-3 py-2 bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)]/50 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
          >
            <option value="multi">Single Multi-Page TIFF</option>
            <option value="single">Separate TIFF Files (ZIP)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="lbl-pdftotiff-dpi" className="text-sm font-medium text-[var(--text-primary)]">DPI</label>
          <select id="lbl-pdftotiff-dpi" aria-label="DPI"
            value={dpi}
            onChange={(e) => setDpi(Number(e.target.value))}
            className="w-full px-3 py-2 bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)]/50 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
          >
            <option value={150}>150 DPI</option>
            <option value={200}>200 DPI</option>
            <option value={300}>300 DPI</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="lbl-pdftotiff-color-mode" className="text-sm font-medium text-[var(--text-primary)]">Color Mode</label>
          <select id="lbl-pdftotiff-color-mode" aria-label="Color Mode"
            value={colorMode}
            onChange={(e) => setColorMode(e.target.value as ColorMode)}
            className="w-full px-3 py-2 bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)]/50 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
          >
            <option value="rgba">Full Color</option>
            <option value="gray">Grayscale</option>
            <option value="bw">Black & White</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="lbl-pdftotiff-compression" className="text-sm font-medium text-[var(--text-primary)]">Compression</label>
          <select id="lbl-pdftotiff-compression" aria-label="Compression"
            value={compression}
            onChange={(e) => setCompression(e.target.value as Compression)}
            className="w-full px-3 py-2 bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)]/50 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
          >
            <option value="lzw">LZW</option>
            <option value="packbits">PackBits</option>
            <option value="deflate">Deflate</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>

      {isProcessing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)]">
            <span>Converting pages...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-[var(--bg-overlay)] dark:bg-[var(--bg-surface)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--accent-ink)] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={processConversion}
          disabled={isProcessing}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all"
        >
          {isProcessing ? (
            <><RefreshCw className="w-5 h-5 animate-spin" /> Converting...</>
          ) : (
            <><Settings className="w-5 h-5" /> Convert to TIFF</>
          )}
        </button>

        {outputUrl ? (
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent-ink)] hover:opacity-90 text-white font-semibold rounded-xl transition-all"
          >
            <Download className="w-5 h-5" /> Download {mode === 'multi' ? 'TIFF' : 'ZIP'}
          </button>
        ) : (
          <div className="border border-dashed border-[var(--border-subtle)] rounded-2xl">
            <EmptyState
              title="Converted files will appear here"
              message="Upload a PDF above to convert."
            />
          </div>
        )}
      </div>
    </div>
  );
}



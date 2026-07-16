"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { FileUploader } from '../FileUploader';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { Upload, Download, RefreshCw, FileText, Image, Settings, Eye, Info } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type OutputFormat = 'png' | 'webp' | 'bmp';
type OutputMode = 'multi' | 'single';
type ColorMode = 'rgba' | 'gray' | 'bw';

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
      const [s, e] = trimmed.split('-').map(n => parseInt(n.trim(), 10));
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
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    out[i] = gray; out[i + 1] = gray; out[i + 2] = gray; out[i + 3] = data[i + 3];
  }
  return out;
}

function toBlackWhite(data: Uint8ClampedArray, threshold = 128): Uint8ClampedArray {
  const out = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    const val = gray > threshold ? 255 : 0;
    out[i] = val; out[i + 1] = val; out[i + 2] = val; out[i + 3] = 255;
  }
  return out;
}

async function canvasToBmpBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) { reject(new Error('No canvas context')); return; }
    const w = canvas.width, h = canvas.height;
    const imageData = ctx.getImageData(0, 0, w, h);
    const pixels = imageData.data;
    const rowSize = Math.ceil((w * 24) / 32) * 4;
    const fileSize = 54 + rowSize * h;
    const buffer = new ArrayBuffer(fileSize);
    const dv = new DataView(buffer);
    const write = (off: number, val: number, size: number) => {
      if (size === 2) dv.setUint16(off, val, true);
      else dv.setUint32(off, val, true);
    };
    write(0, 0x4D42, 2);
    write(2, fileSize, 4);
    write(10, 54, 4);
    write(14, 40, 4);
    write(18, w, 4);
    write(22, h, 4);
    write(26, 1, 2);
    write(28, 24, 2);
    write(34, rowSize * h, 4);
    const offset = 54;
    for (let y = h - 1; y >= 0; y--) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const pos = offset + (h - 1 - y) * rowSize + x * 3;
        dv.setUint8(pos, pixels[i + 2]);
        dv.setUint8(pos + 1, pixels[i + 1]);
        dv.setUint8(pos + 2, pixels[i]);
      }
    }
    resolve(new Blob([buffer], { type: 'image/bmp' }));
  });
}

export default function PdfToPng() {
  const [file, setFile] = useState<File | null>(null);
  const [pageRange, setPageRange] = useState('all');
  const [mode, setMode] = useState<OutputMode>('single');
  const [format, setFormat] = useState<OutputFormat>('png');
  const [dpi, setDpi] = useState(200);
  const [colorMode, setColorMode] = useState<ColorMode>('rgba');
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
      if (pages.length === 0) { toast.error('No valid pages in the selected range.'); return; }
      const scale = dpi / 72;
      const zip = new JSZip();
      const mimeType = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/bmp';
      const ext = format;
      for (let idx = 0; idx < pages.length; idx++) {
        const pageNum = pages[idx];
        setProgress(Math.round((idx / pages.length) * 100));
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        await page.render({ canvasContext: ctx, viewport }).promise;
        if (colorMode !== 'rgba') {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const processed = colorMode === 'gray' ? toGrayscale(imageData.data) : toBlackWhite(imageData.data);
          const tmpCanvas = document.createElement('canvas');
          tmpCanvas.width = canvas.width;
          tmpCanvas.height = canvas.height;
          const tmpCtx = tmpCanvas.getContext('2d');
          if (tmpCtx) {
            const tempImageData = tmpCtx.createImageData(canvas.width, canvas.height);
            tempImageData.data.set(processed);
            tmpCtx.putImageData(tempImageData, 0, 0);
            canvas.getContext('2d')?.drawImage(tmpCanvas, 0, 0);
          }
        }
        let blob: Blob;
        if (format === 'bmp') {
          blob = await canvasToBmpBlob(canvas);
        } else {
          blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), mimeType));
        }
        if (mode === 'multi') {
          if (format !== 'png') { toast.error('Multi-page only supports PNG'); return; }
        }
        zip.file(`page-${pageNum}.${ext}`, blob);
      }
      setProgress(100);
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      setOutputUrl(url);
      setOutputFileName(file.name.replace(/\.pdf$/i, '') + `-${format}-pages.zip`);
      toast.success(`Converted ${pages.length} page(s) to ${format.toUpperCase()}.`);
    } catch (e) {
      console.error(e);
      toast.error(`Failed to convert PDF to ${format.toUpperCase()}.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (outputUrl) downloadOrShare(outputUrl, outputFileName);
  };

  const handleReset = () => {
    setFile(null); setOutputUrl(null); setPreviewUrl(null); setPdfInfo(null);
    setProgress(0); setPageRange('all'); setMode('single'); setFormat('png');
    setDpi(200); setColorMode('rgba');
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm">
          <strong>PDF to Image:</strong> Convert PDF pages to PNG, WebP, or BMP images. Extract slides, documents, and graphics in high quality.
        </div>
        <FileUploader
          accept="application/pdf"
          onFileSelect={(_f) => handleFileSelect(_f)}
          title="Upload PDF"
          subtitle="Drag & drop or click to browse"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm flex items-start gap-3">
        <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />
        <span>Convert PDF pages to {format.toUpperCase()} images at your chosen DPI and color mode.</span>
      </div>
      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-white/5">
        <div className="flex items-center gap-3 min-w-0">
          <FileText className="w-8 h-8 text-blue-500 shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">{file.name}</p>
            {pdfInfo && <p className="text-sm text-zinc-500">{pdfInfo.pageCount} page{pdfInfo.pageCount !== 1 ? 's' : ''} &middot; {pdfInfo.fileSize}</p>}
          </div>
        </div>
        <button onClick={handleReset} className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition flex items-center gap-1.5 shrink-0">
          <RefreshCw className="w-4 h-4" /> Change File
        </button>
      </div>
      {previewUrl && (
        <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex items-center gap-3">
          <Eye className="w-5 h-5 text-zinc-400 shrink-0" />
          <span className="text-sm text-zinc-600 dark:text-zinc-400">First page preview:</span>
          <img src={previewUrl} alt="PDF preview" className="h-20 w-auto rounded border border-zinc-300 dark:border-zinc-700" />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Output Format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value as OutputFormat)}
            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-blue-500/50 outline-none">
            <option value="png">PNG (lossless)</option>
            <option value="webp">WebP (smaller)</option>
            <option value="bmp">BMP (uncompressed)</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Page Range</label>
          <input type="text" value={pageRange} onChange={(e) => setPageRange(e.target.value)}
            placeholder="all, 1-5, or 1,3,5"
            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-blue-500/50 outline-none" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">DPI</label>
          <select value={dpi} onChange={(e) => setDpi(Number(e.target.value))}
            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-blue-500/50 outline-none">
            <option value={150}>150 DPI</option>
            <option value={200}>200 DPI</option>
            <option value={300}>300 DPI</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Color Mode</label>
          <select value={colorMode} onChange={(e) => setColorMode(e.target.value as ColorMode)}
            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-blue-500/50 outline-none">
            <option value="rgba">Full Color</option>
            <option value="gray">Grayscale</option>
            <option value="bw">Black & White</option>
          </select>
        </div>
      </div>
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
            <span>Converting pages...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={processConversion} disabled={isProcessing}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all">
          {isProcessing ? <><RefreshCw className="w-5 h-5 animate-spin" /> Converting...</> : <><Settings className="w-5 h-5" /> Convert to {format.toUpperCase()}</>}
        </button>
        {outputUrl && (
          <button onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all">
            <Download className="w-5 h-5" /> Download ZIP
          </button>
        )}
      </div>
    </div>
  );
}

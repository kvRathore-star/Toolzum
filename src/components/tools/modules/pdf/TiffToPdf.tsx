"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import * as UTIF from 'utif';
import { PDFDocument, PageSizes } from 'pdf-lib';
import { Upload, Download, RefreshCw, FileImage, Settings, Eye, Info } from 'lucide-react';

type PageSizeOption = 'auto' | 'a4' | 'letter' | 'legal';
type OrientationOption = 'auto' | 'portrait' | 'landscape';
type MarginOption = 'none' | 'small' | 'medium' | 'large';

interface TiffInfo {
  pageCount: number;
  width: number;
  height: number;
  fileSize: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
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

function getPageSize(size: PageSizeOption, width: number, height: number, orientation: OrientationOption): [number, number] {
  if (size === 'auto') {
    let w = width / 72;
    let h = height / 72;
    if (orientation === 'portrait' && w > h) [w, h] = [h, w];
    if (orientation === 'landscape' && h > w) [w, h] = [h, w];
    return [w * 72, h * 72];
  }
  const standard: Record<string, [number, number]> = {
    a4: PageSizes.A4,
    letter: PageSizes.Letter,
    legal: PageSizes.Legal,
  };
  let [w, h] = standard[size] || PageSizes.A4;
  if (orientation === 'portrait' && w > h) [w, h] = [h, w];
  if (orientation === 'landscape' && h > w) [w, h] = [h, w];
  return [w, h];
}

function getMarginPoints(margin: MarginOption): number {
  switch (margin) {
    case 'none': return 0;
    case 'small': return 36;
    case 'medium': return 72;
    case 'large': return 108;
    default: return 0;
  }
}

export default function TiffToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageRange, setPageRange] = useState('all');
  const [pageSize, setPageSize] = useState<PageSizeOption>('auto');
  const [orientation, setOrientation] = useState<OrientationOption>('auto');
  const [margin, setMargin] = useState<MarginOption>('none');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputFileName, setOutputFileName] = useState('');
  const [tiffInfo, setTiffInfo] = useState<TiffInfo | null>(null);
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
    setTiffInfo(null);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const ifds = UTIF.decode(arrayBuffer);
      if (ifds.length === 0) throw new Error('No IFD found');

      const firstPage = ifds[0];
      const rgba = UTIF.toRGBA8(firstPage);
      if (!rgba) throw new Error('Failed to decode TIFF');

      const w = firstPage.width;
      const h = firstPage.height;
      setTiffInfo({ pageCount: ifds.length, width: w, height: h, fileSize: formatFileSize(selectedFile.size) });

      const canvas = document.createElement('canvas');
      canvas.width = Math.min(w, 400);
      canvas.height = Math.min(h, 400);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          const imageData = tempCtx.createImageData(w, h);
          imageData.data.set(rgba);
          tempCtx.putImageData(imageData, 0, 0);
          ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
          setPreviewUrl(canvas.toDataURL('image/jpeg', 0.7));
        }
      }
    } catch {
      toast.error('Failed to load TIFF file. The file may be corrupted or unsupported.');
    }
  };

  const processConversion = async () => {
    if (!file || !tiffInfo) return;

    setIsProcessing(true);
    setProgress(0);
    setOutputUrl(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const ifds = UTIF.decode(arrayBuffer);
      const totalPages = ifds.length;
      const pages = parsePageRange(pageRange, totalPages);

      if (pages.length === 0) {
        toast.error('No valid pages in the selected range.');
        return;
      }

      const pdfDoc = await PDFDocument.create();

      for (let idx = 0; idx < pages.length; idx++) {
        const pageIdx = pages[idx] - 1;
        setProgress(Math.round(((idx) / pages.length) * 100));

        const ifd = ifds[pageIdx];
        const rgba = UTIF.toRGBA8(ifd);
        if (!rgba) continue;

        const w = ifd.width;
        const h = ifd.height;

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        const imageData = ctx.createImageData(w, h);
        imageData.data.set(rgba);
        ctx.putImageData(imageData, 0, 0);

        const pngBlob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), 'image/png');
        });
        if (!pngBlob) continue;

        const pngBytes = await pngBlob.arrayBuffer();
        const pngImage = await pdfDoc.embedPng(new Uint8Array(pngBytes));

        const [pageW, pageH] = getPageSize(pageSize, w, h, orientation);
        const pdfPage = pdfDoc.addPage([pageW, pageH]);

        const marginPts = getMarginPoints(margin);
        const availableW = pageW - marginPts * 2;
        const availableH = pageH - marginPts * 2;

        const scale = Math.min(availableW / pngImage.width, availableH / pngImage.height);
        const imgW = pngImage.width * scale;
        const imgH = pngImage.height * scale;
        const x = (pageW - imgW) / 2;
        const y = (pageH - imgH) / 2;

        pdfPage.drawImage(pngImage, { x, y, width: imgW, height: imgH });
      }

      setProgress(100);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      setOutputFileName(file.name.replace(/\.tiff?$/i, '') + '.pdf');

      toast.success(`Converted ${pages.length} page(s) to PDF.`);
    } catch (e) {
      console.error('TIFF to PDF conversion failed', e);
      toast.error('Failed to convert TIFF to PDF. Try a different page size or orientation.');
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
    setTiffInfo(null);
    setProgress(0);
    setPageRange('all');
    setPageSize('auto');
    setOrientation('auto');
    setMargin('none');
  };

  if (!file) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl text-blue-700 dark:text-blue-300 text-sm font-medium flex items-start gap-3">
          <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-700 dark:text-blue-400" />
          <span>Convert TIFF images to universally compatible PDF documents. Perfect for scanned documents and fax archives.</span>
        </div>
        <div
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          role="group"
          aria-label="Drop a TIFF image here, or tab to the file picker below"
          onDrop={async (e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f && (f.type === 'image/tiff' || f.name.match(/\.tiff?$/i))) handleFileSelect(f);
            else toast.error('Please upload a TIFF file.');
          }}
          className="relative flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-overlay)] dark:bg-zinc-900/30 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition cursor-pointer"
        >
          <input
            type="file"
            accept=".tiff,.tif,image/tiff"
            aria-label="Upload TIFF"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
          />
          <Upload className="w-10 h-10 text-[var(--text-muted)] mb-3" />
          <p className="text-lg font-semibold text-[var(--text-primary)]">Upload TIFF</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Drag & drop or click to browse</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl text-blue-700 dark:text-blue-300 text-sm font-medium flex items-start gap-3">
        <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-700 dark:text-blue-400" />
        <span>Convert TIFF images to universally compatible PDF documents. Perfect for scanned documents and fax archives.</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between bg-[var(--bg-overlay)] p-4 rounded-xl border border-[var(--border-subtle)]">
        <div className="flex items-center gap-3 min-w-0">
          <FileImage className="w-8 h-8 text-blue-700 dark:text-blue-400 shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold text-[var(--text-primary)] truncate">{file.name}</p>
            {tiffInfo && (
              <p className="text-sm text-[var(--text-secondary)]">
                {tiffInfo.pageCount} page{tiffInfo.pageCount !== 1 ? 's' : ''} &middot; {tiffInfo.width}x{tiffInfo.height}px &middot; {tiffInfo.fileSize}
              </p>
            )}
          </div>
        </div>
        <button onClick={handleReset} className="text-sm text-[var(--text-secondary)] hover:text-zinc-800 dark:hover:text-zinc-200 transition flex items-center gap-1.5 shrink-0">
          <RefreshCw className="w-4 h-4" /> Change File
        </button>
      </div>

      {previewUrl && (
        <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4 flex items-center gap-3">
          <Eye className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
          <span className="text-sm text-[var(--text-secondary)]">First page preview:</span>
          <img src={previewUrl} alt="TIFF preview" className="h-20 w-auto rounded border border-[var(--border-subtle)]" />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--text-primary)]">Page Range</label>
          <input aria-label="Page Range"
            type="text"
            value={pageRange}
            onChange={(e) => setPageRange(e.target.value)}
            placeholder='all, 1-5, or 1,3,5'
            className="w-full px-3 py-2 bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--text-primary)]">Page Size</label>
          <select aria-label="Page Size"
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value as PageSizeOption)}
            className="w-full px-3 py-2 bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)]/50 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
          >
            <option value="auto">Auto (Match TIFF)</option>
            <option value="a4">A4</option>
            <option value="letter">Letter</option>
            <option value="legal">Legal</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--text-primary)]">Orientation</label>
          <select aria-label="Orientation"
            value={orientation}
            onChange={(e) => setOrientation(e.target.value as OrientationOption)}
            className="w-full px-3 py-2 bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)]/50 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
          >
            <option value="auto">Auto</option>
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--text-primary)]">Margin</label>
          <select aria-label="Margin"
            value={margin}
            onChange={(e) => setMargin(e.target.value as MarginOption)}
            className="w-full px-3 py-2 bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)]/50 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
          >
            <option value="none">None</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>

      {isProcessing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-[var(--text-secondary)]">
            <span>Converting pages...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-200 dark:bg-[var(--bg-surface)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--accent)] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
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
            <><Settings className="w-5 h-5" /> Convert to PDF</>
          )}
        </button>

        {outputUrl && (
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-xl transition-all"
          >
            <Download className="w-5 h-5" /> Download PDF
          </button>
        )}
      </div>
    </div>
  );
}

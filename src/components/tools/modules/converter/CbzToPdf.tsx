"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';

const PAGE_LAYOUTS = [
  { id: 'single', label: 'Single Page' },
  { id: 'double', label: 'Double Page (Spread)' },
  { id: 'booklet', label: 'Booklet' },
] as const;

const IMAGE_FITS = [
  { id: 'fit', label: 'Fit to Page' },
  { id: 'stretch', label: 'Stretch' },
  { id: 'actual', label: 'Actual Size' },
] as const;

const PAGE_SIZES = [
  { id: 'match', label: 'Match Image' },
  { id: 'a4', label: 'A4', width: 595.28, height: 841.89 },
  { id: 'letter', label: 'Letter', width: 612, height: 792 },
  { id: 'comic', label: 'Comic (6.625x10.25")', width: 477, height: 738 },
  { id: 'manga', label: 'Manga (5x7.5")', width: 360, height: 540 },
] as const;

type PageLayout = typeof PAGE_LAYOUTS[number]['id'];
type ImageFit = typeof IMAGE_FITS[number]['id'];
type PageSizeId = typeof PAGE_SIZES[number]['id'];

interface ArchiveInfo {
  pageCount: number;
  totalSize: number;
  firstPagePreview: string;
}

function naturalSort(a: string, b: string) {
  const re = /(\d+)|(\D+)/g;
  const aParts = a.match(re) || [];
  const bParts = b.match(re) || [];
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || '';
    const bPart = bParts[i] || '';
    const aNum = parseInt(aPart, 10);
    const bNum = parseInt(bPart, 10);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      if (aNum !== bNum) return aNum - bNum;
    } else {
      const cmp = aPart.localeCompare(bPart);
      if (cmp !== 0) return cmp;
    }
  }
  return 0;
}

function parsePageRange(range: string, maxPage: number): number[] {
  if (!range || range === 'all') {
    return Array.from({ length: maxPage }, (_, i) => i);
  }
  const pages = new Set<number>();
  const parts = range.split(',');
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-').map(s => s.trim());
      const start = parseInt(startStr!, 10);
      const end = parseInt(endStr!, 10);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.max(1, start); i <= Math.min(end, maxPage); i++) {
          pages.add(i - 1);
        }
      }
    } else {
      const num = parseInt(trimmed, 10);
      if (!isNaN(num) && num >= 1 && num <= maxPage) {
        pages.add(num - 1);
      }
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}

async function renderImageToPngBytes(imageBlob: Blob): Promise<Uint8Array> {
  const img = await createImageBitmap(imageBlob);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  img.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) return reject(new Error('Canvas toBlob failed'));
      blob.arrayBuffer().then(buf => resolve(new Uint8Array(buf))).catch(reject);
    }, 'image/png');
  });
}

export default function CbzToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [archiveInfo, setArchiveInfo] = useState<ArchiveInfo | null>(null);
  const [pageRange, setPageRange] = useState('all');
  const [pageLayout, setPageLayout] = useState<PageLayout>('single');
  const [imageFit, setImageFit] = useState<ImageFit>('fit');
  const [pageSize, setPageSize] = useState<PageSizeId>('match');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<{ name: string; blob: Blob }[]>([]);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [outputUrl, preview]);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      const entries: { name: string; blob: Blob }[] = [];
      const imageExts = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif']);

      zip.forEach((relativePath, zipEntry) => {
        if (!zipEntry.dir) {
          const ext = '.' + relativePath.split('.').pop()?.toLowerCase();
          if (imageExts.has(ext)) {
            entries.push({ name: relativePath, blob: null! });
          }
        }
      });

      if (entries.length === 0) {
        toast.error('No image files found in archive.');
        return;
      }

      entries.sort((a, b) => naturalSort(a.name, b.name));

      for (const entry of entries) {
        const zipEntry = zip.file(entry.name)!;
        entry.blob = await zipEntry.async('blob');
      }

      const firstBlob = entries[0]!.blob;
      const firstUrl = URL.createObjectURL(firstBlob);
      setPreview(firstUrl);

      setImageFiles(entries);
      setFile(selectedFile);
      setArchiveInfo({
        pageCount: entries.length,
        totalSize: selectedFile.size,
        firstPagePreview: firstUrl,
      });
      setOutputUrl(null);
      setProgress(0);
    } catch (e) {
      toast.error('Failed to read CBZ file. Ensure it is a valid ZIP archive.');
    }
  }, []);

  const clearAll = useCallback(() => {
    setFile(null);
    setArchiveInfo(null);
    setOutputUrl(null);
    setProgress(0);
    setPreview(null);
    setImageFiles([]);
    setPageRange('all');
    setPageLayout('single');
    setImageFit('fit');
    setPageSize('match');
  }, []);

  const convertToPdf = useCallback(async () => {
    if (!file || imageFiles.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    try {
      const pagesToConvert = parsePageRange(pageRange, imageFiles.length);
      if (pagesToConvert.length === 0) {
        toast.error('No valid pages in the specified range.');
        setIsProcessing(false);
        return;
      }

      const pdfDoc = await PDFDocument.create();

      for (let idx = 0; idx < pagesToConvert.length; idx++) {
        const pageIdx = pagesToConvert[idx];
        const entry = imageFiles[pageIdx!]!;
        const imageBytes = await renderImageToPngBytes(entry.blob);

        let pageWidth: number, pageHeight: number;

        if (pageSize === 'match') {
          const img = await createImageBitmap(entry.blob);
          pageWidth = img.width;
          pageHeight = img.height;
          img.close();
        } else {
          const sizeConfig = PAGE_SIZES.find(s => s.id === pageSize);
          if (sizeConfig && 'width' in sizeConfig) {
            pageWidth = sizeConfig.width;
            pageHeight = sizeConfig.height;
          } else {
            pageWidth = 595.28;
            pageHeight = 841.89;
          }
        }

        let embedWidth = pageWidth;
        let embedHeight = pageHeight;
        const img = await createImageBitmap(entry.blob);

        if (imageFit === 'fit') {
          const scale = Math.min(pageWidth / img.width, pageHeight / img.height);
          embedWidth = img.width * scale;
          embedHeight = img.height * scale;
        } else if (imageFit === 'stretch') {
          embedWidth = pageWidth;
          embedHeight = pageHeight;
        } else {
          embedWidth = img.width;
          embedHeight = img.height;
        }
        img.close();

        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        const pngImage = await pdfDoc.embedPng(imageBytes);

        const x = (pageWidth - embedWidth) / 2;
        const y = (pageHeight - embedHeight) / 2;

        if (pageLayout === 'double' && idx % 2 === 0 && idx < pagesToConvert.length - 1) {
          const nextIdx = pagesToConvert[idx + 1];
          const nextEntry = imageFiles[nextIdx!]!;
          const nextBytes = await renderImageToPngBytes(nextEntry.blob);
          const nextPng = await pdfDoc.embedPng(nextBytes);
          const halfWidth = pageWidth / 2;

          const leftScale = Math.min(halfWidth / embedWidth, pageHeight / embedHeight);
          const leftW = embedWidth * leftScale;
          const leftH = embedHeight * leftScale;
          page.drawImage(pngImage, { x: (halfWidth - leftW) / 2, y: (pageHeight - leftH) / 2, width: leftW, height: leftH });

          const nextImg = await createImageBitmap(nextEntry.blob);
          const rightScale = Math.min(halfWidth / nextImg.width, pageHeight / nextImg.height);
          const rightW = nextImg.width * rightScale;
          const rightH = nextImg.height * rightScale;
          const rightPng = await pdfDoc.embedPng(nextBytes);
          page.drawImage(rightPng, { x: halfWidth + (halfWidth - rightW) / 2, y: (pageHeight - rightH) / 2, width: rightW, height: rightH });
          nextImg.close();
          idx++;
        } else if (pageLayout === 'booklet') {
          const scale = Math.min(pageWidth * 0.45 / img.width, pageHeight / img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          page.drawImage(pngImage, { x: (pageWidth * 0.5 - w) / 2, y: (pageHeight - h) / 2, width: w, height: h });
        } else {
          page.drawImage(pngImage, { x, y, width: embedWidth, height: embedHeight });
        }

        setProgress(Math.round(((idx + 1) / pagesToConvert.length) * 100));
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success('CBZ converted to PDF successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to convert CBZ to PDF.');
    } finally {
      setIsProcessing(false);
    }
  }, [file, imageFiles, pageRange, pageLayout, imageFit, pageSize, outputUrl]);

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-700 dark:text-blue-400 text-sm">
          <strong>CBZ to PDF:</strong> Convert comic book archives (CBZ) to PDF for easy reading on any device.
        </div>
        <FileUploader
          accept=".cbz,.cbr,.zip"
          onFileSelect={handleFileSelect}
          title="Upload CBZ File"
          subtitle="Comic book archive (CBZ/CBR/ZIP) containing images"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">
            {archiveInfo?.pageCount ?? 0} pages &bull; {(archiveInfo?.totalSize ?? 0) / 1024 / 1024 > 1
              ? `${((archiveInfo?.totalSize ?? 0) / 1024 / 1024).toFixed(2)} MB`
              : `${((archiveInfo?.totalSize ?? 0) / 1024).toFixed(1)} KB`}
          </p>
        </div>
        <button
          onClick={clearAll}
          className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
        >
          Change File
        </button>
      </div>

      {preview && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4 rounded-2xl shadow-xl">
          <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">First Page Preview</p>
          <div className="flex justify-center">
            <img src={preview} alt="First page preview" className="max-h-64 object-contain rounded-lg" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 h-fit">
          <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">Conversion Settings</h4>

          <div>
            <label htmlFor="lbl-cbztopdf-page-range" className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">Page Range</label>
            <input id="lbl-cbztopdf-page-range" aria-label="Page Range"
              type="text"
              value={pageRange}
              onChange={e => setPageRange(e.target.value)}
              placeholder='all, "1-10", or "1,3,5-8"'
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">Page Layout</label>
            <div className="grid grid-cols-3 gap-2">
              {PAGE_LAYOUTS.map(l => (
                <button
                  key={l.id}
                  onClick={() => setPageLayout(l.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${pageLayout === l.id ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)] hover:border-blue-300'}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">Image Fit</label>
            <div className="grid grid-cols-3 gap-2">
              {IMAGE_FITS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setImageFit(f.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${imageFit === f.id ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)] hover:border-blue-300'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">Output Page Size</label>
            <div className="grid grid-cols-2 gap-2">
              {PAGE_SIZES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setPageSize(s.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${pageSize === s.id ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)] hover:border-blue-300'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={convertToPdf}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            {isProcessing ? 'Converting...' : 'Convert to PDF'}
          </button>
        </div>

        <div className="space-y-6">
          {isProcessing && (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-3">
              <h4 className="text-[var(--text-primary)] font-medium">Processing</h4>
              <div className="w-full bg-zinc-200 dark:bg-[var(--bg-surface)] rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-[var(--text-secondary)] text-right">{progress}%</p>
            </div>
          )}

          {outputUrl ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                <h4 className="font-bold text-emerald-500">Conversion Complete</h4>
              </div>
              <div className="bg-emerald-700/10 rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-emerald-500">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="font-bold text-center">{file.name.replace(/\.(cbz|cbr|zip)$/i, '')}.pdf</p>
              </div>
              <button
                onClick={() => downloadOrShare(outputUrl, file.name.replace(/\.(cbz|cbr|zip)$/i, '') + '.pdf')}
                className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download PDF
              </button>
            </div>
          ) : (
            <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-[var(--text-muted)]">
              <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              <p>PDF will appear here after conversion</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

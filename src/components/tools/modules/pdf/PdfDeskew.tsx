"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { PDFDocument, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

function computeSkew(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext('2d')!;
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const gray = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }
  const hist = new Float32Array(180);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const gx = -gray[idx - width - 1] + gray[idx - width + 1]
                - 2 * gray[idx - 1] + 2 * gray[idx + 1]
                - gray[idx + width - 1] + gray[idx + width + 1];
      const gy = -gray[idx - width - 1] - 2 * gray[idx - width] - gray[idx - width + 1]
                + gray[idx + width - 1] + 2 * gray[idx + width] + gray[idx + width + 1];
      const mag = Math.sqrt(gx * gx + gy * gy);
      if (mag < 40) continue;
      const angle = ((Math.atan2(gy, gx) * 180 / Math.PI) % 180 + 180) % 180;
      hist[Math.floor(angle)] += mag;
    }
  }
  let peakNear0 = 0, valNear0 = 0, peakNear90 = 0, valNear90 = 0;
  for (let i = 0; i < 180; i++) {
    if (i < 40 || i > 140) {
      if (hist[i] > valNear0) { valNear0 = hist[i]; peakNear0 = i; }
    }
    if (i > 50 && i < 130) {
      if (hist[i] > valNear90) { valNear90 = hist[i]; peakNear90 = i; }
    }
  }
  if (valNear90 > valNear0) {
    return Math.max(-45, Math.min(45, peakNear90 - 90));
  }
  const skew = peakNear0 > 90 ? peakNear0 - 180 : peakNear0;
  return Math.max(-45, Math.min(45, skew));
}

async function renderPageToCanvas(
  arrayBuffer: ArrayBuffer, pageNum: number, scale: number
): Promise<HTMLCanvasElement> {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  pdf.destroy();
  return canvas;
}

function rotateImage(source: HTMLCanvasElement, angleDeg: number): HTMLCanvasElement {
  const w = source.width;
  const h = source.height;
  const rad = (angleDeg * Math.PI) / 180;
  const newW = Math.abs(w * Math.cos(rad)) + Math.abs(h * Math.sin(rad));
  const newH = Math.abs(w * Math.sin(rad)) + Math.abs(h * Math.cos(rad));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(newW);
  canvas.height = Math.round(newH);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.drawImage(source, -w / 2, -h / 2);
  return canvas;
}

export default function PdfDeskew() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [skewAngle, setSkewAngle] = useState(0);
  const [manualAngle, setManualAngle] = useState(0);
  const [useAutoDetect, setUseAutoDetect] = useState(true);
  const [applyToAll, setApplyToAll] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const cachedRenderRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const generatePreview = (angle: number) => {
    const source = cachedRenderRef.current;
    if (!source) return;
    const rotated = rotateImage(source, angle);
    setPreviewUrl(rotated.toDataURL('image/png'));
  };

  const handleFileSelect = async (selectedFile: File) => {
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
      const total = pdf.numPages;
      pdf.destroy();
      setPageCount(total);
      setFileBuffer(arrayBuffer);
      setFile(selectedFile);
      setOutputUrl(null);
      setPreviewUrl(null);
      setCurrentPage(1);

      const detectCanvas = await renderPageToCanvas(arrayBuffer, 1, 0.3);
      const detected = computeSkew(detectCanvas);
      setSkewAngle(detected);
      setManualAngle(detected);

      const previewCache = await renderPageToCanvas(arrayBuffer, 1, 0.6);
      cachedRenderRef.current = previewCache;
      generatePreview(detected);
    } catch (e) {
      toast.error('Failed to load PDF. It might be encrypted or corrupted.');
    }
  };

  const handlePageChange = async (page: number) => {
    if (!fileBuffer || page < 1 || page > pageCount) return;
    setCurrentPage(page);
    setOutputUrl(null);
    try {
      const previewCache = await renderPageToCanvas(fileBuffer, page, 0.6);
      cachedRenderRef.current = previewCache;
      const angle = useAutoDetect ? skewAngle : manualAngle;
      generatePreview(angle);
    } catch (e) {
      toast.error('Failed to render page.');
    }
  };

  const clearAll = () => {
    setFile(null);
    setFileBuffer(null);
    setOutputUrl(null);
    setPreviewUrl(null);
    setPageCount(0);
    setSkewAngle(0);
    setManualAngle(0);
    cachedRenderRef.current = null;
  };

  const deskew = async () => {
    if (!fileBuffer || !file) return;
    setIsProcessing(true);
    try {
      const angle = useAutoDetect ? skewAngle : manualAngle;
      const originalPdf = await PDFDocument.load(fileBuffer);
      const newPdf = await PDFDocument.create();

      for (let i = 1; i <= pageCount; i++) {
        if (applyToAll || i === currentPage) {
          const sourceCanvas = await renderPageToCanvas(fileBuffer, i, 2);
          const rotated = rotateImage(sourceCanvas, angle);
          const dataUrl = rotated.toDataURL('image/png');
          const img = await newPdf.embedPng(dataUrl);
          const page = newPdf.addPage([rotated.width * 0.75, rotated.height * 0.75]);
          const { width, height } = img.scale(1);
          const pageW = page.getWidth();
          const pageH = page.getHeight();
          page.drawImage(img, {
            x: (pageW - width) / 2,
            y: (pageH - height) / 2,
            width,
            height,
          });
        } else {
          const [copiedPage] = await newPdf.copyPages(originalPdf, [i - 1]);
          newPdf.addPage(copiedPage);
        }
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success('PDF deskewed successfully!');
    } catch (e) {
      console.error(e);
      toast.error('An error occurred while deskewing the PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm">
          <strong>PDF Deskew:</strong> Straighten crooked or scanned PDF pages. Auto-detects skew angle using edge analysis, or you can fine-tune manually. Note: deskewing rasterizes pages (text becomes image), so the output will be flattened.
        </div>
        <FileUploader
          accept="application/pdf"
          onFileSelect={handleFileSelect}
          title="Upload PDF to Deskew"
          subtitle="Drag & drop a scanned PDF here"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB &bull; {pageCount} Pages</p>
        </div>
        <button
          onClick={clearAll}
          disabled={isProcessing}
          className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg disabled:opacity-50"
        >
          Change File
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 h-fit">
          <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">Deskew Settings</h4>

          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Auto-Detect</label>
            <button
              onClick={() => {
                setUseAutoDetect(!useAutoDetect);
                if (!useAutoDetect) {
                  setManualAngle(skewAngle);
                  generatePreview(skewAngle);
                }
              }}
              className={`relative w-10 h-5 rounded-full transition-colors ${useAutoDetect ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${useAutoDetect ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {useAutoDetect && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
              <p className="text-xs text-emerald-400">
                <strong>Detected Skew:</strong> {skewAngle.toFixed(1)}&deg;
              </p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Manual Rotation</label>
              <span className="text-xs font-bold text-blue-500">{manualAngle.toFixed(1)}&deg;</span>
            </div>
            <input
              type="range"
              min="-45"
              max="45"
              step="0.5"
              value={manualAngle}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setManualAngle(val);
                if (!useAutoDetect) generatePreview(val);
              }}
              onMouseUp={() => { if (useAutoDetect) setManualAngle(skewAngle); }}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-[var(--text-secondary)]">
              <span>-45&deg;</span>
              <span>0&deg;</span>
              <span>+45&deg;</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Apply to All Pages</label>
            <button
              onClick={() => setApplyToAll(!applyToAll)}
              className={`relative w-10 h-5 rounded-full transition-colors ${applyToAll ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${applyToAll ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="text-xs px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] disabled:opacity-30 hover:bg-[var(--bg-surface)]"
            >
              Prev
            </button>
            <span className="text-xs font-medium text-zinc-600 dark:text-[var(--text-muted)]">
              Page {currentPage} of {pageCount}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= pageCount}
              className="text-xs px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] disabled:opacity-30 hover:bg-[var(--bg-surface)]"
            >
              Next
            </button>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-amber-400 text-xs">
            <strong>Note:</strong> Deskewing rasterizes pages (text becomes image). For best quality, use the original document if available.
          </div>

          <button
            onClick={deskew}
            disabled={isProcessing}
            className="w-full bg-[var(--accent)] hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isProcessing ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                <span>Deskewing...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                <span>Deskew PDF</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          {previewUrl && !outputUrl && (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4 rounded-2xl shadow-xl space-y-3">
              <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Preview</h4>
              <div className="rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-center">
                <img src={previewUrl} alt="Deskew preview" className="max-w-full h-auto max-h-[400px] object-contain" />
              </div>
            </div>
          )}

          {outputUrl ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
               <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                  <h4 className="font-bold text-emerald-500">Deskew Complete</h4>
               </div>

               <div className="bg-emerald-500/10 rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-emerald-500">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <p className="font-bold text-center">deskewed_{file.name}</p>
               </div>

               <button
                  onClick={() => downloadOrShare(outputUrl, `deskewed_${file.name}`)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download Deskewed PDF
                </button>
            </div>
          ) : (
            <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-[var(--text-muted)]">
              <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              <p>Corrected PDF will appear here</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

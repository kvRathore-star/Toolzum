"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { FileUploader } from '../../FileUploader';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

let pdfjsLib: any = null;

async function loadPdfjs() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
  return pdfjsLib;
}

type Action = 'overlay' | 'alternate-merge' | 'combine' | 'booklet' | 'invert' | 'zip';

export default function PdfAdvanced() {
  const [action, setAction] = useState<Action>('overlay');
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [mainBuffer, setMainBuffer] = useState<ArrayBuffer | null>(null);
  const [overlayFile, setOverlayFile] = useState<File | null>(null);
  const [overlayBuffer, setOverlayBuffer] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [secondFile, setSecondFile] = useState<File | null>(null);
  const [secondBuffer, setSecondBuffer] = useState<ArrayBuffer | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pagesPerSheet, setPagesPerSheet] = useState(2);

  useEffect(() => {
    return () => { if (outputUrl) URL.revokeObjectURL(outputUrl); };
  }, [outputUrl]);

  const handleMainFile = async (f: File) => {
    try {
      const buf = await f.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buf);
      setPageCount(pdfDoc.getPageCount());
      setMainBuffer(buf);
      setMainFile(f);
      setOutputUrl(null);
    } catch { toast.error('Failed to load main PDF.'); }
  };

  const handleOverlayFile = async (f: File) => {
    try {
      const buf = await f.arrayBuffer();
      setOverlayBuffer(buf);
      setOverlayFile(f);
      setOutputUrl(null);
    } catch { toast.error('Failed to load overlay PDF.'); }
  };

  const handleSecondFile = async (f: File) => {
    try {
      const buf = await f.arrayBuffer();
      setSecondBuffer(buf);
      setSecondFile(f);
      setOutputUrl(null);
    } catch { toast.error('Failed to load second PDF.'); }
  };

  const needsTwoFiles = action === 'overlay' || action === 'alternate-merge';

  const processAction = async () => {
    if (!mainBuffer || !mainFile) return;
    if (needsTwoFiles) {
      if (action === 'overlay' && !overlayBuffer) { toast.error('Upload an overlay PDF.'); return; }
      if (action === 'alternate-merge' && !secondBuffer) { toast.error('Upload a second PDF.'); return; }
    }

    setIsProcessing(true);
    setProgress(0);
    try {
      const mainDoc = await PDFDocument.load(mainBuffer);
      let resultDoc: PDFDocument;

      if (action === 'overlay') {
        const overlay = await PDFDocument.load(overlayBuffer!);
        resultDoc = await PDFDocument.create();
        const mainPages = mainDoc.getPages();
        const overlayPages = overlay.getPages();
        const maxPages = Math.max(mainPages.length, overlayPages.length);
        for (let i = 0; i < maxPages; i++) {
          const [mainPage] = await resultDoc.copyPages(mainDoc, [Math.min(i, mainPages.length - 1)]);
          resultDoc.addPage(mainPage);
          const [overlayPg] = await resultDoc.copyPages(overlay, [Math.min(i, overlayPages.length - 1)]);
          const targetPage = resultDoc.getPage(resultDoc.getPageCount() - 1);
          const embedded = await resultDoc.embedPage(overlayPg);
          targetPage.drawPage(embedded);
        }
      } else if (action === 'alternate-merge') {
        const second = await PDFDocument.load(secondBuffer!);
        resultDoc = await PDFDocument.create();
        const aPages = mainDoc.getPages();
        const bPages = second.getPages();
        const maxLen = Math.max(aPages.length, bPages.length);
        for (let i = 0; i < maxLen; i++) {
          if (i < aPages.length) {
            const [p] = await resultDoc.copyPages(mainDoc, [i]);
            resultDoc.addPage(p);
          }
          if (i < bPages.length) {
            const [p] = await resultDoc.copyPages(second, [i]);
            resultDoc.addPage(p);
          }
        }
      } else if (action === 'combine') {
        resultDoc = await PDFDocument.create();
        const srcPages = mainDoc.getPages();
        const { width, height } = srcPages[0]?.getSize() || [595.28, 841.89];
        const newPage = resultDoc.addPage([width * Math.min(pagesPerSheet, srcPages.length), height * Math.ceil(srcPages.length / pagesPerSheet)]);
        for (let i = 0; i < srcPages.length; i++) {
          const [cp] = await resultDoc.copyPages(mainDoc, [i]);
          const col = i % pagesPerSheet;
          const row = Math.floor(i / pagesPerSheet);
          const embedded = await resultDoc.embedPage(cp);
          newPage.drawPage(embedded, {
            x: col * width,
            y: newPage.getSize().height - (row + 1) * height,
            width,
            height,
          });
        }
      } else if (action === 'booklet') {
        resultDoc = await PDFDocument.create();
        const srcPages = mainDoc.getPages();
        const n = srcPages.length;
        const sheetCount = Math.ceil(n / 4);
        const pageWidth = 595.28;
        const pageHeight = 841.89;
        for (let s = 0; s < sheetCount; s++) {
          const sheetPage = resultDoc.addPage([pageWidth * 2, pageHeight]);
          const indices = [s * 2, n - 1 - s * 2, s * 2 + 1, n - 1 - s * 2 - 1].filter(i => i >= 0 && i < n);
          for (let ci = 0; ci < indices.length; ci++) {
            const [cp] = await resultDoc.copyPages(mainDoc, [indices[ci]]);
            const embedded = await resultDoc.embedPage(cp);
            sheetPage.drawPage(embedded, {
              x: ci % 2 === 0 ? 0 : pageWidth,
              y: 0,
              width: pageWidth,
              height: pageHeight,
            });
          }
        }
      } else if (action === 'invert') {
        resultDoc = await PDFDocument.create();
        const buf2 = mainBuffer.slice(0);
        const pdfjs = await loadPdfjs();
        const pdfJsDoc = await pdfjs.getDocument(buf2).promise;
        for (let i = 1; i <= pdfJsDoc.numPages; i++) {
          const page = await pdfJsDoc.getPage(i);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;
          await page.render({ canvasContext: ctx, viewport }).promise;
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          for (let j = 0; j < imageData.data.length; j += 4) {
            imageData.data[j] = 255 - imageData.data[j];
            imageData.data[j + 1] = 255 - imageData.data[j + 1];
            imageData.data[j + 2] = 255 - imageData.data[j + 2];
          }
          ctx.putImageData(imageData, 0, 0);
          const pngBlob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/png'));
          const pngBytes = await pngBlob.arrayBuffer();
          const tempDoc = await PDFDocument.create();
          const img = await tempDoc.embedPng(pngBytes);
          const tempPage = tempDoc.addPage([viewport.width, viewport.height]);
          tempPage.drawImage(img, { x: 0, y: 0, width: viewport.width, height: viewport.height });
          const [cp] = await resultDoc.copyPages(tempDoc, [0]);
          resultDoc.addPage(cp);
          setProgress(Math.round((i / pdfJsDoc.numPages) * 100));
        }
      } else {
        resultDoc = mainDoc;
        const zip = new JSZip();
        const buf3 = mainBuffer.slice(0);
        const pdfjs = await loadPdfjs();
        const pdfJsDoc2 = await pdfjs.getDocument(buf3).promise;
        for (let i = 1; i <= pdfJsDoc2.numPages; i++) {
          const page = await pdfJsDoc2.getPage(i);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;
          await page.render({ canvasContext: ctx, viewport }).promise;
          const pngBlob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/png'));
          zip.file(`page-${i}.png`, pngBlob);
          setProgress(Math.round((i / pdfJsDoc2.numPages) * 100));
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        setOutputUrl(url);
        toast.success('PDF pages zipped!');
        setIsProcessing(false);
        return;
      }

      resultDoc = resultDoc || mainDoc;
      const pdfBytes = await resultDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success(`${actionLabel()} complete!`);
    } catch (e) {
      console.error(e);
      toast.error(`Failed to ${actionLabel().toLowerCase()}.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const actionLabel = () => {
    const labels: Record<Action, string> = {
      overlay: 'Overlay PDF',
      'alternate-merge': 'Alternate Merge',
      combine: 'Combine Pages',
      booklet: 'Booklet Layout',
      invert: 'Invert Colors',
      zip: 'PDF to ZIP',
    };
    return labels[action];
  };

  const actionClass = (a: Action) =>
    `px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${action === a ? 'bg-blue-600 text-white shadow-md' : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'}`;

  const actions: Action[] = ['overlay', 'alternate-merge', 'combine', 'booklet', 'invert', 'zip'];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-700 dark:text-blue-400 text-sm">
        <strong>Advanced PDF Tools:</strong> Overlay PDFs, alternate-merge, combine pages into sheets, apply booklet layout, invert colors, or extract pages as ZIP images.
      </div>

      <div className="flex flex-wrap gap-2">
        {actions.map(a => (
          <button key={a} onClick={() => setAction(a)} className={actionClass(a)}>
            {actionLabel()}
          </button>
        ))}
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
        <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">
          {actionLabel()}
        </h4>

        <div>
          <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">Main PDF</label>
          {mainFile ? (
            <div className="flex items-center justify-between bg-[var(--bg-overlay)] p-3 rounded-xl">
              <span className="text-sm text-zinc-800 dark:text-zinc-200">{mainFile.name} ({pageCount} pages)</span>
              <button onClick={() => { setMainFile(null); setMainBuffer(null); setOutputUrl(null); }}
                className="text-xs text-[var(--text-secondary)] hover:text-red-500">Remove</button>
            </div>
          ) : (
            <FileUploader accept="application/pdf" onFileSelect={(_f, _d) => handleMainFile(_f)}
              title="Upload PDF" subtitle="Main document" />
          )}
        </div>

        {needsTwoFiles && (
          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
              {action === 'overlay' ? 'Overlay PDF' : 'Second PDF'}
            </label>
            {(overlayFile || secondFile) ? (
              <div className="flex items-center justify-between bg-[var(--bg-overlay)] p-3 rounded-xl">
                <span className="text-sm text-zinc-800 dark:text-zinc-200">{(overlayFile || secondFile)?.name}</span>
                <button onClick={() => { setOverlayFile(null); setOverlayBuffer(null); setSecondFile(null); setSecondBuffer(null); setOutputUrl(null); }}
                  className="text-xs text-[var(--text-secondary)] hover:text-red-500">Remove</button>
              </div>
            ) : (
              <FileUploader accept="application/pdf" onFileSelect={(_f, _d) => {
                if (action === 'overlay') handleOverlayFile(_f);
                else handleSecondFile(_f);
              }} title="Upload PDF" subtitle="Second document" />
            )}
          </div>
        )}

        {action === 'combine' && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Pages Per Sheet</label>
            <select value={pagesPerSheet} onChange={(e) => setPagesPerSheet(Number(e.target.value))}
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]">
              <option value={2}>2 pages per sheet</option>
              <option value={4}>4 pages per sheet</option>
            </select>
          </div>
        )}

        {isProcessing && action !== 'zip' && progress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-zinc-600">
              <span>Processing...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-zinc-200 dark:bg-[var(--bg-surface)] rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <button onClick={processAction} disabled={isProcessing || !mainFile}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2">
          {isProcessing ? 'Processing...' : `Apply ${actionLabel()}`}
        </button>
      </div>

      {outputUrl && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4 animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
            <h4 className="font-bold text-emerald-500">Complete</h4>
          </div>
          <button onClick={() => downloadOrShare(outputUrl, action === 'zip' ? `${mainFile?.name?.replace(/\.pdf$/i, '') || 'pages'}-pages.zip` : `advanced_${mainFile?.name || 'output.pdf'}`)}
            className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2">
            Download {action === 'zip' ? 'ZIP' : 'PDF'}
          </button>
        </div>
      )}
    </div>
  );
}

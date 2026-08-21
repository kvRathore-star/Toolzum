"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export default function GrayscalePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dpi, setDpi] = useState(150);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const handleFileSelect = async (selectedFile: File) => {
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      setFileBytes(arrayBuffer);
      setFile(selectedFile);
      setOutputUrl(null);
      setProgress(null);
    } catch (e) {
      toast.error("Failed to load PDF file.");
    }
  };

  const clearAll = () => {
    setFile(null);
    setFileBytes(null);
    setOutputUrl(null);
    setProgress(null);
  };

  const convertToGrayscale = async () => {
    if (!fileBytes || !file) return;

    setIsProcessing(true);
    setProgress({ current: 0, total: 0 });

    try {
      const pdf = await pdfjsLib.getDocument({ data: fileBytes.slice(0) }).promise;
      const totalPages = pdf.numPages;
      setProgress({ current: 0, total: totalPages });

      const newPdf = await PDFDocument.create();

      for (let i = 1; i <= totalPages; i++) {
        setProgress({ current: i - 1, total: totalPages });

        const page = await pdf.getPage(i);
        const scale = dpi / 72;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let j = 0; j < data.length; j += 4) {
          const gray = 0.299 * data[j] + 0.587 * data[j + 1] + 0.114 * data[j + 2];
          data[j] = gray;
          data[j + 1] = gray;
          data[j + 2] = gray;
        }
        ctx.putImageData(imageData, 0, 0);

        const imgData = canvas.toDataURL('image/jpeg', 0.92);

        const widthPts = viewport.width * 0.75;
        const heightPts = viewport.height * 0.75;

        if (i > 1) {
          newPdf.addPage([widthPts, heightPts]);
        } else {
          newPdf.addPage([widthPts, heightPts]);
        }

        const pages = newPdf.getPages();
        const currentPage = pages[pages.length - 1];
        const img = await newPdf.embedPng(imgData);
        const { width, height } = img.scale(1);
        currentPage.drawImage(img, {
          x: (widthPts - width) / 2,
          y: (heightPts - height) / 2,
          width,
          height,
        });
      }

      setProgress({ current: totalPages, total: totalPages });

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });

      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success("PDF converted to grayscale successfully!");
    } catch (e) {
      console.error(e);
      toast.error("An error occurred during grayscale conversion.");
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-700 dark:text-blue-400 text-sm">
          <strong>Grayscale Conversion:</strong> Convert your color PDF to grayscale for professional printing or to reduce file size. Note: this process rasterizes the PDF pages.
        </div>
        <FileUploader
          accept="application/pdf"
          onFileSelect={handleFileSelect}
          title="Upload PDF to Convert"
          subtitle="Select a color PDF document"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
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
          <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">Conversion Settings</h4>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Output DPI</label>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400">{dpi} DPI</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[72, 150, 200, 300].map((val) => (
                <button
                  key={val}
                  onClick={() => setDpi(val)}
                  disabled={isProcessing}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all border ${dpi === val ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)] hover:border-blue-300'}`}
                >
                  {val}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--text-secondary)]">Higher DPI = better quality but larger file size.</p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-700 dark:text-amber-400 text-xs">
            <strong>Note:</strong> Grayscale conversion rasterizes each page (text becomes image). The output may be larger than the original for text-heavy documents.
          </div>

          <button
            onClick={convertToGrayscale}
            disabled={isProcessing}
            className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isProcessing ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                <span>Converting... {progress ? `${progress.current} / ${progress.total}` : ''}</span>
              </>
            ) : (
              "Convert to Grayscale"
            )}
          </button>
        </div>

        <div className="space-y-6">
          {outputUrl ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
               <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                  <h4 className="font-bold text-emerald-500">Conversion Complete</h4>
               </div>

               <div className="bg-emerald-700/10 rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-emerald-500">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                  <p className="font-bold text-center">grayscale_{file.name}</p>
               </div>

               <button
                  onClick={() => downloadOrShare(outputUrl, `grayscale_${file.name}`)}
                  className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download Grayscale PDF
                </button>
            </div>
          ) : (
            <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-[var(--text-muted)]">
               <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
              <p>Grayscale PDF will appear here</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

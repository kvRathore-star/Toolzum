"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { PDFDocument } from 'pdf-lib';

const PRESETS = {
  a4: { label: 'A4 (210x297mm)', width: 595.28, height: 841.89 },
  letter: { label: 'Letter (8.5x11in)', width: 612, height: 792 },
  square: { label: 'Square (1:1)', width: 500, height: 500 },
};

type PresetKey = keyof typeof PRESETS;

export default function CropPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPage, setSelectedPage] = useState(1);
  const [preset, setPreset] = useState<PresetKey | 'custom'>('a4');
  const [margins, setMargins] = useState({ top: 0, right: 0, bottom: 0, left: 0 });
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
      const totalPages = pdfDoc.getPageCount();
      setPageCount(totalPages);
      setFileBytes(arrayBuffer);
      setFile(selectedFile);
      setOutputUrl(null);
      setSelectedPage(1);
    } catch (e) {
      toast.error("Failed to load PDF.");
    }
  };

  const clearAll = () => {
    setFile(null);
    setFileBytes(null);
    setOutputUrl(null);
    setPageCount(0);
    setSelectedPage(1);
  };

  const cropPdf = async () => {
    if (!fileBytes || !file) return;

    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.load(fileBytes);
      const pages = pdfDoc.getPages();

      const pagesToCrop = selectedPage === 0 ? pages : [pages[selectedPage - 1]];

      for (const page of pagesToCrop) {
        const { width, height } = page.getSize();

        if (preset !== 'custom') {
          const presetSize = PRESETS[preset];
          const x = (width - presetSize.width) / 2;
          const y = (height - presetSize.height) / 2;
          page.setMediaBox(x < 0 ? 0 : x, y < 0 ? 0 : y, Math.min(presetSize.width, width), Math.min(presetSize.height, height));
          page.setCropBox(x < 0 ? 0 : x, y < 0 ? 0 : y, Math.min(presetSize.width, width), Math.min(presetSize.height, height));
        } else {
          const left = Math.max(0, margins.left);
          const right = Math.max(0, margins.right);
          const top = Math.max(0, margins.top);
          const bottom = Math.max(0, margins.bottom);
          const newWidth = Math.max(1, width - left - right);
          const newHeight = Math.max(1, height - top - bottom);
          page.setMediaBox(left, bottom, newWidth, newHeight);
          page.setCropBox(left, bottom, newWidth, newHeight);
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success("PDF cropped successfully!");
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while cropping PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm">
          <strong>Crop PDF:</strong> Reduce page size by setting custom margins or using preset dimensions (A4, Letter, Square). All processing happens locally in your browser.
        </div>
        <FileUploader
          accept="application/pdf"
          onFileSelect={handleFileSelect}
          title="Upload PDF to Crop"
          subtitle="Drag & drop your document here"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-white/5">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB • {pageCount} Pages</p>
        </div>
        <button
          onClick={clearAll}
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg"
        >
          Change File
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-6 h-fit">
          <h4 className="text-zinc-900 dark:text-white font-medium border-b border-zinc-100 dark:border-zinc-800 pb-2">Crop Settings</h4>

          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">Crop Method</label>
            <div className="grid grid-cols-2 gap-2">
              {(['a4', 'letter', 'square', 'custom'] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setPreset(key)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${preset === key ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-blue-300'}`}
                >
                  {key === 'custom' ? 'Custom Margins' : PRESETS[key].label}
                </button>
              ))}
            </div>
          </div>

          {preset === 'custom' && (
            <div className="grid grid-cols-2 gap-3">
              {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                <div key={side}>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1 capitalize">{side} (pts)</label>
                  <input
                    type="number"
                    min={0}
                    max={2000}
                    value={margins[side]}
                    onChange={(e) => setMargins({ ...margins, [side]: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">Apply To</label>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 5].map((p) => p <= pageCount ? (
                <button
                  key={p}
                  onClick={() => setSelectedPage(p)}
                  className={`w-10 h-10 rounded-xl text-xs font-bold transition-all border ${selectedPage === p ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-blue-300'}`}
                >
                  {p}
                </button>
              ) : null)}
              <button
                onClick={() => setSelectedPage(0)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${selectedPage === 0 ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-blue-300'}`}
              >
                All
              </button>
            </div>
          </div>

          <button
            onClick={cropPdf}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            {isProcessing ? "Cropping..." : "Crop PDF"}
          </button>
        </div>

        <div className="space-y-6">
          {outputUrl ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <h4 className="font-bold text-emerald-500">Crop Complete</h4>
              </div>

              <div className="bg-emerald-500/10 rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-emerald-500">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="font-bold text-center">cropped_{file.name}</p>
              </div>

              <button
                onClick={() => downloadOrShare(outputUrl, `cropped_${file.name}`)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download Cropped PDF
              </button>
            </div>
          ) : (
            <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-zinc-400">
              <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              <p>Cropped PDF will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

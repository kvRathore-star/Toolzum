"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { PDFDocument } from 'pdf-lib';

const PRESETS: Record<string, { label: string; width: number; height: number }> = {
  a4: { label: 'A4 (210×297mm)', width: 595.28, height: 841.89 },
  letter: { label: 'Letter (8.5×11in)', width: 612, height: 792 },
  legal: { label: 'Legal (8.5×14in)', width: 612, height: 1008 },
  a3: { label: 'A3 (297×420mm)', width: 841.89, height: 1190.55 },
  tabloid: { label: 'Tabloid (11×17in)', width: 792, height: 1224 },
  square: { label: 'Square (595×595)', width: 595, height: 595 },
};

const MM_TO_PT = 2.83465;

export default function ResizePdfPages() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState(0);

  const [preset, setPreset] = useState<string>('a4');
  const [customWidth, setCustomWidth] = useState(595);
  const [customHeight, setCustomHeight] = useState(842);
  const [unit, setUnit] = useState<'pt' | 'mm'>('pt');
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
      setPageCount(pdfDoc.getPageCount());
      setFileBytes(arrayBuffer);
      setFile(selectedFile);
      setOutputUrl(null);
    } catch (e) {
      toast.error("Failed to load PDF. It might be encrypted or corrupted.");
    }
  };

  const clearAll = () => {
    setFile(null);
    setFileBytes(null);
    setOutputUrl(null);
    setPageCount(0);
  };

  const getTargetSize = (): { width: number; height: number } | null => {
    if (preset !== 'custom') {
      const p = PRESETS[preset];
      if (p) return { width: p.width, height: p.height };
      return null;
    }
    let w = customWidth;
    let h = customHeight;
    if (unit === 'mm') {
      w = w * MM_TO_PT;
      h = h * MM_TO_PT;
    }
    return { width: Math.max(1, w), height: Math.max(1, h) };
  };

  const processResize = async () => {
    if (!fileBytes || !file) return;

    const target = getTargetSize();
    if (!target) {
      toast.error("Invalid target size.");
      return;
    }

    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.load(fileBytes);
      const pages = pdfDoc.getPages();

      for (const page of pages) {
        const { width: origW, height: origH } = page.getSize();
        const newW = target.width;
        const newH = target.height;

        if (newW >= origW && newH >= origH) {
          const offsetX = (newW - origW) / 2;
          const offsetY = (newH - origH) / 2;
          page.setMediaBox(0, 0, newW, newH);
          page.setCropBox(0, 0, newW, newH);
          page.translateContent(offsetX, offsetY);
        } else {
          page.setMediaBox(0, 0, newW, newH);
          page.setCropBox(0, 0, newW, newH);
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success("Page size changed successfully!");
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while resizing pages.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-700 dark:text-blue-400 text-sm">
          <strong>Resize PDF Pages:</strong> Changes page dimensions to a preset or custom size. "Resize canvas" adds white margins when enlarging; content may overflow when shrinking. For proportional content scaling, use a dedicated PDF editor.
        </div>
        <FileUploader
          accept="application/pdf"
          onFileSelect={handleFileSelect}
          title="Upload PDF to Resize"
          subtitle="Drag & drop your document here"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB • {pageCount} Pages</p>
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
          <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">Resize Settings</h4>

          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">Preset Sizes</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(PRESETS).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setPreset(key)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${preset === key ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)] hover:border-blue-300'}`}
                >
                  {val.label}
                </button>
              ))}
              <button
                onClick={() => setPreset('custom')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${preset === 'custom' ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)] hover:border-blue-300'}`}
              >
                Custom Size
              </button>
            </div>
          </div>

          {preset === 'custom' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setUnit('pt')}
                  className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all border ${unit === 'pt' ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)] hover:border-blue-300'}`}
                >
                  Points
                </button>
                <button
                  onClick={() => setUnit('mm')}
                  className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all border ${unit === 'mm' ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)] hover:border-blue-300'}`}
                >
                  Millimeters
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Width ({unit})</label>
                  <input
                    type="number"
                    aria-label={`Width (${unit})`}
                    min={1}
                    max={5000}
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Height ({unit})</label>
                  <input
                    type="number"
                    aria-label={`Height (${unit})`}
                    min={1}
                    max={5000}
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]"
                  />
                </div>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                {unit === 'mm'
                  ? `${(customWidth * MM_TO_PT).toFixed(1)} × ${(customHeight * MM_TO_PT).toFixed(1)} pts`
                  : `${(customWidth / MM_TO_PT).toFixed(1)} × ${(customHeight / MM_TO_PT).toFixed(1)} mm`}
              </p>
            </div>
          )}

          <button
            onClick={processResize}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
            {isProcessing ? "Resizing..." : "Resize All Pages"}
          </button>
        </div>

        <div className="space-y-6">
          {outputUrl ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                <h4 className="font-bold text-emerald-500">Resize Complete</h4>
              </div>

              <div className="bg-emerald-700/10 rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-emerald-500">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="font-bold text-center">resized_{file.name}</p>
              </div>

              <button
                onClick={() => downloadOrShare(outputUrl, `resized_${file.name}`)}
                className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download Resized PDF
              </button>
            </div>
          ) : (
            <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-[var(--text-muted)]">
              <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
              <p>Resized PDF will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

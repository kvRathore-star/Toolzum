"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { PDFDocument, rgb } from 'pdf-lib';
import { EyeOff, Download, FileText, RefreshCw } from 'lucide-react';

export default function RedactPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'pages' | 'area'>('pages');
  const [pageRange, setPageRange] = useState('');
  const [area, setArea] = useState({ x: 0, y: 0, w: 200, h: 100 });

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
      setPageRange('');
    } catch (e) {
      toast.error("Failed to load PDF. It might be encrypted or corrupted.");
    }
  };

  const clearAll = () => {
    setFile(null);
    setFileBuffer(null);
    setOutputUrl(null);
    setTotalPages(0);
    setPageRange('');
  };

  const parseRange = (input: string, max: number): number[] => {
    const pages = new Set<number>();
    const parts = input.split(',').map(p => p.trim());
    for (const part of parts) {
      if (!part) continue;
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const start = parseInt(startStr ?? "");
        const end = parseInt(endStr ?? "");
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= max) pages.add(i - 1);
          }
        }
      } else {
        const page = parseInt(part);
        if (!isNaN(page) && page >= 1 && page <= max) pages.add(page - 1);
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  const applyRedaction = async () => {
    if (!fileBuffer || !file) return;
    if ((mode === 'pages' || mode === 'area') && !pageRange.trim()) {
      toast.error("Please enter a page range.");
      return;
    }

    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const pages = pdfDoc.getPages();
      const targetPages = parseRange(pageRange, totalPages);

      targetPages.forEach((idx) => {
        const page = pages[idx];
        if (!page) return;
        const { width, height } = page.getSize();
        if (mode === 'pages') {
          page.drawRectangle({
            x: 0,
            y: 0,
            width,
            height,
            color: rgb(0, 0, 0),
          });
        } else {
          page.drawRectangle({
            x: area.x,
            y: area.y,
            width: area.w,
            height: area.h,
            color: rgb(0, 0, 0),
          });
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });

      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success("PDF redacted successfully!");
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while redacting PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm flex items-center gap-2">
          <EyeOff className="w-5 h-5 flex-shrink-0" />
          <span><strong>Permanent Redaction:</strong> Black out sensitive content in your PDFs. All processing happens locally — nothing is uploaded.</span>
        </div>
        <FileUploader 
          accept="application/pdf"
          onFileSelect={handleFileSelect} 
          title="Upload PDF to Redact"
          subtitle="Select a document to black out sensitive content"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-red-500" />
          <div>
            <h3 className="font-bold text-[var(--text-primary)] dark:text-[var(--text-primary)]">{file.name}</h3>
            <p className="text-[var(--text-secondary)] text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB • {totalPages} Pages</p>
          </div>
        </div>
        <button 
          onClick={clearAll}
          className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-secondary)] px-3 py-2 bg-[var(--bg-overlay)] dark:bg-[var(--bg-surface)] rounded-lg hover:bg-[var(--bg-surface)] transition-colors"
        >
          Change File
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 h-fit">
          <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2 flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-red-500" />
            Redaction Settings
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMode('pages')}
              className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${mode === 'pages' ? 'bg-red-600 border-red-500 text-white shadow-md' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-[var(--text-secondary)] dark:text-[var(--text-muted)]'}`}
            >
              Quick Redact
            </button>
            <button
              onClick={() => setMode('area')}
              className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${mode === 'area' ? 'bg-red-600 border-red-500 text-white shadow-md' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-[var(--text-secondary)] dark:text-[var(--text-muted)]'}`}
            >
              Custom Area
            </button>
          </div>

          {mode === 'pages' && (
            <p className="text-xs text-[var(--text-secondary)] -mt-2">
              Blacks out entire selected pages completely.
            </p>
          )}

          <div className="space-y-3">
            <label htmlFor="lbl-redactpdf-page-range" className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Page Range
            </label>
            <input id="lbl-redactpdf-page-range" aria-label="Page Range"
              type="text"
              placeholder={mode === 'pages' ? 'e.g. 1, 3, 5-10' : 'e.g. 1-5'}
              value={pageRange}
              onChange={(e) => setPageRange(e.target.value)}
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-red-500"
            />
            <p className="text-xs text-[var(--text-secondary)]">
              Enter page numbers or ranges separated by commas (e.g. 1-5, 8, 11-13). Max: {totalPages}.
            </p>
          </div>

          {mode === 'area' && (
            <div className="space-y-4 p-4 bg-[var(--bg-overlay)]/50 rounded-xl border border-[var(--border-subtle)]">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Redaction Rectangle</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="lbl-redactpdf-x-from-left" className="text-[10px] text-[var(--text-secondary)]">X (from left)</label>
                  <input id="lbl-redactpdf-x-from-left" aria-label="X (from left)"
                    type="number"
                    value={area.x}
                    onChange={(e) => setArea(a => ({...a, x: parseInt(e.target.value) || 0}))}
                    className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-red-500"
                  />
                </div>
                <div>
                  <label htmlFor="lbl-redactpdf-y-from-bottom" className="text-[10px] text-[var(--text-secondary)]">Y (from bottom)</label>
                  <input id="lbl-redactpdf-y-from-bottom" aria-label="Y (from bottom)"
                    type="number"
                    value={area.y}
                    onChange={(e) => setArea(a => ({...a, y: parseInt(e.target.value) || 0}))}
                    className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-red-500"
                  />
                </div>
                <div>
                  <label htmlFor="lbl-redactpdf-width" className="text-[10px] text-[var(--text-secondary)]">Width</label>
                  <input id="lbl-redactpdf-width" aria-label="Width"
                    type="number"
                    value={area.w}
                    onChange={(e) => setArea(a => ({...a, w: parseInt(e.target.value) || 0}))}
                    className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-red-500"
                  />
                </div>
                <div>
                  <label htmlFor="lbl-redactpdf-height" className="text-[10px] text-[var(--text-secondary)]">Height</label>
                  <input id="lbl-redactpdf-height" aria-label="Height"
                    type="number"
                    value={area.h}
                    onChange={(e) => setArea(a => ({...a, h: parseInt(e.target.value) || 0}))}
                    className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          )}

          <button 
            onClick={applyRedaction}
            disabled={isProcessing || !pageRange.trim()}
            className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Redacting...
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                Apply Redaction
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          {outputUrl ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                <h4 className="font-bold text-emerald-500">Redaction Complete</h4>
              </div>
              <div className="bg-emerald-700/10 rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-emerald-500">
                <EyeOff className="w-16 h-16 mb-4" />
                <p className="font-bold text-center">redacted_{file.name}</p>
                <p className="text-xs text-emerald-500/80 mt-1">Sensitive content has been permanently blacked out.</p>
              </div>
              <button 
                onClick={() => downloadOrShare(outputUrl, `redacted_${file.name}`)}
                className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Redacted PDF
              </button>
            </div>
          ) : (
            <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-[var(--text-muted)]">
              <EyeOff className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm font-medium">Redacted PDF will appear here</p>
              <p className="text-xs text-[var(--text-secondary)] max-w-xs mt-1 text-center">Configure the redaction settings and click Apply to permanently black out content.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

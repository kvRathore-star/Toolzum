"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const PRESET_COLORS = [
  { label: 'Black', hex: '#000000' },
  { label: 'White', hex: '#FFFFFF' },
  { label: 'Red', hex: '#FF0000' },
  { label: 'Blue', hex: '#0000FF' },
  { label: 'Green', hex: '#00AA00' },
  { label: 'Orange', hex: '#FF8800' },
  { label: 'Purple', hex: '#8800FF' },
  { label: 'Gray', hex: '#888888' },
];

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(result[1]!, 16) / 255,
    g: parseInt(result[2]!, 16) / 255,
    b: parseInt(result[3]!, 16) / 255,
  };
}

export default function AddTextToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  const [pageNum, setPageNum] = useState(1);
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [color, setColor] = useState('#000000');
  const [customColor, setCustomColor] = useState('#000000');
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);
  const [centerH, setCenterH] = useState(false);
  const [centerV, setCenterV] = useState(false);
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
      setTotalPages(pdfDoc.getPageCount());
      setFileBuffer(arrayBuffer);
      setFile(selectedFile);
      setOutputUrl(null);
      setPageNum(1);
    } catch (e) {
      toast.error("Failed to load PDF. It might be encrypted or corrupted.");
    }
  };

  const clearAll = () => {
    setFile(null);
    setFileBuffer(null);
    setOutputUrl(null);
    setTotalPages(0);
    setText('');
    setPageNum(1);
  };

  const addText = async () => {
    if (!fileBuffer || !file) return;
    if (!text.trim()) {
      toast.error("Please enter text to add.");
      return;
    }

    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const page = pages[pageNum - 1]!;
      const { width, height } = page.getSize();

      const { r, g, b } = hexToRgb(color);

      let textX = x;
      let textY = y;

      if (centerH) {
        textX = width / 2 - font.widthOfTextAtSize(text, fontSize) / 2;
      }
      if (centerV) {
        textY = height / 2 - font.heightAtSize(fontSize) / 2;
      }

      page.drawText(text, {
        x: textX,
        y: textY,
        size: fontSize,
        font,
        color: rgb(r, g, b),
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });

      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success("Text added to PDF!");
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while adding text to PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm">
          <strong>Add Text to PDF:</strong> Label diagrams, annotate documents, or add notes to specific pages. Text is rendered as a permanent layer on the PDF page.
        </div>
        <FileUploader
          accept="application/pdf"
          onFileSelect={handleFileSelect}
          title="Upload PDF"
          subtitle="Select document to add text"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-[var(--text-primary)]">{file.name}</h3>
          <p className="text-[var(--text-secondary)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB • {totalPages} Pages</p>
        </div>
        <button
          onClick={clearAll}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
        >
          Change File
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6 h-fit">
          <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">Text Settings</h4>

          <div className="space-y-3">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Target Page</label>
            <div className="flex gap-2 items-center">
              <input aria-label="Target Page"
                type="number"
                min={1}
                max={totalPages}
                value={pageNum}
                onChange={(e) => setPageNum(Math.min(totalPages, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-24 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]"
              />
              <span className="text-sm text-[var(--text-secondary)]">of {totalPages}</span>
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="lbl-addtexttopdf-text-content" className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Text Content</label>
            <input id="lbl-addtexttopdf-text-content" aria-label="Text Content"
              type="text"
              placeholder="Enter text to add..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Font Size</label>
              <span className="text-xs font-bold text-[var(--accent)]">{fontSize}px</span>
            </div>
            <input aria-label="Font Size"
              type="range"
              min={8}
              max={72}
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Color</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => { setColor(c.hex); setCustomColor(c.hex); }}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${color === c.hex ? 'border-[var(--accent)] scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input aria-label="Text color"
                type="color"
                value={customColor}
                onChange={(e) => { setCustomColor(e.target.value); setColor(e.target.value); }}
                className="w-10 h-10 p-0.5 rounded-lg cursor-pointer border border-[var(--border-subtle)] bg-transparent"
              />
              <input aria-label="Text color hex value"
                type="text"
                value={customColor}
                onChange={(e) => { setCustomColor(e.target.value); setColor(e.target.value); }}
                placeholder="#000000"
                className="flex-1 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="lbl-addtexttopdf-x-position" className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">X Position</label>
              <input id="lbl-addtexttopdf-x-position" aria-label="X Position"
                type="number"
                value={x}
                onChange={(e) => setX(parseInt(e.target.value) || 0)}
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lbl-addtexttopdf-y-position" className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Y Position</label>
              <input id="lbl-addtexttopdf-y-position" aria-label="Y Position"
                type="number"
                value={y}
                onChange={(e) => setY(parseInt(e.target.value) || 0)}
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={centerH}
                onChange={(e) => setCenterH(e.target.checked)}
                className="rounded border-[var(--border-subtle)] text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              <span className="text-sm text-[var(--text-primary)]">Center Horizontally</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={centerV}
                onChange={(e) => setCenterV(e.target.checked)}
                className="rounded border-[var(--border-subtle)] text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              <span className="text-sm text-[var(--text-primary)]">Center Vertically</span>
            </label>
          </div>

          <button
            onClick={addText}
            disabled={isProcessing || !text.trim()}
            className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2 mt-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            {isProcessing ? "Processing..." : "Add Text to Page"}
          </button>
        </div>

        <div className="space-y-6">
          {outputUrl ? (
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                <h4 className="font-bold text-[var(--accent)]">Text Added</h4>
              </div>

              <div className="bg-emerald-700/10 rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-[var(--accent)]">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="font-bold text-center">annotated_{file.name}</p>
              </div>

              <button
                onClick={() => downloadOrShare(outputUrl, `annotated_${file.name}`)}
                className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download PDF
              </button>
            </div>
          ) : (
            <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-[var(--text-muted)]">
              <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              <p>Generated PDF will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

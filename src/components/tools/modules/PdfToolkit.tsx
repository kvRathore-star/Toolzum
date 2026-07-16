"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { FileUploader } from '../FileUploader';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

type ToolAction = 'bates' | 'stamp' | 'timestamp' | 'bgcolor' | 'addblank' | 'toc';

const PAGE_SIZES: Record<string, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
  legal: [612, 1008],
  a3: [841.89, 1190.55],
};

export default function PdfToolkit() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [action, setAction] = useState<ToolAction>('bates');

  const [prefix, setPrefix] = useState('DOC-');
  const [startNum, setStartNum] = useState(1);
  const [position, setPosition] = useState<'bottom-right' | 'bottom-center' | 'bottom-left' | 'top-right' | 'top-center' | 'top-left'>('bottom-right');
  const [stampText, setStampText] = useState('DRAFT');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [blankCount, setBlankCount] = useState(1);
  const [blankPosition, setBlankPosition] = useState<'before' | 'after'>('after');
  const [blankPage, setBlankPage] = useState(1);
  const [targetSize, setTargetSize] = useState('a4');

  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    return () => { if (outputUrl) URL.revokeObjectURL(outputUrl); };
  }, [outputUrl]);

  const handleFileSelect = async (selectedFile: File) => {
    try {
      const buf = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buf);
      setPageCount(pdfDoc.getPageCount());
      setFileBuffer(buf);
      setFile(selectedFile);
      setOutputUrl(null);
    } catch {
      toast.error('Failed to load PDF.');
    }
  };

  const clearAll = () => {
    setFile(null); setFileBuffer(null); setOutputUrl(null); setPageCount(0);
  };

  const processAction = async () => {
    if (!fileBuffer || !file) return;
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();

      if (action === 'bates') {
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          const { width, height } = page.getSize();
          const text = `${prefix}${String(startNum + i).padStart(4, '0')}`;
          const size = 10;
          const margin = 20;
          const tw = font.widthOfTextAtSize(text, size);
          let x = width - tw - margin;
          let y = margin;
          if (position.includes('center')) x = (width - tw) / 2;
          if (position.includes('left')) x = margin;
          if (position.includes('top')) y = height - margin - size;
          page.drawText(text, { x, y, size, font: boldFont, color: rgb(0.2, 0.2, 0.2) });
        }
      } else if (action === 'stamp') {
        for (const page of pages) {
          const { width, height } = page.getSize();
          const size = 48;
          page.drawText(stampText, {
            x: width / 2 - font.widthOfTextAtSize(stampText, size) / 2,
            y: height / 2 - size / 2,
            size,
            font: boldFont,
            color: rgb(0.8, 0.2, 0.2),
            opacity: 0.3,
            rotate: degrees(-45),
          });
        }
      } else if (action === 'timestamp') {
        const now = new Date();
        const ts = now.toLocaleString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit',
        });
        for (const page of pages) {
          const { width, height } = page.getSize();
          const size = 9;
          const text = `Generated: ${ts}`;
          const tw = font.widthOfTextAtSize(text, size);
          page.drawText(text, {
            x: width - tw - 20,
            y: 15,
            size,
            font,
            color: rgb(0.5, 0.5, 0.5),
          });
        }
      } else if (action === 'bgcolor') {
        const [r, g, b] = hexToRgb(bgColor);
        for (const page of pages) {
          const { width, height } = page.getSize();
          page.drawRectangle({
            x: 0, y: 0, width, height,
            color: rgb(r, g, b),
            opacity: 0.15,
          });
        }
      } else if (action === 'addblank') {
        const [pw, ph] = PAGE_SIZES[targetSize] || [595.28, 841.89];
        for (let i = 0; i < blankCount; i++) {
          const blankPageObj = pdfDoc.addPage([pw, ph]);
          if (blankPosition === 'before') {
            const targetIdx = Math.min(blankPage - 1, pages.length);
            pages.splice(targetIdx, 0, blankPageObj);
          } else {
            const targetIdx = Math.min(blankPage, pages.length);
            pages.splice(targetIdx, 0, blankPageObj);
          }
        }
      } else if (action === 'toc') {
        const tocPage = pdfDoc.insertPage(0, [595.28, 841.89]);
        tocPage.drawText('Table of Contents', {
          x: 50, y: 780, size: 24, font: boldFont, color: rgb(0.1, 0.1, 0.1),
        });
        tocPage.drawLine({
          start: { x: 50, y: 770 }, end: { x: 545, y: 770 },
          thickness: 1, color: rgb(0.2, 0.2, 0.2),
        });
        const totalPages = pdfDoc.getPageCount() - 1;
        for (let i = 1; i <= totalPages; i++) {
          const yPos = 740 - i * 22;
          if (yPos < 50) break;
          tocPage.drawText(`Section ${i}`, {
            x: 50, y: yPos, size: 12, font, color: rgb(0.2, 0.2, 0.2),
          });
          tocPage.drawText(`Page ${i + 1}`, {
            x: 500, y: yPos, size: 12, font, color: rgb(0.5, 0.5, 0.5),
          });
          tocPage.drawLine({
            start: { x: 50, y: yPos - 8 }, end: { x: 545, y: yPos - 8 },
            thickness: 0.3, color: rgb(0.85, 0.85, 0.85),
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success(`${actionLabel()} applied successfully!`);
    } catch (e) {
      console.error(e);
      toast.error(`Failed to apply ${actionLabel()}.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const actionLabel = () => {
    const labels: Record<ToolAction, string> = {
      bates: 'Bates Numbering',
      stamp: 'Stamp',
      timestamp: 'Timestamp',
      bgcolor: 'Background Color',
      addblank: 'Add Blank Page',
      toc: 'Table of Contents',
    };
    return labels[action];
  };

  const actionClass = (a: ToolAction) =>
    `px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${action === a ? 'bg-blue-600 text-white shadow-md' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`;

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm">
          <strong>PDF Toolkit:</strong> Add Bates numbering, stamps, timestamps, background colors, blank pages, or a table of contents to your PDFs.
        </div>
        <FileUploader accept="application/pdf" onFileSelect={(_f) => handleFileSelect(_f)}
          title="Upload PDF" subtitle="Select document to apply toolkit options" />
      </div>
    );
  }

  const renderOptions = () => {
    switch (action) {
      case 'bates':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Prefix</label>
              <input type="text" value={prefix} onChange={(e) => setPrefix(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Start Number</label>
              <input type="number" value={startNum} onChange={(e) => setStartNum(parseInt(e.target.value) || 1)} min={1}
                className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
            </div>
          </div>
        );
      case 'stamp':
        return (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Stamp Text</label>
            <input type="text" value={stampText} onChange={(e) => setStampText(e.target.value)}
              placeholder="DRAFT, CONFIDENTIAL, etc."
              className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
          </div>
        );
      case 'bgcolor':
        return (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Background Color (subtle tint)</label>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
              className="w-full h-12 rounded-lg cursor-pointer border border-zinc-200 dark:border-zinc-700" />
          </div>
        );
      case 'addblank':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Number of Blank Pages</label>
              <input type="number" value={blankCount} onChange={(e) => setBlankCount(Math.max(1, parseInt(e.target.value) || 1))} min={1} max={50}
                className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Page Size</label>
              <select value={targetSize} onChange={(e) => setTargetSize(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-900 dark:text-white outline-none focus:border-blue-500">
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
                <option value="legal">Legal</option>
                <option value="a3">A3</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Insert Position</label>
              <select value={blankPosition} onChange={(e) => setBlankPosition(e.target.value as 'before' | 'after')}
                className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-900 dark:text-white outline-none focus:border-blue-500">
                <option value="after">After Page</option>
                <option value="before">Before Page</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">At Page</label>
              <input type="number" value={blankPage} onChange={(e) => setBlankPage(Math.max(1, Math.min(pageCount, parseInt(e.target.value) || 1)))} min={1} max={pageCount}
                className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const needsPosition = action === 'bates';
  const subActions: ToolAction[] = ['bates', 'stamp', 'timestamp', 'bgcolor', 'addblank', 'toc'];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-white/5">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB &middot; {pageCount} Pages</p>
        </div>
        <button onClick={clearAll}
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg">Change File</button>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-6">
        <h4 className="text-zinc-900 dark:text-white font-medium border-b border-zinc-100 dark:border-zinc-800 pb-2">
          Select Operation
        </h4>

        <div className="flex flex-wrap gap-2">
          {subActions.map(a => (
            <button key={a} onClick={() => setAction(a)} className={actionClass(a)}>
              {actionLabel()}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {renderOptions()}
          {needsPosition && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Position</label>
              <div className="grid grid-cols-3 gap-2">
                {(['bottom-left', 'bottom-center', 'bottom-right', 'top-left', 'top-center', 'top-right'] as const).map(p => (
                  <button key={p} onClick={() => setPosition(p)}
                    className={`py-2 text-xs font-bold border rounded-lg ${position === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'}`}>
                    {p.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button onClick={processAction} disabled={isProcessing}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2">
          {isProcessing ? 'Processing...' : `Apply ${actionLabel()}`}
        </button>
      </div>

      {outputUrl && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-4 animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <h4 className="font-bold text-emerald-500">Done</h4>
          </div>
          <button onClick={() => downloadOrShare(outputUrl, `toolkit_${file.name}`)}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2">
            Download PDF
          </button>
        </div>
      )}
    </div>
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 1, 1];
  return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255];
}

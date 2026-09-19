"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';

interface TocEntry {
  title: string;
  page: number;
}

export default function PdfTableOfContents() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [entries, setEntries] = useState<TocEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const handleFileSelect = async (selectedFile: File) => {
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      setFileBytes(arrayBuffer.slice(0));
      setFile(selectedFile);
      setOutputUrl(null);
      setEntries([]);
    } catch {
      toast.error('Failed to load PDF.');
    }
  };

  const clearAll = () => {
    setFile(null);
    setFileBytes(null);
    setOutputUrl(null);
    setEntries([]);
  };

  const buildToc = async () => {
    if (!fileBytes || !file) return;
    setIsProcessing(true);
    try {
      // Real heading detection: render each page's text via pdf.js, group by
      // font size, and take the largest-size line as the page's heading
      // candidate. Pages whose largest text is body-size are skipped.
      const pdfjsLib = await import('pdfjs-dist');
      const pdf = await pdfjsLib.getDocument(fileBytes.slice(0)).promise;
      const found: TocEntry[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const bySize = new Map<number, string[]>();
        for (const item of content.items) {
          if (!('str' in item) || !('transform' in item)) continue;
          const text = (item.str as string).trim();
          if (!text) continue;
          const size = Math.round(Math.abs((item.transform as number[])[0] ?? 0));
          if (size <= 0) continue;
          const bucket = bySize.get(size) || [];
          bucket.push(text);
          bySize.set(size, bucket);
        }
        if (bySize.size === 0) continue;
        const maxSize = Math.max(...bySize.keys());
        const bodySizes = [...bySize.keys()].sort((a, b) => a - b);
        // Heading = largest size, only if it stands clearly above body text.
        const second = bodySizes.length > 1 ? bodySizes[bodySizes.length - 2]! : 0;
        if (maxSize >= 14 && maxSize - second >= 2) {
          const title = bySize.get(maxSize)!.join(' ').slice(0, 90);
          if (title) found.push({ title, page: i });
        }
      }
      if (found.length === 0) {
        toast.error('No clear headings found — this PDF may use uniform text sizes. A generic page list was not generated.');
        return;
      }
      const { PDFDocument: LibDoc, StandardFonts: StdFonts, rgb: RGB } = await import('pdf-lib');
      const pdfDoc = await LibDoc.load(fileBytes.slice(0));
      const font = await pdfDoc.embedFont(StdFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StdFonts.HelveticaBold);
      const tocPage = pdfDoc.insertPage(0, [595.28, 841.89]);
      tocPage.drawText('Table of Contents', { x: 50, y: 780, size: 24, font: boldFont, color: RGB(0.1, 0.1, 0.1) });
      tocPage.drawLine({ start: { x: 50, y: 770 }, end: { x: 545, y: 770 }, thickness: 1, color: RGB(0.2, 0.2, 0.2) });
      let yPos = 740;
      for (const entry of found) {
        if (yPos < 60) break; // first page overflow guard
        tocPage.drawText(entry.title, { x: 50, y: yPos, size: 12, font, color: RGB(0.2, 0.2, 0.2), maxWidth: 420 });
        tocPage.drawText(`Page ${entry.page + 1}`, { x: 500, y: yPos, size: 12, font, color: RGB(0.5, 0.5, 0.5) });
        tocPage.drawLine({ start: { x: 50, y: yPos - 8 }, end: { x: 545, y: yPos - 8 }, thickness: 0.3, color: RGB(0.85, 0.85, 0.85) });
        yPos -= 22;
      }
      // Re-number: inserted page shifts everything by one — entries already
      // account for it (entry.page + 1).
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      setEntries(found);
      toast.success(`Table of contents built from ${found.length} detected headings!`);
    } catch (e) {
      console.error(e);
      toast.error('Could not build a table of contents for this PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm">
          <strong>Table of Contents:</strong> Detects real headings (largest text per page) and inserts a linked contents page. PDFs with uniform text sizes have no detectable headings.
        </div>
        <FileUploader
          accept="application/pdf"
          onFileSelect={handleFileSelect}
          title="Upload PDF for Table of Contents"
          subtitle="Drag & drop your document here"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-[var(--text-primary)]">{file.name}</h3>
          <p className="text-[var(--text-secondary)] dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <button
          onClick={clearAll}
          className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
        >
          Change File
        </button>
      </div>

      <button
        onClick={buildToc}
        disabled={isProcessing}
        className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
      >
        {isProcessing ? 'Detecting headings...' : 'Build Table of Contents'}
      </button>

      {entries.length > 0 && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-3">
          <h4 className="font-bold text-[var(--text-primary)]">Detected headings ({entries.length})</h4>
          <ul className="text-sm text-[var(--text-secondary)] space-y-1 max-h-60 overflow-y-auto">
            {entries.map((e, i) => (
              <li key={i} className="flex justify-between gap-4">
                <span className="truncate">{e.title}</span>
                <span className="shrink-0">p. {e.page + 1}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {outputUrl && (
        <button
          onClick={() => downloadOrShare(outputUrl, `toc_${file.name}`)}
          className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg"
        >
          Download PDF with Contents
        </button>
      )}
    </div>
  );
}

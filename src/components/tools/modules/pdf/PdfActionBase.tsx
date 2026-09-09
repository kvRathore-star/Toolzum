"use client";
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { FileUploader } from '../../FileUploader';
import { PDFDocument, StandardFonts, degrees } from 'pdf-lib';
import { EmptyState } from '@/components/EmptyState';

interface PdfActionBaseProps {
  title: string;
  description: string;
  renderOptions: (state: Record<string, unknown>, setState: (s: Record<string, unknown>) => void) => React.ReactNode;
  processAction: (pdfDoc: any, font: any, boldFont: any, pages: any[], state: Record<string, unknown>) => Promise<void>;
}

export function PdfActionBase({ title, description, renderOptions, processAction }: PdfActionBaseProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [state, setState] = useState<Record<string, unknown>>({});

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

  const handleProcess = async () => {
    if (!fileBuffer || !file) return;
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();
      await processAction(pdfDoc, font, boldFont, pages, state);
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success(`${title} applied successfully!`);
    } catch (e) {
      console.error(e);
      toast.error(`Failed to apply ${title}.`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-700 dark:text-blue-400 text-sm">
          <strong>{title}:</strong> {description}
        </div>
        <FileUploader accept="application/pdf" onFileSelect={(_f) => handleFileSelect(_f)}
          title="Upload PDF" subtitle="Select document to apply this operation" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB &middot; {pageCount} Pages</p>
        </div>
        <button onClick={() => { setFile(null); setFileBuffer(null); setOutputUrl(null); setPageCount(0); }}
          className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg">Change File</button>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
        <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">
          Options
        </h4>
        {renderOptions(state, setState)}
        <button onClick={handleProcess} disabled={isProcessing}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2">
          {isProcessing ? 'Processing...' : `Apply ${title}`}
        </button>
      </div>

      {outputUrl ? (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4 animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
            <h4 className="font-bold text-emerald-500">Done</h4>
          </div>
          <button onClick={() => downloadOrShare(outputUrl, `toolkit_${file.name}`)}
            className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2">
            Download PDF
          </button>
        </div>
      ) : (
        <div className="border border-dashed border-[var(--border-subtle)] rounded-2xl">
          <EmptyState
            title="Result will appear here"
            message="Run the action above."
          />
        </div>
      )}
    </div>
  );
}

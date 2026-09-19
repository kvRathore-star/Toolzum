"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { PDFDocument } from 'pdf-lib';

export default function RepairPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null);
  const [repairLog, setRepairLog] = useState<string[]>([]);
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
      setFileBytes(arrayBuffer);
      setFile(selectedFile);
      setOutputUrl(null);
      setRepairLog([]);
    } catch (e) {
      toast.error("Failed to read file.");
    }
  };

  const clearAll = () => {
    setFile(null);
    setFileBytes(null);
    setOutputUrl(null);
    setRepairLog([]);
  };

  const repairPdf = async () => {
    if (!fileBytes || !file) return;

    setIsProcessing(true);
    const log: string[] = [];
    try {
      log.push("Attempting to load PDF document...");
      let pdfDoc: Awaited<ReturnType<typeof PDFDocument.load>>;

      try {
        pdfDoc = await PDFDocument.load(fileBytes);
        log.push("PDF loaded successfully with standard settings.");
      } catch {
        log.push("Standard load failed. Retrying with encryption bypass...");
        pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
        log.push("PDF loaded with encryption bypass enabled.");
      }

      const pageCount = pdfDoc.getPageCount();
      log.push(`Document has ${pageCount} page(s).`);

      const pages = pdfDoc.getPages();
      let recoveredCount = 0;
      for (const page of pages) {
        try {
          const { width, height } = page.getSize();
          if (width > 0 && height > 0) recoveredCount++;
        } catch {
          log.push("Warning: Could not read dimensions on a page.");
        }
      }
      log.push(`Verified ${recoveredCount} page(s) with valid dimensions.`);

      // Honest repair: lenient load + clean re-serialization with flat object
      // streams, then a verification reload. This fixes broken cross-reference
      // tables and truncated downloads — not object-level corruption.
      log.push("Re-serializing document with flat object streams...");
      const pdfBytes = await pdfDoc.save({ useObjectStreams: false });

      const repairedDoc = await PDFDocument.load(pdfBytes);
      const repairedCount = repairedDoc.getPageCount();
      log.push(`Verified reload: ${repairedCount} page(s) intact.`);

      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      log.push("Done. If pages were missing before, this file only recovers what was still readable — severely corrupted objects cannot be rebuilt in a browser.");
      setRepairLog(log);
      toast.success("Recovery pass complete — check the log!");
    } catch (e) {
      console.error(e);
      log.push("Repair failed: " + (e instanceof Error ? e.message : "Unknown error"));
      setRepairLog(log);
      toast.error("Could not repair this PDF. It may be severely corrupted.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm">
          <strong>PDF Recovery Pass:</strong> Re-serializes damaged PDFs and recovers readable pages. Fixes broken cross-reference tables and truncated downloads; cannot rebuild severely corrupted objects.
        </div>
        <FileUploader
          accept="application/pdf"
          onFileSelect={handleFileSelect}
          title="Upload PDF to Repair"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 h-fit">
          <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">Repair Options</h4>

          <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-3 rounded-xl text-[var(--accent)] text-xs space-y-1">
            <p>The repair tool will attempt to:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Load the PDF with encryption bypass</li>
              <li>Rebuild the document structure</li>
              <li>Recover readable page content</li>
              <li>Re-save with a clean cross-reference table</li>
            </ul>
          </div>

          <button
            onClick={repairPdf}
            disabled={isProcessing}
            className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            {isProcessing ? "Repairing..." : "Repair PDF"}
          </button>
        </div>

        <div className="space-y-6">
          {outputUrl ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                <h4 className="font-bold text-emerald-500">Repair Complete</h4>
              </div>

              <div className="bg-emerald-700/10 rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-emerald-500">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="font-bold text-center">repaired_{file.name}</p>
              </div>

              <button
                onClick={() => downloadOrShare(outputUrl, `repaired_${file.name}`)}
                className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download Repaired PDF
              </button>
            </div>
          ) : (
            <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-[var(--text-muted)]">
              <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              <p>Repaired PDF will appear here</p>
            </div>
          )}

          {repairLog.length > 0 && (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4 rounded-2xl shadow-xl space-y-2">
              <h5 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Repair Log</h5>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {repairLog.map((entry, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-[var(--text-secondary)] shrink-0">[{i + 1}]</span>
                    <span className={entry.startsWith("Repair failed") || entry.startsWith("Warning") ? "text-[var(--accent)]" : entry.startsWith("Repair complete") ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}>{entry}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

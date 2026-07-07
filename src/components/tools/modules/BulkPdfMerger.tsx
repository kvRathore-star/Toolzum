"use client";
import React, { useState, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import { Upload, X, Loader2, Download, FileText, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSession } from '@/lib/auth-client';
import { withErrorHandling } from '@/lib/withErrorHandling';
import { hasLargeFiles, checkMemory } from '@/lib/fileUtils';

export default function BulkPdfMerger() {
  const [files, setFiles] = useState<File[]>([]);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  const isPro = (session?.user as Record<string, unknown>)?.plan === 'pro';

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const accepted = Array.from(e.target.files || []);
    if (accepted.length === 0) return;
    setFiles(prev => [...prev, ...accepted]);
    toast.success(`Added ${accepted.length} PDF(s)`);
  };

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const handleMerge = async () => {
    if (files.length < 2) { toast.error('Upload at least 2 PDFs'); return; }
    setIsProcessing(true);
    if (hasLargeFiles(files)) {
      const mem = checkMemory();
      const proceed = window.confirm(
        `Large PDFs detected (>100MB).${mem.low ? ` Your device has only ${mem.available} RAM.` : ''} Merging loads all PDFs into memory — expect crashes on low-RAM devices. Continue?`
      );
      if (!proceed) { setIsProcessing(false); return; }
    }
    try {
      const { PDFDocument } = await import('pdf-lib');
      const mergedDoc = await PDFDocument.create();
      for (const file of files) {
        const srcBytes = await withErrorHandling(
          () => file.arrayBuffer(),
          { toast: `Failed to read ${file.name}`, log: true }
        );
        if (!srcBytes) {
          toast.error(`Skipping ${file.name} — read failed`);
          continue;
        }
        const srcDoc = await PDFDocument.load(srcBytes as ArrayBuffer);
        const indices = srcDoc.getPageIndices();
        const pages = await mergedDoc.copyPages(srcDoc, indices);
        pages.forEach(p => mergedDoc.addPage(p));
      }
      const pdfBytes = await mergedDoc.save();
      setMergedBlob(new Blob([pdfBytes as BlobPart], { type: 'application/pdf' }));
      toast.success(`Merged ${files.length} PDFs`);
    } catch {
      toast.error('Browser memory limit reached. Try merging fewer or smaller PDFs.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadMerged = () => {
    if (!mergedBlob) return;
    const url = URL.createObjectURL(mergedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'merged-document.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-[var(--radius-lg)] flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
        <FileText className="w-4 h-4 shrink-0" />
        <span><strong>Zero-trust processing:</strong> All PDF merging happens locally. Nothing uploaded.</span>
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-6 sm:p-8 space-y-6">
        <div onClick={() => fileRef.current?.click()} className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-[var(--border-subtle)] rounded-[var(--radius-xl)] cursor-pointer hover:border-[var(--accent)]/50 transition-colors bg-[var(--bg-overlay)]">
          <Upload className="w-10 h-10 text-[var(--text-muted)] mb-3" />
          <p className="text-sm text-[var(--text-primary)] font-medium">Drop PDF files here</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Files will be merged in the order shown</p>
          <input ref={fileRef} type="file" accept=".pdf" multiple onChange={handleFiles} className="hidden" />
        </div>
        {files.length > 0 && (
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-[var(--bg-overlay)] rounded-[var(--radius-md)] group">
                <span className="text-xs font-mono text-[var(--text-muted)] w-5">{i + 1}.</span>
                <FileText className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                <span className="text-sm text-[var(--text-primary)] truncate flex-1">{f.name}</span>
                <span className="text-xs text-[var(--text-muted)] font-mono">{(f.size / 1024).toFixed(0)}KB</span>
                <button onClick={() => removeFile(i)} className="opacity-0 group-hover:opacity-100 w-5 h-5 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center hover:bg-red-500/40 transition-all"><X className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        )}
        <button onClick={handleMerge} disabled={isProcessing || files.length < 2} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent)] text-white font-medium rounded-[var(--radius-lg)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          {isProcessing ? `Merging ${files.length} PDFs...` : `Merge ${files.length} PDF(s) into One`}
        </button>
        {mergedBlob && (
          <button onClick={downloadMerged} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-[var(--radius-lg)] hover:bg-emerald-500 transition-all">
            <Download className="w-4 h-4" /> Download Merged PDF
          </button>
        )}
      </div>
    </div>
  );
}

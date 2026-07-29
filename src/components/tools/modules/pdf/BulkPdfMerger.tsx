"use client";
import React, { useState, useRef } from 'react';
import { Upload, Loader2, Download, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { withErrorHandling } from '@/lib/withErrorHandling';
import { hasLargeFiles, checkMemory } from '@/lib/fileUtils';
import { useBatchProgress } from '@/hooks/useBatchProgress';
import { BatchProgressPanel } from '@/components/tools/BatchProgressPanel';

export default function BulkPdfMerger() {
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const batch = useBatchProgress();

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const accepted = Array.from(e.target.files || []);
    if (accepted.length === 0) return;
    batch.addFiles(accepted);
    setMergedBlob(null);
    toast.success(`Added ${accepted.length} PDF(s)`);
  };

  const processor = async (file: File, onProgress: (pct: number) => void): Promise<Blob | null> => {
    return withErrorHandling(async () => {
      const { PDFDocument } = await import('pdf-lib');
      const srcBytes = await file.arrayBuffer();
      onProgress(40);
      const srcDoc = await PDFDocument.load(srcBytes);
      onProgress(70);
      const doc = await PDFDocument.create();
      const indices = srcDoc.getPageIndices();
      const pages = await doc.copyPages(srcDoc, indices);
      pages.forEach(p => doc.addPage(p));
      const pdfBytes = await doc.save();
      onProgress(100);
      return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
    }, { toast: `Failed to process ${file.name}`, log: true });
  };

  const handleMerge = async () => {
    if (batch.files.length < 2) { toast.error('Upload at least 2 PDFs'); return; }
    if (hasLargeFiles(batch.files.map(f => f.file))) {
      const mem = checkMemory();
      const proceed = window.confirm(
        `Large PDFs detected (>100MB).${mem.low ? ` Your device has only ${mem.available} RAM.` : ''} Merging loads all PDFs into memory — expect crashes on low-RAM devices. Continue?`
      );
      if (!proceed) return;
    }
    setMergedBlob(null);
    await batch.processBatch(processor, {
      onComplete: () => {
        const blobs = batch.files.filter(f => f.status === 'done' && f.result).map(f => f.result!);
        if (blobs.length > 0) {
          const mergedBlobs = new Blob(blobs, { type: 'application/pdf' });
          setMergedBlob(mergedBlobs);
          toast.success(`Merged ${blobs.length} PDFs`);
        }
      }
    });
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
    <div className="w-full max-w-3xl mx-auto space-y-6">
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

        <button
          onClick={handleMerge}
          disabled={batch.isProcessing || batch.files.length < 2}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent)] text-white font-medium rounded-[var(--radius-lg)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {batch.isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          {batch.isProcessing ? `Merging ${batch.files.length} PDFs...` : `Merge ${batch.files.length} PDF(s) into One`}
        </button>

        {mergedBlob && !batch.isProcessing && (
          <button onClick={downloadMerged} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-[var(--radius-lg)] hover:bg-emerald-500 transition-all">
            <Download className="w-4 h-4" /> Download Merged PDF
          </button>
        )}
      </div>

      <BatchProgressPanel
        files={batch.files}
        progress={batch.progress}
        isProcessing={batch.isProcessing}
        onRemove={batch.removeFile}
        onClear={() => { batch.clearFiles(); setMergedBlob(null); }}
        onAbort={batch.abort}
      />
    </div>
  );
}

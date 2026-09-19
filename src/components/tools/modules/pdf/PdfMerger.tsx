"use client";

import React, { useState, useEffect } from 'react';
import { toast } from "react-hot-toast";
import { FileUploader, UploadedFile } from '@/components/FileUploader';
import { PDFDocument } from 'pdf-lib';
import { downloadOrShare } from '@/utils/nativeShare';
import { createDownloadBlob } from '@/utils/blob';
import { useEnterToSubmit } from '@/lib/keyboard';
import { EmptyState } from '@/components/EmptyState';

export default function PdfMerger() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const handleFilesAccepted = (acceptedFiles: UploadedFile[]) => {
    setFiles(acceptedFiles);
    setOutputUrl(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newFiles = [...files];
    const temp = newFiles[index - 1]!;
    newFiles[index - 1]! = newFiles[index]!;
    newFiles[index] = temp;
    setFiles(newFiles);
    setOutputUrl(null);
  };

  const moveDown = (index: number) => {
    if (index === files.length - 1) return;
    const newFiles = [...files];
    const temp = newFiles[index + 1]!;
    newFiles[index + 1]! = newFiles[index]!;
    newFiles[index] = temp;
    setFiles(newFiles);
    setOutputUrl(null);
  };

  const processMerge = async () => {
    if (files.length < 2) {
      toast.error("Please upload at least 2 PDF files to merge.");
      return;
    }
    
    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();

      for (const uploadedFile of files) {
        const arrayBuffer = await uploadedFile.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = createDownloadBlob(mergedPdfBytes, 'application/pdf');
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
    } catch (e) {
      console.error("PDF Merge failed", e);
      toast.error("Failed to merge PDFs. One of the files might be encrypted or corrupted.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = useEnterToSubmit(processMerge);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm">
        <strong>100% Client-Side PDF Merger:</strong> Combine multiple PDFs in the exact order you want. Processing happens securely in your browser.
      </div>

      <FileUploader 
        accept="application/pdf" 
        multiple={true}
        onFilesAccepted={handleFilesAccepted} 
      />

      {files.length > 0 && (
        <div className="p-6 border border-[var(--border-subtle)] bg-white dark:bg-black rounded-2xl shadow-xl">
          <h4 className="text-[var(--text-primary)] font-medium mb-4">Arrange Files</h4>
          <ul className="space-y-2 mb-6">
            {files.map((f, i) => (
              <li key={f.id} className="flex items-center justify-between bg-[var(--bg-elevated)] border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] p-3 rounded-xl">
                <span className="text-[var(--text-primary)] text-sm truncate flex-1">{f.file.name}</span>
                <div className="flex gap-2">
                  <button onClick={() => moveUp(i)} disabled={i === 0} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2 rounded" aria-label={`Move ${f.file.name} up`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <button onClick={() => moveDown(i)} disabled={i === files.length - 1} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2 rounded" aria-label={`Move ${f.file.name} down`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <button 
            onClick={processMerge}
            onKeyDown={handleKeyDown}
            disabled={isProcessing || files.length < 2}
            className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"
            aria-label={isProcessing ? 'Merging PDFs...' : 'Merge PDF files'}
          >
            {isProcessing ? "Merging PDFs..." : "Merge PDFs"}
          </button>
        </div>
      )}

      {outputUrl ? (
        <div className="p-6 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 animate-in slide-in-from-bottom-4">
          <div>
            <h4 className="text-lg font-bold text-[var(--accent)]">Merge Complete!</h4>
            <p className="text-emerald-500/80 text-sm">Your files have been successfully combined.</p>
          </div>
          
          <button 
            onClick={() => downloadOrShare(outputUrl, `merged_document_${Date.now()}.pdf`)}
            className="w-full sm:w-auto bg-white text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] font-bold px-8 py-3 rounded-xl transition-colors shadow-lg focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"
            aria-label="Download merged PDF document"
          >
            Download PDF
          </button>
        </div>
      ) : (
        <div className="border border-dashed border-[var(--border-subtle)] rounded-2xl">
          <EmptyState
            title="Merged PDF will appear here"
            message="Add two or more files above, then click Merge PDFs."
          />
        </div>
      )}
    </div>
  );
}

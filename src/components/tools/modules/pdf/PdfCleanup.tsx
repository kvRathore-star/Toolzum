"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { FileUploader } from '../../FileUploader';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { EmptyState } from '@/components/EmptyState';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PdfCleanup() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState(0);

  const [removeAnnotations, setRemoveAnnotations] = useState(false);
  const [removeMetadata, setRemoveMetadata] = useState(false);
  const [reversePages, setReversePages] = useState(false);
  const [removeBlank, setRemoveBlank] = useState(false);

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
      toast.error('Failed to load PDF. It might be encrypted or corrupted.');
    }
  };

  const clearAll = () => {
    setFile(null);
    setFileBuffer(null);
    setOutputUrl(null);
    setPageCount(0);
  };

  const isBlankPage = (textContent: { items?: unknown[] }): boolean => {
    return !textContent.items || textContent.items.length === 0;
  };

  const processCleanup = async () => {
    if (!fileBuffer || !file) return;
    if (!removeAnnotations && !removeMetadata && !reversePages && !removeBlank) {
      toast.error('Select at least one cleanup operation.');
      return;
    }
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const pages = pdfDoc.getPages();
      let pageIndices = Array.from({ length: pages.length }, (_, i) => i);

      if (removeBlank) {
        const pdfJsDoc = await pdfjsLib.getDocument(fileBuffer.slice(0)).promise;
        const nonBlank: number[] = [];
        for (let i = 1; i <= pdfJsDoc.numPages; i++) {
          const page = await pdfJsDoc.getPage(i);
          const content = await page.getTextContent();
          if (!isBlankPage(content)) {
            nonBlank.push(i - 1);
          }
        }
        if (nonBlank.length === 0) {
          toast.error('All pages appear to be blank. Nothing to output.');
          return;
        }
        pageIndices = nonBlank;
      }

      if (reversePages) {
        pageIndices = [...pageIndices].reverse();
      }

      const newDoc = await PDFDocument.create();
      const copiedPages = await newDoc.copyPages(pdfDoc, pageIndices);
      for (const page of copiedPages) {
        if (removeAnnotations) {
          (page as any).node?.removeAnnots?.();
        }
        newDoc.addPage(page);
      }

      if (removeMetadata) {
        newDoc.setTitle('');
        newDoc.setAuthor('');
        newDoc.setSubject('');
        newDoc.setKeywords([]);
        newDoc.setCreator('');
        newDoc.setProducer('');
      }

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success('PDF cleaned successfully!');
    } catch (e) {
      console.error(e);
      toast.error('An error occurred during cleanup.');
    } finally {
      setIsProcessing(false);
    }
  };

  const operationCount = [removeAnnotations, removeMetadata, reversePages, removeBlank].filter(Boolean).length;

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm">
          <strong>PDF Cleanup:</strong> Remove annotations, strip metadata, delete blank pages, reverse page order, or sanitize your PDF documents.
        </div>
        <FileUploader
          accept="application/pdf"
          onFileSelect={(_f) => handleFileSelect(_f)}
          title="Upload PDF"
          subtitle="Select a PDF to clean up"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-[var(--text-primary)]">{file.name}</h3>
          <p className="text-[var(--text-secondary)] dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB &middot; {pageCount} Pages</p>
        </div>
        <button onClick={clearAll}
          className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg">
          Change File
        </button>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
        <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">
          Cleanup Options ({operationCount} selected)
        </h4>

        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-overlay)] transition-colors">
          <input type="checkbox" checked={removeAnnotations} onChange={(e) => setRemoveAnnotations(e.target.checked)}
            className="mt-0.5 rounded border-[var(--border-subtle)] text-[var(--accent)] focus:ring-[var(--accent)]" />
          <div>
            <p className="font-medium text-[var(--text-primary)]">Remove Annotations</p>
            <p className="text-sm text-[var(--text-secondary)]">Strip all comments, highlights, and markup from the document.</p>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-overlay)] transition-colors">
          <input type="checkbox" checked={removeMetadata} onChange={(e) => setRemoveMetadata(e.target.checked)}
            className="mt-0.5 rounded border-[var(--border-subtle)] text-[var(--accent)] focus:ring-[var(--accent)]" />
          <div>
            <p className="font-medium text-[var(--text-primary)]">Remove Metadata</p>
            <p className="text-sm text-[var(--text-secondary)]">Clear title, author, subject, keywords, and other document properties.</p>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-overlay)] transition-colors">
          <input type="checkbox" checked={removeBlank} onChange={(e) => setRemoveBlank(e.target.checked)}
            className="mt-0.5 rounded border-[var(--border-subtle)] text-[var(--accent)] focus:ring-[var(--accent)]" />
          <div>
            <p className="font-medium text-[var(--text-primary)]">Remove Blank Pages</p>
            <p className="text-sm text-[var(--text-secondary)]">Detect and delete pages that contain no visible text content.</p>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-overlay)] transition-colors">
          <input type="checkbox" checked={reversePages} onChange={(e) => setReversePages(e.target.checked)}
            className="mt-0.5 rounded border-[var(--border-subtle)] text-[var(--accent)] focus:ring-[var(--accent)]" />
          <div>
            <p className="font-medium text-[var(--text-primary)]">Reverse Page Order</p>
            <p className="text-sm text-[var(--text-secondary)]">Flip the entire document so the last page becomes first.</p>
          </div>
        </label>

        <button onClick={processCleanup} disabled={isProcessing || operationCount === 0}
          className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2">
          {isProcessing ? 'Processing...' : `Apply ${operationCount} Operation${operationCount !== 1 ? 's' : ''}`}
        </button>
      </div>

      {outputUrl ? (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4 animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
            <h4 className="font-bold text-emerald-500">Cleanup Complete</h4>
          </div>
          <button onClick={() => downloadOrShare(outputUrl, `cleaned_${file.name}`)}
            className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download Cleaned PDF
          </button>
        </div>
      ) : (
        <div className="border border-dashed border-[var(--border-subtle)] rounded-2xl">
          <EmptyState
            title="Cleaned PDF will appear here"
            message="Upload a PDF above to clean."
          />
        </div>
      )}
    </div>
  );
}

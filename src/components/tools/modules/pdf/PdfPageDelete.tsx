"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { PDFDocument } from 'pdf-lib';

export default function PdfPageDelete() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  
  const [rangeInput, setRangeInput] = useState('');
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
      setRangeInput('');
    } catch (e) {
      toast.error("Failed to load PDF. It might be encrypted or corrupted.");
    }
  };

  const clearAll = () => {
    setFile(null);
    setFileBuffer(null);
    setOutputUrl(null);
    setRangeInput('');
    setTotalPages(0);
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
            if (i >= 1 && i <= max) pages.add(i - 1); // 0-indexed internally
          }
        }
      } else {
        const page = parseInt(part);
        if (!isNaN(page) && page >= 1 && page <= max) {
          pages.add(page - 1);
        }
      }
    }
    
    // Sort descending so when we remove pages by index, we don't shift the indices of pages we still need to remove
    return Array.from(pages).sort((a, b) => b - a);
  };

  const deletePages = async () => {
    if (!fileBuffer || !file) return;
    
    const pagesToRemove = parseRange(rangeInput, totalPages);
    if (pagesToRemove.length === 0) {
      toast.error("Please enter a valid page range to delete.");
      return;
    }
    
    if (pagesToRemove.length === totalPages) {
      toast.error("You cannot delete all pages in the PDF.");
      return;
    }

    setIsProcessing(true);
    try {
      // Load the PDF
      const pdfDoc = await PDFDocument.load(fileBuffer);
      
      // Remove pages (pagesToRemove is sorted descending)
      for (const pageIndex of pagesToRemove) {
        pdfDoc.removePage(pageIndex);
      }
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success(`${pagesToRemove.length} page(s) deleted successfully!`);
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while deleting pages.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-700 dark:text-blue-400 text-sm">
          <strong>Clean & Secure:</strong> Delete specific pages from any PDF document right in your browser. No server uploads required.
        </div>
        <FileUploader 
          accept="application/pdf"
          onFileSelect={handleFileSelect} 
          title="Upload PDF"
          subtitle="Drag & drop your document here"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB • {totalPages} Pages</p>
        </div>
        <button 
          onClick={clearAll}
          className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
        >
          Change File
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Col: Settings */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 h-fit">
          <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2 flex justify-between items-center">
            <span>Pages to Delete</span>
            <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded font-bold">Remove</span>
          </h4>
          
          <div className="space-y-3">
            <input aria-label="Remove"
              type="text"
              placeholder="e.g. 1, 3, 5-10"
              value={rangeInput}
              onChange={(e) => setRangeInput(e.target.value)}
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-red-500 transition-colors"
            />
            <p className="text-xs text-[var(--text-secondary)]">
              Enter page numbers and/or ranges separated by commas. Examples: `1,3,5` or `1-5, 8`. Max page: {totalPages}.
            </p>
          </div>

          <button 
            onClick={deletePages}
            disabled={isProcessing || !rangeInput.trim()}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            {isProcessing ? "Processing..." : "Delete Pages"}
          </button>
        </div>

        {/* Right Col: Output */}
        <div className="space-y-6">
          {outputUrl ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
               <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                  <h4 className="font-bold text-emerald-500">Pages Removed</h4>
               </div>
               
               <div className="bg-emerald-700/10 rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-emerald-500">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <p className="font-bold text-center">Cleaned PDF Ready</p>
               </div>

               <button 
                  onClick={() => downloadOrShare(outputUrl, `cleaned_${file.name}`)}
                  className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download New PDF
                </button>
            </div>
          ) : (
            <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-[var(--text-muted)]">
               <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <p>Generated PDF will appear here</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

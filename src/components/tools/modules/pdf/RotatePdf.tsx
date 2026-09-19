"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { PDFDocument, degrees } from 'pdf-lib';
import { useEnterToSubmit } from '@/lib/keyboard';

export default function RotatePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
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
    } catch (e) {
      toast.error("Failed to load PDF. It might be encrypted or corrupted.");
    }
  };

  const clearAll = () => {
    setFile(null);
    setFileBuffer(null);
    setOutputUrl(null);
    setTotalPages(0);
  };

  const rotatePages = async () => {
    if (!fileBuffer || !file) return;

    setIsProcessing(true);
    try {
      // Load the PDF
      const pdfDoc = await PDFDocument.load(fileBuffer);
      
      const pages = pdfDoc.getPages();
      pages.forEach((page) => {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + rotation));
      });
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success("PDF rotated successfully!");
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while rotating PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = useEnterToSubmit(rotatePages);

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm">
          <strong>Instant Rotation:</strong> Scanned your PDF upside down? Rotate all pages of a PDF document instantly right in your browser.
        </div>
        <FileUploader 
          accept="application/pdf"
          onFileSelect={handleFileSelect} 
          title="Upload PDF to Rotate"
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
          <p className="text-[var(--text-secondary)] dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB • {totalPages} Pages</p>
        </div>
        <button 
          onClick={clearAll}
          className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
        >
          Change File
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Col: Settings */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 h-fit">
          <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">Rotation Settings</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Right 90°", value: 90 },
              { label: "Upside Down", value: 180 },
              { label: "Left 90°", value: 270 },
            ].map((opt) => (
               <button
                 key={opt.value}
                 onClick={() => setRotation(opt.value as any)}
                 className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2 ${rotation === opt.value ? 'bg-[var(--accent-ink)] border-[var(--accent)] text-white shadow-md' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:border-[var(--accent)]'}`}
                 aria-label={`Rotate ${opt.label}`}
                 aria-pressed={rotation === opt.value}
               >
                 {opt.label}
               </button>
            ))}
          </div>

          <button 
            onClick={rotatePages}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2 mt-4 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"
            aria-label={isProcessing ? 'Rotating pages...' : 'Rotate all PDF pages'}
          >
            <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            {isProcessing ? "Rotating..." : "Rotate All Pages"}
          </button>
        </div>

        {/* Right Col: Output */}
        <div className="space-y-6">
          {outputUrl ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
               <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                  <h4 className="font-bold text-emerald-500">Rotation Complete</h4>
               </div>
               
               <div className="bg-emerald-700/10 rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-emerald-500">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <p className="font-bold text-center">rotated_{file.name}</p>
               </div>

               <button 
                  onClick={() => downloadOrShare(outputUrl, `rotated_${file.name}`)}
                  className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"
                  aria-label="Download rotated PDF"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download New PDF
                </button>
            </div>
          ) : (
            <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-[var(--text-muted)]">
               <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              <p>Generated PDF will appear here</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

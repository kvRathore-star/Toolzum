"use client";

import React, { useState, useEffect } from 'react';
import { toast } from "react-hot-toast";
import { FileUploader } from '../FileUploader';
import { PDFDocument } from 'pdf-lib';
import { downloadOrShare } from '@/utils/nativeShare';

export default function PdfOptimizer() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number | null>(null);

  const handleFileSelect = (file: File) => {
    setPdfFile(file);
    setOutputUrl(null);
  };

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const processOptimize = async () => {
    if (!pdfFile) return;
    
    setIsProcessing(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      pdf.setTitle('');
      pdf.setAuthor('');
      pdf.setSubject('');
      pdf.setKeywords([]);
      pdf.setProducer('');
      pdf.setCreator('');

      const optimizedPdfBytes = await pdf.save({ useObjectStreams: true });
      
      const blob = new Blob([optimizedPdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      setOutputSize(blob.size);
    } catch (e) {
      console.error("PDF Optimization failed", e);
      toast.error("Failed to optimize PDF. The file might be encrypted or corrupted.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!pdfFile) {
    return (
      <div className="space-y-6">
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-400 text-sm font-medium">
          <strong>⚠ PDF Optimizer (Client-Side Only):</strong> This tool strips metadata and optimizes internal PDF structure using pdf-lib. It <strong>cannot compress images</strong> (the main driver of PDF size). For significant size reduction on scanned/image-heavy PDFs, server-side tools with image recompression are required.
        </div>
        <FileUploader 
          accept="application/pdf" 
          onFileSelect={handleFileSelect} 
          title="Upload PDF to Optimize"
        />
      </div>
    );
  }

  const savingsPercent = outputSize ? Math.round(((pdfFile.size - outputSize) / pdfFile.size) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-[var(--text-primary)] truncate max-w-xs">{pdfFile.name}</h3>
          <p className="text-[var(--text-secondary)] text-sm">Original Size: {(pdfFile.size / 1024).toFixed(2)} KB</p>
        </div>
        <button 
          onClick={() => setPdfFile(null)}
          className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--bg-surface)]"
        >
          Change PDF
        </button>
      </div>

      <div className="p-6 border border-[var(--border-subtle)] bg-[var(--bg-elevated)] rounded-2xl shadow-[var(--shadow-md)]">
        <h4 className="text-[var(--text-primary)] font-medium mb-4">Optimization Strategy</h4>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-xl mb-6">
          <p className="text-sm text-[var(--text-secondary)]">
            Client-side optimization removes metadata (title, author, keywords, etc.) and enables object streams to compress the internal PDF structure. This is effective for text-heavy documents but provides minimal reduction for files with large embedded images.
          </p>
        </div>

        <button 
          onClick={processOptimize}
          disabled={isProcessing}
          className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium py-3 rounded-xl shadow-[var(--shadow-md)] transition-all active:scale-95 disabled:opacity-50"
        >
          {isProcessing ? "Optimizing PDF..." : "Optimize PDF →"}
        </button>
      </div>

      {outputUrl && outputSize && (
        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 animate-in slide-in-from-bottom-4">
          <div className="w-full">
            <h4 className="text-lg font-bold text-emerald-400 mb-2">Optimization Complete!</h4>
            <div className="flex justify-between items-center text-sm border-b border-emerald-500/20 pb-2 mb-2">
              <span className="text-[var(--text-secondary)]">New Size:</span>
              <strong className="text-[var(--text-primary)] font-mono">{(outputSize / 1024).toFixed(2)} KB</strong>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[var(--text-secondary)]">Data Saved:</span>
              <strong className={savingsPercent > 0 ? "text-emerald-400" : "text-amber-400"}>
                {savingsPercent}%
              </strong>
            </div>
          </div>
          
          <button 
            onClick={() => downloadOrShare(outputUrl, `optimized_${pdfFile.name}`)}
            className="w-full md:w-auto bg-white text-zinc-900 hover:bg-zinc-200 font-bold px-8 py-3 rounded-xl transition-colors shadow-lg whitespace-nowrap"
          >
            Download PDF
          </button>
        </div>
      )}
    </div>
  );
}
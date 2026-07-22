"use client";

import React, { useState, useEffect, useRef } from 'react';
import { toast } from "react-hot-toast";
import { FileUploader } from '../FileUploader';
import { PDFDocument, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { downloadOrShare } from '@/utils/nativeShare';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function EsignPdf() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  
  // PDF Preview State
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Signature Pad State
  const sigPadRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const handleFileSelect = (file: File, dataUrl: string) => {
    setPdfFile(file);
    setPdfDataUri(dataUrl);
    setOutputUrl(null);
    setCurrentPage(1);
    renderPage(dataUrl, 1);
  };

  const renderPage = async (dataUrl: string, pageNum: number) => {
    try {
      const loadingTask = pdfjsLib.getDocument(dataUrl);
      const pdf = await loadingTask.promise;
      setNumPages(pdf.numPages);
      
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const context = canvas.getContext('2d');
      if (!context) return;
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
    } catch (e) {
      console.error("Error rendering PDF page", e);
    }
  };

  useEffect(() => {
    if (pdfDataUri) {
      renderPage(pdfDataUri, currentPage);
    }
  }, [currentPage, scale]);

  // --- Signature Pad Logic ---
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = sigPadRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    
    // Get correct coordinates
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = sigPadRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    e.preventDefault(); // prevent scrolling on touch

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveSignature();
    }
  };

  const clearSignature = () => {
    const canvas = sigPadRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDataUrl(null);
  };

  const saveSignature = () => {
    const canvas = sigPadRef.current;
    if (!canvas) return;
    setSignatureDataUrl(canvas.toDataURL('image/png'));
  };

  // Initialize sig pad style
  useEffect(() => {
    const canvas = sigPadRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [pdfFile]);

  // --- Burn Signature into PDF ---
  const processSign = async () => {
    if (!pdfFile || !signatureDataUrl) return;
    
    setIsProcessing(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Embed the signature image
      const sigImageBytes = await fetch(signatureDataUrl).then(res => res.arrayBuffer());
      const sigImage = await pdfDoc.embedPng(sigImageBytes);
      
      // Get the page where we want to place it (for now, place at bottom right of current page)
      const pages = pdfDoc.getPages();
      const pageToSign = pages[currentPage - 1]; // 0-indexed
      
      const sigDims = sigImage.scale(0.5); // scale down
      
      // Basic positioning: bottom right
      pageToSign.drawImage(sigImage, {
        x: pageToSign.getWidth() - sigDims.width - 50,
        y: 50,
        width: sigDims.width,
        height: sigDims.height,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
    } catch (e) {
      console.error("PDF Sign failed", e);
      toast.error("Failed to sign PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!pdfFile) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm">
          <strong>Secure Local eSign:</strong> Sign documents directly in your browser. Your signature and document never leave your device.
        </div>
        <FileUploader 
          accept="application/pdf" 
          onFileSelect={handleFileSelect} 
          title="Upload PDF to Sign"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-xs">{pdfFile.name}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">Page {currentPage} of {numPages}</p>
        </div>
        <button 
          onClick={() => { setPdfFile(null); setPdfDataUri(null); }}
          className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          Change PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PDF Preview (Left Col) */}
        <div className="lg:col-span-8 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[700px]">
          <div className="bg-[var(--bg-overlay)]/50 dark:bg-black/50 p-3 border-b border-zinc-200 dark:border-[var(--border-subtle)] flex justify-between items-center">
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] disabled:opacity-50 text-[var(--text-primary)] rounded text-sm"
              >
                Prev
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
                disabled={currentPage === numPages}
                className="px-3 py-1 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] disabled:opacity-50 text-[var(--text-primary)] rounded text-sm"
              >
                Next
              </button>
            </div>
            <span className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">Preview</span>
          </div>
          <div className="flex-1 overflow-auto p-4 flex justify-center bg-black/20">
            <canvas ref={canvasRef} className="shadow-lg border border-[var(--border-subtle)] max-w-full h-auto" />
          </div>
        </div>

        {/* Signature Controls (Right Col) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl">
            <h4 className="text-[var(--text-primary)] font-medium mb-4 flex justify-between items-center">
              Your Signature
              <button onClick={clearSignature} className="text-xs text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-2 py-1 bg-[var(--bg-surface)] rounded">Clear</button>
            </h4>
            
            <div className="bg-white rounded-xl mb-6 overflow-hidden border-2 border-dashed border-zinc-500">
              <canvas 
                ref={sigPadRef}
                width={300}
                height={150}
                className="w-full h-[150px] cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>

            <div className="text-xs text-[var(--text-secondary)] mb-6 bg-black/20 p-3 rounded-lg">
              The signature will be appended to the bottom right of Page {currentPage}.
            </div>

            <button 
              onClick={processSign}
              disabled={isProcessing || !signatureDataUrl}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? "Signing..." : "Sign Document"}
            </button>
          </div>

          {outputUrl && (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in slide-in-from-bottom-4">
              <h4 className="text-lg font-bold text-emerald-400 mb-4">Document Signed!</h4>
              <button 
                onClick={() => downloadOrShare(outputUrl, `signed_${pdfFile.name}`)}
                className="w-full bg-white text-zinc-900 hover:bg-zinc-200 font-bold px-4 py-3 rounded-xl transition-colors shadow-lg"
              >
                Download Signed PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export default function AddPageNumbersToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  
  const [position, setPosition] = useState<'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left'>('bottom-center');
  const [format, setFormat] = useState<'X' | 'Page X' | 'Page X of Y'>('Page X');
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

  const addPageNumbers = async () => {
    if (!fileBuffer || !file) return;

    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const count = pages.length;

      pages.forEach((page, idx) => {
        const pageNum = idx + 1;
        let text = `${pageNum}`;
        if (format === 'Page X') text = `Page ${pageNum}`;
        if (format === 'Page X of Y') text = `Page ${pageNum} of ${count}`;

        const fontSize = 12;
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const { width, height } = page.getSize();
        
        let x = 0;
        let y = 0;
        const margin = 20;

        if (position.includes('left')) x = margin;
        if (position.includes('center')) x = (width - textWidth) / 2;
        if (position.includes('right')) x = width - textWidth - margin;

        if (position.includes('bottom')) y = margin;
        if (position.includes('top')) y = height - margin - fontSize;

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        });
      });
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success("Page numbers added successfully!");
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while adding page numbers.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm">
          <strong>Professional Formatting:</strong> Add consistent page numbers to your PDF documents instantly. Runs entirely in your browser.
        </div>
        <FileUploader 
          accept="application/pdf"
          onFileSelect={handleFileSelect} 
          title="Upload PDF"
          subtitle="Select document to add page numbers to"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-white/5">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB • {totalPages} Pages</p>
        </div>
        <button 
          onClick={clearAll}
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg"
        >
          Change File
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Col: Settings */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-6 h-fit">
          <h4 className="text-zinc-900 dark:text-white font-medium border-b border-zinc-100 dark:border-zinc-800 pb-2">Page Number Settings</h4>
          
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Format</label>
            <select 
              value={format} 
              onChange={(e) => setFormat(e.target.value as any)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-3 outline-none focus:border-blue-500 text-zinc-900 dark:text-white text-sm"
            >
              <option value="X">1, 2, 3...</option>
              <option value="Page X">Page 1, Page 2...</option>
              <option value="Page X of Y">Page 1 of {totalPages}...</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Position</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button onClick={() => setPosition('top-left')} className={`py-2 text-xs font-bold border rounded-lg ${position === 'top-left' ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'}`}>Top Left</button>
              <button onClick={() => setPosition('top-center')} className={`py-2 text-xs font-bold border rounded-lg ${position === 'top-center' ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'}`}>Top Center</button>
              <button onClick={() => setPosition('top-right')} className={`py-2 text-xs font-bold border rounded-lg ${position === 'top-right' ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'}`}>Top Right</button>
              
              <button onClick={() => setPosition('bottom-left')} className={`py-2 text-xs font-bold border rounded-lg ${position === 'bottom-left' ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'}`}>Bottom Left</button>
              <button onClick={() => setPosition('bottom-center')} className={`py-2 text-xs font-bold border rounded-lg ${position === 'bottom-center' ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'}`}>Bottom Center</button>
              <button onClick={() => setPosition('bottom-right')} className={`py-2 text-xs font-bold border rounded-lg ${position === 'bottom-right' ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'}`}>Bottom Right</button>
            </div>
          </div>

          <button 
            onClick={addPageNumbers}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 mt-4"
          >
            {isProcessing ? "Processing..." : "Add Page Numbers"}
          </button>
        </div>

        {/* Right Col: Output */}
        <div className="space-y-6">
          {outputUrl ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
               <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <h4 className="font-bold text-emerald-500">Processing Complete</h4>
               </div>
               
               <div className="bg-emerald-500/10 rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-emerald-500">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <p className="font-bold text-center">numbered_{file.name}</p>
               </div>

               <button 
                  onClick={() => downloadOrShare(outputUrl, `numbered_${file.name}`)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download Document
                </button>
            </div>
          ) : (
            <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-zinc-400">
               <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <p>Generated PDF will appear here</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

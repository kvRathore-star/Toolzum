"use client";

import React, { useState, useEffect } from 'react';
import NextImage from "next/image";
import { FileUploader } from '../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';

interface UploadedImage {
  id: string;
  file: File;
  dataUrl: string;
}

export default function JpgToPdf() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [margin, setMargin] = useState<number>(10);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const handleFile = (file: File, dataUrl: string) => {
    // Reset output when new file is added
    setOutputUrl(null);
    setImages(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), file, dataUrl }]);
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    setOutputUrl(null);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === images.length - 1)) return;
    
    const newImages = [...images];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newImages[index], newImages[swapIndex]] = [newImages[swapIndex], newImages[index]];
    
    setImages(newImages);
    setOutputUrl(null);
  };

  const generatePDF = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    
    try {
      // First, get dimensions for all images
      const loadedImages = await Promise.all(images.map(img => {
        return new Promise<{img: HTMLImageElement, dataUrl: string}>((resolve, reject) => {
          const imageElement = new Image();
          imageElement.onload = () => resolve({ img: imageElement, dataUrl: img.dataUrl });
          imageElement.onerror = reject;
          imageElement.src = img.dataUrl;
        });
      }));

      // Initialize PDF (we use A4 as default, or custom if 'fit')
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: pageSize === 'fit' ? [loadedImages[0].img.width * 0.264583, loadedImages[0].img.height * 0.264583] : pageSize
      });

      loadedImages.forEach((loaded, index) => {
        if (index > 0) {
          if (pageSize === 'fit') {
            doc.addPage([loaded.img.width * 0.264583, loaded.img.height * 0.264583]);
          } else {
            doc.addPage(pageSize);
          }
        }

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        const imgWidth = loaded.img.width;
        const imgHeight = loaded.img.height;
        
        let targetWidth = pageWidth - (margin * 2);
        let targetHeight = (imgHeight * targetWidth) / imgWidth;
        
        // If the scaled height exceeds the page height, scale by height instead
        if (targetHeight > pageHeight - (margin * 2)) {
          targetHeight = pageHeight - (margin * 2);
          targetWidth = (imgWidth * targetHeight) / imgHeight;
        }

        // Center the image
        const xPos = (pageWidth - targetWidth) / 2;
        const yPos = (pageHeight - targetHeight) / 2;

        doc.addImage(loaded.dataUrl, 'JPEG', xPos, yPos, targetWidth, targetHeight);
      });

      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      setOutputUrl(url);
      toast.success("PDF generated successfully!");
      
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while generating PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm">
        <strong>Multiple Files Supported:</strong> Convert one or more JPG/PNG images into a single PDF document. Images are added as separate pages. 100% offline.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Uploader & Settings */}
        <div className="lg:col-span-1 space-y-6">
          <FileUploader 
            accept="image/jpeg,image/png,image/webp"
            onFileSelect={handleFile} 
            title="Add Image"
            subtitle="Click or drop a file"
          />

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-5">
            <h4 className="text-zinc-900 dark:text-white font-medium border-b border-zinc-100 dark:border-zinc-800 pb-2">PDF Settings</h4>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Page Size</label>
              <select 
                value={pageSize} 
                onChange={(e) => setPageSize(e.target.value as any)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500 text-zinc-900 dark:text-white"
              >
                <option value="a4">A4 (Standard)</option>
                <option value="letter">Letter</option>
                <option value="fit">Fit (Same as image size)</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Margin (mm)</label>
                <span className="text-xs font-bold text-blue-500">{margin} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={margin}
                onChange={(e) => setMargin(parseInt(e.target.value))}
                disabled={pageSize === 'fit'}
                className="w-full accent-blue-600 disabled:opacity-50"
              />
            </div>

            <button 
              onClick={generatePDF}
              disabled={isProcessing || images.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 mt-4"
            >
              {isProcessing ? "Generating PDF..." : "Generate PDF"}
            </button>
          </div>

          {outputUrl && (
            <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in slide-in-from-bottom-4 shadow-xl">
              <button 
                onClick={() => downloadOrShare(outputUrl, `converted_document_${new Date().getTime()}.pdf`)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-3 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download PDF
              </button>
            </div>
          )}
        </div>

        {/* Right Col: Image List Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl p-6 min-h-[500px]">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-zinc-900 dark:text-white font-medium">Pages ({images.length})</h4>
              {images.length > 0 && (
                <button onClick={() => { setImages([]); setOutputUrl(null); }} className="text-xs text-red-500 hover:text-red-400 font-bold">
                  Clear All
                </button>
              )}
            </div>

            {images.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                <svg className="w-12 h-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p>No images added yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {images.map((img, index) => (
                  <div key={img.id} className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 group">
                    <span className="text-xs font-bold text-zinc-400 w-6">{index + 1}.</span>
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-200 dark:bg-black shrink-0 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                      <NextImage unoptimized={true} loading="lazy" src={img.dataUrl} className="max-w-full max-h-full object-cover" alt="Preview" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{img.file.name}</p>
                      <p className="text-xs text-zinc-500">{(img.file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => moveImage(index, 'up')} disabled={index === 0} className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md disabled:opacity-30">
                        <svg className="w-4 h-4 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                      </button>
                      <button onClick={() => moveImage(index, 'down')} disabled={index === images.length - 1} className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md disabled:opacity-30">
                        <svg className="w-4 h-4 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      <button onClick={() => removeImage(img.id)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md ml-2">
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

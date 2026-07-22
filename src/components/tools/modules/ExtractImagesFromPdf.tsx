"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { Download, FileImage, FileText, RefreshCw, Sparkles } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function ExtractImagesFromPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [imageCount, setImageCount] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setOutputUrl(null);
    setProgress(0);
    setImageCount(null);
  };

  const extractImages = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setStatusText("Loading PDF document...");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const totalPages = pdf.numPages;
      const zip = new JSZip();
      let extractedCount = 0;

      for (let i = 1; i <= totalPages; i++) {
        setStatusText(`Extracting images from page ${i} of ${totalPages}...`);
        const page = await pdf.getPage(i);
        const opList = await page.getOperatorList();
        
        // Find image operator keys
        const imgKeys: string[] = [];
        for (let j = 0; j < opList.fnArray.length; j++) {
          if (opList.fnArray[j] === (pdfjsLib as any).OPS.paintImageXObject || 
              opList.fnArray[j] === (pdfjsLib as any).OPS.paintJpegXObject) {
            imgKeys.push(opList.argsArray[j][0]);
          }
        }

        // Retrieve and process each image
        for (let j = 0; j < imgKeys.length; j++) {
          const key = imgKeys[j];
          try {
            // Get image from page objects (this might be synchronous or asynchronous depending on pdfjs version)
            const imgObj = await new Promise<any>((resolve, reject) => {
              page.objs.get(key, (obj: any) => {
                if (obj) resolve(obj);
                else reject(new Error("Image not found in page objects"));
              });
            });

            if (imgObj && imgObj.width > 0 && imgObj.height > 0) {
              const canvas = document.createElement('canvas');
              canvas.width = imgObj.width;
              canvas.height = imgObj.height;
              const ctx = canvas.getContext('2d');
              if (!ctx) continue;

              const imgData = ctx.createImageData(imgObj.width, imgObj.height);
              
              if (imgObj.data.length === imgObj.width * imgObj.height * 4) {
                imgData.data.set(imgObj.data);
              } else {
                // Handle RGB to RGBA conversion
                let srcIdx = 0;
                let dstIdx = 0;
                for (let p = 0; p < imgObj.width * imgObj.height; p++) {
                  imgData.data[dstIdx] = imgObj.data[srcIdx];       // R
                  imgData.data[dstIdx+1] = imgObj.data[srcIdx+1];   // G
                  imgData.data[dstIdx+2] = imgObj.data[srcIdx+2];   // B
                  imgData.data[dstIdx+3] = 255;                     // A
                  srcIdx += 3;
                  dstIdx += 4;
                }
              }

              ctx.putImageData(imgData, 0, 0);
              const dataUrl = canvas.toDataURL('image/png');
              const base64Data = dataUrl.split(',')[1];
              
              extractedCount++;
              zip.file(`extracted_img_${extractedCount}.png`, base64Data, { base64: true });
            }
          } catch (imgErr) {
            if (process.env.NODE_ENV !== 'production') console.warn(`Failed to extract image object with key ${key}:`, imgErr);
          }
        }
        
        setProgress(Math.round((i / totalPages) * 100));
      }

      setImageCount(extractedCount);

      if (extractedCount === 0) {
        toast.error("No embedded image objects found in this PDF.");
        return;
      }

      setStatusText("Bundling extracted images...");
      const zipBlob = await zip.generateAsync({ type: "blob" });
      
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(zipBlob));
      toast.success(`Successfully extracted ${extractedCount} images!`);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to parse and extract images from PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearAll = () => {
    setFile(null);
    setOutputUrl(null);
    setProgress(0);
    setImageCount(null);
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm flex items-center gap-2">
          <Sparkles className="w-5 h-5 flex-shrink-0" />
          <span><strong>100% Client-Side Extraction:</strong> Extract raw embedded image resource objects (illustrations, figures, photos) completely offline.</span>
        </div>
        <FileUploader 
          accept="application/pdf"
          onFileSelect={handleFileSelect} 
          title="Upload PDF to Extract Images"
          subtitle="Supports search and extraction of all embedded images"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-[var(--accent)]" />
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-[var(--text-primary)]">{file.name}</h3>
            <p className="text-[var(--text-secondary)] text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
        <button 
          onClick={clearAll}
          disabled={isProcessing}
          className="text-xs text-[var(--text-secondary)] dark:text-zinc-300 px-3 py-2 bg-[var(--bg-overlay)] dark:bg-[var(--bg-surface)] rounded-lg hover:bg-[var(--bg-surface)] transition-colors disabled:opacity-50"
        >
          Change File
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Action Panel */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-[var(--text-primary)] font-bold text-base flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
              <FileImage className="w-5 h-5 text-[var(--accent)]" />
              Extract Embedded Images
            </h4>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              We will scan the internal dictionaries and operators of your PDF to find the raw embedded image assets (photos, graphics) and export them as PNG files inside a ZIP archive.
            </p>
          </div>

          <button 
            onClick={extractImages}
            disabled={isProcessing || imageCount !== null}
            className="w-full mt-6 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex justify-center items-center gap-2"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>{statusText} ({progress}%)</span>
              </>
            ) : (
              <>
                <FileImage className="w-4 h-4" />
                <span>Extract Images to ZIP</span>
              </>
            )}
          </button>
        </div>

        {/* Output Panel */}
        <div className="flex flex-col justify-center">
          {outputUrl ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300 h-full flex flex-col justify-center">
               <div className="bg-emerald-500/10 rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-emerald-500">
                  <Download className="w-16 h-16 mb-4" />
                  <p className="font-bold text-center">extracted_images_{file.name.replace('.pdf', '')}.zip</p>
                  <p className="text-xs text-emerald-500/80 mt-1">Extracted {imageCount} images successfully.</p>
               </div>

               <button 
                  onClick={() => downloadOrShare(outputUrl, `extracted_images_${file.name.replace('.pdf', '')}.zip`)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2 cursor-pointer"
                >
                  <Download className="w-5 h-5" />
                  Download Images ZIP
                </button>
            </div>
          ) : (
            <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] dark:border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center h-full min-h-[250px] text-[var(--text-muted)] text-center">
               <FileImage className="w-12 h-12 mb-4 opacity-30" />
               <p className="text-sm font-medium">Extracted images ZIP will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

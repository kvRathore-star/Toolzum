"use client";

import React, { useState, useEffect } from 'react';
import { toast } from "react-hot-toast";
import { FileUploader, UploadedFile } from '@/components/FileUploader';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import { downloadOrShare } from '@/utils/nativeShare';

export default function ImageBulkConverter() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  
  const [targetFormat, setTargetFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [quality, setQuality] = useState(0.8);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const handleFilesAccepted = (acceptedFiles: UploadedFile[]) => {
    setFiles(acceptedFiles);
    setOutputUrl(null);
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const processBatch = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    try {
      const zip = new JSZip();
      
      const extensionMap = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp'
      };
      const ext = extensionMap[targetFormat];

      for (let i = 0; i < files.length; i++) {
        const fileObj = files[i].file;
        
        // Setup compression/conversion options
        const options = {
          maxSizeMB: fileObj.size / (1024 * 1024), // keep same size mostly
          maxWidthOrHeight: 4096, 
          useWebWorker: true,
          initialQuality: quality,
          fileType: targetFormat,
        };
        
        try {
          // Even if we just convert, browser-image-compression can handle it by setting fileType
          const compressedOrConverted = await imageCompression(fileObj, options);
          
          // Rename file to new extension
          const originalName = fileObj.name.substring(0, fileObj.name.lastIndexOf('.'));
          const newName = `${originalName || `image_${i}`}.${ext}`;
          
          zip.file(newName, compressedOrConverted);
        } catch (e) {
          console.error(`Failed to process ${fileObj.name}`, e);
          // Fallback: just add the original file if conversion fails
          zip.file(fileObj.name, fileObj);
        }
        
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      setOutputUrl(url);
    } catch (e) {
      console.error("Batch conversion failed", e);
      toast.error("An error occurred during batch processing.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-700 dark:text-blue-400 text-sm">
        <strong>Client-Side Bulk Processing:</strong> Convert and compress hundreds of images at once directly in your browser. No files are uploaded to any server.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Upload & List */}
        <div className="space-y-6">
          <FileUploader 
            accept="image/*" 
            multiple={true}
            onFilesAccepted={handleFilesAccepted}
          />

          {files.length > 0 && (
            <div className="bg-[var(--bg-elevated)] border border-zinc-200 dark:border-[var(--border-subtle)] p-4 rounded-2xl max-h-[300px] overflow-y-auto">
              <h4 className="text-[var(--text-primary)] font-medium mb-3 text-sm sticky top-0 bg-[var(--bg-elevated)] pb-2">
                {files.length} images queued
              </h4>
              <ul className="space-y-2">
                {files.map((f) => (
                  <li key={f.id} className="flex items-center justify-between bg-[var(--bg-overlay)]/50 dark:bg-black/50 border border-zinc-200 dark:border-[var(--border-subtle)] p-2 rounded-lg text-sm">
                    <span className="text-zinc-600 dark:text-[var(--text-muted)] truncate flex-1 mr-2">{f.file.name}</span>
                    <button onClick={() => removeFile(f.id)} className="text-red-700 dark:text-red-400 hover:text-red-300 p-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Controls & Action */}
        <div className="space-y-6">
          <div className="p-6 border border-[var(--border-subtle)] bg-white dark:bg-black rounded-2xl shadow-xl space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">Convert to Format</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => setTargetFormat('image/jpeg')}
                  className={`py-2 rounded-lg font-bold text-sm transition-colors ${targetFormat === 'image/jpeg' ? 'bg-blue-600 text-white' : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]'}`}
                >
                  JPG
                </button>
                <button
                  onClick={() => setTargetFormat('image/png')}
                  className={`py-2 rounded-lg font-bold text-sm transition-colors ${targetFormat === 'image/png' ? 'bg-blue-600 text-white' : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]'}`}
                >
                  PNG
                </button>
                <button
                  onClick={() => setTargetFormat('image/webp')}
                  className={`py-2 rounded-lg font-bold text-sm transition-colors ${targetFormat === 'image/webp' ? 'bg-blue-600 text-white' : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]'}`}
                >
                  WEBP
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-[var(--text-primary)]">Quality</label>
                <span className="text-blue-700 dark:text-blue-400 font-bold text-sm">{Math.round(quality * 100)}%</span>
              </div>
              <input aria-label="Quality" 
                type="range" 
                min="0.1" 
                max="1" 
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full h-2 bg-[var(--bg-surface)] rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <button 
              onClick={processBatch}
              disabled={isProcessing || files.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden"
            >
              {isProcessing && (
                <div 
                  className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              )}
              <span className="relative z-10">
                {isProcessing ? `Processing ${progress}%` : "Convert & Compress Batch"}
              </span>
            </button>
          </div>

          {outputUrl && (
            <div className="p-6 bg-emerald-700/10 border border-emerald-500/20 rounded-2xl flex flex-col items-center text-center animate-in slide-in-from-bottom-4">
              <div className="w-16 h-16 bg-emerald-700/20 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h4 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-1">Batch Complete!</h4>
              <p className="text-emerald-500/80 text-sm mb-6">All {files.length} images have been packaged into a ZIP archive.</p>
              
              <button 
                onClick={() => downloadOrShare(outputUrl, `toolzum_batch_${Date.now()}.zip`)}
                className="w-full bg-white text-zinc-900 hover:bg-zinc-200 font-bold px-8 py-4 rounded-xl transition-colors shadow-xl flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download ZIP File
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

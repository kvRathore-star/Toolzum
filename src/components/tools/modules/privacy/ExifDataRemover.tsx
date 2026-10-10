"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import NextImage from "next/image";

export default function ExifDataRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [dataUrl, setDataUrl] = useState<string>('');
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [exifData, setExifData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const analyzeExif = async (selectedFile: File) => {
    setIsAnalyzing(true);
    try {
      // Dynamic import to avoid loading exifr if not used immediately
      const exifr = (await import('exifr')).default;
      const data = await exifr.parse(selectedFile);
      setExifData(data || {});
    } catch (e) {
      console.error(e);
      setExifData({});
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (selectedFile: File, url: string) => {
    setFile(selectedFile);
    setDataUrl(url);
    setOutputUrl(null);
    setExifData(null);
    analyzeExif(selectedFile);
  };

  const clearAll = () => {
    setFile(null);
    setDataUrl('');
    setOutputUrl(null);
    setExifData(null);
  };

  const removeExif = () => {
    if (!file || !dataUrl) return;
    setIsProcessing(true);
    
    // Canvas inherently strips all EXIF metadata when exporting
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast.error("Canvas context failed.");
        setIsProcessing(false);
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          if (outputUrl) URL.revokeObjectURL(outputUrl);
          setOutputUrl(URL.createObjectURL(blob));
          toast.success("EXIF data successfully removed!");
        } else {
          toast.error("Failed to generate safe image.");
        }
        setIsProcessing(false);
      }, file.type === 'image/png' ? 'image/png' : 'image/jpeg', 1.0);
    };
    img.onerror = () => {
      toast.error("Failed to load image for processing.");
      setIsProcessing(false);
    };
    img.src = dataUrl;
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm">
          <strong>Privacy First:</strong> Photos contain hidden data (GPS location, Camera model, Time). This tool detects and completely removes all EXIF metadata securely on your device.
        </div>
        <FileUploader 
          accept="image/jpeg,image/heic,image/png,image/webp"
          onFileSelect={handleFileSelect} 
          title="Upload Photo"
          subtitle="We'll scan and scrub its metadata"
        />
      </div>
    );
  }

  const hasExif = exifData && Object.keys(exifData).length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-[var(--text-primary)]">{file.name}</h3>
          <p className="text-[var(--text-secondary)] text-sm">{(file.size / 1024).toFixed(2)} KB</p>
        </div>
        <button 
          onClick={clearAll}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
        >
          Change Photo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Analysis Panel */}
        <div className="flex flex-col min-h-[500px]">
          <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4 mb-4">
            <h4 className="text-[var(--text-primary)] font-medium">Metadata Analysis</h4>
            {isAnalyzing ? (
              <span className="text-xs text-[var(--accent)] font-bold animate-pulse">Scanning...</span>
            ) : (
              <span className={`text-xs font-bold px-2 py-1 rounded ${hasExif ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                {hasExif ? 'Exif Data Found' : 'Clean (No Exif)'}
              </span>
            )}
          </div>
          
          <div className="flex-1 bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)] p-4 overflow-y-auto font-mono text-xs">
            {isAnalyzing ? (
              <div className="flex justify-center items-center h-full text-[var(--text-muted)]">
                Extracting EXIF tags...
              </div>
            ) : hasExif ? (
              <div className="space-y-2">
                {Object.entries(exifData).map(([key, value]) => {
                  // Skip complex nested objects for simple display
                  if (typeof value === 'object' && value !== null) {
                    value = JSON.stringify(value);
                  }
                  return (
                    <div key={key} className="flex justify-between border-b border-[var(--border-subtle)] py-1 last:border-0">
                      <span className="text-[var(--text-secondary)]">{key}</span>
                      <span className="text-[var(--text-primary)] dark:text-[var(--text-primary)] font-medium text-right break-all ml-4">
                        {String(value)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center h-full text-emerald-500 text-center gap-3">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p>No EXIF data detected.</p>
                <p className="text-[var(--text-muted)] text-xs mt-2">This image is already clean and safe to share.</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
             <button 
                onClick={removeExif}
                disabled={isProcessing || !hasExif || outputUrl !== null}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:hover:bg-red-600 flex justify-center items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                {isProcessing ? "Scrubbing Data..." : outputUrl ? "Data Scrubbed" : "Scrub EXIF Data"}
              </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4 mb-4">
            <h4 className="text-[var(--text-primary)] font-medium">Safe Export</h4>
            {outputUrl && <span className="text-xs font-bold bg-emerald-700 text-white px-2 py-1 rounded">100% Clean</span>}
          </div>

          <div className="flex-1 bg-[var(--bg-overlay)] rounded-xl overflow-hidden border border-[var(--border-subtle)] flex items-center justify-center p-4 min-h-[300px] chess-bg relative mb-6">
            <style>{`
              .chess-bg {
                background-image: linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%, #eee), linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%, #eee);
                background-size: 20px 20px; background-position: 0 0, 10px 10px;
              }
              @media (prefers-color-scheme: dark) { .chess-bg { background-image: linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%, #111), linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%, #111); } }
            `}</style>
            
<NextImage unoptimized={true} loading="lazy" 
  src={outputUrl || dataUrl} 
  alt="Uploaded image preview" 
  className={`max-h-[350px] object-contain drop-shadow-md rounded z-10 ${!outputUrl ? 'opacity-50 grayscale' : ''}`} 
/>
            
            {!outputUrl && (
               <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  <div className="bg-[var(--accent-ink)] backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium">
                     Awaiting Scrubbing...
                  </div>
               </div>
            )}
          </div>

          <button 
             onClick={() => outputUrl && downloadOrShare(outputUrl, `safe_${file.name}`)}
             disabled={!outputUrl}
             className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
             Download Safe Image
           </button>
        </div>
        
      </div>
    </div>
  );
}

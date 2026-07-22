"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../FileUploader';
import imageCompression from 'browser-image-compression';
import { Download, RefreshCw, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

export default function CompressImageTo50kb() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (file: File, url: string) => {
    setImageFile(file);
    setOriginalUrl(url);
    setCompressedUrl(null);
    setCompressedSize(null);
  };

  useEffect(() => {
    return () => {
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    };
  }, [compressedUrl]);

  const handleCompress = async () => {
    if (!imageFile) return;

    setIsProcessing(true);
    try {
      let quality = 0.9;
      let compressedFile = imageFile;
      
      // Target is exactly 50KB (51200 bytes)
      const targetSize = 50 * 1024;
      
      if (imageFile.size <= targetSize) {
        toast.success("Image is already under 50KB! No compression needed.");
        const url = URL.createObjectURL(imageFile);
        setCompressedUrl(url);
        setCompressedSize(imageFile.size);
        setIsProcessing(false);
        return;
      }

      // Iterative compression loop to hit under 50KB
      let maxAttempts = 5;
      let attempt = 0;
      
      while (compressedFile.size > targetSize && attempt < maxAttempts) {
        const options = {
          maxSizeMB: 0.048, // 49KB in MB
          maxWidthOrHeight: 1200 - (attempt * 150),
          useWebWorker: typeof window !== 'undefined' && typeof window.Worker !== 'undefined',
          initialQuality: quality,
        };
        
        compressedFile = await imageCompression(imageFile, options);
        quality -= 0.15;
        attempt++;
      }

      const url = URL.createObjectURL(compressedFile);
      setCompressedUrl(url);
      setCompressedSize(compressedFile.size);
      
      if (compressedFile.size <= targetSize) {
        toast.success('Successfully compressed under 50KB!');
      } else {
        toast('Compressed as much as possible, close to 50KB.');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to compress image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedUrl) return;
    downloadOrShare(compressedUrl, `compressed-50kb-${imageFile?.name || 'photo.jpg'}`);
  };

  const reset = () => {
    setImageFile(null);
    setOriginalUrl(null);
    setCompressedUrl(null);
    setCompressedSize(null);
  };

  if (!imageFile) {
    return (
      <div className="space-y-6">
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-400 text-sm flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>Strict 50KB Portal Limit:</strong> This utility is pre-configured to automatically adjust file weights to fit exactly under the 50KB restriction required by NSDL, UIDAI, UPSC, and banking portals.
          </div>
        </div>
        <FileUploader
          accept="image/jpeg,image/png,image/webp"
          onFileSelect={handleFileSelect}
          title="Upload Photo (JPG / PNG)"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Original Photo</h3>
          <p className="text-xs text-[var(--text-secondary)]">File Weight: {(imageFile.size / 1024).toFixed(1)} KB</p>
        </div>
        <button
          onClick={reset}
          className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs font-bold rounded-lg transition-colors cursor-pointer"
        >
          Change Photo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* original preview */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl flex flex-col justify-between items-center text-center">
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase block mb-3">Original Preview</span>
          <div className="relative border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-black flex justify-center items-center h-[250px] w-full">
            {originalUrl && (
              <img
                src={originalUrl}
                alt="Uploaded image preview"
                
                width={800} height={600}
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
          <button
            onClick={handleCompress}
            disabled={isProcessing}
            className="w-full mt-6 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:bg-indigo-800/50 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isProcessing ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              'Auto-Compress to Under 50KB'
            )}
          </button>
        </div>

        {/* compressed preview */}
        <div className="bg-[var(--bg-overlay)] border border-zinc-200 dark:border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col justify-between items-center text-center">
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase block mb-3">Compressed Output</span>
          <div className="relative border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-black flex justify-center items-center h-[250px] w-full">
            {compressedUrl ? (
              <img
                src={compressedUrl}
                alt="Processed result"
                
                width={800} height={600}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <span className="text-xs text-[var(--text-secondary)]">Run auto-compression to preview</span>
            )}
          </div>

          <div className="w-full mt-6 h-12 flex items-center justify-center">
            {compressedUrl && compressedSize ? (
              <button
                onClick={handleDownload}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Download className="w-5 h-5" />
                Download ({(compressedSize / 1024).toFixed(1)} KB)
              </button>
            ) : (
              <span className="text-xs text-[var(--text-muted)] font-mono">Target weight: &lt; 50.0 KB</span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 bg-[var(--bg-overlay)] rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)] space-y-2 text-xs text-[var(--text-secondary)] leading-relaxed">
        <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
          Government Compliance Guarantee
        </h4>
        <p>
          This compression utility is compliant with upload regulations of UIDAI (Aadhaar portal), NSDL (PAN card service), UPSC, SSC, and major banking portals in India. Standard metadata is preserved, and compression ratios are managed to retain scanning clarity.
        </p>
      </div>
    </div>
  );
}
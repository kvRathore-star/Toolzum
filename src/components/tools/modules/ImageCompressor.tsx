"use client";

import React, { useState, useEffect } from 'react';
import NextImage from "next/image";
import { FileUploader } from '../FileUploader';
import imageCompression from 'browser-image-compression';
import { Download, RefreshCw, Sliders, Image as ImageIcon, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { usePresetContext } from '@/context/WorkflowPresetContext';

export default function ImageCompressor() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(0.8);
  const [scale, setScale] = useState<number>(1.0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const { registerConfig } = usePresetContext();

  useEffect(() => {
    registerConfig(
      () => ({ quality: String(quality), scale: String(scale) }),
      (cfg) => {
        if (cfg.quality) setQuality(Number(cfg.quality));
        if (cfg.scale) setScale(Number(cfg.scale));
      },
    );
  }, [registerConfig, quality, scale]);

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
      // 1. Calculate target dimensions based on scale
      const tempImg = new Image();
      tempImg.src = originalUrl || '';
      await new Promise((resolve) => {
        tempImg.onload = resolve;
      });

      const targetWidth = tempImg.naturalWidth * scale;
      const targetHeight = tempImg.naturalHeight * scale;

      const options = {
        maxSizeMB: 15, // Let quality control it
        maxWidthOrHeight: Math.max(targetWidth, targetHeight),
        useWebWorker: typeof window !== 'undefined' && typeof window.Worker !== 'undefined',
        initialQuality: quality,
      };

      const compressedFile = await imageCompression(imageFile, options);
      const url = URL.createObjectURL(compressedFile);
      setCompressedUrl(url);
      setCompressedSize(compressedFile.size);
      toast.success('Compression complete!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to compress image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedUrl) return;
    downloadOrShare(compressedUrl, `compressed-${imageFile?.name || 'image.jpg'}`);
  };

  const reset = () => {
    setImageFile(null);
    setOriginalUrl(null);
    setCompressedUrl(null);
    setCompressedSize(null);
    setQuality(0.8);
    setScale(1.0);
  };

  if (!imageFile) {
    return (
      <div className="space-y-6">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-400 shrink-0" />
          <span><strong>100% Client-Side:</strong> All compression runs locally inside your browser. Your images are never sent to a server.</span>
        </div>
        <FileUploader
          accept="image/jpeg,image/png,image/webp"
          onFileSelect={handleFileSelect}
          title="Upload Photo to Compress"
        />
      </div>
    );
  }

  const compressionRatio = compressedSize && imageFile 
    ? ((1 - compressedSize / imageFile.size) * 100).toFixed(1) 
    : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <ImageIcon className="w-5 h-5 text-[var(--accent)]" />
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{imageFile.name}</h3>
            <p className="text-xs text-[var(--text-secondary)]">Original size: {(imageFile.size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
        <button
          onClick={reset}
          className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs font-bold rounded-lg transition-colors cursor-pointer"
        >
          Upload New Image
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings panel */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
          <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 text-sm uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-[var(--accent)]" />
            Compression Settings
          </h4>

          {/* Quality Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[var(--text-secondary)] dark:text-[var(--text-muted)]">
              <span>Image Quality</span>
              <span className="text-[var(--accent)] font-bold">{Math.round(quality * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={quality}
              onChange={(e) => {
                setQuality(Number(e.target.value));
                setCompressedUrl(null);
              }}
              className="w-full accent-indigo-500"
            />
          </div>

          {/* Scale Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[var(--text-secondary)] dark:text-[var(--text-muted)]">
              <span>Resolution Scale</span>
              <span className="text-[var(--accent)] font-bold">{Math.round(scale * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={scale}
              onChange={(e) => {
                setScale(Number(e.target.value));
                setCompressedUrl(null);
              }}
              className="w-full accent-indigo-500"
            />
          </div>

          <button
            onClick={handleCompress}
            disabled={isProcessing}
            className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:bg-indigo-800/50 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            {isProcessing ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              'Apply Compression'
            )}
          </button>
        </div>

        {/* View panel */}
        <div className="lg:col-span-2 bg-[var(--bg-overlay)] border border-zinc-200 dark:border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col justify-between min-h-[350px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-center flex-1">
            <div className="space-y-2 text-center">
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase block">Before</span>
              <div className="relative border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-black flex justify-center items-center h-[200px]">
                {originalUrl && (
                  <NextImage
                    src={originalUrl}
alt="Uploaded image preview"
                     className="max-w-full max-h-full object-contain"
                   />
                 )}
               </div>
             </div>
 
             <div className="space-y-2 text-center">
               <span className="text-xs font-bold text-[var(--text-secondary)] uppercase block">After</span>
               <div className="relative border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-black flex justify-center items-center h-[200px]">
                 {compressedUrl ? (
                   <NextImage
                     src={compressedUrl}
                     alt="Processed result"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-[var(--text-secondary)]">Apply settings to preview</span>
                )}
              </div>
            </div>
          </div>

          {compressedUrl && compressedSize && (
            <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
              <div className="space-y-0.5">
                <span className="text-xs text-emerald-400 font-bold block">Compressed Successfully</span>
                <div className="text-sm text-[var(--text-primary)]">
                  New Size: <strong className="text-[var(--text-primary)]">{(compressedSize / 1024).toFixed(1)} KB</strong>
                  {compressionRatio && (
                    <span className="text-emerald-400 font-bold ml-1.5">(-{compressionRatio}%)</span>
                  )}
                </div>
              </div>
              <button
                onClick={handleDownload}
                className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold px-6 py-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-2 text-sm cursor-pointer shadow"
              >
                <Download className="w-4 h-4" />
                Download Output
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
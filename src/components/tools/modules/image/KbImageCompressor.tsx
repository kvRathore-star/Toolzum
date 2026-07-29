"use client";

import React, { useState } from 'react';
import { toast } from "react-hot-toast";
import { FileUploader } from '../../FileUploader';
import imageCompression from 'browser-image-compression';
import { downloadOrShare } from '@/utils/nativeShare';

export default function KbImageCompressor() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [targetKb, setTargetKb] = useState<number>(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number | null>(null);

  const handleFileSelect = (file: File) => {
    setImageFile(file);
    setOutputUrl(null);
  };

  React.useEffect(() => {
    return () => {
      if (outputUrl) {
        URL.revokeObjectURL(outputUrl);
      }
    };
  }, [outputUrl]);

  const processImage = async () => {
    if (!imageFile) return;
    
    setIsProcessing(true);
    try {
      const options = {
        maxSizeMB: targetKb / 1024,
        maxWidthOrHeight: 1920,
        useWebWorker: typeof window !== 'undefined' && typeof window.Worker !== 'undefined',
        initialQuality: 0.9, 
      };
      
      const compressedFile = await imageCompression(imageFile, options);
      
      const url = URL.createObjectURL(compressedFile);
      setOutputUrl(url);
      setOutputSize(compressedFile.size);
    } catch (e) {
      console.error(e);
      toast.error("Failed to compress image.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!imageFile) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm">
          <strong>Strict Compression:</strong> Perfect for NSDL, Passport, and state exam portals that reject images over a certain KB limit.
        </div>
        <FileUploader 
          accept="image/jpeg,image/png,image/webp" 
          onFileSelect={handleFileSelect} 
          title="Upload Photo to Compress"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Original Size: {(imageFile.size / 1024).toFixed(2)} KB</h3>
        </div>
        <button 
          onClick={() => setImageFile(null)}
          className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          Change Photo
        </button>
      </div>

      <div className="p-6 border border-[var(--border-subtle)] bg-white dark:bg-black rounded-2xl shadow-xl">
        <h4 className="text-[var(--text-primary)] font-medium mb-4">Target File Size (KB)</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[20, 50, 100].map(preset => (
            <button
              key={preset}
              onClick={() => setTargetKb(preset)}
              className={`py-3 rounded-xl font-bold transition-all ${targetKb === preset ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]'}`}
            >
              &lt; {preset} KB
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between text-sm text-zinc-600 dark:text-[var(--text-muted)]">
            <span>Aggressive (10KB)</span>
            <span className="text-blue-400 font-bold">{targetKb} KB</span>
            <span>High Quality (500KB)</span>
          </div>
          <input 
            type="range" 
            min="10" 
            max="500" 
            value={targetKb}
            onChange={(e) => setTargetKb(Number(e.target.value))}
            className="w-full h-2 bg-[var(--bg-surface)] rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>

      <button 
        onClick={processImage}
        disabled={isProcessing}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50"
      >
        {isProcessing ? "Iteratively Compressing..." : `Compress to < ${targetKb} KB`}
      </button>

      {outputUrl && outputSize && (
        <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between animate-in slide-in-from-bottom-4 duration-500 gap-4 flex-wrap">
          <div>
            <h4 className="text-lg font-bold text-emerald-400 mb-1">Target Achieved!</h4>
            <p className="text-[var(--text-primary)] text-sm">
              Final Size: <strong className="text-[var(--text-primary)]">{(outputSize / 1024).toFixed(2)} KB</strong>
            </p>
          </div>
          <button 
            onClick={() => downloadOrShare(outputUrl, `compressed-${targetKb}kb.jpg`)}
            className="bg-white text-zinc-900 hover:bg-zinc-200 font-bold px-8 py-3 rounded-xl transition-colors shadow-lg"
          >
            Download
          </button>
        </div>
      )}
    </div>
  );
}

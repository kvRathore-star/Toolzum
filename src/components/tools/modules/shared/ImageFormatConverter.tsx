"use client";

import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { getErrorMessage } from '@/utils/error';

type ImageFormatConfig = {
  accept: string;
  title: string;
  description: string;
  hasWhiteBg: boolean;
  mimeType: 'image/jpeg' | 'image/png';
  quality?: number;
  outputFileName: string;
  buttonText: string;
  dropZoneText: string;
};

type ImageFormatConverterProps = {
  config: ImageFormatConfig;
};

export default function ImageFormatConverter({ config }: ImageFormatConverterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }, []);

  const convert = useCallback(async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = dataUrl;
      });
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      if (config.hasWhiteBg) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) { toast.error('Conversion failed'); return; }
        const url = URL.createObjectURL(blob);
        downloadOrShare(url, config.outputFileName);
        setTimeout(() => URL.revokeObjectURL(url), 100);
        toast.success('Converted successfully!');
      }, config.mimeType, config.quality);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, 'Conversion failed'));
    } finally {
      setIsProcessing(false);
    }
  }, [file, config]);

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden p-5">
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{config.title}</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-6">{config.description}</p>
        {!file ? (
          <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-12 hover:bg-[var(--bg-overlay)] dark:hover:bg-zinc-800 transition-colors cursor-pointer relative">
            <input type="file" accept={config.accept} onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer" />
            <div className="text-[var(--text-secondary)] flex flex-col items-center">
              <svg className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              <span className="text-sm">{config.dropZoneText}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)]">
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{file.name}</span>
              <button onClick={() => setFile(null)} className="text-xs text-red-500 hover:underline">Remove</button>
            </div>
            <button onClick={convert} disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl text-sm transition-all disabled:opacity-50">
              {isProcessing ? 'Converting...' : config.buttonText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

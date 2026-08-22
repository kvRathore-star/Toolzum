"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { fetchFile } from '@ffmpeg/util';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { createDownloadBlob } from '@/utils/blob';
import { useFFmpeg } from '@/hooks/useFFmpeg';

export default function Mp3Compressor() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [bitrate, setBitrate] = useState('64k');
  
  const { ffmpeg, isLoaded, progress, loadFFmpeg } = useFFmpeg();

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const processAudio = async () => {
    if (!file) return;
    if (!ffmpeg?.loaded) await loadFFmpeg();
    if (!ffmpeg) return;
    setIsProcessing(true);

    try {
      await ffmpeg.writeFile('input.mp3', await fetchFile(file));
      
      toast("Compressing audio...");
      await ffmpeg.exec(['-i', 'input.mp3', '-b:a', bitrate, 'output.mp3']);
      
      const data = await ffmpeg.readFile('output.mp3');
      const url = URL.createObjectURL(createDownloadBlob(data, 'audio/mpeg'));
      setOutputUrl(url);
      
      toast.success("Compression complete!");
    } catch (e) {
      console.error(e);
      toast.error("Compression failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-700 dark:text-blue-400 text-sm">
          <strong>100% Client-Side Processing:</strong> Compress audio files securely in your browser using WebAssembly.
        </div>
        <FileUploader 
          accept="audio/mpeg,audio/mp3,audio/*" 
          onFileSelect={(f) => setFile(f)} 
          title="Upload Audio File"
          subtitle="Supports MP3, WAV, AAC (25MB free, 50MB signed in)"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <button 
          onClick={() => { setFile(null); setOutputUrl(null); }}
          className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
        >
          Change File
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
          <h4 className="text-[var(--text-primary)] font-medium">Compression Settings</h4>
          
          <div>
            <label className="block text-sm text-zinc-600 dark:text-[var(--text-muted)] mb-2">Target Bitrate</label>
            <select 
              value={bitrate}
              onChange={(e) => setBitrate(e.target.value)}
              className="w-full bg-white dark:bg-black border border-[var(--border-subtle)] rounded-lg px-3 py-3 text-[var(--text-primary)] outline-none font-bold"
            >
              <option value="32k">32 kbps (Smallest, Low Quality)</option>
              <option value="64k">64 kbps (Good for Voice/Podcasts)</option>
              <option value="128k">128 kbps (Standard Music)</option>
              <option value="192k">192 kbps (High Quality)</option>
            </select>
          </div>

          <button 
            onClick={processAudio}
            disabled={isProcessing || !isLoaded}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden"
          >
            {isProcessing && (
              <div 
                className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            )}
            <span className="relative z-10">
              {isProcessing ? `Compressing ${Math.round(progress)}%` : "Start Compression"}
            </span>
          </button>
        </div>

        {outputUrl ? (
          <div className="p-6 bg-emerald-700/10 border border-emerald-500/20 rounded-2xl animate-in slide-in-from-bottom-4 text-center shadow-xl flex flex-col justify-center">
            <h4 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-4">Compression Complete!</h4>
            <audio src={outputUrl} controls className="w-full mb-6" />
            <button 
              onClick={() => downloadOrShare(outputUrl, `compressed_${file.name}`)}
              className="w-full bg-white text-zinc-900 hover:bg-zinc-200 font-bold px-4 py-3 rounded-xl transition-colors shadow-lg"
            >
              Download MP3
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-black border border-[var(--border-subtle)] rounded-2xl p-6 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2zM21 16c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2z" /></svg>
            </div>
            <h4 className="text-[var(--text-primary)] font-bold mb-2">Original Audio</h4>
            <audio src={URL.createObjectURL(file)} controls className="w-full opacity-80 scale-90" />
          </div>
        )}
      </div>
    </div>
  );
}

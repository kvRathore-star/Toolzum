"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FileUploader } from '../../FileUploader';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import Image from "next/image";
import { createDownloadBlob } from '@/utils/blob';

export default function GifToMp4() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
  const ffmpegRef = useRef(new FFmpeg());

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const processVideo = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    
    try {
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg.loaded) {
        ffmpeg.on('progress', ({ progress }) => {
          setProgress(progress * 100);
        });
        await ffmpeg.load();
      }
      
      await ffmpeg.writeFile('input.gif', await fetchFile(file));
      
      toast("Converting to MP4...");
      // Convert GIF to MP4. -pix_fmt yuv420p ensures compatibility with most players.
      await ffmpeg.exec(['-i', 'input.gif', '-movflags', 'faststart', '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', 'output.mp4']);
      
      const data = await ffmpeg.readFile('output.mp4');
      const blob = createDownloadBlob(data, 'video/mp4');
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      
      toast.success("Conversion complete!");
    } catch (e) {
      console.error(e);
      toast.error("Conversion failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm">
          <strong>WebAssembly Processing:</strong> Convert animated GIFs to lightweight MP4 videos natively in your browser.
        </div>
        <FileUploader 
          accept="image/gif" 
          onFileSelect={(f) => setFile(f)} 
          title="Upload GIF"
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
          Change GIF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-black border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl flex items-center justify-center min-h-[300px]">
          <Image loading="lazy" src={URL.createObjectURL(file)} alt="Original GIF" unoptimized={true} className="max-h-[300px] object-contain rounded-lg" />
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
            <h4 className="text-[var(--text-primary)] font-medium">Ready to convert</h4>
            
            <p className="text-sm text-zinc-600 dark:text-[var(--text-muted)]">
              MP4 videos are significantly smaller than animated GIFs and load much faster on websites. This process runs locally on your device.
            </p>

            <button 
              onClick={processVideo}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden"
            >
              {isProcessing && (
                <div 
                  className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              )}
              <span className="relative z-10">
                {isProcessing ? `Converting ${Math.round(progress)}%` : "Convert to MP4"}
              </span>
            </button>
          </div>

          {outputUrl && (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in slide-in-from-bottom-4 text-center shadow-xl">
              <h4 className="text-xl font-bold text-emerald-400 mb-4">MP4 Ready!</h4>
              <video src={outputUrl} controls autoPlay loop className="w-full max-h-[200px] rounded-lg mb-6" />
              <button 
                onClick={() => downloadOrShare(outputUrl, `${file.name.split('.')[0]}.mp4`)}
                className="w-full bg-white text-zinc-900 hover:bg-zinc-200 font-bold px-4 py-3 rounded-xl transition-colors shadow-lg"
              >
                Download MP4
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

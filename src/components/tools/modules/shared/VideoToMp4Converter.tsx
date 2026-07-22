"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { fetchFile } from '@ffmpeg/util';


type VideoToMp4Config = {
  fileExtension: string;
  accept: string;
  uploadTitle: string;
  uploadSubtitle: string;
  description: string;
  iconLabel: string;
  toastSuccess: string;
};

type VideoToMp4Props = {
  config: VideoToMp4Config;
};

export default function VideoToMp4Converter({ config }: VideoToMp4Props) {
  const { ffmpeg, isLoaded, isLoading, progress, loadFFmpeg } = useFFmpeg();

  const [file, setFile] = useState<File | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadFFmpeg();
  }, []);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith(config.fileExtension)) {
      toast.error(`Please upload a ${config.fileExtension} file.`);
    }
    setFile(selectedFile);
    setOutputUrl(null);
    setOutputSize(null);
  };

  const clearAll = () => {
    setFile(null);
    setOutputUrl(null);
    setOutputSize(null);
  };

  const convertVideo = async () => {
    if (!file || !ffmpeg || !isLoaded) return;

    setIsProcessing(true);
    try {
      await ffmpeg.writeFile(`input${config.fileExtension}`, await fetchFile(file));

      await ffmpeg.exec([
        '-i', `input${config.fileExtension}`,
        '-vcodec', 'libx264',
        '-crf', '23',
        '-preset', 'fast',
        '-pix_fmt', 'yuv420p',
        'output.mp4'
      ]);

      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data as any], { type: 'video/mp4' });

      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      setOutputSize(blob.size);
      toast.success(config.toastSuccess);
    } catch (e) {
      console.error(e);
      toast.error("An error occurred during conversion.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <svg className="w-12 h-12 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-[var(--text-secondary)] font-medium animate-pulse">Initializing WebAssembly Core...</p>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-500 text-sm" dangerouslySetInnerHTML={{ __html: config.description }} />

        <FileUploader
          accept={config.accept}
          onFileSelect={handleFileSelect}
          title={config.uploadTitle}
          subtitle={config.uploadSubtitle}
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
          onClick={clearAll}
          disabled={isProcessing}
          className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg disabled:opacity-50"
        >
          Change File
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 h-fit flex flex-col justify-center">
          <div className="text-center space-y-4">
             <div className="flex justify-center items-center gap-4 text-[var(--text-muted)]">
                <div className="bg-[var(--bg-surface)] p-4 rounded-2xl">
                  <span className="font-black text-xl text-zinc-800 dark:text-zinc-200">{config.iconLabel}</span>
                </div>
                <svg className="w-8 h-8 text-blue-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                <div className="bg-[var(--bg-surface)] p-4 rounded-2xl border-2 border-blue-500/30">
                  <span className="font-black text-xl text-blue-500">.MP4</span>
                </div>
             </div>
             <p className="text-sm text-[var(--text-secondary)]">Video will be converted to H.264 MP4 format for maximum device compatibility.</p>
          </div>

          <div className="pt-4 border-t border-[var(--border-subtle)]">
             {isProcessing ? (
               <div className="space-y-2">
                 <div className="flex justify-between text-xs font-bold text-blue-500">
                    <span>Converting...</span>
                    <span>{progress}%</span>
                 </div>
                 <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-full h-3 overflow-hidden">
                   <div
                     className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                     style={{ width: `${progress}%` }}
                   ></div>
                 </div>
               </div>
             ) : (
               <button
                 onClick={convertVideo}
                 className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                 Convert to MP4
               </button>
             )}
          </div>
        </div>

        <div className="space-y-6">
          {outputUrl ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
               <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                  <h4 className="font-bold text-emerald-500">Conversion Complete</h4>
               </div>

               <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-inner flex flex-col items-center justify-center relative">
                  <video src={outputUrl} controls className="w-full max-h-[250px]" />
               </div>

               {outputSize && (
                 <div className="flex justify-between text-sm">
                   <span className="text-[var(--text-secondary)]">File Size:</span>
                   <span className="font-bold text-emerald-500">{(outputSize / 1024 / 1024).toFixed(2)} MB</span>
                 </div>
               )}

               <button
                  onClick={() => downloadOrShare(outputUrl, `${file.name.replace(/\.[^/.]+$/, "")}.mp4`)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download MP4
                </button>
            </div>
          ) : (
             <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-[var(--text-muted)]">
                <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
               <p className="text-center text-sm px-4">Your MP4 video will appear here.</p>
             </div>
          )}
        </div>

      </div>
    </div>
  );
}

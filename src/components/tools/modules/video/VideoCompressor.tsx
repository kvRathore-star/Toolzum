"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { fetchFile } from '@ffmpeg/util';
import Image from "next/image";

type Mode = 'video' | 'gif';

export default function VideoCompressor() {
  const { ffmpeg, isLoaded, isLoading, progress, isFirstLoad, loadError, loadFFmpeg } = useFFmpeg();
  const [mode, setMode] = useState<Mode>('video');
  const [file, setFile] = useState<File | null>(null);
  const [crf, setCrf] = useState(28);
  const [colors, setColors] = useState('128');
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
    setFile(selectedFile);
    setOutputUrl(null);
    setOutputSize(null);
  };

  const clearAll = () => {
    setFile(null);
    setOutputUrl(null);
    setOutputSize(null);
  };

  const compressVideo = async () => {
    if (!file || !ffmpeg || !isLoaded) return;
    setIsProcessing(true);
    try {
      if (mode === 'video') {
        await ffmpeg.writeFile('input.mp4', await fetchFile(file));
        await ffmpeg.exec([
          '-i', 'input.mp4',
          '-vcodec', 'libx264',
          '-crf', crf.toString(),
          '-preset', 'fast',
          'output.mp4'
        ]);
        const data = await ffmpeg.readFile('output.mp4');
        const blob = new Blob([data as BlobPart], { type: 'video/mp4' });
        if (outputUrl) URL.revokeObjectURL(outputUrl);
        setOutputUrl(URL.createObjectURL(blob));
        setOutputSize(blob.size);
        toast.success("Video compressed successfully!");
      } else {
        await ffmpeg.writeFile('input.gif', await fetchFile(file));
        await ffmpeg.exec(['-i', 'input.gif', '-vf', `palettegen=stats_mode=diff`, '-y', 'palette.png']);
        await ffmpeg.exec(['-i', 'input.gif', '-i', 'palette.png', '-lavfi', `paletteuse=dither=bayer:bayer_scale=5`, '-gifflags', '-offsetting', '-y', 'output.gif']);
        const data = await ffmpeg.readFile('output.gif');
        const blob = new Blob([data as BlobPart], { type: 'image/gif' });
        if (outputUrl) URL.revokeObjectURL(outputUrl);
        setOutputUrl(URL.createObjectURL(blob));
        setOutputSize(blob.size);
        toast.success('GIF compressed successfully!');
        await ffmpeg.deleteFile('input.gif');
        await ffmpeg.deleteFile('palette.png');
        await ffmpeg.deleteFile('output.gif');
      }
    } catch (e) {
      console.error(e);
      toast.error(mode === 'video' ? "Compression failed." : "GIF compression failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isLoaded) {
    if (loadError) {
      return (
        <div className="flex flex-col items-center justify-center p-12 space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          </div>
          <p className="text-red-500 font-medium">Failed to load video engine</p>
          <p className="text-xs text-[var(--text-muted)] max-w-sm">{loadError}</p>
          <button onClick={loadFFmpeg} className="px-4 py-2 bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white text-sm font-medium rounded-xl transition-colors focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2">
            Retry
          </button>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <svg className="w-12 h-12 text-[var(--accent)] animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-[var(--text-secondary)] font-medium animate-pulse">Initializing WebAssembly Core...</p>
        {isFirstLoad && (
          <p className="text-xs text-[var(--text-muted)] text-center max-w-sm">
            First load downloads a ~30MB engine. May take a few seconds on slower connections.
          </p>
        )}
      </div>
    );
  }

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm">
          <strong>100% Client-Side:</strong> Compress videos and GIFs directly in your browser — nothing uploaded.
        </div>

        {/* Mode selector */}
        <div className="flex gap-2 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-1 w-fit mx-auto">
          <button
            onClick={() => setMode('video')}
            className={`px-4 py-1.5 text-xs font-medium rounded-[var(--radius-lg)] transition-colors ${mode === 'video' ? 'bg-[var(--accent-ink)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'} focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2`}
          >
            Video
          </button>
          <button
            onClick={() => setMode('gif')}
            className={`px-4 py-1.5 text-xs font-medium rounded-[var(--radius-lg)] transition-colors ${mode === 'gif' ? 'bg-pink-500 text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'} focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2`}
          >
            GIF
          </button>
        </div>

        <FileUploader
          accept={mode === 'video' ? 'video/mp4,video/quicktime,video/x-matroska,video/webm' : 'image/gif'}
          onFileSelect={handleFileSelect}
          title={mode === 'video' ? 'Upload Video' : 'Upload GIF'}
          subtitle={mode === 'video' ? 'MP4, MOV, MKV, WEBM' : 'Animated GIF'}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-[var(--text-primary)]">{file.name}</h3>
          <p className="text-[var(--text-secondary)] dark:text-[var(--text-muted)] text-sm">
            {mode === 'video' ? 'Video' : 'GIF'} Size:{' '}
            <span className="font-bold text-red-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
          </p>
        </div>
        <button
          onClick={clearAll}
          disabled={isProcessing}
          className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg disabled:opacity-50 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          Change File
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6 h-fit">
          {mode === 'video' ? (
            <>
              <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">Compression Settings</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Compression Level</label>
                  <span className="text-xs font-bold text-[var(--accent)]">{crf <= 22 ? 'High Quality' : crf >= 32 ? 'Low Quality' : 'Balanced'} (CRF {crf})</span>
                </div>
                <input aria-label="Compression Level"
                  type="range" min="20" max="40" step="1" value={crf}
                  onChange={(e) => setCrf(parseInt(e.target.value))}
                  disabled={isProcessing}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-[var(--text-secondary)] px-1">
                  <span>Better Quality</span>
                  <span>Smaller File</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">GIF Optimization</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Color Palette</label>
                  <span className="text-xs font-bold text-pink-500">{colors} colors</span>
                </div>
                <input aria-label="Color Palette"
                  type="range" min="32" max="256" step="1" value={parseInt(colors)}
                  onChange={(e) => setColors(e.target.value)}
                  disabled={isProcessing}
                  className="w-full accent-pink-500"
                />
                <div className="flex justify-between text-xs text-[var(--text-secondary)] px-1">
                  <span>Better Quality</span>
                  <span>Smaller File</span>
                </div>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-[var(--border-subtle)]">
            {isProcessing ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-[var(--accent)]">
                  <span>{mode === 'video' ? 'Compressing Video...' : 'Optimizing GIF...'}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-blue-100 dark:bg-[var(--accent)]/10 rounded-full h-3 overflow-hidden">
                  <div className="bg-[var(--accent-ink)] h-3 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            ) : (
              <button
                onClick={compressVideo}
                className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                {mode === 'video' ? 'Compress Video' : 'Optimize GIF'}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {outputUrl ? (
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                <h4 className="font-bold text-emerald-500">Complete</h4>
                {outputSize && (
                  <span className="text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded">
                    - {((file.size - outputSize) / file.size * 100).toFixed(1)}% Smaller
                  </span>
                )}
              </div>
              <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-inner flex flex-col items-center justify-center relative">
                {mode === 'video' ? (
                  <video src={outputUrl} controls className="w-full max-h-[250px]" />
                ) : (
                  <Image src={outputUrl} alt="Compressed GIF" loading="lazy" unoptimized={true} width={400} height={250} className="max-h-[250px] object-contain" />
                )}
              </div>
              {outputSize && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">New Size:</span>
                  <span className="font-bold text-emerald-500">{(outputSize / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              )}
              <button
                onClick={() => downloadOrShare(outputUrl, `compressed_${file.name.replace(/\.[^/.]+$/, "")}.${mode === 'video' ? 'mp4' : 'gif'}`)}
                className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download Compressed {mode === 'video' ? 'Video' : 'GIF'}
              </button>
            </div>
          ) : (
            <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-[var(--text-muted)]">
              <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              <p className="text-center text-sm px-4">Your compressed {mode === 'video' ? 'video' : 'GIF'} will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

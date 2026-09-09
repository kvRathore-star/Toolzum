"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { fetchFile } from '@ffmpeg/util';
import { Film, Image } from 'lucide-react';
import { useEnterToSubmit } from '@/lib/keyboard';
import { EmptyState } from '@/components/EmptyState';

type InputMode = 'video' | 'image';

export default function VideoToGif() {
  const { ffmpeg, isLoaded, isLoading, progress, loadFFmpeg } = useFFmpeg();
  const [mode, setMode] = useState<InputMode>('video');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [fps, setFps] = useState(10);
  const [width, setWidth] = useState(320);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadFFmpeg();
  }, []);

  useEffect(() => {
    return () => { if (outputUrl) URL.revokeObjectURL(outputUrl); };
  }, [outputUrl]);

  const convertToGif = async () => {
    if (!ffmpeg || !isLoaded) return;
    setIsProcessing(true);
    try {
      if (mode === 'video') {
        if (!videoFile) return;
        await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
        const filterGraph = `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`;
        await ffmpeg.exec(['-i', 'input.mp4', '-vf', filterGraph, '-loop', '0', 'output.gif']);
      } else {
        if (imageFiles.length === 0) return;
        for (let i = 0; i < imageFiles.length; i++) {
          await ffmpeg.writeFile(`img${i}.png`, await fetchFile(imageFiles[i]));
        }
        const vfArgs = `scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`;
        await ffmpeg.exec(['-framerate', fps.toString(), '-i', 'img%d.png', '-vf', vfArgs, '-loop', '0', 'output.gif']);
        for (let i = 0; i < imageFiles.length; i++) await ffmpeg.deleteFile(`img${i}.png`);
      }

      const data = await ffmpeg.readFile('output.gif');
      const blob = new Blob([data as any], { type: 'image/gif' });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      setOutputSize(blob.size);
      toast.success("GIF generated successfully!");
    } catch (e) {
      console.error(e);
      toast.error("An error occurred during GIF generation.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = useEnterToSubmit(convertToGif);

  const isReady = mode === 'video' ? !!videoFile : imageFiles.length > 0;

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <svg className="w-12 h-12 text-pink-500 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-[var(--text-secondary)] font-medium animate-pulse">Initializing WebAssembly Core...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Video & Image to GIF Converter</h3>
      </div>

      <div className="flex gap-1.5 bg-[var(--bg-surface)]/50 p-1 rounded-2xl w-fit">
        <button onClick={() => { setMode('video'); setOutputUrl(null); }} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${mode === 'video' ? 'bg-[var(--bg-elevated)] text-pink-600 dark:text-pink-400 shadow-sm' : 'text-[var(--text-secondary)]'}`}><Film className="w-3.5 h-3.5" /> Video</button>
        <button onClick={() => { setMode('image'); setOutputUrl(null); }} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${mode === 'image' ? 'bg-[var(--bg-elevated)] text-pink-600 dark:text-pink-400 shadow-sm' : 'text-[var(--text-secondary)]'}`}><Image className="w-3.5 h-3.5" /> Images</button>
      </div>

      {mode === 'video' ? (
        !videoFile ? (
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-pink-500/10 border-b border-pink-500/20 p-3 px-5 text-pink-500 text-xs"><strong>Make Memes Offline:</strong> Convert any video clip into a high-quality looping GIF.</div>
            <div className="p-5">
              <FileUploader accept="video/mp4,video/quicktime,video/webm" onFileSelect={(f: File) => { setVideoFile(f); setOutputUrl(null); }} title="Upload Video" subtitle="MP4, MOV, or WEBM" />
            </div>
          </div>
        ) : (
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-[var(--border-subtle)]">
              <div><h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{videoFile.name}</h4><p className="text-[10px] text-[var(--text-muted)]">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</p></div>
              <button onClick={() => { setVideoFile(null); setOutputUrl(null); }} className="text-[10px] text-red-500 hover:underline">Change</button>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div><label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Frames per Second</label><div className="grid grid-cols-3 gap-1.5 mt-1.5">{[5, 10, 15].map(v => <button key={v} onClick={() => setFps(v)} className={`py-2 text-[10px] font-bold border rounded-lg ${fps === v ? 'bg-pink-600 text-white border-pink-600' : 'bg-[var(--bg-overlay)] text-zinc-600 dark:text-[var(--text-muted)] border-[var(--border-subtle)]'}`}>{v} FPS</button>)}</div></div>
                <div><label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Width</label><div className="grid grid-cols-3 gap-1.5 mt-1.5">{[320, 480, 640].map(v => <button key={v} onClick={() => setWidth(v)} className={`py-2 text-[10px] font-bold border rounded-lg ${width === v ? 'bg-pink-600 text-white border-pink-600' : 'bg-[var(--bg-overlay)] text-zinc-600 dark:text-[var(--text-muted)] border-[var(--border-subtle)]'}`}>{v}px</button>)}</div></div>
              </div>
              <div className="flex flex-col justify-end">{outputUrl ? null : <button onClick={convertToGif} disabled={isProcessing} className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3.5 rounded-xl text-xs transition-all active:scale-[0.98]">{isProcessing ? 'Generating...' : 'Convert to GIF'}</button>}</div>
            </div>
          </div>
        )
      ) : (
        imageFiles.length === 0 ? (
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-fuchsia-500/10 border-b border-fuchsia-500/20 p-3 px-5 text-fuchsia-500 text-xs"><strong>Animate Images:</strong> Combine multiple images into a single animated GIF.</div>
            <div className="p-5">
              <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-10 hover:bg-[var(--bg-overlay)] dark:hover:bg-zinc-800 transition-colors cursor-pointer text-center relative">
                <input aria-label="Width" type="file" multiple accept="image/png,image/jpeg,image/webp" onChange={e => { if (e.target.files) { setImageFiles(Array.from(e.target.files!)); setOutputUrl(null); } }} className="absolute inset-0 opacity-0 cursor-pointer" />
                <svg className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p className="text-xs text-[var(--text-secondary)]">Select multiple images (PNG, JPG, WebP)</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-[var(--border-subtle)]">
              <div><h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{imageFiles.length} Images</h4><p className="text-[10px] text-[var(--text-muted)]">Click to add more</p></div>
              <button onClick={() => { setImageFiles([]); setOutputUrl(null); }} className="text-[10px] text-red-500 hover:underline">Clear</button>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div><label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Frames per Second</label><div className="grid grid-cols-3 gap-1.5 mt-1.5">{[5, 10, 15].map(v => <button key={v} onClick={() => setFps(v)} className={`py-2 text-[10px] font-bold border rounded-lg ${fps === v ? 'bg-fuchsia-600 text-white border-fuchsia-600' : 'bg-[var(--bg-overlay)] text-zinc-600 dark:text-[var(--text-muted)] border-[var(--border-subtle)]'}`}>{v} FPS</button>)}</div></div>
                <div><label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Width</label><div className="grid grid-cols-3 gap-1.5 mt-1.5">{[320, 480, 640].map(v => <button key={v} onClick={() => setWidth(v)} className={`py-2 text-[10px] font-bold border rounded-lg ${width === v ? 'bg-fuchsia-600 text-white border-fuchsia-600' : 'bg-[var(--bg-overlay)] text-zinc-600 dark:text-[var(--text-muted)] border-[var(--border-subtle)]'}`}>{v}px</button>)}</div></div>
              </div>
              <div className="flex flex-col justify-end">{outputUrl ? null : <button onClick={convertToGif} onKeyDown={handleKeyDown} disabled={isProcessing} className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-3.5 rounded-xl text-xs transition-all active:scale-[0.98] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2" aria-label={isProcessing ? 'Generating GIF...' : 'Create animated GIF'}>{isProcessing ? 'Generating...' : 'Create Animated GIF'}</button>}</div>
            </div>
          </div>
        )
      )}

      {isProcessing && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl p-5 space-y-2">
          <div className="flex justify-between text-[10px] font-semibold text-pink-600 dark:text-pink-400">
            <span>{progress === 0 ? 'Analyzing colors & encoding frames... (large videos take a while)' : 'Generating GIF...'}</span>
            <span>{progress === 0 ? '—' : `${progress}%`}</span>
          </div>
          {progress === 0 ? (
            <div className="w-full bg-zinc-200 dark:bg-[var(--bg-surface)] rounded-full h-2 overflow-hidden">
              <div className="bg-pink-500 h-full rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
          ) : (
            <div className="w-full bg-zinc-200 dark:bg-[var(--bg-surface)] rounded-full h-2 overflow-hidden"><div className="bg-pink-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div></div>
          )}
        </div>
      )}

      {outputUrl ? (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-3"><h4 className="text-xs font-bold text-emerald-500">GIF Ready</h4>{outputSize && <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-bold">{(outputSize / 1024).toFixed(1)} KB</span>}</div>
          <div className="bg-zinc-100 dark:bg-black rounded-xl overflow-hidden p-4 flex items-center justify-center" style={{backgroundImage: 'linear-gradient(45deg,#eee 25%,transparent 25%,transparent 75%,#eee 75%,#eee),linear-gradient(45deg,#eee 25%,transparent 25%,transparent 75%,#eee 75%,#eee)', backgroundSize: '20px 20px', backgroundPosition: '0 0,10px 10px'}}>
            <img  loading="lazy" src={outputUrl} alt="Generated GIF" className="max-w-full max-h-[250px] object-contain rounded drop-shadow-md" />
          </div>
          <button onClick={() => downloadOrShare(outputUrl, `animated.gif`)} className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2" aria-label="Download generated GIF">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download GIF
          </button>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
            <p className="text-[10px] text-[var(--accent)] dark:text-[var(--accent)]"><strong>Pro:</strong> No watermark, HD resolution (1080p+), batch convert multiple videos, custom loop count, add text overlays to GIFs.</p>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-[var(--border-subtle)] rounded-2xl">
          <EmptyState
            title="Converted GIF will appear here"
            message="Upload a video above to convert."
          />
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FileUploader } from '../../FileUploader';
import { fetchFile } from '@ffmpeg/util';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import JSZip from 'jszip';
import { useFFmpeg } from '@/hooks/useFFmpeg';

export default function VideoScreenshot() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [timestamp, setTimestamp] = useState('00:00');
  const [interval, setInterval] = useState(5);
  const [format, setFormat] = useState<'jpg' | 'png' | 'webp'>('jpg');
  const [quality, setQuality] = useState(90);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [screenshots, setScreenshots] = useState<Array<{ blobUrl: string; timestamp: string }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { loadFFmpeg } = useFFmpeg();

  const videoRef = useRef<HTMLVideoElement>(null);
  const screenshotsRef = useRef(screenshots);
  screenshotsRef.current = screenshots;

  useEffect(() => {
    return () => {
      screenshotsRef.current.forEach(s => URL.revokeObjectURL(s.blobUrl));
    };
  }, []);

  const parseTimeToSeconds = (t: string): number => {
    const parts = t.split(':').map(Number);
    if (parts.length === 2) return parts[0]! * 60 + parts[1]!;
    if (parts.length === 3) return parts[0]! * 3600 + parts[1]! * 60 + parts[2]!;
    return 0;
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getExt = () => (format === 'png' ? 'png' : format === 'webp' ? 'webp' : 'jpg');

  const captureFrame = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const ffmpeg = await loadFFmpeg();
      if (!ffmpeg) {
        toast.error('Failed to load FFmpeg engine.');
        return;
      }
      await ffmpeg.writeFile('input.mp4', await fetchFile(file));

      const ext = getExt();
      const seconds = mode === 'single'
        ? videoRef.current ? videoRef.current.currentTime : parseTimeToSeconds(timestamp)
        : 0;

      if (mode === 'single') {
        const args = ['-ss', String(seconds), '-i', 'input.mp4', '-vframes', '1'];
        if (format === 'png') {
          args.push('-c:v', 'png');
        } else if (format === 'webp') {
          args.push('-c:v', 'libwebp', '-quality', String(quality));
        } else {
          args.push('-q:v', String(Math.round(2 + (100 - quality) / 100 * 29)));
        }
        if (width > 0 && height > 0) {
          args.push('-vf', `scale=${width}:${height}`);
        }
        args.push(`out.${ext}`);

        await ffmpeg.exec(args);
        const data = await ffmpeg.readFile(`out.${ext}`);
        const blob = new Blob([data as BlobPart]);
        const blobUrl = URL.createObjectURL(blob);
        setScreenshots(prev => [...prev, { blobUrl, timestamp: formatTime(seconds) }]);
        toast.success('Screenshot captured!');
      } else {
        let vf = `fps=1/${interval}`;
        if (width > 0 && height > 0) vf += `,scale=${width}:${height}`;

        const args = ['-i', 'input.mp4', '-vf', vf];
        if (format === 'png') {
          args.push('-c:v', 'png');
        } else if (format === 'webp') {
          args.push('-c:v', 'libwebp', '-quality', String(quality));
        } else {
          args.push('-q:v', String(Math.round(2 + (100 - quality) / 100 * 29)));
        }
        args.push(`out_%04d.${ext}`);

        await ffmpeg.exec(args);

        const frames: Array<{ blobUrl: string; timestamp: string }> = [];
        for (let i = 0; ; i++) {
          try {
            const filename = `out_${String(i).padStart(4, '0')}.${ext}`;
            const data = await ffmpeg.readFile(filename);
            const blob = new Blob([data as BlobPart]);
            const blobUrl = URL.createObjectURL(blob);
            frames.push({ blobUrl, timestamp: formatTime(i * interval) });
          } catch {
            break;
          }
        }
        if (frames.length === 0) {
          toast.error('No frames extracted.');
        } else {
          setScreenshots(prev => [...prev, ...frames]);
          toast.success(`${frames.length} screenshots captured!`);
        }
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to capture screenshot.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAll = async () => {
    if (screenshots.length === 0) return;
    if (screenshots.length === 1) {
      downloadOrShare(screenshots[0]!.blobUrl, `screenshot.${getExt()}`);
      return;
    }
    try {
      const zip = new JSZip();
      const ext = getExt();
      for (let i = 0; i < screenshots.length; i++) {
        const res = await fetch(screenshots[i]!.blobUrl);
        const blob = await res.blob();
        zip.file(`screenshot_${String(i + 1).padStart(3, '0')}.${ext}`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      downloadOrShare(url, 'screenshots.zip');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (e) {
      console.error(e);
      toast.error('Failed to create ZIP.');
    }
  };

  const reset = () => {
    screenshots.forEach(s => URL.revokeObjectURL(s.blobUrl));
    setScreenshots([]);
    setFile(null);
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-700 dark:text-blue-400 text-sm">
          <strong>Video Screenshot Extractor:</strong> Capture still frames from videos at precise timestamps. All processing happens in your browser and no data is uploaded.
        </div>
        <FileUploader accept="video/*" onFileSelect={(f) => setFile(f)} title="Upload Video" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <button onClick={reset} className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg">Change Video</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-black border border-[var(--border-subtle)] p-4 rounded-2xl shadow-xl flex items-center justify-center min-h-[300px]">
          <video ref={videoRef} src={URL.createObjectURL(file)} controls className="w-full max-h-[400px] rounded-lg" />
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
            <h4 className="text-[var(--text-primary)] font-medium">Capture Settings</h4>

            <div className="flex gap-2 bg-[var(--bg-surface)] p-1 rounded-xl">
              {(['single', 'batch'] as const).map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === m ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                >
                  {m === 'single' ? 'Single Frame' : 'Batch'}
                </button>
              ))}
            </div>

            {mode === 'single' ? (
              <div>
                <label className="block text-sm text-zinc-600 dark:text-[var(--text-muted)] mb-2">Timestamp (MM:SS or HH:MM:SS)</label>
                <input aria-label="Timestamp (MM:SS or HH:MM:SS)" type="text" value={timestamp} onChange={(e) => setTimestamp(e.target.value)} placeholder="00:00"
                  className="w-full bg-white dark:bg-black border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 font-mono"
                />
                <button onClick={captureFrame} disabled={isProcessing}
                  className="w-full mt-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? 'Capturing...' : 'Capture at Current Time'}
                </button>
              </div>
            ) : (
              <div>
                <label className="block text-sm text-zinc-600 dark:text-[var(--text-muted)] mb-2">Interval (seconds between frames)</label>
                <input aria-label="Interval (seconds between frames)" type="number" value={interval} onChange={(e) => setInterval(Number(e.target.value))} min={0.5} step={0.5}
                  className="w-full bg-white dark:bg-black border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 font-mono"
                />
                <button onClick={captureFrame} disabled={isProcessing}
                  className="w-full mt-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? 'Extracting...' : 'Extract Frames'}
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm text-zinc-600 dark:text-[var(--text-muted)] mb-2">Output Format</label>
              <div className="flex gap-2">
                {(['jpg', 'png', 'webp'] as const).map(f => (
                  <button key={f} onClick={() => setFormat(f)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium uppercase transition-all ${format === f ? 'bg-blue-600 text-white shadow-sm' : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <label className="text-zinc-600 dark:text-[var(--text-muted)]">Quality</label>
                <span className="text-zinc-900 dark:text-zinc-100 font-mono text-xs bg-[var(--bg-surface)] px-2 py-0.5 rounded">{quality}%</span>
              </div>
              <input aria-label="Quality" type="range" min={1} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1"><span>Low</span><span>High</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-600 dark:text-[var(--text-muted)] mb-2">Width (0 = original)</label>
                <input aria-label="Width (0 = original)" type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} min={0}
                  className="w-full bg-white dark:bg-black border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-600 dark:text-[var(--text-muted)] mb-2">Height (0 = original)</label>
                <input aria-label="Height (0 = original)" type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} min={0}
                  className="w-full bg-white dark:bg-black border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {screenshots.length > 0 && (
        <div className="bg-white dark:bg-black border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-[var(--text-primary)] font-medium">
              {screenshots.length} Screenshot{screenshots.length !== 1 ? 's' : ''}
            </h4>
            <button onClick={downloadAll}
              className="text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium px-4 py-2 rounded-lg transition-all active:scale-95"
            >
              {screenshots.length === 1 ? 'Download' : 'Download All (ZIP)'}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {screenshots.map((s, i) => (
              <div key={i} className="relative group">
                <img src={s.blobUrl} alt={`Frame at ${s.timestamp}`}
                  className="w-full aspect-video object-cover rounded-lg border border-[var(--border-subtle)] bg-black"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 rounded-b-lg pointer-events-none">
                  <span className="text-white text-xs font-mono">{s.timestamp}</span>
                </div>
                <button onClick={() => downloadOrShare(s.blobUrl, `frame_${s.timestamp.replace(':', '-')}.${getExt()}`)}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Download"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

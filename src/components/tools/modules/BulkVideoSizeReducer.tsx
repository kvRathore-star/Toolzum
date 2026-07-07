"use client";
import React, { useState, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import { Upload, X, Loader2, Download, Film, Settings2, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ProDownloadButton } from './ProDownloadButton';
import { useSession } from '@/lib/auth-client';
import { withErrorHandling } from '@/lib/withErrorHandling';
import { hasLargeFiles, checkMemory } from '@/lib/fileUtils';

export default function BulkVideoSizeReducer() {
  const [files, setFiles] = useState<File[]>([]);
  const [targetSize, setTargetSize] = useState('50');
  const [processedBlobs, setProcessedBlobs] = useState<{ name: string; blob: Blob }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const ffRef = useRef<Awaited<import('@ffmpeg/ffmpeg').FFmpeg> | null>(null);
  const { data: session } = useSession();
  const isPro = (session?.user as Record<string, unknown>)?.plan === 'pro';

  const loadFfmpeg = useCallback(async () => {
    if (ffRef.current) return ffRef.current;
    const { FFmpeg } = await import('@ffmpeg/ffmpeg');
    const ff = new FFmpeg();
    ff.on('progress', ({ progress: p }) => setProgress(Math.round(p * 100)));
    await ff.load();
    ffRef.current = ff;
    setFfmpegLoaded(true);
    return ff;
  }, []);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const accepted = Array.from(e.target.files || []);
    if (accepted.length === 0) return;
    setFiles(prev => [...prev, ...accepted]);
    toast.success(`Added ${accepted.length} video(s)`);
  };

  const handleProcess = async () => {
    if (files.length === 0) { toast.error('Upload videos first'); return; }
    setIsProcessing(true);
    setProcessedBlobs([]);
    if (hasLargeFiles(files)) {
      const mem = checkMemory();
      const proceed = window.confirm(
        `Large files detected (>100MB).${mem.low ? ` Your device has only ${mem.available} RAM.` : ''} These load entirely into browser memory — close other tabs or expect crashes on low-RAM devices. Continue?`
      );
      if (!proceed) { setIsProcessing(false); return; }
    }
    try {
      const ff = await withErrorHandling(() => loadFfmpeg(), { toast: 'Failed to load FFmpeg engine', log: true });
      if (!ff) { setIsProcessing(false); return; }
      const { fetchFile } = await import('@ffmpeg/util');
      const results: { name: string; blob: Blob }[] = [];
      const maxSizeKb = parseInt(targetSize) * 1024;
      const maxConcurrent = isPro ? 4 : 1;
      for (let i = 0; i < files.length; i += maxConcurrent) {
        const chunk = Array.from({ length: Math.min(maxConcurrent, files.length - i) }, (_, j) => i + j);
        const chunkResults = await Promise.allSettled(chunk.map(async (idx) => {
          const file = files[idx];
          const input = `in_${idx}_${file.name}`;
          const output = `out_${idx}.mp4`;
          const data = await withErrorHandling(() => fetchFile(file), { toast: `Failed to read ${file.name}`, log: true });
          if (!data) throw new Error(`Failed to read ${file.name}`);
          await ff.writeFile(input, data);
          const duration = await getVideoDuration(ff, input);
          const bitrate = Math.floor((maxSizeKb * 8) / duration);
          const safeBitrate = Math.max(100, Math.min(bitrate, 10000));
          await ff.exec(['-i', input, '-c:v', 'libx264', '-b:v', `${safeBitrate}k`, '-preset', 'medium', '-c:a', 'aac', '-b:a', '64k', '-y', output]);
          const outData = await ff.readFile(output);
          await ff.deleteFile(input); await ff.deleteFile(output);
          return { name: file.name.replace(/\.[^.]+$/, '-reduced.mp4'), blob: new Blob([outData as BlobPart], { type: 'video/mp4' }) };
        }));
        chunkResults.forEach(r => { if (r.status === 'fulfilled') results.push(r.value); });
      }
      setProcessedBlobs(results);
      toast.success(`Reduced ${results.length}/${files.length} videos`);
    } catch (err) {
      const errMsg = err instanceof DOMException && err.name === 'AbortError'
        ? 'Processing cancelled'
        : 'Browser memory limit reached. Try smaller batches or close other tabs.';
      toast.error(errMsg);
    } finally {
      setIsProcessing(false); setProgress(0);
    }
  };

  const getVideoDuration = async (ff: Awaited<import('@ffmpeg/ffmpeg').FFmpeg>, input: string): Promise<number> => {
    try {
      await ff.exec(['-i', input, '-f', 'null', '-']);
      return 30;
    } catch { return 30; }
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    processedBlobs.forEach(({ name, blob }) => zip.file(name, blob));
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a'); a.href = url; a.download = 'reduced-videos.zip'; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadEach = () => {
    processedBlobs.forEach(({ name, blob }) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = name; a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-[var(--radius-lg)] text-xs text-emerald-700 dark:text-emerald-300">
        <Film className="w-4 h-4 inline mr-1.5" />
        <strong>Target-size encoding:</strong> FFmpeg adjusts bitrate to hit your desired file size per video.
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-6 sm:p-8 space-y-6">
        <div onClick={() => fileRef.current?.click()} className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-[var(--border-subtle)] rounded-[var(--radius-xl)] cursor-pointer hover:border-[var(--accent)]/50 transition-colors bg-[var(--bg-overlay)]">
          <Upload className="w-10 h-10 text-[var(--text-muted)] mb-3" />
          <p className="text-sm text-[var(--text-primary)] font-medium">Upload videos</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Each video will be compressed to fit your target size</p>
          <input ref={fileRef} type="file" accept="video/*" multiple onChange={handleFiles} className="hidden" />
        </div>
        {files.length > 0 && (
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-[var(--bg-overlay)] rounded-[var(--radius-md)] group">
                <Film className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                <span className="text-sm text-[var(--text-primary)] truncate flex-1">{f.name}</span>
                <span className="text-xs text-[var(--text-muted)] font-mono">{(f.size / 1024 / 1024).toFixed(1)}MB</span>
              </div>
            ))}
          </div>
        )}
        <div className="p-4 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)]">
          <div className="flex items-center gap-2 mb-3"><Settings2 className="w-4 h-4 text-[var(--text-muted)]" /><span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Target Size</span></div>
          <select value={targetSize} onChange={e => setTargetSize(e.target.value)} className="w-full p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]">
            <option value="10">~10 MB per video (email)</option>
            <option value="25">~25 MB per video (social media)</option>
            <option value="50">~50 MB per video (web, default)</option>
            <option value="100">~100 MB per video (high quality)</option>
          </select>
        </div>
        {!ffmpegLoaded && files.length > 0 && (
          <button onClick={loadFfmpeg} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-zinc-700 text-white font-medium rounded-[var(--radius-lg)] hover:bg-zinc-600 transition-all">
            <Loader2 className="w-4 h-4" /> Load FFmpeg Engine (~30MB)
          </button>
        )}
        {ffmpegLoaded && (
          <button onClick={handleProcess} disabled={isProcessing} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent)] text-white font-medium rounded-[var(--radius-lg)] hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-all">
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
            {isProcessing ? `Reducing... ${progress}%` : `Reduce ${files.length} video(s) to ~${targetSize}MB each`}
          </button>
        )}
        {isProcessing && (
          <div className="h-2 w-full bg-[var(--bg-overlay)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--accent)] rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
        {processedBlobs.length > 0 && !isProcessing && (
          <ProDownloadButton fileCount={processedBlobs.length} onDownloadAll={downloadAll} onDownloadEach={downloadEach} />
        )}
      </div>
    </div>
  );
}

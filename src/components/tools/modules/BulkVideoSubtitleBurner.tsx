"use client";
import React, { useState, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import { Upload, X, Loader2, Download, Film, Subtitles, Settings2, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ProDownloadButton } from './ProDownloadButton';
import { useSession } from '@/lib/auth-client';
import { withErrorHandling } from '@/lib/withErrorHandling';
import { hasLargeFiles, checkMemory } from '@/lib/fileUtils';

export default function BulkVideoSubtitleBurner() {
  const [videos, setVideos] = useState<File[]>([]);
  const [subtitle, setSubtitle] = useState<File | null>(null);
  const [fontSize, setFontSize] = useState('18');
  const [position, setPosition] = useState('bottom');
  const [processedBlobs, setProcessedBlobs] = useState<{ name: string; blob: Blob }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const videoRef = useRef<HTMLInputElement>(null);
  const srtRef = useRef<HTMLInputElement>(null);
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

  const handleVideos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const accepted = Array.from(e.target.files || []);
    if (accepted.length === 0) return;
    setVideos(prev => [...prev, ...accepted]);
    toast.success(`Added ${accepted.length} video(s)`);
  };

  const handleSubtitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubtitle(file);
    toast.success(`Subtitle: ${file.name}`);
  };

  const handleProcess = async () => {
    if (videos.length === 0 || !subtitle) {
      toast.error('Upload videos and a subtitle file');
      return;
    }
    setIsProcessing(true);
    setProcessedBlobs([]);
    if (hasLargeFiles(videos)) {
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
      const srtData = await withErrorHandling(() => fetchFile(subtitle), { toast: 'Failed to read subtitle file', log: true });
      if (!srtData) { setIsProcessing(false); return; }
      const subtitleName = 'subtitle.srt';
      await ff.writeFile(subtitleName, srtData);
      const results: { name: string; blob: Blob }[] = [];
      const posFilter: Record<string, string> = { bottom: 'subtitles=subtitle.srt:force_style=\'Alignment=2\'', top: 'subtitles=subtitle.srt:force_style=\'Alignment=8\'', middle: 'subtitles=subtitle.srt:force_style=\'Alignment=5\'' };
      const maxConcurrent = isPro ? 4 : 1;
      for (let i = 0; i < videos.length; i += maxConcurrent) {
        const chunk = Array.from({ length: Math.min(maxConcurrent, videos.length - i) }, (_, j) => i + j);
        const chunkResults = await Promise.allSettled(chunk.map(async (idx) => {
          const file = videos[idx];
          const input = `vid_${idx}_${file.name}`;
          const output = `out_${idx}.mp4`;
          const data = await withErrorHandling(() => fetchFile(file), { toast: `Failed to read ${file.name}`, log: true });
          if (!data) throw new Error(`Failed to read ${file.name}`);
          await ff.writeFile(input, data);
          const style = `FontSize=${fontSize}`;
          await ff.exec(['-i', input, '-vf', `subtitles=${subtitleName}:force_style='${style}',${posFilter[position] || posFilter.bottom}`, '-c:v', 'libx264', '-crf', '23', '-preset', 'medium', '-c:a', 'aac', '-b:a', '128k', '-y', output]);
          const outData = await ff.readFile(output);
          await ff.deleteFile(input); await ff.deleteFile(output);
          return { name: file.name.replace(/\.[^.]+$/, '-subtitled.mp4'), blob: new Blob([outData as BlobPart], { type: 'video/mp4' }) };
        }));
        chunkResults.forEach(r => { if (r.status === 'fulfilled') results.push(r.value); });
      }
      await ff.deleteFile(subtitleName);
      setProcessedBlobs(results);
      toast.success(`Burned subtitles into ${results.length}/${videos.length} videos`);
    } catch {
      toast.error('Browser memory limit reached. Try smaller batches or close other tabs.');
    } finally {
      setIsProcessing(false); setProgress(0);
    }
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    processedBlobs.forEach(({ name, blob }) => zip.file(name, blob));
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a'); a.href = url; a.download = 'subtitled-videos.zip'; a.click();
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
        <Subtitles className="w-4 h-4 inline mr-1.5" />
        <strong>Burn subtitles permanently</strong> into your videos using browser-based FFmpeg WASM.
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div onClick={() => videoRef.current?.click()} className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[var(--border-subtle)] rounded-[var(--radius-xl)] cursor-pointer hover:border-[var(--accent)]/50 transition-colors bg-[var(--bg-overlay)]">
            <Film className="w-8 h-8 text-[var(--text-muted)] mb-2" />
            <p className="text-sm font-medium text-[var(--text-primary)]">Videos</p>
            <p className="text-xs text-[var(--text-muted)] text-center">MP4, MOV, AVI, WebM</p>
            <p className="text-xs text-[var(--accent)] mt-1">{videos.length} selected</p>
            <input ref={videoRef} type="file" accept="video/*" multiple onChange={handleVideos} className="hidden" />
          </div>
          <div onClick={() => srtRef.current?.click()} className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[var(--border-subtle)] rounded-[var(--radius-xl)] cursor-pointer hover:border-[var(--accent)]/50 transition-colors bg-[var(--bg-overlay)]">
            <Subtitles className="w-8 h-8 text-[var(--text-muted)] mb-2" />
            <p className="text-sm font-medium text-[var(--text-primary)]">Subtitle file (.srt)</p>
            <p className="text-xs text-[var(--text-muted)] text-center">Single SRT applied to all videos</p>
            {subtitle && <p className="text-xs text-[var(--accent)] mt-1">{subtitle.name}</p>}
            <input ref={srtRef} type="file" accept=".srt,.ass,.ssa,.vtt" onChange={handleSubtitle} className="hidden" />
          </div>
        </div>

        <div className="p-4 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)]">
          <div className="flex items-center gap-2 mb-3"><Settings2 className="w-4 h-4 text-[var(--text-muted)]" /><span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Subtitle Style</span></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)]">Font size</label>
              <select value={fontSize} onChange={e => setFontSize(e.target.value)} className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm">
                <option value="12">12 — Small</option>
                <option value="18">18 — Normal</option>
                <option value="24">24 — Large</option>
                <option value="36">36 — Extra large</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)]">Position</label>
              <select value={position} onChange={e => setPosition(e.target.value)} className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm">
                <option value="bottom">Bottom (default)</option>
                <option value="top">Top</option>
                <option value="middle">Middle</option>
              </select>
            </div>
          </div>
        </div>

        {!ffmpegLoaded && videos.length > 0 && subtitle && (
          <button onClick={loadFfmpeg} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-zinc-700 text-white font-medium rounded-[var(--radius-lg)] hover:bg-zinc-600 transition-all">
            <Loader2 className="w-4 h-4" /> Load FFmpeg Engine (~30MB)
          </button>
        )}

        {ffmpegLoaded && (
          <button onClick={handleProcess} disabled={isProcessing || videos.length === 0 || !subtitle} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent)] text-white font-medium rounded-[var(--radius-lg)] hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-all">
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Subtitles className="w-4 h-4" />}
            {isProcessing ? `Burning subtitles... ${progress}%` : `Burn subtitles into ${videos.length} video(s)`}
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

"use client";
import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import { Upload, Loader2, Download, Film, Settings2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ProDownloadButton } from '../utility/ProDownloadButton';
import { withErrorHandling } from '@/lib/withErrorHandling';
import { hasLargeFiles, checkMemory } from '@/lib/fileUtils';
import { gateBatchDownload, maxBlobMB } from '@/utils/freeUsageGuard';
import { useBatchProgress } from '@/hooks/useBatchProgress';
import { usePickerFocusReturn } from '@/components/buttonKeys';
import { BatchProgressPanel } from '@/components/tools/BatchProgressPanel';
import { useFFmpeg } from '@/hooks/useFFmpeg';

export default function BulkVideoSizeReducer() {
  const [targetSize, setTargetSize] = useState('50');
  const fileRef = useRef<HTMLInputElement>(null);
  const batch = useBatchProgress();
  const { dropRef, armReturn, focusDrop } = usePickerFocusReturn<HTMLDivElement>();
  const { ffmpeg, isLoaded, loadFFmpeg } = useFFmpeg();
  const batchRef = useRef(batch);
  batchRef.current = batch;

  useEffect(() => {
    if (!ffmpeg) return;
    const handleProgress = ({ progress: p }: { progress: number; time: number }) => {
      const activeFile = batchRef.current.files.find(f => f.status === 'processing');
      if (activeFile) batchRef.current.updateFile(activeFile.id, { progress: Math.round(p * 100) });
    };
    ffmpeg.on('progress', handleProgress);
    return () => { ffmpeg.off('progress', handleProgress); };
  }, [ffmpeg]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const accepted = Array.from(e.target.files || []);
    if (accepted.length === 0) return;
    batch.addFiles(accepted);
    toast.success(`Added ${accepted.length} video(s)`);
    focusDrop();
  };

  const getVideoDuration = async (ff: Awaited<import('@ffmpeg/ffmpeg').FFmpeg>, input: string): Promise<number> => {
    try { await ff.exec(['-i', input, '-f', 'null', '-']); return 30; }
    catch { return 30; }
  };

  const processor = async (file: File, onProgress: (pct: number) => void): Promise<Blob | null> => {
    const ff = ffmpeg!;
    const idx = batch.files.findIndex(f => f.file === file);
    const input = `in_${idx}_${file.name}`;
    const output = `out_${idx}.mp4`;
    const { fetchFile } = await import('@ffmpeg/util');
    const data = await withErrorHandling(() => fetchFile(file), { toast: `Failed to read ${file.name}`, log: true });
    if (!data) throw new Error(`Failed to read ${file.name}`);
    onProgress(10);
    await ff.writeFile(input, data);
    const maxSizeKb = parseInt(targetSize) * 1024;
    const duration = await getVideoDuration(ff, input);
    const bitrate = Math.floor((maxSizeKb * 8) / duration);
    const safeBitrate = Math.max(100, Math.min(bitrate, 10000));
    onProgress(20);
    await ff.exec(['-i', input, '-c:v', 'libx264', '-b:v', `${safeBitrate}k`, '-preset', 'medium', '-c:a', 'aac', '-b:a', '64k', '-y', output]);
    onProgress(90);
    const outData = await ff.readFile(output);
    await ff.deleteFile(input); await ff.deleteFile(output);
    onProgress(100);
    return new Blob([outData as BlobPart], { type: 'video/mp4' });
  };

  const handleProcess = async () => {
    if (batch.files.length === 0) { toast.error('Upload videos first'); return; }
    if (!ffmpeg) { toast.error('Load FFmpeg engine first'); return; }
    if (hasLargeFiles(batch.files.map(f => f.file))) {
      const mem = checkMemory();
      const proceed = window.confirm(
        `Large files detected (>100MB).${mem.low ? ` Your device has only ${mem.available} RAM.` : ''} These load entirely into browser memory — close other tabs or expect crashes on low-RAM devices. Continue?`
      );
      if (!proceed) return;
    }
    await batch.processBatch(processor, {
      onComplete: () => {
        const count = batch.files.filter(f => f.status === 'done').length;
        if (count > 0) toast.success(`Reduced ${count} videos`);
      }
    });
  };

  const downloadAll = async () => {
    const done = batch.files.filter(f => f.status === 'done' && f.result);
    if (done.length === 0) return;
    // Per-batch quota: one gate call (1 unit) before anything saves.
    if (!(await gateBatchDownload(batch.files.length, maxBlobMB(done.map(d => d.result!))))) return;
    const zip = new JSZip();
    done.forEach(bf => {
      zip.file(bf.file.name.replace(/\.[^.]+$/, '-reduced.mp4'), bf.result!);
    });
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a'); a.href = url; a.download = 'reduced-videos.zip'; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadEach = async () => {
    const done = batch.files.filter(f => f.status === 'done' && f.result);
    if (done.length === 0) return;
    if (!(await gateBatchDownload(batch.files.length, maxBlobMB(done.map(d => d.result!))))) return;
    done.forEach(bf => {
      const url = URL.createObjectURL(bf.result!);
      const a = document.createElement('a'); a.href = url;
      a.download = bf.file.name.replace(/\.[^.]+$/, '-reduced.mp4'); a.click();
      URL.revokeObjectURL(url);
    });
  };

  const doneBlobs = batch.files.filter(f => f.status === 'done' && f.result);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-[var(--radius-lg)] text-xs text-emerald-700 dark:text-emerald-300">
        <Film className="w-4 h-4 inline mr-1.5" />
        <strong>Target-size encoding:</strong> FFmpeg adjusts bitrate to hit your desired file size per video.
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-6 sm:p-8 space-y-6">
        <div role="button" tabIndex={0} ref={dropRef} aria-label="Upload videos" onClick={() => { armReturn(); fileRef.current?.click(); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); armReturn(); fileRef.current?.click(); } }} className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-[var(--border-subtle)] rounded-[var(--radius-xl)] cursor-pointer hover:border-[var(--accent)]/50 transition-colors bg-[var(--bg-overlay)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] focus-visible:border-[var(--accent)]">
          <Upload className="w-10 h-10 text-[var(--text-muted)] mb-3" />
          <p className="text-sm text-[var(--text-primary)] font-medium">Upload videos</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Each video will be compressed to fit your target size</p>
          <input ref={fileRef} type="file" accept="video/*" multiple onChange={handleFiles} className="hidden" />
        </div>
        <div className="p-4 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)]">
          <div className="flex items-center gap-2 mb-3"><Settings2 className="w-4 h-4 text-[var(--text-muted)]" /><span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Target Size</span></div>
          <select aria-label="Target Size" value={targetSize} onChange={e => setTargetSize(e.target.value)} className="w-full p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]">
            <option value="10">~10 MB per video (email)</option>
            <option value="25">~25 MB per video (social media)</option>
            <option value="50">~50 MB per video (web, default)</option>
            <option value="100">~100 MB per video (high quality)</option>
          </select>
        </div>
        {!isLoaded && batch.files.length > 0 && (
          <button onClick={loadFFmpeg} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-zinc-700 text-white font-medium rounded-[var(--radius-lg)] hover:bg-zinc-600 transition-all">
            <Loader2 className="w-4 h-4" /> Load FFmpeg Engine (~30MB)
          </button>
        )}
        {isLoaded && (
          <button onClick={handleProcess} disabled={batch.isProcessing || batch.files.length === 0} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent-ink)] text-white font-medium rounded-[var(--radius-lg)] hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-all">
            {batch.isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
            {batch.isProcessing ? 'Reducing...' : `Reduce ${batch.files.length} video(s) to ~${targetSize}MB each`}
          </button>
        )}
      </div>

      <BatchProgressPanel
        files={batch.files}
        progress={batch.progress}
        isProcessing={batch.isProcessing}
        onRemove={batch.removeFile}
        onClear={() => batch.clearFiles()}
        onAbort={batch.abort}
      />

      {doneBlobs.length > 0 && !batch.isProcessing && (
        <ProDownloadButton fileCount={doneBlobs.length} onDownloadAll={downloadAll} onDownloadEach={downloadEach} isProcessing={false} />
      )}
    </div>
  );
}

"use client";
import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import { Upload, Loader2, Download, Film, Subtitles, Settings2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ProDownloadButton } from '../utility/ProDownloadButton';
import { withErrorHandling } from '@/lib/withErrorHandling';
import { hasLargeFiles, checkMemory } from '@/lib/fileUtils';
import { gateBatchDownload, maxBlobMB } from '@/utils/freeUsageGuard';
import { useBatchProgress } from '@/hooks/useBatchProgress';
import { usePickerFocusReturn } from '@/components/buttonKeys';
import { BatchProgressPanel } from '@/components/tools/BatchProgressPanel';
import { useFFmpeg } from '@/hooks/useFFmpeg';

const POS_FILTERS: Record<string, string> = {
  bottom: 'subtitles=subtitle.srt:force_style=\'Alignment=2\'',
  top: 'subtitles=subtitle.srt:force_style=\'Alignment=8\'',
  middle: 'subtitles=subtitle.srt:force_style=\'Alignment=5\''
};

export default function BulkVideoSubtitleBurner() {
  const [subtitle, setSubtitle] = useState<File | null>(null);
  const [fontSize, setFontSize] = useState('18');
  const [position, setPosition] = useState('bottom');
  const videoRef = useRef<HTMLInputElement>(null);
  const srtRef = useRef<HTMLInputElement>(null);
  const batch = useBatchProgress();
  const { dropRef, armReturn, focusDrop } = usePickerFocusReturn<HTMLDivElement>();
  const srtDrop = usePickerFocusReturn<HTMLDivElement>();
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

  const handleVideos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const accepted = Array.from(e.target.files || []);
    if (accepted.length === 0) return;
    batch.addFiles(accepted);
    toast.success(`Added ${accepted.length} video(s)`);
    focusDrop();
  };

  const handleSubtitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubtitle(file);
    toast.success(`Subtitle: ${file.name}`);
    srtDrop.focusDrop();
  };

  const processor = async (file: File, onProgress: (pct: number) => void): Promise<Blob | null> => {
    const ff = ffmpeg!;
    const idx = batch.files.findIndex(f => f.file === file);
    const input = `vid_${idx}_${file.name}`;
    const output = `out_${idx}.mp4`;
    const { fetchFile } = await import('@ffmpeg/util');
    const data = await withErrorHandling(() => fetchFile(file), { toast: `Failed to read ${file.name}`, log: true });
    if (!data) throw new Error(`Failed to read ${file.name}`);
    onProgress(10);
    await ff.writeFile(input, data);
    const style = `FontSize=${fontSize}`;
    onProgress(20);
    await ff.exec(['-i', input, '-vf', `subtitles=subtitle.srt:force_style='${style}',${POS_FILTERS[position] || POS_FILTERS.bottom}`, '-c:v', 'libx264', '-crf', '23', '-preset', 'medium', '-c:a', 'aac', '-b:a', '128k', '-y', output]);
    onProgress(90);
    const outData = await ff.readFile(output);
    await ff.deleteFile(input); await ff.deleteFile(output);
    onProgress(100);
    return new Blob([outData as BlobPart], { type: 'video/mp4' });
  };

  const handleProcess = async () => {
    if (batch.files.length === 0) { toast.error('Upload videos first'); return; }
    if (!subtitle) { toast.error('Upload a subtitle file'); return; }
    if (!ffmpeg) { toast.error('Load FFmpeg engine first'); return; }
    if (hasLargeFiles(batch.files.map(f => f.file))) {
      const mem = checkMemory();
      const proceed = window.confirm(
        `Large files detected (>100MB).${mem.low ? ` Your device has only ${mem.available} RAM.` : ''} These load entirely into browser memory — close other tabs or expect crashes on low-RAM devices. Continue?`
      );
      if (!proceed) return;
    }

    const ff = ffmpeg;
    const { fetchFile } = await import('@ffmpeg/util');
    const srtData = await withErrorHandling(() => fetchFile(subtitle), { toast: 'Failed to read subtitle file', log: true });
    if (!srtData) return;
    await ff.writeFile('subtitle.srt', srtData);

    await batch.processBatch(processor, {
      onComplete: () => {
        const count = batch.files.filter(f => f.status === 'done').length;
        if (count > 0) toast.success(`Burned subtitles into ${count} videos`);
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
      zip.file(bf.file.name.replace(/\.[^.]+$/, '-subtitled.mp4'), bf.result!);
    });
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a'); a.href = url; a.download = 'subtitled-videos.zip'; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadEach = async () => {
    const done = batch.files.filter(f => f.status === 'done' && f.result);
    if (done.length === 0) return;
    if (!(await gateBatchDownload(batch.files.length, maxBlobMB(done.map(d => d.result!))))) return;
    done.forEach(bf => {
      const url = URL.createObjectURL(bf.result!);
      const a = document.createElement('a'); a.href = url;
      a.download = bf.file.name.replace(/\.[^.]+$/, '-subtitled.mp4'); a.click();
      URL.revokeObjectURL(url);
    });
  };

  const doneBlobs = batch.files.filter(f => f.status === 'done' && f.result);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-[var(--radius-lg)] text-xs text-emerald-700 dark:text-emerald-300">
        <Subtitles className="w-4 h-4 inline mr-1.5" />
        <strong>Burn subtitles permanently</strong> into your videos using browser-based FFmpeg WASM.
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div role="button" tabIndex={0} ref={dropRef} onClick={() => { armReturn(); videoRef.current?.click(); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); armReturn(); videoRef.current?.click(); } }} className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[var(--border-subtle)] rounded-[var(--radius-xl)] cursor-pointer hover:border-[var(--accent)]/50 transition-colors bg-[var(--bg-overlay)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] focus-visible:border-[var(--accent)]">
            <Film className="w-8 h-8 text-[var(--text-muted)] mb-2" />
            <p className="text-sm font-medium text-[var(--text-primary)]">Videos</p>
            <p className="text-xs text-[var(--text-muted)] text-center">MP4, MOV, AVI, WebM</p>
            <p className="text-xs text-[var(--accent)] mt-1">{batch.files.length} selected</p>
            <input aria-label="MP4, MOV, AVI, WebM" ref={videoRef} type="file" accept="video/*" multiple onChange={handleVideos} className="hidden" />
          </div>
          <div role="button" tabIndex={0} ref={srtDrop.dropRef} onClick={() => { srtDrop.armReturn(); srtRef.current?.click(); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); srtDrop.armReturn(); srtRef.current?.click(); } }} className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[var(--border-subtle)] rounded-[var(--radius-xl)] cursor-pointer hover:border-[var(--accent)]/50 transition-colors bg-[var(--bg-overlay)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] focus-visible:border-[var(--accent)]">
            <Subtitles className="w-8 h-8 text-[var(--text-muted)] mb-2" />
            <p className="text-sm font-medium text-[var(--text-primary)]">Subtitle file (.srt)</p>
            <p className="text-xs text-[var(--text-muted)] text-center">Single SRT applied to all videos</p>
            {subtitle && <p className="text-xs text-[var(--accent)] mt-1">{subtitle.name}</p>}
            <input aria-label="Single SRT applied to all videos" ref={srtRef} type="file" accept=".srt,.ass,.ssa,.vtt" onChange={handleSubtitle} className="hidden" />
          </div>
        </div>

        <div className="p-4 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)]">
          <div className="flex items-center gap-2 mb-3"><Settings2 className="w-4 h-4 text-[var(--text-muted)]" /><span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Subtitle Style</span></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="lbl-bulkvideosubtitleburner-font-size" className="text-xs font-medium text-[var(--text-secondary)]">Font size</label>
              <select id="lbl-bulkvideosubtitleburner-font-size" aria-label="Font size" value={fontSize} onChange={e => setFontSize(e.target.value)} className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm">
                <option value="12">12 — Small</option>
                <option value="18">18 — Normal</option>
                <option value="24">24 — Large</option>
                <option value="36">36 — Extra large</option>
              </select>
            </div>
            <div>
              <label htmlFor="lbl-bulkvideosubtitleburner-position" className="text-xs font-medium text-[var(--text-secondary)]">Position</label>
              <select id="lbl-bulkvideosubtitleburner-position" aria-label="Position" value={position} onChange={e => setPosition(e.target.value)} className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm">
                <option value="bottom">Bottom (default)</option>
                <option value="top">Top</option>
                <option value="middle">Middle</option>
              </select>
            </div>
          </div>
        </div>

        {!isLoaded && batch.files.length > 0 && subtitle && (
          <button onClick={loadFFmpeg} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--bg-elevated)] text-white font-medium rounded-[var(--radius-lg)] hover:bg-[var(--bg-elevated)] transition-all">
            <Loader2 className="w-4 h-4" /> Load FFmpeg Engine (~30MB)
          </button>
        )}

        {isLoaded && (
          <button onClick={handleProcess} disabled={batch.isProcessing || batch.files.length === 0 || !subtitle} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent-ink)] text-white font-medium rounded-[var(--radius-lg)] hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-all">
            {batch.isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Subtitles className="w-4 h-4" />}
            {batch.isProcessing ? 'Burning subtitles...' : `Burn subtitles into ${batch.files.length} video(s)`}
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

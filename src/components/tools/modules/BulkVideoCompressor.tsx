"use client";
import React, { useState, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import { Upload, Loader2, Download, Film, Settings2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ProDownloadButton } from './ProDownloadButton';
import { withErrorHandling } from '@/lib/withErrorHandling';
import { hasLargeFiles, checkMemory } from '@/lib/fileUtils';
import { useBatchProgress } from '@/hooks/useBatchProgress';
import { BatchProgressPanel } from '@/components/tools/BatchProgressPanel';

const CRF_OPTIONS = [
  { value: '23', label: '23 — Good quality (default)' },
  { value: '28', label: '28 — Smaller file' },
  { value: '18', label: '18 — High quality' },
  { value: '35', label: '35 — Maximum compression' },
];

export default function BulkVideoCompressor() {
  const [crf, setCrf] = useState('23');
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const ffRef = useRef<Awaited<import('@ffmpeg/ffmpeg').FFmpeg> | null>(null);
  const batch = useBatchProgress();

  const loadFfmpeg = useCallback(async () => {
    if (ffRef.current) return ffRef.current;
    const { FFmpeg } = await import('@ffmpeg/ffmpeg');
    const { fetchFile } = await import('@ffmpeg/util');
    const ff = new FFmpeg();
    ff.on('progress', ({ progress: p }) => {
      const activeFile = batch.files.find(f => f.status === 'processing');
      if (activeFile) batch.updateFile(activeFile.id, { progress: Math.round(p * 100) });
    });
    await ff.load();
    ffRef.current = ff;
    setFfmpegLoaded(true);
    toast.success('FFmpeg loaded');
    return ff;
  }, [batch.files, batch.updateFile]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const accepted = Array.from(e.target.files || []);
    if (accepted.length === 0) return;
    batch.addFiles(accepted);
    toast.success(`Added ${accepted.length} video(s)`);
  };

  const processor = async (file: File, onProgress: (pct: number) => void): Promise<Blob | null> => {
    const ff = ffRef.current!;
    const idx = batch.files.findIndex(f => f.file === file);
    const input = `input_${idx}_${file.name}`;
    const output = `output_${idx}.mp4`;
    const { fetchFile } = await import('@ffmpeg/util');
    const data = await withErrorHandling(() => fetchFile(file), { toast: `Failed to read ${file.name}`, log: true });
    if (!data) throw new Error(`Failed to read ${file.name}`);
    onProgress(10);
    await ff.writeFile(input, data);
    onProgress(20);
    await ff.exec(['-i', input, '-vcodec', 'libx264', '-crf', crf, '-preset', 'medium', '-acodec', 'aac', '-b:a', '128k', '-y', output]);
    onProgress(90);
    const outData = await ff.readFile(output);
    await ff.deleteFile(input);
    await ff.deleteFile(output);
    onProgress(100);
    return new Blob([outData as BlobPart], { type: 'video/mp4' });
  };

  const handleProcess = async () => {
    if (batch.files.length === 0) { toast.error('Upload videos first'); return; }
    if (!ffRef.current) {
      toast.error('Load FFmpeg engine first');
      return;
    }
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
        if (count > 0) toast.success(`Compressed ${count} videos`);
      }
    });
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    batch.files.filter(f => f.status === 'done' && f.result).forEach(bf => {
      zip.file(bf.file.name.replace(/\.[^.]+$/, '-compressed.mp4'), bf.result!);
    });
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a'); a.href = url; a.download = 'compressed-videos.zip'; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadEach = () => {
    batch.files.filter(f => f.status === 'done' && f.result).forEach(bf => {
      const url = URL.createObjectURL(bf.result!);
      const a = document.createElement('a'); a.href = url;
      a.download = bf.file.name.replace(/\.[^.]+$/, '-compressed.mp4'); a.click();
      URL.revokeObjectURL(url);
    });
  };

  const doneBlobs = batch.files.filter(f => f.status === 'done' && f.result);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-[var(--radius-lg)] text-xs text-emerald-700 dark:text-emerald-300">
        <Film className="w-4 h-4 inline mr-1.5" />
        <strong>Browser-powered:</strong> FFmpeg WASM compresses videos locally. First load downloads ~30MB engine.
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-6 sm:p-8 space-y-6">
        <div onClick={() => fileRef.current?.click()} className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-[var(--border-subtle)] rounded-[var(--radius-xl)] cursor-pointer hover:border-[var(--accent)]/50 transition-colors bg-[var(--bg-overlay)]">
          <Upload className="w-10 h-10 text-[var(--text-muted)] mb-3" />
          <p className="text-sm text-[var(--text-primary)] font-medium">Upload videos (MP4, MOV, AVI, WebM, MKV)</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Processed with H.264 + AAC at selected CRF</p>
          <input ref={fileRef} type="file" accept="video/*" multiple onChange={handleFiles} className="hidden" />
        </div>

        <div className="p-4 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)]">
          <div className="flex items-center gap-2 mb-3"><Settings2 className="w-4 h-4 text-[var(--text-muted)]" /><span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Compression Settings</span></div>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)]">CRF (Constant Rate Factor)</label>
              <select value={crf} onChange={e => setCrf(e.target.value)} className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]">
                {CRF_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <p className="text-xs text-[var(--text-muted)] mt-1">Lower CRF = higher quality, larger file. 23 is a good balance.</p>
            </div>
          </div>
        </div>

        {!ffmpegLoaded && batch.files.length > 0 && (
          <button onClick={loadFfmpeg} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-zinc-700 text-white font-medium rounded-[var(--radius-lg)] hover:bg-zinc-600 transition-all">
            <Loader2 className="w-4 h-4" /> Load FFmpeg Engine (~30MB)
          </button>
        )}

        {ffmpegLoaded && (
          <button onClick={handleProcess} disabled={batch.isProcessing || batch.files.length === 0} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent)] text-white font-medium rounded-[var(--radius-lg)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {batch.isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
            {batch.isProcessing ? 'Compressing...' : `Compress ${batch.files.length} video(s)`}
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

"use client";
import React, { useState, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import { Upload, X, Loader2, Download, Film, Settings2, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ProDownloadButton } from './ProDownloadButton';
import { useSession } from '@/lib/auth-client';
import { withErrorHandling } from '@/lib/withErrorHandling';
import { hasLargeFiles, checkMemory } from '@/lib/fileUtils';

const CRF_OPTIONS = [
  { value: '23', label: '23 — Good quality (default)' },
  { value: '28', label: '28 — Smaller file' },
  { value: '18', label: '18 — High quality' },
  { value: '35', label: '35 — Maximum compression' },
];

export default function BulkVideoCompressor() {
  const [files, setFiles] = useState<File[]>([]);
  const [crf, setCrf] = useState('23');
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
    const { fetchFile } = await import('@ffmpeg/util');
    const ff = new FFmpeg();
    ff.on('progress', ({ progress: p }) => setProgress(Math.round(p * 100)));
    await ff.load();
    ffRef.current = ff;
    setFfmpegLoaded(true);
    toast.success('FFmpeg loaded');
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
      const maxConcurrent = isPro ? 4 : 1;
      const chunks: number[][] = [];
      for (let i = 0; i < files.length; i += maxConcurrent) {
        chunks.push(Array.from({ length: Math.min(maxConcurrent, files.length - i) }, (_, j) => i + j));
      }
      for (const chunk of chunks) {
        const chunkResults = await Promise.allSettled(chunk.map(async (idx) => {
          const file = files[idx];
          const input = `input_${idx}_${file.name}`;
          const output = `output_${idx}.mp4`;
          const data = await withErrorHandling(() => fetchFile(file), { toast: `Failed to read ${file.name}`, log: true });
          if (!data) throw new Error(`Failed to read ${file.name}`);
          await ff.writeFile(input, data);
          await ff.exec(['-i', input, '-vcodec', 'libx264', '-crf', crf, '-preset', 'medium', '-acodec', 'aac', '-b:a', '128k', '-y', output]);
          const outData = await ff.readFile(output);
          await ff.deleteFile(input);
          await ff.deleteFile(output);
          return { name: file.name.replace(/\.[^.]+$/, '-compressed.mp4'), blob: new Blob([outData as BlobPart], { type: 'video/mp4' }) };
        }));
        chunkResults.forEach(r => { if (r.status === 'fulfilled') results.push(r.value); });
      }
      setProcessedBlobs(results);
      toast.success(`Compressed ${results.length}/${files.length} videos`);
    } catch (err) {
      const errMsg = err instanceof DOMException && err.name === 'AbortError'
        ? 'Processing cancelled'
        : 'Browser memory limit reached. Try smaller batches or close other tabs.';
      toast.error(errMsg);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    processedBlobs.forEach(({ name, blob }) => zip.file(name, blob));
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a'); a.href = url; a.download = 'compressed-videos.zip'; a.click();
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
        <strong>Browser-powered:</strong> FFmpeg WASM compresses videos locally. First load downloads ~30MB engine.
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-6 sm:p-8 space-y-6">
        <div onClick={() => fileRef.current?.click()} className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-[var(--border-subtle)] rounded-[var(--radius-xl)] cursor-pointer hover:border-[var(--accent)]/50 transition-colors bg-[var(--bg-overlay)]">
          <Upload className="w-10 h-10 text-[var(--text-muted)] mb-3" />
          <p className="text-sm text-[var(--text-primary)] font-medium">Upload videos (MP4, MOV, AVI, WebM, MKV)</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Processed with H.264 + AAC at selected CRF</p>
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

        {!ffmpegLoaded && files.length > 0 && (
          <button onClick={loadFfmpeg} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-zinc-700 text-white font-medium rounded-[var(--radius-lg)] hover:bg-zinc-600 transition-all">
            <Loader2 className="w-4 h-4" /> Load FFmpeg Engine (~30MB)
          </button>
        )}

        {ffmpegLoaded && (
          <button onClick={handleProcess} disabled={isProcessing || files.length === 0} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent)] text-white font-medium rounded-[var(--radius-lg)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
            {isProcessing ? `Compressing... ${progress}%${isPro ? ' (4 parallel)' : ''}` : `Compress ${files.length} video(s)`}
          </button>
        )}

        {isProcessing && (
          <div className="h-2 w-full bg-[var(--bg-overlay)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--accent)] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        )}

        {processedBlobs.length > 0 && !isProcessing && (
          <ProDownloadButton fileCount={processedBlobs.length} onDownloadAll={downloadAll} onDownloadEach={downloadEach} />
        )}
      </div>
    </div>
  );
}

"use client";
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import JSZip from 'jszip';
import { Upload, X, Loader2, Save, FileText, Settings2, Cpu, AlertTriangle, Crown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ProDownloadButton } from './ProDownloadButton';
import { useParallelProcessor } from '@/hooks/useParallelProcessor';
import { useWorkflowPresets } from '@/hooks/useWorkflowPresets';
import { withErrorHandling } from '@/lib/withErrorHandling';
import { hasLargeFiles, checkMemory } from '@/lib/fileUtils';

export interface ProcessedFile {
  name: string;
  blob: Blob;
}

interface BulkToolShellProps {
  toolSlug: string;
  title: string;
  description: string;
  accept?: string;
  maxSizeMB?: number;
  processFile: (file: File, config: Record<string, unknown>, signal: AbortSignal) => Promise<ProcessedFile | null>;
  configFields?: React.ReactNode;
  defaultConfig?: Record<string, unknown>;
}

export function BulkToolShell({
  toolSlug,
  title,
  description,
  accept = '*/*',
  maxSizeMB = 500,
  processFile,
  configFields,
  defaultConfig = {},
}: BulkToolShellProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [config, setConfig] = useState<Record<string, unknown>>(defaultConfig);
  const [processedBlobs, setProcessedBlobs] = useState<ProcessedFile[]>([]);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showLargeFileWarning, setShowLargeFileWarning] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const blobUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const { process, abort, maxConcurrency, isPro } = useParallelProcessor();
  const { presets, savePreset, loadPreset, deletePreset, isPro: canSavePresets } = useWorkflowPresets(toolSlug);

  useEffect(() => {
    if (!isProcessing) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isProcessing]);

  const handleFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const accepted = Array.from(e.target.files || []);
    if (accepted.length === 0) return;
    const valid = accepted.filter(f => f.size <= maxSizeMB * 1024 * 1024);
    if (valid.length !== accepted.length) {
      toast.error(`Some files exceed ${maxSizeMB}MB limit. ${valid.length} of ${accepted.length} accepted.`);
    }
    setFiles(prev => [...prev, ...valid]);
    valid.forEach(f => {
      const url = URL.createObjectURL(f);
      blobUrlsRef.current.push(url);
      setPreviews(prev => [...prev, url]);
    });
    toast.success(`Added ${valid.length} file(s)`);
    if (hasLargeFiles(valid)) {
      setShowLargeFileWarning(true);
      const mem = checkMemory();
      if (mem.low) {
        toast.error(`Low device memory (${mem.available}). Large files may cause crashes. Try smaller batches.`);
      }
    }
  }, [maxSizeMB]);

  const removeFile = useCallback((idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
    setProcessedBlobs([]);
  }, []);

  const handleProcess = useCallback(async () => {
    if (files.length === 0) { toast.error('Upload files first'); return; }
    setIsProcessing(true);
    setProgress({ done: 0, total: files.length });
    try {
      const results = await process<ProcessedFile | null>({
        files,
        processFn: async (file, _idx, signal) => {
          const result = await withErrorHandling(
            () => processFile(file, config, signal),
            { toast: `Failed to process ${file.name}`, log: true }
          );
          setProgress(prev => ({ ...prev, done: prev.done + 1 }));
          return result;
        },
        onProgress: (done, total) => setProgress({ done, total }),
      });
      const valid = results.filter((r): r is ProcessedFile => r !== null && r !== undefined);
      setProcessedBlobs(valid);
      if (valid.length < files.length) {
        toast.error(`${files.length - valid.length} file(s) failed — memory or processing error`);
      } else {
        toast.success(`Processed ${valid.length}/${files.length} files`);
      }
    } catch (err) {
      const message = err instanceof DOMException && err.name === 'AbortError'
        ? 'Processing cancelled'
        : 'Browser memory limit reached. Try smaller batches or close other tabs.';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  }, [files, config, process, processFile]);

  const downloadAll = useCallback(async () => {
    const zip = new JSZip();
    processedBlobs.forEach(({ name, blob }) => zip.file(name, blob));
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${toolSlug}-output.zip`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('ZIP downloaded');
  }, [processedBlobs, toolSlug]);

  const downloadEach = useCallback(() => {
    processedBlobs.forEach(({ name, blob }) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    });
  }, [processedBlobs]);

  const handleSavePreset = useCallback(() => {
    if (!presetName.trim()) { toast.error('Enter a preset name'); return; }
    const saved = savePreset(presetName.trim(), config);
    if (saved) { toast.success(`Preset "${presetName}" saved`); setPresetName(''); setShowPresets(false); }
    else { toast.error('Upgrade to Pro to save presets'); }
  }, [presetName, config, savePreset]);

  const handleLoadPreset = useCallback((id: string) => {
    const saved = loadPreset(id);
    if (saved) { setConfig(saved); toast.success('Preset loaded'); setShowPresets(false); }
  }, [loadPreset]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Enterprise Privacy Notice */}
      <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-[var(--radius-lg)] flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        <span><strong>Zero-trust processing:</strong> All files processed locally in your browser. Nothing uploaded. Corporate IT safe.</span>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{title}</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{description}</p>
          </div>
          <button onClick={() => setShowPresets(!showPresets)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] transition-all" aria-label="Workflow Presets">
            <Save className="w-3.5 h-3.5" /> Presets
          </button>
        </div>

        {/* Presets panel */}
        {showPresets && (
          <div className="p-4 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] space-y-3">
            <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Workflow Presets</h3>
            {presets.length === 0 && <p className="text-xs text-[var(--text-muted)]">No saved presets for this tool.</p>}
            <div className="space-y-1.5">
              {presets.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 bg-[var(--bg-elevated)] rounded-[var(--radius-md)]">
                  <button onClick={() => handleLoadPreset(p.id)} className="text-sm text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">{p.name}</button>
                  <button onClick={() => deletePreset(p.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={presetName} onChange={e => setPresetName(e.target.value)} placeholder="Preset name..." className="flex-1 p-2 text-sm bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]" />
              {canSavePresets ? (
                <button onClick={handleSavePreset} className="px-3 py-2 text-xs font-medium bg-[var(--accent)] text-white rounded-[var(--radius-md)] hover:bg-[var(--accent-hover)] transition-colors">Save</button>
              ) : (
                <Link href="/pricing" className="px-3 py-2 text-xs font-medium bg-amber-500/10 text-amber-500 rounded-[var(--radius-md)] hover:bg-amber-500/20 transition-colors whitespace-nowrap flex items-center gap-1"><Crown className="w-3 h-3" /> Pro</Link>
              )}
            </div>
          </div>
        )}

        {/* Large file warning */}
        {showLargeFileWarning && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-[var(--radius-lg)] flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <strong className="block mb-0.5">Large files detected (&gt;100MB)</strong>
              Files over 100MB load entirely into browser memory. Close other tabs or process in smaller batches to avoid crashes on low-RAM devices.
              <button onClick={() => setShowLargeFileWarning(false)} className="ml-2 underline hover:no-underline">Dismiss</button>
            </div>
          </div>
        )}

        {/* Upload */}
        <div
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-[var(--border-subtle)] rounded-[var(--radius-xl)] cursor-pointer hover:border-[var(--accent)]/50 transition-colors bg-[var(--bg-overlay)] relative"
        >
          <div className="absolute top-3 right-3 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[9px] font-mono uppercase tracking-wider rounded-full border border-emerald-200 dark:border-emerald-800">
            Zero-Trust
          </div>
          <Upload className="w-10 h-10 text-[var(--text-muted)] mb-3" />
          <p className="text-sm text-[var(--text-primary)] font-medium">Drop files here or click to upload</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Max {maxSizeMB}MB per file • {accept === '*/*' ? 'All formats' : accept}</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            Zero-trust: Processing happens in your browser memory. No data leaves your device. Safe for corporate and financial files.
          </p>
          <input ref={fileRef} type="file" accept={accept} multiple onChange={handleFiles} className="hidden" />
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-[var(--bg-overlay)] rounded-[var(--radius-md)] group">
                <FileText className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                <span className="text-sm text-[var(--text-primary)] truncate flex-1">{f.name}</span>
                <span className="text-xs text-[var(--text-muted)] font-mono">{(f.size / 1024 / 1024).toFixed(1)}MB</span>
                <button onClick={() => removeFile(i)} className="opacity-0 group-hover:opacity-100 w-8 h-8 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center hover:bg-red-500/40 transition-all" aria-label={`Remove ${f.name}`}>
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Config fields */}
        {configFields && (
          <div className="p-4 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)]">
            <div className="flex items-center gap-2 mb-3">
              <Settings2 className="w-4 h-4 text-[var(--text-muted)]" />
              <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Configuration</span>
            </div>
            <div onChange={e => {
              const target = e.target as HTMLInputElement | HTMLSelectElement;
              setConfig(prev => ({ ...prev, [target.name]: target.value }));
            }}>
              {configFields}
            </div>
          </div>
        )}

        {/* Processing info */}
        {!isProcessing && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Cpu className="w-3.5 h-3.5" />
            <span>Processing mode: <strong>{isPro ? `Parallel (${maxConcurrency} threads)` : 'Sequential (1 file at a time)'}</strong></span>
            {!isPro && (
              <a href="/pricing" className="text-amber-500 hover:underline ml-auto">Upgrade to Pro for 6× parallel processing</a>
            )}
          </div>
        )}

        {/* Processing speed animation */}
        {isProcessing && !isPro && (
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/40 rounded-[var(--radius-xl)] space-y-2 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-full border-2 border-amber-300 dark:border-amber-600 animate-ping opacity-25" />
                <div className="absolute inset-0 rounded-full border-2 border-amber-400 dark:border-amber-500 animate-spin border-t-transparent" />
                <Cpu className="absolute inset-0 w-4 h-4 m-auto text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                  Processing on Standard Hardware...
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {progress.done}/{progress.total} files completed
                </p>
              </div>
              <a
                href="/pricing"
                className="shrink-0 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-[var(--radius-lg)] transition-all hover:scale-105 shadow-sm"
              >
                ⚡ Upgrade to Pro for 10× faster Multi-Threaded Parallel Processing
              </a>
            </div>
            <div className="h-1.5 w-full bg-amber-200/50 dark:bg-amber-900/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Pro processing */}
        {isProcessing && isPro && (
          <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-[var(--radius-xl)]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                Processing in Parallel ({maxConcurrency} threads)... {progress.done}/{progress.total}
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-emerald-200/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-300" style={{ width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%` }} />
            </div>
          </div>
        )}

        {/* Process button */}
        <button
          onClick={isProcessing ? abort : handleProcess}
          disabled={files.length === 0}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent)] text-white font-medium rounded-[var(--radius-lg)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {isProcessing
            ? `Processing ${progress.done}/${progress.total}...${maxConcurrency > 1 ? ` (${maxConcurrency} parallel)` : ''}`
            : `Process ${files.length} file(s)`}
        </button>

        {/* Download */}
        {processedBlobs.length > 0 && !isProcessing && (
          <ProDownloadButton
            fileCount={processedBlobs.length}
            onDownloadAll={downloadAll}
            onDownloadEach={downloadEach}
          />
        )}
      </div>
    </div>
  );
}

"use client";

import React, { memo } from 'react';
import { Check, X, Loader2, AlertTriangle, FileText } from 'lucide-react';
import type { BatchFile, FileStatus } from '@/hooks/useBatchProgress';

interface BatchProgressPanelProps {
  files: BatchFile[];
  progress: { total: number; completed: number; failed: number; processing: number; percent: number };
  isProcessing: boolean;
  onRemove: (id: string) => void;
  onClear: () => void;
  onAbort?: () => void;
}

const STATUS_ICONS: Record<FileStatus, React.ReactNode> = {
  queued: <FileText className="w-3.5 h-3.5 text-[var(--text-muted)]" />,
  processing: <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />,
  done: <Check className="w-3.5 h-3.5 text-emerald-400" />,
  error: <AlertTriangle className="w-3.5 h-3.5 text-red-400" />,
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const BatchProgressPanel = memo(function BatchProgressPanel({ files, progress, isProcessing, onRemove, onClear, onAbort }: BatchProgressPanelProps) {
  if (files.length === 0) return null;

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Files ({progress.total})
          </span>
          <span className="text-[11px] text-emerald-400">{progress.completed} done</span>
          {progress.failed > 0 && <span className="text-[11px] text-red-400">{progress.failed} failed</span>}
          {progress.processing > 0 && <span className="text-[11px] text-blue-400 animate-pulse">{progress.processing} processing</span>}
        </div>
        <div className="flex gap-2">
          {isProcessing && onAbort && (
            <button onClick={onAbort} className="text-[11px] text-red-400 hover:text-red-300 font-semibold">Stop</button>
          )}
          {!isProcessing && files.some(f => f.status === 'done' || f.status === 'error') && (
            <button onClick={onClear} className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] font-semibold">Clear</button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {progress.total > 0 && (
        <div className="h-1 bg-[var(--border-subtle)]">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      )}

      {/* File list */}
      <div className="max-h-60 overflow-y-auto divide-y divide-[var(--border-subtle)]">
        {files.map(bf => (
          <div key={bf.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bg-overlay)] transition-colors">
            <span className="shrink-0">{STATUS_ICONS[bf.status]}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--text-primary)] truncate">{bf.file.name}</p>
              <div className="flex gap-2 text-[10px] text-[var(--text-muted)]">
                <span>{formatSize(bf.file.size)}</span>
                {bf.status === 'processing' && <span>{bf.progress}%</span>}
                {bf.status === 'error' && bf.error && <span className="text-red-400 truncate">{bf.error}</span>}
              </div>
              {bf.status === 'processing' && bf.progress > 0 && (
                <div className="h-1 bg-[var(--border-subtle)] rounded-full mt-1 max-w-[120px]">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-200" style={{ width: `${bf.progress}%` }} />
                </div>
              )}
            </div>
            {!isProcessing && bf.status !== 'processing' && (
              <button onClick={() => onRemove(bf.id)} className="shrink-0 text-[var(--text-muted)] hover:text-red-400 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

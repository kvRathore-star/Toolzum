"use client";

import { Loader2 } from 'lucide-react';

interface ProcessingOverlayProps {
  isProcessing: boolean;
  label?: string;
  progress?: number;
  children: React.ReactNode;
}

export function ProcessingOverlay({
  isProcessing,
  label = 'Processing...',
  progress,
  children,
}: ProcessingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isProcessing && (
        <div className="absolute inset-0 bg-[var(--bg-elevated)]/80 backdrop-blur-sm rounded-[var(--radius-2xl)] flex flex-col items-center justify-center gap-3 z-10">
          <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
          <p className="text-sm font-medium text-[var(--text-secondary)]">{label}</p>
          {progress !== undefined && progress > 0 && (
            <div className="w-48 h-1.5 bg-[var(--border-subtle)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--accent)] rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

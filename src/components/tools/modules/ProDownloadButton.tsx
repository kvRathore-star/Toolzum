"use client";
import React from 'react';
import { Crown, Download, Lock } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import Link from 'next/link';

interface ProDownloadButtonProps {
  fileCount: number;
  onDownloadAll: () => void;
  onDownloadEach?: () => void;
  isProcessing?: boolean;
}

export function ProDownloadButton({ fileCount, onDownloadAll, onDownloadEach, isProcessing }: ProDownloadButtonProps) {
  const { data: session } = useSession();
  const isPro = (session?.user as Record<string, unknown>)?.plan === 'pro';

  if (fileCount === 0) return null;

  if (isPro || fileCount <= 1) {
    return (
      <button
        onClick={onDownloadAll}
        disabled={isProcessing}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent)] text-white font-medium rounded-[var(--radius-lg)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <Download className="w-4 h-4" />
        {isProcessing ? 'Processing...' : fileCount === 1 ? 'Download' : `Download All (${fileCount} files)`}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {onDownloadEach && (
        <button
          onClick={onDownloadEach}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 text-zinc-200 font-medium rounded-[var(--radius-lg)] hover:bg-[var(--bg-elevated)] disabled:opacity-50 transition-all text-sm"
        >
          <Download className="w-4 h-4" />
          Download files individually
        </button>
      )}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 rounded-[var(--radius-lg)] pointer-events-none" />
        <button
          disabled
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-zinc-900 text-[var(--text-secondary)] font-medium rounded-[var(--radius-lg)] border border-zinc-700 cursor-not-allowed"
        >
          <Lock className="w-4 h-4" />
          Download All as ZIP ({fileCount} files)
        </button>
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-amber-500 text-white text-[10px] font-mono uppercase tracking-wider rounded-full flex items-center gap-1 shadow-lg z-10">
          <Crown className="w-3 h-3" /> Pro
        </div>
      </div>
      <Link
        href="/pricing"
        className="block w-full text-center text-xs text-amber-400 hover:text-amber-300 underline transition-colors"
      >
        Upgrade to Pro for batch ZIP downloads
      </Link>
    </div>
  );
}

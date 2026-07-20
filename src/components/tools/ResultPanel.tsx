"use client";

import { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { clipboardWrite } from '@/lib/clipboard';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';

interface ResultPanelProps {
  value: string;
  label?: string;
  downloadFilename?: string;
  downloadMime?: string;
  showLabel?: boolean;
  showCopy?: boolean;
  showDownload?: boolean;
  mono?: boolean;
  placeholder?: string;
  preview?: React.ReactNode;
}

export function ResultPanel({
  value,
  label = 'Output',
  downloadFilename = 'output.txt',
  downloadMime = 'text/plain',
  showLabel = true,
  showCopy = true,
  showDownload = true,
  mono = false,
  placeholder = 'Result will appear here...',
  preview,
}: ResultPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await clipboardWrite(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy.');
    }
  };

  const handleDownload = () => {
    if (!value) return;
    try {
      const blob = new Blob([value], { type: downloadMime });
      const url = URL.createObjectURL(blob);
      downloadOrShare(url, downloadFilename);
      setTimeout(() => URL.revokeObjectURL(url), 200);
    } catch {
      toast.error('Failed to download.');
    }
  };

  return (
    <div className="bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] flex flex-col min-h-[240px]">
      {showLabel && (
        <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex justify-between items-center shrink-0">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            {label}
          </span>
          <div className="flex gap-1.5">
            {showCopy && (
              <button
                onClick={handleCopy}
                disabled={!value}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all disabled:opacity-40 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[var(--success)]" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
            {showDownload && (
              <button
                onClick={handleDownload}
                disabled={!value}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all disabled:opacity-40 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]"
              >
                <Download className="w-3.5 h-3.5" />
                Save
              </button>
            )}
          </div>
        </div>
      )}
      <div className="flex-1 p-4 min-h-0">
        {preview || (
          <textarea
            value={value}
            readOnly
            placeholder={placeholder}
            className={`w-full h-full bg-transparent outline-none resize-none text-sm ${
              mono ? 'font-mono' : ''
            } text-[var(--text-primary)] placeholder:text-[var(--text-muted)]`}
          />
        )}
      </div>
    </div>
  );
}

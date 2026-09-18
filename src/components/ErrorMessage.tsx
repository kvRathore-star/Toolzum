"use client";

import React, { useState } from "react";
import { clipboardWrite } from "@/lib/clipboard";
import { toast } from "react-hot-toast";

interface ErrorMessageProps {
  title: string;
  message: string;
  /** Small mono detail line (error name, retries left, digest). */
  detail?: string;
  /** Retry action; when omitted no retry button renders. */
  onRetry?: () => void;
  retryLabel?: string;
  /** While true the retry button shows a waiting state and ignores clicks. */
  retryPending?: boolean;
  /** Refresh-page action; when omitted no refresh button renders. */
  onRefresh?: () => void;
  /** Raw text copied by the Copy button; when omitted no copy button renders. */
  copyText?: string;
  /** Extra hint line under the actions (e.g. cache/support pointers). */
  hint?: string;
  /**
   * Raw technical details (message + stack). Rendered only outside
   * production, inside a collapsed <details> — useful when reproducing,
   * never shown to end users.
   */
  debugText?: string;
}

/**
 * Shared error UI for all three boundaries (tool ErrorBoundary,
 * GlobalErrorBoundary, app/error.tsx). Presentational only — each caller
 * keeps its own retry/reset mechanics (class retry-count, library reset,
 * route reset), which differ too much to unify safely.
 */
export function ErrorMessage({
  title,
  message,
  detail,
  onRetry,
  retryLabel = "Retry",
  retryPending = false,
  onRefresh,
  copyText,
  hint,
  debugText,
}: ErrorMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!copyText) return;
    const ok = await clipboardWrite(copyText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Copy failed — check browser permissions');
    }
  };

  return (
    <div
      role="alert"
      className="w-full bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/50 p-8 flex flex-col items-center justify-center min-h-[400px] text-center"
    >
      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/50 mb-6 flex items-center justify-center">
        <span className="text-red-500 text-2xl font-bold" aria-hidden="true">
          !
        </span>
      </div>
      <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">{title}</h2>
      <p className="text-red-600 dark:text-red-300 max-w-md mx-auto mb-2">{message}</p>
      {detail && (
        <p className="text-xs text-red-500 dark:text-red-400 mb-6 max-w-md font-mono opacity-60">
          {detail}
        </p>
      )}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {onRetry && (
          <button
            onClick={retryPending ? undefined : onRetry}
            disabled={retryPending}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all active:scale-95 disabled:opacity-60"
          >
            {retryPending ? "Retrying…" : retryLabel}
          </button>
        )}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-6 py-2.5 bg-zinc-600 hover:bg-zinc-700 text-white rounded-xl font-medium transition-all active:scale-95"
          >
            Refresh Page
          </button>
        )}
        {copyText && (
          <button
            onClick={handleCopy}
            className="px-3 py-2.5 text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
            title="Copy error details"
          >
            {copied ? "Copied" : "Copy Error"}
          </button>
        )}
      </div>
      {hint && <p className="text-[10px] text-zinc-500 mt-6 max-w-md">{hint}</p>}
      {debugText && process.env.NODE_ENV !== "production" && (
        <details className="mt-4 max-w-md text-left">
          <summary className="cursor-pointer text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
            Technical details (dev only)
          </summary>
          <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-[var(--bg-overlay)] p-3 text-[10px] font-mono text-[var(--text-secondary)]">
            {debugText}
          </pre>
        </details>
      )}
    </div>
  );
}

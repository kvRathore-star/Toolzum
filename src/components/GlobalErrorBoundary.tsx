"use client";

import React, { useState } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { AlertTriangle, RefreshCw, Copy } from 'lucide-react';

function FallbackComponent({ error, resetErrorBoundary }: FallbackProps) {
  const [copied, setCopied] = useState(false);
  const message = error instanceof Error ? error.message : "An unexpected memory limit or processing error occurred locally on your device.";
  const errorName = error instanceof Error ? error.name : "UnknownError";

  const handleCopy = () => {
    const text = `[${errorName}] ${message}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-950/20 border border-red-500/20 rounded-2xl w-full">
      <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4 text-red-500">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-red-500 mb-2">Tool Engine Crashed</h3>
      <p className="text-zinc-400 text-center mb-2 max-w-md text-sm">
        {message}
      </p>
      <p className="text-[10px] font-mono text-red-500/60 mb-6 max-w-md truncate">
        {errorName}
      </p>
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <button
          onClick={resetErrorBoundary}
          className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reset Tool & Try Again
        </button>
        <button
          onClick={handleCopy}
          className="px-3 py-3 text-xs text-zinc-400 hover:text-zinc-300 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl transition-colors flex items-center gap-1.5"
          title="Copy error details"
        >
          <Copy className="w-3.5 h-3.5" />
          {copied ? 'Copied' : 'Copy Error'}
        </button>
      </div>
      <p className="text-[10px] text-zinc-600 mt-6">
        Try refreshing the page or clearing your browser cache. If the issue persists, contact support.
      </p>
    </div>
  );
}

export function GlobalErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      {children}
    </ErrorBoundary>
  );
}

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FileUploader } from '../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';

export default function UrlToPdf() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [useProxy, setUseProxy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    return () => {
      if (outputUrl?.startsWith('blob:')) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const normalizeUrl = (input: string): string => {
    const trimmed = input.trim();
    if (!trimmed) throw new Error('Please enter a valid URL');
    if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
    return trimmed;
  };

  const handleLoad = async () => {
    setIsLoading(true);
    setError(null);
    setIsLoaded(false);

    try {
      const normalizedUrl = normalizeUrl(url);
      setUrl(normalizedUrl);

      if (useProxy) {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(normalizedUrl)}`;
        const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(15000) });
        if (!res.ok) throw new Error('Proxy fetch returned ' + res.status);
        let html = await res.text();
        html = html.replace('<head>', `<head><base href="${normalizedUrl}">`);
        const blob = new Blob([html], { type: 'text/html' });
        if (outputUrl?.startsWith('blob:')) URL.revokeObjectURL(outputUrl);
        setOutputUrl(URL.createObjectURL(blob));
      } else {
        setOutputUrl(normalizedUrl);
      }

      setIsLoaded(true);
      toast.success('Page loaded');
    } catch (e: any) {
      const msg = e?.name === 'TimeoutError' ? 'Request timed out. Try the proxy option.' : (e?.message || 'Failed to load URL');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    try {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
      } else {
        window.open(outputUrl!, '_blank');
      }
    } catch {
      window.open(outputUrl!, '_blank');
    }
  };

  const reset = () => {
    if (outputUrl?.startsWith('blob:')) URL.revokeObjectURL(outputUrl);
    setOutputUrl(null);
    setUrl('');
    setIsLoaded(false);
    setError(null);
  };

  if (!isLoaded) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm">
          <strong>URL to PDF:</strong> Enter a webpage URL to convert it to PDF.
          Some sites block embedding — enable the proxy option to bypass restrictions.
        </div>

        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleLoad()}
              placeholder="https://example.com"
              className="flex-1 px-4 py-3 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleLoad}
              disabled={isLoading || !url.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-lg flex items-center gap-2"
            >
              {isLoading ? (
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              )}
              {isLoading ? 'Loading...' : 'Load'}
            </button>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-600 dark:text-[var(--text-muted)]">
            <input
              type="checkbox"
              checked={useProxy}
              onChange={(e) => setUseProxy(e.target.checked)}
              className="rounded border-zinc-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500"
            />
            Use CORS proxy (helps load restricted sites)
          </label>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              {error}
            </div>
          )}
        </div>

        <div className="bg-[var(--bg-overlay)] dark:bg-zinc-900/30 border border-[var(--border-subtle)] p-4 rounded-xl text-xs text-[var(--text-secondary)] space-y-1">
          <p>⚠️ <strong>Limitations:</strong> Some websites block embedding via X-Frame-Options. Enable &quot;Use CORS proxy&quot; to bypass this. Sites behind login or with heavy JavaScript may not render fully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div className="flex items-center gap-3 min-w-0">
          <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m0 0a9 9 0 019 9"/></svg>
          <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm truncate">{url}</span>
        </div>
        <button
          onClick={reset}
          className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg shrink-0"
        >
          New URL
        </button>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
          <h4 className="text-[var(--text-primary)] font-medium">Preview</h4>
        </div>
        <div className="relative w-full" style={{ height: '75vh' }}>
          <iframe
            ref={iframeRef}
            src={outputUrl!}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms"
            title="URL Preview"
          />
        </div>
      </div>

      <button
        onClick={handlePrint}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
        Save as PDF
      </button>

      <p className="text-xs text-[var(--text-secondary)] text-center">
        Click &quot;Save as PDF&quot; to open the browser print dialog. Choose &quot;Save as PDF&quot; as the destination.
      </p>
    </div>
  );
}

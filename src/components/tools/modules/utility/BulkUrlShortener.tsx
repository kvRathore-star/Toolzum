"use client";
import React, { useState, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { useParallelProcessor } from '@/hooks/useParallelProcessor';
import { Link as LinkIcon, Copy, CheckCircle2, AlertCircle, Loader2, Download, X, ExternalLink } from 'lucide-react';

interface ShortenResult {
  original: string;
  shortened: string;
  status: 'ok' | 'error';
  error?: string;
}

export default function BulkUrlShortener() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<ShortenResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const { maxConcurrency, isPro } = useParallelProcessor();
  const abortRef = useRef(false);

  const urls = input.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const shortenUrl = async (url: string): Promise<ShortenResult> => {
    try {
      new URL(url.startsWith('http') ? url : 'https://' + url);
    } catch {
      return { original: url, shortened: '', status: 'error', error: 'Invalid URL' };
    }
    try {
      const res = await fetch(`/api/url-shorten?url=${encodeURIComponent(url.startsWith('http') ? url : 'https://' + url)}`);
      if (!res.ok) return { original: url, shortened: '', status: 'error', error: `HTTP ${res.status}` };
      const data = await res.text();
      return { original: url, shortened: data, status: 'ok' };
    } catch {
      return { original: url, shortened: '', status: 'error', error: 'Request failed' };
    }
  };

  const shortenAll = useCallback(async () => {
    if (urls.length === 0) { toast.error('Paste at least one URL'); return; }
    setIsProcessing(true);
    abortRef.current = false;
    setResults([]);
    setProgress({ done: 0, total: urls.length });

    const out: ShortenResult[] = [];
    for (let i = 0; i < urls.length; i++) {
      if (abortRef.current) break;
      const r = await shortenUrl(urls[i]!);
      out.push(r);
      setResults([...out]);
      setProgress({ done: i + 1, total: urls.length });
    }
    const ok = out.filter(r => r.status === 'ok').length;
    toast.success(`Shortened ${ok}/${urls.length} URLs`);
    setIsProcessing(false);
  }, [input]);

  const abort = useCallback(() => { abortRef.current = true; setIsProcessing(false); }, []);

  const copyResult = (idx: number, text: string) => {
    clipboardWrite(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const copyAll = () => {
    const text = results.filter(r => r.shortened).map(r => r.shortened).join('\n');
    if (!text) return;
    clipboardWrite(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
    toast.success('All shortened URLs copied');
  };

  const downloadCsv = () => {
    const csv = 'Original URL,Shortened URL,Status\n' + results.map(r =>
      `"${r.original}","${r.shortened}",${r.status}`
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk-url-shortener-results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => { setInput(''); setResults([]); setProgress({ done: 0, total: 0 }); };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-6 sm:p-8 space-y-6">
        {/* Input */}
        <div className="space-y-3">
          <label htmlFor="lbl-bulkurlshortener-paste-urls-to-shorten" className="text-sm font-medium text-[var(--text-primary)]">
            Paste URLs to shorten <span className="text-[var(--text-muted)]">(one per line)</span>
          </label>
          <textarea id="lbl-bulkurlshortener-paste-urls-to-shorten" aria-label="Paste URLs to shorten (one per line)"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="https://example.com/very/long/url/1&#10;https://example.com/very/long/url/2&#10;https://example.com/very/long/url/3"
            className="w-full h-40 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-y focus:ring-2 focus:ring-[var(--accent)]/50 transition-all"
            disabled={isProcessing}
          />
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>{urls.length} URL{urls.length !== 1 ? 's' : ''} detected</span>
            {results.length > 0 && <button onClick={clearAll} className="text-red-700 dark:text-red-400 hover:underline">Clear</button>}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={isProcessing ? abort : shortenAll}
            disabled={urls.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--accent-ink)] text-white font-medium rounded-xl hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-all"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
            {isProcessing ? `Shortening ${progress.done}/${progress.total}...` : `Shorten All (${urls.length})`}
          </button>
          {results.length > 0 && !isProcessing && (
            <>
              <button onClick={copyAll} className="flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-elevated)] transition-all">
                {copiedAll ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                Copy All
              </button>
              <button onClick={downloadCsv} className="flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-elevated)] transition-all">
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </>
          )}
        </div>

        {/* Progress */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="h-2 w-full bg-[var(--bg-overlay)] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-300" style={{ width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%` }} />
            </div>
            <p className="text-xs text-[var(--text-muted)] text-right">{progress.done}/{progress.total}</p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && !isProcessing && (
          <div role="status" className="space-y-2">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Results</h3>
            <div className="max-h-96 overflow-y-auto space-y-1.5">
              {results.map((r, i) => (
                <div key={i} className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm ${
                  r.status === 'ok'
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200/50 dark:border-emerald-800/20'
                    : 'bg-red-50/50 dark:bg-red-950/10 border-red-200/50 dark:border-red-800/20'
                }`}>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-[var(--text-muted)] text-xs">{r.original}</p>
                    {r.status === 'ok' ? (
                      <p className="text-emerald-600 dark:text-emerald-400 font-mono text-xs truncate">{r.shortened}</p>
                    ) : (
                      <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{r.error}</p>
                    )}
                  </div>
                  {r.status === 'ok' && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => copyResult(i, r.shortened)} className="p-1.5 hover:bg-[var(--bg-surface)] rounded-md transition-colors" title="Copy">
                        {copiedIndex === i ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
                      </button>
                      <a href={r.shortened} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-[var(--bg-surface)] rounded-md transition-colors" title="Open">
                        <ExternalLink className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              {results.filter(r => r.status === 'ok').length} of {results.length} URLs shortened successfully
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

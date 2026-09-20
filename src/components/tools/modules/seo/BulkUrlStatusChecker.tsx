"use client";
import React, { useCallback, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Upload, X, Loader2, Download, Copy, Check, Globe, Link2, StopCircle } from 'lucide-react';
import { downloadOrShare } from '@/utils/nativeShare';
import { clipboardWrite } from '@/lib/clipboard';
import { getErrorMessage } from '@/utils/error';
import {
  parseUrlList,
  buildResultsCsv,
  summarizeResults,
  BATCH_SIZE,
  type UrlStatusResult,
  type StatusCheckResponse,
} from '@/utils/urlStatus';

function statusColor(status: number): string {
  if (status >= 200 && status < 300) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-700/10 border-emerald-500/20';
  if (status >= 300 && status < 400) return 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20';
  if (status >= 400 && status < 500) return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
  if (status >= 500) return 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20';
  return 'text-zinc-600 dark:text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
}

export default function BulkUrlStatusChecker() {
  const [urls, setUrls] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [results, setResults] = useState<UrlStatusResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState({ checked: 0, total: 0, batch: 0 });
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef(false);

  const handleFile = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const parsed = parseUrlList(text);
      if (parsed.length === 0) {
        toast.error('No valid URLs found. Add one http/https URL per line.');
        return;
      }
      setUrls(parsed);
      setFileName(file.name);
      setResults([]);
      toast.success(`Loaded ${parsed.length} URLs`);
    } catch {
      toast.error('Could not read the file');
    }
  }, []);

  const checkStatuses = async () => {
    if (urls.length === 0) return;
    cancelRef.current = false;
    setIsChecking(true);
    setResults([]);
    setCopied(false);

    setProgress({ checked: 0, total: urls.length, batch: 0 });

    const all: UrlStatusResult[] = [];
    const failed: UrlStatusResult[] = [];
    const pending = [...urls];
    let batchNumber = 0;

    while (pending.length > 0 && !cancelRef.current) {
      const batch = pending.splice(0, BATCH_SIZE);
      batchNumber++;
      let delivered = false;
      for (let attempt = 0; attempt < 3 && !delivered && !cancelRef.current; attempt++) {
        try {
          const res = await fetch('/api/url-status-check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urls: batch }),
          });
          if (res.status === 429 && attempt < 2 && !cancelRef.current) {
            // 15 checks/min backend cap: wait out the window and retry the
            // same batch instead of marking its URLs failed.
            const waitSec = Math.min(Number(res.headers.get('Retry-After')) || 20, 65);
            if (attempt === 0) toast(`Rate limited — resuming in ~${waitSec}s…`);
            await new Promise(r => setTimeout(r, waitSec * 1000));
            continue;
          }
          if (!res.ok) {
            const err = (await res.json().catch(() => ({ error: 'Request failed' }))) as { error?: string };
            throw new Error(err.error || `Server error (${res.status})`);
          }
          const data = (await res.json()) as StatusCheckResponse;
          all.push(...data.results);
          if (data.skipped && data.skipped.length > 0) pending.push(...data.skipped);
          delivered = true;
        } catch (e: unknown) {
          if (cancelRef.current) break;
          if (attempt === 2) {
            failed.push(...batch.map(u => ({ url: u, status: 0, statusText: '', finalUrl: u, ms: 0, ok: false, error: 'check failed' })));
            toast.error(getErrorMessage(e, 'Batch failed'));
          }
        }
      }
      const checked = all.length + failed.length;
      setProgress({ checked: Math.min(checked, urls.length), total: urls.length, batch: batchNumber });
    }

    const allResults = [...all, ...failed];
    setResults(allResults);
    setIsChecking(false);

    if (cancelRef.current) {
      toast('Checking stopped', { icon: '⏹️' });
      return;
    }
    const summary = summarizeResults(allResults);
    toast.success(
      `Checked ${allResults.length} URLs — ${summary.ok} OK, ${summary.redirects} redirects, ${summary.clientErrors + summary.serverErrors} errors, ${summary.unreachable} unreachable`
    );
  };

  const stop = () => {
    cancelRef.current = true;
  };

  const handleDownload = () => {
    if (results.length === 0) return;
    const blob = new Blob([buildResultsCsv(results)], { type: 'text/csv;charset=utf-8' });
    downloadOrShare(URL.createObjectURL(blob), `url-status-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleCopy = async () => {
    await clipboardWrite(buildResultsCsv(results));
    setCopied(true);
    toast.success('Copied results as CSV');
    setTimeout(() => setCopied(false), 2000);
  };

  const summary = results.length > 0 ? summarizeResults(results) : null;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-start gap-3 p-4 rounded-[var(--radius-xl)] bg-sky-500/10 border border-sky-500/20">
        <Globe className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
        <div className="text-sm text-sky-700 dark:text-sky-400">
          <p className="font-medium mb-0.5">Server-side checks</p>
          <p className="text-sky-500/80 dark:text-sky-400/80 text-xs leading-relaxed">
            Each URL is checked from our server (not your browser), so real HTTP status codes are returned — even for sites that block cross-origin requests.
          </p>
        </div>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-6 sm:p-8 space-y-6">
        {urls.length === 0 ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileRef.current?.click(); } }}
            className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-[var(--border-subtle)] rounded-[var(--radius-xl)] cursor-pointer hover:border-sky-500/50 transition-colors bg-[var(--bg-overlay)]"
          >
            <Upload className="w-10 h-10 text-[var(--text-muted)] mb-3" />
            <p className="text-sm text-[var(--text-primary)] font-medium">Drop a .txt or .csv file here, or click to browse</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">One URL per line — up to 5,000 URLs</p>
            <input aria-label="One URL per line — up to 5,000 URLs" ref={fileRef} type="file" accept=".txt,.csv,text/plain,text/csv" className="hidden" onChange={e => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = '';
            }} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link2 className="w-5 h-5 text-[var(--accent)]" />
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{fileName}</p>
                  <p className="text-xs text-[var(--text-muted)]">{urls.length} URLs ready</p>
                </div>
              </div>
              {!isChecking && (
                <button
                  onClick={() => { setUrls([]); setResults([]); setFileName(''); }}
                  className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-red-500 px-3 py-1.5 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Change file
                </button>
              )}
            </div>

            {isChecking ? (
              <div className="p-4 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] space-y-2">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    Checking {progress.checked}/{progress.total} URLs
                  </span>
                  {progress.batch > 0 && <span className="text-xs text-[var(--text-muted)]">batch #{progress.batch}</span>}
                  <button onClick={stop} className="ml-auto flex items-center gap-1.5 text-xs text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 transition-colors">
                    <StopCircle className="w-3.5 h-3.5" /> Stop
                  </button>
                </div>
                <div className="h-1.5 w-full bg-[var(--bg-surface)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-ink)] rounded-full transition-all duration-300"
                    style={{ width: `${progress.total > 0 ? (progress.checked / progress.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={checkStatuses}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98]"
              >
                <Globe className="w-4 h-4" /> Check Statuses
              </button>
            )}
          </div>
        )}
      </div>

      {summary && (
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-emerald-600 dark:text-emerald-400 font-semibold">{summary.ok} OK</span>
          <span className="px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 font-semibold">{summary.redirects} redirects</span>
          <span className="px-3 py-1.5 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-amber-600 dark:text-amber-400 font-semibold">{summary.clientErrors} client errors</span>
          <span className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 font-semibold">{summary.serverErrors} server errors</span>
          <span className="px-3 py-1.5 rounded-lg bg-zinc-500/10 border border-zinc-500/20 text-[var(--text-secondary)] dark:text-[var(--text-muted)] font-semibold">{summary.unreachable} unreachable</span>
          <span className="px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 font-semibold">{summary.slow} slow (&gt;1.5s)</span>
        </div>
      )}

      {results.length > 0 && !isChecking && (
        <div role="status" className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Results ({results.length})</h3>
            <div className="flex gap-2">
              <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                {copied ? <Check className="w-3.5 h-3.5 text-[var(--accent)]" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy CSV'}
              </button>
              <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-all">
                <Download className="w-3.5 h-3.5" /> Download CSV
              </button>
            </div>
          </div>

          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden">
            <div className="max-h-[420px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)]">
                  <tr className="text-[var(--text-muted)] uppercase tracking-wider">
                    <th className="px-4 py-2.5 font-semibold">Status</th>
                    <th className="px-4 py-2.5 font-semibold">URL</th>
                    <th className="px-4 py-2.5 font-semibold hidden md:table-cell">Redirects to</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className="border-b border-[var(--border-subtle)]/50 last:border-0">
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded-md font-mono font-semibold border ${statusColor(r.status)}`}>
                          {r.status === 0 ? 'ERR' : r.status}
                        </span>
                        {r.error && <span className="ml-1.5 text-[10px] text-red-500">{r.error}</span>}
                      </td>
                      <td className="px-4 py-2.5 text-[var(--text-primary)] break-all max-w-[320px]">
                        <span className="line-clamp-1">{r.url}</span>
                      </td>
                      <td className="px-4 py-2.5 text-[var(--text-secondary)] break-all max-w-[260px] hidden md:table-cell">
                        {r.finalUrl !== r.url ? <span className="line-clamp-1">{r.finalUrl}</span> : <span className="text-[var(--text-muted)]">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap font-mono text-[var(--text-secondary)]">{r.ms}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

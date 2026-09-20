"use client";
import React, { useState } from 'react';
import { Link as LinkIcon, Copy, ExternalLink, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

export default function UrlShortener() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ long: string; short: string }[]>([]);

  const shortenUrl = async () => {
    const raw = url.trim();
    if (!raw) return;

    // Never mutate the user's input — derive a request URL locally instead
    const requestUrl = raw.startsWith('http://') || raw.startsWith('https://') ? raw : 'https://' + raw;
    try {
      new URL(requestUrl);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    setError('');
    setShortUrl('');
    setCopied(false);

    try {
      const response = await fetch(`/api/url-shorten?url=${encodeURIComponent(requestUrl)}`);
      
      if (!response.ok) {
        throw new Error('Failed to shorten URL');
      }
      
      const data = (await response.text()).trim();
      if (!/^https?:\/\/\S+$/.test(data)) {
        throw new Error('Failed to shorten URL');
      }
      setShortUrl(data);
      setHistory(prev => [{ long: raw, short: data }, ...prev].slice(0, 10));
    } catch (err) {
      setError('Could not shorten URL. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!shortUrl) return;
    clipboardWrite(shortUrl).then(ok => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); } else toast.error('Copy blocked by the browser — select the text manually.'); });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
        <div className="border-b border-[var(--border-subtle)] p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
              <LinkIcon className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">URL Shortener</h2>
              <p className="text-sm text-[var(--text-secondary)]">Create short, memorable links instantly</p>
              <p className="text-xs text-[var(--accent)] mt-1">Server-based shortening: your URL is sent to our API to create the short link — it is not processed on-device.</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <label className="text-sm font-medium text-[var(--text-primary)]">
              Paste your long URL here
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input aria-label="Paste your long URL here"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && shortenUrl()}
                placeholder="https://example.com/very/long/path/to/something"
                className="w-full sm:flex-1 bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50 transition-all"
              />
              <button
                onClick={shortenUrl}
                disabled={!url || isLoading}
                className="w-full sm:w-auto px-6 py-3 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:hover:bg-[var(--accent-ink)] text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Shorten
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            {error && (
              <p className="text-sm text-red-500 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>

          {shortUrl && (
            <div className="animate-in slide-in-from-bottom-4 duration-300 p-6 bg-blue-50 dark:bg-[var(--accent)]/10 border border-[var(--accent)]/20 dark:border-[var(--accent)]/20 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--accent)]">
                  Your shortened URL is ready!
                </span>
              </div>
              
              <div className="flex items-center gap-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg p-2">
                <input
                  type="text"
                  readOnly
                  aria-label="Shortened URL"
                  value={shortUrl}
                  className="flex-1 bg-transparent border-none focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 text-[var(--text-primary)] px-2 font-medium"
                />
                
                <button
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] dark:text-[var(--text-muted)] rounded-md transition-colors flex items-center gap-2"
                  title="Copy to clipboard" aria-label="Copy shortened URL"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
                
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] dark:text-[var(--text-muted)] rounded-md transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
          {history.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase">History</span>
                <button onClick={() => setHistory([])} className="text-xs text-[var(--text-muted)] hover:underline">Clear</button>
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {history.map((h, i) => (
                  <div key={i} className="flex justify-between items-center gap-2 text-xs px-3 py-2 bg-[var(--bg-overlay)]/50 rounded-lg">
                    <span className="text-[var(--text-muted)] truncate flex-1">{h.long}</span>
                    <button onClick={() => { setUrl(h.long); setShortUrl(h.short); }} className="text-[var(--accent)] hover:underline shrink-0 font-mono">{h.short}</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
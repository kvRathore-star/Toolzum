"use client";

import React, { useState, useCallback, useRef } from 'react';
import { Globe, Search, Download, AlertTriangle, CheckCircle, XCircle, ExternalLink, ChevronDown, ChevronRight, FileText, List, Clock, Copy, Trash2, Settings2, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { clipboardWrite } from "@/lib/clipboard";

interface CrawledPage {
  url: string;
  lastmod: string;
  statusCode: number;
  title: string;
  metaDesc: string;
  depth: number;
  isBroken: boolean;
}

interface SEOInsights {
  missingMeta: number;
  brokenLinks: number;
  duplicateTitles: number;
  totalPages: number;
  healthyPages: number;
}

type SitemapState =
  | { status: "idle" }
  | { status: "detecting"; url: string }
  | { status: "crawling"; url: string; discovered: number; crawled: number; max: number; currentPage: string; log: string[]; jsRendering: boolean }
  | { status: "complete"; url: string; pages: CrawledPage[]; xml: string; html: string; txt: string; insights: SEOInsights; durationMs: number; jsRendering: boolean }
  | { status: "error"; message: string };

function truncateUrl(url: string, max: number): string {
  return url.length > max ? url.slice(0, max) + '…' : url;
}

interface ExclusionRule {
  pattern: string;
}

const DEFAULT_EXCLUSIONS: ExclusionRule[] = [
  { pattern: '/tag/*' },
  { pattern: '/author/*' },
  { pattern: '?page=' },
  { pattern: '#_' },
];

const FAQS = [
  {
    q: 'Does it work with React, Next.js or Vue sites?',
    a: 'It seeds from your sitemap.xml and crawls static links, which covers most content sites fully. Heavily JavaScript-rendered single-page apps may yield fewer pages, since links rendered only in the browser can’t be seen by the crawler.',
  },
  {
    q: 'What is the maximum number of URLs?',
    a: 'Free crawls go up to 100 URLs per sitemap; signed-in users up to 200 and Pro up to 500. The crawl starts from your existing sitemap.xml and robots.txt when available, then follows same-origin links.',
  },
  {
    q: 'How do I submit my sitemap to Google?',
    a: 'After generating, click "Open Google Search Console" in the next steps. Log in, select your property, go to Sitemaps, and paste your sitemap URL.',
  },
  {
    q: 'Does it respect robots.txt?',
    a: 'Yes. The crawler reads your robots.txt before starting and skips any URLs marked as Disallow.',
  },
  {
    q: 'How often should I regenerate my sitemap?',
    a: 'Whenever you add, remove, or significantly update pages — just re-run the crawl.',
  },
];

export default function XmlSitemapGenerator() {
  const [state, setState] = useState<SitemapState>({ status: 'idle' });
  const [url, setUrl] = useState('');
  const [exclusions, setExclusions] = useState<ExclusionRule[]>(DEFAULT_EXCLUSIONS);
  const [newExclusion, setNewExclusion] = useState('');
  const [maxPages, setMaxPages] = useState(50);
  const [planCap, setPlanCap] = useState<number | null>(null);
  const maxTouchedRef = useRef(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const abortRef = useRef(false);
  const blobUrlsRef = useRef<string[]>([]);

  React.useEffect(() => {
    return () => blobUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
  }, []);

  // Default "Max pages" to the visitor's plan cap (backend enforces the same
  // tiers): Pro 500, signed-in 200, anon 50. Without this, Pro users silently
  // crawled with max=50 while the discovered counter climbed into the 100s.
  React.useEffect(() => {
    let live = true;
    fetch('/api/check-plan')
      .then(r => (r.ok ? r.json() : null))
      .then((d: unknown) => {
        if (!live || !d || typeof d !== 'object') return;
        const plan = (d as { plan?: string }).plan;
        const cap = plan === 'pro' ? 500 : plan === 'signedin' ? 200 : 100;
        setPlanCap(cap);
        if (!maxTouchedRef.current) {
          setMaxPages(plan === 'pro' ? 500 : plan === 'signedin' ? 200 : 50);
        }
      })
      .catch(() => {});
    return () => { live = false; };
  }, []);

  const isCrawling = state.status === 'detecting' || state.status === 'crawling';

  const addExclusion = () => {
    if (!newExclusion.trim()) return;
    setExclusions([...exclusions, { pattern: newExclusion.trim() }]);
    setNewExclusion('');
  };

  const removeExclusion = (idx: number) => {
    setExclusions(exclusions.filter((_, i) => i !== idx));
  };

  const eventSourceRef = useRef<EventSource | null>(null);
  const chainingRef = useRef(false);

  const startCrawl = useCallback(async () => {
    let inputUrl = url.trim();
    if (!inputUrl) { toast.error('Enter a website URL'); return; }
    if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
      inputUrl = 'https://' + inputUrl;
    }
    try { new URL(inputUrl); } catch (e) { console.error(e); toast.error('Invalid URL'); return; }

    abortRef.current = false;
    chainingRef.current = true;
    setState({ status: 'detecting', url: inputUrl });

    const excludeParam = exclusions.map(e => e.pattern).filter(Boolean).join(',');
    const params = new URLSearchParams({ url: inputUrl, max: String(maxPages) });
    if (excludeParam) params.set('exclude', excludeParam);
    if (notifyEmail.trim()) params.set('notify', notifyEmail.trim());

    openStream(params.toString(), inputUrl);
  }, [url, exclusions, maxPages, notifyEmail]);

  const openStream = (query: string, inputUrl: string) => {
    eventSourceRef.current?.close();
    const es = new EventSource(`/api/sitemap-crawl?${query}`);
    eventSourceRef.current = es;

    es.onmessage = (e) => {
      if (abortRef.current) { es.close(); return; }
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'js_detected') {
          setState(prev => {
            if (prev.status !== 'detecting' && prev.status !== 'crawling') return prev;
            return { ...prev, jsRendering: true } as any;
          });
          return;
        }
        if (data.type === 'progress') {
          setState(prev => ({
            status: 'crawling',
            url: inputUrl,
            discovered: data.discovered,
            crawled: data.crawled,
            max: data.max,
            currentPage: data.currentUrl,
            currentUrl: data.currentUrl,
            log: [...(prev.status === 'crawling' ? prev.log.slice(-49) : []), data.log],
            jsRendering: prev.status === 'crawling' ? prev.jsRendering : false,
          }));
          return;
        }
        if (data.type === 'partial') {
          // Chunk done, more queued server-side: chain the next chunk automatically.
          es.close();
          if (abortRef.current || !chainingRef.current) return;
          setState(prev => ({
            status: 'crawling',
            url: inputUrl,
            discovered: data.discovered,
            crawled: data.crawled,
            max: data.max,
            currentPage: '',
            currentUrl: '',
            log: [...(prev.status === 'crawling' ? prev.log.slice(-49) : []), `✓ Chunk complete (${data.crawled}/${data.max} pages) — continuing…`],
            jsRendering: prev.status === 'crawling' ? prev.jsRendering : false,
          }));
          openStream(`cursor=${encodeURIComponent(data.cursor)}`, inputUrl);
          return;
        }
        if (data.type === 'complete') {
          es.close();
          eventSourceRef.current = null;
          chainingRef.current = false;
          setState({
            status: 'complete',
            url: data.url,
            pages: data.pages,
            xml: data.xml,
            html: data.html,
            txt: data.txt,
            insights: data.insights,
            durationMs: data.durationMs,
            jsRendering: data.jsRendering,
          });
          return;
        }
        if (data.type === 'error') {
          es.close();
          eventSourceRef.current = null;
          setState({ status: 'error', message: data.message });
        }
      } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn('Sitemap crawl failed for URL:', e); }
    };

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;
      chainingRef.current = false;
      setState(prev => {
        if (prev.status === 'complete') return prev;
        return { status: 'error', message: 'Connection lost. The crawl may have timed out.' };
      });
    };
  };

  const cancelCrawl = () => {
    abortRef.current = true;
    chainingRef.current = false;
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    setState({ status: 'idle' });
  };

  const handleCopy = () => {
    if (state.status !== 'complete') return;
    clipboardWrite(state.xml).then(ok => { if (ok) toast.success('Copied XML Sitemap!'); else toast.error('Copy blocked by the browser — select the text manually.'); });
  };

  const makeBlobUrl = (content: string, type: string): string => {
    blobUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
    blobUrlsRef.current = [];
    const url = URL.createObjectURL(new Blob([content], { type }));
    blobUrlsRef.current.push(url);
    return url;
  };

  const handleDownloadXml = () => {
    if (state.status !== 'complete') return;
    downloadOrShare(makeBlobUrl(state.xml, 'application/xml'), 'sitemap.xml');
  };

  const handleDownloadHtml = () => {
    if (state.status !== 'complete') return;
    downloadOrShare(makeBlobUrl(state.html, 'text/html'), 'sitemap.html');
  };

  const handleDownloadTxt = () => {
    if (state.status !== 'complete') return;
    downloadOrShare(makeBlobUrl(state.txt, 'text/plain'), 'urls.txt');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Input Section */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 mb-1">
          <Globe className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-bold text-[var(--text-primary)]">XML Sitemap Generator</h2>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Enter a website URL to crawl and generate a search-engine ready XML sitemap.
          {state.status !== 'complete' && <span className="text-emerald-500 font-medium"> Starts from your sitemap.xml when available — free, no signup.</span>}
        </p>

        {state.status !== 'complete' && (
          <>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && startCrawl()}
                  placeholder="https://yourwebsite.com — seeds from your sitemap.xml automatically"
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl pl-10 pr-4 py-3 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]/50 transition-colors placeholder:text-[var(--text-muted)]"
                  disabled={isCrawling}
                />
              </div>
              <button
                onClick={isCrawling ? cancelCrawl : startCrawl}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                  isCrawling
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-emerald-700 hover:bg-emerald-700 text-white'
                }`}
              >
                {isCrawling ? 'Cancel' : 'Generate Sitemap →'}
              </button>
            </div>

            <button
              aria-expanded={showSettings}
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] dark:hover:text-zinc-300 transition-colors"
            >
              <Settings2 className="w-3.5 h-3.5" />
              Advanced settings
              {showSettings ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>

            {showSettings && (
              <div className="space-y-4 p-4 bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)]">
                <div>
                  <label htmlFor="lbl-xmlsitemapgenerator-notify-email" className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Notify me when done <span className="text-[var(--text-muted)] font-normal">— optional, we'll email you the results</span></label>
                  <input id="lbl-xmlsitemapgenerator-notify-email" aria-label="Notify me when done"
                    type="email"
                    value={notifyEmail}
                    onChange={e => setNotifyEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                    disabled={isCrawling}
                  />
                </div>

                <div>
                  <label htmlFor="lbl-xmlsitemapgenerator-max-pages-to-crawl" className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Max pages to crawl{planCap !== null && <span className="text-[var(--text-muted)] font-normal"> — your plan allows up to {planCap}</span>}</label>
                  <select id="lbl-xmlsitemapgenerator-max-pages-to-crawl" aria-label="Max pages to crawl"
                    value={maxPages}
                    onChange={e => { maxTouchedRef.current = true; setMaxPages(Number(e.target.value)); }}
                    className="bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                    disabled={isCrawling}
                  >
                    <option value={30}>30 pages (quick test)</option>
                    <option value={50}>50 pages (free)</option>
                    <option value={100} disabled={planCap !== null && planCap < 100}>100 pages (free)</option>
                    <option value={200} disabled={planCap !== null && planCap < 200}>200 pages (signed in)</option>
                    <option value={500} disabled={planCap !== null && planCap < 500}>500 pages (Pro)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">
                    Exclude URL patterns <span className="text-[var(--text-muted)] font-normal">— skip matching paths</span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input aria-label="Exclude URL patterns — skip matching paths"
                      type="text"
                      value={newExclusion}
                      onChange={e => setNewExclusion(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addExclusion()}
                      placeholder="/tag/*, /author/*, ?page=*"
                      className="flex-1 bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                      disabled={isCrawling}
                    />
                    <button onClick={addExclusion} className="px-3 py-2 bg-[var(--bg-overlay)] hover:bg-[var(--bg-elevated)] rounded-lg text-xs transition-colors" disabled={isCrawling}>Add</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {exclusions.map((e, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--bg-surface)] rounded-lg text-[11px] font-mono text-[var(--text-secondary)] dark:text-[var(--text-muted)]">
                        {e.pattern}
                        <button aria-label={`Remove exclusion ${e.pattern}`} onClick={() => removeExclusion(i)} className="text-[var(--text-muted)] hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detecting state */}
      {state.status === 'detecting' && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-8 flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[var(--text-secondary)]">Detecting site type…</span>
        </div>
      )}

      {/* Crawling progress */}
      {state.status === 'crawling' && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-500" />
                Crawling {new URL(state.url).hostname}
              </h3>
              <span className="text-xs text-[var(--text-muted)] font-mono">
                {state.crawled} of ~{state.max} pages
              </span>
            </div>

            <div className="w-full h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-700 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (state.crawled / state.max) * 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-[var(--text-primary)]">{state.discovered}</div>
                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Discovered</div>
              </div>
              <div>
                <div className="text-xl font-bold text-emerald-500">{state.crawled}</div>
                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Crawled</div>
              </div>
              <div>
                <div className="text-xl font-bold text-[var(--text-primary)]">{state.max}</div>
                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Max</div>
              </div>
            </div>

            {state.jsRendering && (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg text-xs text-[var(--accent)]">
                <Zap className="w-3.5 h-3.5" />
                JavaScript site detected — static crawl may find fewer pages; links from your sitemap.xml are still included
              </div>
            )}

            <div className="h-48 overflow-y-auto bg-black/5 dark:bg-white/5 rounded-xl p-3 font-mono text-[11px] leading-relaxed">
              {state.log.map((entry, i) => (
                <div key={i} className="text-[var(--text-secondary)] truncate">
                  {entry}
                </div>
              ))}
              <div className="text-emerald-500 animate-pulse">▌</div>
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {state.status === 'error' && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-6 text-center">
          <XCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-sm text-red-700 dark:text-red-400">{state.message}</p>
          <button onClick={() => setState({ status: 'idle' })} className="mt-4 text-xs text-red-600 hover:text-red-500 underline">Try again</button>
        </div>
      )}

      {/* Complete — results */}
      {state.status === 'complete' && (
        <>
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-[var(--text-primary)]"><strong className="text-lg">{state.pages.length}</strong> URLs</span>
                <span className="w-px h-6 bg-[var(--bg-overlay)]" />
                <span className="text-[var(--text-secondary)]">Generated in <strong>{(state.durationMs / 1000).toFixed(1)}s</strong></span>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] rounded-xl text-xs transition-colors">
                  <Copy className="w-3.5 h-3.5" /> Copy XML
                </button>
                <button onClick={handleDownloadXml} className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent-ink)] hover:opacity-90 text-white rounded-xl text-xs font-bold transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download XML
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-4 flex-wrap">
              <button onClick={handleDownloadHtml} className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] rounded-lg text-[11px] transition-colors">
                <FileText className="w-3 h-3" /> HTML Sitemap
              </button>
              <button onClick={handleDownloadTxt} className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] rounded-lg text-[11px] transition-colors">
                <List className="w-3 h-3" /> URL List (.txt)
              </button>
              <button onClick={() => setState({ status: 'idle' })} className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] rounded-lg text-[11px] transition-colors ml-auto">
                Generate another →
              </button>
            </div>
          </div>

          {/* SEO Insights */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              SEO Health Check
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="px-3 py-2.5 bg-[var(--bg-overlay)]/50 rounded-xl">
                <div className="text-lg font-bold text-emerald-500">{state.insights.healthyPages}</div>
                <div className="text-[10px] text-[var(--text-muted)]">Healthy pages</div>
              </div>
              <div className="px-3 py-2.5 bg-[var(--bg-overlay)]/50 rounded-xl">
                <div className="text-lg font-bold text-amber-500">{state.insights.missingMeta}</div>
                <div className="text-[10px] text-[var(--text-muted)]">Missing meta description</div>
              </div>
              <div className="px-3 py-2.5 bg-[var(--bg-overlay)]/50 rounded-xl">
                <div className="text-lg font-bold text-red-500">{state.insights.brokenLinks}</div>
                <div className="text-[10px] text-[var(--text-muted)]">Broken links (4xx/5xx)</div>
              </div>
              <div className="px-3 py-2.5 bg-[var(--bg-overlay)]/50 rounded-xl">
                <div className="text-lg font-bold text-amber-500">{state.insights.duplicateTitles}</div>
                <div className="text-[10px] text-[var(--text-muted)]">Duplicate page titles</div>
              </div>
            </div>
            {state.insights.missingMeta > 0 && (
              <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg text-xs text-[var(--accent)]">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{state.insights.missingMeta} page{state.insights.missingMeta > 1 ? 's are' : ' is'} missing meta descriptions.</span>
              </div>
            )}
            {state.insights.brokenLinks > 0 && (
              <div className="flex items-start gap-2 px-3 py-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-xs text-red-700 dark:text-red-400">
                <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{state.insights.brokenLinks} broken link{state.insights.brokenLinks > 1 ? 's' : ''} found.</span>
              </div>
            )}
            {state.insights.duplicateTitles > 0 && (
              <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg text-xs text-[var(--accent)]">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{state.insights.duplicateTitles} page{state.insights.duplicateTitles > 1 ? 's have' : ' has'} duplicate title tags.</span>
              </div>
            )}
            {state.insights.healthyPages === state.pages.length && (
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-700/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg text-xs text-[var(--accent)]">
                <CheckCircle className="w-3.5 h-3.5" />
                All {state.pages.length} pages look healthy.
              </div>
            )}
          </div>

          {/* XML Preview */}
          <details className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
            <summary className="px-5 py-3.5 text-sm font-bold text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-overlay)] dark:hover:bg-zinc-800/50 flex items-center gap-2 transition-colors">
              <ChevronRight className="w-4 h-4" />
              Preview XML ({state.pages.length} URLs)
            </summary>
            <div className="border-t border-[var(--border-subtle)] p-4">
              <pre className="bg-black/5 dark:bg-white/5 rounded-xl p-4 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 overflow-x-auto max-h-80 overflow-y-auto leading-relaxed">
                {state.xml.slice(0, 3000)}
                {state.xml.length > 3000 && '\n\n… (truncated for preview)'}
              </pre>
            </div>
          </details>

          {/* Next Steps */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-5">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              What to do next
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <span className="w-7 h-7 rounded-full bg-emerald-700/10 text-emerald-500 text-xs font-bold flex items-center justify-center shrink-0">1</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">Upload to your server root</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Upload sitemap.xml to the root of your website so search engines can find it.</p>
                  <pre className="mt-2 px-3 py-2 bg-[var(--bg-overlay)] rounded-lg text-[11px] font-mono text-[var(--text-secondary)] dark:text-[var(--text-muted)]">Upload sitemap.xml → /public_html/sitemap.xml</pre>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="w-7 h-7 rounded-full bg-emerald-700/10 text-emerald-500 text-xs font-bold flex items-center justify-center shrink-0">2</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">Add to robots.txt</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Tell all search engine bots where your sitemap is.</p>
                  <pre className="mt-2 px-3 py-2 bg-[var(--bg-overlay)] rounded-lg text-[11px] font-mono text-[var(--text-secondary)] dark:text-[var(--text-muted)]">Sitemap: {state.url}sitemap.xml</pre>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="w-7 h-7 rounded-full bg-emerald-700/10 text-emerald-500 text-xs font-bold flex items-center justify-center shrink-0">3</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">Submit to Google Search Console</p>
                  <a
                    href="https://search.google.com/search-console/sitemaps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Open Google Search Console <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="w-7 h-7 rounded-full bg-emerald-700/10 text-emerald-500 text-xs font-bold flex items-center justify-center shrink-0">4</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">Submit to Bing Webmaster Tools</p>
                  <a
                    href="https://www.bing.com/webmasters/sitemaps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 bg-[var(--bg-overlay)] hover:bg-[var(--bg-elevated)] text-xs font-medium rounded-xl transition-colors"
                  >
                    Open Bing Webmaster Tools <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--text-muted)]" />
              Frequently Asked Questions
            </h3>
            {FAQS.map((faq, i) => (
              <details key={i} className="group">
                <summary className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer py-2 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-open:rotate-90 transition-transform shrink-0" />
                  {faq.q}
                </summary>
                <p className="pl-5.5 text-sm text-[var(--text-secondary)] leading-relaxed pb-2">{faq.a}</p>
              </details>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

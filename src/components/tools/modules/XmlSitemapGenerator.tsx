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
    q: 'Can it generate sitemaps for React or Next.js websites?',
    a: 'Yes. Toolzum detects JavaScript-rendered sites automatically and uses browser rendering mode to crawl them correctly.',
  },
  {
    q: 'What is the maximum number of URLs in the free plan?',
    a: 'Free users can crawl up to 100 URLs per sitemap. Pro users can crawl up to 50,000 URLs.',
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
    a: 'Whenever you add, remove, or significantly update pages. Pro users get automatic weekly regeneration.',
  },
];

export default function XmlSitemapGenerator() {
  const [state, setState] = useState<SitemapState>({ status: 'idle' });
  const [url, setUrl] = useState('');
  const [exclusions, setExclusions] = useState<ExclusionRule[]>(DEFAULT_EXCLUSIONS);
  const [newExclusion, setNewExclusion] = useState('');
  const [maxPages, setMaxPages] = useState(50);
  const [showSettings, setShowSettings] = useState(false);
  const abortRef = useRef(false);

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

  const startCrawl = useCallback(async () => {
    let inputUrl = url.trim();
    if (!inputUrl) { toast.error('Enter a website URL'); return; }
    if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
      inputUrl = 'https://' + inputUrl;
    }
    try { new URL(inputUrl); } catch { toast.error('Invalid URL'); return; }

    abortRef.current = false;
    setState({ status: 'detecting', url: inputUrl });

    const excludeParam = exclusions.map(e => e.pattern).filter(Boolean).join(',');
    const params = new URLSearchParams({ url: inputUrl, max: String(maxPages) });
    if (excludeParam) params.set('exclude', excludeParam);

    const es = new EventSource(`/api/sitemap-crawl?${params}`);
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
            log: [...(prev.status === 'crawling' ? prev.log.slice(-49) : []), data.log],
            jsRendering: prev.status === 'crawling' ? prev.jsRendering : false,
          }));
          return;
        }
        if (data.type === 'complete') {
          es.close();
          eventSourceRef.current = null;
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
      } catch (e) { console.warn('Sitemap crawl failed for URL:', e); }
    };

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;
      setState(prev => {
        if (prev.status === 'complete') return prev;
        return { status: 'error', message: 'Connection lost. The crawl may have timed out.' };
      });
    };
  }, [url, exclusions, maxPages]);

  const cancelCrawl = () => {
    abortRef.current = true;
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    setState({ status: 'idle' });
  };

  const handleCopy = () => {
    if (state.status !== 'complete') return;
    clipboardWrite(state.xml);
    toast.success('Copied XML Sitemap!');
  };

  const handleDownloadXml = () => {
    if (state.status !== 'complete') return;
    const blob = new Blob([state.xml], { type: 'application/xml' });
    const blobUrl = URL.createObjectURL(blob);
    downloadOrShare(blobUrl, 'sitemap.xml');
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
  };

  const handleDownloadHtml = () => {
    if (state.status !== 'complete') return;
    const blob = new Blob([state.html], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    downloadOrShare(blobUrl, 'sitemap.html');
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
  };

  const handleDownloadTxt = () => {
    if (state.status !== 'complete') return;
    const blob = new Blob([state.txt], { type: 'text/plain' });
    const blobUrl = URL.createObjectURL(blob);
    downloadOrShare(blobUrl, 'urls.txt');
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Input Section */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 mb-1">
          <Globe className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-bold text-[var(--text-primary)]">XML Sitemap Generator</h2>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Enter a website URL to crawl and generate a search-engine ready XML sitemap.
          {state.status !== 'complete' && <span className="text-emerald-500 font-medium"> The only free sitemap generator that works with React, Next.js &amp; Vue.</span>}
        </p>

        {state.status !== 'complete' && (
          <>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && startCrawl()}
                  placeholder="https://yourwebsite.com — works with React, Next.js & Vue too"
                  className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-emerald-500/50 transition-colors placeholder:text-zinc-400"
                  disabled={isCrawling}
                />
              </div>
              <button
                onClick={isCrawling ? cancelCrawl : startCrawl}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                  isCrawling
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                {isCrawling ? 'Cancel' : 'Generate Sitemap →'}
              </button>
            </div>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              <Settings2 className="w-3.5 h-3.5" />
              Advanced settings
              {showSettings ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>

            {showSettings && (
              <div className="space-y-4 p-4 bg-zinc-50 dark:bg-black/20 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div>
                  <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Max pages to crawl</label>
                  <select
                    value={maxPages}
                    onChange={e => setMaxPages(Number(e.target.value))}
                    className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs outline-none"
                    disabled={isCrawling}
                  >
                    <option value={30}>30 pages (quick test)</option>
                    <option value={50}>50 pages (free)</option>
                    <option value={100}>100 pages (free)</option>
                    <option value={200}>200 pages (signed in)</option>
                    <option value={500}>500 pages (Pro)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-500 mb-1.5 block">
                    Exclude URL patterns <span className="text-zinc-400 font-normal">— skip matching paths</span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newExclusion}
                      onChange={e => setNewExclusion(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addExclusion()}
                      placeholder="/tag/*, /author/*, ?page=*"
                      className="flex-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs outline-none"
                      disabled={isCrawling}
                    />
                    <button onClick={addExclusion} className="px-3 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg text-xs transition-colors" disabled={isCrawling}>Add</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {exclusions.map((e, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
                        {e.pattern}
                        <button onClick={() => removeExclusion(i)} className="text-zinc-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
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
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-zinc-500">Detecting site type…</span>
        </div>
      )}

      {/* Crawling progress */}
      {state.status === 'crawling' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-500" />
                Crawling {new URL(state.url).hostname}
              </h3>
              <span className="text-xs text-zinc-400 font-mono">
                {state.crawled} of ~{state.max} pages
              </span>
            </div>

            <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (state.crawled / state.max) * 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-[var(--text-primary)]">{state.discovered}</div>
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Discovered</div>
              </div>
              <div>
                <div className="text-xl font-bold text-emerald-500">{state.crawled}</div>
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Crawled</div>
              </div>
              <div>
                <div className="text-xl font-bold text-[var(--text-primary)]">{state.max}</div>
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Max</div>
              </div>
            </div>

            {state.jsRendering && (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg text-xs text-amber-700 dark:text-amber-400">
                <Zap className="w-3.5 h-3.5" />
                JavaScript site detected — using browser rendering mode
              </div>
            )}

            <div className="h-48 overflow-y-auto bg-black/5 dark:bg-white/5 rounded-xl p-3 font-mono text-[11px] leading-relaxed">
              {state.log.map((entry, i) => (
                <div key={i} className="text-zinc-500 dark:text-zinc-400 truncate">
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
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-[var(--text-primary)]"><strong className="text-lg">{state.pages.length}</strong> URLs</span>
                <span className="w-px h-6 bg-zinc-200 dark:bg-zinc-700" />
                <span className="text-[var(--text-secondary)]">Generated in <strong>{(state.durationMs / 1000).toFixed(1)}s</strong></span>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl text-xs transition-colors">
                  <Copy className="w-3.5 h-3.5" /> Copy XML
                </button>
                <button onClick={handleDownloadXml} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download XML
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-4 flex-wrap">
              <button onClick={handleDownloadHtml} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-[11px] transition-colors">
                <FileText className="w-3 h-3" /> HTML Sitemap
              </button>
              <button onClick={handleDownloadTxt} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-[11px] transition-colors">
                <List className="w-3 h-3" /> URL List (.txt)
              </button>
              <button onClick={() => setState({ status: 'idle' })} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-[11px] transition-colors ml-auto">
                Generate another →
              </button>
            </div>
          </div>

          {/* SEO Insights */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              SEO Health Check
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <div className="text-lg font-bold text-emerald-500">{state.insights.healthyPages}</div>
                <div className="text-[10px] text-zinc-400">Healthy pages</div>
              </div>
              <div className="px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <div className="text-lg font-bold text-amber-500">{state.insights.missingMeta}</div>
                <div className="text-[10px] text-zinc-400">Missing meta description</div>
              </div>
              <div className="px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <div className="text-lg font-bold text-red-500">{state.insights.brokenLinks}</div>
                <div className="text-[10px] text-zinc-400">Broken links (4xx/5xx)</div>
              </div>
              <div className="px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <div className="text-lg font-bold text-amber-500">{state.insights.duplicateTitles}</div>
                <div className="text-[10px] text-zinc-400">Duplicate page titles</div>
              </div>
            </div>
            {state.insights.missingMeta > 0 && (
              <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg text-xs text-amber-700 dark:text-amber-400">
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
              <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg text-xs text-amber-700 dark:text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{state.insights.duplicateTitles} page{state.insights.duplicateTitles > 1 ? 's have' : ' has'} duplicate title tags.</span>
              </div>
            )}
            {state.insights.healthyPages === state.pages.length && (
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg text-xs text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                All {state.pages.length} pages look healthy.
              </div>
            )}
          </div>

          {/* XML Preview */}
          <details className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
            <summary className="px-5 py-3.5 text-sm font-bold text-[var(--text-primary)] cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 flex items-center gap-2 transition-colors">
              <ChevronRight className="w-4 h-4" />
              Preview XML ({state.pages.length} URLs)
            </summary>
            <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
              <pre className="bg-black/5 dark:bg-white/5 rounded-xl p-4 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 overflow-x-auto max-h-80 overflow-y-auto leading-relaxed">
                {state.xml.slice(0, 3000)}
                {state.xml.length > 3000 && '\n\n… (truncated for preview)'}
              </pre>
            </div>
          </details>

          {/* Next Steps */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-5">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              What to do next
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <span className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold flex items-center justify-center shrink-0">1</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">Upload to your server root</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Upload sitemap.xml to the root of your website so search engines can find it.</p>
                  <pre className="mt-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-[11px] font-mono text-zinc-600 dark:text-zinc-400">Upload sitemap.xml → /public_html/sitemap.xml</pre>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold flex items-center justify-center shrink-0">2</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">Add to robots.txt</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Tell all search engine bots where your sitemap is.</p>
                  <pre className="mt-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-[11px] font-mono text-zinc-600 dark:text-zinc-400">Sitemap: {state.url}sitemap.xml</pre>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold flex items-center justify-center shrink-0">3</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">Submit to Google Search Console</p>
                  <a
                    href="https://search.google.com/search-console/sitemaps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Open Google Search Console <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold flex items-center justify-center shrink-0">4</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">Submit to Bing Webmaster Tools</p>
                  <a
                    href="https://www.bing.com/webmasters/sitemaps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-xs font-medium rounded-xl transition-colors"
                  >
                    Open Bing Webmaster Tools <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <FileText className="w-4 h-4 text-zinc-400" />
              Frequently Asked Questions
            </h3>
            {FAQS.map((faq, i) => (
              <details key={i} className="group">
                <summary className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer py-2 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-open:rotate-90 transition-transform shrink-0" />
                  {faq.q}
                </summary>
                <p className="pl-5.5 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed pb-2">{faq.a}</p>
              </details>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

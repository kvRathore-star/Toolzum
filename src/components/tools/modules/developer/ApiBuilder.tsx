"use client";
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Send, Plus, Trash2, Copy, ChevronDown, ChevronRight, Clock, Book, Code, Globe, Shield, Terminal, Download } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";


type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
type BodyType = 'none' | 'json' | 'text' | 'form';

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

const methodColors: Record<HttpMethod, string> = {
  GET: 'text-emerald-700 dark:text-emerald-400 bg-emerald-700/10',
  POST: 'text-blue-700 dark:text-blue-400 bg-blue-500/10',
  PUT: 'text-amber-700 dark:text-amber-400 bg-amber-500/10',
  DELETE: 'text-red-700 dark:text-red-400 bg-red-500/10',
  PATCH: 'text-purple-700 dark:text-purple-400 bg-purple-500/10',
  HEAD: 'text-zinc-400 bg-zinc-500/10',
  OPTIONS: 'text-zinc-400 bg-zinc-500/10',
};

const inputClass = "w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)] text-[var(--text-primary)] font-mono";
const labelClass = "block text-[10px] uppercase tracking-wider font-medium mb-1 text-[var(--text-tertiary)]";

interface KeyValue { key: string; value: string; enabled: boolean; id: string; }
interface SavedRequest { name: string; method: HttpMethod; url: string; headers: KeyValue[]; body: string; bodyType: BodyType; id: string; }
interface HistoryEntry { method: HttpMethod; url: string; status: number; time: string; id: string; }
interface Collection { name: string; requests: SavedRequest[]; id: string; }

const STORAGE_KEY = 'api-builder-data';

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; } catch { return fallback; }
}

function saveToStorage(key: string, data: unknown) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* ignore */ }
}

function genId() { return Math.random().toString(36).slice(2, 10); }

function kvPair(k: string, v: string, e = true): KeyValue { return { key: k, value: v, enabled: e, id: genId() }; }

function generateCode(method: HttpMethod, url: string, headers: KeyValue[], body: string, bodyType: BodyType, lang: 'curl' | 'fetch' | 'axios'): string {
  const activeHeaders = headers.filter(h => h.enabled && h.key);
  const headerLines = activeHeaders.map(h => `  "${h.key}": "${h.value}"`).join(',\n');
  const hasBody = bodyType !== 'none' && body.trim();

  if (lang === 'curl') {
    let cmd = `curl -X ${method} '${url}'`;
    for (const h of activeHeaders) cmd += ` \\\n  -H '${h.key}: ${h.value}'`;
    if (hasBody) {
      if (bodyType === 'json') cmd += ` \\\n  -H 'Content-Type: application/json' \\\n  -d '${body}'`;
      else cmd += ` \\\n  -d '${body}'`;
    }
    return cmd;
  }

  if (lang === 'fetch') {
    let code = `fetch('${url}', {\n  method: '${method}',`;
    if (activeHeaders.length) code += `\n  headers: {\n${headerLines}\n  }`;
    if (hasBody) {
      if (bodyType === 'json') code += `,\n  body: JSON.stringify(${body})`;
      else code += `,\n  body: '${body}'`;
    }
    code += '\n})';
    return code;
  }

  let code = `axios({\n  method: '${method.toLowerCase()}',\n  url: '${url}',`;
  if (activeHeaders.length) code += `\n  headers: {\n${headerLines}\n  }`;
  if (hasBody) {
    if (bodyType === 'json') code += `,\n  data: ${body}`;
    else code += `,\n  data: '${body}'`;
  }
  code += '\n})';
  return code;
}

export function ApiBuilder() {
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [headers, setHeaders] = useState<KeyValue[]>([kvPair('Content-Type', 'application/json')]);
  const [body, setBody] = useState('');
  const [bodyType, setBodyType] = useState<BodyType>('none');
  const [params, setParams] = useState<KeyValue[]>([]);
  const [response, setResponse] = useState<{ status: number; statusText: string; headers: Record<string, string>; body: string; time: string; size: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadFromStorage('api-history', []));
  const [collections, setCollections] = useState<Collection[]>(() => loadFromStorage('api-collections', []));
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [snippetLang, setSnippetLang] = useState<'curl' | 'fetch' | 'axios'>('curl');
  const [showSnippets, setShowSnippets] = useState(false);
  const [showCollections, setShowCollections] = useState(true);
  const [savedName, setSavedName] = useState('');
  const responseRef = useRef<HTMLDivElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);

  useEffect(() => { saveToStorage('api-history', history); }, [history]);
  useEffect(() => { saveToStorage('api-collections', collections); }, [collections]);

  // Keyboard: Ctrl+Enter to send
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); sendRequest(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const addHeader = useCallback(() => setHeaders(h => [...h, kvPair('', '')]), []);
  const removeHeader = useCallback((id: string) => setHeaders(h => h.filter(x => x.id !== id)), []);
  const updateHeader = useCallback((id: string, field: 'key' | 'value', val: string) => {
    setHeaders(h => h.map(x => x.id === id ? { ...x, [field]: val } : x));
  }, []);
  const toggleHeader = useCallback((id: string) => {
    setHeaders(h => h.map(x => x.id === id ? { ...x, enabled: !x.enabled } : x));
  }, []);

  const addParam = useCallback(() => setParams(p => [...p, kvPair('', '')]), []);
  const removeParam = useCallback((id: string) => setParams(p => p.filter(x => x.id !== id)), []);
  const updateParam = useCallback((id: string, field: 'key' | 'value', val: string) => {
    setParams(p => p.map(x => x.id === id ? { ...x, [field]: val } : x));
  }, []);
  const toggleParam = useCallback((id: string) => {
    setParams(p => p.map(x => x.id === id ? { ...x, enabled: !x.enabled } : x));
  }, []);

  const buildUrl = useCallback(() => {
    const activeParams = params.filter(p => p.enabled && p.key);
    if (!activeParams.length) return url;
    const qs = activeParams.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&');
    return url + (url.includes('?') ? '&' : '?') + qs;
  }, [url, params]);

  const sendRequest = useCallback(async () => {
    if (!url.trim()) { setError('Enter a URL'); return; }
    setLoading(true);
    setError('');
    setResponse(null);
    const start = performance.now();
    try {
      const fullUrl = buildUrl();
      const activeHeaders = headers.filter(h => h.enabled && h.key);
      const reqHeaders: Record<string, string> = {};
      for (const h of activeHeaders) reqHeaders[h.key] = h.value;
      const opts: RequestInit = { method, headers: reqHeaders };
      if (bodyType !== 'none' && body.trim()) {
        if (bodyType === 'json') {
          opts.body = body;
          if (!reqHeaders['Content-Type']) reqHeaders['Content-Type'] = 'application/json';
        } else {
          opts.body = body;
        }
      }
      const res = await fetch(fullUrl, opts);
      const elapsed = ((performance.now() - start) / 1000).toFixed(2);
      let resBody: string;
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const json = await res.json();
        resBody = JSON.stringify(json, null, 2);
      } else {
        resBody = await res.text();
      }
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => { resHeaders[k] = v; });
      const size = new TextEncoder().encode(resBody).length;
      const resp = {
        status: res.status,
        statusText: res.statusText,
        headers: resHeaders,
        body: resBody,
        time: elapsed + 's',
        size: size > 1024 ? `${(size / 1024).toFixed(1)} KB` : `${size} B`,
      };
      setResponse(resp);
      setHistory(h => [{ method, url: fullUrl, status: res.status, time: elapsed + 's', id: genId() }, ...h].slice(0, 50));
    } catch (e) {
      const elapsed = ((performance.now() - start) / 1000).toFixed(2);
      setError(e instanceof TypeError ? `Network error: ${e.message}. Check CORS or try a different URL.` : String(e));
      setHistory(h => [{ method, url: buildUrl(), status: 0, time: elapsed + 's', id: genId() }, ...h].slice(0, 50));
    }
    setLoading(false);
  }, [url, method, headers, body, bodyType, params, buildUrl]);

  const saveToCollection = useCallback(() => {
    const name = savedName.trim() || `Request ${Date.now()}`;
    const req: SavedRequest = { name, method, url, headers, body, bodyType, id: genId() };
    if (activeCollection) {
      setCollections(cols => cols.map(c => c.id === activeCollection ? { ...c, requests: [...c.requests, req] } : c));
    } else {
      const newCol: Collection = { name: 'My Requests', requests: [req], id: genId() };
      setCollections(cols => [...cols, newCol]);
      setActiveCollection(newCol.id);
    }
    setSavedName('');
  }, [savedName, method, url, headers, body, bodyType, activeCollection]);

  const loadRequest = useCallback((req: SavedRequest) => {
    setMethod(req.method);
    setUrl(req.url);
    setHeaders(req.headers);
    setBody(req.body);
    setBodyType(req.bodyType);
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  const snippet = useMemo(() => {
    if (!url.trim()) return '';
    return generateCode(method, buildUrl(), headers, body, bodyType, snippetLang);
  }, [method, url, headers, body, bodyType, snippetLang, buildUrl]);

  const copyToClipboard = useCallback((text: string) => {
  void clipboardWrite(text);
  }, []);

  const statusColor = (s: number) => {
    if (s >= 200 && s < 300) return 'text-emerald-700 dark:text-emerald-400';
    if (s >= 300 && s < 400) return 'text-amber-700 dark:text-amber-400';
    if (s >= 400) return 'text-red-700 dark:text-red-400';
    return 'text-zinc-400';
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">API Builder & Tester</h2>
            <p className="text-[10px] text-[var(--text-tertiary)]">Requests go directly from your browser — your API keys never touch a server</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[var(--text-tertiary)]">
          <span className="px-2 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]">Ctrl+Enter Send</span>
          <span className="px-2 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]">⌘+Enter Send</span>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Collections sidebar */}
        <div className="w-56 shrink-0">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
            <button aria-expanded={showCollections} onClick={() => setShowCollections(!showCollections)} className="flex items-center justify-between w-full px-4 py-3 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors">
              <div className="flex items-center gap-2"><Book size={14} /> Collections ({collections.length})</div>
              {showCollections ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {showCollections && (
              <div className="px-2 pb-2 space-y-1 max-h-[60vh] overflow-y-auto">
                {collections.length === 0 && <p className="text-[10px] text-[var(--text-tertiary)] px-2 py-3 text-center">No saved requests yet</p>}
                {collections.map(col => (
                  <div key={col.id}>
                    <button aria-expanded={activeCollection === col.id} onClick={() => setActiveCollection(activeCollection === col.id ? null : col.id)} className={`flex items-center gap-1 w-full text-left px-2 py-1.5 rounded-lg text-[11px] transition-colors ${activeCollection === col.id ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'}`}>
                      {activeCollection === col.id ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      <span className="font-medium">{col.name}</span>
                      <span className="text-[var(--text-muted)] ml-auto">({col.requests.length})</span>
                    </button>
                    {activeCollection === col.id && col.requests.map(req => (
                      <button key={req.id} onClick={() => loadRequest(req)} className="flex items-center gap-1.5 w-full text-left pl-6 pr-2 py-1 rounded-lg text-[10px] text-[var(--text-tertiary)] hover:bg-[var(--bg-surface)] transition-colors">
                        <span className={`w-12 font-mono font-bold ${methodColors[req.method].split(' ')[0]}`}>{req.method}</span>
                        <span className="truncate">{req.name}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* History */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden mt-3">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2"><Clock size={14} /> History</span>
              {history.length > 0 && <button onClick={clearHistory} className="text-[10px] text-[var(--text-tertiary)] hover:text-red-700 dark:hover:text-red-400 transition-colors">Clear</button>}
            </div>
            <div className="px-2 pb-2 space-y-0.5 max-h-[40vh] overflow-y-auto">
              {history.length === 0 && <p className="text-[10px] text-[var(--text-tertiary)] px-2 py-2 text-center">No requests yet</p>}
              {history.map(entry => (
                <div key={entry.id} className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px]">
                  <span className={`w-10 font-mono font-bold ${(methodColors[entry.method] || '').split(' ')[0]}`}>{entry.method}</span>
                  <span className={statusColor(entry.status)}>{entry.status || 'ERR'}</span>
                  <span className="text-[var(--text-tertiary)] truncate flex-1">{entry.url.length > 30 ? entry.url.slice(0, 30) + '...' : entry.url}</span>
                  <span className="text-[var(--text-muted)]">{entry.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Panel */}
        <div className="flex-1 space-y-3">
          {/* URL Bar */}
          <div className="flex gap-2">
            <select aria-label="HTTP method" value={method} onChange={e => setMethod(e.target.value as HttpMethod)} className={`px-3 py-2 rounded-lg text-xs font-bold font-mono border border-[var(--border-subtle)] bg-[var(--bg-surface)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)] ${(methodColors[method] || '').split(' ').map(c => c).join(' ')}`}>
              {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <div className="flex-1 relative">
              <input ref={urlRef} type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://api.example.com/endpoint" aria-label="Request URL" className={`${inputClass} pr-20`} onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendRequest(); }} />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button onClick={() => copyToClipboard(url)} className="p-1 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors" title="Copy URL" aria-label="Copy URL"><Copy size={14} /></button>
              </div>
            </div>
            <button onClick={sendRequest} disabled={loading} className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-gradient-to-r from-[var(--accent-ink)] to-[var(--accent-ink)] hover:from-[var(--accent-ink)] hover:to-[var(--accent-ink)] text-white text-sm font-medium transition-all active:scale-95 shadow-lg disabled:opacity-50">
              <Send size={15} /> {loading ? 'Sending...' : 'Send'}
            </button>
          </div>

          {/* Query Params */}
          <details className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl">
            <summary className="px-4 py-2.5 text-xs font-medium text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition-colors flex items-center gap-2">
              <Globe size={13} /> Query Params {params.filter(p => p.enabled && p.key).length > 0 && <span className="text-[10px] text-[var(--accent)]">({params.filter(p => p.enabled && p.key).length})</span>}
            </summary>
            <div className="px-4 pb-3 space-y-1.5">
              {params.map(p => (
                <div key={p.id} className="flex gap-1.5 items-center">
                  <input type="checkbox" checked={p.enabled} onChange={() => toggleParam(p.id)} className="accent-indigo-500" />
                  <input type="text" placeholder="Key" aria-label="Parameter key" value={p.key} onChange={e => updateParam(p.id, 'key', e.target.value)} className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-2 py-1 text-xs font-mono focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-1 focus:ring-[var(--accent)]" />
                  <input type="text" placeholder="Value" aria-label="Parameter value" value={p.value} onChange={e => updateParam(p.id, 'value', e.target.value)} className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-2 py-1 text-xs font-mono focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-1 focus:ring-[var(--accent)]" />
                  <button onClick={() => removeParam(p.id)} className="p-1 text-[var(--text-tertiary)] hover:text-red-700 dark:hover:text-red-400 transition-colors" aria-label="Remove parameter"><Trash2 size={13} /></button>
                </div>
              ))}
              <button onClick={addParam} className="flex items-center gap-1 text-[10px] text-[var(--accent)] hover:opacity-80 transition-colors"><Plus size={12} /> Add param</button>
            </div>
          </details>

          {/* Headers */}
          <details className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl">
            <summary className="px-4 py-2.5 text-xs font-medium text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition-colors flex items-center gap-2">
              <Shield size={13} /> Headers {headers.filter(h => h.enabled && h.key).length > 0 && <span className="text-[10px] text-[var(--accent)]">({headers.filter(h => h.enabled && h.key).length})</span>}
            </summary>
            <div className="px-4 pb-3 space-y-1.5">
              {headers.map(h => (
                <div key={h.id} className="flex gap-1.5 items-center">
                  <input type="checkbox" checked={h.enabled} onChange={() => toggleHeader(h.id)} className="accent-indigo-500" />
                  <input type="text" placeholder="Header" aria-label="Header name" value={h.key} onChange={e => updateHeader(h.id, 'key', e.target.value)} className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-2 py-1 text-xs font-mono focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-1 focus:ring-[var(--accent)]" />
                  <input type="text" placeholder="Value" aria-label="Header value" value={h.value} onChange={e => updateHeader(h.id, 'value', e.target.value)} className="flex-[2] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-2 py-1 text-xs font-mono focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-1 focus:ring-[var(--accent)]" />
                  <button onClick={() => removeHeader(h.id)} className="p-1 text-[var(--text-tertiary)] hover:text-red-700 dark:hover:text-red-400 transition-colors" aria-label="Remove header"><Trash2 size={13} /></button>
                </div>
              ))}
              <button onClick={addHeader} className="flex items-center gap-1 text-[10px] text-[var(--accent)] hover:opacity-80 transition-colors"><Plus size={12} /> Add header</button>
            </div>
          </details>

          {/* Body */}
          <details className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl">
            <summary className="px-4 py-2.5 text-xs font-medium text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition-colors flex items-center gap-2">
              <Code size={13} /> Body {bodyType !== 'none' && <span className="text-[10px] text-[var(--accent)]">{bodyType.toUpperCase()}</span>}
            </summary>
            <div className="px-4 pb-3 space-y-2">
              <select aria-label="Body type" value={bodyType} onChange={e => setBodyType(e.target.value as BodyType)} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-2 py-1 text-xs focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-1 focus:ring-[var(--accent)] text-[var(--text-primary)]">
                <option value="none">None</option>
                <option value="json">JSON</option>
                <option value="text">Text</option>
              </select>
              {bodyType !== 'none' && (
                <textarea aria-label="Request body" value={body} onChange={e => setBody(e.target.value)} rows={6} placeholder={bodyType === 'json' ? '{\n  "key": "value"\n}' : 'Enter request body...'} className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-1 focus:ring-[var(--accent)] text-[var(--text-primary)] resize-y" />
              )}
            </div>
          </details>

          {/* Save & Snippet bar */}
          <div className="flex items-center gap-2">
            <input type="text" value={savedName} onChange={e => setSavedName(e.target.value)} placeholder="Request name..." aria-label="Request name" className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-xs focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-1 focus:ring-[var(--accent)] text-[var(--text-primary)] max-w-xs" />
            <button onClick={saveToCollection} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"><Book size={13} /> Save</button>
            <div className="flex-1" />
            <select aria-label="Snippet language" value={snippetLang} onChange={e => setSnippetLang(e.target.value as 'curl' | 'fetch' | 'axios')} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-2 py-1 text-xs focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 text-[var(--text-primary)]">
              <option value="curl">cURL</option>
              <option value="fetch">Fetch</option>
              <option value="axios">Axios</option>
            </select>
            {snippet && (
              <button onClick={() => copyToClipboard(snippet)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"><Copy size={13} /> Copy Code</button>
            )}
          </div>

          {/* Response */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="text-xs font-bold text-red-700 dark:text-red-400 mb-1">Error</div>
              <div className="text-xs text-red-300 font-mono whitespace-pre-wrap">{error}</div>
            </div>
          )}

          {response && (
            <div ref={responseRef} className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold font-mono ${statusColor(response.status)}`}>{response.status}</span>
                  <span className="text-xs text-[var(--text-secondary)]">{response.statusText}</span>
                  <span className="text-[10px] text-[var(--text-tertiary)]">· {response.time}</span>
                  <span className="text-[10px] text-[var(--text-tertiary)]">· {response.size}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => copyToClipboard(response.body)} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[var(--bg-surface)] text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"><Copy size={12} /> Copy</button>
                </div>
              </div>

              {/* Response tabs */}
              <div className="px-5">
                <div className="flex gap-4 border-b border-[var(--border-subtle)]">
                  <span className="text-xs font-medium text-[var(--accent)] border-b-2 border-[var(--accent)] pb-2 -mb-[1px]">Body</span>
                  <span className="text-xs text-[var(--text-tertiary)] pb-2">Headers ({Object.keys(response.headers).length})</span>
                </div>
                <pre className="text-xs font-mono text-[var(--text-primary)] py-4 overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap">{response.body}</pre>
              </div>

              {/* Code snippet */}
              {snippet && (
                <div className="border-t border-[var(--border-subtle)] px-5 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Code Snippet ({snippetLang})</span>
                    <button onClick={() => copyToClipboard(snippet)} className="flex items-center gap-1 text-[10px] text-[var(--accent)] hover:opacity-80 transition-colors"><Copy size={11} /> Copy</button>
                  </div>
                  <pre className="text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-surface)] rounded-lg p-3 overflow-x-auto whitespace-pre-wrap max-h-32 overflow-y-auto">{snippet}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

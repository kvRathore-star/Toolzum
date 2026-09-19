"use client";
import { useState } from 'react';
import { clipboardWrite } from "@/lib/clipboard";


export default function ApiMockServerConfig() {
  const [endpoints, setEndpoints] = useState('/users: [{ "id": 1, "name": "John" }]\n/posts: [{ "id": 1, "title": "Hello" }]');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const presets = [
    { label: 'Simple CRUD', data: '/users: [{ "id": 1, "name": "John" }]\n/posts: [{ "id": 1, "title": "Hello" }]\n/comments: [{ "id": 1, "body": "Nice post!" }]' },
    { label: 'Blog API', data: '/posts: [{ "id": 1, "title": "First Post", "body": "Content here" }]\n/authors: [{ "id": 1, "name": "Jane Doe" }]\n/categories: [{ "id": 1, "name": "Tech" }]' },
  ];
  const calc = () => {
    const lines = endpoints.split('\n').filter(Boolean);
    const config: Record<string, any> = {};
    for (const line of lines) {
      const [key, ...rest] = line.split(':');
      if (!key) continue;
      try {
        const val = JSON.parse(rest.join(':').trim());
        config[key.trim()] = val;
      } catch { config[key.trim()] = []; }
    }
    const db = { posts: [], comments: [], ...config };
    const jsonServer = JSON.stringify({ "db": db, "routes": Object.keys(db).reduce((acc: Record<string, string>, k: string) => { acc[`/api/${k}`] = `/${k}`; return acc; }, {}) }, null, 2);
    setResult(jsonServer);
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Mock Server Config</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setEndpoints(p.data); setResult(''); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-amber-400 text-[var(--text-secondary)] hover:text-amber-600 transition-colors">
              {p.label}
            </button>
          ))}
        </div>
        <div>
          <label htmlFor="lbl-apimockserverconfig-endpoints-key-json-array-one-per-line" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Endpoints (key: JSON array, one per line)</label>
          <textarea id="lbl-apimockserverconfig-endpoints-key-json-array-one-per-line" aria-label="Endpoints (key: JSON array, one per line)" value={endpoints} onChange={e => { setEndpoints(e.target.value); setResult(''); }} rows={4} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate Config</button>
        {result && (
          <div className="relative">
            <pre className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs font-mono overflow-x-auto max-h-64 whitespace-pre-wrap break-all">{result}</pre>
            <button onClick={() => { void clipboardWrite(result); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="absolute top-2 right-2 px-2.5 py-1 text-[10px] bg-[var(--bg-overlay)] hover:bg-[var(--bg-elevated)] rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

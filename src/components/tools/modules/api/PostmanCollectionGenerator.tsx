"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";


export default function PostmanCollectionGenerator() {
  const [endpoints, setEndpoints] = useState('GET /users List users\nPOST /users Create user\nGET /users/:id Get user');
  const [baseUrl, setBaseUrl] = useState('https://api.example.com');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const presets = [
    { label: 'Users CRUD', data: 'GET /users List users\nPOST /users Create user\nGET /users/:id Get user\nPUT /users/:id Update user\nDELETE /users/:id Delete user' },
    { label: 'Posts API', data: 'GET /posts List posts\nPOST /posts Create post\nGET /posts/:id Get post' },
  ];
  const calc = () => {
    const lines = endpoints.split('\n').filter(Boolean);
    const base = baseUrl.trim().replace(/\/$/, '') || 'https://api.example.com';
    const items = lines.map(l => {
      const [method, path, ...descParts] = l.split(' ');
      const cleanPath = (path || '/').split('/').filter(Boolean).map(s => s.replace(/^:/, ':'));
      return {
        name: descParts.join(' ') || path,
        request: { method: (method || 'GET').toUpperCase(), header: [], url: { raw: `${base}/${cleanPath.join('/')}`, host: ['{{baseUrl}}'], path: cleanPath } },
      };
    });
    const collection = {
      info: { name: 'API Collection', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
      item: items,
      variable: [{ key: 'baseUrl', value: base, type: 'string' }],
    };
    setResult(JSON.stringify(collection, null, 2));
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Postman Collection Generator</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setEndpoints(p.data); setResult(''); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-orange-400 text-[var(--text-secondary)] hover:text-orange-600 transition-colors">{p.label}</button>
          ))}
        </div>
        <div className="space-y-3">
          <div>
            <label htmlFor="lbl-postmancollectiongenerator-base-url" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Base URL (saved as {"{{baseUrl}}"} variable)</label>
            <input id="lbl-postmancollectiongenerator-base-url" aria-label="Base URL" type="text" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder="https://api.example.com" className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label htmlFor="lbl-postmancollectiongenerator-endpoints-method-path-description-one-pe" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Endpoints (METHOD /path description, one per line)</label>
            <textarea id="lbl-postmancollectiongenerator-endpoints-method-path-description-one-pe" aria-label="Endpoints (METHOD /path description, one per line)" value={endpoints} onChange={e => setEndpoints(e.target.value)} rows={4} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate</button>
        {result && (
          <div className="relative">
            <pre className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs font-mono overflow-x-auto max-h-64 whitespace-pre-wrap break-all">{result}</pre>
            <button onClick={() => { clipboardWrite(result).then(ok => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); } else toast.error('Copy blocked by the browser — select the text manually.'); }); }}
              className="absolute top-2 right-2 px-2.5 py-1 text-[10px] bg-[var(--bg-overlay)] hover:bg-[var(--bg-elevated)] rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import { useState } from 'react';

export default function PostmanToOpenapiConverter() {
  const [collection, setCollection] = useState('{"info":{"name":"My API"},"item":[{"name":"Users","request":{"method":"GET","url":{"raw":"https://api.example.com/users"}}}]}');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const calc = () => {
    try {
      const c = JSON.parse(collection);
      const paths: Record<string, any> = {};
      for (const item of c.item || []) {
        const path = item.request?.url?.raw ? new URL(item.request.url.raw).pathname : '/' + (item.name || '').toLowerCase();
        const method = (item.request?.method || 'GET').toLowerCase();
        paths[path] = paths[path] || {};
        paths[path][method] = { summary: item.name || '', responses: { '200': { description: 'OK' } } };
      }
      const spec = { openapi: '3.0.0', info: { title: c.info?.name || 'API', version: '1.0.0' }, paths };
      setResult(JSON.stringify(spec, null, 2));
    } catch {
      setResult('Error: Invalid Postman collection JSON');
    }
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Postman to OpenAPI Converter</h2>
        <div>
          <label htmlFor="lbl-postmantoopenapiconverter-postman-collection-json" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Postman Collection (JSON)</label>
          <textarea id="lbl-postmantoopenapiconverter-postman-collection-json" aria-label="Postman Collection (JSON)" value={collection} onChange={e => setCollection(e.target.value)} rows={4} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Convert</button>
        {result && (
          <div className="relative">
            <pre className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs font-mono overflow-x-auto max-h-64 whitespace-pre-wrap break-all">{result}</pre>
            <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="absolute top-2 right-2 px-2.5 py-1 text-[10px] bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

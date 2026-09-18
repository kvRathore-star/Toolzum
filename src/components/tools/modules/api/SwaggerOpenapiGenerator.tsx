"use client";
import { useState } from 'react';
import { clipboardWrite } from "@/lib/clipboard";


export default function SwaggerOpenapiGenerator() {
  const [title, setTitle] = useState('Pet Store API');
  const [version, setVersion] = useState('1.0.0');
  const [desc, setDesc] = useState('A sample pet store API');
  const [endpoints, setEndpoints] = useState('GET /pets List all pets\nPOST /pets Create a pet\nGET /pets/{petId} Get pet by ID');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const presets = [
    { label: 'Pet Store', t: 'Pet Store API', v: '1.0.0', d: 'A sample pet store API', e: 'GET /pets List all pets\nPOST /pets Create a pet\nGET /pets/{petId} Get pet by ID' },
    { label: 'Blog API', t: 'Blog API', v: '2.0.0', d: 'A simple blog API', e: 'GET /posts List posts\nPOST /posts Create post\nGET /posts/{id} Get post' },
  ];
  const calc = () => {
    const lines = endpoints.split('\n').filter(Boolean);
    const paths: Record<string, any> = {};
    for (const line of lines) {
      const [method, path, ...descParts] = line.split(' ');
      const m = method!.toLowerCase();
      paths[path!] = paths[path!] || {};
      paths[path!][m] = { summary: descParts.join(' '), responses: { '200': { description: 'OK', content: { 'application/json': { schema: { type: 'object' } } } } } };
    }
    const spec = { openapi: '3.0.0', info: { title, version, description: desc }, paths };
    setResult(JSON.stringify(spec, null, 2));
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Swagger/OpenAPI Generator</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setTitle(p.t); setVersion(p.v); setDesc(p.d); setEndpoints(p.e); setResult(''); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-green-400 text-[var(--text-secondary)] hover:text-green-600 transition-colors">{p.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="lbl-swaggeropenapigenerator-title" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Title</label>
            <input id="lbl-swaggeropenapigenerator-title" aria-label="Title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
          <div>
            <label htmlFor="lbl-swaggeropenapigenerator-version" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Version</label>
            <input id="lbl-swaggeropenapigenerator-version" aria-label="Version" type="text" value={version} onChange={e => setVersion(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label htmlFor="lbl-swaggeropenapigenerator-description" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Description</label>
            <input id="lbl-swaggeropenapigenerator-description" aria-label="Description" type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
        </div>
        <div>
          <label htmlFor="lbl-swaggeropenapigenerator-endpoints-method-path-description-one-pe" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Endpoints (METHOD /path description, one per line)</label>
          <textarea id="lbl-swaggeropenapigenerator-endpoints-method-path-description-one-pe" aria-label="Endpoints (METHOD /path description, one per line)" value={endpoints} onChange={e => setEndpoints(e.target.value)} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate Spec</button>
        {result && (
          <div className="relative">
            <pre className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs font-mono overflow-x-auto max-h-64 whitespace-pre-wrap break-all">{result}</pre>
            <button onClick={() => { void clipboardWrite(result); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="absolute top-2 right-2 px-2.5 py-1 text-[10px] bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

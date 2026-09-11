"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function MockApiResponseGenerator() {
  const [schema, setSchema] = useState('{\n  "users": [\n    { "id": "number", "name": "string", "email": "string", "active": "boolean" }\n  ],\n  "total": "number"\n}');
  const [count, setCount] = useState(5);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const presets = [
    { label: 'User List', schema: '{\n  "users": [\n    { "id": "number", "name": "string", "email": "string", "active": "boolean" }\n  ],\n  "total": "number"\n}' },
    { label: 'Product Catalog', schema: '{\n  "products": [\n    { "id": "number", "title": "string", "price": "number", "inStock": "boolean", "tags": ["string"] }\n  ],\n  "page": "number",\n  "perPage": "number"\n}' },
    { label: 'Blog Posts', schema: '{\n  "posts": [\n    { "id": "number", "title": "string", "slug": "string", "content": "string", "publishedAt": "date" }\n  ],\n  "meta": { "total": "number", "page": "number" }\n}' },
  ];

  const generate = (type: string): any => {
    if (type === 'number') return Math.floor(Math.random() * 1000);
    if (type === 'string') return Math.random().toString(36).substring(2, 10);
    if (type === 'boolean') return Math.random() > 0.5;
    if (type === 'date') return new Date(Date.now() - Math.random() * 31536000000).toISOString();
    if (Array.isArray(type)) return Array.from({ length: 3 }, () => generate(type[0]));
    return 'value';
  };

  const calc = () => {
    try {
      const template = JSON.parse(schema);
      const generateFromTemplate = (obj: any): any => {
        if (Array.isArray(obj)) {
          return Array.from({ length: count }, () => obj[0] ? generateFromTemplate(obj[0]) : {});
        }
        if (typeof obj === 'object' && obj !== null) {
          const result: any = {};
          for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
              result[key] = generate(value);
            } else if (Array.isArray(value) && value.length > 0) {
              result[key] = generateFromTemplate(value);
            } else if (typeof value === 'object' && value !== null) {
              result[key] = generateFromTemplate(value);
            }
          }
          return result;
        }
        return obj;
      };
      const result = generateFromTemplate(template);
      setOutput(JSON.stringify(result, null, 2));
    } catch {
      toast.error('Invalid JSON schema');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Mock API Response Generator</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setSchema(p.schema); setOutput(''); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-emerald-400 text-[var(--text-secondary)] hover:text-emerald-600 transition-colors">
              {p.label}
            </button>
          ))}
        </div>
        <div>
          <label htmlFor="lbl-mockapiresponsegenerator-response-schema-json" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Response Schema (JSON)</label>
          <textarea id="lbl-mockapiresponsegenerator-response-schema-json" aria-label="Response Schema (JSON)" value={schema} onChange={e => { setSchema(e.target.value); setOutput(''); }} rows={6} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <div>
          <label htmlFor="lbl-mockapiresponsegenerator-array-length-count" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Array Length: {count}</label>
          <input id="lbl-mockapiresponsegenerator-array-length-count" type="range" min={1} max={50} value={count} aria-label="Array Length" onChange={e => { setCount(Number(e.target.value)); setOutput(''); }} className="w-full mt-1 accent-emerald-500" />
        </div>
        <button onClick={calc} className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate</button>
        {output && (
          <div className="relative">
            <pre className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs font-mono overflow-x-auto max-h-64 whitespace-pre-wrap break-all">{output}</pre>
            <button onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="absolute top-2 right-2 px-2.5 py-1 text-[10px] bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

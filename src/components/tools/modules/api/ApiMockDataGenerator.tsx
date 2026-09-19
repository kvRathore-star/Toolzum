"use client";
import { useState } from 'react';
import { clipboardWrite } from "@/lib/clipboard";


export default function ApiMockDataGenerator() {
  const [schema, setSchema] = useState('{ "id": "number", "name": "string", "email": "string", "age": "number" }');
  const [count, setCount] = useState(3);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const presets = [
    { label: 'User Profile', schema: '{ "id": "number", "name": "string", "email": "email", "age": "number", "active": "boolean" }' },
    { label: 'Product', schema: '{ "id": "number", "title": "string", "price": "number", "inStock": "boolean" }' },
    { label: 'Comment', schema: '{ "id": "number", "postId": "number", "author": "string", "body": "string", "createdAt": "string" }' },
  ];
  const generate = (field: string) => {
    if (field === 'number') return Math.floor(Math.random() * 1000);
    if (field === 'string') return Math.random().toString(36).substring(2, 8);
    if (field === 'email') return `${Math.random().toString(36).substring(2, 8)}@example.com`;
    if (field === 'boolean') return Math.random() > 0.5;
    return 'value';
  };
  const calc = () => {
    try {
      const fields = JSON.parse(schema);
      const items = Array.from({ length: count }, () => {
        const item: Record<string, any> = {};
        for (const [k, v] of Object.entries(fields)) item[k] = generate(v as string);
        return item;
      });
      setResult(JSON.stringify(items, null, 2));
    } catch {
      setResult('Error: Invalid schema JSON');
    }
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Mock Data Generator</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setSchema(p.schema); setResult(''); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-emerald-400 text-[var(--text-secondary)] hover:text-emerald-600 transition-colors">
              {p.label}
            </button>
          ))}
        </div>
        <div>
          <label htmlFor="lbl-apimockdatagenerator-schema-json" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Schema (JSON)</label>
          <textarea id="lbl-apimockdatagenerator-schema-json" aria-label="Schema (JSON)" value={schema} onChange={e => { setSchema(e.target.value); setResult(''); }} rows={4} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <div>
          <label htmlFor="lbl-apimockdatagenerator-count-count" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Count: {count}</label>
          <input id="lbl-apimockdatagenerator-count-count" type="range" min={1} max={20} value={count} aria-label="Count" onChange={e => { setCount(Number(e.target.value)); setResult(''); }} className="w-full mt-1 accent-emerald-500" />
        </div>
        <button onClick={calc} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate</button>
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

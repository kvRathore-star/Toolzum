"use client";
import { useState } from 'react';

export default function ApiPayloadAnalyzer() {
  const [payload, setPayload] = useState('{"user":{"name":"John","addresses":[{"city":"NYC","zip":"10001"}]}}');
  const [result, setResult] = useState<{ size: number; keys: number; depth: number; topKeys: number; type: string } | null>(null);
  const presets = [
    { label: 'Nested User', json: '{"user":{"name":"John","addresses":[{"city":"NYC","zip":"10001"}]}}' },
    { label: 'Product List', json: '{"products":[{"id":1,"name":"Widget","price":9.99},{"id":2,"name":"Gadget","price":19.99}],"total":2}' },
    { label: 'Flat Object', json: '{"name":"John","age":30,"email":"john@example.com","active":true,"role":"admin"}' },
  ];
  const calc = () => {
    try {
      const obj = JSON.parse(payload);
      const str = JSON.stringify(obj);
      const depth = (o: any): number => typeof o === 'object' && o !== null ? 1 + Math.max(0, ...Object.values(o).map(v => depth(v))) : 0;
      const countKeys = (o: any): number => typeof o === 'object' && o !== null ? Object.keys(o).length + Object.values(o).filter(v => typeof v === 'object' && v !== null).reduce((s: number, v: any) => s + countKeys(v), 0) : 0;
      setResult({
        size: str.length,
        keys: countKeys(obj),
        depth: depth(obj),
        topKeys: Object.keys(obj).length,
        type: Array.isArray(obj) ? 'Array' : typeof obj,
      });
    } catch { setResult(null); }
  };
  const maxKey = result ? Math.max(result.size, result.keys * 10, result.depth * 50, result.topKeys * 50) : 1;
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Payload Analyzer</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setPayload(p.json); setResult(null); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-blue-400 text-[var(--text-secondary)] hover:text-blue-600 transition-colors">
              {p.label}
            </button>
          ))}
        </div>
        <div>
          <label htmlFor="lbl-apipayloadanalyzer-json-payload" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">JSON Payload</label>
          <textarea id="lbl-apipayloadanalyzer-json-payload" aria-label="JSON Payload" value={payload} onChange={e => { setPayload(e.target.value); setResult(null); }} rows={5} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Analyze</button>
        {result && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Size</p>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-400">{result.size < 1024 ? `${result.size} B` : `${(result.size / 1024).toFixed(2)} KB`}</p>
              <div className="mt-2 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(result.size / maxKey) * 100}%` }} /></div>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Keys</p>
              <p className="text-xl font-bold text-emerald-500">{result.keys}</p>
              <div className="mt-2 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden"><div className="h-full bg-emerald-700 rounded-full transition-all" style={{ width: `${(result.keys * 10 / maxKey) * 100}%` }} /></div>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Nesting Depth</p>
              <p className="text-xl font-bold text-purple-500">{result.depth}</p>
              <div className="mt-2 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden"><div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${(result.depth * 50 / maxKey) * 100}%` }} /></div>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Top-Level Keys</p>
              <p className="text-xl font-bold text-amber-500">{result.topKeys}</p>
              <div className="mt-2 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden"><div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${(result.topKeys * 50 / maxKey) * 100}%` }} /></div>
            </div>
            <div className="col-span-2 bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Type</p>
              <span className="inline-block mt-1 px-2.5 py-1 text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg">{result.type}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

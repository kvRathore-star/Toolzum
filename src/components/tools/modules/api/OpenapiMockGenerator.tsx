"use client";
import { useState } from 'react';

export default function OpenapiMockGenerator() {
  const [spec, setSpec] = useState('/users:\n  get:\n    responses:\n      200:\n        schema:\n          type: array\n          items:\n            type: object\n            properties:\n              id: { type: integer }\n              name: { type: string }');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const calc = () => {
    const lines = spec.split('\n').filter(Boolean);
    const mock: Record<string, any> = {};
    let currentPath = '';
    for (const line of lines) {
      if (line.startsWith('/')) { currentPath = line.split(':')[0]; mock[currentPath] = {}; }
      if (line.includes('type: integer')) mock[currentPath] = { data: [{ id: 1, name: 'John' }], total: 1 };
      if (line.includes('type: string')) mock[currentPath] = { data: [{ id: 1, name: 'John' }], total: 1 };
    }
    setResult(JSON.stringify(mock, null, 2));
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">OpenAPI Mock Generator</h2>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">OpenAPI Spec (YAML fragment)</label>
          <textarea aria-label="OpenAPI Spec (YAML fragment)" value={spec} onChange={e => setSpec(e.target.value)} rows={5} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate Mock</button>
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

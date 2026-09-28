"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";


export default function ApiResponseFormatter() {
  const [input, setInput] = useState('{"name":"John","age":30,"city":"New York"}');
  const [indent, setIndent] = useState<number | 'tab'>(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const sortDeep = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(sortDeep);
    if (value && typeof value === 'object') {
      const sorted: Record<string, unknown> = {};
      for (const k of Object.keys(value as Record<string, unknown>).sort()) {
        sorted[k] = sortDeep((value as Record<string, unknown>)[k]);
      }
      return sorted;
    }
    return value;
  };
  const calc = () => {
    try {
      const parsed = JSON.parse(input) as unknown;
      const shaped = sortKeys ? sortDeep(parsed) : parsed;
      // indent 0 = minify; 'tab' = tab-indented.
      const space = indent === 'tab' ? '\t' : (indent as number);
      setResult(JSON.stringify(shaped, null, space));
    } catch {
      setResult('Error: Invalid JSON input');
    }
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Response Formatter</h2>
        <div>
          <label htmlFor="lbl-apiresponseformatter-json-input" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">JSON Input</label>
          <textarea id="lbl-apiresponseformatter-json-input" aria-label="JSON Input" value={input} onChange={e => { setInput(e.target.value); setResult(''); }} rows={5} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-xs text-[var(--text-secondary)]">Indent:</label>
          <div className="flex gap-1">
            {([0, 2, 4, 'tab'] as const).map(v => (
              <button key={String(v)} onClick={() => setIndent(v)} className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${indent === v ? 'bg-[var(--accent-ink)] text-white' : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)]'}`}>{v === 0 ? 'Minify' : v === 'tab' ? 'Tab' : v}</button>
            ))}
          </div>
          <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer">
            <input type="checkbox" checked={sortKeys} onChange={e => setSortKeys(e.target.checked)} className="rounded" aria-label="Sort keys alphabetically" />
            Sort keys
          </label>
          <button onClick={calc} className="ml-auto bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition-all">Format</button>
        </div>
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

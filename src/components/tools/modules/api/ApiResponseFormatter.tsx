"use client";
import { useState } from 'react';

export default function ApiResponseFormatter() {
  const [input, setInput] = useState('{"name":"John","age":30,"city":"New York"}');
  const [indent, setIndent] = useState(2);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const calc = () => {
    try {
      const parsed = JSON.parse(input);
      setResult(JSON.stringify(parsed, null, indent));
    } catch {
      setResult('Error: Invalid JSON input');
    }
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Response Formatter</h2>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">JSON Input</label>
          <textarea aria-label="JSON Input" value={input} onChange={e => { setInput(e.target.value); setResult(''); }} rows={5} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-[var(--text-secondary)]">Indent:</label>
          <div className="flex gap-1">
            {[2, 4].map(v => (
              <button key={v} onClick={() => setIndent(v)} className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${indent === v ? 'bg-blue-600 text-white' : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)]'}`}>{v}</button>
            ))}
          </div>
          <button onClick={calc} className="ml-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition-all">Format</button>
        </div>
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

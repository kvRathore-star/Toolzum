"use client";
import { useState } from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';
import { Input } from './GeneratorsShared';

export default function RandomUUIDGenerator() {
  const [version, setVersion] = useState('v4'); const [count, setCount] = useState(1); const [results, setResults] = useState<string[]>([]);
  const generate = () => { const uuids: string[] = []; for (let i = 0; i < count; i++) { if (version === 'v4') uuids.push(crypto.randomUUID()); else { const arr = new Uint8Array(16); crypto.getRandomValues(arr); arr[6] = (arr[6]! & 0x0f) | 0x70; arr[8] = (arr[8]! & 0x3f) | 0x80; const hex = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join(''); uuids.push(hex.slice(0,8) + '-' + hex.slice(8,12) + '-' + hex.slice(12,16) + '-' + hex.slice(16,20) + '-' + hex.slice(20)); } } setResults(uuids); };

  const presets = [
    { label: 'UUID v4 (Random)', apply: () => { setVersion('v4'); setCount(5); generate(); } },
    { label: 'UUID v7 (Time-Ordered)', apply: () => { setVersion('v7'); setCount(5); generate(); } },
    { label: '10 UUIDs', apply: () => { setCount(10); generate(); } },
    { label: 'Clear', apply: () => { setResults([]); } },
  ];

  const resultText = results.length > 0 ? 'Generated ' + results.length + ' ' + version.toUpperCase() + 's' : 'Configure and generate';

  return (
    <CalculatorShell category="Utility"
      title="Random UUID Generator"
      result={resultText}
      onCalculate={generate}
      calculateLabel="Generate"
      presets={presets}
      accent="cyan"
      downloadData={JSON.stringify({ version, count, uuids: results }, null, 2)}
      downloadFilename="uuids.json"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="mb-3">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Version</label>
            <select aria-label="Version" value={version} onChange={e => setVersion(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50"><option value="v4">UUID v4 (Random)</option><option value="v7">UUID v7 (Time-Ordered)</option></select>
          </div>
          <Input label="Count" type="number" value={String(count)} onChange={v => setCount(Number(v))} />
        </div>
        {results.length > 0 && (
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-4 flex flex-col min-h-[160px]">
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {results.map((u, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-[var(--bg-surface)] rounded-lg text-xs font-mono">
                  <span>{u}</span>
                  <button onClick={() => { clipboardWrite(u); toast.success('Copied!'); }} className="text-[var(--accent)] hover:underline"><Copy size={12} /></button>
                </div>
              ))}
              <button onClick={() => { clipboardWrite(results.join('\n')); toast.success('Copied all!'); }} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mt-2">Copy All</button>
            </div>
          </div>
        )}
        {!results.length && (
          <p className="text-[var(--text-muted)] text-sm text-center">Configure and generate UUIDs</p>
        )}
      </div>
    </CalculatorShell>
  );
}

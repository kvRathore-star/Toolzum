"use client";
import { useState } from 'react';
import { Copy, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';
import { Input, randInt } from './GeneratorsShared';

export default function RandomTokenGenerator() {
  const [format, setFormat] = useState('hex'); const [length, setLength] = useState(32); const [result, setResult] = useState('');
  const generate = () => { const bytes = new Uint8Array(Math.ceil(length * (format === 'base64' ? 0.75 : 0.5))); crypto.getRandomValues(bytes); if (format === 'hex') setResult(Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, length)); else if (format === 'base64') setResult(btoa(String.fromCharCode(...bytes)).replace(/=+$/, '').slice(0, length)); else { const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; let s = ''; for (let i = 0; i < length; i++) s += chars[randInt(0, chars.length - 1)]; setResult(s); } };
  const entropy = Math.round(length * Math.log2(format === 'hex' ? 16 : format === 'base64' ? 64 : 62));

  const presets = [
    { label: 'Hex (32)', apply: () => { setFormat('hex'); setLength(32); generate(); } },
    { label: 'Base64 (32)', apply: () => { setFormat('base64'); setLength(32); generate(); } },
    { label: 'Alphanumeric (32)', apply: () => { setFormat('alphanumeric'); setLength(32); generate(); } },
    { label: 'API Key (64)', apply: () => { setFormat('hex'); setLength(64); generate(); } },
    { label: 'Clear', apply: () => { setResult(''); } },
  ];

  const resultText = result ? 'Generated ' + length + '-char ' + format.toUpperCase() + ' token (' + entropy + ' bits entropy)' : 'Configure and generate';

  const customResult = result ? (
    <div className="flex flex-col justify-center items-center min-h-[120px]">
      <p className="text-lg font-mono font-bold text-[var(--text-primary)] break-all text-center">{result}</p>
      <p className="text-xs text-[var(--text-muted)] mt-2">{entropy} bits entropy</p>
      <div className="flex gap-1 mt-2">
        <button onClick={() => { clipboardWrite(result).then(ok => { if (ok) toast.success('Copied!'); else toast.error('Copy blocked by the browser — select the text manually.'); }); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors" aria-label="Copy token"><Copy size={14} /></button>
        <button onClick={() => { const blob = new Blob([result], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'token.' + format; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors" aria-label="Download token"><Download size={14} /></button>
      </div>
    </div>
  ) : undefined;

  return (
    <CalculatorShell category="Utility"
      title="Random Token Generator"
      result={resultText}
      customResult={customResult}
      onCalculate={generate}
      calculateLabel="Generate"
      presets={presets}
      accent="rose"
      downloadData={result ? JSON.stringify({ format, length, token: result, entropy }, null, 2) : ''}
      downloadFilename="token.json"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="mb-3">
            <label htmlFor="lbl-randomtokengenerator-format" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Format</label>
            <select id="lbl-randomtokengenerator-format" aria-label="Format" value={format} onChange={e => setFormat(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50"><option value="hex">Hex</option><option value="base64">Base64</option><option value="alphanumeric">Alphanumeric</option></select>
          </div>
          <Input label="Length" type="number" value={String(length)} onChange={v => setLength(Number(v))} />
        </div>
        {!result && (
          <p className="text-[var(--text-muted)] text-sm text-center">Configure and generate a secure token</p>
        )}
      </div>
    </CalculatorShell>
  );
}

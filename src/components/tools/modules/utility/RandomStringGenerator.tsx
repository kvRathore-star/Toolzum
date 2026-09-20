"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { randInt } from './GeneratorsShared';

const STRING_PRESETS = [
  { name: 'API Key (32)', length: 32, charset: 'alphanumeric' }, { name: 'Session (64)', length: 64, charset: 'hex' }, { name: 'Short ID (8)', length: 8, charset: 'alphanumeric' }, { name: 'OTP (6)', length: 6, charset: 'numeric' },
];
export default function RandomStringGenerator() {
  const [length, setLength] = useState(12); const [charset, setCharset] = useState('alphanumeric'); const [result, setResult] = useState('');
  const generate = () => {
    let chars = '';
    switch (charset) { case 'alpha': chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'; break; case 'numeric': chars = '0123456789'; break; case 'hex': chars = '0123456789abcdef'; break; case 'hex-upper': chars = '0123456789ABCDEF'; break; case 'uuid': setResult(crypto.randomUUID()); return; default: chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; }
    let s = ''; for (let i = 0; i < length; i++) s += chars[randInt(0, chars.length - 1)]; setResult(s);
  };

  const presets = [
    { label: 'API Key (32)', apply: () => { setLength(32); setCharset('alphanumeric'); generate(); } },
    { label: 'Session (64)', apply: () => { setLength(64); setCharset('hex'); generate(); } },
    { label: 'Short ID (8)', apply: () => { setLength(8); setCharset('alphanumeric'); generate(); } },
    { label: 'OTP (6)', apply: () => { setLength(6); setCharset('numeric'); generate(); } },
    { label: 'UUID', apply: () => { setCharset('uuid'); generate(); } },
    { label: 'Clear', apply: () => { setResult(''); } },
  ];

  const resultText = result ? 'Generated ' + result.length + '-char string (' + charset + ')' : 'Configure and generate';

  const customResult = result ? (
    <div className="flex flex-col items-center min-h-[120px]">
      <p className="text-lg font-mono font-bold text-[var(--text-primary)] break-all text-center">{result}</p>
      <p className="text-xs text-[var(--text-muted)] mt-1">{result.length} chars ({charset})</p>
    </div>
  ) : undefined;

  return (
    <CalculatorShell category="Utility" title="Random String Generator" result={resultText} customResult={customResult} onCalculate={generate} calculateLabel="Generate" presets={presets} accent="indigo" downloadData={result} downloadFilename="random-string.txt">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {STRING_PRESETS.map(p => (
            <button key={p.name} onClick={() => { setLength(p.length); setCharset(p.charset); generate(); }}
              className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              {p.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="lbl-randomstringgenerator-length" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Length</label>
            <input id="lbl-randomstringgenerator-length" aria-label="Length" type="number" min={1} max={1000} value={String(length)} onChange={e => setLength(Number(e.target.value))}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50" />
          </div>
          <div>
            <label htmlFor="lbl-randomstringgenerator-charset" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Charset</label>
            <select id="lbl-randomstringgenerator-charset" aria-label="Charset" value={charset} onChange={e => setCharset(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50">
              <option value="alphanumeric">Alphanumeric</option>
              <option value="alpha">Alphabetic</option>
              <option value="numeric">Numeric</option>
              <option value="hex">Hex (lowercase)</option>
              <option value="hex-upper">Hex (uppercase)</option>
              <option value="uuid">UUID v4</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          {[4, 8, 12, 16, 32, 64].map(n => (
            <button key={n} onClick={() => { setLength(n); generate(); }}
              className={'px-3 py-1.5 text-xs font-bold rounded-lg transition-all ' + (length === n ? 'bg-[var(--accent-ink)] text-white' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]')}>{n}</button>
          ))}
        </div>
      </div>
    </CalculatorShell>
  );
}

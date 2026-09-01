"use client";
import { useState } from 'react';
import { Copy, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';
import { randInt } from './GeneratorsShared';

export default function RandomPasswordGenerator() {
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true); const [lower, setLower] = useState(true); const [digits, setDigits] = useState(true); const [symbols, setSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [result, setResult] = useState(''); const [history, setHistory] = useState<string[]>([]);

  const entropy = (() => { let pool = 0; if (upper) pool += 26; if (lower) pool += 26; if (digits) pool += 10; if (symbols) pool += 20; return pool > 0 ? Math.round(length * Math.log2(pool)) : 0; })();
  const strength = entropy >= 80 ? 'Strong' : entropy >= 50 ? 'Good' : entropy >= 30 ? 'Fair' : 'Weak';
  const strengthColor = entropy >= 80 ? 'text-emerald-500' : entropy >= 50 ? 'text-amber-500' : 'text-red-500';

  const generate = () => { let chars = ''; if (upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; if (lower) chars += 'abcdefghijklmnopqrstuvwxyz'; if (digits) chars += '0123456789'; if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'; if (excludeSimilar) chars = chars.replace(/[il1Lo0O]/g, ''); if (!chars) return; let pwd = ''; for (let i = 0; i < length; i++) pwd += chars[randInt(0, chars.length - 1)]; setResult(pwd); };

  const addToHistory = () => { if (result) { setHistory(prev => [result, ...prev].slice(0, 10)); toast.success('Added to history'); } };

  const presets = [
    { label: 'Secure (32)', apply: () => { setLength(32); setUpper(true); setLower(true); setDigits(true); setSymbols(true); setExcludeSimilar(false); } },
    { label: 'Memorable (16)', apply: () => { setLength(16); setUpper(true); setLower(true); setDigits(true); setSymbols(false); setExcludeSimilar(true); } },
    { label: 'PIN (6 digits)', apply: () => { setLength(6); setUpper(false); setLower(false); setDigits(true); setSymbols(false); setExcludeSimilar(false); } },
    { label: 'Clear', apply: () => { setResult(''); } },
  ];

  const resultText = result ? 'Generated ' + length + '-char password (' + entropy + ' bits, ' + strength + ')' : 'Configure options and generate';

  return (
    <CalculatorShell category="Utility"
      title="Random Password Generator"
      result={resultText}
      onCalculate={generate}
      calculateLabel="Generate"
      presets={presets}
      accent="emerald"
      downloadData={result}
      downloadFilename="password.txt"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Length ({length})</label>
            <input type="range" min={4} max={128} value={length} onChange={e => setLength(Number(e.target.value))}
              className="w-full accent-[var(--accent)]" />
            <div className="text-xs text-[var(--text-muted)] text-right">{length} characters</div>

            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <input type="checkbox" checked={upper} onChange={e => setUpper(e.target.checked)} className="accent-[var(--accent)]" />Uppercase
              </label>
              <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <input type="checkbox" checked={lower} onChange={e => setLower(e.target.checked)} className="accent-[var(--accent)]" />Lowercase
              </label>
              <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <input type="checkbox" checked={digits} onChange={e => setDigits(e.target.checked)} className="accent-[var(--accent)]" />Digits
              </label>
              <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <input type="checkbox" checked={symbols} onChange={e => setSymbols(e.target.checked)} className="accent-[var(--accent)]" />Symbols
              </label>
              <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <input type="checkbox" checked={excludeSimilar} onChange={e => setExcludeSimilar(e.target.checked)} className="accent-[var(--accent)]" />Exclude Similar
              </label>
            </div>

            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-zinc-200 dark:border-zinc-700">
              <div className="text-xs text-[var(--text-secondary)] mb-2">Entropy Analysis</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-[var(--bg-overlay)] rounded-lg">
                  <div className="text-xs text-[var(--text-muted)]">Character Pool</div>
                  <div className="font-bold text-[var(--text-primary)]">
                    {(upper ? 26 : 0) + (lower ? 26 : 0) + (digits ? 10 : 0) + (symbols ? 20 : 0)}
                  </div>
                </div>
                <div className="p-2 bg-[var(--bg-overlay)] rounded-lg">
                  <div className="text-xs text-[var(--text-muted)]">Entropy</div>
                  <div className={'font-bold ' + strengthColor}>{entropy} bits</div>
                </div>
                <div className="p-2 bg-[var(--bg-overlay)] rounded-lg">
                  <div className="text-xs text-[var(--text-muted)]">Strength</div>
                  <div className={'text-sm font-bold ' + strengthColor}>{strength}</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="space-y-4">
          {result && (
            <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-500/20 rounded-xl p-4 flex flex-col items-center min-h-[160px]">
              <p className="text-2xl font-bold text-[var(--text-primary)] break-all text-center">{result}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-[var(--text-muted)]">{entropy} bits entropy</span>
                <span className={'text-xs font-bold ' + strengthColor}>{strength}</span>
              </div>
            </div>
          )}
          {!result && <p className="text-[var(--text-muted)] text-center py-8">Configure options and generate a password</p>}

          {history.length > 0 && (
            <div className="border-t border-[var(--border-subtle)] pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase">History</h4>
                <button onClick={() => setHistory([])} className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent)]"><RotateCcw size={12} /> Clear</button>
              </div>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-[var(--bg-surface)] rounded-lg text-xs font-mono">
                    <span>{h}</span>
                    <button onClick={() => { clipboardWrite(h); toast.success('Copied!'); }} className="text-[var(--accent)] hover:underline"><Copy size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </CalculatorShell>
  );
}

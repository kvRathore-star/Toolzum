"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ac, borderClass } from '../miscToolColors';
import { Input, labelClass, selClass } from '../MiscToolsShared';

export default function SalesTaxCalculator() {
  const clr = ac('SalesTaxCalculator');
  const [amount, setAmount] = useState('100');
  const [rate, setRate] = useState('8');
  const [state, setState] = useState('');
  const [mode, setMode] = useState<'custom' | 'state'>('custom');
  const a = Number(amount);
  const r = mode === 'state' && state ? (US_STATE_TAX[state] ?? 0) : Number(rate);
  const tax = a * r / 100;
  const resultText = `Subtotal: $${a.toFixed(2)}\nTax (${r}%): $${tax.toFixed(2)}\nTotal: $${(a + tax).toFixed(2)}`;
  const presets = [
    { label: '$100 CA 7.25%', apply: () => { setAmount('100'); setMode('state'); setState('CA'); } },
    { label: '$50 NY 8%', apply: () => { setAmount('50'); setMode('state'); setState('NY'); } },
  ];
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((p) => (
          <button key={p.label} onClick={p.apply} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Sales Tax Calculator</h2>
        <div className="flex gap-1 mb-2">
          <button onClick={() => setMode('custom')} className={`px-3 py-1 text-xs rounded-lg border transition-colors ${mode === 'custom' ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'border-[var(--border-subtle)]'}`}>Custom Rate</button>
          <button onClick={() => setMode('state')} className={`px-3 py-1 text-xs rounded-lg border transition-colors ${mode === 'state' ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'border-[var(--border-subtle)]'}`}>US State</button>
        </div>
        <div className="flex gap-2">
          <Input label="Price ($)" type="number" value={amount} onChange={setAmount} />
          {mode === 'custom' ? (
            <Input label="Tax Rate (%)" type="number" value={rate} onChange={setRate} />
          ) : (
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1">State</label>
              <select value={state} onChange={e => setState(e.target.value)} className="w-full border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm bg-[var(--bg-surface)]">
                <option value="">Select state</option>
                {Object.entries(US_STATE_TAX).sort(([a], [b]) => a.localeCompare(b)).map(([abbr, rate]) => (
                  <option key={abbr} value={abbr}>{abbr} — {rate}%</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="text-xs space-y-1">
          <div>Subtotal: ${a.toFixed(2)}</div>
          <div>Tax ({r}%): ${tax.toFixed(2)}</div>
          <div className="text-base font-bold">Total: ${(a + tax).toFixed(2)}</div>
        </div>
        {mode === 'state' && state && (
          <div className="text-xs text-[var(--text-secondary)]">
            {US_STATE_TAX[state] === 0
              ? `${state} has no statewide sales tax — local rates may apply.`
              : `Base state rate only. Local/county taxes may add 1-3% on top.`
            }
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={() => { navigator.clipboard.writeText(resultText); toast.success('Copied!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
          <button onClick={() => { const blob = new Blob([resultText], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a2 = document.createElement('a'); a2.href=url; a2.download='result.txt'; a2.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</button>
        </div>
      </div>
    </>
  );
}

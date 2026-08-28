"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ac, borderClass } from '../miscToolColors';
import { Input, labelClass, selClass } from '../MiscToolsShared';

const US_STATE_TAX: Record<string, number> = {
  AL: 4.00, AK: 0.00, AZ: 5.60, AR: 6.50, CA: 7.25, CO: 2.90, CT: 6.35, DE: 0.00,
  FL: 6.00, GA: 4.00, HI: 4.00, ID: 6.00, IL: 6.25, IN: 7.00, IA: 6.00, KS: 6.50,
  KY: 6.00, LA: 4.45, ME: 5.50, MD: 6.00, MA: 6.25, MI: 6.00, MN: 6.875, MS: 7.00,
  MO: 4.225, MT: 0.00, NE: 5.50, NV: 6.85, NH: 0.00, NJ: 6.625, NM: 5.125, NY: 4.00,
  NC: 4.75, ND: 5.00, OH: 5.75, OK: 4.50, OR: 0.00, PA: 6.00, RI: 7.00, SC: 6.00,
  SD: 4.50, TN: 7.00, TX: 6.25, UT: 6.10, VT: 6.00, VA: 5.30, WA: 6.50, WV: 6.00,
  WI: 5.00, WY: 4.00, DC: 6.00,
};

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

"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ac, borderClass } from '../miscToolColors';
import { Input, labelClass, selClass } from '../MiscToolsShared';

export default function MarkupCalculator() {
  const clr = ac('MarkupCalculator');
  const [cost, setCost] = useState('50');
  const [markup, setMarkup] = useState(25);
  const c = Number(cost), m = Number(markup);
  const price = c * (1 + m / 100);
  const profit = price - c;
  const resultText = `Selling Price: $${price.toFixed(2)}\nProfit: $${profit.toFixed(2)}\nMargin: ${(profit / price * 100).toFixed(1)}%`;
  const presets = [
    { label: '$50 cost 40% markup', apply: () => { setCost('50'); setMarkup(40); } },
    { label: '$100 cost 25%', apply: () => { setCost('100'); setMarkup(25); } },
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
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Markup Calculator</h2>
        <div className="flex gap-2">
          <div><label className={labelClass}>Cost</label><Input label="Value" type="number" value={cost} onChange={setCost} /></div>
          <div><label className={labelClass}>Markup %</label><Input label="Value" type="number" value={markup} onChange={v => setMarkup(Number(v))} /></div>
        </div>
        <div className="text-xs space-y-1">
          <div>Selling Price: ${price.toFixed(2)}</div>
          <div>Profit: ${profit.toFixed(2)}</div>
          <div className="font-bold">Margin: {(profit / price * 100).toFixed(1)}%</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { navigator.clipboard.writeText(resultText); toast.success('Copied!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
          <button onClick={() => { const blob = new Blob([resultText], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='result.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</button>
        </div>
      </div>
    </>
  );
}

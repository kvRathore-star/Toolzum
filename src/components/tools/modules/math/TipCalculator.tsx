"use client";
import { useState } from 'react';
import { CalcActions } from '../shared/CalcActions';
import { ac, borderClass } from '../miscToolColors';
import { Input, labelClass, selClass } from '../MiscToolsShared';

export default function TipCalculator() {
  const clr = ac('TipCalculator');
  const [bill, setBill] = useState('50');
  const [pct, setPct] = useState(15);
  const [split, setSplit] = useState(2);
  const b = Number(bill);
  const tip = b * pct / 100;
  const total = b + tip;
  const resultText = `Tip: $${tip.toFixed(2)}\nTotal: $${total.toFixed(2)}\nEach: $${(total / split).toFixed(2)}`;
  const presets = [
    { label: '$50 18%', apply: () => { setBill('50'); setPct(18); } },
    { label: '$100 20%', apply: () => { setBill('100'); setPct(20); } },
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
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Tip Calculator</h2>
        <div className="flex gap-2">
          <div><label className={labelClass}>Bill</label><Input label="Bill" type="number" value={bill} onChange={setBill} /></div>
          <div><label className={labelClass}>Tip %</label><Input label="Tip %" type="number" value={pct} onChange={v => setPct(Number(v))} /></div>
          <div><label className={labelClass}>Split</label><Input label="Split" type="number" min={1} value={split} onChange={v => setSplit(Number(v))} /></div>
        </div>
        <div className="text-xs space-y-1">
          <div>Tip: ${tip.toFixed(2)}</div>
          <div>Total: ${total.toFixed(2)}</div>
          <div className="font-bold">Each: ${(total / split).toFixed(2)}</div>
        </div>
        <CalcActions result={resultText} downloadData={`Tip,Total,Each\n$${tip.toFixed(2)},$${total.toFixed(2)},$${(total / split).toFixed(2)}`} downloadFilename="tip.csv" />
      </div>
    </>
  );
}

"use client";
import { useState } from 'react';
import { CalcActions } from '../shared/CalcActions';
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
          <button key={p.label} onClick={p.apply} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Markup Calculator</h2>
        <div className="flex gap-2">
          <div><label className={labelClass}>Cost</label><Input label="Cost" type="number" value={cost} onChange={setCost} /></div>
          <div><label className={labelClass}>Markup %</label><Input label="Markup %" type="number" value={markup} onChange={v => setMarkup(Number(v))} /></div>
        </div>
        <div className="text-xs space-y-1">
          <div>Selling Price: ${price.toFixed(2)}</div>
          <div>Profit: ${profit.toFixed(2)}</div>
          <div className="font-bold">Margin: {(profit / price * 100).toFixed(1)}%</div>
        </div>
        <CalcActions result={resultText} downloadData={`Cost,Markup %,Selling Price,Profit,Margin\n$${c.toFixed(2)},${m}%,$${price.toFixed(2)},$${profit.toFixed(2)},${(profit / price * 100).toFixed(1)}%`} downloadFilename="markup.csv" />
      </div>
    </>
  );
}

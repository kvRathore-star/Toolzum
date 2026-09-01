"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

type Preset = { name: string; cost: number; margin: number };
const PRESETS: Preset[] = [
  { name: 'Retail (50% margin)', cost: 50, margin: 50 },
  { name: 'Wholesale (20% margin)', cost: 100, margin: 20 },
  { name: 'Premium (70% margin)', cost: 30, margin: 70 },
  { name: 'Loss Leader (10% margin)', cost: 90, margin: 10 },
];

export default function MarginCalculator() {
  const [cost, setCost] = useState(100);
  const [margin, setMargin] = useState(30);

  const revenue = margin >= 100 ? Infinity : cost / (1 - margin / 100);
  const profit = isFinite(revenue) ? revenue - cost : 0;
  const markup = cost > 0 && isFinite(revenue) ? ((revenue - cost) / cost) * 100 : 0;

  const result = isFinite(revenue) ? `$${revenue.toFixed(2)}` : 'N/A';

  const csvContent = `Metric,Value\nItem Cost,${cost}\nTarget Margin,${margin}%\nSelling Price,${isFinite(revenue) ? revenue.toFixed(2) : 'N/A'}\nProfit,${profit.toFixed(2)}\nMarkup,${markup.toFixed(2)}%`;

  return (
    <CalculatorShell
      category="Finance"
      title="Margin Cost Pricing Calculator"
      accent="emerald"
      result={result}
      auto
      presets={PRESETS.map(p => ({ label: p.name, apply: () => { setCost(p.cost); setMargin(p.margin); } }))}
      resultStats={[
        { label: 'Total Profit', value: `$${profit.toFixed(2)}`, color: 'text-emerald-500' },
        { label: 'Markup', value: `${markup.toFixed(1)}% on cost` },
      ]}
      resultLabel="Target Selling Price"
      downloadData={csvContent}
      downloadFilename="margin-pricing-calculation.csv"
    >
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Item Cost ($)</label>
          <input className={inputCls} type="number" value={cost} onChange={e => setCost(Math.max(0, parseFloat(e.target.value) || 0))} />
        </div>
        <div>
          <label className={labelCls}>Target Margin (%)</label>
          <input className={inputCls} type="number" value={margin} onChange={e => setMargin(Math.min(99, Math.max(0, parseFloat(e.target.value) || 0)))} />
          <input type="range" min="1" max="90" step="1" value={margin} onChange={e => setMargin(parseInt(e.target.value))} className="w-full accent-emerald-500 mt-1" />
        </div>
      </div>
    </CalculatorShell>
  );
}

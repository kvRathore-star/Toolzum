"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

type Preset = { name: string; cost: number; revenue: number };
const PRESETS: Preset[] = [
  { name: 'Retail (50% margin)', cost: 50, revenue: 100 },
  { name: 'SaaS (80% margin)', cost: 10, revenue: 50 },
  { name: 'Restaurant (65% margin)', cost: 7, revenue: 20 },
  { name: 'Agency (40% margin)', cost: 3000, revenue: 5000 },
];

export default function ProfitMarginCalculator() {
  const [cost, setCost] = useState(100);
  const [revenue, setRevenue] = useState(150);

  const profit = revenue - cost;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
  const markup = cost > 0 ? (profit / cost) * 100 : 0;

  const result = `${margin.toFixed(2)}% gross margin`;

  const csvContent = `Metric,Value\nCost of Goods,${cost}\nSale Revenue,${revenue}\nGross Profit,${profit}\nGross Margin,${margin.toFixed(2)}%\nMarkup Percentage,${markup.toFixed(2)}%`;

  return (
    <CalculatorShell
      category="Finance"
      title="Profit Margin Calculator"
      accent="emerald"
      result={result}
      auto
      presets={PRESETS.map(p => ({ label: p.name, apply: () => { setCost(p.cost); setRevenue(p.revenue); } }))}
      resultStats={[
        { label: 'Gross Profit', value: `$${profit.toFixed(2)}` },
        { label: 'Markup', value: `${markup.toFixed(1)}%`, color: 'text-emerald-500' },
        { label: 'Cost Ratio', value: `${revenue > 0 ? ((cost / revenue) * 100).toFixed(1) : 0}% of revenue` },
      ]}
      downloadData={csvContent}
      downloadFilename="profit-margin-calculation.csv"
    >
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Cost of Goods Sold ($)</label>
          <input className={inputCls} type="number" value={cost} onChange={e => setCost(Math.max(0, parseFloat(e.target.value) || 0))} />
        </div>
        <div>
          <label className={labelCls}>Sale Revenue ($)</label>
          <input className={inputCls} type="number" value={revenue} onChange={e => setRevenue(Math.max(0, parseFloat(e.target.value) || 0))} />
        </div>
      </div>
    </CalculatorShell>
  );
}

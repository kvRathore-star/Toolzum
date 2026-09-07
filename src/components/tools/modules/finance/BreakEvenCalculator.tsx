"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

type Preset = { name: string; fixedCosts: number; variableCost: number; sellingPrice: number };
const PRESETS: Preset[] = [
  { name: 'Coffee Shop', fixedCosts: 8000, variableCost: 2.5, sellingPrice: 5 },
  { name: 'SaaS Subscription', fixedCosts: 25000, variableCost: 3, sellingPrice: 29 },
  { name: 'Manufacturing', fixedCosts: 100000, variableCost: 45, sellingPrice: 120 },
  { name: 'Online Store', fixedCosts: 5000, variableCost: 15, sellingPrice: 39 },
];

export default function BreakEvenCalculator() {
  const [fixedCosts, setFixedCosts] = useState(10000);
  const [variableCost, setVariableCost] = useState(20);
  const [sellingPrice, setSellingPrice] = useState(50);

  const contributionMargin = sellingPrice - variableCost;
  const breakEvenUnits = contributionMargin > 0 ? fixedCosts / contributionMargin : 0;
  const breakEvenSales = breakEvenUnits * sellingPrice;
  const cmRatio = sellingPrice > 0 ? (contributionMargin / sellingPrice) * 100 : 0;

  const result = `$${Math.round(breakEvenSales).toLocaleString()} break-even sales`;

  const csvContent = `Metric,Value\nFixed Costs,${fixedCosts}\nUnit Variable Cost,${variableCost}\nUnit Selling Price,${sellingPrice}\nContribution Margin,${contributionMargin.toFixed(2)}\nContribution Margin Ratio,${cmRatio.toFixed(1)}%\nBreak-Even Units,${Math.ceil(breakEvenUnits)}\nBreak-Even Sales,${Math.round(breakEvenSales)}`;

  return (
    <CalculatorShell
      category="Finance"
      title="Break-Even Calculator"
      accent="amber"
      result={result}
      auto
      presets={PRESETS.map(p => ({ label: p.name, apply: () => { setFixedCosts(p.fixedCosts); setVariableCost(p.variableCost); setSellingPrice(p.sellingPrice); } }))}
      resultStats={[
        { label: 'Break-Even Units', value: `${Math.ceil(breakEvenUnits).toLocaleString()} units`, color: 'text-amber-700 dark:text-amber-400' },
        { label: 'Contribution Margin', value: `$${contributionMargin.toFixed(2)}` },
        { label: 'CM Ratio', value: `${cmRatio.toFixed(1)}%` },
      ]}
      downloadData={csvContent}
      downloadFilename="break-even-calculation.csv"
    >
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Fixed Costs ($)</label>
          <input aria-label="Fixed Costs ($)" className={inputCls} type="number" value={fixedCosts} onChange={e => setFixedCosts(Math.max(0, parseFloat(e.target.value) || 0))} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Unit Variable Cost ($)</label>
            <input aria-label="Unit Variable Cost ($)" className={inputCls} type="number" value={variableCost} onChange={e => setVariableCost(Math.max(0, parseFloat(e.target.value) || 0))} />
          </div>
          <div>
            <label className={labelCls}>Unit Selling Price ($)</label>
            <input aria-label="Unit Selling Price ($)" className={inputCls} type="number" value={sellingPrice} onChange={e => setSellingPrice(Math.max(0, parseFloat(e.target.value) || 0))} />
          </div>
        </div>
      </div>
    </CalculatorShell>
  );
}

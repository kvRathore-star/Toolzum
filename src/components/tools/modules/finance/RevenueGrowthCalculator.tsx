"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function RevenueGrowthCalculator() {
  const [current, setCurrent] = useState('120000');
  const [previous, setPrevious] = useState('100000');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const c = parseFloat(current) || 0;
    const p = parseFloat(previous) || 0;
    if (!p) return;
    const growth = ((c - p) / p) * 100;
    const absChange = c - p;
    const cagr = growth;
    setResult(`Growth Rate: ${growth.toFixed(2)}%\nAbsolute Change: $${absChange.toLocaleString()}\nCurrent: $${c.toLocaleString()}\nPrevious: $${p.toLocaleString()}`);
  }, [current, previous]);
  const presets = [
    { label: 'YoY Growth', apply: () => { setCurrent('120000'); setPrevious('100000'); } },
    { label: 'QoQ Growth', apply: () => { setCurrent('55000'); setPrevious('50000'); } },
    { label: 'Hypergrowth', apply: () => { setCurrent('300000'); setPrevious('150000'); } },
  ];
  const c = parseFloat(current) || 0;
  const p = parseFloat(previous) || 1;
  const growth = ((c - p) / p) * 100;
  const isPositive = growth >= 0;
  return (
    <CalculatorShell title="Revenue Growth Calculator" result={result} onCalculate={calc} presets={presets} accent="blue" customResult={
      result ? (
        <div>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Previous</div>
              <div className="text-lg font-bold text-[var(--text-primary)]">${p.toLocaleString()}</div>
            </div>
            <div className={`text-2xl font-bold ${isPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
              {isPositive ? '\u2191' : '\u2193'} {Math.abs(growth).toFixed(1)}%
            </div>
            <div className="text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Current</div>
              <div className="text-lg font-bold text-[var(--text-primary)]">${c.toLocaleString()}</div>
            </div>
          </div>
          <div className="mt-3 h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${isPositive ? 'bg-emerald-700' : 'bg-red-500'}`} style={{ width: `${Math.min(Math.abs(growth), 100)}%` }} />
          </div>
        </div>
      ) : null
    }>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Current Period ($)</label><input type="number" value={current} onChange={e => setCurrent(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Previous Period ($)</label><input type="number" value={previous} onChange={e => setPrevious(e.target.value)} className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}

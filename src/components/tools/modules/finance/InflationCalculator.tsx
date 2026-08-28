"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { DollarSign } from 'lucide-react';
import { inputCls } from '../Calculators.shared';

export default function InflationCalculator() {
  const [present, setPresent] = useState('1000');
  const [rate, setRate] = useState('3');
  const [years, setYears] = useState('10');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const p = parseFloat(present) || 0;
    const r = (parseFloat(rate) || 0) / 100;
    const y = parseFloat(years) || 0;
    const fv = p * Math.pow(1 + r, y);
    const loss = fv - p;
    const buyingPowerLoss = (1 - p / fv) * 100;
    setResult(`Future Value: $${fv.toFixed(2)}\nLoss of Purchasing Power: $${Math.abs(loss).toFixed(2)}\nBuying Power Reduction: ${buyingPowerLoss.toFixed(1)}%\nPresent Value: $${p.toFixed(2)}`);
  }, [present, rate, years]);
  const presets = [
    { label: '10yr @ 3%', apply: () => { setPresent('1000'); setRate('3'); setYears('10'); } },
    { label: '20yr @ 4%', apply: () => { setPresent('1000'); setRate('4'); setYears('20'); } },
    { label: '30yr @ 2.5%', apply: () => { setPresent('100000'); setRate('2.5'); setYears('30'); } },
  ];
  const p = parseFloat(present) || 0;
  const r = (parseFloat(rate) || 0) / 100;
  const y = parseFloat(years) || 0;
  const fv = p * Math.pow(1 + r, y);
  return (
    <CalculatorShell title="Inflation Calculator" icon={<DollarSign className="w-5 h-5" />} result={result} onCalculate={calc} presets={presets} accent="lime" customResult={
      result ? (
        <div>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Today</div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">${p.toFixed(0)}</div>
            </div>
            <div className="text-2xl text-red-700 dark:text-red-400">&#8594;</div>
            <div className="text-center">
              <div className="text-xs text-[var(--text-tertiary)]">In {y} years</div>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">${fv.toFixed(0)}</div>
            </div>
          </div>
          <div className="mt-3 h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full" style={{ width: `${Math.min((fv / (p * 2)) * 100, 100)}%` }} />
          </div>
        </div>
      ) : null
    }>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Present Value ($)</label><input type="number" value={present} onChange={e => setPresent(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Inflation Rate (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.01" className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Years</label><input type="number" value={years} onChange={e => setYears(e.target.value)} className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}

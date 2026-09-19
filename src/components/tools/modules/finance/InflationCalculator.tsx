"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function InflationCalculator() {
  const [present, setPresent] = useState('1000');
  const [rate, setRate] = useState('3');
  const [years, setYears] = useState('10');
  const presets = [
    { label: '10yr @ 3%', apply: () => { setPresent('1000'); setRate('3'); setYears('10'); } },
    { label: '20yr @ 4%', apply: () => { setPresent('1000'); setRate('4'); setYears('20'); } },
    { label: '30yr @ 2.5%', apply: () => { setPresent('100000'); setRate('2.5'); setYears('30'); } },
  ];
  const p = parseFloat(present) || 0;
  const r = (parseFloat(rate) || 0) / 100;
  const y = parseFloat(years) || 0;
  const fv = p * Math.pow(1 + r, y);
  const result = p > 0 && y > 0 ? `$${fv.toFixed(0)}` : '';
  return (
    <CalculatorShell category="Finance" title="Inflation Calculator" result={result} auto presets={presets} accent="lime" customResult={
      p > 0 && y > 0 ? (
        <div>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Today</div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">${p.toFixed(0)}</div>
            </div>
            <div className="text-2xl text-red-700 dark:text-red-400">&#8594;</div>
            <div className="text-center">
              <div className="text-xs text-[var(--text-tertiary)]">In {y} years</div>
              <div className="text-2xl font-bold text-[var(--accent)]">${fv.toFixed(0)}</div>
            </div>
          </div>
          <div className="mt-3 h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full" style={{ width: `${Math.min((fv / (p * 2)) * 100, 100)}%` }} />
          </div>
        </div>
      ) : null
    }>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label htmlFor="lbl-inflationcalculator-present-value" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Present Value ($)</label><input id="lbl-inflationcalculator-present-value" aria-label="Present Value ($)" type="number" value={present} onChange={e => setPresent(e.target.value)} className={inputCls} /></div>
        <div><label htmlFor="lbl-inflationcalculator-inflation-rate" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Inflation Rate (%)</label><input id="lbl-inflationcalculator-inflation-rate" aria-label="Inflation Rate (%)" type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.01" className={inputCls} /></div>
        <div><label htmlFor="lbl-inflationcalculator-years" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Years</label><input id="lbl-inflationcalculator-years" aria-label="Years" type="number" value={years} onChange={e => setYears(e.target.value)} className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}

"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function RunwayCalculator() {
  const [cash, setCash] = useState('500000');
  const [burnRate, setBurnRate] = useState('50000');
  const presets = [
    { label: 'Seed Stage', apply: () => { setCash('500000'); setBurnRate('50000'); } },
    { label: 'Series A', apply: () => { setCash('3000000'); setBurnRate('200000'); } },
    { label: 'Bootstrapped', apply: () => { setCash('200000'); setBurnRate('15000'); } },
  ];
  const c = parseFloat(cash) || 0;
  const b = parseFloat(burnRate) || 0;
  const hasInput = cash !== '' && burnRate !== '' && c > 0 && b > 0;
  const months = hasInput ? c / b : 0;
  const maxMonths = 60;
  const runwayPct = Math.min((months / maxMonths) * 100, 100);
  return (
    <CalculatorShell category="Finance" title="Runway Calculator" result={hasInput ? `${months.toFixed(1)} months` : 'Enter cash and burn rate'} auto presets={presets} accent="emerald" customResult={
      hasInput ? (
        <div className="space-y-2">
          <div className="text-center">
            <div className="text-xs text-[var(--text-tertiary)]">Runway</div>
            <div className="text-lg font-bold" style={{ color: months > 18 ? '#34d399' : months > 6 ? '#fbbf24' : '#f87171' }}>
              {months.toFixed(1)} <span className="text-lg">months</span>
            </div>
          </div>
          <div className="h-3 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${runwayPct > 50 ? 'bg-emerald-700' : runwayPct > 25 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${runwayPct}%` }} />
          </div>
        </div>
      ) : null
    }>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Cash Balance ($)</label><input aria-label="Cash Balance ($)" type="number" value={cash} onChange={e => setCash(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Monthly Burn Rate ($)</label><input aria-label="Monthly Burn Rate ($)" type="number" value={burnRate} onChange={e => setBurnRate(e.target.value)} className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}

"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function HourlyToSalaryCalculator() {
  const [hourly, setHourly] = useState('25');
  const [hoursPerWeek, setHoursPerWeek] = useState('40');
  const presets = [
    { label: 'Min Wage', apply: () => { setHourly('15'); setHoursPerWeek('40'); } },
    { label: 'Mid Career', apply: () => { setHourly('35'); setHoursPerWeek('40'); } },
    { label: 'Senior/Tech', apply: () => { setHourly('75'); setHoursPerWeek('40'); } },
  ];
  const h = parseFloat(hourly) || 0;
  const hpw = parseFloat(hoursPerWeek) || 0;
  const annual = h * hpw * 52;
  const monthly = annual / 12;
  const result = `Annual: $${annual.toLocaleString()}\nMonthly: $${monthly.toLocaleString()}\nBiweekly: $${(annual / 26).toLocaleString()}\nWeekly: $${(h * hpw).toLocaleString()}\nDaily (8h): $${(h * 8).toLocaleString()}\nHourly: $${h.toFixed(2)}`;
  return (
    <CalculatorShell category="Finance" title="Hourly to Salary Calculator" result={result} auto presets={presets} accent="pink" customResult={
      h > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Annual', value: `$${annual.toLocaleString()}`, color: 'text-indigo-700 dark:text-indigo-400' },
            { label: 'Monthly', value: `$${monthly.toLocaleString()}`, color: 'text-emerald-700 dark:text-emerald-400' },
            { label: 'Biweekly', value: `$${(annual / 26).toLocaleString()}`, color: 'text-amber-700 dark:text-amber-400' },
            { label: 'Weekly', value: `$${(h * hpw).toLocaleString()}`, color: 'text-rose-700 dark:text-rose-400' },
          ].map(card => (
            <div key={card.label} className="text-center p-3">
              <div className={`text-lg font-bold ${card.color}`}>{card.value}</div>
              <div className="text-xs text-[var(--text-tertiary)]">{card.label}</div>
            </div>
          ))}
        </div>
      ) : null
    }>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label htmlFor="lbl-hourlytosalarycalculator-hourly-rate" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Hourly Rate ($)</label><input id="lbl-hourlytosalarycalculator-hourly-rate" aria-label="Hourly Rate ($)" type="number" value={hourly} onChange={e => setHourly(e.target.value)} step="0.01" className={inputCls} /></div>
        <div><label htmlFor="lbl-hourlytosalarycalculator-hours-per-week" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Hours per Week</label><input id="lbl-hourlytosalarycalculator-hours-per-week" aria-label="Hours per Week" type="number" value={hoursPerWeek} onChange={e => setHoursPerWeek(e.target.value)} className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}

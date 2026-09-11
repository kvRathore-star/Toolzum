"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function LeapYearCalculator() {
  const [year, setYear] = useState('2026');
  const presets = [
    { label: '2024 (Leap)', apply: () => { setYear('2024'); } },
    { label: '2026 (No)', apply: () => { setYear('2026'); } },
    { label: '2000 (Leap)', apply: () => { setYear('2000'); } },
  ];
  const y = parseInt(year);
  const isNaN = Number.isNaN(y);
  const isLeap = !isNaN && ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0);
  const customResult = (
    <div className="text-center">
      {isNaN ? (
        <div className="text-lg font-bold text-[var(--text-muted)]">Enter a year</div>
      ) : (
        <>
          <div className={`text-lg font-bold ${isLeap ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>{isLeap ? 'Leap Year' : 'Not a Leap Year'}</div>
          <div className="text-xs text-[var(--text-tertiary)] mt-1">{isLeap ? '366 days' : '365 days'}</div>
        </>
      )}
    </div>
  );
  return (
    <CalculatorShell category="Calculator" title="Leap Year Calculator" result="" auto presets={presets} accent="red" customResult={customResult}>
      <div><label htmlFor="lbl-leapyearcalculator-year" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Year</label><input id="lbl-leapyearcalculator-year" aria-label="Year" type="number" value={year} onChange={e => setYear(e.target.value)} className={inputCls} /></div>
    </CalculatorShell>
  );
}

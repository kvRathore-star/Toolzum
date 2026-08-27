"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function LeapYearCalculator() {
  const [year, setYear] = useState('2026');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const y = parseInt(year);
    const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    const nextLeap = isLeap ? y : (() => { let n = y; while (!((n % 4 === 0 && n % 100 !== 0) || n % 400 === 0)) n++; return n; })();
    setResult(`${y} is ${isLeap ? '' : 'not '}a leap year\nNext leap year: ${nextLeap}\nDays in ${y}: ${isLeap ? 366 : 365}`);
  }, [year]);
  const presets = [
    { label: '2024 (Leap)', apply: () => { setYear('2024'); } },
    { label: '2026 (No)', apply: () => { setYear('2026'); } },
    { label: '2000 (Leap)', apply: () => { setYear('2000'); } },
  ];
  const y = parseInt(year);
  const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  return (
    <CalculatorShell title="Leap Year Calculator" result={result} onCalculate={calc} presets={presets} accent="red">
      <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Year</label><input type="number" value={year} onChange={e => setYear(e.target.value)} className={inputCls} /></div>
      {result && (
        <div className={`bg-[var(--bg-overlay)] rounded-xl p-4 text-center border ${isLeap ? 'border-emerald-500/20' : 'border-amber-500/20'}`}>
          <div className={`text-3xl font-bold ${isLeap ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>{isLeap ? 'Leap Year' : 'Not a Leap Year'}</div>
          <div className="text-xs text-[var(--text-tertiary)] mt-1">{isLeap ? '366 days' : '365 days'}</div>
        </div>
      )}
    </CalculatorShell>
  );
}

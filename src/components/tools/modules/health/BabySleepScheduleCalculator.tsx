"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';

export default function BabySleepScheduleCalculator() {
  const [ageWeeks, setAgeWeeks] = useState('8');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const w = parseFloat(ageWeeks) || 0;
    const totalSleep = w <= 4 ? 16 : w <= 12 ? 15 : w <= 24 ? 14 : w <= 48 ? 13 : 12;
    const nightSleep = w <= 4 ? 8 : w <= 12 ? 9 : w <= 24 ? 10 : w <= 48 ? 10.5 : 11;
    const daySleep = totalSleep - nightSleep;
    const naps = w <= 12 ? 4 : w <= 24 ? 3 : w <= 48 ? 2 : 1;
    const wakeWindow = w <= 4 ? '45-60 min' : w <= 12 ? '60-90 min' : w <= 24 ? '2-3 hours' : '3-4 hours';
    setResult(`Total sleep: ${totalSleep}h/day\nNight: ${nightSleep}h | Day: ${daySleep}h\nNaps: ${naps}\nWake window: ${wakeWindow}`);
  }, [ageWeeks]);
  return (
    <CalculatorShell title="Baby Sleep Schedule" accent="purple" result={result} onCalculate={calc}>
      <div className="max-w-sm">
        <div><label className={labelCls}>Age (weeks)</label><input className={inputCls} type="number" value={ageWeeks} onChange={e => setAgeWeeks(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => setAgeWeeks('4')}>Newborn (4w)</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => setAgeWeeks('16')}>4 months</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => setAgeWeeks('52')}>12 months</button>
      </div>
    </CalculatorShell>
  );
}

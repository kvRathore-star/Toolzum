"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function BabySleepScheduleCalculator() {
  const [ageWeeks, setAgeWeeks] = useState('8');

  const w = parseFloat(ageWeeks) || 0;
  const totalSleep = w <= 4 ? 16 : w <= 12 ? 15 : w <= 24 ? 14 : w <= 48 ? 13 : 12;
  const nightSleep = w <= 4 ? 8 : w <= 12 ? 9 : w <= 24 ? 10 : w <= 48 ? 10.5 : 11;
  const daySleep = totalSleep - nightSleep;
  const naps = w <= 12 ? 4 : w <= 24 ? 3 : w <= 48 ? 2 : 1;
  const wakeWindow = w <= 4 ? '45-60 min' : w <= 12 ? '60-90 min' : w <= 24 ? '2-3 hours' : '3-4 hours';
  const result = `Total sleep: ${totalSleep}h/day\nNight: ${nightSleep}h | Day: ${daySleep}h\nNaps: ${naps}\nWake window: ${wakeWindow}`;

  const presets = [
    { label: 'Newborn (4w)', apply: () => setAgeWeeks('4') },
    { label: '4 months', apply: () => setAgeWeeks('16') },
    { label: '12 months', apply: () => setAgeWeeks('52') },
  ];

  return (
    <CalculatorShell category="Health" title="Baby Sleep Schedule" accent="purple" result={result} auto presets={presets}>
      <div className="max-w-sm">
        <div><label className={labelCls}>Age (weeks)</label><input className={inputCls} type="number" value={ageWeeks} onChange={e => setAgeWeeks(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}

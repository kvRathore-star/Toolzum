"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function BabySleepScheduleCalculator() {
  const [ageValue, setAgeValue] = useState('2');
  const [unit, setUnit] = useState<'weeks' | 'months'>('months');

  const raw = parseFloat(ageValue);
  const invalid = ageValue.trim() === '' || isNaN(raw) || raw <= 0;
  const ageWeeks = invalid ? 0 : unit === 'months' ? raw * 4.345 : raw;
  const outOfRange = !invalid && (ageWeeks > 104 || (unit === 'months' && raw > 24));
  const w = !invalid && !outOfRange ? ageWeeks : 0;
  const hasInput = w > 0;
  const totalSleep = !hasInput ? 0 : w <= 4 ? 16 : w <= 12 ? 15 : w <= 24 ? 14 : w <= 48 ? 13 : 12;
  const nightSleep = !hasInput ? 0 : w <= 4 ? 8 : w <= 12 ? 9 : w <= 24 ? 10 : w <= 48 ? 10.5 : 11;
  const daySleep = totalSleep - nightSleep;
  const naps = !hasInput ? 0 : w <= 12 ? 4 : w <= 24 ? 3 : w <= 48 ? 2 : 1;
  const wakeWindow = !hasInput ? '' : w <= 4 ? '45-60 min' : w <= 12 ? '60-90 min' : w <= 24 ? '2-3 hours' : '3-4 hours';
  const result = hasInput ? `Total sleep: ${totalSleep}h/day\nNight: ${nightSleep}h | Day: ${daySleep}h\nNaps: ${naps}\nWake window: ${wakeWindow}` : 'Enter age to see a schedule';
  const error = !invalid && outOfRange ? 'Age out of range — enter 1–104 weeks (or up to 24 months). Schedules beyond toddler age vary too much for a simple table.' : '';

  const presets = [
    { label: 'Newborn (1m)', apply: () => { setAgeValue('1'); setUnit('months'); } },
    { label: '4 months', apply: () => { setAgeValue('4'); setUnit('months'); } },
    { label: '12 months', apply: () => { setAgeValue('12'); setUnit('months'); } },
  ];

  return (
    <CalculatorShell category="Health" title="Baby Sleep Schedule" accent="purple" result={result} error={error} auto presets={presets} downloadData={hasInput ? result : ''} downloadFilename="baby-sleep-schedule.txt">
      <div className="max-w-sm space-y-3">
        <div className="flex gap-2">
          {(['weeks', 'months'] as const).map(u => (
            <button key={u} onClick={() => setUnit(u)} aria-pressed={unit === u} className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${unit === u ? 'bg-purple-600 text-white shadow-sm' : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)]'}`}>{u === 'weeks' ? 'Weeks' : 'Months'}</button>
          ))}
        </div>
        <div><label htmlFor="lbl-babysleepschedulecalculator-age" className={labelCls}>Age ({unit})</label><input id="lbl-babysleepschedulecalculator-age" aria-label={`Age (${unit})`} className={inputCls} type="number" min="0" value={ageValue} onChange={e => setAgeValue(e.target.value)} /></div>
        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">Reference ranges adapted from standard pediatric sleep tables (e.g. AAP / National Sleep Foundation guidance). Every baby differs — treat as a starting point and consult your pediatrician with concerns.</p>
      </div>
    </CalculatorShell>
  );
}

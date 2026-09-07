"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function BabyFormulaCalculator() {
  const [age, setAge] = useState('3');
  const [weight, setWeight] = useState('6');
  const [feedsPerDay, setFeedsPerDay] = useState('8');

  const a = parseFloat(age) || 0;
  const w = parseFloat(weight) || 0;
  const feeds = parseFloat(feedsPerDay) || 8;
  let dailyMl: number;
  if (a <= 0.5) dailyMl = w * 150;
  else if (a <= 3) dailyMl = w * 135;
  else if (a <= 6) dailyMl = w * 120;
  else if (a <= 12) dailyMl = w * 100;
  else dailyMl = w * 90;
  const perFeed = dailyMl / feeds;
  const result = `Daily: ${Math.round(dailyMl)} mL (${(dailyMl * 0.0338).toFixed(1)} oz)\nPer feed: ${Math.round(perFeed)} mL (${(perFeed * 0.0338).toFixed(1)} oz)\nFeeds: ${feeds} per day`;

  const presets = [
    { label: 'Newborn (1mo)', apply: () => { setAge('1'); setWeight('4'); setFeedsPerDay('8'); } },
    { label: '3 months', apply: () => { setAge('3'); setWeight('6'); setFeedsPerDay('6'); } },
    { label: '6 months', apply: () => { setAge('6'); setWeight('8'); setFeedsPerDay('5'); } },
    { label: '12 months', apply: () => { setAge('12'); setWeight('10'); setFeedsPerDay('4'); } },
  ];

  return (
    <CalculatorShell category="Health" title="Baby Formula Calculator" accent="pink" result={result} auto presets={presets}>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Age (months)</label><input aria-label="Age (months)" className={inputCls} type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
        <div><label className={labelCls}>Weight (kg)</label><input aria-label="Weight (kg)" className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        <div><label className={labelCls}>Feeds / day</label><input aria-label="Feeds / day" className={inputCls} type="number" value={feedsPerDay} onChange={e => setFeedsPerDay(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}

"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { Heart } from 'lucide-react';
import { inputCls, labelCls } from '../Calculators.shared';

export default function BabyFormulaCalculator() {
  const [age, setAge] = useState('3');
  const [weight, setWeight] = useState('6');
  const [feedsPerDay, setFeedsPerDay] = useState('8');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
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
    setResult(`Daily: ${Math.round(dailyMl)} mL (${(dailyMl * 0.0338).toFixed(1)} oz)\nPer feed: ${Math.round(perFeed)} mL (${(perFeed * 0.0338).toFixed(1)} oz)\nFeeds: ${feeds} per day`);
  }, [age, weight, feedsPerDay]);
  return (
    <CalculatorShell title="Baby Formula Calculator" icon={<Heart className="w-5 h-5" />} accent="pink" result={result} onCalculate={calc}>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Age (months)</label><input className={inputCls} type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
        <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        <div><label className={labelCls}>Feeds / day</label><input className={inputCls} type="number" value={feedsPerDay} onChange={e => setFeedsPerDay(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}

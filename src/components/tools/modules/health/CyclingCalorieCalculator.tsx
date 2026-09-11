"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function CyclingCalorieCalculator() {
  const [weight, setWeight] = useState('80');
  const [distance, setDistance] = useState('30');
  const [speed, setSpeed] = useState('25');

  const w = parseFloat(weight) || 0;
  const d = parseFloat(distance) || 0;
  const s = parseFloat(speed) || 0;
  let result = '';
  if (w && d && s) {
    const hours = d / s;
    const met = s < 16 ? 4 : s < 20 ? 6 : s < 25 ? 8 : s < 30 ? 10 : 12;
    const calories = Math.round(met * w * hours);
    result = `Duration: ${hours.toFixed(1)} hours\nMET: ${met}\nCalories burned: ${calories} kcal`;
  }

  const presets = [
    { label: 'Leisure ride', apply: () => { setWeight('70'); setDistance('20'); setSpeed('20'); } },
    { label: 'Road training', apply: () => { setWeight('80'); setDistance('50'); setSpeed('28'); } },
  ];

  return (
    <CalculatorShell category="Health" title="Cycling Calorie Calculator" accent="orange" result={result} auto presets={presets}>
      <div className="grid grid-cols-3 gap-4">
        <div><label htmlFor="lbl-cyclingcaloriecalculator-weight-kg" className={labelCls}>Weight (kg)</label><input id="lbl-cyclingcaloriecalculator-weight-kg" aria-label="Weight (kg)" className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        <div><label htmlFor="lbl-cyclingcaloriecalculator-distance-km" className={labelCls}>Distance (km)</label><input id="lbl-cyclingcaloriecalculator-distance-km" aria-label="Distance (km)" className={inputCls} type="number" value={distance} onChange={e => setDistance(e.target.value)} /></div>
        <div><label htmlFor="lbl-cyclingcaloriecalculator-speed-km-h" className={labelCls}>Speed (km/h)</label><input id="lbl-cyclingcaloriecalculator-speed-km-h" aria-label="Speed (km/h)" className={inputCls} type="number" value={speed} onChange={e => setSpeed(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}

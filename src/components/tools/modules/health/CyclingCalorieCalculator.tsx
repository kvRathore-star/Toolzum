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

  return (
    <CalculatorShell title="Cycling Calorie Calculator" accent="orange" result={result} auto>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        <div><label className={labelCls}>Distance (km)</label><input className={inputCls} type="number" value={distance} onChange={e => setDistance(e.target.value)} /></div>
        <div><label className={labelCls}>Speed (km/h)</label><input className={inputCls} type="number" value={speed} onChange={e => setSpeed(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setWeight('70'); setDistance('20'); setSpeed('20'); }}>Leisure ride</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setWeight('80'); setDistance('50'); setSpeed('28'); }}>Road training</button>
      </div>
    </CalculatorShell>
  );
}

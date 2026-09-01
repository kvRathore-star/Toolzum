"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function StepsToCaloriesCalculator() {
  const [steps, setSteps] = useState('10000');
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('170');

  const s = parseFloat(steps) || 0;
  const w = parseFloat(weight) || 0;
  const h = parseFloat(height) || 0;
  let result = '';
  if (s && w && h) {
    const strideLen = h * 0.415;
    const distKm = s * strideLen / 100000;
    const calories = Math.round(distKm * w * 1.036);
    const distMiles = distKm * 0.621371;
    result = `Distance: ${distKm.toFixed(2)} km (${distMiles.toFixed(2)} mi)\nCalories burned: ${calories} kcal\nStride length: ${strideLen.toFixed(1)} cm`;
  }

  const presets = [
    { label: '10K steps', apply: () => { setSteps('10000'); setWeight('70'); setHeight('170'); } },
    { label: '5K steps', apply: () => { setSteps('5000'); } },
  ];

  return (
    <CalculatorShell category="Health" title="Steps to Calories" accent="green" result={result} auto presets={presets}>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Steps</label><input className={inputCls} type="number" value={steps} onChange={e => setSteps(e.target.value)} /></div>
        <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        <div><label className={labelCls}>Height (cm)</label><input className={inputCls} type="number" value={height} onChange={e => setHeight(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}

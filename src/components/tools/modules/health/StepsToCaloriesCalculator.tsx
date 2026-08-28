"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { Heart } from 'lucide-react';
import { inputCls, labelCls } from '../Calculators.shared';

export default function StepsToCaloriesCalculator() {
  const [steps, setSteps] = useState('10000');
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('170');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const s = parseFloat(steps) || 0;
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;
    if (!s || !w || !h) { setResult(''); return; }
    const strideLen = h * 0.415;
    const distKm = s * strideLen / 100000;
    const calories = Math.round(distKm * w * 1.036);
    const distMiles = distKm * 0.621371;
    setResult(`Distance: ${distKm.toFixed(2)} km (${distMiles.toFixed(2)} mi)\nCalories burned: ${calories} kcal\nStride length: ${strideLen.toFixed(1)} cm`);
  }, [steps, weight, height]);
  return (
    <CalculatorShell title="Steps to Calories" icon={<Heart className="w-5 h-5" />} accent="green" result={result} onCalculate={calc}>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Steps</label><input className={inputCls} type="number" value={steps} onChange={e => setSteps(e.target.value)} /></div>
        <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        <div><label className={labelCls}>Height (cm)</label><input className={inputCls} type="number" value={height} onChange={e => setHeight(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setSteps('10000'); setWeight('70'); setHeight('170'); }}>10K steps</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setSteps('5000'); }}>5K steps</button>
      </div>
    </CalculatorShell>
  );
}

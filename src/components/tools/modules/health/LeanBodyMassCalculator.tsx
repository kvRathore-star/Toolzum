"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function LeanBodyMassCalculator() {
  const [gender, setGender] = useState<'male'|'female'>('male');
  const [weight, setWeight] = useState('80');
  const [height, setHeight] = useState('180');

  const w = parseFloat(weight) || 0;
  const h = parseFloat(height) || 0;
  let result = '';
  if (w && h) {
    const boer = gender === 'male' ? 0.407 * w + 0.267 * h - 19.2 : 0.252 * w + 0.473 * h - 48.3;
    const james = gender === 'male' ? 1.1 * w - 128 * Math.pow(w / h, 2) : 1.07 * w - 148 * Math.pow(w / h, 2);
    const avg = (boer + james) / 2;
    result = `Boer formula: ${Math.round(boer * 10) / 10} kg\nJames formula: ${Math.round(james * 10) / 10} kg\nAverage LBM: ${Math.round(avg * 10) / 10} kg\nBody fat est.: ${Math.round((w - avg) / w * 100)}%`;
  }

  const presets = [
    { label: 'Avg Male', apply: () => { setGender('male'); setWeight('80'); setHeight('180'); } },
    { label: 'Avg Female', apply: () => { setGender('female'); setWeight('65'); setHeight('165'); } },
  ];

  return (
    <CalculatorShell category="Health" title="Lean Body Mass" accent="blue" result={result} auto presets={presets}>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Gender</label><select aria-label="Gender" className={inputCls} value={gender} onChange={e => setGender(e.target.value as 'male'|'female')}><option value="male">Male</option><option value="female">Female</option></select></div>
        <div><label className={labelCls}>Weight (kg)</label><input aria-label="Weight (kg)" className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        <div><label className={labelCls}>Height (cm)</label><input aria-label="Height (cm)" className={inputCls} type="number" value={height} onChange={e => setHeight(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}

"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { Heart } from 'lucide-react';
import { inputCls, labelCls } from '../Calculators.shared';

export default function LeanBodyMassCalculator() {
  const [gender, setGender] = useState<'male'|'female'>('male');
  const [weight, setWeight] = useState('80');
  const [height, setHeight] = useState('180');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;
    if (!w || !h) { setResult(''); return; }
    const boer = gender === 'male' ? 0.407 * w + 0.267 * h - 19.2 : 0.252 * w + 0.473 * h - 48.3;
    const james = gender === 'male' ? 1.1 * w - 128 * Math.pow(w / h, 2) : 1.07 * w - 148 * Math.pow(w / h, 2);
    const avg = (boer + james) / 2;
    setResult(`Boer formula: ${Math.round(boer * 10) / 10} kg\nJames formula: ${Math.round(james * 10) / 10} kg\nAverage LBM: ${Math.round(avg * 10) / 10} kg\nBody fat est.: ${Math.round((w - avg) / w * 100)}%`);
  }, [gender, weight, height]);
  return (
    <CalculatorShell title="Lean Body Mass" icon={<Heart className="w-5 h-5" />} accent="blue" result={result} onCalculate={calc}>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Gender</label><select className={inputCls} value={gender} onChange={e => setGender(e.target.value as 'male'|'female')}><option value="male">Male</option><option value="female">Female</option></select></div>
        <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        <div><label className={labelCls}>Height (cm)</label><input className={inputCls} type="number" value={height} onChange={e => setHeight(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}

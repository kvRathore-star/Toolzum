"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function KetoCalculator() {
  const [weight, setWeight] = useState('80');
  const [height, setHeight] = useState('180');
  const [age, setAge] = useState('35');
  const [gender, setGender] = useState<'male'|'female'>('male');
  const [activity, setActivity] = useState('1.55');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;
    const a = parseFloat(age) || 35;
    const act = parseFloat(activity) || 1.55;
    if (!w || !h) { setResult(''); return; }
    const bmr = gender === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
    const tdee = bmr * act;
    const deficit = tdee - 500;
    const protein = w * 1.8;
    const fat = (deficit - protein * 4) / 9;
    const carbs = 20;
    setResult(`Daily calories: ${Math.round(deficit)} kcal\nProtein: ${Math.round(protein)} g (${Math.round(protein * 4)} kcal)\nFat: ${Math.round(fat)} g (${Math.round(fat * 9)} kcal)\nCarbs: ${carbs} g (${carbs * 4} kcal)\nNet carbs: ${carbs}g target`);
  }, [weight, height, age, gender, activity]);
  return (
    <CalculatorShell title="Keto Calculator" accent="amber" result={result} onCalculate={calc}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        <div><label className={labelCls}>Height (cm)</label><input className={inputCls} type="number" value={height} onChange={e => setHeight(e.target.value)} /></div>
        <div><label className={labelCls}>Age</label><input className={inputCls} type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
        <div><label className={labelCls}>Gender</label><select className={inputCls} value={gender} onChange={e => setGender(e.target.value as 'male'|'female')}><option value="male">Male</option><option value="female">Female</option></select></div>
        <div><label className={labelCls}>Activity</label><select className={inputCls} value={activity} onChange={e => setActivity(e.target.value)}><option value="1.2">Sedentary</option><option value="1.375">Light</option><option value="1.55">Moderate</option><option value="1.725">Very active</option></select></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setWeight('80'); setHeight('180'); setAge('35'); setGender('male'); }}>Avg Male</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setWeight('65'); setHeight('165'); setAge('35'); setGender('female'); }}>Avg Female</button>
      </div>
    </CalculatorShell>
  );
}

"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function KetoCalculator() {
  const [weight, setWeight] = useState('80');
  const [height, setHeight] = useState('180');
  const [age, setAge] = useState('35');
  const [gender, setGender] = useState<'male'|'female'>('male');
  const [activity, setActivity] = useState('1.55');

  const w = parseFloat(weight) || 0;
  const h = parseFloat(height) || 0;
  const a = parseFloat(age) || 35;
  const act = parseFloat(activity) || 1.55;
  let result = '';
  if (w && h) {
    const bmr = gender === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
    const tdee = bmr * act;
    const deficit = tdee - 500;
    const protein = w * 1.8;
    const fat = (deficit - protein * 4) / 9;
    const carbs = 20;
    result = `Daily calories: ${Math.round(deficit)} kcal\nProtein: ${Math.round(protein)} g (${Math.round(protein * 4)} kcal)\nFat: ${Math.round(fat)} g (${Math.round(fat * 9)} kcal)\nCarbs: ${carbs} g (${carbs * 4} kcal)\nNet carbs: ${carbs}g target`;
  }

  const presets = [
    { label: 'Avg Male', apply: () => { setWeight('80'); setHeight('180'); setAge('35'); setGender('male'); } },
    { label: 'Avg Female', apply: () => { setWeight('65'); setHeight('165'); setAge('35'); setGender('female'); } },
  ];

  return (
    <CalculatorShell category="Health" title="Keto Calculator" accent="amber" result={result} auto presets={presets}>
      <div className="grid grid-cols-2 gap-4">
        <div><label htmlFor="lbl-ketocalculator-weight-kg" className={labelCls}>Weight (kg)</label><input id="lbl-ketocalculator-weight-kg" aria-label="Weight (kg)" className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        <div><label htmlFor="lbl-ketocalculator-height-cm" className={labelCls}>Height (cm)</label><input id="lbl-ketocalculator-height-cm" aria-label="Height (cm)" className={inputCls} type="number" value={height} onChange={e => setHeight(e.target.value)} /></div>
        <div><label htmlFor="lbl-ketocalculator-age" className={labelCls}>Age</label><input id="lbl-ketocalculator-age" aria-label="Age" className={inputCls} type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
        <div><label htmlFor="lbl-ketocalculator-gender" className={labelCls}>Gender</label><select id="lbl-ketocalculator-gender" aria-label="Gender" className={inputCls} value={gender} onChange={e => setGender(e.target.value as 'male'|'female')}><option value="male">Male</option><option value="female">Female</option></select></div>
        <div><label htmlFor="lbl-ketocalculator-activity" className={labelCls}>Activity</label><select id="lbl-ketocalculator-activity" aria-label="Activity" className={inputCls} value={activity} onChange={e => setActivity(e.target.value)}><option value="1.2">Sedentary</option><option value="1.375">Light</option><option value="1.55">Moderate</option><option value="1.725">Very active</option></select></div>
      </div>
    </CalculatorShell>
  );
}

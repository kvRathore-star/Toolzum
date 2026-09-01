"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function ProteinCalculator() {
  const [weight, setWeight] = useState('80');
  const [goal, setGoal] = useState('general');
  const [activity, setActivity] = useState('moderate');

  const w = parseFloat(weight) || 0;
  let result = '';
  if (w) {
    const factors: Record<string, Record<string, number>> = { general: { sedentary: 0.8, moderate: 1.2, active: 1.6 }, muscle: { sedentary: 1.2, moderate: 1.6, active: 2.2 }, weightLoss: { sedentary: 1.2, moderate: 1.6, active: 2.0 } };
    const factor = (factors[goal]?.[activity] || 1.2);
    const proteinG = Math.round(w * factor);
    const perMeal = Math.round(proteinG / 3);
    result = `Daily protein: ${proteinG}g\nPer meal (3 meals): ${perMeal}g\nRange: ${Math.round(w * (factor - 0.3))}g - ${Math.round(w * (factor + 0.3))}g`;
  }

  const presets = [
    { label: 'Muscle Gain, Active', apply: () => { setWeight('80'); setGoal('muscle'); setActivity('active'); } },
    { label: 'Weight Loss, Moderate', apply: () => { setWeight('70'); setGoal('weightLoss'); setActivity('moderate'); } },
  ];

  return (
    <CalculatorShell category="Health" title="Protein Calculator" accent="blue" result={result} auto presets={presets}>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        <div><label className={labelCls}>Goal</label><select className={inputCls} value={goal} onChange={e => setGoal(e.target.value)}><option value="general">General health</option><option value="muscle">Muscle gain</option><option value="weightLoss">Weight loss</option></select></div>
        <div><label className={labelCls}>Activity</label><select className={inputCls} value={activity} onChange={e => setActivity(e.target.value)}><option value="sedentary">Sedentary</option><option value="moderate">Moderate</option><option value="active">Very active</option></select></div>
      </div>
    </CalculatorShell>
  );
}

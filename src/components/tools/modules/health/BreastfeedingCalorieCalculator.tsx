"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { Heart } from 'lucide-react';
import { inputCls, labelCls } from '../Calculators.shared';

export default function BreastfeedingCalorieCalculator() {
  const [age, setAge] = useState('3');
  const [feedings, setFeedings] = useState('8');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const a = parseFloat(age) || 0;
    const f = parseFloat(feedings) || 8;
    const milkPerFeedMl = a <= 1 ? 60 : a <= 2 ? 90 : a <= 4 ? 120 : a <= 6 ? 150 : a <= 12 ? 180 : 210;
    const dailyMl = milkPerFeedMl * f;
    const caloriesBurned = Math.round(dailyMl * 0.67);
    setResult(`Est. milk per feed: ${milkPerFeedMl} mL\nDaily milk output: ${dailyMl} mL\nCalories burned: ~${caloriesBurned} kcal/day`);
  }, [age, feedings]);
  return (
    <CalculatorShell title="Breastfeeding Calories" icon={<Heart className="w-5 h-5" />} accent="fuchsia" result={result} onCalculate={calc}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Baby age (months)</label><input className={inputCls} type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
        <div><label className={labelCls}>Feedings / day</label><input className={inputCls} type="number" value={feedings} onChange={e => setFeedings(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}

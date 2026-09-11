"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function BreastfeedingCalorieCalculator() {
  const [age, setAge] = useState('3');
  const [feedings, setFeedings] = useState('8');

  const a = parseFloat(age) || 0;
  const f = parseFloat(feedings) || 0;
  const hasInput = age !== '' && feedings !== '' && !isNaN(a) && !isNaN(f) && a > 0 && f > 0;
  const milkPerFeedMl = !hasInput ? 0 : a <= 1 ? 60 : a <= 2 ? 90 : a <= 4 ? 120 : a <= 6 ? 150 : a <= 12 ? 180 : 210;
  const dailyMl = milkPerFeedMl * f;
  const caloriesBurned = Math.round(dailyMl * 0.67);
  const result = hasInput ? `Est. milk per feed: ${milkPerFeedMl} mL\nDaily milk output: ${dailyMl} mL\nCalories burned: ~${caloriesBurned} kcal/day` : 'Enter baby age and feedings per day';

  return (
    <CalculatorShell category="Health" title="Breastfeeding Calories" accent="fuchsia" result={result} auto>
      <div className="grid grid-cols-2 gap-4">
        <div><label htmlFor="lbl-breastfeedingcaloriecalculator-baby-age-months" className={labelCls}>Baby age (months)</label><input id="lbl-breastfeedingcaloriecalculator-baby-age-months" aria-label="Baby age (months)" className={inputCls} type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
        <div><label htmlFor="lbl-breastfeedingcaloriecalculator-feedings-day" className={labelCls}>Feedings / day</label><input id="lbl-breastfeedingcaloriecalculator-feedings-day" aria-label="Feedings / day" className={inputCls} type="number" value={feedings} onChange={e => setFeedings(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}

"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function BreastfeedingCalorieCalculator() {
  const [age, setAge] = useState('3');
  const [feedings, setFeedings] = useState('8');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');

  const a = parseFloat(age) || 0;
  const f = parseFloat(feedings) || 0;
  const invalid = age.trim() === '' || feedings.trim() === '' || isNaN(a) || isNaN(f) || a <= 0 || f <= 0;
  const outOfRange = !invalid && (a > 24 || f > 20);
  const hasInput = !invalid && !outOfRange;
  const milkPerFeedMl = !hasInput ? 0 : a <= 1 ? 60 : a <= 2 ? 90 : a <= 4 ? 120 : a <= 6 ? 150 : a <= 12 ? 180 : 210;
  const dailyMl = milkPerFeedMl * f;
  const caloriesBurned = Math.round(dailyMl * 0.67);
  const fmtVol = (ml: number) => unit === 'metric' ? `${ml} mL` : `${(ml / 29.5735).toFixed(1)} fl oz`;
  const result = hasInput ? `Est. milk per feed: ${fmtVol(milkPerFeedMl)}\nDaily milk output: ${fmtVol(dailyMl)}\nCalories burned: ~${caloriesBurned} kcal/day` : 'Enter baby age and feedings per day';
  const error = !invalid && outOfRange ? 'Out of range — enter baby age 0–24 months and 1–20 feedings per day.' : '';

  return (
    <CalculatorShell category="Health" title="Breastfeeding Calories" accent="fuchsia" result={result} error={error} auto downloadData={hasInput ? result : ''} downloadFilename="breastfeeding-calories.txt">
      <div className="space-y-3">
      <div className="flex gap-2">
        {(['metric', 'imperial'] as const).map(u => (
          <button key={u} onClick={() => setUnit(u)} aria-pressed={unit === u} className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${unit === u ? 'bg-fuchsia-600 text-white shadow-sm' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] dark:text-[var(--text-muted)]'}`}>{u === 'metric' ? 'Metric (mL)' : 'Imperial (fl oz)'}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label htmlFor="lbl-breastfeedingcaloriecalculator-baby-age-months" className={labelCls}>Baby age (months)</label><input id="lbl-breastfeedingcaloriecalculator-baby-age-months" aria-label="Baby age (months)" className={inputCls} type="number" min="0" value={age} onChange={e => setAge(e.target.value)} /></div>
        <div><label htmlFor="lbl-breastfeedingcaloriecalculator-feedings-day" className={labelCls}>Feedings / day</label><input id="lbl-breastfeedingcaloriecalculator-feedings-day" aria-label="Feedings / day" className={inputCls} type="number" min="0" value={feedings} onChange={e => setFeedings(e.target.value)} /></div>
      </div>
      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">Reference ranges based on typical infant intake tables (~0.67 kcal per mL of breast milk); actual supply varies widely. For guidance on feeding or nutrition, consult your pediatrician or a lactation consultant.</p>
      </div>
    </CalculatorShell>
  );
}

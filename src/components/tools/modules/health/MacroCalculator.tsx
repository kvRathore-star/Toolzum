"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function MacroCalculator() {
  const [calories, setCalories] = useState('2000');
  const [proteinPct, setProteinPct] = useState('30');
  const [carbsPct, setCarbsPct] = useState('40');
  const [fatPct, setFatPct] = useState('30');

  const cals = parseFloat(calories) || 0;
  const p = parseFloat(proteinPct) || 0;
  const c = parseFloat(carbsPct) || 0;
  const f = parseFloat(fatPct) || 0;
  let result = '';
  if (cals && Math.abs(p + c + f - 100) <= 1) {
    const proteinG = cals * (p / 100) / 4;
    const carbsG = cals * (c / 100) / 4;
    const fatG = cals * (f / 100) / 9;
    result = `Protein: ${Math.round(proteinG)}g (${Math.round(proteinG * 4)} kcal)\nCarbs: ${Math.round(carbsG)}g (${Math.round(carbsG * 4)} kcal)\nFat: ${Math.round(fatG)}g (${Math.round(fatG * 9)} kcal)`;
  }

  return (
    <CalculatorShell category="Health"
      title="Macro Calculator"
      accent="lime"
      result={result}
      auto
      presets={[
        { label: 'Balanced', apply: () => { setCalories('2000'); setProteinPct('30'); setCarbsPct('40'); setFatPct('30'); } },
        { label: 'Keto', apply: () => { setCalories('2000'); setProteinPct('25'); setCarbsPct('5'); setFatPct('70'); } },
        { label: 'Muscle gain', apply: () => { setCalories('2500'); setProteinPct('35'); setCarbsPct('45'); setFatPct('20'); } },
      ]}
      downloadData={`Calories,ProteinPct,CarbsPct,FatPct,Result\n${calories},${proteinPct},${carbsPct},${fatPct},${result.replace(/\n/g, ' | ')}`}
      downloadFilename="macro-breakdown.csv"
    >
      <div className="grid grid-cols-2 gap-4">
        <div><label htmlFor="lbl-macrocalculator-daily-calories" className={labelCls}>Daily calories</label><input id="lbl-macrocalculator-daily-calories" aria-label="Daily calories" className={inputCls} type="number" value={calories} onChange={e => setCalories(e.target.value)} /></div>
        <div className="opacity-0 pointer-events-none"><label className={labelCls}>_</label><input aria-label="_" className={inputCls} /></div>
        <div><label htmlFor="lbl-macrocalculator-protein" className={labelCls}>Protein %</label><input id="lbl-macrocalculator-protein" aria-label="Protein %" className={inputCls} type="number" value={proteinPct} onChange={e => setProteinPct(e.target.value)} /></div>
        <div><label htmlFor="lbl-macrocalculator-carbs" className={labelCls}>Carbs %</label><input id="lbl-macrocalculator-carbs" aria-label="Carbs %" className={inputCls} type="number" value={carbsPct} onChange={e => setCarbsPct(e.target.value)} /></div>
        <div><label htmlFor="lbl-macrocalculator-fat" className={labelCls}>Fat %</label><input id="lbl-macrocalculator-fat" aria-label="Fat %" className={inputCls} type="number" value={fatPct} onChange={e => setFatPct(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setCalories('2000'); setProteinPct('30'); setCarbsPct('40'); setFatPct('30'); }}>Balanced</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setCalories('2000'); setProteinPct('40'); setCarbsPct('20'); setFatPct('40'); }}>Keto</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setCalories('2500'); setProteinPct('35'); setCarbsPct('45'); setFatPct('20'); }}>Muscle gain</button>
      </div>
    </CalculatorShell>
  );
}

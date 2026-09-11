"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function BodySurfaceAreaCalculator() {
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('170');
  const [unit, setUnit] = useState<'metric'|'imperial'>('metric');

  const w = parseFloat(weight) || 0;
  const h = parseFloat(height) || 0;
  let result = '';
  let bsaResults: { m2: number; formula: string }[] = [];
  if (w && h) {
    const wKg = unit === 'imperial' ? w * 0.453592 : w;
    const hCm = unit === 'imperial' ? h * 2.54 : h;
    bsaResults = [
      { formula: 'Mosteller', m2: Math.round(Math.sqrt(wKg * hCm / 3600) * 100) / 100 },
      { formula: 'Du Bois', m2: Math.round(0.007184 * Math.pow(wKg, 0.425) * Math.pow(hCm, 0.725) * 100) / 100 },
      { formula: 'Haycock', m2: Math.round(0.024265 * Math.pow(wKg, 0.5378) * Math.pow(hCm, 0.3964) * 100) / 100 },
      { formula: 'Gehan & George', m2: Math.round(0.0235 * Math.pow(wKg, 0.51456) * Math.pow(hCm, 0.42246) * 100) / 100 },
    ];
    const avg = bsaResults.reduce((s, r) => s + r.m2, 0) / bsaResults.length;
    result = `Avg: ${avg.toFixed(2)} m²`;
  }

  const presets = [
    { label: 'Adult (70kg/170cm)', apply: () => { setWeight('70'); setHeight('170'); } },
    { label: 'Adult (85kg/180cm)', apply: () => { setWeight('85'); setHeight('180'); } },
  ];

  return (
    <CalculatorShell category="Health" title="Body Surface Area (BSA)" accent="emerald" result={result} auto presets={presets} customResult={
      <div className="grid gap-3">
        {bsaResults.map((r, i) => {
          const styles = [
            { text: 'text-emerald-700 dark:text-emerald-400' },
            { text: 'text-blue-700 dark:text-blue-400' },
            { text: 'text-violet-700 dark:text-violet-400' },
            { text: 'text-amber-700 dark:text-amber-400' },
          ];
          const s = styles[i] || styles[0]!;
          return (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm font-bold text-[var(--text-primary)]">{r.formula}</span>
              <span className={`text-xl font-bold ${s.text} font-mono`}>{r.m2} m²</span>
            </div>
          );
        })}
        {bsaResults.length > 0 && (
          <div className="text-center">
            <div className="text-xs text-[var(--text-tertiary)]">Average of all formulas</div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{(bsaResults.reduce((s, r) => s + r.m2, 0) / bsaResults.length).toFixed(2)} m²</div>
          </div>
        )}
      </div>
    }>
      <div className="max-w-xl">
        <div className="grid grid-cols-2 gap-4">
          <div><label htmlFor="lbl-bodysurfaceareacalculator-unit" className={labelCls}>Unit</label><select id="lbl-bodysurfaceareacalculator-unit" aria-label="Unit" className={inputCls} value={unit} onChange={e => setUnit(e.target.value as 'metric'|'imperial')}><option value="metric">Metric (kg/cm)</option><option value="imperial">Imperial (lb/in)</option></select></div>
          <div><label className={labelCls}>{unit === 'metric' ? 'Weight (kg)' : 'Weight (lb)'}</label><input aria-label={unit === 'metric' ? 'Weight (kg)' : 'Weight (lb)'} className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
          <div><label className={labelCls}>{unit === 'metric' ? 'Height (cm)' : 'Height (in)'}</label><input aria-label={unit === 'metric' ? 'Height (cm)' : 'Height (in)'} className={inputCls} type="number" value={height} onChange={e => setHeight(e.target.value)} /></div>
        </div>
      </div>
    </CalculatorShell>
  );
}

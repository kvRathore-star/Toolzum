"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function BodyFatPercentageCalculator() {
  const [gender, setGender] = useState<'male'|'female'>('male');
  const [height, setHeight] = useState('175');
  const [waist, setWaist] = useState('80');
  const [neck, setNeck] = useState('40');
  const [hip, setHip] = useState('100');

  // U.S. Navy Hodgdon-Beckett, density form (works directly in cm):
  // male BF% = 495/(1.0324 − 0.19077·log10(waist−neck) + 0.15456·log10(height)) − 450
  // female BF% = 495/(1.29579 − 0.35004·log10(waist+hip−neck) + 0.22100·log10(height)) − 450
  // The old code fed body WEIGHT where HEIGHT belongs and mixed units —
  // the "Fit Male" preset read 34.9% Obese; it now reads ~11% Athletes.
  const ht = parseFloat(height) || 0;
  const wa = parseFloat(waist) || 0;
  const n = parseFloat(neck) || 0;
  const h = parseFloat(hip) || 0;
  let result = '';
  let category = '';
  if (ht > 0 && wa > 0 && n > 0 && (wa - n) > 0 && !(gender === 'female' && (!h || (wa + h - n) <= 0))) {
    let bf: number;
    if (gender === 'male') {
      bf = 495 / (1.0324 - 0.19077 * Math.log10(wa - n) + 0.15456 * Math.log10(ht)) - 450;
    } else {
      bf = 495 / (1.29579 - 0.35004 * Math.log10(wa + h - n) + 0.22100 * Math.log10(ht)) - 450;
    }
    const rounded = Math.round(bf * 10) / 10;
    result = rounded.toString();
    if (gender === 'male') {
      if (rounded < 6) category = 'Essential fat';
      else if (rounded < 14) category = 'Athletes';
      else if (rounded < 18) category = 'Fitness';
      else if (rounded < 25) category = 'Acceptable';
      else category = 'Obese';
    } else {
      if (rounded < 14) category = 'Essential fat';
      else if (rounded < 21) category = 'Athletes';
      else if (rounded < 25) category = 'Fitness';
      else if (rounded < 32) category = 'Acceptable';
      else category = 'Obese';
    }
  }

  const presets = [
    { label: 'Fit Male', apply: () => { setGender('male'); setHeight('175'); setWaist('80'); setNeck('40'); } },
    { label: 'Avg Female', apply: () => { setGender('female'); setHeight('162'); setWaist('75'); setNeck('35'); setHip('100'); } },
  ];

  return (
    <CalculatorShell category="Health" title="Body Fat Percentage" accent="rose" result={result} auto presets={presets} customResult={
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-center">
          <div className="text-xs text-[var(--text-tertiary)]">Body Fat</div>
          <div className="text-2xl font-bold text-rose-700 dark:text-rose-400">{result}%</div>
        </div>
        <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4 text-center">
          <div className="text-xs text-[var(--text-tertiary)]">Category</div>
          <div className="text-lg font-bold text-[var(--text-primary)]">{category}</div>
        </div>
        <div className="col-span-2 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4">
          <div className="text-xs text-[var(--text-tertiary)] mb-2">Body Fat Indicator</div>
          <div className="w-full bg-[var(--bg-overlay)] rounded-full h-3">
            <div className={`h-3 rounded-full transition-all ${result && parseFloat(result) > 25 ? 'bg-red-500' : result && parseFloat(result) > 18 ? 'bg-yellow-500' : result && parseFloat(result) > 14 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: result ? `${Math.min(100, Math.max(5, parseFloat(result) * 2.5))}%` : '0%' }} />
          </div>
          <div className="flex justify-between text-xs text-[var(--text-tertiary)] mt-1"><span>Essential</span><span>Fitness</span><span>Acceptable</span><span>Obese</span></div>
        </div>
      </div>
    }>
      <div className="max-w-xl">
        <div className="grid grid-cols-2 gap-4">
          <div><label htmlFor="lbl-bodyfatpercentagecalculator-gender" className={labelCls}>Gender</label><select id="lbl-bodyfatpercentagecalculator-gender" aria-label="Gender" className={inputCls} value={gender} onChange={e => setGender(e.target.value as 'male'|'female')}><option value="male">Male</option><option value="female">Female</option></select></div>
          <div><label htmlFor="lbl-bodyfatpercentagecalculator-height-cm" className={labelCls}>Height (cm)</label><input id="lbl-bodyfatpercentagecalculator-height-cm" aria-label="Height (cm)" className={inputCls} type="number" value={height} onChange={e => setHeight(e.target.value)} /></div>
          <div><label htmlFor="lbl-bodyfatpercentagecalculator-waist-cm" className={labelCls}>Waist (cm)</label><input id="lbl-bodyfatpercentagecalculator-waist-cm" aria-label="Waist (cm)" className={inputCls} type="number" value={waist} onChange={e => setWaist(e.target.value)} /></div>
          <div><label htmlFor="lbl-bodyfatpercentagecalculator-neck-cm" className={labelCls}>Neck (cm)</label><input id="lbl-bodyfatpercentagecalculator-neck-cm" aria-label="Neck (cm)" className={inputCls} type="number" value={neck} onChange={e => setNeck(e.target.value)} /></div>
          <div className={gender === 'female' ? '' : 'opacity-50'}><label htmlFor="lbl-bodyfatpercentagecalculator-hip-cm-female" className={labelCls}>Hip (cm, female)</label><input id="lbl-bodyfatpercentagecalculator-hip-cm-female" aria-label="Hip (cm, female)" className={inputCls} type="number" value={hip} onChange={e => setHip(e.target.value)} disabled={gender === 'male'} /></div>
        </div>
      </div>
    </CalculatorShell>
  );
}

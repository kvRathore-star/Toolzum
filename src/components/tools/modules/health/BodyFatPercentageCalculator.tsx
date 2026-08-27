"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';

export default function BodyFatPercentageCalculator() {
  const [gender, setGender] = useState<'male'|'female'>('male');
  const [weight, setWeight] = useState('80');
  const [waist, setWaist] = useState('90');
  const [neck, setNeck] = useState('40');
  const [hip, setHip] = useState('100');
  const [result, setResult] = useState('');
  const [category, setCategory] = useState('');
  const calc = useCallback(() => {
    const w = parseFloat(weight) || 0;
    const wa = parseFloat(waist) || 0;
    const n = parseFloat(neck) || 0;
    const h = parseFloat(hip) || 0;
    if (!w || !wa || !n) { setResult('Please fill required fields.'); return; }
    let bf: number;
    if (gender === 'male') {
      bf = 495 / (1.0324 - 0.19077 * Math.log10(wa - n) + 0.15456 * Math.log10(w)) - 450;
    } else {
      if (!h) { setResult('Hip measurement required for female.'); return; }
      bf = 495 / (1.29579 - 0.35004 * Math.log10(wa + h - n) + 0.22100 * Math.log10(w)) - 450;
    }
    const rounded = Math.round(bf * 10) / 10;
    setResult(rounded.toString());
    let cat = '';
    if (gender === 'male') {
      if (rounded < 6) cat = 'Essential fat';
      else if (rounded < 14) cat = 'Athletes';
      else if (rounded < 18) cat = 'Fitness';
      else if (rounded < 25) cat = 'Acceptable';
      else cat = 'Obese';
    } else {
      if (rounded < 14) cat = 'Essential fat';
      else if (rounded < 21) cat = 'Athletes';
      else if (rounded < 25) cat = 'Fitness';
      else if (rounded < 32) cat = 'Acceptable';
      else cat = 'Obese';
    }
    setCategory(cat);
  }, [gender, weight, waist, neck, hip]);
  return (
    <CalculatorShell title="Body Fat Percentage" accent="rose" result={result} onCalculate={calc}>
      <div className="max-w-xl">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Gender</label><select className={inputCls} value={gender} onChange={e => setGender(e.target.value as 'male'|'female')}><option value="male">Male</option><option value="female">Female</option></select></div>
          <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
          <div><label className={labelCls}>Waist (cm)</label><input className={inputCls} type="number" value={waist} onChange={e => setWaist(e.target.value)} /></div>
          <div><label className={labelCls}>Neck (cm)</label><input className={inputCls} type="number" value={neck} onChange={e => setNeck(e.target.value)} /></div>
          <div className={gender === 'female' ? '' : 'opacity-50'}><label className={labelCls}>Hip (cm, female)</label><input className={inputCls} type="number" value={hip} onChange={e => setHip(e.target.value)} disabled={gender === 'male'} /></div>
        </div>
        {result && (
          <div className="mt-6 grid grid-cols-2 gap-4">
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
                <div className={`h-3 rounded-full transition-all ${parseFloat(result) > 25 ? 'bg-red-500' : parseFloat(result) > 18 ? 'bg-yellow-500' : parseFloat(result) > 14 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, Math.max(5, parseFloat(result) * 2.5))}%` }} />
              </div>
              <div className="flex justify-between text-xs text-[var(--text-tertiary)] mt-1"><span>Essential</span><span>Fitness</span><span>Acceptable</span><span>Obese</span></div>
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}

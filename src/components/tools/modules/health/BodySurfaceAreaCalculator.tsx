"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';

export default function BodySurfaceAreaCalculator() {
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('170');
  const [unit, setUnit] = useState<'metric'|'imperial'>('metric');
  const [result, setResult] = useState<{m2: number; formula: string; value: number}[]>([]);
  const calc = useCallback(() => {
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;
    if (!w || !h) { setResult([]); return; }
    const wKg = unit === 'imperial' ? w * 0.453592 : w;
    const hCm = unit === 'imperial' ? h * 2.54 : h;
    const formulas = [
      { name: 'Mosteller', calc: Math.sqrt(wKg * hCm / 3600) },
      { name: 'Du Bois', calc: 0.007184 * Math.pow(wKg, 0.425) * Math.pow(hCm, 0.725) },
      { name: 'Haycock', calc: 0.024265 * Math.pow(wKg, 0.5378) * Math.pow(hCm, 0.3964) },
      { name: 'Gehan & George', calc: 0.0235 * Math.pow(wKg, 0.51456) * Math.pow(hCm, 0.42246) },
    ];
    setResult(formulas.map(f => ({ m2: Math.round(f.calc * 100) / 100, formula: f.name, value: Math.round(f.calc * 100) / 100 })));
  }, [weight, height, unit]);
  return (
    <CalculatorShell title="Body Surface Area (BSA)" accent="emerald" result={result.length > 0 ? `Avg: ${(result.reduce((s, r) => s + r.m2, 0) / result.length).toFixed(2)} m²` : ''} onCalculate={calc}>
      <div className="max-w-xl">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Unit</label><select className={inputCls} value={unit} onChange={e => setUnit(e.target.value as 'metric'|'imperial')}><option value="metric">Metric (kg/cm)</option><option value="imperial">Imperial (lb/in)</option></select></div>
          <div><label className={labelCls}>{unit === 'metric' ? 'Weight (kg)' : 'Weight (lb)'}</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
          <div><label className={labelCls}>{unit === 'metric' ? 'Height (cm)' : 'Height (in)'}</label><input className={inputCls} type="number" value={height} onChange={e => setHeight(e.target.value)} /></div>
        </div>
        <div className="flex gap-3 mt-3">
          <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setWeight('70'); setHeight('170'); }}>Adult (70kg/170cm)</button>
          <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setWeight('85'); setHeight('180'); }}>Adult (85kg/180cm)</button>
        </div>
        {result.length > 0 && (
          <div className="mt-6 grid gap-3">
            {result.map((r, i) => {
              const styles = [
                { bg: 'bg-emerald-700/10 border border-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400' },
                { bg: 'bg-blue-500/10 border border-blue-500/20', text: 'text-blue-700 dark:text-blue-400' },
                { bg: 'bg-violet-500/10 border border-violet-500/20', text: 'text-violet-700 dark:text-violet-400' },
                { bg: 'bg-amber-500/10 border border-amber-500/20', text: 'text-amber-700 dark:text-amber-400' },
              ];
              const s = styles[i] || styles[0];
              return (
                <div key={i} className={`flex items-center justify-between ${s.bg} rounded-xl p-4`}>
                  <span className="text-sm font-bold text-[var(--text-primary)]">{r.formula}</span>
                  <span className={`text-xl font-bold ${s.text} font-mono`}>{r.m2} m²</span>
                </div>
              );
            })}
            <div className="bg-emerald-700/10 border border-emerald-500/20 rounded-xl p-4 text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Average of all formulas</div>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{(result.reduce((s, r) => s + r.m2, 0) / result.length).toFixed(2)} m²</div>
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}

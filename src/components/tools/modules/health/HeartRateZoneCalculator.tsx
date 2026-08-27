"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';

export default function HeartRateZoneCalculator() {
  const [age, setAge] = useState('35');
  const [restHr, setRestHr] = useState('65');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const a = parseFloat(age) || 35;
    const rhr = parseFloat(restHr) || 65;
    const maxHr = 220 - a;
    const reserve = maxHr - rhr;
    const zones = [
      { name: 'Zone 1: Very Light', intensity: '50-60%', min: Math.round(rhr + reserve * 0.5), max: Math.round(rhr + reserve * 0.6) },
      { name: 'Zone 2: Light', intensity: '60-70%', min: Math.round(rhr + reserve * 0.6), max: Math.round(rhr + reserve * 0.7) },
      { name: 'Zone 3: Moderate', intensity: '70-80%', min: Math.round(rhr + reserve * 0.7), max: Math.round(rhr + reserve * 0.8) },
      { name: 'Zone 4: Hard', intensity: '80-90%', min: Math.round(rhr + reserve * 0.8), max: Math.round(rhr + reserve * 0.9) },
      { name: 'Zone 5: Maximum', intensity: '90-100%', min: Math.round(rhr + reserve * 0.9), max: maxHr },
    ];
    setResult(`Max HR: ${maxHr} bpm\nHR Reserve: ${reserve} bpm` + zones.map(z => `\n${z.name}: ${z.min}-${z.max} bpm`).join(''));
  }, [age, restHr]);
  return (
    <CalculatorShell title="Heart Rate Zone Calculator" accent="rose" result={result} onCalculate={calc}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Age</label><input className={inputCls} type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
        <div><label className={labelCls}>Resting HR (bpm)</label><input className={inputCls} type="number" value={restHr} onChange={e => setRestHr(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setAge('25'); setRestHr('60'); }}>Athlete 25</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setAge('45'); setRestHr('72'); }}>Average 45</button>
      </div>
    </CalculatorShell>
  );
}

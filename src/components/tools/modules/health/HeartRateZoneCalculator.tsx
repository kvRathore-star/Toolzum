"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function HeartRateZoneCalculator() {
  const [age, setAge] = useState('35');
  const [restHr, setRestHr] = useState('65');

  const hasInput = age !== '' && restHr !== '';
  let maxHr = 0;
  let reserve = 0;
  let zones: Array<{name: string; intensity: string; min: number; max: number}> = [];
  let result = '';
  if (hasInput) {
    const a = parseFloat(age) || 0;
    const rhr = parseFloat(restHr) || 0;
    maxHr = 220 - a;
    reserve = maxHr - rhr;
    zones = [
      { name: 'Zone 1: Very Light', intensity: '50-60%', min: Math.round(rhr + reserve * 0.5), max: Math.round(rhr + reserve * 0.6) },
      { name: 'Zone 2: Light', intensity: '60-70%', min: Math.round(rhr + reserve * 0.6), max: Math.round(rhr + reserve * 0.7) },
      { name: 'Zone 3: Moderate', intensity: '70-80%', min: Math.round(rhr + reserve * 0.7), max: Math.round(rhr + reserve * 0.8) },
      { name: 'Zone 4: Hard', intensity: '80-90%', min: Math.round(rhr + reserve * 0.8), max: Math.round(rhr + reserve * 0.9) },
      { name: 'Zone 5: Maximum', intensity: '90-100%', min: Math.round(rhr + reserve * 0.9), max: maxHr },
    ];
    result = `Max HR: ${maxHr} bpm\nHR Reserve: ${reserve} bpm` + zones.map(z => `\n${z.name}: ${z.min}-${z.max} bpm`).join('');
  }

  return (
    <CalculatorShell category="Health"
      title="Heart Rate Zone Calculator"
      accent="rose"
      result={result}
      auto
      presets={[
        { label: 'Athlete 25', apply: () => { setAge('25'); setRestHr('60'); } },
        { label: 'Average 35', apply: () => { setAge('35'); setRestHr('65'); } },
        { label: 'Average 45', apply: () => { setAge('45'); setRestHr('72'); } },
      ]}
      downloadData={`Age,RestingHR,Result\n${age},${restHr},${result.replace(/\n/g, ' | ')}`}
      downloadFilename="heart-rate-zones.csv"
    >
      <div className="grid grid-cols-2 gap-4">
        <div><label htmlFor="lbl-heartratezonecalculator-age" className={labelCls}>Age</label><input id="lbl-heartratezonecalculator-age" aria-label="Age" className={inputCls} type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
        <div><label htmlFor="lbl-heartratezonecalculator-resting-hr-bpm" className={labelCls}>Resting HR (bpm)</label><input id="lbl-heartratezonecalculator-resting-hr-bpm" aria-label="Resting HR (bpm)" className={inputCls} type="number" value={restHr} onChange={e => setRestHr(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setAge('25'); setRestHr('60'); }}>Athlete 25</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setAge('45'); setRestHr('72'); }}>Average 45</button>
      </div>
    </CalculatorShell>
  );
}

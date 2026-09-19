"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function CircleCalculator() {
  const [radius, setRadius] = useState('5');
  const presets = [
    { label: 'r=1', apply: () => { setRadius('1'); } },
    { label: 'r=5', apply: () => { setRadius('5'); } },
    { label: 'r=10', apply: () => { setRadius('10'); } },
  ];
  const r = parseFloat(radius) || 0;
  const hasInput = radius !== '' && !isNaN(r) && r > 0;
  const area = hasInput ? Math.PI * r * r : 0;
  const customResult = (
    !hasInput ? (
      <div className="text-sm text-[var(--text-muted)]">Enter radius</div>
    ) : (
    <div className="grid grid-cols-2 gap-2">
      <div className="text-center">
        <div className="text-xs text-[var(--text-tertiary)]">Area</div>
        <div className="text-lg font-bold text-[var(--accent)]">{area.toFixed(1)}</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-[var(--text-tertiary)]">Circumference</div>
        <div className="text-lg font-bold text-[var(--accent)]">{(2 * Math.PI * r).toFixed(1)}</div>
      </div>
    </div>
    )
  );
  return (
    <CalculatorShell category="Calculator" title="Circle Calculator" result="" auto presets={presets} accent="violet" customResult={customResult}>
      <div><label htmlFor="lbl-circlecalculator-radius" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Radius</label><input id="lbl-circlecalculator-radius" aria-label="Radius" type="number" value={radius} onChange={e => setRadius(e.target.value)} step="0.1" className={inputCls} /></div>
    </CalculatorShell>
  );
}

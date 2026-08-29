"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function PpiCalculator() {
  const [diagPixels, setDiagPixels] = useState('2200');
  const [diagInches, setDiagInches] = useState('6.1');
  const presets = [
    { label: 'iPhone 6.1"', apply: () => { setDiagPixels('2532'); setDiagInches('6.1'); } },
    { label: '27" Monitor', apply: () => { setDiagPixels('3840'); setDiagInches('27'); } },
    { label: '15" Laptop', apply: () => { setDiagPixels('1920'); setDiagInches('15.6'); } },
  ];
  const p = parseFloat(diagPixels) || 0;
  const i = parseFloat(diagInches) || 1;
  const ppi = p / i;
  const customResult = (
    <div className="text-center">
      <div className="text-xs text-[var(--text-tertiary)]">Pixels Per Inch</div>
      <div className="text-lg font-bold text-purple-700 dark:text-purple-400">{ppi.toFixed(0)}</div>
    </div>
  );
  return (
    <CalculatorShell title="PPI Calculator" result="" auto presets={presets} accent="orange" customResult={customResult}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Diagonal Pixels</label><input type="number" value={diagPixels} onChange={e => setDiagPixels(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Diagonal Inches</label><input type="number" value={diagInches} onChange={e => setDiagInches(e.target.value)} step="0.1" className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}

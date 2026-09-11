"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function DpiCalculator() {
  const [pixels, setPixels] = useState('1920');
  const [inches, setInches] = useState('13.3');
  const presets = [
    { label: 'MacBook 13\"', apply: () => { setPixels('2560'); setInches('13.3'); } },
    { label: 'Full HD 24\"', apply: () => { setPixels('1920'); setInches('24'); } },
    { label: 'Phone 6.1\"', apply: () => { setPixels('2532'); setInches('6.1'); } },
  ];
  const hasInput = pixels !== '' && inches !== '';
  let dpi: number | null = null;
  if (hasInput) {
    const p = parseFloat(pixels) || 0;
    const i = parseFloat(inches) || 1;
    dpi = p / i;
  }
  const customResult = hasInput && dpi !== null ? (
    <div className="text-center">
      <div className="text-xs text-[var(--text-tertiary)]">Dots Per Inch</div>
      <div className="text-lg font-bold text-indigo-700 dark:text-indigo-400">{dpi.toFixed(0)}</div>
    </div>
  ) : null;
  return (
    <CalculatorShell category="Calculator" title="DPI Calculator" result="" auto presets={presets} accent="amber" customResult={customResult}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label htmlFor="lbl-dpicalculator-pixels" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Pixels</label><input id="lbl-dpicalculator-pixels" aria-label="Pixels" type="number" value={pixels} onChange={e => setPixels(e.target.value)} className={inputCls} /></div>
        <div><label htmlFor="lbl-dpicalculator-inches" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Inches</label><input id="lbl-dpicalculator-inches" aria-label="Inches" type="number" value={inches} onChange={e => setInches(e.target.value)} step="0.1" className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}

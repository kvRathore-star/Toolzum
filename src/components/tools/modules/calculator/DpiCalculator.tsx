"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function DpiCalculator() {
  const [resW, setResW] = useState('2560');
  const [resH, setResH] = useState('1600');
  const [inches, setInches] = useState('13.3');
  const presets = [
    { label: 'MacBook 13"', apply: () => { setResW('2560'); setResH('1600'); setInches('13.3'); } },
    { label: 'Full HD 24"', apply: () => { setResW('1920'); setResH('1080'); setInches('24'); } },
    { label: 'Phone 6.1"', apply: () => { setResW('1179'); setResH('2556'); setInches('6.1'); } },
  ];
  const hasInput = resW !== '' && resH !== '' && inches !== '';
  let dpi: number | null = null;
  if (hasInput) {
    // True display density needs both axes: diagonal pixels over diagonal
    // inches. The old single-"Pixels" input divided one axis directly.
    const w = parseFloat(resW) || 0;
    const h = parseFloat(resH) || 0;
    const d = parseFloat(inches) || 0;
    dpi = d > 0 && w > 0 && h > 0 ? Math.sqrt(w * w + h * h) / d : null;
  }
  const customResult = hasInput && dpi !== null ? (
    <div className="text-center">
      <div className="text-xs text-[var(--text-tertiary)]">Dots Per Inch</div>
      <div className="text-lg font-bold text-indigo-700 dark:text-indigo-400">{dpi.toFixed(0)}</div>
    </div>
  ) : null;
  return (
    <CalculatorShell category="Calculator" title="DPI Calculator" result="" auto presets={presets} accent="amber" customResult={customResult}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label htmlFor="lbl-dpicalculator-width-pixels" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Width (pixels)</label><input id="lbl-dpicalculator-width-pixels" aria-label="Width in pixels" type="number" value={resW} onChange={e => setResW(e.target.value)} className={inputCls} /></div>
        <div><label htmlFor="lbl-dpicalculator-height-pixels" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Height (pixels)</label><input id="lbl-dpicalculator-height-pixels" aria-label="Height in pixels" type="number" value={resH} onChange={e => setResH(e.target.value)} className={inputCls} /></div>
        <div><label htmlFor="lbl-dpicalculator-diagonal-inches" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Diagonal (inches)</label><input id="lbl-dpicalculator-diagonal-inches" aria-label="Diagonal in inches" type="number" value={inches} onChange={e => setInches(e.target.value)} step="0.1" className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}

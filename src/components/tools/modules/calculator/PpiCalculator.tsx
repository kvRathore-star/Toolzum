"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function PpiCalculator() {
  const [resW, setResW] = useState('1179');
  const [resH, setResH] = useState('2556');
  const [diagInches, setDiagInches] = useState('6.1');
  const presets = [
    { label: 'iPhone 6.1"', apply: () => { setResW('1179'); setResH('2556'); setDiagInches('6.1'); } },
    { label: '27" 4K Monitor', apply: () => { setResW('3840'); setResH('2160'); setDiagInches('27'); } },
    { label: '15.6" Laptop', apply: () => { setResW('1920'); setResH('1080'); setDiagInches('15.6'); } },
  ];
  const hasInput = resW !== '' && resH !== '' && diagInches !== '';
  let ppi: number | null = null;
  if (hasInput) {
    // True PPI: diagonal pixels over diagonal inches. The old version asked
    // for a free-text "diagonal pixels" value and divided it directly.
    const w = parseFloat(resW) || 0;
    const h = parseFloat(resH) || 0;
    const d = parseFloat(diagInches) || 0;
    ppi = d > 0 && w > 0 && h > 0 ? Math.sqrt(w * w + h * h) / d : null;
  }
  const customResult = hasInput && ppi !== null ? (
    <div className="text-center">
      <div className="text-xs text-[var(--text-tertiary)]">Pixels Per Inch</div>
      <div className="text-lg font-bold text-purple-700 dark:text-purple-400">{ppi.toFixed(0)}</div>
    </div>
  ) : null;
  return (
    <CalculatorShell category="Calculator" title="PPI Calculator" result="" auto presets={presets} accent="orange" customResult={customResult}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label htmlFor="lbl-ppicalculator-width-pixels" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Width (pixels)</label><input id="lbl-ppicalculator-width-pixels" aria-label="Width in pixels" type="number" value={resW} onChange={e => setResW(e.target.value)} className={inputCls} /></div>
        <div><label htmlFor="lbl-ppicalculator-height-pixels" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Height (pixels)</label><input id="lbl-ppicalculator-height-pixels" aria-label="Height in pixels" type="number" value={resH} onChange={e => setResH(e.target.value)} className={inputCls} /></div>
        <div><label htmlFor="lbl-ppicalculator-diagonal-inches" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Diagonal (inches)</label><input id="lbl-ppicalculator-diagonal-inches" aria-label="Diagonal in inches" type="number" value={diagInches} onChange={e => setDiagInches(e.target.value)} step="0.1" className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}

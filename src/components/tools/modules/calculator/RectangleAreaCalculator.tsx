"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function RectangleAreaCalculator() {
  const [length, setLength] = useState('10');
  const [width, setWidth] = useState('5');
  const presets = [
    { label: '10 x 5', apply: () => { setLength('10'); setWidth('5'); } },
    { label: 'A4 (29.7x21)', apply: () => { setLength('29.7'); setWidth('21'); } },
    { label: '3 x 4', apply: () => { setLength('3'); setWidth('4'); } },
  ];
  const l = parseFloat(length) || 0;
  const w = parseFloat(width) || 0;
  const hasInput = length !== '' && width !== '' && !isNaN(l) && !isNaN(w) && l > 0 && w > 0;
  const customResult = (
    !hasInput ? (
      <div className="text-sm text-[var(--text-muted)]">Enter dimensions</div>
    ) : (
    <div className="grid grid-cols-3 gap-2">
      <div className="text-center">
        <div className="text-xs text-[var(--text-tertiary)]">Area</div>
        <div className="text-lg font-bold text-[var(--accent)]">{hasInput ? l * w : 0}</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-[var(--text-tertiary)]">Perimeter</div>
        <div className="text-lg font-bold text-[var(--accent)]">{hasInput ? 2 * (l + w) : 0}</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-[var(--text-tertiary)]">Diagonal</div>
        <div className="text-lg font-bold text-[var(--text-primary)]">{hasInput ? Math.sqrt(l * l + w * w).toFixed(1) : '0'}</div>
      </div>
    </div>
    )
  );
  return (
    <CalculatorShell category="Calculator" title="Rectangle Calculator" result="" auto presets={presets} accent="lime" customResult={customResult}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label htmlFor="lbl-rectangleareacalculator-length" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Length</label><input id="lbl-rectangleareacalculator-length" aria-label="Length" type="number" value={length} onChange={e => setLength(e.target.value)} className={inputCls} /></div>
        <div><label htmlFor="lbl-rectangleareacalculator-width" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Width</label><input id="lbl-rectangleareacalculator-width" aria-label="Width" type="number" value={width} onChange={e => setWidth(e.target.value)} className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}

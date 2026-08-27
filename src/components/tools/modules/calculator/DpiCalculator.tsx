"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function DpiCalculator() {
  const [pixels, setPixels] = useState('1920');
  const [inches, setInches] = useState('13.3');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const p = parseFloat(pixels) || 0;
    const i = parseFloat(inches) || 0;
    if (!i) return;
    const dpi = p / i;
    const dotPitch = 25.4 / dpi;
    setResult(`DPI: ${dpi.toFixed(2)}\nDot Pitch: ${dotPitch.toFixed(4)} mm\nTotal Dots: ${p}`);
  }, [pixels, inches]);
  const presets = [
    { label: 'MacBook 13\"', apply: () => { setPixels('2560'); setInches('13.3'); } },
    { label: 'Full HD 24\"', apply: () => { setPixels('1920'); setInches('24'); } },
    { label: 'Phone 6.1\"', apply: () => { setPixels('2532'); setInches('6.1'); } },
  ];
  const p = parseFloat(pixels) || 0;
  const i = parseFloat(inches) || 1;
  const dpi = p / i;
  return (
    <CalculatorShell title="DPI Calculator" result={result} onCalculate={calc} presets={presets} accent="amber">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Pixels</label><input type="number" value={pixels} onChange={e => setPixels(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Inches</label><input type="number" value={inches} onChange={e => setInches(e.target.value)} step="0.1" className={inputCls} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-tertiary)]">Dots Per Inch</div>
          <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">{dpi.toFixed(0)}</div>
        </div>
      )}
    </CalculatorShell>
  );
}

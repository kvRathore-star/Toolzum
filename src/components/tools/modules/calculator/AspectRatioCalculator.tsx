"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { gcd, inputCls } from '../Calculators.shared';

export default function AspectRatioCalculator() {
  const [width, setWidth] = useState('1920');
  const [height, setHeight] = useState('1080');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const w = parseInt(width) || 0;
    const h = parseInt(height) || 0;
    if (!w || !h) return;
    const g = gcd(w, h);
    const ratio = (w / g) / (h / g);
    setResult(`Aspect Ratio: ${w / g}:${h / g}\nRatio: ${ratio.toFixed(3)}:1\n(${w} \u00d7 ${h})`);
  }, [width, height]);
  const presets = [
    { label: 'HD 16:9', apply: () => { setWidth('1920'); setHeight('1080'); } },
    { label: '4:3', apply: () => { setWidth('1024'); setHeight('768'); } },
    { label: 'Ultrawide 21:9', apply: () => { setWidth('2560'); setHeight('1080'); } },
  ];
  const w = parseInt(width) || 0;
  const h = parseInt(height) || 1;
  const g = gcd(w, h);
  const commonRatios = ['16:9', '4:3', '21:9', '3:2', '1:1', '5:4'];
  const match = commonRatios.find(r => { const [rw, rh] = r.split(':').map(Number); return w / h === rw / rh; });
  return (
    <CalculatorShell title="Aspect Ratio Calculator" result={result} onCalculate={calc} presets={presets} accent="emerald">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Width (px)</label><input type="number" value={width} onChange={e => setWidth(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Height (px)</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)]">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{w / g}:{h / g}</div>
            {match && <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">Common: {match}</div>}
          </div>
          <div className="mt-3 bg-[var(--bg-elevated)] rounded-lg h-24 flex items-center justify-center" style={{ aspectRatio: `${w / g}/${h / g}` }}>
            <div className="text-xs text-[var(--text-tertiary)]">{w} \u00d7 {h}</div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

"use client";
import { useState, useCallback } from 'react';
import { Type } from 'lucide-react';
import { CalculatorShell } from '../shared/CalculatorShell';

const labelCls = "text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider";
const inputCls = "w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2";

interface ScaleEntry {
  size: string;
  value: number;
  level: number;
}

export default function FluidTypographyCalculator() {
  const [base, setBase] = useState('16');
  const [minVw, setMinVw] = useState('320');
  const [maxVw, setMaxVw] = useState('1440');
  const [scale, setScale] = useState('1.25');
  const [minSize, setMinSize] = useState('');
  const [maxSize, setMaxSize] = useState('');
  const [result, setResult] = useState<ScaleEntry[]>([]);

  const calc = useCallback(() => {
    const b = parseFloat(base) || 16;
    const mn = parseFloat(minVw) || 320;
    const mx = parseFloat(maxVw) || 1440;
    const s = parseFloat(scale) || 1.25;
    const minClamp = parseFloat(minSize) || b * 0.75;
    const maxClamp = parseFloat(maxSize) || b * 1.5;
    const levels = [-2, -1, 0, 1, 2, 3, 4, 5];
    const sizes = levels.map(l => {
      const val = b * Math.pow(s, l);
      const desktop = Math.round(val * 10) / 10;
      return { size: l <= 0 ? `h${Math.abs(l) + 6}` : `h${6 - l}`, value: desktop, level: l };
    });
    setResult(sizes);
  }, [base, minVw, maxVw, scale, minSize, maxSize]);

  const b2 = parseFloat(base) || 16;
  const mn2 = parseFloat(minVw) || 320;
  const mx2 = parseFloat(maxVw) || 1440;
  const minSz = parseFloat(minSize) || b2 * 0.75;
  const maxSz = parseFloat(maxSize) || b2 * 1.2;
  const slope2 = ((maxSz - minSz) / (mx2 - mn2) * 100).toFixed(4);
  const intercept2 = (minSz - mn2 * (maxSz - minSz) / (mx2 - mn2)).toFixed(2);
  const cssClamp = `font-size: clamp(${minSz.toFixed(1)}px, ${slope2}vw + ${intercept2}px, ${maxSz.toFixed(1)}px);`;

  const customResult = result.length > 0 ? (
    <div className="space-y-3">
      <div className="grid gap-2">
        {[...result].reverse().map((r, i) => {
          const baseRatio = r.value / (parseFloat(base) || 16);
          const bg = baseRatio >= 2 ? 'bg-violet-500/10 border border-violet-500/20' : baseRatio >= 1.5 ? 'bg-blue-500/10' : baseRatio <= 0.7 ? 'bg-rose-500/10' : 'bg-[var(--bg-overlay)]';
          return (
            <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${bg}`}>
              <div>
                <span className="text-sm font-mono font-bold text-[var(--text-primary)]">{r.size}</span>
                <span className="text-xs text-[var(--text-tertiary)] ml-2">{baseRatio >= 2 ? 'Display' : baseRatio <= 0.7 ? 'Caption' : 'Body'}</span>
              </div>
              <span className="text-base font-bold text-[var(--text-primary)] font-mono">{r.value}px</span>
            </div>
          );
        })}
      </div>
      <div className="p-3 bg-violet-500/5 border border-violet-500/10 rounded-xl">
        <div className="text-xs text-[var(--text-tertiary)] mb-1">CSS clamp() formula (base):</div>
        <code className="text-xs font-mono text-violet-700 dark:text-violet-400 break-all">{cssClamp}</code>
      </div>
    </div>
  ) : null;

  return (
    <CalculatorShell
      title="Fluid Typography"
      icon={<Type className="w-5 h-5" />}
      result=""
      onCalculate={calc}
      calculateLabel="Generate Type Scale"
      resultLabel="Type Scale"
      accent="violet"
      customResult={customResult}
      presets={[
        { label: 'Minor Third (1.2)', apply: () => setScale('1.2') },
        { label: 'Major Third (1.25)', apply: () => setScale('1.25') },
        { label: 'Perfect Fourth (1.333)', apply: () => setScale('1.333') },
        { label: 'Golden Ratio (1.618)', apply: () => setScale('1.618') },
      ]}
      resultStats={result.length > 0 ? [
        { label: 'Scale Levels', value: String(result.length) },
        { label: 'Scale Ratio', value: scale },
        { label: 'Base Size', value: `${b2}px` },
      ] : []}
    >
      <div className="space-y-3">
        <div>
          <label className={labelCls}>Base Font Size (px)</label>
          <input className={inputCls} value={base} onChange={e => setBase(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Scale Ratio</label>
          <input className={inputCls} value={scale} onChange={e => setScale(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Min Viewport (px)</label>
          <input className={inputCls} value={minVw} onChange={e => setMinVw(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Max Viewport (px)</label>
          <input className={inputCls} value={maxVw} onChange={e => setMaxVw(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Min Clamp (px, optional)</label>
          <input className={inputCls} value={minSize} onChange={e => setMinSize(e.target.value)} placeholder="Auto" />
        </div>
        <div>
          <label className={labelCls}>Max Clamp (px, optional)</label>
          <input className={inputCls} value={maxSize} onChange={e => setMaxSize(e.target.value)} placeholder="Auto" />
        </div>
      </div>
    </CalculatorShell>
  );
}

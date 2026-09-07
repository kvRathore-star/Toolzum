"use client";
import { useState, useCallback } from 'react';
import { Section } from '../MiscToolsShared';
import { inputCls, labelCls } from '../Calculators.shared';

export default function FluidTypographyCalculator() {
  const [base, setBase] = useState('16');
  const [minVw, setMinVw] = useState('320');
  const [maxVw, setMaxVw] = useState('1440');
  const [scale, setScale] = useState('1.25');
  const [minSize, setMinSize] = useState('');
  const [maxSize, setMaxSize] = useState('');
  const [result, setResult] = useState<Array<{size: string; value: number}>>([]);
  const [fontSizes, setFontSizes] = useState<Array<{level: number; cls: string}>>([]);
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
      const clampMin = Math.max(minClamp, val * 0.7);
      const clampMax = Math.max(maxClamp, val * 1.2);
      const slope = (clampMax - clampMin) / (mx - mn);
      const intercept = clampMin - slope * mn;
      const desktop = Math.round(val * 10) / 10;
      const cls = `${Math.round(l === 0 ? b * 100 : val * 100) / 100}`;
      return { size: l <= 0 ? `h${Math.abs(l) + 6}` : `h${6 - l}`, value: desktop, level: l };
    });
    setResult(sizes);
    setFontSizes([]);
  }, [base, minVw, maxVw, scale, minSize, maxSize]);
  const b2 = parseFloat(base) || 16;
  const mn2 = parseFloat(minVw) || 320;
  const mx2 = parseFloat(maxVw) || 1440;
  const minSz = parseFloat(minSize) || b2 * 0.75;
  const maxSz = parseFloat(maxSize) || b2 * 1.2;
  const slope2 = ((maxSz - minSz) / (mx2 - mn2) * 100).toFixed(4);
  const intercept2 = (minSz - mn2 * (maxSz - minSz) / (mx2 - mn2)).toFixed(2);
  const cssClamp = `font-size: clamp(${minSz.toFixed(1)}px, ${slope2}vw + ${intercept2}px, ${maxSz.toFixed(1)}px);`;
  return (
    <Section title="Fluid Typography">
      <div className="max-w-xl">
        <button onClick={calc} className="mb-4 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition-colors">Generate Type Scale</button>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Base Font Size (px)</label><input aria-label="Base Font Size (px)" className={inputCls} value={base} onChange={e => setBase(e.target.value)} /></div>
          <div><label className={labelCls}>Scale Ratio</label><input aria-label="Scale Ratio" className={inputCls} value={scale} onChange={e => setScale(e.target.value)} /></div>
          <div><label className={labelCls}>Min Viewport (px)</label><input aria-label="Min Viewport (px)" className={inputCls} value={minVw} onChange={e => setMinVw(e.target.value)} /></div>
          <div><label className={labelCls}>Max Viewport (px)</label><input aria-label="Max Viewport (px)" className={inputCls} value={maxVw} onChange={e => setMaxVw(e.target.value)} /></div>
          <div><label className={labelCls}>Min Clamp (px, optional)</label><input aria-label="Min Clamp (px, optional)" className={inputCls} value={minSize} onChange={e => setMinSize(e.target.value)} placeholder="Auto" /></div>
          <div><label className={labelCls}>Max Clamp (px, optional)</label><input aria-label="Max Clamp (px, optional)" className={inputCls} value={maxSize} onChange={e => setMaxSize(e.target.value)} placeholder="Auto" /></div>
        </div>
        {result.length > 0 && (
          <div className="mt-6">
            <div className="text-sm font-bold text-[var(--text-primary)] mb-3">Type Scale</div>
            <div className="grid gap-3">
              {result.reverse().map((r, i) => {
                const baseRatio = r.value / (parseFloat(base) || 16);
                const bg = baseRatio >= 2 ? 'bg-purple-500/10 border border-purple-500/20' : baseRatio >= 1.5 ? 'bg-blue-500/10' : baseRatio <= 0.7 ? 'bg-rose-500/10' : 'bg-[var(--bg-overlay)]';
                return (
                  <div key={i} className={`flex items-center justify-between p-4 rounded-xl ${bg}`}>
                    <div>
                      <span className="text-sm font-mono font-bold text-[var(--text-primary)]">{r.size}</span>
                      <span className="text-xs text-[var(--text-tertiary)] ml-2">{baseRatio >= 2 ? 'Display' : baseRatio <= 0.7 ? 'Caption' : 'Body'}</span>
                    </div>
                    <span className="text-lg font-bold text-[var(--text-primary)] font-mono">{r.value}px</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
              <div className="text-xs text-[var(--text-tertiary)] mb-2">CSS clamp() formula (base):</div>
              <code className="text-xs font-mono text-purple-700 dark:text-purple-400 break-all">{cssClamp}</code>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}

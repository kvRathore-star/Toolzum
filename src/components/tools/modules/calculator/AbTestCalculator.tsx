"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function AbTestCalculator() {
  const [controlVisitors, setControlVisitors] = useState('1000');
  const [controlConversions, setControlConversions] = useState('100');
  const [variantVisitors, setVariantVisitors] = useState('1000');
  const [variantConversions, setVariantConversions] = useState('120');
  const presets = [
    { label: 'Winner', apply: () => { setControlVisitors('1000'); setControlConversions('100'); setVariantVisitors('1000'); setVariantConversions('130'); } },
    { label: 'Flat', apply: () => { setControlVisitors('1000'); setControlConversions('100'); setVariantVisitors('1000'); setVariantConversions('102'); } },
    { label: 'Loser', apply: () => { setControlVisitors('1000'); setControlConversions('100'); setVariantVisitors('1000'); setVariantConversions('80'); } },
  ];
  const cv = parseFloat(controlVisitors);
  const cc = parseFloat(controlConversions);
  const vv = parseFloat(variantVisitors);
  const vc = parseFloat(variantConversions);
  const nums = [cv, cc, vv, vc];
  const hasInput = [controlVisitors, controlConversions, variantVisitors, variantConversions].every(v => v.trim() !== '') && nums.every(v => Number.isFinite(v));
  // Two-proportion z-test (unpooled SE for CI, pooled for the test), normal
  // approximation with an erf-based p-value. The old version showed only raw
  // lift % — the statistical call is the core of an A/B calculator.
  const erf = (x: number): number => {
    const t = 1 / (1 + 0.3275911 * Math.abs(x));
    const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
    const sign = x >= 0 ? 1 : -1;
    return sign * (1 - poly * Math.exp(-x * x));
  };
  const normCdf = (x: number): number => 0.5 * (1 + erf(x / Math.SQRT2));
  let stats: { p1: number; p2: number; lift: number; z: number; p: number; ciLo: number; ciHi: number; verdict: string; significant: boolean } | null = null;
  let inputError = '';
  if (hasInput) {
    if (cv <= 0 || vv <= 0) inputError = 'Visitor counts must be above zero.';
    else if (cc < 0 || vc < 0 || cc > cv || vc > vv) inputError = 'Conversions must be between 0 and visitors.';
    else {
      const p1 = cc / cv;
      const p2 = vc / vv;
      const pooled = (cc + vc) / (cv + vv);
      const sePool = Math.sqrt(pooled * (1 - pooled) * (1 / cv + 1 / vv));
      const z = sePool > 0 ? (p2 - p1) / sePool : 0;
      const p = 2 * (1 - normCdf(Math.abs(z)));
      const seDiff = Math.sqrt((p1 * (1 - p1)) / cv + (p2 * (1 - p2)) / vv);
      const lift = p1 > 0 ? ((p2 - p1) / p1) * 100 : 0;
      const significant = p < 0.05;
      const verdict = !significant
        ? 'Not significant — keep running or stop; no winner yet.'
        : p2 > p1 ? 'Significant — variant wins at 95% confidence.' : 'Significant — variant LOSES at 95% confidence. Keep control.';
      stats = { p1, p2, lift, z, p, ciLo: (p2 - p1) - 1.96 * seDiff, ciHi: (p2 - p1) + 1.96 * seDiff, verdict, significant };
    }
  }
  const cr1 = stats ? stats.p1 : 0;
  const cr2 = stats ? stats.p2 : 0;
  const pct = stats ? stats.lift : 0;
  const customResult = (
    !hasInput ? (
      <div className="text-sm text-[var(--text-muted)]">Enter values to calculate</div>
    ) : inputError ? (
      <div className="text-sm text-red-600 dark:text-red-400" role="alert">{inputError}</div>
    ) : stats ? (
    <div className="space-y-2">
      <div className="flex gap-3">
        <div className="flex-1 text-center">
          <div className="text-xs text-[var(--text-tertiary)]">Control</div>
          <div className="text-lg font-bold text-[var(--text-primary)]">{(cr1 * 100).toFixed(1)}%</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-xs text-[var(--text-tertiary)]">Variant</div>
          <div className={`text-lg font-bold ${pct >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>{(cr2 * 100).toFixed(1)}%</div>
        </div>
      </div>
      <div className="text-center">
        <span className={`text-sm font-bold ${pct >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
          {pct >= 0 ? '+' : ''}{pct.toFixed(1)}% {pct >= 0 ? 'improvement' : 'decline'}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center pt-1">
        <div>
          <div className="text-[10px] text-[var(--text-tertiary)]">z-score</div>
          <div className="text-sm font-bold text-[var(--text-primary)]">{stats.z.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-[10px] text-[var(--text-tertiary)]">p-value</div>
          <div className="text-sm font-bold text-[var(--text-primary)]">{stats.p < 0.001 ? '< 0.001' : stats.p.toFixed(3)}</div>
        </div>
        <div>
          <div className="text-[10px] text-[var(--text-tertiary)]">95% CI (diff)</div>
          <div className="text-sm font-bold text-[var(--text-primary)]">{(stats.ciLo * 100).toFixed(1)}…{(stats.ciHi * 100).toFixed(1)}pp</div>
        </div>
      </div>
      <div role="status" className={`text-center text-sm font-bold rounded-xl px-3 py-2 ${stats.significant ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-amber-500/10 text-[var(--accent)]'}`}>
        {stats.verdict}
      </div>
    </div>
    ) : null
  );
  return (
    <CalculatorShell category="Calculator" title="A/B Test Calculator" result="" auto presets={presets} accent="violet" customResult={customResult}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label htmlFor="lbl-abtestcalculator-control-visitors" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Control Visitors</label><input id="lbl-abtestcalculator-control-visitors" aria-label="Control Visitors" type="number" value={controlVisitors} onChange={e => setControlVisitors(e.target.value)} className={inputCls} /></div>
        <div><label htmlFor="lbl-abtestcalculator-control-conversions" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Control Conversions</label><input id="lbl-abtestcalculator-control-conversions" aria-label="Control Conversions" type="number" value={controlConversions} onChange={e => setControlConversions(e.target.value)} className={inputCls} /></div>
        <div><label htmlFor="lbl-abtestcalculator-variant-visitors" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Variant Visitors</label><input id="lbl-abtestcalculator-variant-visitors" aria-label="Variant Visitors" type="number" value={variantVisitors} onChange={e => setVariantVisitors(e.target.value)} className={inputCls} /></div>
        <div><label htmlFor="lbl-abtestcalculator-variant-conversions" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Variant Conversions</label><input id="lbl-abtestcalculator-variant-conversions" aria-label="Variant Conversions" type="number" value={variantConversions} onChange={e => setVariantConversions(e.target.value)} className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}

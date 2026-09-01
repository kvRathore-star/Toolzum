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
  const cv = parseFloat(controlVisitors) || 1;
  const cc = parseFloat(controlConversions) || 0;
  const vv = parseFloat(variantVisitors) || 1;
  const vc = parseFloat(variantConversions) || 0;
  const hasInput = controlVisitors !== '' && controlConversions !== '' && variantVisitors !== '' && variantConversions !== '' && cv > 0 && vv > 0;
  const cr1 = hasInput ? cc / cv : 0;
  const cr2 = hasInput ? vc / vv : 0;
  const pct = hasInput ? (cr1 > 0 ? (cr2 - cr1) / cr1 * 100 : 0) : 0;
  const customResult = (
    !hasInput ? (
      <div className="text-sm text-[var(--text-muted)]">Enter values to calculate</div>
    ) : (
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
    </div>
    )
  );
  return (
    <CalculatorShell category="Calculator" title="A/B Test Calculator" result="" auto presets={presets} accent="violet" customResult={customResult}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Control Visitors</label><input type="number" value={controlVisitors} onChange={e => setControlVisitors(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Control Conversions</label><input type="number" value={controlConversions} onChange={e => setControlConversions(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Variant Visitors</label><input type="number" value={variantVisitors} onChange={e => setVariantVisitors(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Variant Conversions</label><input type="number" value={variantConversions} onChange={e => setVariantConversions(e.target.value)} className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}

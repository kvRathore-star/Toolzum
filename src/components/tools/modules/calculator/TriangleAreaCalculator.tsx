"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function TriangleAreaCalculator() {
  const [method, setMethod] = useState<'baseheight'|'sides'|'sas'>('baseheight');
  const [base, setBase] = useState('10');
  const [height, setHeight] = useState('8');
  const [sideA, setSideA] = useState('5');
  const [sideB, setSideB] = useState('6');
  const [sideC, setSideC] = useState('7');
  const [angle, setAngle] = useState('60');

  let result = '';
  if (method === 'baseheight') {
    const b = parseFloat(base) || 0;
    const h = parseFloat(height) || 0;
    if (b && h) {
      const area = 0.5 * b * h;
      result = `Area = \u00bd \u00d7 ${b} \u00d7 ${h} = ${area.toFixed(2)} sq units\n\nFormula: A = \u00bdbh`;
    }
  } else if (method === 'sides') {
    const a = parseFloat(sideA) || 0;
    const b = parseFloat(sideB) || 0;
    const c = parseFloat(sideC) || 0;
    if (a && b && c) {
      const s = (a + b + c) / 2;
      const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
      if (isNaN(area)) {
        result = 'These side lengths do not form a valid triangle.';
      } else {
        result = `Area (Heron's formula) = ${area.toFixed(2)} sq units\nSemi-perimeter = ${s.toFixed(2)}\n\nFormula: A = \u221a(s(s-a)(s-b)(s-c))`;
      }
    }
  } else {
    const a = parseFloat(sideA) || 0;
    const b = parseFloat(sideB) || 0;
    const ang = parseFloat(angle) || 0;
    if (a && b && ang) {
      const rad = ang * Math.PI / 180;
      const area = 0.5 * a * b * Math.sin(rad);
      result = `Area = \u00bd \u00d7 ${a} \u00d7 ${b} \u00d7 sin(${ang}\u00b0) = ${area.toFixed(2)} sq units`;
    }
  }
  const customResult = (
    <div className="font-mono text-sm whitespace-pre-wrap">
      {result}
    </div>
  );

  const presets = [
    { label: 'Base/Height', apply: () => { setBase('10'); setHeight('8'); setMethod('baseheight'); } },
    { label: '3-4-5', apply: () => { setSideA('5'); setSideB('6'); setSideC('7'); setMethod('sides'); } },
  ];

  return (
    <CalculatorShell category="Calculator" title="Triangle Area Calculator" accent="emerald" result="" auto customResult={customResult} presets={presets}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Method</label><select aria-label="Method" className={inputCls} value={method} onChange={e => setMethod(e.target.value as 'baseheight'|'sides'|'sas')}><option value="baseheight">Base & Height</option><option value="sides">Three sides (SSS)</option><option value="sas">Two sides & angle (SAS)</option></select></div>
        <div className="opacity-0 pointer-events-none"><label className={labelCls}>_</label><input aria-label="_" className={inputCls} /></div>
        {method === 'baseheight' && (<><div><label className={labelCls}>Base</label><input aria-label="Base" className={inputCls} type="number" value={base} onChange={e => setBase(e.target.value)} /></div><div><label className={labelCls}>Height</label><input aria-label="Height" className={inputCls} type="number" value={height} onChange={e => setHeight(e.target.value)} /></div></>)}
        {method === 'sides' && (<><div><label className={labelCls}>Side A</label><input aria-label="Side A" className={inputCls} type="number" value={sideA} onChange={e => setSideA(e.target.value)} /></div><div><label className={labelCls}>Side B</label><input aria-label="Side B" className={inputCls} type="number" value={sideB} onChange={e => setSideB(e.target.value)} /></div><div><label className={labelCls}>Side C</label><input aria-label="Side C" className={inputCls} type="number" value={sideC} onChange={e => setSideC(e.target.value)} /></div></>)}
        {method === 'sas' && (<><div><label className={labelCls}>Side A</label><input aria-label="Side A" className={inputCls} type="number" value={sideA} onChange={e => setSideA(e.target.value)} /></div><div><label className={labelCls}>Side B</label><input aria-label="Side B" className={inputCls} type="number" value={sideB} onChange={e => setSideB(e.target.value)} /></div><div><label className={labelCls}>Angle (\u00b0)</label><input aria-label="Angle (\u00b0)" className={inputCls} type="number" value={angle} onChange={e => setAngle(e.target.value)} /></div></>)}
      </div>
    </CalculatorShell>
  );
}

"use client";
import { useState } from 'react';
import { CalcActions } from '../shared/CalcActions';
import { ac, borderClass } from '../miscToolColors';
import { Input, labelClass, selClass } from '../MiscToolsShared';

export default function SlopeCalculator() {
  const clr = ac('SlopeCalculator');
  const [x1, setX1] = useState('1'); const [y1, setY1] = useState('2');
  const [x2, setX2] = useState('3'); const [y2, setY2] = useState('6');
  const a = Number(x1), b = Number(y1), c = Number(x2), d = Number(y2);
  const dx = c - a, dy = d - b;
  const slope = dx !== 0 ? dy / dx : Infinity;
  const resultText = `Slope = ${isFinite(slope) ? slope.toFixed(4) : 'undefined'}\nEquation: y = ${isFinite(slope) ? slope.toFixed(2) + 'x ' + (b - slope * a >= 0 ? '+' : '') + (b - slope * a).toFixed(2) : 'x = ' + a}`;
  const presets = [
    { label: '(0,0) to (3,4)', apply: () => { setX1('0'); setY1('0'); setX2('3'); setY2('4'); } },
    { label: '(1,2) to (5,8)', apply: () => { setX1('1'); setY1('2'); setX2('5'); setY2('8'); } },
  ];
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((p) => (
          <button key={p.label} onClick={p.apply} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Slope Calculator</h2>
        <div className="flex gap-2">
          <div><label className={labelClass}>x1</label><Input label="Value" type="number" value={x1} onChange={setX1} /></div>
          <div><label className={labelClass}>y1</label><Input label="Value" type="number" value={y1} onChange={setY1} /></div>
          <div><label className={labelClass}>x2</label><Input label="Value" type="number" value={x2} onChange={setX2} /></div>
          <div><label className={labelClass}>y2</label><Input label="Value" type="number" value={y2} onChange={setY2} /></div>
        </div>
        <div className="text-sm font-mono">
          <div>Slope = {isFinite(slope) ? slope.toFixed(4) : 'undefined'}</div>
          <div>Equation: y = {isFinite(slope) ? slope.toFixed(2) + 'x ' + (b - slope * a >= 0 ? '+' : '') + (b - slope * a).toFixed(2) : 'x = ' + a}</div>
        </div>
        <CalcActions result={resultText} downloadData={`x1,y1,x2,y2,Slope,Equation\n${a},${b},${c},${d},${isFinite(slope) ? slope.toFixed(4) : 'undefined'},"${isFinite(slope) ? 'y = ' + slope.toFixed(2) + 'x ' + (b - slope * a >= 0 ? '+' : '') + (b - slope * a).toFixed(2) : 'x = ' + a}"`} downloadFilename="slope.csv" />
      </div>
    </>
  );
}

"use client";
import { useState } from 'react';
import { CalcActions } from '../shared/CalcActions';
import { ac, borderClass } from '../miscToolColors';
import { Section, Input, labelClass, selClass } from '../MiscToolsShared';

export default function CoordinateCalculator() {
  const clr = ac('CoordinateCalculator');
  const [x1, setX1] = useState('0'); const [y1, setY1] = useState('0');
  const [x2, setX2] = useState('3'); const [y2, setY2] = useState('4');
  // Guard: cleared fields parse to NaN, not 0 — the old Number('') → 0
  // produced phantom distances for half-filled inputs.
  const nums = [x1, y1, x2, y2].map(v => v.trim() === '' ? NaN : Number(v));
  const valid = nums.every(v => Number.isFinite(v));
  const [a, b, c, d] = (valid ? nums : [0, 0, 0, 0]) as [number, number, number, number];
  const dist = Math.sqrt((c - a) ** 2 + (d - b) ** 2);
  const mx = (a + c) / 2, my = (b + d) / 2;
  const resultText = valid ? `Distance: ${dist.toFixed(4)}\nMidpoint: (${mx.toFixed(2)}, ${my.toFixed(2)})` : 'Enter all four coordinates';
  const downloadData = valid ? `x1,y1,x2,y2,Distance,Midpoint X,Midpoint Y\n${a},${b},${c},${d},${dist.toFixed(4)},${mx.toFixed(2)},${my.toFixed(2)}` : '';
  return (
    <Section title="Coordinate Calculator">
      <div className="flex gap-2">
        <div><label className={labelClass}>x1</label><Input label="x1" type="number" value={x1} onChange={setX1} /></div>
        <div><label className={labelClass}>y1</label><Input label="y1" type="number" value={y1} onChange={setY1} /></div>
        <div><label className={labelClass}>x2</label><Input label="x2" type="number" value={x2} onChange={setX2} /></div>
        <div><label className={labelClass}>y2</label><Input label="y2" type="number" value={y2} onChange={setY2} /></div>
      </div>
      <div className="text-xs space-y-1">
        <div>Distance: {valid ? dist.toFixed(4) : '—'}</div>
        <div>Midpoint: {valid ? `(${mx.toFixed(2)}, ${my.toFixed(2)})` : 'enter all four coordinates'}</div>
      </div>
      <CalcActions result={resultText} downloadData={downloadData} downloadFilename="coordinates.csv" />
    </Section>
  );
}

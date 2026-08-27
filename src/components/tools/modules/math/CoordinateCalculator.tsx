"use client";
import { useState } from 'react';
import { ac, borderClass } from '../miscToolColors';
import { Section, Input, labelClass, selClass } from '../MiscToolsShared';

export default function CoordinateCalculator() {
  const clr = ac('CoordinateCalculator');
  const [x1, setX1] = useState('0'); const [y1, setY1] = useState('0');
  const [x2, setX2] = useState('3'); const [y2, setY2] = useState('4');
  const a = Number(x1), b = Number(y1), c = Number(x2), d = Number(y2);
  const dist = Math.sqrt((c - a) ** 2 + (d - b) ** 2);
  const mx = (a + c) / 2, my = (b + d) / 2;
  return (
    <Section title="Coordinate Calculator">
      <div className="flex gap-2">
        <div><label className={labelClass}>x1</label><Input label="Value" type="number" value={x1} onChange={setX1} /></div>
        <div><label className={labelClass}>y1</label><Input label="Value" type="number" value={y1} onChange={setY1} /></div>
        <div><label className={labelClass}>x2</label><Input label="Value" type="number" value={x2} onChange={setX2} /></div>
        <div><label className={labelClass}>y2</label><Input label="Value" type="number" value={y2} onChange={setY2} /></div>
      </div>
      <div className="text-xs space-y-1">
        <div>Distance: {dist.toFixed(4)}</div>
        <div>Midpoint: ({mx.toFixed(2)}, {my.toFixed(2)})</div>
      </div>
    </Section>
  );
}

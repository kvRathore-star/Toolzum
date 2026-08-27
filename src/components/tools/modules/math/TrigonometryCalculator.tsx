"use client";
import { useState } from 'react';
import { ac, borderClass } from '../miscToolColors';
import { Section, Input, labelClass, selClass } from '../MiscToolsShared';

export default function TrigonometryCalculator() {
  const clr = ac('TrigonometryCalculator');
  const [angle, setAngle] = useState('45');
  const [unit, setUnit] = useState('deg');
  const a = Number(angle);
  const rad = unit === 'deg' ? a * Math.PI / 180 : a;
  return (
    <Section title="Trigonometry Calculator">
      <div className="flex gap-2 items-center">
        <Input label="Value" type="number" value={angle} onChange={setAngle} />
        <select className={selClass} value={unit} onChange={e => setUnit(e.target.value)}>
          <option value="deg">Degrees</option><option value="rad">Radians</option>
        </select>
      </div>
      <div className="text-xs space-y-1 font-mono">
        <div>sin({a}) = {Math.sin(rad).toFixed(6)}</div>
        <div>cos({a}) = {Math.cos(rad).toFixed(6)}</div>
        <div>tan({a}) = {Math.tan(rad).toFixed(6)}</div>
        <div>csc({a}) = {1 / Math.sin(rad) < 1e10 ? (1 / Math.sin(rad)).toFixed(6) : 'inf'}</div>
        <div>sec({a}) = {1 / Math.cos(rad) < 1e10 ? (1 / Math.cos(rad)).toFixed(6) : 'inf'}</div>
        <div>cot({a}) = {1 / Math.tan(rad) < 1e10 ? (1 / Math.tan(rad)).toFixed(6) : 'inf'}</div>
      </div>
    </Section>
  );
}

"use client";
import { useState } from 'react';
import { CalcActions } from '../shared/CalcActions';
import { ac, borderClass } from '../miscToolColors';
import { Section, Input, labelClass, selClass } from '../MiscToolsShared';

export default function TrigonometryCalculator() {
  const clr = ac('TrigonometryCalculator');
  const [angle, setAngle] = useState('45');
  const [unit, setUnit] = useState('deg');
  const a = Number(angle);
  const rad = unit === 'deg' ? a * Math.PI / 180 : a;
  const sinVal = Math.sin(rad).toFixed(6);
  const cosVal = Math.cos(rad).toFixed(6);
  const tanVal = Math.tan(rad).toFixed(6);
  const cscVal = 1 / Math.sin(rad) < 1e10 ? (1 / Math.sin(rad)).toFixed(6) : 'inf';
  const secVal = 1 / Math.cos(rad) < 1e10 ? (1 / Math.cos(rad)).toFixed(6) : 'inf';
  const cotVal = 1 / Math.tan(rad) < 1e10 ? (1 / Math.tan(rad)).toFixed(6) : 'inf';
  const resultText = `sin(${a}) = ${sinVal}\ncos(${a}) = ${cosVal}\ntan(${a}) = ${tanVal}\ncsc(${a}) = ${cscVal}\nsec(${a}) = ${secVal}\ncot(${a}) = ${cotVal}`;
  const downloadData = `Angle,Unit,sin,cos,tan,csc,sec,cot\n${a},${unit},${sinVal},${cosVal},${tanVal},${cscVal},${secVal},${cotVal}`;
  return (
    <Section title="Trigonometry Calculator">
      <div className="flex gap-2 items-center">
        <Input label={unit === 'deg' ? 'Angle (degrees)' : 'Angle (radians)'} type="number" value={angle} onChange={setAngle} />
        <select className={selClass} value={unit} onChange={e => setUnit(e.target.value)} aria-label="Angle unit">
          <option value="deg">Degrees</option><option value="rad">Radians</option>
        </select>
      </div>
      <div className="text-xs space-y-1 font-mono">
        <div>sin({a}) = {sinVal}</div>
        <div>cos({a}) = {cosVal}</div>
        <div>tan({a}) = {tanVal}</div>
        <div>csc({a}) = {cscVal}</div>
        <div>sec({a}) = {secVal}</div>
        <div>cot({a}) = {cotVal}</div>
      </div>
      <CalcActions result={resultText} downloadData={downloadData} downloadFilename="trigonometry.csv" />
    </Section>
  );
}

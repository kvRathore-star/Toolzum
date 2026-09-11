"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function BabyGrowthPercentileCalculator() {
  const [age, setAge] = useState('12');
  const [gender, setGender] = useState<'male'|'female'>('male');
  const [height, setHeight] = useState('75');
  const [weight, setWeight] = useState('10');

  const a = parseFloat(age) || 0;
  const h = parseFloat(height) || 0;
  const w = parseFloat(weight) || 0;
  let result = '';
  if (a && h && w) {
    const avgHeight: Record<string, Record<number, number>> = { male: { 0:50,6:68,12:76,24:87,36:96,48:103,60:110 }, female: { 0:49,6:66,12:74,24:86,36:95,48:102,60:109 } };
    const avgWeight: Record<string, Record<number, number>> = { male: { 0:3.4,6:7.9,12:10.2,24:12.8,36:14.5,48:16.5,60:18.5 }, female: { 0:3.2,6:7.3,12:9.5,24:12.2,36:14.0,48:16.0,60:18.0 } };
    const ages: number[] = Object.keys(avgHeight[gender]!).map(k => parseInt(k));
    const closest = ages.reduce((x, y) => Math.abs(x - a) < Math.abs(y - a) ? x : y);
    const medH = avgHeight[gender]![closest];
    const medW = avgWeight[gender]![closest];
    const hPct = medH ? Math.round((1 - Math.abs(h - medH) / (medH * 0.15)) * 100) : 50;
    const wPct = medW ? Math.round((1 - Math.abs(w - medW) / (medW * 0.2)) * 100) : 50;
    result = `Height: ${Math.max(1, Math.min(99, hPct))}th percentile\nWeight: ${Math.max(1, Math.min(99, wPct))}th percentile`;
  }

  return (
    <CalculatorShell category="Health" title="Baby Growth Percentile" accent="rose" result={result} auto>
      <div className="grid grid-cols-2 gap-4">
        <div><label htmlFor="lbl-babygrowthpercentilecalculator-age-months" className={labelCls}>Age (months)</label><input id="lbl-babygrowthpercentilecalculator-age-months" aria-label="Age (months)" className={inputCls} type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
        <div><label htmlFor="lbl-babygrowthpercentilecalculator-gender" className={labelCls}>Gender</label><select id="lbl-babygrowthpercentilecalculator-gender" aria-label="Gender" className={inputCls} value={gender} onChange={e => setGender(e.target.value as 'male'|'female')}><option value="male">Male</option><option value="female">Female</option></select></div>
        <div><label htmlFor="lbl-babygrowthpercentilecalculator-height-length-cm" className={labelCls}>Height / Length (cm)</label><input id="lbl-babygrowthpercentilecalculator-height-length-cm" aria-label="Height / Length (cm)" className={inputCls} type="number" value={height} onChange={e => setHeight(e.target.value)} /></div>
        <div><label htmlFor="lbl-babygrowthpercentilecalculator-weight-kg" className={labelCls}>Weight (kg)</label><input id="lbl-babygrowthpercentilecalculator-weight-kg" aria-label="Weight (kg)" className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}

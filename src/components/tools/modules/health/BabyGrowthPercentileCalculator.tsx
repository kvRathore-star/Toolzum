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
    // WHO median reference (length/weight at 0,6,12,24,36,48,60 mo).
    // Reported as distance from the median with linear age interpolation —
    // NOT a clinical percentile (true percentiles need the WHO LMS
    // z-score tables). The old version printed fake "x-th percentile"
    // numbers from a linear formula.
    const medH: Record<string, Record<number, number>> = { male: { 0:50,6:68,12:76,24:87,36:96,48:103,60:110 }, female: { 0:49,6:66,12:74,24:86,36:95,48:102,60:109 } };
    const medW: Record<string, Record<number, number>> = { male: { 0:3.4,6:7.9,12:10.2,24:12.8,36:14.5,48:16.5,60:18.5 }, female: { 0:3.2,6:7.3,12:9.5,24:12.2,36:14.0,48:16.0,60:18.0 } };
    const ages: number[] = Object.keys(medH[gender]!).map(k => parseInt(k)).sort((x, y) => x - y);
    const interp = (table: Record<number, number>): number => {
      if (a <= ages[0]!) return table[ages[0]!]!;
      if (a >= ages[ages.length - 1]!) return table[ages[ages.length - 1]!]!;
      let lo = ages[0]!;
      for (const edge of ages) { if (edge <= a) lo = edge; }
      const hi = ages[ages.indexOf(lo)! + 1]!;
      const t = (a - lo) / (hi - lo);
      return table[lo]! + (table[hi]! - table[lo]!) * t;
    };
    const refH = interp(medH[gender]!);
    const refW = interp(medW[gender]!);
    const dH = ((h - refH) / refH) * 100;
    const dW = ((w - refW) / refW) * 100;
    const fmt = (d: number) => `${d >= 0 ? '+' : ''}${d.toFixed(1)}% vs median`;
    result = `Height: ${fmt(dH)} (WHO median ${refH.toFixed(1)} cm)\nWeight: ${fmt(dW)} (WHO median ${refW.toFixed(1)} kg)\nThis is a reference comparison, not a clinical percentile — track growth with your pediatrician's chart.`;
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

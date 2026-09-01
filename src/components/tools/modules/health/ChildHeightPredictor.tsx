"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function ChildHeightPredictor() {
  const [parentHeight, setParentHeight] = useState('170');
  const [motherHeight, setMotherHeight] = useState('160');
  const [gender, setGender] = useState<'male'|'female'>('male');
  const [childAge, setChildAge] = useState('8');
  const [childHeight, setChildHeight] = useState('130');

  const ph = parseFloat(parentHeight) || 0;
  const mh = parseFloat(motherHeight) || 0;
  const age = parseFloat(childAge) || 0;
  const ch = parseFloat(childHeight) || 0;
  let result = '';
  if (ph && mh) {
    const midParent = (ph + mh) / 2;
    let predicted: number;
    if (gender === 'male') predicted = midParent + 6.5;
    else predicted = midParent - 6.5;
    if (age > 2 && age < 18 && ch) {
      const adjusted = (ch / (age >= 2 ? (100 + (age - 2) * 6.2) : 100)) * predicted;
      predicted = Math.round((predicted + adjusted) / 2);
    }
    result = `Mid-parental height: ${midParent.toFixed(1)} cm\nPredicted adult height: ${Math.round(predicted)} cm (${(predicted / 2.54).toFixed(1)} in)`;
  }

  return (
    <CalculatorShell category="Health" title="Child Height Predictor" accent="cyan" result={result} auto>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Father height (cm)</label><input className={inputCls} type="number" value={parentHeight} onChange={e => setParentHeight(e.target.value)} /></div>
        <div><label className={labelCls}>Mother height (cm)</label><input className={inputCls} type="number" value={motherHeight} onChange={e => setMotherHeight(e.target.value)} /></div>
        <div><label className={labelCls}>Child gender</label><select className={inputCls} value={gender} onChange={e => setGender(e.target.value as 'male'|'female')}><option value="male">Male</option><option value="female">Female</option></select></div>
        <div><label className={labelCls}>Child age (optional)</label><input className={inputCls} type="number" value={childAge} onChange={e => setChildAge(e.target.value)} /></div>
        <div><label className={labelCls}>Child height (optional)</label><input className={inputCls} type="number" value={childHeight} onChange={e => setChildHeight(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}

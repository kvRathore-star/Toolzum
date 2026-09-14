"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function ChildHeightPredictor() {
  const [parentHeight, setParentHeight] = useState('170');
  const [motherHeight, setMotherHeight] = useState('160');
  const [gender, setGender] = useState<'male'|'female'>('male');

  const ph = parseFloat(parentHeight) || 0;
  const mh = parseFloat(motherHeight) || 0;
  let result = '';
  if (ph && mh) {
    // Tanner mid-parental (target) height — the standard clinical estimate.
    // The old code averaged in an unsourced "current height" adjustment; it
    // is removed. Most children land within about ±8 cm of target — the
    // range is shown, not a false single number.
    const midParent = (ph + mh) / 2;
    const predicted = gender === 'male' ? midParent + 6.5 : midParent - 6.5;
    const lo = Math.round(predicted - 8);
    const hi = Math.round(predicted + 8);
    result = `Mid-parental height: ${midParent.toFixed(1)} cm\nPredicted adult height: ${Math.round(predicted)} cm (${(predicted / 2.54).toFixed(1)} in)\nTypical range: ${lo}–${hi} cm — discuss with your pediatrician.`;
  }

  return (
    <CalculatorShell category="Health" title="Child Height Predictor" accent="cyan" result={result} auto>
      <div className="grid grid-cols-2 gap-4">
        <div><label htmlFor="lbl-childheightpredictor-father-height-cm" className={labelCls}>Father height (cm)</label><input id="lbl-childheightpredictor-father-height-cm" aria-label="Father height (cm)" className={inputCls} type="number" value={parentHeight} onChange={e => setParentHeight(e.target.value)} /></div>
        <div><label htmlFor="lbl-childheightpredictor-mother-height-cm" className={labelCls}>Mother height (cm)</label><input id="lbl-childheightpredictor-mother-height-cm" aria-label="Mother height (cm)" className={inputCls} type="number" value={motherHeight} onChange={e => setMotherHeight(e.target.value)} /></div>
        <div><label htmlFor="lbl-childheightpredictor-child-gender" className={labelCls}>Child gender</label><select id="lbl-childheightpredictor-child-gender" aria-label="Child gender" className={inputCls} value={gender} onChange={e => setGender(e.target.value as 'male'|'female')}><option value="male">Male</option><option value="female">Female</option></select></div>
      </div>
    </CalculatorShell>
  );
}

"use client";
import { useState } from 'react';
import { CalcActions } from '../shared/CalcActions';
import { ac, borderClass } from '../miscToolColors';
import { Section, Input, labelClass, selClass } from '../MiscToolsShared';

export default function SignificantFiguresCalculator() {
  const clr = ac('SignificantFiguresCalculator');
  const [input, setInput] = useState('0.00450');
  const countSigFigs = (s: string) => {
    const trimmed = s.replace(/^0+/, '');
    if (!trimmed || trimmed === '.') return 0;
    if (!trimmed.includes('.')) return trimmed.replace(/0+$/, '').length;
    return trimmed.replace(/\./g, '').length;
  };
  const sigFigs = countSigFigs(input);
  const resultText = `Value: ${input}\nSignificant Figures: ${sigFigs}`;
  const downloadData = `Value,Significant Figures\n${input},${sigFigs}`;
  return (
    <Section title="Significant Figures">
      <Input label="Number" value={input} onChange={setInput} />
      <div className="text-lg font-bold">{sigFigs} significant figures</div>
      <CalcActions result={resultText} downloadData={downloadData} downloadFilename="significant_figures.csv" />
    </Section>
  );
}

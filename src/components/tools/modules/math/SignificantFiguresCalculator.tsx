"use client";
import { useState } from 'react';
import { CalcActions } from '../shared/CalcActions';
import { ac, borderClass } from '../miscToolColors';
import { Section, Input, labelClass, selClass } from '../MiscToolsShared';

export default function SignificantFiguresCalculator() {
  const clr = ac('SignificantFiguresCalculator');
  const [input, setInput] = useState('0.00450');
  const countSigFigs = (s: string) => {
    const t = s.trim();
    if (!t) return 0;
    // Strip sign and split mantissa/exponent (1.23e4 → mantissa 1.23).
    const m = t.match(/^([+-]?)(.*?)(?:[eE]([+-]?\d+))?$/);
    if (!m) return 0;
    const mantissa = (m[2] || '').replace(/[^0-9.]/g, '');
    if (!mantissa || mantissa === '.') return 0;
    if (!mantissa.includes('.')) {
      // Integer: leading zeros never count; trailing zeros count only with
      // an explicit decimal point (e.g. 150. → 3, 150 → 2). Bare zero → 1.
      const noLead = mantissa.replace(/^0+/, '');
      if (!noLead) return /\d/.test(mantissa) ? 1 : 0;
      return t.includes('.') ? noLead.length : noLead.replace(/0+$/, '').length || 1;
    }
    // Decimal: drop leading zeros and the point; every remaining digit
    // counts — including trailing zeros (0.00450 → 3, not 2).
    const digits = mantissa.replace('.', '').replace(/^0+/, '');
    return digits.length;
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

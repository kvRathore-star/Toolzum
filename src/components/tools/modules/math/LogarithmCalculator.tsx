"use client";
import { useState } from 'react';
import { CalcActions } from '../shared/CalcActions';
import { ac, borderClass } from '../miscToolColors';
import { Section, Input, labelClass, selClass } from '../MiscToolsShared';

export default function LogarithmCalculator() {
  const clr = ac('LogarithmCalculator');
  const [num, setNum] = useState('100');
  const [base, setBase] = useState('10');
  const n = Number(num), b = Number(base);
  const log = Math.log(n) / Math.log(b);
  const resultText = `log_${b}(${n}) = ${isFinite(log) ? log.toFixed(6) : 'Invalid'}\nNatural log: ${Math.log(n).toFixed(6)}`;
  const downloadData = `Base,Number,Logarithm,Natural Log\n${b},${n},${isFinite(log) ? log.toFixed(6) : 'Invalid'},${Math.log(n).toFixed(6)}`;
  return (
    <Section title="Logarithm Calculator">
      <div className="flex gap-2 items-center">
        <span className="text-sm">log</span>
        <Input label="Value" type="number" value={base} onChange={setBase} />
        <Input label="Value" type="number" value={num} onChange={setNum} />
      </div>
      <div className="text-lg font-bold">log_{b}({n}) = {isFinite(log) ? log.toFixed(6) : 'Invalid'}</div>
      <div className="text-xs text-[var(--text-secondary)]">Natural log: {Math.log(n).toFixed(6)}</div>
      <CalcActions result={resultText} downloadData={downloadData} downloadFilename="logarithm.csv" />
    </Section>
  );
}

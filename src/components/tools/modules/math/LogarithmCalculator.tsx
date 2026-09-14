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
  // Guard every path: log is defined only for n>0, b>0, b≠1. The old code
  // printed RangeError/Infinity on empty or zero input.
  const valid = num.trim() !== '' && base.trim() !== '' && Number.isFinite(n) && Number.isFinite(b) && n > 0 && b > 0 && b !== 1;
  const log = valid ? Math.log(n) / Math.log(b) : NaN;
  const ln = valid ? Math.log(n) : NaN;
  const resultText = valid ? `log_${b}(${n}) = ${log.toFixed(6)}\nNatural log: ${ln.toFixed(6)}` : 'Enter a positive number and a base (b > 0, b ≠ 1)';
  const downloadData = valid ? `Base,Number,Logarithm,Natural Log\n${b},${n},${log.toFixed(6)},${ln.toFixed(6)}` : '';
  return (
    <Section title="Logarithm Calculator">
      <div className="flex gap-2 items-center">
        <span className="text-sm">log</span>
        <Input label="Base" type="number" value={base} onChange={setBase} />
        <Input label="Number" type="number" value={num} onChange={setNum} />
      </div>
      <div className="text-lg font-bold">log_{valid ? b : 'b'}({valid ? n : 'x'}) = {valid ? log.toFixed(6) : '—'}</div>
      <div className="text-xs text-[var(--text-secondary)]">Natural log: {valid ? ln.toFixed(6) : 'Enter a positive number and a base (b > 0, b ≠ 1)'}</div>
      <CalcActions result={resultText} downloadData={downloadData} downloadFilename="logarithm.csv" />
    </Section>
  );
}

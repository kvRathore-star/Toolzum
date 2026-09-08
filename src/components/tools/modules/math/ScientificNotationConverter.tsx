"use client";
import { useState } from 'react';
import { CalcActions } from '../shared/CalcActions';
import { ac, borderClass } from '../miscToolColors';
import { Section, Input, labelClass, selClass } from '../MiscToolsShared';

export default function ScientificNotationConverter() {
  const clr = ac('ScientificNotationConverter');
  const [input, setInput] = useState('1234000');
  const n = Number(input);
  const toScientific = (x: number) => {
    if (x === 0) return '0 x 10^0';
    const e = Math.floor(Math.log10(Math.abs(x)));
    const m = x / Math.pow(10, e);
    return m.toFixed(3) + ' x 10^' + e;
  };
  const scientific = isNaN(n) ? 'Invalid' : toScientific(n);
  const resultText = `Number: ${input}\nScientific Notation: ${scientific}`;
  const downloadData = `Number,Scientific Notation\n${input},"${scientific}"`;
  return (
    <Section title="Scientific Notation Converter">
      <Input label="Number" type="number" value={input} onChange={setInput} />
      <div className="text-sm">{scientific}</div>
      <CalcActions result={resultText} downloadData={downloadData} downloadFilename="scientific_notation.csv" />
    </Section>
  );
}

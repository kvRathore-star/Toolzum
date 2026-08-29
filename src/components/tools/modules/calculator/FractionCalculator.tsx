"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { gcd, inputCls } from '../Calculators.shared';

export default function FractionCalculator() {
  const [frac1, setFrac1] = useState('1/2');
  const [frac2, setFrac2] = useState('1/3');
  const [op, setOp] = useState('+');
  const presets = [
    { label: '1/2 + 1/3', apply: () => { setFrac1('1/2'); setFrac2('1/3'); setOp('+'); } },
    { label: '3/4 * 2/5', apply: () => { setFrac1('3/4'); setFrac2('2/5'); setOp('*'); } },
  ];
  const [n1, d1] = frac1.split('/').map(Number);
  const [n2, d2] = frac2.split('/').map(Number);
  let rn: number, rd: number;
  switch (op) {
    case '+': rn = n1 * d2 + n2 * d1; rd = d1 * d2; break;
    case '-': rn = n1 * d2 - n2 * d1; rd = d1 * d2; break;
    case '*': rn = n1 * n2; rd = d1 * d2; break;
    case '/': rn = n1 * d2; rd = d1 * n2; break;
    default: rn = 0; rd = 1;
  }
  const g = gcd(Math.abs(rn), Math.abs(rd));
  rn /= g; rd /= g;
  const decimal = rn / rd;
  const customResult = (
    <div className="text-center font-mono">
      <div className="text-lg text-[var(--text-primary)]">{frac1} {op === '*' ? '\u00d7' : op === '/' ? '\u00f7' : op} {frac2} = {rn}/{rd}{rd === 1 ? ` = ${rn}` : ` = ${decimal.toFixed(4)}`}</div>
    </div>
  );
  return (
    <CalculatorShell title="Fraction Calculator" result="" auto presets={presets} accent="rose" customResult={customResult}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Fraction 1</label><input type="text" value={frac1} onChange={e => setFrac1(e.target.value)} placeholder="1/2" className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Operation</label><select value={op} onChange={e => setOp(e.target.value)} className={inputCls}>
          <option value="+">+</option><option value="-">-</option><option value="*">×</option><option value="/">÷</option>
        </select></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Fraction 2</label><input type="text" value={frac2} onChange={e => setFrac2(e.target.value)} placeholder="1/3" className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}

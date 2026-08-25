"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { ac, pillClass, btnClass, borderClass } from './miscToolColors';

import { Section, Input, labelClass, selClass } from './MiscToolsShared';
import { CalculatorShell } from './shared/CalculatorShell';
import { getErrorMessage } from '@/utils/error';

export function BinaryConverter() {
  const clr = ac('BinaryConverter');
  const [input, setInput] = useState('42');
  const [mode, setMode] = useState('dec');
  const convert = (v: string, m: string) => {
    const n = parseInt(v, m === 'dec' ? 10 : m === 'hex' ? 16 : m === 'oct' ? 8 : 2);
    if (isNaN(n)) return { dec: '', hex: '', oct: '', bin: '' };
    return { dec: String(n), hex: n.toString(16).toUpperCase(), oct: n.toString(8), bin: n.toString(2) };
  };
  const res = convert(input, mode);
  return (
    <Section title="Binary Converter">
      <select className={selClass} value={mode} onChange={e => setMode(e.target.value)}>
        <option value="dec">Decimal</option><option value="hex">Hex</option><option value="oct">Octal</option><option value="bin">Binary</option>
      </select>
      <Input label="Enter value" placeholder="Enter value" value={input} onChange={setInput} />
      <div className="text-xs space-y-1 font-mono">
        <div><span className="text-[var(--text-secondary)]">Decimal:</span> {res.dec}</div>
        <div><span className="text-[var(--text-secondary)]">Hex:</span> {res.hex}</div>
        <div><span className="text-[var(--text-secondary)]">Octal:</span> {res.oct}</div>
        <div><span className="text-[var(--text-secondary)]">Binary:</span> {res.bin}</div>
      </div>
    </Section>
  );
}
// --- RomanNumeralConverter ---
export function RomanNumeralConverter() {
  const clr = ac('RomanNumeralConverter');
  const [dec, setDec] = useState('2024');
  const [roman, setRoman] = useState('MMXXIV');
  const toRoman = (n: number) => {
    const vals: [number, string][] = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
    let r = '', x = n;
    for (const [v, s] of vals) { while (x >= v) { r += s; x -= v; } }
    return r;
  };
  const fromRoman = (r: string) => {
    const m: Record<string, number> = { 'M': 1000, 'D': 500, 'C': 100, 'L': 50, 'X': 10, 'V': 5, 'I': 1 };
    let total = 0, prev = 0;
    for (let i = r.length - 1; i >= 0; i--) {
      const v = m[r[i]] || 0;
      total += v < prev ? -v : v;
      prev = v;
    }
    return total;
  };
  const toR = () => { const n = parseInt(dec); if (n > 0 && n < 4000) setRoman(toRoman(n)); };
  const fromR = () => { const n = fromRoman(roman.toUpperCase()); if (n > 0) setDec(String(n)); };
  return (
    <Section title="Roman Numeral Converter">
      <Input label="Decimal" placeholder="Decimal" value={dec} onChange={setDec} />
      <Input label="Roman" placeholder="Roman" value={roman} onChange={setRoman} />
      <div className="flex gap-2"><button className={btnClass(clr)} onClick={toR}>To Roman</button><button className={btnClass(clr)} onClick={fromR}>From Roman</button></div>
    </Section>
  );
}
// --- NumberToWordsConverter ---
export function NumberToWordsConverter() {
  const clr = ac('NumberToWordsConverter');
  const [num, setNum] = useState('1234');
  const ones = ['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  const convert = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? '-' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
    if (n < 1000000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 1000000000) return convert(Math.floor(n / 1000000)) + ' Million' + (n % 1000000 ? ' ' + convert(n % 1000000) : '');
    return convert(Math.floor(n / 1000000000)) + ' Billion' + (n % 1000000000 ? ' ' + convert(n % 1000000000) : '');
  };
  const words = parseInt(num) ? convert(parseInt(num)) : '';
  return (
    <Section title="Number to Words">
      <Input label="Value" type="number" value={num} onChange={setNum} />
      <div className="text-sm font-medium p-3 bg-[var(--bg-surface)] rounded-lg">{words}</div>
    </Section>
  );
}
// --- NumberBaseConverter ---
export function NumberBaseConverter() {
  const clr = ac('NumberBaseConverter');
  const [input, setInput] = useState('255');
  const [fromBase, setFromBase] = useState(10);
  const [toBase, setToBase] = useState(16);
  const result = parseInt(input, fromBase);
  const output = isNaN(result) ? '' : result.toString(toBase).toUpperCase();
  return (
    <Section title="Number Base Converter">
      <div className="flex gap-2">
        <select className={selClass} value={fromBase} onChange={e => setFromBase(Number(e.target.value))}>
          {Array.from({ length: 35 }, (_, i) => i + 2).map(b => <option key={b} value={b}>Base {b}</option>)}
        </select>
        <span className="self-center">-</span>
        <select className={selClass} value={toBase} onChange={e => setToBase(Number(e.target.value))}>
          {Array.from({ length: 35 }, (_, i) => i + 2).map(b => <option key={b} value={b}>Base {b}</option>)}
        </select>
      </div>
      <Input label="Enter number" placeholder="Enter number" value={input} onChange={setInput} />
      <div className="text-lg font-mono font-bold text-blue-600">{output}</div>
    </Section>
  );
}
// --- PercentageChangeCalculator ---
export function PercentageChangeCalculator() {
  const clr = ac('PercentageChangeCalculator');
  const [a, setA] = useState('100');
  const [b, setB] = useState('120');
  const oldVal = Number(a), newVal = Number(b);
  const change = oldVal ? ((newVal - oldVal) / oldVal * 100) : 0;
  const diff = newVal - oldVal;

  const presets = [
    { label: '100 → 120', apply: () => { setA('100'); setB('120'); } },
    { label: '50 → 75', apply: () => { setA('50'); setB('75'); } },
    { label: '200 → 150', apply: () => { setA('200'); setB('150'); } },
    { label: '1000 → 850', apply: () => { setA('1000'); setB('850'); } },
  ];

  const resultText = oldVal ? `${change >= 0 ? '+' : ''}${change.toFixed(2)}% (${diff >= 0 ? '+' : ''}${diff.toFixed(2)})` : 'Enter old value';

  return (
    <CalculatorShell title="Percentage Change" result={resultText} onCalculate={() => {}} presets={presets} accent="amber" downloadData={JSON.stringify({ oldValue: oldVal, newValue: newVal, change: change.toFixed(2), difference: diff.toFixed(2) }, null, 2)} downloadFilename="pct-change.json">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>Old Value</label>
            <input type="number" step="any" value={a} onChange={e => setA(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
          </div>
          <div>
            <label className={labelClass}>New Value</label>
            <input type="number" step="any" value={b} onChange={e => setB(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
          </div>
        </div>

        {oldVal && (
          <div className={`p-4 rounded-xl ${change >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
            <div className="flex items-baseline justify-center gap-2">
              <span className={`text-3xl font-bold ${change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                ${change >= 0 ? '+' : ''}${change.toFixed(2)}%
              </span>
              <span className="text-sm text-[var(--text-secondary)]">${change >= 0 ? 'increase' : 'decrease'}</span>
            </div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">${diff >= 0 ? '+' : ''}${diff.toFixed(2)} change</div>
          </div>
        )}

        <div className="bg-[var(--bg-surface)] rounded-xl p-3">
          <div className="text-xs text-[var(--text-secondary)] mb-2">Formula</div>
          <div className="font-mono text-sm text-[var(--text-primary)]">
            (New - Old) / Old × 100
          </div>
        </div>
      </div>
    </CalculatorShell>
  );
}
// --- PercentageDifferenceCalculator ---
export function PercentageDifferenceCalculator() {
  const clr = ac('PercentageDifferenceCalculator');
  const [a, setA] = useState('100');
  const [b, setB] = useState('150');

  const numA = Number(a) || 0;
  const numB = Number(b) || 0;
  const avg = (numA + numB) / 2;
  const absDiff = Math.abs(numA - numB);
  const diff = avg ? (absDiff / avg) * 100 : 0;

  const swap = () => { setA(b); setB(a); };

  const presets = [
    { label: '100 vs 150', apply: () => { setA('100'); setB('150'); } },
    { label: '50 vs 75', apply: () => { setA('50'); setB('75'); } },
    { label: '200 vs 250', apply: () => { setA('200'); setB('250'); } },
    { label: '1000 vs 1200', apply: () => { setA('1000'); setB('1200'); } },
    { label: '250 vs 100', apply: () => { setA('250'); setB('100'); } },
  ];

  const resultText = avg > 0
    ? `${numA} and ${numB} differ by ${diff.toFixed(2)}% (avg: ${avg.toFixed(2)}, Δ: ${absDiff.toFixed(2)})`
    : 'Enter two non-zero values';

  const barMax = Math.max(numA, numB, 1);
  const barA = (numA / barMax) * 100;
  const barB = (numB / barMax) * 100;

  const diffColor = diff < 10 ? 'text-emerald-600 dark:text-emerald-400'
    : diff < 25 ? 'text-amber-600 dark:text-amber-400'
    : 'text-rose-600 dark:text-rose-400';

  const barColorA = 'bg-blue-500';
  const barColorB = numB > numA ? 'bg-emerald-500' : numB < numA ? 'bg-rose-500' : 'bg-blue-500';

  return (
    <CalculatorShell
      title="Percentage Difference"
      result={resultText}
      onCalculate={() => {}}
      presets={presets}
      accent="emerald"
    >
      <div className="space-y-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className={labelClass}>Value A</label>
            <input type="number" value={a} onChange={e => setA(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <button onClick={swap} className="px-3 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors text-sm" title="Swap values">⇄</button>
          <div className="flex-1">
            <label className={labelClass}>Value B</label>
            <input type="number" value={b} onChange={e => setB(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
        </div>

        {avg > 0 && (
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${diffColor}`}>{diff.toFixed(2)}%</span>
              <span className="text-sm text-[var(--text-secondary)]">difference</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-secondary)] w-16 text-right">A</span>
                <div className="flex-1 h-5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                  <div className={`h-full ${barColorA} rounded-full transition-all duration-500`} style={{ width: `${barA}%` }} />
                </div>
                <span className="text-xs font-mono text-[var(--text-secondary)] w-20">{numA.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-secondary)] w-16 text-right">B</span>
                <div className="flex-1 h-5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                  <div className={`h-full ${barColorB} rounded-full transition-all duration-500`} style={{ width: `${barB}%` }} />
                </div>
                <span className="text-xs font-mono text-[var(--text-secondary)] w-20">{numB.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-[var(--bg-surface)] rounded-xl p-2.5 text-center">
                <div className="text-xs text-[var(--text-secondary)]">Average</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-xl p-2.5 text-center">
                <div className="text-xs text-[var(--text-secondary)]">Absolute Δ</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{absDiff.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-xl p-2.5 text-center">
                <div className="text-xs text-[var(--text-secondary)]">Relative Δ</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{diff.toFixed(2)}%</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
// --- VatCalculator ---
export function VatCalculator() {
  const clr = ac('VatCalculator');
  const [amount, setAmount] = useState('100');
  const [rate, setRate] = useState(20);
  const [mode, setMode] = useState('add');
  const a = Number(amount);
  const vat = mode === 'add' ? a * rate / 100 : a * rate / (100 + rate);
  const net = mode === 'add' ? a : a - vat;
  const gross = mode === 'add' ? a + vat : a;
  return (
    <Section title="VAT Calculator">
      <select className={selClass} value={mode} onChange={e => setMode(e.target.value)}>
        <option value="add">Add VAT</option><option value="remove">Remove VAT</option>
      </select>
      <div className="flex gap-2">
        <Input label="Value" type="number" value={amount} onChange={setAmount} />
        <Input label="Value" type="number" value={rate} onChange={v => setRate(Number(v))} />
      </div>
      <div className="text-xs space-y-1"><div>Net: {net.toFixed(2)}</div><div>VAT ({rate}%): {vat.toFixed(2)}</div><div className="font-bold">Gross: {gross.toFixed(2)}</div></div>
    </Section>
  );
}
// --- TipCalculator ---
export function TipCalculator() {
  const clr = ac('TipCalculator');
  const [bill, setBill] = useState('50');
  const [pct, setPct] = useState(15);
  const [split, setSplit] = useState(2);
  const b = Number(bill);
  const tip = b * pct / 100;
  const total = b + tip;
  return (
    <Section title="Tip Calculator">
      <div className="flex gap-2">
        <div><label className={labelClass}>Bill</label><Input label="Value" type="number" value={bill} onChange={setBill} /></div>
        <div><label className={labelClass}>Tip %</label><Input label="Value" type="number" value={pct} onChange={v => setPct(Number(v))} /></div>
        <div><label className={labelClass}>Split</label><Input label="Value" type="number" min={1} value={split} onChange={v => setSplit(Number(v))} /></div>
      </div>
      <div className="text-xs space-y-1">
        <div>Tip: ${tip.toFixed(2)}</div>
        <div>Total: ${total.toFixed(2)}</div>
        <div className="font-bold">Each: ${(total / split).toFixed(2)}</div>
      </div>
    </Section>
  );
}
// --- SalesTaxCalculator ---
const US_STATE_TAX: Record<string, number> = {
  'AL': 4.00, 'AK': 0.00, 'AZ': 5.60, 'AR': 6.50, 'CA': 7.25,
  'CO': 2.90, 'CT': 6.35, 'DE': 0.00, 'DC': 6.00, 'FL': 6.00,
  'GA': 4.00, 'HI': 4.00, 'ID': 6.00, 'IL': 6.25, 'IN': 7.00,
  'IA': 6.00, 'KS': 6.50, 'KY': 6.00, 'LA': 4.45, 'ME': 5.50,
  'MD': 6.00, 'MA': 6.25, 'MI': 6.00, 'MN': 6.875, 'MS': 7.00,
  'MO': 4.225, 'MT': 0.00, 'NE': 5.50, 'NV': 6.85, 'NH': 0.00,
  'NJ': 6.625, 'NM': 4.875, 'NY': 4.00, 'NC': 4.75, 'ND': 5.00,
  'OH': 5.75, 'OK': 4.50, 'OR': 0.00, 'PA': 6.00, 'RI': 7.00,
  'SC': 6.00, 'SD': 4.50, 'TN': 7.00, 'TX': 6.25, 'UT': 6.10,
  'VT': 6.00, 'VA': 5.30, 'WA': 6.50, 'WV': 6.00, 'WI': 5.00, 'WY': 4.00,
};
export function SalesTaxCalculator() {
  const clr = ac('SalesTaxCalculator');
  const [amount, setAmount] = useState('100');
  const [rate, setRate] = useState('8');
  const [state, setState] = useState('');
  const [mode, setMode] = useState<'custom' | 'state'>('custom');
  const a = Number(amount);
  const r = mode === 'state' && state ? (US_STATE_TAX[state] ?? 0) : Number(rate);
  const tax = a * r / 100;
  return (
    <Section title="Sales Tax Calculator">
      <div className="flex gap-1 mb-2">
        <button onClick={() => setMode('custom')} className={`px-3 py-1 text-xs rounded-lg border transition-colors ${mode === 'custom' ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'border-[var(--border-subtle)]'}`}>Custom Rate</button>
        <button onClick={() => setMode('state')} className={`px-3 py-1 text-xs rounded-lg border transition-colors ${mode === 'state' ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'border-[var(--border-subtle)]'}`}>US State</button>
      </div>
      <div className="flex gap-2">
        <Input label="Price ($)" type="number" value={amount} onChange={setAmount} />
        {mode === 'custom' ? (
          <Input label="Tax Rate (%)" type="number" value={rate} onChange={setRate} />
        ) : (
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1">State</label>
            <select value={state} onChange={e => setState(e.target.value)} className="w-full border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm bg-[var(--bg-surface)]">
              <option value="">Select state</option>
              {Object.entries(US_STATE_TAX).sort(([a], [b]) => a.localeCompare(b)).map(([abbr, rate]) => (
                <option key={abbr} value={abbr}>{abbr} — {rate}%</option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="text-xs space-y-1">
        <div>Subtotal: ${a.toFixed(2)}</div>
        <div>Tax ({r}%): ${tax.toFixed(2)}</div>
        <div className="text-base font-bold">Total: ${(a + tax).toFixed(2)}</div>
      </div>
      {mode === 'state' && state && (
        <div className="text-xs text-[var(--text-secondary)]">
          {US_STATE_TAX[state] === 0
            ? `${state} has no statewide sales tax — local rates may apply.`
            : `Base state rate only. Local/county taxes may add 1-3% on top.`
          }
        </div>
      )}
    </Section>
  );
}
// --- MarkupCalculator ---
export function MarkupCalculator() {
  const clr = ac('MarkupCalculator');
  const [cost, setCost] = useState('50');
  const [markup, setMarkup] = useState(25);
  const c = Number(cost), m = Number(markup);
  const price = c * (1 + m / 100);
  const profit = price - c;
  return (
    <Section title="Markup Calculator">
      <div className="flex gap-2">
        <div><label className={labelClass}>Cost</label><Input label="Value" type="number" value={cost} onChange={setCost} /></div>
        <div><label className={labelClass}>Markup %</label><Input label="Value" type="number" value={markup} onChange={v => setMarkup(Number(v))} /></div>
      </div>
      <div className="text-xs space-y-1">
        <div>Selling Price: ${price.toFixed(2)}</div>
        <div>Profit: ${profit.toFixed(2)}</div>
        <div className="font-bold">Margin: {(profit / price * 100).toFixed(1)}%</div>
      </div>
    </Section>
  );
}
// --- ROICalculator ---
export function ROICalculator() {
  const clr = ac('ROICalculator');
  const [invested, setInvested] = useState('1000');
  const [returned, setReturned] = useState('1500');
  const i = Number(invested), r = Number(returned);
  const roi = i ? ((r - i) / i * 100) : 0;
  const profit = r - i;

  const presets = [
    { label: '1000 → 1500', apply: () => { setInvested('1000'); setReturned('1500'); } },
    { label: '5000 → 7500', apply: () => { setInvested('5000'); setReturned('7500'); } },
    { label: '10000 → 8500', apply: () => { setInvested('10000'); setReturned('8500'); } },
    { label: '2500 → 3000', apply: () => { setInvested('2500'); setReturned('3000'); } },
  ];

  const resultText = i ? `ROI: ${roi.toFixed(2)}% (${profit >= 0 ? '+' : ''}$${profit.toFixed(2)})` : 'Enter investment amount';

  return (
    <CalculatorShell title="ROI Calculator" result={resultText} onCalculate={() => {}} presets={presets} accent="emerald" downloadData={JSON.stringify({ invested: i, returned: r, roi: roi.toFixed(2), profit: profit.toFixed(2) }, null, 2)} downloadFilename="roi.json">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>Amount Invested ($)</label>
            <input type="number" min={0} step="0.01" value={invested} onChange={e => setInvested(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <div>
            <label className={labelClass}>Total Return ($)</label>
            <input type="number" min={0} step="0.01" value={returned} onChange={e => setReturned(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
        </div>

        {i && (
          <div className={`p-4 rounded-xl ${profit >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="text-xs text-[var(--text-secondary)]">ROI</div>
                <div className={`text-2xl font-bold ${profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {roi.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-secondary)]">Profit/Loss</div>
                <div className={`text-2xl font-bold ${profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {profit >= 0 ? '+' : ''}$${profit.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-[var(--bg-surface)] rounded-xl p-3">
          <div className="text-xs text-[var(--text-secondary)] mb-2">Formula</div>
          <div className="font-mono text-sm text-[var(--text-primary)]">
            ROI = (Return - Invested) / Invested × 100
          </div>
        </div>
      </div>
    </CalculatorShell>
  );
}
// --- CAGRCalculator ---
export function CAGRCalculator() {
  const clr = ac('CAGRCalculator');
  const [start, setStart] = useState('1000');
  const [end, setEnd] = useState('2000');
  const [years, setYears] = useState('5');
  const s = Number(start), e = Number(end), y = Number(years);
  const cagr = s > 0 && y > 0 ? (Math.pow(e / s, 1 / y) - 1) * 100 : 0;
  const totalReturn = s ? ((e - s) / s * 100) : 0;

  const presets = [
    { label: '1K to 2K in 5yr', apply: () => { setStart('1000'); setEnd('2000'); setYears('5'); } },
    { label: '10K to 50K in 10yr', apply: () => { setStart('10000'); setEnd('50000'); setYears('10'); } },
    { label: '100 to 1000 in 7yr', apply: () => { setStart('100'); setEnd('1000'); setYears('7'); } },
    { label: '5000 to 7500 in 3yr', apply: () => { setStart('5000'); setEnd('7500'); setYears('3'); } },
  ];

  const resultText = s > 0 && y > 0 ? `CAGR: ${cagr.toFixed(2)}% (Total: ${totalReturn.toFixed(2)}%)` : 'Enter valid values';

  return (
    <CalculatorShell title="CAGR Calculator" result={resultText} onCalculate={() => {}} presets={presets} accent="emerald" downloadData={JSON.stringify({ startValue: s, endValue: e, years: y, cagr: cagr.toFixed(2), totalReturn: totalReturn.toFixed(2) }, null, 2)} downloadFilename="cagr.json">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className={labelClass}>Start Value</label>
            <input type="number" min={0} step="0.01" value={start} onChange={e => setStart(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <div>
            <label className={labelClass}>End Value</label>
            <input type="number" min={0} step="0.01" value={end} onChange={e => setEnd(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <div>
            <label className={labelClass}>Years</label>
            <input type="number" min={0} step="0.1" value={years} onChange={e => setYears(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
        </div>

        {s > 0 && y > 0 && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">Compound Annual Growth Rate</div>
            <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">${cagr.toFixed(2)}%</div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">Total return: ${totalReturn.toFixed(2)}%</div>
          </div>
        )}

        {s > 0 && y > 0 && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Year-by-Year Growth</div>
            <div className="max-h-48 overflow-auto space-y-1">
              {Array.from({ length: y }, (_, i) => {
                const year = i + 1;
                const value = s * Math.pow(e / s, year / y);
                return (
                  <div key={year} className="flex justify-between p-2 bg-[var(--bg-overlay)] rounded-lg text-sm">
                    <span>Year ${year}</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">${value.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-[var(--bg-surface)] rounded-xl p-3">
          <div className="text-xs text-[var(--text-secondary)] mb-2">Formula</div>
          <div className="font-mono text-sm text-[var(--text-primary)]">
            CAGR = (End / Start)^(1 / Years) - 1
          </div>
        </div>
      </div>
    </CalculatorShell>
  );
}
// --- CurrencyConverter ---
export function CurrencyConverter() {
  const clr = ac('CurrencyConverter');
  const rates: Record<string, number> = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, INR: 83.1, CAD: 1.36, AUD: 1.53, CNY: 7.24, BRL: 4.97, KRW: 1325 };
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const result = (Number(amount) / rates[from]) * rates[to];
  return (
    <Section title="Currency Converter">
      <div className="flex gap-2 items-center">
        <Input label="Value" type="number" value={amount} onChange={setAmount} />
        <select className={selClass} value={from} onChange={e => setFrom(e.target.value)}>
          {Object.keys(rates).map(c => <option key={c}>{c}</option>)}
        </select>
        <span>-</span>
        <select className={selClass} value={to} onChange={e => setTo(e.target.value)}>
          {Object.keys(rates).map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="text-lg font-bold">{result.toFixed(2)} {to}</div>
    </Section>
  );
}
// --- CurrencyRateCalculator ---
export function CurrencyRateCalculator() {
  const clr = ac('CurrencyRateCalculator');
  const currencies: Record<string, number> = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, INR: 83.1, CAD: 1.36, AUD: 1.53, CHF: 0.88, CNY: 7.24, NZD: 1.62, SEK: 10.45, NOK: 10.55, DKK: 6.87, PLN: 3.98, MXN: 17.15, SGD: 1.34, HKD: 7.82, TRY: 30.25, ZAR: 18.75, BRL: 4.97, KRW: 1325, AED: 3.67, SAR: 3.75, THB: 35.50, MYR: 4.72, PHP: 56.20, IDR: 15650, VND: 24600, CZK: 22.80, HUF: 358, CLP: 875, ARS: 820 };
  const currencyList = Object.keys(currencies);
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const result = (Number(amount) / currencies[from]) * currencies[to];
  const rate = currencies[to] / currencies[from];

  const presets = [
    { label: 'USD → EUR', apply: () => { setFrom('USD'); setTo('EUR'); } },
    { label: 'GBP → USD', apply: () => { setFrom('GBP'); setTo('USD'); } },
    { label: 'JPY → USD', apply: () => { setFrom('JPY'); setTo('USD'); } },
    { label: 'EUR → GBP', apply: () => { setFrom('EUR'); setTo('GBP'); } },
    { label: 'USD → INR', apply: () => { setFrom('USD'); setTo('INR'); } },
  ];

  const resultText = `${amount} ${from} = ${result.toFixed(2)} ${to} (rate: ${rate.toFixed(4)})`;

  return (
    <CalculatorShell title="Currency Rate Calculator" result={resultText} onCalculate={() => {}} presets={presets} accent="blue" downloadData={JSON.stringify({ amount: Number(amount), from, to, result: result.toFixed(2), rate: rate.toFixed(6) }, null, 2)} downloadFilename="currency-rate.json">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>Amount</label>
            <input type="number" min={0} step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
          </div>
          <div>
            <label className={labelClass}>From / To</label>
            <div className="flex gap-1">
              <select value={from} onChange={e => setFrom(e.target.value)}
                className="flex-1 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                ${currencyList.map(c => `<option key="${c}" value="${c}">${c}</option>`)}
              </select>
              <span className="self-center text-lg font-bold">→</span>
              <select value={to} onChange={e => setTo(e.target.value)}
                className="flex-1 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                ${currencyList.map(c => `<option key="${c}" value="${c}">${c}</option>`)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Converted Amount</div>
          <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">${result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${to}</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">Rate: 1 ${from} = ${rate.toFixed(4)} ${to}</div>
        </div>

        <div className="bg-[var(--bg-surface)] rounded-xl p-3">
          <div className="text-xs text-[var(--text-secondary)] mb-2">Rate Table (per 1 ${from})</div>
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-auto text-xs">
            ${currencyList.slice(0, 15).map(c => `
              <div className="p-1.5 bg-[var(--bg-overlay)] rounded-lg text-center">
                <div className="font-mono text-blue-600 dark:text-blue-400">${(currencies[c] / currencies[from]).toFixed(4)}</div>
                <div className="text-[var(--text-muted)]">${c}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </CalculatorShell>
  );
}
// --- ExchangeRateCalculator ---
export function ExchangeRateCalculator() {
  const clr = ac('ExchangeRateCalculator');
  const rates: Record<string, number> = { 'USD/EUR': 0.92, 'USD/GBP': 0.79, 'USD/JPY': 149.5, 'EUR/USD': 1.09, 'EUR/GBP': 0.86, 'GBP/USD': 1.27, 'GBP/EUR': 1.16, 'USD/INR': 83.1, 'USD/CAD': 1.36, 'USD/AUD': 1.53 };
  const pairList = Object.keys(rates);
  const [amount, setAmount] = useState('100');
  const [pair, setPair] = useState('USD/EUR');
  const rate = rates[pair] || 1;
  const result = Number(amount) * rate;

  const presets = [
    { label: 'USD/EUR', apply: () => setPair('USD/EUR') },
    { label: 'EUR/USD', apply: () => setPair('EUR/USD') },
    { label: 'USD/JPY', apply: () => setPair('USD/JPY') },
    { label: 'GBP/USD', apply: () => setPair('GBP/USD') },
    { label: 'USD/INR', apply: () => setPair('USD/INR') },
  ];

  const resultText = `${amount} ${pair.split('/')[0]} = ${result.toFixed(2)} ${pair.split('/')[1]} @ ${rate}`;

  return (
    <CalculatorShell title="Exchange Rate Calculator" result={resultText} onCalculate={() => {}} presets={presets} accent="indigo" downloadData={JSON.stringify({ amount: Number(amount), pair, rate, result: result.toFixed(2) }, null, 2)} downloadFilename="exchange-rate.json">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className={labelClass}>Amount</label>
            <input type="number" min={0} step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className={labelClass}>Currency Pair</label>
            <select value={pair} onChange={e => setPair(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
              ${pairList.map(p => `<option key="${p}" value="${p}">${p}</option>`)}
            </select>
          </div>
        </div>

        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-center">
          <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-1">Converted</div>
          <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">${result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${pair.split('/')[1]}</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">Rate: 1 ${pair.split('/')[0]} = ${rate.toFixed(4)} ${pair.split('/')[1]}</div>
        </div>

        <div className="bg-[var(--bg-surface)] rounded-xl p-3">
          <div className="text-xs text-[var(--text-secondary)] mb-2">All Rates</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs max-h-48 overflow-auto">
            ${pairList.map(p => `
              <div className="p-1.5 bg-[var(--bg-overlay)] rounded-lg text-center ${p === pair ? 'ring-2 ring-indigo-500' : ''}">
                <div className="font-mono text-indigo-600 dark:text-indigo-400">${rates[p].toFixed(4)}</div>
                <div className="text-[var(--text-muted)]">${p}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </CalculatorShell>
  );
}
// --- FractionSimplifier ---
export function FractionSimplifier() {
  const clr = ac('FractionSimplifier');
  const [num, setNum] = useState('8');
  const [den, setDen] = useState('12');
  const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
  const n = Number(num), d = Number(den);
  const g = d ? gcd(Math.abs(n), Math.abs(d)) : 0;
  const simple = g ? `${n/g}/${d/g}` : 'Invalid';
  const decimal = d ? (n / d).toFixed(4) : '—';
  const percent = d ? ((n / d) * 100).toFixed(2) : '—';

  const presets = [
    { label: '8/12', apply: () => { setNum('8'); setDen('12'); } },
    { label: '15/25', apply: () => { setNum('15'); setDen('25'); } },
    { label: '100/250', apply: () => { setNum('100'); setDen('250'); } },
    { label: '7/13', apply: () => { setNum('7'); setDen('13'); } },
  ];

  const resultText = d ? `${n}/${d} = ${simple} = ${decimal} (${percent}%)` : 'Enter denominator';

  return (
    <CalculatorShell title="Fraction Simplifier" result={resultText} onCalculate={() => {}} presets={presets} accent="emerald" downloadData={d ? JSON.stringify({ numerator: n, denominator: d, simplified: simple, decimal: parseFloat(decimal), percent: parseFloat(percent) }, null, 2) : ''} downloadFilename="fraction.json">
      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <label className={labelClass}>Numerator</label>
            <input type="number" value={num} onChange={e => setNum(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <span className="text-xl font-bold">/</span>
          <div className="flex-1">
            <label className={labelClass}>Denominator</label>
            <input type="number" value={den} onChange={e => setDen(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
        </div>

        {d && (
          <div className="space-y-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">Simplified</div>
              <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">${simple}</div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 text-center">
                <div className="text-xs text-[var(--text-secondary)]">Decimal</div>
                <div className="text-lg font-bold text-[var(--text-primary)] font-mono">${decimal}</div>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 text-center">
                <div className="text-xs text-[var(--text-secondary)]">Percentage</div>
                <div className="text-lg font-bold text-[var(--text-primary)] font-mono">${percent}%</div>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 text-center">
                <div className="text-xs text-[var(--text-secondary)]">GCD</div>
                <div className="text-lg font-bold text-[var(--text-primary)]">${g}</div>
              </div>
            </div>
          </div>
        )}

        {d && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Step by Step</div>
            <div className="font-mono text-sm text-[var(--text-primary)] space-y-1">
              <div>${n}/${d} = (${n}/${g}) / (${d}/${g}) = ${simple}</div>
              <div className="text-[var(--text-secondary)]">GCD(${Math.abs(n)}, ${Math.abs(d)}) = ${g}</div>
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
// --- FractionToDecimalCalculator ---
export function FractionToDecimalCalculator() {
  const clr = ac('FractionToDecimalCalculator');
  const [num, setNum] = useState('3');
  const [den, setDen] = useState('4');
  const n = Number(num), d = Number(den);
  const decimal = d ? n / d : NaN;
  const percent = d ? (n / d * 100).toFixed(2) : '—';

  const presets = [
    { label: '1/2', apply: () => { setNum('1'); setDen('2'); } },
    { label: '3/4', apply: () => { setNum('3'); setDen('4'); } },
    { label: '5/8', apply: () => { setNum('5'); setDen('8'); } },
    { label: '22/7', apply: () => { setNum('22'); setDen('7'); } },
  ];

  const resultText = d ? `${n}/${d} = ${decimal.toFixed(6)} (${percent}%)` : 'Enter denominator';

  return (
    <CalculatorShell title="Fraction to Decimal" result={resultText} onCalculate={() => {}} presets={presets} accent="blue" downloadData={d ? JSON.stringify({ fraction: `${n}/${d}`, decimal, percent: parseFloat(percent) }, null, 2) : ''} downloadFilename="fraction-decimal.json">
      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <label className={labelClass}>Numerator</label>
            <input type="number" value={num} onChange={e => setNum(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
          </div>
          <span className="text-xl font-bold">/</span>
          <div className="flex-1">
            <label className={labelClass}>Denominator</label>
            <input type="number" value={den} onChange={e => setDen(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
          </div>
        </div>

        {d && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Decimal Value</div>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 font-mono">${decimal.toFixed(6)}</div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">${percent}%</div>
          </div>
        )}

        {d && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Equivalent Fractions</div>
            <div className="flex flex-wrap gap-2">
              {[
                Math.round(n * 2) + '/' + Math.round(d * 2),
                Math.round(n * 3) + '/' + Math.round(d * 3),
                Math.round(n * 4) + '/' + Math.round(d * 4),
                Math.round(n * 5) + '/' + Math.round(d * 5),
              ].map(f => (
                <span key={f} className="px-2 py-1 bg-[var(--bg-overlay)] rounded-lg text-sm font-mono">${f}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
// --- DecimalToFractionCalculator ---
export function DecimalToFractionCalculator() {
  const clr = ac('DecimalToFractionCalculator');
  const [dec, setDec] = useState('0.75');
  const [precision, setPrecision] = useState(1000000);
  const d = parseFloat(dec);
  const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
  const getFraction = (v: number, prec: number) => {
    if (isNaN(v)) return { n: 0, d: 0 };
    const n = Math.round(v * prec);
    const g = gcd(n, prec);
    return { n: n / g, d: prec / g };
  };
  const f = isNaN(d) ? { n: 0, d: 0 } : getFraction(d, precision);
  const decimalVal = f.d ? f.n / f.d : 0;
  const error = f.d ? Math.abs(d - decimalVal) : 0;

  const presets = [
    { label: '0.75', apply: () => setDec('0.75') },
    { label: '0.333...', apply: () => setDec('0.3333333333') },
    { label: '0.142857', apply: () => setDec('0.142857142857') },
    { label: 'π - 3', apply: () => setDec((Math.PI - 3).toFixed(10)) },
  ];

  const resultText = f.d ? `${dec} ≈ ${f.n}/${f.d} (error: ${error.toExponential(2)})` : 'Enter decimal';

  return (
    <CalculatorShell title="Decimal to Fraction" result={resultText} onCalculate={() => {}} presets={presets} accent="amber" downloadData={f.d ? JSON.stringify({ decimal: d, fraction: `${f.n}/${f.d}`, error }, null, 2) : ''} downloadFilename="decimal-fraction.json">
      <div className="space-y-4">
        <label className={labelClass}>Decimal Value</label>
        <input type="text" value={dec} onChange={e => setDec(e.target.value)} placeholder="0.75"
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />

        {f.d && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
            <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">Fraction</div>
            <div className="text-3xl font-bold text-amber-700 dark:text-amber-300 font-mono">${f.n}/${f.d}</div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">≈ ${decimalVal.toFixed(10)} (error: ${error.toExponential(2)})</div>
          </div>
        )}

        {f.d && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Precision</div>
            <input type="range" min={10} max={100000000} step={10} value={precision} onChange={e => setPrecision(Number(e.target.value))}
              className="w-full accent-amber-500 mb-2" />
            <div className="text-xs text-[var(--text-muted)]">Precision: ${precision.toLocaleString()}</div>
          </div>
        )}

        {f.d && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Continued Fraction Approximations</div>
            <div className="flex flex-wrap gap-2">
              {[
                { prec: 10, label: '10' },
                { prec: 100, label: '100' },
                { prec: 1000, label: '1,000' },
                { prec: 10000, label: '10,000' },
                { prec: 100000, label: '100,000' },
                { prec: 1000000, label: '1,000,000' },
              ].map(p => {
                const fr = getFraction(d, p.prec);
                return (
                  <span key={p.prec} className="px-2 py-1 bg-[var(--bg-overlay)] rounded-lg text-xs font-mono ${p.prec === precision ? 'bg-amber-500/20 ring-1 ring-amber-500' : ''}">
                    ${fr.n}/${fr.d} (${p.label})
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
// --- RatioSimplifier ---
export function RatioSimplifier() {
  const clr = ac('RatioSimplifier');
  const [a, setA] = useState('12');
  const [b, setB] = useState('18');
  const gcd = (x: number, y: number): number => y ? gcd(y, x % y) : x;
  const n1 = Number(a), n2 = Number(b);
  const g = n1 && n2 ? gcd(n1, n2) : 0;
  const simple = g ? `${n1/g}:${n2/g}` : 'Invalid';
  const fraction = n2 ? n1 / n2 : NaN;
  const percent = n2 ? (n1 / n2 * 100).toFixed(2) : '—';

  const presets = [
    { label: '12:18', apply: () => { setA('12'); setB('18'); } },
    { label: '15:25', apply: () => { setA('15'); setB('25'); } },
    { label: '100:250', apply: () => { setA('100'); setB('250'); } },
    { label: '7:3', apply: () => { setA('7'); setB('3'); } },
  ];

  const resultText = g ? `${n1}:${n2} = ${simple} = ${fraction.toFixed(4)} (${percent}%)` : 'Enter both values';

  return (
    <CalculatorShell title="Ratio Simplifier" result={resultText} onCalculate={() => {}} presets={presets} accent="violet" downloadData={g ? JSON.stringify({ a: n1, b: n2, simplified: simple, fraction, percent: parseFloat(percent) }, null, 2) : ''} downloadFilename="ratio.json">
      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <label className={labelClass}>First</label>
            <input type="number" value={a} onChange={e => setA(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
          </div>
          <span className="text-xl font-bold">:</span>
          <div className="flex-1">
            <label className={labelClass}>Second</label>
            <input type="number" value={b} onChange={e => setB(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
          </div>
        </div>

        {g && (
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 text-center">
            <div className="text-xs text-violet-600 dark:text-violet-400 font-medium mb-1">Simplified Ratio</div>
            <div className="text-3xl font-bold text-violet-700 dark:text-violet-300">${simple}</div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">Fraction: ${fraction.toFixed(4)} (${percent}%)</div>
          </div>
        )}

        {g && (
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[var(--bg-surface)] rounded-xl p-2.5 text-center">
              <div className="text-xs text-[var(--text-secondary)]">GCD</div>
              <div className="text-sm font-bold text-[var(--text-primary)]">${g}</div>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-2.5 text-center">
              <div className="text-xs text-[var(--text-secondary)]">Fraction</div>
              <div className="text-sm font-bold text-[var(--text-primary)] font-mono">${fraction.toFixed(4)}</div>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-2.5 text-center">
              <div className="text-xs text-[var(--text-secondary)]">Percentage</div>
              <div className="text-sm font-bold text-[var(--text-primary)]">${percent}%</div>
            </div>
          </div>
        )}

        {g && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Equivalent Ratios</div>
            <div className="flex flex-wrap gap-2">
              {[2, 3, 4, 5, 10, 100].map(m => (
                <span key={m} className="px-2 py-1 bg-[var(--bg-overlay)] rounded-lg text-sm font-mono">${n1*m}:${n2*m}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
// --- ProportionalCalculator ---
export function ProportionalCalculator() {
  const clr = ac('ProportionalCalculator');
  const [a, setA] = useState('2');
  const [b, setB] = useState('4');
  const [c, setC] = useState('6');
  const na = Number(a), nb = Number(b), nc = Number(c);
  const d = na ? (nb * nc / na) : 0;
  const ratio = na ? nb / na : NaN;

  const presets = [
    { label: '2:4 = 6:x', apply: () => { setA('2'); setB('4'); setC('6'); } },
    { label: '3:5 = 9:x', apply: () => { setA('3'); setB('5'); setC('9'); } },
    { label: '10:15 = 20:x', apply: () => { setA('10'); setB('15'); setC('20'); } },
    { label: '0.5:1.5 = 2:x', apply: () => { setA('0.5'); setB('1.5'); setC('2'); } },
  ];

  const resultText = na ? `${na}:${nb} = ${nc}:${d.toFixed(4)}` : 'Enter first value';

  return (
    <CalculatorShell title="Proportional Calculator" result={resultText} onCalculate={() => {}} presets={presets} accent="cyan" downloadData={na ? JSON.stringify({ a: na, b: nb, c: nc, d: d.toFixed(4), ratio: ratio.toFixed(4) }, null, 2) : ''} downloadFilename="proportion.json">
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-2 items-end">
          <div>
            <label className={labelClass}>a</label>
            <input type="number" step="any" value={a} onChange={e => setA(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" />
          </div>
          <div>
            <label className={labelClass}>b</label>
            <input type="number" step="any" value={b} onChange={e => setB(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" />
          </div>
          <div>
            <label className={labelClass}>c</label>
            <input type="number" step="any" value={c} onChange={e => setC(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" />
          </div>
          <span className="text-xl font-bold text-[var(--text-secondary)]">= d</span>
        </div>

        {na && (
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 text-center">
            <div className="text-xs text-cyan-600 dark:text-cyan-400 font-medium mb-1">Result: d</div>
            <div className="text-3xl font-bold text-cyan-700 dark:text-cyan-300 font-mono">${d.toFixed(4)}</div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">Ratio b/a = ${ratio.toFixed(4)}</div>
          </div>
        )}

        {na && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Proportion</div>
            <div className="font-mono text-sm text-[var(--text-primary)] space-y-1">
              <div>${na} : ${nb} = ${nc} : ${d.toFixed(4)}</div>
              <div className="text-[var(--text-secondary)]">d = c × (b/a) = ${nc} × ${ratio.toFixed(4)} = ${d.toFixed(4)}</div>
            </div>
          </div>
        )}

        {na && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[var(--bg-surface)] rounded-xl p-2.5 text-center">
              <div className="text-xs text-[var(--text-secondary)]">Multiplier</div>
              <div className="text-sm font-bold text-[var(--text-primary)]">${ratio.toFixed(4)}</div>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-2.5 text-center">
              <div className="text-xs text-[var(--text-secondary)]">Inverse</div>
              <div className="text-sm font-bold text-[var(--text-primary)]">${(1/ratio).toFixed(4)}</div>
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
// --- RuleOfThreeCalculator ---
export function RuleOfThreeCalculator() {
  const clr = ac('RuleOfThreeCalculator');
  const [a, setA] = useState('2');
  const [b, setB] = useState('4');
  const [c, setC] = useState('6');
  const na = Number(a), nb = Number(b), nc = Number(c);
  const x = na ? (nb * nc / na) : 0;

  const presets = [
    { label: '2 is to 4 as 6 is to x', apply: () => { setA('2'); setB('4'); setC('6'); } },
    { label: '3 is to 5 as 10 is to x', apply: () => { setA('3'); setB('5'); setC('10'); } },
    { label: '10 is to 15 as 30 is to x', apply: () => { setA('10'); setB('15'); setC('30'); } },
    { label: '0.5 is to 1.5 as 2 is to x', apply: () => { setA('0.5'); setB('1.5'); setC('2'); } },
  ];

  const resultText = na ? `${na} : ${nb} :: ${nc} : ${x.toFixed(4)}` : 'Enter first value';

  return (
    <CalculatorShell title="Rule of Three" result={resultText} onCalculate={() => {}} presets={presets} accent="orange" downloadData={na ? JSON.stringify({ a: na, b: nb, c: nc, x: x.toFixed(4) }, null, 2) : ''} downloadFilename="rule-of-three.json">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className={labelClass}>a (is to)</label>
            <input type="number" step="any" value={a} onChange={e => setA(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
          </div>
          <div>
            <label className={labelClass}>b (as)</label>
            <input type="number" step="any" value={b} onChange={e => setB(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
          </div>
          <div>
            <label className={labelClass}>c (is to)</label>
            <input type="number" step="any" value={c} onChange={e => setC(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-lg font-bold">
          <span className="text-[var(--text-secondary)]">x =</span>
          <span className="text-2xl font-mono font-bold text-orange-600 dark:text-orange-400">${x.toFixed(4)}</span>
        </div>

        {na && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
            <div className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">Rule of Three</div>
            <div className="font-mono text-sm text-[var(--text-secondary)] mb-2">${na} : ${nb} :: ${nc} : ${x.toFixed(4)}</div>
            <div className="text-sm text-[var(--text-primary)]">${nc} × ${nb} / ${na} = ${x.toFixed(4)}</div>
          </div>
        )}

        <div className="bg-[var(--bg-surface)] rounded-xl p-3">
          <div className="text-xs text-[var(--text-secondary)] mb-2">Variations</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="p-2 bg-[var(--bg-overlay)] rounded-lg">
              <div className="text-xs text-[var(--text-muted)]">Direct (a:b = c:x)</div>
              <div className="font-mono">${x.toFixed(4)}</div>
            </div>
            <div className="p-2 bg-[var(--bg-overlay)] rounded-lg">
              <div className="text-xs text-[var(--text-muted)]">Inverse (a:b = x:c)</div>
              <div className="font-mono">${(na * nc / nb).toFixed(4)}</div>
            </div>
          </div>
        </div>
      </div>
    </CalculatorShell>
  );
}
// --- CombinationCalculator ---
export function CombinationCalculator() {
  const clr = ac('CombinationCalculator');
  const [n, setN] = useState('5');
  const [r, setR] = useState('3');

  const fact = (x: number): number => x <= 1 ? 1 : x * fact(x - 1);
  const nn = Number(n) || 0;
  const rr = Number(r) || 0;
  const valid = nn >= 0 && rr >= 0 && rr <= nn;
  const c = valid ? fact(nn) / (fact(rr) * fact(nn - rr)) : NaN;
  const p = valid ? fact(nn) / fact(nn - rr) : NaN;

  const swap = () => { setN(r); setR(n); };

  const presets = [
    { label: 'Lottery 6/49', apply: () => { setN('49'); setR('6'); } },
    { label: 'Poker 5/52', apply: () => { setN('52'); setR('5'); } },
    { label: 'Committee 3 from 10', apply: () => { setN('10'); setR('3'); } },
    { label: 'Team 5 from 20', apply: () => { setN('20'); setR('5'); } },
    { label: 'Pick 2 from 8', apply: () => { setN('8'); setR('2'); } },
  ];

  const resultText = valid
    ? `C(${nn}, ${rr}) = ${isFinite(c) ? c.toLocaleString() : '∞'} | P(${nn}, ${rr}) = ${isFinite(p) ? p.toLocaleString() : '∞'}`
    : 'Enter valid n ≥ r ≥ 0';

  const maxDisplay = 20;
  const displayN = Math.min(nn, maxDisplay);
  const displayR = Math.min(rr, maxDisplay);

  return (
    <CalculatorShell
      title="Combinations & Permutations"
      result={resultText}
      onCalculate={() => {}}
      presets={presets}
      accent="violet"
    >
      <div className="space-y-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className={labelClass}>n (total items)</label>
            <input type="number" min="0" value={n} onChange={e => setN(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
          </div>
          <button onClick={swap} className="px-3 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors text-sm" title="Swap n and r">⇄</button>
          <div className="flex-1">
            <label className={labelClass}>r (choose)</label>
            <input type="number" min="0" value={r} onChange={e => setR(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
          </div>
        </div>

        {valid && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 text-center">
                <div className="text-xs text-violet-600 dark:text-violet-400 font-medium mb-1">C(n, r) — Combinations</div>
                <div className="text-2xl font-bold text-violet-700 dark:text-violet-300">
                  {isFinite(c) ? c.toLocaleString() : '∞'}
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">Order doesn&apos;t matter</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">P(n, r) — Permutations</div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {isFinite(p) ? p.toLocaleString() : '∞'}
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">Order matters</div>
              </div>
            </div>

            {nn > 0 && nn <= maxDisplay && (
              <div className="bg-[var(--bg-surface)] rounded-xl p-3">
                <div className="text-xs text-[var(--text-secondary)] mb-2">Formula</div>
                <div className="font-mono text-sm text-[var(--text-primary)]">
                  <span className="text-violet-600 dark:text-violet-400">C({nn}, {rr})</span>
                  {' = '}
                  <span className="text-[var(--text-secondary)]">{nn}! / ({rr}! × {nn - rr}!) = </span>
                  <span className="font-bold">{isFinite(c) ? c.toLocaleString() : '∞'}</span>
                </div>
              </div>
            )}

            {nn > 0 && nn <= 12 && (
              <div className="bg-[var(--bg-surface)] rounded-xl p-3">
                <div className="text-xs text-[var(--text-secondary)] mb-2">All C({nn}, r) values</div>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: displayN + 1 }, (_, i) => {
                    const val = fact(nn) / (fact(i) * fact(nn - i));
                    const isActive = i === rr;
                    return (
                      <span key={i} className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono transition-colors ${isActive ? 'bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-500/30' : 'bg-[var(--bg-overlay)] text-[var(--text-secondary)]'}`}>
                        <span className="text-[var(--text-secondary)]">{nn},{i}</span>
                        <span className={isActive ? 'font-bold' : ''}>{isFinite(val) ? val.toLocaleString() : '∞'}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {!valid && nn > 0 && rr > nn && (
          <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
            r ({rr}) cannot be greater than n ({nn})
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
// --- PermutationCalculator ---
export function PermutationCalculator() {
  const clr = ac('PermutationCalculator');
  const [n, setN] = useState('5');
  const [r, setR] = useState('3');
  const fact = (x: number): number => x <= 1 ? 1 : x * fact(x - 1);
  const nn = Number(n), rr = Number(r);
  const p = fact(nn) / fact(nn - rr);
  return (
    <Section title="Permutations (nPr)">
      <div className="flex gap-2 items-center">
        <Input label="n" type="number" value={n} onChange={setN} placeholder="n" />
        <Input label="r" type="number" value={r} onChange={setR} placeholder="r" />
      </div>
      <div className="text-lg font-bold">P({nn}, {rr}) = {isFinite(p) ? p.toFixed(0) : 'N/A'}</div>
    </Section>
  );
}
// --- FactorialCalculator ---
export function FactorialCalculator() {
  const clr = ac('FactorialCalculator');
  const [n, setN] = useState('5');
  const fact = (x: number): number => x <= 1 ? 1 : x * fact(x - 1);
  const nn = Number(n) || 0;
  const valid = nn >= 0 && nn <= 170;
  const result = valid ? fact(nn) : 0;
  const digits = valid ? result.toString().length : 0;

  const presets = [
    { label: '0!', apply: () => setN('0') },
    { label: '5!', apply: () => setN('5') },
    { label: '10!', apply: () => setN('10') },
    { label: '20!', apply: () => setN('20') },
    { label: '50!', apply: () => setN('50') },
  ];

  const resultText = valid ? `${nn}! = ${result.toLocaleString()} (${digits} digits)` : (nn > 170 ? 'Max supported: 170' : 'Enter 0-170');

  return (
    <CalculatorShell title="Factorial Calculator" result={resultText} onCalculate={() => {}} presets={presets} accent="violet" downloadData={valid ? `factorial(${nn}) = ${result}` : ''} downloadFilename="factorial.txt">
      <div className="space-y-4">
        <label className={labelClass}>Non-negative integer (0-170)</label>
        <input type="number" min={0} max={170} value={n} onChange={e => setN(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50" />

        {valid && (
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 text-center">
            <div className="text-xs text-violet-600 dark:text-violet-400 font-medium mb-1">Result</div>
            <div className="text-2xl font-bold text-violet-700 dark:text-violet-300 font-mono break-all">{result.toLocaleString()}</div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">${digits} digits</div>
          </div>
        )}

        {valid && nn <= 20 && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-secondary)] mb-2">All factorials up to ${nn}</div>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto">
              {Array.from({ length: nn + 1 }, (_, i) => {
                const f = i <= 1 ? 1 : Array.from({ length: i }, (_, j) => j + 1).reduce((a, b) => a * b, 1);
                return (
                  <div key={i} className="p-2 bg-[var(--bg-overlay)] rounded-lg text-sm font-mono">
                    <span className="text-[var(--text-secondary)]">${i}! =</span>
                    <span className="font-bold">${f.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {valid && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Formula</div>
            <div className="font-mono text-sm text-[var(--text-primary)]">
              ${nn}! = ${Array.from({ length: nn }, (_, i) => i + 1).join(' × ')}
            </div>
          </div>
        )}

        {!valid && nn > 170 && (
          <div className="text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
            Factorials above 170 exceed JavaScript's safe integer range. Maximum supported: 170.
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
// --- PrimeNumberChecker ---
export function PrimeNumberChecker() {
  const clr = ac('PrimeNumberChecker');
  const [n, setN] = useState('17');
  const nn = Number(n) || 0;
  const isPrime = (x: number) => { if (x < 2) return false; for (let i = 2; i * i <= x; i++) { if (x % i === 0) return false; } return true; };
  const factors = (x: number) => { const f: number[] = []; let d = 2; while (x > 1) { while (x % d === 0) { f.push(d); x /= d; } d++; } return f; };
  const prime = nn >= 2 && isPrime(nn);
  const factorList = nn >= 2 ? factors(nn) : [];

  const presets = [
    { label: '2', apply: () => setN('2') },
    { label: '17', apply: () => setN('17') },
    { label: '97', apply: () => setN('97') },
    { label: '100', apply: () => setN('100') },
    { label: '997', apply: () => setN('997') },
    { label: '104729', apply: () => setN('104729') },
  ];

  const nearestPrimes = (() => {
    if (nn < 2) return { below: null, above: 2 };
    let below = nn, above = nn;
    while (below > 2 && !isPrime(below)) below--;
    while (!isPrime(above)) above++;
    if (below === nn && prime) { let b = nn - 1; while (b > 2 && !isPrime(b)) below = b--; }
    return { below: below !== nn ? below : null, above: above !== nn ? above : null };
  })();

  const resultText = nn < 2 ? `${nn} is less than 2` : prime ? `${nn} is prime` : `${nn} = ${factorList.join(' × ')}`;

  return (
    <CalculatorShell title="Prime Number Checker" result={resultText} onCalculate={() => {}} presets={presets} accent="emerald">
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Number</label>
          <input type="number" min={0} value={n} onChange={e => setN(e.target.value)}
            className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
        </div>

        {nn >= 2 && (
          <div className={`p-4 rounded-xl border ${prime ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
            <div className="flex items-center gap-3">
              <span className={`text-4xl ${prime ? 'text-emerald-500' : 'text-rose-500'}`}>{prime ? '✓' : '✗'}</span>
              <div>
                <div className={`text-lg font-bold ${prime ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                  {nn} is {prime ? 'prime' : 'not prime'}
                </div>
                {!prime && factorList.length > 0 && (
                  <div className="text-sm text-[var(--text-secondary)] mt-1">
                    {nn} = {factorList.join(' × ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {nn >= 2 && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 text-center">
              <div className="text-xs text-[var(--text-secondary)]">Prime?</div>
              <div className={`text-sm font-bold ${prime ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{prime ? 'Yes' : 'No'}</div>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 text-center">
              <div className="text-xs text-[var(--text-secondary)]">Factor Count</div>
              <div className="text-sm font-bold text-[var(--text-primary)]">{factorList.length}</div>
            </div>
          </div>
        )}

        {nn >= 2 && !prime && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Prime Factorization</div>
            <div className="font-mono text-sm text-[var(--text-primary)]">
              {nn} = {factorList.map((f, i) => (
                <span key={i}>
                  {i > 0 && <span className="text-[var(--text-secondary)]"> × </span>}
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{f}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {nn >= 2 && (nearestPrimes.below !== null || nearestPrimes.above !== null) && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Nearest Primes</div>
            <div className="flex gap-2">
              {nearestPrimes.below !== null && (
                <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-mono">{nearestPrimes.below}</span>
              )}
              {!prime && <span className="text-xs text-[var(--text-secondary)] self-center">← {nn} →</span>}
              {nearestPrimes.above !== null && nearestPrimes.above !== nn && (
                <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-mono">{nearestPrimes.above}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
// --- PrimeFactorizationCalculator ---
export function PrimeFactorizationCalculator() {
  const clr = ac('PrimeFactorizationCalculator');
  const [n, setN] = useState('84');
  const nn = Number(n) || 0;
  const factors = (x: number) => { const f: number[] = []; let d = 2; while (x > 1) { while (x % d === 0) { f.push(d); x /= d; } d++; } return f; };
  const f = nn >= 2 ? factors(nn) : [];
  const uniqueFactors = [...new Set(f)];
  const factorCounts = uniqueFactors.map(p => ({ prime: p, count: f.filter(x => x === p).length }));

  const presets = [
    { label: '84', apply: () => setN('84') },
    { label: '100', apply: () => setN('100') },
    { label: '1000', apply: () => setN('1000') },
    { label: '997 (prime)', apply: () => setN('997') },
    { label: '720720', apply: () => setN('720720') },
  ];

  const resultText = nn >= 2 ? `${nn} = ${factorCounts.map(fc => fc.count > 1 ? `${fc.prime}^${fc.count}` : fc.prime).join(' × ')}` : 'Enter number ≥ 2';

  return (
    <CalculatorShell title="Prime Factorization" result={resultText} onCalculate={() => {}} presets={presets} accent="blue" downloadData={nn >= 2 ? JSON.stringify({ number: nn, factors: factorCounts }, null, 2) : ''} downloadFilename="factors.json">
      <div className="space-y-4">
        <label className={labelClass}>Number (≥ 2)</label>
        <input type="number" min={2} value={n} onChange={e => setN(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />

        {nn >= 2 && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Factorization</div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 font-mono break-all">
              ${nn} = ${factorCounts.map(fc => fc.count > 1 ? `${fc.prime}<sup>${fc.count}</sup>` : fc.prime).join(' × ')}
            </div>
          </div>
        )}

        {nn >= 2 && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Prime Factors Detail</div>
            <div className="space-y-1.5">
              {factorCounts.map(fc => (
                <div key={fc.prime} className="flex items-center justify-between p-2 bg-[var(--bg-overlay)] rounded-lg">
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">${fc.prime}</span>
                  <span className="text-sm text-[var(--text-secondary)]">
                    ${fc.count > 1 ? `^${fc.count} (${fc.prime} × ${' × '.repeat(fc.count - 1)}${fc.prime})` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {nn >= 2 && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[var(--bg-surface)] rounded-xl p-2.5 text-center">
              <div className="text-xs text-[var(--text-secondary)]">Unique Primes</div>
              <div className="text-sm font-bold text-[var(--text-primary)]">${uniqueFactors.length}</div>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-2.5 text-center">
              <div className="text-xs text-[var(--text-secondary)]">Total Factors</div>
              <div className="text-sm font-bold text-[var(--text-primary)]">${f.length}</div>
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
// --- GreatestCommonFactorCalculator ---
export function GreatestCommonFactorCalculator() {
  const clr = ac('GreatestCommonFactorCalculator');
  const [a, setA] = useState('12');
  const [b, setB] = useState('18');
  const gcd = (x: number, y: number): number => y ? gcd(y, x % y) : x;
  const na = Number(a), nb = Number(b);
  const result = gcd(na, nb);

  const presets = [
    { label: '12 & 18', apply: () => { setA('12'); setB('18'); } },
    { label: '24 & 36', apply: () => { setA('24'); setB('36'); } },
    { label: '48 & 180', apply: () => { setA('48'); setB('180'); } },
    { label: '100 & 75', apply: () => { setA('100'); setB('75'); } },
    { label: '81 & 153', apply: () => { setA('81'); setB('153'); } },
  ];

  const resultText = `GCF(${na}, ${nb}) = ${result}`;

  const steps = (() => {
    const s: string[] = [];
    let x = na, y = nb;
    while (y) {
      const q = Math.floor(x / y);
      const r = x % y;
      s.push(`${x} = ${y} × ${q} + ${r}`);
      [x, y] = [y, r];
    }
    return s;
  })();

  return (
    <CalculatorShell title="GCF / GCD Calculator" result={resultText} onCalculate={() => {}} presets={presets} accent="blue">
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className={labelClass}>First number</label>
            <input type="number" min={0} value={a} onChange={e => setA(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
          </div>
          <div className="flex-1">
            <label className={labelClass}>Second number</label>
            <input type="number" min={0} value={b} onChange={e => setB(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
          </div>
        </div>

        {na > 0 && nb > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Greatest Common Factor</div>
            <div className="text-4xl font-bold text-blue-700 dark:text-blue-300">{result}</div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">Largest integer dividing both numbers</div>
          </div>
        )}

        {na > 0 && nb > 0 && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Euclidean Algorithm Steps</div>
            <div className="font-mono text-sm space-y-1 text-[var(--text-primary)]">
              {steps.map((step, i) => (
                <div key={i} className={i === steps.length - 1 ? 'font-bold text-emerald-600 dark:text-emerald-400' : ''}>
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {na > 0 && nb > 0 && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[var(--bg-surface)] rounded-xl p-2.5 text-center">
              <div className="text-xs text-[var(--text-secondary)]">Are coprime?</div>
              <div className={`text-sm font-bold ${result === 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {result === 1 ? 'Yes' : 'No'}
              </div>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-2.5 text-center">
              <div className="text-xs text-[var(--text-secondary)]">LCM</div>
              <div className="text-sm font-bold text-[var(--text-primary)]">
                {na && nb ? (na * nb / result).toLocaleString() : '—'}
              </div>
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
// --- LeastCommonMultipleCalculator ---
export function LeastCommonMultipleCalculator() {
  const clr = ac('LeastCommonMultipleCalculator');
  const [a, setA] = useState('4');
  const [b, setB] = useState('6');
  const gcd = (x: number, y: number): number => y ? gcd(y, x % y) : x;
  const lcm = (x: number, y: number) => x && y ? (x * y) / gcd(x, y) : 0;
  const na = Number(a), nb = Number(b);
  const result = lcm(na, nb);

  const presets = [
    { label: '4 & 6', apply: () => { setA('4'); setB('6'); } },
    { label: '6 & 8', apply: () => { setA('6'); setB('8'); } },
    { label: '12 & 18', apply: () => { setA('12'); setB('18'); } },
    { label: '15 & 25', apply: () => { setA('15'); setB('25'); } },
    { label: '7 & 11', apply: () => { setA('7'); setB('11'); } },
  ];

  const resultText = `LCM(${na}, ${nb}) = ${result}`;

  return (
    <CalculatorShell title="LCM Calculator" result={resultText} onCalculate={() => {}} presets={presets} accent="violet">
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className={labelClass}>First number</label>
            <input type="number" min={0} value={a} onChange={e => setA(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
          </div>
          <div className="flex-1">
            <label className={labelClass}>Second number</label>
            <input type="number" min={0} value={b} onChange={e => setB(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
          </div>
        </div>

        {na > 0 && nb > 0 && (
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 text-center">
            <div className="text-xs text-violet-600 dark:text-violet-400 font-medium mb-1">Least Common Multiple</div>
            <div className="text-4xl font-bold text-violet-700 dark:text-violet-300">{result.toLocaleString()}</div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">Smallest positive multiple of both numbers</div>
          </div>
        )}

        {na > 0 && nb > 0 && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Formula</div>
            <div className="font-mono text-sm text-[var(--text-primary)] space-y-1">
              <div>LCM(a, b) = |a × b| / GCF(a, b)</div>
              <div className="text-[var(--text-secondary)]">{na} × {nb} / {gcd(na, nb)} = {result}</div>
            </div>
          </div>
        )}

        {na > 0 && nb > 0 && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[var(--bg-surface)] rounded-xl p-2.5 text-center">
              <div className="text-xs text-[var(--text-secondary)]">GCF</div>
              <div className="text-sm font-bold text-[var(--text-primary)]">{gcd(na, nb)}</div>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-2.5 text-center">
              <div className="text-xs text-[var(--text-secondary)]">Product</div>
              <div className="text-sm font-bold text-[var(--text-primary)]">{na * nb}</div>
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
// --- ModuloCalculator ---
export function ModuloCalculator() {
  const clr = ac('ModuloCalculator');
  const [a, setA] = useState('17');
  const [b, setB] = useState('5');
  const na = Number(a), nb = Number(b);

  // JavaScript mod (truncates toward zero)
  const jsMod = nb !== 0 ? na % nb : NaN;
  const jsQuotient = nb !== 0 ? Math.floor(na / nb) : NaN;

  // Python/Floored mod (always positive remainder)
  const pyMod = nb !== 0 ? ((na % nb) + nb) % nb : NaN;
  const pyQuotient = nb !== 0 ? Math.floor(na / nb) : NaN;

  const differs = nb !== 0 && jsMod !== pyMod && na < 0;

  const presets = [
    { label: '17 mod 5', apply: () => { setA('17'); setB('5'); } },
    { label: '-17 mod 5', apply: () => { setA('-17'); setB('5'); } },
    { label: '23 mod 7', apply: () => { setA('23'); setB('7'); } },
    { label: '-23 mod 7', apply: () => { setA('-23'); setB('7'); } },
    { label: '100 mod 3', apply: () => { setA('100'); setB('3'); } },
  ];

  const resultText = nb !== 0
    ? `${na} mod ${nb} = ${jsMod} (JS)${differs ? ` / ${pyMod} (Python)` : ''}`
    : 'Divisor cannot be zero';

  return (
    <CalculatorShell title="Modulo Calculator" result={resultText} onCalculate={() => {}} presets={presets} accent="emerald">
      <div className="space-y-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className={labelClass}>Dividend (a)</label>
            <input type="number" value={a} onChange={e => setA(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <span className="text-sm font-bold self-center">mod</span>
          <div className="flex-1">
            <label className={labelClass}>Divisor (b)</label>
            <input type="number" min={1} value={b} onChange={e => setB(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
        </div>

        {nb !== 0 && (
          <div className="space-y-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">JavaScript / C-style</div>
              <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{na} mod {nb} = {jsMod}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Truncates toward zero</div>
            </div>

            {differs && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">Python / Floored (mathematical)</div>
                <div className="text-3xl font-bold text-amber-700 dark:text-amber-300">{na} mod {nb} = {pyMod}</div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">Floors toward −∞ (always non-negative)</div>
              </div>
            )}

            <div className="bg-[var(--bg-surface)] rounded-xl p-3">
              <div className="text-xs text-[var(--text-secondary)] mb-2">Division Identity</div>
              <div className="font-mono text-sm text-[var(--text-primary)] space-y-1">
                <div>{na} = {nb} × {jsQuotient} + {jsMod} <span className="text-emerald-600 dark:text-emerald-400">(JS)</span></div>
                {differs && <div>{na} = {nb} × {pyQuotient} + {pyMod} <span className="text-amber-600 dark:text-amber-400">(Python)</span></div>}
              </div>
            </div>

            <div className="bg-[var(--bg-surface)] rounded-xl p-3">
              <div className="text-xs text-[var(--text-secondary)] mb-2">Long Division</div>
              <div className="font-mono text-xs text-[var(--text-primary)] space-y-1">
                <div>{na} ÷ {nb} = {(na / nb).toFixed(4)}</div>
                <div>Quotient (floor): {jsQuotient}</div>
                <div>Remainder: {na} − ({nb} × {jsQuotient}) = {jsMod}</div>
              </div>
            </div>
          </div>
        )}

        {nb === 0 && (
          <div className="text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
            Divisor cannot be zero
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
// --- LogarithmCalculator ---
export function LogarithmCalculator() {
  const clr = ac('LogarithmCalculator');
  const [num, setNum] = useState('100');
  const [base, setBase] = useState('10');
  const n = Number(num), b = Number(base);
  const log = Math.log(n) / Math.log(b);
  return (
    <Section title="Logarithm Calculator">
      <div className="flex gap-2 items-center">
        <span className="text-sm">log</span>
        <Input label="Value" type="number" value={base} onChange={setBase} />
        <Input label="Value" type="number" value={num} onChange={setNum} />
      </div>
      <div className="text-lg font-bold">log_{b}({n}) = {isFinite(log) ? log.toFixed(6) : 'Invalid'}</div>
      <div className="text-xs text-[var(--text-secondary)]">Natural log: {Math.log(n).toFixed(6)}</div>
    </Section>
  );
}
// --- TrigonometryCalculator ---
export function TrigonometryCalculator() {
  const clr = ac('TrigonometryCalculator');
  const [angle, setAngle] = useState('45');
  const [unit, setUnit] = useState('deg');
  const a = Number(angle);
  const rad = unit === 'deg' ? a * Math.PI / 180 : a;
  return (
    <Section title="Trigonometry Calculator">
      <div className="flex gap-2 items-center">
        <Input label="Value" type="number" value={angle} onChange={setAngle} />
        <select className={selClass} value={unit} onChange={e => setUnit(e.target.value)}>
          <option value="deg">Degrees</option><option value="rad">Radians</option>
        </select>
      </div>
      <div className="text-xs space-y-1 font-mono">
        <div>sin({a}) = {Math.sin(rad).toFixed(6)}</div>
        <div>cos({a}) = {Math.cos(rad).toFixed(6)}</div>
        <div>tan({a}) = {Math.tan(rad).toFixed(6)}</div>
        <div>csc({a}) = {1 / Math.sin(rad) < 1e10 ? (1 / Math.sin(rad)).toFixed(6) : 'inf'}</div>
        <div>sec({a}) = {1 / Math.cos(rad) < 1e10 ? (1 / Math.cos(rad)).toFixed(6) : 'inf'}</div>
        <div>cot({a}) = {1 / Math.tan(rad) < 1e10 ? (1 / Math.tan(rad)).toFixed(6) : 'inf'}</div>
      </div>
    </Section>
  );
}
// --- DegreeRadianConverter ---
export function DegreeRadianConverter() {
  const clr = ac('DegreeRadianConverter');
  const [deg, setDeg] = useState('180');
  const [rad, setRad] = useState('3.14159');
  const d2r = () => setRad(String(Number(deg) * Math.PI / 180));
  const r2d = () => setDeg(String(Number(rad) * 180 / Math.PI));

  const presets = [
    { label: '90°', apply: () => { setDeg('90'); d2r(); } },
    { label: '180°', apply: () => { setDeg('180'); d2r(); } },
    { label: '360°', apply: () => { setDeg('360'); d2r(); } },
    { label: 'π rad', apply: () => { setRad(Math.PI.toFixed(5)); r2d(); } },
    { label: '2π rad', apply: () => { setRad((2 * Math.PI).toFixed(5)); r2d(); } },
  ];

  const resultText = `Deg: ${deg}° → Rad: ${rad} rad`;

  return (
    <CalculatorShell title="Degree / Radian Converter" result={resultText} onCalculate={() => {}} presets={presets} accent="cyan" downloadData={JSON.stringify({ degrees: Number(deg), radians: Number(rad) }, null, 2)} downloadFilename="deg-rad.json">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>Degrees</label>
            <input type="number" step="any" value={deg} onChange={e => { setDeg(e.target.value); d2r(); }}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" />
          </div>
          <div>
            <label className={labelClass}>Radians</label>
            <input type="number" step="any" value={rad} onChange={e => { setRad(e.target.value); r2d(); }}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" />
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={d2r} className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-medium transition-colors flex-1">Deg → Rad</button>
          <button onClick={r2d} className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-medium transition-colors flex-1">Rad → Deg</button>
        </div>

        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 text-center">
          <div className="text-xs text-cyan-600 dark:text-cyan-400 font-medium mb-1">Conversion</div>
          <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-300 font-mono">
            ${Number(deg).toFixed(4)}° = ${Number(rad).toFixed(4)} rad
          </div>
        </div>

        <div className="bg-[var(--bg-surface)] rounded-xl p-3">
          <div className="text-xs text-[var(--text-secondary)] mb-2">Common Angles</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { deg: 30, rad: (Math.PI/6).toFixed(4) },
              { deg: 45, rad: (Math.PI/4).toFixed(4) },
              { deg: 60, rad: (Math.PI/3).toFixed(4) },
              { deg: 90, rad: (Math.PI/2).toFixed(4) },
              { deg: 180, rad: Math.PI.toFixed(4) },
              { deg: 270, rad: (3*Math.PI/2).toFixed(4) },
              { deg: 360, rad: (2*Math.PI).toFixed(4) },
            ].map(a => (
              <div key={a.deg} className="p-2 bg-[var(--bg-overlay)] rounded-lg text-center">
                <div className="font-mono">${a.deg}°</div>
                <div className="text-[var(--text-muted)]">${a.rad} rad</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CalculatorShell>
  );
}
// --- ScientificNotationConverter ---
export function ScientificNotationConverter() {
  const clr = ac('ScientificNotationConverter');
  const [input, setInput] = useState('1234000');
  const n = Number(input);
  const toScientific = (x: number) => {
    if (x === 0) return '0 x 10^0';
    const e = Math.floor(Math.log10(Math.abs(x)));
    const m = x / Math.pow(10, e);
    return m.toFixed(3) + ' x 10^' + e;
  };
  return (
    <Section title="Scientific Notation Converter">
      <Input label="Value" type="number" value={input} onChange={setInput} />
      <div className="text-sm">{isNaN(n) ? 'Invalid' : toScientific(n)}</div>
    </Section>
  );
}
// --- SignificantFiguresCalculator ---
export function SignificantFiguresCalculator() {
  const clr = ac('SignificantFiguresCalculator');
  const [input, setInput] = useState('0.00450');
  const countSigFigs = (s: string) => {
    const trimmed = s.replace(/^0+/, '');
    if (!trimmed || trimmed === '.') return 0;
    if (!trimmed.includes('.')) return trimmed.replace(/0+$/, '').length;
    return trimmed.replace(/\./g, '').length;
  };
  return (
    <Section title="Significant Figures">
      <Input label="Value" value={input} onChange={setInput} />
      <div className="text-lg font-bold">{countSigFigs(input)} significant figures</div>
    </Section>
  );
}
// --- RoundingCalculator ---
export function RoundingCalculator() {
  const clr = ac('RoundingCalculator');
  const [num, setNum] = useState('3.14159');
  const [places, setPlaces] = useState('2');
  const [mode, setMode] = useState('half-up');
  const n = Number(num);
  const p = Number(places);

  const getRounded = (mode: string) => {
    const factor = 10 ** p;
    switch (mode) {
      case 'half-up': return Math.round(n * factor) / factor;
      case 'half-even': {
        const floor = Math.floor(n * factor) / factor;
        const ceil = Math.ceil(n * factor) / factor;
        const diffFloor = n - floor;
        const diffCeil = ceil - n;
        if (diffFloor < diffCeil) return floor;
        if (diffCeil < diffFloor) return ceil;
        const floorScaled = Math.floor(n * factor);
        return (floorScaled % 2 === 0 ? floorScaled : floorScaled) / factor;
      }
      case 'floor': return Math.floor(n * factor) / factor;
      case 'ceil': return Math.ceil(n * factor) / factor;
      case 'truncate': return Math.trunc(n * factor) / factor;
      default: return n;
    }
  };

  const result = getRounded(mode);
  const digit = (() => {
    const str = Math.abs(n).toString();
    const dotIdx = str.indexOf('.');
    if (dotIdx === -1) return null;
    const idx = dotIdx + 1 + p;
    return idx < str.length ? Number(str[idx]) : null;
  })();

  const presets = [
    { label: 'π → 2dp', apply: () => { setNum(Math.PI.toString()); setPlaces('2'); } },
    { label: 'e → 3dp', apply: () => { setNum(Math.E.toString()); setPlaces('3'); } },
    { label: '-3.14159 → 2dp', apply: () => { setNum('-3.14159'); setPlaces('2'); } },
    { label: '123.456 → 0dp', apply: () => { setNum('123.456'); setPlaces('0'); } },
    { label: '0.00456 → 2sf', apply: () => { setNum('0.00456'); setPlaces('2'); setMode('half-up'); } },
  ];

  const resultText = `${n} → ${result} (${mode.replace('-', ' ')})`;

  const modeLabels: Record<string, string> = {
    'half-up': 'Round Half Up',
    'half-even': "Banker's Rounding",
    'floor': 'Floor (↓)',
    'ceil': 'Ceil (↑)',
    'truncate': 'Truncate',
  };

  const modeDescriptions: Record<string, string> = {
    'half-up': 'Rounds away from zero at midpoint (≥ 5 rounds up)',
    'half-even': 'Rounds to nearest even at midpoint (banker\'s rounding)',
    'floor': 'Always rounds toward −∞',
    'ceil': 'Always rounds toward +∞',
    'truncate': 'Drops decimals without rounding (toward zero)',
  };

  return (
    <CalculatorShell title="Rounding Calculator" result={resultText} onCalculate={() => {}} presets={presets} accent="amber">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>Value</label>
            <input type="number" step="any" value={num} onChange={e => setNum(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
          </div>
          <div>
            <label className={labelClass}>Decimal places</label>
            <input type="number" min={0} max={15} value={places} onChange={e => setPlaces(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {['half-up', 'half-even', 'floor', 'ceil', 'truncate'].map(key => (
            <button key={key} onClick={() => setMode(key)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors font-medium ${mode === key ? 'bg-amber-500 text-white border-amber-500' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-zinc-300 dark:border-zinc-700 hover:border-amber-500'}`}>
              {modeLabels[key]}
            </button>
          ))}
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">{modeLabels[mode]}</div>
          <div className="text-4xl font-bold text-amber-700 dark:text-amber-300 font-mono">{n} → {result}</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">{modeDescriptions[mode]}</div>
        </div>

        {digit !== null && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Rounding Decision</div>
            <div className="font-mono text-sm text-[var(--text-primary)] space-y-1">
              <div>Digit at position {p + 1}: <span className="font-bold text-amber-600 dark:text-amber-400">{digit}</span></div>
              {mode === 'half-up' && <div>{digit >= 5 ? `≥ 5 → round up` : `< 5 → round down`}</div>}
              {mode === 'half-even' && <div>{digit > 5 ? `> 5 → round up` : digit < 5 ? `< 5 → round down` : `= 5 → round to even (${result * (10 ** p) % 2 === 0 ? 'even' : 'odd'})`}</div>}
              {mode === 'floor' && <div>Floor: always rounds toward −∞ (e.g. −3.7 → −4)</div>}
              {mode === 'ceil' && <div>Ceil: always rounds toward +∞ (e.g. −3.7 → −3)</div>}
              {mode === 'truncate' && <div>Truncate: drops decimals without rounding (toward zero)</div>}
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map(dp => (
            <div key={dp} className="bg-[var(--bg-surface)] rounded-xl p-2 text-center">
              <div className="text-xs text-[var(--text-secondary)]">{dp} dp</div>
              <div className="text-sm font-mono font-bold text-[var(--text-primary)]">{Number(num).toFixed(dp)}</div>
            </div>
          ))}
        </div>
      </div>
    </CalculatorShell>
  );
}
// --- MathEquationSolver ---
export function MathEquationSolver() {
  const clr = ac('MathEquationSolver');
  const [eq, setEq] = useState('2x + 3 = 7');
  const [result, setResult] = useState('');

  const solve = () => {
    const e = eq.replace(/\s+/g, '');
    // Quadratic: ax^2+bx+c=0
    const qm = e.match(/^([+-]?\d*\.?\d*)x\^2([+-]\d*\.?\d*)x([+-]\d*\.?\d*)=0$/);
    if (qm) {
      const a = Number(qm[1] || (qm[1] === '-' ? -1 : 1));
      const b = Number(qm[2] || 0);
      const c = Number(qm[3] || 0);
      if (a === 0) { setResult('Not quadratic (a=0). Try linear format.'); return; }
      const disc = b * b - 4 * a * c;
      if (disc < 0) { setResult('No real solutions (negative discriminant)'); return; }
      if (disc === 0) { setResult(`x = ${(-b / (2 * a)).toFixed(4)} (double root)`); return; }
      const x1 = (-b + Math.sqrt(disc)) / (2 * a);
      const x2 = (-b - Math.sqrt(disc)) / (2 * a);
      setResult(`x₁ = ${x1.toFixed(4)}, x₂ = ${x2.toFixed(4)}`);
      return;
    }
    // Linear: move all x terms to left, constants to right
    const [left, right] = e.split('=');
    if (!left || !right) { setResult('Use format: expression = value (e.g. 2x + 3 = 7)'); return; }
    // Parse terms from each side
    const parseSide = (s: string) => {
      const terms: { coeff: number; const: number } = { coeff: 0, const: 0 };
      const tokens = s.match(/[+-]?[^+-]+/g) || [];
      for (const t of tokens) {
        if (/x$/.test(t)) {
          const c = t.replace('x', '').replace(/\+$/, '');
          terms.coeff += Number(c || (c === '-' ? -1 : 1));
        } else {
          terms.const += Number(t);
        }
      }
      return terms;
    };
    const L = parseSide(left);
    const R = parseSide(right);
    const totalCoeff = L.coeff - R.coeff;
    const totalConst = R.const - L.const;
    if (totalCoeff === 0) {
      setResult(totalConst === 0 ? 'Infinite solutions (identity)' : 'No solution (contradiction)');
      return;
    }
    setResult(`x = ${(totalConst / totalCoeff).toFixed(4)}`);
  };

  return (
    <Section title="Equation Solver">
      <Input label="e.g. 2x + 3 = 7 or 3x^2 - 5x + 2 = 0" value={eq} onChange={setEq} placeholder="e.g. 2x + 3 = 7 or 3x^2 - 5x + 2 = 0" />
      <button onClick={solve} className="px-4 py-2 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-medium transition-colors">Solve</button>
      {result && <div className="text-lg font-bold font-mono mt-2">{result}</div>}
      <p className="text-xs text-[var(--text-secondary)] mt-1">Supports linear (ax + b = cx + d) and quadratic (ax² + bx + c = 0) equations.</p>
    </Section>
  );
}
// --- AlgebraCalculator ---
function parseExpr(input: string): number {
  let pos = 0;
  const s = input.replace(/\s+/g, '');

  function parseExpression(): number {
    let result = parseTerm();
    while (pos < s.length && (s[pos] === '+' || s[pos] === '-')) {
      const op = s[pos++];
      const right = parseTerm();
      result = op === '+' ? result + right : result - right;
    }
    return result;
  }

  function parseTerm(): number {
    let result = parseFactor();
    while (pos < s.length && (s[pos] === '*' || s[pos] === '/')) {
      const op = s[pos++];
      const right = parseFactor();
      result = op === '*' ? result * right : result / right;
    }
    return result;
  }

  function parseFactor(): number {
    if (s[pos] === '(') {
      pos++;
      const result = parseExpression();
      if (s[pos] !== ')') throw new Error('Mismatched parentheses');
      pos++;
      return result;
    }
    if (s[pos] === '-') {
      pos++;
      return -parseFactor();
    }
    if (s[pos] === '+') {
      pos++;
      return parseFactor();
    }
    const start = pos;
    while (pos < s.length && (s[pos] >= '0' && s[pos] <= '9' || s[pos] === '.')) pos++;
    if (start === pos) throw new Error('Expected number');
    return parseFloat(s.slice(start, pos));
  }

  const result = parseExpression();
  if (pos < s.length) throw new Error('Unexpected character');
  return result;
}
export function AlgebraCalculator() {
  const clr = ac('AlgebraCalculator');
  const [expr, setExpr] = useState('2*(3+4)');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const parseExpr = (e: string): number => {
    const tokens = e.replace(/\s+/g, '').match(/(\d+\.?\d*|[+\-*/()])/g) || [];
    let pos = 0;
    const parseExpression = (): number => {
      let val = parseTerm();
      while (pos < tokens.length && (tokens[pos] === '+' || tokens[pos] === '-')) {
        const op = tokens[pos++];
        const next = parseTerm();
        val = op === '+' ? val + next : val - next;
      }
      return val;
    };
    const parseTerm = (): number => {
      let val = parseFactor();
      while (pos < tokens.length && (tokens[pos] === '*' || tokens[pos] === '/')) {
        const op = tokens[pos++];
        const next = parseFactor();
        val = op === '*' ? val * next : val / next;
      }
      return val;
    };
    const parseFactor = (): number => {
      if (tokens[pos] === '(') { pos++; const val = parseExpression(); pos++; return val; }
      return parseFloat(tokens[pos++]);
    };
    pos = 0;
    return parseExpression();
  };

  const evaluate = () => {
    try { const r = parseExpr(expr); setResult(String(r)); setError(''); }
    catch (e: unknown) { setResult(''); setError(getErrorMessage(e)); }
  };

  const presets = [
    { label: '2*(3+4)', apply: () => { setExpr('2*(3+4)'); evaluate(); } },
    { label: '10+20*3', apply: () => { setExpr('10+20*3'); evaluate(); } },
    { label: '(5+5)/2', apply: () => { setExpr('(5+5)/2'); evaluate(); } },
    { label: '2^10', apply: () => { setExpr('2*2*2*2*2*2*2*2*2*2'); evaluate(); } },
    { label: 'Clear', apply: () => { setExpr(''); setResult(''); setError(''); } },
  ];

  const resultText = result ? `= ${result}` : (error ? `Error: ${error}` : 'Enter expression');

  return (
    <CalculatorShell title="Algebraic Expression Evaluator" result={resultText} onCalculate={evaluate} presets={presets} accent="indigo" downloadData={result ? `Expression: ${expr}\nResult: ${result}` : ''} downloadFilename="algebra.txt">
      <div className="space-y-4">
        <label className={labelClass}>Expression</label>
        <input type="text" value={expr} onChange={e => { setExpr(e.target.value); evaluate(); }}
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          placeholder="e.g., 2*(3+4) or 10+20*3" />

        {result && (
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-center">
            <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-1">Result</div>
            <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300 font-mono">${result}</div>
          </div>
        )}

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-center">
            <div className="text-xs text-rose-600 dark:text-rose-400 font-medium mb-1">Error</div>
            <div className="text-rose-700 dark:text-rose-300">${error}</div>
          </div>
        )}

        <div className="bg-[var(--bg-surface)] rounded-xl p-3">
          <div className="text-xs text-[var(--text-secondary)] mb-2">Supported</div>
          <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
            <span>+ Addition</span>
            <span>- Subtraction</span>
            <span>* Multiplication</span>
            <span>/ Division</span>
            <span>( ) Parentheses</span>
            <span>Decimals</span>
          </div>
        </div>
      </div>
    </CalculatorShell>
  );
}
// --- GeometryCalculator ---
export function GeometryCalculator() {
  const clr = ac('GeometryCalculator');
  const [shape, setShape] = useState('circle');
  const [r, setR] = useState('5');
  const [w, setW] = useState('4');
  const [h, setH] = useState('3');
  const radius = Number(r), width = Number(w), height = Number(h);
  const calc = () => {
    switch (shape) {
      case 'circle': return { area: Math.PI * radius * radius, perimeter: 2 * Math.PI * radius };
      case 'square': return { area: width * width, perimeter: 4 * width, volume: width * width * width };
      case 'triangle': return { area: 0.5 * width * height };
      case 'rectangle': return { area: width * height, perimeter: 2 * (width + height) };
      case 'sphere': return { area: 4 * Math.PI * radius * radius, volume: 4 / 3 * Math.PI * radius * radius * radius };
      case 'cylinder': return { area: 2 * Math.PI * radius * (radius + height), volume: Math.PI * radius * radius * height };
      case 'cone': return { area: Math.PI * radius * (radius + Math.sqrt(height * height + radius * radius)), volume: Math.PI * radius * radius * height / 3 };
      case 'cube': return { area: 6 * width * width, volume: width * width * width };
      default: return {};
    }
  };
  const result = calc();
  return (
    <Section title="Geometry Calculator">
      <select className={selClass} value={shape} onChange={e => setShape(e.target.value)}>
        <option value="circle">Circle</option><option value="square">Square</option><option value="triangle">Triangle</option>
        <option value="rectangle">Rectangle</option><option value="sphere">Sphere</option><option value="cylinder">Cylinder</option>
        <option value="cone">Cone</option><option value="cube">Cube</option>
      </select>
      <div className="flex gap-2 flex-wrap">
        {(shape === 'circle' || shape === 'sphere' || shape === 'cylinder' || shape === 'cone') && <div><label className={labelClass}>Radius</label><Input label="Value" type="number" value={r} onChange={setR} /></div>}
        {(shape === 'square' || shape === 'rectangle' || shape === 'cube') && <div><label className={labelClass}>Width</label><Input label="Value" type="number" value={w} onChange={setW} /></div>}
        {(shape === 'triangle' || shape === 'rectangle' || shape === 'cylinder' || shape === 'cone') && <div><label className={labelClass}>Height</label><Input label="Value" type="number" value={h} onChange={setH} /></div>}
      </div>
      <div className="text-xs space-y-1">
        {result.area !== undefined && <div>Area: {result.area.toFixed(4)}</div>}
        {result.perimeter !== undefined && <div>Perimeter: {result.perimeter.toFixed(4)}</div>}
        {result.volume !== undefined && <div>Volume: {result.volume.toFixed(4)}</div>}
      </div>
    </Section>
  );
}
// --- CoordinateCalculator ---
export function CoordinateCalculator() {
  const clr = ac('CoordinateCalculator');
  const [x1, setX1] = useState('0'); const [y1, setY1] = useState('0');
  const [x2, setX2] = useState('3'); const [y2, setY2] = useState('4');
  const a = Number(x1), b = Number(y1), c = Number(x2), d = Number(y2);
  const dist = Math.sqrt((c - a) ** 2 + (d - b) ** 2);
  const mx = (a + c) / 2, my = (b + d) / 2;
  return (
    <Section title="Coordinate Calculator">
      <div className="flex gap-2">
        <div><label className={labelClass}>x1</label><Input label="Value" type="number" value={x1} onChange={setX1} /></div>
        <div><label className={labelClass}>y1</label><Input label="Value" type="number" value={y1} onChange={setY1} /></div>
        <div><label className={labelClass}>x2</label><Input label="Value" type="number" value={x2} onChange={setX2} /></div>
        <div><label className={labelClass}>y2</label><Input label="Value" type="number" value={y2} onChange={setY2} /></div>
      </div>
      <div className="text-xs space-y-1">
        <div>Distance: {dist.toFixed(4)}</div>
        <div>Midpoint: ({mx.toFixed(2)}, {my.toFixed(2)})</div>
      </div>
    </Section>
  );
}
// --- SlopeCalculator ---
export function SlopeCalculator() {
  const clr = ac('SlopeCalculator');
  const [x1, setX1] = useState('1'); const [y1, setY1] = useState('2');
  const [x2, setX2] = useState('3'); const [y2, setY2] = useState('6');
  const a = Number(x1), b = Number(y1), c = Number(x2), d = Number(y2);
  const dx = c - a, dy = d - b;
  const slope = dx !== 0 ? dy / dx : Infinity;
  return (
    <Section title="Slope Calculator">
      <div className="flex gap-2">
        <div><label className={labelClass}>x1</label><Input label="Value" type="number" value={x1} onChange={setX1} /></div>
        <div><label className={labelClass}>y1</label><Input label="Value" type="number" value={y1} onChange={setY1} /></div>
        <div><label className={labelClass}>x2</label><Input label="Value" type="number" value={x2} onChange={setX2} /></div>
        <div><label className={labelClass}>y2</label><Input label="Value" type="number" value={y2} onChange={setY2} /></div>
      </div>
      <div className="text-sm font-mono">
        <div>Slope = {isFinite(slope) ? slope.toFixed(4) : 'undefined'}</div>
        <div>Equation: y = {isFinite(slope) ? slope.toFixed(2) + 'x ' + (b - slope * a >= 0 ? '+' : '') + (b - slope * a).toFixed(2) : 'x = ' + a}</div>
      </div>
    </Section>
  );
}
// --- MidpointCalculator ---
export function MidpointCalculator() {
  const clr = ac('MidpointCalculator');
  const [x1, setX1] = useState('0'); const [y1, setY1] = useState('0');
  const [x2, setX2] = useState('4'); const [y2, setY2] = useState('6');
  const a = Number(x1), b = Number(y1), c = Number(x2), d = Number(y2);
  return (
    <Section title="Midpoint Calculator">
      <div className="flex gap-2">
        <div><label className={labelClass}>x1</label><Input label="Value" type="number" value={x1} onChange={setX1} /></div>
        <div><label className={labelClass}>y1</label><Input label="Value" type="number" value={y1} onChange={setY1} /></div>
        <div><label className={labelClass}>x2</label><Input label="Value" type="number" value={x2} onChange={setX2} /></div>
        <div><label className={labelClass}>y2</label><Input label="Value" type="number" value={y2} onChange={setY2} /></div>
      </div>
      <div className="text-lg font-bold">Midpoint: ({(a + c) / 2}, {(b + d) / 2})</div>
    </Section>
  );
}
// --- DistanceCalculator ---
export function DistanceCalculator() {
  const clr = ac('DistanceCalculator');
  const [x1, setX1] = useState('0'); const [y1, setY1] = useState('0');
  const [x2, setX2] = useState('3'); const [y2, setY2] = useState('4');
  const a = Number(x1), b = Number(y1), c = Number(x2), d = Number(y2);
  const dist = Math.sqrt((c - a) ** 2 + (d - b) ** 2);
  return (
    <Section title="Distance Calculator (2D)">
      <div className="flex gap-2">
        <div><label className={labelClass}>x1</label><Input label="Value" type="number" value={x1} onChange={setX1} /></div>
        <div><label className={labelClass}>y1</label><Input label="Value" type="number" value={y1} onChange={setY1} /></div>
        <div><label className={labelClass}>x2</label><Input label="Value" type="number" value={x2} onChange={setX2} /></div>
        <div><label className={labelClass}>y2</label><Input label="Value" type="number" value={y2} onChange={setY2} /></div>
      </div>
      <div className="text-lg font-bold">Distance: {dist.toFixed(4)}</div>
    </Section>
  );
}
// --- BodyMassIndexCalculator ---

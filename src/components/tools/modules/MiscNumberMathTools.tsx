"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { ac, pillClass, btnClass, borderClass } from './miscToolColors';

import { Section, Input, labelClass, selClass } from './MiscToolsShared';
import { CalculatorShell } from './shared/CalculatorShell';

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
  const change = Number(a) ? ((Number(b) - Number(a)) / Number(a) * 100) : 0;
  return (
    <Section title="Percentage Change">
      <div className="flex gap-2 items-center">
        <div><label className={labelClass}>Old Value</label><Input label="Value" value={a} onChange={setA} /></div>
        <div><label className={labelClass}>New Value</label><Input label="Value" value={b} onChange={setB} /></div>
      </div>
      <div className="text-lg font-bold">{change >= 0 ? '+' : ''}{change.toFixed(2)}% {change >= 0 ? 'increase' : 'decrease'}</div>
    </Section>
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
  return (
    <Section title="ROI Calculator">
      <div className="flex gap-2"><div><label className={labelClass}>Amount Invested</label><Input label="Value" type="number" value={invested} onChange={setInvested} /></div><div><label className={labelClass}>Total Return</label><Input label="Value" type="number" value={returned} onChange={setReturned} /></div></div>
      <div className="text-lg font-bold">ROI: {roi.toFixed(2)}% (${(r - i).toFixed(2)})</div>
    </Section>
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
  return (
    <Section title="CAGR Calculator">
      <div className="flex gap-2">
        <div><label className={labelClass}>Start Value</label><Input label="Value" type="number" value={start} onChange={setStart} /></div>
        <div><label className={labelClass}>End Value</label><Input label="Value" type="number" value={end} onChange={setEnd} /></div>
        <div><label className={labelClass}>Years</label><Input label="Value" type="number" value={years} onChange={setYears} /></div>
      </div>
      <div className="text-lg font-bold">CAGR: {cagr.toFixed(2)}%</div>
    </Section>
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
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const result = (Number(amount) / currencies[from]) * currencies[to];
  return (
    <Section title="Currency Rate Calculator">
      <div className="flex gap-2 items-center">
        <Input label="Value" type="number" value={amount} onChange={setAmount} />
        <select className={selClass} value={from} onChange={e => setFrom(e.target.value)}>{Object.keys(currencies).map(c => <option key={c}>{c}</option>)}</select>
        <span>-</span>
        <select className={selClass} value={to} onChange={e => setTo(e.target.value)}>{Object.keys(currencies).map(c => <option key={c}>{c}</option>)}</select>
      </div>
      <div className="text-lg font-bold">{result.toFixed(2)} {to}</div>
    </Section>
  );
}
// --- ExchangeRateCalculator ---
export function ExchangeRateCalculator() {
  const clr = ac('ExchangeRateCalculator');
  const rates: Record<string, number> = { 'USD/EUR': 0.92, 'USD/GBP': 0.79, 'USD/JPY': 149.5, 'EUR/USD': 1.09, 'EUR/GBP': 0.86, 'GBP/USD': 1.27, 'GBP/EUR': 1.16, 'USD/INR': 83.1, 'USD/CAD': 1.36, 'USD/AUD': 1.53 };
  const [amount, setAmount] = useState('100');
  const [pair, setPair] = useState('USD/EUR');
  const rate = rates[pair] || 1;
  return (
    <Section title="Exchange Rate Calculator">
      <div className="flex gap-2 items-center">
        <Input label="Value" type="number" value={amount} onChange={setAmount} />
        <select className={selClass} value={pair} onChange={e => setPair(e.target.value)}>
          {Object.keys(rates).map(p => <option key={p}>{p}</option>)}
        </select>
      </div>
      <div className="text-lg font-bold">{(Number(amount) * rate).toFixed(2)}</div>
    </Section>
  );
}
// --- FractionSimplifier ---
export function FractionSimplifier() {
  const clr = ac('FractionSimplifier');
  const [num, setNum] = useState('8');
  const [den, setDen] = useState('12');
  const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
  const n = Number(num), d = Number(den);
  const g = gcd(n, d);
  return (
    <Section title="Fraction Simplifier">
      <div className="flex gap-2 items-center">
        <Input label="Value" type="number" value={num} onChange={setNum} />
        <span className="text-xl">/</span>
        <Input label="Value" type="number" value={den} onChange={setDen} />
      </div>
      <div className="text-lg font-bold">
        {d ? n + '/' + d + ' = ' + (n/g) + '/' + (d/g) : 'Invalid'}
      </div>
    </Section>
  );
}
// --- FractionToDecimalCalculator ---
export function FractionToDecimalCalculator() {
  const clr = ac('FractionToDecimalCalculator');
  const [num, setNum] = useState('3');
  const [den, setDen] = useState('4');
  const n = Number(num), d = Number(den);
  return (
    <Section title="Fraction to Decimal">
      <div className="flex gap-2 items-center">
        <Input label="Value" type="number" value={num} onChange={setNum} />
        <span className="text-xl">/</span>
        <Input label="Value" type="number" value={den} onChange={setDen} />
      </div>
      <div className="text-lg font-bold">{d ? (n / d).toString() : 'Invalid'}</div>
    </Section>
  );
}
// --- DecimalToFractionCalculator ---
export function DecimalToFractionCalculator() {
  const clr = ac('DecimalToFractionCalculator');
  const [dec, setDec] = useState('0.75');
  const d = parseFloat(dec);
  const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
  const getFraction = (v: number) => {
    if (isNaN(v)) return { n: 0, d: 0 };
    const precision = 1000000;
    const n = Math.round(v * precision);
    const g = gcd(n, precision);
    return { n: n / g, d: precision / g };
  };
  const f = getFraction(d);
  return (
    <Section title="Decimal to Fraction">
      <Input label="Value" type="number" step="0.01" value={dec} onChange={setDec} />
      <div className="text-lg font-bold">{f.d ? f.n + '/' + f.d : 'Invalid'}</div>
    </Section>
  );
}
// --- RatioSimplifier ---
export function RatioSimplifier() {
  const clr = ac('RatioSimplifier');
  const [a, setA] = useState('12');
  const [b, setB] = useState('18');
  const gcd = (x: number, y: number): number => y ? gcd(y, x % y) : x;
  const n1 = Number(a), n2 = Number(b);
  const g = gcd(n1, n2);
  return (
    <Section title="Ratio Simplifier">
      <div className="flex gap-2 items-center">
        <Input label="Value" type="number" value={a} onChange={setA} />
        <span>:</span>
        <Input label="Value" type="number" value={b} onChange={setB} />
      </div>
      <div className="text-lg font-bold">{n1}:{n2} = {n1/g}:{n2/g}</div>
    </Section>
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
  return (
    <Section title="Proportional Calculator">
      <div className="flex gap-2 items-center">
        <Input label="Value" type="number" value={a} onChange={setA} /><span className="text-xs">:</span>
        <Input label="Value" type="number" value={b} onChange={setB} /><span className="text-xs">=</span>
        <Input label="Value" type="number" value={c} onChange={setC} /><span className="text-xs">:</span>
        <span className="text-lg font-bold">{d.toFixed(2)}</span>
      </div>
      <div className="text-xs text-[var(--text-secondary)]">{na}:{nb} = {nc}:{d.toFixed(2)}</div>
    </Section>
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
  return (
    <Section title="Rule of Three">
      <div className="flex gap-2 items-center">
        <Input label="Value" type="number" value={a} onChange={setA} /><span className="text-xs">-</span>
        <Input label="Value" type="number" value={b} onChange={setB} />
      </div>
      <div className="flex gap-2 items-center">
        <Input label="Value" type="number" value={c} onChange={setC} /><span className="text-xs">-</span>
        <span className="text-lg font-bold">{x.toFixed(2)}</span>
      </div>
    </Section>
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
  const nn = Number(n);
  return (
    <Section title="Factorial Calculator">
      <Input label="Value" type="number" min={0} max={170} value={n} onChange={setN} />
      <div className="text-lg font-bold">{nn}! = {nn > 170 ? 'Too large' : fact(nn).toLocaleString('fullwide', { useGrouping: false })}</div>
    </Section>
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
    if (below === nn && prime) { const b = nn - 1; while (b > 2 && !isPrime(b)) below = b--; }
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
  const nn = Number(n);
  const factors = (x: number) => { const f: number[] = []; let d = 2; while (x > 1) { while (x % d === 0) { f.push(d); x /= d; } d++; } return f; };
  const f = factors(nn);
  return (
    <Section title="Prime Factorization">
      <Input label="Value" type="number" min={2} value={n} onChange={setN} />
      <div className="text-lg font-bold">{nn} = {f.join(' x ')}</div>
    </Section>
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
  return (
    <Section title="Degree / Radian Converter">
      <div className="flex gap-2 items-center"><label className={labelClass}>Degrees</label><Input label="Value" type="number" value={deg} onChange={setDeg} /></div>
      <div className="flex gap-2 items-center"><label className={labelClass}>Radians</label><Input label="Value" type="number" value={rad} onChange={setRad} /></div>
      <div className="flex gap-2"><button className={btnClass(clr)} onClick={d2r}>Deg to Rad</button><button className={btnClass(clr)} onClick={r2d}>Rad to Deg</button></div>
    </Section>
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
  let result: string;
  try { result = String(parseExpr(expr)); } catch { result = 'Invalid expression'; }
  return (
    <Section title="Algebraic Expression Evaluator">
      <Input label="Value" value={expr} onChange={setExpr} />
      <div className="text-lg font-bold font-mono">= {result}</div>
    </Section>
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

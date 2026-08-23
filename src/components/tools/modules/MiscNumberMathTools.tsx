"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { ac, pillClass, btnClass, borderClass } from './miscToolColors';

import { Section, Input, labelClass, selClass } from './MiscToolsShared';

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
  const numA = Number(a), numB = Number(b);
  const avg = (numA + numB) / 2;
  const diff = avg ? Math.abs(numA - numB) / avg * 100 : 0;
  const maxVal = Math.max(Math.abs(numA), Math.abs(numB), 1);
  return (
    <Section title="Percentage Difference">
      <div className="flex gap-2 items-center">
        <Input label="Value A" value={a} onChange={setA} />
        <Input label="Value B" value={b} onChange={setB} />
      </div>
      <div className="text-lg font-bold">{diff.toFixed(2)}% difference</div>
      {numA !== 0 && numB !== 0 && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] space-y-3">
          <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">How it's calculated</p>
          <div className="font-mono text-xs text-[var(--text-primary)] space-y-1">
            <p>|{numA} - {numB}| = {Math.abs(numA - numB)}</p>
            <p>( {numA} + {numB} ) / 2 = {avg}</p>
            <p>{Math.abs(numA - numB)} / {avg} × 100 = <span className="font-bold text-amber-500">{diff.toFixed(2)}%</span></p>
          </div>
          <div className="flex gap-2 items-center text-xs text-[var(--text-muted)]">
            <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${(Math.abs(numA) / maxVal) * 100}%` }} />
            <span>{numA}</span>
            <span className="text-[var(--text-muted)]">vs</span>
            <div className="h-2 bg-rose-500 rounded-full" style={{ width: `${(Math.abs(numB) / maxVal) * 100}%` }} />
            <span>{numB}</span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">Both values are treated equally — there's no "original" or "new" value. The result is always the same regardless of which value you enter first.</p>
        </div>
      )}
    </Section>
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
  const nn = Number(n), rr = Number(r);
  const c = fact(nn) / (fact(rr) * fact(nn - rr));
  return (
    <Section title="Combinations (nCr)">
      <div className="flex gap-2 items-center">
        <Input label="n (total items)" type="number" value={n} onChange={setN} placeholder="n" />
        <Input label="r (choose)" type="number" value={r} onChange={setR} placeholder="r" />
      </div>
      <div className="text-lg font-bold">C({nn}, {rr}) = {isFinite(c) ? c.toFixed(0) : 'N/A'}</div>
      {isFinite(c) && nn > 0 && rr > 0 && rr <= nn && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] space-y-3">
          <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">How it's calculated</p>
          <div className="font-mono text-xs text-[var(--text-primary)] space-y-1">
            <p>C({nn}, {rr}) = {nn}! / ({rr}! × ({nn}-{rr})!)</p>
            <p>= {nn}! / ({rr}! × {nn - rr}!)</p>
            <p>= {fact(nn)} / ({fact(rr)} × {fact(nn - rr)})</p>
            <p>= <span className="font-bold text-amber-500">{c.toFixed(0)}</span></p>
          </div>
          <p className="text-xs text-[var(--text-muted)]">Combinations count groups where order doesn't matter — choosing 3 from 5 gives the same group regardless of selection order. For order matters, use permutations (nPr).</p>
        </div>
      )}
    </Section>
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
  const nn = Number(n);
  const isPrime = (x: number) => { if (x < 2) return false; for (let i = 2; i * i <= x; i++) { if (x % i === 0) return false; } return true; };
  const factors = (x: number) => { const f: number[] = []; let d = 2; while (x > 1) { while (x % d === 0) { f.push(d); x /= d; } d++; } return f; };
  const prime = isPrime(nn);
  return (
    <Section title="Prime Number Checker">
      <Input label="Value" type="number" min={1} value={n} onChange={setN} />
      <div className={'text-lg font-bold ' + (prime ? 'text-green-600' : 'text-red-500')}>{nn} is {prime ? '' : 'not '}prime</div>
      {!prime && <div className="text-xs">Factors: {factors(nn).join(' x ')}</div>}
    </Section>
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
  return (
    <Section title="GCF / GCD Calculator">
      <div className="flex gap-2"><Input label="Value" type="number" value={a} onChange={setA} /><Input label="Value" type="number" value={b} onChange={setB} /></div>
      <div className="text-lg font-bold">GCF({na}, {nb}) = {gcd(na, nb)}</div>
    </Section>
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
  return (
    <Section title="LCM Calculator">
      <div className="flex gap-2"><Input label="Value" type="number" value={a} onChange={setA} /><Input label="Value" type="number" value={b} onChange={setB} /></div>
      <div className="text-lg font-bold">LCM({na}, {nb}) = {lcm(na, nb)}</div>
    </Section>
  );
}
// --- ModuloCalculator ---
export function ModuloCalculator() {
  const clr = ac('ModuloCalculator');
  const [a, setA] = useState('17');
  const [b, setB] = useState('5');
  const na = Number(a), nb = Number(b);

  // JavaScript mod (truncates toward zero)
  const jsMod = na % nb;
  const jsQuotient = Math.floor(na / nb);

  // Python/Floored mod (always positive remainder)
  const pyMod = ((na % nb) + nb) % nb;
  const pyQuotient = Math.floor(na / nb);

  const differs = jsMod !== pyMod && na < 0;

  return (
    <Section title="Modulo Calculator">
      <div className="flex gap-2 items-center">
        <Input label="Dividend (a)" type="number" value={a} onChange={setA} />
        <span className="text-sm font-bold">mod</span>
        <Input label="Divisor (b)" type="number" value={b} onChange={setB} />
      </div>

      <div className="space-y-2">
        <div className="text-lg font-bold">{na} mod {nb} = {jsMod}</div>
        <div className="text-xs text-[var(--text-secondary)]">
          {na} = {nb} × {jsQuotient} + {jsMod}
        </div>

        {differs && (
          <div className="p-2 rounded bg-[var(--muted)] text-xs space-y-1">
            <div className="font-bold">⚠ Negative dividend — mod semantics differ:</div>
            <div>JS: {na} % {nb} = {jsMod} (truncates toward zero)</div>
            <div>Python: {na} % {nb} = {pyMod} (floors toward −∞)</div>
            <div className="text-[var(--text-secondary)]">
              JS: {na} = {nb} × {jsQuotient} + {jsMod} | Python: {na} = {nb} × {pyQuotient} + {pyMod}
            </div>
          </div>
        )}

        {!differs && na < 0 && (
          <div className="p-2 rounded bg-[var(--muted)] text-xs">
            Both JS and Python agree: {na} mod {nb} = {jsMod}
          </div>
        )}

        <div className="p-2 rounded bg-[var(--muted)] text-xs space-y-1">
          <div className="font-bold">Visual long division:</div>
          <div className="font-mono text-[11px] leading-tail">
            <div>{na} ÷ {nb} = {na / nb}</div>
            <div>Quotient: {jsQuotient} (integer part)</div>
            <div>Remainder: {na} − ({nb} × {jsQuotient}) = {jsMod}</div>
          </div>
        </div>
      </div>
    </Section>
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

  return (
    <Section title="Rounding Calculator">
      <div className="flex gap-2 items-center">
        <Input label="Value" type="number" value={num} onChange={setNum} />
        <Input label="Decimal places" type="number" min={0} max={15} value={places} onChange={setPlaces} />
      </div>
      <div className="flex gap-1 flex-wrap">
        {[
          ['half-up', 'Round Half Up'],
          ['half-even', 'Banker\'s Rounding'],
          ['floor', 'Floor (↓)'],
          ['ceil', 'Ceil (↑)'],
          ['truncate', 'Truncate'],
        ].map(([key, label]) => (
          <button key={key} onClick={() => setMode(key)}
            className={`px-2 py-1 text-xs rounded border transition-colors ${mode === key ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'bg-[var(--card)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]'}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="text-lg font-bold">{n} → {result}</div>
      <div className="text-xs text-[var(--text-secondary)] space-y-1">
        {digit !== null && (
          <div>Digit at position {p + 1}: <span className="font-mono font-bold">{digit}</span></div>
        )}
        {mode === 'half-up' && <div>{digit !== null ? (digit >= 5 ? `≥ 5 → round up` : `< 5 → round down`) : 'No more digits to round'}</div>}
        {mode === 'half-even' && <div>{digit !== null ? (digit > 5 ? `> 5 → round up` : digit < 5 ? `< 5 → round down` : `= 5 → round to even`) : 'No more digits to round'}</div>}
        {mode === 'floor' && <div>Floor: always rounds toward −∞ (e.g. −3.7 → −4)</div>}
        {mode === 'ceil' && <div>Ceil: always rounds toward +∞ (e.g. −3.7 → −3)</div>}
        {mode === 'truncate' && <div>Truncate: drops decimals without rounding (e.g. −3.7 → −3)</div>}
      </div>
      <div className="text-xs text-[var(--text-secondary)]">
        Common: {Number(num).toFixed(0)} (0dp), {Number(num).toFixed(1)} (1dp), {Number(num).toFixed(2)} (2dp), {Number(num).toFixed(3)} (3dp)
      </div>
    </Section>
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

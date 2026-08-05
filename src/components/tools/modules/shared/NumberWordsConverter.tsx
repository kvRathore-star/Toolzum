"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

const ROMAN_MAP: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
  [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

const toRoman = (n: number): string => {
  if (n < 1 || n > 3999) return '';
  let r = '', i = n;
  for (const [val, sym] of ROMAN_MAP) {
    while (i >= val) { r += sym; i -= val; }
  }
  return r;
};

const fromRoman = (s: string): number => {
  const vals: Record<string, number> = { M: 1000, D: 500, C: 100, L: 50, X: 10, V: 5, I: 1 };
  let t = 0; const i = s.toUpperCase();
  for (let c = 0; c < i.length; c++) {
    const cur = vals[i[c]] || 0, next = vals[i[c + 1]] || 0;
    t += cur < next ? -cur : cur;
  }
  return t;
};

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const TEENS = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

const toWords = (n: number): string => {
  if (n === 0) return 'Zero';
  if (n < 0) return 'Minus ' + toWords(-n);
  const under1000 = (x: number): string => {
    if (x === 0) return '';
    const parts: string[] = [];
    const h = Math.floor(x / 100);
    if (h) parts.push(ONES[h] + ' Hundred');
    const r = x % 100;
    if (r === 0) return parts.join(' ');
    if (r < 10) parts.push(ONES[r]);
    else if (r < 20) parts.push(TEENS[r - 10]);
    else {
      const t = Math.floor(r / 10), o = r % 10;
      parts.push(TENS[t] + (o ? ' ' + ONES[o] : ''));
    }
    return parts.join(' ');
  };
  const groups = ['', 'Thousand', 'Million', 'Billion'];
  const result: string[] = []; let remaining = Math.floor(n);
  for (let g = 0; remaining > 0 && g < groups.length; g++) {
    const part = remaining % 1000;
    if (part) {
      const words = under1000(part);
      result.unshift(words + (groups[g] ? ' ' + groups[g] : ''));
    }
    remaining = Math.floor(remaining / 1000);
  }
  return result.join(' ') || 'Zero';
};

type NumMode = {
  slug: string;
  name: string;
  description: string;
  convert: (input: string) => string;
};

export const MODES: Record<string, NumMode> = {
  "roman-numeral-converter": {
    slug: "roman-numeral-converter", name: "Roman Numeral Converter",
    description: "Convert between numbers and Roman numerals (1-3999)",
    convert: (i) => {
      const t = i.trim().toUpperCase();
      if (/^[IVXLCDM]+$/.test(t)) {
        const n = fromRoman(t);
        return n ? `${t} = ${n}` : 'Invalid Roman numeral';
      }
      const n = parseInt(t);
      if (isNaN(n) || n < 1 || n > 3999) return 'Enter a number (1-3999) or Roman numeral';
      return `${n} = ${toRoman(n)}`;
    },
  },
  "number-to-words-converter": {
    slug: "number-to-words-converter", name: "Number to Words",
    description: "Convert numbers to English words",
    convert: (i) => {
      const n = parseFloat(i.trim());
      if (isNaN(n)) return 'Enter a valid number';
      if (n > 999999999999) return 'Number too large (max 999 billion)';
      const int = Math.floor(n);
      const dec = Math.round((n - int) * 100);
      let r = toWords(int);
      if (dec > 0) r += ' and ' + toWords(dec) + '/100';
      return r;
    },
  },
};

export default function NumberWordsConverter({ slug }: { slug: string }) {
  const mode = MODES[slug];
  const [input, setInput] = useState(slug === 'roman-numeral-converter' ? '2024' : '12345');
  const [output, setOutput] = useState('');

  if (!mode) return <div className="text-red-500">Unknown mode: {slug}</div>;

  const handleConvert = () => {
    setOutput(mode.convert(input));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">{mode.name}</h2>
        <p className="text-xs text-[var(--text-secondary)]">{mode.description}</p>
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm font-mono text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
        <button onClick={handleConvert}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm transition-all active:scale-[0.98]">
          Convert
        </button>
        {output && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)]">Result</span>
              <button onClick={() => { clipboardWrite(output); toast.success('Copied!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
            </div>
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

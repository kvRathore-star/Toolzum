"use client";

import React, { useState, useCallback } from 'react';
import { Copy, Check, Repeat } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { clipboardWrite } from "@/lib/clipboard";

const ROMAN_MAP: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
  [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
];

const ROMAN_VALUES: [string, number][] = [
  ['M', 1000], ['CM', 900], ['D', 500], ['CD', 400],
  ['C', 100], ['XC', 90], ['L', 50], ['XL', 40],
  ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]
];

function toRoman(num: number): string {
  if (num < 1 || num > 3999) return '';
  let result = '';
  let n = num;
  for (const [value, symbol] of ROMAN_MAP) {
    while (n >= value) {
      result += symbol;
      n -= value;
    }
  }
  return result;
}

function fromRoman(roman: string): number {
  const s = roman.toUpperCase().trim();
  if (!/^[IVXLCDM]+$/.test(s)) return 0;
  let result = 0;
  let i = 0;
  while (i < s.length) {
    if (i + 1 < s.length) {
      const pair = s.slice(i, i + 2);
      const pairVal = ROMAN_VALUES.find(([k]) => k === pair);
      if (pairVal) {
        result += pairVal[1];
        i += 2;
        continue;
      }
    }
    const single = s[i];
    const singleVal = ROMAN_VALUES.find(([k]) => k === single);
    if (singleVal) {
      result += singleVal[1];
      i++;
    } else {
      return 0;
    }
  }
  return result;
}

function isRomanInput(value: string): boolean {
  const cleaned = value.replace(/\s+/g, '');
  if (/^\d+$/.test(cleaned)) return false;
  return /^[IVXLCDMivxlcdm]+$/.test(cleaned);
}

function isValidRoman(roman: string): boolean {
  const num = fromRoman(roman);
  if (num < 1 || num > 3999) return false;
  return toRoman(num) === roman.toUpperCase().trim();
}

const TABLE_ROWS: [number, string][] = [
  [1, 'I'], [4, 'IV'], [5, 'V'], [9, 'IX'],
  [10, 'X'], [40, 'XL'], [50, 'L'], [90, 'XC'],
  [100, 'C'], [400, 'CD'], [500, 'D'], [900, 'CM'], [1000, 'M']
];

export default function RomanNumeralConverter() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [mode, setMode] = useState<'number' | 'roman' | null>(null);
  const [copied, setCopied] = useState(false);

  const handleChange = useCallback((value: string) => {
    setInput(value);
    if (!value.trim()) {
      setResult('');
      setMode(null);
      return;
    }
    if (isRomanInput(value)) {
      const cleaned = value.toUpperCase().trim();
      if (!cleaned) { setResult(''); setMode(null); return; }
      const num = fromRoman(cleaned);
      if (num === 0) {
        setResult('Invalid Roman numeral');
        setMode('roman');
      } else if (!isValidRoman(cleaned)) {
        setResult('Invalid Roman numeral');
        setMode('roman');
      } else {
        setResult(num.toString());
        setMode('roman');
      }
    } else {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 1 || num > 3999) {
        setResult(num < 1 ? 'Number must be between 1 and 3999' : 'Number must be between 1 and 3999');
        setMode('number');
      } else {
        setResult(toRoman(num));
        setMode('number');
      }
    }
  }, []);

  const handleCopy = () => {
    if (!result || result.startsWith('Invalid') || result.startsWith('Number must')) return;
    clipboardWrite(result);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    if (!result || result.startsWith('Invalid') || result.startsWith('Number must')) return;
    setInput(result);
    setResult(input);
    setMode(mode === 'number' ? 'roman' : 'number');
  };

  const label = mode === 'number' ? 'Number' : mode === 'roman' ? 'Roman Numeral' : 'Converter';
  const resultLabel = mode === 'number' ? 'Roman Numeral' : mode === 'roman' ? 'Number' : 'Result';

  return (
    <div className="max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6"
      >
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-subtle)]">
          <span className="text-xl font-serif font-bold" style={{ color: '#d97706' }}>VII</span>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Roman Numeral Converter</h3>
        </div>

        <div className="space-y-2">
          <label htmlFor="lbl-romannumeralconverter-enter-a-number-or-roman-numeral" className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            Enter a number or Roman numeral
          </label>
          <input id="lbl-romannumeralconverter-enter-a-number-or-roman-numeral" aria-label="Enter a number or Roman numeral"
            type="text"
            value={input}
            onChange={e => handleChange(e.target.value)}
            placeholder="e.g. 2024 or MMXXIV"
            className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-lg font-mono text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 transition-all duration-200 focus:border-amber-500"
          />
          <p className="text-[10px] text-[var(--text-muted)] text-center">
            Type a number (1-3999) or Roman numeral — auto-detected
          </p>
        </div>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key={result}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-5 rounded-xl text-center space-y-2 border ${
                result.startsWith('Invalid') || result.startsWith('Number must')
                  ? 'border-red-200 dark:border-red-900/50'
                  : 'border-amber-200 dark:border-amber-900/50'
              }`}
              style={{
                backgroundColor: result.startsWith('Invalid') || result.startsWith('Number must')
                  ? '#fef2f2' : '#fffbeb',
                borderColor: result.startsWith('Invalid') || result.startsWith('Number must')
                  ? '#fecaca' : '#fde68a'
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                {result.startsWith('Invalid') || result.startsWith('Number must') ? '' : `${label} → ${resultLabel}`}
              </span>
              <span
                className={`text-2xl font-black block font-mono ${
                  result.startsWith('Invalid') || result.startsWith('Number must')
                    ? 'text-red-600 dark:text-red-400'
                    : ''
                }`}
                style={
                  !result.startsWith('Invalid') && !result.startsWith('Number must')
                    ? { color: '#d97706' }
                    : undefined
                }
              >
                {result}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {result && !result.startsWith('Invalid') && !result.startsWith('Number must') && (
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
              style={{
                backgroundColor: copied ? '#10b98115' : '#d9770615',
                color: copied ? '#10b981' : '#d97706'
              }}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleSwap}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
              style={{ backgroundColor: '#d9770615', color: '#d97706' }}
            >
              <Repeat className="w-3.5 h-3.5" /> Swap
            </button>
          </div>
        )}

        <div className="border-t border-[var(--border-subtle)] pt-4">
          <h4 className="text-xs font-bold text-[var(--text-primary)] mb-3 text-center">Roman Numeral Reference</h4>
          <div className="grid grid-cols-4 gap-1.5">
            {TABLE_ROWS.map(([num, roman]) => (
              <div
                key={num}
                className="text-center py-1.5 px-1 rounded-lg border border-[var(--border-subtle)]"
              >
                <span className="text-[11px] font-bold block font-mono" style={{ color: '#d97706' }}>{roman}</span>
                <span className="text-[9px] text-[var(--text-muted)] block">{num}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

"use client";
import { useState } from 'react';
import { ac, borderClass } from '../miscToolColors';
import { labelClass, selClass } from '../MiscToolsShared';
import { CalculatorShell } from '../shared/CalculatorShell';
import { getErrorMessage } from '@/utils/error';

export default function AlgebraCalculator() {
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
    <CalculatorShell title="Algebraic Expression Evaluator" result={resultText} onCalculate={evaluate} presets={presets} accent="indigo" downloadData={result ? `Expression: ${expr}\nResult: ${result}` : ''} downloadFilename="algebra.txt" customResult={
      result ? (
        <div className="text-center">
          <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-1">Result</div>
          <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300 font-mono">${result}</div>
        </div>
      ) : error ? (
        <div className="text-center">
          <div className="text-xs text-rose-600 dark:text-rose-400 font-medium mb-1">Error</div>
          <div className="text-rose-700 dark:text-rose-300">${error}</div>
        </div>
      ) : null
    }>
      <div className="space-y-4">
        <label className={labelClass}>Expression</label>
        <input type="text" value={expr} onChange={e => { setExpr(e.target.value); evaluate(); }}
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          placeholder="e.g., 2*(3+4) or 10+20*3" />

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

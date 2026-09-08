"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import { Copy, Delete } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { factorial } from '../Calculators.shared';

function evalScientific(input: string, degMode = true): number {
  let pos = 0;
  const s = input.replace(/\s+/g, '').toLowerCase()
    .replace(/u03c0/g, String(Math.PI))
    .replace(/pi/g, String(Math.PI))
    .replace(/\be\b(?![xp])/g, String(Math.E));

  const toRad = degMode ? (x: number) => x * Math.PI / 180 : (x: number) => x;
  const fromRad = degMode ? (x: number) => x * 180 / Math.PI : (x: number) => x;

  const funcs: Record<string, (x: number) => number> = {
    sin: x => Math.sin(toRad(x)),
    cos: x => Math.cos(toRad(x)),
    tan: x => Math.tan(toRad(x)),
    asin: x => fromRad(Math.asin(x)),
    acos: x => fromRad(Math.acos(x)),
    atan: x => fromRad(Math.atan(x)),
    sqrt: x => Math.sqrt(x),
    log: x => Math.log10(x),
    ln: x => Math.log(x),
    abs: x => Math.abs(x),
    ceil: x => Math.ceil(x),
    floor: x => Math.floor(x),
    round: x => Math.round(x),
  };

  function parseExpr(): number {
    let val = parseTerm();
    while (pos < s.length && (s[pos] === '+' || s[pos] === '-')) {
      const op = s[pos++];
      const right = parseTerm();
      val = op === '+' ? val + right : val - right;
    }
    return val;
  }

  function parseTerm(): number {
    let val = parsePower();
    while (pos < s.length && (s[pos] === '*' || s[pos] === '/')) {
      const op = s[pos++];
      const right = parsePower();
      val = op === '*' ? val * right : val / right;
    }
    return val;
  }

  function parsePower(): number {
    let val = parseUnary();
    while (pos < s.length && s[pos] === '^') {
      pos++;
      const right = parsePower();
      val = Math.pow(val, right);
    }
    return val;
  }

  function parseUnary(): number {
    if (pos < s.length && s[pos] === '-') { pos++; return -parseAtom(); }
    if (pos < s.length && s[pos] === '+') { pos++; }
    return parseAtom();
  }

  function parseAtom(): number {
    if (pos < s.length && s[pos] === '!') { pos++; return factorial(parseAtom()); }
    if (pos < s.length && s[pos] === '(') {
      pos++;
      const val = parseExpr();
      if (pos < s.length && s[pos] === ')') pos++;
      if (pos < s.length && s[pos] === '!') { pos++; return factorial(val); }
      return val;
    }
    for (const [name, fn] of Object.entries(funcs)) {
      if (s.startsWith(name + '(', pos)) {
        pos += name.length;
        if (pos < s.length && s[pos] === '(') pos++;
        const arg = parseExpr();
        if (pos < s.length && s[pos] === ')') pos++;
        const val = fn(arg);
        if (pos < s.length && s[pos] === '!') { pos++; return factorial(val); }
        return val;
      }
    }
    let numStr = '';
    while (pos < s.length && (/[0-9.]/).test(s[pos])) { numStr += s[pos++]; }
    if (numStr === '') throw new Error('Unexpected character');
    let val = parseFloat(numStr);
    if (pos < s.length && s[pos] === '!') { pos++; val = factorial(val); }
    if (pos < s.length && s[pos] === '%') { pos++; val /= 100; }
    return val;
  }

  const result = parseExpr();
  if (pos !== s.length) throw new Error('Unexpected character');
  return result;
}



export default function ScientificCalculator() {
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<Array<{expr: string; result: string}>>([]);
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');
  const [memory, setMemory] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showFuncs, setShowFuncs] = useState(true);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  const evaluate = useCallback((expression: string) => {
    if (!expression.trim()) return;
    try {
      const val = evalScientific(expression, angleMode === 'deg');
      const resultStr = Number.isInteger(val) && Math.abs(val) < 1e15 ? String(val) : parseFloat(val.toPrecision(12)).toString();
      setResult(resultStr);
      setError('');
      setHistory(prev => [...prev, { expr: expression, result: resultStr }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
      setResult('');
    }
  }, [angleMode]);

  const insertText = useCallback((text: string) => {
    setExpr(prev => prev + text);
    setError('');
    inputRef.current?.focus();
  }, []);

  const handleFunction = useCallback((fn: string, suffix = '(') => {
    setExpr(prev => prev + fn + suffix);
    inputRef.current?.focus();
  }, []);

  const handleClear = useCallback(() => { setExpr(''); setResult(''); setError(''); }, []);
  const handleBackspace = useCallback(() => { setExpr(prev => prev.slice(0, -1)); }, []);

  const handleEquals = useCallback(() => {
    if (!expr.trim()) return;
    evaluate(expr);
    setExpr('');
  }, [expr, evaluate]);

  const handleMemory = useCallback((op: 'clear' | 'recall' | 'add' | 'subtract') => {
    if (op === 'clear') { setMemory(null); return; }
    if (op === 'recall' && memory !== null) { setExpr(prev => prev + String(memory)); return; }
    const current = result ? parseFloat(result) : NaN;
    if (isNaN(current)) return;
    if (op === 'add') setMemory(m => (m ?? 0) + current);
    if (op === 'subtract') setMemory(m => (m ?? 0) - current);
  }, [result, memory]);

  const recallHistory = useCallback((entry: { expr: string; result: string }) => {
    setExpr(entry.expr);
    setResult(entry.result);
    setShowHistory(false);
  }, []);

  const copyResult = useCallback(() => {
    if (result) { navigator.clipboard.writeText(result); toast.success('Result copied'); }
  }, [result]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      const key = e.key;
      if (key === 'Enter') { e.preventDefault(); handleEquals(); return; }
      if (key === 'Escape') { handleClear(); return; }
      if (key === 'Backspace') { e.preventDefault(); handleBackspace(); return; }
      if (key === 'Delete') { handleClear(); return; }
      if (/^[0-9.]$/.test(key)) { insertText(key); return; }
      if (key === '+') { insertText('+'); return; }
      if (key === '-') { insertText('-'); return; }
      if (key === '*') { insertText('*'); return; }
      if (key === '/') { insertText('/'); return; }
      if (key === '^') { insertText('^'); return; }
      if (key === '(' || key === ')') { insertText(key); return; }
      if (key === '%') { insertText('%'); return; }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [insertText, handleClear, handleBackspace, handleEquals]);

  const evalDisplay = expr.replace(/\*/g, '\u00d7').replace(/\//g, '\u00f7');
  const btnBase = `h-11 sm:h-12 rounded-xl font-semibold text-sm sm:text-base transition-all active:scale-95 select-none flex items-center justify-center`;
  const btnNum = `${btnBase} bg-[var(--bg-overlay)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)]`;
  const btnOp = `${btnBase} bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20`;
  const btnEq = `${btnBase} bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-lg`;
  const btnFn = `${btnBase} bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs`;
  const btnClr = `${btnBase} bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/20`;
  const btnMem = `${btnBase} bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-500/20 text-xs`;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Scientific Calculator</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowHistory(!showHistory)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${showHistory ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-400' : 'bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              History {history.length > 0 && `(${history.length})`}
            </button>
            <button onClick={() => setShowFuncs(!showFuncs)} className="px-3 py-1 rounded-lg text-xs font-medium bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              {showFuncs ? 'Basic' : 'Sci'}
            </button>
            <button onClick={() => setAngleMode(m => m === 'deg' ? 'rad' : 'deg')} className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${angleMode === 'deg' ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-400' : 'bg-amber-500/20 text-amber-700 dark:text-amber-400'}`}>
              {angleMode.toUpperCase()}
            </button>
          </div>
        </div>
        <div className="mx-4 mb-3 bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)] p-4 min-h-[88px] flex flex-col justify-end">
          <div className="text-right text-sm text-[var(--text-secondary)] font-mono break-all min-h-[20px]">
            {evalDisplay || <span className="opacity-30">0</span>}
          </div>
          <div className="flex items-center justify-between mt-1">
            <div className="text-xs text-[var(--text-tertiary)]">{memory !== null && <span className="text-purple-700 dark:text-purple-400 font-bold">M</span>}</div>
            <div className="flex items-center gap-2">
              {result && (
                <>
                  <span role="status" className="text-2xl font-bold text-[var(--text-primary)] font-mono">{result}</span>
                  <button onClick={copyResult} className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors" title="Copy result" aria-label="Copy result"><Copy size={16} /></button>
                </>
              )}
              {error && <span className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</span>}
            </div>
          </div>
        </div>
        {showHistory && (
          <div ref={historyRef} className="mx-4 mb-3 bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)] max-h-40 overflow-y-auto">
            {history.length === 0 ? (
              <div className="p-4 text-center text-sm text-[var(--text-tertiary)]">No history yet</div>
            ) : (
              [...history].reverse().map((entry, i) => (
                <button key={i} onClick={() => recallHistory(entry)} className="w-full text-left px-4 py-2 hover:bg-[var(--bg-elevated)] transition-colors border-b border-[var(--border-subtle)] last:border-0">
                  <div className="text-xs text-[var(--text-tertiary)] font-mono">{entry.expr.replace(/\*/g, '\u00d7').replace(/\//g, '\u00f7')}</div>
                  <div className="text-sm font-bold text-[var(--text-primary)] font-mono">= {entry.result}</div>
                </button>
              ))
            )}
          </div>
        )}
        {showFuncs && (
          <div className="px-4 pb-3">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              <button className={btnFn} onClick={() => handleFunction('sin')}>sin</button>
              <button className={btnFn} onClick={() => handleFunction('cos')}>cos</button>
              <button className={btnFn} onClick={() => handleFunction('tan')}>tan</button>
              <button className={btnFn} onClick={() => handleFunction('asin')}>sin\u207b\u00b9</button>
              <button className={btnFn} onClick={() => handleFunction('acos')}>cos\u207b\u00b9</button>
              <button className={btnFn} onClick={() => handleFunction('atan')}>tan\u207b\u00b9</button>
              <button className={btnFn} onClick={() => handleFunction('log')}>log</button>
              <button className={btnFn} onClick={() => handleFunction('ln')}>ln</button>
              <button className={btnFn} onClick={() => handleFunction('sqrt')}>\u221a</button>
              <button className={btnFn} onClick={() => insertText('^')}>x\u207f</button>
              <button className={btnFn} onClick={() => insertText('!')}>x!</button>
              <button className={btnFn} onClick={() => insertText('1/')}>1/x</button>
              <button className={btnFn} onClick={() => insertText('\u03c0')}>\u03c0</button>
              <button className={btnFn} onClick={() => insertText('e')}>e</button>
              <button className={btnFn} onClick={() => insertText('(')}>(</button>
              <button className={btnFn} onClick={() => insertText(')')}>)</button>
              <button className={btnFn} onClick={() => insertText('**2')}>x\u00b2</button>
              <button className={btnFn} onClick={() => insertText('**3')}>x\u00b3</button>
            </div>
          </div>
        )}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
            <button className={btnMem} onClick={() => handleMemory('clear')}>MC</button>
            <button className={btnMem} onClick={() => handleMemory('recall')}>MR</button>
            <button className={btnMem} onClick={() => handleMemory('add')}>M+</button>
            <button className={btnMem} onClick={() => handleMemory('subtract')}>M-</button>
            <button className={btnClr} onClick={handleClear}>C</button>
            <button className={btnNum} onClick={() => insertText('7')}>7</button>
            <button className={btnNum} onClick={() => insertText('8')}>8</button>
            <button className={btnNum} onClick={() => insertText('9')}>9</button>
            <button className={btnOp} onClick={() => insertText('/')}>\u00f7</button>
            <button className={`${btnBase} bg-[var(--bg-overlay)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)]`} onClick={handleBackspace} aria-label="Backspace"><Delete size={18} /></button>
            <button className={btnNum} onClick={() => insertText('4')}>4</button>
            <button className={btnNum} onClick={() => insertText('5')}>5</button>
            <button className={btnNum} onClick={() => insertText('6')}>6</button>
            <button className={btnOp} onClick={() => insertText('*')}>\u00d7</button>
            <button className={btnFn} onClick={() => insertText('%')}>%</button>
            <button className={btnNum} onClick={() => insertText('1')}>1</button>
            <button className={btnNum} onClick={() => insertText('2')}>2</button>
            <button className={btnNum} onClick={() => insertText('3')}>3</button>
            <button className={btnOp} onClick={() => insertText('-')}>\u2212</button>
            <button className={btnFn} onClick={() => insertText('(-')}>\u00b1</button>
            <button className={`${btnNum} col-span-2`} onClick={() => insertText('0')}>0</button>
            <button className={btnNum} onClick={() => insertText('.')}>.</button>
            <button className={btnOp} onClick={() => insertText('+')}>+</button>
            <button className={btnEq} onClick={handleEquals}>=</button>
          </div>
        </div>
      </div>
      <div className="mt-3 text-center">
        <span className="text-xs text-[var(--text-tertiary)]">Keyboard supported \u00b7 Enter to evaluate \u00b7 Esc to clear</span>
      </div>
    </div>
  );
}

"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Copy, Delete } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { CalculatorShell } from './shared/CalculatorShell';
import { Section } from './MiscToolsShared';
import { gradePointsMap, gcd, factorial, inputCls, labelCls, btnCls } from './Calculators.shared';

export function SquareRootCalculator() {
  const [number, setNumber] = useState('144');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const n = parseFloat(number) || 0;
    if (n < 0) { setResult('Cannot calculate square root of a negative number.'); return; }
    const sqrt = Math.sqrt(n);
    const cubeRoot = Math.cbrt(n);
    setResult(`\u221a${n} = ${sqrt.toFixed(6)}\n\u221b${n} = ${cubeRoot.toFixed(6)}\n${n} = ${sqrt.toFixed(4)}²`);
  }, [number]);
  const presets = [
    { label: '\u221a144', apply: () => { setNumber('144'); } },
    { label: '\u221a2', apply: () => { setNumber('2'); } },
    { label: '\u221a10000', apply: () => { setNumber('10000'); } },
  ];
  const n = parseFloat(number) || 0;
  const sqrt = Math.sqrt(Math.max(0, n));
  return (
    <CalculatorShell title="Square Root Calculator" result={result} onCalculate={calc} presets={presets} accent="sky">
      <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Number</label><input type="number" value={number} onChange={e => setNumber(e.target.value)} className={inputCls} /></div>
      {result && n >= 0 && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-tertiary)]">\u221a{n}</div>
          <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">{sqrt.toFixed(4)}</div>
        </div>
      )}
    </CalculatorShell>
  );
}

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


export function ScientificCalculator() {
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
          <h1 className="text-lg font-bold text-[var(--text-primary)]">Scientific Calculator</h1>
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
                  <span className="text-2xl font-bold text-[var(--text-primary)] font-mono">{result}</span>
                  <button onClick={copyResult} className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors" title="Copy result"><Copy size={16} /></button>
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
            <button className={`${btnBase} bg-[var(--bg-overlay)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)]`} onClick={handleBackspace}><Delete size={18} /></button>
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


export function FluidTypographyCalculator() {
  const [base, setBase] = useState('16');
  const [minVw, setMinVw] = useState('320');
  const [maxVw, setMaxVw] = useState('1440');
  const [scale, setScale] = useState('1.25');
  const [minSize, setMinSize] = useState('');
  const [maxSize, setMaxSize] = useState('');
  const [result, setResult] = useState<Array<{size: string; value: number}>>([]);
  const [fontSizes, setFontSizes] = useState<Array<{level: number; cls: string}>>([]);
  const calc = useCallback(() => {
    const b = parseFloat(base) || 16;
    const mn = parseFloat(minVw) || 320;
    const mx = parseFloat(maxVw) || 1440;
    const s = parseFloat(scale) || 1.25;
    const minClamp = parseFloat(minSize) || b * 0.75;
    const maxClamp = parseFloat(maxSize) || b * 1.5;
    const levels = [-2, -1, 0, 1, 2, 3, 4, 5];
    const sizes = levels.map(l => {
      const val = b * Math.pow(s, l);
      const clampMin = Math.max(minClamp, val * 0.7);
      const clampMax = Math.max(maxClamp, val * 1.2);
      const slope = (clampMax - clampMin) / (mx - mn);
      const intercept = clampMin - slope * mn;
      const desktop = Math.round(val * 10) / 10;
      const cls = `${Math.round(l === 0 ? b * 100 : val * 100) / 100}`;
      return { size: l <= 0 ? `h${Math.abs(l) + 6}` : `h${6 - l}`, value: desktop, level: l };
    });
    setResult(sizes);
    setFontSizes([]);
  }, [base, minVw, maxVw, scale, minSize, maxSize]);
  const b2 = parseFloat(base) || 16;
  const mn2 = parseFloat(minVw) || 320;
  const mx2 = parseFloat(maxVw) || 1440;
  const minSz = parseFloat(minSize) || b2 * 0.75;
  const maxSz = parseFloat(maxSize) || b2 * 1.2;
  const slope2 = ((maxSz - minSz) / (mx2 - mn2) * 100).toFixed(4);
  const intercept2 = (minSz - mn2 * (maxSz - minSz) / (mx2 - mn2)).toFixed(2);
  const cssClamp = `font-size: clamp(${minSz.toFixed(1)}px, ${slope2}vw + ${intercept2}px, ${maxSz.toFixed(1)}px);`;
  return (
    <Section title="Fluid Typography">
      <div className="max-w-xl">
        <button onClick={calc} className="mb-4 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition-colors">Generate Type Scale</button>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Base Font Size (px)</label><input className={inputCls} value={base} onChange={e => setBase(e.target.value)} /></div>
          <div><label className={labelCls}>Scale Ratio</label><input className={inputCls} value={scale} onChange={e => setScale(e.target.value)} /></div>
          <div><label className={labelCls}>Min Viewport (px)</label><input className={inputCls} value={minVw} onChange={e => setMinVw(e.target.value)} /></div>
          <div><label className={labelCls}>Max Viewport (px)</label><input className={inputCls} value={maxVw} onChange={e => setMaxVw(e.target.value)} /></div>
          <div><label className={labelCls}>Min Clamp (px, optional)</label><input className={inputCls} value={minSize} onChange={e => setMinSize(e.target.value)} placeholder="Auto" /></div>
          <div><label className={labelCls}>Max Clamp (px, optional)</label><input className={inputCls} value={maxSize} onChange={e => setMaxSize(e.target.value)} placeholder="Auto" /></div>
        </div>
        {result.length > 0 && (
          <div className="mt-6">
            <div className="text-sm font-bold text-[var(--text-primary)] mb-3">Type Scale</div>
            <div className="grid gap-3">
              {result.reverse().map((r, i) => {
                const baseRatio = r.value / (parseFloat(base) || 16);
                const bg = baseRatio >= 2 ? 'bg-purple-500/10 border border-purple-500/20' : baseRatio >= 1.5 ? 'bg-blue-500/10' : baseRatio <= 0.7 ? 'bg-rose-500/10' : 'bg-[var(--bg-overlay)]';
                return (
                  <div key={i} className={`flex items-center justify-between p-4 rounded-xl ${bg}`}>
                    <div>
                      <span className="text-sm font-mono font-bold text-[var(--text-primary)]">{r.size}</span>
                      <span className="text-xs text-[var(--text-tertiary)] ml-2">{baseRatio >= 2 ? 'Display' : baseRatio <= 0.7 ? 'Caption' : 'Body'}</span>
                    </div>
                    <span className="text-lg font-bold text-[var(--text-primary)] font-mono">{r.value}px</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
              <div className="text-xs text-[var(--text-tertiary)] mb-2">CSS clamp() formula (base):</div>
              <code className="text-xs font-mono text-purple-700 dark:text-purple-400 break-all">{cssClamp}</code>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}

export function AbTestCalculator() {
  const [controlVisitors, setControlVisitors] = useState('1000');
  const [controlConversions, setControlConversions] = useState('100');
  const [variantVisitors, setVariantVisitors] = useState('1000');
  const [variantConversions, setVariantConversions] = useState('120');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const cv = parseFloat(controlVisitors) || 0;
    const cc = parseFloat(controlConversions) || 0;
    const vv = parseFloat(variantVisitors) || 0;
    const vc = parseFloat(variantConversions) || 0;
    if (!cv || !vv) return;
    const cr1 = cc / cv;
    const cr2 = vc / vv;
    const pPool = (cc + vc) / (cv + vv);
    const se = pPool * (1 - pPool) * (1 / cv + 1 / vv) > 0 ? Math.sqrt(pPool * (1 - pPool) * (1 / cv + 1 / vv)) : 0;
    const z = se > 0 ? (cr2 - cr1) / se : 0;
    const pct = cr1 > 0 ? (cr2 - cr1) / cr1 * 100 : 0;
    const significant = Math.abs(z) > 1.96;
    setResult(`Control Rate: ${(cr1 * 100).toFixed(2)}%\nVariant Rate: ${(cr2 * 100).toFixed(2)}%\nImprovement: ${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%\nZ-Score: ${z.toFixed(3)}\n${significant ? 'Statistically Significant (p < 0.05)' : 'Not statistically significant'}`);
  }, [controlVisitors, controlConversions, variantVisitors, variantConversions]);
  const presets = [
    { label: 'Winner', apply: () => { setControlVisitors('1000'); setControlConversions('100'); setVariantVisitors('1000'); setVariantConversions('130'); } },
    { label: 'Flat', apply: () => { setControlVisitors('1000'); setControlConversions('100'); setVariantVisitors('1000'); setVariantConversions('102'); } },
    { label: 'Loser', apply: () => { setControlVisitors('1000'); setControlConversions('100'); setVariantVisitors('1000'); setVariantConversions('80'); } },
  ];
  const cv = parseFloat(controlVisitors) || 1;
  const cc = parseFloat(controlConversions) || 0;
  const vv = parseFloat(variantVisitors) || 1;
  const vc = parseFloat(variantConversions) || 0;
  const cr1 = cc / cv;
  const cr2 = vc / vv;
  const pct = cr1 > 0 ? (cr2 - cr1) / cr1 * 100 : 0;
  return (
    <CalculatorShell title="A/B Test Calculator" result={result} onCalculate={calc} presets={presets} accent="violet">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Control Visitors</label><input type="number" value={controlVisitors} onChange={e => setControlVisitors(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Control Conversions</label><input type="number" value={controlConversions} onChange={e => setControlConversions(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Variant Visitors</label><input type="number" value={variantVisitors} onChange={e => setVariantVisitors(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Variant Conversions</label><input type="number" value={variantConversions} onChange={e => setVariantConversions(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="space-y-2">
          <div className="flex gap-3">
            <div className="flex-1 bg-[var(--bg-overlay)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Control</div>
              <div className="text-lg font-bold text-[var(--text-primary)]">{(cr1 * 100).toFixed(1)}%</div>
            </div>
            <div className={`flex-1 rounded-xl p-3 text-center border ${pct >= 0 ? 'bg-emerald-700/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
              <div className="text-xs text-[var(--text-tertiary)]">Variant</div>
              <div className={`text-lg font-bold ${pct >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>{(cr2 * 100).toFixed(1)}%</div>
            </div>
          </div>
          <div className="bg-[var(--bg-overlay)] rounded-lg px-3 py-2 text-center">
            <span className={`text-sm font-bold ${pct >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
              {pct >= 0 ? '+' : ''}{pct.toFixed(1)}% {pct >= 0 ? 'improvement' : 'decline'}
            </span>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function ExponentCalculator() {
  const [base, setBase] = useState('2');
  const [exp, setExp] = useState('10');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const b = parseFloat(base) || 0;
    const e = parseFloat(exp) || 0;
    const val = Math.pow(b, e);
    const log10 = Math.log10(val);
    setResult(`${b}^${e} = ${val.toLocaleString()}\nScientific: ${val.toExponential(4)}\nLog10: ${log10.toFixed(4)}`);
  }, [base, exp]);
  const presets = [
    { label: '2^10 (1024)', apply: () => { setBase('2'); setExp('10'); } },
    { label: '10^3 (1000)', apply: () => { setBase('10'); setExp('3'); } },
    { label: '5^4 (625)', apply: () => { setBase('5'); setExp('4'); } },
  ];
  const b = parseFloat(base) || 0;
  const e = parseFloat(exp) || 0;
  const val = Math.pow(b, e);
  return (
    <CalculatorShell title="Exponent Calculator" result={result} onCalculate={calc} presets={presets} accent="pink">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Base</label><input type="number" value={base} onChange={e => setBase(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Exponent</label><input type="number" value={exp} onChange={e => setExp(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-tertiary)]">Result</div>
          <div className="text-xl font-bold text-indigo-700 dark:text-indigo-400 font-mono break-all">{b}^{e} = {val.toLocaleString()}</div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function FinalGradeCalculator() {
  const [grades, setGrades] = useState('85,90,78');
  const [weights, setWeights] = useState('20,30,50');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const g = grades.split(',').map(Number);
    const w = weights.split(',').map(Number);
    let total = 0;
    let weightSum = 0;
    for (let i = 0; i < g.length; i++) {
      total += g[i] * w[i] / 100;
      weightSum += w[i];
    }
    const final = weightSum > 0 ? total / (weightSum / 100) : 0;
    setResult(`Final Grade: ${final.toFixed(2)}%\nWeighted Score: ${total.toFixed(2)}\nTotal Weight: ${weightSum}%`);
  }, [grades, weights]);
  const presets = [
    { label: '3 Assignments', apply: () => { setGrades('85,90,78'); setWeights('20,30,50'); } },
    { label: 'Exam Heavy', apply: () => { setGrades('92,80,70'); setWeights('20,20,60'); } },
  ];
  const g = grades.split(',').map(Number);
  const w = weights.split(',').map(Number);
  let total = 0;
  let weightSum = 0;
  for (let i = 0; i < g.length; i++) { total += g[i] * w[i] / 100; weightSum += w[i]; }
  const final = weightSum > 0 ? total / (weightSum / 100) : 0;
  return (
    <CalculatorShell title="Final Grade Calculator" result={result} onCalculate={calc} presets={presets} accent="lime">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Grades (comma-separated)</label><input type="text" value={grades} onChange={e => setGrades(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Weights (comma-separated, %)</label><input type="text" value={weights} onChange={e => setWeights(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)]">
          <div className="text-center">
            <div className="text-xs text-[var(--text-tertiary)]">Final Grade</div>
            <div className={`text-3xl font-bold ${final >= 90 ? 'text-emerald-700 dark:text-emerald-400' : final >= 80 ? 'text-blue-700 dark:text-blue-400' : final >= 70 ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400'}`}>{final.toFixed(1)}%</div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function GpaCalculator() {
  const [grades, setGrades] = useState('A,B+,A-');
  const [credits, setCredits] = useState('3,4,3');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const g = grades.split(',').map(g => g.trim().toUpperCase());
    const c = credits.split(',').map(Number);
    let totalPoints = 0;
    let totalCredits = 0;
    const details: string[] = [];
    for (let i = 0; i < g.length; i++) {
      const gp = gradePointsMap[g[i]] || 0;
      totalPoints += gp * c[i];
      totalCredits += c[i];
      details.push(`${g[i]} (${c[i]} cr) = ${gp.toFixed(1)} \u00d7 ${c[i]}`);
    }
    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    setResult(`GPA: ${gpa.toFixed(2)}\nTotal Points: ${totalPoints.toFixed(1)}\nTotal Credits: ${totalCredits}`);
  }, [grades, credits]);
  const presets = [
    { label: 'Dean\'s List', apply: () => { setGrades('A,A-,B+'); setCredits('3,4,3'); } },
    { label: 'Average Semester', apply: () => { setGrades('B,B+,C+'); setCredits('3,3,4'); } },
  ];
  return (
    <CalculatorShell title="GPA Calculator" result={result} onCalculate={calc} presets={presets} accent="sky">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Grades (e.g., A,B+,A-)</label><input type="text" value={grades} onChange={e => setGrades(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Credits (comma-separated)</label><input type="text" value={credits} onChange={e => setCredits(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (() => {
        const g = grades.split(',').map(g => g.trim().toUpperCase());
        const c = credits.split(',').map(Number);
        let tp = 0, tc = 0;
        for (let i = 0; i < g.length; i++) { tp += (gradePointsMap[g[i]] || 0) * c[i]; tc += c[i]; }
        const gpa = tc > 0 ? tp / tc : 0;
        return (
          <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)]">
            <div className="text-xs text-[var(--text-tertiary)]">GPA</div>
            <div className={`text-3xl font-bold ${gpa >= 3.5 ? 'text-emerald-700 dark:text-emerald-400' : gpa >= 3.0 ? 'text-blue-700 dark:text-blue-400' : gpa >= 2.0 ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400'}`}>{gpa.toFixed(2)}</div>
          </div>
        );
      })()}
    </CalculatorShell>
  );
}

export function GradeCalculator() {
  const [percentage, setPercentage] = useState('85');
  const [result, setResult] = useState('');
  const getLetter = (p: number) => { if (p >= 93) return 'A'; if (p >= 90) return 'A-'; if (p >= 87) return 'B+'; if (p >= 83) return 'B'; if (p >= 80) return 'B-'; if (p >= 77) return 'C+'; if (p >= 73) return 'C'; if (p >= 70) return 'C-'; if (p >= 67) return 'D+'; if (p >= 60) return 'D'; return 'F'; };
  const calc = useCallback(() => {
    const p = parseFloat(percentage) || 0;
    const letter = getLetter(p);
    const passed = letter !== 'F';
    setResult(`Letter Grade: ${letter}\nPercentage: ${p}%\n${passed ? 'Passed' : 'Failed'}`);
  }, [percentage]);
  const presets = [
    { label: 'Excellent (A)', apply: () => { setPercentage('95'); } },
    { label: 'Passing (D)', apply: () => { setPercentage('65'); } },
    { label: 'Failing (F)', apply: () => { setPercentage('55'); } },
  ];
  const p = parseFloat(percentage) || 0;
  const letter = getLetter(p);
  const colorMap: Record<string, string> = { 'A': 'text-emerald-700 dark:text-emerald-400', 'A-': 'text-emerald-700 dark:text-emerald-400', 'B+': 'text-blue-700 dark:text-blue-400', 'B': 'text-blue-700 dark:text-blue-400', 'B-': 'text-blue-700 dark:text-blue-400', 'C+': 'text-amber-700 dark:text-amber-400', 'C': 'text-amber-700 dark:text-amber-400', 'C-': 'text-amber-700 dark:text-amber-400', 'D+': 'text-orange-700 dark:text-orange-400', 'D': 'text-orange-700 dark:text-orange-400', 'F': 'text-red-700 dark:text-red-400' };
  return (
    <CalculatorShell title="Grade Calculator" result={result} onCalculate={calc} presets={presets} accent="fuchsia">
      <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Percentage (%)</label><input type="number" value={percentage} onChange={e => setPercentage(e.target.value)} className={inputCls} /></div>
      {result && (
        <div className="space-y-2">
          <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)]">
            <div className={`text-5xl font-bold ${colorMap[letter] || 'text-indigo-700 dark:text-indigo-400'}`}>{letter}</div>
          </div>
          <div className="h-3 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${p >= 60 ? 'bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500' : 'bg-red-500'}`} style={{ width: `${p}%` }} />
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function CollegeGpaCalculator() {
  const [semGrades, setSemGrades] = useState('A,B+,A-');
  const [semCredits, setSemCredits] = useState('3,4,3');
  const [prevGpa, setPrevGpa] = useState('3.5');
  const [prevCredits, setPrevCredits] = useState('30');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const g = semGrades.split(',').map(g => g.trim().toUpperCase());
    const c = semCredits.split(',').map(Number);
    let totalPoints = 0;
    let totalCredits = 0;
    for (let i = 0; i < g.length; i++) {
      totalPoints += (gradePointsMap[g[i]] || 0) * c[i];
      totalCredits += c[i];
    }
    const semGpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    const pg = parseFloat(prevGpa) || 0;
    const pc = parseFloat(prevCredits) || 0;
    const cumPoints = pg * pc + totalPoints;
    const cumCredits = pc + totalCredits;
    const cumGpa = cumCredits > 0 ? cumPoints / cumCredits : 0;
    const change = cumGpa - pg;
    setResult(`Semester GPA: ${semGpa.toFixed(2)}\nCumulative GPA: ${cumGpa.toFixed(2)}\nChange: ${change >= 0 ? '+' : ''}${change.toFixed(3)}`);
  }, [semGrades, semCredits, prevGpa, prevCredits]);
  const presets = [
    { label: 'First Semester', apply: () => { setSemGrades('A,B+,A-'); setSemCredits('3,4,3'); setPrevGpa('0'); setPrevCredits('0'); } },
    { label: 'Junior Year', apply: () => { setSemGrades('A-,A,B'); setSemCredits('4,3,3'); setPrevGpa('3.2'); setPrevCredits('60'); } },
  ];
  return (
    <CalculatorShell title="College GPA Calculator" result={result} onCalculate={calc} presets={presets} accent="purple">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Semester Grades (e.g., A,B+,A-)</label><input type="text" value={semGrades} onChange={e => setSemGrades(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Semester Credits</label><input type="text" value={semCredits} onChange={e => setSemCredits(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Previous GPA</label><input type="number" value={prevGpa} onChange={e => setPrevGpa(e.target.value)} step="0.01" className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Previous Credits</label><input type="number" value={prevCredits} onChange={e => setPrevCredits(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (() => {
        const g = semGrades.split(',').map(g => g.trim().toUpperCase());
        const c = semCredits.split(',').map(Number);
        let tp = 0, tc = 0;
        for (let i = 0; i < g.length; i++) { tp += (gradePointsMap[g[i]] || 0) * c[i]; tc += c[i]; }
        const semGpa = tc > 0 ? tp / tc : 0;
        const pg = parseFloat(prevGpa) || 0;
        const pc = parseFloat(prevCredits) || 0;
        const cumGpa = (pg * pc + tp) / (pc + tc);
        return (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-indigo-500/10 rounded-xl p-3 text-center border border-indigo-500/20">
              <div className="text-xs text-[var(--text-tertiary)]">Semester GPA</div>
              <div className="text-xl font-bold text-indigo-700 dark:text-indigo-400">{semGpa.toFixed(2)}</div>
            </div>
            <div className="bg-emerald-700/10 rounded-xl p-3 text-center border border-emerald-500/20">
              <div className="text-xs text-[var(--text-tertiary)]">Cumulative GPA</div>
              <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{cumGpa.toFixed(2)}</div>
            </div>
          </div>
        );
      })()}
    </CalculatorShell>
  );
}

export function LeapYearCalculator() {
  const [year, setYear] = useState('2026');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const y = parseInt(year);
    const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    const nextLeap = isLeap ? y : (() => { let n = y; while (!((n % 4 === 0 && n % 100 !== 0) || n % 400 === 0)) n++; return n; })();
    setResult(`${y} is ${isLeap ? '' : 'not '}a leap year\nNext leap year: ${nextLeap}\nDays in ${y}: ${isLeap ? 366 : 365}`);
  }, [year]);
  const presets = [
    { label: '2024 (Leap)', apply: () => { setYear('2024'); } },
    { label: '2026 (No)', apply: () => { setYear('2026'); } },
    { label: '2000 (Leap)', apply: () => { setYear('2000'); } },
  ];
  const y = parseInt(year);
  const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  return (
    <CalculatorShell title="Leap Year Calculator" result={result} onCalculate={calc} presets={presets} accent="red">
      <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Year</label><input type="number" value={year} onChange={e => setYear(e.target.value)} className={inputCls} /></div>
      {result && (
        <div className={`bg-[var(--bg-overlay)] rounded-xl p-4 text-center border ${isLeap ? 'border-emerald-500/20' : 'border-amber-500/20'}`}>
          <div className={`text-3xl font-bold ${isLeap ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>{isLeap ? 'Leap Year' : 'Not a Leap Year'}</div>
          <div className="text-xs text-[var(--text-tertiary)] mt-1">{isLeap ? '366 days' : '365 days'}</div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function ProbabilityCalculator() {
  const [favorable, setFavorable] = useState('3');
  const [total, setTotal] = useState('10');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const f = parseFloat(favorable) || 0;
    const t = parseFloat(total) || 0;
    if (!t) return;
    const prob = f / t;
    const pct = prob * 100;
    const odds = `${f}:${t - f}`;
    setResult(`Probability: ${pct.toFixed(2)}%\nOdds: ${odds}\nFraction: ${f}/${t}\nDecimal: ${prob.toFixed(4)}`);
  }, [favorable, total]);
  const presets = [
    { label: 'Coin Flip', apply: () => { setFavorable('1'); setTotal('2'); } },
    { label: 'Dice Roll', apply: () => { setFavorable('1'); setTotal('6'); } },
    { label: 'Deck of Cards', apply: () => { setFavorable('13'); setTotal('52'); } },
  ];
  const f = parseFloat(favorable) || 0;
  const t = parseFloat(total) || 1;
  const pct = (f / t) * 100;
  return (
    <CalculatorShell title="Probability Calculator" result={result} onCalculate={calc} presets={presets} accent="green">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Favorable Outcomes</label><input type="number" value={favorable} onChange={e => setFavorable(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Total Possible Outcomes</label><input type="number" value={total} onChange={e => setTotal(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-[var(--bg-overlay)] rounded-xl p-3 border border-[var(--border-subtle)]">
            <span className="text-sm text-[var(--text-secondary)]">Probability</span>
            <span className="text-xl font-bold text-indigo-700 dark:text-indigo-400">{pct.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function ProportionCalculator() {
  const [a, setA] = useState('2');
  const [b, setB] = useState('5');
  const [c, setC] = useState('8');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const na = parseFloat(a) || 0;
    const nb = parseFloat(b) || 0;
    const nc = parseFloat(c) || 0;
    if (!na) return;
    const d = (nb * nc) / na;
    setResult(`${na} : ${nb} = ${nc} : ${d.toFixed(4)}\nMissing value (D) = ${d.toFixed(4)}`);
  }, [a, b, c]);
  const presets = [
    { label: '2:5 = 8:?', apply: () => { setA('2'); setB('5'); setC('8'); } },
    { label: '3:4 = 12:?', apply: () => { setA('3'); setB('4'); setC('12'); } },
    { label: '1:10 = 5:?', apply: () => { setA('1'); setB('10'); setC('5'); } },
  ];
  const na = parseFloat(a) || 0;
  const nb = parseFloat(b) || 0;
  const nc = parseFloat(c) || 0;
  const d = na ? (nb * nc) / na : 0;
  return (
    <CalculatorShell title="Proportion Calculator" result={result} onCalculate={calc} presets={presets} accent="indigo">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">A</label><input type="number" value={a} onChange={e => setA(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">B (first ratio)</label><input type="number" value={b} onChange={e => setB(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">C (solve D)</label><input type="number" value={c} onChange={e => setC(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)] font-mono text-lg">
          <span className="text-[var(--text-primary)]">{na} : {nb} = {nc} : <span className="text-indigo-700 dark:text-indigo-400 font-bold">{d.toFixed(2)}</span></span>
        </div>
      )}
    </CalculatorShell>
  );
}

export function RatioCalculator() {
  const [num1, setNum1] = useState('12');
  const [num2, setNum2] = useState('8');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const n1 = parseInt(num1) || 0;
    const n2 = parseInt(num2) || 0;
    if (!n1 || !n2) return;
    const g = gcd(n1, n2);
    const pct = (n1 / n2) * 100;
    setResult(`Simplified Ratio: ${n1 / g} : ${n2 / g}\nProportion: ${pct.toFixed(1)}% (${n1} is ${pct.toFixed(1)}% of ${n2})`);
  }, [num1, num2]);
  const presets = [
    { label: '12:8', apply: () => { setNum1('12'); setNum2('8'); } },
    { label: '16:9 (HD)', apply: () => { setNum1('16'); setNum2('9'); } },
    { label: '100:75', apply: () => { setNum1('100'); setNum2('75'); } },
  ];
  const n1 = parseInt(num1) || 0;
  const n2 = parseInt(num2) || 1;
  const g = gcd(n1, n2);
  return (
    <CalculatorShell title="Ratio Calculator" result={result} onCalculate={calc} presets={presets} accent="blue">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">First Number</label><input type="number" value={num1} onChange={e => setNum1(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Second Number</label><input type="number" value={num2} onChange={e => setNum2(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)]">
          <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{n1 / g} : {n2 / g}</div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function AspectRatioCalculator() {
  const [width, setWidth] = useState('1920');
  const [height, setHeight] = useState('1080');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const w = parseInt(width) || 0;
    const h = parseInt(height) || 0;
    if (!w || !h) return;
    const g = gcd(w, h);
    const ratio = (w / g) / (h / g);
    setResult(`Aspect Ratio: ${w / g}:${h / g}\nRatio: ${ratio.toFixed(3)}:1\n(${w} \u00d7 ${h})`);
  }, [width, height]);
  const presets = [
    { label: 'HD 16:9', apply: () => { setWidth('1920'); setHeight('1080'); } },
    { label: '4:3', apply: () => { setWidth('1024'); setHeight('768'); } },
    { label: 'Ultrawide 21:9', apply: () => { setWidth('2560'); setHeight('1080'); } },
  ];
  const w = parseInt(width) || 0;
  const h = parseInt(height) || 1;
  const g = gcd(w, h);
  const commonRatios = ['16:9', '4:3', '21:9', '3:2', '1:1', '5:4'];
  const match = commonRatios.find(r => { const [rw, rh] = r.split(':').map(Number); return w / h === rw / rh; });
  return (
    <CalculatorShell title="Aspect Ratio Calculator" result={result} onCalculate={calc} presets={presets} accent="emerald">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Width (px)</label><input type="number" value={width} onChange={e => setWidth(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Height (px)</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)]">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{w / g}:{h / g}</div>
            {match && <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">Common: {match}</div>}
          </div>
          <div className="mt-3 bg-[var(--bg-elevated)] rounded-lg h-24 flex items-center justify-center" style={{ aspectRatio: `${w / g}/${h / g}` }}>
            <div className="text-xs text-[var(--text-tertiary)]">{w} \u00d7 {h}</div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function CircleCalculator() {
  const [radius, setRadius] = useState('5');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const r = parseFloat(radius) || 0;
    const area = Math.PI * r * r;
    const circumference = 2 * Math.PI * r;
    const diameter = 2 * r;
    setResult(`Radius: ${r}\nDiameter: ${diameter}\nArea: ${area.toFixed(4)}\nCircumference: ${circumference.toFixed(4)}`);
  }, [radius]);
  const presets = [
    { label: 'r=1', apply: () => { setRadius('1'); } },
    { label: 'r=5', apply: () => { setRadius('5'); } },
    { label: 'r=10', apply: () => { setRadius('10'); } },
  ];
  const r = parseFloat(radius) || 0;
  const area = Math.PI * r * r;
  return (
    <CalculatorShell title="Circle Calculator" result={result} onCalculate={calc} presets={presets} accent="violet">
      <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Radius</label><input type="number" value={radius} onChange={e => setRadius(e.target.value)} step="0.1" className={inputCls} /></div>
      {result && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-indigo-500/10 rounded-xl p-3 text-center border border-indigo-500/20">
            <div className="text-xs text-[var(--text-tertiary)]">Area</div>
            <div className="text-lg font-bold text-indigo-700 dark:text-indigo-400">{area.toFixed(1)}</div>
          </div>
          <div className="bg-emerald-700/10 rounded-xl p-3 text-center border border-emerald-500/20">
            <div className="text-xs text-[var(--text-tertiary)]">Circumference</div>
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{(2 * Math.PI * r).toFixed(1)}</div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function DpiCalculator() {
  const [pixels, setPixels] = useState('1920');
  const [inches, setInches] = useState('13.3');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const p = parseFloat(pixels) || 0;
    const i = parseFloat(inches) || 0;
    if (!i) return;
    const dpi = p / i;
    const dotPitch = 25.4 / dpi;
    setResult(`DPI: ${dpi.toFixed(2)}\nDot Pitch: ${dotPitch.toFixed(4)} mm\nTotal Dots: ${p}`);
  }, [pixels, inches]);
  const presets = [
    { label: 'MacBook 13\"', apply: () => { setPixels('2560'); setInches('13.3'); } },
    { label: 'Full HD 24\"', apply: () => { setPixels('1920'); setInches('24'); } },
    { label: 'Phone 6.1\"', apply: () => { setPixels('2532'); setInches('6.1'); } },
  ];
  const p = parseFloat(pixels) || 0;
  const i = parseFloat(inches) || 1;
  const dpi = p / i;
  return (
    <CalculatorShell title="DPI Calculator" result={result} onCalculate={calc} presets={presets} accent="amber">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Pixels</label><input type="number" value={pixels} onChange={e => setPixels(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Inches</label><input type="number" value={inches} onChange={e => setInches(e.target.value)} step="0.1" className={inputCls} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-tertiary)]">Dots Per Inch</div>
          <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">{dpi.toFixed(0)}</div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function FractionCalculator() {
  const [frac1, setFrac1] = useState('1/2');
  const [frac2, setFrac2] = useState('1/3');
  const [op, setOp] = useState('+');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const [n1, d1] = frac1.split('/').map(Number);
    const [n2, d2] = frac2.split('/').map(Number);
    if (!d1 || !d2) return;
    let n: number, d: number;
    switch (op) {
      case '+': n = n1 * d2 + n2 * d1; d = d1 * d2; break;
      case '-': n = n1 * d2 - n2 * d1; d = d1 * d2; break;
      case '*': n = n1 * n2; d = d1 * d2; break;
      case '/': n = n1 * d2; d = d1 * n2; break;
      default: n = 0; d = 1;
    }
    const g = gcd(Math.abs(n), Math.abs(d));
    n /= g; d /= g;
    const decimal = n / d;
    setResult(`${frac1} ${op === '*' ? '\u00d7' : op === '/' ? '\u00f7' : op} ${frac2} = ${n}/${d}${d === 1 ? ` = ${n}` : ` = ${decimal.toFixed(4)}`}`);
  }, [frac1, frac2, op]);
  const presets = [
    { label: '1/2 + 1/3', apply: () => { setFrac1('1/2'); setFrac2('1/3'); setOp('+'); } },
    { label: '3/4 * 2/5', apply: () => { setFrac1('3/4'); setFrac2('2/5'); setOp('*'); } },
  ];
  return (
    <CalculatorShell title="Fraction Calculator" result={result} onCalculate={calc} presets={presets} accent="rose">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Fraction 1</label><input type="text" value={frac1} onChange={e => setFrac1(e.target.value)} placeholder="1/2" className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Operation</label><select value={op} onChange={e => setOp(e.target.value)} className={inputCls}>
          <option value="+">+</option><option value="-">-</option><option value="*">\u00d7</option><option value="/">\u00f7</option>
        </select></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Fraction 2</label><input type="text" value={frac2} onChange={e => setFrac2(e.target.value)} placeholder="1/3" className={inputCls} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)] font-mono">
          <div className="text-lg text-[var(--text-primary)]">{result.split('\n')[0]}</div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function MeanMedianModeCalculator() {
  const [numbers, setNumbers] = useState('2,4,4,6,8');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const nums = numbers.split(',').map(Number).sort((a, b) => a - b);
    if (!nums.length || nums.some(isNaN)) return;
    const mean = nums.reduce((s, v) => s + v, 0) / nums.length;
    const mid = Math.floor(nums.length / 2);
    const median = nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
    const freq: Record<number, number> = {};
    nums.forEach(v => freq[v] = (freq[v] || 0) + 1);
    let mode = nums[0];
    let maxFreq = 1;
    Object.entries(freq).forEach(([k, v]) => { if (v > maxFreq) { maxFreq = v; mode = Number(k); } });
    const range = nums[nums.length - 1] - nums[0];
    setResult(`Mean: ${mean.toFixed(4)}\nMedian: ${median}\nMode: ${mode}\nRange: ${range}\nCount: ${nums.length}`);
  }, [numbers]);
  const presets = [
    { label: '2,4,4,6,8', apply: () => { setNumbers('2,4,4,6,8'); } },
    { label: '1,2,3,4,5', apply: () => { setNumbers('1,2,3,4,5'); } },
    { label: '10,20,30', apply: () => { setNumbers('10,20,30'); } },
  ];
  const nums = numbers.split(',').map(Number).sort((a, b) => a - b);
  const mean = nums.length ? nums.reduce((s, v) => s + v, 0) / nums.length : 0;
  return (
    <CalculatorShell title="Mean Median Mode Calculator" result={result} onCalculate={calc} presets={presets} accent="cyan">
      <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Numbers (comma-separated)</label><input type="text" value={numbers} onChange={e => setNumbers(e.target.value)} className={inputCls} /></div>
      {result && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-indigo-500/10 rounded-xl p-3 text-center border border-indigo-500/20">
            <div className="text-xs text-[var(--text-tertiary)]">Mean</div>
            <div className="text-lg font-bold text-indigo-700 dark:text-indigo-400">{mean.toFixed(2)}</div>
          </div>
          <div className="bg-emerald-700/10 rounded-xl p-3 text-center border border-emerald-500/20">
            <div className="text-xs text-[var(--text-tertiary)]">Median</div>
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{nums.length ? (nums.length % 2 ? nums[Math.floor(nums.length / 2)] : ((nums[nums.length / 2 - 1] + nums[nums.length / 2]) / 2)) : 0}</div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}


export function PpiCalculator() {
  const [diagPixels, setDiagPixels] = useState('2200');
  const [diagInches, setDiagInches] = useState('6.1');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const p = parseFloat(diagPixels) || 0;
    const i = parseFloat(diagInches) || 0;
    if (!i) return;
    const ppi = p / i;
    const dotPitch = 25.4 / ppi;
    setResult(`PPI: ${ppi.toFixed(2)}\nDot Pitch: ${dotPitch.toFixed(4)} mm`);
  }, [diagPixels, diagInches]);
  const presets = [
    { label: 'iPhone 6.1\"', apply: () => { setDiagPixels('2532'); setDiagInches('6.1'); } },
    { label: '27\" Monitor', apply: () => { setDiagPixels('3840'); setDiagInches('27'); } },
    { label: '15\" Laptop', apply: () => { setDiagPixels('1920'); setDiagInches('15.6'); } },
  ];
  const p = parseFloat(diagPixels) || 0;
  const i = parseFloat(diagInches) || 1;
  const ppi = p / i;
  return (
    <CalculatorShell title="PPI Calculator" result={result} onCalculate={calc} presets={presets} accent="orange">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Diagonal Pixels</label><input type="number" value={diagPixels} onChange={e => setDiagPixels(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Diagonal Inches</label><input type="number" value={diagInches} onChange={e => setDiagInches(e.target.value)} step="0.1" className={inputCls} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-tertiary)]">Pixels Per Inch</div>
          <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">{ppi.toFixed(0)}</div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function PythagoreanTheoremCalculator() {
  const [a, setA] = useState('3');
  const [b, setB] = useState('4');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const na = parseFloat(a) || 0;
    const nb = parseFloat(b) || 0;
    if (!na || !nb) return;
    const c = Math.sqrt(na * na + nb * nb);
    const area = 0.5 * na * nb;
    const perimeter = na + nb + c;
    setResult(`Hypotenuse (c) = ${c.toFixed(4)}\nArea: ${area.toFixed(4)}\nPerimeter: ${perimeter.toFixed(4)}`);
  }, [a, b]);
  const presets = [
    { label: '3-4-5', apply: () => { setA('3'); setB('4'); } },
    { label: '5-12-13', apply: () => { setA('5'); setB('12'); } },
    { label: '6-8-10', apply: () => { setA('6'); setB('8'); } },
  ];
  const na = parseFloat(a) || 0;
  const nb = parseFloat(b) || 0;
  const c = Math.sqrt(na * na + nb * nb);
  return (
    <CalculatorShell title="Pythagorean Theorem" result={result} onCalculate={calc} presets={presets} accent="teal">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Side a</label><input type="number" value={a} onChange={e => setA(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Side b</label><input type="number" value={b} onChange={e => setB(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-tertiary)]">c = \u221a(a\u00b2 + b\u00b2)</div>
          <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">{c.toFixed(2)}</div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function QuadraticEquationSolver() {
  const [a, setA] = useState('1');
  const [b, setB] = useState('-3');
  const [c, setC] = useState('2');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const A = parseFloat(a) || 0;
    const B = parseFloat(b) || 0;
    const C = parseFloat(c) || 0;
    if (!A) { setResult('Coefficient "a" cannot be zero.'); return; }
    const disc = B * B - 4 * A * C;
    if (disc < 0) {
      const real = (-B / (2 * A)).toFixed(4);
      const imag = (Math.sqrt(-disc) / (2 * A)).toFixed(4);
      setResult(`Discriminant: ${disc.toFixed(4)} (negative)\nx = ${real} \u00b1 ${imag}i`);
    } else if (disc === 0) {
      const x = -B / (2 * A);
      setResult(`Discriminant: 0\nx = ${x.toFixed(4)} (one root)`);
    } else {
      const x1 = (-B + Math.sqrt(disc)) / (2 * A);
      const x2 = (-B - Math.sqrt(disc)) / (2 * A);
      setResult(`Discriminant: ${disc.toFixed(4)}\nx\u2081 = ${x1.toFixed(4)}\nx\u2082 = ${x2.toFixed(4)}`);
    }
  }, [a, b, c]);
  const presets = [
    { label: 'x\u00b2-3x+2=0', apply: () => { setA('1'); setB('-3'); setC('2'); } },
    { label: 'x\u00b2-4=0', apply: () => { setA('1'); setB('0'); setC('-4'); } },
    { label: 'x\u00b2+x+1=0', apply: () => { setA('1'); setB('1'); setC('1'); } },
  ];
  const A = parseFloat(a) || 0;
  const B = parseFloat(b) || 0;
  const C = parseFloat(c) || 0;
  const disc = B * B - 4 * A * C;
  return (
    <CalculatorShell title="Quadratic Solver" result={result} onCalculate={calc} presets={presets} accent="pink">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">a</label><input type="number" value={a} onChange={e => setA(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">b</label><input type="number" value={b} onChange={e => setB(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">c</label><input type="number" value={c} onChange={e => setC(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-tertiary)]">Discriminant</div>
          <div className={`text-lg font-bold ${disc >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>{disc.toFixed(2)}</div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function RectangleAreaCalculator() {
  const [length, setLength] = useState('10');
  const [width, setWidth] = useState('5');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const area = l * w;
    const perimeter = 2 * (l + w);
    const diagonal = Math.sqrt(l * l + w * w);
    setResult(`Area: ${area}\nPerimeter: ${perimeter}\nDiagonal: ${diagonal.toFixed(4)}`);
  }, [length, width]);
  const presets = [
    { label: '10 x 5', apply: () => { setLength('10'); setWidth('5'); } },
    { label: 'A4 (29.7x21)', apply: () => { setLength('29.7'); setWidth('21'); } },
    { label: '3 x 4', apply: () => { setLength('3'); setWidth('4'); } },
  ];
  const l = parseFloat(length) || 0;
  const w = parseFloat(width) || 0;
  return (
    <CalculatorShell title="Rectangle Calculator" result={result} onCalculate={calc} presets={presets} accent="lime">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Length</label><input type="number" value={length} onChange={e => setLength(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Width</label><input type="number" value={width} onChange={e => setWidth(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-indigo-500/10 rounded-xl p-3 text-center border border-indigo-500/20">
            <div className="text-xs text-[var(--text-tertiary)]">Area</div>
            <div className="text-lg font-bold text-indigo-700 dark:text-indigo-400">{l * w}</div>
          </div>
          <div className="bg-emerald-700/10 rounded-xl p-3 text-center border border-emerald-500/20">
            <div className="text-xs text-[var(--text-tertiary)]">Perimeter</div>
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{2 * (l + w)}</div>
          </div>
          <div className="bg-[var(--bg-overlay)] rounded-xl p-3 text-center border border-[var(--border-subtle)]">
            <div className="text-xs text-[var(--text-tertiary)]">Diagonal</div>
            <div className="text-lg font-bold text-[var(--text-primary)]">{Math.sqrt(l * l + w * w).toFixed(1)}</div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function TriangleAreaCalculator() {
  const [method, setMethod] = useState<'baseheight'|'sides'|'sas'>('baseheight');
  const [base, setBase] = useState('10');
  const [height, setHeight] = useState('8');
  const [sideA, setSideA] = useState('5');
  const [sideB, setSideB] = useState('6');
  const [sideC, setSideC] = useState('7');
  const [angle, setAngle] = useState('60');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    if (method === 'baseheight') {
      const b = parseFloat(base) || 0;
      const h = parseFloat(height) || 0;
      if (!b || !h) { setResult(''); return; }
      const area = 0.5 * b * h;
      setResult(`Area = \u00bd \u00d7 ${b} \u00d7 ${h} = ${area.toFixed(2)} sq units\n\nFormula: A = \u00bdbh`);
    } else if (method === 'sides') {
      const a = parseFloat(sideA) || 0;
      const b = parseFloat(sideB) || 0;
      const c = parseFloat(sideC) || 0;
      if (!a || !b || !c) { setResult(''); return; }
      const s = (a + b + c) / 2;
      const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
      if (isNaN(area)) { setResult('These side lengths do not form a valid triangle.'); return; }
      setResult(`Area (Heron's formula) = ${area.toFixed(2)} sq units\nSemi-perimeter = ${s.toFixed(2)}\n\nFormula: A = \u221a(s(s-a)(s-b)(s-c))`);
    } else {
      const a = parseFloat(sideA) || 0;
      const b = parseFloat(sideB) || 0;
      const ang = parseFloat(angle) || 0;
      if (!a || !b || !ang) { setResult(''); return; }
      const rad = ang * Math.PI / 180;
      const area = 0.5 * a * b * Math.sin(rad);
      setResult(`Area = \u00bd \u00d7 ${a} \u00d7 ${b} \u00d7 sin(${ang}\u00b0) = ${area.toFixed(2)} sq units`);
    }
  }, [method, base, height, sideA, sideB, sideC, angle]);
  return (
    <CalculatorShell title="Triangle Area Calculator" accent="emerald" result={result} onCalculate={calc}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Method</label><select className={inputCls} value={method} onChange={e => setMethod(e.target.value as 'baseheight'|'sides'|'sas')}><option value="baseheight">Base & Height</option><option value="sides">Three sides (SSS)</option><option value="sas">Two sides & angle (SAS)</option></select></div>
        <div className="opacity-0 pointer-events-none"><label className={labelCls}>_</label><input className={inputCls} /></div>
        {method === 'baseheight' && (<><div><label className={labelCls}>Base</label><input className={inputCls} type="number" value={base} onChange={e => setBase(e.target.value)} /></div><div><label className={labelCls}>Height</label><input className={inputCls} type="number" value={height} onChange={e => setHeight(e.target.value)} /></div></>)}
        {method === 'sides' && (<><div><label className={labelCls}>Side A</label><input className={inputCls} type="number" value={sideA} onChange={e => setSideA(e.target.value)} /></div><div><label className={labelCls}>Side B</label><input className={inputCls} type="number" value={sideB} onChange={e => setSideB(e.target.value)} /></div><div><label className={labelCls}>Side C</label><input className={inputCls} type="number" value={sideC} onChange={e => setSideC(e.target.value)} /></div></>)}
        {method === 'sas' && (<><div><label className={labelCls}>Side A</label><input className={inputCls} type="number" value={sideA} onChange={e => setSideA(e.target.value)} /></div><div><label className={labelCls}>Side B</label><input className={inputCls} type="number" value={sideB} onChange={e => setSideB(e.target.value)} /></div><div><label className={labelCls}>Angle (\u00b0)</label><input className={inputCls} type="number" value={angle} onChange={e => setAngle(e.target.value)} /></div></>)}
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setBase('10'); setHeight('8'); setMethod('baseheight'); }}>Base/Height</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setSideA('5'); setSideB('6'); setSideC('7'); setMethod('sides'); }}>3-4-5</button>
      </div>
    </CalculatorShell>
  );
}

export function GasMileageCalculator() {
  const [distance, setDistance] = useState('300');
  const [gallons, setGallons] = useState('10');
  const [pricePerGallon, setPricePerGallon] = useState('3.50');
  const [unit, setUnit] = useState<'us'|'metric'>('us');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const d = parseFloat(distance) || 0;
    const g = parseFloat(gallons) || 0;
    const p = parseFloat(pricePerGallon) || 0;
    if (!d || !g) { setResult(''); return; }
    if (unit === 'us') {
      const mpg = d / g;
      const cost = g * p;
      const perMile = cost / d;
      setResult(`Fuel economy: ${mpg.toFixed(1)} mpg\nFuel used: ${g.toFixed(1)} gal\nFuel cost: $${cost.toFixed(2)}\nCost per mile: $${perMile.toFixed(3)}`);
    } else {
      const liters = g * 3.78541;
      const km = d * 1.60934;
      const lPer100km = (liters / km) * 100;
      const cost = g * p;
      setResult(`Fuel economy: ${lPer100km.toFixed(1)} L/100km\nFuel used: ${liters.toFixed(1)} L\nFuel cost: $${cost.toFixed(2)}\nCost per km: $${(cost / km).toFixed(3)}`);
    }
  }, [distance, gallons, pricePerGallon, unit]);
  return (
    <CalculatorShell title="Gas Mileage Calculator" accent="amber" result={result} onCalculate={calc}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Unit</label><select className={inputCls} value={unit} onChange={e => setUnit(e.target.value as 'us'|'metric')}><option value="us">US (mi, gal)</option><option value="metric">Metric (km, L)</option></select></div>
        <div className="opacity-0 pointer-events-none"><label className={labelCls}>_</label><input className={inputCls} /></div>
        <div><label className={labelCls}>{unit === 'us' ? 'Distance (miles)' : 'Distance (km)'}</label><input className={inputCls} type="number" value={distance} onChange={e => setDistance(e.target.value)} /></div>
        <div><label className={labelCls}>{unit === 'us' ? 'Gallons used' : 'Gallons used'}</label><input className={inputCls} type="number" value={gallons} onChange={e => setGallons(e.target.value)} /></div>
        <div><label className={labelCls}>Price per gallon ($)</label><input className={inputCls} type="number" value={pricePerGallon} onChange={e => setPricePerGallon(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setDistance('300'); setGallons('10'); setUnit('us'); }}>Avg SUV</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setDistance('400'); setGallons('8'); setUnit('us'); }}>Efficient sedan</button>
      </div>
    </CalculatorShell>
  );
}

export function StandardDeviationCalculator() {
  const [numbers, setNumbers] = useState('10, 12, 23, 23, 16, 23, 21, 16');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const nums = numbers.split(/[,\s]+/).filter(Boolean).map(Number);
    if (nums.length < 2 || nums.some(isNaN)) { setResult('Enter at least 2 numbers.'); return; }
    const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
    const sqDiffs = nums.map(n => Math.pow(n - mean, 2));
    const variance = sqDiffs.reduce((a, b) => a + b, 0) / nums.length;
    const sampleVariance = sqDiffs.reduce((a, b) => a + b, 0) / (nums.length - 1);
    const stdDev = Math.sqrt(variance);
    const sampleStdDev = Math.sqrt(sampleVariance);
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const median = nums.sort((a, b) => a - b)[Math.floor(nums.length / 2)];
    setResult(`Count: ${nums.length}\nMean: ${mean.toFixed(4)}\nMedian: ${median}\nRange: ${min} - ${max}\nPopulation Std Dev: ${stdDev.toFixed(4)}\nSample Std Dev: ${sampleStdDev.toFixed(4)}\nVariance: ${variance.toFixed(4)}`);
  }, [numbers]);
  return (
    <CalculatorShell title="Standard Deviation Calculator" accent="blue" result={result} onCalculate={calc}>
      <div className="max-w-xl">
        <div><label className={labelCls}>Numbers (comma separated)</label><textarea className={`${inputCls} min-h-[80px] resize-none`} value={numbers} onChange={e => setNumbers(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => setNumbers('10, 12, 23, 23, 16, 23, 21, 16')}>Reset example</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => setNumbers('1, 2, 3, 4, 5, 6, 7, 8, 9, 10')}>1-10</button>
      </div>
    </CalculatorShell>
  );
}

export function SemverCalculator() {
  const [v1, setV1] = useState('1.2.3');
  const [v2, setV2] = useState('1.5.0');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const parse = (v: string): number[] => v.replace(/^v/, '').split('.').map(Number);
    const a = parse(v1);
    const b = parse(v2);
    if (a.some(isNaN) || b.some(isNaN) || a.length !== 3 || b.length !== 3) { setResult('Invalid semver format. Use major.minor.patch'); return; }
    const semverCompare = (x: number[], y: number[]): number => {
      for (let i = 0; i < 3; i++) { if (x[i] !== y[i]) return x[i] > y[i] ? 1 : -1; }
      return 0;
    };
    const cmp = semverCompare(a, b);
    const diff = cmp === 0 ? 'Equal' : cmp > 0 ? `${v1} > ${v2}` : `${v1} < ${v2}`;
    const bumpMajor = `${a[0] + 1}.0.0`;
    const bumpMinor = `${a[0]}.${a[1] + 1}.0`;
    const bumpPatch = `${a[0]}.${a[1]}.${a[2] + 1}`;
    setResult(`Comparison: ${diff}\n${v1} -> major: ${bumpMajor}\n${v1} -> minor: ${bumpMinor}\n${v1} -> patch: ${bumpPatch}`);
  }, [v1, v2]);
  return (
    <CalculatorShell title="Semver Calculator" accent="sky" result={result} onCalculate={calc}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Version 1</label><input className={inputCls} value={v1} onChange={e => setV1(e.target.value)} placeholder="1.0.0" /></div>
        <div><label className={labelCls}>Version 2</label><input className={inputCls} value={v2} onChange={e => setV2(e.target.value)} placeholder="2.0.0" /></div>
      </div>
    </CalculatorShell>
  );
}

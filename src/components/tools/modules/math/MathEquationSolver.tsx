"use client";
import { useState } from 'react';
import { ac, borderClass } from '../miscToolColors';
import { Section, Input, labelClass, selClass } from '../MiscToolsShared';
import { CalcActions } from '../shared/CalcActions';

export default function MathEquationSolver() {
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
      <CalcActions result={result} />
      <p className="text-xs text-[var(--text-secondary)] mt-1">Supports linear (ax + b = cx + d) and quadratic (ax² + bx + c = 0) equations.</p>
    </Section>
  );
}

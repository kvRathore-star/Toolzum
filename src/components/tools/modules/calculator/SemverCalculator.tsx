"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function SemverCalculator() {
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
    <CalculatorShell
      title="Semver Calculator"
      accent="sky"
      result={result}
      onCalculate={calc}
      presets={[
        { label: '1.0.0 vs 2.0.0', apply: () => { setV1('1.0.0'); setV2('2.0.0'); } },
        { label: '1.2.3 vs 1.5.0', apply: () => { setV1('1.2.3'); setV2('1.5.0'); } },
        { label: '3.1.0 vs 3.1.0', apply: () => { setV1('3.1.0'); setV2('3.1.0'); } },
      ]}
      downloadData={`Version1,Version2,Result\n${v1},${v2},${result.replace(/\n/g, ' | ')}`}
      downloadFilename="semver-comparison.csv"
    >
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Version 1</label><input className={inputCls} value={v1} onChange={e => setV1(e.target.value)} placeholder="1.0.0" /></div>
        <div><label className={labelCls}>Version 2</label><input className={inputCls} value={v2} onChange={e => setV2(e.target.value)} placeholder="2.0.0" /></div>
      </div>
    </CalculatorShell>
  );
}

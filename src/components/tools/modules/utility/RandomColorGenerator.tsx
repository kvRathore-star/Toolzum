"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';
import { Input, randInt } from './GeneratorsShared';

export default function RandomColorGenerator() {
  const [count, setCount] = useState(5); const [format, setFormat] = useState('hex'); const [colors, setColors] = useState<string[]>([]);
  const generate = () => {
    const c: string[] = [];
    for (let i = 0; i < count; i++) {
      const r = randInt(0, 255);
      const g = randInt(0, 255);
      const b = randInt(0, 255);
      if (format === 'hex') {
        const hexR = r.toString(16).padStart(2, '0');
        const hexG = g.toString(16).padStart(2, '0');
        const hexB = b.toString(16).padStart(2, '0');
        c.push('#' + hexR + hexG + hexB);
      } else if (format === 'rgb') {
        c.push('rgb(' + r + ', ' + g + ', ' + b + ')');
      } else {
        const h = randInt(0, 360);
        const s = randInt(50, 100);
        const l = randInt(40, 60);
        c.push('hsl(' + h + ', ' + s + '%, ' + l + '%)');
      }
    }
    setColors(c);
  };

  const presets = [
    { label: '5 Colors', apply: () => { setCount(5); generate(); } },
    { label: '10 Colors', apply: () => { setCount(10); generate(); } },
    { label: '20 Colors', apply: () => { setCount(20); generate(); } },
    { label: 'Pastel (HSL)', apply: () => { setFormat('hsl'); setCount(8); generate(); } },
    { label: 'Clear', apply: () => { setColors([]); } },
  ];

  const resultText = colors.length > 0 ? 'Generated ' + colors.length + ' ' + format.toUpperCase() + ' colors' : 'Configure and generate';

  const customResult = colors.length > 0 ? (
    <div className="flex flex-col min-h-[120px]">
      <div className="flex flex-wrap gap-3 justify-center">
        {colors.map((c, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="w-14 h-14 rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] shadow-sm" style={{ backgroundColor: c }} />
            <span className="text-[10px] font-mono text-[var(--text-muted)]">{c}</span>
            <button onClick={() => { clipboardWrite(c).then(ok => { if (ok) toast.success('Copied!'); else toast.error('Copy blocked by the browser — select the text manually.'); }); }} className="text-[10px] text-[var(--accent)] hover:underline">Copy</button>
          </div>
        ))}
      </div>
    </div>
  ) : undefined;

  return (
    <CalculatorShell category="Utility"
      title="Random Color Generator"
      result={resultText}
      customResult={customResult}
      onCalculate={generate}
      calculateLabel="Generate"
      presets={presets}
      accent="pink"
      downloadData={JSON.stringify({ format, count, colors }, null, 2)}
      downloadFilename="colors.json"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Count" type="number" value={String(count)} onChange={v => setCount(Number(v))} />
          <div className="mb-3">
            <label htmlFor="lbl-randomcolorgenerator-format" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Format</label>
            <select id="lbl-randomcolorgenerator-format" aria-label="Format" value={format} onChange={e => setFormat(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50">
              <option value="hex">Hex</option>
              <option value="rgb">RGB</option>
              <option value="hsl">HSL</option>
            </select>
          </div>
        </div>
      </div>
    </CalculatorShell>
  );
}

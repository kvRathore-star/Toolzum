"use client";
import { useState } from 'react';
import { Copy, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';
import { Input, COUPON_CHARS, randInt } from './GeneratorsShared';

const COUPON_PRESETS = [
  { name: 'Standard', pattern: 'XXXX-XXXX-XXXX' }, { name: 'Short', pattern: 'XXXX-XXXX' }, { name: 'With Year', pattern: '2026-XXXX-XXXX' }, { name: 'Alphanumeric', pattern: 'XXXXXXXXXXXX' },
];
export default function CouponCodeGenerator() {
  const [pattern, setPattern] = useState('XXXX-XXXX-XXXX'); const [count, setCount] = useState(5); const [codes, setCodes] = useState<string[]>([]);
  const generate = () => { const cs: string[] = []; for (let c = 0; c < count; c++) { let code = ''; for (const ch of pattern) { if (ch === 'X') code += COUPON_CHARS[randInt(0, COUPON_CHARS.length - 1)]; else code += ch; } cs.push(code); } setCodes(cs); };

  const presets = [
    { label: 'Standard (XXXX-XXXX-XXXX)', apply: () => { setPattern('XXXX-XXXX-XXXX'); setCount(5); generate(); } },
    { label: 'Short (XXXX-XXXX)', apply: () => { setPattern('XXXX-XXXX'); setCount(5); generate(); } },
    { label: 'With Year (2026-XXXX-XXXX)', apply: () => { setPattern('2026-XXXX-XXXX'); setCount(5); generate(); } },
    { label: 'Alphanumeric (XXXXXXXXXXXX)', apply: () => { setPattern('XXXXXXXXXXXX'); setCount(5); generate(); } },
    { label: 'Clear', apply: () => { setCodes([]); } },
  ];

  const resultText = codes.length > 0 ? 'Generated ' + codes.length + ' coupons (' + pattern + ')' : 'Configure and generate';

  return (
    <CalculatorShell category="Utility"
      title="Coupon Code Generator"
      result={resultText}
      onCalculate={generate}
      calculateLabel="Generate"
      presets={presets}
      accent="emerald"
      downloadData={codes.join('\n')}
      downloadFilename="coupon-codes.txt"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {COUPON_PRESETS.map(p => (
            <button key={p.name} onClick={() => setPattern(p.pattern)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.name}</button>
          ))}
        </div>
        <Input label="Pattern (X = random char)" value={pattern} onChange={v => setPattern(v)} />
        <Input label="Count" type="number" value={String(count)} onChange={v => setCount(Number(v))} />
        {codes.length > 0 && (
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-4 flex flex-col min-h-[160px]">
            <div className="space-y-1 max-h-[250px] overflow-y-auto">
              {codes.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-[var(--bg-surface)] rounded-lg text-sm font-mono">
                  <span className="tracking-wide">{c}</span>
                  <button aria-label={`Copy coupon code ${c}`} onClick={() => { clipboardWrite(c).then(ok => { if (ok) toast.success('Copied!'); else toast.error('Copy blocked by the browser — select the text manually.'); }); }} className="text-xs text-[var(--accent)] hover:underline"><Copy size={12} /></button>
                </div>
              ))}
              <div className="flex gap-1 mt-2">
                <button onClick={() => { clipboardWrite(codes.join('\n')).then(ok => { if (ok) toast.success('Copied all!'); else toast.error('Copy blocked by the browser — select the text manually.'); }); }} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Copy All</button>
                <button aria-label="Download coupon codes" onClick={() => { const blob = new Blob([codes.join('\n')], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'coupon-codes.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"><Download size={14} /></button>
              </div>
            </div>
          </div>
        )}
        {!codes.length && (
          <p className="text-[var(--text-muted)] text-sm text-center">Configure and generate coupon codes</p>
        )}
      </div>
    </CalculatorShell>
  );
}

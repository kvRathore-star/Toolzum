"use client";
import { useState } from 'react';
import { Copy, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';
import { Input, COUPON_CHARS, randInt } from './GeneratorsShared';

const SERIAL_PRESETS = [
  { name: 'Standard', format: 'XXXX-XXXX-XXXX-XXXX' }, { name: 'Product Key', format: 'XXXXX-XXXXX-XXXXX-XXXXX' }, { name: 'Hex', format: 'XXXXXXXX-XXXXXXXX' }, { name: 'Numeric', format: '9999-9999-9999' },
];
export default function SerialNumberGenerator() {
  const [format, setFormat] = useState('XXXX-XXXX-XXXX-XXXX'); const [count, setCount] = useState(5); const [serials, setSerials] = useState<string[]>([]);
  const generate = () => { const ss: string[] = []; for (let c = 0; c < count; c++) { let s = ''; for (const ch of format) { if (ch === 'X') s += '0123456789ABCDEF'[randInt(0, 15)]; else if (ch === '9') s += randInt(0, 9).toString(); else if (ch === 'A') s += COUPON_CHARS[randInt(0, COUPON_CHARS.length - 1)]; else s += ch; } ss.push(s); } setSerials(ss); };

  const presets = [
    { label: 'Standard (XXXX-XXXX-XXXX-XXXX)', apply: () => { setFormat('XXXX-XXXX-XXXX-XXXX'); setCount(5); generate(); } },
    { label: 'Product Key (XXXXX-XXXXX-XXXXX-XXXXX)', apply: () => { setFormat('XXXXX-XXXXX-XXXXX-XXXXX'); setCount(5); generate(); } },
    { label: 'Hex (XXXXXXXX-XXXXXXXX)', apply: () => { setFormat('XXXXXXXX-XXXXXXXX'); setCount(5); generate(); } },
    { label: 'Numeric (9999-9999-9999)', apply: () => { setFormat('9999-9999-9999'); setCount(5); generate(); } },
    { label: 'Clear', apply: () => { setSerials([]); } },
  ];

  const resultText = serials.length > 0 ? 'Generated ' + serials.length + ' serials (' + format + ')' : 'Configure and generate';

  return (
    <CalculatorShell category="Utility"
      title="Serial Number Generator"
      result={resultText}
      onCalculate={generate}
      calculateLabel="Generate"
      presets={presets}
      accent="cyan"
      downloadData={serials.join('\n')}
      downloadFilename="serials.txt"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {SERIAL_PRESETS.map(p => (
            <button key={p.name} onClick={() => setFormat(p.format)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.name}</button>
          ))}
        </div>
        <Input label="Format (X=hex, 9=digit, A=alphanum)" value={format} onChange={v => setFormat(v)} />
        <Input label="Count" type="number" value={String(count)} onChange={v => setCount(Number(v))} />
        {serials.length > 0 && (
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-4 flex flex-col min-h-[160px]">
            <div className="space-y-1 max-h-[250px] overflow-y-auto">
              {serials.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-[var(--bg-surface)] rounded-lg text-sm font-mono">
                  <span className="tracking-wide">{s}</span>
                  <button aria-label={`Copy serial number ${s}`} onClick={() => { clipboardWrite(s); toast.success('Copied!'); }} className="text-xs text-[var(--accent)] hover:underline"><Copy size={12} /></button>
                </div>
              ))}
              <div className="flex gap-1 mt-2">
                <button onClick={() => { clipboardWrite(serials.join('\n')); toast.success('Copied all!'); }} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Copy All</button>
                <button aria-label="Download serial numbers" onClick={() => { const blob = new Blob([serials.join('\n')], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'serials.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"><Download size={14} /></button>
              </div>
            </div>
          </div>
        )}
        {!serials.length && (
          <p className="text-[var(--text-muted)] text-sm text-center">Configure and generate serial numbers</p>
        )}
      </div>
    </CalculatorShell>
  );
}

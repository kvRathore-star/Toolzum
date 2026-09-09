"use client";
import { useState, useRef } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { CalculatorShell } from '../shared/CalculatorShell';
import { Input } from './GeneratorsShared';

const BARCODE_PATTERNS: Record<string, string[]> = { 'UPC-A': ['3211', '2221', '2122', '1411', '1132', '1231', '1114', '1312', '1213', '3112'], 'EAN-13': ['3211', '2221', '2122', '1411', '1132', '1231', '1114', '1312', '1213', '3112'], 'Code128': ['212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213'], 'Code39': ['111221211', '211211112', '112211112', '211112112', '111212112', '112112112', '211121112', '111121212', '211111122', '112111122'] };
export default function BarcodeGenerator() {
  const [input, setInput] = useState('123456789012'); const [type, setType] = useState('UPC-A'); const svgRef = useRef<SVGSVGElement>(null);
  const renderBarcode = () => { const patterns = BARCODE_PATTERNS[type] || BARCODE_PATTERNS['UPC-A']!; const digits = input.replace(/\D/g, '').split('').slice(0, 12); const barWidth = 2; const height = 80; let x = 20; const bars: { x: number; w: number }[] = []; bars.push({ x, w: barWidth }); x += barWidth; bars.push({ x, w: barWidth * 2 }); x += barWidth * 2; for (const d of digits) { const p = patterns[parseInt(d)] || patterns[0]!; for (const c of p) { bars.push({ x, w: parseInt(c) * barWidth }); x += parseInt(c) * barWidth; } } bars.push({ x, w: barWidth * 2 }); x += barWidth * 2; bars.push({ x, w: barWidth }); const totalWidth = x + 20; return (<svg ref={svgRef} width={totalWidth} height={height + 30} xmlns="http://www.w3.org/2000/svg" className="mx-auto">{bars.map((b, i) => (<rect key={i} x={b.x} y={10} width={b.w} height={height} fill={i % 2 === 0 ? '#000' : '#fff'} />))}<text x={totalWidth / 2} y={height + 25} textAnchor="middle" fontSize="12" fontFamily="monospace">{input}</text></svg>); };

  const presets = [
    { label: 'UPC-A (12 digits)', apply: () => { setType('UPC-A'); setInput('123456789012'); } },
    { label: 'EAN-13 (13 digits)', apply: () => { setType('EAN-13'); setInput('1234567890123'); } },
    { label: 'Code 128', apply: () => { setType('Code128'); setInput('HELLO123'); } },
    { label: 'Code 39', apply: () => { setType('Code39'); setInput('CODE39'); } },
    { label: 'Clear', apply: () => { setInput(''); } },
  ];

  const resultText = input ? 'Generated ' + type + ' barcode for: ' + input : 'Enter data to generate barcode';

  return (
    <CalculatorShell category="Utility"
      title="Barcode Generator"
      result={resultText}
      onCalculate={renderBarcode}
      calculateLabel="Generate"
      presets={presets}
      accent="indigo"
      downloadData={input ? JSON.stringify({ type, data: input }, null, 2) : ''}
      downloadFilename="barcode.json"
    >
      <div className="space-y-4">
        <div className="mb-3">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Type</label>
          <select aria-label="Type" value={type} onChange={e => setType(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50"><option value="UPC-A">UPC-A</option><option value="EAN-13">EAN-13</option><option value="Code128">Code 128</option><option value="Code39">Code 39</option></select>
        </div>
        <Input label="Data" value={input} onChange={v => setInput(v)} />
        <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-4 flex flex-col items-center justify-center min-h-[160px]">
          {input ? (
            <div className="overflow-auto w-full flex justify-center">
              {renderBarcode()}
              <button onClick={() => { const svg = svgRef.current; if (!svg) return; const clone = svg.cloneNode(true) as SVGSVGElement; const serializer = new XMLSerializer(); const source = serializer.serializeToString(clone); const blob = new Blob([source], { type: 'image/svg+xml' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'barcode.svg'; a.click(); URL.revokeObjectURL(url); toast.success('SVG downloaded!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors mt-2"><Download size={14} /></button>
            </div>
          ) : (
            <p className="text-[var(--text-muted)] text-sm">Enter data to generate barcode</p>
          )}
        </div>
      </div>
    </CalculatorShell>
  );
}

"use client";
import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';

function genPort(ranges: { min: number; max: number }[]): number {
  const total = ranges.reduce((s, r) => s + r.max - r.min + 1, 0);
  let offset = Math.floor(Math.random() * total);
  for (const r of ranges) {
    const size = r.max - r.min + 1;
    if (offset < size) return r.min + offset;
    offset -= size;
  }
  return 49152 + Math.floor(Math.random() * 16384);
}

export default function RandomPortGenerator() {
  const [portRanges, setPortRanges] = useState([{ min: 49152, max: 65535 }]);
  const [portCount, setPortCount] = useState(1);
  const [ports, setPorts] = useState<number[]>([]);

  const generate = useCallback(() => {
    const selectedRanges = portRanges.length === 0 ? [{ min: 49152, max: 65535 }] : portRanges;
    const generated: number[] = [];
    for (let i = 0; i < portCount; i++) generated.push(genPort(selectedRanges));
    setPorts(generated);
  }, [portRanges, portCount]);

  const copy = (txt: string, label: string) => { clipboardWrite(txt); toast.success(`${label} copied!`); };

  const presets = [
    { label: 'Single Dynamic Port', apply: () => { setPortRanges([{ min: 49152, max: 65535 }]); setPortCount(1); } },
    { label: '5 Registered Ports', apply: () => { setPortRanges([{ min: 1024, max: 49151 }]); setPortCount(5); } },
    { label: 'Clear', apply: () => { setPorts([]); } },
  ];

  const resultText = ports.length > 0 ? `Generated ${ports.length} port${ports.length === 1 ? '' : 's'}: ${ports.join(', ')}` : 'Select ranges and generate';

  return (
    <CalculatorShell category="Utility"
      title="Random Port Generator"
      result={resultText}
      onCalculate={generate}
      calculateLabel="Generate"
      presets={presets}
      accent="violet"
      downloadData={ports.length > 0 ? JSON.stringify({ count: portCount, ranges: portRanges, ports }, null, 2) : ''}
      downloadFilename="random-ports.json"
    >
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <label htmlFor="lbl-randomportgenerator-count-portcount" className="text-sm text-[var(--text-secondary)]">Count: {portCount}</label>
        <input id="lbl-randomportgenerator-count-portcount" type="range" min={1} max={20} value={portCount} onChange={e => setPortCount(parseInt(e.target.value))} aria-label="Port count" className="w-32" />
      </div>
      <div className="space-y-2">
        {[0, 1, 2].map(i => {
          const label = ['Well-Known (0-1023)', 'Registered (1024-49151)', 'Dynamic (49152-65535)'][i];
          const range = [{min:0,max:1023},{min:1024,max:49151},{min:49152,max:65535}][i]!;
          const checked = portRanges.some(r => r.min === range.min);
          return (
            <label key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
              <input type="checkbox" checked={checked} onChange={() => {
                if (checked) setPortRanges(prev => prev.filter(r => r.min !== range.min));
                else setPortRanges(prev => [...prev, range]);
              }} />
              {label}
            </label>
          );
        })}
      </div>
      {ports.length > 0 ? (
        <div className="space-y-2">
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {ports.map((p, i) => (
            <div key={i} className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-center">
              <span className="text-sm font-mono font-bold text-[var(--accent)]">{p}</span>
              <button onClick={() => copy(String(p), 'Port')} className="block text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] mt-0.5 w-full text-center">Copy</button>
            </div>
          ))}
        </div>
        <button onClick={() => copy(ports.join(', '), 'Ports')} className="text-[11px] text-[var(--accent)] hover:underline">Copy All</button>
        </div>
      ) : (
        <p className="text-[var(--text-muted)] text-sm text-center">Select port ranges and press Generate — no ports yet</p>
      )}
    </div>
    </CalculatorShell>
  );
}

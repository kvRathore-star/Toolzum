"use client";
import { useState } from 'react';
import { Copy, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';
import { Input, FIRST_NAMES, LAST_NAMES, DOMAINS, CITIES, STREETS, randInt, randItem } from './GeneratorsShared';

type Field = 'name' | 'email' | 'phone' | 'address';
export default function FakeDataGenerator() {
  const [count, setCount] = useState(5); const [fields, setFields] = useState<Field[]>(['name', 'email', 'phone', 'address']); const [data, setData] = useState<Record<string, string>[]>([]);
  const toggleField = (f: Field) => setFields(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  const generate = () => { const entries: Record<string, string>[] = []; for (let i = 0; i < count; i++) { const fn = randItem(FIRST_NAMES); const ln = randItem(LAST_NAMES); const entry: Record<string, string> = {}; if (fields.includes('name')) entry.Name = fn + ' ' + ln; if (fields.includes('email')) entry.Email = fn.toLowerCase() + '.' + ln.toLowerCase() + randInt(1, 99) + '@' + randItem(DOMAINS); if (fields.includes('phone')) entry.Phone = '+91 ' + randInt(70000, 99999) + ' ' + randInt(10000, 99999); if (fields.includes('address')) entry.Address = randInt(1, 999) + ' ' + randItem(STREETS) + ', ' + randItem(CITIES) + ' - ' + randInt(100001, 999999); entries.push(entry); } setData(entries); };
  const toCSV = () => { if (!data.length) return ''; const headers = Object.keys(data[0]); return [headers.join(','), ...data.map(r => headers.map(h => '"' + (r[h] || '').replace(/"/g, '""') + '"').join(','))].join('\n'); };

  const presets = [
    { label: '5 Records (All Fields)', apply: () => { setCount(5); setFields(['name', 'email', 'phone', 'address']); generate(); } },
    { label: '10 Records (All Fields)', apply: () => { setCount(10); setFields(['name', 'email', 'phone', 'address']); generate(); } },
    { label: '20 Records (All Fields)', apply: () => { setCount(20); setFields(['name', 'email', 'phone', 'address']); generate(); } },
    { label: 'Clear', apply: () => { setData([]); } },
  ];

  const resultText = data.length > 0 ? 'Generated ' + data.length + ' records with ' + fields.length + ' fields' : 'Configure and generate';

  return (
    <CalculatorShell category="Utility"
      title="Fake Data Generator"
      result={resultText}
      onCalculate={generate}
      calculateLabel="Generate"
      presets={presets}
      accent="emerald"
      downloadData={data.length > 0 ? JSON.stringify(data, null, 2) : ''}
      downloadFilename="fake-data.json"
    >
      <div className="space-y-4">
        <Input label="Count" type="number" value={String(count)} onChange={v => setCount(Number(v))} />
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider w-full">Fields</span>
          {(['name', 'email', 'phone', 'address'] as Field[]).map(f => (
            <button key={f} onClick={() => toggleField(f)} className={'px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ' + (fields.includes(f) ? 'bg-emerald-700/10 border-emerald-400 text-[var(--accent)]' : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)]')}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
        {data.length > 0 && (
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-4 flex flex-col min-h-[200px]">
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {data.map((d, i) => (
                <div key={i} className="p-3 bg-[var(--bg-surface)] rounded-xl text-xs leading-relaxed">
                  {Object.entries(d).map(([k, v]) => (
                    <div key={k}><span className="font-bold text-[var(--text-secondary)]">{k}:</span> {v}</div>
                  ))}
                </div>
              ))}
              <div className="flex gap-1 mt-2">
                <button onClick={() => { clipboardWrite(JSON.stringify(data, null, 2)); toast.success('Copied as JSON!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors" aria-label="Copy as JSON"><Copy size={14} /></button>
                <button onClick={() => { const csv = toCSV(); if (!csv) return; const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'fake-data.csv'; a.click(); URL.revokeObjectURL(url); toast.success('CSV downloaded!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors" aria-label="Download as CSV"><Download size={14} /></button>
              </div>
            </div>
          </div>
        )}
        {!data.length && (
          <p className="text-[var(--text-muted)] text-sm text-center">Configure and generate fake data</p>
        )}
      </div>
    </CalculatorShell>
  );
}

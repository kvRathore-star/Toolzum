"use client";
import React, { useState } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import * as pdfjsLib from 'pdfjs-dist';
import { setupPdfWorker } from '@/lib/pdfjsWorker';
setupPdfWorker(pdfjsLib);
import { CalculatorShell } from '../shared/CalculatorShell';
import { Section } from '../MiscToolsShared';

function Input({ label, value, onChange, placeholder, type = "text", rows }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; rows?: number;
}) {
  const id = React.useId();
  const cls = "w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50";
  return (
    <div className="mb-3">
      <label htmlFor={id} className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>
      {rows ? (
        <textarea id={id} className={cls} rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input id={id} className={cls} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}

function Output({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  return (
    <div className="mt-4">
      {label && <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>}
      <div className="relative">
        <pre className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] overflow-x-auto whitespace-pre-wrap break-all max-h-60">{value}</pre>
        <button onClick={() => { clipboardWrite(value).then(ok => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); } }); }} className="absolute top-2 right-2 px-3 py-1 text-xs bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
      </div>
    </div>
  );
}

export function AnnualContractValueCalculator() {
  const [tv, setTv] = useState('');
  const [years, setYears] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const calc = () => { const t = parseFloat(tv); const y = parseFloat(years); if (t && y && y > 0) setResult(t / y); };
  const presets = [
    { label: '3yr $120k', apply: () => { setTv('120000'); setYears('3'); setTimeout(calc, 0); } },
    { label: '1yr $50k', apply: () => { setTv('50000'); setYears('1'); setTimeout(calc, 0); } },
    { label: '2yr $200k', apply: () => { setTv('200000'); setYears('2'); setTimeout(calc, 0); } },
  ];
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((p) => (
          <button key={p.label} onClick={p.apply} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Annual Contract Value (ACV) Calculator</h2>
        <Input label="Total Contract Value ($)" value={tv} onChange={setTv} placeholder="e.g. 120000" type="number" />
        <Input label="Contract Term (Years)" value={years} onChange={setYears} placeholder="e.g. 3" type="number" />
        <button onClick={calc} className="px-5 py-2.5 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-medium transition-colors">Calculate ACV</button>
        {result !== null && (
          <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)]">ACV: <span className="font-mono font-bold text-[var(--text-primary)]">${result.toFixed(2)}</span></p>
              <div className="flex gap-2">
                <button onClick={() => { clipboardWrite(String(result)).then(ok => ok && toast.success('Copied!')); }} className="text-xs text-[var(--accent)] hover:underline font-medium">Copy</button>
                <button onClick={() => { const blob = new Blob([String(result)], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='result.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-[var(--accent)] hover:underline font-medium">Download</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export function AsciiTableGenerator() {
  const [data, setData] = useState('');
  const [table, setTable] = useState('');
  const gen = () => {
    const rows = data.trim().split('\n').map(r => r.split(',').map(c => c.trim()));
    if (rows.length < 2) return;
    const colWidths = rows[0]!.map((_, ci) => Math.max(...rows.map(r => (r[ci] || '').length)));
    const sep = (c: string) => '+' + colWidths.map(w => c.repeat(w + 2)).join('+') + '+';
    let out = sep('-') + '\n';
    out += '| ' + rows[0]!.map((h, i) => h.padEnd(colWidths[i]!)).join(' | ') + ' |\n';
    out += sep('=') + '\n';
    for (let i = 1; i < rows.length; i++) {
      out += '| ' + rows[i]!.map((c, j) => (c || '').padEnd(colWidths[j]!)).join(' | ') + ' |\n';
      out += sep('-') + '\n';
    }
    setTable(out);
  };
  const presets = [
    { label: 'Names & Ages', apply: () => { setData('Name, Age, City\nAlice, 30, NYC\nBob, 25, SF'); setTimeout(gen, 0); } },
    { label: 'Products & Prices', apply: () => { setData('Product, Price, Stock\nLaptop, 999, 15\nPhone, 699, 42\nTablet, 499, 28'); setTimeout(gen, 0); } },
  ];
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((p) => (
          <button key={p.label} onClick={p.apply} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">ASCII Table Generator</h2>
        <Input label="CSV Data (first row = headers)" value={data} onChange={setData} placeholder="Name, Age, City\nAlice, 30, NYC\nBob, 25, SF" rows={4} />
        <button onClick={gen} className="px-5 py-2.5 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-medium transition-colors">Generate Table</button>
        <Output value={table} label="ASCII Table" />
        {table && (
          <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl">
            <div className="flex items-center justify-end gap-2 mb-2">
              <button onClick={() => { clipboardWrite(table).then(ok => ok && toast.success('Copied!')); }} className="text-xs text-[var(--accent)] hover:underline font-medium">Copy</button>
              <button onClick={() => { const blob = new Blob([table], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='table.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-[var(--accent)] hover:underline font-medium">Download</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export function GitCommitLinter() {
  const [msg, setMsg] = useState('');
  const [issues, setIssues] = useState<string[]>([]);
  const lint = () => {
    const errs: string[] = [];
    if (!msg) { errs.push('Message is empty.'); setIssues(errs); return; }
    if (!/^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?!?:\s.+/.test(msg)) errs.push('Must start with a valid conventional commit type (e.g. feat:, fix:, docs:).');
    if (msg.length > 72) errs.push(`Subject line is ${msg.length} characters (max 72).`);
    if (msg[0] && msg[0] !== msg[0].toLowerCase()) errs.push('First word after type/scope should be lowercase.');
    setIssues(errs);
  };

  const presets = [
    { label: 'Valid feat', apply: () => { setMsg('feat: add user authentication'); lint(); } },
    { label: 'Invalid (uppercase)', apply: () => { setMsg('Feat: add user auth'); lint(); } },
    { label: 'Invalid (too long)', apply: () => { setMsg('fix: this commit message is way too long and exceeds the 72 character limit for conventional commits'); lint(); } },
    { label: 'Clear', apply: () => { setMsg(''); setIssues([]); } },
  ];

  const resultText = msg ? (issues.length === 0 ? '✓ Valid commit message' : `Found ${issues.length} issue(s)`) : 'Enter commit message to lint';

  return (
    <CalculatorShell category="Utility"
      title="Git Commit Linter"
      result={resultText}
      onCalculate={lint}
      calculateLabel="Lint"
      presets={presets}
      accent="emerald"
      downloadData={msg ? JSON.stringify({ message: msg, valid: issues.length === 0, issues }, null, 2) : ''}
      downloadFilename="commit-lint.json"
    >
      <div className="space-y-4">
        <Input label="Commit Message" value={msg} onChange={setMsg} placeholder="feat: add user authentication" rows={2} />
        {issues.length > 0 && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            {issues.map((e, i) => <p key={i} className="text-sm text-red-700 dark:text-red-300">{e}</p>)}
          </div>
        )}
        {issues.length === 0 && msg && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <p className="text-sm text-green-700 dark:text-green-300">Commit message is valid!</p>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}

export function GitignoreGenerator() {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const items = ['node_modules', 'dist', 'build', '.env', '.env.local', '*.log', '.DS_Store', 'coverage', '.next', '.cache', 'venv', '__pycache__', '*.pyc', '.idea', '.vscode', '*.swp', '*.swo', 'Thumbs.db', '*.class', '*.jar'];
  const toggle = (k: string) => setSelected(p => ({ ...p, [k]: !p[k] }));
  const gen = () => '# Generated by Toolzum\n' + items.filter(k => selected[k]).map(k => '\n' + (k.startsWith('*') || k.startsWith('.') ? k : '/' + k)).join('') + '\n';
  const [output, setOutput] = useState('');
  const generate = () => setOutput(gen());

  const presets = [
    { label: 'Node.js', apply: () => { items.forEach(k => setSelected(p => ({ ...p, [k]: ['node_modules', 'dist', 'build', '.env', '*.log'].includes(k) }))); gen(); } },
    { label: 'Python', apply: () => { items.forEach(k => setSelected(p => ({ ...p, [k]: ['venv', '__pycache__', '*.pyc', '.env'].includes(k) }))); gen(); } },
    { label: 'All', apply: () => { items.forEach(k => setSelected(p => ({ ...p, [k]: true }))); gen(); } },
    { label: 'Clear', apply: () => { items.forEach(k => setSelected(p => ({ ...p, [k]: false }))); setOutput(''); } },
  ];

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
      <h2 className="text-lg font-bold text-[var(--text-primary)]">.gitignore Generator</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((p, i) => (
          <button key={i} onClick={p.apply} className="px-3 py-1.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg text-xs font-medium hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors">{p.label}</button>
        ))}
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {items.map(k => (
            <label key={k} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
              <input type="checkbox" checked={!!selected[k]} onChange={() => toggle(k)} className="rounded" />
              {k}
            </label>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={generate} className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-medium transition-colors">Generate .gitignore</button>
          {output && (
            <button onClick={() => { const blob = new Blob([output], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='.gitignore'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="px-3 py-1.5 text-xs font-medium bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white rounded-lg transition-colors">
              Download
            </button>
          )}
        </div>
        <Output value={output} label=".gitignore" />
      </div>
    </div>
  );
}

export function HoursToMinutesConverter() {
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [total, setTotal] = useState<number | null>(null);
  const convert = () => { const h = parseFloat(hours) || 0; const m = parseFloat(minutes) || 0; setTotal(h * 60 + m); };
  const presets = [
    { label: '1h 30m', apply: () => { setHours('1'); setMinutes('30'); setTimeout(convert, 0); } },
    { label: '2h 15m', apply: () => { setHours('2'); setMinutes('15'); setTimeout(convert, 0); } },
    { label: '8h 0m', apply: () => { setHours('8'); setMinutes('0'); setTimeout(convert, 0); } },
  ];
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((p) => (
          <button key={p.label} onClick={p.apply} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Hours & Minutes to Total Minutes</h2>
        <Input label="Hours" value={hours} onChange={setHours} placeholder="e.g. 2" type="number" />
        <Input label="Minutes" value={minutes} onChange={setMinutes} placeholder="e.g. 30" type="number" />
        <button onClick={convert} className="px-5 py-2.5 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-medium transition-colors">Convert</button>
        {total !== null && (
          <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)]">Total Minutes: <span className="font-mono font-bold text-[var(--text-primary)]">{total}</span></p>
              <div className="flex gap-2">
                <button onClick={() => { clipboardWrite(String(total)).then(ok => ok && toast.success('Copied!')); }} className="text-xs text-[var(--accent)] hover:underline font-medium">Copy</button>
                <button onClick={() => { const blob = new Blob([String(total)], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='result.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-[var(--accent)] hover:underline font-medium">Download</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export function ParquetToCsvConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [csv, setCsv] = useState<string | null>(null);
  const [rowCount, setRowCount] = useState(0);
  const [truncated, setTruncated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (f: File) => {
    setFile(f);
    setCsv(null);
    setTruncated(false);
  };

  const convert = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      // Real client-side Parquet reading (hyparquet, no wasm needed) +
      // papaparse for CSV output. Complex/nested values are JSON-encoded;
      // BigInts stringified (CSV has no 64-bit integers).
      const { parquetReadObjects } = await import('hyparquet');
      const { default: Papa } = await import('papaparse');
      // hyparquet reads AsyncBuffer ({byteLength, slice()->ArrayBuffer}),
      // not File: wrap the bytes (slice() copies to an exact-size buffer).
      const bytes = new Uint8Array(await file.arrayBuffer());
      const buf = {
        byteLength: bytes.byteLength,
        slice: (start: number, end?: number): ArrayBuffer =>
          bytes.slice(start, end).buffer as ArrayBuffer,
      };
      const rows = await parquetReadObjects({ file: buf }) as Record<string, unknown>[];
      const MAX_ROWS = 50000;
      const slice = rows.slice(0, MAX_ROWS);
      setTruncated(rows.length > MAX_ROWS);
      setRowCount(rows.length);
      const flat = slice.map((row) => {
        const out: Record<string, string> = {};
        for (const [k, v] of Object.entries(row ?? {})) {
          if (typeof v === 'bigint') out[k] = v.toString();
          else if (v instanceof Uint8Array) out[k] = new TextDecoder().decode(v);
          else if (v !== null && typeof v === 'object') out[k] = JSON.stringify(v);
          else out[k] = String(v ?? '');
        }
        return out;
      });
      setCsv(Papa.unparse(flat));
      toast.success(`Converted ${Math.min(rows.length, MAX_ROWS).toLocaleString()} rows${rows.length > MAX_ROWS ? ' (capped at 50k)' : ''}.`);
    } catch (err) {
      setCsv(null);
      toast.error(err instanceof Error && /magic|parquet|footer/i.test(err.message)
        ? 'Not a valid Parquet file — check the file and retry.'
        : 'Failed to process Parquet — the file may use unsupported encodings.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Section title="Parquet to CSV Converter">
      <p className="text-sm text-[var(--text-secondary)] mb-4">Convert Parquet files to CSV format. Runs entirely in your browser — nothing is uploaded{rowCount > 0 && ` · ${rowCount.toLocaleString()} rows read`}.</p>
      <FileUploader 
        accept=".parquet" 
        onFileSelect={handleFileSelect} 
        title="Upload Parquet File"
        subtitle="Supports .parquet files"
      />
      {file && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl space-y-3">
          <p className="text-sm font-medium">Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
          <button onClick={convert} disabled={isProcessing} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50">
            {isProcessing ? 'Converting...' : 'Convert to CSV'}
          </button>
        </div>
      )}
      {csv && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">CSV Output{truncated && ' (first 50,000 rows)'}</label>
          <div className="relative">
            <pre className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] overflow-x-auto whitespace-pre-wrap max-h-60">{csv.slice(0, 20000)}{csv.length > 20000 ? '\n…preview truncated — download for the full CSV' : ''}</pre>
            <button onClick={() => downloadOrShare(csv, 'converted.csv')} className="absolute top-2 right-2 px-3 py-1 text-xs bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white rounded-lg transition-colors">Download</button>
          </div>
        </div>
      )}
    </Section>
  );
}

export function SaasPaybackPeriod() {
  const [cac, setCac] = useState('');
  const [mrr, setMrr] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const calc = () => { const c = parseFloat(cac); const m = parseFloat(mrr); if (c && m && m > 0) setResult(c / m); };
  const presets = [
    { label: 'CAC $500, MRR $50', apply: () => { setCac('500'); setMrr('50'); setTimeout(calc, 0); } },
    { label: 'CAC $1000, MRR $100', apply: () => { setCac('1000'); setMrr('100'); setTimeout(calc, 0); } },
  ];
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((p) => (
          <button key={p.label} onClick={p.apply} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">SaaS Payback Period</h2>
        <Input label="Customer Acquisition Cost ($)" value={cac} onChange={setCac} placeholder="e.g. 500" type="number" />
        <Input label="Monthly Revenue per Customer ($)" value={mrr} onChange={setMrr} placeholder="e.g. 50" type="number" />
        <button onClick={calc} className="px-5 py-2.5 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-medium transition-colors">Calculate Payback</button>
        {result !== null && (
          <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)]">Payback Period: <span className="font-mono font-bold text-[var(--text-primary)]">{result.toFixed(1)} months</span></p>
              <div className="flex gap-2">
                <button onClick={() => { clipboardWrite(String(result.toFixed(1))).then(ok => ok && toast.success('Copied!')); }} className="text-xs text-[var(--accent)] hover:underline font-medium">Copy</button>
                <button onClick={() => { const blob = new Blob([String(result.toFixed(1))], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='result.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-[var(--accent)] hover:underline font-medium">Download</button>
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">{result < 12 ? 'Healthy payback period.' : 'Long payback — consider reducing CAC or increasing MRR.'}</p>
          </div>
        )}
      </div>
    </>
  );
}

export function SaasQuickRatio() {
  const [n, setN] = useState(''); const [e, setE] = useState(''); const [r, setR] = useState(''); const [ch, setCh] = useState(''); const [co, setCo] = useState('');
  const [ratio, setRatio] = useState<number | null>(null);
  const calc = () => {
    const nn = parseFloat(n) || 0; const ee = parseFloat(e) || 0; const rr = parseFloat(r) || 0; const cc = parseFloat(ch) || 0; const coo = parseFloat(co) || 0;
    const denom = cc + coo; if (denom > 0) setRatio((nn + ee + rr) / denom); else if (nn + ee + rr > 0) setRatio(Infinity); else setRatio(null);
  };
  const presets = [
    { label: 'Healthy SaaS', apply: () => { setN('10000'); setE('3000'); setR('1000'); setCh('2000'); setCo('1000'); setTimeout(calc, 0); } },
    { label: 'At-risk SaaS', apply: () => { setN('2000'); setE('500'); setR('200'); setCh('3000'); setCo('1500'); setTimeout(calc, 0); } },
  ];
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((p) => (
          <button key={p.label} onClick={p.apply} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">SaaS Quick Ratio</h2>
        <Input label="New MRR ($)" value={n} onChange={setN} placeholder="e.g. 10000" type="number" />
        <Input label="Expansion MRR ($)" value={e} onChange={setE} placeholder="e.g. 3000" type="number" />
        <Input label="Reactivation MRR ($)" value={r} onChange={setR} placeholder="e.g. 1000" type="number" />
        <Input label="Churned MRR ($)" value={ch} onChange={setCh} placeholder="e.g. 2000" type="number" />
        <Input label="Contraction MRR ($)" value={co} onChange={setCo} placeholder="e.g. 1000" type="number" />
        <button onClick={calc} className="px-5 py-2.5 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-medium transition-colors">Calculate Quick Ratio</button>
        {ratio !== null && (
          <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)]">Quick Ratio: <span className="font-mono font-bold text-[var(--text-primary)]">{ratio === Infinity ? '∞' : ratio.toFixed(2)}</span></p>
              <div className="flex gap-2">
                <button onClick={() => { clipboardWrite(String(ratio === Infinity ? '∞' : ratio.toFixed(2))).then(ok => ok && toast.success('Copied!')); }} className="text-xs text-[var(--accent)] hover:underline font-medium">Copy</button>
                <button onClick={() => { const blob = new Blob([String(ratio === Infinity ? '∞' : ratio.toFixed(2))], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='result.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-[var(--accent)] hover:underline font-medium">Download</button>
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">{ratio >= 4 ? 'Excellent!' : ratio >= 2 ? 'Good' : ratio >= 1 ? 'Needs improvement' : 'At risk'}</p>
          </div>
        )}
      </div>
    </>
  );
}

export function SaasRuleOf40() {
  const [growth, setGrowth] = useState('');
  const [margin, setMargin] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const calc = () => { const g = parseFloat(growth); const m = parseFloat(margin); if (!isNaN(g) && !isNaN(m)) setResult(g + m); };
  const presets = [
    { label: 'Growth 25%, Margin 20%', apply: () => { setGrowth('25'); setMargin('20'); setTimeout(calc, 0); } },
    { label: 'Growth 40%, Margin 5%', apply: () => { setGrowth('40'); setMargin('5'); setTimeout(calc, 0); } },
  ];
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((p) => (
          <button key={p.label} onClick={p.apply} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">SaaS Rule of 40</h2>
      <Input label="Revenue Growth Rate (%)" value={growth} onChange={setGrowth} placeholder="e.g. 25" type="number" />
      <Input label="Profit Margin (%)" value={margin} onChange={setMargin} placeholder="e.g. 20 (or -5 for loss)" type="number" />
      <button onClick={calc} className="px-5 py-2.5 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-medium transition-colors">Calculate</button>
      {result !== null && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)]">Rule of 40 Score: <span className="font-mono font-bold text-[var(--text-primary)]">{result.toFixed(1)}%</span></p>
            <div className="flex gap-2">
              <button onClick={() => { clipboardWrite(String(result.toFixed(1)) + '%').then(ok => ok && toast.success('Copied!')); }} className="text-xs text-[var(--accent)] hover:underline font-medium">Copy</button>
              <button onClick={() => { const blob = new Blob([String(result.toFixed(1)) + '%'], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='result.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-[var(--accent)] hover:underline font-medium">Download</button>
            </div>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">{result >= 40 ? 'Passes the Rule of 40 ✓' : 'Below 40% threshold — focus on growth or profitability.'}</p>
        </div>
      )}
      </div>
    </>
  );
}

export function SwiftFormatter() {
  const [code, setCode] = useState('');
  const [formatted, setFormatted] = useState('');
  const fmt = () => {
    let out = code.split('\n').map(l => l.trimEnd()).join('\n');
    let indent = 0;
    out = out.split('\n').map(l => {
      const trimmed = l.trim();
      if (trimmed.startsWith('}') || trimmed.startsWith(')') || trimmed.startsWith(']')) indent = Math.max(0, indent - 1);
      const line = '  '.repeat(indent) + trimmed;
      if (trimmed.endsWith('{') || trimmed.endsWith('(') || (trimmed.endsWith('['))) indent++;
      return line;
    }).join('\n');
    setFormatted(out);
  };
  const presets = [
    { label: 'Simple struct', apply: () => { setCode('struct User {\nlet name: String\nlet age: Int\n}'); setTimeout(fmt, 0); } },
    { label: 'Function with closure', apply: () => { setCode('func greet(name: String) {\nprint("Hello, \\(name)!")\n}'); setTimeout(fmt, 0); } },
  ];
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((p) => (
          <button key={p.label} onClick={p.apply} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Swift Formatter</h2>
      <Input label="Swift Code" value={code} onChange={setCode} placeholder="struct Foo {\nlet bar: String\n}" rows={6} />
      <button onClick={fmt} className="px-5 py-2.5 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-medium transition-colors">Format</button>
      <Output value={formatted} label="Formatted Swift Code" />
      {formatted && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl">
          <div className="flex items-center justify-end gap-2 mb-2">
            <button onClick={() => { clipboardWrite(formatted).then(ok => ok && toast.success('Copied!')); }} className="text-xs text-[var(--accent)] hover:underline font-medium">Copy</button>
            <button onClick={() => { const blob = new Blob([formatted], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='formatted.swift'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-[var(--accent)] hover:underline font-medium">Download</button>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

export function TemperatureConverter() {
  const [value, setValue] = useState('');
  const [from, setFrom] = useState('celsius');
  const [to, setTo] = useState('fahrenheit');
  const [result, setResult] = useState<number | null>(null);
  const convert = () => {
    const v = parseFloat(value);
    if (isNaN(v)) return;
    let c: number;
    if (from === 'celsius') c = v;
    else if (from === 'fahrenheit') c = (v - 32) * 5 / 9;
    else c = v - 273.15;
    if (to === 'celsius') setResult(c);
    else if (to === 'fahrenheit') setResult(c * 9 / 5 + 32);
    else setResult(c + 273.15);
  };
  const presets = [
    { label: '100°C → °F', apply: () => { setValue('100'); setFrom('celsius'); setTo('fahrenheit'); setTimeout(convert, 0); } },
    { label: '32°F → °C', apply: () => { setValue('32'); setFrom('fahrenheit'); setTo('celsius'); setTimeout(convert, 0); } },
    { label: '0K → °C', apply: () => { setValue('0'); setFrom('kelvin'); setTo('celsius'); setTimeout(convert, 0); } },
  ];
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((p) => (
          <button key={p.label} onClick={p.apply} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Temperature Converter</h2>
      <Input label="Temperature" value={value} onChange={setValue} placeholder="e.g. 100" type="number" />
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label htmlFor="lbl-extratools-from" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">From</label>
          <select id="lbl-extratools-from" aria-label="From" value={from} onChange={e => setFrom(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50">
            <option value="celsius">Celsius</option>
            <option value="fahrenheit">Fahrenheit</option>
            <option value="kelvin">Kelvin</option>
          </select>
        </div>
        <div>
          <label htmlFor="lbl-extratools-to" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">To</label>
          <select id="lbl-extratools-to" aria-label="To" value={to} onChange={e => setTo(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50">
            <option value="celsius">Celsius</option>
            <option value="fahrenheit">Fahrenheit</option>
            <option value="kelvin">Kelvin</option>
          </select>
        </div>
      </div>
      <button onClick={convert} className="px-5 py-2.5 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-medium transition-colors">Convert</button>
      {result !== null && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)]">Result: <span className="font-mono font-bold text-[var(--text-primary)]">{result.toFixed(2)}°</span></p>
            <div className="flex gap-2">
              <button onClick={() => { clipboardWrite(String(result.toFixed(2)) + '°').then(ok => ok && toast.success('Copied!')); }} className="text-xs text-[var(--accent)] hover:underline font-medium">Copy</button>
              <button onClick={() => { const blob = new Blob([String(result.toFixed(2)) + '°'], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='result.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-[var(--accent)] hover:underline font-medium">Download</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

export function PdfToTxt() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (f: File) => {
    setFile(f);
    setText(null);
  };

  const extract = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map((item) => 'str' in item ? item.str : '').join(' ') + '\n\n';
      }
      setText(fullText.trim() || 'No text found in PDF');
    } catch (err) {
      console.error(err);
      setText('Error extracting text: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Section title="PDF to TXT Extractor">
      <p className="text-sm text-[var(--text-secondary)] mb-4">Extract plain text from PDF documents. Runs in your browser using pdf.js.</p>
      <FileUploader 
        accept="application/pdf" 
        onFileSelect={handleFileSelect} 
        title="Upload PDF File"
        subtitle="Supports PDF files (up to 100MB, processed locally)"
      />
      {file && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl space-y-3">
          <p className="text-sm font-medium">Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
          <button onClick={extract} disabled={isProcessing} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50">
            {isProcessing ? 'Extracting Text...' : 'Extract Text'}
          </button>
        </div>
      )}
      {text && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Extracted Text</label>
          <div className="relative">
            <pre className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] overflow-x-auto whitespace-pre-wrap max-h-96">{text}</pre>
            <button onClick={() => downloadOrShare(text, file?.name.replace('.pdf', '.txt') || 'extracted.txt')} className="absolute top-2 right-2 px-3 py-1 text-xs bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white rounded-lg transition-colors">Download</button>
          </div>
        </div>
      )}
    </Section>
  );
}

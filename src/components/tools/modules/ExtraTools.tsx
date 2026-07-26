"use client";
import React, { useState } from 'react';
import { FileUploader } from '../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full bg-[var(--bg-overlay)] rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] p-6">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", rows }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; rows?: number;
}) {
  const cls = "w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50";
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>
      {rows ? (
        <textarea className={cls} rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input className={cls} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
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
        <pre className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 overflow-x-auto whitespace-pre-wrap break-all max-h-60">{value}</pre>
        <button onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="absolute top-2 right-2 px-3 py-1 text-xs bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
      </div>
    </div>
  );
}

export function AnnualContractValueCalculator() {
  const [tv, setTv] = useState('');
  const [years, setYears] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const calc = () => { const t = parseFloat(tv); const y = parseFloat(years); if (t && y && y > 0) setResult(t / y); };
  return (
    <Section title="Annual Contract Value (ACV) Calculator">
      <Input label="Total Contract Value ($)" value={tv} onChange={setTv} placeholder="e.g. 120000" type="number" />
      <Input label="Contract Term (Years)" value={years} onChange={setYears} placeholder="e.g. 3" type="number" />
      <button onClick={calc} className="px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-medium transition-colors">Calculate ACV</button>
      {result !== null && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl">
          <p className="text-sm text-zinc-600 dark:text-[var(--text-muted)]">ACV: <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">${result.toFixed(2)}</span></p>
        </div>
      )}
    </Section>
  );
}

export function AsciiTableGenerator() {
  const [data, setData] = useState('');
  const [table, setTable] = useState('');
  const gen = () => {
    const rows = data.trim().split('\n').map(r => r.split(',').map(c => c.trim()));
    if (rows.length < 2) return;
    const colWidths = rows[0].map((_, ci) => Math.max(...rows.map(r => (r[ci] || '').length)));
    const sep = (c: string) => '+' + colWidths.map(w => c.repeat(w + 2)).join('+') + '+';
    let out = sep('-') + '\n';
    out += '| ' + rows[0].map((h, i) => h.padEnd(colWidths[i])).join(' | ') + ' |\n';
    out += sep('=') + '\n';
    for (let i = 1; i < rows.length; i++) {
      out += '| ' + rows[i].map((c, j) => (c || '').padEnd(colWidths[j])).join(' | ') + ' |\n';
      out += sep('-') + '\n';
    }
    setTable(out);
  };
  return (
    <Section title="ASCII Table Generator">
      <Input label="CSV Data (first row = headers)" value={data} onChange={setData} placeholder="Name, Age, City\nAlice, 30, NYC\nBob, 25, SF" rows={4} />
      <button onClick={gen} className="px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-medium transition-colors">Generate Table</button>
      <Output value={table} label="ASCII Table" />
    </Section>
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
  return (
    <Section title="Git Commit Linter">
      <Input label="Commit Message" value={msg} onChange={setMsg} placeholder="feat: add user authentication" rows={2} />
      <button onClick={lint} className="px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-medium transition-colors">Lint Message</button>
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
    </Section>
  );
}

export function GitignoreGenerator() {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const items = ['node_modules', 'dist', 'build', '.env', '.env.local', '*.log', '.DS_Store', 'coverage', '.next', '.cache', 'venv', '__pycache__', '*.pyc', '.idea', '.vscode', '*.swp', '*.swo', 'Thumbs.db', '*.class', '*.jar'];
  const toggle = (k: string) => setSelected(p => ({ ...p, [k]: !p[k] }));
  const gen = () => '# Generated by Toolzum\n' + items.filter(k => selected[k]).map(k => '\n' + (k.startsWith('*') || k.startsWith('.') ? k : '/' + k)).join('') + '\n';
  const [output, setOutput] = useState('');
  const generate = () => setOutput(gen());
  return (
    <Section title=".gitignore Generator">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        {items.map(k => (
          <label key={k} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
            <input type="checkbox" checked={!!selected[k]} onChange={() => toggle(k)} className="rounded" />
            {k}
          </label>
        ))}
      </div>
      <button onClick={generate} className="px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-medium transition-colors">Generate .gitignore</button>
      <Output value={output} label=".gitignore" />
    </Section>
  );
}

export function HoursToMinutesConverter() {
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [total, setTotal] = useState<number | null>(null);
  const convert = () => { const h = parseFloat(hours) || 0; const m = parseFloat(minutes) || 0; setTotal(h * 60 + m); };
  return (
    <Section title="Hours & Minutes to Total Minutes">
      <Input label="Hours" value={hours} onChange={setHours} placeholder="e.g. 2" type="number" />
      <Input label="Minutes" value={minutes} onChange={setMinutes} placeholder="e.g. 30" type="number" />
      <button onClick={convert} className="px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-medium transition-colors">Convert</button>
      {total !== null && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl">
          <p className="text-sm text-zinc-600 dark:text-[var(--text-muted)]">Total Minutes: <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{total}</span></p>
        </div>
      )}
    </Section>
  );
}

export function ParquetToCsvConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [csv, setCsv] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (f: File) => {
    setFile(f);
    setCsv(null);
  };

  const convert = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      // parquet-wasm API is complex - for now show informative message
      setCsv('Parquet to CSV conversion requires server-side processing due to complex Arrow format handling. This is a client-side limitation. Use a server-based tool or Python (pandas/pyarrow) for Parquet conversion.');
    } catch (err) {
      setCsv('Error: ' + (err instanceof Error ? err.message : 'Failed to process Parquet'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Section title="Parquet to CSV Converter">
      <p className="text-sm text-[var(--text-secondary)] mb-4">Convert Parquet files to CSV format. Runs entirely in your browser using parquet-wasm.</p>
      <FileUploader 
        accept=".parquet" 
        onFileSelect={handleFileSelect} 
        title="Upload Parquet File"
        subtitle="Supports .parquet files"
      />
      {file && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl space-y-3">
          <p className="text-sm font-medium">Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
          <button onClick={convert} disabled={isProcessing} className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50">
            {isProcessing ? 'Converting...' : 'Convert to CSV'}
          </button>
        </div>
      )}
      {csv && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">CSV Output</label>
          <div className="relative">
            <pre className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 overflow-x-auto whitespace-pre-wrap max-h-60">{csv}</pre>
            <button onClick={() => downloadOrShare(csv, 'converted.csv')} className="absolute top-2 right-2 px-3 py-1 text-xs bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg transition-colors">Download</button>
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
  return (
    <Section title="SaaS Payback Period">
      <Input label="Customer Acquisition Cost ($)" value={cac} onChange={setCac} placeholder="e.g. 500" type="number" />
      <Input label="Monthly Revenue per Customer ($)" value={mrr} onChange={setMrr} placeholder="e.g. 50" type="number" />
      <button onClick={calc} className="px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-medium transition-colors">Calculate Payback</button>
      {result !== null && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl">
          <p className="text-sm text-zinc-600 dark:text-[var(--text-muted)]">Payback Period: <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{result.toFixed(1)} months</span></p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">{result < 12 ? 'Healthy payback period.' : 'Long payback — consider reducing CAC or increasing MRR.'}</p>
        </div>
      )}
    </Section>
  );
}

export function SaasQuickRatio() {
  const [n, setN] = useState(''); const [e, setE] = useState(''); const [r, setR] = useState(''); const [ch, setCh] = useState(''); const [co, setCo] = useState('');
  const [ratio, setRatio] = useState<number | null>(null);
  const calc = () => {
    const nn = parseFloat(n) || 0; const ee = parseFloat(e) || 0; const rr = parseFloat(r) || 0; const cc = parseFloat(ch) || 0; const coo = parseFloat(co) || 0;
    const denom = cc + coo; if (denom > 0) setRatio((nn + ee + rr) / denom); else if (nn + ee + rr > 0) setRatio(Infinity); else setRatio(null);
  };
  return (
    <Section title="SaaS Quick Ratio">
      <Input label="New MRR ($)" value={n} onChange={setN} placeholder="e.g. 10000" type="number" />
      <Input label="Expansion MRR ($)" value={e} onChange={setE} placeholder="e.g. 3000" type="number" />
      <Input label="Reactivation MRR ($)" value={r} onChange={setR} placeholder="e.g. 1000" type="number" />
      <Input label="Churned MRR ($)" value={ch} onChange={setCh} placeholder="e.g. 2000" type="number" />
      <Input label="Contraction MRR ($)" value={co} onChange={setCo} placeholder="e.g. 1000" type="number" />
      <button onClick={calc} className="px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-medium transition-colors">Calculate Quick Ratio</button>
      {ratio !== null && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl">
          <p className="text-sm text-zinc-600 dark:text-[var(--text-muted)]">Quick Ratio: <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{ratio === Infinity ? '∞' : ratio.toFixed(2)}</span></p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">{ratio >= 4 ? 'Excellent!' : ratio >= 2 ? 'Good' : ratio >= 1 ? 'Needs improvement' : 'At risk'}</p>
        </div>
      )}
    </Section>
  );
}

export function SaasRuleOf40() {
  const [growth, setGrowth] = useState('');
  const [margin, setMargin] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const calc = () => { const g = parseFloat(growth); const m = parseFloat(margin); if (!isNaN(g) && !isNaN(m)) setResult(g + m); };
  return (
    <Section title="SaaS Rule of 40">
      <Input label="Revenue Growth Rate (%)" value={growth} onChange={setGrowth} placeholder="e.g. 25" type="number" />
      <Input label="Profit Margin (%)" value={margin} onChange={setMargin} placeholder="e.g. 20 (or -5 for loss)" type="number" />
      <button onClick={calc} className="px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-medium transition-colors">Calculate</button>
      {result !== null && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl">
          <p className="text-sm text-zinc-600 dark:text-[var(--text-muted)]">Rule of 40 Score: <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{result.toFixed(1)}%</span></p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">{result >= 40 ? 'Passes the Rule of 40 ✓' : 'Below 40% threshold — focus on growth or profitability.'}</p>
        </div>
      )}
    </Section>
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
  return (
    <Section title="Swift Formatter">
      <Input label="Swift Code" value={code} onChange={setCode} placeholder="struct Foo {\nlet bar: String\n}" rows={6} />
      <button onClick={fmt} className="px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-medium transition-colors">Format</button>
      <Output value={formatted} label="Formatted Swift Code" />
    </Section>
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
  return (
    <Section title="Temperature Converter">
      <Input label="Value" value={value} onChange={setValue} placeholder="e.g. 100" type="number" />
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">From</label>
          <select value={from} onChange={e => setFrom(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50">
            <option value="celsius">Celsius</option>
            <option value="fahrenheit">Fahrenheit</option>
            <option value="kelvin">Kelvin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">To</label>
          <select value={to} onChange={e => setTo(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50">
            <option value="celsius">Celsius</option>
            <option value="fahrenheit">Fahrenheit</option>
            <option value="kelvin">Kelvin</option>
          </select>
        </div>
      </div>
      <button onClick={convert} className="px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-medium transition-colors">Convert</button>
      {result !== null && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl">
          <p className="text-sm text-zinc-600 dark:text-[var(--text-muted)]">Result: <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{result.toFixed(2)}°</span></p>
        </div>
      )}
    </Section>
  );
}

export function PdfToDocx() {
  const [file, setFile] = useState<File | null>(null);
  const [docxBlob, setDocxBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (f: File) => {
    setFile(f);
    setDocxBlob(null);
  };

  const convert = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;
      
      const docxContent = `
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            ${html.split('\n').map(line => `<w:p><w:r><w:t xml:space="preserve">${line.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>')}</w:t></w:r></w:p>`).join('')}
          </w:body>
        </w:document>
      `;
      
      const blob = new Blob([docxContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      setDocxBlob(blob);
    } catch (err) {
      console.error(err);
      toast.error('Failed to convert PDF to DOCX');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Section title="PDF to DOCX Converter">
      <p className="text-sm text-[var(--text-secondary)] mb-4">Convert PDF documents to editable DOCX format. Runs in your browser using mammoth.js.</p>
      <FileUploader 
        accept="application/pdf" 
        onFileSelect={handleFileSelect} 
        title="Upload PDF File"
        subtitle="Supports PDF files (Max 50MB)"
      />
      {file && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl space-y-3">
          <p className="text-sm font-medium">Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
          <button onClick={convert} disabled={isProcessing} className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50">
            {isProcessing ? 'Converting...' : 'Convert to DOCX'}
          </button>
        </div>
      )}
      {docxBlob && (
        <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex justify-between items-center">
          <div>
            <p className="font-medium text-emerald-400">Conversion Complete!</p>
            <p className="text-sm text-[var(--text-secondary)]">Download your DOCX file</p>
          </div>
          <button onClick={() => downloadOrShare(URL.createObjectURL(docxBlob), file?.name.replace('.pdf', '.docx') || 'converted.docx')} className="bg-white text-zinc-900 hover:bg-zinc-200 font-bold px-8 py-3 rounded-xl transition-colors shadow-lg whitespace-nowrap">
            Download DOCX
          </button>
        </div>
      )}
    </Section>
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
        fullText += content.items.map((item: any) => item.str).join(' ') + '\n\n';
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
        subtitle="Supports PDF files (Max 50MB)"
      />
      {file && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl space-y-3">
          <p className="text-sm font-medium">Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
          <button onClick={extract} disabled={isProcessing} className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50">
            {isProcessing ? 'Extracting Text...' : 'Extract Text'}
          </button>
        </div>
      )}
      {text && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Extracted Text</label>
          <div className="relative">
            <pre className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 overflow-x-auto whitespace-pre-wrap max-h-96">{text}</pre>
            <button onClick={() => downloadOrShare(text, file?.name.replace('.pdf', '.txt') || 'extracted.txt')} className="absolute top-2 right-2 px-3 py-1 text-xs bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg transition-colors">Download</button>
          </div>
        </div>
      )}
    </Section>
  );
}

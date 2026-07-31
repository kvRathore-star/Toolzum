"use client";
import React, { useState } from 'react';
import { getErrorMessage } from '@/utils/error';
import YAML from 'js-yaml';
import Link from 'next/link';

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
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }).catch(() => {});
  };
  return (
    <div className="mt-4">
      {label && <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>}
      <div className="relative">
        <pre className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 overflow-x-auto whitespace-pre-wrap break-all max-h-60">{value}</pre>
        <button onClick={copy} className="absolute top-2 right-2 px-3 py-1 text-xs bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
      </div>
    </div>
  );
}

export function TsvCsvConverter() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'tsv-to-csv' | 'csv-to-tsv'>('tsv-to-csv');
  const [output, setOutput] = useState('');

  const convert = () => {
    if (!input.trim()) return;
    const lines = input.split('\n').filter(l => l.trim());
    if (mode === 'tsv-to-csv') {
      const result = lines.map(l => {
        const cells = l.split('\t');
        return cells.map((c: string) => c.includes(',') ? `"${c}"` : c).join(',');
      }).join('\n');
      setOutput(result);
    } else {
      setOutput(lines.map(l => l.split(',').join('\t')).join('\n'));
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <Section title="TSV ↔ CSV Converter">
        <div className="flex gap-2 mb-3">
          <button onClick={() => setMode('tsv-to-csv')} className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${mode === 'tsv-to-csv' ? 'bg-blue-600 text-white shadow-sm' : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'}`}>TSV → CSV</button>
          <button onClick={() => setMode('csv-to-tsv')} className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${mode === 'csv-to-tsv' ? 'bg-blue-600 text-white shadow-sm' : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'}`}>CSV → TSV</button>
        </div>
        <Input label={mode === 'tsv-to-csv' ? 'TSV Input' : 'CSV Input'} value={input} onChange={setInput} rows={6} placeholder={mode === 'tsv-to-csv' ? 'col1\tcol2\tcol3\nval1\tval2\tval3' : 'col1,col2,col3\nval1,val2,val3'} />
        <button onClick={convert} className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Convert</button>
        <Output value={output} label={mode === 'tsv-to-csv' ? 'CSV Output' : 'TSV Output'} />
      </Section>
    </div>
  );
}

const SLUG_TO_MODE: Record<string, 'json-to-toon' | 'yaml-to-toon' | 'toon-to-json' | 'toon-to-yaml'> = {
  'json-toon-converter': 'json-to-toon',
  'yaml-to-toon': 'yaml-to-toon',
  'toon-to-json': 'toon-to-json',
  'toon-to-yaml': 'toon-to-yaml',
};

export default function ToonConverter({ slug }: { slug: string }) {
  return <JsonToonConverter initialMode={SLUG_TO_MODE[slug] || 'json-to-toon'} />;
}

export function JsonToonConverter({ initialMode }: { initialMode?: 'json-to-toon' | 'yaml-to-toon' | 'toon-to-json' | 'toon-to-yaml' }) {
  const [mode, setMode] = useState<'json-to-toon' | 'yaml-to-toon' | 'toon-to-json' | 'toon-to-yaml'>(initialMode || 'json-to-toon');
  const [input, setInput] = useState('{\n  "name": "Alice",\n  "age": 30,\n  "city": "New York"\n}');
  const [output, setOutput] = useState('');

  const toonify = (o: Record<string, unknown>, indent = ''): string => {
    let res = '';
    for (const [k, v] of Object.entries(o)) {
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        res += `${indent}${k} →\n${toonify(v as Record<string, unknown>, indent + '  ')}`;
      } else {
        res += `${indent}${k} → ${v}\n`;
      }
    }
    return res;
  };

  const detoonify = (text: string): Record<string, unknown> => {
    const lines = text.split('\n').filter(l => l.trim());
    const result: Record<string, unknown> = {};
    const stack: { indent: number; obj: Record<string, unknown> }[] = [{ indent: -1, obj: result }];
    for (const line of lines) {
      const indent = line.search(/\S/);
      const trimmed = line.trim();
      if (trimmed.includes('→')) {
        const [key, ...valParts] = trimmed.split('→');
        const k = key.trim();
        const v = valParts.join('→').trim();
        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
        if (v === '') {
          const newObj: Record<string, unknown> = {};
          (stack[stack.length - 1].obj)[k] = newObj;
          stack.push({ indent, obj: newObj });
        } else {
          const num = Number(v);
          (stack[stack.length - 1].obj)[k] = isNaN(num) ? v : num;
        }
      }
    }
    return result;
  };

  const convert = () => {
    try {
      if (mode === 'json-to-toon') {
        const obj = JSON.parse(input);
        setOutput(toonify(Array.isArray(obj) ? { items: obj } : obj));
      } else if (mode === 'yaml-to-toon') {
        let yaml: any;
        try {
          yaml = YAML.load(input);
        } catch {
          yaml = JSON.parse(input);
        }
        if (typeof yaml !== 'object' || yaml === null) throw new Error('Input must be an object');
        setOutput(toonify(Array.isArray(yaml) ? { items: yaml } : yaml));
      } else if (mode === 'toon-to-json') {
        const obj = detoonify(input);
        setOutput(JSON.stringify(obj, null, 2));
      } else {
        const obj = detoonify(input);
        const yaml = YAML.dump(obj, { indent: 2, lineWidth: 120, noRefs: true });
        setOutput(yaml);
      }
    } catch (e: unknown) {
      setOutput(`Error: ${getErrorMessage(e)}`);
    }
  };

  const MODES = [
    { id: 'json-to-toon' as const, label: 'JSON → Toon' },
    { id: 'yaml-to-toon' as const, label: 'YAML → Toon' },
    { id: 'toon-to-json' as const, label: 'Toon → JSON' },
    { id: 'toon-to-yaml' as const, label: 'Toon → YAML' },
  ];

  const placeholders: Record<string, string> = {
    'json-to-toon': '{\n  "name": "Alice",\n  "age": 30\n}',
    'yaml-to-toon': 'name: Alice\nage: 30',
    'toon-to-json': 'name → Alice\nage → 30',
    'toon-to-yaml': 'name → Alice\nage → 30',
  };

  const labels: Record<string, string> = {
    'json-to-toon': 'JSON Input',
    'yaml-to-toon': 'YAML Input',
    'toon-to-json': 'Toon Input',
    'toon-to-yaml': 'Toon Input',
  };

  const outputLabels: Record<string, string> = {
    'json-to-toon': 'Toon Output',
    'yaml-to-toon': 'Toon Output',
    'toon-to-json': 'JSON Output',
    'toon-to-yaml': 'YAML Output',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <Section title="Toon Converter">
        <div className="flex flex-wrap gap-1.5 mb-4">
          {MODES.map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); setInput(''); setOutput(''); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${mode === m.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'}`}>
              {m.label}
            </button>
          ))}
        </div>
        <Input label={labels[mode]} value={input} onChange={setInput} rows={6} placeholder={placeholders[mode]} />
        <button onClick={convert} className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Convert</button>
        <Output value={output} label={outputLabels[mode]} />
        <p className="text-xs text-[var(--text-secondary)] mt-2">Toon is a YAML-like human-readable format using → arrows instead of colons. Supports nested objects and converts both ways.</p>
      </Section>
    </div>
  );
}

export function CsvDataCleaner() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [colAware, setColAware] = useState(true);

  const clean = () => {
    if (!input.trim()) return;
    const lines = input.split('\n').filter(l => l.trim());
    if (lines.length < 2) { setOutput('Need at least a header and one data row'); return; }
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const cleaned = [header];
    for (const row of lines.slice(1)) {
      const cells = row.split(',');
      if (cells.every(c => !c.trim())) continue;
      const processed = cells.map((c, i) => {
        let val = c.trim();
        if (colAware && i < header.length) {
          if (/email/i.test(header[i])) val = val.toLowerCase();
          else if (/phone|mobile|tel|fax/i.test(header[i])) val = val.replace(/\D/g, '');
          else if (/note|comment|desc/i.test(header[i])) val = val.toLowerCase();
        }
        return val.includes(',') ? `"${val}"` : val;
      });
      cleaned.push(processed);
    }
    setOutput(cleaned.map(r => r.join(',')).join('\n'));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <Section title="CSV Data Cleaner">
        <Input label="CSV Input" value={input} onChange={setInput} rows={6} placeholder="name,email,phone\nJohn,john@Example.COM,123-456-7890" />
        <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-[var(--text-muted)] mb-3 cursor-pointer">
          <input type="checkbox" checked={colAware} onChange={e => setColAware(e.target.checked)} className="rounded" />
          Column-aware cleaning (lowercases emails, strips phone non-digits, lowercases notes)
        </label>
        <button onClick={clean} className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Clean CSV</button>
        <Output value={output} label="Cleaned CSV" />
      </Section>
    </div>
  );
}

export function CsvStatistics() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const analyze = () => {
    if (!input.trim()) return;
    const lines = input.split('\n').filter(l => l.trim());
    if (lines.length < 2) { setOutput('Need at least a header and one data row'); return; }
    const header = lines[0].split(',').map(h => h.trim());
    const data = lines.slice(1).map(r => r.split(',').map(c => c.trim()));
    const rows = data.length;
    const results: string[] = [`Rows: ${rows}`, `Columns: ${header.length}`, ''];
    header.forEach((name, i) => {
      const vals = data.map(r => r[i]).filter(v => v);
      const nums = vals.map(Number).filter(n => !isNaN(n));
      results.push(`── ${name} ──`);
      results.push(`Non-empty: ${vals.length}`);
      results.push(`Numeric count: ${nums.length}`);
      results.push(`Non-numeric count: ${vals.length - nums.length}`);
      if (nums.length > 0) {
        results.push(`Sum: ${nums.reduce((a, b) => a + b, 0).toFixed(2)}`);
        results.push(`Average: ${(nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2)}`);
        results.push(`Min: ${Math.min(...nums).toFixed(2)}`);
        results.push(`Max: ${Math.max(...nums).toFixed(2)}`);
      }
      results.push('');
    });
    setOutput(results.join('\n'));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <Section title="CSV Statistics">
        <Input label="CSV Input" value={input} onChange={setInput} rows={6} placeholder="name,age,salary\nAlice,30,75000\nBob,25,62000" />
        <button onClick={analyze} className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Generate Statistics</button>
        <Output value={output} label="Column Statistics" />
      </Section>
    </div>
  );
}

export function CsvHtmlTableConverter() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'csv-to-html' | 'html-to-csv'>('csv-to-html');
  const [output, setOutput] = useState('');
  const [preview, setPreview] = useState('');

  const convert = () => {
    if (!input.trim()) return;
    if (mode === 'csv-to-html') {
      const lines = input.split('\n').filter(l => l.trim());
      if (lines.length < 1) return;
      const header = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1).map(r => r.split(',').map(c => c.trim()));
      let html = '<table>\n  <thead>\n    <tr>';
      header.forEach(h => { html += `\n      <th>${h.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</th>`; });
      html += '\n    </tr>\n  </thead>\n  <tbody>';
      rows.forEach(r => {
        html += '\n    <tr>';
        r.forEach((c, i) => {
          const tag = i < header.length ? 'td' : 'td';
          html += `\n      <${tag}>${c.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</${tag}>`;
        });
        html += '\n    </tr>';
      });
      html += '\n  </tbody>\n</table>';
      setOutput(html);
      setPreview(html);
    } else {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<root>${input}</root>`, 'text/html');
      const tables = doc.querySelectorAll('table');
      if (tables.length === 0) { setOutput('No table found in HTML'); setPreview(''); return; }
      const table = tables[0];
      const rows = table.querySelectorAll('tr');
      const result: string[] = [];
      rows.forEach(tr => {
        const cells = tr.querySelectorAll('th, td');
        const row = Array.from(cells).map(c => {
          const text = c.textContent || '';
          return text.includes(',') ? `"${text}"` : text;
        }).join(',');
        result.push(row);
      });
      setOutput(result.join('\n'));
      setPreview('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <Section title="CSV ↔ HTML Table Converter">
        <div className="flex gap-2 mb-3">
          <button onClick={() => setMode('csv-to-html')} className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${mode === 'csv-to-html' ? 'bg-blue-600 text-white shadow-sm' : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'}`}>CSV → HTML</button>
          <button onClick={() => setMode('html-to-csv')} className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${mode === 'html-to-csv' ? 'bg-blue-600 text-white shadow-sm' : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'}`}>HTML → CSV</button>
        </div>
        <Input label={mode === 'csv-to-html' ? 'CSV Input' : 'HTML Table Input'} value={input} onChange={setInput} rows={6} placeholder={mode === 'csv-to-html' ? 'name,age\nAlice,30' : '<table><tr><th>Name</th></tr><tr><td>Alice</td></tr></table>'} />
        <button onClick={convert} className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Convert</button>
        {mode === 'csv-to-html' && preview && (
          <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl overflow-x-auto" dangerouslySetInnerHTML={{ __html: preview }} />
        )}
        <Output value={output} label={mode === 'csv-to-html' ? 'HTML Output' : 'CSV Output'} />
      </Section>
    </div>
  );
}

export function YamlValidator() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'validate' | 'to-json' | 'minify'>('validate');
  const [output, setOutput] = useState('');

  const process = () => {
    if (!input.trim()) { setOutput(''); return; }
    const lines = input.split('\n');
    if (mode === 'validate') {
      const issues: string[] = [];
      lines.forEach((l, i) => {
        if (/\t/.test(l)) issues.push(`Line ${i + 1}: Contains tab character — use spaces`);
        if (l.length > 0 && l[0] === ' ' && (l.match(/^ */)?.[0]?.length ?? 0) % 2 !== 0) issues.push(`Line ${i + 1}: Odd indentation (${(l.match(/^ */)?.[0]?.length ?? 0)} spaces)`);
      });
      if (issues.length === 0) {
        setOutput('✓ Valid YAML structure\nNo indentation or formatting issues found.');
      } else {
        setOutput(`Found ${issues.length} issue(s):\n\n` + issues.join('\n'));
      }
    } else if (mode === 'to-json') {
      try {
        const jsYaml = (window as any).jsyaml;
        if (jsYaml) {
          const obj = jsYaml.load(input);
          setOutput(JSON.stringify(obj, null, 2));
        } else {
          try {
            const converted = lines.map(l => {
              const m = l.match(/^(\s*)(\w[\w\d_]*):\s*(.*)/);
              if (!m) return l;
              const val = m[3] || '""';
              return `${m[1]}"${m[2]}": ${val}`;
            }).join('\n');
            setOutput(converted);
          } catch {
            setOutput('Could not convert to JSON. Try pasting into YAML↔JSON Converter for full js-yaml support.');
          }
        }
      } catch {
        setOutput('Error converting to JSON');
      }
    } else {
      setOutput(lines.filter(l => l.trim() && !l.trim().startsWith('#')).join('\n'));
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <Section title="YAML Validator">
        <div className="flex flex-wrap gap-2 mb-3">
          {[{ v: 'validate', l: 'Validate' }, { v: 'to-json', l: 'To JSON' }, { v: 'minify', l: 'Minify' }].map(({ v, l }) => (
            <button key={v} onClick={() => setMode(v as any)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${mode === v ? 'bg-blue-600 text-white shadow-sm' : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'}`}>{l}</button>
          ))}
        </div>
        <Input label="YAML Input" value={input} onChange={setInput} rows={6} placeholder="name: Alice\nage: 30" />
        <button onClick={process} className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold py-2.5 rounded-xl transition-all">{mode === 'validate' ? 'Validate' : mode === 'to-json' ? 'Convert to JSON' : 'Minify'}</button>
        <Output value={output} label={mode === 'validate' ? 'Validation Results' : mode === 'to-json' ? 'JSON Output' : 'Minified YAML'} />
        <p className="text-xs text-[var(--text-secondary)] mt-2">For full YAML↔JSON conversion with proper parsing, see <Link href="/converter/yaml-json-converter" className="text-blue-600 dark:text-blue-400 hover:underline">YAML↔JSON Converter</Link>. For structural formatting checks (indentation, tabs), use this YAML Validator.</p>
      </Section>
    </div>
  );
}

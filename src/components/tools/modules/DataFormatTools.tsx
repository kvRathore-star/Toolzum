"use client";
import React, { useState } from 'react';

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

export function JsonToonConverter() {
  const [input, setInput] = useState('{\n  "name": "Alice",\n  "age": 30,\n  "city": "New York"\n}');
  const [output, setOutput] = useState('');

  const convert = () => {
    try {
      const obj = JSON.parse(input);
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
      setOutput(toonify(Array.isArray(obj) ? { items: obj } : obj));
    } catch {
      setOutput('Invalid JSON');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <Section title="JSON → Toon Converter">
        <Input label="JSON Input" value={input} onChange={setInput} rows={6} placeholder='{"key": "value"}' />
        <button onClick={convert} className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Convert to Toon</button>
        <Output value={output} label="Toon Output" />
        <p className="text-xs text-[var(--text-secondary)] mt-2">Toon is a YAML-like human-readable format using → arrows instead of colons. Each key-value pair is shown as <span className="font-mono">key → value</span>.</p>
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
          let text = c.textContent || '';
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
        <p className="text-xs text-[var(--text-secondary)] mt-2">For full YAML↔JSON conversion with proper parsing, see <a href="/tools/yaml-json-converter" className="text-blue-600 dark:text-blue-400 hover:underline">YAML↔JSON Converter</a>. For structural formatting checks (indentation, tabs), use this YAML Validator.</p>
      </Section>
    </div>
  );
}

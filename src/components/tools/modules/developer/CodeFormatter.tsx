"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-xl">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{title}</h2>
      {children}
    </div>
  );
}

function formatJson(code: string) {
  try { return JSON.stringify(JSON.parse(code), null, 2); }
  catch { return 'Invalid JSON'; }
}

function indentCode(code: string, indent = 2) {
  const sp = ' '.repeat(indent);
  let depth = 0;
  return code.split('\n').map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (trimmed.match(/^<\/?/)) {
      if (trimmed.startsWith('</')) depth--;
      const out = sp.repeat(Math.max(0, depth)) + trimmed;
      if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) depth++;
      return out;
    }
    if (trimmed.match(/[}\]>]/)) depth = Math.max(0, depth - 1);
    const out = sp.repeat(depth) + trimmed;
    if (trimmed.match(/[{\[(<][^{}<]*$/) || trimmed.endsWith(':') && !trimmed.endsWith('::')) depth++;
    return out;
  }).join('\n');
}

function basicIndent(code: string, indent = 2) {
  const sp = ' '.repeat(indent);
  let depth = 0;
  return code.split('\n').map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    const dedent = trimmed.match(/^[})\];]/) ? 1 : 0;
    depth = Math.max(0, depth - dedent);
    const out = sp.repeat(depth) + trimmed;
    const indentNext = trimmed.match(/[({[]\s*$/) ? 1 : 0;
    depth += indentNext;
    return out;
  }).join('\n');
}

function formatSql(code: string) {
  const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'INNER', 'LEFT', 'RIGHT', 'JOIN', 'ON', 'GROUP BY', 'ORDER BY', 'LIMIT', 'OFFSET', 'HAVING', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'INDEX', 'UNIQUE', 'PRIMARY KEY', 'FOREIGN KEY', 'NOT', 'NULL', 'DEFAULT', 'CASCADE', 'AS', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'BETWEEN', 'LIKE', 'IN', 'IS', 'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'UNION', 'ALL', 'ASC', 'DESC'];
  let upper = code.replace(/\b[a-z]+\b/g, w => keywords.includes(w.toUpperCase()) ? w.toUpperCase() : w);
  upper = upper.replace(/,\s*/g, ',\n  ');
  upper = upper.replace(/\b(FROM|WHERE|AND|OR|JOIN|INNER|LEFT|RIGHT|ON|GROUP BY|ORDER BY|LIMIT|HAVING|UNION|VALUES|SET)\b/gi, '\n$1');
  return upper;
}

function formatYaml(code: string) {
  return code.split('\n').map(l => l.replace(/^\s+/, m => '  '.repeat(Math.floor(m.length / 2)))).join('\n');
}

function formatXml(code: string) {
  let depth = 0;
  const lines: string[] = [];
  const tokens = code.replace(/>\s*</g, '>\n<').split('\n');
  for (const line of tokens) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.match(/^<\//)) depth--;
    lines.push('  '.repeat(Math.max(0, depth)) + trimmed);
    if (trimmed.match(/^<[^/?!]/) && !trimmed.match(/\/>$/)) depth++;
  }
  return lines.join('\n');
}

function formatMarkdown(code: string) {
  return code.split('\n').map(l => {
    const m = l.match(/^(#{1,6})\s*/);
    if (m) return l.replace(/^#{1,6}\s*/, m[1] + ' ');
    return l.trimEnd();
  }).join('\n');
}

const LANGUAGES = [
  'JavaScript', 'TypeScript', 'JSX', 'TSX', 'JSON', 'HTML', 'CSS', 'SCSS', 'Python', 'SQL', 'YAML', 'XML', 'Markdown'
];

function formatCode(code: string, lang: string) {
  switch (lang) {
    case 'JSON': return formatJson(code);
    case 'HTML': return indentCode(code);
    case 'CSS': return basicIndent(code);
    case 'JavaScript':
    case 'TypeScript':
    case 'JSX':
    case 'TSX':
    case 'Python':
    case 'SCSS': return basicIndent(code);
    case 'SQL': return formatSql(code);
    case 'YAML': return formatYaml(code);
    case 'XML': return formatXml(code);
    case 'Markdown': return formatMarkdown(code);
    default: return basicIndent(code);
  }
}

const CODE_FORMATTER_PRESETS = [
  { label: 'Sample JSON', lang: 'JSON', code: '{\n  "name": "Toolzum",\n  "version": "1.0.0",\n  "features": ["formatter", "validator"],\n  "config": {\n    "theme": "dark",\n    "indent": 2\n  }\n}' },
  { label: 'Sample HTML', lang: 'HTML', code: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Sample</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n  <p>This is a sample HTML page.</p>\n</body>\n</html>' },
  { label: 'Sample CSS', lang: 'CSS', code: 'body {\n  margin: 0;\n  padding: 0;\n  font-family: sans-serif;\n}\n.container {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 1rem;\n}\n.card {\n  border: 1px solid #ccc;\n  border-radius: 8px;\n}' },
];

export default function CodeFormatter() {
  const [code, setCode] = useState('');
  const [lang, setLang] = useState('JSON');
  const [output, setOutput] = useState('');
  const handleFormat = () => { setOutput(formatCode(code, lang)); };
  return (
    <Section title="Code Formatter">
      <div className="flex flex-wrap gap-2 mb-4">
        {CODE_FORMATTER_PRESETS.map((p) => (
          <button key={p.label} onClick={() => { setLang(p.lang); setCode(p.code); setOutput(formatCode(p.code, p.lang)); toast.success(`Loaded ${p.label}`); }} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Language</label>
          <select value={lang} onChange={e => setLang(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50">
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Source Code</label>
          <textarea value={code} onChange={e => setCode(e.target.value)} placeholder="Paste your code here..." className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 font-mono h-64 outline-none text-sm resize-y" />
        </div>
        <button onClick={handleFormat} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Format Code</button>
        {output && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">Formatted Output</label>
              <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(output); toast.success('Copied!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
                <button onClick={() => { const blob = new Blob([output], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='output.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</button>
              </div>
            </div>
            <pre className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 font-mono text-sm h-64 overflow-auto whitespace-pre">{output}</pre>
          </div>
        )}
      </div>
    </Section>
  );
}

function createFormatter(lang: string) {
  return function Formatter() {
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const handleFormat = () => { setOutput(formatCode(code, lang)); };
    return (
      <Section title={`${lang} Formatter`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Source {lang}</label>
            <textarea value={code} onChange={e => setCode(e.target.value)} placeholder={`Paste ${lang} code here...`} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 font-mono h-64 outline-none text-sm resize-y" />
          </div>
          <button onClick={handleFormat} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Format {lang}</button>
          {output && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-[var(--text-secondary)]">Formatted Output</label>
                <div className="flex gap-2">
                  <button onClick={() => { navigator.clipboard.writeText(output); toast.success('Copied!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
                  <button onClick={() => { const blob = new Blob([output], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=`${lang.toLowerCase()}-formatted.txt`; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</button>
                </div>
              </div>
              <pre className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 font-mono text-sm h-64 overflow-auto whitespace-pre">{output}</pre>
            </div>
          )}
        </div>
      </Section>
    );
  };
}

export const JsonFormatter = createFormatter('JSON');
export const HtmlFormatter = createFormatter('HTML');
export const CssFormatter = createFormatter('CSS');
export const JavascriptFormatter = createFormatter('JavaScript');
export const TypescriptFormatter = createFormatter('TypeScript');
export const JsxFormatter = createFormatter('JSX');
export const TsxFormatter = createFormatter('TSX');
export const ScssFormatter = createFormatter('SCSS');
export const PythonFormatter = createFormatter('Python');
export const SqlFormatter = createFormatter('SQL');
export const YamlFormatter = createFormatter('YAML');
export const XmlFormatter = createFormatter('XML');
export const MarkdownFormatter = createFormatter('Markdown');

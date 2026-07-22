"use client";
import React, { useState } from 'react';

const inputClass = "w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 font-mono text-sm";
const labelClass = "block text-sm font-medium mb-1";
const btnClass = "w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg";
const cardClass = "max-w-4xl mx-auto p-6";
const headingClass = "text-2xl font-bold mb-6";
const textareaClass = "w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 font-mono h-64 outline-none text-sm resize-y";

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

export default function CodeFormatter() {
  const [code, setCode] = useState('');
  const [lang, setLang] = useState('JSON');
  const [output, setOutput] = useState('');
  const handleFormat = () => { setOutput(formatCode(code, lang)); };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Code Formatter</h1>
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Language</label>
          <select value={lang} onChange={e => setLang(e.target.value)} className={inputClass}>
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Source Code</label>
          <textarea value={code} onChange={e => setCode(e.target.value)} placeholder="Paste your code here..." className={textareaClass} />
        </div>
        <button onClick={handleFormat} className={btnClass}>Format Code</button>
        {output && (
          <div>
            <label className={labelClass}>Formatted Output</label>
            <pre className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 font-mono text-sm h-64 overflow-auto whitespace-pre">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

function createFormatter(lang: string) {
  return function Formatter() {
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const handleFormat = () => { setOutput(formatCode(code, lang)); };
    return (
      <div className={cardClass}>
        <h1 className={headingClass}>{lang} Formatter</h1>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Source {lang}</label>
            <textarea value={code} onChange={e => setCode(e.target.value)} placeholder={`Paste ${lang} code here...`} className={textareaClass} />
          </div>
          <button onClick={handleFormat} className={btnClass}>Format {lang}</button>
          {output && (
            <div>
              <label className={labelClass}>Formatted Output</label>
              <pre className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 font-mono text-sm h-64 overflow-auto whitespace-pre">{output}</pre>
            </div>
          )}
        </div>
      </div>
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

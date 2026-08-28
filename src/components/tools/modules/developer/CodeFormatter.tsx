"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full p-6">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{title}</h2>
      {children}
    </div>
  );
}

function formatJson(code: string, indent = 2, sortKeys = false) {
  try {
    let parsed = JSON.parse(code);
    if (sortKeys && typeof parsed === 'object' && parsed !== null) {
      const sortObj = (obj: any): any => {
        if (Array.isArray(obj)) return obj.map(sortObj);
        if (typeof obj === 'object' && obj !== null) {
          return Object.keys(obj).sort().reduce((acc: any, key) => { acc[key] = sortObj(obj[key]); return acc; }, {});
        }
        return obj;
      };
      parsed = sortObj(parsed);
    }
    return JSON.stringify(parsed, null, indent);
  }
  catch { return 'Invalid JSON'; }
}

function minifyJson(code: string) {
  try { return JSON.stringify(JSON.parse(code)); }
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

function validateCode(code: string, lang: string): string | null {
  if (!code.trim()) return null;
  if (lang === 'JSON') {
    try { JSON.parse(code); return null; }
    catch (e: any) {
      const match = e.message?.match(/position (\d+)/);
      if (match) {
        const pos = parseInt(match[1]);
        const upToPos = code.slice(0, pos);
        const line = upToPos.split('\n').length;
        const col = pos - upToPos.lastIndexOf('\n');
        return `JSON error at line ${line}, col ${col}`;
      }
      return 'Invalid JSON';
    }
  }
  return null;
}

const LANGUAGES = [
  'JavaScript', 'TypeScript', 'JSX', 'TSX', 'JSON', 'HTML', 'CSS', 'SCSS', 'Python', 'SQL', 'YAML', 'XML', 'Markdown'
];

const LANG_SAMPLES: Record<string, string> = {
  'JSON': '{\n  "name": "Toolzum",\n  "version": "1.0.0",\n  "features": ["formatter", "validator"],\n  "config": {\n    "theme": "dark",\n    "indent": 2\n  }\n}',
  'HTML': '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Sample</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n  <p>This is a sample HTML page.</p>\n</body>\n</html>',
  'CSS': 'body {\n  margin: 0;\n  padding: 0;\n  font-family: sans-serif;\n}\n.container {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 1rem;\n}\n.card {\n  border: 1px solid #ccc;\n  border-radius: 8px;\n}',
  'JavaScript': 'function greet(name) {\n  console.log(`Hello, ${name}!`);\n  return { message: `Welcome to Toolzum` };\n}\nconst users = ["Alice", "Bob"];\nusers.forEach(u => greet(u));',
  'TypeScript': 'interface User {\n  id: number;\n  name: string;\n  email?: string;\n}\nfunction getUser(id: number): User {\n  return { id, name: "Alice" };\n}',
  'Python': 'def greet(name: str) -> str:\n    return f"Hello, {name}!"\n\nfor user in ["Alice", "Bob"]:\n    print(greet(user))',
  'SQL': 'SELECT u.name, u.email, COUNT(o.id) as order_count\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id\nWHERE u.active = true\nGROUP BY u.name, u.email\nHAVING COUNT(o.id) > 0\nORDER BY order_count DESC\nLIMIT 10;',
  'YAML': 'server:\n  host: localhost\n  port: 3000\ndatabase:\n  name: mydb\n  pool: 10',
  'XML': '<config>\n  <server>\n    <host>localhost</host>\n    <port>3000</port>\n  </server>\n</config>',
  'SCSS': '$primary: #3498db;\n.container {\n  max-width: 1200px;\n  margin: 0 auto;\n  .card {\n    border: 1px solid $primary;\n    border-radius: 8px;\n  }\n}',
  'JSX': 'function App() {\n  return (\n    <div className="app">\n      <h1>Hello World</h1>\n      <p>Welcome to React</p>\n    </div>\n  );\n}',
  'TSX': 'interface Props {\n  title: string;\n  count?: number;\n}\nfunction Counter({ title, count = 0 }: Props) {\n  return <div>{title}: {count}</div>;\n}',
  'Markdown': '# Hello World\n\nThis is **bold** and *italic* text.\n\n- Item 1\n- Item 2\n\n> Blockquote\n\n```js\nconsole.log("code");\n```',
};

function formatCode(code: string, lang: string, options: { indent?: number; sortKeys?: boolean; minify?: boolean } = {}) {
  if (options.minify && lang === 'JSON') return minifyJson(code);
  switch (lang) {
    case 'JSON': return formatJson(code, options.indent || 2, options.sortKeys || false);
    case 'HTML': return indentCode(code, options.indent || 2);
    case 'CSS': return basicIndent(code, options.indent || 2);
    case 'JavaScript':
    case 'TypeScript':
    case 'JSX':
    case 'TSX':
    case 'Python':
    case 'SCSS': return basicIndent(code, options.indent || 2);
    case 'SQL': return formatSql(code);
    case 'YAML': return formatYaml(code);
    case 'XML': return formatXml(code);
    case 'Markdown': return formatMarkdown(code);
    default: return basicIndent(code, options.indent || 2);
  }
}

const CODE_FORMATTER_PRESETS = [
  { label: 'Sample JSON', lang: 'JSON', code: LANG_SAMPLES['JSON'] },
  { label: 'Sample HTML', lang: 'HTML', code: LANG_SAMPLES['HTML'] },
  { label: 'Sample CSS', lang: 'CSS', code: LANG_SAMPLES['CSS'] },
];

export default function CodeFormatter() {
  const [code, setCode] = useState('');
  const [lang, setLang] = useState('JSON');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [minify, setMinify] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleFormat = () => {
    const err = validateCode(code, lang);
    if (err) { setValidationError(err); toast.error(err); return; }
    setValidationError('');
    setOutput(formatCode(code, lang, { indent, sortKeys, minify }));
  };

  return (
    <Section title="Code Formatter">
      <div className="flex flex-wrap gap-2 mb-4">
        {CODE_FORMATTER_PRESETS.map((p) => (
          <button key={p.label} onClick={() => { setLang(p.lang); setCode(p.code); setOutput(formatCode(p.code, p.lang, { indent, sortKeys, minify })); toast.success(`Loaded ${p.label}`); }} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Language</label>
            <select value={lang} onChange={e => { setLang(e.target.value); setCode(LANG_SAMPLES[e.target.value] || ''); setOutput(''); setValidationError(''); }}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50">
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Indent</label>
            <select value={indent} onChange={e => setIndent(Number(e.target.value))}
              className="bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50">
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value={8}>8 spaces</option>
            </select>
          </div>
          {lang === 'JSON' && (
            <>
              <button onClick={() => setSortKeys(!sortKeys)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${sortKeys ? 'bg-purple-600 text-white' : 'bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                Sort Keys
              </button>
              <button onClick={() => setMinify(!minify)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${minify ? 'bg-orange-600 text-white' : 'bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                Minify
              </button>
            </>
          )}
          <button onClick={() => setShowPreview(!showPreview)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${showPreview ? 'bg-blue-600 text-white' : 'bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
            {showPreview ? 'Side by Side' : 'Preview'}
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Source Code</label>
          <textarea value={code} onChange={e => { setCode(e.target.value); setOutput(''); setValidationError(''); }} placeholder="Paste your code here..." className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 font-mono h-64 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 text-sm resize-y" />
        </div>
        {validationError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2 text-xs text-red-600 dark:text-red-400">{validationError}</div>
        )}
        <button onClick={handleFormat} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Format Code</button>
        {output && (
          showPreview ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-[var(--text-secondary)]">Input</label>
                </div>
                <pre className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 font-mono text-sm h-64 overflow-auto whitespace-pre">{code}</pre>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-[var(--text-secondary)]">Output</label>
                  <div className="flex gap-2">
                    <button onClick={() => { navigator.clipboard.writeText(output); toast.success('Copied!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
                    <button onClick={() => { const blob = new Blob([output], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=`${lang.toLowerCase()}-formatted.txt`; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</button>
                  </div>
                </div>
                <pre className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 font-mono text-sm h-64 overflow-auto whitespace-pre">{output}</pre>
              </div>
            </div>
          ) : (
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
          )
        )}
      </div>
    </Section>
  );
}

function createFormatter(lang: string) {
  return function Formatter() {
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [indent, setIndent] = useState(2);
    const [sortKeys, setSortKeys] = useState(false);
    const [minify, setMinify] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    const sampleCode = LANG_SAMPLES[lang] || '';

    const handleFormat = () => {
      const err = validateCode(code, lang);
      if (err) { setValidationError(err); toast.error(err); return; }
      setValidationError('');
      setOutput(formatCode(code, lang, { indent, sortKeys, minify }));
    };

    return (
      <Section title={`${lang} Formatter`}>
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => { setCode(sampleCode); setOutput(formatCode(sampleCode, lang, { indent, sortKeys, minify })); }}
            className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Sample {lang}
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Indent</label>
              <select value={indent} onChange={e => setIndent(Number(e.target.value))}
                className="bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50">
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={8}>8 spaces</option>
              </select>
            </div>
            {lang === 'JSON' && (
              <>
                <button onClick={() => setSortKeys(!sortKeys)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${sortKeys ? 'bg-purple-600 text-white' : 'bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                  Sort Keys
                </button>
                <button onClick={() => setMinify(!minify)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${minify ? 'bg-orange-600 text-white' : 'bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                  Minify
                </button>
              </>
            )}
            <button onClick={() => setShowPreview(!showPreview)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${showPreview ? 'bg-blue-600 text-white' : 'bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              {showPreview ? 'Side by Side' : 'Preview'}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Source {lang}</label>
            <textarea value={code} onChange={e => { setCode(e.target.value); setOutput(''); setValidationError(''); }} placeholder={`Paste ${lang} code here...`} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 font-mono h-64 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 text-sm resize-y" />
          </div>
          {validationError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2 text-xs text-red-600 dark:text-red-400">{validationError}</div>
          )}
          <button onClick={handleFormat} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Format {lang}</button>
          {output && (
            showPreview ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Input</label>
                  <pre className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 font-mono text-sm h-64 overflow-auto whitespace-pre">{code}</pre>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-[var(--text-secondary)]">Output</label>
                    <div className="flex gap-2">
                      <button onClick={() => { navigator.clipboard.writeText(output); toast.success('Copied!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
                      <button onClick={() => { const blob = new Blob([output], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=`${lang.toLowerCase()}-formatted.txt`; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</button>
                    </div>
                  </div>
                  <pre className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 font-mono text-sm h-64 overflow-auto whitespace-pre">{output}</pre>
                </div>
              </div>
            ) : (
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
            )
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

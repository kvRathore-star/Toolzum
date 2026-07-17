"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

type Tab = 'toml' | 'yaml' | 'xml' | 'sqltsv';

const TABS: { key: Tab; label: string }[] = [
  { key: 'toml', label: 'TOML' },
  { key: 'yaml', label: 'YAML' },
  { key: 'xml', label: 'XML & SQL' },
  { key: 'sqltsv', label: 'TSV & CSS' },
];

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 ${className}`}>{children}</div>;
}

function jsonToToml(obj: Record<string, any>, prefix = ''): string {
  const lines: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      if (!prefix) lines.push(`[${k}]`);
      lines.push(jsonToToml(v, prefix ? key : k));
    } else if (Array.isArray(v)) {
      for (const item of v) {
        if (item !== null && typeof item === 'object') {
          lines.push(`[[${key}]]`);
          lines.push(jsonToToml(item, ''));
        } else lines.push(`${k} = ${JSON.stringify(item)}`);
      }
    } else lines.push(`${k} = ${JSON.stringify(v)}`);
  }
  return lines.join('\n');
}

function tomlToJson(toml: string): Record<string, any> {
  const result: Record<string, any> = {};
  let current: [string, Record<string, any>][] = [];
  let curr: Record<string, any> = result;
  for (const line of toml.split('\n')) {
    const tr = line.trim();
    if (!tr || tr.startsWith('#')) continue;
    const arrMatch = tr.match(/^\[\[(.+)\]\]$/);
    if (arrMatch) {
      const arr = result[arrMatch[1]] = result[arrMatch[1]] || [];
      const obj: Record<string, any> = {};
      arr.push(obj);
      curr = obj;
      continue;
    }
    const secMatch = tr.match(/^\[(.+)\]$/);
    if (secMatch) {
      let obj = result;
      for (const part of secMatch[1].split('.')) obj = obj[part] = obj[part] || {};
      curr = obj;
      continue;
    }
    const eqIdx = tr.indexOf('=');
    if (eqIdx > 0) {
      let val: any = tr.slice(eqIdx + 1).trim();
      if (val === 'true') val = true;
      else if (val === 'false') val = false;
      else if (!isNaN(Number(val))) val = Number(val);
      else val = val.replace(/^["']|["']$/g, '');
      curr[tr.slice(0, eqIdx).trim()] = val;
    }
  }
  return result;
}

function jsonToYaml(obj: any, indent = 0): string {
  const pad = '  '.repeat(indent);
  if (obj === null || obj === undefined) return 'null';
  if (typeof obj === 'string') return obj.includes('\n') ? `|-\n${obj.split('\n').map(l => pad + '  ' + l).join('\n')}` : `"${obj}"`;
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
  if (Array.isArray(obj)) return obj.map(v => `${pad}- ${typeof v === 'object' ? '\n' + jsonToYaml(v, indent + 1) : jsonToYaml(v)}`).join('\n');
  return Object.entries(obj).map(([k, v]) => {
    if (typeof v === 'object' && v !== null) return `${pad}${k}:\n${jsonToYaml(v, indent + 1)}`;
    return `${pad}${k}: ${jsonToYaml(v)}`;
  }).join('\n');
}

function basicXmlToJson(xml: string): Record<string, any> {
  const result: Record<string, any> = {};
  const tagRe = /<(\w+)[^>]*>([\s\S]*?)<\/\1>/g;
  let m;
  while ((m = tagRe.exec(xml)) !== null) {
    const [, tag, inner] = m;
    const innerTrimmed = inner.trim();
    if (/^<[\s\S]+>$/.test(innerTrimmed)) result[tag] = basicXmlToJson(innerTrimmed);
    else result[tag] = innerTrimmed;
  }
  return result;
}

function jsonToXml(obj: any, root = 'root'): string {
  let xml = `<${root}>`;
  for (const [k, v] of Object.entries(obj)) {
    if (v !== null && typeof v === 'object') xml += jsonToXml(v, k);
    else xml += `<${k}>${v}</${k}>`;
  }
  xml += `</${root}>`;
  return xml;
}

export default function SerializationKit() {
  const [tab, setTab] = useState<Tab>('toml');
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${tab === t.key ? 'bg-blue-600 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}>{t.label}</button>
        ))}
      </div>
      {tab === 'toml' && <TomlTools />}
      {tab === 'yaml' && <YamlTools />}
      {tab === 'xml' && <XmlSqlTools />}
      {tab === 'sqltsv' && <TsvCssTools />}
    </div>
  );
}

function TomlTools() {
  const [json, setJson] = useState('{"server": {"host": "localhost", "port": 8080}, "debug": true}');
  const [toml, setToml] = useState('[server]\nhost = "localhost"\nport = 8080\n\ndebug = true');
  const [tomlOut, setTomlOut] = useState('');
  const [jsonOut, setJsonOut] = useState('');
  const [validation, setValidation] = useState('');

  const JsonToToml = () => { try { setTomlOut(jsonToToml(JSON.parse(json))); } catch { toast.error('Invalid JSON'); } };
  const TomlToJson = () => { try { setJsonOut(JSON.stringify(tomlToJson(toml), null, 2)); } catch { toast.error('Invalid TOML'); } };
  const validateToml = () => { try { tomlToJson(toml); setValidation('✅ Valid TOML'); } catch { setValidation('❌ Invalid TOML'); } };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">JSON → TOML</h4><textarea rows={5} value={json} onChange={e => setJson(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" /><button onClick={JsonToToml} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Convert</button>{tomlOut && <textarea readOnly rows={5} value={tomlOut} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}</Card>
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">TOML → JSON</h4><textarea rows={5} value={toml} onChange={e => setToml(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" /><button onClick={TomlToJson} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Convert</button>{jsonOut && <textarea readOnly rows={5} value={jsonOut} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}</Card>
      <Card className="md:col-span-2"><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">TOML Validator</h4><textarea rows={4} value={toml} onChange={e => setToml(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" /><button onClick={validateToml} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Validate</button>{validation && <p className="mt-2 p-2 rounded-lg text-sm font-mono bg-zinc-100 dark:bg-zinc-800">{validation}</p>}</Card>
    </div>
  );
}

function YamlTools() {
  const [yaml, setYaml] = useState('server:\n  host: "localhost"\n  port: 8080\ndebug: true');
  const [json, setJson] = useState('{"server":{"host":"localhost","port":8080},"debug":true}');
  const [yamlOut, setYamlOut] = useState('');
  const [jsonOut, setJsonOut] = useState('');
  const [validation, setValidation] = useState('');
  const [toonOut, setToonOut] = useState('');

  const YamlToJson = () => {
    try {
      const obj: Record<string, any> = {};
      let curr = obj;
      const stack: { obj: Record<string, any>; key: string }[] = [];
      yaml.split('\n').forEach(line => {
        const indent = line.search(/\S/);
        const content = line.trim();
        if (!content || content.startsWith('#')) return;
        while (stack.length > 0 && stack[stack.length - 1].key.length >= indent) stack.pop();
        if (content.endsWith(':')) {
          const key = content.slice(0, -1);
          const newObj: Record<string, any> = {};
          if (stack.length === 0) { obj[key] = newObj; curr = newObj; }
          else { stack[stack.length - 1].obj[key] = newObj; curr = newObj; }
          stack.push({ obj: curr, key: '' });
        } else {
          const [k, ...v] = content.split(': ');
          const val = v.join(': ').replace(/^["']|["']$/g, '');
          if (stack.length === 0) curr[k.trim()] = isNaN(Number(val)) ? val : Number(val);
          else stack[stack.length - 1].obj[k.trim()] = isNaN(Number(val)) ? val : Number(val);
        }
      });
      setJsonOut(JSON.stringify(obj, null, 2));
    } catch { toast.error('Invalid YAML'); }
  };

  const JsonToYaml = () => { try { setYamlOut(jsonToYaml(JSON.parse(json))); } catch { toast.error('Invalid JSON'); } };

  const JsonToToon = () => {
    try {
      const obj = JSON.parse(json);
      const toonify = (o: any, d = 0): string => {
        if (typeof o !== 'object' || o === null) return JSON.stringify(o);
        const ind = '  '.repeat(d);
        if (Array.isArray(o)) return `[\n${o.map(v => `${ind}  ${toonify(v, d + 1)}`).join(',\n')}\n${ind}]`;
        return `{\n${Object.entries(o).map(([k, v]) => `${ind}  ${k} → ${toonify(v, d + 1)}`).join(',\n')}\n${ind}}`;
      };
      setToonOut(toonify(obj));
    } catch { toast.error('Invalid JSON'); }
  };

  const validateYaml = () => {
    try {
      const obj: Record<string, any> = {};
      yaml.split('\n').forEach(line => {
        const tr = line.trim();
        if (tr && !tr.startsWith('#') && !tr.endsWith(':')) {
          const eq = tr.indexOf(': ');
          if (eq > 0) obj[tr.slice(0, eq).trim()] = tr.slice(eq + 2);
        }
      });
      setValidation(`✅ Valid (${Object.keys(obj).length} top-level keys)`);
    } catch { setValidation('❌ Invalid YAML'); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">YAML → JSON</h4><textarea rows={5} value={yaml} onChange={e => setYaml(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" /><button onClick={YamlToJson} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Convert</button>{jsonOut && <textarea readOnly rows={5} value={jsonOut} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}</Card>
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">JSON → YAML</h4><textarea rows={5} value={json} onChange={e => setJson(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" /><button onClick={JsonToYaml} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Convert</button>{yamlOut && <textarea readOnly rows={5} value={yamlOut} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}</Card>
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">JSON → Toon (YAML-like)</h4><textarea rows={5} value={json} onChange={e => setJson(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" /><button onClick={JsonToToon} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Convert</button>{toonOut && <textarea readOnly rows={5} value={toonOut} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}</Card>
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">YAML Validator</h4><textarea rows={5} value={yaml} onChange={e => setYaml(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" /><button onClick={validateYaml} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Validate</button>{validation && <p className="mt-2 p-2 rounded-lg text-sm font-mono bg-zinc-100 dark:bg-zinc-800">{validation}</p>}</Card>
    </div>
  );
}

function XmlSqlTools() {
  const [xml, setXml] = useState('<root><item><id>1</id><name>Alice</name></item><item><id>2</id><name>Bob</name></item></root>');
  const [xmlOut, setXmlOut] = useState('');
  const [validation, setValidation] = useState('');

  const XmlToJson = () => { try { setXmlOut(JSON.stringify(basicXmlToJson(xml), null, 2)); } catch { toast.error('Invalid XML'); } };

  const validateXml = () => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      const err = doc.querySelector('parsererror');
      setValidation(err ? `❌ ${err.textContent}` : '✅ Valid XML');
    } catch { setValidation('❌ Invalid XML'); }
  };

  const XmlToYaml = () => { try { setXmlOut(jsonToYaml(basicXmlToJson(xml))); } catch { toast.error('Invalid XML'); } };

  const XmlToToon = () => {
    try {
      const obj = basicXmlToJson(xml);
      const toonify = (o: any, d = 0): string => {
        if (typeof o !== 'object' || o === null) return JSON.stringify(o);
        const ind = '  '.repeat(d);
        if (Array.isArray(o)) return `[\n${o.map(v => `${ind}  ${toonify(v, d + 1)}`).join(',\n')}\n${ind}]`;
        return `{\n${Object.entries(o).map(([k, v]) => `${ind}  ${k} → ${toonify(v, d + 1)}`).join(',\n')}\n${ind}}`;
      };
      setXmlOut(toonify(obj));
    } catch { toast.error('Invalid XML'); }
  };

  const XmlToCsv = () => {
    try {
      const obj = basicXmlToJson(xml);
      const extract = (o: any, prefix = ''): Record<string, string> => {
        const row: Record<string, string> = {};
        for (const [k, v] of Object.entries(o)) {
          if (v && typeof v === 'object') Object.assign(row, extract(v, `${prefix}${k}_`));
          else row[`${prefix}${k}`] = String(v);
        }
        return row;
      };
      const root = Object.keys(basicXmlToJson(xml))[0] || 'root';
      const rows = Object.values(basicXmlToJson(xml));
      const allRows: Record<string, string>[] = Array.isArray(obj[root]) ? (obj[root] as any[]).map((r: any) => extract(r)) : [extract(obj[root])];
      const headers = [...new Set(allRows.flatMap(r => Object.keys(r)))];
      const csv = [headers.join(','), ...allRows.map(r => headers.map(h => r[h] || '').join(','))].join('\n');
      setXmlOut(csv);
    } catch { toast.error('Could not convert XML to CSV'); }
  };

  const [sqlInsert, setSqlInsert] = useState("INSERT INTO users (id, name, email) VALUES (1, 'Alice', 'alice@test.com');");
  const [sqlJson, setSqlJson] = useState('');
  const [sqlCsv, setSqlCsv] = useState('');

  const SqlToJson = () => {
    try {
      const match = sqlInsert.match(/INSERT\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
      if (!match) { toast.error('Could not parse INSERT'); return; }
      const table = match[1];
      const cols = match[2].split(',').map(c => c.trim());
      const vals = match[3].split(',').map(v => v.trim().replace(/^'|'$/g, ''));
      const obj: Record<string, any> = { table, data: {} };
      cols.forEach((c, i) => { obj.data[c] = isNaN(Number(vals[i])) ? vals[i] : Number(vals[i]); });
      setSqlJson(JSON.stringify(obj, null, 2));
      setSqlCsv([cols.join(','), vals.join(',')].join('\n'));
    } catch { toast.error('Failed to parse SQL'); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">XML → JSON / YAML / CSV</h4><textarea rows={5} value={xml} onChange={e => setXml(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" />
        <div className="grid grid-cols-2 gap-2 mt-2">
          <button onClick={XmlToJson} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">→ JSON</button>
          <button onClick={XmlToYaml} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">→ YAML</button>
          <button onClick={XmlToToon} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">→ Toon</button>
          <button onClick={XmlToCsv} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">→ CSV</button>
        </div>
        {xmlOut && <textarea readOnly rows={5} value={xmlOut} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
      </Card>
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">XML Validator</h4><textarea rows={5} value={xml} onChange={e => setXml(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" /><button onClick={validateXml} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Validate</button>{validation && <p className="mt-2 p-2 rounded-lg text-sm font-mono bg-zinc-100 dark:bg-zinc-800">{validation}</p>}</Card>
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">SQL INSERT → JSON & CSV</h4><textarea rows={3} value={sqlInsert} onChange={e => setSqlInsert(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" /><button onClick={SqlToJson} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Convert</button>{sqlJson && <><textarea readOnly rows={3} value={sqlJson} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" /><textarea readOnly rows={3} value={sqlCsv} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" /></>}</Card>
    </div>
  );
}

function TsvCssTools() {
  const [tsv, setTsv] = useState('Name\tAge\tCity\nAlice\t30\tNYC\nBob\t25\tLA');
  const [csv, setCsv] = useState('');
  const [scss, setScss] = useState('.btn {\n  color: red;\n  font-weight: bold;\n}');
  const [cssOut, setCssOut] = useState('');
  const [stylus, setStylus] = useState('.btn\n  color red\n  font-weight bold');
  const [stylCss, setStylCss] = useState('');
  const [tailwind, setTailwind] = useState('text-red-500 font-bold p-4 bg-blue-100');
  const [tailCss, setTailCss] = useState('');

  const TsvToCsv = () => {
    setCsv(tsv.split('\n').map(l => l.split('\t').map(c => c.includes(',') ? `"${c}"` : c).join(',')).join('\n'));
  };

  const ScssToCss = () => {
    setCssOut(scss.replace(/\n\s*/g, ' ').replace(/\s*([{}:;])\s*/g, '$1').replace(/;}/g, '}').trim());
  };

  const StylusToCss = () => {
    let css = '';
    let indentLevel = 0;
    stylus.split('\n').forEach(line => {
      const content = line.trim();
      if (!content) return;
      const indent = line.search(/\S/);
      if (content.endsWith(':')) {
        css += `${'  '.repeat(indent / 2)}${content.slice(0, -1)} {\n`;
        indentLevel++;
      } else if (content.includes(' ')) {
        const [prop, ...val] = content.split(' ');
        css += `${'  '.repeat(indent / 2)}  ${prop}: ${val.join(' ')};\n`;
      }
    });
    css += '}'.repeat(indentLevel);
    setStylCss(css || stylus);
  };

  const TailwindToCss = () => {
    const classes = tailwind.split(' ');
    const map: Record<string, string> = {
      'text-red-500': 'color: #ef4444;', 'font-bold': 'font-weight: 700;',
      'p-4': 'padding: 1rem;', 'bg-blue-100': 'background-color: #dbeafe;',
      'text-center': 'text-align: center;', 'text-lg': 'font-size: 1.125rem;',
      'rounded-lg': 'border-radius: 0.5rem;', 'shadow': 'box-shadow: 0 1px 3px rgba(0,0,0,0.1);',
      'flex': 'display: flex;', 'items-center': 'align-items: center;',
      'justify-center': 'justify-content: center;', 'gap-4': 'gap: 1rem;',
      'mt-4': 'margin-top: 1rem;', 'mb-4': 'margin-bottom: 1rem;',
      'w-full': 'width: 100%;', 'h-full': 'height: 100%;',
    };
    let css = '';
    classes.forEach(c => { if (map[c]) css += `  ${map[c]}\n`; });
    setTailCss(css || '.no-tailwind-classes-found {\n  /* Classes not recognized — add custom mappings */\n}');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">TSV → CSV</h4><textarea rows={4} value={tsv} onChange={e => setTsv(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" /><button onClick={TsvToCsv} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Convert</button>{csv && <textarea readOnly rows={4} value={csv} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}</Card>
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">SCSS → CSS</h4><textarea rows={4} value={scss} onChange={e => setScss(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" /><button onClick={ScssToCss} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Convert</button>{cssOut && <textarea readOnly rows={4} value={cssOut} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}</Card>
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">Stylus → CSS</h4><textarea rows={4} value={stylus} onChange={e => setStylus(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" /><button onClick={StylusToCss} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Convert</button>{stylCss && <textarea readOnly rows={4} value={stylCss} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}</Card>
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">Tailwind → CSS</h4><textarea rows={3} value={tailwind} onChange={e => setTailwind(e.target.value)} placeholder="space-separated classes" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono" /><button onClick={TailwindToCss} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Convert</button>{tailCss && <textarea readOnly rows={4} value={tailCss} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}</Card>
    </div>
  );
}

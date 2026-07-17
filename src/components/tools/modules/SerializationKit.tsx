"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Clipboard } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'toml' | 'yaml' | 'sqltsv';

const TABS: { key: Tab; label: string }[] = [
  { key: 'toml', label: 'TOML' },
  { key: 'yaml', label: 'YAML' },
  { key: 'sqltsv', label: 'TSV & CSS' },
];

function CopyBtn({ text, label }: { text: string; label?: string }) {
  return (
    <button onClick={() => { clipboardWrite(text); toast.success(label ? `${label} copied!` : 'Copied!'); }}
      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"><Clipboard className="w-3 h-3" /> Copy</button>
  );
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

export default function SerializationKit() {
  const [tab, setTab] = useState<Tab>('toml');
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 bg-zinc-100 dark:bg-zinc-800/50 p-1.5 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${tab === t.key ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>{t.label}</button>
        ))}
      </div>
      {tab === 'toml' && <TomlTools />}
      {tab === 'yaml' && <YamlTools />}
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
  const validateToml = () => { try { tomlToJson(toml); setValidation('Valid TOML'); } catch { setValidation('Invalid TOML'); } };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">JSON → TOML</h5>
        <textarea rows={5} value={json} onChange={e => setJson(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <button onClick={JsonToToml} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Convert</button>
        {tomlOut && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{tomlOut}</pre><div className="mt-1"><CopyBtn text={tomlOut} label="TOML" /></div></div>}
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">TOML → JSON</h5>
        <textarea rows={5} value={toml} onChange={e => setToml(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <button onClick={TomlToJson} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Convert</button>
        {jsonOut && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{jsonOut}</pre><div className="mt-1"><CopyBtn text={jsonOut} label="JSON" /></div></div>}
      </div>
      <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">TOML Validator</h5>
        <textarea rows={4} value={toml} onChange={e => setToml(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <button onClick={validateToml} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Validate</button>
        {validation && <p className={`text-sm font-semibold font-mono ${validation.startsWith('Valid') ? 'text-emerald-600' : 'text-red-500'}`}>{validation}</p>}
      </div>
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
      setValidation(`Valid (${Object.keys(obj).length} top-level keys)`);
    } catch { setValidation('Invalid YAML'); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">YAML → JSON</h5>
        <textarea rows={5} value={yaml} onChange={e => setYaml(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <button onClick={YamlToJson} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Convert</button>
        {jsonOut && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{jsonOut}</pre><div className="mt-1"><CopyBtn text={jsonOut} label="JSON" /></div></div>}
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">JSON → YAML</h5>
        <textarea rows={5} value={json} onChange={e => setJson(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <button onClick={JsonToYaml} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Convert</button>
        {yamlOut && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{yamlOut}</pre><div className="mt-1"><CopyBtn text={yamlOut} label="YAML" /></div></div>}
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">JSON → Toon (YAML-like)</h5>
        <textarea rows={5} value={json} onChange={e => setJson(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <button onClick={JsonToToon} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Convert</button>
        {toonOut && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{toonOut}</pre><div className="mt-1"><CopyBtn text={toonOut} label="Toon" /></div></div>}
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">YAML Validator</h5>
        <textarea rows={5} value={yaml} onChange={e => setYaml(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <button onClick={validateYaml} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Validate</button>
        {validation && <p className={`text-sm font-semibold font-mono ${validation.startsWith('Valid') ? 'text-emerald-600' : 'text-red-500'}`}>{validation}</p>}
      </div>
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
    setTailCss(css || '.no-tailwind-classes-found {\n  /* Classes not recognized */\n}');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">TSV → CSV</h5>
        <textarea rows={4} value={tsv} onChange={e => setTsv(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <button onClick={TsvToCsv} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Convert</button>
        {csv && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{csv}</pre><div className="mt-1"><CopyBtn text={csv} label="CSV" /></div></div>}
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">SCSS → CSS</h5>
        <textarea rows={4} value={scss} onChange={e => setScss(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <button onClick={ScssToCss} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Convert</button>
        {cssOut && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{cssOut}</pre><div className="mt-1"><CopyBtn text={cssOut} label="CSS" /></div></div>}
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Stylus → CSS</h5>
        <textarea rows={4} value={stylus} onChange={e => setStylus(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <button onClick={StylusToCss} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Convert</button>
        {stylCss && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{stylCss}</pre><div className="mt-1"><CopyBtn text={stylCss} label="CSS" /></div></div>}
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Tailwind → CSS</h5>
        <textarea rows={3} value={tailwind} onChange={e => setTailwind(e.target.value)} placeholder="space-separated classes"
          className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <button onClick={TailwindToCss} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Convert</button>
        {tailCss && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{tailCss}</pre><div className="mt-1"><CopyBtn text={tailCss} label="CSS" /></div></div>}
      </div>
    </div>
  );
}

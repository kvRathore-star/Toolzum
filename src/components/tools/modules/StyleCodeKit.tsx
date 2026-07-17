"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Clipboard } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'css' | 'proto' | 'ts';

const TABS: { key: Tab; label: string }[] = [
  { key: 'css', label: 'CSS Preprocessors' },
  { key: 'proto', label: 'Protobuf' },
  { key: 'ts', label: 'TypeScript' },
];

function CopyBtn({ text, label }: { text: string; label?: string }) {
  return (
    <button onClick={() => { clipboardWrite(text); toast.success(label ? `${label} copied!` : 'Copied!'); }}
      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"><Clipboard className="w-3 h-3" /> Copy</button>
  );
}

export default function StyleCodeKit() {
  const [tab, setTab] = useState<Tab>('css');

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 bg-zinc-100 dark:bg-zinc-800/50 p-1.5 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${tab === t.key ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>{t.label}</button>
        ))}
      </div>
      {tab === 'css' && <CssPreprocTools />}
      {tab === 'proto' && <ProtoTools />}
      {tab === 'ts' && <TypeScriptTools />}
    </div>
  );
}

function CssPreprocTools() {
  const [scss, setScss] = useState('$primary: #3b82f6;\n.btn {\n  color: $primary;\n  font-weight: bold;\n  &:hover {\n    opacity: 0.8;\n  }\n}');
  const [css, setCss] = useState('');
  const [stylus, setStylus] = useState('.btn\n  color #3b82f6\n  font-weight bold\n  &:hover\n    opacity 0.8');
  const [stylCss, setStylCss] = useState('');
  const [tailwind, setTailwind] = useState('flex items-center justify-between p-4 bg-white shadow rounded-lg');
  const [tailCss, setTailCss] = useState('');

  const convertScss = () => {
    let result = scss
      .replace(/\$(\w+):\s*([^;]+);/g, '/* $1: $2 */')
      .replace(/&/g, '')
      .replace(/\n\s*/g, ' ')
      .replace(/\s*([{}:;])\s*/g, '$1')
      .replace(/;}/g, '}')
      .trim();
    setCss(result);
  };

  const convertStylus = () => {
    let result = '';
    let depth = 0;
    stylus.split('\n').forEach(line => {
      const content = line.trim();
      if (!content || content.startsWith('//')) return;
      const indent = line.search(/\S/);
      if (content.startsWith('&:') || content.startsWith('.')) {
        while (depth > 0) { result += '}'; depth--; }
        const selector = content.replace('&', '').trim();
        result += `${selector} { `;
        depth++;
      } else if (content.includes(' ')) {
        const [prop, ...val] = content.split(' ');
        result += `${prop}: ${val.join(' ')}; `;
      }
    });
    while (depth > 0) { result += ' }'; depth--; }
    setStylCss(result);
  };

  const tailwindMap: Record<string, string> = {
    'flex': 'display: flex;', 'items-center': 'align-items: center;', 'justify-center': 'justify-content: center;',
    'justify-between': 'justify-content: space-between;', 'justify-around': 'justify-content: space-around;',
    'flex-col': 'flex-direction: column;', 'flex-wrap': 'flex-wrap: wrap;', 'gap-1': 'gap: 0.25rem;',
    'gap-2': 'gap: 0.5rem;', 'gap-4': 'gap: 1rem;', 'gap-6': 'gap: 1.5rem;', 'gap-8': 'gap: 2rem;',
    'p-0': 'padding: 0;', 'p-1': 'padding: 0.25rem;', 'p-2': 'padding: 0.5rem;', 'p-4': 'padding: 1rem;',
    'p-6': 'padding: 1.5rem;', 'p-8': 'padding: 2rem;', 'px-4': 'padding-left: 1rem; padding-right: 1rem;',
    'py-2': 'padding-top: 0.5rem; padding-bottom: 0.5rem;', 'py-4': 'padding-top: 1rem; padding-bottom: 1rem;',
    'm-0': 'margin: 0;', 'm-4': 'margin: 1rem;', 'mt-2': 'margin-top: 0.5rem;', 'mt-4': 'margin-top: 1rem;',
    'mb-4': 'margin-bottom: 1rem;', 'ml-auto': 'margin-left: auto;', 'mx-auto': 'margin-left: auto; margin-right: auto;',
    'text-xs': 'font-size: 0.75rem;', 'text-sm': 'font-size: 0.875rem;', 'text-base': 'font-size: 1rem;',
    'text-lg': 'font-size: 1.125rem;', 'text-xl': 'font-size: 1.25rem;', 'text-2xl': 'font-size: 1.5rem;',
    'text-3xl': 'font-size: 1.875rem;', 'font-normal': 'font-weight: 400;', 'font-medium': 'font-weight: 500;',
    'font-bold': 'font-weight: 700;', 'text-center': 'text-align: center;', 'text-left': 'text-align: left;',
    'text-right': 'text-align: right;', 'text-white': 'color: #fff;', 'text-black': 'color: #000;',
    'text-gray-500': 'color: #6b7280;', 'text-red-500': 'color: #ef4444;', 'text-blue-500': 'color: #3b82f6;',
    'text-green-500': 'color: #22c55e;', 'bg-white': 'background-color: #fff;',
    'bg-gray-100': 'background-color: #f3f4f6;', 'bg-blue-100': 'background-color: #dbeafe;',
    'bg-blue-500': 'background-color: #3b82f6;', 'bg-red-500': 'background-color: #ef4444;',
    'rounded': 'border-radius: 0.25rem;', 'rounded-md': 'border-radius: 0.375rem;',
    'rounded-lg': 'border-radius: 0.5rem;', 'rounded-xl': 'border-radius: 0.75rem;',
    'rounded-full': 'border-radius: 9999px;', 'shadow': 'box-shadow: 0 1px 3px rgba(0,0,0,0.1);',
    'shadow-md': 'box-shadow: 0 4px 6px rgba(0,0,0,0.1);', 'shadow-lg': 'box-shadow: 0 10px 15px rgba(0,0,0,0.1);',
    'w-full': 'width: 100%;', 'w-auto': 'width: auto;', 'h-full': 'height: 100%;', 'h-auto': 'height: auto;',
    'min-h-screen': 'min-height: 100vh;', 'max-w-md': 'max-width: 28rem;', 'max-w-lg': 'max-width: 32rem;',
    'max-w-xl': 'max-width: 36rem;', 'max-w-2xl': 'max-width: 42rem;', 'max-w-4xl': 'max-width: 56rem;',
    'relative': 'position: relative;', 'absolute': 'position: absolute;', 'fixed': 'position: fixed;',
    'top-0': 'top: 0;', 'right-0': 'right: 0;', 'bottom-0': 'bottom: 0;', 'left-0': 'left: 0;',
    'z-10': 'z-index: 10;', 'z-50': 'z-index: 50;', 'overflow-hidden': 'overflow: hidden;',
    'overflow-auto': 'overflow: auto;', 'cursor-pointer': 'cursor: pointer;', 'select-none': 'user-select: none;',
    'opacity-50': 'opacity: 0.5;', 'opacity-80': 'opacity: 0.8;', 'hidden': 'display: none;',
    'block': 'display: block;', 'inline-block': 'display: inline-block;', 'inline': 'display: inline;',
    'grid': 'display: grid;', 'grid-cols-1': 'grid-template-columns: repeat(1, 1fr);',
    'grid-cols-2': 'grid-template-columns: repeat(2, 1fr);', 'grid-cols-3': 'grid-template-columns: repeat(3, 1fr);',
    'col-span-2': 'grid-column: span 2;', 'col-span-3': 'grid-column: span 3;',
    'whitespace-nowrap': 'white-space: nowrap;', 'truncate': 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;',
  };
  const tailwindMapExtra: Record<string, (v: string) => string> = {
    'text-\\[([^\\]]+)\\]': v => `color: ${v};`,
    'bg-\\[([^\\]]+)\\]': v => `background-color: ${v};`,
    'w-\\[([^\\]]+)\\]': v => `width: ${v};`,
    'h-\\[([^\\]]+)\\]': v => `height: ${v};`,
    'gap-\\[([^\\]]+)\\]': v => `gap: ${v};`,
    'p-\\[([^\\]]+)\\]': v => `padding: ${v};`,
    'm-\\[([^\\]]+)\\]': v => `margin: ${v};`,
  };

  const convertTailwind = () => {
    const classes = tailwind.split(/\s+/);
    let css = '';
    classes.forEach(cls => {
      if (tailwindMap[cls]) { css += `  ${tailwindMap[cls]}\n`; return; }
      for (const [pattern, fn] of Object.entries(tailwindMapExtra)) {
        const re = new RegExp(`^${pattern}$`);
        const m = cls.match(re);
        if (m) { css += `  ${fn(m[1])}\n`; return; }
      }
    });
    setTailCss(css || '.class {\n  /* No matching Tailwind classes found */\n}');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">SCSS → CSS</h5>
        <textarea rows={5} value={scss} onChange={e => setScss(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <button onClick={convertScss} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Convert</button>
        {css && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{css}</pre><div className="mt-1"><CopyBtn text={css} label="CSS" /></div></div>}
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Stylus → CSS</h5>
        <textarea rows={5} value={stylus} onChange={e => setStylus(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <button onClick={convertStylus} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Convert</button>
        {stylCss && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{stylCss}</pre><div className="mt-1"><CopyBtn text={stylCss} label="CSS" /></div></div>}
      </div>
      <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Tailwind → CSS</h5>
        <textarea rows={3} value={tailwind} onChange={e => setTailwind(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="space-separated Tailwind classes" />
        <p className="text-xs text-zinc-400">Supports 80+ common classes + arbitrary values like text-[#ff0000]</p>
        <button onClick={convertTailwind} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Convert</button>
        {tailCss && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{tailCss}</pre><div className="mt-1"><CopyBtn text={tailCss} label="CSS" /></div></div>}
      </div>
    </div>
  );
}

function ProtoTools() {
  const [schema, setSchema] = useState('syntax = "proto3";\n\nmessage User {\n  string id = 1;\n  string name = 2;\n  int32 age = 3;\n  repeated string tags = 4;\n}');
  const [schemaOut, setSchemaOut] = useState('');
  const [binary, setBinary] = useState('');
  const [decoded, setDecoded] = useState('');

  const generateSchema = () => {
    const nameMatch = schema.match(/message\s+(\w+)/);
    if (!nameMatch) { toast.error('No message definition found'); return; }
    const name = nameMatch[1];
    const fields: { name: string; type: string; repeated: boolean; id: string }[] = [];
    const fieldRe = /(\w+)\s+(\w+)\s*=\s*(\d+)/g;
    let m;
    while ((m = fieldRe.exec(schema)) !== null) {
      fields.push({ type: m[1], name: m[2], id: m[3], repeated: schema.slice(m.index - 20, m.index).includes('repeated') });
    }
    const ts = `interface ${name} {\n${fields.map(f => `  ${f.name}: ${f.type === 'string' ? 'string' : f.type.startsWith('int') || f.type === 'float' || f.type === 'double' ? 'number' : f.type};`).join('\n')}\n}`;
    const json = JSON.stringify(fields.reduce((acc: Record<string, any>, f) => { acc[f.name] = f.type === 'string' ? 'example' : f.type.startsWith('int') ? 42 : f.type === 'float' ? 3.14 : true; return acc; }, {}), null, 2);
    setSchemaOut(`TypeScript:\n${ts}\n\nJSON Sample:\n${json}`);
  };

  const decodeProto = () => {
    try {
      const input = binary.trim();
      const hex = input.startsWith('0x') ? input.slice(2) : input;
      const bytes = new Uint8Array(hex.split(/\s+/).map(h => parseInt(h, 16)));
      const decoder = new TextDecoder();
      const text = decoder.decode(bytes).replace(/[^\x20-\x7E]/g, '�');
      setDecoded(`Decoded (${bytes.length} bytes):\n${text}\n\nHex: ${Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);
    } catch { toast.error('Invalid hex input'); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Proto Schema → TS + JSON</h5>
        <textarea rows={7} value={schema} onChange={e => setSchema(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <button onClick={generateSchema} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Generate TS + JSON</button>
        {schemaOut && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-64 overflow-y-auto">{schemaOut}</pre><div className="mt-1"><CopyBtn text={schemaOut} label="Schema" /></div></div>}
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Protobuf Decoder</h5>
        <textarea rows={4} value={binary} onChange={e => setBinary(e.target.value)} placeholder="Paste hex bytes (e.g. 0a03626f621205776f726c64)"
          className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <button onClick={decodeProto} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Decode</button>
        {decoded && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{decoded}</pre><div className="mt-1"><CopyBtn text={decoded} label="Decoded" /></div></div>}
      </div>
    </div>
  );
}

function TypeScriptTools() {
  const [tsconfig, setTsconfig] = useState('{"compilerOptions": {"target": "ES2020", "module": "ESNext", "strict": true}}');
  const [tsconfigOut, setTsconfigOut] = useState('');
  const [tsCode, setTsCode] = useState('const greet = (name: string): string => {\n  return `Hello, ${name}!`;\n};');
  const [tsFormatted, setTsFormatted] = useState('');
  const [template, setTemplate] = useState('Hello {{name}}, your order #{{orderId}} is {{status}}.');
  const [templateVars, setTemplateVars] = useState('{"name": "Alice", "orderId": "12345", "status": "shipped"}');
  const [templateOut, setTemplateOut] = useState('');
  const [testDataSchema, setTestDataSchema] = useState('[{"name": "id", "type": "number"}, {"name": "email", "type": "email"}, {"name": "active", "type": "boolean"}]');
  const [testDataOut, setTestDataOut] = useState('');

  const generateTsconfig = () => {
    try {
      const obj = JSON.parse(tsconfig);
      const options = obj.compilerOptions || {};
      const keys = Object.keys(options);
      const desc: Record<string, string> = {
        target: 'ECMAScript target', module: 'Module system', strict: 'Enable strict type checking',
        outDir: 'Output directory', rootDir: 'Root directory', esModuleInterop: 'ES module interop',
        jsx: 'JSX support', lib: 'Library definitions', allowJs: 'Allow JS files',
        sourceMap: 'Generate source maps', declaration: 'Generate .d.ts files',
        removeComments: 'Remove comments', noUnusedLocals: 'Error on unused locals',
        noUnusedParameters: 'Error on unused parameters', noImplicitReturns: 'Error on implicit returns',
        skipLibCheck: 'Skip type checking of .d.ts files',
      };
      setTsconfigOut(`Options (${keys.length}):\n${keys.map(k => `  • ${k}: ${options[k]} ${desc[k] ? `— ${desc[k]}` : ''}`).join('\n')}`);
    } catch { toast.error('Invalid JSON'); }
  };

  const formatTypeScript = () => {
    let result = tsCode
      .replace(/;\s*/g, ';\n')
      .replace(/\{\s*/g, ' {\n')
      .replace(/\}\s*/g, '}\n')
      .replace(/\n\s*\n/g, '\n')
      .trim();
    const lines = result.split('\n');
    let depth = 0;
    const formatted = lines.map(line => {
      const tr = line.trim();
      if (tr.startsWith('}')) depth = Math.max(0, depth - 1);
      const out = '  '.repeat(depth) + tr;
      if (tr.endsWith('{')) depth++;
      return out;
    }).join('\n');
    setTsFormatted(formatted);
  };

  const testStringTemplate = () => {
    try {
      const vars = JSON.parse(templateVars);
      let result = template;
      for (const [k, v] of Object.entries(vars)) result = result.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
      setTemplateOut(result);
    } catch { toast.error('Invalid JSON variables'); }
  };

  const generateTestData = () => {
    try {
      const fields = JSON.parse(testDataSchema);
      const obj: Record<string, any> = {};
      fields.forEach((f: { name: string; type: string }) => {
        if (f.type === 'string') obj[f.name] = 'example';
        else if (f.type === 'number') obj[f.name] = 42;
        else if (f.type === 'boolean') obj[f.name] = true;
        else if (f.type === 'email') obj[f.name] = 'user@example.com';
        else if (f.type === 'date') obj[f.name] = '2026-07-16';
        else if (f.type === 'url') obj[f.name] = 'https://example.com';
        else obj[f.name] = null;
      });
      setTestDataOut(JSON.stringify(obj, null, 2));
    } catch { toast.error('Invalid schema JSON'); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">tsconfig Analyzer</h5>
        <textarea rows={5} value={tsconfig} onChange={e => setTsconfig(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <button onClick={generateTsconfig} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Analyze</button>
        {tsconfigOut && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{tsconfigOut}</pre><div className="mt-1"><CopyBtn text={tsconfigOut} label="Analysis" /></div></div>}
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">TypeScript Formatter</h5>
        <textarea rows={5} value={tsCode} onChange={e => setTsCode(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <button onClick={formatTypeScript} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Format</button>
        {tsFormatted && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{tsFormatted}</pre><div className="mt-1"><CopyBtn text={tsFormatted} label="Formatted" /></div></div>}
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">String Template Tester</h5>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">Template</label>
          <input type="text" value={template} onChange={e => setTemplate(e.target.value)} placeholder="Template with {{var}} placeholders"
            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">Variables (JSON)</label>
          <textarea rows={3} value={templateVars} onChange={e => setTemplateVars(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        </div>
        <button onClick={testStringTemplate} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Test</button>
        {templateOut && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{templateOut}</pre><div className="mt-1"><CopyBtn text={templateOut} label="Result" /></div></div>}
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Test Data Generator</h5>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">Schema: objects with name + type</label>
          <textarea rows={4} value={testDataSchema} onChange={e => setTestDataSchema(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        </div>
        <button onClick={generateTestData} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Generate</button>
        {testDataOut && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{testDataOut}</pre><div className="mt-1"><CopyBtn text={testDataOut} label="Data" /></div></div>}
      </div>
    </div>
  );
}

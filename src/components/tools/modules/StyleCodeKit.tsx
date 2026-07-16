"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

type Tab = 'css' | 'proto' | 'ts' | 'regex';

const TABS: { key: Tab; label: string }[] = [
  { key: 'css', label: 'CSS Preprocessors' },
  { key: 'proto', label: 'Protobuf' },
  { key: 'ts', label: 'TypeScript' },
  { key: 'regex', label: 'Regex & Strings' },
];

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 ${className}`}>{children}</div>;
}

export default function StyleCodeKit() {
  const [tab, setTab] = useState<Tab>('css');

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${tab === t.key ? 'bg-blue-600 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}>{t.label}</button>
        ))}
      </div>
      {tab === 'css' && <CssPreprocTools />}
      {tab === 'proto' && <ProtoTools />}
      {tab === 'ts' && <TypeScriptTools />}
      {tab === 'regex' && <RegexTools />}
    </div>
  );
}

function CssPreprocTools() {
  const [scss, setScss] = useState('$primary: #3b82f6;\n.btn {\n  color: $primary;\n  font-weight: bold;\n  &:hover {\n    opacity: 0.8;\n  }\n}');
  const [css, setCss] = useState('');

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

  const [stylus, setStylus] = useState('.btn\n  color #3b82f6\n  font-weight bold\n  &:hover\n    opacity 0.8');
  const [stylCss, setStylCss] = useState('');

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

  const [tailwind, setTailwind] = useState('flex items-center justify-between p-4 bg-white shadow rounded-lg');
  const [tailCss, setTailCss] = useState('');

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
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">SCSS → CSS</h4><textarea rows={6} value={scss} onChange={e => setScss(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" /><button onClick={convertScss} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Convert</button>{css && <textarea readOnly rows={4} value={css} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}</Card>
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">Stylus → CSS</h4><textarea rows={6} value={stylus} onChange={e => setStylus(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" /><button onClick={convertStylus} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Convert</button>{stylCss && <textarea readOnly rows={4} value={stylCss} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}</Card>
      <Card className="md:col-span-2"><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">Tailwind → CSS</h4><textarea rows={3} value={tailwind} onChange={e => setTailwind(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono" /><button onClick={convertTailwind} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Convert</button><p className="text-xs text-zinc-400 mt-1">Supports 80+ common classes + arbitrary values like text-[#ff0000]</p>{tailCss && <textarea readOnly rows={5} value={tailCss} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}</Card>
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
    const ts = `interface ${name} {\n${fields.map(f => `  ${f.name}${f.type === 'string' ? '' : f.type.startsWith('int') || f.type === 'float' || f.type === 'double' ? '' : ''}: ${f.type === 'string' ? 'string' : f.type.startsWith('int') || f.type === 'float' || f.type === 'double' ? 'number' : f.type};`).join('\n')}\n}`;
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
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">Proto Schema Generator</h4><textarea rows={8} value={schema} onChange={e => setSchema(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" /><button onClick={generateSchema} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Generate TS + JSON</button>{schemaOut && <textarea readOnly rows={8} value={schemaOut} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}</Card>
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">Protobuf Decoder</h4><textarea rows={4} value={binary} onChange={e => setBinary(e.target.value)} placeholder="Paste hex bytes (e.g. 0a03626f621205776f726c64)" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" /><button onClick={decodeProto} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Decode</button>{decoded && <textarea readOnly rows={6} value={decoded} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}</Card>
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
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">tsconfig Generator / Analyzer</h4><textarea rows={5} value={tsconfig} onChange={e => setTsconfig(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" /><button onClick={generateTsconfig} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Analyze</button>{tsconfigOut && <textarea readOnly rows={6} value={tsconfigOut} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}</Card>
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">TypeScript Formatter</h4><textarea rows={5} value={tsCode} onChange={e => setTsCode(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" /><button onClick={formatTypeScript} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Format</button>{tsFormatted && <textarea readOnly rows={6} value={tsFormatted} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}</Card>
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">String Template Tester</h4><input type="text" value={template} onChange={e => setTemplate(e.target.value)} placeholder="Template with {{var}} placeholders" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono mb-2" /><textarea rows={3} value={templateVars} onChange={e => setTemplateVars(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" /><button onClick={testStringTemplate} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Test</button>{templateOut && <div className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-mono">{templateOut}</div>}</Card>
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">Test Data Generator</h4><textarea rows={4} value={testDataSchema} onChange={e => setTestDataSchema(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" /><button onClick={generateTestData} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Generate</button>{testDataOut && <textarea readOnly rows={4} value={testDataOut} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}</Card>
    </div>
  );
}

function RegexTools() {
  const [regex, setRegex] = useState('^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$');
  const [english, setEnglish] = useState('');
  const [testString, setTestString] = useState('test@example.com');
  const [testResult, setTestResult] = useState('');

  const regexToEnglish = () => {
    let desc = regex;
    desc = desc.replace(/\\d/g, 'digit (0-9)').replace(/\\w/g, 'word character (a-z, A-Z, 0-9, _)').replace(/\\s/g, 'whitespace');
    desc = desc.replace(/^/, '^ → start of string\n').replace(/$/, '\n$ → end of string');
    desc = desc.replace(/\+/g, ' (one or more)').replace(/\*/g, ' (zero or more)').replace(/\?/g, ' (optional)');
    desc = desc.replace(/\^ → start of string/, '^ → start of string');
    setEnglish(desc);
    try {
      const re = new RegExp(regex);
      setTestResult(re.test(testString) ? '✅ Match' : '❌ No match');
    } catch { setTestResult('❌ Invalid regex'); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">Regex → English</h4><input type="text" value={regex} onChange={e => setRegex(e.target.value)} placeholder="Enter regex pattern" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono mb-2" /><button onClick={regexToEnglish} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Translate</button>{english && <textarea readOnly rows={6} value={english} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}</Card>
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">Regex Tester</h4><input type="text" value={regex} onChange={e => setRegex(e.target.value)} placeholder="Regex pattern" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono mb-2" /><input type="text" value={testString} onChange={e => setTestString(e.target.value)} placeholder="Test string" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono mb-2" /><button onClick={regexToEnglish} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Test</button>{testResult && <p className={`mt-2 p-2 rounded-lg text-sm font-mono ${testResult.startsWith('✅') ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-red-500 bg-red-50 dark:bg-red-900/20'}`}>{testResult}</p>}</Card>
    </div>
  );
}

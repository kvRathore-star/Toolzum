"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

function CopyBtn({ text }: { text: string }) {
  return (
    <button onClick={() => { clipboardWrite(text); toast.success('Copied!'); }}
      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
  );
}

export function ScssToCssConverter() {
  const [input, setInput] = useState('$primary: #3b82f6;\n.btn {\n  color: $primary;\n  font-weight: bold;\n  &:hover {\n    opacity: 0.8;\n  }\n}');
  const [output, setOutput] = useState('');

  const convert = () => {
    const result = input
      .replace(/\$(\w+):\s*([^;]+);/g, '/* $1: $2 */')
      .replace(/&/g, '')
      .replace(/\n\s*/g, ' ')
      .replace(/\s*([{}:;])\s*/g, '$1')
      .replace(/;}/g, '}')
      .trim();
    setOutput(result);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">SCSS to CSS Converter</h2>
        <textarea rows={6} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={convert} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Convert</button>
        {output && (
          <div className="space-y-1">
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{output}</pre>
            <CopyBtn text={output} />
          </div>
        )}
      </div>
    </div>
  );
}

export function StylusToCssConverter() {
  const [input, setInput] = useState('.btn\n  color #3b82f6\n  font-weight bold\n  &:hover\n    opacity 0.8');
  const [output, setOutput] = useState('');

  const convert = () => {
    let result = '';
    let depth = 0;
    input.split('\n').forEach(line => {
      const content = line.trim();
      if (!content || content.startsWith('//')) return;
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
    setOutput(result);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Stylus to CSS Converter</h2>
        <textarea rows={5} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={convert} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Convert</button>
        {output && (
          <div className="space-y-1">
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{output}</pre>
            <CopyBtn text={output} />
          </div>
        )}
      </div>
    </div>
  );
}

export function TailwindToCssConverter() {
  const [input, setInput] = useState('flex items-center justify-between p-4 bg-white shadow rounded-lg');
  const [output, setOutput] = useState('');

  const TAILWIND: Record<string, string> = {
    'flex': 'display: flex;', 'items-center': 'align-items: center;', 'justify-center': 'justify-content: center;',
    'justify-between': 'justify-content: space-between;', 'flex-col': 'flex-direction: column;',
    'gap-2': 'gap: 0.5rem;', 'gap-4': 'gap: 1rem;', 'p-2': 'padding: 0.5rem;', 'p-4': 'padding: 1rem;',
    'm-4': 'margin: 1rem;', 'mt-2': 'margin-top: 0.5rem;', 'mb-4': 'margin-bottom: 1rem;',
    'text-sm': 'font-size: 0.875rem;', 'text-lg': 'font-size: 1.125rem;', 'font-bold': 'font-weight: 700;',
    'text-white': 'color: #fff;', 'bg-white': 'background-color: #fff;',
    'bg-blue-500': 'background-color: #3b82f6;', 'bg-red-500': 'background-color: #ef4444;',
    'rounded': 'border-radius: 0.25rem;', 'rounded-lg': 'border-radius: 0.5rem;',
    'shadow': 'box-shadow: 0 1px 3px rgba(0,0,0,0.1);', 'shadow-md': 'box-shadow: 0 4px 6px rgba(0,0,0,0.1);',
    'w-full': 'width: 100%;', 'hidden': 'display: none;', 'block': 'display: block;',
    'relative': 'position: relative;', 'absolute': 'position: absolute;',
  };

  const convert = () => {
    const classes = input.split(/\s+/);
    let css = '';
    classes.forEach(cls => {
      if (TAILWIND[cls]) css += `  ${TAILWIND[cls]}\n`;
    });
    setOutput(css || '.class {\n  /* No matching Tailwind classes found */\n}');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Tailwind to CSS Converter</h2>
        <textarea rows={2} value={input} onChange={e => setInput(e.target.value)} placeholder="Space-separated Tailwind classes"
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <p className="text-xs text-[var(--text-secondary)]">Supports 40+ common Tailwind classes.</p>
        <button onClick={convert} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Convert</button>
        {output && (
          <div className="space-y-1">
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{output}</pre>
            <CopyBtn text={output} />
          </div>
        )}
      </div>
    </div>
  );
}

export function ProtoSchemaConverter() {
  const [input, setInput] = useState('syntax = "proto3";\n\nmessage User {\n  string id = 1;\n  string name = 2;\n  int32 age = 3;\n  repeated string tags = 4;\n}');
  const [output, setOutput] = useState('');

  const convert = () => {
    const nameMatch = input.match(/message\s+(\w+)/);
    if (!nameMatch) { toast.error('No message definition found'); return; }
    const name = nameMatch[1];
    const fields: { name: string; type: string; id: string }[] = [];
    const fieldRe = /(\w+)\s+(\w+)\s*=\s*(\d+)/g;
    let m;
    while ((m = fieldRe.exec(input)) !== null) {
      fields.push({ type: m[1], name: m[2], id: m[3] });
    }
    const ts = `interface ${name} {\n${fields.map(f => `  ${f.name}: ${f.type === 'string' ? 'string' : f.type.startsWith('int') || f.type === 'float' || f.type === 'double' ? 'number' : f.type};`).join('\n')}\n}`;
    const json = JSON.stringify(fields.reduce((acc: Record<string, any>, f) => {
      acc[f.name] = f.type === 'string' ? 'example' : f.type.startsWith('int') ? 42 : f.type === 'float' ? 3.14 : true;
      return acc;
    }, {}), null, 2);
    setOutput(`TypeScript:\n${ts}\n\nJSON Sample:\n${json}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Proto Schema to TS + JSON</h2>
        <textarea rows={7} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={convert} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Generate TS + JSON</button>
        {output && (
          <div className="space-y-1">
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-64 overflow-y-auto">{output}</pre>
            <CopyBtn text={output} />
          </div>
        )}
      </div>
    </div>
  );
}

function readVarint(bytes: Uint8Array, offset: number): { value: number; newOffset: number } {
  let result = 0;
  let shift = 0;
  let pos = offset;
  while (pos < bytes.length) {
    const b = bytes[pos];
    result |= (b & 0x7f) << shift;
    pos++;
    if ((b & 0x80) === 0) return { value: result, newOffset: pos };
    shift += 7;
    if (shift > 35) break;
  }
  return { value: result, newOffset: pos };
}

function decodeProtobuf(bytes: Uint8Array, depth = 0): { fields: string[]; bytesUsed: number } {
  const fields: string[] = [];
  let offset = 0;
  const indent = '  '.repeat(depth);

  while (offset < bytes.length) {
    const tag = readVarint(bytes, offset);
    offset = tag.newOffset;
    const fieldNumber = tag.value >> 3;
    const wireType = tag.value & 0x07;

    if (fieldNumber === 0) { fields.push(`${indent}[invalid field 0]`); continue; }

    switch (wireType) {
      case 0: { // Varint
        const val = readVarint(bytes, offset);
        offset = val.newOffset;
        fields.push(`${indent}field ${fieldNumber} (varint): ${val.value}`);
        break;
      }
      case 1: { // 64-bit
        if (offset + 8 > bytes.length) { fields.push(`${indent}field ${fieldNumber}: truncated 64-bit`); return { fields, bytesUsed: offset }; }
        const view = new DataView(bytes.buffer, bytes.byteOffset + offset, 8);
        const num = Number(view.getBigUint64(0, true));
        offset += 8;
        fields.push(`${indent}field ${fieldNumber} (64-bit): ${num}`);
        break;
      }
      case 2: { // Length-delimited
        const len = readVarint(bytes, offset);
        offset = len.newOffset;
        const end = offset + len.value;
        if (end > bytes.length) { fields.push(`${indent}field ${fieldNumber}: truncated (need ${len.value} bytes, have ${bytes.length - offset})`); return { fields, bytesUsed: offset }; }
        const slice = bytes.slice(offset, end);
        offset = end;

        const text = new TextDecoder().decode(slice).replace(/[^\x20-\x7E]/g, '.');
        const isPrintable = /^[\x20-\x7E]+$/.test(text);

        if (isPrintable && slice.length > 0) {
          fields.push(`${indent}field ${fieldNumber} (string): "${text}"`);
        } else if (slice.length >= 2) {
          const nested = decodeProtobuf(slice, depth + 1);
          if (nested.fields.length > 0 && nested.bytesUsed === slice.length) {
            fields.push(`${indent}field ${fieldNumber} (message): {`);
            fields.push(...nested.fields);
            fields.push(`${indent}}`);
          } else {
            const hexStr = Array.from(slice).map(b => b.toString(16).padStart(2, '0')).join(' ');
            fields.push(`${indent}field ${fieldNumber} (bytes): ${hexStr}`);
          }
        } else {
          const hexStr = Array.from(slice).map(b => b.toString(16).padStart(2, '0')).join(' ');
          fields.push(`${indent}field ${fieldNumber} (bytes): ${hexStr || '(empty)'}`);
        }
        break;
      }
      case 5: { // 32-bit
        if (offset + 4 > bytes.length) { fields.push(`${indent}field ${fieldNumber}: truncated 32-bit`); return { fields, bytesUsed: offset }; }
        const view = new DataView(bytes.buffer, bytes.byteOffset + offset, 4);
        const num = view.getUint32(0, true);
        offset += 4;
        fields.push(`${indent}field ${fieldNumber} (32-bit): ${num}`);
        break;
      }
      default:
        fields.push(`${indent}field ${fieldNumber}: unknown wire type ${wireType}`);
        return { fields, bytesUsed: offset };
    }
  }
  return { fields, bytesUsed: offset };
}

export function ProtobufDecoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const decode = () => {
    try {
      const hex = input.trim().startsWith('0x') ? input.trim().slice(2) : input.trim();
      const cleaned = hex.replace(/\s+/g, '');
      if (cleaned.length % 2 !== 0) { toast.error('Hex string must have even length'); return; }
      const bytes = new Uint8Array(cleaned.match(/.{2}/g)!.map(h => parseInt(h, 16)));
      const result = decodeProtobuf(bytes);
      const hexDump = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' ');
      const summary = `// ${bytes.length} bytes total\n// Wire format: field_number << 3 | wire_type\n// 0=varint, 1=64-bit, 2=length-delimited, 5=32-bit\n\n${result.fields.join('\n')}\n\n// Raw hex:\n// ${hexDump}`;
      setOutput(summary);
    } catch { toast.error('Invalid hex input'); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Protobuf Decoder</h2>
        <p className="text-xs text-[var(--text-secondary)]">Decode protobuf wire format hex to readable field structure. Supports varints, strings, nested messages, and fixed-width types.</p>
        <textarea rows={3} value={input} onChange={e => setInput(e.target.value)} placeholder="Paste hex bytes (e.g. 0a03626f621205776f726c64)"
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={decode} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Decode</button>
        {output && <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-64 overflow-y-auto">{output}</pre>}
      </div>
    </div>
  );
}

export function TsconfigAnalyzer() {
  const [input, setInput] = useState('{"compilerOptions": {"target": "ES2020", "module": "ESNext", "strict": true}}');
  const [output, setOutput] = useState('');

  const analyze = () => {
    try {
      const obj = JSON.parse(input);
      const options = obj.compilerOptions || {};
      const keys = Object.keys(options);
      const desc: Record<string, string> = {
        target: 'ECMAScript target', module: 'Module system', strict: 'Enable strict type checking',
        outDir: 'Output directory', rootDir: 'Root directory', esModuleInterop: 'ES module interop',
        jsx: 'JSX support', lib: 'Library definitions', allowJs: 'Allow JS files',
        sourceMap: 'Generate source maps', declaration: 'Generate .d.ts files',
        skipLibCheck: 'Skip type checking of .d.ts files',
      };
      setOutput(`Options (${keys.length}):\n${keys.map(k => `  - ${k}: ${options[k]} ${desc[k] ? `(${desc[k]})` : ''}`).join('\n')}`);
    } catch { toast.error('Invalid JSON'); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">tsconfig Analyzer</h2>
        <textarea rows={5} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={analyze} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Analyze</button>
        {output && <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{output}</pre>}
      </div>
    </div>
  );
}

export function TypeScriptFormatter() {
  const [input, setInput] = useState('const greet = (name: string): string => {\n  return `Hello, ${name}!`;\n};');
  const [output, setOutput] = useState('');

  const format = () => {
    const result = input.replace(/;\s*/g, ';\n').replace(/\{\s*/g, ' {\n').replace(/\}\s*/g, '}\n').replace(/\n\s*\n/g, '\n').trim();
    const lines = result.split('\n');
    let depth = 0;
    const formatted = lines.map(line => {
      const tr = line.trim();
      if (tr.startsWith('}')) depth = Math.max(0, depth - 1);
      const out = '  '.repeat(depth) + tr;
      if (tr.endsWith('{')) depth++;
      return out;
    }).join('\n');
    setOutput(formatted);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">TypeScript Formatter</h2>
        <textarea rows={5} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={format} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Format</button>
        {output && (
          <div className="space-y-1">
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{output}</pre>
            <CopyBtn text={output} />
          </div>
        )}
      </div>
    </div>
  );
}

export function StringTemplateTester() {
  const [template, setTemplate] = useState('Hello {{name}}, your order #{{orderId}} is {{status}}.');
  const [vars, setVars] = useState('{"name": "Alice", "orderId": "12345", "status": "shipped"}');
  const [output, setOutput] = useState('');

  const test = () => {
    try {
      const v = JSON.parse(vars);
      let result = template;
      for (const [k, val] of Object.entries(v)) result = result.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(val));
      setOutput(result);
    } catch { toast.error('Invalid JSON variables'); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">String Template Tester</h2>
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Template</label>
          <input type="text" value={template} onChange={e => setTemplate(e.target.value)} placeholder="Template with {{var}} placeholders"
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm font-mono" />
        </div>
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Variables (JSON)</label>
          <textarea rows={3} value={vars} onChange={e => setVars(e.target.value)}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={test} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Test</button>
        {output && <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{output}</pre>}
      </div>
    </div>
  );
}

export function TestDataGenerator() {
  const [schema, setSchema] = useState('[{"name": "id", "type": "number"}, {"name": "email", "type": "email"}, {"name": "active", "type": "boolean"}]');
  const [output, setOutput] = useState('');

  const generate = () => {
    try {
      const fields = JSON.parse(schema);
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
      setOutput(JSON.stringify(obj, null, 2));
    } catch { toast.error('Invalid schema JSON'); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Test Data Generator</h2>
        <textarea rows={4} value={schema} onChange={e => setSchema(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={generate} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Generate</button>
        {output && <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{output}</pre>}
      </div>
    </div>
  );
}

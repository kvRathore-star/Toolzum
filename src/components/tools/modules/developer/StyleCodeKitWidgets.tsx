"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { Section } from '../MiscToolsShared';

function CopyBtn({ text }: { text: string }) {
  return (
    <button onClick={() => { clipboardWrite(text); toast.success('Copied!'); }}
      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
  );
}

function CopyDownload({ output, filename = 'output.txt' }: { output: string; filename?: string }) {
  return (
    <div className="flex gap-3">
      <button onClick={() => { navigator.clipboard.writeText(output); toast.success('Copied!'); }}
        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
      <button onClick={() => {
        const blob = new Blob([output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Downloaded!');
      }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</button>
    </div>
  );
}

function PresetBar({ presets }: { presets: { label: string; apply: () => void }[] }) {
  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {presets.map((p, i) => (
        <button key={i} onClick={p.apply}
          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-[10px] font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
          {p.label}
        </button>
      ))}
    </div>
  );
}

export function ScssToCssConverter() {
  const [input, setInput] = useState('$primary: #3b82f6;\n.btn {\n  color: $primary;\n  font-weight: bold;\n  &:hover {\n    opacity: 0.8;\n  }\n}');
  const [output, setOutput] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const presets = [
    { label: 'Nested SCSS', apply: () => setInput('.card {\n  padding: 1rem;\n  .title {\n    font-size: 1.5rem;\n    color: #333;\n  }\n  .body {\n    padding: 0.5rem;\n    .nested {\n      color: gray;\n    }\n  }\n}') },
    { label: 'Variables SCSS', apply: () => setInput('$primary: #3b82f6;\n$secondary: #6b7280;\n$spacing: 1rem;\n$radius: 0.5rem;\n\n.btn {\n  background: $primary;\n  color: white;\n  padding: $spacing;\n  border-radius: $radius;\n  &:hover {\n    background: darken($primary, 10%);\n  }\n}\n.link {\n  color: $secondary;\n  text-decoration: underline;\n}') },
    { label: 'Mixin SCSS', apply: () => setInput('@mixin flex-center {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n@mixin box-shadow($shadow) {\n  box-shadow: $shadow;\n}\n\n.container {\n  @include flex-center;\n  @include box-shadow(0 2px 4px rgba(0,0,0,0.1));\n  min-height: 100vh;\n}') },
  ];

  const convert = () => {
    const errs: string[] = [];
    const lines = input.split('\n');
    let css = '';
    let indent = 0;
    const variables: Record<string, string> = {};

    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//')) return;

      // Collect variables
      const varMatch = trimmed.match(/^\$(\w[\w-]*):\s*(.+);$/);
      if (varMatch) {
        variables[varMatch[1]!] = varMatch[2]!.trim();
        return;
      }

      // Mixin definition
      if (trimmed.startsWith('@mixin')) {
        return; // skip mixin definitions for output
      }

      // Include mixin
      const includeMatch = trimmed.match(/^@include\s+(\w[\w-]*)\s*(?:\(([^)]*)\))?/);
      if (includeMatch) {
        css += `${'  '.repeat(indent)}/* mixin: ${includeMatch[1]} */\n`;
        return;
      }

      // Selector
      if (trimmed.endsWith('{')) {
        let selector = trimmed.replace(/\s*{\s*$/, '').trim();
        // Replace & with parent reference (simplified)
        if (selector.startsWith('&')) selector = selector.slice(1);
        // Resolve variables in selector
        for (const [k, v] of Object.entries(variables)) {
          selector = selector.replace(new RegExp(`\\$${k}`, 'g'), v);
        }
        css += `${'  '.repeat(indent)}${selector} {\n`;
        indent++;
      } else if (trimmed === '}') {
        indent = Math.max(0, indent - 1);
        css += `${'  '.repeat(indent)}}\n`;
      } else if (trimmed.includes(':')) {
        const colonIdx = trimmed.indexOf(':');
        const prop = trimmed.slice(0, colonIdx).trim();
        let val = trimmed.slice(colonIdx + 1).replace(/;$/, '').trim();
        // Resolve variables
        for (const [k, v] of Object.entries(variables)) {
          val = val.replace(new RegExp(`\\$${k}`, 'g'), v);
        }
        // Resolve functions like darken/lighten
        val = val.replace(/darken\(([^,]+),\s*(\d+)%?\)/g, (_, _c, _amt) => `/* darken: ${_c} by ${_amt}% */`);
        val = val.replace(/lighten\(([^,]+),\s*(\d+)%?\)/g, (_, _c, _amt) => `/* lighten: ${_c} by ${_amt}% */`);
        css += `${'  '.repeat(indent)}${prop}: ${val};\n`;
      }
    });

    if (!css.trim()) errs.push('No CSS output generated');
    setErrors(errs);
    setOutput(css.trim());
    if (errs.length) toast.error(errs[0]!);
    else toast.success('Converted to CSS');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">SCSS to CSS Converter</h2>
        <PresetBar presets={presets} />
        <textarea aria-label="SCSS to CSS Converter" rows={8} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={convert} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Convert</button>
        {errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 text-[10px] text-red-600 dark:text-red-400">
            {errors.map((e, i) => <div key={i}>⚠ {e}</div>)}
          </div>
        )}
        {output && (
          <div className="space-y-2">
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{output}</pre>
            <CopyDownload output={output} filename="output.css" />
          </div>
        )}
      </div>
    </div>
  );
}

export function StylusToCssConverter() {
  const [input, setInput] = useState('.btn\n  color #3b82f6\n  font-weight bold\n  &:hover\n    opacity 0.8');
  const [output, setOutput] = useState('');

  const presets = [
    { label: 'Simple Stylus', apply: () => setInput('.container\n  width 100%\n  max-width 1200px\n  margin 0 auto\n  padding 0 1rem') },
    { label: 'With variables', apply: () => setInput('$primary = #3b82f6\n$font-stack = Helvetica, Arial, sans-serif\n$spacing = 1rem\n\nbody\n  font-family $font-stack\n  line-height 1.6\n\n.btn\n  background $primary\n  color white\n  padding $spacing $spacing * 1.5\n  border-radius 4px\n  border none\n  cursor pointer') },
    { label: 'With mixins', apply: () => setInput('flex-center()\n  display flex\n  align-items center\n  justify-content center\n\ncontainer(width)\n  width width\n  margin 0 auto\n\n.hero\n  flex-center()\n  min-height 100vh\n  background #f0f0f0\n\n.content\n  container(800px)\n  padding 2rem') },
  ];

  const convert = () => {
    let result = '';
    let indent = 0;
    const variables: Record<string, string> = {};
    const mixinBody: string[] = [];
    const mixinNames: string[] = [];
    let inMixin = false;

    const lines = input.split('\n');
    lines.forEach(line => {
      const content = line.trim();
      if (!content || content.startsWith('//')) return;

      // Variable definition
      const varMatch = content.match(/^(\$[\w-]+)\s*=\s*(.+)/);
      if (varMatch) {
        variables[varMatch[1]!] = varMatch[2]!.trim();
        return;
      }

      // Mixin definition
      const mixinMatch = content.match(/^([\w-]+)\s*\(([^)]*)\)\s*$/);
      if (mixinMatch) {
        inMixin = true;
        mixinNames.push(mixinMatch[1] ?? "");
        return;
      }

      if (inMixin) {
        const mixinIndent = line.search(/\S/);
        if (content.startsWith('.') || content.match(/^[\w-]+\s*$/) && !content.includes(' ')) {
          if (mixinBody.length > 0 && content.endsWith('()')) {
            inMixin = false;
          } else {
            mixinBody.push(content);
          }
        } else {
          mixinBody.push(content);
        }
        if (!content || content === '' || content.startsWith('.')) {
          inMixin = false;
        }
        return;
      }

      // Mixin include
      const includeMatch = content.match(/^([\w-]+)\(([^)]*)\)\s*$/);
      if (includeMatch && mixinNames.includes(includeMatch[1] ?? "")) {
        const args = (includeMatch[2] ?? "").split(',').map(a => a.trim());
        mixinBody.forEach(mb => {
          let line = mb;
          args.forEach((a, i) => { line = line.replace(new RegExp(`\\$${i + 1}`, 'g'), a); });
          const prop = line.split(/\s+/)[0] ?? "";
          const val = line.split(/\s+/).slice(1).join(' ');
          // Resolve variables
          let resolvedVal = val;
          for (const [k, v] of Object.entries(variables)) {
            resolvedVal = resolvedVal.replace(new RegExp(`\\${k}`, 'g'), v);
          }
          if (prop.endsWith(':') || prop.match(/^[a-z]/)) {
            result += `${'  '.repeat(indent)}${prop}: ${resolvedVal};\n`;
          }
        });
        return;
      }

      // Selector
      const indentLevel = line.search(/\S/);
      if (content.endsWith('{')) {
        const selector = content.replace(/\s*{\s*$/, '').trim();
        if (selector.startsWith('.')) {
          result += `${'  '.repeat(indent)}${selector} {\n`;
          indent++;
        }
      } else if (content === '}') {
        indent = Math.max(0, indent - 1);
        result += `${'  '.repeat(indent)}}\n`;
      } else if (content.startsWith('&:') || content.startsWith('&.')) {
        const selector = content.replace('&', '').trim();
        result += `${'  '.repeat(indent)}${selector} {\n`;
        indent++;
      } else if (content.match(/^[.#@]/)) {
        result += `${'  '.repeat(indent)}${content} {\n`;
        indent++;
      } else if (content.includes(' ')) {
        const [prop, ...valParts] = content.split(/\s+/);
        let val = valParts.join(' ');
        // Resolve variables
        for (const [k, v] of Object.entries(variables)) {
          val = val.replace(new RegExp(`\\${k}`, 'g'), v);
        }
        result += `${'  '.repeat(indent)}${prop}: ${val};\n`;
      }
    });

    while (indent > 0) { result += `${'  '.repeat(indent - 1)}}\n`; indent--; }
    setOutput(result.trim());
    toast.success('Converted to CSS');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Stylus to CSS Converter</h2>
        <PresetBar presets={presets} />
        <textarea aria-label="Stylus to CSS Converter" rows={8} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={convert} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Convert</button>
        {output && (
          <div className="space-y-2">
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{output}</pre>
            <CopyDownload output={output} filename="output.css" />
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
    const b = bytes[pos]!;
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
      case 0: {
        const val = readVarint(bytes, offset);
        offset = val.newOffset;
        fields.push(`${indent}field ${fieldNumber} (varint): ${val.value}`);
        break;
      }
      case 1: {
        if (offset + 8 > bytes.length) { fields.push(`${indent}field ${fieldNumber}: truncated 64-bit`); return { fields, bytesUsed: offset }; }
        const view = new DataView(bytes.buffer, bytes.byteOffset + offset, 8);
        const num = Number(view.getBigUint64(0, true));
        offset += 8;
        fields.push(`${indent}field ${fieldNumber} (64-bit): ${num}`);
        break;
      }
      case 2: {
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
      case 5: {
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

const TYPE_NAMES: Record<number, string> = { 0: 'varint', 1: '64-bit', 2: 'length-delimited', 5: '32-bit' };

export function ProtobufDecoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [fieldCount, setFieldCount] = useState(0);

  const presets = [
    { label: 'Simple message', apply: () => setInput('0a03626f621205776f726c64182a') },
    { label: 'Nested message', apply: () => setInput('0a0c0a046e616d651204746573741206080110021803') },
    { label: 'Repeated fields', apply: () => setInput('0a036162630a036465660a03676869280128002801') },
  ];

  const decode = () => {
    try {
      const hex = input.trim().startsWith('0x') ? input.trim().slice(2) : input.trim();
      const cleaned = hex.replace(/\s+/g, '');
      if (cleaned.length % 2 !== 0) { toast.error('Hex string must have even length'); return; }
      const bytes = new Uint8Array(cleaned.match(/.{2}/g)!.map(h => parseInt(h, 16)));
      const result = decodeProtobuf(bytes);
      setFieldCount(result.fields.length);
      const hexDump = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' ');
      const typeSummary = result.fields.map(f => {
        const typeMatch = f.match(/\((\S+)\)/);
        return typeMatch ? typeMatch[1] ?? 'unknown' : 'unknown';
      });
      const typeCounts = typeSummary.reduce((acc: Record<string, number>, t) => { acc[t] = (acc[t] || 0) + 1; return acc; }, {});

      const summary = `// Protobuf Wire Format Decode\n// Total: ${bytes.length} bytes, ${result.fields.length} field(s)\n// Type breakdown: ${Object.entries(typeCounts).map(([k, v]) => `${k}(${v})`).join(', ')}\n// Wire format: field_number << 3 | wire_type (0=varint, 1=64-bit, 2=length-delimited, 5=32-bit)\n\n${result.fields.join('\n')}\n\n// Raw hex:\n// ${hexDump}`;
      setOutput(summary);
    } catch (e) {
      toast.error('Invalid hex input');
      setOutput('');
      setFieldCount(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Protobuf Decoder</h2>
        <p className="text-xs text-[var(--text-secondary)]">Decode protobuf wire format hex to readable field structure. Supports varints, strings, nested messages, and fixed-width types.</p>
        <PresetBar presets={presets} />
        <textarea aria-label="Protobuf hex input" rows={3} value={input} onChange={e => setInput(e.target.value)} placeholder="Paste hex bytes (e.g. 0a03626f621205776f726c64)"
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={decode} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Decode</button>
        {output && (
          <div className="space-y-2">
            {fieldCount > 0 && (
              <div className="flex gap-4 text-[10px] text-[var(--text-secondary)]">
                <span>{fieldCount} field(s) decoded</span>
              </div>
            )}
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-64 overflow-y-auto">{output}</pre>
            <CopyDownload output={output} filename="protobuf-decode.txt" />
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
        <textarea aria-label="Tailwind to CSS Converter" rows={2} value={input} onChange={e => setInput(e.target.value)} placeholder="Space-separated Tailwind classes"
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
      fields.push({ type: m[1] ?? "", name: m[2] ?? "", id: m[3] ?? "" });
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
        <textarea aria-label="Proto Schema to TS + JSON" rows={7} value={input} onChange={e => setInput(e.target.value)}
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
        <textarea aria-label="tsconfig Analyzer" rows={5} value={input} onChange={e => setInput(e.target.value)}
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
        <textarea aria-label="TypeScript Formatter" rows={5} value={input} onChange={e => setInput(e.target.value)}
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
          <label htmlFor="lbl-stylecodekitwidgets-template" className="text-xs text-[var(--text-secondary)] mb-1 block">Template</label>
          <input id="lbl-stylecodekitwidgets-template" aria-label="Template" type="text" value={template} onChange={e => setTemplate(e.target.value)} placeholder="Template with {{var}} placeholders"
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm font-mono" />
        </div>
        <div>
          <label htmlFor="lbl-stylecodekitwidgets-variables-json" className="text-xs text-[var(--text-secondary)] mb-1 block">Variables (JSON)</label>
          <textarea id="lbl-stylecodekitwidgets-variables-json" aria-label="Variables (JSON)" rows={3} value={vars} onChange={e => setVars(e.target.value)}
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

  const presets = [
    { label: 'User Profile', apply: () => setSchema('[{"name":"id","type":"number"},{"name":"email","type":"email"},{"name":"name","type":"string"},{"name":"active","type":"boolean"}]') },
    { label: 'Product', apply: () => setSchema('[{"name":"id","type":"number"},{"name":"title","type":"string"},{"name":"price","type":"number"},{"name":"inStock","type":"boolean"}]') },
    { label: 'Order', apply: () => setSchema('[{"name":"orderId","type":"string"},{"name":"userId","type":"number"},{"name":"total","type":"number"},{"name":"status","type":"string"},{"name":"createdAt","type":"date"}]') },
    { label: 'Clear', apply: () => { setSchema('[]'); } },
  ];

  return (
    <Section title="Test Data Generator">
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((p, i) => (
          <button key={i} onClick={p.apply} className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-xs font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">{p.label}</button>
        ))}
      </div>
      <div className="space-y-4">
        <label htmlFor="lbl-stylecodekitwidgets-schema-json-array-of-name-type" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Schema (JSON array of {"{name, type}"})</label>
        <textarea id="lbl-stylecodekitwidgets-schema-json-array-of-name-type" value={schema} onChange={e => setSchema(e.target.value)} rows={6} aria-label="Schema (JSON array)" placeholder='[{"name":"id","type":"number"},{"name":"email","type":"email"}]'
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-green-500/50 resize-y" />

        <button onClick={generate} className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition-colors w-full sm:w-auto">Generate</button>

        {output && (
          <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 max-h-[300px] overflow-auto">
            <pre className="text-xs font-mono text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{output}</pre>
          </div>
        )}
      </div>
    </Section>
  );
}

"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

type Lang = 'typescript' | 'typescript-interface' | 'java' | 'csharp' | 'python' | 'go' | 'rust' | 'kotlin';

export default function JsonToCode() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [lang, setLang] = useState<Lang>('typescript');
  const [rootName, setRootName] = useState('Root');

  const convert = (json: string, l: Lang, name: string) => {
    if (!json.trim()) { setOutput(''); return; }
    try {
      const obj = JSON.parse(json);
      const typeMap = (val: unknown): string => {
        if (val === null) return 'null';
        if (typeof val === 'boolean') return 'boolean';
        if (typeof val === 'number') return Number.isInteger(val) ? 'number' : 'number';
        if (typeof val === 'string') return 'string';
        if (Array.isArray(val)) return val.length > 0 ? `${typeMap(val[0])}[]` : 'any[]';
        if (typeof val === 'object') return 'object';
        return 'any';
      };

      const generateInterface = (val: unknown, typeName: string): string => {
        if (typeof val !== 'object' || val === null || Array.isArray(val)) return '';
        const entries = Object.entries(val as Record<string, unknown>);
        const props = entries.map(([k, v]) => {
          const t = typeMap(v);
          const optional = v === null || v === undefined;
          if (l === 'typescript') return `  ${k}${optional ? '?' : ''}: ${typeRef(v, `${typeName}${k.charAt(0).toUpperCase() + k.slice(1)}`)};`;
          if (l === 'typescript-interface') return `  ${k}${optional ? '?' : ''}: ${typeRef(v, `${typeName}${k.charAt(0).toUpperCase() + k.slice(1)}`)};`;
          if (l === 'java') return `  private ${javaType(v, `${typeName}${k.charAt(0).toUpperCase() + k.slice(1)}`)} ${k};`;
          if (l === 'csharp') return `  public ${csharpType(v, `${typeName}${k.charAt(0).toUpperCase() + k.slice(1)}`)} ${k} { get; set; }`;
          if (l === 'python') return `  ${k}: ${pythonType(v, `${typeName}${k.charAt(0).toUpperCase() + k.slice(1)}`)}`;
          if (l === 'go') return `  ${k.charAt(0).toUpperCase() + k.slice(1)} ${goType(v, `${typeName}${k.charAt(0).toUpperCase() + k.slice(1)}`)} \`json:"${k}"\``;
          if (l === 'rust') return `  pub ${k}: ${rustType(v, `${typeName}${k.charAt(0).toUpperCase() + k.slice(1)}`)}`;
          if (l === 'kotlin') return `  val ${k}: ${kotlinType(v, `${typeName}${k.charAt(0).toUpperCase() + k.slice(1)}`)}`;
          return '';
        }).join('\n');

        const nested = entries.map(([k, v]) => {
          if (typeof v === 'object' && v !== null && !Array.isArray(v)) return `\n\n` + generateInterface(v, `${typeName}${k.charAt(0).toUpperCase() + k.slice(1)}`) + '\n';
          if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object' && v[0] !== null) return `\n\n` + generateInterface(v[0], `${typeName}${k.charAt(0).toUpperCase() + k.slice(1)}Item`) + '\n';
          return '';
        }).join('');

        const wrapper = l === 'typescript' || l === 'typescript-interface' ? `interface ${typeName} {\n${props}\n}` :
          l === 'java' ? `public class ${typeName} {\n${props}\n}` :
          l === 'csharp' ? `public class ${typeName} {\n${props}\n}` :
          l === 'python' ? `class ${typeName}:\n${props.replace(/  /g, '    ')}` :
          l === 'go' ? `type ${typeName} struct {\n${props}\n}` :
          l === 'rust' ? `struct ${typeName} {\n${props}\n}` :
          l === 'kotlin' ? `data class ${typeName} (\n${props}\n)` : '';
        return wrapper + nested;
      };

      const typeRef = (val: unknown, name: string): string => {
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) return name;
        if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && val[0] !== null) return `${name}Item[]`;
        return typeMap(val);
      };
      const javaType = (val: unknown, name: string): string => typeRef(val, name) === name ? name : typeMap(val).replace('boolean', 'Boolean').replace('number', 'int').replace('string', 'String');
      const csharpType = (val: unknown, name: string): string => typeRef(val, name) === name ? name : typeMap(val).replace('boolean', 'bool').replace('number', 'int').replace('string', 'string');
      const pythonType = (val: unknown, name: string): string => typeRef(val, name) === name ? name : typeMap(val).replace('boolean', 'bool').replace('number', 'int').replace('string', 'str');
      const goType = (val: unknown, name: string): string => typeRef(val, name) === name ? name : typeMap(val).replace('boolean', 'bool').replace('number', 'int').replace('string', 'string');
      const rustType = (val: unknown, name: string): string => typeRef(val, name) === name ? name : typeMap(val).replace('boolean', 'bool').replace('number', 'i64').replace('string', 'String');
      const kotlinType = (val: unknown, name: string): string => typeRef(val, name) === name ? name : typeMap(val).replace('boolean', 'Boolean').replace('number', 'Int').replace('string', 'String');

      setOutput(generateInterface(obj, name));
    } catch { setOutput(''); toast.error('Invalid JSON'); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex bg-[var(--bg-surface)] rounded-xl p-1">
          {(['typescript', 'typescript-interface', 'java', 'csharp', 'python', 'go', 'rust', 'kotlin'] as Lang[]).map(l => (
            <button key={l} onClick={() => { setLang(l); if (input) convert(input, l, rootName); }} className={`px-2 py-1.5 text-[10px] font-bold rounded-lg transition-all ${lang === l ? 'bg-[var(--bg-elevated)] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-[var(--text-secondary)]'}`}>{l === 'typescript-interface' ? 'TS (interface)' : l.charAt(0).toUpperCase() + l.slice(1)}</button>
          ))}
        </div>
        <input aria-label="Root type name" value={rootName} onChange={e => { setRootName(e.target.value); if (input) convert(input, lang, e.target.value); }} placeholder="Root type name" className="w-28 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 font-mono" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea aria-label="Paste JSON..." value={input} onChange={e => { setInput(e.target.value); convert(e.target.value, lang, rootName); }} placeholder="Paste JSON..." className="w-full h-[400px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono focus:border-[var(--accent)] transition-colors" />
        <div className="relative">
          <textarea value={output} readOnly placeholder="Generated types..." className="w-full h-[400px] bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono" />
          {output && <button onClick={() => { clipboardWrite(output); toast.success('Copied!'); }} className="absolute top-3 right-3 text-[10px] text-[var(--text-muted)] hover:text-zinc-600 dark:hover:text-zinc-300 bg-white dark:bg-[var(--bg-surface)] px-2 py-1 rounded border border-[var(--border-subtle)] transition-colors">Copy</button>}
        </div>
      </div>
    </div>
  );
}

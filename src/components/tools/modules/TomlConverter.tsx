"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ArrowLeftRight, FileJson, FileType } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Mode = 'json-to-toml' | 'toml-to-json' | 'yaml-to-toml' | 'toml-to-yaml';

function escapeTomlString(s: string): string {
  return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') + '"';
}

function jsonToToml(obj: unknown, prefix = ''): string {
  if (obj === null || obj === undefined) return '';
  let out = '';
  if (Array.isArray(obj)) {
    if (obj.length === 0) return `${prefix} = []\n`;
    const isObjArray = obj.every(e => typeof e === 'object' && e !== null && !Array.isArray(e));
    if (isObjArray) {
      for (const item of obj) {
        out += `[[${prefix}]]\n`;
        out += jsonToToml(item, '');
        out += '\n';
      }
    } else {
      const items = obj.map(e => {
        if (typeof e === 'string') return escapeTomlString(e);
        return String(e);
      });
      out += `${prefix} = [${items.join(', ')}]\n`;
    }
  } else if (typeof obj === 'object' && obj !== null) {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
        out += `[${key}]\n${jsonToToml(v, '')}`;
      } else if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object' && v[0] !== null) {
        for (const item of v) {
          out += `[[${key}]]\n${jsonToToml(item, '')}\n`;
        }
      } else {
        if (typeof v === 'string') out += `${k} = ${escapeTomlString(v)}\n`;
        else if (typeof v === 'number') out += `${k} = ${v}\n`;
        else if (typeof v === 'boolean') out += `${k} = ${v}\n`;
        else if (v === null) continue;
        else if (Array.isArray(v)) {
          const items = v.map(e => {
            if (typeof e === 'string') return escapeTomlString(e);
            return String(e);
          });
          out += `${k} = [${items.join(', ')}]\n`;
        }
      }
    }
  }
  return out;
}

function tomlToJson(toml: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let currentSection = '';
  const lines = toml.split('\n');
  
  const setDeep = (path: string, value: unknown) => {
    if (!path) return;
    const keys = path.split('.');
    let cur = result;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!cur[keys[i]] || typeof cur[keys[i]] !== 'object') cur[keys[i]] = {};
      cur = cur[keys[i]] as Record<string, unknown>;
    }
    cur[keys[keys.length - 1]] = value;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    
    const sectionMatch = line.match(/^\[\[(.+)\]\]$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      const keys = currentSection.split('.');
      let cur = result;
      for (let i = 0; i < keys.length; i++) {
        if (!cur[keys[i]]) cur[keys[i]] = [];
        if (i === keys.length - 1) {
          (cur[keys[i]] as unknown[]).push({});
        }
        cur = (cur[keys[i]] as unknown[])[(cur[keys[i]] as unknown[]).length - 1] as Record<string, unknown>;
      }
      continue;
    }
    
    const tableMatch = line.match(/^\[(.+)\]$/);
    if (tableMatch) {
      currentSection = tableMatch[1];
      continue;
    }
    
    const kvMatch = line.match(/^([a-zA-Z0-9_\-]+)\s*=\s*(.+)$/);
    if (!kvMatch) continue;
    
    const k = kvMatch[1];
    let rawVal = kvMatch[2].trim();
    let val: unknown;
    
    if (rawVal.startsWith('"') && rawVal.endsWith('"')) {
      val = rawVal.slice(1, -1).replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\\\/g, '\\');
    } else if (rawVal === 'true') val = true;
    else if (rawVal === 'false') val = false;
    else if (!isNaN(Number(rawVal))) val = Number(rawVal);
    else if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
      const inner = rawVal.slice(1, -1);
      val = inner.split(',').map(s => {
        const t = s.trim();
        if (t.startsWith('"') && t.endsWith('"')) return t.slice(1, -1);
        if (t === 'true') return true;
        if (t === 'false') return false;
        if (!isNaN(Number(t))) return Number(t);
        return t;
      });
    } else val = rawVal;
    
    if (currentSection) {
      setDeep(`${currentSection}.${k}`, val);
    } else {
      result[k] = val;
    }
  }
  return result;
}

function simpleYamlToJson(yaml: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = yaml.split('\n');
  const stack: { indent: number; key: string; obj: Record<string, unknown>; isArray: boolean; arrayIdx: number }[] = [];
  
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const indent = line.search(/\S/);
    const trimmed = line.trim();
    
    const arrayMatch = trimmed.match(/^-\s+(.+)$/);
    if (arrayMatch) {
      while (stack.length > 0 && stack[stack.length - 1].indent >= indent) stack.pop();
      const parent = stack.length > 0 ? stack[stack.length - 1] : null;
      if (parent) {
        if (!parent.obj[parent.key] || !Array.isArray(parent.obj[parent.key])) {
          parent.obj[parent.key] = [];
        }
        const arr = parent.obj[parent.key] as unknown[];
        arr.push(arrayMatch[1]);
      } else {
        if (!result._array) result._array = [];
        (result._array as unknown[]).push(arrayMatch[1]);
      }
      continue;
    }
    
    const kvMatch = trimmed.match(/^([a-zA-Z0-9_\-]+):\s*(.*)$/);
    if (!kvMatch) continue;
    const k = kvMatch[1];
    const v = kvMatch[2].trim();
    
    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) stack.pop();
    
    if (v === '') {
      const obj: Record<string, unknown> = {};
      if (stack.length > 0) {
        stack[stack.length - 1].obj[stack[stack.length - 1].key] = obj;
      } else {
        result[k] = obj;
      }
      stack.push({ indent, key: k, obj: result, isArray: false, arrayIdx: 0 });
    } else {
      let val: unknown = v;
      if (v === 'true') val = true;
      else if (v === 'false') val = false;
      else if (!isNaN(Number(v)) && v !== '') val = Number(v);
      else if (v.startsWith('"') && v.endsWith('"')) val = v.slice(1, -1);
      if (stack.length > 0) {
        stack[stack.length - 1].obj[k] = val;
      } else {
        result[k] = val;
      }
    }
  }
  return result;
}

function jsonToYaml(obj: unknown, indent = 0): string {
  if (obj === null || obj === undefined) return '';
  const pad = '  '.repeat(indent);
  if (Array.isArray(obj)) {
    return obj.map(e => {
      if (typeof e === 'object' && e !== null) {
        return `${pad}- ${jsonToYaml(e, indent + 1).trimStart()}`;
      }
      return `${pad}- ${typeof e === 'string' ? e : String(e)}`;
    }).join('\n');
  }
  if (typeof obj === 'object' && obj !== null) {
    return Object.entries(obj as Record<string, unknown>).map(([k, v]) => {
      if (v === null || v === undefined) return '';
      if (typeof v === 'object') {
        return `${pad}${k}:\n${jsonToYaml(v, indent + 1)}`;
      }
      return `${pad}${k}: ${typeof v === 'string' ? v : String(v)}`;
    }).filter(Boolean).join('\n');
  }
  return `${pad}${String(obj)}`;
}

export default function TomlConverter() {
  const [mode, setMode] = useState<Mode>('json-to-toml');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = (val: string, m: Mode) => {
    if (!val.trim()) { setOutput(''); return; }
    try {
      let json: Record<string, unknown>;
      switch (m) {
        case 'json-to-toml': {
          const parsed = JSON.parse(val);
          setOutput(jsonToToml(parsed));
          break;
        }
        case 'toml-to-json': {
          json = tomlToJson(val);
          setOutput(JSON.stringify(json, null, 2));
          break;
        }
        case 'yaml-to-toml': {
          json = simpleYamlToJson(val);
          setOutput(jsonToToml(json));
          break;
        }
        case 'toml-to-yaml': {
          json = tomlToJson(val);
          setOutput(jsonToYaml(json));
          break;
        }
      }
    } catch (e) {
      setOutput('');
      toast.error('Conversion failed — check input format');
    }
  };

  const handleInput = (val: string) => { setInput(val); convert(val, mode); };

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-[var(--bg-surface)] rounded-xl p-1">
          {(['json-to-toml','toml-to-json','yaml-to-toml','toml-to-yaml'] as Mode[]).map(m => (
            <button key={m} onClick={() => { setMode(m); if (input) convert(input, m); }} className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${mode === m ? 'bg-[var(--bg-elevated)] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-[var(--text-secondary)]'}`}>
              {m.replace('-', ' → ').replace('toml', 'TOML').replace('json', 'JSON').replace('yaml', 'YAML')}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea value={input} onChange={e => handleInput(e.target.value)} placeholder={`Enter ${mode.split('-to-')[0].toUpperCase()}...`} className="w-full h-[350px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none font-mono focus:border-[var(--accent)] transition-colors" />
        <div className="relative">
          <textarea value={output} readOnly placeholder="Result..." className="w-full h-[350px] bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none font-mono" />
          {output && <button onClick={() => { clipboardWrite(output); toast.success('Copied!'); }} className="absolute top-3 right-3 text-[10px] text-[var(--text-muted)] hover:text-zinc-600 dark:hover:text-zinc-300 bg-white dark:bg-[var(--bg-surface)] px-2 py-1 rounded border border-[var(--border-subtle)] transition-colors">Copy</button>}
        </div>
      </div>
    </div>
  );
}

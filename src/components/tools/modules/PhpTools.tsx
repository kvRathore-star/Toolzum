"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

type Mode = 'json-to-php' | 'php-to-json' | 'serialize' | 'unserialize';

export default function PhpTools() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<Mode>('json-to-php');

  const process = (val: string, m: Mode) => {
    if (!val.trim()) { setOutput(''); return; }
    try {
      let result = '';
      if (m === 'json-to-php') {
        const obj = JSON.parse(val);
        result = '<?php\n\nreturn ' + jsonToPhp(obj, 0) + ';\n';
      } else if (m === 'php-to-json') {
        const cleaned = val.replace(/^<\?php/i, '').replace(/\nreturn\s+/, '').replace(/;\s*$/, '').trim();
        const fn = new Function('return ' + cleaned.replace(/=>\s*array\s*\(/g, '=> {').replace(/array\s*\(/g, '{').replace(/\)/g, '}').replace(/=>/g, ':'));
        result = JSON.stringify(fn(), null, 2);
      } else if (m === 'serialize') {
        const obj = JSON.parse(val);
        result = serializePhp(obj);
      } else {
        result = JSON.stringify(unserializePhp(val), null, 2);
      }
      setOutput(result);
    } catch { setOutput(''); toast.error('Conversion failed. Check your input.'); }
  };

  const jsonToPhp = (val: unknown, depth: number): string => {
    const indent = '  '.repeat(depth + 1);
    if (val === null) return 'null';
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    if (typeof val === 'number') return val.toString();
    if (typeof val === 'string') return `'${val.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
    if (Array.isArray(val)) return '[\n' + val.map(v => indent + jsonToPhp(v, depth + 1)).join(',\n') + '\n' + '  '.repeat(depth) + ']';
    if (typeof val === 'object') return '[\n' + Object.entries(val as Record<string, unknown>).map(([k, v]) => indent + `'${k}' => ${jsonToPhp(v, depth + 1)}`).join(',\n') + '\n' + '  '.repeat(depth) + ']';
    return 'null';
  };

  const serializePhp = (val: unknown): string => {
    if (val === null) return 'N;';
    if (typeof val === 'boolean') return `b:${val ? '1' : '0'};`;
    if (typeof val === 'number') return (Number.isInteger(val) ? `i:${val};` : `d:${val};`);
    if (typeof val === 'string') return `s:${val.length}:"${val}";`;
    if (Array.isArray(val)) return `a:${val.length}:{${val.map((v, i) => serializePhp(i) + serializePhp(v)).join('')}}`;
    if (typeof val === 'object') {
      const entries = Object.entries(val as Record<string, unknown>);
      return `a:${entries.length}:{${entries.map(([k, v]) => serializePhp(k) + serializePhp(v)).join('')}}`;
    }
    return 'N;';
  };

  const unserializePhp = (str: string): unknown => {
    let pos = 0;
    const read = (): unknown => {
      if (pos >= str.length) return null;
      const type = str[pos]; pos += 2;
      if (type === 'N') return null;
      if (type === 'b') { const v = str[pos] === '1'; pos += 2; return v; }
      if (type === 'i') { const end = str.indexOf(';', pos); const v = parseInt(str.slice(pos, end)); pos = end + 1; return v; }
      if (type === 'd') { const end = str.indexOf(';', pos); const v = parseFloat(str.slice(pos, end)); pos = end + 1; return v; }
      if (type === 's') {
        const colon = str.indexOf(':', pos); const len = parseInt(str.slice(pos, colon));
        pos = colon + 2; const val = str.slice(pos, pos + len); pos += len + 2;
        return val;
      }
      if (type === 'a') {
        const colon = str.indexOf(':', pos); const len = parseInt(str.slice(pos, colon));
        pos = str.indexOf('{', colon) + 1;
        const result: Record<string, unknown> = {};
        for (let i = 0; i < len; i++) { const k = read() as string; const v = read(); result[k] = v; }
        pos++; return result;
      }
      return null;
    };
    return read();
  };

  const handleInput = (val: string) => { setInput(val); process(val, mode); };
  const swap = () => {
    const map: Record<Mode, Mode> = { 'json-to-php': 'php-to-json', 'php-to-json': 'json-to-php', 'serialize': 'unserialize', 'unserialize': 'serialize' };
    const newMode = map[mode];
    setMode(newMode);
    if (output) { setInput(output); process(output, newMode); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
          {[
            { id: 'json-to-php', label: 'JSON → PHP' },
            { id: 'php-to-json', label: 'PHP → JSON' },
            { id: 'serialize', label: 'Serialize' },
            { id: 'unserialize', label: 'Unserialize' },
          ].map(b => (
            <button key={b.id} onClick={() => { setMode(b.id as Mode); process(input, b.id as Mode); }} className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg transition-all ${mode === b.id ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500'}`}>{b.label}</button>
          ))}
        </div>
        <button onClick={swap} className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">⇄ Swap</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea value={input} onChange={e => handleInput(e.target.value)} placeholder={mode === 'json-to-php' ? 'Paste JSON...' : mode === 'php-to-json' ? 'Paste PHP array...' : mode === 'serialize' ? 'Paste JSON to serialize...' : 'Paste serialized PHP string...'} className="w-full h-[350px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none font-mono focus:border-blue-500 transition-colors" />
        <div className="relative">
          <textarea value={output} readOnly placeholder="Result..." className="w-full h-[350px] bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none font-mono" />
          {output && <button onClick={() => { clipboardWrite(output); toast.success('Copied!'); }} className="absolute top-3 right-3 text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 transition-colors">Copy</button>}
        </div>
      </div>
    </div>
  );
}

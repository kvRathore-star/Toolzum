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
        const parsed = parsePhpArray(cleaned);
        result = JSON.stringify(parsed, null, 2);
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

  function parsePhpArray(input: string): unknown {
    let pos = 0;
    const s = input.trim();
    function skipWS() { while (pos < s.length && (s[pos] === ' ' || s[pos] === '\n' || s[pos] === '\r' || s[pos] === '\t')) pos++; }
    function parseString(quote: string): string {
      pos++;
      let r = '';
      while (pos < s.length && s[pos] !== quote) { if (s[pos] === '\\') { pos++; r += s[pos]; } else r += s[pos]; pos++; }
      pos++;
      return r;
    }
    function parseNumber(): number {
      const start = pos;
      if (s[pos] === '-') pos++;
      while (pos < s.length && ((s[pos]! >= '0' && s[pos]! <= '9') || s[pos] === '.')) pos++;
      return parseFloat(s.slice(start, pos));
    }
    function parseValue(): unknown {
      skipWS();
      if (s[pos] === "'") return parseString("'");
      if (s[pos] === '"') return parseString('"');
      if (s.slice(pos, pos + 5) === 'array' || s[pos] === '[') return parseArray();
      if (s.slice(pos, pos + 4) === 'true') { pos += 4; return true; }
      if (s.slice(pos, pos + 5) === 'false') { pos += 5; return false; }
      if (s.slice(pos, pos + 4) === 'null') { pos += 4; return null; }
      return parseNumber();
    }
    function parseArray(): Record<string, unknown> | unknown[] {
      if (s.slice(pos, pos + 5) === 'array') pos += 5;
      skipWS();
      if (s[pos] === '(' || s[pos] === '[') pos++;
      const result: Record<string, unknown> = {};
      let index = 0;
      while (pos < s.length && s[pos] !== ')' && s[pos] !== ']') {
        skipWS();
        if (s[pos] === ')' || s[pos] === ']') break;
        const savedPos = pos;
        const key = parseValue();
        skipWS();
        if (s[pos] === '=' && s[pos + 1] === '>') {
          pos += 2;
          skipWS();
          const val = parseValue();
          if (typeof key === 'string') result[key] = val;
          else result[String(index++)] = val;
        } else {
          pos = savedPos;
          const val = parseValue();
          result[String(index++)] = val;
        }
        skipWS();
        if (s[pos] === ',') pos++;
      }
      if (s[pos] === ')') pos++;
      if (s[pos] === ']') pos++;
      return Object.keys(result).every(k => !isNaN(Number(k))) ? Object.values(result) : result;
    }
    return parseValue();
  }

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
        <div className="flex bg-[var(--bg-surface)] rounded-xl p-1">
          {[
            { id: 'json-to-php', label: 'JSON → PHP' },
            { id: 'php-to-json', label: 'PHP → JSON' },
            { id: 'serialize', label: 'Serialize' },
            { id: 'unserialize', label: 'Unserialize' },
          ].map(b => (
            <button key={b.id} onClick={() => { setMode(b.id as Mode); process(input, b.id as Mode); }} className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg transition-all ${mode === b.id ? 'bg-[var(--bg-elevated)] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-[var(--text-secondary)]'}`}>{b.label}</button>
          ))}
        </div>
        <button onClick={swap} className="text-xs text-[var(--text-muted)] hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">⇄ Swap</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea value={input} onChange={e => handleInput(e.target.value)} aria-label={mode === 'json-to-php' ? 'Paste JSON...' : mode === 'php-to-json' ? 'Paste PHP array...' : mode === 'serialize' ? 'Paste JSON to serialize...' : 'Paste serialized PHP string...'} placeholder={mode === 'json-to-php' ? 'Paste JSON...' : mode === 'php-to-json' ? 'Paste PHP array...' : mode === 'serialize' ? 'Paste JSON to serialize...' : 'Paste serialized PHP string...'} className="w-full h-[350px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono focus:border-[var(--accent)] transition-colors" />
        <div className="relative">
          <textarea value={output} readOnly placeholder="Result..." aria-label="PHP output" className="w-full h-[350px] bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono" />
          {output && <button onClick={() => { clipboardWrite(output); toast.success('Copied!'); }} className="absolute top-3 right-3 text-[10px] text-[var(--text-muted)] hover:text-zinc-600 dark:hover:text-zinc-300 bg-white dark:bg-[var(--bg-surface)] px-2 py-1 rounded border border-[var(--border-subtle)] transition-colors">Copy</button>}
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

const CalcBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button onClick={onClick} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-1.5 rounded-lg transition-all active:scale-[0.98]">{label}</button>
);

const Result = ({ value }: { value: string }) => (
  <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-[var(--bg-overlay)] rounded-lg px-2 py-1 break-all whitespace-pre-wrap">{value}</p>
);

export function CodeObfuscator() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'obfuscate' | 'deobfuscate'>('obfuscate');
  const [output, setOutput] = useState('');
  return (
    <div className="space-y-3">
      <select value={mode} onChange={e => setMode(e.target.value as any)}
        className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded px-2 py-1 text-[10px] text-[var(--text-primary)] outline-none">
        <option value="obfuscate">Obfuscate</option>
        <option value="deobfuscate">Deobfuscate</option>
      </select>
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Paste code..."
        className="w-full h-24 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded px-2 py-1 text-[9px] font-mono text-[var(--text-primary)] outline-none resize-none" />
      <CalcBtn onClick={() => {
        if (mode === 'obfuscate') setOutput(btoa(input).split('').reverse().join(''));
        else try { setOutput(atob(input.split('').reverse().join(''))); } catch { setOutput('Cannot deobfuscate (non-standard)'); }
        toast.success(mode === 'obfuscate' ? 'Obfuscated' : 'Deobfuscated');
      }} label={mode === 'obfuscate' ? 'Obfuscate' : 'Deobfuscate'} />
      {output && <Result value={output} />}
    </div>
  );
}

export function CodeToCurlParser() {
  const [input, setInput] = useState('curl https://api.example.com/data');
  const [output, setOutput] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="curl command..."
        className="w-full h-24 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded px-2 py-1 text-[9px] font-mono text-[var(--text-primary)] outline-none resize-none" />
      <CalcBtn onClick={() => {
        const m = input.match(/-X\s+(\w+)/);
        const u = input.match(/https?:\/\/[^\s"']+/);
        const h = [...input.matchAll(/-H\s+["']([^"']+)["']/g)].map(r => r[1]);
        const d = input.match(/--data\s+["']([^"']+)["']/);
        setOutput(`Method: ${m?.[1] || 'GET'}\nURL: ${u?.[0] || 'N/A'}\nHeaders: ${h.length || 'None'}\nBody: ${d?.[1] || 'None'}`);
      }} label="Parse Curl" />
      {output && <Result value={output} />}
    </div>
  );
}

export function JsSyntaxChecker() {
  const [code, setCode] = useState('const x = 1;');
  const [result, setResult] = useState<string | null>(null);
  let acorn: any = undefined;
  if (typeof window !== 'undefined') {
    try { acorn = require('acorn'); } catch {}
  }
  return (
    <div className="space-y-3">
      <textarea value={code} onChange={e => setCode(e.target.value)} placeholder="JavaScript code..."
        className="w-full h-24 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded px-2 py-1 text-[9px] font-mono text-[var(--text-primary)] outline-none resize-none" />
      <CalcBtn onClick={() => {
        if (!acorn) { setResult('Syntax checker unavailable'); return; }
        try { acorn.parse(code, { ecmaVersion: 'latest' }); setResult('✓ Valid JavaScript'); } catch (e) { setResult(`✗ ${e instanceof Error ? e.message : 'Syntax error'}`); }
      }} label="Check Syntax" />
      {result && <Result value={result} />}
    </div>
  );
}

export function PugToHtml() {
  const [input, setInput] = useState('div.container\n  h1.title Hello\n  p.content World');
  const [output, setOutput] = useState('');
  return (
    <div className="space-y-3">
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="div.container&#10;  h1 Hello"
        className="w-full h-24 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded px-2 py-1 text-[9px] font-mono text-[var(--text-primary)] outline-none resize-none" />
      <CalcBtn onClick={() => {
        const lines = input.split('\n');
        const out: string[] = [];
        lines.forEach(l => {
          const t = l.trim();
          if (!t) return;
          const indent = l.search(/\S/);
          const parts = t.split(/[.\s#]/);
          const tag = parts[0] || 'div';
          const cls = t.match(/\.([\w-]+)/g)?.map(c => c.slice(1)).join(' ') || '';
          const id = t.match(/#([\w-]+)/)?.[1] || '';
          const text = t.includes(' ') ? t.slice(t.indexOf(' ') + 1) : '';
          out.push(`${'  '.repeat(indent / 2)}<${tag}${id ? ` id="${id}"` : ''}${cls ? ` class="${cls}"` : ''}>${text}</${tag}>`);
        });
        setOutput(out.join('\n'));
        toast.success('Converted to HTML');
      }} label="Convert" />
      {output && <Result value={output} />}
    </div>
  );
}

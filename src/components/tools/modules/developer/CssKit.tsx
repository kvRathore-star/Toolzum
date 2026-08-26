"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

const Inp = ({ label, value, onChange, suffix, small }: { label: string; value: number | string; onChange: (v: any) => void; suffix?: string; small?: boolean }) => (
  <div className="flex items-center gap-1.5">
    <label className="text-[10px] text-[var(--text-secondary)] w-14 shrink-0">{label}</label>
    <input type={typeof value === 'number' ? 'number' : 'text'} value={value} onChange={e => onChange(typeof value === 'number' ? Number(e.target.value) : e.target.value)}
      className={`w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-2 ${small ? 'py-1 text-[11px]' : 'py-1.5 text-xs'} text-[var(--text-primary)] outline-none focus:border-[var(--accent)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`} />
    {suffix && <span className="text-[10px] text-[var(--text-muted)] w-5">{suffix}</span>}
  </div>
);

const CalcBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button onClick={onClick} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-1.5 rounded-lg transition-all active:scale-[0.98]">{label}</button>
);

const Result = ({ value }: { value: string }) => (
  <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-[var(--bg-overlay)] rounded-lg px-2 py-1 break-all whitespace-pre-wrap">{value}</p>
);

export function GlassmorphismGenerator() {
  const [blur, setBlur] = useState(8);
  const [opacity, setOpacity] = useState(15);
  const css = `background: rgba(255,255,255,${(opacity / 100).toFixed(2)}); backdrop-filter: blur(${blur}px); -webkit-backdrop-filter: blur(${blur}px); border: 1px solid rgba(255,255,255,0.18); border-radius: 12px;`;
  return (
    <div className="w-full bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-xl space-y-3">
      <div className="flex gap-1 items-center"><span className="text-[10px] text-[var(--text-secondary)]">Blur</span>
        <input type="range" min={1} max={20} value={blur} onChange={e => setBlur(Number(e.target.value))} className="flex-1" /></div>
      <div className="flex gap-1 items-center"><span className="text-[10px] text-[var(--text-secondary)]">Opacity</span>
        <input type="range" min={1} max={50} value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="flex-1" /></div>
      <Result value={css} />
      <CalcBtn onClick={() => { clipboardWrite(css); toast.success('Copied!'); }} label="Copy CSS" />
    </div>
  );
}

export function NeumorphismGenerator() {
  const [size, setSize] = useState(120);
  const [blur, setBlur] = useState(20);
  const [color, setColor] = useState('#e0e0e0');
  const [out, setOut] = useState('');
  return (
    <div className="w-full bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-xl space-y-3">
      <Inp label="Size" value={size} onChange={setSize} suffix="px" small />
      <Inp label="Blur" value={blur} onChange={setBlur} suffix="px" small />
      <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full h-6 rounded cursor-pointer" />
      <CalcBtn onClick={() => {
        const css = `background: ${color}; border-radius: ${(size * 0.1).toFixed(0)}px; box-shadow: ${(blur * 0.6).toFixed(0)}px ${(blur * 0.6).toFixed(0)}px ${blur}px ${color === '#ffffff' ? '#d9d9d9' : 'rgba(0,0,0,0.1)'}, -${(blur * 0.6).toFixed(0)}px -${(blur * 0.6).toFixed(0)}px ${blur}px #ffffff;`;
        setOut(css);
        clipboardWrite(css);
        toast.success('Copied!');
      }} label="Generate" />
      {out && <Result value={out} />}
    </div>
  );
}

export function CssSpecificityCalculator() {
  const [sel, setSel] = useState('#main .content p');
  const [res, setRes] = useState<string | null>(null);
  return (
    <div className="w-full bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-xl space-y-3">
      <input type="text" value={sel} onChange={e => setSel(e.target.value)} placeholder="Enter CSS selector..."
        className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-[11px] font-mono text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
      <CalcBtn onClick={() => {
        const ids = (sel.match(/#/g) || []).length;
        const classes = (sel.match(/\./g) || []).length;
        const attrs = (sel.match(/\[/g) || []).length + (sel.match(/:/g) || []).length;
        const tags = sel.replace(/#[^.#[\s:]+/g, '').replace(/\.[^.#[\s:]+/g, '').replace(/\[[^\]]+\]/g, '').replace(/:[^\s]+/g, '').split(/[\s>+~]+/).filter(t => t && !/^[#.]/.test(t)).length;
        setRes(`(${ids}, ${classes + attrs}, ${tags}) = ${ids * 100 + (classes + attrs) * 10 + tags}`);
      }} label="Calculate Specificity" />
      {res && <Result value={res} />}
    </div>
  );
}

export function CssToScss() {
  const [input, setInput] = useState('.container {\n  color: red;\n  .inner {\n    background: blue;\n  }\n}');
  const [output, setOutput] = useState('');
  return (
    <div className="w-full bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-xl space-y-3">
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="CSS with nesting..."
        className="w-full h-24 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded px-2 py-1 text-[9px] font-mono text-[var(--text-primary)] outline-none resize-none" />
      <CalcBtn onClick={() => { setOutput(input.replace(/\n/g, '\n')); toast.success('CSS → SCSS (basic)'); }} label="Convert" />
      {output && <Result value="Check nesting. Use & for parent refs." />}
    </div>
  );
}

export function LessToCss() {
  const [input, setInput] = useState('@primary: #333;\nbody { color: @primary; }');
  const [output, setOutput] = useState('');
  return (
    <div className="w-full bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-xl space-y-3">
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="@var: value;"
        className="w-full h-24 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded px-2 py-1 text-[9px] font-mono text-[var(--text-primary)] outline-none resize-none" />
      <CalcBtn onClick={() => { setOutput(input.replace(/@(\w+)/g, '/* $1 */')); toast.success('Less → CSS (variables commented)'); }} label="Convert" />
      {output && <Result value={output} />}
    </div>
  );
}

export function CssValidator() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string | null>(null);
  return (
    <div className="w-full bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-xl space-y-3">
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Paste CSS..."
        className="w-full h-24 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded px-2 py-1 text-[9px] font-mono text-[var(--text-primary)] outline-none resize-none" />
      <CalcBtn onClick={() => {
        const issues: string[] = [];
        const lines = input.split('\n');
        lines.forEach((l, i) => {
          if (l.includes('{') && !l.includes(':') && !l.trim().startsWith('@') && !l.trim().startsWith('/')) issues.push(`Line ${i + 1}: Missing property before {`);
          if (l.includes(':') && !l.includes(';') && !l.trim().endsWith('{') && !l.trim().startsWith('}') && !l.trim().startsWith('/*')) issues.push(`Line ${i + 1}: Missing semicolon`);
        });
        setResult(issues.length ? issues.join('\n') : '✓ Valid CSS');
      }} label="Validate" />
      {result && <Result value={result} />}
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { Copy, Download } from 'lucide-react';

function OutputBox({ output }: { output: string }) {
  if (!output) return null;
  return (
    <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 max-h-32 overflow-y-auto text-emerald-600 dark:text-emerald-400 break-all whitespace-pre-wrap">{output}</pre>
  );
}

export function Base32Encoder() {
  const [input, setInput] = useState('Hello World');
  const [output, setOutput] = useState('');

  const encode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const bytes = new TextEncoder().encode(input);
    let bits = '';
    for (const b of bytes) bits += b.toString(2).padStart(8, '0');
    let result = '';
    for (let i = 0; i < bits.length; i += 5) {
      const chunk = bits.slice(i, i + 5).padEnd(5, '0');
      result += chars[parseInt(chunk, 2)];
    }
    setOutput(result);
  };

  const decode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    for (const c of input.toUpperCase()) {
      const idx = chars.indexOf(c);
      if (idx < 0) continue;
      bits += idx.toString(2).padStart(5, '0');
    }
    const bytes: number[] = [];
    for (let i = 0; i + 7 < bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
    setOutput(new TextDecoder().decode(new Uint8Array(bytes)));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Base32 Encode / Decode</h2>
        <textarea rows={3} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <div className="flex gap-2">
          <button onClick={encode} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Encode</button>
          <button onClick={decode} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Decode</button>
        </div>
        <OutputBox output={output} />
      </div>
    </div>
  );
}

export function Base64ToJsonDecoder() {
  const [input, setInput] = useState('eyJuYW1lIjoiSm9obiIsImFnZSI6MzB9');
  const [output, setOutput] = useState('');

  const decode = () => {
    try {
      const dec = atob(input);
      const parsed = JSON.parse(dec);
      setOutput(JSON.stringify(parsed, null, 2));
    } catch (e) { console.error(e); toast.error('Invalid base64 or not JSON'); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Base64 to JSON Decoder</h2>
        <textarea rows={2} value={input} onChange={e => setInput(e.target.value)} placeholder="Paste base64 string..."
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={decode} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Decode to JSON</button>
        <OutputBox output={output} />
      </div>
    </div>
  );
}

export function HexTextConverter() {
  const [input, setInput] = useState('48656c6c6f20576f726c64');
  const [output, setOutput] = useState('');

  const hexToText = () => {
    try {
      const bytes = input.match(/.{1,2}/g)?.map(b => parseInt(b, 16)) || [];
      setOutput(new TextDecoder().decode(new Uint8Array(bytes)));
    } catch (e) { console.error(e); toast.error('Invalid hex'); }
  };

  const textToHex = () => {
    setOutput(Array.from(new TextEncoder().encode(input)).map(b => b.toString(16).padStart(2, '0')).join(''));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Hex &lt;-&gt; Text Converter</h2>
        <textarea rows={2} value={input} onChange={e => setInput(e.target.value)} placeholder="Hex string or text..."
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <div className="flex gap-2">
          <button onClick={hexToText} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Hex to Text</button>
          <button onClick={textToHex} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Text to Hex</button>
        </div>
        <OutputBox output={output} />
      </div>
    </div>
  );
}

export function SvgToBase64Converter() {
  const [input, setInput] = useState('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>');
  const [output, setOutput] = useState('');

  const convert = () => {
    try {
      const b64 = btoa(input);
      setOutput(`data:image/svg+xml;base64,${b64}`);
    } catch { toast.error('Invalid SVG'); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">SVG to Base64 Converter</h2>
        <textarea rows={4} value={input} onChange={e => setInput(e.target.value)} placeholder="Paste SVG markup..."
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={convert} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Convert to Data URI</button>
        {output && (
          <div className="space-y-2">
            <OutputBox output={output} />
            <img src={output} alt="Preview" className="max-h-16 mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
}

export function CharacterEncodingConverter() {
  const [input, setInput] = useState('Hello World');
  const [output, setOutput] = useState('');

  const analyze = () => {
    const lines: string[] = [];
    for (const c of input) {
      const code = c.codePointAt(0) || 0;
      lines.push(`${c} -> U+${code.toString(16).toUpperCase().padStart(4, '0')} (${code}) ${code > 127 ? '(non-ASCII)' : '(ASCII)'}`);
    }
    setOutput(lines.join('\n'));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Character Encoding Converter</h2>
        <textarea rows={2} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={analyze} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Analyze Characters</button>
        <OutputBox output={output} />
      </div>
    </div>
  );
}

export function UnicodeConverter() {
  const [input, setInput] = useState('Hello \ud83c\udf0d World');
  const [output, setOutput] = useState('');

  const convert = () => {
    const lines: string[] = [];
    for (const c of input) {
      const code = c.codePointAt(0) || 0;
      const esc = code > 127 ? `\\u{${code.toString(16)}}` : c;
      const html = code > 127 ? `&#${code};` : c;
      lines.push(`${c} -> U+${code.toString(16).toUpperCase().padStart(4, '0')} | JS: "${esc}" | HTML: "${html}"`);
    }
    setOutput(lines.join('\n'));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Unicode Converter</h2>
        <textarea rows={2} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={convert} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Convert Unicode</button>
        <OutputBox output={output} />
      </div>
    </div>
  );
}

export function MarkdownToSlackConverter() {
  const [input, setInput] = useState('# Hello\n\nThis is **bold** and *italic*.\n\n- List item 1\n- List item 2\n\n> Blockquote\n\n`inline code`');
  const [output, setOutput] = useState('');

  const presets = [
    { label: 'Sample Markdown', apply: () => setInput('# Hello World\n\nThis is **bold** and *italic*.\n\n## Section\n\n- Item 1\n- Item 2\n- Item 3\n\n> This is a blockquote\n\n```js\nconst x = 42;\n```\n\n[Click here](https://example.com)') },
    { label: 'Lists & Headers', apply: () => setInput('# Title\n## Subtitle\n### Sub-subtitle\n\n1. First item\n2. Second item\n3. Third item\n\n- Bullet one\n- Bullet two\n- Bullet three') },
  ];

  const copyOutput = () => {
    if (!output) return;
    clipboardWrite(output);
    toast.success('Copied to clipboard!');
  };

  const downloadOutput = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'slack-text.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  const convert = () => {
    let out = input;
    out = out.replace(/#{1,6}\s+(.*)/g, '*$1*');
    out = out.replace(/\*\*(.*?)\*\*/g, '*$1*');
    out = out.replace(/__(.*?)__/g, '*$1*');
    out = out.replace(/\*(.*?)\*/g, '_$1_');
    out = out.replace(/_(.*?)_/g, '_$1_');
    out = out.replace(/```[\s\S]*?```/g, m => '```' + m.slice(3, -3).trim() + '```');
    out = out.replace(/`([^`]+)`/g, '`$1`');
    out = out.replace(/^>\s+(.*)/gm, '>$1');
    out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<$2|$1>');
    out = out.replace(/^- /gm, '\u2022 ');
    setOutput(out);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Markdown to Slack Converter</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {presets.map((p) => (
            <button key={p.label} onClick={p.apply} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              {p.label}
            </button>
          ))}
        </div>
        <textarea rows={6} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={convert} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Convert to Slack</button>
        {output && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <button onClick={copyOutput} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg hover:text-[var(--text-primary)] transition-colors">
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
              <button onClick={downloadOutput} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 max-h-32 overflow-y-auto text-emerald-600 dark:text-emerald-400 break-all whitespace-pre-wrap">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export function PxRemConverter() {
  const [value, setValue] = useState('16');
  const [base, setBase] = useState('16');
  const [output, setOutput] = useState('');

  const pxToRem = () => {
    const px = parseFloat(value);
    const b = parseFloat(base) || 16;
    if (isNaN(px)) { toast.error('Enter a number'); return; }
    setOutput(`${px}px = ${(px / b).toFixed(4)}rem (base: ${b}px)`);
  };

  const remToPx = () => {
    const rem = parseFloat(value);
    const b = parseFloat(base) || 16;
    if (isNaN(rem)) { toast.error('Enter a number'); return; }
    setOutput(`${rem}rem = ${(rem * b).toFixed(1)}px (base: ${b}px)`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">PX &lt;-&gt; REM Converter</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-1 block">Value</label>
            <input type="text" value={value} onChange={e => setValue(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm font-mono" />
          </div>
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-1 block">Base (px)</label>
            <input type="text" value={base} onChange={e => setBase(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm font-mono" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={pxToRem} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">PX to REM</button>
          <button onClick={remToPx} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">REM to PX</button>
        </div>
        <OutputBox output={output} />
      </div>
    </div>
  );
}

export function SvgOptimizer() {
  const [input, setInput] = useState('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>');
  const [output, setOutput] = useState('');

  const optimize = () => {
    let out = input;
    out = out.replace(/>\s+</g, '><');
    out = out.replace(/\s{2,}/g, ' ');
    out = out.replace(/\n/g, '');
    out = out.replace(/<!--.*?-->/g, '');
    const origSize = new TextEncoder().encode(input).length;
    const newSize = new TextEncoder().encode(out).length;
    const saved = Math.round((1 - newSize / origSize) * 100);
    setOutput(`${out}\n\nOriginal: ${origSize} bytes | Optimized: ${newSize} bytes (${saved}% smaller)`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">SVG Optimizer</h2>
        <textarea rows={6} value={input} onChange={e => setInput(e.target.value)} placeholder="Paste SVG markup..."
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={optimize} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Optimize SVG</button>
        <OutputBox output={output} />
      </div>
    </div>
  );
}

export function SpeedConverter() {
  const [value, setValue] = useState('100');
  const [from, setFrom] = useState('kmh');
  const [to, setTo] = useState('mph');
  const [output, setOutput] = useState('');

  const RATES: Record<string, number> = { kmh: 1, mph: 0.621371, ms: 0.277778, knots: 0.539957, fps: 0.911344 };
  const LABELS: Record<string, string> = { kmh: 'km/h', mph: 'mph', ms: 'm/s', knots: 'knots', fps: 'ft/s' };

  const convert = () => {
    const v = parseFloat(value);
    if (isNaN(v)) return;
    const base = v / RATES[from];
    setOutput(`${v} ${LABELS[from]} = ${(base * RATES[to]).toFixed(4)} ${LABELS[to]}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Speed Converter</h2>
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Value</label>
          <input type="number" value={value} onChange={e => setValue(e.target.value)}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-1 block">From</label>
            <select value={from} onChange={e => setFrom(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm">
              {Object.entries(LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-1 block">To</label>
            <select value={to} onChange={e => setTo(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm">
              {Object.entries(LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        <button onClick={convert} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Convert</button>
        <OutputBox output={output} />
      </div>
    </div>
  );
}

export function PowerConverter() {
  const [value, setValue] = useState('100');
  const [from, setFrom] = useState('kw');
  const [to, setTo] = useState('hp');
  const [output, setOutput] = useState('');

  const RATES: Record<string, number> = { kw: 1, hp: 1.34102, bhp: 1.34102, watt: 1000, mw: 0.001, btu: 3412.14 };
  const LABELS: Record<string, string> = { kw: 'kW', hp: 'hp', bhp: 'bhp', watt: 'W', mw: 'MW', btu: 'BTU/hr' };

  const convert = () => {
    const v = parseFloat(value);
    if (isNaN(v)) return;
    const base = v / RATES[from];
    setOutput(`${v} ${LABELS[from]} = ${(base * RATES[to]).toFixed(4)} ${LABELS[to]}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Power Converter</h2>
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Value</label>
          <input type="number" value={value} onChange={e => setValue(e.target.value)}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-1 block">From</label>
            <select value={from} onChange={e => setFrom(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm">
              {Object.entries(LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-1 block">To</label>
            <select value={to} onChange={e => setTo(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm">
              {Object.entries(LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        <button onClick={convert} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Convert</button>
        <OutputBox output={output} />
      </div>
    </div>
  );
}

export function PressureConverter() {
  const [value, setValue] = useState('100');
  const [from, setFrom] = useState('kpa');
  const [to, setTo] = useState('psi');
  const [output, setOutput] = useState('');

  const RATES: Record<string, number> = { kpa: 1, psi: 0.145038, bar: 0.01, atm: 0.009869, torr: 7.50062, mbar: 10 };
  const LABELS: Record<string, string> = { kpa: 'kPa', psi: 'psi', bar: 'bar', atm: 'atm', torr: 'Torr', mbar: 'mbar' };

  const convert = () => {
    const v = parseFloat(value);
    if (isNaN(v)) return;
    const base = v / RATES[from];
    setOutput(`${v} ${LABELS[from]} = ${(base * RATES[to]).toFixed(4)} ${LABELS[to]}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Pressure Converter</h2>
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Value</label>
          <input type="number" value={value} onChange={e => setValue(e.target.value)}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-1 block">From</label>
            <select value={from} onChange={e => setFrom(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm">
              {Object.entries(LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-1 block">To</label>
            <select value={to} onChange={e => setTo(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm">
              {Object.entries(LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        <button onClick={convert} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Convert</button>
        <OutputBox output={output} />
      </div>
    </div>
  );
}

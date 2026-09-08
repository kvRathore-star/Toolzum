"use client";

import React, { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

function hslToHex(h: number, s: number, l: number): string {
  l /= 100; const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  return { h, s: s * 100, l: l * 100 };
}

function luminance(r: number, g: number, b: number): number {
  const [R, G, B] = [r / 255, g / 255, b / 255].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(c1: string, c2: string): number {
  const a = hexToRgb(c1), b = hexToRgb(c2);
  const la = luminance(a.r, a.g, a.b), lb = luminance(b.r, b.g, b.b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export function ColorPaletteGenerator() {
  const [base, setBase] = useState('#3b82f6');
  const [palette, setPalette] = useState<string[]>([]);

  const generate = () => {
    const { r, g, b } = hexToRgb(base);
    const { h } = rgbToHsl(r, g, b);
    setPalette([
      base,
      hslToHex((h + 30) % 360, 65, 55),
      hslToHex((h + 60) % 360, 70, 45),
      hslToHex((h + 120) % 360, 60, 60),
      hslToHex((h + 180) % 360, 55, 50),
      hslToHex((h + 210) % 360, 65, 40),
    ]);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Color Palette Generator</h2>
        <input aria-label="Color Palette Generator" type="color" value={base} onChange={e => setBase(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
        <button onClick={generate} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Generate Palette</button>
        {palette.length > 0 && (
          <div className="flex gap-1">
            {palette.map((c, i) => (
              <button key={i} className="flex-1 h-10 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: c }}
                onClick={() => { clipboardWrite(c); toast.success('Copied!'); }}>{c}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ColorShadesTints() {
  const [base, setBase] = useState('#3b82f6');
  const [shades, setShades] = useState<string[]>([]);

  const generate = () => {
    const { r, g, b } = hexToRgb(base);
    const { h, s } = rgbToHsl(r, g, b);
    const res: string[] = [];
    for (let i = 5; i <= 95; i += 10) res.push(hslToHex(h, s, i));
    setShades(res);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Color Shades &amp; Tints</h2>
        <input aria-label="Color Shades &amp; Tints" type="color" value={base} onChange={e => setBase(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
        <button onClick={generate} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Generate Shades</button>
        {shades.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {shades.map((c, i) => (
              <button key={i} className="w-10 h-10 rounded-lg text-xs" style={{ backgroundColor: c, color: i < 5 ? '#fff' : '#000' }}
                onClick={() => { clipboardWrite(c); toast.success('Copied!'); }} title={c} aria-label={`Copy color ${c}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ContrastRatioChecker() {
  const [fg, setFg] = useState('#ffffff');
  const [bg, setBg] = useState('#1e293b');

  const cr = useMemo(() => contrastRatio(fg, bg).toFixed(2), [fg, bg]);
  const crAA = parseFloat(cr) >= 4.5;
  const crAAA = parseFloat(cr) >= 7;
  const crAALarge = parseFloat(cr) >= 3;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Contrast Ratio Checker</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-1 block">Foreground</label>
            <input aria-label="Foreground" type="color" value={fg} onChange={e => setFg(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
          </div>
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-1 block">Background</label>
            <input aria-label="Background" type="color" value={bg} onChange={e => setBg(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
          </div>
        </div>
        <div className="p-3 rounded-lg text-center text-sm font-bold" style={{ color: fg, backgroundColor: bg }}>Sample Text Aa</div>
        <div className="space-y-1 text-sm">
          <p>Contrast Ratio: <strong>{cr}:1</strong></p>
          <p className={crAA ? 'text-emerald-500' : 'text-red-500'}>AA Normal: {crAA ? 'PASS' : 'FAIL'} (&#8805;4.5:1)</p>
          <p className={crAALarge ? 'text-emerald-500' : 'text-red-500'}>AA Large: {crAALarge ? 'PASS' : 'FAIL'} (&#8805;3:1)</p>
          <p className={crAAA ? 'text-emerald-500' : 'text-red-500'}>AAA Normal: {crAAA ? 'PASS' : 'FAIL'} (&#8805;7:1)</p>
        </div>
      </div>
    </div>
  );
}

export function MediaQueryGenerator() {
  const [width, setWidth] = useState('768');
  const [type, setType] = useState('min-width');
  const [device, setDevice] = useState('');
  const [output, setOutput] = useState('');

  const generate = () => {
    const d = device ? `screen and (${device})` : '';
    const w = width ? `${type}: ${width}px` : '';
    const cond = [d, w].filter(Boolean).join(' and ');
    setOutput(`@media ${cond} {\n  /* your styles */\n}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Media Query Generator</h2>
        <div className="grid grid-cols-2 gap-3">
          <select value={type} onChange={e => setType(e.target.value)}
            className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm">
            <option value="min-width">Min Width</option>
            <option value="max-width">Max Width</option>
          </select>
          <input type="number" value={width} onChange={e => setWidth(e.target.value)} placeholder="Width"
            className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm" />
        </div>
        <input type="text" value={device} onChange={e => setDevice(e.target.value)} placeholder="Device type (e.g. print, speech)"
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm" />
        <button onClick={generate} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Generate</button>
        {output && <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{output}</pre>}
      </div>
    </div>
  );
}

export function ConventionalCommitGenerator() {
  const [type, setType] = useState('feat');
  const [scope, setScope] = useState('');
  const [desc, setDesc] = useState('add user authentication');
  const [output, setOutput] = useState('');

  const generate = () => {
    const s = scope ? `(${scope})` : '';
    setOutput(`${type}${s}: ${desc}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Conventional Commit Generator</h2>
        <select value={type} onChange={e => setType(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm">
          {['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'ci', 'build'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input aria-label="Scope (optional)" type="text" value={scope} onChange={e => setScope(e.target.value)} placeholder="Scope (optional)"
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm" />
        <input aria-label="Description" type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description"
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm" />
        <button onClick={generate} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Generate</button>
        {output && (
          <div className="p-3 bg-[var(--bg-surface)] rounded-lg text-xs font-mono cursor-pointer" role="button" tabIndex={0} onClick={() => { clipboardWrite(output); toast.success('Copied!'); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clipboardWrite(output); toast.success('Copied!'); } }}>{output}</div>
        )}
      </div>
    </div>
  );
}

export function MarkdownTableGenerator() {
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(4);
  const [output, setOutput] = useState('');

  const generate = () => {
    let t = `| Header ${'| Header '.repeat(cols - 1)}|\n`;
    t += `| ${'--- |'.repeat(cols)}\n`;
    for (let i = 0; i < rows; i++) t += `| Cell ${'| Cell '.repeat(cols - 1)}|\n`;
    setOutput(t);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Markdown Table Generator</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-1 block">Columns</label>
            <input aria-label="Columns" type="number" value={cols} onChange={e => setCols(Math.max(1, parseInt(e.target.value) || 1))} min={1} max={10}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-1 block">Rows</label>
            <input aria-label="Rows" type="number" value={rows} onChange={e => setRows(Math.max(1, parseInt(e.target.value) || 1))} min={1} max={20}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <button onClick={generate} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Generate</button>
        {output && <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{output}</pre>}
      </div>
    </div>
  );
}

export function NginxConfigGenerator() {
  const [options, setOptions] = useState('server_name example.com;\nroot /var/www/html;\nindex index.html;');
  const [output, setOutput] = useState('');

  const generate = () => {
    setOutput(`server {\n  listen 80;\n  ${options.split('\n').map(l => l.trim()).filter(Boolean).join('\n  ')}\n}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Nginx Config Generator</h2>
        <textarea aria-label="Nginx Config Generator" rows={4} value={options} onChange={e => setOptions(e.target.value)} placeholder="One directive per line"
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={generate} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Generate</button>
        {output && <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{output}</pre>}
      </div>
    </div>
  );
}

export function IpAllowlistGenerator() {
  const [list, setList] = useState('192.168.1.0/24\n10.0.0.0/8');
  const [format, setFormat] = useState<'nginx' | 'apache' | 'iptables' | 'aws' | 'cloudflare'>('nginx');
  const [output, setOutput] = useState('');

  const generate = () => {
    const lines = list.split('\n').map(l => l.trim()).filter(Boolean);
    let out = '';
    switch (format) {
      case 'nginx':
        out = lines.map(l => `  allow ${l};`).join('\n') + '\n  deny all;';
        break;
      case 'apache':
        out = lines.map(l => `  Require ip ${l}`).join('\n') + '\n  Require all denied';
        break;
      case 'iptables':
        out = lines.map(l => `iptables -A INPUT -s ${l} -j ACCEPT`).join('\n') + '\niptables -A INPUT -j DROP';
        break;
      case 'aws':
        out = JSON.stringify({
          IpPermissions: [{
            IpProtocol: 'tcp',
            FromPort: 443,
            ToPort: 443,
            IpRanges: lines.map(l => ({ CidrIp: l, Description: 'Allowed IP' })),
          }],
        }, null, 2);
        break;
      case 'cloudflare':
        out = lines.map(l => `  "${l}": "allow"`).join(',\n');
        break;
    }
    setOutput(out);
  };

  const formats = [
    { key: 'nginx' as const, label: 'Nginx' },
    { key: 'apache' as const, label: 'Apache' },
    { key: 'iptables' as const, label: 'iptables' },
    { key: 'aws' as const, label: 'AWS SG' },
    { key: 'cloudflare' as const, label: 'Cloudflare' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">IP Allowlist Generator</h2>
        <p className="text-xs text-[var(--text-secondary)]">Generate firewall rules for Nginx, Apache, iptables, AWS Security Groups, or Cloudflare WAF from CIDR ranges.</p>
        <textarea aria-label="Generate firewall rules for Nginx, Apache, iptables, AWS Security Groups, or Clo" rows={4} value={list} onChange={e => setList(e.target.value)} placeholder="One CIDR per line (e.g. 192.168.1.0/24)"
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <div className="flex gap-1 flex-wrap">
          {formats.map(f => (
            <button key={f.key} onClick={() => { setFormat(f.key); setOutput(''); }}
              className={`px-3 py-1 text-xs rounded-lg border transition-colors ${format === f.key ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'border-[var(--border-subtle)]'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={generate} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Generate</button>
        {output && (
          <div className="relative">
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-64 overflow-y-auto">{output}</pre>
            <button onClick={() => { navigator.clipboard.writeText(output); toast.success('Copied!'); }}
              className="absolute top-2 right-2 text-xs bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded px-2 py-1 hover:bg-[var(--bg-overlay)]">
              Copy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

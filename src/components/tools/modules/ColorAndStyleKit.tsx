"use client";

import React, { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import DOMPurify from 'dompurify';

type Tab = 'color' | 'css' | 'generators';

const TABS: { key: Tab; label: string }[] = [
  { key: 'color', label: 'Color Tools' },
  { key: 'css', label: 'CSS & Media' },
  { key: 'generators', label: 'Generators' },
];

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
  let h = 0, s = 0, l = (max + min) / 2;
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

function simulateProtanopia(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  return `#${Math.round(0.567 * r + 0.433 * g).toString(16).padStart(2, '0')}${Math.round(0.558 * g + 0.442 * b).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}

function simulateDeuteranopia(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  return `#${Math.round(0.625 * r + 0.375 * g).toString(16).padStart(2, '0')}${Math.round(0.7 * g + 0.3 * b).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}

function simulateTritanopia(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(0.7 * g + 0.3 * b).toString(16).padStart(2, '0')}${Math.round(0.567 * b + 0.433 * r).toString(16).padStart(2, '0')}`;
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 ${className}`}>{children}</div>;
}

export default function ColorAndStyleKit() {
  const [tab, setTab] = useState<Tab>('color');

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${tab === t.key ? 'bg-blue-600 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}>{t.label}</button>
        ))}
      </div>
      {tab === 'color' && <ColorTools />}
      {tab === 'css' && <CssMediaTools />}
      {tab === 'generators' && <GeneratorTools />}
    </div>
  );
}

function ColorTools() {
  const [baseColor, setBaseColor] = useState('#3b82f6');
  const [fgColor, setFgColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#1e293b');
  const [bc, setBc] = useState('#3b82f6');
  const [shades, setShades] = useState<string[]>([]);
  const [tints, setTints] = useState<string[]>([]);
  const [palette, setPalette] = useState<string[]>([]);
  const [showSim, setShowSim] = useState('');

  const generateShades = () => {
    const { r, g, b } = hexToRgb(baseColor);
    const { h, s } = rgbToHsl(r, g, b);
    const res: string[] = [];
    for (let i = 5; i <= 95; i += 10) res.push(hslToHex(h, s, i));
    setShades(res);
  };

  const generateTints = () => {
    const { r, g, b } = hexToRgb(baseColor);
    const { h, s } = rgbToHsl(r, g, b);
    const res: string[] = [];
    for (let i = 5; i <= 95; i += 10) res.push(hslToHex(h, s, i));
    setTints(res);
  };

  const generatePalette = () => {
    const { r, g, b } = hexToRgb(bc);
    const { h } = rgbToHsl(r, g, b);
    const res = [
      bc,
      hslToHex((h + 30) % 360, 65, 55),
      hslToHex((h + 60) % 360, 70, 45),
      hslToHex((h + 120) % 360, 60, 60),
      hslToHex((h + 180) % 360, 55, 50),
      hslToHex((h + 210) % 360, 65, 40),
    ];
    setPalette(res);
  };

  const cr = useMemo(() => contrastRatio(fgColor, bgColor).toFixed(2), [fgColor, bgColor]);
  const crAA = parseFloat(cr) >= 4.5;
  const crAAA = parseFloat(cr) >= 7;
  const crAALarge = parseFloat(cr) >= 3;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-3">Color Palette Generator</h4>
        <div className="space-y-2">
          <input type="color" value={bc} onChange={e => setBc(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
          <button onClick={generatePalette} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Generate Palette</button>
          {palette.length > 0 && (
            <div className="flex gap-1 mt-2">
              {palette.map((c, i) => (
                <div key={i} className="flex-1 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: c }}
                  onClick={() => { navigator.clipboard.writeText(c); toast.success('Copied!'); }}>
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-3">Color Shades & Tints</h4>
        <div className="space-y-2">
          <input type="color" value={baseColor} onChange={e => setBaseColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
          <div className="grid grid-cols-2 gap-2">
            <button onClick={generateShades} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Shades</button>
            <button onClick={generateTints} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Tints</button>
          </div>
          {shades.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {shades.map((c, i) => (
                <button key={i} className="w-8 h-8 rounded-lg text-xs" style={{ backgroundColor: c, color: i < 5 ? '#fff' : '#000' }}
                  onClick={() => { navigator.clipboard.writeText(c); toast.success('Copied!'); }} title={c} />
              ))}
            </div>
          )}
          {tints.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {tints.map((c, i) => (
                <button key={i} className="w-8 h-8 rounded-lg text-xs" style={{ backgroundColor: c, color: i > 5 ? '#fff' : '#000' }}
                  onClick={() => { navigator.clipboard.writeText(c); toast.success('Copied!'); }} title={c} />
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-3">Contrast Ratio Checker</h4>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-zinc-400">Foreground</label><input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" /></div>
          <div><label className="text-xs text-zinc-400">Background</label><input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" /></div>
        </div>
        <div className="mt-3 p-3 rounded-lg text-center text-sm font-bold" style={{ color: fgColor, backgroundColor: bgColor }}>Sample Text Aa</div>
        <div className="mt-2 space-y-1 text-xs">
          <p>Contrast Ratio: <strong>{cr}:1</strong></p>
          <p className={crAA ? 'text-emerald-500' : 'text-red-500'}>AA Normal: {crAA ? 'PASS' : 'FAIL'} (≥4.5:1)</p>
          <p className={crAALarge ? 'text-emerald-500' : 'text-red-500'}>AA Large: {crAALarge ? 'PASS' : 'FAIL'} (≥3:1)</p>
          <p className={crAAA ? 'text-emerald-500' : 'text-red-500'}>AAA Normal: {crAAA ? 'PASS' : 'FAIL'} (≥7:1)</p>
        </div>
      </Card>

      <Card>
        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-3">Color Blindness Simulator</h4>
        <input type="color" value={showSim || baseColor} onChange={e => setShowSim(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
        {showSim && (
          <div className="mt-3 grid grid-cols-3 gap-3">
            {[
              { label: 'Protanopia', fn: simulateProtanopia },
              { label: 'Deuteranopia', fn: simulateDeuteranopia },
              { label: 'Tritanopia', fn: simulateTritanopia },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="h-8 rounded-lg mb-1" style={{ backgroundColor: s.fn(showSim) }} />
                <span className="text-xs text-zinc-400">{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function CssMediaTools() {
  const [mqWidth, setMqWidth] = useState('768');
  const [mqType, setMqType] = useState('min-width');
  const [mqDevice, setMqDevice] = useState('');
  const [mqOutput, setMqOutput] = useState('');
  const [cssInput, setCssInput] = useState('.btn { color: red; font-weight: bold; }\n.nav { display: flex; gap: 10px; }');
  const [scssOutput, setScssOutput] = useState('');

  const generateMQ = () => {
    const device = mqDevice ? `screen and (${mqDevice})` : '';
    const width = mqWidth ? `${mqType}: ${mqWidth}px` : '';
    const cond = [device, width].filter(Boolean).join(' and ');
    setMqOutput(`@media ${cond} {\n  /* your styles */\n}`);
  };

  const convertCssToScss = () => {
    const res = cssInput
      .replace(/\n{2,}/g, '\n')
      .replace(/, /g, ',\n  ');
    setScssOutput(res);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-3">Media Query Generator</h4>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <select value={mqType} onChange={e => setMqType(e.target.value)} className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm">
              <option value="min-width">Min Width</option>
              <option value="max-width">Max Width</option>
            </select>
            <input type="number" value={mqWidth} onChange={e => setMqWidth(e.target.value)} placeholder="Width" className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
          </div>
          <input type="text" value={mqDevice} onChange={e => setMqDevice(e.target.value)} placeholder="Device type (e.g. print, speech, optional)" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
          <button onClick={generateMQ} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Generate</button>
          {mqOutput && <textarea readOnly rows={4} value={mqOutput} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono outline-none" />}
        </div>
      </Card>

      <Card>
        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-3">CSS → SCSS Converter</h4>
        <textarea rows={3} value={cssInput} onChange={e => setCssInput(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={convertCssToScss} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Convert</button>
        {scssOutput && <textarea readOnly rows={3} value={scssOutput} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
      </Card>
    </div>
  );
}

function GeneratorTools() {
  const [commitMsg, setCommitMsg] = useState('feat: add user authentication');
  const [commitType, setCommitType] = useState('feat');
  const [commitScope, setCommitScope] = useState('');
  const [commitDesc, setCommitDesc] = useState('add user authentication');
  const [commitOutput, setCommitOutput] = useState('');

  const [mdCols, setMdCols] = useState(3);
  const [mdRows, setMdRows] = useState(4);
  const [mdTable, setMdTable] = useState('');

  const [ngOptions, setNgOptions] = useState('server_name example.com;\nroot /var/www/html;\nindex index.html;');
  const [ngOutput, setNgOutput] = useState('');

  const [ipList, setIpList] = useState('192.168.1.0/24\n10.0.0.0/8');
  const [ipOutput, setIpOutput] = useState('');

  const generateCommit = () => {
    const scope = commitScope ? `(${commitScope})` : '';
    setCommitMsg(`${commitType}${scope}: ${commitDesc}`);
  };

  const generateMdTable = () => {
    let t = `| Header ${'| Header '.repeat(mdCols - 1)}|\n`;
    t += `| ${'--- |'.repeat(mdCols)}\n`;
    for (let i = 0; i < mdRows; i++) {
      t += `| Cell ${'| Cell '.repeat(mdCols - 1)}|\n`;
    }
    setMdTable(t);
  };

  const generateNginx = () => {
    setNgOutput(`server {\n  listen 80;\n  ${ngOptions.split('\n').map(l => l.trim()).filter(Boolean).join('\n  ')}\n}`);
  };

  const generateIpAllowlist = () => {
    const lines = ipList.split('\n').filter(Boolean);
    const allow = lines.map(l => `  allow ${l.trim()};`).join('\n');
    setIpOutput(`${allow}\n  deny all;`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-3">Conventional Commit Generator</h4>
        <div className="space-y-2">
          <select value={commitType} onChange={e => setCommitType(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm">
            {['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'ci', 'build'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="text" value={commitScope} onChange={e => setCommitScope(e.target.value)} placeholder="Scope (optional)" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
          <input type="text" value={commitDesc} onChange={e => setCommitDesc(e.target.value)} placeholder="Description" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
          <button onClick={generateCommit} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Generate</button>
          {commitMsg && <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-mono cursor-pointer" onClick={() => { navigator.clipboard.writeText(commitMsg); toast.success('Copied!'); }}>{commitMsg}</div>}
        </div>
      </Card>

      <Card>
        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-3">Markdown Table Generator</h4>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input type="number" value={mdCols} onChange={e => setMdCols(Math.max(1, parseInt(e.target.value) || 1))} min={1} max={10} placeholder="Columns" className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
          <input type="number" value={mdRows} onChange={e => setMdRows(Math.max(1, parseInt(e.target.value) || 1))} min={1} max={20} placeholder="Rows" className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button onClick={generateMdTable} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Generate</button>
        {mdTable && <textarea readOnly rows={5} value={mdTable} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
      </Card>

      <Card>
        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-3">Nginx Config Generator</h4>
        <textarea rows={4} value={ngOptions} onChange={e => setNgOptions(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={generateNginx} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Generate</button>
        {ngOutput && <textarea readOnly rows={6} value={ngOutput} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
      </Card>

      <Card>
        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-3">IP Allowlist Generator</h4>
        <textarea rows={4} value={ipList} onChange={e => setIpList(e.target.value)} placeholder="One CIDR per line" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={generateIpAllowlist} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Generate</button>
        {ipOutput && <textarea readOnly rows={6} value={ipOutput} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
      </Card>
    </div>
  );
}

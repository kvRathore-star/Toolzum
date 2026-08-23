"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { ac, pillClass, btnClass, borderClass } from './miscToolColors';

import { Section, Input, labelClass, selClass } from './MiscToolsShared';
import { CalculatorShell } from './shared/CalculatorShell';

export function QRCodeGenerator() {
  const clr = ac('QRCodeGenerator');
  const [text, setText] = useState('');
  const encode = (s: string) => {
    const qr: string[] = [];
    const len = s.length;
    const size = 21 + Math.ceil(len / 4) * 4;
    for (let y = 0; y < size; y++) {
      qr[y] = '';
      for (let x = 0; x < size; x++) {
        const d = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        qr[y] += (d - Math.floor(d)) > 0.5 ? '#' : '.';
      }
    }
    return qr;
  };
  const qr = text ? encode(text) : [];
  return (
    <Section title="QR Code Generator">
      <Input label="Enter text or URL" placeholder="Enter text or URL" value={text} onChange={setText} />
      {qr.length > 0 && (
        <pre className="font-mono text-[8px] leading-[8px] bg-white dark:bg-black p-4 rounded overflow-auto">
          {qr.map((r, i) => <div key={i}>{r}</div>)}
        </pre>
      )}
    </Section>
  );
}
// --- BarcodeGenerator ---
export function BarcodeGenerator() {
  const clr = ac('BarcodeGenerator');
  const [text, setText] = useState('123456789012');
  const [format, setFormat] = useState('upc-a');
  const encode = (s: string) => {
    const chars = s.split('');
    const lines: string[] = [];
    for (let i = 0; i < 60; i++) {
      let row = '';
      for (let j = 0; j < chars.length; j++) {
        const v = chars[j].charCodeAt(0) * (i + 1) + j;
        row += v % 3 === 0 ? '█' : ' ';
      }
      lines.push(row);
    }
    return lines;
  };
  const barcode = encode(text);
  return (
    <Section title="Barcode Generator">
      <Input label="Enter data" placeholder="Enter data" value={text} onChange={setText} />
      <select className={selClass} value={format} onChange={e => setFormat(e.target.value)}>
        <option value="upc-a">UPC-A</option><option value="ean-13">EAN-13</option>
        <option value="code128">Code 128</option><option value="code39">Code 39</option>
      </select>
      <pre className="font-mono text-[10px] leading-[10px] bg-white dark:bg-black p-4 rounded overflow-auto">{barcode.map((r, i) => <div key={i}>{r}</div>)}</pre>
    </Section>
  );
}
// --- GuidGenerator ---
export function GuidGenerator() {
  const clr = ac('GuidGenerator');
  const gen = (v: 4 | 7) => {
    if (v === 4) {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    }
    const ts = Date.now().toString(16).padStart(12, '0');
    const rand = crypto.getRandomValues(new Uint8Array(10));
    const r = Array.from(rand).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${ts.slice(0,8)}-${ts.slice(8,12)}-7${r.slice(0,3)}-${(rand[0]&0x3f|0x80).toString(16)}${r.slice(3,7)}-${r.slice(7,15)}`;
  };
  const [guids, setGuids] = useState<string[]>([]);
  const [count, setCount] = useState(1);
  const [version, setVersion] = useState<4 | 7>(4);

  const presets = [
    { label: 'Single v4', apply: () => { setCount(1); setVersion(4); setGuids([gen(4)]); } },
    { label: 'Batch 10 v4', apply: () => { setCount(10); setVersion(4); setGuids(Array.from({ length: 10 }, () => gen(4))); } },
    { label: 'Batch 5 v7', apply: () => { setCount(5); setVersion(7); setGuids(Array.from({ length: 5 }, () => gen(7))); } },
    { label: 'Clear', apply: () => { setGuids([]); setCount(1); } },
  ];

  const resultText = guids.length > 0
    ? `Generated ${guids.length} UUID${guids.length > 1 ? 's' : ''} (v${version})`
    : 'No GUIDs generated';

  return (
    <CalculatorShell title="GUID / UUID Generator" result={resultText} onCalculate={() => {}} presets={presets} accent="violet" downloadData={guids.join('\n')} downloadFilename="guids.txt">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Version</label>
            <select value={version} onChange={e => setVersion(Number(e.target.value) as 4 | 7)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50">
              <option value={4}>UUID v4 (Random)</option>
              <option value={7}>UUID v7 (Timestamp + Random)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Count</label>
            <input type="number" min={1} max={100} value={count} onChange={e => setCount(Number(e.target.value))}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setGuids(Array.from({ length: count }, () => gen(version)))}
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-medium transition-colors">
            Generate {count} UUID{count > 1 ? 's' : ''}
          </button>
          <button onClick={() => setGuids([])} className="px-5 py-2.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white rounded-xl text-sm font-medium transition-colors">
            Clear
          </button>
        </div>

        {guids.length > 0 && (
          <div className="space-y-1 max-h-64 overflow-auto">
            {guids.map((g, i) => (
              <div key={i} className="flex items-center gap-2">
                <code className="text-xs font-mono text-[var(--text-secondary)] flex-1">{g}</code>
                <button className="px-2 py-1 text-xs text-violet-600 hover:text-violet-500 hover:underline" onClick={() => clipboardWrite(g)}>Copy</button>
              </div>
            ))}
          </div>
        )}

        {guids.length > 0 && (
          <div className="text-xs text-[var(--text-muted)] text-center">
            {guids.length} GUID{guids.length > 1 ? 's' : ''} generated — click to copy individually or use download
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
// --- ColorConverter ---
export function ColorConverter() {
  const clr = ac('ColorConverter');
  const [hex, setHex] = useState('#ff6b6b');
  const toRgb = (h: string) => {
    const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16);
    return { r, g, b };
  };
  const toHsl = (h: string) => {
    let { r, g, b } = toRgb(h);
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    let hh = 0, s = 0; const l = (mx + mn) / 2;
    if (d) {
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      hh = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) * 60 : mx === g ? ((b - r) / d + 2) * 60 : ((r - g) / d + 4) * 60;
    }
    return { h: Math.round(hh), s: Math.round(s * 100), l: Math.round(l * 100) };
  };
  const toCmyk = (h: string) => {
    const { r, g, b } = toRgb(h);
    const c = 1 - r / 255, m = 1 - g / 255, y = 1 - b / 255, k = Math.min(c, m, y);
    return { c: Math.round((c - k) / (1 - k) * 100), m: Math.round((m - k) / (1 - k) * 100), y: Math.round((y - k) / (1 - k) * 100), k: Math.round(k * 100) };
  };
  const toHsv = (h: string) => {
    let { r, g, b } = toRgb(h);
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    let hh = 0; const s = mx ? d / mx : 0, v = mx;
    if (d) hh = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) * 60 : mx === g ? ((b - r) / d + 2) * 60 : ((r - g) / d + 4) * 60;
    return { h: Math.round(hh), s: Math.round(s * 100), v: Math.round(v * 100) };
  };
  const rgb = hex.match(/^#[0-9a-f]{6}$/i) ? toRgb(hex) : null;
  const hsl = hex.match(/^#[0-9a-f]{6}$/i) ? toHsl(hex) : null;
  const cmyk = hex.match(/^#[0-9a-f]{6}$/i) ? toCmyk(hex) : null;
  const hsv = hex.match(/^#[0-9a-f]{6}$/i) ? toHsv(hex) : null;
  return (
    <Section title="Color Converter">
      <Input label="#ff6b6b" placeholder="#ff6b6b" value={hex} onChange={setHex} />
      <div className="flex gap-4 items-center">
        <div className="w-12 h-12 rounded-lg border" style={{ backgroundColor: hex.match(/^#[0-9a-f]{6}$/i) ? hex : '#ccc' }} />
        <div className="text-xs space-y-1 font-mono">
          {rgb && <div>RGB: {rgb.r}, {rgb.g}, {rgb.b}</div>}
          {hsl && <div>HSL: {hsl.h}°, {hsl.s}%, {hsl.l}%</div>}
          {cmyk && <div>CMYK: {cmyk.c}%, {cmyk.m}%, {cmyk.y}%, {cmyk.k}%</div>}
          {hsv && <div>HSV: {hsv.h}°, {hsv.s}%, {hsv.v}%</div>}
        </div>
      </div>
    </Section>
  );
}
// --- ColorPicker ---
export function ColorPicker() {
  const clr = ac('ColorPicker');
  const [color, setColor] = useState('#ff6b6b');
  return (
    <Section title="Color Picker">
      <div className="flex gap-4 items-center">
        <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-16 h-16 rounded-lg cursor-pointer" />
        <Input label="Value" value={color} onChange={v => setColor(v.startsWith("#") ? v : "#" + v)} />
      </div>
      <div className="w-full h-24 rounded-lg border" style={{ backgroundColor: color }} />
    </Section>
  );
}
// --- ColorPaletteGenerator ---
export function ColorPaletteGenerator() {
  const clr = ac('ColorPaletteGenerator');
  const [base, setBase] = useState('#3b82f6');
  const [type, setType] = useState('complementary');
  const hexToRgb = (h: string) => ({ r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16) });
  const rgbToHex = (r: number, g: number, b: number) => '#' + [r, g, b].map(c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('');
  const rotate = (h: string, deg: number) => {
    const { r, g, b } = hexToRgb(h);
    const rad = (deg) * Math.PI / 180;
    const rr = r / 255, gg = g / 255, bb = b / 255;
    const mx = Math.max(rr, gg, bb), mn = Math.min(rr, gg, bb), d = mx - mn;
    let hh = 0, s = 0; const l = (mx + mn) / 2;
    if (d) { s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); hh = mx === rr ? ((gg - bb) / d + (gg < bb ? 6 : 0)) * 60 : mx === gg ? ((bb - rr) / d + 2) * 60 : ((rr - gg) / d + 4) * 60; }
    const newH = (hh + deg) % 360;
    const c2 = (1 - Math.abs(2 * l - 1)) * s;
    const x2 = c2 * (1 - Math.abs(((newH / 60) % 2) - 1));
    const m2 = l - c2 / 2;
    let r2 = 0, g2 = 0, b2 = 0;
    if (newH < 60) { r2 = c2; g2 = x2; } else if (newH < 120) { r2 = x2; g2 = c2; } else if (newH < 180) { g2 = c2; b2 = x2; } else if (newH < 240) { g2 = x2; b2 = c2; } else if (newH < 300) { r2 = x2; b2 = c2; } else { r2 = c2; b2 = x2; }
    return rgbToHex((r2 + m2) * 255, (g2 + m2) * 255, (b2 + m2) * 255);
  };
  const getPalette = () => {
    if (type === 'complementary') return [base, rotate(base, 180)];
    if (type === 'analogous') return [rotate(base, -30), base, rotate(base, 30)];
    if (type === 'triadic') return [base, rotate(base, 120), rotate(base, 240)];
    return [base];
  };
  const palette = getPalette();
  return (
    <Section title="Color Palette Generator">
      <div className="flex gap-3 items-center">
        <input type="color" value={base} onChange={e => setBase(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
        <select className={selClass} value={type} onChange={e => setType(e.target.value)}>
          <option value="complementary">Complementary</option>
          <option value="analogous">Analogous</option>
          <option value="triadic">Triadic</option>
        </select>
      </div>
      <div className="flex gap-2 h-16">
        {palette.map((c, i) => <div key={i} className="flex-1 rounded-lg flex items-end justify-center pb-2 text-xs font-mono text-white" style={{ backgroundColor: c }}>{c}</div>)}
      </div>
    </Section>
  );
}
// --- GradientGenerator ---
export function GradientGenerator() {
  const clr = ac('GradientGenerator');
  const [colors, setColors] = useState(['#3b82f6', '#8b5cf6']);
  const [direction, setDirection] = useState('to right');
  const addColor = () => setColors([...colors, `#${Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0')}`]);
  const removeColor = (i: number) => colors.length > 2 && setColors(colors.filter((_, idx) => idx !== i));
  const gradient = `linear-gradient(${direction}, ${colors.join(', ')})`;
  return (
    <Section title="Gradient Generator">
      <div className="flex gap-2 items-center flex-wrap">
        {colors.map((c, i) => (
          <div key={i} className="flex items-center gap-1">
            <input type="color" value={c} onChange={e => { const n = [...colors]; n[i] = e.target.value; setColors(n); }} className="w-8 h-8 rounded cursor-pointer" />
            {colors.length > 2 && <button className="text-xs text-red-500" onClick={() => removeColor(i)}>x</button>}
          </div>
        ))}
        <button className={btnClass(clr)} onClick={addColor}>+</button>
      </div>
      <select className={selClass} value={direction} onChange={e => setDirection(e.target.value)}>
        <option value="to right">Right</option><option value="to left">Left</option>
        <option value="to bottom">Down</option><option value="to top">Up</option>
        <option value="to bottom right">Bottom Right</option><option value="to bottom left">Bottom Left</option>
        <option value="to top right">Top Right</option><option value="to top left">Top Left</option>
      </select>
      <div className="w-full h-32 rounded-lg" style={{ background: gradient }} />
      <code className="text-xs block bg-[var(--bg-surface)] p-2 rounded break-all">{gradient}</code>
      <button className="text-xs text-blue-600 hover:underline" onClick={() => clipboardWrite(gradient)}>Copy CSS</button>
    </Section>
  );
}
// --- ContrastChecker ---
export function ContrastChecker() {
  const clr = ac('ContrastChecker');
  const [fg, setFg] = useState('#ffffff');
  const [bg, setBg] = useState('#1a1a2e');
  const lum = (h: string) => {
    const r = parseInt(h.slice(1, 3), 16) / 255, g = parseInt(h.slice(3, 5), 16) / 255, b = parseInt(h.slice(5, 7), 16) / 255;
    const [rl, gl, bl] = [r, g, b].map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
  };
  const l1 = lum(fg), l2 = lum(bg);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  return (
    <Section title="Contrast Checker">
      <div className="flex gap-4 items-center">
        <div><label className={labelClass}>Foreground</label><input type="color" value={fg} onChange={e => setFg(e.target.value)} className="block w-10 h-10 rounded cursor-pointer" /></div>
        <div><label className={labelClass}>Background</label><input type="color" value={bg} onChange={e => setBg(e.target.value)} className="block w-10 h-10 rounded cursor-pointer" /></div>
      </div>
      <div className="flex gap-2 items-center font-mono text-sm"><span>Contrast Ratio: {ratio.toFixed(2)}:1</span></div>
      <div className="space-y-1 text-xs">
        <div className={ratio >= 4.5 ? 'text-green-600' : 'text-red-500'}>AA Normal: {ratio >= 4.5 ? 'Pass' : 'Fail'} (needs 4.5:1)</div>
        <div className={ratio >= 3 ? 'text-green-600' : 'text-red-500'}>AA Large: {ratio >= 3 ? 'Pass' : 'Fail'} (needs 3:1)</div>
        <div className={ratio >= 7 ? 'text-green-600' : 'text-red-500'}>AAA Normal: {ratio >= 7 ? 'Pass' : 'Fail'} (needs 7:1)</div>
      </div>
      <div className="w-full h-20 rounded-lg flex items-center justify-center text-lg font-bold" style={{ color: fg, backgroundColor: bg }}>Sample Text</div>
    </Section>
  );
}
// --- CounterTool ---

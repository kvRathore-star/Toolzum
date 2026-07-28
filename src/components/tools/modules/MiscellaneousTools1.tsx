"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full bg-[var(--bg-overlay)] rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] p-6">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", rows, min, max, step }: {
  label: string; value: string | number; onChange: (v: any) => void; placeholder?: string; type?: string; rows?: number; min?: number; max?: number; step?: string;
}) {
  const cls = "w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50";
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>
      {rows ? (
        <textarea className={cls + " resize-y"} rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input className={cls} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} min={min} max={max} step={step} />
      )}
    </div>
  );
}

const colors = ['rose', 'emerald', 'violet', 'amber', 'cyan', 'orange', 'teal', 'pink', 'indigo', 'lime', 'sky', 'fuchsia', 'purple', 'red', 'green', 'yellow', 'stone', 'slate', 'zinc', 'neutral'];
let colorIdx = 0;
function nextColor() { const c = colors[colorIdx % colors.length]; colorIdx++; return c; }
const colorMap: Record<string, string> = {};

function ac(tool: string) {
  if (!colorMap[tool]) colorMap[tool] = nextColor();
  return colorMap[tool];
}

function pillClass(c: string) { return `inline-block px-3 py-1 rounded-full text-xs font-medium cursor-pointer bg-${c}-500/10 text-${c}-600 dark:text-${c}-400 hover:bg-${c}-500/20 border border-${c}-500/20 transition-colors`; }
function btnClass(c: string) { return `bg-${c}-500 hover:bg-${c}-600 text-white rounded-xl text-sm font-medium transition-colors px-4 py-2.5 disabled:opacity-50`; }
function borderClass(c: string) { return `border-l-4 border-${c}-400 pl-3`; }

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = useCallback(async () => {
    await clipboardWrite(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);
  return (
    <button onClick={handle} className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors ml-2 shrink-0">
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

const labelClass = "block text-sm font-medium text-[var(--text-secondary)] mb-1.5";
const selClass = "w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50";
// --- QRCodeGenerator ---
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
  return (
    <Section title="GUID / UUID Generator">
      <div className="flex gap-2">
        <button className={btnClass(clr)} onClick={() => setGuids([gen(4), ...guids.slice(0, 9)])}>Generate UUID v4</button>
        <button className={btnClass(clr)} onClick={() => setGuids([gen(7), ...guids.slice(0, 9)])}>Generate UUID v7</button>
        <button className={btnClass(clr)} onClick={() => setGuids([])}>Clear</button>
      </div>
      <div className="space-y-1 max-h-64 overflow-auto">
        {guids.map((g, i) => (
          <div key={i} className="flex items-center gap-2">
            <code className="text-xs font-mono text-[var(--text-secondary)] flex-1">{g}</code>
            <button className="text-xs text-blue-600 hover:underline" onClick={() => clipboardWrite(g)}>Copy</button>
          </div>
        ))}
      </div>
    </Section>
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
    let hh = 0, s = 0, l = (mx + mn) / 2;
    if (d) {
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      hh = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) * 60 : mx === g ? ((b - r) / d + 2) * 60 : ((r - g) / d + 4) * 60;
    }
    return { h: Math.round(hh), s: Math.round(s * 100), l: Math.round(l * 100) };
  };
  const toCmyk = (h: string) => {
    let { r, g, b } = toRgb(h);
    const c = 1 - r / 255, m = 1 - g / 255, y = 1 - b / 255, k = Math.min(c, m, y);
    return { c: Math.round((c - k) / (1 - k) * 100), m: Math.round((m - k) / (1 - k) * 100), y: Math.round((y - k) / (1 - k) * 100), k: Math.round(k * 100) };
  };
  const toHsv = (h: string) => {
    let { r, g, b } = toRgb(h);
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    let hh = 0, s = mx ? d / mx : 0, v = mx;
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
    let hh = 0, s = 0, l = (mx + mn) / 2;
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
export function CounterTool() {
  const clr = ac('CounterTool');
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  return (
    <Section title="Counter">
      <div className="text-4xl font-bold text-center text-[var(--text-primary)]">{count}</div>
      <div className="flex gap-2 justify-center">
        <button className={btnClass(clr)} onClick={() => { setHistory(h => [count, ...h.slice(0, 19)]); setCount(c => c - 1); }}>-</button>
        <button className={btnClass(clr)} onClick={() => { setCount(0); setHistory([]); }}>Reset</button>
        <button className={btnClass(clr)} onClick={() => { setHistory(h => [count, ...h.slice(0, 19)]); setCount(c => c + 1); }}>+</button>
      </div>
      {history.length > 0 && <div className="text-xs text-[var(--text-secondary)] max-h-24 overflow-auto"><div className="font-medium mb-1">History:</div>{history.map((h, i) => <span key={i} className="mr-2">{h}</span>)}</div>}
    </Section>
  );
}
// --- ListRandomizer ---
export function ListRandomizer() {
  const clr = ac('ListRandomizer');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string[]>([]);
  const randomize = () => {
    const items = input.split('\n').map(s => s.trim()).filter(Boolean);
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setResult(shuffled);
  };
  return (
    <Section title="List Randomizer">
      <Input label="Enter items (one per line)" value={input} onChange={setInput} rows={5} />
      <button className={btnClass(clr)} onClick={randomize}>Randomize</button>
      {result.length > 0 && <div className="text-sm space-y-1">{result.map((item, i) => <div key={i} className="bg-[var(--bg-surface)] px-3 py-1 rounded">{i + 1}. {item}</div>)}</div>}
    </Section>
  );
}
// --- ListSorter ---
export function ListSorter() {
  const clr = ac('ListSorter');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string[]>([]);
  const sort = (mode: 'az' | 'za' | 'len') => {
    const items = input.split('\n').map(s => s.trim()).filter(Boolean);
    if (mode === 'az') items.sort();
    else if (mode === 'za') items.sort().reverse();
    else items.sort((a, b) => a.length - b.length);
    setResult(items);
  };
  return (
    <Section title="List Sorter">
      <Input label="Enter items (one per line)" value={input} onChange={setInput} rows={5} />
      <div className="flex gap-2">
        <button className={btnClass(clr)} onClick={() => sort('az')}>A-Z</button>
        <button className={btnClass(clr)} onClick={() => sort('za')}>Z-A</button>
        <button className={btnClass(clr)} onClick={() => sort('len')}>By Length</button>
      </div>
      {result.length > 0 && <div className="text-sm space-y-1">{result.map((item, i) => <div key={i} className="bg-[var(--bg-surface)] px-3 py-1 rounded">{i + 1}. {item}</div>)}</div>}
    </Section>
  );
}
// --- DecisionMaker ---
export function DecisionMaker() {
  const clr = ac('DecisionMaker');
  const [options, setOptions] = useState('');
  const [choice, setChoice] = useState('');
  const [spinning, setSpinning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pick = () => {
    const items = options.split('\n').map(s => s.trim()).filter(Boolean);
    if (items.length === 0) return;
    setSpinning(true);
    let i = 0;
    const interval = setInterval(() => {
      setChoice(items[i % items.length]);
      i++;
      if (i > items.length * 5) { clearInterval(interval); setSpinning(false); setChoice(items[Math.floor(Math.random() * items.length)]); }
    }, 80);
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !choice) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cx = canvas.width / 2, cy = canvas.height / 2, r = 70;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(choice, cx, cy);
  }, [choice]);
  return (
    <Section title="Decision Maker">
      <Input label="Enter options (one per line)" value={options} onChange={setOptions} rows={5} />
      <button className={btnClass(clr)} onClick={pick} disabled={spinning}>{spinning ? 'Spinning...' : 'Pick One'}</button>
      <div className="flex justify-center"><canvas ref={canvasRef} width={160} height={160} className="max-w-full" /></div>
    </Section>
  );
}
// --- YesNoPicker ---
export function YesNoPicker() {
  const clr = ac('YesNoPicker');
  const [result, setResult] = useState('');
  const outcomes = ['Yes', 'No', 'Maybe', 'Ask again later', 'Definitely', "Don't count on it", 'Absolutely', 'Very doubtful', 'Outlook good', 'Cannot predict now'];
  const pick = () => {
    let i = 0;
    const interval = setInterval(() => { setResult(outcomes[i % outcomes.length]); i++; if (i > outcomes.length * 3) clearInterval(interval); }, 80);
  };
  return (
    <Section title="Yes / No / Maybe">
      <div className="text-center">
        <div className="text-5xl font-bold mb-4 text-blue-600 h-16">{result}</div>
        <button className={btnClass(clr)} onClick={pick}>Ask</button>
      </div>
    </Section>
  );
}
// --- CoinFlipper ---
export function CoinFlipper() {
  const clr = ac('CoinFlipper');
  const [side, setSide] = useState('');
  const [animating, setAnimating] = useState(false);
  const flip = () => {
    setAnimating(true);
    let i = 0;
    const interval = setInterval(() => { setSide(i % 2 === 0 ? 'Heads' : 'Tails'); i++; if (i > 8) { clearInterval(interval); setAnimating(false); setSide(Math.random() > 0.5 ? 'Heads' : 'Tails'); } }, 100);
  };
  return (
    <Section title="Coin Flipper">
      <div className="text-center">
        <div className={'text-6xl mb-4' + (animating ? ' animate-spin' : '')}>&#x1FA99;</div>
        <div className="text-2xl font-bold mb-4 h-8">{side}</div>
        <button className={btnClass(clr)} onClick={flip} disabled={animating}>Flip Coin</button>
      </div>
    </Section>
  );
}
// --- DiceRollerTool ---
export function DiceRollerTool() {
  const clr = ac('DiceRollerTool');
  const [sides, setSides] = useState(6);
  const [result, setResult] = useState<number | null>(null);
  const roll = () => setResult(Math.floor(Math.random() * sides) + 1);
  return (
    <Section title="Dice Roller (Custom)">
      <div className="flex gap-3 items-center">
        <label className="text-sm">Sides:</label>
        <Input label="Value" type="number" min={2} max={100} value={sides} onChange={v => setSides(Number(v))} />
        <button className={btnClass(clr)} onClick={roll}>Roll</button>
      </div>
      {result !== null && <div className="text-5xl font-bold text-center text-blue-600">{result}</div>}
    </Section>
  );
}
// --- NumberGuessingGame ---
export function NumberGuessingGame() {
  const clr = ac('NumberGuessingGame');
  const target = useRef(Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = useState('');
  const [hints, setHints] = useState<string[]>([]);
  const [won, setWon] = useState(false);
  const check = () => {
    const n = Number(guess);
    if (!n || n < 1 || n > 100) return;
    if (n === target.current) { setWon(true); setHints(h => [...h, n + ' - Correct!']); }
    else setHints(h => [...h, n + ' - ' + (n < target.current ? 'Too low' : 'Too high')]);
  };
  return (
    <Section title="Number Guessing Game">
      <p className="text-sm text-[var(--text-secondary)]">Guess a number between 1 and 100</p>
      <div className="flex gap-2">
        <Input label="Value" type="number" min={1} max={100} value={guess} onChange={setGuess} />
        <button className={btnClass(clr)} onClick={check} disabled={won}>Guess</button>
      </div>
      {won && <div className="text-green-600 font-bold text-lg">You won in {hints.length} guesses!</div>}
      <div className="text-xs space-y-1 max-h-32 overflow-auto">{hints.map((h, i) => <div key={i} className={h.includes('Correct') ? 'text-green-600' : ''}>{h}</div>)}</div>
    </Section>
  );
}
// --- RockPaperScissors ---
export function RockPaperScissors() {
  const clr = ac('RockPaperScissors');
  const [player, setPlayer] = useState('');
  const [computer, setComputer] = useState('');
  const [result, setResult] = useState('');
  const choices = ['Rock', 'Paper', 'Scissors'];
  const play = (p: string) => {
    const c = choices[Math.floor(Math.random() * 3)];
    setPlayer(p);
    setComputer(c);
    if (p === c) setResult('Draw');
    else if ((p === 'Rock' && c === 'Scissors') || (p === 'Paper' && c === 'Rock') || (p === 'Scissors' && c === 'Paper')) setResult('You Win!');
    else setResult('Computer Wins');
  };
  return (
    <Section title="Rock Paper Scissors">
      <div className="flex gap-2 justify-center">
        {choices.map(c => <button className={btnClass(clr)} key={c} onClick={() => play(c)}>{c}</button>)}
      </div>
      {player && <div className="text-center text-sm"><div>You: {player}</div><div>Computer: {computer}</div><div className="text-lg font-bold mt-2">{result}</div></div>}
    </Section>
  );
}
// --- HangmanGame ---
export function HangmanGame() {
  const clr = ac('HangmanGame');
  const words = ['react', 'typescript', 'javascript', 'hangman', 'developer', 'coding', 'puzzle', 'computer', 'python', 'rust'];
  const word = useRef(words[Math.floor(Math.random() * words.length)]);
  const [guessed, setGuessed] = useState<string[]>([]);
  const [wrong, setWrong] = useState(0);
  const display = word.current.split('').map(l => guessed.includes(l) ? l : '_').join(' ');
  const guess = (l: string) => {
    if (guessed.includes(l)) return;
    setGuessed([...guessed, l]);
    if (!word.current.includes(l)) setWrong(w => w + 1);
  };
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  return (
    <Section title="Hangman Game">
      <div className="text-2xl font-mono tracking-widest text-center mb-4">{display}</div>
      <div className="text-sm text-red-500 mb-2">Wrong: {wrong}/6</div>
      <div className="flex flex-wrap gap-1 justify-center max-w-xs mx-auto">
        {alphabet.map(l => (
          <button key={l} disabled={guessed.includes(l) || wrong >= 6 || !display.includes('_')}
            className={'w-7 h-7 text-xs rounded ' + (guessed.includes(l) ? 'bg-zinc-200 dark:bg-zinc-700 text-[var(--text-muted)]' : word.current.includes(l) ? 'bg-green-500 text-white' : 'bg-[var(--bg-surface)] hover:bg-blue-100') + ' disabled:opacity-40'}
            onClick={() => guess(l)}>{l}</button>
        ))}
      </div>
      {wrong >= 6 && <div className="text-red-500 font-bold text-center mt-2">Game Over! Word: {word.current}</div>}
      {!display.includes('_') && <div className="text-green-600 font-bold text-center mt-2">You Win!</div>}
    </Section>
  );
}
// --- BinaryConverter ---
export function BinaryConverter() {
  const clr = ac('BinaryConverter');
  const [input, setInput] = useState('42');
  const [mode, setMode] = useState('dec');
  const convert = (v: string, m: string) => {
    const n = parseInt(v, m === 'dec' ? 10 : m === 'hex' ? 16 : m === 'oct' ? 8 : 2);
    if (isNaN(n)) return { dec: '', hex: '', oct: '', bin: '' };
    return { dec: String(n), hex: n.toString(16).toUpperCase(), oct: n.toString(8), bin: n.toString(2) };
  };
  const res = convert(input, mode);
  return (
    <Section title="Binary Converter">
      <select className={selClass} value={mode} onChange={e => setMode(e.target.value)}>
        <option value="dec">Decimal</option><option value="hex">Hex</option><option value="oct">Octal</option><option value="bin">Binary</option>
      </select>
      <Input label="Enter value" placeholder="Enter value" value={input} onChange={setInput} />
      <div className="text-xs space-y-1 font-mono">
        <div><span className="text-[var(--text-secondary)]">Decimal:</span> {res.dec}</div>
        <div><span className="text-[var(--text-secondary)]">Hex:</span> {res.hex}</div>
        <div><span className="text-[var(--text-secondary)]">Octal:</span> {res.oct}</div>
        <div><span className="text-[var(--text-secondary)]">Binary:</span> {res.bin}</div>
      </div>
    </Section>
  );
}
// --- RomanNumeralConverter ---
export function RomanNumeralConverter() {
  const clr = ac('RomanNumeralConverter');
  const [dec, setDec] = useState('2024');
  const [roman, setRoman] = useState('MMXXIV');
  const toRoman = (n: number) => {
    const vals: [number, string][] = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
    let r = '', x = n;
    for (const [v, s] of vals) { while (x >= v) { r += s; x -= v; } }
    return r;
  };
  const fromRoman = (r: string) => {
    const m: Record<string, number> = { 'M': 1000, 'D': 500, 'C': 100, 'L': 50, 'X': 10, 'V': 5, 'I': 1 };
    let total = 0, prev = 0;
    for (let i = r.length - 1; i >= 0; i--) {
      const v = m[r[i]] || 0;
      total += v < prev ? -v : v;
      prev = v;
    }
    return total;
  };
  const toR = () => { const n = parseInt(dec); if (n > 0 && n < 4000) setRoman(toRoman(n)); };
  const fromR = () => { const n = fromRoman(roman.toUpperCase()); if (n > 0) setDec(String(n)); };
  return (
    <Section title="Roman Numeral Converter">
      <Input label="Decimal" placeholder="Decimal" value={dec} onChange={setDec} />
      <Input label="Roman" placeholder="Roman" value={roman} onChange={setRoman} />
      <div className="flex gap-2"><button className={btnClass(clr)} onClick={toR}>To Roman</button><button className={btnClass(clr)} onClick={fromR}>From Roman</button></div>
    </Section>
  );
}
// --- NumberToWordsConverter ---
export function NumberToWordsConverter() {
  const clr = ac('NumberToWordsConverter');
  const [num, setNum] = useState('1234');
  const ones = ['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  const convert = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? '-' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
    if (n < 1000000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 1000000000) return convert(Math.floor(n / 1000000)) + ' Million' + (n % 1000000 ? ' ' + convert(n % 1000000) : '');
    return convert(Math.floor(n / 1000000000)) + ' Billion' + (n % 1000000000 ? ' ' + convert(n % 1000000000) : '');
  };
  const words = parseInt(num) ? convert(parseInt(num)) : '';
  return (
    <Section title="Number to Words">
      <Input label="Value" type="number" value={num} onChange={setNum} />
      <div className="text-sm font-medium p-3 bg-[var(--bg-surface)] rounded-lg">{words}</div>
    </Section>
  );
}
// --- NumberBaseConverter ---
export function NumberBaseConverter() {
  const clr = ac('NumberBaseConverter');
  const [input, setInput] = useState('255');
  const [fromBase, setFromBase] = useState(10);
  const [toBase, setToBase] = useState(16);
  const result = parseInt(input, fromBase);
  const output = isNaN(result) ? '' : result.toString(toBase).toUpperCase();
  return (
    <Section title="Number Base Converter">
      <div className="flex gap-2">
        <select className={selClass} value={fromBase} onChange={e => setFromBase(Number(e.target.value))}>
          {Array.from({ length: 35 }, (_, i) => i + 2).map(b => <option key={b} value={b}>Base {b}</option>)}
        </select>
        <span className="self-center">-</span>
        <select className={selClass} value={toBase} onChange={e => setToBase(Number(e.target.value))}>
          {Array.from({ length: 35 }, (_, i) => i + 2).map(b => <option key={b} value={b}>Base {b}</option>)}
        </select>
      </div>
      <Input label="Enter number" placeholder="Enter number" value={input} onChange={setInput} />
      <div className="text-lg font-mono font-bold text-blue-600">{output}</div>
    </Section>
  );
}
// --- PercentageChangeCalculator ---
export function PercentageChangeCalculator() {
  const clr = ac('PercentageChangeCalculator');
  const [a, setA] = useState('100');
  const [b, setB] = useState('120');
  const change = Number(a) ? ((Number(b) - Number(a)) / Number(a) * 100) : 0;
  return (
    <Section title="Percentage Change">
      <div className="flex gap-2 items-center">
        <div><label className={labelClass}>Old Value</label><Input label="Value" value={a} onChange={setA} /></div>
        <div><label className={labelClass}>New Value</label><Input label="Value" value={b} onChange={setB} /></div>
      </div>
      <div className="text-lg font-bold">{change >= 0 ? '+' : ''}{change.toFixed(2)}% {change >= 0 ? 'increase' : 'decrease'}</div>
    </Section>
  );
}
// --- PercentageDifferenceCalculator ---
export function PercentageDifferenceCalculator() {
  const clr = ac('PercentageDifferenceCalculator');
  const [a, setA] = useState('100');
  const [b, setB] = useState('150');
  const avg = (Number(a) + Number(b)) / 2;
  const diff = avg ? Math.abs(Number(a) - Number(b)) / avg * 100 : 0;
  return (
    <Section title="Percentage Difference">
      <div className="flex gap-2 items-center">
        <Input label="Value" value={a} onChange={setA} />
        <Input label="Value" value={b} onChange={setB} />
      </div>
      <div className="text-lg font-bold">{diff.toFixed(2)}% difference</div>
    </Section>
  );
}
// --- VatCalculator ---
export function VatCalculator() {
  const clr = ac('VatCalculator');
  const [amount, setAmount] = useState('100');
  const [rate, setRate] = useState(20);
  const [mode, setMode] = useState('add');
  const a = Number(amount);
  const vat = mode === 'add' ? a * rate / 100 : a * rate / (100 + rate);
  const net = mode === 'add' ? a : a - vat;
  const gross = mode === 'add' ? a + vat : a;
  return (
    <Section title="VAT Calculator">
      <select className={selClass} value={mode} onChange={e => setMode(e.target.value)}>
        <option value="add">Add VAT</option><option value="remove">Remove VAT</option>
      </select>
      <div className="flex gap-2">
        <Input label="Value" type="number" value={amount} onChange={setAmount} />
        <Input label="Value" type="number" value={rate} onChange={v => setRate(Number(v))} />
      </div>
      <div className="text-xs space-y-1"><div>Net: {net.toFixed(2)}</div><div>VAT ({rate}%): {vat.toFixed(2)}</div><div className="font-bold">Gross: {gross.toFixed(2)}</div></div>
    </Section>
  );
}
// --- TipCalculator ---
export function TipCalculator() {
  const clr = ac('TipCalculator');
  const [bill, setBill] = useState('50');
  const [pct, setPct] = useState(15);
  const [split, setSplit] = useState(2);
  const b = Number(bill);
  const tip = b * pct / 100;
  const total = b + tip;
  return (
    <Section title="Tip Calculator">
      <div className="flex gap-2">
        <div><label className={labelClass}>Bill</label><Input label="Value" type="number" value={bill} onChange={setBill} /></div>
        <div><label className={labelClass}>Tip %</label><Input label="Value" type="number" value={pct} onChange={v => setPct(Number(v))} /></div>
        <div><label className={labelClass}>Split</label><Input label="Value" type="number" min={1} value={split} onChange={v => setSplit(Number(v))} /></div>
      </div>
      <div className="text-xs space-y-1">
        <div>Tip: ${tip.toFixed(2)}</div>
        <div>Total: ${total.toFixed(2)}</div>
        <div className="font-bold">Each: ${(total / split).toFixed(2)}</div>
      </div>
    </Section>
  );
}
// --- SalesTaxCalculator ---
export function SalesTaxCalculator() {
  const clr = ac('SalesTaxCalculator');
  const [amount, setAmount] = useState('100');
  const [rate, setRate] = useState(8);
  const a = Number(amount), tax = a * rate / 100;
  return (
    <Section title="Sales Tax Calculator">
      <div className="flex gap-2">
        <Input label="Value" type="number" value={amount} onChange={setAmount} />
        <Input label="Value" type="number" value={rate} onChange={v => setRate(Number(v))} />
      </div>
      <div className="text-xs space-y-1">
        <div>Tax: ${tax.toFixed(2)}</div>
        <div className="font-bold">Total: ${(a + tax).toFixed(2)}</div>
      </div>
    </Section>
  );
}
// --- MarkupCalculator ---
export function MarkupCalculator() {
  const clr = ac('MarkupCalculator');
  const [cost, setCost] = useState('50');
  const [markup, setMarkup] = useState(25);
  const c = Number(cost), m = Number(markup);
  const price = c * (1 + m / 100);
  const profit = price - c;
  return (
    <Section title="Markup Calculator">
      <div className="flex gap-2">
        <div><label className={labelClass}>Cost</label><Input label="Value" type="number" value={cost} onChange={setCost} /></div>
        <div><label className={labelClass}>Markup %</label><Input label="Value" type="number" value={markup} onChange={v => setMarkup(Number(v))} /></div>
      </div>
      <div className="text-xs space-y-1">
        <div>Selling Price: ${price.toFixed(2)}</div>
        <div>Profit: ${profit.toFixed(2)}</div>
        <div className="font-bold">Margin: {(profit / price * 100).toFixed(1)}%</div>
      </div>
    </Section>
  );
}
// --- ROICalculator ---
export function ROICalculator() {
  const clr = ac('ROICalculator');
  const [invested, setInvested] = useState('1000');
  const [returned, setReturned] = useState('1500');
  const i = Number(invested), r = Number(returned);
  const roi = i ? ((r - i) / i * 100) : 0;
  return (
    <Section title="ROI Calculator">
      <div className="flex gap-2"><div><label className={labelClass}>Amount Invested</label><Input label="Value" type="number" value={invested} onChange={setInvested} /></div><div><label className={labelClass}>Total Return</label><Input label="Value" type="number" value={returned} onChange={setReturned} /></div></div>
      <div className="text-lg font-bold">ROI: {roi.toFixed(2)}% (${(r - i).toFixed(2)})</div>
    </Section>
  );
}
// --- CAGRCalculator ---
export function CAGRCalculator() {
  const clr = ac('CAGRCalculator');
  const [start, setStart] = useState('1000');
  const [end, setEnd] = useState('2000');
  const [years, setYears] = useState('5');
  const s = Number(start), e = Number(end), y = Number(years);
  const cagr = s > 0 && y > 0 ? (Math.pow(e / s, 1 / y) - 1) * 100 : 0;
  return (
    <Section title="CAGR Calculator">
      <div className="flex gap-2">
        <div><label className={labelClass}>Start Value</label><Input label="Value" type="number" value={start} onChange={setStart} /></div>
        <div><label className={labelClass}>End Value</label><Input label="Value" type="number" value={end} onChange={setEnd} /></div>
        <div><label className={labelClass}>Years</label><Input label="Value" type="number" value={years} onChange={setYears} /></div>
      </div>
      <div className="text-lg font-bold">CAGR: {cagr.toFixed(2)}%</div>
    </Section>
  );
}
// --- CurrencyConverter ---
export function CurrencyConverter() {
  const clr = ac('CurrencyConverter');
  const rates: Record<string, number> = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, INR: 83.1, CAD: 1.36, AUD: 1.53, CNY: 7.24, BRL: 4.97, KRW: 1325 };
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const result = (Number(amount) / rates[from]) * rates[to];
  return (
    <Section title="Currency Converter">
      <div className="flex gap-2 items-center">
        <Input label="Value" type="number" value={amount} onChange={setAmount} />
        <select className={selClass} value={from} onChange={e => setFrom(e.target.value)}>
          {Object.keys(rates).map(c => <option key={c}>{c}</option>)}
        </select>
        <span>-</span>
        <select className={selClass} value={to} onChange={e => setTo(e.target.value)}>
          {Object.keys(rates).map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="text-lg font-bold">{result.toFixed(2)} {to}</div>
    </Section>
  );
}
// --- CurrencyRateCalculator ---
export function CurrencyRateCalculator() {
  const clr = ac('CurrencyRateCalculator');
  const currencies: Record<string, number> = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, INR: 83.1, CAD: 1.36, AUD: 1.53, CHF: 0.88, CNY: 7.24, NZD: 1.62, SEK: 10.45, NOK: 10.55, DKK: 6.87, PLN: 3.98, MXN: 17.15, SGD: 1.34, HKD: 7.82, TRY: 30.25, ZAR: 18.75, BRL: 4.97, KRW: 1325, AED: 3.67, SAR: 3.75, THB: 35.50, MYR: 4.72, PHP: 56.20, IDR: 15650, VND: 24600, CZK: 22.80, HUF: 358, CLP: 875, ARS: 820 };
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const result = (Number(amount) / currencies[from]) * currencies[to];
  return (
    <Section title="Currency Rate Calculator">
      <div className="flex gap-2 items-center">
        <Input label="Value" type="number" value={amount} onChange={setAmount} />
        <select className={selClass} value={from} onChange={e => setFrom(e.target.value)}>{Object.keys(currencies).map(c => <option key={c}>{c}</option>)}</select>
        <span>-</span>
        <select className={selClass} value={to} onChange={e => setTo(e.target.value)}>{Object.keys(currencies).map(c => <option key={c}>{c}</option>)}</select>
      </div>
      <div className="text-lg font-bold">{result.toFixed(2)} {to}</div>
    </Section>
  );
}
// --- ExchangeRateCalculator ---
export function ExchangeRateCalculator() {
  const clr = ac('ExchangeRateCalculator');
  const rates: Record<string, number> = { 'USD/EUR': 0.92, 'USD/GBP': 0.79, 'USD/JPY': 149.5, 'EUR/USD': 1.09, 'EUR/GBP': 0.86, 'GBP/USD': 1.27, 'GBP/EUR': 1.16, 'USD/INR': 83.1, 'USD/CAD': 1.36, 'USD/AUD': 1.53 };
  const [amount, setAmount] = useState('100');
  const [pair, setPair] = useState('USD/EUR');
  const rate = rates[pair] || 1;
  return (
    <Section title="Exchange Rate Calculator">
      <div className="flex gap-2 items-center">
        <Input label="Value" type="number" value={amount} onChange={setAmount} />
        <select className={selClass} value={pair} onChange={e => setPair(e.target.value)}>
          {Object.keys(rates).map(p => <option key={p}>{p}</option>)}
        </select>
      </div>
      <div className="text-lg font-bold">{(Number(amount) * rate).toFixed(2)}</div>
    </Section>
  );
}
// --- FractionSimplifier ---
export function FractionSimplifier() {
  const clr = ac('FractionSimplifier');
  const [num, setNum] = useState('8');
  const [den, setDen] = useState('12');
  const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
  const n = Number(num), d = Number(den);
  const g = gcd(n, d);
  return (
    <Section title="Fraction Simplifier">
      <div className="flex gap-2 items-center">
        <Input label="Value" type="number" value={num} onChange={setNum} />
        <span className="text-xl">/</span>
        <Input label="Value" type="number" value={den} onChange={setDen} />
      </div>
      <div className="text-lg font-bold">
        {d ? n + '/' + d + ' = ' + (n/g) + '/' + (d/g) : 'Invalid'}
      </div>
    </Section>
  );
}
// --- FractionToDecimalCalculator ---
export function FractionToDecimalCalculator() {
  const clr = ac('FractionToDecimalCalculator');
  const [num, setNum] = useState('3');
  const [den, setDen] = useState('4');
  const n = Number(num), d = Number(den);
  return (
    <Section title="Fraction to Decimal">
      <div className="flex gap-2 items-center">
        <Input label="Value" type="number" value={num} onChange={setNum} />
        <span className="text-xl">/</span>
        <Input label="Value" type="number" value={den} onChange={setDen} />
      </div>
      <div className="text-lg font-bold">{d ? (n / d).toString() : 'Invalid'}</div>
    </Section>
  );
}
// --- DecimalToFractionCalculator ---
export function DecimalToFractionCalculator() {
  const clr = ac('DecimalToFractionCalculator');
  const [dec, setDec] = useState('0.75');
  const d = parseFloat(dec);
  const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
  const getFraction = (v: number) => {
    if (isNaN(v)) return { n: 0, d: 0 };
    const precision = 1000000;
    const n = Math.round(v * precision);
    const g = gcd(n, precision);
    return { n: n / g, d: precision / g };
  };
  const f = getFraction(d);
  return (
    <Section title="Decimal to Fraction">
      <Input label="Value" type="number" step="0.01" value={dec} onChange={setDec} />
      <div className="text-lg font-bold">{f.d ? f.n + '/' + f.d : 'Invalid'}</div>
    </Section>
  );
}
// --- RatioSimplifier ---
export function RatioSimplifier() {
  const clr = ac('RatioSimplifier');
  const [a, setA] = useState('12');
  const [b, setB] = useState('18');
  const gcd = (x: number, y: number): number => y ? gcd(y, x % y) : x;
  const n1 = Number(a), n2 = Number(b);
  const g = gcd(n1, n2);
  return (
    <Section title="Ratio Simplifier">
      <div className="flex gap-2 items-center">
        <Input label="Value" type="number" value={a} onChange={setA} />
        <span>:</span>
        <Input label="Value" type="number" value={b} onChange={setB} />
      </div>
      <div className="text-lg font-bold">{n1}:{n2} = {n1/g}:{n2/g}</div>
    </Section>
  );
}
// --- ProportionalCalculator ---
export function ProportionalCalculator() {
  const clr = ac('ProportionalCalculator');
  const [a, setA] = useState('2');
  const [b, setB] = useState('4');
  const [c, setC] = useState('6');
  const na = Number(a), nb = Number(b), nc = Number(c);
  const d = na ? (nb * nc / na) : 0;
  return (
    <Section title="Proportional Calculator">
      <div className="flex gap-2 items-center">
        <Input label="Value" type="number" value={a} onChange={setA} /><span className="text-xs">:</span>
        <Input label="Value" type="number" value={b} onChange={setB} /><span className="text-xs">=</span>
        <Input label="Value" type="number" value={c} onChange={setC} /><span className="text-xs">:</span>
        <span className="text-lg font-bold">{d.toFixed(2)}</span>
      </div>
      <div className="text-xs text-[var(--text-secondary)]">{na}:{nb} = {nc}:{d.toFixed(2)}</div>
    </Section>
  );
}
// --- RuleOfThreeCalculator ---
export function RuleOfThreeCalculator() {
  const clr = ac('RuleOfThreeCalculator');
  const [a, setA] = useState('2');
  const [b, setB] = useState('4');
  const [c, setC] = useState('6');
  const na = Number(a), nb = Number(b), nc = Number(c);
  const x = na ? (nb * nc / na) : 0;
  return (
    <Section title="Rule of Three">
      <div className="flex gap-2 items-center">
        <Input label="Value" type="number" value={a} onChange={setA} /><span className="text-xs">-</span>
        <Input label="Value" type="number" value={b} onChange={setB} />
      </div>
      <div className="flex gap-2 items-center">
        <Input label="Value" type="number" value={c} onChange={setC} /><span className="text-xs">-</span>
        <span className="text-lg font-bold">{x.toFixed(2)}</span>
      </div>
    </Section>
  );
}
// --- CombinationCalculator ---
export function CombinationCalculator() {
  const clr = ac('CombinationCalculator');
  const [n, setN] = useState('5');
  const [r, setR] = useState('3');
  const fact = (x: number): number => x <= 1 ? 1 : x * fact(x - 1);
  const nn = Number(n), rr = Number(r);
  const c = fact(nn) / (fact(rr) * fact(nn - rr));
  return (
    <Section title="Combinations (nCr)">
      <div className="flex gap-2 items-center">
        <Input label="n" type="number" value={n} onChange={setN} placeholder="n" />
        <Input label="r" type="number" value={r} onChange={setR} placeholder="r" />
      </div>
      <div className="text-lg font-bold">C({nn}, {rr}) = {isFinite(c) ? c.toFixed(0) : 'N/A'}</div>
    </Section>
  );
}
// --- PermutationCalculator ---
export function PermutationCalculator() {
  const clr = ac('PermutationCalculator');
  const [n, setN] = useState('5');
  const [r, setR] = useState('3');
  const fact = (x: number): number => x <= 1 ? 1 : x * fact(x - 1);
  const nn = Number(n), rr = Number(r);
  const p = fact(nn) / fact(nn - rr);
  return (
    <Section title="Permutations (nPr)">
      <div className="flex gap-2 items-center">
        <Input label="n" type="number" value={n} onChange={setN} placeholder="n" />
        <Input label="r" type="number" value={r} onChange={setR} placeholder="r" />
      </div>
      <div className="text-lg font-bold">P({nn}, {rr}) = {isFinite(p) ? p.toFixed(0) : 'N/A'}</div>
    </Section>
  );
}
// --- FactorialCalculator ---
export function FactorialCalculator() {
  const clr = ac('FactorialCalculator');
  const [n, setN] = useState('5');
  const fact = (x: number): number => x <= 1 ? 1 : x * fact(x - 1);
  const nn = Number(n);
  return (
    <Section title="Factorial Calculator">
      <Input label="Value" type="number" min={0} max={170} value={n} onChange={setN} />
      <div className="text-lg font-bold">{nn}! = {nn > 170 ? 'Too large' : fact(nn).toLocaleString('fullwide', { useGrouping: false })}</div>
    </Section>
  );
}
// --- PrimeNumberChecker ---
export function PrimeNumberChecker() {
  const clr = ac('PrimeNumberChecker');
  const [n, setN] = useState('17');
  const nn = Number(n);
  const isPrime = (x: number) => { if (x < 2) return false; for (let i = 2; i * i <= x; i++) { if (x % i === 0) return false; } return true; };
  const factors = (x: number) => { const f: number[] = []; let d = 2; while (x > 1) { while (x % d === 0) { f.push(d); x /= d; } d++; } return f; };
  const prime = isPrime(nn);
  return (
    <Section title="Prime Number Checker">
      <Input label="Value" type="number" min={1} value={n} onChange={setN} />
      <div className={'text-lg font-bold ' + (prime ? 'text-green-600' : 'text-red-500')}>{nn} is {prime ? '' : 'not '}prime</div>
      {!prime && <div className="text-xs">Factors: {factors(nn).join(' x ')}</div>}
    </Section>
  );
}
// --- PrimeFactorizationCalculator ---
export function PrimeFactorizationCalculator() {
  const clr = ac('PrimeFactorizationCalculator');
  const [n, setN] = useState('84');
  const nn = Number(n);
  const factors = (x: number) => { const f: number[] = []; let d = 2; while (x > 1) { while (x % d === 0) { f.push(d); x /= d; } d++; } return f; };
  const f = factors(nn);
  return (
    <Section title="Prime Factorization">
      <Input label="Value" type="number" min={2} value={n} onChange={setN} />
      <div className="text-lg font-bold">{nn} = {f.join(' x ')}</div>
    </Section>
  );
}
// --- GreatestCommonFactorCalculator ---
export function GreatestCommonFactorCalculator() {
  const clr = ac('GreatestCommonFactorCalculator');
  const [a, setA] = useState('12');
  const [b, setB] = useState('18');
  const gcd = (x: number, y: number): number => y ? gcd(y, x % y) : x;
  const na = Number(a), nb = Number(b);
  return (
    <Section title="GCF / GCD Calculator">
      <div className="flex gap-2"><Input label="Value" type="number" value={a} onChange={setA} /><Input label="Value" type="number" value={b} onChange={setB} /></div>
      <div className="text-lg font-bold">GCF({na}, {nb}) = {gcd(na, nb)}</div>
    </Section>
  );
}
// --- LeastCommonMultipleCalculator ---
export function LeastCommonMultipleCalculator() {
  const clr = ac('LeastCommonMultipleCalculator');
  const [a, setA] = useState('4');
  const [b, setB] = useState('6');
  const gcd = (x: number, y: number): number => y ? gcd(y, x % y) : x;
  const lcm = (x: number, y: number) => x && y ? (x * y) / gcd(x, y) : 0;
  const na = Number(a), nb = Number(b);
  return (
    <Section title="LCM Calculator">
      <div className="flex gap-2"><Input label="Value" type="number" value={a} onChange={setA} /><Input label="Value" type="number" value={b} onChange={setB} /></div>
      <div className="text-lg font-bold">LCM({na}, {nb}) = {lcm(na, nb)}</div>
    </Section>
  );
}
// --- ModuloCalculator ---
export function ModuloCalculator() {
  const clr = ac('ModuloCalculator');
  const [a, setA] = useState('17');
  const [b, setB] = useState('5');
  const na = Number(a), nb = Number(b);
  const mod = na % nb;
  return (
    <Section title="Modulo Calculator">
      <div className="flex gap-2 items-center">
        <Input label="Value" type="number" value={a} onChange={setA} />
        <span className="text-sm">mod</span>
        <Input label="Value" type="number" value={b} onChange={setB} />
      </div>
      <div className="text-lg font-bold">{na} mod {nb} = {mod}</div>
      <div className="text-xs text-[var(--text-secondary)]">{na} = {nb} x {Math.floor(na / nb)} + {mod}</div>
    </Section>
  );
}
// --- LogarithmCalculator ---
export function LogarithmCalculator() {
  const clr = ac('LogarithmCalculator');
  const [num, setNum] = useState('100');
  const [base, setBase] = useState('10');
  const n = Number(num), b = Number(base);
  const log = Math.log(n) / Math.log(b);
  return (
    <Section title="Logarithm Calculator">
      <div className="flex gap-2 items-center">
        <span className="text-sm">log</span>
        <Input label="Value" type="number" value={base} onChange={setBase} />
        <Input label="Value" type="number" value={num} onChange={setNum} />
      </div>
      <div className="text-lg font-bold">log_{b}({n}) = {isFinite(log) ? log.toFixed(6) : 'Invalid'}</div>
      <div className="text-xs text-[var(--text-secondary)]">Natural log: {Math.log(n).toFixed(6)}</div>
    </Section>
  );
}
// --- TrigonometryCalculator ---
export function TrigonometryCalculator() {
  const clr = ac('TrigonometryCalculator');
  const [angle, setAngle] = useState('45');
  const [unit, setUnit] = useState('deg');
  const a = Number(angle);
  const rad = unit === 'deg' ? a * Math.PI / 180 : a;
  return (
    <Section title="Trigonometry Calculator">
      <div className="flex gap-2 items-center">
        <Input label="Value" type="number" value={angle} onChange={setAngle} />
        <select className={selClass} value={unit} onChange={e => setUnit(e.target.value)}>
          <option value="deg">Degrees</option><option value="rad">Radians</option>
        </select>
      </div>
      <div className="text-xs space-y-1 font-mono">
        <div>sin({a}) = {Math.sin(rad).toFixed(6)}</div>
        <div>cos({a}) = {Math.cos(rad).toFixed(6)}</div>
        <div>tan({a}) = {Math.tan(rad).toFixed(6)}</div>
        <div>csc({a}) = {1 / Math.sin(rad) < 1e10 ? (1 / Math.sin(rad)).toFixed(6) : 'inf'}</div>
        <div>sec({a}) = {1 / Math.cos(rad) < 1e10 ? (1 / Math.cos(rad)).toFixed(6) : 'inf'}</div>
        <div>cot({a}) = {1 / Math.tan(rad) < 1e10 ? (1 / Math.tan(rad)).toFixed(6) : 'inf'}</div>
      </div>
    </Section>
  );
}
// --- DegreeRadianConverter ---
export function DegreeRadianConverter() {
  const clr = ac('DegreeRadianConverter');
  const [deg, setDeg] = useState('180');
  const [rad, setRad] = useState('3.14159');
  const d2r = () => setRad(String(Number(deg) * Math.PI / 180));
  const r2d = () => setDeg(String(Number(rad) * 180 / Math.PI));
  return (
    <Section title="Degree / Radian Converter">
      <div className="flex gap-2 items-center"><label className={labelClass}>Degrees</label><Input label="Value" type="number" value={deg} onChange={setDeg} /></div>
      <div className="flex gap-2 items-center"><label className={labelClass}>Radians</label><Input label="Value" type="number" value={rad} onChange={setRad} /></div>
      <div className="flex gap-2"><button className={btnClass(clr)} onClick={d2r}>Deg to Rad</button><button className={btnClass(clr)} onClick={r2d}>Rad to Deg</button></div>
    </Section>
  );
}
// --- ScientificNotationConverter ---
export function ScientificNotationConverter() {
  const clr = ac('ScientificNotationConverter');
  const [input, setInput] = useState('1234000');
  const n = Number(input);
  const toScientific = (x: number) => {
    if (x === 0) return '0 x 10^0';
    const e = Math.floor(Math.log10(Math.abs(x)));
    const m = x / Math.pow(10, e);
    return m.toFixed(3) + ' x 10^' + e;
  };
  return (
    <Section title="Scientific Notation Converter">
      <Input label="Value" type="number" value={input} onChange={setInput} />
      <div className="text-sm">{isNaN(n) ? 'Invalid' : toScientific(n)}</div>
    </Section>
  );
}
// --- SignificantFiguresCalculator ---
export function SignificantFiguresCalculator() {
  const clr = ac('SignificantFiguresCalculator');
  const [input, setInput] = useState('0.00450');
  const countSigFigs = (s: string) => {
    const trimmed = s.replace(/^0+/, '');
    if (!trimmed || trimmed === '.') return 0;
    if (!trimmed.includes('.')) return trimmed.replace(/0+$/, '').length;
    return trimmed.replace(/\./g, '').length;
  };
  return (
    <Section title="Significant Figures">
      <Input label="Value" value={input} onChange={setInput} />
      <div className="text-lg font-bold">{countSigFigs(input)} significant figures</div>
    </Section>
  );
}
// --- RoundingCalculator ---
export function RoundingCalculator() {
  const clr = ac('RoundingCalculator');
  const [num, setNum] = useState('3.14159');
  const [places, setPlaces] = useState('2');
  return (
    <Section title="Rounding Calculator">
      <div className="flex gap-2 items-center">
        <Input label="Value" type="number" value={num} onChange={setNum} />
        <Input label="Value" type="number" min={0} max={15} value={places} onChange={setPlaces} />
      </div>
      <div className="text-lg font-bold">{Number(num).toFixed(Number(places))}</div>
    </Section>
  );
}
// --- MathEquationSolver ---
export function MathEquationSolver() {
  const clr = ac('MathEquationSolver');
  const [eq, setEq] = useState('2x + 3 = 7');
  const [result, setResult] = useState('');

  const solve = () => {
    const e = eq.replace(/\s+/g, '');
    // Quadratic: ax^2+bx+c=0
    const qm = e.match(/^([+-]?\d*\.?\d*)x\^2([+-]\d*\.?\d*)x([+-]\d*\.?\d*)=0$/);
    if (qm) {
      const a = Number(qm[1] || (qm[1] === '-' ? -1 : 1));
      const b = Number(qm[2] || 0);
      const c = Number(qm[3] || 0);
      if (a === 0) { setResult('Not quadratic (a=0). Try linear format.'); return; }
      const disc = b * b - 4 * a * c;
      if (disc < 0) { setResult('No real solutions (negative discriminant)'); return; }
      if (disc === 0) { setResult(`x = ${(-b / (2 * a)).toFixed(4)} (double root)`); return; }
      const x1 = (-b + Math.sqrt(disc)) / (2 * a);
      const x2 = (-b - Math.sqrt(disc)) / (2 * a);
      setResult(`x₁ = ${x1.toFixed(4)}, x₂ = ${x2.toFixed(4)}`);
      return;
    }
    // Linear: move all x terms to left, constants to right
    const [left, right] = e.split('=');
    if (!left || !right) { setResult('Use format: expression = value (e.g. 2x + 3 = 7)'); return; }
    // Parse terms from each side
    const parseSide = (s: string) => {
      const terms: { coeff: number; const: number } = { coeff: 0, const: 0 };
      const tokens = s.match(/[+-]?[^+-]+/g) || [];
      for (const t of tokens) {
        if (/x$/.test(t)) {
          const c = t.replace('x', '').replace(/\+$/, '');
          terms.coeff += Number(c || (c === '-' ? -1 : 1));
        } else {
          terms.const += Number(t);
        }
      }
      return terms;
    };
    const L = parseSide(left);
    const R = parseSide(right);
    const totalCoeff = L.coeff - R.coeff;
    const totalConst = R.const - L.const;
    if (totalCoeff === 0) {
      setResult(totalConst === 0 ? 'Infinite solutions (identity)' : 'No solution (contradiction)');
      return;
    }
    setResult(`x = ${(totalConst / totalCoeff).toFixed(4)}`);
  };

  return (
    <Section title="Equation Solver">
      <Input label="e.g. 2x + 3 = 7 or 3x^2 - 5x + 2 = 0" value={eq} onChange={setEq} placeholder="e.g. 2x + 3 = 7 or 3x^2 - 5x + 2 = 0" />
      <button onClick={solve} className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-medium transition-colors">Solve</button>
      {result && <div className="text-lg font-bold font-mono mt-2">{result}</div>}
      <p className="text-xs text-[var(--text-secondary)] mt-1">Supports linear (ax + b = cx + d) and quadratic (ax² + bx + c = 0) equations.</p>
    </Section>
  );
}
// --- AlgebraCalculator ---
export function AlgebraCalculator() {
  const clr = ac('AlgebraCalculator');
  const [expr, setExpr] = useState('2*(3+4)');
  let result: string;
  try { result = String(parseExpr(expr)); } catch { result = 'Invalid expression'; }
  return (
    <Section title="Algebraic Expression Evaluator">
      <Input label="Value" value={expr} onChange={setExpr} />
      <div className="text-lg font-bold font-mono">= {result}</div>
    </Section>
  );
}
// --- GeometryCalculator ---
export function GeometryCalculator() {
  const clr = ac('GeometryCalculator');
  const [shape, setShape] = useState('circle');
  const [r, setR] = useState('5');
  const [w, setW] = useState('4');
  const [h, setH] = useState('3');
  const radius = Number(r), width = Number(w), height = Number(h);
  const calc = () => {
    switch (shape) {
      case 'circle': return { area: Math.PI * radius * radius, perimeter: 2 * Math.PI * radius };
      case 'square': return { area: width * width, perimeter: 4 * width, volume: width * width * width };
      case 'triangle': return { area: 0.5 * width * height };
      case 'rectangle': return { area: width * height, perimeter: 2 * (width + height) };
      case 'sphere': return { area: 4 * Math.PI * radius * radius, volume: 4 / 3 * Math.PI * radius * radius * radius };
      case 'cylinder': return { area: 2 * Math.PI * radius * (radius + height), volume: Math.PI * radius * radius * height };
      case 'cone': return { area: Math.PI * radius * (radius + Math.sqrt(height * height + radius * radius)), volume: Math.PI * radius * radius * height / 3 };
      case 'cube': return { area: 6 * width * width, volume: width * width * width };
      default: return {};
    }
  };
  const result = calc();
  return (
    <Section title="Geometry Calculator">
      <select className={selClass} value={shape} onChange={e => setShape(e.target.value)}>
        <option value="circle">Circle</option><option value="square">Square</option><option value="triangle">Triangle</option>
        <option value="rectangle">Rectangle</option><option value="sphere">Sphere</option><option value="cylinder">Cylinder</option>
        <option value="cone">Cone</option><option value="cube">Cube</option>
      </select>
      <div className="flex gap-2 flex-wrap">
        {(shape === 'circle' || shape === 'sphere' || shape === 'cylinder' || shape === 'cone') && <div><label className={labelClass}>Radius</label><Input label="Value" type="number" value={r} onChange={setR} /></div>}
        {(shape === 'square' || shape === 'rectangle' || shape === 'cube') && <div><label className={labelClass}>Width</label><Input label="Value" type="number" value={w} onChange={setW} /></div>}
        {(shape === 'triangle' || shape === 'rectangle' || shape === 'cylinder' || shape === 'cone') && <div><label className={labelClass}>Height</label><Input label="Value" type="number" value={h} onChange={setH} /></div>}
      </div>
      <div className="text-xs space-y-1">
        {result.area !== undefined && <div>Area: {result.area.toFixed(4)}</div>}
        {result.perimeter !== undefined && <div>Perimeter: {result.perimeter.toFixed(4)}</div>}
        {result.volume !== undefined && <div>Volume: {result.volume.toFixed(4)}</div>}
      </div>
    </Section>
  );
}
// --- CoordinateCalculator ---
export function CoordinateCalculator() {
  const clr = ac('CoordinateCalculator');
  const [x1, setX1] = useState('0'); const [y1, setY1] = useState('0');
  const [x2, setX2] = useState('3'); const [y2, setY2] = useState('4');
  const a = Number(x1), b = Number(y1), c = Number(x2), d = Number(y2);
  const dist = Math.sqrt((c - a) ** 2 + (d - b) ** 2);
  const mx = (a + c) / 2, my = (b + d) / 2;
  return (
    <Section title="Coordinate Calculator">
      <div className="flex gap-2">
        <div><label className={labelClass}>x1</label><Input label="Value" type="number" value={x1} onChange={setX1} /></div>
        <div><label className={labelClass}>y1</label><Input label="Value" type="number" value={y1} onChange={setY1} /></div>
        <div><label className={labelClass}>x2</label><Input label="Value" type="number" value={x2} onChange={setX2} /></div>
        <div><label className={labelClass}>y2</label><Input label="Value" type="number" value={y2} onChange={setY2} /></div>
      </div>
      <div className="text-xs space-y-1">
        <div>Distance: {dist.toFixed(4)}</div>
        <div>Midpoint: ({mx.toFixed(2)}, {my.toFixed(2)})</div>
      </div>
    </Section>
  );
}
// --- SlopeCalculator ---
export function SlopeCalculator() {
  const clr = ac('SlopeCalculator');
  const [x1, setX1] = useState('1'); const [y1, setY1] = useState('2');
  const [x2, setX2] = useState('3'); const [y2, setY2] = useState('6');
  const a = Number(x1), b = Number(y1), c = Number(x2), d = Number(y2);
  const dx = c - a, dy = d - b;
  const slope = dx !== 0 ? dy / dx : Infinity;
  return (
    <Section title="Slope Calculator">
      <div className="flex gap-2">
        <div><label className={labelClass}>x1</label><Input label="Value" type="number" value={x1} onChange={setX1} /></div>
        <div><label className={labelClass}>y1</label><Input label="Value" type="number" value={y1} onChange={setY1} /></div>
        <div><label className={labelClass}>x2</label><Input label="Value" type="number" value={x2} onChange={setX2} /></div>
        <div><label className={labelClass}>y2</label><Input label="Value" type="number" value={y2} onChange={setY2} /></div>
      </div>
      <div className="text-sm font-mono">
        <div>Slope = {isFinite(slope) ? slope.toFixed(4) : 'undefined'}</div>
        <div>Equation: y = {isFinite(slope) ? slope.toFixed(2) + 'x ' + (b - slope * a >= 0 ? '+' : '') + (b - slope * a).toFixed(2) : 'x = ' + a}</div>
      </div>
    </Section>
  );
}
// --- MidpointCalculator ---
export function MidpointCalculator() {
  const clr = ac('MidpointCalculator');
  const [x1, setX1] = useState('0'); const [y1, setY1] = useState('0');
  const [x2, setX2] = useState('4'); const [y2, setY2] = useState('6');
  const a = Number(x1), b = Number(y1), c = Number(x2), d = Number(y2);
  return (
    <Section title="Midpoint Calculator">
      <div className="flex gap-2">
        <div><label className={labelClass}>x1</label><Input label="Value" type="number" value={x1} onChange={setX1} /></div>
        <div><label className={labelClass}>y1</label><Input label="Value" type="number" value={y1} onChange={setY1} /></div>
        <div><label className={labelClass}>x2</label><Input label="Value" type="number" value={x2} onChange={setX2} /></div>
        <div><label className={labelClass}>y2</label><Input label="Value" type="number" value={y2} onChange={setY2} /></div>
      </div>
      <div className="text-lg font-bold">Midpoint: ({(a + c) / 2}, {(b + d) / 2})</div>
    </Section>
  );
}
// --- DistanceCalculator ---
export function DistanceCalculator() {
  const clr = ac('DistanceCalculator');
  const [x1, setX1] = useState('0'); const [y1, setY1] = useState('0');
  const [x2, setX2] = useState('3'); const [y2, setY2] = useState('4');
  const a = Number(x1), b = Number(y1), c = Number(x2), d = Number(y2);
  const dist = Math.sqrt((c - a) ** 2 + (d - b) ** 2);
  return (
    <Section title="Distance Calculator (2D)">
      <div className="flex gap-2">
        <div><label className={labelClass}>x1</label><Input label="Value" type="number" value={x1} onChange={setX1} /></div>
        <div><label className={labelClass}>y1</label><Input label="Value" type="number" value={y1} onChange={setY1} /></div>
        <div><label className={labelClass}>x2</label><Input label="Value" type="number" value={x2} onChange={setX2} /></div>
        <div><label className={labelClass}>y2</label><Input label="Value" type="number" value={y2} onChange={setY2} /></div>
      </div>
      <div className="text-lg font-bold">Distance: {dist.toFixed(4)}</div>
    </Section>
  );
}
// --- BodyMassIndexCalculator ---
export function BodyMassIndexCalculator() {
  const clr = ac('BodyMassIndexCalculator');
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('70');
  const [unit, setUnit] = useState('metric');
  const h = unit === 'metric' ? Number(height) / 100 : Number(height) * 0.0254;
  const w = unit === 'metric' ? Number(weight) : Number(weight) * 0.453592;
  const bmi = h > 0 ? w / (h * h) : 0;
  const category = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
  const color = bmi < 18.5 ? 'text-yellow-500' : bmi < 25 ? 'text-green-600' : bmi < 30 ? 'text-orange-500' : 'text-red-500';
  return (
    <Section title="BMI Calculator">
      <select className={selClass} value={unit} onChange={e => setUnit(e.target.value)}>
        <option value="metric">Metric (cm/kg)</option><option value="imperial">Imperial (in/lb)</option>
      </select>
      <div className="flex gap-2">
        <Input label="Value" type="number" value={height} onChange={setHeight} placeholder={unit === 'metric' ? 'cm' : 'in'} />
        <Input label="Value" type="number" value={weight} onChange={setWeight} placeholder={unit === 'metric' ? 'kg' : 'lb'} />
      </div>
      <div className={'text-2xl font-bold ' + color}>{bmi.toFixed(1)}</div>
      <div className={'text-sm font-medium ' + color}>{category}</div>
    </Section>
  );
}
// --- BodyFatCalculator ---
export function BodyFatCalculator() {
  const clr = ac('BodyFatCalculator');
  const [bmi, setBmi] = useState('24');
  const [age, setAge] = useState('30');
  const [gender, setGender] = useState('male');
  const b = Number(bmi), a = Number(age);
  const bf = gender === 'male' ? 1.2 * b + 0.23 * a - 16.2 : 1.2 * b + 0.23 * a - 5.4;
  return (
    <Section title="Body Fat % Estimator">
      <select className={selClass} value={gender} onChange={e => setGender(e.target.value)}>
        <option value="male">Male</option><option value="female">Female</option>
      </select>
      <div className="flex gap-2">
        <div><label className={labelClass}>BMI</label><Input label="Value" type="number" value={bmi} onChange={setBmi} /></div>
        <div><label className={labelClass}>Age</label><Input label="Value" type="number" value={age} onChange={setAge} /></div>
      </div>
      <div className="text-lg font-bold">Body Fat: {bf.toFixed(1)}%</div>
    </Section>
  );
}
// --- CalorieIntakeCalculator ---
export function CalorieIntakeCalculator() {
  const clr = ac('CalorieIntakeCalculator');
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('170');
  const [age, setAge] = useState('30');
  const [gender, setGender] = useState('male');
  const [activity, setActivity] = useState('1.55');
  const w = Number(weight), h = Number(height), a = Number(age), act = Number(activity);
  const bmr = gender === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
  return (
    <Section title="Daily Calorie Needs">
      <div className="flex gap-2">
        <select className={selClass} value={gender} onChange={e => setGender(e.target.value)}><option value="male">Male</option><option value="female">Female</option></select>
        <select className={selClass} value={activity} onChange={e => setActivity(e.target.value)}>
          <option value="1.2">Sedentary</option><option value="1.375">Light</option><option value="1.55">Moderate</option>
          <option value="1.725">Active</option><option value="1.9">Very Active</option>
        </select>
      </div>
      <div className="flex gap-2"><div><label className={labelClass}>Weight (kg)</label><Input label="Value" type="number" value={weight} onChange={setWeight} /></div><div><label className={labelClass}>Height (cm)</label><Input label="Value" type="number" value={height} onChange={setHeight} /></div><div><label className={labelClass}>Age</label><Input label="Value" type="number" value={age} onChange={setAge} /></div></div>
      <div className="text-lg font-bold">BMR: {bmr.toFixed(0)} kcal/day</div>
      <div className="text-sm">Maintenance: {(bmr * act).toFixed(0)} kcal/day</div>
    </Section>
  );
}
// --- MacroSplitCalculator ---
export function MacroSplitCalculator() {
  const clr = ac('MacroSplitCalculator');
  const [calories, setCalories] = useState('2000');
  const c = Number(calories);
  return (
    <Section title="Daily Macronutrients">
      <Input label="Value" type="number" value={calories} onChange={setCalories} />
      <div className="text-xs space-y-1">
        <div className="flex justify-between"><span>Protein (30%)</span><span className="font-bold">{(c * 0.3 / 4).toFixed(0)}g = {(c * 0.3).toFixed(0)} kcal</span></div>
        <div className="flex justify-between"><span>Carbs (40%)</span><span className="font-bold">{(c * 0.4 / 4).toFixed(0)}g = {(c * 0.4).toFixed(0)} kcal</span></div>
        <div className="flex justify-between"><span>Fat (30%)</span><span className="font-bold">{(c * 0.3 / 9).toFixed(0)}g = {(c * 0.3).toFixed(0)} kcal</span></div>
      </div>
    </Section>
  );
}
// --- WaterRequirementCalculator ---
export function WaterRequirementCalculator() {
  const clr = ac('WaterRequirementCalculator');
  const [weight, setWeight] = useState('70');
  const [activity, setActivity] = useState('30');
  const w = Number(weight);
  const base = w * 0.033;
  const extra = Math.floor(Number(activity) / 30) * 0.35;
  return (
    <Section title="Daily Water Intake">
      <div className="flex gap-2"><div><label className={labelClass}>Weight (kg)</label><Input label="Value" type="number" value={weight} onChange={setWeight} /></div><div><label className={labelClass}>Exercise (min)</label><Input label="Value" type="number" value={activity} onChange={setActivity} /></div></div>
      <div className="text-lg font-bold">{(base + extra).toFixed(1)} L / day</div>
    </Section>
  );
}
// --- SleepRequirementCalculator ---
export function SleepRequirementCalculator() {
  const clr = ac('SleepRequirementCalculator');
  const [age, setAge] = useState('30');
  const a = Number(age);
  const rec = a < 1 ? '12-16 hours' : a < 2 ? '11-14 hours' : a < 5 ? '10-13 hours' : a < 13 ? '9-12 hours' : a < 18 ? '8-10 hours' : a < 65 ? '7-9 hours' : '7-8 hours';
  return (
    <Section title="Sleep Requirements by Age">
      <Input label="Value" type="number" value={age} onChange={setAge} />
      <div className="text-lg font-bold">Recommended: {rec}</div>
    </Section>
  );
}
// --- HeartRateCalculator ---
export function HeartRateCalculator() {
  const clr = ac('HeartRateCalculator');
  const [age, setAge] = useState('35');
  const a = Number(age);
  const max = 220 - a;
  return (
    <Section title="Target Heart Rate Zones">
      <Input label="Value" type="number" value={age} onChange={setAge} />
      <div className="text-xs space-y-1">
        <div>Max HR: {max} bpm</div>
        <div>Zone 1 (50-60%): {Math.round(max * 0.5)}-{Math.round(max * 0.6)} bpm</div>
        <div>Zone 2 (60-70%): {Math.round(max * 0.6)}-{Math.round(max * 0.7)} bpm</div>
        <div>Zone 3 (70-80%): {Math.round(max * 0.7)}-{Math.round(max * 0.8)} bpm</div>
        <div>Zone 4 (80-90%): {Math.round(max * 0.8)}-{Math.round(max * 0.9)} bpm</div>
        <div>Zone 5 (90-100%): {Math.round(max * 0.9)}-{max} bpm</div>
      </div>
      <p className="text-xs text-[var(--text-secondary)] mt-2">Uses %-of-max HR method. For a more precise calculation using your resting HR, see <a href="/calculator/heart-rate-zone-calculator" className="text-blue-600 hover:underline">Heart Rate Zone Calculator (Karvonen)</a>.</p>
    </Section>
  );
}
// --- IdealWeightCalc ---
export function IdealWeightCalc() {
  const clr = ac('IdealWeightCalc');
  const [height, setHeight] = useState('170');
  const [gender, setGender] = useState('male');
  const h = Number(height);
  const devine = gender === 'male' ? 50 + 2.3 * ((h - 152.4) / 2.54) : 45.5 + 2.3 * ((h - 152.4) / 2.54);
  const robinson = gender === 'male' ? 52 + 1.9 * ((h - 152.4) / 2.54) : 49 + 1.7 * ((h - 152.4) / 2.54);
  return (
    <Section title="Ideal Body Weight">
      <div className="flex gap-2"><select className={selClass} value={gender} onChange={e => setGender(e.target.value)}><option value="male">Male</option><option value="female">Female</option></select><Input label="Value" type="number" value={height} onChange={setHeight} /></div>
      <div className="text-xs space-y-1"><div>Devine: {devine.toFixed(1)} kg</div><div>Robinson: {robinson.toFixed(1)} kg</div></div>
    </Section>
  );
}
// --- PaceCalculator ---
export function PaceCalculator() {
  const clr = ac('PaceCalculator');
  const [dist, setDist] = useState('10');
  const [time, setTime] = useState('50');
  const d = Number(dist), t = Number(time);
  const paceMin = d ? t / d : 0;
  const paceMinWhole = Math.floor(paceMin);
  const paceSec = Math.round((paceMin - paceMinWhole) * 60);
  return (
    <Section title="Running Pace Calculator">
      <div className="flex gap-2"><div><label className={labelClass}>Distance (km)</label><Input label="Value" type="number" value={dist} onChange={setDist} /></div><div><label className={labelClass}>Time (min)</label><Input label="Value" type="number" value={time} onChange={setTime} /></div></div>
      <div className="text-lg font-bold">{paceMinWhole}:{paceSec.toString().padStart(2, '0')} /km</div>
      <div className="text-sm">Speed: {d && t ? (d / t * 60).toFixed(2) : 0} km/h</div>
    </Section>
  );
}
// --- StepsCalculator ---
export function StepsCalculator() {
  const clr = ac('StepsCalculator');
  const [steps, setSteps] = useState('10000');
  const [height, setHeight] = useState('170');
  const s = Number(steps), h = Number(height);
  const stride = h * 0.415;
  const distM = s * stride;
  const distKm = distM / 1000;
  const distMi = distKm / 1.609;
  return (
    <Section title="Steps to Distance">
      <div className="flex gap-2"><div><label className={labelClass}>Steps</label><Input label="Value" type="number" value={steps} onChange={setSteps} /></div><div><label className={labelClass}>Height (cm)</label><Input label="Value" type="number" value={height} onChange={setHeight} /></div></div>
      <div className="text-xs space-y-1"><div>Distance: {distKm.toFixed(2)} km</div><div>Distance: {distMi.toFixed(2)} miles</div><div>Calories (est): {(s * 0.04).toFixed(0)} kcal</div></div>
      <p className="text-xs text-[var(--text-secondary)] mt-2">Uses height-based stride estimate (stride = height × 0.415). For a weight-based calorie calculation, see <a href="/calculator/steps-to-calories-calculator" className="text-blue-600 hover:underline">Steps to Calories Calculator</a>.</p>
    </Section>
  );
}
// --- CaloriesBurnedCalculator ---
export function CaloriesBurnedCalculator() {
  const clr = ac('CaloriesBurnedCalculator');
  const [weight, setWeight] = useState('70');
  const [duration, setDuration] = useState('30');
  const [activity, setActivity] = useState('running');
  const mets: Record<string, number> = { running: 9.8, walking: 3.5, cycling: 7.5, swimming: 8, yoga: 2.5, lifting: 4.5, 'jump rope': 12 };
  const met = mets[activity] || 5;
  const burned = met * Number(weight) * (Number(duration) / 60);
  return (
    <Section title="Calories Burned">
      <div className="flex gap-2"><select className={selClass} value={activity} onChange={e => setActivity(e.target.value)}>{Object.keys(mets).map(k => <option key={k}>{k}</option>)}</select>
      <div><label className={labelClass}>Weight (kg)</label><Input label="Value" type="number" value={weight} onChange={setWeight} /></div>
      <div><label className={labelClass}>Duration (min)</label><Input label="Value" type="number" value={duration} onChange={setDuration} /></div></div>
      <div className="text-lg font-bold">{burned.toFixed(0)} kcal burned</div>
    </Section>
  );
}
// --- BloodAlcoholCalculator ---
export function BloodAlcoholCalculator() {
  const clr = ac('BloodAlcoholCalculator');
  const [weight, setWeight] = useState('70');
  const [gender, setGender] = useState('male');
  const [drinks, setDrinks] = useState('3');
  const [hours, setHours] = useState('2');
  const w = Number(weight), d = Number(drinks), h = Number(hours);
  const r = gender === 'male' ? 0.68 : 0.55;
  const bac = (d * 14 / (w * 1000 * r)) * 100 - (h * 0.015);
  const finalBac = Math.max(0, bac);
  return (
    <Section title="Blood Alcohol Estimator">
      <div className="flex gap-2"><select className={selClass} value={gender} onChange={e => setGender(e.target.value)}><option value="male">Male</option><option value="female">Female</option></select><Input label="Weight (kg)" type="number" value={weight} onChange={setWeight} placeholder="Weight (kg)" /></div>
      <div className="flex gap-2"><Input label="Drinks" type="number" value={drinks} onChange={setDrinks} placeholder="Drinks" /><Input label="Value" type="number" value={hours} onChange={setHours} placeholder="Hours" /></div>
      <div className={'text-lg font-bold ' + (finalBac >= 0.08 ? 'text-red-500' : 'text-green-600')}>BAC: {finalBac.toFixed(3)}%</div>
      {finalBac >= 0.08 && <div className="text-xs text-red-500">Over legal limit (0.08%)</div>}
    </Section>
  );
}
// --- PregnancyCalculator ---
export function PregnancyCalculator() {
  const clr = ac('PregnancyCalculator');
  const [lmp, setLmp] = useState('');
  const due = lmp ? new Date(new Date(lmp).getTime() + 280 * 86400000) : null;
  return (
    <Section title="Pregnancy Calculator">
      <label className={labelClass}>First day of last menstrual period</label>
      <Input label="Value" type="date" value={lmp} onChange={setLmp} />
      {due && <div><div className="text-lg font-bold">Due Date: {due.toLocaleDateString()}</div><div className="text-xs">Gestational age: {Math.floor((Date.now() - new Date(lmp).getTime()) / (7 * 86400000))} weeks</div></div>}
    </Section>
  );
}
// --- OvulationTracker ---
export function OvulationTracker() {
  const clr = ac('OvulationTracker');
  const [lmp, setLmp] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  const results = lmp ? (() => {
    const start = new Date(lmp);
    const cycleLen = Number(cycleLength) || 28;
    const fertileStart = new Date(start.getTime() + (cycleLen - 14 - 5) * 86400000);
    const fertileEnd = new Date(start.getTime() + (cycleLen - 14 + 1) * 86400000);
    const ovulation = new Date(start.getTime() + (cycleLen - 14) * 86400000);
    const nextPeriod = new Date(start.getTime() + cycleLen * 86400000);
    return { fertileStart, fertileEnd, ovulation, nextPeriod };
  })() : null;
  return (
    <Section title="Ovulation Tracker">
      <label className={labelClass}>First day of LMP</label>
      <Input label="Value" type="date" value={lmp} onChange={setLmp} />
      <label className={labelClass}>Cycle Length (days)</label>
      <Input label="Value" type="number" value={cycleLength} onChange={setCycleLength} min={20} max={45} />
      {results && <div className="text-xs space-y-1">
        <div>Fertile window: {results.fertileStart.toLocaleDateString()} - {results.fertileEnd.toLocaleDateString()}</div>
        <div className="font-bold">Ovulation: {results.ovulation.toLocaleDateString()}</div>
        <div>Next period: {results.nextPeriod.toLocaleDateString()}</div>
      </div>}
    </Section>
  );
}
// --- AgeCalculator ---
export function AgeCalculator() {
  const clr = ac('AgeCalculator');
  const [birth, setBirth] = useState('');
  const calc = birth ? (() => {
    const b = new Date(birth), now = new Date();
    let y = now.getFullYear() - b.getFullYear(), m = now.getMonth() - b.getMonth(), d = now.getDate() - b.getDate();
    if (d < 0) { m--; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }
    return { y, m, d };
  })() : null;
  return (
    <Section title="Age Calculator">
      <Input label="Value" type="date" value={birth} onChange={setBirth} />
      {calc && <div className="text-lg font-bold">{calc.y} years, {calc.m} months, {calc.d} days</div>}
    </Section>
  );
}
// --- DateDifferenceCalculator ---
export function DateDifferenceCalculator() {
  const clr = ac('DateDifferenceCalculator');
  const [d1, setD1] = useState('');
  const [d2, setD2] = useState('');
  const diff = d1 && d2 ? (() => {
    const a = new Date(d1), b = new Date(d2);
    const ms = Math.abs(b.getTime() - a.getTime());
    return { days: Math.floor(ms / 86400000), hours: Math.floor(ms / 3600000), minutes: Math.floor(ms / 60000), seconds: Math.floor(ms / 1000) };
  })() : null;
  return (
    <Section title="Date Difference Calculator">
      <div className="flex gap-2"><Input label="Value" type="date" value={d1} onChange={setD1} /><Input label="Value" type="date" value={d2} onChange={setD2} /></div>
      {diff && <div className="text-xs space-y-1">
        <div className="font-bold">{diff.days} days</div>
        <div>{diff.hours} hours</div>
        <div className="text-muted">{diff.minutes} minutes</div>
        <div className="text-muted">{diff.seconds} seconds</div>
      </div>}
    </Section>
  );
}
// --- DateAdditionCalculator ---
export function DateAdditionCalculator() {
  const clr = ac('DateAdditionCalculator');
  const [start, setStart] = useState('');
  const [days, setDays] = useState('30');
  const result = start ? new Date(new Date(start).getTime() + Number(days) * 86400000) : null;
  return (
    <Section title="Date Addition / Subtraction">
      <div className="flex gap-2"><Input label="Value" type="date" value={start} onChange={setStart} /><Input label="Value" type="number" value={days} onChange={setDays} /></div>
      {result && <div className="text-lg font-bold">{result.toLocaleDateString()}</div>}
    </Section>
  );
}
// --- WeekNumberCalculator ---
export function WeekNumberCalculator() {
  const clr = ac('WeekNumberCalculator');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const d = new Date(date);
  const start = new Date(d.getFullYear(), 0, 1);
  const diff = Math.floor((d.getTime() - start.getTime()) / 86400000);
  const week = Math.ceil((diff + start.getDay() + 1) / 7);
  return (
    <Section title="Week Number Calculator">
      <Input label="Value" type="date" value={date} onChange={setDate} />
      <div className="text-lg font-bold">Week {week} of {d.getFullYear()}</div>
      <div className="text-xs text-muted">{d.toLocaleDateString('en-US', { weekday: 'long' })}</div>
    </Section>
  );
}
// --- TimeSinceCalculator ---
export function TimeSinceCalculator() {
  const clr = ac('TimeSinceCalculator');
  const [date, setDate] = useState(new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10));
  const d = new Date(date);
  const now = new Date();
  const ms = now.getTime() - d.getTime();
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  const wk = Math.floor(day / 7);
  const mo = Math.floor(day / 30.44);
  const yr = Math.floor(day / 365.25);
  return (
    <Section title="Time Since / Until">
      <Input label="Value" type="date" value={date} onChange={setDate} />
      <div className="text-xs space-y-1">
        <div>{yr} years</div><div>{mo} months</div><div>{wk} weeks</div>
        <div>{day} days</div><div>{hr} hours</div><div>{min} minutes</div><div>{sec} seconds</div>
      </div>
    </Section>
  );
}
// --- TimeZoneConverter ---
export function TimeZoneConverter() {
  const clr = ac('TimeZoneConverter');
  const [time, setTime] = useState('12:00');
  const [fromTz, setFromTz] = useState('UTC');
  const [toTz, setToTz] = useState('America/New_York');
  const now = new Date();
  const [h, m] = time.split(':').map(Number);
  const local = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
  const fromOffset = -new Date(local.toLocaleString('en-US', { timeZone: fromTz })).getTimezoneOffset();
  const toOffset = -new Date(local.toLocaleString('en-US', { timeZone: toTz })).getTimezoneOffset();
  const diffMin = toOffset - fromOffset;
  const resultH = (h + Math.floor(diffMin / 60) + 24) % 24;
  const resultM = (m + diffMin % 60 + 60) % 60;
  return (
    <Section title="Time Zone Converter">
      <div className="flex gap-2"><Input label="Value" type="time" value={time} onChange={setTime} /><Input label="Value" value={fromTz} onChange={setFromTz} /></div>
      <div className="flex gap-2"><Input label="Value" value={toTz} onChange={setToTz} /></div>
      <div className="text-lg font-bold">{String(resultH).padStart(2, '0')}:{String(resultM).padStart(2, '0')}</div>
      <div className="text-xs text-muted">From: {fromTz} → To: {toTz}</div>
    </Section>
  );
}
// --- DaylightSavingTimeChecker ---
export function DaylightSavingTimeChecker() {
  const clr = ac('DaylightSavingTimeChecker');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const y = Number(year);
  const march = new Date(y, 2, 14);
  const nov = new Date(y, 10, 7);
  const dstStart = new Date(march.getTime() + (7 - march.getDay()) * 86400000);
  const dstEnd = new Date(nov.getTime() + (7 - nov.getDay()) * 86400000);
  return (
    <Section title="DST Checker (US)">
      <Input label="Value" type="number" value={year} onChange={setYear} />
      <div className="text-xs">
        <div>DST starts: {dstStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
        <div>DST ends: {dstEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
        <div>DST period: {Math.round((dstEnd.getTime() - dstStart.getTime()) / 86400000)} days</div>
      </div>
    </Section>
  );
}
// --- WorkHoursCalculator ---
export function WorkHoursCalculator() {
  const clr = ac('WorkHoursCalculator');
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('17:00');
  const [breakMin, setBreakMin] = useState('30');
  const [sH, sM] = start.split(':').map(Number);
  const [eH, eM] = end.split(':').map(Number);
  const total = (eH * 60 + eM) - (sH * 60 + sM) - Number(breakMin);
  const hrs = Math.floor(total / 60), mins = total % 60;
  return (
    <Section title="Work Hours Calculator">
      <div className="flex gap-2"><Input label="Value" type="time" value={start} onChange={setStart} /><Input label="Value" type="time" value={end} onChange={setEnd} /><Input label="Value" type="number" value={breakMin} onChange={setBreakMin} /></div>
      <div className="text-lg font-bold">{hrs}h {mins}m</div>
    </Section>
  );
}
// --- HoursMinutesCalculator ---
export function HoursMinutesCalculator() {
  const clr = ac('HoursMinutesCalculator');
  const [h1, setH1] = useState('1'); const [m1, setM1] = useState('30');
  const [h2, setH2] = useState('2'); const [m2, setM2] = useState('15');
  const t1 = Number(h1) * 60 + Number(m1), t2 = Number(h2) * 60 + Number(m2);
  const total = t1 + t2, diff = Math.abs(t1 - t2);
  return (
    <Section title="Hours & Minutes Calculator">
      <div className="flex gap-2">
        <Input label="Value" type="number" value={h1} onChange={setH1} /><Input label="Value" type="number" value={m1} onChange={setM1} />
        <span className="self-center text-muted">+</span>
        <Input label="Value" type="number" value={h2} onChange={setH2} /><Input label="Value" type="number" value={m2} onChange={setM2} />
      </div>
      <div className="text-xs">Total: {Math.floor(total / 60)}h {total % 60}m</div>
      <div className="text-xs">Diff: {Math.floor(diff / 60)}h {diff % 60}m</div>
    </Section>
  );
}
// --- MinutesToHoursConverter ---
export function MinutesToHoursConverter() {
  const clr = ac('MinutesToHoursConverter');
  const [mins, setMins] = useState('150');
  const m = Number(mins);
  return (
    <Section title="Minutes → Hours Converter">
      <Input label="Value" type="number" value={mins} onChange={setMins} />
      <div className="text-lg font-bold">{Math.floor(m / 60)}h {m % 60}m</div>
      <div className="text-xs text-muted">Decimal: {(m / 60).toFixed(2)} hours</div>
    </Section>
  );
}
// --- HoursToMinutesTool ---
export function HoursToMinutesTool() {
  const clr = ac('HoursToMinutesTool');
  const [hrs, setHrs] = useState('2.5');
  const h = Number(hrs);
  return (
    <Section title="Hours → Minutes Tool">
      <Input label="Value" type="number" value={hrs} onChange={setHrs} step="0.1" />
      <div className="text-lg font-bold">{Math.floor(h * 60)} minutes</div>
      <div className="text-xs text-muted">{h * 3600} seconds</div>
    </Section>
  );
}
// --- SecondsToMinutesConverter ---
export function SecondsToMinutesConverter() {
  const clr = ac('SecondsToMinutesConverter');
  const [sec, setSec] = useState('3661');
  const s = Number(sec);
  return (
    <Section title="Seconds → Minutes Converter">
      <Input label="Value" type="number" value={sec} onChange={setSec} />
      <div className="text-lg font-bold">{Math.floor(s / 3600)}h {Math.floor((s % 3600) / 60)}m {s % 60}s</div>
    </Section>
  );
}
// --- SpeedConverter ---
export function SpeedConverter() {
  const clr = ac('SpeedConverter');
  const [kmh, setKmh] = useState('100');
  const k = Number(kmh);
  return (
    <Section title="Speed Converter">
      <Input label="Value" type="number" value={kmh} onChange={setKmh} />
      <div className="text-xs space-y-1">
        <div>mph: {(k * 0.621371).toFixed(2)}</div>
        <div>knots: {(k * 0.539957).toFixed(2)}</div>
        <div>m/s: {(k / 3.6).toFixed(2)}</div>
        <div>ft/s: {(k * 0.911344).toFixed(2)}</div>
      </div>
    </Section>
  );
}
// --- LengthConverter ---
export function LengthConverter() {
  const clr = ac('LengthConverter');
  const [meters, setMeters] = useState('100');
  const m = Number(meters);
  return (
    <Section title="Length Converter">
      <Input label="Value" type="number" value={meters} onChange={setMeters} />
      <div className="text-xs space-y-1">
        <div>km: {(m / 1000).toFixed(4)}</div>
        <div>miles: {(m * 0.000621371).toFixed(4)}</div>
        <div>yards: {(m * 1.09361).toFixed(2)}</div>
        <div>feet: {(m * 3.28084).toFixed(2)}</div>
        <div>inches: {(m * 39.3701).toFixed(2)}</div>
      </div>
    </Section>
  );
}
// --- WeightConverter ---
export function WeightConverter() {
  const clr = ac('WeightConverter');
  const [kg, setKg] = useState('70');
  const k = Number(kg);
  return (
    <Section title="Weight Converter">
      <Input label="Value" type="number" value={kg} onChange={setKg} />
      <div className="text-xs space-y-1">
        <div>g: {(k * 1000).toFixed(0)}</div>
        <div>lb: {(k * 2.20462).toFixed(2)}</div>
        <div>oz: {(k * 35.274).toFixed(2)}</div>
        <div>stone: {(k * 0.157473).toFixed(2)}</div>
      </div>
    </Section>
  );
}
// --- VolumeConverter ---
export function VolumeConverter() {
  const clr = ac('VolumeConverter');
  const [liters, setLiters] = useState('1');
  const l = Number(liters);
  return (
    <Section title="Volume Converter">
      <Input label="Value" type="number" value={liters} onChange={setLiters} />
      <div className="text-xs space-y-1">
        <div>mL: {(l * 1000).toFixed(0)}</div>
        <div>gal (US): {(l * 0.264172).toFixed(4)}</div>
        <div>qt: {(l * 1.05669).toFixed(4)}</div>
        <div>fl oz: {(l * 33.814).toFixed(2)}</div>
        <div>cups: {(l * 4.22675).toFixed(2)}</div>
      </div>
    </Section>
  );
}
// --- AreaConverter ---
export function AreaConverter() {
  const clr = ac('AreaConverter');
  const [sqm, setSqm] = useState('100');
  const a = Number(sqm);
  return (
    <Section title="Area Converter">
      <Input label="Value" type="number" value={sqm} onChange={setSqm} />
      <div className="text-xs space-y-1">
        <div>sq ft: {(a * 10.7639).toFixed(2)}</div>
        <div>acres: {(a * 0.000247105).toFixed(6)}</div>
        <div>hectares: {(a * 0.0001).toFixed(6)}</div>
        <div>sq km: {(a / 1e6).toFixed(6)}</div>
      </div>
    </Section>
  );
}
// --- DataSizeConverter ---
export function DataSizeConverter() {
  const clr = ac('DataSizeConverter');
  const [bytes, setBytes] = useState('1073741824');
  const b = Number(bytes);
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const conv = units.map((u, i) => ({ unit: u, value: b / Math.pow(1024, i) }));
  return (
    <Section title="Data Size Converter">
      <Input label="Value" type="number" value={bytes} onChange={setBytes} />
      <div className="text-xs space-y-1">
        {conv.map(c => <div key={c.unit}><span className="text-muted">{c.unit}:</span> {c.value.toFixed(2)}</div>)}
      </div>
    </Section>
  );
}

function parseExpr(input: string): number {
  let pos = 0;
  const s = input.replace(/\s+/g, '');

  function parseExpression(): number {
    let result = parseTerm();
    while (pos < s.length && (s[pos] === '+' || s[pos] === '-')) {
      const op = s[pos++];
      const right = parseTerm();
      result = op === '+' ? result + right : result - right;
    }
    return result;
  }

  function parseTerm(): number {
    let result = parseFactor();
    while (pos < s.length && (s[pos] === '*' || s[pos] === '/')) {
      const op = s[pos++];
      const right = parseFactor();
      result = op === '*' ? result * right : result / right;
    }
    return result;
  }

  function parseFactor(): number {
    if (s[pos] === '(') {
      pos++;
      const result = parseExpression();
      if (s[pos] !== ')') throw new Error('Mismatched parentheses');
      pos++;
      return result;
    }
    if (s[pos] === '-') {
      pos++;
      return -parseFactor();
    }
    if (s[pos] === '+') {
      pos++;
      return parseFactor();
    }
    let start = pos;
    while (pos < s.length && (s[pos] >= '0' && s[pos] <= '9' || s[pos] === '.')) pos++;
    if (start === pos) throw new Error('Expected number');
    return parseFloat(s.slice(start, pos));
  }

  const result = parseExpression();
  if (pos < s.length) throw new Error('Unexpected character');
  return result;
}
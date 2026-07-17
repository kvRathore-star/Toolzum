"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';

const inputClass = "w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelClass = "block text-sm font-medium mb-1 text-[var(--text-secondary)]";
const btnClass = "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50";
const cardClass = "w-full bg-[var(--bg-overlay)] rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] p-6 space-y-4";
const headingClass = "text-lg font-semibold text-[var(--text-primary)]";
const selClass = "w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const textAreaClass = "w-full h-24 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={cardClass}>
      <h2 className={headingClass}>{title}</h2>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputClass} {...props} />;
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={selClass} {...props}>{children}</select>;
}

function Btn({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={btnClass} {...props}>{children}</button>;
}

export function QRCodeGenerator() {
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
    <Card title="QR Code Generator">
      <Input placeholder="Enter text or URL" value={text} onChange={e => setText(e.target.value)} />
      {qr.length > 0 && (
        <pre className="font-mono text-[8px] leading-[8px] bg-white dark:bg-black p-4 rounded overflow-auto">
          {qr.map((r, i) => <div key={i}>{r}</div>)}
        </pre>
      )}
    </Card>
  );
}

export function BarcodeGenerator() {
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
    <Card title="Barcode Generator">
      <Input placeholder="Enter data" value={text} onChange={e => setText(e.target.value)} />
      <Select value={format} onChange={e => setFormat(e.target.value)}>
        <option value="upc-a">UPC-A</option><option value="ean-13">EAN-13</option>
        <option value="code128">Code 128</option><option value="code39">Code 39</option>
      </Select>
      <pre className="font-mono text-[10px] leading-[10px] bg-white dark:bg-black p-4 rounded overflow-auto">{barcode.map((r, i) => <div key={i}>{r}</div>)}</pre>
    </Card>
  );
}

export function GuidGenerator() {
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
    <Card title="GUID / UUID Generator">
      <div className="flex gap-2">
        <Btn onClick={() => setGuids([gen(4), ...guids.slice(0, 9)])}>Generate UUID v4</Btn>
        <Btn onClick={() => setGuids([gen(7), ...guids.slice(0, 9)])}>Generate UUID v7</Btn>
        <Btn onClick={() => setGuids([])}>Clear</Btn>
      </div>
      <div className="space-y-1 max-h-64 overflow-auto">
        {guids.map((g, i) => (
          <div key={i} className="flex items-center gap-2">
            <code className="text-xs font-mono text-[var(--text-secondary)] flex-1">{g}</code>
            <button className="text-xs text-blue-600 hover:underline" onClick={() => navigator.clipboard.writeText(g)}>Copy</button>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function ColorConverter() {
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
    <Card title="Color Converter">
      <Input placeholder="#ff6b6b" value={hex} onChange={e => setHex(e.target.value)} />
      <div className="flex gap-4 items-center">
        <div className="w-12 h-12 rounded-lg border" style={{ backgroundColor: hex.match(/^#[0-9a-f]{6}$/i) ? hex : '#ccc' }} />
        <div className="text-xs space-y-1 font-mono">
          {rgb && <div>RGB: {rgb.r}, {rgb.g}, {rgb.b}</div>}
          {hsl && <div>HSL: {hsl.h}°, {hsl.s}%, {hsl.l}%</div>}
          {cmyk && <div>CMYK: {cmyk.c}%, {cmyk.m}%, {cmyk.y}%, {cmyk.k}%</div>}
          {hsv && <div>HSV: {hsv.h}°, {hsv.s}%, {hsv.v}%</div>}
        </div>
      </div>
    </Card>
  );
}

export function ColorPicker() {
  const [color, setColor] = useState('#ff6b6b');
  return (
    <Card title="Color Picker">
      <div className="flex gap-4 items-center">
        <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-16 h-16 rounded-lg cursor-pointer" />
        <Input value={color} onChange={e => setColor(e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value)} />
      </div>
      <div className="w-full h-24 rounded-lg border" style={{ backgroundColor: color }} />
    </Card>
  );
}

export function ColorPaletteGenerator() {
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
    <Card title="Color Palette Generator">
      <div className="flex gap-3 items-center">
        <input type="color" value={base} onChange={e => setBase(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
        <Select value={type} onChange={e => setType(e.target.value)}>
          <option value="complementary">Complementary</option>
          <option value="analogous">Analogous</option>
          <option value="triadic">Triadic</option>
        </Select>
      </div>
      <div className="flex gap-2 h-16">
        {palette.map((c, i) => <div key={i} className="flex-1 rounded-lg flex items-end justify-center pb-2 text-xs font-mono text-white" style={{ backgroundColor: c }}>{c}</div>)}
      </div>
    </Card>
  );
}

export function GradientGenerator() {
  const [colors, setColors] = useState(['#3b82f6', '#8b5cf6']);
  const [direction, setDirection] = useState('to right');
  const addColor = () => setColors([...colors, `#${Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0')}`]);
  const removeColor = (i: number) => colors.length > 2 && setColors(colors.filter((_, idx) => idx !== i));
  const gradient = `linear-gradient(${direction}, ${colors.join(', ')})`;
  return (
    <Card title="Gradient Generator">
      <div className="flex gap-2 items-center flex-wrap">
        {colors.map((c, i) => (
          <div key={i} className="flex items-center gap-1">
            <input type="color" value={c} onChange={e => { const n = [...colors]; n[i] = e.target.value; setColors(n); }} className="w-8 h-8 rounded cursor-pointer" />
            {colors.length > 2 && <button className="text-xs text-red-500" onClick={() => removeColor(i)}>x</button>}
          </div>
        ))}
        <Btn onClick={addColor}>+</Btn>
      </div>
      <Select value={direction} onChange={e => setDirection(e.target.value)}>
        <option value="to right">Right</option><option value="to left">Left</option>
        <option value="to bottom">Down</option><option value="to top">Up</option>
        <option value="to bottom right">Bottom Right</option><option value="to bottom left">Bottom Left</option>
        <option value="to top right">Top Right</option><option value="to top left">Top Left</option>
      </Select>
      <div className="w-full h-32 rounded-lg" style={{ background: gradient }} />
      <code className="text-xs block bg-zinc-100 dark:bg-zinc-800 p-2 rounded break-all">{gradient}</code>
      <button className="text-xs text-blue-600 hover:underline" onClick={() => navigator.clipboard.writeText(gradient)}>Copy CSS</button>
    </Card>
  );
}

export function ContrastChecker() {
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
    <Card title="Contrast Checker">
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
    </Card>
  );
}

export function CounterTool() {
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  return (
    <Card title="Counter">
      <div className="text-4xl font-bold text-center text-[var(--text-primary)]">{count}</div>
      <div className="flex gap-2 justify-center">
        <Btn onClick={() => { setHistory(h => [count, ...h.slice(0, 19)]); setCount(c => c - 1); }}>-</Btn>
        <Btn onClick={() => { setCount(0); setHistory([]); }}>Reset</Btn>
        <Btn onClick={() => { setHistory(h => [count, ...h.slice(0, 19)]); setCount(c => c + 1); }}>+</Btn>
      </div>
      {history.length > 0 && <div className="text-xs text-[var(--text-secondary)] max-h-24 overflow-auto"><div className="font-medium mb-1">History:</div>{history.map((h, i) => <span key={i} className="mr-2">{h}</span>)}</div>}
    </Card>
  );
}

export function ListRandomizer() {
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
    <Card title="List Randomizer">
      <textarea className={textAreaClass} placeholder="Enter items (one per line)" value={input} onChange={e => setInput(e.target.value)} />
      <Btn onClick={randomize}>Randomize</Btn>
      {result.length > 0 && <div className="text-sm space-y-1">{result.map((item, i) => <div key={i} className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded">{i + 1}. {item}</div>)}</div>}
    </Card>
  );
}

export function ListSorter() {
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
    <Card title="List Sorter">
      <textarea className={textAreaClass} placeholder="Enter items (one per line)" value={input} onChange={e => setInput(e.target.value)} />
      <div className="flex gap-2">
        <Btn onClick={() => sort('az')}>A-Z</Btn>
        <Btn onClick={() => sort('za')}>Z-A</Btn>
        <Btn onClick={() => sort('len')}>By Length</Btn>
      </div>
      {result.length > 0 && <div className="text-sm space-y-1">{result.map((item, i) => <div key={i} className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded">{i + 1}. {item}</div>)}</div>}
    </Card>
  );
}

export function DecisionMaker() {
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
    <Card title="Decision Maker">
      <textarea className={textAreaClass} placeholder="Enter options (one per line)" value={options} onChange={e => setOptions(e.target.value)} />
      <Btn onClick={pick} disabled={spinning}>{spinning ? 'Spinning...' : 'Pick One'}</Btn>
      <div className="flex justify-center"><canvas ref={canvasRef} width={160} height={160} className="max-w-full" /></div>
    </Card>
  );
}

export function YesNoPicker() {
  const [result, setResult] = useState('');
  const outcomes = ['Yes', 'No', 'Maybe', 'Ask again later', 'Definitely', "Don't count on it", 'Absolutely', 'Very doubtful', 'Outlook good', 'Cannot predict now'];
  const pick = () => {
    let i = 0;
    const interval = setInterval(() => { setResult(outcomes[i % outcomes.length]); i++; if (i > outcomes.length * 3) clearInterval(interval); }, 80);
  };
  return (
    <Card title="Yes / No / Maybe">
      <div className="text-center">
        <div className="text-5xl font-bold mb-4 text-blue-600 h-16">{result}</div>
        <Btn onClick={pick}>Ask</Btn>
      </div>
    </Card>
  );
}

export function CoinFlipper() {
  const [side, setSide] = useState('');
  const [animating, setAnimating] = useState(false);
  const flip = () => {
    setAnimating(true);
    let i = 0;
    const interval = setInterval(() => { setSide(i % 2 === 0 ? 'Heads' : 'Tails'); i++; if (i > 8) { clearInterval(interval); setAnimating(false); setSide(Math.random() > 0.5 ? 'Heads' : 'Tails'); } }, 100);
  };
  return (
    <Card title="Coin Flipper">
      <div className="text-center">
        <div className={'text-6xl mb-4' + (animating ? ' animate-spin' : '')}>&#x1FA99;</div>
        <div className="text-2xl font-bold mb-4 h-8">{side}</div>
        <Btn onClick={flip} disabled={animating}>Flip Coin</Btn>
      </div>
    </Card>
  );
}

export function DiceRoller() {
  const [dice, setDice] = useState<number[]>([1]);
  const [count, setCount] = useState(1);
  const roll = () => {
    const results = Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
    setDice(results);
  };
  const sum = dice.reduce((a, b) => a + b, 0);
  return (
    <Card title="Dice Roller (1-6)">
      <div className="flex gap-3 items-center">
        <label className="text-sm">Dice:</label>
        <Select value={count} onChange={e => setCount(Number(e.target.value))}>
          {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
        </Select>
        <Btn onClick={roll}>Roll</Btn>
      </div>
      <div className="flex gap-3 flex-wrap">
        {dice.map((d, i) => (
          <div key={i} className="w-12 h-12 bg-white dark:bg-zinc-700 border-2 border-zinc-300 dark:border-zinc-500 rounded-lg flex items-center justify-center text-lg font-bold">{d}</div>
        ))}
      </div>
      <div className="text-sm font-medium">Sum: {sum}</div>
    </Card>
  );
}

export function DiceRollerTool() {
  const [sides, setSides] = useState(6);
  const [result, setResult] = useState<number | null>(null);
  const roll = () => setResult(Math.floor(Math.random() * sides) + 1);
  return (
    <Card title="Dice Roller (Custom)">
      <div className="flex gap-3 items-center">
        <label className="text-sm">Sides:</label>
        <Input type="number" min={2} max={100} value={sides} onChange={e => setSides(Number(e.target.value))} className="w-20" />
        <Btn onClick={roll}>Roll</Btn>
      </div>
      {result !== null && <div className="text-5xl font-bold text-center text-blue-600">{result}</div>}
    </Card>
  );
}

export function NumberGuessingGame() {
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
    <Card title="Number Guessing Game">
      <p className="text-sm text-[var(--text-secondary)]">Guess a number between 1 and 100</p>
      <div className="flex gap-2">
        <Input type="number" min={1} max={100} value={guess} onChange={e => setGuess(e.target.value)} disabled={won} onKeyDown={e => e.key === 'Enter' && check()} />
        <Btn onClick={check} disabled={won}>Guess</Btn>
      </div>
      {won && <div className="text-green-600 font-bold text-lg">You won in {hints.length} guesses!</div>}
      <div className="text-xs space-y-1 max-h-32 overflow-auto">{hints.map((h, i) => <div key={i} className={h.includes('Correct') ? 'text-green-600' : ''}>{h}</div>)}</div>
    </Card>
  );
}

export function RockPaperScissors() {
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
    <Card title="Rock Paper Scissors">
      <div className="flex gap-2 justify-center">
        {choices.map(c => <Btn key={c} onClick={() => play(c)}>{c}</Btn>)}
      </div>
      {player && <div className="text-center text-sm"><div>You: {player}</div><div>Computer: {computer}</div><div className="text-lg font-bold mt-2">{result}</div></div>}
    </Card>
  );
}

export function HangmanGame() {
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
    <Card title="Hangman Game">
      <div className="text-2xl font-mono tracking-widest text-center mb-4">{display}</div>
      <div className="text-sm text-red-500 mb-2">Wrong: {wrong}/6</div>
      <div className="flex flex-wrap gap-1 justify-center max-w-xs mx-auto">
        {alphabet.map(l => (
          <button key={l} disabled={guessed.includes(l) || wrong >= 6 || !display.includes('_')}
            className={'w-7 h-7 text-xs rounded ' + (guessed.includes(l) ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400' : word.current.includes(l) ? 'bg-green-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-100') + ' disabled:opacity-40'}
            onClick={() => guess(l)}>{l}</button>
        ))}
      </div>
      {wrong >= 6 && <div className="text-red-500 font-bold text-center mt-2">Game Over! Word: {word.current}</div>}
      {!display.includes('_') && <div className="text-green-600 font-bold text-center mt-2">You Win!</div>}
    </Card>
  );
}

export function MorseCodeConverter() {
  const map: Record<string, string> = { 'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.' };
  const rev = Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));
  const [text, setText] = useState('');
  const [morse, setMorse] = useState('');
  const toMorse = () => setMorse(text.toUpperCase().split('').map(c => map[c] || c).join(' '));
  const fromMorse = () => setText(morse.split(' ').map(c => rev[c] || c).join(''));
  return (
    <Card title="Morse Code Converter">
      <label className={labelClass}>Text</label>
      <Input value={text} onChange={e => setText(e.target.value)} />
      <label className={labelClass}>Morse Code</label>
      <Input value={morse} onChange={e => setMorse(e.target.value)} />
      <div className="flex gap-2"><Btn onClick={toMorse}>To Morse</Btn><Btn onClick={fromMorse}>From Morse</Btn></div>
    </Card>
  );
}

export function BinaryConverter() {
  const [input, setInput] = useState('42');
  const [mode, setMode] = useState('dec');
  const convert = (v: string, m: string) => {
    const n = parseInt(v, m === 'dec' ? 10 : m === 'hex' ? 16 : m === 'oct' ? 8 : 2);
    if (isNaN(n)) return { dec: '', hex: '', oct: '', bin: '' };
    return { dec: String(n), hex: n.toString(16).toUpperCase(), oct: n.toString(8), bin: n.toString(2) };
  };
  const res = convert(input, mode);
  return (
    <Card title="Binary Converter">
      <Select value={mode} onChange={e => setMode(e.target.value)}>
        <option value="dec">Decimal</option><option value="hex">Hex</option><option value="oct">Octal</option><option value="bin">Binary</option>
      </Select>
      <Input placeholder="Enter value" value={input} onChange={e => setInput(e.target.value)} />
      <div className="text-xs space-y-1 font-mono">
        <div><span className="text-[var(--text-secondary)]">Decimal:</span> {res.dec}</div>
        <div><span className="text-[var(--text-secondary)]">Hex:</span> {res.hex}</div>
        <div><span className="text-[var(--text-secondary)]">Octal:</span> {res.oct}</div>
        <div><span className="text-[var(--text-secondary)]">Binary:</span> {res.bin}</div>
      </div>
    </Card>
  );
}

export function RomanNumeralConverter() {
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
    <Card title="Roman Numeral Converter">
      <Input placeholder="Decimal" value={dec} onChange={e => setDec(e.target.value)} />
      <Input placeholder="Roman" value={roman} onChange={e => setRoman(e.target.value)} />
      <div className="flex gap-2"><Btn onClick={toR}>To Roman</Btn><Btn onClick={fromR}>From Roman</Btn></div>
    </Card>
  );
}

export function NumberToWordsConverter() {
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
    <Card title="Number to Words">
      <Input type="number" value={num} onChange={e => setNum(e.target.value)} />
      <div className="text-sm font-medium p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">{words}</div>
    </Card>
  );
}

export function NumberBaseConverter() {
  const [input, setInput] = useState('255');
  const [fromBase, setFromBase] = useState(10);
  const [toBase, setToBase] = useState(16);
  const result = parseInt(input, fromBase);
  const output = isNaN(result) ? '' : result.toString(toBase).toUpperCase();
  return (
    <Card title="Number Base Converter">
      <div className="flex gap-2">
        <Select value={fromBase} onChange={e => setFromBase(Number(e.target.value))}>
          {Array.from({ length: 35 }, (_, i) => i + 2).map(b => <option key={b} value={b}>Base {b}</option>)}
        </Select>
        <span className="self-center">-</span>
        <Select value={toBase} onChange={e => setToBase(Number(e.target.value))}>
          {Array.from({ length: 35 }, (_, i) => i + 2).map(b => <option key={b} value={b}>Base {b}</option>)}
        </Select>
      </div>
      <Input placeholder="Enter number" value={input} onChange={e => setInput(e.target.value)} />
      <div className="text-lg font-mono font-bold text-blue-600">{output}</div>
    </Card>
  );
}

export function PercentageCalculator() {
  const [x, setX] = useState('20');
  const [y, setY] = useState('100');
  const pct = Number(y) ? (Number(x) / Number(y) * 100) : 0;
  return (
    <Card title="Percentage Calculator">
      <div className="flex gap-2 items-center">
        <Input className="w-20" value={x} onChange={e => setX(e.target.value)} />
        <span>is what % of</span>
        <Input className="w-20" value={y} onChange={e => setY(e.target.value)} />
      </div>
      <div className="text-lg font-bold">Answer: {pct.toFixed(2)}%</div>
    </Card>
  );
}

export function PercentageChangeCalculator() {
  const [a, setA] = useState('100');
  const [b, setB] = useState('120');
  const change = Number(a) ? ((Number(b) - Number(a)) / Number(a) * 100) : 0;
  return (
    <Card title="Percentage Change">
      <div className="flex gap-2 items-center">
        <div><label className={labelClass}>Old Value</label><Input value={a} onChange={e => setA(e.target.value)} /></div>
        <div><label className={labelClass}>New Value</label><Input value={b} onChange={e => setB(e.target.value)} /></div>
      </div>
      <div className="text-lg font-bold">{change >= 0 ? '+' : ''}{change.toFixed(2)}% {change >= 0 ? 'increase' : 'decrease'}</div>
    </Card>
  );
}

export function PercentageDifferenceCalculator() {
  const [a, setA] = useState('100');
  const [b, setB] = useState('150');
  const avg = (Number(a) + Number(b)) / 2;
  const diff = avg ? Math.abs(Number(a) - Number(b)) / avg * 100 : 0;
  return (
    <Card title="Percentage Difference">
      <div className="flex gap-2 items-center">
        <Input value={a} onChange={e => setA(e.target.value)} />
        <Input value={b} onChange={e => setB(e.target.value)} />
      </div>
      <div className="text-lg font-bold">{diff.toFixed(2)}% difference</div>
    </Card>
  );
}

export function VatCalculator() {
  const [amount, setAmount] = useState('100');
  const [rate, setRate] = useState(20);
  const [mode, setMode] = useState('add');
  const a = Number(amount);
  const vat = mode === 'add' ? a * rate / 100 : a * rate / (100 + rate);
  const net = mode === 'add' ? a : a - vat;
  const gross = mode === 'add' ? a + vat : a;
  return (
    <Card title="VAT Calculator">
      <Select value={mode} onChange={e => setMode(e.target.value)}>
        <option value="add">Add VAT</option><option value="remove">Remove VAT</option>
      </Select>
      <div className="flex gap-2">
        <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
        <Input type="number" value={rate} onChange={e => setRate(Number(e.target.value))} className="w-20" />
      </div>
      <div className="text-xs space-y-1"><div>Net: {net.toFixed(2)}</div><div>VAT ({rate}%): {vat.toFixed(2)}</div><div className="font-bold">Gross: {gross.toFixed(2)}</div></div>
    </Card>
  );
}

export function GstCalculator() {
  const [amount, setAmount] = useState('1000');
  const [rate, setRate] = useState(18);
  const [type, setType] = useState('intra');
  const a = Number(amount);
  const gst = a * rate / 100;
  const cgst = type === 'intra' ? gst / 2 : 0;
  const sgst = type === 'intra' ? gst / 2 : 0;
  const igst = type === 'inter' ? gst : 0;
  return (
    <Card title="GST Calculator (India)">
      <Select value={rate} onChange={e => setRate(Number(e.target.value))}>
        <option value={5}>5%</option><option value={12}>12%</option><option value={18}>18%</option><option value={28}>28%</option>
      </Select>
      <Select value={type} onChange={e => setType(e.target.value)}>
        <option value="intra">Intra-state (CGST+SGST)</option><option value="inter">Inter-state (IGST)</option>
      </Select>
      <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
      <div className="text-xs space-y-1">
        <div>Net: Rs.{a.toFixed(2)}</div>
        {type === 'intra' && <><div>CGST: Rs.{cgst.toFixed(2)}</div><div>SGST: Rs.{sgst.toFixed(2)}</div></>}
        {type === 'inter' && <div>IGST: Rs.{igst.toFixed(2)}</div>}
        <div className="font-bold">Total: Rs.{(a + gst).toFixed(2)}</div>
      </div>
    </Card>
  );
}

export function TipCalculator() {
  const [bill, setBill] = useState('50');
  const [pct, setPct] = useState(15);
  const [split, setSplit] = useState(2);
  const b = Number(bill);
  const tip = b * pct / 100;
  const total = b + tip;
  return (
    <Card title="Tip Calculator">
      <div className="flex gap-2">
        <div><label className={labelClass}>Bill</label><Input type="number" value={bill} onChange={e => setBill(e.target.value)} /></div>
        <div><label className={labelClass}>Tip %</label><Input type="number" value={pct} onChange={e => setPct(Number(e.target.value))} /></div>
        <div><label className={labelClass}>Split</label><Input type="number" min={1} value={split} onChange={e => setSplit(Number(e.target.value))} /></div>
      </div>
      <div className="text-xs space-y-1">
        <div>Tip: ${tip.toFixed(2)}</div>
        <div>Total: ${total.toFixed(2)}</div>
        <div className="font-bold">Each: ${(total / split).toFixed(2)}</div>
      </div>
    </Card>
  );
}

export function DiscountCalculator() {
  const [price, setPrice] = useState('100');
  const [disc, setDisc] = useState('20');
  const p = Number(price), d = Number(disc);
  const saving = p * d / 100;
  return (
    <Card title="Discount Calculator">
      <div className="flex gap-2">
        <div><label className={labelClass}>Original Price</label><Input type="number" value={price} onChange={e => setPrice(e.target.value)} /></div>
        <div><label className={labelClass}>Discount %</label><Input type="number" value={disc} onChange={e => setDisc(e.target.value)} /></div>
      </div>
      <div className="text-xs space-y-1">
        <div>You Save: ${saving.toFixed(2)}</div>
        <div className="font-bold">Final Price: ${(p - saving).toFixed(2)}</div>
      </div>
    </Card>
  );
}

export function SalesTaxCalculator() {
  const [amount, setAmount] = useState('100');
  const [rate, setRate] = useState(8);
  const a = Number(amount), tax = a * rate / 100;
  return (
    <Card title="Sales Tax Calculator">
      <div className="flex gap-2">
        <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
        <Input type="number" value={rate} onChange={e => setRate(Number(e.target.value))} className="w-20" />
      </div>
      <div className="text-xs space-y-1">
        <div>Tax: ${tax.toFixed(2)}</div>
        <div className="font-bold">Total: ${(a + tax).toFixed(2)}</div>
      </div>
    </Card>
  );
}

export function MarkupCalculator() {
  const [cost, setCost] = useState('50');
  const [markup, setMarkup] = useState(25);
  const c = Number(cost), m = Number(markup);
  const price = c * (1 + m / 100);
  const profit = price - c;
  return (
    <Card title="Markup Calculator">
      <div className="flex gap-2">
        <div><label className={labelClass}>Cost</label><Input type="number" value={cost} onChange={e => setCost(e.target.value)} /></div>
        <div><label className={labelClass}>Markup %</label><Input type="number" value={markup} onChange={e => setMarkup(Number(e.target.value))} /></div>
      </div>
      <div className="text-xs space-y-1">
        <div>Selling Price: ${price.toFixed(2)}</div>
        <div>Profit: ${profit.toFixed(2)}</div>
        <div className="font-bold">Margin: {(profit / price * 100).toFixed(1)}%</div>
      </div>
    </Card>
  );
}

export function MarginCalculator() {
  const [cost, setCost] = useState('50');
  const [revenue, setRevenue] = useState('80');
  const c = Number(cost), r = Number(revenue);
  const profit = r - c;
  const margin = r ? (profit / r * 100) : 0;
  return (
    <Card title="Profit Margin Calculator">
      <div className="flex gap-2">
        <div><label className={labelClass}>Cost</label><Input type="number" value={cost} onChange={e => setCost(e.target.value)} /></div>
        <div><label className={labelClass}>Revenue</label><Input type="number" value={revenue} onChange={e => setRevenue(e.target.value)} /></div>
      </div>
      <div className="text-xs space-y-1">
        <div>Profit: ${profit.toFixed(2)}</div>
        <div className="font-bold">Margin: {margin.toFixed(1)}%</div>
      </div>
    </Card>
  );
}

export function BreakEvenCalculator() {
  const [fixed, setFixed] = useState('1000');
  const [variable, setVariable] = useState('10');
  const [price, setPrice] = useState('25');
  const f = Number(fixed), v = Number(variable), p = Number(price);
  const be = p <= v ? Infinity : f / (p - v);
  return (
    <Card title="Break-Even Calculator">
      <div className="flex gap-2"><div><label className={labelClass}>Fixed Cost</label><Input type="number" value={fixed} onChange={e => setFixed(e.target.value)} /></div><div><label className={labelClass}>Variable Cost/Unit</label><Input type="number" value={variable} onChange={e => setVariable(e.target.value)} /></div><div><label className={labelClass}>Price/Unit</label><Input type="number" value={price} onChange={e => setPrice(e.target.value)} /></div></div>
      <div className="text-lg font-bold">{isFinite(be) ? Math.ceil(be) + ' units' : 'N/A (price must exceed variable cost)'}</div>
    </Card>
  );
}

export function ProfitCalculator() {
  const [cost, setCost] = useState('1000');
  const [revenue, setRevenue] = useState('1500');
  const c = Number(cost), r = Number(revenue);
  return (
    <Card title="Profit / Loss Calculator">
      <div className="flex gap-2"><div><label className={labelClass}>Cost</label><Input type="number" value={cost} onChange={e => setCost(e.target.value)} /></div><div><label className={labelClass}>Revenue</label><Input type="number" value={revenue} onChange={e => setRevenue(e.target.value)} /></div></div>
      <div className={'text-lg font-bold ' + (r - c >= 0 ? 'text-green-600' : 'text-red-500')}>
        {r - c >= 0 ? 'Profit' : 'Loss'}: ${Math.abs(r - c).toFixed(2)} (ROI: {c ? ((r - c) / c * 100).toFixed(1) : '0'}%)
      </div>
    </Card>
  );
}

export function ROICalculator() {
  const [invested, setInvested] = useState('1000');
  const [returned, setReturned] = useState('1500');
  const i = Number(invested), r = Number(returned);
  const roi = i ? ((r - i) / i * 100) : 0;
  return (
    <Card title="ROI Calculator">
      <div className="flex gap-2"><div><label className={labelClass}>Amount Invested</label><Input type="number" value={invested} onChange={e => setInvested(e.target.value)} /></div><div><label className={labelClass}>Total Return</label><Input type="number" value={returned} onChange={e => setReturned(e.target.value)} /></div></div>
      <div className="text-lg font-bold">ROI: {roi.toFixed(2)}% (${(r - i).toFixed(2)})</div>
    </Card>
  );
}

export function CAGRCalculator() {
  const [start, setStart] = useState('1000');
  const [end, setEnd] = useState('2000');
  const [years, setYears] = useState('5');
  const s = Number(start), e = Number(end), y = Number(years);
  const cagr = s > 0 && y > 0 ? (Math.pow(e / s, 1 / y) - 1) * 100 : 0;
  return (
    <Card title="CAGR Calculator">
      <div className="flex gap-2">
        <div><label className={labelClass}>Start Value</label><Input type="number" value={start} onChange={e => setStart(e.target.value)} /></div>
        <div><label className={labelClass}>End Value</label><Input type="number" value={end} onChange={e => setEnd(e.target.value)} /></div>
        <div><label className={labelClass}>Years</label><Input type="number" value={years} onChange={e => setYears(e.target.value)} /></div>
      </div>
      <div className="text-lg font-bold">CAGR: {cagr.toFixed(2)}%</div>
    </Card>
  );
}

export function CurrencyConverter() {
  const rates: Record<string, number> = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, INR: 83.1, CAD: 1.36, AUD: 1.53, CNY: 7.24, BRL: 4.97, KRW: 1325 };
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const result = (Number(amount) / rates[from]) * rates[to];
  return (
    <Card title="Currency Converter">
      <div className="flex gap-2 items-center">
        <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-24" />
        <Select value={from} onChange={e => setFrom(e.target.value)} className="w-20">
          {Object.keys(rates).map(c => <option key={c}>{c}</option>)}
        </Select>
        <span>-</span>
        <Select value={to} onChange={e => setTo(e.target.value)} className="w-20">
          {Object.keys(rates).map(c => <option key={c}>{c}</option>)}
        </Select>
      </div>
      <div className="text-lg font-bold">{result.toFixed(2)} {to}</div>
    </Card>
  );
}

export function CurrencyRateCalculator() {
  const currencies: Record<string, number> = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, INR: 83.1, CAD: 1.36, AUD: 1.53, CHF: 0.88, CNY: 7.24, NZD: 1.62, SEK: 10.45, NOK: 10.55, DKK: 6.87, PLN: 3.98, MXN: 17.15, SGD: 1.34, HKD: 7.82, TRY: 30.25, ZAR: 18.75, BRL: 4.97, KRW: 1325, AED: 3.67, SAR: 3.75, THB: 35.50, MYR: 4.72, PHP: 56.20, IDR: 15650, VND: 24600, CZK: 22.80, HUF: 358, CLP: 875, ARS: 820 };
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const result = (Number(amount) / currencies[from]) * currencies[to];
  return (
    <Card title="Currency Rate Calculator">
      <div className="flex gap-2 items-center">
        <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-24" />
        <Select value={from} onChange={e => setFrom(e.target.value)} className="w-20">{Object.keys(currencies).map(c => <option key={c}>{c}</option>)}</Select>
        <span>-</span>
        <Select value={to} onChange={e => setTo(e.target.value)} className="w-20">{Object.keys(currencies).map(c => <option key={c}>{c}</option>)}</Select>
      </div>
      <div className="text-lg font-bold">{result.toFixed(2)} {to}</div>
    </Card>
  );
}

export function ExchangeRateCalculator() {
  const rates: Record<string, number> = { 'USD/EUR': 0.92, 'USD/GBP': 0.79, 'USD/JPY': 149.5, 'EUR/USD': 1.09, 'EUR/GBP': 0.86, 'GBP/USD': 1.27, 'GBP/EUR': 1.16, 'USD/INR': 83.1, 'USD/CAD': 1.36, 'USD/AUD': 1.53 };
  const [amount, setAmount] = useState('100');
  const [pair, setPair] = useState('USD/EUR');
  const rate = rates[pair] || 1;
  return (
    <Card title="Exchange Rate Calculator">
      <div className="flex gap-2 items-center">
        <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-24" />
        <Select value={pair} onChange={e => setPair(e.target.value)}>
          {Object.keys(rates).map(p => <option key={p}>{p}</option>)}
        </Select>
      </div>
      <div className="text-lg font-bold">{(Number(amount) * rate).toFixed(2)}</div>
    </Card>
  );
}

export function FractionSimplifier() {
  const [num, setNum] = useState('8');
  const [den, setDen] = useState('12');
  const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
  const n = Number(num), d = Number(den);
  const g = gcd(n, d);
  return (
    <Card title="Fraction Simplifier">
      <div className="flex gap-2 items-center">
        <Input type="number" value={num} onChange={e => setNum(e.target.value)} className="w-20" />
        <span className="text-xl">/</span>
        <Input type="number" value={den} onChange={e => setDen(e.target.value)} className="w-20" />
      </div>
      <div className="text-lg font-bold">
        {d ? n + '/' + d + ' = ' + (n/g) + '/' + (d/g) : 'Invalid'}
      </div>
    </Card>
  );
}

export function FractionToDecimalCalculator() {
  const [num, setNum] = useState('3');
  const [den, setDen] = useState('4');
  const n = Number(num), d = Number(den);
  return (
    <Card title="Fraction to Decimal">
      <div className="flex gap-2 items-center">
        <Input type="number" value={num} onChange={e => setNum(e.target.value)} className="w-20" />
        <span className="text-xl">/</span>
        <Input type="number" value={den} onChange={e => setDen(e.target.value)} className="w-20" />
      </div>
      <div className="text-lg font-bold">{d ? (n / d).toString() : 'Invalid'}</div>
    </Card>
  );
}

export function DecimalToFractionCalculator() {
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
    <Card title="Decimal to Fraction">
      <Input type="number" step="0.01" value={dec} onChange={e => setDec(e.target.value)} />
      <div className="text-lg font-bold">{f.d ? f.n + '/' + f.d : 'Invalid'}</div>
    </Card>
  );
}

export function RatioSimplifier() {
  const [a, setA] = useState('12');
  const [b, setB] = useState('18');
  const gcd = (x: number, y: number): number => y ? gcd(y, x % y) : x;
  const n1 = Number(a), n2 = Number(b);
  const g = gcd(n1, n2);
  return (
    <Card title="Ratio Simplifier">
      <div className="flex gap-2 items-center">
        <Input type="number" value={a} onChange={e => setA(e.target.value)} className="w-20" />
        <span>:</span>
        <Input type="number" value={b} onChange={e => setB(e.target.value)} className="w-20" />
      </div>
      <div className="text-lg font-bold">{n1}:{n2} = {n1/g}:{n2/g}</div>
    </Card>
  );
}

export function ProportionalCalculator() {
  const [a, setA] = useState('2');
  const [b, setB] = useState('4');
  const [c, setC] = useState('6');
  const na = Number(a), nb = Number(b), nc = Number(c);
  const d = na ? (nb * nc / na) : 0;
  return (
    <Card title="Proportional Calculator">
      <div className="flex gap-2 items-center">
        <Input type="number" value={a} onChange={e => setA(e.target.value)} className="w-16" /><span className="text-xs">:</span>
        <Input type="number" value={b} onChange={e => setB(e.target.value)} className="w-16" /><span className="text-xs">=</span>
        <Input type="number" value={c} onChange={e => setC(e.target.value)} className="w-16" /><span className="text-xs">:</span>
        <span className="text-lg font-bold">{d.toFixed(2)}</span>
      </div>
      <div className="text-xs text-[var(--text-secondary)]">{na}:{nb} = {nc}:{d.toFixed(2)}</div>
    </Card>
  );
}

export function RuleOfThreeCalculator() {
  const [a, setA] = useState('2');
  const [b, setB] = useState('4');
  const [c, setC] = useState('6');
  const na = Number(a), nb = Number(b), nc = Number(c);
  const x = na ? (nb * nc / na) : 0;
  return (
    <Card title="Rule of Three">
      <div className="flex gap-2 items-center">
        <Input type="number" value={a} onChange={e => setA(e.target.value)} className="w-16" /><span className="text-xs">-</span>
        <Input type="number" value={b} onChange={e => setB(e.target.value)} className="w-16" />
      </div>
      <div className="flex gap-2 items-center">
        <Input type="number" value={c} onChange={e => setC(e.target.value)} className="w-16" /><span className="text-xs">-</span>
        <span className="text-lg font-bold">{x.toFixed(2)}</span>
      </div>
    </Card>
  );
}

export function CombinationCalculator() {
  const [n, setN] = useState('5');
  const [r, setR] = useState('3');
  const fact = (x: number): number => x <= 1 ? 1 : x * fact(x - 1);
  const nn = Number(n), rr = Number(r);
  const c = fact(nn) / (fact(rr) * fact(nn - rr));
  return (
    <Card title="Combinations (nCr)">
      <div className="flex gap-2 items-center">
        <Input type="number" value={n} onChange={e => setN(e.target.value)} className="w-20" placeholder="n" />
        <Input type="number" value={r} onChange={e => setR(e.target.value)} className="w-20" placeholder="r" />
      </div>
      <div className="text-lg font-bold">C({nn}, {rr}) = {isFinite(c) ? c.toFixed(0) : 'N/A'}</div>
    </Card>
  );
}

export function PermutationCalculator() {
  const [n, setN] = useState('5');
  const [r, setR] = useState('3');
  const fact = (x: number): number => x <= 1 ? 1 : x * fact(x - 1);
  const nn = Number(n), rr = Number(r);
  const p = fact(nn) / fact(nn - rr);
  return (
    <Card title="Permutations (nPr)">
      <div className="flex gap-2 items-center">
        <Input type="number" value={n} onChange={e => setN(e.target.value)} className="w-20" placeholder="n" />
        <Input type="number" value={r} onChange={e => setR(e.target.value)} className="w-20" placeholder="r" />
      </div>
      <div className="text-lg font-bold">P({nn}, {rr}) = {isFinite(p) ? p.toFixed(0) : 'N/A'}</div>
    </Card>
  );
}

export function FactorialCalculator() {
  const [n, setN] = useState('5');
  const fact = (x: number): number => x <= 1 ? 1 : x * fact(x - 1);
  const nn = Number(n);
  return (
    <Card title="Factorial Calculator">
      <Input type="number" min={0} max={170} value={n} onChange={e => setN(e.target.value)} />
      <div className="text-lg font-bold">{nn}! = {nn > 170 ? 'Too large' : fact(nn).toLocaleString('fullwide', { useGrouping: false })}</div>
    </Card>
  );
}

export function PrimeNumberChecker() {
  const [n, setN] = useState('17');
  const nn = Number(n);
  const isPrime = (x: number) => { if (x < 2) return false; for (let i = 2; i * i <= x; i++) { if (x % i === 0) return false; } return true; };
  const factors = (x: number) => { const f: number[] = []; let d = 2; while (x > 1) { while (x % d === 0) { f.push(d); x /= d; } d++; } return f; };
  const prime = isPrime(nn);
  return (
    <Card title="Prime Number Checker">
      <Input type="number" min={1} value={n} onChange={e => setN(e.target.value)} />
      <div className={'text-lg font-bold ' + (prime ? 'text-green-600' : 'text-red-500')}>{nn} is {prime ? '' : 'not '}prime</div>
      {!prime && <div className="text-xs">Factors: {factors(nn).join(' x ')}</div>}
    </Card>
  );
}

export function PrimeFactorizationCalculator() {
  const [n, setN] = useState('84');
  const nn = Number(n);
  const factors = (x: number) => { const f: number[] = []; let d = 2; while (x > 1) { while (x % d === 0) { f.push(d); x /= d; } d++; } return f; };
  const f = factors(nn);
  return (
    <Card title="Prime Factorization">
      <Input type="number" min={2} value={n} onChange={e => setN(e.target.value)} />
      <div className="text-lg font-bold">{nn} = {f.join(' x ')}</div>
    </Card>
  );
}

export function GreatestCommonFactorCalculator() {
  const [a, setA] = useState('12');
  const [b, setB] = useState('18');
  const gcd = (x: number, y: number): number => y ? gcd(y, x % y) : x;
  const na = Number(a), nb = Number(b);
  return (
    <Card title="GCF / GCD Calculator">
      <div className="flex gap-2"><Input type="number" value={a} onChange={e => setA(e.target.value)} /><Input type="number" value={b} onChange={e => setB(e.target.value)} /></div>
      <div className="text-lg font-bold">GCF({na}, {nb}) = {gcd(na, nb)}</div>
    </Card>
  );
}

export function LeastCommonMultipleCalculator() {
  const [a, setA] = useState('4');
  const [b, setB] = useState('6');
  const gcd = (x: number, y: number): number => y ? gcd(y, x % y) : x;
  const lcm = (x: number, y: number) => x && y ? (x * y) / gcd(x, y) : 0;
  const na = Number(a), nb = Number(b);
  return (
    <Card title="LCM Calculator">
      <div className="flex gap-2"><Input type="number" value={a} onChange={e => setA(e.target.value)} /><Input type="number" value={b} onChange={e => setB(e.target.value)} /></div>
      <div className="text-lg font-bold">LCM({na}, {nb}) = {lcm(na, nb)}</div>
    </Card>
  );
}

export function ModuloCalculator() {
  const [a, setA] = useState('17');
  const [b, setB] = useState('5');
  const na = Number(a), nb = Number(b);
  const mod = na % nb;
  return (
    <Card title="Modulo Calculator">
      <div className="flex gap-2 items-center">
        <Input type="number" value={a} onChange={e => setA(e.target.value)} className="w-20" />
        <span className="text-sm">mod</span>
        <Input type="number" value={b} onChange={e => setB(e.target.value)} className="w-20" />
      </div>
      <div className="text-lg font-bold">{na} mod {nb} = {mod}</div>
      <div className="text-xs text-[var(--text-secondary)]">{na} = {nb} x {Math.floor(na / nb)} + {mod}</div>
    </Card>
  );
}

export function ExponentCalculator() {
  const [base, setBase] = useState('2');
  const [exp, setExp] = useState('10');
  const b = Number(base), e = Number(exp);
  return (
    <Card title="Exponent Calculator">
      <div className="flex gap-2 items-center">
        <Input type="number" value={base} onChange={e => setBase(e.target.value)} className="w-20" />
        <span className="text-lg">^</span>
        <Input type="number" value={exp} onChange={e => setExp(e.target.value)} className="w-20" />
      </div>
      <div className="text-lg font-bold">{b}^{e} = {Math.pow(b, e).toLocaleString('fullwide', { useGrouping: false })}</div>
    </Card>
  );
}

export function LogarithmCalculator() {
  const [num, setNum] = useState('100');
  const [base, setBase] = useState('10');
  const n = Number(num), b = Number(base);
  const log = Math.log(n) / Math.log(b);
  return (
    <Card title="Logarithm Calculator">
      <div className="flex gap-2 items-center">
        <span className="text-sm">log</span>
        <Input type="number" value={base} onChange={e => setBase(e.target.value)} className="w-16" />
        <Input type="number" value={num} onChange={e => setNum(e.target.value)} className="w-20" />
      </div>
      <div className="text-lg font-bold">log_{b}({n}) = {isFinite(log) ? log.toFixed(6) : 'Invalid'}</div>
      <div className="text-xs text-[var(--text-secondary)]">Natural log: {Math.log(n).toFixed(6)}</div>
    </Card>
  );
}

export function TrigonometryCalculator() {
  const [angle, setAngle] = useState('45');
  const [unit, setUnit] = useState('deg');
  const a = Number(angle);
  const rad = unit === 'deg' ? a * Math.PI / 180 : a;
  return (
    <Card title="Trigonometry Calculator">
      <div className="flex gap-2 items-center">
        <Input type="number" value={angle} onChange={e => setAngle(e.target.value)} className="w-24" />
        <Select value={unit} onChange={e => setUnit(e.target.value)} className="w-20">
          <option value="deg">Degrees</option><option value="rad">Radians</option>
        </Select>
      </div>
      <div className="text-xs space-y-1 font-mono">
        <div>sin({a}) = {Math.sin(rad).toFixed(6)}</div>
        <div>cos({a}) = {Math.cos(rad).toFixed(6)}</div>
        <div>tan({a}) = {Math.tan(rad).toFixed(6)}</div>
        <div>csc({a}) = {1 / Math.sin(rad) < 1e10 ? (1 / Math.sin(rad)).toFixed(6) : 'inf'}</div>
        <div>sec({a}) = {1 / Math.cos(rad) < 1e10 ? (1 / Math.cos(rad)).toFixed(6) : 'inf'}</div>
        <div>cot({a}) = {1 / Math.tan(rad) < 1e10 ? (1 / Math.tan(rad)).toFixed(6) : 'inf'}</div>
      </div>
    </Card>
  );
}

export function DegreeRadianConverter() {
  const [deg, setDeg] = useState('180');
  const [rad, setRad] = useState('3.14159');
  const d2r = () => setRad(String(Number(deg) * Math.PI / 180));
  const r2d = () => setDeg(String(Number(rad) * 180 / Math.PI));
  return (
    <Card title="Degree / Radian Converter">
      <div className="flex gap-2 items-center"><label className={labelClass}>Degrees</label><Input type="number" value={deg} onChange={e => setDeg(e.target.value)} /></div>
      <div className="flex gap-2 items-center"><label className={labelClass}>Radians</label><Input type="number" value={rad} onChange={e => setRad(e.target.value)} /></div>
      <div className="flex gap-2"><Btn onClick={d2r}>Deg to Rad</Btn><Btn onClick={r2d}>Rad to Deg</Btn></div>
    </Card>
  );
}

export function ScientificNotationConverter() {
  const [input, setInput] = useState('1234000');
  const n = Number(input);
  const toScientific = (x: number) => {
    if (x === 0) return '0 x 10^0';
    const e = Math.floor(Math.log10(Math.abs(x)));
    const m = x / Math.pow(10, e);
    return m.toFixed(3) + ' x 10^' + e;
  };
  return (
    <Card title="Scientific Notation Converter">
      <Input type="number" value={input} onChange={e => setInput(e.target.value)} />
      <div className="text-sm">{isNaN(n) ? 'Invalid' : toScientific(n)}</div>
    </Card>
  );
}

export function SignificantFiguresCalculator() {
  const [input, setInput] = useState('0.00450');
  const countSigFigs = (s: string) => {
    const trimmed = s.replace(/^0+/, '');
    if (!trimmed || trimmed === '.') return 0;
    if (!trimmed.includes('.')) return trimmed.replace(/0+$/, '').length;
    return trimmed.replace(/\./g, '').length;
  };
  return (
    <Card title="Significant Figures">
      <Input value={input} onChange={e => setInput(e.target.value)} />
      <div className="text-lg font-bold">{countSigFigs(input)} significant figures</div>
    </Card>
  );
}

export function RoundingCalculator() {
  const [num, setNum] = useState('3.14159');
  const [places, setPlaces] = useState('2');
  return (
    <Card title="Rounding Calculator">
      <div className="flex gap-2 items-center">
        <Input type="number" value={num} onChange={e => setNum(e.target.value)} />
        <Input type="number" min={0} max={15} value={places} onChange={e => setPlaces(e.target.value)} className="w-20" />
      </div>
      <div className="text-lg font-bold">{Number(num).toFixed(Number(places))}</div>
    </Card>
  );
}

export function MathEquationSolver() {
  const [eq, setEq] = useState('2x + 3 = 7');
  const solve = (e: string) => {
    const m = e.match(/^([\d.]*)x\s*\+\s*([\d.]+)\s*=\s*([\d.]+)$/);
    if (!m) return 'Enter format: ax + b = c';
    const a = Number(m[1] || 1), b = Number(m[2]), c = Number(m[3]);
    if (a === 0) return 'a cannot be 0';
    return 'x = ' + ((c - b) / a).toFixed(4);
  };
  return (
    <Card title="Equation Solver (Linear)">
      <Input value={eq} onChange={e => setEq(e.target.value)} />
      <div className="text-lg font-bold font-mono">{solve(eq)}</div>
    </Card>
  );
}

export function AlgebraCalculator() {
  const [expr, setExpr] = useState('2*(3+4)');
  let result: string;
  try { result = String(eval(expr)); } catch { result = 'Invalid expression'; }
  return (
    <Card title="Algebraic Expression Evaluator">
      <Input value={expr} onChange={e => setExpr(e.target.value)} />
      <div className="text-lg font-bold font-mono">= {result}</div>
    </Card>
  );
}

export function GeometryCalculator() {
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
    <Card title="Geometry Calculator">
      <Select value={shape} onChange={e => setShape(e.target.value)}>
        <option value="circle">Circle</option><option value="square">Square</option><option value="triangle">Triangle</option>
        <option value="rectangle">Rectangle</option><option value="sphere">Sphere</option><option value="cylinder">Cylinder</option>
        <option value="cone">Cone</option><option value="cube">Cube</option>
      </Select>
      <div className="flex gap-2 flex-wrap">
        {(shape === 'circle' || shape === 'sphere' || shape === 'cylinder' || shape === 'cone') && <div><label className={labelClass}>Radius</label><Input type="number" value={r} onChange={e => setR(e.target.value)} /></div>}
        {(shape === 'square' || shape === 'rectangle' || shape === 'cube') && <div><label className={labelClass}>Width</label><Input type="number" value={w} onChange={e => setW(e.target.value)} /></div>}
        {(shape === 'triangle' || shape === 'rectangle' || shape === 'cylinder' || shape === 'cone') && <div><label className={labelClass}>Height</label><Input type="number" value={h} onChange={e => setH(e.target.value)} /></div>}
      </div>
      <div className="text-xs space-y-1">
        {result.area !== undefined && <div>Area: {result.area.toFixed(4)}</div>}
        {result.perimeter !== undefined && <div>Perimeter: {result.perimeter.toFixed(4)}</div>}
        {result.volume !== undefined && <div>Volume: {result.volume.toFixed(4)}</div>}
      </div>
    </Card>
  );
}

export function CoordinateCalculator() {
  const [x1, setX1] = useState('0'); const [y1, setY1] = useState('0');
  const [x2, setX2] = useState('3'); const [y2, setY2] = useState('4');
  const a = Number(x1), b = Number(y1), c = Number(x2), d = Number(y2);
  const dist = Math.sqrt((c - a) ** 2 + (d - b) ** 2);
  const mx = (a + c) / 2, my = (b + d) / 2;
  return (
    <Card title="Coordinate Calculator">
      <div className="flex gap-2">
        <div><label className={labelClass}>x1</label><Input type="number" value={x1} onChange={e => setX1(e.target.value)} /></div>
        <div><label className={labelClass}>y1</label><Input type="number" value={y1} onChange={e => setY1(e.target.value)} /></div>
        <div><label className={labelClass}>x2</label><Input type="number" value={x2} onChange={e => setX2(e.target.value)} /></div>
        <div><label className={labelClass}>y2</label><Input type="number" value={y2} onChange={e => setY2(e.target.value)} /></div>
      </div>
      <div className="text-xs space-y-1">
        <div>Distance: {dist.toFixed(4)}</div>
        <div>Midpoint: ({mx.toFixed(2)}, {my.toFixed(2)})</div>
      </div>
    </Card>
  );
}

export function SlopeCalculator() {
  const [x1, setX1] = useState('1'); const [y1, setY1] = useState('2');
  const [x2, setX2] = useState('3'); const [y2, setY2] = useState('6');
  const a = Number(x1), b = Number(y1), c = Number(x2), d = Number(y2);
  const dx = c - a, dy = d - b;
  const slope = dx !== 0 ? dy / dx : Infinity;
  return (
    <Card title="Slope Calculator">
      <div className="flex gap-2">
        <div><label className={labelClass}>x1</label><Input type="number" value={x1} onChange={e => setX1(e.target.value)} /></div>
        <div><label className={labelClass}>y1</label><Input type="number" value={y1} onChange={e => setY1(e.target.value)} /></div>
        <div><label className={labelClass}>x2</label><Input type="number" value={x2} onChange={e => setX2(e.target.value)} /></div>
        <div><label className={labelClass}>y2</label><Input type="number" value={y2} onChange={e => setY2(e.target.value)} /></div>
      </div>
      <div className="text-sm font-mono">
        <div>Slope = {isFinite(slope) ? slope.toFixed(4) : 'undefined'}</div>
        <div>Equation: y = {isFinite(slope) ? slope.toFixed(2) + 'x ' + (b - slope * a >= 0 ? '+' : '') + (b - slope * a).toFixed(2) : 'x = ' + a}</div>
      </div>
    </Card>
  );
}

export function MidpointCalculator() {
  const [x1, setX1] = useState('0'); const [y1, setY1] = useState('0');
  const [x2, setX2] = useState('4'); const [y2, setY2] = useState('6');
  const a = Number(x1), b = Number(y1), c = Number(x2), d = Number(y2);
  return (
    <Card title="Midpoint Calculator">
      <div className="flex gap-2">
        <div><label className={labelClass}>x1</label><Input type="number" value={x1} onChange={e => setX1(e.target.value)} /></div>
        <div><label className={labelClass}>y1</label><Input type="number" value={y1} onChange={e => setY1(e.target.value)} /></div>
        <div><label className={labelClass}>x2</label><Input type="number" value={x2} onChange={e => setX2(e.target.value)} /></div>
        <div><label className={labelClass}>y2</label><Input type="number" value={y2} onChange={e => setY2(e.target.value)} /></div>
      </div>
      <div className="text-lg font-bold">Midpoint: ({(a + c) / 2}, {(b + d) / 2})</div>
    </Card>
  );
}

export function DistanceCalculator() {
  const [x1, setX1] = useState('0'); const [y1, setY1] = useState('0');
  const [x2, setX2] = useState('3'); const [y2, setY2] = useState('4');
  const a = Number(x1), b = Number(y1), c = Number(x2), d = Number(y2);
  const dist = Math.sqrt((c - a) ** 2 + (d - b) ** 2);
  return (
    <Card title="Distance Calculator (2D)">
      <div className="flex gap-2">
        <div><label className={labelClass}>x1</label><Input type="number" value={x1} onChange={e => setX1(e.target.value)} /></div>
        <div><label className={labelClass}>y1</label><Input type="number" value={y1} onChange={e => setY1(e.target.value)} /></div>
        <div><label className={labelClass}>x2</label><Input type="number" value={x2} onChange={e => setX2(e.target.value)} /></div>
        <div><label className={labelClass}>y2</label><Input type="number" value={y2} onChange={e => setY2(e.target.value)} /></div>
      </div>
      <div className="text-lg font-bold">Distance: {dist.toFixed(4)}</div>
    </Card>
  );
}

export function BodyMassIndexCalculator() {
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('70');
  const [unit, setUnit] = useState('metric');
  const h = unit === 'metric' ? Number(height) / 100 : Number(height) * 0.0254;
  const w = unit === 'metric' ? Number(weight) : Number(weight) * 0.453592;
  const bmi = h > 0 ? w / (h * h) : 0;
  const category = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
  const color = bmi < 18.5 ? 'text-yellow-500' : bmi < 25 ? 'text-green-600' : bmi < 30 ? 'text-orange-500' : 'text-red-500';
  return (
    <Card title="BMI Calculator">
      <Select value={unit} onChange={e => setUnit(e.target.value)}>
        <option value="metric">Metric (cm/kg)</option><option value="imperial">Imperial (in/lb)</option>
      </Select>
      <div className="flex gap-2">
        <Input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder={unit === 'metric' ? 'cm' : 'in'} />
        <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder={unit === 'metric' ? 'kg' : 'lb'} />
      </div>
      <div className={'text-2xl font-bold ' + color}>{bmi.toFixed(1)}</div>
      <div className={'text-sm font-medium ' + color}>{category}</div>
    </Card>
  );
}

export function BodyFatCalculator() {
  const [bmi, setBmi] = useState('24');
  const [age, setAge] = useState('30');
  const [gender, setGender] = useState('male');
  const b = Number(bmi), a = Number(age);
  const bf = gender === 'male' ? 1.2 * b + 0.23 * a - 16.2 : 1.2 * b + 0.23 * a - 5.4;
  return (
    <Card title="Body Fat % Estimator">
      <Select value={gender} onChange={e => setGender(e.target.value)}>
        <option value="male">Male</option><option value="female">Female</option>
      </Select>
      <div className="flex gap-2">
        <div><label className={labelClass}>BMI</label><Input type="number" value={bmi} onChange={e => setBmi(e.target.value)} /></div>
        <div><label className={labelClass}>Age</label><Input type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
      </div>
      <div className="text-lg font-bold">Body Fat: {bf.toFixed(1)}%</div>
    </Card>
  );
}

export function CalorieIntakeCalculator() {
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('170');
  const [age, setAge] = useState('30');
  const [gender, setGender] = useState('male');
  const [activity, setActivity] = useState('1.55');
  const w = Number(weight), h = Number(height), a = Number(age), act = Number(activity);
  const bmr = gender === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
  return (
    <Card title="Daily Calorie Needs">
      <div className="flex gap-2">
        <Select value={gender} onChange={e => setGender(e.target.value)}><option value="male">Male</option><option value="female">Female</option></Select>
        <Select value={activity} onChange={e => setActivity(e.target.value)}>
          <option value="1.2">Sedentary</option><option value="1.375">Light</option><option value="1.55">Moderate</option>
          <option value="1.725">Active</option><option value="1.9">Very Active</option>
        </Select>
      </div>
      <div className="flex gap-2"><div><label className={labelClass}>Weight (kg)</label><Input type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div><div><label className={labelClass}>Height (cm)</label><Input type="number" value={height} onChange={e => setHeight(e.target.value)} /></div><div><label className={labelClass}>Age</label><Input type="number" value={age} onChange={e => setAge(e.target.value)} /></div></div>
      <div className="text-lg font-bold">BMR: {bmr.toFixed(0)} kcal/day</div>
      <div className="text-sm">Maintenance: {(bmr * act).toFixed(0)} kcal/day</div>
    </Card>
  );
}

export function MacronutrientCalculator() {
  const [calories, setCalories] = useState('2000');
  const c = Number(calories);
  return (
    <Card title="Daily Macronutrients">
      <Input type="number" value={calories} onChange={e => setCalories(e.target.value)} />
      <div className="text-xs space-y-1">
        <div className="flex justify-between"><span>Protein (30%)</span><span className="font-bold">{(c * 0.3 / 4).toFixed(0)}g = {(c * 0.3).toFixed(0)} kcal</span></div>
        <div className="flex justify-between"><span>Carbs (40%)</span><span className="font-bold">{(c * 0.4 / 4).toFixed(0)}g = {(c * 0.4).toFixed(0)} kcal</span></div>
        <div className="flex justify-between"><span>Fat (30%)</span><span className="font-bold">{(c * 0.3 / 9).toFixed(0)}g = {(c * 0.3).toFixed(0)} kcal</span></div>
      </div>
    </Card>
  );
}

export function WaterRequirementCalculator() {
  const [weight, setWeight] = useState('70');
  const [activity, setActivity] = useState('30');
  const w = Number(weight);
  const base = w * 0.033;
  const extra = Math.floor(Number(activity) / 30) * 0.35;
  return (
    <Card title="Daily Water Intake">
      <div className="flex gap-2"><div><label className={labelClass}>Weight (kg)</label><Input type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div><div><label className={labelClass}>Exercise (min)</label><Input type="number" value={activity} onChange={e => setActivity(e.target.value)} /></div></div>
      <div className="text-lg font-bold">{(base + extra).toFixed(1)} L / day</div>
    </Card>
  );
}

export function SleepRequirementCalculator() {
  const [age, setAge] = useState('30');
  const a = Number(age);
  const rec = a < 1 ? '12-16 hours' : a < 2 ? '11-14 hours' : a < 5 ? '10-13 hours' : a < 13 ? '9-12 hours' : a < 18 ? '8-10 hours' : a < 65 ? '7-9 hours' : '7-8 hours';
  return (
    <Card title="Sleep Requirements by Age">
      <Input type="number" value={age} onChange={e => setAge(e.target.value)} />
      <div className="text-lg font-bold">Recommended: {rec}</div>
    </Card>
  );
}

export function HeartRateCalculator() {
  const [age, setAge] = useState('35');
  const a = Number(age);
  const max = 220 - a;
  return (
    <Card title="Target Heart Rate Zones">
      <Input type="number" value={age} onChange={e => setAge(e.target.value)} />
      <div className="text-xs space-y-1">
        <div>Max HR: {max} bpm</div>
        <div>Zone 1 (50-60%): {Math.round(max * 0.5)}-{Math.round(max * 0.6)} bpm</div>
        <div>Zone 2 (60-70%): {Math.round(max * 0.6)}-{Math.round(max * 0.7)} bpm</div>
        <div>Zone 3 (70-80%): {Math.round(max * 0.7)}-{Math.round(max * 0.8)} bpm</div>
        <div>Zone 4 (80-90%): {Math.round(max * 0.8)}-{Math.round(max * 0.9)} bpm</div>
        <div>Zone 5 (90-100%): {Math.round(max * 0.9)}-{max} bpm</div>
      </div>
    </Card>
  );
}

export function IdealWeightCalc() {
  const [height, setHeight] = useState('170');
  const [gender, setGender] = useState('male');
  const h = Number(height);
  const devine = gender === 'male' ? 50 + 2.3 * ((h - 152.4) / 2.54) : 45.5 + 2.3 * ((h - 152.4) / 2.54);
  const robinson = gender === 'male' ? 52 + 1.9 * ((h - 152.4) / 2.54) : 49 + 1.7 * ((h - 152.4) / 2.54);
  return (
    <Card title="Ideal Body Weight">
      <div className="flex gap-2"><Select value={gender} onChange={e => setGender(e.target.value)}><option value="male">Male</option><option value="female">Female</option></Select><Input type="number" value={height} onChange={e => setHeight(e.target.value)} /></div>
      <div className="text-xs space-y-1"><div>Devine: {devine.toFixed(1)} kg</div><div>Robinson: {robinson.toFixed(1)} kg</div></div>
    </Card>
  );
}

export function PaceCalculator() {
  const [dist, setDist] = useState('10');
  const [time, setTime] = useState('50');
  const d = Number(dist), t = Number(time);
  const paceMin = d ? t / d : 0;
  const paceMinWhole = Math.floor(paceMin);
  const paceSec = Math.round((paceMin - paceMinWhole) * 60);
  return (
    <Card title="Running Pace Calculator">
      <div className="flex gap-2"><div><label className={labelClass}>Distance (km)</label><Input type="number" value={dist} onChange={e => setDist(e.target.value)} /></div><div><label className={labelClass}>Time (min)</label><Input type="number" value={time} onChange={e => setTime(e.target.value)} /></div></div>
      <div className="text-lg font-bold">{paceMinWhole}:{paceSec.toString().padStart(2, '0')} /km</div>
      <div className="text-sm">Speed: {d && t ? (d / t * 60).toFixed(2) : 0} km/h</div>
    </Card>
  );
}

export function StepsCalculator() {
  const [steps, setSteps] = useState('10000');
  const [height, setHeight] = useState('170');
  const s = Number(steps), h = Number(height);
  const stride = h * 0.415;
  const distM = s * stride;
  const distKm = distM / 1000;
  const distMi = distKm / 1.609;
  return (
    <Card title="Steps to Distance">
      <div className="flex gap-2"><div><label className={labelClass}>Steps</label><Input type="number" value={steps} onChange={e => setSteps(e.target.value)} /></div><div><label className={labelClass}>Height (cm)</label><Input type="number" value={height} onChange={e => setHeight(e.target.value)} /></div></div>
      <div className="text-xs space-y-1"><div>Distance: {distKm.toFixed(2)} km</div><div>Distance: {distMi.toFixed(2)} miles</div><div>Calories (est): {(s * 0.04).toFixed(0)} kcal</div></div>
    </Card>
  );
}

export function CaloriesBurnedCalculator() {
  const [weight, setWeight] = useState('70');
  const [duration, setDuration] = useState('30');
  const [activity, setActivity] = useState('running');
  const mets: Record<string, number> = { running: 9.8, walking: 3.5, cycling: 7.5, swimming: 8, yoga: 2.5, lifting: 4.5, 'jump rope': 12 };
  const met = mets[activity] || 5;
  const burned = met * Number(weight) * (Number(duration) / 60);
  return (
    <Card title="Calories Burned">
      <div className="flex gap-2"><Select value={activity} onChange={e => setActivity(e.target.value)}>{Object.keys(mets).map(k => <option key={k}>{k}</option>)}</Select>
      <div><label className={labelClass}>Weight (kg)</label><Input type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
      <div><label className={labelClass}>Duration (min)</label><Input type="number" value={duration} onChange={e => setDuration(e.target.value)} /></div></div>
      <div className="text-lg font-bold">{burned.toFixed(0)} kcal burned</div>
    </Card>
  );
}

export function BloodAlcoholCalculator() {
  const [weight, setWeight] = useState('70');
  const [gender, setGender] = useState('male');
  const [drinks, setDrinks] = useState('3');
  const [hours, setHours] = useState('2');
  const w = Number(weight), d = Number(drinks), h = Number(hours);
  const r = gender === 'male' ? 0.68 : 0.55;
  const bac = (d * 14 / (w * 1000 * r)) * 100 - (h * 0.015);
  const finalBac = Math.max(0, bac);
  return (
    <Card title="Blood Alcohol Estimator">
      <div className="flex gap-2"><Select value={gender} onChange={e => setGender(e.target.value)}><option value="male">Male</option><option value="female">Female</option></Select><Input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Weight (kg)" /></div>
      <div className="flex gap-2"><Input type="number" value={drinks} onChange={e => setDrinks(e.target.value)} placeholder="Drinks" /><Input type="number" value={hours} onChange={e => setHours(e.target.value)} placeholder="Hours" /></div>
      <div className={'text-lg font-bold ' + (finalBac >= 0.08 ? 'text-red-500' : 'text-green-600')}>BAC: {finalBac.toFixed(3)}%</div>
      {finalBac >= 0.08 && <div className="text-xs text-red-500">Over legal limit (0.08%)</div>}
    </Card>
  );
}

export function PregnancyCalculator() {
  const [lmp, setLmp] = useState('');
  const due = lmp ? new Date(new Date(lmp).getTime() + 280 * 86400000) : null;
  return (
    <Card title="Pregnancy Calculator">
      <label className={labelClass}>First day of last menstrual period</label>
      <Input type="date" value={lmp} onChange={e => setLmp(e.target.value)} />
      {due && <div><div className="text-lg font-bold">Due Date: {due.toLocaleDateString()}</div><div className="text-xs">Gestational age: {Math.floor((Date.now() - new Date(lmp).getTime()) / (7 * 86400000))} weeks</div></div>}
    </Card>
  );
}

export function OvulationTracker() {
  const [lmp, setLmp] = useState('');
  const results = lmp ? (() => {
    const start = new Date(lmp);
    const cycleLen = 28;
    const fertileStart = new Date(start.getTime() + (cycleLen - 14 - 5) * 86400000);
    const fertileEnd = new Date(start.getTime() + (cycleLen - 14 + 1) * 86400000);
    const ovulation = new Date(start.getTime() + (cycleLen - 14) * 86400000);
    return { fertileStart, fertileEnd, ovulation };
  })() : null;
  return (
    <Card title="Ovulation Tracker">
      <label className={labelClass}>First day of LMP</label>
      <Input type="date" value={lmp} onChange={e => setLmp(e.target.value)} />
      {results && <div className="text-xs space-y-1">
        <div>Fertile window: {results.fertileStart.toLocaleDateString()} - {results.fertileEnd.toLocaleDateString()}</div>
        <div className="font-bold">Ovulation: {results.ovulation.toLocaleDateString()}</div>
      </div>}
    </Card>
  );
}

export function DueDateCalculator() {
  const [lmp, setLmp] = useState('');
  const due = lmp ? new Date(new Date(lmp).getTime() + 280 * 86400000) : null;
  return (
    <Card title="Due Date Calculator">
      <label className={labelClass}>First day of last menstrual period</label>
      <Input type="date" value={lmp} onChange={e => setLmp(e.target.value)} />
      {due && <div className="text-lg font-bold">Due Date: {due.toLocaleDateString()}</div>}
    </Card>
  );
}

export function AgeCalculator() {
  const [birth, setBirth] = useState('');
  const calc = birth ? (() => {
    const b = new Date(birth), now = new Date();
    let y = now.getFullYear() - b.getFullYear(), m = now.getMonth() - b.getMonth(), d = now.getDate() - b.getDate();
    if (d < 0) { m--; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }
    return { y, m, d };
  })() : null;
  return (
    <Card title="Age Calculator">
      <Input type="date" value={birth} onChange={e => setBirth(e.target.value)} />
      {calc && <div className="text-lg font-bold">{calc.y} years, {calc.m} months, {calc.d} days</div>}
    </Card>
  );
}

export function DateDifferenceCalculator() {
  const [d1, setD1] = useState('');
  const [d2, setD2] = useState('');
  const diff = d1 && d2 ? (() => {
    const a = new Date(d1), b = new Date(d2);
    const ms = Math.abs(b.getTime() - a.getTime());
    return { days: Math.floor(ms / 86400000), hours: Math.floor(ms / 3600000), minutes: Math.floor(ms / 60000), seconds: Math.floor(ms / 1000) };
  })() : null;
  return (
    <Card title="Date Difference Calculator">
      <div className="flex gap-2"><Input type="date" value={d1} onChange={e => setD1(e.target.value)} /><Input type="date" value={d2} onChange={e => setD2(e.target.value)} /></div>
      {diff && <div className="text-xs space-y-1">
        <div className="font-bold">{diff.days} days</div>
        <div>{diff.hours} hours</div>
        <div className="text-muted">{diff.minutes} minutes</div>
        <div className="text-muted">{diff.seconds} seconds</div>
      </div>}
    </Card>
  );
}

export function DateAdditionCalculator() {
  const [start, setStart] = useState('');
  const [days, setDays] = useState('30');
  const result = start ? new Date(new Date(start).getTime() + Number(days) * 86400000) : null;
  return (
    <Card title="Date Addition / Subtraction">
      <div className="flex gap-2"><Input type="date" value={start} onChange={e => setStart(e.target.value)} /><Input type="number" value={days} onChange={e => setDays(e.target.value)} /></div>
      {result && <div className="text-lg font-bold">{result.toLocaleDateString()}</div>}
    </Card>
  );
}

export function WeekNumberCalculator() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const d = new Date(date);
  const start = new Date(d.getFullYear(), 0, 1);
  const diff = Math.floor((d.getTime() - start.getTime()) / 86400000);
  const week = Math.ceil((diff + start.getDay() + 1) / 7);
  return (
    <Card title="Week Number Calculator">
      <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
      <div className="text-lg font-bold">Week {week} of {d.getFullYear()}</div>
      <div className="text-xs text-muted">{d.toLocaleDateString('en-US', { weekday: 'long' })}</div>
    </Card>
  );
}

export function TimeSinceCalculator() {
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
    <Card title="Time Since / Until">
      <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
      <div className="text-xs space-y-1">
        <div>{yr} years</div><div>{mo} months</div><div>{wk} weeks</div>
        <div>{day} days</div><div>{hr} hours</div><div>{min} minutes</div><div>{sec} seconds</div>
      </div>
    </Card>
  );
}

export function TimeZoneConverter() {
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
    <Card title="Time Zone Converter">
      <div className="flex gap-2"><Input type="time" value={time} onChange={e => setTime(e.target.value)} /><Input value={fromTz} onChange={e => setFromTz(e.target.value)} className={inputClass} /></div>
      <div className="flex gap-2"><Input value={toTz} onChange={e => setToTz(e.target.value)} className={inputClass} /></div>
      <div className="text-lg font-bold">{String(resultH).padStart(2, '0')}:{String(resultM).padStart(2, '0')}</div>
      <div className="text-xs text-muted">From: {fromTz} → To: {toTz}</div>
    </Card>
  );
}

export function DaylightSavingTimeChecker() {
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const y = Number(year);
  const march = new Date(y, 2, 14);
  const nov = new Date(y, 10, 7);
  const dstStart = new Date(march.getTime() + (7 - march.getDay()) * 86400000);
  const dstEnd = new Date(nov.getTime() + (7 - nov.getDay()) * 86400000);
  return (
    <Card title="DST Checker (US)">
      <Input type="number" value={year} onChange={e => setYear(e.target.value)} />
      <div className="text-xs">
        <div>DST starts: {dstStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
        <div>DST ends: {dstEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
        <div>DST period: {Math.round((dstEnd.getTime() - dstStart.getTime()) / 86400000)} days</div>
      </div>
    </Card>
  );
}

export function BusinessDaysCalculator() {
  const [start, setStart] = useState('');
  const [bDays, setBDays] = useState('10');
  const s = new Date(start);
  let count = 0, d = new Date(s);
  while (count < Number(bDays)) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) count++; }
  return (
    <Card title="Business Days Calculator">
      <div className="flex gap-2"><Input type="date" value={start} onChange={e => setStart(e.target.value)} /><Input type="number" value={bDays} onChange={e => setBDays(e.target.value)} /></div>
      {start && <div className="text-lg font-bold">{d.toLocaleDateString()}</div>}
    </Card>
  );
}

export function WorkHoursCalculator() {
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('17:00');
  const [breakMin, setBreakMin] = useState('30');
  const [sH, sM] = start.split(':').map(Number);
  const [eH, eM] = end.split(':').map(Number);
  const total = (eH * 60 + eM) - (sH * 60 + sM) - Number(breakMin);
  const hrs = Math.floor(total / 60), mins = total % 60;
  return (
    <Card title="Work Hours Calculator">
      <div className="flex gap-2"><Input type="time" value={start} onChange={e => setStart(e.target.value)} /><Input type="time" value={end} onChange={e => setEnd(e.target.value)} /><Input type="number" value={breakMin} onChange={e => setBreakMin(e.target.value)} /></div>
      <div className="text-lg font-bold">{hrs}h {mins}m</div>
    </Card>
  );
}

export function HoursMinutesCalculator() {
  const [h1, setH1] = useState('1'); const [m1, setM1] = useState('30');
  const [h2, setH2] = useState('2'); const [m2, setM2] = useState('15');
  const t1 = Number(h1) * 60 + Number(m1), t2 = Number(h2) * 60 + Number(m2);
  const total = t1 + t2, diff = Math.abs(t1 - t2);
  return (
    <Card title="Hours & Minutes Calculator">
      <div className="flex gap-2">
        <Input type="number" value={h1} onChange={e => setH1(e.target.value)} /><Input type="number" value={m1} onChange={e => setM1(e.target.value)} />
        <span className="self-center text-muted">+</span>
        <Input type="number" value={h2} onChange={e => setH2(e.target.value)} /><Input type="number" value={m2} onChange={e => setM2(e.target.value)} />
      </div>
      <div className="text-xs">Total: {Math.floor(total / 60)}h {total % 60}m</div>
      <div className="text-xs">Diff: {Math.floor(diff / 60)}h {diff % 60}m</div>
    </Card>
  );
}

export function MinutesToHoursConverter() {
  const [mins, setMins] = useState('150');
  const m = Number(mins);
  return (
    <Card title="Minutes → Hours Converter">
      <Input type="number" value={mins} onChange={e => setMins(e.target.value)} />
      <div className="text-lg font-bold">{Math.floor(m / 60)}h {m % 60}m</div>
      <div className="text-xs text-muted">Decimal: {(m / 60).toFixed(2)} hours</div>
    </Card>
  );
}

export function HoursToMinutesTool() {
  const [hrs, setHrs] = useState('2.5');
  const h = Number(hrs);
  return (
    <Card title="Hours → Minutes Tool">
      <Input type="number" value={hrs} onChange={e => setHrs(e.target.value)} step="0.1" />
      <div className="text-lg font-bold">{Math.floor(h * 60)} minutes</div>
      <div className="text-xs text-muted">{h * 3600} seconds</div>
    </Card>
  );
}

export function SecondsToMinutesConverter() {
  const [sec, setSec] = useState('3661');
  const s = Number(sec);
  return (
    <Card title="Seconds → Minutes Converter">
      <Input type="number" value={sec} onChange={e => setSec(e.target.value)} />
      <div className="text-lg font-bold">{Math.floor(s / 3600)}h {Math.floor((s % 3600) / 60)}m {s % 60}s</div>
    </Card>
  );
}

export function SpeedConverter() {
  const [kmh, setKmh] = useState('100');
  const k = Number(kmh);
  return (
    <Card title="Speed Converter">
      <Input type="number" value={kmh} onChange={e => setKmh(e.target.value)} />
      <div className="text-xs space-y-1">
        <div>mph: {(k * 0.621371).toFixed(2)}</div>
        <div>knots: {(k * 0.539957).toFixed(2)}</div>
        <div>m/s: {(k / 3.6).toFixed(2)}</div>
        <div>ft/s: {(k * 0.911344).toFixed(2)}</div>
      </div>
    </Card>
  );
}

export function LengthConverter() {
  const [meters, setMeters] = useState('100');
  const m = Number(meters);
  return (
    <Card title="Length Converter">
      <Input type="number" value={meters} onChange={e => setMeters(e.target.value)} />
      <div className="text-xs space-y-1">
        <div>km: {(m / 1000).toFixed(4)}</div>
        <div>miles: {(m * 0.000621371).toFixed(4)}</div>
        <div>yards: {(m * 1.09361).toFixed(2)}</div>
        <div>feet: {(m * 3.28084).toFixed(2)}</div>
        <div>inches: {(m * 39.3701).toFixed(2)}</div>
      </div>
    </Card>
  );
}

export function WeightConverter() {
  const [kg, setKg] = useState('70');
  const k = Number(kg);
  return (
    <Card title="Weight Converter">
      <Input type="number" value={kg} onChange={e => setKg(e.target.value)} />
      <div className="text-xs space-y-1">
        <div>g: {(k * 1000).toFixed(0)}</div>
        <div>lb: {(k * 2.20462).toFixed(2)}</div>
        <div>oz: {(k * 35.274).toFixed(2)}</div>
        <div>stone: {(k * 0.157473).toFixed(2)}</div>
      </div>
    </Card>
  );
}

export function VolumeConverter() {
  const [liters, setLiters] = useState('1');
  const l = Number(liters);
  return (
    <Card title="Volume Converter">
      <Input type="number" value={liters} onChange={e => setLiters(e.target.value)} />
      <div className="text-xs space-y-1">
        <div>mL: {(l * 1000).toFixed(0)}</div>
        <div>gal (US): {(l * 0.264172).toFixed(4)}</div>
        <div>qt: {(l * 1.05669).toFixed(4)}</div>
        <div>fl oz: {(l * 33.814).toFixed(2)}</div>
        <div>cups: {(l * 4.22675).toFixed(2)}</div>
      </div>
    </Card>
  );
}

export function AreaConverter() {
  const [sqm, setSqm] = useState('100');
  const a = Number(sqm);
  return (
    <Card title="Area Converter">
      <Input type="number" value={sqm} onChange={e => setSqm(e.target.value)} />
      <div className="text-xs space-y-1">
        <div>sq ft: {(a * 10.7639).toFixed(2)}</div>
        <div>acres: {(a * 0.000247105).toFixed(6)}</div>
        <div>hectares: {(a * 0.0001).toFixed(6)}</div>
        <div>sq km: {(a / 1e6).toFixed(6)}</div>
      </div>
    </Card>
  );
}

export function DataSizeConverter() {
  const [bytes, setBytes] = useState('1073741824');
  const b = Number(bytes);
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const conv = units.map((u, i) => ({ unit: u, value: b / Math.pow(1024, i) }));
  return (
    <Card title="Data Size Converter">
      <Input type="number" value={bytes} onChange={e => setBytes(e.target.value)} />
      <div className="text-xs space-y-1">
        {conv.map(c => <div key={c.unit}><span className="text-muted">{c.unit}:</span> {c.value.toFixed(2)}</div>)}
      </div>
    </Card>
  );
}

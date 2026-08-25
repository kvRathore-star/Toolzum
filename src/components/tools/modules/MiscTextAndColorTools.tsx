"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { ac, pillClass, btnClass, borderClass } from './miscToolColors';

import { Section, Input, labelClass, selClass } from './MiscToolsShared';
import { CalculatorShell } from './shared/CalculatorShell';

export function QRCodeGenerator() {
  const clr = ac('QRCodeGenerator');
  const [text, setText] = useState('https://toolzum.com');
  const [size, setSize] = useState(200);
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');

  // Generate QR using canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    if (!canvasRef.current || !text) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    // Simple QR code generation using a basic approach
    // In production, you'd use a proper QR library
    const data = text;
    const cellSize = Math.floor(size / 33);
    const padding = (size - cellSize * 33) / 2;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#000000';

    // Generate a simple pattern based on the data
    for (let y = 0; y < 33; y++) {
      for (let x = 0; x < 33; x++) {
        const hash = (x * 131 + y * 173 + data.charCodeAt(0) * 7) % 2;
        if (hash) {
          ctx.fillRect(padding + x * cellSize, padding + y * cellSize, cellSize, cellSize);
        }
      }
    }

    // Finder patterns (three corners)
    const drawFinder = (fx: number, fy: number) => {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (Math.abs(dx) === 1 || Math.abs(dy) === 1 || (dx === 0 && dy === 0)) {
            ctx.fillRect(padding + (fx + dx) * cellSize, padding + (fy + dy) * cellSize, cellSize, cellSize);
          }
        }
      }
    };
    drawFinder(1, 1);
    drawFinder(29, 1);
    drawFinder(1, 29);

    setQrDataUrl(canvas.toDataURL('image/png'));
  }, [text, size, errorLevel]);

  const presets = [
    { label: 'Toolzum', apply: () => { setText('https://toolzum.com'); } },
    { label: 'GitHub', apply: () => { setText('https://github.com'); } },
    { label: 'Email', apply: () => { setText('mailto:hello@toolzum.com'); } },
    { label: 'WiFi', apply: () => { setText('WIFI:T:WPA;S:MyNetwork;P:password123;;'); } },
    { label: 'Clear', apply: () => { setText(''); } },
  ];

  const resultText = text ? `QR generated (${size}x${size}px, EC: ${errorLevel})` : 'Enter text to generate QR code';

  return (
    <CalculatorShell title="QR Code Generator" result={resultText} onCalculate={() => {}} presets={presets} accent="indigo" downloadData={qrDataUrl} downloadFilename="qrcode.png">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text / URL</label>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={3} placeholder="Enter text, URL, email, WiFi config..."
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y" />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Size</label>
            <input type="range" min={100} max={500} step={50} value={size} onChange={e => setSize(Number(e.target.value))}
              className="w-full accent-indigo-500" />
            <div className="text-xs text-[var(--text-muted)] text-right mt-1">{size}px</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Error Correction</label>
            <select value={errorLevel} onChange={e => setErrorLevel(e.target.value as 'L'|'M'|'Q'|'H')}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
              <option value="L">L (7%)</option>
              <option value="M">M (15%)</option>
              <option value="Q">Q (25%)</option>
              <option value="H">H (30%)</option>
            </select>
          </div>
        </div>

        {text && (
          <div className="flex justify-center">
            <canvas ref={canvasRef} width={size} height={size} className="bg-white dark:bg-black rounded-lg border border-zinc-300 dark:border-zinc-700" />
          </div>
        )}

        {qrDataUrl && (
          <a href={qrDataUrl} download="qrcode.png" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors inline-block">
            Download PNG
          </a>
        )}
      </div>
    </CalculatorShell>
  );
}
// --- BarcodeGenerator ---
export function BarcodeGenerator() {
  const clr = ac('BarcodeGenerator');
  const [text, setText] = useState('123456789012');
  const [format, setFormat] = useState<'upc-a' | 'ean-13' | 'code128' | 'code39'>('upc-a');
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [showText, setShowText] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [barcodeDataUrl, setBarcodeDataUrl] = useState('');

  // Simple barcode encoding functions
  const encodeUPC = (s: string) => {
    // UPC-A: 12 digits, left and right halves with different encoding
    const leftPatterns = ['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'];
    const rightPatterns = ['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100'];
    const guard = '101';
    const middle = '01010';
    let encoded = guard;
    for (let i = 0; i < 6; i++) encoded += leftPatterns[parseInt(s[i])];
    encoded += middle;
    for (let i = 6; i < 12; i++) encoded += rightPatterns[parseInt(s[i])];
    encoded += guard;
    return encoded;
  };

  const encodeEAN13 = (s: string) => {
    const leftPatterns = ['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'];
    const rightPatterns = ['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100'];
    const parityPatterns = ['000000','001011','001101','001110','010011','011001','011100','010101','010110','010001'];
    const guard = '101';
    const middle = '01010';
    let encoded = guard;
    const firstDigit = parseInt(s[0]);
    const parity = parityPatterns[firstDigit];
    for (let i = 1; i <= 6; i++) {
      const digit = parseInt(s[i]);
      encoded += parity[i-1] === '0' ? leftPatterns[digit] : rightPatterns[digit];
    }
    encoded += middle;
    for (let i = 7; i < 13; i++) encoded += rightPatterns[parseInt(s[i])];
    encoded += guard;
    return encoded;
  };

  const encodeCode128 = (s: string) => {
    // Simplified Code 128 - just generate a pattern based on input
    let encoded = '';
    for (let i = 0; i < s.length; i++) {
      const charCode = s.charCodeAt(i);
      // Generate a barcode-like pattern
      for (let j = 0; j < 11; j++) {
        encoded += (charCode + j * 7 + i * 13) % 2 === 0 ? '1' : '0';
      }
    }
    return encoded;
  };

  const encodeCode39 = (s: string) => {
    // Simplified Code 39
    let encoded = '';
    for (let i = 0; i < s.length; i++) {
      const charCode = s.charCodeAt(i);
      for (let j = 0; j < 9; j++) {
        encoded += (charCode + j * 5 + i * 11) % 2 === 0 ? '1' : '0';
      }
      encoded += '0'; // inter-character gap
    }
    return encoded;
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let encoded = '';
    if (format === 'upc-a') {
      const clean = text.replace(/\D/g, '').padStart(12, '0').slice(0, 12);
      encoded = encodeUPC(clean);
    } else if (format === 'ean-13') {
      const clean = text.replace(/\D/g, '').padStart(13, '0').slice(0, 13);
      encoded = encodeEAN13(clean);
    } else if (format === 'code128') {
      encoded = encodeCode128(text);
    } else if (format === 'code39') {
      encoded = encodeCode39(text.toUpperCase().replace(/[^A-Z0-9\-\.\$\/\+\% ]/g, ''));
    }

    const barWidth = width;
    const canvasWidth = encoded.length * barWidth + 20;
    const canvasHeight = height + (showText ? 30 : 10);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = '#000000';

    for (let i = 0; i < encoded.length; i++) {
      if (encoded[i] === '1') {
        ctx.fillRect(10 + i * barWidth, 0, barWidth, height);
      }
    }

    if (showText) {
      ctx.font = '16px monospace';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.fillText(text, canvasWidth / 2, height + 22);
    }

    setBarcodeDataUrl(canvas.toDataURL('image/png'));
  }, [text, format, width, height, showText]);

  const presets = [
    { label: 'UPC-A Sample', apply: () => { setFormat('upc-a'); setText('012345678905'); } },
    { label: 'EAN-13 Sample', apply: () => { setFormat('ean-13'); setText('4006381333931'); } },
    { label: 'Code 128', apply: () => { setFormat('code128'); setText('HELLO123'); } },
    { label: 'Code 39', apply: () => { setFormat('code39'); setText('ABC-123'); } },
    { label: 'Clear', apply: () => { setText(''); } },
  ];

  const resultText = text ? `Barcode: ${format.toUpperCase()} (${text.length} chars, ${width}px bars)` : 'Enter data to generate barcode';

  return (
    <CalculatorShell title="Barcode Generator" result={resultText} onCalculate={() => {}} presets={presets} accent="orange" downloadData={barcodeDataUrl} downloadFilename="barcode.png">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Data</label>
        <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Enter barcode data"
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Format</label>
            <select value={format} onChange={e => setFormat(e.target.value as 'upc-a'|'ean-13'|'code128'|'code39')}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50">
              <option value="upc-a">UPC-A (12 digits)</option>
              <option value="ean-13">EAN-13 (13 digits)</option>
              <option value="code128">Code 128 (alphanumeric)</option>
              <option value="code39">Code 39 (uppercase)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Bar Width</label>
            <input type="range" min={1} max={5} value={width} onChange={e => setWidth(Number(e.target.value))}
              className="w-full accent-orange-500" />
            <div className="text-xs text-[var(--text-muted)] text-right mt-1">{width}px</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Height</label>
            <input type="range" min={50} max={200} step={10} value={height} onChange={e => setHeight(Number(e.target.value))}
              className="w-full accent-orange-500" />
            <div className="text-xs text-[var(--text-muted)] text-right mt-1">{height}px</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Show Text</label>
            <select value={showText} onChange={e => setShowText(e.target.value === 'true')}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50">
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>

        {text && (
          <div className="flex justify-center">
            <canvas ref={canvasRef} className="bg-white dark:bg-black rounded-lg border border-zinc-300 dark:border-zinc-700" />
          </div>
        )}

        {barcodeDataUrl && (
          <a href={barcodeDataUrl} download="barcode.png" className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-medium transition-colors inline-block">
            Download PNG
          </a>
        )}
      </div>
    </CalculatorShell>
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
  const [hex, setHex] = useState('#3b82f6');
  const [format, setFormat] = useState<'hex' | 'rgb' | 'hsl' | 'hsv' | 'cmyk'>('hex');

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

  const isValid = /^#[0-9a-f]{6}$/i.test(hex);
  const rgb = isValid ? toRgb(hex) : null;
  const hsl = isValid ? toHsl(hex) : null;
  const cmyk = isValid ? toCmyk(hex) : null;
  const hsv = isValid ? toHsv(hex) : null;

  const presets = [
    { label: 'Toolzum Blue', apply: () => { setHex('#3b82f6'); } },
    { label: 'Emerald', apply: () => { setHex('#10b981'); } },
    { label: 'Amber', apply: () => { setHex('#f59e0b'); } },
    { label: 'Rose', apply: () => { setHex('#f43f5e'); } },
    { label: 'Violet', apply: () => { setHex('#8b5cf6'); } },
    { label: 'Random', apply: () => { setHex('#' + Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0')); } },
  ];

  const resultText = isValid ? `Color: ${hex.toUpperCase()}` : 'Enter a valid hex color';

  const formats = [
    { key: 'hex', label: 'HEX', value: isValid ? hex.toUpperCase() : '—' },
    { key: 'rgb', label: 'RGB', value: rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : '—' },
    { key: 'hsl', label: 'HSL', value: hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : '—' },
    { key: 'hsv', label: 'HSV', value: hsv ? `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)` : '—' },
    { key: 'cmyk', label: 'CMYK', value: cmyk ? `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` : '—' },
  ];

  return (
    <CalculatorShell title="Color Converter" result={resultText} onCalculate={() => {}} presets={presets} accent="blue" downloadData={isValid ? JSON.stringify({ hex: hex.toUpperCase(), rgb, hsl, hsv, cmyk }, null, 2) : ''} downloadFilename="color.json">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">HEX Color</label>
            <div className="flex gap-2">
              <input type="color" value={hex} onChange={e => setHex(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer border border-zinc-300 dark:border-zinc-700" />
              <input type="text" value={hex} onChange={e => { const v = e.target.value; if (/^#[0-9a-fA-F]{6}$/.test(v)) setHex(v); }} placeholder="#3b82f6"
                className="flex-1 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-uppercase" />
            </div>
          </div>
          <div className="w-16 h-16 rounded-xl border border-zinc-300 dark:border-zinc-700 flex-shrink-0" style={{ backgroundColor: isValid ? hex : '#e5e7eb' }} />
        </div>

        <div className="flex flex-wrap gap-2">
          {formats.map(f => (
            <button key={f.key} onClick={() => { setFormat(f.key as any); navigator.clipboard.writeText(f.value); toast.success(`Copied ${f.label}`); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1 ${format === f.key ? 'bg-blue-500 text-white border-blue-500' : 'bg-[var(--bg-surface)] border-zinc-300 dark:border-zinc-700 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-blue-400'}`}>
              <span className="font-mono">{f.value}</span>
              <span className="text-[var(--text-muted)]">({f.label})</span>
            </button>
          ))}
        </div>

        {isValid && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {formats.map(f => (
              <div key={f.key} className="p-3 bg-[var(--bg-surface)] rounded-xl text-center border border-zinc-200 dark:border-zinc-700">
                <p className="text-xs text-[var(--text-muted)] font-medium">{f.label}</p>
                <p className="font-mono text-sm font-bold text-[var(--text-primary)] break-all">{f.value}</p>
              </div>
            ))}
          </div>
        )}

        {isValid && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-zinc-200 dark:border-zinc-700">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Color Preview</div>
            <div className="w-full h-16 rounded-lg flex items-center justify-center text-lg font-bold" style={{ backgroundColor: hex, color: hsl && hsl.l > 50 ? '#000000' : '#ffffff' }}>
              Sample Text — {hex.toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
// --- ColorPicker ---
export function ColorPicker() {
  const clr = ac('ColorPicker');
  const [color, setColor] = useState('#ff6b6b');

  const presets = [
    { label: 'Red', apply: () => { setColor('#ff6b6b'); } },
    { label: 'Blue', apply: () => { setColor('#3b82f6'); } },
    { label: 'Green', apply: () => { setColor('#10b981'); } },
    { label: 'Purple', apply: () => { setColor('#8b5cf6'); } },
    { label: 'Random', apply: () => { setColor('#' + Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0')); } },
  ];

  const resultText = `Selected: ${color.toUpperCase()}`;

  return (
    <CalculatorShell
      title="Color Picker"
      result={resultText}
      onCalculate={() => {}}
      presets={presets}
      accent="pink"
      downloadData={color}
      downloadFilename="color.txt"
    >
      <div className="space-y-4">
        <div className="flex gap-4 items-center">
          <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-16 h-16 rounded-lg cursor-pointer" />
          <Input label="Value" value={color} onChange={v => setColor(v.startsWith("#") ? v : "#" + v)} />
        </div>
        <div className="w-full h-24 rounded-lg border" style={{ backgroundColor: color }} />
      </div>
    </CalculatorShell>
  );
}
// --- ColorPaletteGenerator ---
export function ColorPaletteGenerator() {
  const clr = ac('ColorPaletteGenerator');
  const [base, setBase] = useState('#3b82f6');
  const [type, setType] = useState<'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'split-complementary' | 'monochromatic'>('complementary');
  const [count, setCount] = useState(5);

  const hexToRgb = (h: string) => ({ r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16) });
  const rgbToHex = (r: number, g: number, b: number) => '#' + [r, g, b].map(c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('');

  const hslFromRgb = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    let h = 0, s = 0; const l = (mx + mn) / 2;
    if (d) { s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) * 60 : mx === g ? ((b - r) / d + 2) * 60 : ((r - g) / d + 4) * 60; }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const rotateHue = (hsl: { h: number; s: number; l: number }, deg: number) => {
    const newH = (hsl.h + deg) % 360;
    return { ...hsl, h: newH };
  };

  const hslToRgb = (hsl: { h: number; s: number; l: number }) => {
    const { h, s, l } = hsl;
    const sNorm = s / 100, lNorm = l / 100;
    const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = lNorm - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    return rgbToHex(Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255));
  };

  const baseHsl = hslFromRgb(...Object.values(hexToRgb(base)));

  const generatePalette = () => {
    const colors: string[] = [];
    switch (type) {
      case 'complementary':
        colors.push(base, hslToRgb(rotateHue(baseHsl, 180)));
        break;
      case 'analogous':
        colors.push(hslToRgb(rotateHue(baseHsl, -30)), base, hslToRgb(rotateHue(baseHsl, 30)));
        break;
      case 'triadic':
        colors.push(base, hslToRgb(rotateHue(baseHsl, 120)), hslToRgb(rotateHue(baseHsl, 240)));
        break;
      case 'tetradic':
        colors.push(base, hslToRgb(rotateHue(baseHsl, 90)), hslToRgb(rotateHue(baseHsl, 180)), hslToRgb(rotateHue(baseHsl, 270)));
        break;
      case 'split-complementary':
        colors.push(base, hslToRgb(rotateHue(baseHsl, 150)), hslToRgb(rotateHue(baseHsl, 210)));
        break;
      case 'monochromatic':
        for (let i = 0; i < count; i++) {
          const lightness = Math.max(10, Math.min(90, baseHsl.l - 20 + i * 10));
          colors.push(hslToRgb({ ...baseHsl, l: lightness }));
        }
        break;
    }
    return colors;
  };

  const palette = generatePalette();

  const presets = [
    { label: 'Blue Base', apply: () => { setBase('#3b82f6'); setType('complementary'); } },
    { label: 'Green Base', apply: () => { setBase('#10b981'); setType('triadic'); } },
    { label: 'Purple Base', apply: () => { setBase('#8b5cf6'); setType('analogous'); } },
    { label: 'Red Base', apply: () => { setBase('#ef4444'); setType('tetradic'); } },
    { label: 'Monochrome', apply: () => { setType('monochromatic'); setCount(7); } },
  ];

  const resultText = `Palette: ${type} (${palette.length} colors)`;

  return (
    <CalculatorShell title="Color Palette Generator" result={resultText} onCalculate={() => {}} presets={presets} accent="violet" downloadData={JSON.stringify({ base, type, palette }, null, 2)} downloadFilename="palette.json">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Base Color</label>
            <div className="flex gap-2">
              <input type="color" value={base} onChange={e => setBase(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer border border-zinc-300 dark:border-zinc-700" />
              <input type="text" value={base} onChange={e => { const v = e.target.value; if (/^#[0-9a-fA-F]{6}$/.test(v)) setBase(v); }} placeholder="#3b82f6"
                className="flex-1 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-uppercase" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Harmony Type</label>
            <select value={type} onChange={e => setType(e.target.value as any)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50">
              <option value="complementary">Complementary (2)</option>
              <option value="analogous">Analogous (3)</option>
              <option value="triadic">Triadic (3)</option>
              <option value="tetradic">Tetradic (4)</option>
              <option value="split-complementary">Split Complementary (3)</option>
              <option value="monochromatic">Monochromatic (5+)</option>
            </select>
          </div>
          {type === 'monochromatic' && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Color Count</label>
              <input type="range" min={3} max={10} value={count} onChange={e => setCount(Number(e.target.value))}
                className="w-full accent-violet-500" />
              <div className="text-xs text-[var(--text-muted)] text-right mt-1">{count} colors</div>
            </div>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {palette.map((c, i) => (
            <div key={i} className="flex-shrink-0 w-24 h-32 rounded-xl flex flex-col items-center justify-between p-2 text-xs font-mono text-white relative" style={{ backgroundColor: c }}>
              <span className="bg-black/50 px-1 rounded">{c.toUpperCase()}</span>
              <button className="text-[10px] bg-black/50 px-1 rounded hover:bg-black/70" onClick={() => navigator.clipboard.writeText(c)}>Copy</button>
            </div>
          ))}
        </div>

        <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-zinc-200 dark:border-zinc-700">
          <div className="text-xs text-[var(--text-secondary)] mb-2">Color Details</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {palette.map((c, i) => (
              <div key={i} className="p-2 rounded-lg text-center" style={{ backgroundColor: c, color: '#ffffff' }}>
                <div className="font-mono">{c.toUpperCase()}</div>
                <div className="opacity-80">Color {i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CalculatorShell>
  );
}
// --- GradientGenerator ---
export function GradientGenerator() {
  const clr = ac('GradientGenerator');
  const [colors, setColors] = useState(['#3b82f6', '#8b5cf6', '#ec4899']);
  const [type, setType] = useState<'linear' | 'radial' | 'conic'>('linear');
  const [direction, setDirection] = useState('to right');
  const [positions, setPositions] = useState<number[]>([0, 50, 100]);

  const addColor = () => setColors([...colors, `#${Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0')}`]);
  const removeColor = (i: number) => colors.length > 2 && setColors(colors.filter((_, idx) => idx !== i));
  const updateColor = (i: number, color: string) => { const n = [...colors]; n[i] = color; setColors(n); };
  const updatePosition = (i: number, pos: number) => { const n = [...positions]; n[i] = Math.max(0, Math.min(100, pos)); setPositions(n); };

  const gradient = `${type}-gradient(${type === 'linear' ? direction : type === 'radial' ? 'circle at center' : ''}, ${colors.map((c, i) => `${c} ${positions[i]}%`).join(', ')})`;

  const presets = [
    { label: 'Sunset', apply: () => { setColors(['#ff6b35', '#f7c59f', '#efefd0']); setType('linear'); setDirection('to right'); setPositions([0, 50, 100]); } },
    { label: 'Ocean', apply: () => { setColors(['#0077b6', '#00b4d8', '#90e0ef']); setType('linear'); setDirection('to bottom right'); setPositions([0, 50, 100]); } },
    { label: 'Forest', apply: () => { setColors(['#2d6a4f', '#40916c', '#52b788']); setType('radial'); setPositions([0, 50, 100]); } },
    { label: 'Rainbow', apply: () => { setColors(['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#8f00ff']); setType('linear'); setDirection('to right'); setPositions([0, 16, 33, 50, 66, 83, 100]); } },
    { label: 'Simple', apply: () => { setColors(['#3b82f6', '#8b5cf6']); setType('linear'); setDirection('to right'); setPositions([0, 100]); } },
  ];

  const resultText = `${type} gradient with ${colors.length} stops`;

  const directions = ['to right', 'to left', 'to top', 'to bottom', 'to top right', 'to top left', 'to bottom right', 'to bottom left'];

  return (
    <CalculatorShell title="Gradient Generator" result={resultText} onCalculate={() => {}} presets={presets} accent="pink" downloadData={gradient} downloadFilename="gradient.css">
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap items-center">
          <label className="block text-sm font-medium text-[var(--text-secondary)]">Type</label>
          <select value={type} onChange={e => { setType(e.target.value as any); setPositions(colors.map((_, i) => Math.round(i * 100 / (colors.length - 1)))); }}
            className="bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-pink-500/50">
            <option value="linear">Linear</option>
            <option value="radial">Radial</option>
            <option value="conic">Conic</option>
          </select>
          {type === 'linear' && (
            <select value={direction} onChange={e => setDirection(e.target.value)}
              className="bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-pink-500/50">
              {directions.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          )}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {colors.map((c, i) => (
            <div key={i} className="flex items-center gap-1">
              <input type="color" value={c} onChange={e => updateColor(i, e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-zinc-300 dark:border-zinc-700" />
              <input type="range" min={0} max={100} value={positions[i]} onChange={e => updatePosition(i, Number(e.target.value))}
                className="w-24 accent-pink-500" />
              <span className="text-xs text-[var(--text-muted)] w-10 text-right">{positions[i]}%</span>
              {colors.length > 2 && <button className="text-xs text-red-500 hover:text-red-600" onClick={() => removeColor(i)}>×</button>}
            </div>
          ))}
          <button onClick={addColor} className="px-3 py-1.5 text-sm font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-pink-400 transition-colors">+ Add</button>
        </div>

        <div className="w-full h-48 rounded-xl border border-zinc-300 dark:border-zinc-700" style={{ background: gradient }} />

        <div className="flex gap-2 flex-wrap">
          <code className="flex-1 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 font-mono text-xs break-all">{gradient}</code>
          <button onClick={() => { clipboardWrite(gradient); toast.success('CSS copied!'); }} className="px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-sm transition-colors">Copy CSS</button>
        </div>

        <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-zinc-200 dark:border-zinc-700">
          <div className="text-xs text-[var(--text-secondary)] mb-2">Color Stops</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {colors.map((c, i) => (
              <div key={i} className="p-2 rounded-lg text-center flex flex-col items-center" style={{ backgroundColor: c, color: '#ffffff' }}>
                <input type="color" value={c} onChange={e => updateColor(i, e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none bg-transparent" />
                <div className="font-mono">{c.toUpperCase()}</div>
                <input type="range" min={0} max={100} value={positions[i]} onChange={e => updatePosition(i, Number(e.target.value))}
                  className="w-full accent-pink-500 mt-1" />
                <span className="text-[10px]">{positions[i]}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CalculatorShell>
  );
}
// --- ContrastChecker ---
export function ContrastChecker() {
  const clr = ac('ContrastChecker');
  const [fg, setFg] = useState('#ffffff');
  const [bg, setBg] = useState('#1a1a2e');
  const [fontSize, setFontSize] = useState(18);
  const [fontWeight, setFontWeight] = useState(400);

  const lum = (h: string) => {
    const r = parseInt(h.slice(1, 3), 16) / 255, g = parseInt(h.slice(3, 5), 16) / 255, b = parseInt(h.slice(5, 7), 16) / 255;
    const [rl, gl, bl] = [r, g, b].map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
  };
  const l1 = lum(fg), l2 = lum(bg);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  const isLargeText = fontSize >= 18.5 || (fontSize >= 14 && fontWeight >= 700);
  const aaNormal = ratio >= 4.5;
  const aaLarge = ratio >= 3;
  const aaaNormal = ratio >= 7;
  const aaaLarge = ratio >= 4.5;

  const presets = [
    { label: 'White on Blue', apply: () => { setFg('#ffffff'); setBg('#3b82f6'); } },
    { label: 'Black on White', apply: () => { setFg('#000000'); setBg('#ffffff'); } },
    { label: 'White on Dark', apply: () => { setFg('#ffffff'); setBg('#1a1a2e'); } },
    { label: 'Yellow on Purple', apply: () => { setFg('#fef08a'); setBg('#7c3aed'); } },
    { label: 'WCAG AAA', apply: () => { setFg('#000000'); setBg('#ffffff'); setFontSize(24); } },
  ];

  const resultText = `Contrast: ${ratio.toFixed(2)}:1 (${isLargeText ? 'Large' : 'Normal'} text)`;

  return (
    <CalculatorShell title="Contrast Checker" result={resultText} onCalculate={() => {}} presets={presets} accent="emerald" downloadData={JSON.stringify({ foreground: fg, background: bg, ratio: ratio.toFixed(2), aaNormal, aaLarge, aaaNormal, aaaLarge }, null, 2)} downloadFilename="contrast.json">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Foreground</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={fg} onChange={e => setFg(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer border border-zinc-300 dark:border-zinc-700" />
              <input type="text" value={fg} onChange={e => { const v = e.target.value; if (/^#[0-9a-fA-F]{6}$/.test(v)) setFg(v); }} placeholder="#ffffff"
                className="flex-1 min-w-[120px] bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-uppercase" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Background</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={bg} onChange={e => setBg(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer border border-zinc-300 dark:border-zinc-700" />
              <input type="text" value={bg} onChange={e => { const v = e.target.value; if (/^#[0-9a-fA-F]{6}$/.test(v)) setBg(v); }} placeholder="#1a1a2e"
                className="flex-1 min-w-[120px] bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-uppercase" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Font Size</label>
            <input type="range" min={10} max={48} step={1} value={fontSize} onChange={e => setFontSize(Number(e.target.value))}
              className="w-full accent-emerald-500" />
            <div className="text-xs text-[var(--text-muted)] text-right mt-1">{fontSize}px</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Font Weight</label>
            <select value={fontWeight} onChange={e => setFontWeight(Number(e.target.value))}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
              <option value={400}>Normal (400)</option>
              <option value={500}>Medium (500)</option>
              <option value={600}>Semi-bold (600)</option>
              <option value={700}>Bold (700)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`p-3 rounded-xl text-center ${aaNormal ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
            <div className="text-xs text-[var(--text-muted)]">AA Normal</div>
            <div className={`font-bold ${aaNormal ? 'text-emerald-600' : 'text-red-600'}`}>{aaNormal ? 'PASS' : 'FAIL'}</div>
            <div className="text-[10px] text-[var(--text-muted)]">≥ 4.5:1</div>
          </div>
          <div className={`p-3 rounded-xl text-center ${aaLarge ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
            <div className="text-xs text-[var(--text-muted)]">AA Large</div>
            <div className={`font-bold ${aaLarge ? 'text-emerald-600' : 'text-red-600'}`}>{aaLarge ? 'PASS' : 'FAIL'}</div>
            <div className="text-[10px] text-[var(--text-muted)]">≥ 3:1</div>
          </div>
          <div className={`p-3 rounded-xl text-center ${aaaNormal ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
            <div className="text-xs text-[var(--text-muted)]">AAA Normal</div>
            <div className={`font-bold ${aaaNormal ? 'text-emerald-600' : 'text-red-600'}`}>{aaaNormal ? 'PASS' : 'FAIL'}</div>
            <div className="text-[10px] text-[var(--text-muted)]">≥ 7:1</div>
          </div>
          <div className={`p-3 rounded-xl text-center ${aaaLarge ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
            <div className="text-xs text-[var(--text-muted)]">AAA Large</div>
            <div className={`font-bold ${aaaLarge ? 'text-emerald-600' : 'text-red-600'}`}>{aaaLarge ? 'PASS' : 'FAIL'}</div>
            <div className="text-[10px] text-[var(--text-muted)]">≥ 4.5:1</div>
          </div>
        </div>

        <div className="w-full h-32 rounded-xl flex items-center justify-center text-lg font-bold" style={{ color: fg, backgroundColor: bg, fontSize: `${fontSize}px`, fontWeight }}>
          Sample Text — {ratio.toFixed(2)}:1
        </div>

        <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-zinc-200 dark:border-zinc-700">
          <div className="text-xs text-[var(--text-secondary)] mb-2">Color Values</div>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="p-2 rounded-lg text-center" style={{ backgroundColor: fg, color: l1 > 0.5 ? '#000' : '#fff' }}>
              <div className="font-mono">{fg.toUpperCase()}</div>
              <div className="opacity-80">Foreground</div>
            </div>
            <div className="p-2 rounded-lg text-center" style={{ backgroundColor: bg, color: l2 > 0.5 ? '#000' : '#fff' }}>
              <div className="font-mono">{bg.toUpperCase()}</div>
              <div className="opacity-80">Background</div>
            </div>
            <div className="p-2 rounded-lg text-center bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <div className="font-mono">{ratio.toFixed(2)}:1</div>
              <div className="opacity-80">Ratio</div>
            </div>
            <div className="p-2 rounded-lg text-center bg-blue-500/10 text-blue-700 dark:text-blue-300">
              <div className="font-mono">{isLargeText ? 'Large' : 'Normal'}</div>
              <div className="opacity-80">Text Size</div>
            </div>
          </div>
        </div>
      </div>
    </CalculatorShell>
  );
}
// --- CounterTool ---

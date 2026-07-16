"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Palette, Image, Radius, Layers } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'color' | 'border' | 'typography' | 'svg';

export default function DesignToolkit() {
  const [tab, setTab] = useState<Tab>('color');

  const TabBtn = ({ v, label, icon: Icon }: { v: Tab; label: string; icon: React.ElementType }) => (
    <button onClick={() => setTab(v)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${tab === v ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2">
        <TabBtn v="color" label="Color Tools" icon={Palette} />
        <TabBtn v="border" label="Border/Radius" icon={Radius} />
        <TabBtn v="typography" label="Typography" icon={Layers} />
        <TabBtn v="svg" label="SVG Tools" icon={Image} />
      </div>
      {tab === 'color' && <ColorTools />}
      {tab === 'border' && <BorderTools />}
      {tab === 'typography' && <TypographyTools />}
      {tab === 'svg' && <SvgTools />}
    </div>
  );
}

function ColorTools() {
  const [hex, setHex] = useState('#6366f1');
  const [rgb, setRgb] = useState('');
  const [hsl, setHsl] = useState('');
  const [complementary, setComplementary] = useState('');

  const hexToRgb = (h: string) => {
    const r = parseInt(h.slice(1, 3), 16);
    const g = parseInt(h.slice(3, 5), 16);
    const b = parseInt(h.slice(5, 7), 16);
    return { r, g, b };
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
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
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const analyze = () => {
    if (!/^#[0-9a-fA-F]{6}$/.test(hex)) { toast.error('Invalid hex color'); return; }
    const { r, g, b } = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(r, g, b);
    setRgb(`rgb(${r}, ${g}, ${b})`);
    setHsl(`hsl(${h}, ${s}%, ${l}%)`);
    const compH = (h + 180) % 360;
    const compHex = `#${[compH, s, l].map((v, i) => {
      const c = i === 0 ? v : (v / 100) * (i === 2 ? 1 : 1);
      return '00';
    }).join('')}`;
    const compRgb = `rgb(${255 - r}, ${255 - g}, ${255 - b})`;
    setComplementary(compRgb);
  };

  const copy = (t: string) => { clipboardWrite(t); toast.success('Copied!'); };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl space-y-4">
      <div className="flex gap-2 items-center">
        <input type="color" value={hex} onChange={e => setHex(e.target.value)} className="w-12 h-10 rounded-lg cursor-pointer" />
        <input type="text" value={hex} onChange={e => setHex(e.target.value)} className="flex-1 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-blue-500" />
        <button onClick={analyze} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-xl">Analyze</button>
      </div>
      <div className="h-12 rounded-xl border border-zinc-200 dark:border-zinc-700" style={{ backgroundColor: hex }} />
      {rgb && (
        <div className="space-y-2 text-xs font-mono">
          {[{ l: 'RGB', v: rgb }, { l: 'HSL', v: hsl }, { l: 'Complement', v: complementary }].map(({ l, v }) => (
            <div key={l} className="flex items-center justify-between bg-zinc-50 dark:bg-black rounded-lg px-3 py-2">
              <span className="text-zinc-500">{l}</span>
              <span className="text-emerald-600 dark:text-emerald-400">{v}</span>
              <button onClick={() => copy(v)} className="text-blue-500 hover:underline ml-2">Copy</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BorderTools() {
  const [borderRadius, setBorderRadius] = useState(12);
  const [borderWidth, setBorderWidth] = useState(1);
  const [borderColor, setBorderColor] = useState('#e4e4e7');
  const [borderStyle, setBorderStyle] = useState('solid');
  const [borderOutput, setBorderOutput] = useState('');

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Border Radius: {borderRadius}px</label>
          <input type="range" min={0} max={50} value={borderRadius} onChange={e => setBorderRadius(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Border Width: {borderWidth}px</label>
          <input type="range" min={0} max={10} value={borderWidth} onChange={e => setBorderWidth(Number(e.target.value))} className="w-full" />
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <input type="color" value={borderColor} onChange={e => setBorderColor(e.target.value)} className="w-10 h-8 rounded cursor-pointer" />
        <select value={borderStyle} onChange={e => setBorderStyle(e.target.value)} className="flex-1 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
          <option value="double">Double</option>
          <option value="groove">Groove</option>
          <option value="ridge">Ridge</option>
        </select>
      </div>
      <div className="h-20 rounded-xl flex items-center justify-center bg-zinc-50 dark:bg-black" style={{ borderRadius: `${borderRadius}px`, border: `${borderWidth}px ${borderStyle} ${borderColor}` }}>
        <span className="text-xs text-zinc-400">Preview</span>
      </div>
      <button onClick={() => { const css = `border: ${borderWidth}px ${borderStyle} ${borderColor}; border-radius: ${borderRadius}px;`; setBorderOutput(css); clipboardWrite(css); toast.success('CSS copied!'); }}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2.5 rounded-xl transition-all">Copy CSS</button>
      {borderOutput && <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400">{borderOutput}</p>}
    </div>
  );
}

function TypographyTools() {
  const [text, setText] = useState('The quick brown fox jumps over the lazy dog');
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [fontWeight, setFontWeight] = useState(400);

  const copyCss = () => {
    const css = `font-size: ${fontSize}px; line-height: ${lineHeight}; letter-spacing: ${letterSpacing}px; font-weight: ${fontWeight};`;
    clipboardWrite(css);
    toast.success('CSS copied!');
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl space-y-4">
      <textarea value={text} onChange={e => setText(e.target.value)}
        className="w-full h-20 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500 resize-y" />
      <div className="grid grid-cols-2 gap-4">
        {[
          { l: 'Font Size', v: fontSize, s: setFontSize, min: 8, max: 72 },
          { l: 'Line Height', v: lineHeight, s: setLineHeight, min: 0.5, max: 3, step: 0.1 },
          { l: 'Letter Spacing', v: letterSpacing, s: setLetterSpacing, min: -5, max: 10 },
          { l: 'Font Weight', v: fontWeight, s: setFontWeight, min: 100, max: 900, step: 100 },
        ].map(({ l, v, s, min, max, step }) => (
          <div key={l}>
            <label className="text-xs text-zinc-500 block mb-1">{l}: {v}{step === 0.1 ? '' : ''}</label>
            <input type="range" min={min} max={max} step={step || 1} value={v} onChange={e => s(step === 0.1 ? parseFloat(e.target.value) : Number(e.target.value))} className="w-full" />
          </div>
        ))}
      </div>
      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800" style={{ fontSize: `${fontSize}px`, lineHeight, letterSpacing: `${letterSpacing}px`, fontWeight }}>
        {text || 'Preview text'}
      </div>
      <button onClick={copyCss} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2.5 rounded-xl transition-all">Copy Typography CSS</button>
    </div>
  );
}

const SVG_SHAPES: Record<string, string> = {
  Circle: '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="#6366f1" /></svg>',
  Square: '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="80" height="80" fill="#6366f1" rx="8" /></svg>',
  Triangle: '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,10 90,90 10,90" fill="#6366f1" /></svg>',
  Star: '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,5 61,38 97,38 68,59 79,93 50,72 21,93 32,59 3,38 39,38" fill="#6366f1" /></svg>',
  Heart: '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><path d="M50,88 C25,65 5,45 15,25 C25,5 50,15 50,35 C50,15 75,5 85,25 C95,45 75,65 50,88Z" fill="#ef4444" /></svg>',
};

function SvgTools() {
  const [svgCode, setSvgCode] = useState(SVG_SHAPES.Circle);
  const [svgBg, setSvgBg] = useState('#ffffff');

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl space-y-4">
      <div className="flex flex-wrap gap-1">
        {Object.keys(SVG_SHAPES).map(name => (
          <button key={name} onClick={() => setSvgCode(SVG_SHAPES[name])}
            className="px-2 py-1 text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700">{name}</button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500">BG:</span>
        <input type="color" value={svgBg} onChange={e => setSvgBg(e.target.value)} className="w-10 h-8 rounded cursor-pointer" />
      </div>
      <div className="flex items-center justify-center p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 min-h-[140px] bg-cover" style={{ backgroundColor: svgBg }}>
        <div dangerouslySetInnerHTML={{ __html: svgCode }} />
      </div>
      <textarea value={svgCode} onChange={e => setSvgCode(e.target.value)}
        className="w-full h-28 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
      <button onClick={() => { clipboardWrite(svgCode); toast.success('SVG copied!'); }}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2.5 rounded-xl transition-all">Copy SVG</button>
    </div>
  );
}

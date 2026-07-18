"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Binary, Type, Wrench, Gauge, ExternalLink } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'encoders' | 'text' | 'tools' | 'units';

export default function ConverterToolkit() {
  const [tab, setTab] = useState<Tab>('encoders');
  const TabBtn = ({ v, label, icon: Icon }: { v: Tab; label: string; icon: React.ElementType }) => (
    <button onClick={() => setTab(v)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${tab === v ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );
  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2">
        <TabBtn v="encoders" label="Encoders" icon={Binary} />
        <TabBtn v="text" label="Text & Format" icon={Type} />
        <TabBtn v="tools" label="Security & Web" icon={Wrench} />
        <TabBtn v="units" label="Unit Converters" icon={Gauge} />
      </div>
      {tab === 'encoders' && <EncoderTools />}
      {tab === 'text' && <TextTools />}
      {tab === 'tools' && <WebTools />}
      {tab === 'units' && <UnitTools />}
    </div>
  );
}

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
    <h5 className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">{title}</h5>
    {children}
  </div>
);

const CalcBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button onClick={onClick} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-1.5 rounded-lg transition-all active:scale-[0.98]">{label}</button>
);

const Inp = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div className="flex items-center gap-1.5">
    <label className="text-[10px] text-zinc-500 shrink-0">{label}</label>
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[11px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
  </div>
);

function OutputBox({ output, onCopy }: { output: string; onCopy?: () => void }) {
  if (!output) return null;
  return (
    <div className="relative">
      <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 max-h-24 overflow-y-auto text-emerald-600 dark:text-emerald-400 break-all whitespace-pre-wrap">{output}</pre>
      <button onClick={onCopy || (() => { clipboardWrite(output); toast.success('Copied!'); })} className="text-[10px] text-blue-500 hover:underline mt-0.5">Copy</button>
    </div>
  );
}

const LinkCard = ({ title, slug, desc }: { title: string; slug: string; desc: string }) => (
  <Link href={`/developer/${slug}`} className="block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all group">
    <div className="flex items-center gap-1">
      <h5 className="text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:underline">{title}</h5>
      <ExternalLink className="w-3 h-3 text-blue-400 shrink-0" />
    </div>
    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
  </Link>
);

function EncoderTools() {
  const [b32In, setB32In] = useState('Hello World');
  const [b32Out, setB32Out] = useState('');
  const [b64jIn, setB64jIn] = useState('eyJuYW1lIjoiSm9obiIsImFnZSI6MzB9');
  const [b64jOut, setB64jOut] = useState('');
  const [hexIn, setHexIn] = useState('48656c6c6f20576f726c64');
  const [hexOut, setHexOut] = useState('');
  const [svgB64In, setSvgB64In] = useState('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>');
  const [svgB64Out, setSvgB64Out] = useState('');

  const b32enc = () => { try { const enc = (s: string) => { const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; const bytes = new TextEncoder().encode(s); let bits = ''; for (const b of bytes) bits += b.toString(2).padStart(8, '0'); let result = ''; for (let i = 0; i < bits.length; i += 5) { const chunk = bits.slice(i, i + 5).padEnd(5, '0'); result += chars[parseInt(chunk, 2)]; } return result; }; setB32Out(enc(b32In)); toast.success('Encoded'); } catch { toast.error('Error'); } };
  const b32dec = () => { try { const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; let bits = ''; for (const c of b32In.toUpperCase()) { const idx = chars.indexOf(c); if (idx < 0) continue; bits += idx.toString(2).padStart(5, '0'); } const bytes: number[] = []; for (let i = 0; i + 7 < bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2)); setB32Out(new TextDecoder().decode(new Uint8Array(bytes))); toast.success('Decoded'); } catch { toast.error('Invalid base32'); } };

  const b64toJson = () => { try { const dec = atob(b64jIn); const parsed = JSON.parse(dec); setB64jOut(JSON.stringify(parsed, null, 2)); toast.success('Decoded to JSON'); } catch { toast.error('Invalid base64 or not JSON'); } };

  const hexToText_ = () => { try { const bytes = hexIn.match(/.{1,2}/g)?.map(b => parseInt(b, 16)) || []; setHexOut(new TextDecoder().decode(new Uint8Array(bytes))); toast.success('Decoded'); } catch { toast.error('Invalid hex'); } };
  const textToHex = () => { try { setHexOut(Array.from(new TextEncoder().encode(hexIn)).map(b => b.toString(16).padStart(2, '0')).join('')); toast.success('Encoded'); } catch { toast.error('Error'); } };

  const svgToB64 = () => { try { const b64 = btoa(svgB64In); setSvgB64Out(`data:image/svg+xml;base64,${b64}`); toast.success('Converted'); } catch { toast.error('Invalid SVG'); } };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <Card title="Base32 Encode/Decode">
        <textarea value={b32In} onChange={e => setB32In(e.target.value)}
          className="w-full h-14 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <div className="flex gap-2">
          <CalcBtn onClick={b32enc} label="Encode" />
          <CalcBtn onClick={b32dec} label="Decode" />
        </div>
        <OutputBox output={b32Out} />
      </Card>

      <Card title="Base64 to JSON">
        <textarea value={b64jIn} onChange={e => setB64jIn(e.target.value)}
          className="w-full h-14 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="Base64 string..." />
        <CalcBtn onClick={b64toJson} label="Decode to JSON" />
        <OutputBox output={b64jOut} />
      </Card>

      <Card title="Hex to Text / Text to Hex">
        <textarea value={hexIn} onChange={e => setHexIn(e.target.value)}
          className="w-full h-14 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="Hex or text..." />
        <div className="flex gap-2">
          <CalcBtn onClick={hexToText_} label="Hex→Text" />
          <CalcBtn onClick={textToHex} label="Text→Hex" />
        </div>
        <OutputBox output={hexOut} />
      </Card>

      <Card title="SVG to Base64">
        <textarea value={svgB64In} onChange={e => setSvgB64In(e.target.value)}
          className="w-full h-14 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="<svg>...</svg>" />
        <CalcBtn onClick={svgToB64} label="Convert to Data URI" />
        <OutputBox output={svgB64Out} />
      </Card>
    </div>
  );
}

function TextTools() {
  const [charIn, setCharIn] = useState('Hello World');
  const [charOut, setCharOut] = useState('');
  const [uniIn, setUniIn] = useState('Hello 🌍 World');
  const [uniOut, setUniOut] = useState('');
  const [mdIn, setMdIn] = useState('# Hello\n\nThis is **bold** and *italic*.\n\n- List item 1\n- List item 2\n\n> Blockquote\n\n`inline code`\n\n```\ncode block\n```\n\n[Link](https://example.com)');
  const [mdOut, setMdOut] = useState('');
  const [pxIn, setPxIn] = useState('16');
  const [pxBase, setPxBase] = useState('16');
  const [pxOut, setPxOut] = useState('');

  const charConv = () => {
    const lines: string[] = [];
    for (const c of charIn) {
      const code = c.codePointAt(0) || 0;
      lines.push(`${c} → U+${code.toString(16).toUpperCase().padStart(4, '0')} (${code}) ${code > 127 ? '(non-ASCII)' : '(ASCII)'}`);
    }
    setCharOut(lines.join('\n'));
    toast.success('Analyzed ' + charIn.length + ' chars');
  };

  const uniConv = () => {
    const lines: string[] = [];
    for (const c of uniIn) {
      const code = c.codePointAt(0) || 0;
      const esc = code > 127 ? `\\u{${code.toString(16)}}` : c;
      const htmL = code > 127 ? `&#${code};` : c;
      lines.push(`${c} → U+${code.toString(16).toUpperCase().padStart(4, '0')} | JS: "${esc}" | HTML: "${htmL}"`);
    }
    setUniOut(lines.join('\n'));
    toast.success('Converted');
  };

  const mdToSlack = () => {
    let out = mdIn;
    out = out.replace(/######\s+(.*)/g, '*$1*');
    out = out.replace(/#####\s+(.*)/g, '*$1*');
    out = out.replace(/####\s+(.*)/g, '*$1*');
    out = out.replace(/###\s+(.*)/g, '*$1*');
    out = out.replace(/##\s+(.*)/g, '*$1*');
    out = out.replace(/#\s+(.*)/g, '*$1*');
    out = out.replace(/\*\*(.*?)\*\*/g, '*$1*');
    out = out.replace(/__(.*?)__/g, '*$1*');
    out = out.replace(/\*(.*?)\*/g, '_$1_');
    out = out.replace(/_(.*?)_/g, '_$1_');
    out = out.replace(/```[\s\S]*?```/g, m => '```' + m.slice(3, -3).trim() + '```');
    out = out.replace(/`([^`]+)`/g, '`$1`');
    out = out.replace(/^>\s+(.*)/gm, '>$1');
    out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<$2|$1>');
    out = out.replace(/^- /gm, '• ');
    out = out.replace(/^ {2}- /gm, '  ◦ ');
    out = out.replace(/^ {4}- /gm, '    ▪ ');
    out = out.replace(/^(\d+)\. /gm, '$1. ');
    setMdOut(out);
    toast.success('Converted to Slack mrkdwn');
  };

  const pxToRem = () => {
    const px = parseFloat(pxIn);
    const base = parseFloat(pxBase) || 16;
    if (isNaN(px)) { toast.error('Enter a number'); return; }
    const rem = px / base;
    setPxOut(`${px}px = ${rem.toFixed(4)}rem (base: ${base}px)\n\n${px}px / ${base}px = ${rem.toFixed(4)}rem`);
    toast.success('Converted');
  };

  const remToPx = () => {
    const rem = parseFloat(pxIn);
    const base = parseFloat(pxBase) || 16;
    if (isNaN(rem)) { toast.error('Enter a number'); return; }
    const px = rem * base;
    setPxOut(`${rem}rem = ${px.toFixed(1)}px (base: ${base}px)\n\n${rem}rem × ${base}px = ${px.toFixed(1)}px`);
    toast.success('Converted');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <Card title="Character Encoding Converter">
        <textarea value={charIn} onChange={e => setCharIn(e.target.value)}
          className="w-full h-14 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <CalcBtn onClick={charConv} label="Analyze Characters" />
        <OutputBox output={charOut} />
      </Card>

      <Card title="Unicode Converter">
        <textarea value={uniIn} onChange={e => setUniIn(e.target.value)}
          className="w-full h-14 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <CalcBtn onClick={uniConv} label="Convert Unicode" />
        <OutputBox output={uniOut} />
      </Card>

      <Card title="Markdown to Slack">
        <textarea value={mdIn} onChange={e => setMdIn(e.target.value)}
          className="w-full h-24 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <CalcBtn onClick={mdToSlack} label="Convert to Slack" />
        <OutputBox output={mdOut} />
      </Card>

      <Card title="PX to REM Converter">
        <Inp label="Value" value={pxIn} onChange={setPxIn} placeholder="16" />
        <Inp label="Base (px)" value={pxBase} onChange={setPxBase} placeholder="16" />
        <div className="flex gap-2">
          <CalcBtn onClick={pxToRem} label="PX → REM" />
          <CalcBtn onClick={remToPx} label="REM → PX" />
        </div>
        <OutputBox output={pxOut} />
      </Card>
    </div>
  );
}

function WebTools() {
  const [svgOptIn, setSvgOptIn] = useState('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>');
  const [svgOptOut, setSvgOptOut] = useState('');

  const optSvg = () => {
    try {
      let out = svgOptIn;
      out = out.replace(/>\s+</g, '><');
      out = out.replace(/\s{2,}/g, ' ');
      out = out.replace(/\n/g, '');
      out = out.replace(/<!--.*?-->/g, '');
      out = out.replace(/ xmlns:xmlns="/g, ' xmlns="');
      const origSize = new TextEncoder().encode(svgOptIn).length;
      const newSize = new TextEncoder().encode(out).length;
      const saved = Math.round((1 - newSize / origSize) * 100);
      setSvgOptOut(`${out}\n\n---\nOriginal: ${origSize} bytes\nOptimized: ${newSize} bytes (${saved}% smaller)`);
      toast.success(`Optimized: ${saved}% smaller`);
    } catch { toast.error('Error optimizing SVG'); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <LinkCard title="HMAC Generator" slug="hmac-generator" desc="Generate HMAC signatures using a secret key and hash algorithm for API authentication." />

      <Card title="SVG Optimizer">
        <textarea value={svgOptIn} onChange={e => setSvgOptIn(e.target.value)}
          className="w-full h-32 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="<svg>...</svg>" />
        <CalcBtn onClick={optSvg} label="Optimize SVG" />
        <OutputBox output={svgOptOut} />
      </Card>
    </div>
  );
}

function UnitTools() {
  const [speedIn, setSpeedIn] = useState('100');
  const [speedFrom, setSpeedFrom] = useState('kmh');
  const [speedTo, setSpeedTo] = useState('mph');
  const [speedOut, setSpeedOut] = useState('');
  const [powerIn, setPowerIn] = useState('100');
  const [powerFrom, setPowerFrom] = useState('kw');
  const [powerTo, setPowerTo] = useState('hp');
  const [powerOut, setPowerOut] = useState('');
  const [pressIn, setPressIn] = useState('100');
  const [pressFrom, setPressFrom] = useState('kpa');
  const [pressTo, setPressTo] = useState('psi');
  const [pressOut, setPressOut] = useState('');

  const SPEED: Record<string, number> = { kmh: 1, mph: 0.621371, ms: 0.277778, knots: 0.539957, fps: 0.911344 };
  const speedConv = () => { const v = parseFloat(speedIn); if (isNaN(v)) return; const base = v / SPEED[speedFrom]; setSpeedOut(`${v} ${speedFrom} = ${(base * SPEED[speedTo]).toFixed(4)} ${speedTo}`); toast.success('Converted'); };
  const POWER: Record<string, number> = { kw: 1, hp: 1.34102, bhp: 1.34102, watt: 1000, mw: 0.001, btu: 3412.14 };
  const powerConv = () => { const v = parseFloat(powerIn); if (isNaN(v)) return; const base = v / POWER[powerFrom]; setPowerOut(`${v} ${powerFrom} = ${(base * POWER[powerTo]).toFixed(4)} ${powerTo}`); toast.success('Converted'); };
  const PRESSURE: Record<string, number> = { kpa: 1, psi: 0.145038, bar: 0.01, atm: 0.009869, torr: 7.50062, mbar: 10 };
  const pressConv = () => { const v = parseFloat(pressIn); if (isNaN(v)) return; const base = v / PRESSURE[pressFrom]; setPressOut(`${v} ${pressFrom} = ${(base * PRESSURE[pressTo]).toFixed(4)} ${pressTo}`); toast.success('Converted'); };

  const UnitRow = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) => (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-zinc-500 w-8 shrink-0">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="flex-1 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-1.5 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500">
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <Card title="Speed Converter">
        <Inp label="Value" value={speedIn} onChange={setSpeedIn} />
        <UnitRow label="From" value={speedFrom} onChange={setSpeedFrom} options={[{v:'kmh',l:'km/h'},{v:'mph',l:'mph'},{v:'ms',l:'m/s'},{v:'knots',l:'knots'},{v:'fps',l:'ft/s'}]} />
        <UnitRow label="To" value={speedTo} onChange={setSpeedTo} options={[{v:'kmh',l:'km/h'},{v:'mph',l:'mph'},{v:'ms',l:'m/s'},{v:'knots',l:'knots'},{v:'fps',l:'ft/s'}]} />
        <CalcBtn onClick={speedConv} label="Convert Speed" />
        <OutputBox output={speedOut} />
      </Card>

      <Card title="Power Converter">
        <Inp label="Value" value={powerIn} onChange={setPowerIn} />
        <UnitRow label="From" value={powerFrom} onChange={setPowerFrom} options={[{v:'kw',l:'kW'},{v:'hp',l:'hp'},{v:'bhp',l:'bhp'},{v:'watt',l:'W'},{v:'mw',l:'MW'},{v:'btu',l:'BTU/hr'}]} />
        <UnitRow label="To" value={powerTo} onChange={setPowerTo} options={[{v:'kw',l:'kW'},{v:'hp',l:'hp'},{v:'bhp',l:'bhp'},{v:'watt',l:'W'},{v:'mw',l:'MW'},{v:'btu',l:'BTU/hr'}]} />
        <CalcBtn onClick={powerConv} label="Convert Power" />
        <OutputBox output={powerOut} />
      </Card>

      <Card title="Pressure Converter">
        <Inp label="Value" value={pressIn} onChange={setPressIn} />
        <UnitRow label="From" value={pressFrom} onChange={setPressFrom} options={[{v:'kpa',l:'kPa'},{v:'psi',l:'psi'},{v:'bar',l:'bar'},{v:'atm',l:'atm'},{v:'torr',l:'Torr'},{v:'mbar',l:'mbar'}]} />
        <UnitRow label="To" value={pressTo} onChange={setPressTo} options={[{v:'kpa',l:'kPa'},{v:'psi',l:'psi'},{v:'bar',l:'bar'},{v:'atm',l:'atm'},{v:'torr',l:'Torr'},{v:'mbar',l:'mbar'}]} />
        <CalcBtn onClick={pressConv} label="Convert Pressure" />
        <OutputBox output={pressOut} />
      </Card>
    </div>
  );
}

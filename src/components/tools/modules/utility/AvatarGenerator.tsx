"use client";
import { useState, useRef } from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';
import { labelClass } from './GeneratorsShared';

export default function AvatarGenerator() {
  const [name, setName] = useState('John Doe');
  const [bgColor, setBgColor] = useState('#4F46E5');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [size, setSize] = useState(120);
  const [shape, setShape] = useState<'rounded' | 'circle' | 'square'>('rounded');
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
  const svgRef = useRef<SVGSVGElement>(null);
  const shapes = { rounded: 0.2, circle: 0.5, square: 0 };

  const presets = [
    { label: 'John Doe', apply: () => { setName('John Doe'); setBgColor('#4F46E5'); setTextColor('#FFFFFF'); } },
    { label: 'Jane Smith', apply: () => { setName('Jane Smith'); setBgColor('#10B981'); setTextColor('#FFFFFF'); } },
    { label: 'Alex Chen', apply: () => { setName('Alex Chen'); setBgColor('#F59E0B'); setTextColor('#000000'); } },
    { label: 'Default', apply: () => { setName('John Doe'); setBgColor('#4F46E5'); setTextColor('#FFFFFF'); setSize(120); setShape('rounded'); } },
  ];

  const resultText = 'Avatar: ' + initials + ' (' + size + 'px, ' + shape + ')';
  const avatarSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '"><rect width="' + size + '" height="' + size + '" rx="' + (size * shapes[shape]) + '" fill="' + bgColor + '"/><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="' + textColor + '" font-size="' + (size * 0.4) + '" font-family="sans-serif" font-weight="bold">' + initials + '</text></svg>';

  const customResult = (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <svg ref={svgRef} width={size} height={size} viewBox={'0 0 ' + size + ' ' + size} xmlns="http://www.w3.org/2000/svg">
        <rect width={size} height={size} rx={size * shapes[shape]} fill={bgColor} />
        <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fill={textColor} fontSize={size * 0.4} fontFamily="sans-serif" fontWeight="bold">{initials}</text>
      </svg>
      <div className="flex gap-2 mt-3">
        <button onClick={() => { const svg = svgRef.current; if (!svg) return; const clone = svg.cloneNode(true) as SVGSVGElement; const serializer = new XMLSerializer(); const source = serializer.serializeToString(clone); const blob = new Blob([source], { type: 'image/svg+xml' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'avatar.svg'; a.click(); URL.revokeObjectURL(url); toast.success('SVG downloaded!'); }} className="px-3 py-1.5 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-lg text-xs transition-colors">Download SVG</button>
        <button onClick={() => { clipboardWrite(initials).then(ok => { if (ok) toast.success('Copied!'); else toast.error('Copy blocked by the browser — select the text manually.'); }); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors" aria-label="Copy initials"><Copy size={14} /></button>
      </div>
    </div>
  );

  return (
    <CalculatorShell category="Utility" title="Avatar Generator" result={resultText} customResult={customResult} auto={true} presets={presets} accent="indigo" downloadData={avatarSvg} downloadFilename="avatar.svg">
      <div className="space-y-4">
        <label className={labelClass}>Person name</label>
        <input aria-label="Person name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter a name..."
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50" />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="lbl-avatargenerator-background" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Background</label>
            <input id="lbl-avatargenerator-background" aria-label="Background" type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer border border-[var(--border-subtle)]" />
          </div>
          <div>
            <label htmlFor="lbl-avatargenerator-text" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text</label>
            <input id="lbl-avatargenerator-text" aria-label="Text" type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer border border-[var(--border-subtle)]" />
          </div>
        </div>

        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Size: {size}px</label>
        <input type="range" min={40} max={200} value={size} onChange={e => setSize(Number(e.target.value))} aria-label="Size" className="w-full accent-[var(--accent)]" />

        <div className="flex gap-2">
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider self-center mr-2">Shape:</span>
          {Object.entries(shapes).map(([k, v]) => (
            <button key={k} onClick={() => setShape(k as 'rounded' | 'circle' | 'square')}
              className={'px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ' + (shape === k ? 'bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]' : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)]')}>
              {k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </CalculatorShell>
  );
}

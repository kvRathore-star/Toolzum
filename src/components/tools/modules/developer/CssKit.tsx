"use client";
import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

const Inp = ({ label, value, onChange, suffix, small }: { label: string; value: number | string; onChange: (v: any) => void; suffix?: string; small?: boolean }) => {
  const id = React.useId();
  return (
  <div className="flex items-center gap-1.5">
    <label htmlFor={id} className="text-[10px] text-[var(--text-secondary)] w-14 shrink-0">{label}</label>
    <input id={id} type={typeof value === 'number' ? 'number' : 'text'} value={value} onChange={e => onChange(typeof value === 'number' ? Number(e.target.value) : e.target.value)}
      className={`w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-2 ${small ? 'py-1 text-[11px]' : 'py-1.5 text-xs'} text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`} />
    {suffix && <span className="text-[10px] text-[var(--text-muted)] w-5">{suffix}</span>}
  </div>
  );
};

const CalcBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button onClick={onClick} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-1.5 rounded-lg transition-all active:scale-[0.98]">{label}</button>
);

const Result = ({ value }: { value: string }) => (
  <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-[var(--bg-overlay)] rounded-lg px-2 py-1 break-all whitespace-pre-wrap">{value}</p>
);

const PresetBar = ({ presets }: { presets: { label: string; apply: () => void }[] }) => (
  <div className="flex flex-wrap gap-2 mb-4">
    {presets.map((p) => (
      <button key={p.label} onClick={p.apply} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
        {p.label}
      </button>
    ))}
  </div>
);

const CopyDownload = ({ content, filename, label }: { content: string; filename: string; label?: string }) => (
  <div className="flex items-center gap-3">
    <button onClick={() => { clipboardWrite(content); toast.success(`${label || 'CSS'} copied!`); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy {label || 'CSS'}</button>
    <button onClick={() => { const blob = new Blob([content], { type: 'text/css' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</button>
  </div>
);

function useDarkMode() {
  const [dark, setDark] = useState(false);
  return { dark, toggle: () => setDark(d => !d) };
}

/* ═══════════════════════════════════════════════════════════════
   1. GLASSMORPHISM GENERATOR
   ═══════════════════════════════════════════════════════════════ */
export function GlassmorphismGenerator() {
  const [blur, setBlur] = useState(12);
  const [opacity, setOpacity] = useState(15);
  const [bgColor, setBgColor] = useState('255,255,255');
  const [borderOn, setBorderOn] = useState(true);
  const [borderRadius, setBorderRadius] = useState(12);

  const css = [
    `background: rgba(${bgColor},${(opacity / 100).toFixed(2)});`,
    `backdrop-filter: blur(${blur}px);`,
    `-webkit-backdrop-filter: blur(${blur}px);`,
    borderOn ? `border: 1px solid rgba(255,255,255,0.18);` : null,
    `border-radius: ${borderRadius}px;`,
  ].filter(Boolean).join('\n');

  const tailwindParts = [
    `bg-[rgba(${bgColor},${(opacity / 100).toFixed(2)})]`,
    `backdrop-blur-[${blur}px]`,
    borderOn ? 'border border-white/18' : null,
    `rounded-[${borderRadius}px]`,
  ].filter(Boolean);
  const tailwind = `class="${tailwindParts.join(' ')}"`;

  const presetList = [
    { label: 'Frosted Card', apply: () => { setBlur(16); setOpacity(20); setBgColor('255,255,255'); setBorderOn(true); setBorderRadius(16); } },
    { label: 'Glass Button', apply: () => { setBlur(8); setOpacity(30); setBgColor('255,255,255'); setBorderOn(true); setBorderRadius(8); } },
    { label: 'Glass Overlay', apply: () => { setBlur(24); setOpacity(10); setBgColor('0,0,0'); setBorderOn(false); setBorderRadius(0); } },
    { label: 'Subtle Blur', apply: () => { setBlur(4); setOpacity(8); setBgColor('255,255,255'); setBorderOn(true); setBorderRadius(12); } },
  ];

  return (
    <div className="w-full bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-xl space-y-4">
      <PresetBar presets={presetList} />

      {/* Live Preview */}
      <div className="relative w-full h-32 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div
          className="absolute inset-4 flex items-center justify-center text-sm font-semibold text-white/80"
          style={{
            background: `rgba(${bgColor},${(opacity / 100).toFixed(2)})`,
            backdropFilter: `blur(${blur}px)`,
            WebkitBackdropFilter: `blur(${blur}px)`,
            border: borderOn ? '1px solid rgba(255,255,255,0.18)' : 'none',
            borderRadius: `${borderRadius}px`,
          }}
        >
          Glassmorphism
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="flex gap-1 items-center"><span className="text-[10px] text-[var(--text-secondary)]">Blur</span>
            <input type="range" min={0} max={40} value={blur} onChange={e => setBlur(Number(e.target.value))} className="flex-1" />
            <span className="text-[10px] text-[var(--text-muted)] w-6">{blur}px</span>
          </div>
          <div className="flex gap-1 items-center"><span className="text-[10px] text-[var(--text-secondary)]">Opacity</span>
            <input type="range" min={0} max={100} value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="flex-1" />
            <span className="text-[10px] text-[var(--text-muted)] w-6">{opacity}%</span>
          </div>
          <div className="flex gap-1 items-center"><span className="text-[10px] text-[var(--text-secondary)]">Radius</span>
            <input type="range" min={0} max={40} value={borderRadius} onChange={e => setBorderRadius(Number(e.target.value))} className="flex-1" />
            <span className="text-[10px] text-[var(--text-muted)] w-6">{borderRadius}px</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-[var(--text-secondary)]">Tint</label>
            <input aria-label="Tint" type="color" value={`#${bgColor.split(',').map(c => Number(c).toString(16).padStart(2, '0')).join('')}`}
              onChange={e => { const h = e.target.value.slice(1); setBgColor(`${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}`); }}
              className="w-8 h-6 rounded cursor-pointer border-0" />
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={borderOn} onChange={e => setBorderOn(e.target.checked)} className="w-3 h-3 rounded" />
            <span className="text-[10px] text-[var(--text-secondary)]">Border</span>
          </label>
        </div>
      </div>

      <div className="space-y-1">
        <Result value={css} />
        <p className="text-[9px] font-mono text-purple-500 dark:text-purple-400 bg-[var(--bg-overlay)] rounded-lg px-2 py-1 break-all whitespace-pre-wrap mt-1">{tailwind}</p>
      </div>
      <div className="flex items-center gap-3">
        <CopyDownload content={css} filename="glassmorphism.css" />
        <button onClick={() => { clipboardWrite(tailwind); toast.success('Tailwind copied!'); }} className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium">Copy Tailwind</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. NEUMORPHISM GENERATOR
   ═══════════════════════════════════════════════════════════════ */
export function NeumorphismGenerator() {
  const [intensity, setIntensity] = useState(6);
  const [distance, setDistance] = useState(6);
  const [blur, setBlur] = useState(20);
  const [color, setColor] = useState('#e0e0e0');
  const { dark, toggle: toggleDark } = useDarkMode();
  const [inset, setInset] = useState(false);

  const lightShadow = dark ? 'rgba(0,0,0,0.2)' : lightenColor(color, 40);
  const darkShadow = dark ? 'rgba(0,0,0,0.7)' : darkenColor(color, 20);
  const borderRadius = 16;

  const css = [
    `background: ${color};`,
    `border-radius: ${borderRadius}px;`,
    `box-shadow: ${inset ? 'inset ' : ''}${distance}px ${distance}px ${blur}px ${darkShadow}, ${inset ? 'inset ' : ''}-${distance}px -${distance}px ${blur}px ${lightShadow};`,
  ].join('\n');

  const presetList = [
    { label: 'Soft Button', apply: () => { setIntensity(6); setDistance(6); setBlur(20); setColor('#e0e0e0'); setInset(false); } },
    { label: 'Pressed State', apply: () => { setIntensity(4); setDistance(4); setBlur(10); setColor('#e0e0e0'); setInset(true); } },
    { label: 'Card', apply: () => { setIntensity(8); setDistance(10); setBlur(30); setColor('#e0e0e0'); setInset(false); } },
    { label: 'Inset Input', apply: () => { setIntensity(5); setDistance(5); setBlur(15); setColor('#e0e0e0'); setInset(true); } },
  ];

  return (
    <div className="w-full bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <PresetBar presets={presetList} />
        <button onClick={toggleDark} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors ml-2">
          {dark ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      {/* Live Preview */}
      <div className="w-full h-32 rounded-xl flex items-center justify-center"
        style={{ background: dark ? '#2a2a2a' : color }}>
        <div
          className="w-24 h-24 flex items-center justify-center text-xs font-semibold"
          style={{
            background: color,
            borderRadius: `${borderRadius}px`,
            boxShadow: `${inset ? 'inset ' : ''}${distance}px ${distance}px ${blur}px ${darkShadow}, ${inset ? 'inset ' : ''}-${distance}px -${distance}px ${blur}px ${lightShadow}`,
            color: dark ? '#fff' : '#333',
          }}
        >
          Preview
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="flex gap-1 items-center"><span className="text-[10px] text-[var(--text-secondary)]">Intensity</span>
            <input type="range" min={1} max={20} value={intensity} onChange={e => setIntensity(Number(e.target.value))} className="flex-1" />
            <span className="text-[10px] text-[var(--text-muted)] w-5">{intensity}</span>
          </div>
          <div className="flex gap-1 items-center"><span className="text-[10px] text-[var(--text-secondary)]">Distance</span>
            <input type="range" min={0} max={30} value={distance} onChange={e => setDistance(Number(e.target.value))} className="flex-1" />
            <span className="text-[10px] text-[var(--text-muted)] w-5">{distance}px</span>
          </div>
          <div className="flex gap-1 items-center"><span className="text-[10px] text-[var(--text-secondary)]">Blur</span>
            <input type="range" min={1} max={60} value={blur} onChange={e => setBlur(Number(e.target.value))} className="flex-1" />
            <span className="text-[10px] text-[var(--text-muted)] w-5">{blur}px</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-[var(--text-secondary)]">Base</label>
            <input aria-label="Base" type="color" value={color} onChange={e => setColor(e.target.value)} className="w-8 h-6 rounded cursor-pointer border-0" />
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={inset} onChange={e => setInset(e.target.checked)} className="w-3 h-3 rounded" />
            <span className="text-[10px] text-[var(--text-secondary)]">Inset shadow</span>
          </label>
        </div>
      </div>

      <Result value={css} />
      <CopyDownload content={css} filename="neumorphism.css" />
    </div>
  );
}

function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0x00FF) + amount);
  const b = Math.min(255, (num & 0x0000FF) + amount);
  return `rgb(${r},${g},${b})`;
}

function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00FF) - amount);
  const b = Math.max(0, (num & 0x0000FF) - amount);
  return `rgb(${r},${g},${b})`;
}

/* ═══════════════════════════════════════════════════════════════
   3. CSS TO SCSS
   ═══════════════════════════════════════════════════════════════ */
export function CssToScss() {
  const [input, setInput] = useState('.container {\n  color: red;\n  padding: 10px;\n}\n\n.container .inner {\n  background: blue;\n}\n\n.container .inner .deep {\n  margin: 0;\n}');
  const [output, setOutput] = useState('');
  const [extractVars, setExtractVars] = useState(true);
  const [nestSelectors, setNestSelectors] = useState(true);

  const convert = useCallback(() => {
    let scss = input;
    const lines = input.split('\n');
    const rules: { selector: string; body: string[] }[] = [];
    let currentSelector = '';
    let currentBody: string[] = [];
    let braceDepth = 0;
    let extractedVars = '';

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.endsWith('{') && !trimmed.startsWith('}')) {
        if (currentSelector) {
          rules.push({ selector: currentSelector, body: [...currentBody] });
        }
        currentSelector = trimmed.replace('{', '').trim();
        currentBody = [];
        braceDepth++;
      } else if (trimmed === '}') {
        braceDepth--;
        if (braceDepth === 0) {
          if (currentSelector) {
            rules.push({ selector: currentSelector, body: [...currentBody] });
          }
          currentSelector = '';
          currentBody = [];
        }
      } else if (trimmed && braceDepth > 0) {
        currentBody.push(trimmed);
      }
    });

    if (nestSelectors) {
      const grouped: Record<string, string[]> = {};
      rules.forEach(rule => {
        const parts = rule.selector.split(/\s+/);
        const parent = parts[0];
        const child = parts.slice(1).join(' ');
        if (!grouped[parent]) grouped[parent] = [];
        if (child) {
          grouped[parent].push(`  & ${child} {\n${rule.body.map(b => `    ${b}`).join('\n')}\n  }`);
        } else {
          grouped[parent].push(...rule.body.map(b => `  ${b}`));
        }
      });

      scss = Object.entries(grouped).map(([sel, body]) => {
        const props = body.filter(b => !b.includes('{') && !b.includes('}'));
        const nested = body.filter(b => b.includes('{'));
        return `${sel} {\n${props.join('\n')}${nested.length ? '\n' + nested.join('\n') : ''}\n}`;
      }).join('\n\n');
    }

    if (extractVars) {
      const varMap: Record<string, string> = {};
      let varCount = 0;
      scss = scss.replace(/(#[0-9a-fA-F]{3,8}|rgb\([^)]+\)|rgba\([^)]+\))/g, (match) => {
        if (!varMap[match]) {
          varMap[match] = `$color-${varCount++}`;
        }
        return varMap[match];
      });
      if (Object.keys(varMap).length > 0) {
        extractedVars = Object.entries(varMap).map(([val, name]) => `${name}: ${val};`).join('\n') + '\n\n';
      }
    }

    const inputLines = input.split('\n').length;
    const outputLines = (extractedVars + scss).split('\n').length;
    const result = extractedVars + scss + `\n\n/* Lines: ${inputLines} → ${outputLines} */`;
    setOutput(result);
    toast.success('Converted to SCSS');
  }, [input, extractVars, nestSelectors]);

  const presetList = [
    { label: 'Nested selectors', apply: () => { setInput('.container {\n  color: red;\n}\n\n.container .inner {\n  background: blue;\n}\n\n.container .inner .deep {\n  margin: 0;\n}'); setNestSelectors(true); setExtractVars(false); } },
    { label: 'Variables', apply: () => { setInput('.card {\n  background: #ffffff;\n  color: #333333;\n  border: 1px solid #cccccc;\n}\n\n.btn {\n  background: #0066cc;\n  color: #ffffff;\n}'); setExtractVars(true); setNestSelectors(false); } },
    { label: 'Mixins', apply: () => { setInput('.card {\n  border-radius: 8px;\n  padding: 16px;\n  margin: 8px;\n}\n\n.btn {\n  border-radius: 8px;\n  padding: 8px 16px;\n  margin: 4px;\n}'); setExtractVars(false); setNestSelectors(false); } },
  ];

  return (
    <div className="w-full bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-xl space-y-4">
      <PresetBar presets={presetList} />
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <span className="text-[10px] text-[var(--text-secondary)] font-semibold">CSS Input</span>
          <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Paste CSS..."
            className="w-full h-40 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded px-2 py-1 text-[9px] font-mono text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none" />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-[var(--text-secondary)] font-semibold">SCSS Output</span>
          <pre className="w-full h-40 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded px-2 py-1 text-[9px] font-mono text-emerald-600 dark:text-emerald-400 overflow-auto whitespace-pre-wrap">{output || '// Output will appear here'}</pre>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={extractVars} onChange={e => setExtractVars(e.target.checked)} className="w-3 h-3 rounded" />
          <span className="text-[10px] text-[var(--text-secondary)]">Extract Variables</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={nestSelectors} onChange={e => setNestSelectors(e.target.checked)} className="w-3 h-3 rounded" />
          <span className="text-[10px] text-[var(--text-secondary)]">Nest Selectors</span>
        </label>
      </div>
      <CalcBtn onClick={convert} label="Convert to SCSS" />
      {output && <CopyDownload content={output} filename="style.scss" label="SCSS" />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. LESS TO CSS
   ═══════════════════════════════════════════════════════════════ */
export function LessToCss() {
  const [input, setInput] = useState('@primary: #333;\n@secondary: #666;\n@padding-base: 16px;\n\n.card {\n  color: @primary;\n  padding: @padding-base;\n  .inner {\n    background: @secondary;\n    margin: @padding-base / 2;\n  }\n}');
  const [output, setOutput] = useState('');

  const convert = useCallback(() => {
    let css = input;
    const variables: Record<string, string> = {};

    // Extract variables
    css.replace(/@(\w[\w-]*)\s*:\s*([^;]+);/g, (_, name, val) => {
      variables[`@${name}`] = val.trim();
      return '';
    });

    // Replace variable references
    css = css.replace(/@(\w[\w-]*)/g, (_, name) => variables[`@${name}`] || `@${name}`);

    // Resolve nesting
    const resolveNesting = (src: string, depth: number = 0): string => {
      let result = '';
      const lines = src.split('\n');
      let currentSelector = '';
      let currentBody = '';

      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.endsWith('{') && !trimmed.startsWith('}')) {
          if (currentSelector && currentBody) {
            result += `${currentSelector} {\n${currentBody}}\n`;
          }
          currentSelector = trimmed.replace('{', '').trim();
          currentBody = '';
        } else if (trimmed === '}') {
          if (currentSelector && currentBody) {
            result += `${currentSelector} {\n${currentBody}}\n`;
          }
          currentSelector = '';
          currentBody = '';
        } else if (trimmed) {
          currentBody += `  ${trimmed}\n`;
        }
      });

      if (currentSelector && currentBody) {
        result += `${currentSelector} {\n${currentBody}}\n`;
      }

      // Resolve Less math operations
      result = result.replace(/([^;]+)\s*\/\s*(\d+(?:\.\d+)?)(;)/g, (_, prefix, num, suffix) => {
        const valMatch = prefix.match(/([\d.]+)(px|rem|em|%|pt)?\s*$/);
        if (valMatch) {
          const [, val, unit] = valMatch;
          return `${prefix.replace(/[\d.]+(px|rem|em|%|pt)?$/, '')}${(parseFloat(val) / parseFloat(num)).toFixed(2).replace(/\.?0+$/, '')}${unit || ''}${suffix}`;
        }
        return `${prefix} / ${num}${suffix}`;
      });

      return result;
    };

    setOutput(resolveNesting(css));
    toast.success('Converted to CSS');
  }, [input]);

  const presetList = [
    { label: 'Variables', apply: () => { setInput('@primary: #333;\n@secondary: #666;\n@margin: 16px;\n\nbody {\n  color: @primary;\n  margin: @margin;\n}\n\nh1 {\n  color: @secondary;\n}'); } },
    { label: 'Mixins', apply: () => { setInput('.mixin(@color: #333) {\n  color: @color;\n  padding: 10px;\n}\n\n.card {\n  .mixin(#0066cc);\n}\n\n.alert {\n  .mixin(#cc0000);\n}'); } },
    { label: 'Nested rules', apply: () => { setInput('.nav {\n  color: #333;\n  .item {\n    padding: 8px;\n    .active {\n      font-weight: bold;\n    }\n  }\n}'); } },
  ];

  return (
    <div className="w-full bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-xl space-y-4">
      <PresetBar presets={presetList} />
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <span className="text-[10px] text-[var(--text-secondary)] font-semibold">LESS Input</span>
          <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="@var: value;"
            className="w-full h-40 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded px-2 py-1 text-[9px] font-mono text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none" />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-[var(--text-secondary)] font-semibold">CSS Output</span>
          <pre className="w-full h-40 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded px-2 py-1 text-[9px] font-mono text-emerald-600 dark:text-emerald-400 overflow-auto whitespace-pre-wrap">{output || '// Output will appear here'}</pre>
        </div>
      </div>
      <CalcBtn onClick={convert} label="Convert to CSS" />
      {output && <CopyDownload content={output} filename="style.css" />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. CSS SPECIFICITY CALCULATOR
   ═══════════════════════════════════════════════════════════════ */
export function CssSpecificityCalculator() {
  const [sel, setSel] = useState('#main .content p');
  const [sel2, setSel2] = useState('');
  const [compareMode, setCompareMode] = useState(false);

  const calcSpecificity = (selector: string) => {
    const ids = (selector.match(/#/g) || []).length;
    const classes = (selector.match(/\./g) || []).length;
    const attrs = (selector.match(/\[/g) || []).length;
    const pseudoClasses = (selector.match(/(?<!:):(?![:[])[\w-]+/g) || []).length;
    const pseudoElements = (selector.match(/::[\w-]+/g) || []).length;
    const tags = selector
      .replace(/#[^\s#.,>+~[:]+/g, '')
      .replace(/\.[^\s#.,>+~[:]+/g, '')
      .replace(/\[[^\]]+\]/g, '')
      .replace(/:[^\s(]+/g, '')
      .replace(/::[^\s(]+/g, '')
      .split(/[\s>+~]+/)
      .filter(t => t && !/^[#.\[:]/.test(t)).length;
    const specificity = ids * 100 + (classes + attrs + pseudoClasses) * 10 + (tags + pseudoElements);
    return { ids, classes: classes + attrs + pseudoClasses, tags: tags + pseudoElements, specificity };
  };

  const spec1 = calcSpecificity(sel);
  const spec2 = compareMode ? calcSpecificity(sel2) : null;
  const result1 = `(${spec1.ids}, ${spec1.classes}, ${spec1.tags}) = ${spec1.specificity}`;
  const result2 = spec2 ? `(${spec2.ids}, ${spec2.classes}, ${spec2.tags}) = ${spec2.specificity}` : '';

  const presetList = [
    { label: '#id .class', apply: () => { setSel('#header .nav'); } },
    { label: '.class .class', apply: () => { setSel('.container .wrapper'); } },
    { label: '#id #id', apply: () => { setSel('#main #content'); } },
    { label: 'Element + !important', apply: () => { setSel('div p span'); } },
  ];

  const specToBar = (s: number) => Math.min(s / 300 * 100, 100);

  const winnerText = compareMode && spec2
    ? spec1.specificity > spec2.specificity ? '← wins' : spec1.specificity < spec2.specificity ? '→ wins' : '= tie'
    : '';

  const output = compareMode ? `${sel} ${result1} ${winnerText}\n${sel2} ${result2}` : result1;

  return (
    <div className="w-full bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-xl space-y-4">
      <PresetBar presets={presetList} />

      <div className="space-y-2">
        <input type="text" value={sel} onChange={e => setSel(e.target.value)} placeholder="Enter CSS selector..."
          className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-2 py-1.5 text-[11px] font-mono text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]" />

        {/* Specificity bar */}
        <div className="w-full bg-[var(--bg-overlay)] rounded-lg h-4 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-300 flex items-center justify-end pr-1"
            style={{ width: `${specToBar(spec1.specificity)}%` }}>
            <span className="text-[8px] font-bold text-white">{spec1.specificity}</span>
          </div>
        </div>
      </div>

      <label className="flex items-center gap-1.5 cursor-pointer">
        <input type="checkbox" checked={compareMode} onChange={e => setCompareMode(e.target.checked)} className="w-3 h-3 rounded" />
        <span className="text-[10px] text-[var(--text-secondary)]">Compare mode</span>
      </label>

      {compareMode && (
        <div className="space-y-2">
          <input type="text" value={sel2} onChange={e => setSel2(e.target.value)} placeholder="Second selector..."
            className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-2 py-1.5 text-[11px] font-mono text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]" />
          {spec2 && (
            <div className="w-full bg-[var(--bg-overlay)] rounded-lg h-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300 flex items-center justify-end pr-1"
                style={{ width: `${specToBar(spec2.specificity)}%` }}>
                <span className="text-[8px] font-bold text-white">{spec2.specificity}</span>
              </div>
            </div>
          )}
          {winnerText && <p className="text-[11px] font-bold text-center">{winnerText}</p>}
        </div>
      )}

      <Result value={output} />
      <CopyDownload content={output} filename="specificity.txt" label="Result" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. CSS VALIDATOR
   ═══════════════════════════════════════════════════════════════ */
export function CssValidator() {
  const [input, setInput] = useState('.card {\n  color: #333\n  padding: 16px;\n}\n\n.bad {\n  background: red\n}\n\n.btn {\n  -webkit-border-radius: 5px;\n  border-radius: 5px\n}');
  const [issues, setIssues] = useState<{ line: number; severity: 'error' | 'warning' | 'info'; message: string; suggestion: string }[]>([]);

  const validate = useCallback(() => {
    const lines = input.split('\n');
    const found: { line: number; severity: 'error' | 'warning' | 'info'; message: string; suggestion: string }[] = [];

    let braceDepth = 0;

    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) return;

      // Missing semicolon
      if (trimmed.match(/:\s*[^{]+$/) && !trimmed.endsWith('{') && !trimmed.endsWith(';') && !trimmed.startsWith('}') && !trimmed.includes('/*')) {
        found.push({ line: i + 1, severity: 'error', message: 'Missing semicolon', suggestion: `Add ';' at end: ${trimmed};` });
      }

      // Missing value
      if (trimmed.match(/^\w[\w-]*:\s*;/)) {
        found.push({ line: i + 1, severity: 'warning', message: 'Empty property value', suggestion: 'Add a value before the semicolon' });
      }

      // Unknown property (common typos)
      const prop = trimmed.match(/^([\w-]+)\s*:/);
      if (prop) {
        const known = ['color', 'background', 'margin', 'padding', 'border', 'display', 'position', 'width', 'height', 'font-size', 'font-weight', 'text-align', 'line-height', 'border-radius', 'box-shadow', 'opacity', 'transform', 'transition', 'animation', 'flex', 'grid', 'overflow', 'z-index', 'cursor', 'float', 'clear', 'top', 'left', 'right', 'bottom', 'max-width', 'min-width', 'max-height', 'min-height', 'gap', 'justify-content', 'align-items', 'flex-direction', 'flex-wrap', 'order', 'flex-grow', 'flex-shrink', 'flex-basis', 'align-self', 'justify-self', 'place-self', 'grid-template-columns', 'grid-template-rows', 'grid-column', 'grid-row', 'grid-area', 'grid-gap', 'grid-auto-flow', 'grid-auto-columns', 'grid-auto-rows', 'column-gap', 'row-gap', 'justify-items', 'justify-content', 'align-content', 'place-content', 'place-items', 'place-content', 'inset', 'object-fit', 'object-position', 'aspect-ratio', 'contain', 'resize', 'user-select', 'pointer-events', 'visibility', 'clip-path', 'mask', 'filter', 'backdrop-filter', 'mix-blend-mode', 'isolation', 'perspective', 'transform-origin', 'transform-style', 'backface-visibility', 'will-change', 'container-type', 'container-name', 'container'];
        if (!known.includes(prop[1]) && !prop[1].startsWith('--')) {
          found.push({ line: i + 1, severity: 'warning', message: `Possible unknown property: "${prop[1]}"`, suggestion: 'Check spelling or add vendor prefix' });
        }
      }

      // Browser prefixes
      if (trimmed.match(/^-webkit-|-moz-|-ms-|-o-/)) {
        const unprefixed = trimmed.replace(/^-(?:webkit|moz|ms|o)-/, '').match(/^([\w-]+)\s*:/);
        if (unprefixed) {
          found.push({ line: i + 1, severity: 'info', message: `Vendor prefix: -${unprefixed[1]}`, suggestion: 'Check if vendor prefix is still needed' });
        }
      }

      // Unclosed braces
      if (trimmed.includes('{')) braceDepth++;
      if (trimmed.includes('}')) braceDepth--;

      if (braceDepth < 0) {
        found.push({ line: i + 1, severity: 'error', message: 'Extra closing brace', suggestion: 'Remove extra } or add missing {' });
      }
    });

    if (braceDepth > 0) {
      found.push({ line: lines.length, severity: 'error', message: `Unclosed braces: ${braceDepth} open`, suggestion: 'Add missing } to close all blocks' });
    }

    setIssues(found);
  }, [input]);

  const severityIcon = { error: '❌', warning: '⚠️', info: 'ℹ️' };
  const severityColor = { error: 'text-red-500', warning: 'text-yellow-500', info: 'text-blue-500' };

  const reportText = issues.length > 0
    ? issues.map(i => `${severityIcon[i.severity]} Line ${i.line}: [${i.severity.toUpperCase()}] ${i.message}\n  Fix: ${i.suggestion}`).join('\n\n')
    : '✓ Valid CSS — No issues found';

  const presetList = [
    { label: 'Valid CSS', apply: () => { setInput('.card {\n  color: #333;\n  padding: 16px;\n  background: white;\n}\n\n.btn {\n  border-radius: 5px;\n  display: inline-block;\n}'); } },
    { label: 'Invalid CSS', apply: () => { setInput('.card {\n  color: #333\n  padding: 16px\n}\n\n.bad {\n  background:\n}'); } },
    { label: 'Browser prefixes', apply: () => { setInput('.card {\n  -webkit-border-radius: 5px;\n  -moz-user-select: none;\n  border-radius: 5px;\n  user-select: none;\n}'); } },
  ];

  return (
    <div className="w-full bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-xl space-y-4">
      <PresetBar presets={presetList} />
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Paste CSS to validate..."
        className="w-full h-32 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded px-2 py-1 text-[9px] font-mono text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none" />
      <CalcBtn onClick={validate} label="Validate CSS" />

      {issues.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {issues.map((issue, idx) => (
            <div key={idx} className={`text-[10px] font-mono ${severityColor[issue.severity]} bg-[var(--bg-overlay)] rounded-lg px-2 py-1.5`}>
              <span className="font-bold">{severityIcon[issue.severity]} Line {issue.line}:</span> {issue.message}
              <p className="text-[9px] text-[var(--text-muted)] mt-0.5 italic">💡 {issue.suggestion}</p>
            </div>
          ))}
        </div>
      )}
      {issues.length === 0 && input.trim() && (
        <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-[var(--bg-overlay)] rounded-lg px-2 py-1">✓ Valid CSS — No issues found</p>
      )}

      <div className="text-[9px] text-[var(--text-muted)]">
        {issues.length > 0 ? `${issues.filter(i => i.severity === 'error').length} errors · ${issues.filter(i => i.severity === 'warning').length} warnings · ${issues.filter(i => i.severity === 'info').length} info` : ''}
      </div>
      {reportText && <CopyDownload content={reportText} filename="css-report.txt" label="Report" />}
    </div>
  );
}

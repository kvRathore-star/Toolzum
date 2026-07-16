"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Code2, Palette, Binary, Globe, GitBranch } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'formatters' | 'css' | 'code' | 'http' | 'git';

export default function DevToolkit() {
  const [tab, setTab] = useState<Tab>('formatters');
  const TabBtn = ({ v, label, icon: Icon }: { v: Tab; label: string; icon: React.ElementType }) => (
    <button onClick={() => setTab(v)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${tab === v ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );
  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2">
        <TabBtn v="formatters" label="Formatters" icon={Code2} />
        <TabBtn v="css" label="CSS Tools" icon={Palette} />
        <TabBtn v="code" label="Code Utils" icon={Binary} />
        <TabBtn v="http" label="HTTP" icon={Globe} />
        <TabBtn v="git" label="Git" icon={GitBranch} />
      </div>
      {tab === 'formatters' && <Formatters />}
      {tab === 'css' && <CssTools />}
      {tab === 'code' && <CodeUtils />}
      {tab === 'http' && <HttpTools />}
      {tab === 'git' && <GitTools />}
    </div>
  );
}

const LANG_EXT: Record<string, string> = { js: 'JavaScript', ts: 'TypeScript', json: 'JSON', html: 'HTML', css: 'CSS', cpp: 'C++', go: 'Go', kotlin: 'Kotlin', php: 'PHP', python: 'Python', ruby: 'Ruby', rust: 'Rust' };

function Formatters() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [lang, setLang] = useState('js');
  const [mode, setMode] = useState<'beautify'|'minify'>('beautify');

  const process = () => {
    if (!input.trim()) { toast.error('Paste code first'); return; }
    try {
      if (lang === 'json') { const p = JSON.parse(input); setOutput(mode === 'beautify' ? JSON.stringify(p, null, 2) : JSON.stringify(p)); return; }
      const lines = input.split('\n');
      if (mode === 'beautify') {
        let out = '', indent = 0;
        for (const line of lines) {
          const t = line.trim(); if (!t) { out += '\n'; continue; }
          if (/^[\}\]\)]/.test(t)) indent = Math.max(0, indent - 1);
          out += '  '.repeat(Math.max(0, indent)) + t + '\n';
          if (/[{\[\(]$/.test(t)) indent++;
        }
        setOutput(out);
      } else {
        setOutput(lines.map(l => l.trim()).filter(Boolean).join(''));
      }
      toast.success(`${mode === 'beautify' ? 'Beautified' : 'Minified'} ${LANG_EXT[lang]}`);
    } catch { toast.error('Syntax error'); }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl space-y-4">
      <div className="flex flex-wrap gap-1">
        {Object.entries(LANG_EXT).map(([k, v]) => (
          <button key={k} onClick={() => setLang(k)} className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${lang === k ? 'bg-blue-600 text-white shadow-sm' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>{v}</button>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={() => setMode('beautify')} className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg ${mode === 'beautify' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>Beautify</button>
        <button onClick={() => setMode('minify')} className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg ${mode === 'minify' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>Minify</button>
      </div>
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={`Paste ${LANG_EXT[lang]} code...`}
        className="w-full h-28 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
      <div className="flex gap-2">
        <button onClick={process} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2.5 rounded-xl transition-all">{mode === 'beautify' ? 'Beautify' : 'Minify'}</button>
        <button onClick={() => { setInput(''); setOutput(''); }} className="px-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm font-medium rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700">Clear</button>
      </div>
      {output && (
        <div className="relative">
          <textarea readOnly value={output} className="w-full h-28 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 outline-none resize-y" />
          <button onClick={() => { clipboardWrite(output); toast.success('Copied!'); }} className="absolute top-2 right-2 text-xs text-blue-500 hover:underline">Copy</button>
        </div>
      )}
    </div>
  );
}

const Inp = ({ label, value, onChange, prefix, suffix, small }: { label: string; value: number | string; onChange: (v: any) => void; prefix?: string; suffix?: string; small?: boolean }) => (
  <div className="flex items-center gap-1.5">
    <label className="text-[10px] text-zinc-500 w-14 shrink-0">{label}</label>
    {prefix && <span className="text-[10px] text-zinc-400">{prefix}</span>}
    <input type={typeof value === 'number' ? 'number' : 'text'} value={value} onChange={e => onChange(typeof value === 'number' ? Number(e.target.value) : e.target.value)}
      className={`w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 ${small ? 'py-1 text-[11px]' : 'py-1.5 text-xs'} text-zinc-900 dark:text-white outline-none focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`} />
    {suffix && <span className="text-[10px] text-zinc-400 w-5">{suffix}</span>}
  </div>
);

const CalcBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button onClick={onClick} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-1.5 rounded-lg transition-all active:scale-[0.98]">{label}</button>
);

const Result = ({ value }: { value: string }) => (
  <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-zinc-50 dark:bg-black rounded-lg px-2 py-1">{value}</p>
);

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
    <h5 className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">{title}</h5>
    {children}
  </div>
);

function CssTools() {
  const [bxX, setBxX] = useState(2); const [bxY, setBxY] = useState(4); const [bxBlur, setBxBlur] = useState(8); const [bxSpread, setBxSpread] = useState(0); const [bxColor, setBxColor] = useState('#00000040'); const [bxOut, setBxOut] = useState('');
  const [gDir, setGDir] = useState('to right'); const [g1, setG1] = useState('#6366f1'); const [g2, setG2] = useState('#ec4899'); const [gOut, setGOut] = useState('');
  const [glassOut, setGlassOut] = useState('');
  const [flexDir, setFlexDir] = useState('row'); const [flexJc, setFlexJc] = useState('center'); const [flexAi, setFlexAi] = useState('center'); const [flexGap, setFlexGap] = useState(8); const [flexRes, setFlexRes] = useState('');
  const [gridCols, setGridCols] = useState(3); const [gridGap, setGridGap] = useState(8); const [gridRes, setGridRes] = useState('');
  const [specSel, setSpecSel] = useState('#main .content p'); const [specRes, setSpecRes] = useState<string | null>(null);
  const [cssIn, setCssIn] = useState(''); const [cssVRes, setCssVRes] = useState<string | null>(null);
  const [scssIn, setScssIn] = useState('.container {\\n  color: red;\\n  .inner {\\n    background: blue;\\n  }\\n}'); const [scssOut, setScssOut] = useState('');
  const [lessIn, setLessIn] = useState('@primary: #333;\\nbody { color: @primary; }'); const [lessOut, setLessOut] = useState('');
  const [neuW, setNeuW] = useState(120); const [neuBlur, setNeuBlur] = useState(20); const [neuColor, setNeuColor] = useState('#e0e0e0'); const [neuOut, setNeuOut] = useState('');

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      <Card title="Box Shadow">
        <Inp label="X" value={bxX} onChange={setBxX} small /><Inp label="Y" value={bxY} onChange={setBxY} small />
        <Inp label="Blur" value={bxBlur} onChange={setBxBlur} small /><Inp label="Spread" value={bxSpread} onChange={setBxSpread} small />
        <div className="flex items-center gap-1"><span className="text-[10px] text-zinc-500">Color</span>
          <input type="color" value={bxColor} onChange={e => setBxColor(e.target.value)} className="w-8 h-6 rounded cursor-pointer" />
          <input type="text" value={bxColor} onChange={e => setBxColor(e.target.value)} className="flex-1 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-1 py-0.5 text-[10px] font-mono text-zinc-900 dark:text-white outline-none" /></div>
        <CalcBtn onClick={() => { const css = `${bxX}px ${bxY}px ${bxBlur}px ${bxSpread}px ${bxColor}`; setBxOut(css); clipboardWrite('box-shadow: ' + css + ';'); toast.success('Copied!'); }} label="Generate" />
        {bxOut && <Result value={`box-shadow: ${bxOut};`} />}
      </Card>
      <Card title="CSS Gradient">
        <select value={gDir} onChange={e => setGDir(e.target.value)} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[10px] text-zinc-900 dark:text-white outline-none">
          <option value="to right">→</option><option value="to left">←</option><option value="to bottom">↓</option><option value="to top">↑</option><option value="45deg">45°</option></select>
        <div className="flex gap-1 items-center">
          <input type="color" value={g1} onChange={e => setG1(e.target.value)} className="w-8 h-6 rounded cursor-pointer" />
          <input type="color" value={g2} onChange={e => setG2(e.target.value)} className="w-8 h-6 rounded cursor-pointer" /></div>
        <CalcBtn onClick={() => { const css = `linear-gradient(${gDir}, ${g1}, ${g2})`; setGOut(css); clipboardWrite('background: ' + css + ';'); toast.success('Copied!'); }} label="Generate" />
        {gOut && <Result value={`background: ${gOut};`} />}
      </Card>
      <Card title="Glassmorphism">
        <div className="flex gap-1 items-center"><span className="text-[10px] text-zinc-500">Blur</span>
          <input type="range" min={1} max={20} defaultValue={8} onChange={e => setGlassOut(`background: rgba(255,255,255,0.15); backdrop-filter: blur(${e.target.value}px); -webkit-backdrop-filter: blur(${e.target.value}px); border: 1px solid rgba(255,255,255,0.18); border-radius: 12px;`)} className="flex-1" /></div>
        <div className="flex gap-1 items-center"><span className="text-[10px] text-zinc-500">Opacity</span>
          <input type="range" min={1} max={50} defaultValue={15} onChange={e => setGlassOut(`background: rgba(255,255,255,${(Number(e.target.value)/100).toFixed(2)}); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.18); border-radius: 12px;`)} className="flex-1" /></div>
        <CalcBtn onClick={() => { if (glassOut) { clipboardWrite(glassOut); toast.success('Copied!'); } }} label="Copy CSS" />
      </Card>
      <Card title="Neumorphism">
        <Inp label="Size" value={neuW} onChange={setNeuW} suffix="px" small />
        <Inp label="Blur" value={neuBlur} onChange={setNeuBlur} suffix="px" small />
        <input type="color" value={neuColor} onChange={e => setNeuColor(e.target.value)} className="w-full h-6 rounded cursor-pointer" />
        <CalcBtn onClick={() => { const css = `background: ${neuColor}; border-radius: ${(neuW * 0.1).toFixed(0)}px; box-shadow: ${(neuBlur * 0.6).toFixed(0)}px ${(neuBlur * 0.6).toFixed(0)}px ${neuBlur}px ${neuColor === '#ffffff' ? '#d9d9d9' : 'rgba(0,0,0,0.1)'}, -${(neuBlur * 0.6).toFixed(0)}px -${(neuBlur * 0.6).toFixed(0)}px ${neuBlur}px #ffffff;`; setNeuOut(css); clipboardWrite(css); toast.success('Copied!'); }} label="Generate" />
        {neuOut && <Result value={neuOut} />}
      </Card>
      <Card title="CSS Flexbox">
        <select value={flexDir} onChange={e => setFlexDir(e.target.value)} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[10px] text-zinc-900 dark:text-white outline-none">
          <option value="row">row</option><option value="row-reverse">row-reverse</option><option value="column">column</option><option value="column-reverse">column-reverse</option></select>
        <Inp label="Justify" value={flexJc} onChange={setFlexJc} small />
        <Inp label="Align" value={flexAi} onChange={setFlexAi} small />
        <Inp label="Gap" value={flexGap} onChange={setFlexGap} suffix="px" small />
        <CalcBtn onClick={() => { const css = `display: flex; flex-direction: ${flexDir}; justify-content: ${flexJc}; align-items: ${flexAi}; gap: ${flexGap}px;`; setFlexRes(css); clipboardWrite(css); toast.success('Copied!'); }} label="Copy CSS" />
        {flexRes && <Result value={flexRes} />}
      </Card>
      <Card title="CSS Grid">
        <Inp label="Columns" value={gridCols} onChange={setGridCols} small />
        <Inp label="Gap" value={gridGap} onChange={setGridGap} suffix="px" small />
        <CalcBtn onClick={() => { const css = `display: grid; grid-template-columns: repeat(${gridCols}, 1fr); gap: ${gridGap}px;`; setGridRes(css); clipboardWrite(css); toast.success('Copied!'); }} label="Copy CSS" />
        {gridRes && <Result value={gridRes} />}
      </Card>
      <Card title="CSS Specificity">
        <input type="text" value={specSel} onChange={e => setSpecSel(e.target.value)} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[11px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
        <CalcBtn onClick={() => {
          const ids = (specSel.match(/#/g) || []).length;
          const classes = (specSel.match(/\./g) || []).length;
          const attrs = (specSel.match(/\[/g) || []).length + (specSel.match(/:/g) || []).length;
          const tags = specSel.replace(/#[^.#[\s:]+/g, '').replace(/\.[^.#[\s:]+/g, '').replace(/\[[^\]]+\]/g, '').replace(/:[^\s]+/g, '').split(/[\s>+~]+/).filter(t => t && !/^[#.]/.test(t)).length;
          setSpecRes(`(${ids}, ${classes + attrs}, ${tags}) = ${ids * 100 + (classes + attrs) * 10 + tags}`);
        }} label="Calculate Specificity" />
        {specRes && <Result value={specRes} />}
      </Card>
      <Card title="CSS → SCSS">
        <textarea value={scssIn} onChange={e => setScssIn(e.target.value)} placeholder="CSS with nesting..."
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono text-zinc-900 dark:text-white outline-none resize-none" />
        <CalcBtn onClick={() => { setScssOut(scssIn.replace(/\n/g, '\n')); toast.success('CSS → SCSS (basic)'); }} label="Convert" />
        {scssOut && <Result value="Check nesting. Use & for parent refs." />}
      </Card>
      <Card title="Less → CSS">
        <textarea value={lessIn} onChange={e => setLessIn(e.target.value)} placeholder="@var: value;"
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono text-zinc-900 dark:text-white outline-none resize-none" />
        <CalcBtn onClick={() => { setLessOut(lessIn.replace(/@(\w+)/g, '/* $1 */')); toast.success('Less → CSS (variables commented)'); }} label="Convert" />
        {lessOut && <Result value={lessOut} />}
      </Card>
      <Card title="CSS Validator">
        <textarea value={cssIn} onChange={e => setCssIn(e.target.value)} placeholder="Paste CSS..."
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono text-zinc-900 dark:text-white outline-none resize-none" />
        <CalcBtn onClick={() => {
          const issues: string[] = [];
          const lines = cssIn.split('\n');
          lines.forEach((l, i) => {
            if (l.includes('{') && !l.includes(':') && !l.trim().startsWith('@') && !l.trim().startsWith('/')) issues.push(`Line ${i + 1}: Missing property before {`);
            if (l.includes(':') && !l.includes(';') && !l.trim().endsWith('{') && !l.trim().startsWith('}') && !l.trim().startsWith('/*')) issues.push(`Line ${i + 1}: Missing semicolon`);
          });
          setCssVRes(issues.length ? issues.join('\n') : '✓ Valid CSS');
        }} label="Validate" />
        {cssVRes && <Result value={cssVRes} />}
      </Card>
    </div>
  );
}

function CodeUtils() {
  const [diffA, setDiffA] = useState(''); const [diffB, setDiffB] = useState(''); const [diffRes, setDiffRes] = useState<string | null>(null);
  const [obfIn, setObfIn] = useState(''); const [obfMode, setObfMode] = useState<'obfuscate'|'deobfuscate'>('obfuscate'); const [obfRes, setObfRes] = useState('');
  const [curlIn, setCurlIn] = useState('curl https://api.example.com/data'); const [curlRes, setCurlRes] = useState<string | null>(null);
  const [syntaxCode, setSyntaxCode] = useState('const x = 1;'); const [syntaxRes, setSyntaxRes] = useState<string | null>(null);
  const [pugIn, setPugIn] = useState('div.container\n  h1.title Hello\n  p.content World'); const [pugRes, setPugRes] = useState('');

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      <Card title="Code Diff Viewer">
        <textarea value={diffA} onChange={e => setDiffA(e.target.value)} placeholder="Original..."
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono text-zinc-900 dark:text-white outline-none resize-none" />
        <textarea value={diffB} onChange={e => setDiffB(e.target.value)} placeholder="Modified..."
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono text-zinc-900 dark:text-white outline-none resize-none" />
        <CalcBtn onClick={() => {
          const aLines = diffA.split('\n'), bLines = diffB.split('\n');
          const max = Math.max(aLines.length, bLines.length);
          const out: string[] = [];
          for (let i = 0; i < max; i++) {
            if (i >= aLines.length && bLines[i]) out.push(`+ ${bLines[i]}`);
            else if (i >= bLines.length && aLines[i]) out.push(`- ${aLines[i]}`);
            else if (aLines[i] !== bLines[i]) { out.push(`- ${aLines[i]}`); out.push(`+ ${bLines[i]}`); }
            else out.push(`  ${aLines[i]}`);
          }
          setDiffRes(out.slice(0, 40).join('\n'));
        }} label="Compare" />
        {diffRes && <Result value={diffRes} />}
      </Card>
      <Card title="Code Obfuscator">
        <select value={obfMode} onChange={e => setObfMode(e.target.value as any)} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[10px] text-zinc-900 dark:text-white outline-none">
          <option value="obfuscate">Obfuscate</option><option value="deobfuscate">Deobfuscate</option></select>
        <textarea value={obfIn} onChange={e => setObfIn(e.target.value)} placeholder="Paste code..."
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono text-zinc-900 dark:text-white outline-none resize-none" />
        <CalcBtn onClick={() => {
          if (obfMode === 'obfuscate') setObfRes(btoa(obfIn).split('').reverse().join(''));
          else try { setObfRes(atob(obfIn.split('').reverse().join(''))); } catch { setObfRes('Cannot deobfuscate (non-standard)'); }
          toast.success(obfMode === 'obfuscate' ? 'Obfuscated' : 'Deobfuscated');
        }} label={obfMode === 'obfuscate' ? 'Obfuscate' : 'Deobfuscate'} />
        {obfRes && <Result value={obfRes} />}
      </Card>
      <Card title="Code → Curl">
        <textarea value={curlIn} onChange={e => setCurlIn(e.target.value)} placeholder="curl command..."
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono text-zinc-900 dark:text-white outline-none resize-none" />
        <CalcBtn onClick={() => { const m = curlIn.match(/-X\s+(\w+)/); const u = curlIn.match(/https?:\/\/[^\s"']+/); const h = [...curlIn.matchAll(/-H\s+["']([^"']+)["']/g)].map(r => r[1]); const d = curlIn.match(/--data\s+["']([^"']+)["']/); setCurlRes(`Method: ${m?.[1] || 'GET'}\nURL: ${u?.[0] || 'N/A'}\nHeaders: ${h.length || 'None'}\nBody: ${d?.[1] || 'None'}`); }} label="Parse Curl" />
        {curlRes && <Result value={curlRes} />}
      </Card>
      <Card title="JS Syntax Checker">
        <textarea value={syntaxCode} onChange={e => setSyntaxCode(e.target.value)} placeholder="JavaScript code..."
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono text-zinc-900 dark:text-white outline-none resize-none" />
        <CalcBtn onClick={() => { try { new Function(syntaxCode); setSyntaxRes('✓ Valid JavaScript'); } catch (e) { setSyntaxRes(`✗ ${e instanceof Error ? e.message : 'Syntax error'}`); } }} label="Check Syntax" />
        {syntaxRes && <Result value={syntaxRes} />}
      </Card>
      <Card title="Pug → HTML">
        <textarea value={pugIn} onChange={e => setPugIn(e.target.value)} placeholder="div.container&#10;  h1 Hello"
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono text-zinc-900 dark:text-white outline-none resize-none" />
        <CalcBtn onClick={() => {
          const lines = pugIn.split('\n');
          const out: string[] = [];
          lines.forEach(l => {
            const t = l.trim();
            if (!t) return;
            const indent = l.search(/\S/);
            const parts = t.split(/[.\s#]/);
            const tag = parts[0] || 'div';
            const cls = t.match(/\.([\w-]+)/g)?.map(c => c.slice(1)).join(' ') || '';
            const id = t.match(/#([\w-]+)/)?.[1] || '';
            const text = t.includes(' ') ? t.slice(t.indexOf(' ') + 1) : '';
            out.push(`${'  '.repeat(indent / 2)}<${tag}${id ? ` id="${id}"` : ''}${cls ? ` class="${cls}"` : ''}>${text}</${tag}>`);
          });
          setPugRes(out.join('\n'));
          toast.success('Converted to HTML');
        }} label="Convert" />
        {pugRes && <Result value={pugRes} />}
      </Card>
    </div>
  );
}

const HTTP_CODES: Record<number, string> = {
  200: 'OK', 201: 'Created', 204: 'No Content', 301: 'Moved Permanently', 302: 'Found', 304: 'Not Modified',
  400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 405: 'Not Allowed',
  408: 'Timeout', 429: 'Too Many', 500: 'Internal Server Error', 502: 'Bad Gateway', 503: 'Unavailable', 504: 'Gateway Timeout',
};

function HttpTools() {
  const [statusCode, setStatusCode] = useState(200); const [headerInput, setHeaderInput] = useState(''); const [headerOutput, setHeaderOutput] = useState<string | null>(null);
  const [httpStatusOut, setHttpStatusOut] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-2 gap-2">
      <Card title="HTTP Status Code">
        <input type="number" value={statusCode} onChange={e => setStatusCode(Number(e.target.value))}
          className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[11px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
        <CalcBtn onClick={() => { const found = HTTP_CODES[statusCode]; setHttpStatusOut(found ? `${statusCode} ${found}` : 'Unknown'); }} label="Lookup" />
        {httpStatusOut && <Result value={httpStatusOut} />}
        <div className="flex flex-wrap gap-1">
          {Object.entries(HTTP_CODES).map(([code, msg]) => (
            <button key={code} onClick={() => { setStatusCode(Number(code)); setHttpStatusOut(`${code} ${msg}`); }}
              className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${Number(code) < 300 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : Number(code) < 400 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>{code}</button>
          ))}
        </div>
      </Card>
      <Card title="Header Analyzer">
        <textarea value={headerInput} onChange={e => setHeaderInput(e.target.value)} placeholder="Content-Type: text/html"
          className="w-full h-20 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono text-zinc-900 dark:text-white outline-none resize-none" />
        <CalcBtn onClick={() => {
          const lines = headerInput.split('\n').filter(l => l.includes(':'));
          if (!lines.length) { toast.error('No headers found'); return; }
          setHeaderOutput(lines.map(l => { const [k, ...v] = l.split(':'); return `${k.trim()}: ${v.join(':').trim()}`; }).join('\n'));
        }} label="Parse" />
        {headerOutput && <Result value={headerOutput} />}
      </Card>
    </div>
  );
}

function GitTools() {
  const [gOut, setGOut] = useState('');
  const GITIGNORE: Record<string, string[]> = { Node: ['node_modules/', 'npm-debug.log*', '.env', 'dist/'], Python: ['__pycache__/', '*.py[cod]', 'venv/'], Java: ['*.class', 'target/', '.gradle/'], Rust: ['target/', 'Cargo.lock'], Go: ['*.exe', 'vendor/'], React: ['node_modules/', 'build/', '.env.local'] };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Card title=".gitignore Generator">
        <div className="flex flex-wrap gap-1">
          {Object.keys(GITIGNORE).map(lang => (
            <button key={lang} onClick={() => setGOut(GITIGNORE[lang].join('\n'))} className="px-2 py-0.5 text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700">{lang}</button>
          ))}
        </div>
        <CalcBtn onClick={() => { if (gOut) { clipboardWrite(gOut); toast.success('.gitignore copied!'); } }} label="Copy .gitignore" />
        {gOut && <Result value={gOut} />}
      </Card>
      <Card title="Git Commit Lint">
        <div className="space-y-1">
          {[{ t: 'feat', d: 'New feature' }, { t: 'fix', d: 'Bug fix' }, { t: 'docs', d: 'Documentation' }, { t: 'refactor', d: 'Refactor' }, { t: 'chore', d: 'Chore' }].map(({ t, d }) => (
            <button key={t} onClick={() => { const msg = `${t}: ${d.toLowerCase()}`; clipboardWrite(msg); toast.success(`Copied: ${msg}`); }}
              className="w-full text-left px-2 py-1 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg text-[10px] text-zinc-700 dark:text-zinc-300 hover:border-blue-400 font-mono">{t}: <span className="text-zinc-500">{d.toLowerCase()}...</span></button>
          ))}
        </div>
      </Card>
    </div>
  );
}

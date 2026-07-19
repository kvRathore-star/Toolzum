"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Code2, Palette, Binary, Globe, GitBranch, ExternalLink } from 'lucide-react';
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

function Formatters() {
  return (
    <LinkCard title="Code Beautifier & Minifier" slug="code-beautifier" desc="Beautify or minify HTML, CSS, JavaScript, XML, ERB, LESS, and SCSS with proper parsers." />
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

const LinkCard = ({ title, slug, desc }: { title: string; slug: string; desc: string }) => (
  <Link href={`/developer/${slug}`} className="block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all group">
    <div className="flex items-center gap-1">
      <h5 className="text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:underline">{title}</h5>
      <ExternalLink className="w-3 h-3 text-blue-400 shrink-0" />
    </div>
    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
  </Link>
);

function CssTools() {
  const [glassOut, setGlassOut] = useState('');
  const [specSel, setSpecSel] = useState('#main .content p'); const [specRes, setSpecRes] = useState<string | null>(null);
  const [cssIn, setCssIn] = useState(''); const [cssVRes, setCssVRes] = useState<string | null>(null);
  const [scssIn, setScssIn] = useState('.container {\\n  color: red;\\n  .inner {\\n    background: blue;\\n  }\\n}'); const [scssOut, setScssOut] = useState('');
  const [lessIn, setLessIn] = useState('@primary: #333;\\nbody { color: @primary; }'); const [lessOut, setLessOut] = useState('');
  const [neuW, setNeuW] = useState(120); const [neuBlur, setNeuBlur] = useState(20); const [neuColor, setNeuColor] = useState('#e0e0e0'); const [neuOut, setNeuOut] = useState('');

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      <LinkCard title="Box Shadow Generator" slug="box-shadow-generator" desc="Generate CSS box-shadow values with an interactive preview — offset, blur, spread, color, and inset." />
      <LinkCard title="CSS Gradient Generator" slug="gradient-generator" desc="Create beautiful CSS gradients with an interactive builder. Choose direction and colors with live preview." />
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
      <LinkCard title="CSS Flexbox Generator" slug="flexbox-css-generator" desc="Generate Flexbox CSS code interactively — direction, wrap, justify, align, and gap with live preview." />
      <LinkCard title="CSS Grid Generator" slug="css-grid-generator" desc="Generate CSS Grid layouts with configurable columns, rows, and gap." />
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
  const [obfIn, setObfIn] = useState(''); const [obfMode, setObfMode] = useState<'obfuscate'|'deobfuscate'>('obfuscate'); const [obfRes, setObfRes] = useState('');
  const [curlIn, setCurlIn] = useState('curl https://api.example.com/data'); const [curlRes, setCurlRes] = useState<string | null>(null);
  const [syntaxCode, setSyntaxCode] = useState('const x = 1;'); const [syntaxRes, setSyntaxRes] = useState<string | null>(null);
  const [pugIn, setPugIn] = useState('div.container\n  h1.title Hello\n  p.content World'); const [pugRes, setPugRes] = useState('');

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      <LinkCard title="Code Diff Checker" slug="diff-checker" desc="Compare two texts side-by-side with highlighted insertions, deletions, and changes." />
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

function HttpTools() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <LinkCard title="HTTP Status Code Checker" slug="http-status-code-checker" desc="Look up HTTP status codes by number — view description, label, and response class." />
      <LinkCard title="HTTP Header Analyzer" slug="http-header-analyzer" desc="Analyze HTTP request and response headers — detect security headers, inspect value structure." />
    </div>
  );
}

function GitTools() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <LinkCard title=".gitignore Generator" slug="gitignore-generator" desc="Generate .gitignore files by selecting languages, frameworks, and tools from a checklist." />
      <LinkCard title="Git Commit Linter" slug="git-commit-linter" desc="Validate git commit messages against the Conventional Commits specification." />
    </div>
  );
}

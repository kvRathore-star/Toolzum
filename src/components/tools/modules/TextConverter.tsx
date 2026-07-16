"use client";
import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Type, Binary, Hash, Sigma, EyeOff } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'nato' | 'binary' | 'unicode' | 'roman' | 'obfuscate';

const NATO: Record<string, string> = {
  'A':'Alpha','B':'Bravo','C':'Charlie','D':'Delta','E':'Echo','F':'Foxtrot','G':'Golf','H':'Hotel','I':'India',
  'J':'Juliett','K':'Kilo','L':'Lima','M':'Mike','N':'November','O':'Oscar','P':'Papa','Q':'Quebec','R':'Romeo',
  'S':'Sierra','T':'Tango','U':'Uniform','V':'Victor','W':'Whiskey','X':'X-ray','Y':'Yankee','Z':'Zulu',
  '0':'Zero','1':'One','2':'Two','3':'Three','4':'Four','5':'Five','6':'Six','7':'Seven','8':'Eight','9':'Nine',
};
const NATO_REV: Record<string, string> = {};
for (const [k, v] of Object.entries(NATO)) NATO_REV[v.toUpperCase()] = k;

function toNATO(s: string): string { return s.toUpperCase().split('').map(c => NATO[c] || c).join(' '); }
function fromNATO(s: string): string { return s.split(/\s+/).map(w => NATO_REV[w.toUpperCase().replace(/[^A-Z]/g, '')] || w).join(''); }

function toBinary(s: string): string { return Array.from(s).map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' '); }
function fromBinary(s: string): string {
  const clean = s.replace(/[^01]/g, '');
  const bytes = clean.match(/.{1,8}/g) || [];
  return bytes.map(b => String.fromCharCode(parseInt(b, 2))).join('');
}

function toUnicodeCP(s: string): string { return Array.from(s).map(c => 'U+' + c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')).join(' '); }
function toHTMLEntities(s: string): string { return Array.from(s).map(c => `&#${c.charCodeAt(0)};`).join(''); }
function toPercentEncoded(s: string): string {
  const encoder = new TextEncoder();
  return Array.from(encoder.encode(s)).map(b => '%' + b.toString(16).toUpperCase().padStart(2, '0')).join('');
}

function toRoman(num: number): string {
  if (num < 1 || num > 3999) return '';
  const vals: [number, string][] = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
  let r = '';
  for (const [v, s] of vals) { while (num >= v) { r += s; num -= v; } }
  return r;
}
function fromRoman(s: string): number {
  const map: Record<string, number> = {'I':1,'V':5,'X':10,'L':50,'C':100,'D':500,'M':1000};
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const cur = map[s[i]] || 0;
    const next = map[s[i + 1]] || 0;
    if (cur < next) total -= cur; else total += cur;
  }
  return total;
}

function leet(s: string): string { return s.replace(/a/gi,'4').replace(/e/gi,'3').replace(/o/gi,'0').replace(/s/gi,'5').replace(/t/gi,'7').replace(/b/gi,'8').replace(/i/gi,'1').replace(/l/gi,'1'); }
function rot13(s: string): string { return s.replace(/[a-zA-Z]/g, c => { const base = c <= 'Z' ? 65 : 97; return String.fromCharCode((c.charCodeAt(0) - base + 13) % 26 + base); }); }
function shuffleStr(s: string): string {
  const arr = Array.from(s);
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr.join('');
}

export default function TextConverter() {
  const [tab, setTab] = useState<Tab>('nato');
  const [natoInput, setNatoInput] = useState('');
  const [natoMode, setNatoMode] = useState<'to' | 'from'>('to');
  const [binInput, setBinInput] = useState('');
  const [binMode, setBinMode] = useState<'to' | 'from'>('to');
  const [uniInput, setUniInput] = useState('');
  const [romanInput, setRomanInput] = useState('');
  const [romanMode, setRomanMode] = useState<'to' | 'from'>('to');
  const [romanOutput, setRomanOutput] = useState('');
  const [obfuscateInput, setObfuscateInput] = useState('');

  const copy = (txt: string, label: string) => { clipboardWrite(txt); toast.success(`${label} copied!`); };

  const TabBtn = ({ v, label, icon: Icon }: { v: Tab; label: string; icon: React.ElementType }) => (
    <button onClick={() => setTab(v)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${tab === v ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );

  const ObfuscateOutput = ({ label, val }: { label: string; val: string }) => (
    <div className="relative">
      <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">{label}</label>
      <input type="text" readOnly value={val} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none font-mono" />
      {val && <button onClick={() => copy(val, label)} className="absolute top-5 right-2 text-[10px] text-indigo-400 hover:underline">Copy</button>}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 w-fit">
        <TabBtn v="nato" label="NATO" icon={Type} />
        <TabBtn v="binary" label="ASCII Binary" icon={Binary} />
        <TabBtn v="unicode" label="Unicode" icon={Hash} />
        <TabBtn v="roman" label="Roman Numerals" icon={Sigma} />
        <TabBtn v="obfuscate" label="Obfuscator" icon={EyeOff} />
      </div>

      {tab === 'nato' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
              <button onClick={() => setNatoMode('to')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${natoMode === 'to' ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500'}`}>Text → NATO</button>
              <button onClick={() => setNatoMode('from')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${natoMode === 'from' ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500'}`}>NATO → Text</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea value={natoInput} onChange={e => setNatoInput(e.target.value)} placeholder={natoMode === 'to' ? 'Enter text...' : 'Enter NATO words (e.g. Alpha Bravo Charlie)...'} className="w-full h-[150px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none font-mono" />
            <div className="relative">
              <textarea value={natoMode === 'to' ? toNATO(natoInput) : fromNATO(natoInput)} readOnly placeholder="Result..." className="w-full h-[150px] bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none font-mono" />
              {natoInput && <button onClick={() => copy(natoMode === 'to' ? toNATO(natoInput) : fromNATO(natoInput), 'NATO')} className="absolute top-3 right-3 text-[10px] text-indigo-400 hover:underline bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700">Copy</button>}
            </div>
          </div>
        </div>
      )}

      {tab === 'binary' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
              <button onClick={() => setBinMode('to')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${binMode === 'to' ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500'}`}>Text → Binary</button>
              <button onClick={() => setBinMode('from')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${binMode === 'from' ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500'}`}>Binary → Text</button>
            </div>
            <button onClick={() => setBinMode(binMode === 'to' ? 'from' : 'to')} className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">⇄ Swap</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea value={binInput} onChange={e => setBinInput(e.target.value)} placeholder={binMode === 'to' ? 'Enter text...' : 'Enter binary (e.g. 01001000 01101001)...'} className="w-full h-[150px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none font-mono" />
            <div className="relative">
              <textarea value={binMode === 'to' ? toBinary(binInput) : fromBinary(binInput)} readOnly placeholder="Result..." className="w-full h-[150px] bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none font-mono" />
              {binInput && <button onClick={() => copy(binMode === 'to' ? toBinary(binInput) : fromBinary(binInput), 'Binary')} className="absolute top-3 right-3 text-[10px] text-indigo-400 hover:underline bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700">Copy</button>}
            </div>
          </div>
        </div>
      )}

      {tab === 'unicode' && (
        <div className="space-y-4">
          <textarea value={uniInput} onChange={e => setUniInput(e.target.value)} placeholder="Enter text..." className="w-full h-[100px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none font-mono" />
          {uniInput && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-3">
              <ObfuscateOutput label="Code Points (U+XXXX)" val={toUnicodeCP(uniInput)} />
              <ObfuscateOutput label="HTML Entities (&#XXXX;)" val={toHTMLEntities(uniInput)} />
              <ObfuscateOutput label="Percent Encoded" val={toPercentEncoded(uniInput)} />
            </div>
          )}
        </div>
      )}

      {tab === 'roman' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
              <button onClick={() => { setRomanMode('to'); setRomanOutput(''); setRomanInput(''); }} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${romanMode === 'to' ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500'}`}>Number → Roman</button>
              <button onClick={() => { setRomanMode('from'); setRomanOutput(''); setRomanInput(''); }} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${romanMode === 'from' ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500'}`}>Roman → Number</button>
            </div>
          </div>
          <input value={romanInput} onChange={e => {
            setRomanInput(e.target.value);
            if (romanMode === 'to') {
              const n = parseInt(e.target.value);
              setRomanOutput(!isNaN(n) && n > 0 && n < 4000 ? toRoman(n) : '');
            } else {
              const r = e.target.value.toUpperCase().replace(/[^IVXLCDM]/g, '');
              setRomanOutput(r ? String(fromRoman(r)) : '');
            }
          }} placeholder={romanMode === 'to' ? 'Enter a number (1-3999)...' : 'Enter Roman numerals (e.g. MCMXCIV)...'} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-3 text-sm text-zinc-900 dark:text-white outline-none font-mono" />
          {romanInput && romanOutput && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5">
              <h3 className="text-[10px] font-bold text-zinc-400 uppercase mb-2">{romanMode === 'to' ? 'Roman Numeral' : 'Arabic Number'}</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">{romanOutput}</p>
              <button onClick={() => copy(romanOutput, romanMode === 'to' ? 'Roman' : 'Number')} className="mt-2 text-[10px] text-indigo-400 hover:underline">Copy</button>
            </div>
          )}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5">
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Reference</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
              {[['I','1'],['IV','4'],['V','5'],['IX','9'],['X','10'],['XL','40'],['L','50'],['XC','90'],['C','100'],['CD','400'],['D','500'],['CM','900'],['M','1000']].map(([r, n]) => (
                <div key={r} className="flex items-center gap-2 p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                  <span className="font-bold text-zinc-900 dark:text-white">{r}</span>
                  <span className="text-zinc-500">{n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'obfuscate' && (
        <div className="space-y-4">
          <textarea value={obfuscateInput} onChange={e => setObfuscateInput(e.target.value)} placeholder="Enter text to obfuscate..." className="w-full h-[100px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none font-mono" />
          {obfuscateInput && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-3">
              <ObfuscateOutput label="Leet Speak (1337)" val={leet(obfuscateInput)} />
              <ObfuscateOutput label="Reversed" val={Array.from(obfuscateInput).reverse().join('')} />
              <ObfuscateOutput label="Shuffled" val={shuffleStr(obfuscateInput)} />
              <ObfuscateOutput label="Base64" val={btoa(obfuscateInput)} />
              <ObfuscateOutput label="ROT13" val={rot13(obfuscateInput)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

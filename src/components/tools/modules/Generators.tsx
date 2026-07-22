"use client";
import React, { useState, useCallback, useRef, useEffect } from 'react';
import QRCodeLib from 'qrcode';
import { downloadOrShare } from '@/utils/nativeShare';

const inputClass = "w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm";
const labelClass = "block text-sm font-medium mb-1";
const btnClass = "w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg text-sm transition-colors";
const cardClass = "max-w-xl mx-auto p-6";
const headingClass = "text-2xl font-bold mb-6";
const resultClass = "p-4 bg-[var(--bg-surface)] rounded-lg text-sm font-mono break-all";
const secondaryBtnClass = "px-4 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg text-sm font-medium transition-colors";

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, []);
  return { copied, copy };
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// === 1. RandomPasswordGenerator ===
export function RandomPasswordGenerator() {
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [result, setResult] = useState('');
  const { copied, copy } = useCopy();

  const generate = () => {
    let chars = '';
    if (upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (digits) chars += '0123456789';
    if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (excludeSimilar) chars = chars.replace(/[il1Lo0O]/g, '');
    if (!chars) return;
    let pwd = '';
    for (let i = 0; i < length; i++) pwd += chars[randInt(0, chars.length - 1)];
    setResult(pwd);
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Random Password Generator</h1>
      <div className="space-y-3">
        <div className="flex gap-4">
          <div className="flex-1"><label className={labelClass}>Length</label><input type="number" min={4} max={128} value={length} onChange={e => setLength(Number(e.target.value))} className={inputClass} /></div>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={upper} onChange={e => setUpper(e.target.checked)} />Uppercase</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={lower} onChange={e => setLower(e.target.checked)} />Lowercase</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={digits} onChange={e => setDigits(e.target.checked)} />Digits</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={symbols} onChange={e => setSymbols(e.target.checked)} />Symbols</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={excludeSimilar} onChange={e => setExcludeSimilar(e.target.checked)} />Exclude Similar</label>
        </div>
        <button onClick={generate} className={btnClass}>Generate Password</button>
        {result && (
          <div className="mt-4">
            <div className={resultClass}>{result}</div>
            <button onClick={() => copy(result)} className={`${secondaryBtnClass} mt-2`}>{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

// === 2. RandomNumberGenerator ===
export function RandomNumberGenerator() {
  const [min, setMin] = useState('1');
  const [max, setMax] = useState('100');
  const [count, setCount] = useState('1');
  const [unique, setUnique] = useState(false);
  const [result, setResult] = useState<number[]>([]);

  const generate = () => {
    const mn = parseInt(min); const mx = parseInt(max); const c = parseInt(count);
    if (isNaN(mn) || isNaN(mx) || isNaN(c)) return;
    const nums: number[] = [];
    const pool = mx - mn + 1;
    if (unique && c > pool) { setResult(Array.from({ length: pool }, (_, i) => mn + i)); return; }
    if (unique) {
      const available = Array.from({ length: pool }, (_, i) => mn + i);
      const shuffled = shuffleArray(available);
      setResult(shuffled.slice(0, c));
    } else {
      for (let i = 0; i < c; i++) nums.push(randInt(mn, mx));
      setResult(nums);
    }
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Random Number Generator</h1>
      <div className="space-y-3">
        <div className="flex gap-4">
          <div className="flex-1"><label className={labelClass}>Min</label><input type="number" value={min} onChange={e => setMin(e.target.value)} className={inputClass} /></div>
          <div className="flex-1"><label className={labelClass}>Max</label><input type="number" value={max} onChange={e => setMax(e.target.value)} className={inputClass} /></div>
        </div>
        <div><label className={labelClass}>Count</label><input type="number" min={1} value={count} onChange={e => setCount(e.target.value)} className={inputClass} /></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={unique} onChange={e => setUnique(e.target.checked)} />Unique numbers</label>
        <button onClick={generate} className={btnClass}>Generate</button>
        {result.length > 0 && <div className={resultClass}>{result.join(', ')}</div>}
      </div>
    </div>
  );
}

// === 3. RandomStringGenerator ===
export function RandomStringGenerator() {
  const [length, setLength] = useState(12);
  const [charset, setCharset] = useState('alphanumeric');
  const [result, setResult] = useState('');
  const { copied, copy } = useCopy();

  const generate = () => {
    let chars = '';
    switch (charset) {
      case 'alphanumeric': chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; break;
      case 'alpha': chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'; break;
      case 'numeric': chars = '0123456789'; break;
      case 'hex': chars = '0123456789abcdef'; break;
      case 'hex-upper': chars = '0123456789ABCDEF'; break;
      case 'uuid': {
        setResult(crypto.randomUUID());
        return;
      }
      default: chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    }
    let s = '';
    for (let i = 0; i < length; i++) s += chars[randInt(0, chars.length - 1)];
    setResult(s);
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Random String Generator</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Length</label><input type="number" min={1} max={256} value={length} onChange={e => setLength(Number(e.target.value))} className={inputClass} /></div>
        <div><label className={labelClass}>Charset</label>
          <select value={charset} onChange={e => setCharset(e.target.value)} className={inputClass}>
            <option value="alphanumeric">Alphanumeric</option>
            <option value="alpha">Alphabetic</option>
            <option value="numeric">Numeric</option>
            <option value="hex">Hex (lowercase)</option>
            <option value="hex-upper">Hex (uppercase)</option>
            <option value="uuid">UUID v4</option>
          </select>
        </div>
        <button onClick={generate} className={btnClass}>Generate</button>
        {result && <div className={resultClass}>{result}<button onClick={() => copy(result)} className={`${secondaryBtnClass} mt-2 block`}>{copied ? 'Copied!' : 'Copy'}</button></div>}
      </div>
    </div>
  );
}

// === 4. RandomColorGenerator ===
const NAMED_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
export function RandomColorGenerator() {
  const [count, setCount] = useState(5);
  const [format, setFormat] = useState('hex');
  const [colors, setColors] = useState<string[]>([]);

  const generate = () => {
    const c: string[] = [];
    for (let i = 0; i < count; i++) {
      const r = randInt(0, 255); const g = randInt(0, 255); const b = randInt(0, 255);
      if (format === 'hex') c.push(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
      else if (format === 'rgb') c.push(`rgb(${r}, ${g}, ${b})`);
      else c.push(`hsl(${randInt(0, 360)}, ${randInt(50, 100)}%, ${randInt(40, 60)}%)`);
    }
    setColors(c);
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Random Color Generator</h1>
      <div className="space-y-3">
        <div className="flex gap-4">
          <div className="flex-1"><label className={labelClass}>Count</label><input type="number" min={1} max={20} value={count} onChange={e => setCount(Number(e.target.value))} className={inputClass} /></div>
          <div className="flex-1"><label className={labelClass}>Format</label>
            <select value={format} onChange={e => setFormat(e.target.value)} className={inputClass}>
              <option value="hex">Hex</option>
              <option value="rgb">RGB</option>
              <option value="hsl">HSL</option>
            </select>
          </div>
        </div>
        <button onClick={generate} className={btnClass}>Generate Colors</button>
        {colors.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-4">
            {colors.map((c, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-lg border border-zinc-300 dark:border-zinc-600" style={{ backgroundColor: c }} />
                <span className="text-xs font-mono">{c}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// === 5. RandomTeamGenerator ===
export function RandomTeamGenerator() {
  const [input, setInput] = useState('Alice\nBob\nCharlie\nDiana\nEve\nFrank');
  const [numTeams, setNumTeams] = useState(2);
  const [teams, setTeams] = useState<string[][]>([]);

  const generate = () => {
    const names = input.split('\n').map(s => s.trim()).filter(Boolean);
    const shuffled = shuffleArray(names);
    const t: string[][] = Array.from({ length: numTeams }, () => []);
    shuffled.forEach((name, i) => t[i % numTeams].push(name));
    setTeams(t);
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Random Team Generator</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Names (one per line)</label><textarea value={input} onChange={e => setInput(e.target.value)} rows={6} className={inputClass} /></div>
        <div><label className={labelClass}>Number of Teams</label><input type="number" min={2} max={20} value={numTeams} onChange={e => setNumTeams(Number(e.target.value))} className={inputClass} /></div>
        <button onClick={generate} className={btnClass}>Generate Teams</button>
        {teams.length > 0 && (
          <div className="space-y-3 mt-4">
            {teams.map((team, i) => (
              <div key={i} className="p-3 bg-[var(--bg-surface)] rounded-lg">
                <div className="font-medium text-sm mb-1">Team {i + 1} ({team.length})</div>
                <div className="text-sm">{team.join(', ')}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// === 6. RandomPickerGenerator ===
export function RandomPickerGenerator() {
  const [input, setInput] = useState('Option A\nOption B\nOption C\nOption D');
  const [count, setCount] = useState(1);
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [result, setResult] = useState<string[]>([]);

  const pick = () => {
    const items = input.split('\n').map(s => s.trim()).filter(Boolean);
    if (!items.length) return;
    if (allowRepeat) {
      const picked: string[] = [];
      for (let i = 0; i < count; i++) picked.push(randItem(items));
      setResult(picked);
    } else {
      const shuffled = shuffleArray(items);
      setResult(shuffled.slice(0, Math.min(count, items.length)));
    }
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Random Picker Generator</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Items (one per line)</label><textarea value={input} onChange={e => setInput(e.target.value)} rows={5} className={inputClass} /></div>
        <div className="flex gap-4">
          <div className="flex-1"><label className={labelClass}>Pick Count</label><input type="number" min={1} value={count} onChange={e => setCount(Number(e.target.value))} className={inputClass} /></div>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={allowRepeat} onChange={e => setAllowRepeat(e.target.checked)} />Allow repeats</label>
        <button onClick={pick} className={btnClass}>Pick</button>
        {result.length > 0 && <div className={resultClass}>{result.join(', ')}</div>}
      </div>
    </div>
  );
}

// === 7. RandomDecisionMaker ===
export function RandomDecisionMaker() {
  const [question, setQuestion] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [decision, setDecision] = useState('');
  const options = ['Yes', 'No', 'Maybe', 'Ask Again', 'Definitely', 'Absolutely Not', 'Try Later', 'I Doubt It'];

  const decide = () => {
    if (!question.trim()) return;
    setSpinning(true);
    setDecision('');
    let count = 0;
    const interval = setInterval(() => {
      setDecision(randItem(options));
      count++;
      if (count > 12) {
        clearInterval(interval);
        setSpinning(false);
      }
    }, 100);
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Random Decision Maker</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Your Question</label><input type="text" value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask a question..." className={inputClass} /></div>
        <button onClick={decide} disabled={spinning} className={`${btnClass} ${spinning ? 'opacity-60' : ''}`}>{spinning ? 'Thinking...' : 'Ask the Magic 8-Ball'}</button>
        {decision && (
          <div className="mt-6 text-center">
            <div className="text-4xl font-bold bg-blue-600 text-white rounded-2xl p-8 inline-block min-w-[200px]">{decision}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// === 8. RandomUsernameGenerator ===
const ADJECTIVES = ['Swift', 'Brave', 'Clever', 'Mighty', 'Silent', 'Golden', 'Shadow', 'Crimson', 'Frost', 'Storm', 'Azure', 'Ember', 'Neon', 'Stealth', 'Blaze'];
const NOUNS = ['Fox', 'Wolf', 'Eagle', 'Bear', 'Hawk', 'Owl', 'Tiger', 'Dragon', 'Phoenix', 'Raven', 'Lion', 'Panther', 'Falcon', 'Cobra', 'Viper'];
export function RandomUsernameGenerator() {
  const [pattern, setPattern] = useState('adj-noun');
  const [includeNum, setIncludeNum] = useState(false);
  const [count, setCount] = useState(5);
  const [results, setResults] = useState<string[]>([]);
  const { copied, copy } = useCopy();

  const generate = () => {
    const usernames: string[] = [];
    for (let i = 0; i < count; i++) {
      let u = '';
      switch (pattern) {
        case 'adj-noun': u = `${randItem(ADJECTIVES)}${randItem(NOUNS)}`; break;
        case 'noun-num': u = `${randItem(NOUNS)}${randInt(10, 999)}`; break;
        case 'adj-noun-num': u = `${randItem(ADJECTIVES)}${randItem(NOUNS)}${randInt(10, 999)}`; break;
        case 'word-word': u = `${randItem(ADJECTIVES)}${randItem(NOUNS)}`.toLowerCase(); break;
      }
      if (includeNum) u += randInt(10, 999);
      usernames.push(u);
    }
    setResults(usernames);
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Random Username Generator</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Pattern</label>
          <select value={pattern} onChange={e => setPattern(e.target.value)} className={inputClass}>
            <option value="adj-noun">Adjective + Noun</option>
            <option value="noun-num">Noun + Number</option>
            <option value="adj-noun-num">Adjective + Noun + Number</option>
            <option value="word-word">word-word (lowercase)</option>
          </select>
        </div>
        <div className="flex gap-4">
          <div className="flex-1"><label className={labelClass}>Count</label><input type="number" min={1} max={50} value={count} onChange={e => setCount(Number(e.target.value))} className={inputClass} /></div>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={includeNum} onChange={e => setIncludeNum(e.target.checked)} />Append random number</label>
        <button onClick={generate} className={btnClass}>Generate</button>
        {results.length > 0 && (
          <div className="mt-4 space-y-1">
            {results.map((u, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-[var(--bg-surface)] rounded-lg text-sm">
                <span className="font-mono">{u}</span>
                <button onClick={() => copy(u)} className="text-xs text-blue-600 hover:underline">{copied ? 'Copied!' : 'Copy'}</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// === 9. RandomUUIDGenerator ===
export function RandomUUIDGenerator() {
  const [version, setVersion] = useState('v4');
  const [count, setCount] = useState(1);
  const [results, setResults] = useState<string[]>([]);
  const { copied, copy } = useCopy();

  const generate = () => {
    const uuids: string[] = [];
    for (let i = 0; i < count; i++) {
      if (version === 'v4') uuids.push(crypto.randomUUID());
      else {
        const arr = new Uint8Array(16);
        crypto.getRandomValues(arr);
        arr[6] = (arr[6] & 0x0f) | 0x70;
        arr[8] = (arr[8] & 0x3f) | 0x80;
        const hex = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
        uuids.push(`${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`);
      }
    }
    setResults(uuids);
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Random UUID Generator</h1>
      <div className="space-y-3">
        <div className="flex gap-4">
          <div className="flex-1"><label className={labelClass}>Version</label>
            <select value={version} onChange={e => setVersion(e.target.value)} className={inputClass}>
              <option value="v4">UUID v4 (Random)</option>
              <option value="v7">UUID v7 (Time-Ordered)</option>
            </select>
          </div>
          <div className="flex-1"><label className={labelClass}>Count</label><input type="number" min={1} max={100} value={count} onChange={e => setCount(Number(e.target.value))} className={inputClass} /></div>
        </div>
        <button onClick={generate} className={btnClass}>Generate</button>
        {results.length > 0 && (
          <div className="mt-4 space-y-1">
            {results.map((u, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-[var(--bg-surface)] rounded-lg text-sm">
                <span className="font-mono">{u}</span>
                <button onClick={() => copy(u)} className="text-xs text-blue-600 hover:underline">{copied ? 'Copied!' : 'Copy'}</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// === 10. RandomTokenGenerator ===
export function RandomTokenGenerator() {
  const [format, setFormat] = useState('hex');
  const [length, setLength] = useState(32);
  const [result, setResult] = useState('');
  const { copied, copy } = useCopy();

  const generate = () => {
    const bytes = new Uint8Array(Math.ceil(length * (format === 'base64' ? 0.75 : 0.5)));
    crypto.getRandomValues(bytes);
    if (format === 'hex') setResult(Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, length));
    else if (format === 'base64') setResult(btoa(String.fromCharCode(...bytes)).replace(/=+$/, '').slice(0, length));
    else {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let s = '';
      for (let i = 0; i < length; i++) s += chars[randInt(0, chars.length - 1)];
      setResult(s);
    }
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Random Token Generator</h1>
      <div className="space-y-3">
        <div className="flex gap-4">
          <div className="flex-1"><label className={labelClass}>Format</label>
            <select value={format} onChange={e => setFormat(e.target.value)} className={inputClass}>
              <option value="hex">Hex</option>
              <option value="base64">Base64</option>
              <option value="alphanumeric">Alphanumeric</option>
            </select>
          </div>
          <div className="flex-1"><label className={labelClass}>Length</label><input type="number" min={4} max={256} value={length} onChange={e => setLength(Number(e.target.value))} className={inputClass} /></div>
        </div>
        <button onClick={generate} className={btnClass}>Generate Token</button>
        {result && <div className={resultClass}>{result}<button onClick={() => copy(result)} className={`${secondaryBtnClass} mt-2 block`}>{copied ? 'Copied!' : 'Copy'}</button></div>}
      </div>
    </div>
  );
}

// === 11. LoremIpsumGenerator ===
const LOREM_WORDS = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum', 'eu', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'];
export function LoremIpsumGenerator() {
  const [type, setType] = useState('paragraphs');
  const [count, setCount] = useState(3);
  const [result, setResult] = useState('');
  const { copied, copy } = useCopy();

  const generate = () => {
    const sentences: string[] = [];
    const total = type === 'words' ? count : type === 'sentences' ? count : count * 5;
    for (let i = 0; i < total; i++) {
      const len = randInt(5, 15);
      const words: string[] = [];
      for (let j = 0; j < len; j++) words.push(randItem(LOREM_WORDS));
      words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
      sentences.push(words.join(' ') + '.');
    }
    if (type === 'words') setResult(sentences.slice(0, count).join(' ').toLowerCase());
    else if (type === 'sentences') setResult(sentences.join(' '));
    else {
      const paras: string[] = [];
      for (let i = 0; i < count; i++) {
        paras.push(sentences.slice(i * 5, (i + 1) * 5).join(' '));
      }
      setResult(paras.join('\n\n'));
    }
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Lorem Ipsum Generator</h1>
      <div className="space-y-3">
        <div className="flex gap-4">
          <div className="flex-1"><label className={labelClass}>Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className={inputClass}>
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
            </select>
          </div>
          <div className="flex-1"><label className={labelClass}>Count</label><input type="number" min={1} max={100} value={count} onChange={e => setCount(Number(e.target.value))} className={inputClass} /></div>
        </div>
        <button onClick={generate} className={btnClass}>Generate</button>
        {result && <div className="mt-4"><textarea readOnly value={result} rows={8} className={`${inputClass} font-sans`} /><button onClick={() => copy(result)} className={`${secondaryBtnClass} mt-2`}>{copied ? 'Copied!' : 'Copy'}</button></div>}
      </div>
    </div>
  );
}

// === 12. DummyTextGenerator ===
export function DummyTextGenerator() {
  const [length, setLength] = useState(200);
  const [result, setResult] = useState('');
  const { copied, copy } = useCopy();

  const generate = () => {
    let text = '';
    while (text.length < length) {
      text += randItem(LOREM_WORDS) + ' ';
    }
    setResult(text.slice(0, length).replace(/^./, c => c.toUpperCase()).replace(/\s+\S*$/, '') + '.');
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Dummy Text Generator</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Character Length</label><input type="number" min={10} max={5000} value={length} onChange={e => setLength(Number(e.target.value))} className={inputClass} /></div>
        <button onClick={generate} className={btnClass}>Generate</button>
        {result && <div className="mt-4"><textarea readOnly value={result} rows={6} className={`${inputClass} font-sans`} /><button onClick={() => copy(result)} className={`${secondaryBtnClass} mt-2`}>{copied ? 'Copied!' : 'Copy'}</button></div>}
      </div>
    </div>
  );
}

// === 13. FakeDataGenerator ===
const FIRST_NAMES = ['Aarav', 'Priya', 'Vikram', 'Ananya', 'Rohit', 'Sneha', 'Arjun', 'Neha', 'Karan', 'Isha', 'Rahul', 'Pooja', 'Amit', 'Divya', 'Sachin'];
const LAST_NAMES = ['Sharma', 'Verma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Joshi', 'Reddy', 'Nair', 'Das', 'Mishra', 'Agarwal', 'Mehta', 'Chopra', 'Malhotra'];
const DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'example.org', 'mail.com'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];
const STREETS = ['Main St', 'Park Ave', 'Oak Lane', 'Maple Dr', 'Cedar Blvd', 'Elm St', 'Pine Rd', 'Lake View', 'Hill Rd', 'River Rd'];
export function FakeDataGenerator() {
  const [count, setCount] = useState(5);
  const [data, setData] = useState<string[]>([]);
  const { copied, copy } = useCopy();

  const generate = () => {
    const entries: string[] = [];
    for (let i = 0; i < count; i++) {
      const fn = randItem(FIRST_NAMES); const ln = randItem(LAST_NAMES);
      entries.push(`Name: ${fn} ${ln}\nEmail: ${fn.toLowerCase()}.${ln.toLowerCase()}${randInt(1, 99)}@${randItem(DOMAINS)}\nPhone: +91 ${randInt(70000, 99999)} ${randInt(10000, 99999)}\nAddress: ${randInt(1, 999)} ${randItem(STREETS)}, ${randItem(CITIES)} - ${randInt(100001, 999999)}`);
    }
    setData(entries);
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Fake Data Generator</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Count</label><input type="number" min={1} max={50} value={count} onChange={e => setCount(Number(e.target.value))} className={inputClass} /></div>
        <button onClick={generate} className={btnClass}>Generate</button>
        {data.length > 0 && (
          <div className="mt-4 space-y-3">
            {data.map((d, i) => (
              <div key={i} className="p-3 bg-[var(--bg-surface)] rounded-lg text-sm whitespace-pre">{d}</div>
            ))}
            <button onClick={() => copy(data.join('\n\n'))} className={secondaryBtnClass}>{copied ? 'Copied All!' : 'Copy All'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

// === 14. FakeIdentityGenerator ===
export function FakeIdentityGenerator() {
  const [identity, setIdentity] = useState<any>(null);
  const { copied, copy } = useCopy();

  const generate = () => {
    const fn = randItem(FIRST_NAMES); const ln = randItem(LAST_NAMES);
    const id = {
      name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${randInt(1, 99)}@${randItem(DOMAINS)}`,
      phone: `+91 ${randInt(70000, 99999)} ${randInt(10000, 99999)}`,
      address: `${randInt(1, 999)} ${randItem(STREETS)}, ${randItem(CITIES)} - ${randInt(100001, 999999)}`,
      dob: `${randInt(1, 28)}/${randInt(1, 12)}/${randInt(1970, 2002)}`,
      occupation: randItem(['Engineer', 'Doctor', 'Teacher', 'Designer', 'Developer', 'Manager', 'Consultant', 'Analyst']),
    };
    setIdentity(id);
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Fake Identity Generator</h1>
      <div className="space-y-3">
        <button onClick={generate} className={btnClass}>Generate Identity</button>
        {identity && (
          <div className="mt-4 space-y-4">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-3xl font-bold text-[var(--text-muted)]">?</div>
            </div>
            <div className="p-4 bg-[var(--bg-surface)] rounded-lg text-sm space-y-1">
              <div><strong>Name:</strong> {identity.name}</div>
              <div><strong>Email:</strong> {identity.email}</div>
              <div><strong>Phone:</strong> {identity.phone}</div>
              <div><strong>Address:</strong> {identity.address}</div>
              <div><strong>DOB:</strong> {identity.dob}</div>
              <div><strong>Occupation:</strong> {identity.occupation}</div>
            </div>
            <button onClick={() => copy(JSON.stringify(identity, null, 2))} className={secondaryBtnClass}>{copied ? 'Copied!' : 'Copy as JSON'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

// === 15. FakeCreditCardGenerator ===
export function FakeCreditCardGenerator() {
  const [count, setCount] = useState(3);
  const [cards, setCards] = useState<{ type: string; number: string; expiry: string; cvv: string }[]>([]);
  const { copied, copy } = useCopy();

  function luhnCheck(num: string): boolean {
    let sum = 0; let alt = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let d = parseInt(num[i]);
      if (alt) { d *= 2; if (d > 9) d -= 9; }
      sum += d; alt = !alt;
    }
    return sum % 10 === 0;
  }

  function genCardNum(prefix: string, len: number): string {
    let num = prefix;
    for (let i = num.length; i < len - 1; i++) num += randInt(0, 9);
    for (let c = 0; c <= 9; c++) {
      if (luhnCheck(num + c)) return num + c;
    }
    return num + '0';
  }

  const generate = () => {
    const c: { type: string; number: string; expiry: string; cvv: string }[] = [];
    const types = [
      { name: 'Visa', prefix: '4', len: 16 },
      { name: 'Mastercard', prefix: '5' + randInt(1, 5), len: 16 },
      { name: 'Amex', prefix: '34', len: 15 },
      { name: 'Discover', prefix: '6011', len: 16 },
    ];
    for (let i = 0; i < count; i++) {
      const t = randItem(types);
      c.push({
        type: t.name,
        number: genCardNum(t.prefix, t.len),
        expiry: `${String(randInt(1, 12)).padStart(2, '0')}/${randInt(25, 30)}`,
        cvv: String(randInt(100, 999)),
      });
    }
    setCards(c);
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Fake Credit Card Generator</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Count</label><input type="number" min={1} max={20} value={count} onChange={e => setCount(Number(e.target.value))} className={inputClass} /></div>
        <button onClick={generate} className={btnClass}>Generate</button>
        {cards.length > 0 && (
          <div className="mt-4 space-y-3">
            {cards.map((c, i) => (
              <div key={i} className="p-4 bg-[var(--bg-surface)] rounded-lg text-sm space-y-1">
                <div className="font-medium">{c.type}</div>
                <div className="font-mono">{c.number.replace(/(\d{4})(?=\d)/g, '$1 ')}</div>
                <div className="flex gap-4 text-xs text-[var(--text-secondary)]"><span>Exp: {c.expiry}</span><span>CVV: {c.cvv}</span></div>
              </div>
            ))}
            <button onClick={() => copy(cards.map(c => `${c.number}|${c.expiry}|${c.cvv}`).join('\n'))} className={secondaryBtnClass}>{copied ? 'Copied!' : 'Copy All'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

// === 16. SequenceGenerator ===
export function SequenceGenerator() {
  const [type, setType] = useState('arithmetic');
  const [start, setStart] = useState('1');
  const [diff, setDiff] = useState('2');
  const [count, setCount] = useState('10');
  const [result, setResult] = useState<number[]>([]);

  const generate = () => {
    const s = parseFloat(start); const d = parseFloat(diff); const c = parseInt(count);
    if (isNaN(s) || isNaN(d) || isNaN(c)) return;
    const seq: number[] = [];
    if (type === 'arithmetic') { for (let i = 0; i < c; i++) seq.push(s + i * d); }
    else if (type === 'geometric') { for (let i = 0; i < c; i++) seq.push(s * Math.pow(d, i)); }
    else { for (let i = 0; i < c; i++) seq.push(s + i + (i * d)); }
    setResult(seq);
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Sequence Generator</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Type</label>
          <select value={type} onChange={e => setType(e.target.value)} className={inputClass}>
            <option value="arithmetic">Arithmetic</option>
            <option value="geometric">Geometric</option>
            <option value="custom">Custom (n + n*r)</option>
          </select>
        </div>
        <div className="flex gap-4">
          <div className="flex-1"><label className={labelClass}>Start</label><input type="number" value={start} onChange={e => setStart(e.target.value)} className={inputClass} /></div>
          <div className="flex-1"><label className={labelClass}>Diff/Ratio</label><input type="number" value={diff} onChange={e => setDiff(e.target.value)} className={inputClass} /></div>
          <div className="flex-1"><label className={labelClass}>Count</label><input type="number" value={count} onChange={e => setCount(e.target.value)} className={inputClass} /></div>
        </div>
        <button onClick={generate} className={btnClass}>Generate</button>
        {result.length > 0 && <div className={resultClass}>{result.join(', ')}</div>}
      </div>
    </div>
  );
}

// === 17. BarcodeGenerator ===
const BARCODE_PATTERNS: Record<string, string[]> = {
  'UPC-A': ['3211', '2221', '2122', '1411', '1132', '1231', '1114', '1312', '1213', '3112'],
  'EAN-13': ['3211', '2221', '2122', '1411', '1132', '1231', '1114', '1312', '1213', '3112'],
  'Code128': ['212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213'],
  'Code39': ['111221211', '211211112', '112211112', '211112112', '111212112', '112112112', '211121112', '111121212', '211111122', '112111122'],
};
export function BarcodeGenerator() {
  const [input, setInput] = useState('123456789012');
  const [type, setType] = useState('UPC-A');
  const svgRef = useRef<SVGSVGElement>(null);

  const renderBarcode = () => {
    const patterns = BARCODE_PATTERNS[type] || BARCODE_PATTERNS['UPC-A'];
    const digits = input.replace(/\D/g, '').split('').slice(0, 12);
    const barWidth = 2;
    const height = 80;
    let x = 20;
    const bars: { x: number; w: number }[] = [];

    bars.push({ x: x, w: barWidth }); x += barWidth;
    bars.push({ x: x, w: barWidth * 2 }); x += barWidth * 2;

    for (const d of digits) {
      const p = patterns[parseInt(d)] || patterns[0];
      for (const c of p) {
        bars.push({ x: x, w: parseInt(c) * barWidth });
        x += parseInt(c) * barWidth;
      }
    }

    bars.push({ x: x, w: barWidth * 2 }); x += barWidth * 2;
    bars.push({ x: x, w: barWidth });

    const totalWidth = x + 20;

    return (
      <svg ref={svgRef} width={totalWidth} height={height + 30} xmlns="http://www.w3.org/2000/svg" className="mx-auto">
        {bars.map((b, i) => (
          <rect key={i} x={b.x} y={10} width={b.w} height={height} fill={i % 2 === 0 ? '#000' : '#fff'} />
        ))}
        <text x={totalWidth / 2} y={height + 25} textAnchor="middle" fontSize="12" fontFamily="monospace">{input}</text>
      </svg>
    );
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Barcode Generator</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Type</label>
          <select value={type} onChange={e => setType(e.target.value)} className={inputClass}>
            <option value="UPC-A">UPC-A</option>
            <option value="EAN-13">EAN-13</option>
            <option value="Code128">Code 128</option>
            <option value="Code39">Code 39</option>
          </select>
        </div>
        <div><label className={labelClass}>Data</label><input type="text" value={input} onChange={e => setInput(e.target.value)} className={inputClass} /></div>
        {input && <div className="mt-4 overflow-auto">{renderBarcode()}</div>}
      </div>
    </div>
  );
}

// === 18. QrCodeGenerator ===
export function QrCodeGenerator() {
  const [text, setText] = useState('https://toolzum.com');
  const [errorCorrection, setErrorCorrection] = useState('M');
  const [dataUrl, setDataUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!text.trim()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    QRCodeLib.toCanvas(canvas, text.trim(), {
      width: 280,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: errorCorrection as 'L' | 'M' | 'Q' | 'H',
    }).then(() => {
      setDataUrl(canvas.toDataURL('image/png'));
    }).catch(() => {});
  }, [text, errorCorrection]);

  const handleDownload = () => {
    if (!dataUrl) return;
    downloadOrShare(dataUrl, `qrcode_${Date.now()}.png`);
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>QR Code Generator</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Text / URL</label><input type="text" value={text} onChange={e => setText(e.target.value)} className={inputClass} placeholder="Enter text or URL to encode..." /></div>
        <div className="flex gap-4">
          <div className="flex-1"><label className={labelClass}>Error Correction</label>
            <select value={errorCorrection} onChange={e => setErrorCorrection(e.target.value)} className={inputClass}>
              <option value="L">Low (7%)</option>
              <option value="M">Medium (15%)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%)</option>
            </select>
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
        {dataUrl && (
          <div className="mt-4 flex flex-col items-center gap-4">
            <img src={dataUrl} alt="QR Code" className="rounded-xl border border-[var(--border-subtle)]" />
            <button onClick={handleDownload} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-sm transition-colors">Download PNG</button>
          </div>
        )}
      </div>
    </div>
  );
}

// === 19. CouponCodeGenerator ===
const COUPON_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function CouponCodeGenerator() {
  const [pattern, setPattern] = useState('XXXX-XXXX-XXXX');
  const [count, setCount] = useState(5);
  const [codes, setCodes] = useState<string[]>([]);
  const { copied, copy } = useCopy();

  const generate = () => {
    const cs: string[] = [];
    for (let c = 0; c < count; c++) {
      let code = '';
      for (const ch of pattern) {
        if (ch === 'X') code += COUPON_CHARS[randInt(0, COUPON_CHARS.length - 1)];
        else code += ch;
      }
      cs.push(code);
    }
    setCodes(cs);
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Coupon Code Generator</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Pattern (X = random char)</label><input type="text" value={pattern} onChange={e => setPattern(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Count</label><input type="number" min={1} max={100} value={count} onChange={e => setCount(Number(e.target.value))} className={inputClass} /></div>
        <button onClick={generate} className={btnClass}>Generate</button>
        {codes.length > 0 && (
          <div className="mt-4 space-y-1">
            {codes.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-[var(--bg-surface)] rounded-lg text-sm font-mono">
                <span>{c}</span>
                <button onClick={() => copy(c)} className="text-xs text-blue-600 hover:underline">{copied ? 'Copied!' : 'Copy'}</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// === 20. SerialNumberGenerator ===
export function SerialNumberGenerator() {
  const [format, setFormat] = useState('XXXX-XXXX-XXXX-XXXX');
  const [count, setCount] = useState(5);
  const [serials, setSerials] = useState<string[]>([]);
  const { copied, copy } = useCopy();

  const generate = () => {
    const ss: string[] = [];
    for (let c = 0; c < count; c++) {
      let s = '';
      for (const ch of format) {
        if (ch === 'X') s += '0123456789ABCDEF'[randInt(0, 15)];
        else if (ch === '9') s += randInt(0, 9).toString();
        else if (ch === 'A') s += COUPON_CHARS[randInt(0, COUPON_CHARS.length - 1)];
        else s += ch;
      }
      ss.push(s);
    }
    setSerials(ss);
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Serial Number Generator</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Format (X=hex, 9=digit, A=alphanum)</label><input type="text" value={format} onChange={e => setFormat(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Count</label><input type="number" min={1} max={100} value={count} onChange={e => setCount(Number(e.target.value))} className={inputClass} /></div>
        <button onClick={generate} className={btnClass}>Generate</button>
        {serials.length > 0 && (
          <div className="mt-4 space-y-1">
            {serials.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-[var(--bg-surface)] rounded-lg text-sm font-mono">
                <span>{s}</span>
                <button onClick={() => copy(s)} className="text-xs text-blue-600 hover:underline">{copied ? 'Copied!' : 'Copy'}</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// === 21. NicknameGenerator ===
const NICKNAME_PARTS = ['Star', 'Shadow', 'Light', 'Blaze', 'Storm', 'Frost', 'Crystal', 'Thunder', 'Dark', 'Wild', 'Fire', 'Ice', 'Iron', 'Steel', 'Silver', 'Gold', 'Mystic', 'Phantom', 'Neon', 'Cyber'];
export function NicknameGenerator() {
  const [count, setCount] = useState(10);
  const [results, setResults] = useState<string[]>([]);
  const { copied, copy } = useCopy();

  const generate = () => {
    const n: string[] = [];
    for (let i = 0; i < count; i++) {
      const adj = randItem(ADJECTIVES).toLowerCase();
      const part = randItem(NICKNAME_PARTS).toLowerCase();
      const num = randInt(1, 99);
      n.push(`${adj}${part}${num}`);
    }
    setResults(n);
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Nickname Generator</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Count</label><input type="number" min={1} max={50} value={count} onChange={e => setCount(Number(e.target.value))} className={inputClass} /></div>
        <button onClick={generate} className={btnClass}>Generate</button>
        {results.length > 0 && (
          <div className="mt-4 space-y-1">
            {results.map((n, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-[var(--bg-surface)] rounded-lg text-sm">
                <span>{n}</span>
                <button onClick={() => copy(n)} className="text-xs text-blue-600 hover:underline">{copied ? 'Copied!' : 'Copy'}</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// === 22. AvatarGenerator ===
export function AvatarGenerator() {
  const [name, setName] = useState('John Doe');
  const [bgColor, setBgColor] = useState('#4F46E5');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [size, setSize] = useState(120);

  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Avatar Generator</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} /></div>
        <div className="flex gap-4">
          <div className="flex-1"><label className={labelClass}>Background</label><input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" /></div>
          <div className="flex-1"><label className={labelClass}>Text Color</label><input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" /></div>
        </div>
        <div><label className={labelClass}>Size</label><input type="range" min={40} max={200} value={size} onChange={e => setSize(Number(e.target.value))} className="w-full" /></div>
        <div className="mt-6 flex justify-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
            <rect width={size} height={size} rx={size * 0.2} fill={bgColor} />
            <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fill={textColor} fontSize={size * 0.4} fontFamily="sans-serif" fontWeight="bold">{initials}</text>
          </svg>
        </div>
      </div>
    </div>
  );
}

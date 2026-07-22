"use client";
import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

const inputClass = "w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm";
const btnClass = "w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg text-sm transition-colors";
const resultClass = "p-4 bg-[var(--bg-surface)] rounded-lg text-sm whitespace-pre-wrap font-mono";

function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, []);
  return { copied, copy };
}

function CountSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[var(--text-secondary)]">Count</span>
      <input type="range" min={1} max={20} value={value} onChange={e => onChange(Number(e.target.value))} className="flex-1 h-1" />
      <span className="text-sm text-[var(--text-muted)] w-5 text-right">{value}</span>
    </div>
  );
}

function OutputBlock({ value }: { value: string }) {
  const { copied, copy } = useCopy();
  if (!value) return null;
  return (
    <div className="mt-3">
      <pre className={resultClass + ' max-h-48 overflow-y-auto'}>{value}</pre>
      <button onClick={() => copy(value)} className="mt-1 px-4 py-1.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg text-xs font-medium transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
    </div>
  );
}

export function RandomDateGenerator() {
  const [count, setCount] = useState(5);
  const [out, setOut] = useState('');
  const gen = () => {
    const lines = Array.from({ length: count }, () => {
      const d = new Date(Date.now() - randInt(0, 365 * 5) * 86400000);
      return d.toISOString().split('T')[0] + ' (' + d.toDateString() + ')';
    });
    setOut(lines.join('\n'));
    toast.success('Dates generated');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">Random Date Generator</h1>
      <CountSlider value={count} onChange={setCount} />
      <button onClick={gen} className={btnClass}>Generate Dates</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function RandomTimeGenerator() {
  const [count, setCount] = useState(5);
  const [out, setOut] = useState('');
  const gen = () => {
    const lines = Array.from({ length: count }, () => {
      const h = String(randInt(0, 23)).padStart(2, '0');
      const m = String(randInt(0, 59)).padStart(2, '0');
      const s = String(randInt(0, 59)).padStart(2, '0');
      return `${h}:${m}:${s} (${+h % 12 || 12}:${m} ${+h < 12 ? 'AM' : 'PM'})`;
    });
    setOut(lines.join('\n'));
    toast.success('Times generated');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">Random Time Generator</h1>
      <CountSlider value={count} onChange={setCount} />
      <button onClick={gen} className={btnClass}>Generate Times</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function RandomIpGenerator() {
  const [count, setCount] = useState(5);
  const [out, setOut] = useState('');
  const gen = () => {
    const lines = Array.from({ length: count }, () => {
      if (Math.random() > 0.5) return `${randInt(1, 223)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`;
      const h = Array.from({ length: 4 }, () => randInt(0, 65535).toString(16)).join(':');
      return `${h}::${randInt(1, 254).toString(16)}`;
    });
    setOut(lines.join('\n'));
    toast.success('IPs generated');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">Random IP Generator</h1>
      <CountSlider value={count} onChange={setCount} />
      <button onClick={gen} className={btnClass}>Generate IPs</button>
      <OutputBlock value={out} />
    </div>
  );
}

const UA_LIST = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
  'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Edge/120.0.0.0',
];

export function RandomUserAgentGenerator() {
  const [count, setCount] = useState(5);
  const [out, setOut] = useState('');
  const gen = () => {
    const lines = Array.from({ length: count }, () => UA_LIST[randInt(0, UA_LIST.length - 1)]);
    setOut(lines.join('\n'));
    toast.success('User agents generated');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">Random User-Agent Generator</h1>
      <CountSlider value={count} onChange={setCount} />
      <button onClick={gen} className={btnClass}>Generate User Agents</button>
      <OutputBlock value={out} />
    </div>
  );
}

const WORDS = ['lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit','sed','do','eiusmod','tempor','incididunt','ut','labore','et','dolore','magna','aliqua','enim','ad','minim','veniam','quis','nostrud','exercitation','ullamco','laboris','nisi','aliquip','ex','ea','commodo','consequat','duis','aute','irure','in','reprehenderit','voluptate','velit','esse','cillum','eu','fugiat','nulla','pariatur','excepteur','sint','occaecat','cupidatat','non','proident','sunt','culpa','qui','officia','deserunt','mollit','anim','id','est','laborum'];

export function RandomSentenceGenerator() {
  const [count, setCount] = useState(5);
  const [out, setOut] = useState('');
  const gen = () => {
    const lines = Array.from({ length: count }, () => {
      const wc = randInt(5, 12);
      const words = Array.from({ length: wc }, () => WORDS[randInt(0, WORDS.length - 1)]);
      return words[0].charAt(0).toUpperCase() + words.slice(0).join(' ') + '.';
    });
    setOut(lines.join('\n'));
    toast.success('Sentences generated');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">Random Sentence Generator</h1>
      <CountSlider value={count} onChange={setCount} />
      <button onClick={gen} className={btnClass}>Generate Sentences</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function RandomWordGenerator() {
  const [count, setCount] = useState(10);
  const [out, setOut] = useState('');
  const gen = () => {
    setOut(Array.from({ length: count }, () => WORDS[randInt(0, WORDS.length - 1)]).join('\n'));
    toast.success('Words generated');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">Random Word Generator</h1>
      <CountSlider value={count} onChange={setCount} />
      <button onClick={gen} className={btnClass}>Generate Words</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function PinGenerator() {
  const [count, setCount] = useState(5);
  const [digits, setDigits] = useState(6);
  const [out, setOut] = useState('');
  const gen = () => {
    const lines = Array.from({ length: count }, () =>
      Array.from({ length: digits }, () => randInt(0, 9)).join('')
    );
    setOut(lines.join('\n'));
    toast.success('PINs generated');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">PIN Generator</h1>
      <CountSlider value={count} onChange={setCount} />
      <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--text-secondary)]">Digits</span>
        {[4, 5, 6, 8, 10].map(n => (
          <button key={n} onClick={() => setDigits(n)} className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${digits === n ? 'bg-blue-600 text-white' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'}`}>{n}</button>
        ))}
      </div>
      <button onClick={gen} className={btnClass}>Generate PINs</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function LicenseKeyGenerator() {
  const [count, setCount] = useState(5);
  const [format, setFormat] = useState('XXXXX-XXXXX-XXXXX-XXXXX');
  const [out, setOut] = useState('');
  const gen = () => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const lines = Array.from({ length: count }, () =>
      format.replace(/X/g, () => charset[randInt(0, charset.length - 1)])
    );
    setOut(lines.join('\n'));
    toast.success('License keys generated');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">License Key Generator</h1>
      <CountSlider value={count} onChange={setCount} />
      <div className="space-y-1">
        <label className="block text-sm font-medium">Format (X = any char)</label>
        <input type="text" value={format} onChange={e => setFormat(e.target.value)} placeholder="XXXXX-XXXXX-XXXXX" className={inputClass + ' font-mono'} />
      </div>
      <button onClick={gen} className={btnClass}>Generate Keys</button>
      <OutputBlock value={out} />
    </div>
  );
}

const C_BG = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4','#84CC16'];
const C_PRODUCTS = ['Widget Pro','Basic Widget','Widget Max','Premium Widget','Widget Lite','Super Widget','Widget Plus'];

export function ImagePlaceholderGenerator() {
  const [count, setCount] = useState(3);
  const [out, setOut] = useState('');
  const gen = () => {
    const lines = Array.from({ length: count }, () => {
      const w = randInt(100, 800);
      const h = randInt(100, 600);
      const bg = C_BG[randInt(0, C_BG.length - 1)];
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${bg}"/><text x="${w / 2}" y="${h / 2}" font-family="sans-serif" font-size="14" fill="#fff" text-anchor="middle" dominant-baseline="middle">${w}\u00d7${h}</text></svg>`;
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    });
    setOut(lines.join('\n\n'));
    toast.success('Placeholders generated');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">Image Placeholder Generator</h1>
      <CountSlider value={count} onChange={setCount} />
      <p className="text-xs text-[var(--text-muted)]">Generates SVG placeholders as base64 data URIs</p>
      <button onClick={gen} className={btnClass}>Generate Placeholders</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function LogoPlaceholderGenerator() {
  const [count, setCount] = useState(3);
  const [out, setOut] = useState('');
  const gen = () => {
    const lines = Array.from({ length: count }, () => {
      const brand = C_PRODUCTS[randInt(0, C_PRODUCTS.length - 1)];
      const initials = brand.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
      const size = randInt(80, 200);
      const bg = C_BG[randInt(0, C_BG.length - 1)];
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="${size * 0.2}" fill="${bg}"/><text x="${size / 2}" y="${size / 2}" font-family="sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
      return `${brand}: data:image/svg+xml;base64,${btoa(svg)}`;
    });
    setOut(lines.join('\n\n'));
    toast.success('Logo placeholders generated');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">Logo Placeholder Generator</h1>
      <CountSlider value={count} onChange={setCount} />
      <p className="text-xs text-[var(--text-muted)]">Branded SVG logos with random colors</p>
      <button onClick={gen} className={btnClass}>Generate Logos</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function OpenGraphGenerator() {
  const [title, setTitle] = useState('My Amazing Website');
  const [desc, setDesc] = useState('Discover the best content on this amazing website.');
  const [url, setUrl] = useState('https://example.com');
  const [img, setImg] = useState('https://example.com/image.jpg');
  const [out, setOut] = useState('');
  const gen = () => {
    const tags = [
      `<meta property="og:title" content="${title}" />`,
      `<meta property="og:description" content="${desc}" />`,
      `<meta property="og:url" content="${url}" />`,
      `<meta property="og:image" content="${img}" />`,
      `<meta property="og:type" content="website" />`,
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:title" content="${title}" />`,
      `<meta name="twitter:description" content="${desc}" />`,
      `<meta name="twitter:image" content="${img}" />`,
    ];
    setOut(tags.join('\n'));
    toast.success('OG tags generated');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">Open Graph Generator</h1>
      <div className="space-y-2">
        <div><label className="block text-sm font-medium mb-1">Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputClass} /></div>
        <div><label className="block text-sm font-medium mb-1">Description</label><input type="text" value={desc} onChange={e => setDesc(e.target.value)} className={inputClass} /></div>
        <div><label className="block text-sm font-medium mb-1">URL</label><input type="text" value={url} onChange={e => setUrl(e.target.value)} className={inputClass} /></div>
        <div><label className="block text-sm font-medium mb-1">Image URL</label><input type="text" value={img} onChange={e => setImg(e.target.value)} className={inputClass} /></div>
      </div>
      <button onClick={gen} className={btnClass}>Generate OG Tags</button>
      <OutputBlock value={out} />
    </div>
  );
}

/** RFC 7636 PKCE code_verifier + code_challenge (S256). 
 *  Uses 48 bytes → 64 base64url chars (within 43-128 spec range).
 *  Challenge is SHA-256 of verifier, base64url-encoded per spec. */
export function OauthPkceGenerator() {
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);
  const generate = useCallback(async () => {
    setLoading(true);
    try {
      const bytes = crypto.getRandomValues(new Uint8Array(48));
      const verifier = btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
      const challenge = btoa(String.fromCharCode(...new Uint8Array(hash)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      setOut(`code_verifier (${verifier.length} chars):\n${verifier}\n\ncode_challenge (S256):\n${challenge}\n\nMethod: S256\nVerifier length: ${verifier.length} (RFC spec: 43-128) ✓`);
      toast.success('PKCE pair generated');
    } catch {
      toast.error('PKCE generation failed');
    } finally {
      setLoading(false);
    }
  }, []);
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">OAuth PKCE Generator</h1>
      <p className="text-sm text-[var(--text-secondary)]">Generates RFC 7636 OAuth PKCE code_verifier + code_challenge pair.</p>
      <ul className="text-xs text-[var(--text-muted)] space-y-1 list-disc pl-4">
        <li>48 random bytes → 64-char base64url verifier (spec: 43-128)</li>
        <li>SHA-256 hash → base64url-encoded challenge (S256 method)</li>
        <li>Output usable with any OAuth 2.0 PKCE-compliant provider</li>
      </ul>
      <button onClick={generate} disabled={loading} className={`${btnClass} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
        {loading ? 'Generating...' : 'Generate PKCE Pair'}
      </button>
      {out && <pre className={resultClass + ' max-h-64 overflow-y-auto'}>{out}</pre>}
    </div>
  );
}

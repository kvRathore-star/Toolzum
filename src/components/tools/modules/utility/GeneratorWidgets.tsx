"use client";
import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';
import { labelClass } from '../MiscToolsShared';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full p-6">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{title}</h2>
      {children}
    </div>
  );
}

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

function CountSlider({ value, onChange, max = 20 }: { value: number; onChange: (v: number) => void; max?: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[var(--text-secondary)]">Count</span>
      <input aria-label="Count" type="range" min={1} max={max} value={value} onChange={e => onChange(Number(e.target.value))} className="flex-1 h-1" />
      <span className="text-sm text-[var(--text-muted)] w-5 text-right">{value}</span>
    </div>
  );
}

function OutputBlock({ value }: { value: string }) {
  const { copied, copy } = useCopy();
  if (!value) return null;
  return (
    <div className="mt-3">
      <pre className="p-4 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">{value}</pre>
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

  const presets = [
    { label: '5 dates', apply: () => { setCount(5); gen(); } },
    { label: '10 dates', apply: () => { setCount(10); gen(); } },
    { label: '20 dates', apply: () => { setCount(20); gen(); } },
    { label: 'Clear', apply: () => { setOut(''); setCount(5); } },
  ];

  const resultText = out ? `Generated ${count} random dates` : 'Configure and generate';

  return (
    <CalculatorShell category="Utility" title="Random Date Generator" result={resultText} onCalculate={gen} calculateLabel="Generate" presets={presets} accent="indigo" downloadData={out} downloadFilename="random-dates.txt">
      <label className={labelClass}>Count</label>
      <CountSlider value={count} onChange={setCount} />

      {out && <OutputBlock value={out} />}
    </CalculatorShell>
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

  const presets = [
    { label: '5 times', apply: () => { setCount(5); gen(); } },
    { label: '10 times', apply: () => { setCount(10); gen(); } },
    { label: 'Clear', apply: () => { setOut(''); setCount(5); } },
  ];

  const resultText = out ? `Generated ${count} random times` : 'Configure and generate';

  return (
    <CalculatorShell category="Utility" title="Random Time Generator" result={resultText} onCalculate={gen} calculateLabel="Generate" presets={presets} accent="blue" downloadData={out} downloadFilename="random-times.txt">
      <label className={labelClass}>Count</label>
      <CountSlider value={count} onChange={setCount} />

      {out && <OutputBlock value={out} />}
    </CalculatorShell>
  );
}

export function RandomIpGenerator() {
  const [count, setCount] = useState(5);
  const [out, setOut] = useState('');
  const [version, setVersion] = useState<'ipv4' | 'ipv6'>('ipv4');

  const gen = () => {
    const lines = Array.from({ length: count }, () => {
      if (version === 'ipv4') {
        return `${randInt(1, 223)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`;
      } else {
        const h = Array.from({ length: 4 }, () => randInt(0, 65535).toString(16)).join(':');
        return `${h}::${randInt(1, 254).toString(16)}`;
      }
    });
    setOut(lines.join('\n'));
    toast.success('IPs generated');
  };

  const presets = [
    { label: '5 IPv4', apply: () => { setVersion('ipv4'); setCount(5); gen(); } },
    { label: '10 IPv4', apply: () => { setVersion('ipv4'); setCount(10); gen(); } },
    { label: '5 IPv6', apply: () => { setVersion('ipv6'); setCount(5); gen(); } },
    { label: 'Clear', apply: () => { setOut(''); setCount(5); } },
  ];

  const resultText = out ? `Generated ${count} ${version.toUpperCase()} addresses` : 'Configure and generate';

  return (
    <CalculatorShell category="Utility" title="Random IP Generator" result={resultText} onCalculate={gen} calculateLabel="Generate" presets={presets} accent="emerald" downloadData={out} downloadFilename="random-ips.txt">
      <div className="flex gap-2 mb-3">
        <label className="flex items-center gap-2">
          <input type="radio" value="ipv4" checked={version === 'ipv4'} onChange={() => setVersion('ipv4')} className="accent-emerald-500" />
          <span className="text-sm">IPv4</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" value="ipv6" checked={version === 'ipv6'} onChange={() => setVersion('ipv6')} className="accent-emerald-500" />
          <span className="text-sm">IPv6</span>
        </label>
      </div>

      <label className={labelClass}>Count</label>
      <CountSlider value={count} onChange={setCount} />

      {out && <OutputBlock value={out} />}
    </CalculatorShell>
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
  const [category, setCategory] = useState<'all' | 'desktop' | 'mobile'>('all');

  const desktopUAs = UA_LIST.slice(0, 4);
  const mobileUAs = UA_LIST.slice(4);

  const gen = () => {
    const pool = category === 'desktop' ? desktopUAs : category === 'mobile' ? mobileUAs : UA_LIST;
    const lines = Array.from({ length: count }, () => pool[randInt(0, pool.length - 1)]);
    setOut(lines.join('\n'));
    toast.success('User agents generated');
  };

  const presets = [
    { label: '5 Desktop', apply: () => { setCategory('desktop'); setCount(5); gen(); } },
    { label: '5 Mobile', apply: () => { setCategory('mobile'); setCount(5); gen(); } },
    { label: '10 Mixed', apply: () => { setCategory('all'); setCount(10); gen(); } },
    { label: 'Clear', apply: () => { setOut(''); setCount(5); setCategory('all'); } },
  ];

  const resultText = out ? `Generated ${count} user agents (${category})` : 'Configure and generate';

  return (
    <CalculatorShell category="Utility" title="Random User-Agent Generator" result={resultText} onCalculate={gen} calculateLabel="Generate" presets={presets} accent="purple" downloadData={out} downloadFilename="user-agents.txt">
      <div className="flex gap-2 mb-3">
        <label className="flex items-center gap-2">
          <input type="radio" value="all" checked={category === 'all'} onChange={() => setCategory('all')} className="accent-purple-500" />
          <span className="text-sm">All</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" value="desktop" checked={category === 'desktop'} onChange={() => setCategory('desktop')} className="accent-purple-500" />
          <span className="text-sm">Desktop</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" value="mobile" checked={category === 'mobile'} onChange={() => setCategory('mobile')} className="accent-purple-500" />
          <span className="text-sm">Mobile</span>
        </label>
      </div>

      <label className={labelClass}>Count</label>
      <CountSlider value={count} onChange={setCount} />

      {out && <OutputBlock value={out} />}
    </CalculatorShell>
  );
}

const WORDS = ['lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit','sed','do','eiusmod','tempor','incididunt','ut','labore','et','dolore','magna','aliqua','enim','ad','minim','veniam','quis','nostrud','exercitation','ullamco','laboris','nisi','aliquip','ex','ea','commodo','consequat','duis','aute','irure','in','reprehenderit','voluptate','velit','esse','cillum','eu','fugiat','nulla','pariatur','excepteur','sint','occaecat','cupidatat','non','proident','sunt','culpa','qui','officia','deserunt','mollit','anim','id','est','laborum'];

export function RandomSentenceGenerator() {
  const [count, setCount] = useState(5);
  const [out, setOut] = useState('');
  const [wordsPerSentence, setWordsPerSentence] = useState(8);

  const gen = () => {
    const lines = Array.from({ length: count }, () => {
      const wc = randInt(Math.max(3, wordsPerSentence - 2), wordsPerSentence + 2);
      const words = Array.from({ length: wc }, () => WORDS[randInt(0, WORDS.length - 1)]);
      return words[0].charAt(0).toUpperCase() + words.slice(1).join(' ') + '.';
    });
    setOut(lines.join('\n'));
    toast.success('Sentences generated');
  };

  const presets = [
    { label: '5 Short', apply: () => { setCount(5); setWordsPerSentence(6); gen(); } },
    { label: '10 Medium', apply: () => { setCount(10); setWordsPerSentence(10); gen(); } },
    { label: '5 Long', apply: () => { setCount(5); setWordsPerSentence(15); gen(); } },
    { label: 'Clear', apply: () => { setOut(''); setCount(5); setWordsPerSentence(8); } },
  ];

  const resultText = out ? `Generated ${count} sentences (${wordsPerSentence} words avg)` : 'Configure and generate';

  return (
    <CalculatorShell category="Utility" title="Random Sentence Generator" result={resultText} onCalculate={gen} calculateLabel="Generate" presets={presets} accent="indigo" downloadData={out} downloadFilename="random-sentences.txt">
      <label className={labelClass}>Count</label>
      <CountSlider value={count} onChange={setCount} max={50} />

      <label className={labelClass}>Words per sentence (avg)</label>
      <input aria-label="Words per sentence (avg)" type="range" min={3} max={20} value={wordsPerSentence} onChange={e => setWordsPerSentence(Number(e.target.value))} className="w-full accent-indigo-500" />
      <div className="text-xs text-[var(--text-muted)] text-right">{wordsPerSentence} words</div>

      {out && <OutputBlock value={out} />}
    </CalculatorShell>
  );
}

export function RandomWordGenerator() {
  const [count, setCount] = useState(10);
  const [out, setOut] = useState('');
  const [capitalize, setCapitalize] = useState(false);

  const gen = () => {
    setOut(Array.from({ length: count }, () => {
      const w = WORDS[randInt(0, WORDS.length - 1)];
      return capitalize ? w.charAt(0).toUpperCase() + w.slice(1) : w;
    }).join('\n'));
    toast.success('Words generated');
  };

  const presets = [
    { label: '10 lowercase', apply: () => { setCount(10); setCapitalize(false); gen(); } },
    { label: '10 Capitalized', apply: () => { setCount(10); setCapitalize(true); gen(); } },
    { label: '50 words', apply: () => { setCount(50); gen(); } },
    { label: 'Clear', apply: () => { setOut(''); setCount(10); } },
  ];

  const resultText = out ? `Generated ${count} words` : 'Configure and generate';

  return (
    <CalculatorShell category="Utility" title="Random Word Generator" result={resultText} onCalculate={gen} calculateLabel="Generate" presets={presets} accent="green" downloadData={out} downloadFilename="random-words.txt">
      <label className={labelClass}>Count</label>
      <CountSlider value={count} onChange={setCount} max={100} />

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={capitalize} onChange={e => setCapitalize(e.target.checked)} className="accent-green-500" />
        <span className="text-sm">Capitalize</span>
      </label>

      {out && <OutputBlock value={out} />}
    </CalculatorShell>
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

  const presets = [
    { label: '5 × 4-digit', apply: () => { setCount(5); setDigits(4); gen(); } },
    { label: '10 × 6-digit', apply: () => { setCount(10); setDigits(6); gen(); } },
    { label: '3 × 8-digit', apply: () => { setCount(3); setDigits(8); gen(); } },
    { label: '20 × 4-digit', apply: () => { setCount(20); setDigits(4); gen(); } },
  ];

  const resultText = out ? `Generated ${count} PINs (${digits} digits each)` : 'Configure and generate';

  return (
    <CalculatorShell category="Utility" title="PIN Generator" result={resultText} onCalculate={gen} calculateLabel="Generate" presets={presets} accent="blue" downloadData={out} downloadFilename="pins.txt">
      <div className="space-y-4">
        <label className={labelClass}>Count</label>
        <CountSlider value={count} onChange={setCount} />

        <label className={labelClass}>Digits</label>
        <div className="flex gap-1 flex-wrap">
          {[4, 5, 6, 8, 10].map(n => (
            <button key={n} onClick={() => { setDigits(n); gen(); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${digits === n ? 'bg-blue-600 text-white' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'}`}>
              {n}
            </button>
          ))}
        </div>

        {out && <OutputBlock value={out} />}
      </div>
    </CalculatorShell>
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

  const presets = [
    { label: '5 × Standard', apply: () => { setCount(5); setFormat('XXXXX-XXXXX-XXXXX-XXXXX'); gen(); } },
    { label: '10 × Compact', apply: () => { setCount(10); setFormat('XXXX-XXXX-XXXX'); gen(); } },
    { label: '3 × Long', apply: () => { setCount(3); setFormat('XXXXX-XXXXX-XXXXX-XXXXX-XXXXX'); gen(); } },
    { label: 'Custom', apply: () => { setFormat('XXXX-XXXX-XXXX-XXXX'); gen(); } },
  ];

  const resultText = out ? `Generated ${count} license keys` : 'Configure and generate';

  return (
    <CalculatorShell category="Utility" title="License Key Generator" result={resultText} onCalculate={gen} calculateLabel="Generate" presets={presets} accent="violet" downloadData={out} downloadFilename="license-keys.txt">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Count</label>
      <CountSlider value={count} onChange={setCount} />

      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Format (X = any char, - = separator)</label>
      <input aria-label="Format (X = any char, - = separator)" type="text" value={format} onChange={e => setFormat(e.target.value)} placeholder="XXXXX-XXXXX-XXXXX"
        className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-violet-500/50" />

      {out && <OutputBlock value={out} />}
    </CalculatorShell>
  );
}

const C_BG = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4','#84CC16'];
const C_PRODUCTS = ['Widget Pro','Basic Widget','Widget Max','Premium Widget','Widget Lite','Super Widget','Widget Plus'];

export function ImagePlaceholderGenerator() {
  const [count, setCount] = useState(3);
  const [out, setOut] = useState('');
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(300);

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

  const presets = [
    { label: '3 × 400×300', apply: () => { setCount(3); setWidth(400); setHeight(300); gen(); } },
    { label: '5 × 800×600', apply: () => { setCount(5); setWidth(800); setHeight(600); gen(); } },
    { label: '10 × 1920×1080', apply: () => { setCount(10); setWidth(1920); setHeight(1080); gen(); } },
    { label: 'Clear', apply: () => { setOut(''); setCount(3); } },
  ];

  const resultText = out ? `Generated ${count} SVG placeholders (${width}×${height})` : 'Configure and generate';

  return (
    <CalculatorShell category="Utility" title="Image Placeholder Generator" result={resultText} onCalculate={gen} calculateLabel="Generate" presets={presets} accent="cyan" downloadData={out} downloadFilename="placeholders.txt">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className={labelClass}>Width</label>
          <input aria-label="Width" type="number" min={50} max={2000} value={width} onChange={e => setWidth(Number(e.target.value))}
            className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-cyan-500/50" />
        </div>
        <div>
          <label className={labelClass}>Height</label>
          <input aria-label="Height" type="number" min={50} max={2000} value={height} onChange={e => setHeight(Number(e.target.value))}
            className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-cyan-500/50" />
        </div>
      </div>

      <label className={labelClass}>Count</label>
      <CountSlider value={count} onChange={setCount} />

      {out && <OutputBlock value={out} />}
    </CalculatorShell>
  );
}

export function LogoPlaceholderGenerator() {
  const [count, setCount] = useState(3);
  const [out, setOut] = useState('');
  const [size, setSize] = useState(120);

  const gen = () => {
    const lines = Array.from({ length: count }, () => {
      const brand = C_PRODUCTS[randInt(0, C_PRODUCTS.length - 1)];
      const initials = brand.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
      const sz = randInt(80, 200);
      const bg = C_BG[randInt(0, C_BG.length - 1)];
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}"><rect width="${sz}" height="${sz}" rx="${sz * 0.2}" fill="${bg}"/><text x="${sz / 2}" y="${sz / 2}" font-family="sans-serif" font-size="${sz * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
      return `${brand}: data:image/svg+xml;base64,${btoa(svg)}`;
    });
    setOut(lines.join('\n\n'));
    toast.success('Logo placeholders generated');
  };

  const presets = [
    { label: '3 × 120px', apply: () => { setCount(3); setSize(120); gen(); } },
    { label: '5 × 200px', apply: () => { setCount(5); setSize(200); gen(); } },
    { label: '10 × 100px', apply: () => { setCount(10); setSize(100); gen(); } },
    { label: 'Clear', apply: () => { setOut(''); setCount(3); } },
  ];

  const resultText = out ? `Generated ${count} logo placeholders (${size}px)` : 'Configure and generate';

  return (
    <CalculatorShell category="Utility" title="Logo Placeholder Generator" result={resultText} onCalculate={gen} calculateLabel="Generate" presets={presets} accent="pink" downloadData={out} downloadFilename="logos.txt">
      <label className={labelClass}>Size (px)</label>
      <input aria-label="Size (px)" type="range" min={50} max={300} value={size} onChange={e => setSize(Number(e.target.value))} className="w-full accent-pink-500 mb-2" />
      <div className="text-xs text-[var(--text-muted)] text-right mb-3">{size}px</div>

      <label className={labelClass}>Count</label>
      <CountSlider value={count} onChange={setCount} />

      {out && <OutputBlock value={out} />}
    </CalculatorShell>
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

  const presets = [
    { label: 'Blog Post', apply: () => { setTitle('My Blog Post'); setDesc('An interesting article about web development'); setUrl('https://example.com/blog/post'); setImg('https://example.com/blog-image.jpg'); } },
    { label: 'Product Page', apply: () => { setTitle('Amazing Product'); setDesc('The best product you will ever buy'); setUrl('https://shop.example.com/product'); setImg('https://shop.example.com/product.jpg'); } },
    { label: 'Landing Page', apply: () => { setTitle('Welcome to Our Site'); setDesc('Discover amazing features and benefits'); setUrl('https://example.com'); setImg('https://example.com/hero.jpg'); } },
    { label: 'Clear', apply: () => { setOut(''); } },
  ];

  const resultText = out ? 'Open Graph tags generated' : 'Enter details to generate OG tags';

  return (
    <CalculatorShell category="Utility" title="Open Graph Generator" result={resultText} onCalculate={gen} calculateLabel="Generate" presets={presets} accent="indigo" downloadData={out} downloadFilename="og-tags.html">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Title</label>
        <input aria-label="Title" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="My Amazing Website"
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-indigo-500/50" />

        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Description</label>
        <input aria-label="Description" type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Discover the best content..."
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-indigo-500/50" />

        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">URL</label>
        <input aria-label="URL" type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com"
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-indigo-500/50" />

        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Image URL</label>
        <input aria-label="Image URL" type="url" value={img} onChange={e => setImg(e.target.value)} placeholder="https://example.com/image.jpg"
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-indigo-500/50" />

        {out && <OutputBlock value={out} />}
      </div>
    </CalculatorShell>
  );
}

/** RFC 7636 PKCE code_verifier + code_challenge (S256). 
 *  Uses 48 bytes → 64 base64url chars (within 43-128 spec range).
 *  Challenge is SHA-256 of verifier, base64url-encoded per spec. */
export function OauthPkceGenerator() {
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifier, setVerifier] = useState('');
  const [challenge, setChallenge] = useState('');

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
      setVerifier(verifier);
      setChallenge(challenge);
      setOut(`code_verifier (${verifier.length} chars):\n${verifier}\n\ncode_challenge (S256):\n${challenge}\n\nMethod: S256\nVerifier length: ${verifier.length} (RFC spec: 43-128) ✓`);
      toast.success('PKCE pair generated');
    } catch {
      toast.error('PKCE generation failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const presets = [
    { label: 'Generate', apply: () => generate() },
    { label: 'Copy Verifier', apply: () => { if (verifier) clipboardWrite(verifier); toast.success('Verifier copied'); } },
    { label: 'Copy Challenge', apply: () => { if (challenge) clipboardWrite(challenge); toast.success('Challenge copied'); } },
    { label: 'Clear', apply: () => { setOut(''); setVerifier(''); setChallenge(''); } },
  ];

  const resultText = out ? `PKCE pair generated (${verifier.length} char verifier)` : 'Generate RFC 7636 PKCE pair';

  return (
    <CalculatorShell category="Utility" title="OAuth PKCE Generator" result={resultText} auto={true} presets={presets} accent="violet" downloadData={out} downloadFilename="pkce.txt">
      <div className="space-y-4">
        <p className="text-sm text-[var(--text-secondary)]">Generates RFC 7636 OAuth PKCE code_verifier + code_challenge pair.</p>
        <ul className="text-xs text-[var(--text-muted)] space-y-1 list-disc pl-4">
          <li>48 random bytes → 64-char base64url verifier (spec: 43-128)</li>
          <li>SHA-256 hash → base64url-encoded challenge (S256 method)</li>
          <li>Output usable with any OAuth 2.0 PKCE-compliant provider</li>
        </ul>
        <button onClick={generate} disabled={loading} className={`w-full px-5 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
          {loading ? 'Generating...' : 'Generate PKCE Pair'}
        </button>
        {out && <pre className="p-4 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">{out}</pre>}
      </div>
    </CalculatorShell>
  );
}

"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { User, Shuffle, FileText, Globe } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'fake' | 'random' | 'text' | 'web';

export default function GeneratorToolkit() {
  const [tab, setTab] = useState<Tab>('fake');
  const TabBtn = ({ v, label, icon: Icon }: { v: Tab; label: string; icon: React.ElementType }) => (
    <button onClick={() => setTab(v)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${tab === v ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );
  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2">
        <TabBtn v="fake" label="Fake Identity" icon={User} />
        <TabBtn v="random" label="Random Values" icon={Shuffle} />
        <TabBtn v="text" label="Text & Security" icon={FileText} />
        <TabBtn v="web" label="Web/SEO" icon={Globe} />
      </div>
      {tab === 'fake' && <FakeIdentity />}
      {tab === 'random' && <RandomValues />}
      {tab === 'text' && <TextSecurity />}
      {tab === 'web' && <WebSeo />}
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

const Sel = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) => (
  <div className="flex items-center gap-1.5">
    <label className="text-[10px] text-zinc-500 shrink-0">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)}
      className="flex-1 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-1.5 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500">
      {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  </div>
);

function Output({ value }: { value: string }) {
  if (!value) return null;
  return (
    <div className="relative">
      <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 max-h-32 overflow-y-auto text-emerald-600 dark:text-emerald-400 break-all whitespace-pre-wrap">{value}</pre>
      <button onClick={() => { clipboardWrite(value); toast.success('Copied!'); }} className="text-[10px] text-blue-500 hover:underline mt-0.5">Copy</button>
    </div>
  );
}

function RangeInput({ label, value, onChange, min, max }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-zinc-500 shrink-0">{label}</span>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} className="flex-1 h-1" />
      <span className="text-[10px] text-zinc-400 w-5 text-right">{value}</span>
    </div>
  );
}

const FIRST_NAMES = ['James','Mary','John','Patricia','Robert','Jennifer','Michael','Linda','David','Elizabeth','William','Barbara','Richard','Susan','Joseph','Jessica','Thomas','Sarah','Charles','Karen','Christopher','Lisa','Daniel','Nancy','Matthew','Betty','Anthony','Margaret','Mark','Sandra','Donald','Ashley','Steven','Kimberly','Paul','Emily','Andrew','Donna','Joshua','Michelle'];
const LAST_NAMES = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson'];
const CITIES = ['New York','Los Angeles','Chicago','Houston','Phoenix','Philadelphia','San Antonio','San Diego','Dallas','San Jose','Austin','Jacksonville','Fort Worth','Columbus','Charlotte','Indianapolis','San Francisco','Seattle','Denver','Nashville'];
const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];
const STREETS = ['Main St','Oak Ave','Elm St','Maple Dr','Cedar Ln','Pine Rd','Birch Way','Walnut Ct','Cherry Blvd','Park Ave','Broadway','Highland Dr','Sunset Blvd','River Rd','Lake Dr','Hill St','Forest Ave','View Dr','Spring St','Church St'];
const DOMAINS = ['gmail.com','yahoo.com','outlook.com','hotmail.com','example.com','mail.com','proton.me','icloud.com'];
const WORDS = ['lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit','sed','do','eiusmod','tempor','incididunt','ut','labore','et','dolore','magna','aliqua','enim','ad','minim','veniam','quis','nostrud','exercitation','ullamco','laboris','nisi','aliquip','ex','ea','commodo','consequat','duis','aute','irure','in','reprehenderit','voluptate','velit','esse','cillum','eu','fugiat','nulla','pariatur','excepteur','sint','occaecat','cupidatat','non','proident','sunt','culpa','qui','officia','deserunt','mollit','anim','id','est','laborum'];
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
  'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Edge/120.0.0.0',
];
const PRODUCTS = ['Widget Pro','Basic Widget','Widget Max','Premium Widget','Widget Lite','Super Widget','Widget Plus','Widget Elite','Widget Mini','Widget X'];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN<T>(arr: T[], n: number): T[] { const s = new Set<T>(); while (s.size < Math.min(n, arr.length)) s.add(pick(arr)); return [...s]; }
function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min: number, max: number, dec = 2): string { return (Math.random() * (max - min) + min).toFixed(dec); }

function FakeIdentity() {
  const [count, setCount] = useState(3);
  const [out, setOut] = useState('');

  const genAddress = () => {
    const lines: string[] = [];
    for (let i = 0; i < count; i++) {
      const street = `${randInt(100, 9999)} ${pick(STREETS)}`;
      const city = pick(CITIES);
      const state = pick(STATES);
      const zip = `${randInt(10000, 99999)}`;
      lines.push(`${street}\n${city}, ${state} ${zip}`);
    }
    setOut(lines.join('\n\n'));
    toast.success(`Generated ${count} address(es)`);
  };

  const genEmail = () => {
    const lines = Array.from({ length: count }, () => {
      const fn = pick(FIRST_NAMES).toLowerCase();
      const ln = pick(LAST_NAMES).toLowerCase();
      const num = randInt(1, 999);
      return `${fn}.${ln}${num}@${pick(DOMAINS)}`;
    });
    setOut(lines.join('\n'));
    toast.success(`Generated ${count} email(s)`);
  };

  const genName = () => {
    const lines = Array.from({ length: count }, () => `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`);
    setOut(lines.join('\n'));
    toast.success(`Generated ${count} name(s)`);
  };

  const genPerson = () => {
    const lines = Array.from({ length: count }, () => {
      const fn = pick(FIRST_NAMES);
      const ln = pick(LAST_NAMES);
      const age = randInt(18, 80);
      const gender = pick(['Male', 'Female']);
      const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${randInt(1, 99)}@${pick(DOMAINS)}`;
      const phone = `(${randInt(200, 999)}) ${randInt(200, 999)}-${randInt(1000, 9999)}`;
      const street = `${randInt(100, 9999)} ${pick(STREETS)}`;
      const city = pick(CITIES);
      return `Name: ${fn} ${ln}\nAge: ${age}\nGender: ${gender}\nEmail: ${email}\nPhone: ${phone}\nAddress: ${street}, ${city}, ${pick(STATES)} ${randInt(10000, 99999)}`;
    });
    setOut(lines.join('\n\n'));
    toast.success(`Generated ${count} person profile(s)`);
  };

  const genPhone = () => {
    const formats = ['(XXX) XXX-XXXX', 'XXX-XXX-XXXX', '+1-XXX-XXX-XXXX', 'XXX.XXX.XXXX'];
    const lines = Array.from({ length: count }, () => {
      const fmt = pick(formats);
      return fmt.replace(/X/g, () => String(randInt(0, 9)));
    });
    setOut(lines.join('\n'));
    toast.success(`Generated ${count} phone number(s)`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <Card title="Fake Address Generator">
        <RangeInput label="Count" value={count} onChange={setCount} min={1} max={20} />
        <CalcBtn onClick={genAddress} label="Generate Addresses" />
      </Card>
      <Card title="Fake Email Generator">
        <RangeInput label="Count" value={count} onChange={setCount} min={1} max={20} />
        <CalcBtn onClick={genEmail} label="Generate Emails" />
      </Card>
      <Card title="Fake Name Generator">
        <RangeInput label="Count" value={count} onChange={setCount} min={1} max={20} />
        <CalcBtn onClick={genName} label="Generate Names" />
      </Card>
      <Card title="Fake Person Generator">
        <RangeInput label="Count" value={count} onChange={setCount} min={1} max={20} />
        <CalcBtn onClick={genPerson} label="Generate Persons" />
      </Card>
      <Card title="Fake Phone Generator">
        <RangeInput label="Count" value={count} onChange={setCount} min={1} max={20} />
        <CalcBtn onClick={genPhone} label="Generate Phones" />
      </Card>
      {out && <div className="md:col-span-2 lg:col-span-3"><Output value={out} /></div>}
    </div>
  );
}

function RandomValues() {
  const [count, setCount] = useState(5);
  const [out, setOut] = useState('');

  const genColor = () => {
    const lines = Array.from({ length: count }, () => {
      const r = randInt(0, 255), g = randInt(0, 255), b = randInt(0, 255);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')} → rgb(${r},${g},${b})`;
    });
    setOut(lines.join('\n'));
    toast.success('Colors generated');
  };

  const genDate = () => {
    const lines = Array.from({ length: count }, () => {
      const d = new Date(Date.now() - randInt(0, 365 * 5) * 86400000);
      return d.toISOString().split('T')[0] + ' (' + d.toDateString() + ')';
    });
    setOut(lines.join('\n'));
    toast.success('Dates generated');
  };

  const genTime = () => {
    const lines = Array.from({ length: count }, () => {
      const h = String(randInt(0, 23)).padStart(2, '0');
      const m = String(randInt(0, 59)).padStart(2, '0');
      const s = String(randInt(0, 59)).padStart(2, '0');
      return `${h}:${m}:${s} (${+h % 12 || 12}:${m} ${+h < 12 ? 'AM' : 'PM'})`;
    });
    setOut(lines.join('\n'));
    toast.success('Times generated');
  };

  const genIp = () => {
    const lines = Array.from({ length: count }, () => {
      if (Math.random() > 0.5) return `${randInt(1, 223)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`;
      const h = Array.from({ length: 4 }, () => randInt(0, 65535).toString(16)).join(':');
      return `${h}::${randInt(1, 254).toString(16)}`;
    });
    setOut(lines.join('\n'));
    toast.success('IPs generated');
  };

  const genUa = () => {
    setOut(Array.from({ length: count }, () => pick(USER_AGENTS)).join('\n'));
    toast.success('User agents generated');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <Card title="Random Color Generator">
        <RangeInput label="Count" value={count} onChange={setCount} min={1} max={20} />
        <CalcBtn onClick={genColor} label="Generate Colors" />
      </Card>
      <Card title="Random Date Generator">
        <RangeInput label="Count" value={count} onChange={setCount} min={1} max={20} />
        <CalcBtn onClick={genDate} label="Generate Dates" />
      </Card>
      <Card title="Random Time Generator">
        <RangeInput label="Count" value={count} onChange={setCount} min={1} max={20} />
        <CalcBtn onClick={genTime} label="Generate Times" />
      </Card>
      <Card title="Random IP Generator">
        <RangeInput label="Count" value={count} onChange={setCount} min={1} max={20} />
        <CalcBtn onClick={genIp} label="Generate IPs" />
      </Card>
      <Card title="Random User-Agent Generator">
        <RangeInput label="Count" value={count} onChange={setCount} min={1} max={20} />
        <CalcBtn onClick={genUa} label="Generate UAs" />
      </Card>
      {out && <div className="md:col-span-2 lg:col-span-3"><Output value={out} /></div>}
    </div>
  );
}

function TextSecurity() {
  const [count, setCount] = useState(3);
  const [out, setOut] = useState('');
  const [pinLen, setPinLen] = useState(6);
  const [licFormat, setLicFormat] = useState('XXXXX-XXXXX-XXXXX-XXXXX');

  const genParagraph = () => {
    const lines = Array.from({ length: count }, () => {
      const sentenceCount = randInt(3, 7);
      return Array.from({ length: sentenceCount }, () => {
        const wordCount = randInt(5, 15);
        const words = Array.from({ length: wordCount }, () => pick(WORDS));
        return words[0].charAt(0).toUpperCase() + words.slice(0).join(' ') + '.';
      }).join(' ');
    });
    setOut(lines.join('\n\n'));
    toast.success('Paragraphs generated');
  };

  const genSentence = () => {
    const lines = Array.from({ length: count }, () => {
      const wordCount = randInt(5, 12);
      const words = Array.from({ length: wordCount }, () => pick(WORDS));
      return words[0].charAt(0).toUpperCase() + words.slice(0).join(' ') + '.';
    });
    setOut(lines.join('\n'));
    toast.success('Sentences generated');
  };

  const genWord = () => {
    setOut(Array.from({ length: count }, () => pick(WORDS)).join('\n'));
    toast.success('Words generated');
  };

  const genPin = () => {
    const lines = Array.from({ length: count }, () =>
      Array.from({ length: pinLen }, () => randInt(0, 9)).join('')
    );
    setOut(lines.join('\n'));
    toast.success('PINs generated');
  };

  const genLicense = () => {
    const lines = Array.from({ length: count }, () =>
      licFormat.replace(/X/g, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[randInt(0, 35)])
    );
    setOut(lines.join('\n'));
    toast.success('License keys generated');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <Card title="Random Paragraph Generator">
        <RangeInput label="Count" value={count} onChange={setCount} min={1} max={10} />
        <CalcBtn onClick={genParagraph} label="Generate Paragraphs" />
      </Card>
      <Card title="Random Sentence Generator">
        <RangeInput label="Count" value={count} onChange={setCount} min={1} max={20} />
        <CalcBtn onClick={genSentence} label="Generate Sentences" />
      </Card>
      <Card title="Random Word Generator">
        <RangeInput label="Count" value={count} onChange={setCount} min={1} max={30} />
        <CalcBtn onClick={genWord} label="Generate Words" />
      </Card>
      <Card title="PIN Generator">
        <RangeInput label="Count" value={count} onChange={setCount} min={1} max={20} />
        <Sel label="Digits"
          value={String(pinLen)} onChange={v => setPinLen(Number(v))}
          options={[{v:'4',l:'4'},{v:'5',l:'5'},{v:'6',l:'6'},{v:'8',l:'8'},{v:'10',l:'10'}]} />
        <CalcBtn onClick={genPin} label="Generate PINs" />
      </Card>
      <Card title="License Key Generator">
        <RangeInput label="Count" value={count} onChange={setCount} min={1} max={20} />
        <Inp label="Format" value={licFormat} onChange={setLicFormat} placeholder="XXXXX-XXXXX-XXXXX" />
        <CalcBtn onClick={genLicense} label="Generate Keys" />
      </Card>
      {out && <div className="md:col-span-2 lg:col-span-3"><Output value={out} /></div>}
    </div>
  );
}

function WebSeo() {
  const [count, setCount] = useState(3);
  const [out, setOut] = useState('');
  const [ogTitle, setOgTitle] = useState('My Amazing Website');
  const [ogDesc, setOgDesc] = useState('Discover the best content on this amazing website.');
  const [ogUrl, setOgUrl] = useState('https://example.com');
  const [ogImage, setOgImage] = useState('https://example.com/image.jpg');
  const [prodName, setProdName] = useState('Widget Pro');
  const [prodPrice, setProdPrice] = useState('29.99');
  const [prodCurrency, setProdCurrency] = useState('USD');

  const genPlaceholder = () => {
    const lines = Array.from({ length: count }, () => {
      const w = randInt(100, 800);
      const h = randInt(100, 600);
      const bg = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899'][randInt(0, 5)];
      const fg = '#FFFFFF';
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${bg}"/><text x="${w / 2}" y="${h / 2}" font-family="sans-serif" font-size="14" fill="${fg}" text-anchor="middle" dominant-baseline="middle">${w}×${h}</text></svg>`;
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    });
    setOut(lines.join('\n\n'));
    toast.success('Placeholders generated');
  };

  const genLogo = () => {
    const lines = Array.from({ length: count }, () => {
      const brand = pick(PRODUCTS);
      const initials = brand.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const size = randInt(80, 200);
      const bg = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4','#84CC16'][randInt(0, 7)];
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="${size * 0.2}" fill="${bg}"/><text x="${size / 2}" y="${size / 2}" font-family="sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
      return `${brand}: data:image/svg+xml;base64,${btoa(svg)}`;
    });
    setOut(lines.join('\n\n'));
    toast.success('Logo placeholders generated');
  };

  const genOg = () => {
    const tags = [
      `<meta property="og:title" content="${ogTitle}" />`,
      `<meta property="og:description" content="${ogDesc}" />`,
      `<meta property="og:url" content="${ogUrl}" />`,
      `<meta property="og:image" content="${ogImage}" />`,
      `<meta property="og:type" content="website" />`,
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:title" content="${ogTitle}" />`,
      `<meta name="twitter:description" content="${ogDesc}" />`,
      `<meta name="twitter:image" content="${ogImage}" />`,
    ];
    setOut(tags.join('\n'));
    toast.success('OG tags generated');
  };

  const genSchema = () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": prodName || 'Product',
      "description": `High-quality ${prodName || 'product'} for your needs.`,
      "offers": {
        "@type": "Offer",
        "price": prodPrice || '0',
        "priceCurrency": prodCurrency || 'USD',
        "availability": "https://schema.org/InStock",
      },
    };
    setOut(JSON.stringify(schema, null, 2));
    toast.success('Product schema generated');
  };

  const genPkce = async () => {
    const verifier = btoa(crypto.getRandomValues(new Uint8Array(32)).reduce((s, b) => s + String.fromCharCode(b), '')).replace(/[+/=]/g, '').slice(0, 128);
    const challenge = btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    setOut(`Verifier: ${verifier}\nChallenge: ${challenge}\nMethod: S256`);
    toast.success('PKCE pair generated');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <Card title="Image Placeholder Generator">
        <RangeInput label="Count" value={count} onChange={setCount} min={1} max={10} />
        <p className="text-[10px] text-zinc-400">SVG placeholders as base64 data URIs</p>
        <CalcBtn onClick={genPlaceholder} label="Generate Placeholders" />
      </Card>
      <Card title="Logo Placeholder Generator">
        <RangeInput label="Count" value={count} onChange={setCount} min={1} max={10} />
        <p className="text-[10px] text-zinc-400">Branded SVG logos with random colors</p>
        <CalcBtn onClick={genLogo} label="Generate Logos" />
      </Card>
      <Card title="Open Graph Generator">
        <Inp label="Title" value={ogTitle} onChange={setOgTitle} />
        <Inp label="Description" value={ogDesc} onChange={setOgDesc} />
        <Inp label="URL" value={ogUrl} onChange={setOgUrl} />
        <Inp label="Image" value={ogImage} onChange={setOgImage} />
        <CalcBtn onClick={genOg} label="Generate OG Tags" />
      </Card>
      <Card title="Product Schema Generator">
        <Inp label="Name" value={prodName} onChange={setProdName} />
        <Inp label="Price" value={prodPrice} onChange={setProdPrice} />
        <Sel label="Currency" value={prodCurrency} onChange={setProdCurrency}
          options={[{v:'USD',l:'USD'},{v:'EUR',l:'EUR'},{v:'GBP',l:'GBP'},{v:'INR',l:'INR'},{v:'JPY',l:'JPY'},{v:'AUD',l:'AUD'},{v:'CAD',l:'CAD'}]} />
        <CalcBtn onClick={genSchema} label="Generate Schema" />
      </Card>
      <Card title="OAuth PKCE Generator">
        <p className="text-[10px] text-zinc-400">Generates code_verifier + code_challenge (S256)</p>
        <CalcBtn onClick={genPkce} label="Generate PKCE Pair" />
      </Card>
      {out && <div className="md:col-span-2 lg:col-span-3"><Output value={out} /></div>}
    </div>
  );
}

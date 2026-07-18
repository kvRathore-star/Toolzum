"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { ExternalLink } from 'lucide-react';

type Tab = 'calc' | 'size' | 'image' | 'pdf';

const TABS: { key: Tab; label: string }[] = [
  { key: 'calc', label: 'Calculators' },
  { key: 'size', label: 'Size Converters' },
  { key: 'image', label: 'Image Convert' },
  { key: 'pdf', label: 'PDF & ZIP' },
];

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 ${className}`}>{children}</div>;
}

export default function CalcFileKit() {
  const [tab, setTab] = useState<Tab>('calc');

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${tab === t.key ? 'bg-blue-600 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}>{t.label}</button>
        ))}
      </div>
      {tab === 'calc' && <CalcTools />}
      {tab === 'size' && <SizeTools />}
      {tab === 'image' && <ImageTools />}
      {tab === 'pdf' && <PdfZipTools />}
    </div>
  );
}

function CalcCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <Card className={className}>
      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-3 text-sm">{title}</h4>
      {children}
    </Card>
  );
}

const LinkCard = ({ title, slug, desc }: { title: string; slug: string; desc: string }) => (
  <Link href={`/tools/${slug}`} className="block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all group">
    <div className="flex items-center gap-1">
      <h5 className="text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:underline">{title}</h5>
      <ExternalLink className="w-3 h-3 text-blue-400 shrink-0" />
    </div>
    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
  </Link>
);

function CalcTools() {
  const [studyHrs, setStudyHrs] = useState('3');
  const [studyDays, setStudyDays] = useState('30');
  const [studyResult, setStudyResult] = useState('');

  const calcStudyTime = () => {
    const hrs = parseFloat(studyHrs) * parseInt(studyDays);
    const weeks = Math.round(hrs / (parseFloat(studyHrs) * 7));
    setStudyResult(`Total: ${hrs} hours over ${studyDays} days\nDaily: ${parseFloat(studyHrs).toFixed(1)}h/day\n~${Math.round(hrs / 30)} months at this pace`);
  };

  const [scoreCorrect, setScoreCorrect] = useState('85');
  const [scoreTotal, setScoreTotal] = useState('100');
  const [scoreResult, setScoreResult] = useState('');

  const calcTestScore = () => {
    const pct = (parseInt(scoreCorrect) / parseInt(scoreTotal)) * 100;
    const grade = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F';
    setScoreResult(`Score: ${scoreCorrect}/${scoreTotal} = ${pct.toFixed(1)}%\nGrade: ${grade}`);
  };

  const [wppWords, setWppWords] = useState('500');
  const [wppFont, setWppFont] = useState('12');
  const [wppResult, setWppResult] = useState('');

  const calcWpp = () => {
    const words = parseInt(wppWords);
    const fontSize = parseFloat(wppFont);
    const wordsPerPage = fontSize <= 10 ? 600 : fontSize <= 12 ? 500 : fontSize <= 14 ? 400 : 300;
    const pages = Math.ceil(words / wordsPerPage);
    setWppResult(`~${wordsPerPage} words/page at ${fontSize}pt\n${words} words ≈ ${pages} page${pages > 1 ? 's' : ''}`);
  };

  const [wcRevenue, setWcRevenue] = useState('100000');
  const [wcCogs, setWcCogs] = useState('60000');
  const [wcOpExp, setWcOpExp] = useState('25000');
  const [wcResult, setWcResult] = useState('');

  const calcWorkingCapital = () => {
    const rev = parseFloat(wcRevenue);
    const cogs = parseFloat(wcCogs);
    const op = parseFloat(wcOpExp);
    const grossProfit = rev - cogs;
    const netIncome = grossProfit - op;
    const margin = (netIncome / rev) * 100;
    setWcResult(`Gross Profit: $${grossProfit.toLocaleString()}\nNet Income: $${netIncome.toLocaleString()}\nMargin: ${margin.toFixed(1)}%`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <CalcCard title="Study Time Calculator">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input type="number" value={studyHrs} onChange={e => setStudyHrs(e.target.value)} placeholder="Hours/day" className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
          <input type="number" value={studyDays} onChange={e => setStudyDays(e.target.value)} placeholder="Total days" className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button onClick={calcStudyTime} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Calculate</button>
        {studyResult && <pre className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-mono whitespace-pre">{studyResult}</pre>}
      </CalcCard>
      <CalcCard title="Test Score Calculator">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input type="number" value={scoreCorrect} onChange={e => setScoreCorrect(e.target.value)} placeholder="Correct" className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
          <input type="number" value={scoreTotal} onChange={e => setScoreTotal(e.target.value)} placeholder="Total" className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button onClick={calcTestScore} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Calculate</button>
        {scoreResult && <pre className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-mono whitespace-pre">{scoreResult}</pre>}
      </CalcCard>
      <LinkCard title="Tip Calculator" slug="tip-calculator" desc="Calculate tip amount, split bills among multiple people, and see total cost including tip percentage." />
      <LinkCard title="Triangle Area Calculator" slug="triangle-area-calculator" desc="Calculate triangle area from base and height. Quick geometry reference for engineering and design." />
      <LinkCard title="Volume Converter" slug="volume-converter" desc="Convert between liters, gallons, cups, fluid ounces, and more volume units with precision." />
      <CalcCard title="Words Per Page Calculator">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input type="number" value={wppWords} onChange={e => setWppWords(e.target.value)} placeholder="Word count" className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
          <select value={wppFont} onChange={e => setWppFont(e.target.value)} className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm">
            {[8, 9, 10, 11, 12, 14, 16, 18].map(s => <option key={s} value={s}>{s}pt</option>)}
          </select>
        </div>
        <button onClick={calcWpp} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Calculate</button>
        {wppResult && <pre className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-mono whitespace-pre">{wppResult}</pre>}
      </CalcCard>
      <CalcCard title="Working Capital Calculator" className="md:col-span-2">
        <div className="grid grid-cols-3 gap-2 mb-2">
          <input type="number" value={wcRevenue} onChange={e => setWcRevenue(e.target.value)} placeholder="Revenue $" className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
          <input type="number" value={wcCogs} onChange={e => setWcCogs(e.target.value)} placeholder="COGS" className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
          <input type="number" value={wcOpExp} onChange={e => setWcOpExp(e.target.value)} placeholder="Operating Exp." className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button onClick={calcWorkingCapital} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Calculate</button>
        {wcResult && <pre className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-mono whitespace-pre">{wcResult}</pre>}
      </CalcCard>
      <LinkCard title="Pythagorean Theorem Calculator" slug="pythagorean-theorem-calculator" desc="Calculate the hypotenuse of a right triangle from the lengths of the other two sides." />
      <LinkCard title="Scientific Calculator" slug="scientific-calculator" desc="Full scientific calculator with sin, cos, tan, log, sqrt, and basic arithmetic operations." />
    </div>
  );
}

function SizeTools() {
  const [ringMm, setRingMm] = useState('16.5');
  const [ringResult, setRingResult] = useState('');

  const ringSizes: Record<string, number> = {
    'US 3': 14.1, 'US 3.5': 14.5, 'US 4': 14.9, 'US 4.5': 15.3, 'US 5': 15.7,
    'US 5.5': 16.1, 'US 6': 16.5, 'US 6.5': 16.9, 'US 7': 17.3, 'US 7.5': 17.7,
    'US 8': 18.1, 'US 8.5': 18.5, 'US 9': 18.9, 'US 9.5': 19.4, 'US 10': 19.8,
    'US 10.5': 20.2, 'US 11': 20.6, 'US 11.5': 21.0, 'US 12': 21.4, 'US 13': 22.2,
  };

  const calcRingSize = () => {
    const mm = parseFloat(ringMm);
    let closest = '';
    let minDiff = Infinity;
    for (const [size, dia] of Object.entries(ringSizes)) {
      const diff = Math.abs(mm - dia);
      if (diff < minDiff) { minDiff = diff; closest = size; }
    }
    setRingResult(`${mm}mm ≈ ${closest} (inner diameter ~${ringSizes[closest]}mm)`);
  };

  const [screenDiag, setScreenDiag] = useState('15.6');
  const [screenRatio, setScreenRatio] = useState('16:9');
  const [screenResult, setScreenResult] = useState('');

  const calcScreenSize = () => {
    const diag = parseFloat(screenDiag);
    const [wR, hR] = screenRatio.split(':').map(Number);
    const h = diag / Math.sqrt(1 + (wR / hR) ** 2);
    const w = h * (wR / hR);
    const area = w * h;
    setScreenResult(`${diag}" ${screenRatio}\nWidth: ${w.toFixed(1)}"\nHeight: ${h.toFixed(1)}"\nArea: ${area.toFixed(1)} sq in`);
  };

  const [shoeSize, setShoeSize] = useState('9');
  const [shoeFrom, setShoeFrom] = useState('US');
  const [shoeResult, setShoeResult] = useState('');

  const shoeSizes: Record<string, Record<string, string>> = {
    'US': { '5': 'UK 4.5', '6': 'UK 5.5', '7': 'UK 6.5', '8': 'UK 7.5', '9': 'UK 8.5', '10': 'UK 9.5', '11': 'UK 10.5', '12': 'UK 11.5' },
  };
  shoeSizes['UK'] = Object.fromEntries(Object.entries(shoeSizes['US']).map(([k, v]) => {
    const match = v.match(/[\d.]+/);
    return [match ? match[0] : k, `US ${k}`];
  }));

  const convertShoe = () => {
    const sizes = shoeSizes[shoeFrom] || shoeSizes['US'];
    const converted = sizes[shoeSize] || 'Unknown';
    setShoeResult(`US ${shoeFrom === 'US' ? shoeSize : ''} → ${converted} (approx)`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <CalcCard title="Ring Size Converter">
        <input type="number" value={ringMm} onChange={e => setRingMm(e.target.value)} step={0.1} placeholder="Inner diameter (mm)" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm mb-2" />
        <button onClick={calcRingSize} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Convert</button>
        {ringResult && <pre className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-mono whitespace-pre">{ringResult}</pre>}
      </CalcCard>
      <CalcCard title="Screen Size Converter">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input type="number" value={screenDiag} onChange={e => setScreenDiag(e.target.value)} step={0.1} placeholder="Diagonal (inches)" className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
          <select value={screenRatio} onChange={e => setScreenRatio(e.target.value)} className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm">
            {['16:9', '16:10', '4:3', '3:2', '21:9'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <button onClick={calcScreenSize} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Calculate</button>
        {screenResult && <pre className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-mono whitespace-pre">{screenResult}</pre>}
      </CalcCard>
      <CalcCard title="Shoe Size Converter" className="md:col-span-2">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input type="number" value={shoeSize} onChange={e => setShoeSize(e.target.value)} min={1} max={20} placeholder="Size" className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
          <select value={shoeFrom} onChange={e => setShoeFrom(e.target.value)} className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm">
            <option value="US">US → UK</option>
            <option value="UK">UK → US</option>
          </select>
        </div>
        <button onClick={convertShoe} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Convert</button>
        {shoeResult && <pre className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-mono whitespace-pre">{shoeResult}</pre>}
      </CalcCard>
    </div>
  );
}

function ImageTools() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <p className="md:col-span-2 text-sm text-zinc-400 text-center">Image conversion tools removed — use the standalone converter.</p>
    </div>
  );
}

function PdfZipTools() {
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [zipContents, setZipContents] = useState('');

  const extractZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setZipFile(file);
    try {
      const { unzip } = await import('fflate');
      const buf = await file.arrayBuffer();
      const data = new Uint8Array(buf);
      const files: Record<string, Uint8Array> = {};
      unzip(data, (err, unzipped) => {
        if (err) { setZipContents('Error unzipping file.'); return; }
        Object.assign(files, unzipped);
        const names = Object.keys(files);
        setZipContents(`ZIP contains ${names.length} file(s):\n${names.map(n => `  • ${n} (${files[n].length} bytes)`).join('\n')}`);
      });
    } catch { setZipContents('ZIP extraction requires a real ZIP file. On the web, uses fflate library.'); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="md:col-span-2">
        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">ZIP File Extractor</h4>
        <input type="file" accept=".zip" onChange={extractZip} className="w-full text-xs mb-2" />
        {zipContents && <textarea readOnly rows={6} value={zipContents} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
      </Card>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

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

  const [billAmt, setBillAmt] = useState('100');
  const [tipPct, setTipPct] = useState('15');
  const [splitBy, setSplitBy] = useState('1');
  const [tipResult, setTipResult] = useState('');

  const calcTip = () => {
    const bill = parseFloat(billAmt);
    const pct = parseFloat(tipPct);
    const split = parseInt(splitBy);
    const tip = bill * (pct / 100);
    const total = bill + tip;
    const perPerson = total / split;
    setTipResult(`Tip: $${tip.toFixed(2)}\nTotal: $${total.toFixed(2)}\n${split > 1 ? `Per Person: $${perPerson.toFixed(2)}` : ''}`);
  };

  const [triA, setTriA] = useState('3');
  const [triB, setTriB] = useState('4');
  const [triResult, setTriResult] = useState('');

  const calcTriangle = () => {
    const a = parseFloat(triA), b = parseFloat(triB);
    const c = Math.sqrt(a * a + b * b);
    const area = (a * b) / 2;
    const perimeter = a + b + c;
    setTriResult(`Hypotenuse: ${c.toFixed(2)}\nArea: ${area.toFixed(2)}\nPerimeter: ${perimeter.toFixed(2)}`);
  };

  const [volVal, setVolVal] = useState('1');
  const [volFrom, setVolFrom] = useState('0');
  const [volTo, setVolTo] = useState('1');
  const [volResult, setVolResult] = useState('');

  const volUnits: { label: string; toBase: (v: number) => number; fromBase: (v: number) => number }[] = [
    { label: 'Liter (L)', toBase: (v: number) => v, fromBase: (v: number) => v },
    { label: 'Milliliter (mL)', toBase: (v: number) => v / 1000, fromBase: (v: number) => v * 1000 },
    { label: 'Gallon (US)', toBase: (v: number) => v * 3.78541, fromBase: (v: number) => v / 3.78541 },
    { label: 'Quart (US)', toBase: (v: number) => v * 0.946353, fromBase: (v: number) => v / 0.946353 },
    { label: 'Cup (US)', toBase: (v: number) => v * 0.236588, fromBase: (v: number) => v / 0.236588 },
    { label: 'Fluid Ounce (US)', toBase: (v: number) => v * 0.0295735, fromBase: (v: number) => v / 0.0295735 },
    { label: 'Cubic Meter', toBase: (v: number) => v * 1000, fromBase: (v: number) => v / 1000 },
    { label: 'Cubic Foot', toBase: (v: number) => v * 28.3168, fromBase: (v: number) => v / 28.3168 },
  ];

  const convertVolume = () => {
    const num = parseFloat(volVal);
    const base = volUnits[parseInt(volFrom)].toBase(num);
    const result = volUnits[parseInt(volTo)].fromBase(base);
    setVolResult(`${num} ${volUnits[parseInt(volFrom)].label} = ${result.toFixed(4)} ${volUnits[parseInt(volTo)].label}`);
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

  const [pythA, setPythA] = useState('3');
  const [pythB, setPythB] = useState('4');
  const [pythResult, setPythResult] = useState('');

  const calcPythagorean = () => {
    const a = parseFloat(pythA), b = parseFloat(pythB);
    const c = Math.sqrt(a * a + b * b);
    const area = (a * b) / 2;
    setPythResult(`Hypotenuse: ${c.toFixed(4)}\nArea: ${area.toFixed(4)}\nSum of squares: ${a}² + ${b}² = ${(a*a + b*b).toFixed(2)}`);
  };

  const [sciDisplay, setSciDisplay] = useState('0');
  const [sciMemory, setSciMemory] = useState<number | null>(null);
  const [sciOp, setSciOp] = useState<string | null>(null);

  const sciPress = (val: string) => {
    if (val === 'C') { setSciDisplay('0'); setSciMemory(null); setSciOp(null); return; }
    if (val === '±') { setSciDisplay(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev); return; }
    if (val === '%') { setSciDisplay(prev => String(parseFloat(prev) / 100)); return; }
    if (['+','-','×','÷'].includes(val)) {
      setSciMemory(parseFloat(sciDisplay));
      setSciOp(val);
      setSciDisplay('0');
      return;
    }
    if (val === '=') {
      if (sciMemory === null || !sciOp) return;
      const cur = parseFloat(sciDisplay);
      let result = 0;
      switch (sciOp) {
        case '+': result = sciMemory + cur; break;
        case '-': result = sciMemory - cur; break;
        case '×': result = sciMemory * cur; break;
        case '÷': result = sciMemory / cur; break;
      }
      setSciDisplay(String(result));
      setSciMemory(null);
      setSciOp(null);
      return;
    }
    if (val === 'x²') { setSciDisplay(prev => String(Math.pow(parseFloat(prev), 2))); return; }
    if (val === '√') { setSciDisplay(prev => String(Math.sqrt(parseFloat(prev)))); return; }
    if (val === '1/x') { const v = parseFloat(sciDisplay); setSciDisplay(v !== 0 ? String(1 / v) : 'Error'); return; }
    if (val === 'sin') { setSciDisplay(prev => String(Math.sin(parseFloat(prev) * Math.PI / 180))); return; }
    if (val === 'cos') { setSciDisplay(prev => String(Math.cos(parseFloat(prev) * Math.PI / 180))); return; }
    if (val === 'tan') { setSciDisplay(prev => { const v = parseFloat(prev) * Math.PI / 180; return Math.abs(Math.cos(v)) < 1e-10 ? 'Error' : String(Math.tan(v)); }); return; }
    if (val === 'ln') { setSciDisplay(prev => String(Math.log(parseFloat(prev)))); return; }
    if (val === 'log') { setSciDisplay(prev => String(Math.log10(parseFloat(prev)))); return; }
    if (val === 'π') { setSciDisplay(String(Math.PI)); return; }
    if (val === 'e') { setSciDisplay(String(Math.E)); return; }
    if (val === '!') {
      const n = parseInt(sciDisplay);
      if (n < 0 || n > 170) { setSciDisplay('Error'); return; }
      let f = 1; for (let i = 2; i <= n; i++) f *= i;
      setSciDisplay(String(f));
      return;
    }
    // Number or decimal
    if (val === '.' && sciDisplay.includes('.')) return;
    setSciDisplay(prev => prev === '0' && val !== '.' ? val : prev + val);
  };

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
      <CalcCard title="Tip Calculator">
        <div className="grid grid-cols-3 gap-2 mb-2">
          <input type="number" value={billAmt} onChange={e => setBillAmt(e.target.value)} placeholder="Bill $" className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
          <input type="number" value={tipPct} onChange={e => setTipPct(e.target.value)} placeholder="Tip %" className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
          <input type="number" value={splitBy} onChange={e => setSplitBy(e.target.value)} min={1} placeholder="Split" className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button onClick={calcTip} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Calculate</button>
        {tipResult && <pre className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-mono whitespace-pre">{tipResult}</pre>}
      </CalcCard>
      <CalcCard title="Triangle Calculator">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input type="number" value={triA} onChange={e => setTriA(e.target.value)} placeholder="Side A" className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
          <input type="number" value={triB} onChange={e => setTriB(e.target.value)} placeholder="Side B" className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button onClick={calcTriangle} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Calculate</button>
        {triResult && <pre className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-mono whitespace-pre">{triResult}</pre>}
      </CalcCard>
      <CalcCard title="Volume Converter">
        <div className="grid grid-cols-3 gap-2 mb-2">
          <input type="number" value={volVal} onChange={e => setVolVal(e.target.value)} className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
          <select value={volFrom} onChange={e => setVolFrom(e.target.value)} className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-xs">
            {volUnits.map((u, i) => <option key={i} value={i}>{u.label}</option>)}
          </select>
          <select value={volTo} onChange={e => setVolTo(e.target.value)} className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-xs">
            {volUnits.map((u, i) => <option key={i} value={i}>{u.label}</option>)}
          </select>
        </div>
        <button onClick={convertVolume} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Convert</button>
        {volResult && <pre className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-mono whitespace-pre">{volResult}</pre>}
      </CalcCard>
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
      <CalcCard title="Pythagorean Theorem">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input type="number" value={pythA} onChange={e => setPythA(e.target.value)} placeholder="Side a" className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
          <input type="number" value={pythB} onChange={e => setPythB(e.target.value)} placeholder="Side b" className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button onClick={calcPythagorean} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Calculate</button>
        {pythResult && <pre className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-mono whitespace-pre">{pythResult}</pre>}
      </CalcCard>
      <CalcCard title="Scientific Calculator" className="md:col-span-2">
        <div className="mb-2">
          <div className="w-full bg-zinc-900 text-green-400 font-mono text-right px-3 py-3 rounded-lg text-xl mb-2 h-10 overflow-hidden">{sciDisplay}</div>
          <div className="grid grid-cols-5 gap-1">
            {['C','±','%','÷','sin','7','8','9','×','cos','4','5','6','-','tan','1','2','3','+','ln','0','.','π','=','log','x²','√','1/x','!','e'].map(b => (
              <button key={b} onClick={() => sciPress(b)}
                className={`text-xs font-bold py-2 rounded ${
                  ['+','-','×','÷','='].includes(b) ? 'bg-blue-600 hover:bg-blue-500 text-white' :
                  ['C'].includes(b) ? 'bg-red-600 hover:bg-red-500 text-white' :
                  b === '=' ? 'bg-green-600 hover:bg-green-500 text-white col-span-1' :
                  'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >{b}</button>
            ))}
          </div>
        </div>
      </CalcCard>
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
  const [previewWebp, setPreviewWebp] = useState('');
  const [previewJpg, setPreviewJpg] = useState('');
  const [info, setInfo] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, format: 'webp' | 'jpeg') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        if (blob) {
          if (format === 'webp') setPreviewWebp(URL.createObjectURL(blob));
          else setPreviewJpg(URL.createObjectURL(blob));
          setInfo(`Original: ${(file.size / 1024).toFixed(1)} KB → ${format.toUpperCase()}: ${(blob.size / 1024).toFixed(1)} KB (${img.naturalWidth}x${img.naturalHeight})`);
        }
      }, `image/${format}`, 0.85);
    };
    img.src = url;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">WebP → JPG</h4><input type="file" accept="image/webp,image/png,image/jpeg" onChange={e => handleFile(e, 'jpeg')} className="w-full text-xs mb-2" />{previewJpg && <img src={previewJpg} alt="JPG preview" className="w-full max-h-40 object-contain rounded-lg bg-zinc-100" />}</Card>
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">WebP → PNG</h4><input type="file" accept="image/webp,image/jpeg,image/png" onChange={e => handleFile(e, 'webp')} className="w-full text-xs mb-2" />{previewWebp && <img src={previewWebp} alt="WebP preview" className="w-full max-h-40 object-contain rounded-lg bg-zinc-100" />}</Card>
      {info && <div className="md:col-span-2 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-mono text-center">{info}</div>}
    </div>
  );
}

function PdfZipTools() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfAction, setPdfAction] = useState<'remove' | 'reorder'>('remove');
  const [pageRange, setPageRange] = useState('1');
  const [newOrder, setNewOrder] = useState('3,1,2');
  const [pdfResult, setPdfResult] = useState('');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [zipContents, setZipContents] = useState('');

  const handlePdfFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPdfFile(file);
  };

  const processPdf = async () => {
    if (!pdfFile) return;
    try {
      const { PDFDocument } = await import('pdf-lib');
      const buf = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buf);
      const totalPages = pdfDoc.getPageCount();

      if (pdfAction === 'remove') {
        const removePages = pageRange.split(',').map(s => parseInt(s.trim()) - 1).filter(n => n >= 0 && n < totalPages);
        const indices = Array.from({ length: totalPages }, (_, i) => i).filter(i => !removePages.includes(i));
        const newDoc = await PDFDocument.create();
        const pages = await newDoc.copyPages(pdfDoc, indices);
        pages.forEach(p => newDoc.addPage(p));
        const bytes = await newDoc.save();
        const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
        setPdfResult(`Removed ${removePages.length} page(s). ${totalPages} → ${pages.length} pages. Ready for download.`);
        downloadBlob(blob, `modified_${pdfFile.name}`);
      } else {
        const order = newOrder.split(',').map(s => parseInt(s.trim()) - 1).filter(n => n >= 0 && n < totalPages);
        if (order.length === 0) { toast.error('Invalid page order'); return; }
        const newDoc = await PDFDocument.create();
        const pages = await newDoc.copyPages(pdfDoc, order);
        pages.forEach(p => newDoc.addPage(p));
        const bytes = await newDoc.save();
        const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
        setPdfResult(`Reordered. ${totalPages} pages → ${pages.length} pages. Ready for download.`);
        downloadBlob(blob, `reordered_${pdfFile.name}`);
      }
    } catch { toast.error('Failed to process PDF'); }
  };

  const downloadBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };

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
        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-3">PDF Page Operations</h4>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button onClick={() => setPdfAction('remove')} className={`py-2 rounded-lg text-sm font-bold ${pdfAction === 'remove' ? 'bg-red-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600'}`}>Remove Pages</button>
          <button onClick={() => setPdfAction('reorder')} className={`py-2 rounded-lg text-sm font-bold ${pdfAction === 'reorder' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600'}`}>Reorder Pages</button>
        </div>
        <input type="file" accept=".pdf" onChange={handlePdfFile} className="w-full text-xs mb-2" />
        {pdfFile && (
          <div className="space-y-2">
            <p className="text-xs text-zinc-400">{pdfFile.name} ({(pdfFile.size / 1024).toFixed(1)} KB)</p>
            {pdfAction === 'remove' ? (
              <input type="text" value={pageRange} onChange={e => setPageRange(e.target.value)} placeholder="Page numbers to remove (e.g. 1,3,5)" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono" />
            ) : (
              <input type="text" value={newOrder} onChange={e => setNewOrder(e.target.value)} placeholder="New order (e.g. 3,1,2)" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono" />
            )}
            <button onClick={processPdf} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Apply</button>
          </div>
        )}
        {pdfResult && <p className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs">{pdfResult}</p>}
      </Card>
      <Card className="md:col-span-2">
        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">ZIP File Extractor</h4>
        <input type="file" accept=".zip" onChange={extractZip} className="w-full text-xs mb-2" />
        {zipContents && <textarea readOnly rows={6} value={zipContents} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
      </Card>
    </div>
  );
}

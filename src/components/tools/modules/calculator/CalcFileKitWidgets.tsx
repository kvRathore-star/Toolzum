"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

export function StudyTimeCalculator() {
  const [hrs, setHrs] = useState('3');
  const [days, setDays] = useState('30');
  const [result, setResult] = useState('');

  const calc = () => {
    const h = parseFloat(hrs);
    const d = parseInt(days);
    if (!Number.isFinite(h) || !Number.isFinite(d) || h <= 0 || d <= 0) {
      setResult('Enter positive hours and days.');
      return;
    }
    const total = h * d;
    setResult(`Total: ${total} hours over ${d} days\nDaily: ${h.toFixed(1)}h/day\n~${Math.round(total / 30)} months at this pace`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Study Time Calculator</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="lbl-calcfilekitwidgets-hours-per-day" className="text-xs text-[var(--text-secondary)] mb-1 block">Hours per day</label>
            <input id="lbl-calcfilekitwidgets-hours-per-day" aria-label="Hours per day" type="number" value={hrs} onChange={e => setHrs(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="lbl-calcfilekitwidgets-total-days" className="text-xs text-[var(--text-secondary)] mb-1 block">Total days</label>
            <input id="lbl-calcfilekitwidgets-total-days" aria-label="Total days" type="number" value={days} onChange={e => setDays(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Calculate</button>
        {result && <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{result}</pre>}
      </div>
    </div>
  );
}

export function TestScoreCalculator() {
  const [correct, setCorrect] = useState('85');
  const [total, setTotal] = useState('100');
  const [result, setResult] = useState('');

  const calc = () => {
    const c = parseInt(correct);
    const t = parseInt(total);
    if (!Number.isFinite(c) || !Number.isFinite(t) || t <= 0 || c < 0) {
      setResult('Enter valid numbers — total questions must be above zero.');
      return;
    }
    if (c > t) {
      setResult('Correct answers cannot exceed total questions.');
      return;
    }
    const pct = (c / t) * 100;
    const grade = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F';
    setResult(`Score: ${c}/${t} = ${pct.toFixed(1)}%\nGrade: ${grade}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Test Score Calculator</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="lbl-calcfilekitwidgets-correct-answers" className="text-xs text-[var(--text-secondary)] mb-1 block">Correct answers</label>
            <input id="lbl-calcfilekitwidgets-correct-answers" aria-label="Correct answers" type="number" value={correct} onChange={e => setCorrect(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="lbl-calcfilekitwidgets-total-questions" className="text-xs text-[var(--text-secondary)] mb-1 block">Total questions</label>
            <input id="lbl-calcfilekitwidgets-total-questions" aria-label="Total questions" type="number" value={total} onChange={e => setTotal(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Calculate</button>
        {result && <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{result}</pre>}
      </div>
    </div>
  );
}

export function WordsPerPageCalculator() {
  const [words, setWords] = useState('500');
  const [fontSize, setFontSize] = useState('12');
  const [result, setResult] = useState('');

  const calc = () => {
    const w = parseInt(words);
    const fs = parseFloat(fontSize);
    if (!Number.isFinite(w) || w <= 0) { setResult('Enter a positive word count.'); return; }
    const wpp = fs <= 10 ? 600 : fs <= 12 ? 500 : fs <= 14 ? 400 : 300;
    const pages = Math.ceil(w / wpp);
    setResult(`~${wpp} words/page at ${fontSize}pt\n${w} words = ${pages} page${pages > 1 ? 's' : ''}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Words Per Page Calculator</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="lbl-calcfilekitwidgets-word-count" className="text-xs text-[var(--text-secondary)] mb-1 block">Word count</label>
            <input id="lbl-calcfilekitwidgets-word-count" aria-label="Word count" type="number" value={words} onChange={e => setWords(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="lbl-calcfilekitwidgets-font-size" className="text-xs text-[var(--text-secondary)] mb-1 block">Font size</label>
            <select id="lbl-calcfilekitwidgets-font-size" aria-label="Font size" value={fontSize} onChange={e => setFontSize(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm">
              {[8, 9, 10, 11, 12, 14, 16, 18].map(s => <option key={s} value={s}>{s}pt</option>)}
            </select>
          </div>
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Calculate</button>
        {result && <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{result}</pre>}
      </div>
    </div>
  );
}

export function ProfitLossCalculator() {
  const [revenue, setRevenue] = useState('100000');
  const [cogs, setCogs] = useState('60000');
  const [opExp, setOpExp] = useState('25000');
  const [result, setResult] = useState('');

  const calc = () => {
    const rev = parseFloat(revenue);
    const c = parseFloat(cogs);
    const op = parseFloat(opExp);
    if (!Number.isFinite(rev) || rev === 0) { setResult('Revenue must be a non-zero number.'); return; }
    const grossProfit = rev - c;
    const netIncome = grossProfit - op;
    const margin = (netIncome / rev) * 100;
    setResult(`Gross Profit: $${grossProfit.toLocaleString()}\nNet Income: $${netIncome.toLocaleString()}\nMargin: ${margin.toFixed(1)}%`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Working Capital Calculator</h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="lbl-calcfilekitwidgets-revenue" className="text-xs text-[var(--text-secondary)] mb-1 block">Revenue ($)</label>
            <input id="lbl-calcfilekitwidgets-revenue" aria-label="Revenue ($)" type="number" value={revenue} onChange={e => setRevenue(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="lbl-calcfilekitwidgets-cogs" className="text-xs text-[var(--text-secondary)] mb-1 block">COGS ($)</label>
            <input id="lbl-calcfilekitwidgets-cogs" aria-label="COGS ($)" type="number" value={cogs} onChange={e => setCogs(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="lbl-calcfilekitwidgets-operating-exp" className="text-xs text-[var(--text-secondary)] mb-1 block">Operating Exp ($)</label>
            <input id="lbl-calcfilekitwidgets-operating-exp" aria-label="Operating Exp ($)" type="number" value={opExp} onChange={e => setOpExp(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Calculate</button>
        {result && <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{result}</pre>}
      </div>
    </div>
  );
}

export function RingSizeConverter() {
  const [mm, setMm] = useState('16.5');
  const [result, setResult] = useState('');

  const ringSizes: Record<string, number> = {
    'US 3': 14.1, 'US 3.5': 14.5, 'US 4': 14.9, 'US 4.5': 15.3, 'US 5': 15.7,
    'US 5.5': 16.1, 'US 6': 16.5, 'US 6.5': 16.9, 'US 7': 17.3, 'US 7.5': 17.7,
    'US 8': 18.1, 'US 8.5': 18.5, 'US 9': 18.9, 'US 9.5': 19.4, 'US 10': 19.8,
    'US 10.5': 20.2, 'US 11': 20.6, 'US 11.5': 21.0, 'US 12': 21.4, 'US 13': 22.2,
  };

  const convert = () => {
    const d = parseFloat(mm);
    let closest = '';
    let minDiff = Infinity;
    for (const [size, dia] of Object.entries(ringSizes)) {
      const diff = Math.abs(d - dia);
      if (diff < minDiff) { minDiff = diff; closest = size; }
    }
    setResult(`${mm}mm = ${closest} (inner diameter ~${ringSizes[closest]}mm)`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Ring Size Converter</h2>
        <div>
          <label htmlFor="lbl-calcfilekitwidgets-inner-diameter-mm" className="text-xs text-[var(--text-secondary)] mb-1 block">Inner diameter (mm)</label>
          <input id="lbl-calcfilekitwidgets-inner-diameter-mm" aria-label="Inner diameter (mm)" type="number" value={mm} onChange={e => setMm(e.target.value)} step={0.1}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm" />
        </div>
        <button onClick={convert} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Convert</button>
        {result && <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{result}</pre>}
      </div>
    </div>
  );
}

export function ScreenSizeConverter() {
  const [diag, setDiag] = useState('15.6');
  const [ratio, setRatio] = useState('16:9');
  const [result, setResult] = useState('');

  const calc = () => {
    const d = parseFloat(diag);
    const [wR, hR] = ratio.split(':').map(Number);
    const h = d / Math.sqrt(1 + (wR! / hR!) ** 2);
    const w = h * (wR! / hR!);
    const area = w * h;
    setResult(`${diag}" ${ratio}\nWidth: ${w.toFixed(1)}"\nHeight: ${h.toFixed(1)}"\nArea: ${area.toFixed(1)} sq in`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Screen Size Calculator</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="lbl-calcfilekitwidgets-diagonal-inches" className="text-xs text-[var(--text-secondary)] mb-1 block">Diagonal (inches)</label>
            <input id="lbl-calcfilekitwidgets-diagonal-inches" aria-label="Diagonal (inches)" type="number" value={diag} onChange={e => setDiag(e.target.value)} step={0.1}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="lbl-calcfilekitwidgets-aspect-ratio" className="text-xs text-[var(--text-secondary)] mb-1 block">Aspect ratio</label>
            <select id="lbl-calcfilekitwidgets-aspect-ratio" aria-label="Aspect ratio" value={ratio} onChange={e => setRatio(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm">
              {['16:9', '16:10', '4:3', '3:2', '21:9'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Calculate</button>
        {result && <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{result}</pre>}
      </div>
    </div>
  );
}

export function ShoeSizeConverter() {
  const [size, setSize] = useState('9');
  const [from, setFrom] = useState('US');
  const [result, setResult] = useState('');

  const shoeSizes: Record<string, Record<string, string>> = {
    'US': { '5': 'UK 4.5', '6': 'UK 5.5', '7': 'UK 6.5', '8': 'UK 7.5', '9': 'UK 8.5', '10': 'UK 9.5', '11': 'UK 10.5', '12': 'UK 11.5' },
  };
  shoeSizes['UK'] = Object.fromEntries(Object.entries(shoeSizes['US']!).map(([k, v]) => {
    const match = v.match(/[\d.]+/);
    return [match ? match[0] : k, `US ${k}`];
  }));

  const convert = () => {
    const sizes = shoeSizes[from] || shoeSizes['US'];
    const converted = sizes![size] || 'Unknown';
    setResult(`${from} ${size} = ${converted} (approx)`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Shoe Size Converter</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="lbl-calcfilekitwidgets-size" className="text-xs text-[var(--text-secondary)] mb-1 block">Size</label>
            <input id="lbl-calcfilekitwidgets-size" aria-label="Size" type="number" value={size} onChange={e => setSize(e.target.value)} min={1} max={20}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="lbl-calcfilekitwidgets-from" className="text-xs text-[var(--text-secondary)] mb-1 block">Shoe size system</label>
            <select id="lbl-calcfilekitwidgets-from" aria-label="Shoe size system" value={from} onChange={e => setFrom(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm">
              <option value="US">US to UK</option>
              <option value="UK">UK to US</option>
            </select>
          </div>
        </div>
        <button onClick={convert} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Convert</button>
        {result && <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{result}</pre>}
      </div>
    </div>
  );
}

export function ZipFileExtractor() {
  const [contents, setContents] = useState('');

  const extract = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { unzip } = await import('fflate');
      const buf = await file.arrayBuffer();
      const data = new Uint8Array(buf);
      const files: Record<string, Uint8Array> = {};
      unzip(data, (err, unzipped) => {
        if (err) { setContents('Error unzipping file.'); return; }
        Object.assign(files, unzipped);
        const names = Object.keys(files);
        setContents(`ZIP contains ${names.length} file(s):\n${names.map(n => `  - ${n} (${files[n]!.length} bytes)`).join('\n')}`);
      });
    } catch { setContents('Failed to extract ZIP file.'); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">ZIP File Extractor</h2>
        <p className="text-xs text-[var(--text-secondary)]">Select a ZIP file to view its contents.</p>
        <input aria-label="ZIP file" type="file" accept=".zip" onChange={extract} className="w-full text-xs" />
        {contents && <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{contents}</pre>}
      </div>
    </div>
  );
}

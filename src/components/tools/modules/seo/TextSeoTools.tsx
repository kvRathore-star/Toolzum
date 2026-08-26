"use client";
import React, { useState } from 'react';
import NextLink from 'next/link';
import { Copy, Download, Hash, Type, BarChart3, Search, FileText, Globe, Edit3, ListOrdered, GitCompare, ArrowLeftRight, SpellCheck, Scissors, Trash2, Link, Rows3, Sigma } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import DOMPurify from 'dompurify';
import { CalculatorShell } from '../shared/CalculatorShell';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full bg-[var(--bg-overlay)] rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] p-6">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", rows, min, max }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; rows?: number; min?: number; max?: number;
}) {
  const cls = "w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50";
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>
      {rows ? (
        <textarea className={cls + " resize-y"} rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input className={cls} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} min={min} max={max} />
      )}
    </div>
  );
}

// === 1. WordCounter ===
export function WordCounter() {
  const [text, setText] = useState('');
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, '').length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length;
  const readingTime = words > 0 ? Math.ceil(words / 200) : 0;
  const speakingTime = words > 0 ? Math.ceil(words / 150) : 0;

  const presets = [
    { label: 'Lorem Ipsum', apply: () => setText('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.') },
    { label: 'Short (~50 words)', apply: () => setText('This is a short sample text with about fifty words to demonstrate the word counter functionality. It includes several sentences and a few paragraphs.') },
    { label: 'Medium (~200 words)', apply: () => setText('The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet. It is commonly used for font testing and keyboard practice. The sentence has thirty-five letters and nine words. Many variations exist, but this is the most famous one. In typography, pangrams help designers see how fonts render all characters. They also serve as test data for text processing algorithms.') },
    { label: 'Clear', apply: () => setText('') },
  ];

  const resultText = words > 0
    ? `${words} words, ${chars} chars, ${sentences} sentences, ${paragraphs} paragraphs, ${readingTime}m read`
    : 'No text entered';

  const stats = [
    { label: 'Words', value: words, color: 'text-emerald-500' },
    { label: 'Characters', value: chars, color: 'text-blue-700 dark:text-blue-400' },
    { label: 'No Spaces', value: charsNoSpace, color: 'text-violet-500' },
    { label: 'Sentences', value: sentences, color: 'text-amber-500' },
    { label: 'Paragraphs', value: paragraphs, color: 'text-rose-500' },
    { label: 'Read Time', value: `${readingTime}m`, color: 'text-cyan-500', suffix: ` / ${speakingTime}m speak` },
  ];

  return (
    <CalculatorShell title="Word Counter" result={resultText} onCalculate={() => {}} calculateLabel="Count" presets={presets} accent="emerald" downloadData={JSON.stringify({ words, chars, charsNoSpace, sentences, paragraphs, readingTime, speakingTime }, null, 2)} downloadFilename="word-count.json">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text</label>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={10} placeholder="Paste or type your text here..."
            className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-y" />
        </div>

        {text && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {stats.map((s, i) => (
              <div key={i} className="p-3 bg-[var(--bg-surface)] rounded-xl text-center border border-zinc-200 dark:border-zinc-700">
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}{s.suffix || ''}</p>
                <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {text && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-zinc-200 dark:border-zinc-700">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Character Composition</div>
            <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden flex">
              {chars > 0 && <>
                <div style={{ width: `${(charsNoSpace / chars) * 100}%` }} className="bg-emerald-500 h-full" title="Non-space" />
                <div style={{ width: `${((chars - charsNoSpace) / chars) * 100}%` }} className="bg-zinc-400 h-full" title="Spaces" />
              </>}
            </div>
            <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
              <span>Non-space: {charsNoSpace}</span>
              <span>Spaces: {chars - charsNoSpace}</span>
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}

// === 2. CharacterCounter ===
export function CharacterCounter() {
  const [text, setText] = useState('');
  const total = text.length;
  const noSpace = text.replace(/\s/g, '').length;
  const letters = (text.match(/[a-zA-Z]/g) || []).length;
  const digits = (text.match(/[0-9]/g) || []).length;
  const spaces = (text.match(/\s/g) || []).length;
  const punctuation = (text.match(/[^\w\s]/g) || []).length;
  const uppercase = (text.match(/[A-Z]/g) || []).length;
  const lowercase = (text.match(/[a-z]/g) || []).length;

  const presets = [
    { label: 'Lorem Ipsum', apply: () => setText('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.') },
    { label: 'Code Sample', apply: () => setText('function hello() {\n  console.log("Hello, World!");\n  return 42;\n}') },
    { label: 'Email', apply: () => setText('user.name+tag@example-domain.com') },
    { label: 'Clear', apply: () => setText('') },
  ];

  const resultText = total > 0
    ? `${total} chars (${noSpace} no space), ${letters} letters, ${digits} digits, ${spaces} spaces, ${punctuation} punct`
    : 'No text entered';

  const stats = [
    { label: 'Total', value: total, color: 'text-zinc-600 dark:text-zinc-400' },
    { label: 'No Spaces', value: noSpace, color: 'text-emerald-500' },
    { label: 'Letters', value: letters, color: 'text-blue-700 dark:text-blue-400', sub: `↑${uppercase} ↓${lowercase}` },
    { label: 'Digits', value: digits, color: 'text-amber-500' },
    { label: 'Spaces', value: spaces, color: 'text-cyan-500' },
    { label: 'Punctuation', value: punctuation, color: 'text-rose-500' },
  ];

  return (
    <CalculatorShell title="Character Counter" result={resultText} onCalculate={() => {}} calculateLabel="Count" presets={presets} accent="sky" downloadData={JSON.stringify({ total, noSpace, letters, uppercase, lowercase, digits, spaces, punctuation }, null, 2)} downloadFilename="char-count.json">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text</label>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={10} placeholder="Type or paste text..."
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-y" />

        {text && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {stats.map((s, i) => (
              <div key={i} className="p-3 bg-[var(--bg-surface)] rounded-xl text-center border border-zinc-200 dark:border-zinc-700">
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
                {s.sub && <p className="text-[10px] text-[var(--text-muted)]">{s.sub}</p>}
              </div>
            ))}
          </div>
        )}

        {total > 0 && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-zinc-200 dark:border-zinc-700">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Composition</div>
            <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden flex">
              {letters > 0 && <div style={{ width: `${(letters / total) * 100}%` }} className="bg-blue-500 h-full" title="Letters" />}
              {digits > 0 && <div style={{ width: `${(digits / total) * 100}%` }} className="bg-amber-500 h-full" title="Digits" />}
              {spaces > 0 && <div style={{ width: `${(spaces / total) * 100}%` }} className="bg-cyan-500 h-full" title="Spaces" />}
              {punctuation > 0 && <div style={{ width: `${(punctuation / total) * 100}%` }} className="bg-rose-500 h-full" title="Punctuation" />}
            </div>
            <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
              <span>Letters: {letters}</span>
              <span>Digits: {digits}</span>
              <span>Spaces: {spaces}</span>
              <span>Punct: {punctuation}</span>
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}

// === 3. WordFrequencyCounter ===
export function WordFrequencyCounter() {
  const [text, setText] = useState('');
  const [limit, setLimit] = useState(20);
  const [frequencies, setFrequencies] = useState<{ word: string; count: number; pct: number }[]>([]);

  const analyze = () => {
    const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
    const freq: Record<string, number> = {};
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    const total = words.length;
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([word, count]) => ({ word, count, pct: (count / total) * 100 }));
    setFrequencies(sorted);
  };

  const maxCount = frequencies.length > 0 ? frequencies[0].count : 1;
  const totalWords = frequencies.reduce((sum, f) => sum + f.count, 0);

  const presets = [
    { label: 'Lorem Ipsum', apply: () => { setText('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'); } },
    { label: 'Repeated Words', apply: () => { setText('the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog the quick brown fox'); } },
    { label: 'Clear', apply: () => { setText(''); setFrequencies([]); } },
  ];

  const resultText = frequencies.length > 0
    ? `Top ${frequencies.length} words from ${totalWords} total words`
    : 'Enter text and analyze';

  return (
    <CalculatorShell title="Word Frequency Counter" result={resultText} onCalculate={analyze} calculateLabel="Count" presets={presets} accent="indigo" downloadData={frequencies.length > 0 ? JSON.stringify({ totalWords, topWords: frequencies }, null, 2) : ''} downloadFilename="word-frequency.json">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text</label>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={6} placeholder="Paste text to analyze..."
            className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y" />
        </div>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Show Top</label>
            <input type="number" min={5} max={100} value={String(limit)} onChange={v => setLimit(Number(v.target.value))}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          </div>
          <button onClick={analyze} className="self-end px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-colors">Analyze</button>
        </div>

        {frequencies.length > 0 && (
          <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
            <div className="max-h-[400px] overflow-y-auto space-y-1.5">
              {frequencies.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-[var(--bg-overlay)] rounded-lg text-sm">
                  <span className="w-6 text-xs text-[var(--text-muted)] font-bold">{i + 1}</span>
                  <span className="flex-1 font-medium">{f.word}</span>
                  <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div style={{ width: `${(f.count / maxCount) * 100}%` }} className="bg-emerald-700 h-full rounded-full" />
                  </div>
                  <span className="w-20 text-right font-mono text-xs text-[var(--text-muted)]">{f.count} ({f.pct.toFixed(1)}%)</span>
                </div>
              ))}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-2">
              Showing {frequencies.length} of {Object.keys(frequencies.reduce((acc: Record<string, number>, f) => { acc[f.word] = f.count; return acc; }, {})).length} unique words
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}

// === 4. KeywordDensityChecker ===
export function KeywordDensityChecker() {
  const [text, setText] = useState('');
  const [keyword, setKeyword] = useState('');
  const [density, setDensity] = useState<{ count: number; total: number; percentage: number } | null>(null);

  const check = () => {
    const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
    const kw = keyword.toLowerCase();
    const count = words.filter(w => w === kw).length;
    const total = words.length;
    setDensity({ count, total, percentage: total > 0 ? (count / total) * 100 : 0 });
  };

  const presets = [
    { label: 'SEO Article', apply: () => { setText('The best SEO tools help you optimize your website for search engines. SEO tools analyze your content and provide recommendations. Good SEO requires quality content and technical optimization.'); setKeyword('SEO'); } },
    { label: 'Product Description', apply: () => { setText('Our premium coffee maker brews the perfect cup every time. This coffee maker features programmable settings, a thermal carafe, and a built-in grinder. The coffee maker is easy to clean and maintain.'); setKeyword('coffee maker'); } },
    { label: 'Clear', apply: () => { setText(''); setKeyword(''); setDensity(null); } },
  ];

  const resultText = density
    ? `"${keyword}" appears ${density.count}/${density.total} times (${density.percentage.toFixed(2)}%)`
    : 'Enter text and keyword to check density';

  const getDensityGrade = (pct: number) => {
    if (pct < 0.5) return { label: 'Too Low', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' };
    if (pct <= 2.5) return { label: 'Optimal', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' };
    if (pct <= 4) return { label: 'High', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' };
    return { label: 'Keyword Stuffing Risk', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10' };
  };

  const grade = density ? getDensityGrade(density.percentage) : null;

  return (
    <CalculatorShell title="Keyword Density Checker" result={resultText} onCalculate={check} calculateLabel="Check" presets={presets} accent="amber" downloadData={density ? JSON.stringify({ keyword, text, ...density }, null, 2) : ''} downloadFilename="keyword-density.json">
      <div className="space-y-4">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text</label>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={6} placeholder="Paste your content here..."
            className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-y" />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Keyword</label>
            <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Enter keyword to check..."
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
          </div>
          <button onClick={check} className="self-end px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm transition-colors">Check Density</button>
        </div>

        {density && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[var(--bg-surface)] rounded-xl text-center border border-zinc-200 dark:border-zinc-700">
                <p className="text-3xl font-extrabold text-amber-500">{density.count}</p>
                <p className="text-xs text-[var(--text-muted)]">Occurrences</p>
              </div>
              <div className="p-3 bg-[var(--bg-surface)] rounded-xl text-center border border-zinc-200 dark:border-zinc-700">
                <p className="text-3xl font-extrabold text-blue-700 dark:text-blue-400">{density.total}</p>
                <p className="text-xs text-[var(--text-muted)]">Total Words</p>
              </div>
            </div>

            <div className={`p-4 rounded-xl ${grade?.bg} border border-amber-500/20`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-[var(--text-secondary)]">Density</span>
                <span className="text-3xl font-extrabold text-amber-500">{density.percentage.toFixed(2)}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div style={{ width: `${Math.min(density.percentage * 20, 100)}%` }} className="bg-amber-500 h-full rounded-full" />
              </div>
              <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                <span>0%</span>
                <span>0.5%</span>
                <span>2.5%</span>
                <span>4%+</span>
              </div>
            </div>

            {grade && (
              <div className={`px-4 py-2 rounded-lg ${grade.bg} border border-amber-500/30`}>
                <span className={`font-medium ${grade.color}`}>{grade.label}</span>
                <span className="text-xs text-[var(--text-muted)] ml-2">({density.percentage.toFixed(2)}%)</span>
              </div>
            )}
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}

// === 5. KeywordPlannerTool ===
const STOP_WORDS = new Set(['the','a','an','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','shall','can','need','dare','ought','used','to','of','in','for','on','with','at','by','from','as','into','through','during','before','after','above','below','between','out','off','over','under','again','further','then','once','here','there','when','where','why','how','all','each','every','both','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','just','because','but','and','or','if','while','that','this','these','those','it','its','also']);
export function KeywordPlannerTool() {
  const [text, setText] = useState('');
  const [keywords, setKeywords] = useState<{ word: string; count: number; density: number }[]>([]);
  const [minLength, setMinLength] = useState(3);

  const extract = () => {
    const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
    const freq: Record<string, number> = {};
    words.forEach(w => { if (w.length >= minLength && !STOP_WORDS.has(w)) freq[w] = (freq[w] || 0) + 1; });
    const total = words.length;
    setKeywords(Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 50).map(([word, count]) => ({ word, count, density: (count / total) * 100 })));
  };

  const presets = [
    { label: 'Blog Post', apply: () => setText('Writing effective blog posts requires understanding your audience and their search intent. Content marketing strategies should focus on providing value through educational content that solves real problems. SEO optimization helps your content rank higher in search results.') },
    { label: 'Product Page', apply: () => setText('Our premium wireless headphones feature active noise cancellation, 30-hour battery life, and premium comfort. The headphones are perfect for travel, work, and music lovers. Shop now for the best audio experience with free shipping.') },
    { label: 'Clear', apply: () => { setText(''); setKeywords([]); } },
  ];

  const resultText = keywords.length > 0
    ? `Extracted ${keywords.length} keywords from ${text.split(/\s+/).filter(Boolean).length} words (min length: ${minLength})`
    : 'Enter text to extract keywords';

  const totalWords = text.trim() ? text.split(/\s+/).length : 0;

  return (
    <CalculatorShell title="Keyword Planner Tool" result={resultText} onCalculate={extract} presets={presets} accent="indigo" downloadData={keywords.length > 0 ? JSON.stringify({ totalWords, keywords }, null, 2) : ''} downloadFilename="keywords.json">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text Content</label>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={6} placeholder="Paste your content here..."
            className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y" />
        </div>
        <div className="flex gap-2 flex-wrap items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Min Word Length</label>
            <input type="number" min={2} max={10} value={String(minLength)} onChange={e => setMinLength(Number(e.target.value))}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          </div>
          <button onClick={extract} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-colors">Extract Keywords</button>
        </div>

        {keywords.length > 0 && (
          <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
            <div className="max-h-[400px] overflow-y-auto space-y-1">
              {keywords.map((k, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-[var(--bg-overlay)] rounded-lg text-sm">
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-muted)] w-5">{i + 1}</span>
                    <span className="font-medium">{k.word}</span>
                  </span>
                  <span className="font-mono text-xs text-[var(--text-muted)]">{k.count} ({k.density.toFixed(2)}%)</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}

// === 6. SeoMetaTagGenerator ===
export function SeoMetaTagGenerator() {
  const [title, setTitle] = useState('My Amazing Page Title');
  const [description, setDescription] = useState('This is a compelling meta description for search engines and social media platforms.');
  const [keywords, setKeywords] = useState('toolzum, online tools, free tools');
  const [result, setResult] = useState('');

  const generate = () => {
    setResult(`<title>${title}</title>\n<meta name="description" content="${description}" />\n<meta name="keywords" content="${keywords}" />\n<meta property="og:title" content="${title}" />\n<meta property="og:description" content="${description}" />\n<meta name="twitter:card" content="summary_large_image" />\n<meta name="twitter:title" content="${title}" />\n<meta name="twitter:description" content="${description}" />`);
  };

  const presets = [
    { label: 'Blog Post', apply: () => { setTitle('How to Build Amazing Web Apps'); setDescription('Learn the secrets of building modern web applications with the latest technologies and best practices.'); setKeywords('web development, programming, tutorial'); } },
    { label: 'Product Page', apply: () => { setTitle('Premium Widget Pro - Best Quality Widget'); setDescription('The ultimate widget for professionals. Durable, efficient, and affordable.'); setKeywords('widget, premium, professional, tools'); } },
    { label: 'Landing Page', apply: () => { setTitle('Welcome to Toolzum - Free Online Tools'); setDescription('Discover 1000+ free online tools for developers, designers, and everyday tasks. No sign-up required.'); setKeywords('free tools, online tools, developer tools'); } },
    { label: 'Clear', apply: () => { setResult(''); } },
  ];

  const resultText = result ? 'Meta tags generated successfully' : 'Enter details to generate meta tags';

  return (
    <CalculatorShell title="SEO Meta Tag Generator" result={resultText} onCalculate={generate} calculateLabel="Generate" presets={presets} accent="blue" downloadData={result} downloadFilename="meta-tags.html">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Title (<span id="title-len">{title.length}</span>/60)</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Description (<span id="desc-len">{description.length}</span>/160)</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Compelling description for search engines and social media..."
            className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Keywords</label>
          <input type="text" value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="toolzum, online tools, free tools"
            className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
        </div>

        <button onClick={generate} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-colors w-full sm:w-auto">Generate Meta Tags</button>

        {result && (
          <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Generated Meta Tags</label>
            <textarea readOnly value={result} rows={10}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 font-mono text-xs resize-none" />
            <div className="flex items-center gap-3 mt-2">
              <button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"><Copy size={14} /></button>
              <button onClick={() => { const blob = new Blob([result], { type: 'text/html' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'meta-tags.html'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"><Download size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}

// === 7. SeoPreviewGenerator ===
export function SeoPreviewGenerator() {
  const [title, setTitle] = useState('Toolzum - Free Online Tools');
  const [url, setUrl] = useState('https://toolzum.com/');
  const [description, setDescription] = useState('Free online tools for developers, designers, and everyday tasks. No sign-up required, 100% browser-based.');

  const ogLength = title.length;
  const descLength = description.length;

  const presets = [
    { label: 'Toolzum', apply: () => { setTitle('Toolzum - Free Online Tools'); setUrl('https://toolzum.com/'); setDescription('Free online tools for developers, designers, and everyday tasks. No sign-up required, 100% browser-based.'); } },
    { label: 'E-commerce', apply: () => { setTitle('Buy Premium Widgets Online - Best Prices'); setUrl('https://shop.example.com/widgets'); setDescription('Shop premium widgets at unbeatable prices. Fast shipping, easy returns.'); } },
    { label: 'Blog Post', apply: () => { setTitle('10 Tips for Better SEO in 2024'); setUrl('https://blog.example.com/seo-tips-2024'); setDescription('Boost your search rankings with these proven SEO strategies and techniques.'); } },
    { label: 'Clear', apply: () => { setTitle(''); setUrl(''); setDescription(''); } },
  ];

  const resultText = `Title: ${ogLength}/60 ${ogLength > 60 ? '⚠️ Too long' : '✓'} | Description: ${descLength}/160 ${descLength > 160 ? '⚠️ Too long' : '✓'}`;

  return (
    <CalculatorShell title="SEO Preview Generator" result={resultText} onCalculate={() => {}} calculateLabel="Generate" presets={presets} accent="indigo" downloadData={JSON.stringify({ title, url, description, ogLength, descLength }, null, 2)} downloadFilename="seo-preview.json">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">URL</label>
          <input type="url" value={url} onChange={e => setUrl(e.target.value)}
            className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Meta description..."
            className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y" />
        </div>

        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col justify-center min-h-[200px]">
          <p className="text-xs font-bold text-[var(--text-muted)] uppercase mb-3">Google SERP Preview</p>
          <div className="p-4 border border-[var(--border-subtle)] rounded-xl bg-white dark:bg-[var(--bg-surface)]">
            <div className="text-xs text-green-700 dark:text-green-400 mb-1">{url}</div>
            <div className="text-xl text-blue-600 dark:text-blue-400 font-medium leading-tight mb-1 hover:underline cursor-pointer">{title}</div>
            <div className="text-sm text-zinc-600 dark:text-[var(--text-muted)] leading-snug">{description}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-[var(--bg-surface)] rounded-lg text-center">
            <div className="text-[var(--text-muted)]">Title Length</div>
            <div className={`font-bold ${ogLength > 60 ? 'text-red-500' : 'text-green-500'}`}>{ogLength}/60</div>
          </div>
          <div className="p-2 bg-[var(--bg-surface)] rounded-lg text-center">
            <div className="text-[var(--text-muted)]">Description Length</div>
            <div className={`font-bold ${descLength > 160 ? 'text-red-500' : 'text-green-500'}`}>{descLength}/160</div>
          </div>
        </div>
      </div>
    </CalculatorShell>
  );
}

// === 8. SeoHeadlineAnalyzer ===
const POWER_WORDS = ['amazing','essential','exclusive','guaranteed','instant','powerful','proven','simple','ultimate','urgent','free','new','secret','hidden','shocking','remarkable','complete','easy','fast','best'];
export function SeoHeadlineAnalyzer() {
  const [headline, setHeadline] = useState('10 Amazing SEO Tips for Better Rankings');
  const [analysis, setAnalysis] = useState<{ wordCount: number; charCount: number; powerWords: string[]; sentiment: string; score: number } | null>(null);
  const analyze = () => {
    const words = headline.split(/\s+/).filter(Boolean); const found = words.filter(w => POWER_WORDS.includes(w.toLowerCase()));
    const wordCount = words.length; const charCount = headline.length;
    const positive = ['amazing','best','free','new','easy','fast','proven','simple','ultimate','essential'];
    const negative = ['worst','bad','terrible','awful','hate'];
    const posCount = words.filter(w => positive.includes(w.toLowerCase())).length;
    const negCount = words.filter(w => negative.includes(w.toLowerCase())).length;
    const sentiment = posCount > negCount ? 'Positive' : negCount > posCount ? 'Negative' : 'Neutral';
    const score = Math.min(100, Math.max(0, Math.round(wordCount * 5 + found.length * 10 - Math.abs(charCount - 60) * 0.5)));
    setAnalysis({ wordCount, charCount, powerWords: found, sentiment, score });
  };

  const presets = [
    { label: 'Strong', apply: () => { setHeadline('10 Amazing SEO Tips for Better Rankings'); analyze(); } },
    { label: 'Weak', apply: () => { setHeadline('SEO tips'); analyze(); } },
    { label: 'Clickbait', apply: () => { setHeadline('You Won\'t Believe This Amazing Secret Trick'); analyze(); } },
    { label: 'Clear', apply: () => { setHeadline(''); setAnalysis(null); } },
  ];

  const resultText = analysis ? `Score: ${analysis.score}/100 (${analysis.sentiment})` : 'Enter headline to analyze';

  return (
    <CalculatorShell title="SEO Headline Analyzer" result={resultText} onCalculate={analyze} calculateLabel="Analyze" presets={presets} accent="rose" downloadData={analysis ? JSON.stringify({ headline, ...analysis }, null, 2) : ''} downloadFilename="headline-analysis.json">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Headline</label>
        <input type="text" value={headline} onChange={e => setHeadline(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50" />

        <button onClick={analyze} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-sm transition-colors w-full sm:w-auto">Analyze</button>

        {analysis && (
          <div className="space-y-3">
            <div className={`p-4 rounded-xl text-center ${analysis.score >= 70 ? 'bg-emerald-50 dark:bg-emerald-900/20' : analysis.score >= 40 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <span className="text-xs text-[var(--text-muted)]">SEO Score</span>
              <p className={`text-4xl font-extrabold ${analysis.score >= 70 ? 'text-emerald-500' : analysis.score >= 40 ? 'text-amber-500' : 'text-red-500'}`}>{analysis.score}/100</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-[var(--bg-surface)] rounded-lg"><span className="text-[var(--text-muted)]">Words</span><p className="font-bold">{analysis.wordCount}</p></div>
              <div className="p-2 bg-[var(--bg-surface)] rounded-lg"><span className="text-[var(--text-muted)]">Chars</span><p className="font-bold">{analysis.charCount}</p></div>
              <div className="p-2 bg-[var(--bg-surface)] rounded-lg"><span className="text-[var(--text-muted)]">Sentiment</span><p className="font-bold">{analysis.sentiment}</p></div>
              <div className="p-2 bg-[var(--bg-surface)] rounded-lg"><span className="text-[var(--text-muted)]">Power Words</span><p className="font-bold">{analysis.powerWords.length}</p></div>
            </div>
            {analysis.powerWords.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {analysis.powerWords.map((w, i) => (
                  <span key={i} className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded text-xs font-medium">{w}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}

// === 9. SeoSchemaGenerator ===
export function SeoSchemaGenerator() {
  const [type, setType] = useState('Article'); const [data, setData] = useState('{"headline": "Sample Article", "description": "Article description"}'); const [result, setResult] = useState('');
  const generate = () => { try { const parsed = JSON.parse(data); setResult(JSON.stringify({ '@context': 'https://schema.org', '@type': type, ...parsed }, null, 2)); } catch { setResult('Invalid JSON input'); } };

  const presets = [
    { label: 'Article', apply: () => { setType('Article'); setData('{"headline": "Sample Article", "description": "Article description"}'); generate(); } },
    { label: 'Product', apply: () => { setType('Product'); setData('{"name": "Product Name", "description": "Product description", "price": "29.99", "currency": "USD"}'); generate(); } },
    { label: 'FAQPage', apply: () => { setType('FAQPage'); setData('{"mainEntity": [{"@type": "Question", "name": "Question?", "acceptedAnswer": {"@type": "Answer", "text": "Answer text."}}]}'); generate(); } },
    { label: 'Clear', apply: () => { setResult(''); } },
  ];

  const resultText = result ? 'Schema generated successfully' : 'Enter properties to generate schema';

  return (
    <CalculatorShell title="SEO Schema Generator" result={resultText} onCalculate={generate} calculateLabel="Generate" presets={presets} accent="indigo" downloadData={result} downloadFilename="schema.json">
      <div className="space-y-4">
        <div className="mb-3">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Schema Type</label>
          <select value={type} onChange={e => setType(e.target.value)}
            className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
            <option value="Article">Article</option>
            <option value="Product">Product</option>
            <option value="FAQPage">FAQ</option>
            <option value="LocalBusiness">LocalBusiness</option>
            <option value="Recipe">Recipe</option>
            <option value="Event">Event</option>
          </select>
        </div>

        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Properties (JSON)</label>
        <textarea value={data} onChange={e => setData(e.target.value)} rows={6} placeholder='{"headline": "Sample Article", "description": "Article description"}'
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y" />

        <button onClick={generate} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-colors w-full sm:w-auto">Generate Schema</button>

        {result && (
          <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 max-h-[300px] overflow-auto">
            <textarea readOnly value={result} rows={10}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 font-mono text-xs resize-none" />
            <button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className="mt-2 p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"><Copy size={14} /></button>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}

// === 10. SeoSlugGenerator ===
export function SeoSlugGenerator() {
  const [text, setText] = useState('How to Write SEO-Friendly URLs'); const [slug, setSlug] = useState('');
  const generate = () => { setSlug(text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')); };

  const presets = [
    { label: 'Blog Post', apply: () => { setText('How to Write SEO-Friendly URLs'); generate(); } },
    { label: 'Product', apply: () => { setText('Premium Wireless Headphones - Black'); generate(); } },
    { label: 'Category', apply: () => { setText('Men\'s Running Shoes - Size 10'); generate(); } },
    { label: 'Clear', apply: () => { setText(''); setSlug(''); } },
  ];

  const resultText = slug ? `Slug generated: ${slug}` : 'Enter text to generate slug';

  return (
    <CalculatorShell title="SEO Slug Generator" result={resultText} onCalculate={generate} calculateLabel="Generate" presets={presets} accent="emerald" downloadData={slug} downloadFilename="slug.txt">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text</label>
        <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Enter text to convert to slug"
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />

        <button onClick={generate} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors w-full sm:w-auto">Generate Slug</button>

        {slug && (
          <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col justify-center items-center min-h-[100px]">
            <div className="text-center">
              <p className="text-lg font-mono font-bold text-[var(--text-primary)] break-all">{slug}</p>
              <button onClick={() => { clipboardWrite(slug); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors mt-2"><Copy size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}

// === 11. CaseConverter ===
export function CaseConverter() {
  const [text, setText] = useState('hello world from toolzum');
  const [result, setResult] = useState('');
  const [activeCase, setActiveCase] = useState<string | null>(null);

  const convert = (type: string) => {
    let r = '';
    switch (type) {
      case 'upper': r = text.toUpperCase(); break;
      case 'lower': r = text.toLowerCase(); break;
      case 'title': r = text.replace(/\b\w/g, c => c.toUpperCase()); break;
      case 'sentence': r = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase(); break;
      case 'camel': r = text.replace(/[^\w\s]/g, '').split(/\s+/).map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(''); break;
      case 'pascal': r = text.replace(/[^\w\s]/g, '').split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(''); break;
      case 'snake': r = text.replace(/[^\w\s]/g, '').split(/\s+/).map(w => w.toLowerCase()).join('_'); break;
      case 'kebab': r = text.replace(/[^\w\s]/g, '').split(/\s+/).map(w => w.toLowerCase()).join('-'); break;
      case 'constant': r = text.replace(/[^\w\s]/g, '').split(/\s+/).map(w => w.toUpperCase()).join('_'); break;
      case 'dot': r = text.replace(/[^\w\s]/g, '').split(/\s+/).map(w => w.toLowerCase()).join('.'); break;
    }
    setResult(r);
    setActiveCase(type);
  };

  const cases = [
    { id: 'upper', label: 'UPPERCASE', icon: 'ABC' },
    { id: 'lower', label: 'lowercase', icon: 'abc' },
    { id: 'title', label: 'Title Case', icon: 'Abc' },
    { id: 'sentence', label: 'Sentence', icon: 'Abc' },
    { id: 'camel', label: 'camelCase', icon: 'aBc' },
    { id: 'pascal', label: 'PascalCase', icon: 'Abc' },
    { id: 'snake', label: 'snake_case', icon: 'a_b_c' },
    { id: 'kebab', label: 'kebab-case', icon: 'a-b-c' },
    { id: 'constant', label: 'CONSTANT_CASE', icon: 'A_B_C' },
    { id: 'dot', label: 'dot.case', icon: 'a.b.c' },
  ];

  const presets = [
    { label: 'Sample Text', apply: () => { setText('hello world from toolzum'); setResult(''); setActiveCase(null); } },
    { label: 'API Response', apply: () => { setText('user id first name last name email address'); setResult(''); setActiveCase(null); } },
    { label: 'CSS Classes', apply: () => { setText('main container header navigation menu item active'); setResult(''); setActiveCase(null); } },
    { label: 'Clear', apply: () => { setText(''); setResult(''); setActiveCase(null); } },
  ];

  const resultText = result ? `Converted to ${cases.find(c => c.id === activeCase)?.label || activeCase}` : 'Enter text and choose a case style';

  return (
    <CalculatorShell title="Case Converter" result={resultText} onCalculate={() => {}} presets={presets} accent="emerald" downloadData={result} downloadFilename="converted.txt">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text</label>
        <textarea value={text} onChange={e => { setText(e.target.value); setResult(''); setActiveCase(null); }} rows={4} placeholder="Enter text to convert..."
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-y" />

        <div className="flex flex-wrap gap-2">
          {cases.map(c => (
            <button key={c.id} onClick={() => convert(c.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1 ${activeCase === c.id ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-[var(--bg-surface)] border-zinc-300 dark:border-zinc-700 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-emerald-400'}`}>
              <span className="text-[10px] font-mono opacity-50">{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>

        {result && (
          <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[var(--text-secondary)]">Result</span>
              <button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"><Copy size={14} /></button>
            </div>
            <textarea readOnly value={result} rows={3} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 font-mono text-xs resize-none" />
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}

// === 12. TextReplacer ===
export function TextReplacer() {
  const [text, setText] = useState(''); const [find, setFind] = useState(''); const [replace, setReplace] = useState(''); const [result, setResult] = useState('');
  const replaceAll = () => { if (!find) return; setResult(text.split(find).join(replace)); };
  const count = result ? (text.match(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length : 0;

  const presets = [
    { label: 'Fix typo', apply: () => { setText('The quik brown fox jumps over the lazy dog'); setFind('quik'); setReplace('quick'); } },
    { label: 'Remove prefix', apply: () => { setText('OLD_item1\nOLD_item2\nOLD_item3'); setFind('OLD_'); setReplace(''); } },
    { label: 'Clear', apply: () => { setText(''); setFind(''); setReplace(''); setResult(''); } },
  ];
  const resultText = result ? `Replaced ${count} occurrence${count !== 1 ? 's' : ''}` : 'Enter text to find and replace';

  return (
    <CalculatorShell title="Text Replacer" result={resultText} onCalculate={replaceAll} presets={presets} accent="amber" downloadData={result} downloadFilename="replaced.txt">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text</label>
        <textarea value={text} onChange={e => { setText(e.target.value); setResult(''); }} rows={6} placeholder="Enter text..."
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-y" />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Find</label>
            <input type="text" value={find} onChange={e => setFind(e.target.value)} placeholder="Text to find"
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Replace With</label>
            <input type="text" value={replace} onChange={e => setReplace(e.target.value)} placeholder="Replacement text"
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
          </div>
        </div>

        <button onClick={replaceAll} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm transition-colors w-full sm:w-auto">Replace All</button>

        {result && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)]">{count} replacement{count !== 1 ? 's' : ''}</span>
              <div className="flex gap-2">
                <button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className="px-3 py-1.5 text-xs bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">Copy</button>
                <button onClick={() => { const blob = new Blob([result], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'replaced.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="px-3 py-1.5 text-xs bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">Download</button>
              </div>
            </div>
            <textarea readOnly value={result} rows={8} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 resize-none" />
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}

// === 13. TextSorter ===
export function TextSorter() {
  const [text, setText] = useState('banana\napple\ndate\ncherry\nelderberry'); const [sorted, setSorted] = useState(''); const [sortMethod, setSortMethod] = useState('');
  const sort = (method: string) => { setSortMethod(method); const lines = text.split('\n'); switch (method) { case 'az': setSorted([...lines].sort((a, b) => a.localeCompare(b)).join('\n')); break; case 'za': setSorted([...lines].sort((a, b) => b.localeCompare(a)).join('\n')); break; case 'length': setSorted([...lines].sort((a, b) => a.length - b.length).join('\n')); break; case 'random': setSorted([...lines].sort(() => Math.random() - 0.5).join('\n')); break; case 'unique': setSorted([...new Set(lines)].join('\n')); break; } };
  const inLines = text.split('\n').filter(l => l.trim()).length;
  const outLines = sorted ? sorted.split('\n').filter(l => l.trim()).length : 0;

  const presets = [
    { label: 'Fruits', apply: () => { setText('banana\napple\ndate\ncherry\nelderberry'); sort('az'); } },
    { label: 'Mixed', apply: () => { setText('zebra\napple\nbanana\ncherry'); sort('az'); } },
    { label: 'Numbers', apply: () => { setText('10\n2\n30\n4\n5'); sort('length'); } },
    { label: 'Clear', apply: () => { setText(''); setSorted(''); setSortMethod(''); } },
  ];

  const resultText = sorted ? `Sorted ${outLines} lines (${sortMethod})` : 'Enter lines to sort';

  return (
    <CalculatorShell title="Text Sorter" result={resultText} onCalculate={() => sort('az')} presets={presets} accent="violet" downloadData={sorted} downloadFilename="sorted.txt">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Lines ({inLines})</label>
        <textarea value={text} onChange={e => { setText(e.target.value); setSorted(''); setSortMethod(''); }} rows={8}
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-y" />

        <div className="flex flex-wrap gap-2">
          {[
            ['A→Z', 'az'], ['Z→A', 'za'], ['By Length', 'length'], ['Randomize', 'random'], ['Deduplicate', 'unique']
          ].map(([label, id]) => (
            <button key={id} onClick={() => sort(id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${sortMethod === id ? 'bg-violet-500/10 border-violet-400 text-violet-500' : 'bg-[var(--bg-surface)] border-zinc-300 dark:border-zinc-700 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              {label}
            </button>
          ))}
        </div>

        {sorted && (
          <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col min-h-[250px]">
            <textarea readOnly value={sorted} rows={8}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 font-mono text-xs resize-none" />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-[var(--text-muted)]">{outLines} lines (was {inLines})</span>
              <button onClick={() => { clipboardWrite(sorted); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"><Copy size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}

// === 14. TextDeduplicator ===
export function TextDeduplicator() {
  const [text, setText] = useState(''); const [result, setResult] = useState('');
  const inLines = text.split('\n').filter(l => l.trim()).length;
  const deduplicate = () => { const lines = text.split('\n').map(l => l.trim()).filter(Boolean); setResult([...new Set(lines)].join('\n')); };

  const presets = [
    { label: 'Sample', apply: () => { setText('apple\nbanana\napple\ncherry\nbanana\ndate'); } },
    { label: 'Logs', apply: () => { setText('ERROR: Connection failed\nINFO: Started\nERROR: Connection failed\nWARN: Timeout\nINFO: Started'); } },
    { label: 'Clear', apply: () => { setText(''); setResult(''); } },
  ];

  const resultText = result ? `${result.split('\n').length} unique lines (from ${inLines})` : 'Paste lines to deduplicate';

  return (
    <CalculatorShell title="Text Deduplicator" result={resultText} onCalculate={deduplicate} presets={presets} accent="rose" downloadData={result} downloadFilename="deduplicated.txt">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text Lines</label>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={8}
        className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-y" />

      <button onClick={deduplicate} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-sm transition-colors w-full sm:w-auto">Remove Duplicates</button>

      {result && (
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col min-h-[200px]">
          <textarea readOnly value={result} rows={8}
            className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 font-mono text-xs resize-none" />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-[var(--text-muted)]">{result.split('\n').length} unique lines ({inLines - result.split('\n').length} removed)</span>
            <button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"><Copy size={14} /></button>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

// === 15. TextDiffChecker ===
export function TextDiffChecker() {
  const [text1, setText1] = useState('The quick brown fox\njumps over the lazy dog');
  const [text2, setText2] = useState('The quick brown fox\njumps over the sleepy cat');
  const [diff, setDiff] = useState<{ lines: { text: string; type: 'same' | 'added' | 'removed' }[] } | null>(null);

  const compare = () => {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const maxLen = Math.max(lines1.length, lines2.length);
    const lines: { text: string; type: 'same' | 'added' | 'removed' }[] = [];
    for (let i = 0; i < maxLen; i++) {
      if (i >= lines1.length) lines.push({ text: lines2[i], type: 'added' });
      else if (i >= lines2.length) lines.push({ text: lines1[i], type: 'removed' });
      else if (lines1[i] === lines2[i]) lines.push({ text: lines1[i], type: 'same' });
      else { lines.push({ text: lines1[i], type: 'removed' }); lines.push({ text: lines2[i], type: 'added' }); }
    }
    setDiff({ lines });
  };

  const added = diff ? diff.lines.filter(l => l.type === 'added').length : 0;
  const removed = diff ? diff.lines.filter(l => l.type === 'removed').length : 0;
  const same = diff ? diff.lines.filter(l => l.type === 'same').length : 0;

  const presets = [
    { label: 'Code Change', apply: () => { setText1('function add(a, b) {\n  return a + b;\n}\n\nconsole.log(add(1, 2));'); setText2('function add(a, b) {\n  return a + b;\n}\n\nconsole.log(add(1, 2));\nconsole.log(add(3, 4));'); } },
    { label: 'Config Diff', apply: () => { setText1('DEBUG=true\nPORT=3000\nHOST=localhost'); setText2('DEBUG=false\nPORT=8080\nHOST=0.0.0.0\nLOG_LEVEL=info'); } },
    { label: 'Clear', apply: () => { setText1(''); setText2(''); setDiff(null); } },
  ];

  const resultText = diff
    ? `${added} added, ${removed} removed, ${same} unchanged`
    : 'Enter two texts to compare';

  return (
    <CalculatorShell title="Text Diff Checker" result={resultText} onCalculate={compare} calculateLabel="Check" presets={presets} accent="violet" downloadData={diff ? JSON.stringify({ text1, text2, diff: diff.lines }, null, 2) : ''} downloadFilename="diff.json">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Original Text</label>
          <textarea value={text1} onChange={e => { setText1(e.target.value); setDiff(null); }} rows={6} placeholder="Original text..."
            className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-y" />
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">New Text</label>
          <textarea value={text2} onChange={e => { setText2(e.target.value); setDiff(null); }} rows={6} placeholder="New text..."
            className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-y" />
        </div>

        <button onClick={compare} className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-sm transition-colors self-start">Compare</button>

        {diff && (
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-sm">
              <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full font-medium">+{added} added</span>
              <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full font-medium">-{removed} removed</span>
              <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full font-medium">{same} same</span>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 max-h-[400px] overflow-y-auto font-mono text-xs space-y-0.5">
              {diff.lines.map((l, i) => (
                <div key={i} className={`p-1.5 rounded ${l.type === 'same' ? 'bg-transparent' : l.type === 'added' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300'}`}>
                  <span className="mr-2 font-bold text-[var(--text-muted)]">
                    {l.type === 'added' ? '+' : l.type === 'removed' ? '-' : ' '}
                  </span>
                  <span>{l.text || '\u00A0'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}

// === 16/17. TextToHtmlConverter / HtmlToTextConverter ===
function TextHtmlTool({ defaultMode }: { defaultMode: 'text-to-html' | 'html-to-text' }) {
  const [mode, setMode] = useState(defaultMode); const [input, setInput] = useState(''); const [result, setResult] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [semantic, setSemantic] = useState(false);
  const [hasMarkdown, setHasMarkdown] = useState(false);

  const detectMarkdown = (text: string) => {
    const mdPatterns = [/\*\*.*?\*\*/, /\*.*?\*/, /^#+\s/m, /`{3}/, /^\s*[-*]\s/m, /^\d+\.\s/m, /\[.*?\]\(.*?\)/];
    return mdPatterns.some(p => p.test(text));
  };

  const convert = () => {
    const val = input.trim(); if (!val) { setResult(''); return; }
    try {
      if (mode === 'text-to-html') {
        setHasMarkdown(detectMarkdown(val));
        const paragraphs = val.split(/\n\s*\n/).filter(p => p.trim());
        const htmlParts = paragraphs.map(p => {
          const lines = p.split('\n').filter(l => l.trim()).join('<br />');
          return semantic ? `<section><p>${lines}</p></section>` : `<p>${lines}</p>`;
        });
        setResult(htmlParts.join('\n'));
      } else {
        setResult(val.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, "'").replace(/\n\s*\n/g, '\n\n').trim());
      }
    } catch { setResult(''); }
  };

  const isTextToHtml = mode === 'text-to-html';

  const presets = [
    { label: 'Article', apply: () => { setMode('text-to-html'); setInput('Title\n\nFirst paragraph here.\n\nSecond paragraph with **bold** and *italic* text.'); } },
    { label: 'Code Block', apply: () => { setMode('text-to-html'); setInput('function hello() {\n  console.log("Hello, World!");\n}'); } },
    { label: 'HTML', apply: () => { setMode('html-to-text'); setInput('<div class="card"><h1>Title</h1><p>Content with <strong>bold</strong> text.</p></div>'); } },
    { label: 'Clear', apply: () => { setInput(''); setResult(''); } },
  ];

  const resultText = result ? `Converted ${isTextToHtml ? 'text → HTML' : 'HTML → text'}` : 'Enter content to convert';

  return (
    <CalculatorShell title={isTextToHtml ? 'Text to HTML Converter' : 'HTML to Text Converter'} result={resultText} onCalculate={convert} presets={presets} accent="amber" downloadData={result} downloadFilename={isTextToHtml ? 'output.html' : 'output.txt'}>
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{isTextToHtml ? 'Plain Text' : 'HTML'}</label>
        <textarea value={input} onChange={e => setInput(e.target.value)} rows={8} placeholder={isTextToHtml ? 'Enter plain text...' : 'Enter HTML...'}
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-y" />

        <div className="flex flex-wrap gap-2">
          <button onClick={convert} className="px-4 py-2.5 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl text-sm transition-colors">Convert to {isTextToHtml ? 'HTML' : 'Text'}</button>
          <button onClick={() => setMode(isTextToHtml ? 'html-to-text' : 'text-to-html')} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Switch ↻</button>
          {isTextToHtml && (
            <>
              <button onClick={() => setShowPreview(!showPreview)} className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${showPreview ? 'bg-amber-500 text-white border-amber-500' : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>Preview</button>
              <button onClick={() => setSemantic(!semantic)} className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${semantic ? 'bg-purple-500 text-white border-purple-500' : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>Semantic HTML</button>
            </>
          )}
        </div>

        {hasMarkdown && isTextToHtml && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Markdown syntax detected in input. This tool converts plain text to HTML.
          </div>
        )}

        {result && (
          <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col min-h-[250px]">
            {showPreview && isTextToHtml ? (
              <div className="flex-1 p-4 border border-[var(--border-subtle)] rounded-xl bg-white dark:bg-[var(--bg-surface)] prose prose-sm dark:prose-invert max-w-none overflow-auto">
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(result) }} />
              </div>
            ) : (
              <textarea readOnly value={result} rows={8} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 font-mono text-xs resize-none" />
            )}
            <div className="flex items-center gap-3 mt-2">
              <button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"><Copy size={14} /></button>
              <button onClick={() => { const blob = new Blob([result], { type: isTextToHtml ? 'text/html' : 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = isTextToHtml ? 'output.html' : 'output.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"><Download size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
export function TextToHtmlConverter() { return <TextHtmlTool key="text-to-html" defaultMode="text-to-html" />; }
export function HtmlToTextConverter() { return <TextHtmlTool key="html-to-text" defaultMode="html-to-text" />; }

// === 18. MarkdownPreviewer ===
export function MarkdownPreviewer() {
  const [md, setMd] = useState('# Hello World\n\nThis is **bold** and *italic* text.\n\n- List item 1\n- List item 2\n\n```\ncode block\n```\n\n> Blockquote'); const [html, setHtml] = useState('');

  const preview = () => {
    let h = md.replace(/^###### (.*$)/gm, '<h6>$1</h6>').replace(/^##### (.*$)/gm, '<h5>$1</h5>').replace(/^#### (.*$)/gm, '<h4>$1</h4>').replace(/^### (.*$)/gm, '<h3>$1</h3>').replace(/^## (.*$)/gm, '<h2>$1</h2>').replace(/^# (.*$)/gm, '<h1>$1</h1>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/`{3}([\s\S]*?)`{3}/g, '<pre><code>$1</code></pre>').replace(/`(.*?)`/g, '<code>$1</code>').replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>').replace(/^- (.*$)/gm, '<li>$1</li>').replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>').replace(/\n\n/g, '</p><p>').replace(/^(?!<[hulpb])/gm, '');
    h = `<p>${h}</p>`.replace(/<p><\/p>/g, '');
    setHtml(h);
  };

  const presets = [
    { label: 'Basic', apply: () => { setMd('# Hello World\n\nThis is **bold** and *italic* text.\n\n- List item 1\n- List item 2\n\n```\ncode block\n```\n\n> Blockquote'); } },
    { label: 'Code', apply: () => { setMd('# Code Example\n\n```javascript\nfunction hello() {\n  console.log("Hello, World!");\n}\n```'); } },
    { label: 'Table', apply: () => { setMd('| Name | Age |\n|------|-----|\n| Alice | 30 |\n| Bob | 25 |'); } },
    { label: 'Clear', apply: () => { setMd(''); setHtml(''); } },
  ];

  const resultText = html ? 'Markdown rendered to HTML' : 'Enter Markdown to preview';

  return (
    <CalculatorShell title="Markdown Previewer" result={resultText} onCalculate={preview} presets={presets} accent="amber" downloadData={html} downloadFilename="preview.html">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Markdown</label>
      <textarea value={md} onChange={e => setMd(e.target.value)} rows={10} placeholder="Enter Markdown..."
        className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-y" />

      <button onClick={preview} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm transition-colors w-full sm:w-auto">Preview</button>

      {html && (
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 min-h-[300px] prose prose-sm dark:prose-invert max-w-none overflow-auto">
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
        </div>
      )}
    </CalculatorShell>
  );
}

// === 19. DuplicateWordRemover ===
export function DuplicateWordRemover() {
  const [text, setText] = useState(''); const [result, setResult] = useState('');
  const remove = () => { const words = text.split(/\s+/); const seen = new Set<string>(); const out: string[] = []; words.forEach(w => { const key = w.toLowerCase(); if (!seen.has(key)) { seen.add(key); out.push(w); } }); setResult(out.join(' ')); };
  const inWords = text.trim() ? text.split(/\s+/).length : 0;
  const outWords = result.trim() ? result.split(/\s+/).length : 0;

  const presets = [
    { label: 'Sample', apply: () => { setText('the quick brown fox jumps over the lazy dog the quick brown fox'); } },
    { label: 'Repeated', apply: () => { setText('word word word another another test test test'); } },
    { label: 'Clear', apply: () => { setText(''); setResult(''); } },
  ];

  const resultText = result ? `${outWords} unique words (removed ${inWords - outWords} duplicates)` : 'Paste text to remove duplicate words';

  return (
    <CalculatorShell title="Duplicate Word Remover" result={resultText} onCalculate={remove} presets={presets} accent="rose" downloadData={result} downloadFilename="deduplicated.txt">
      <p className="text-sm text-[var(--text-secondary)] mb-3">Removes duplicate words within text. For removing duplicate <em>lines</em>, use <NextLink href="/text/text-deduplicator" className="text-[var(--accent)] hover:underline">Text Deduplicator</NextLink>.</p>
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text (${inWords} words)</label>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={6} placeholder="Paste text..."
        className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-y" />

      <button onClick={remove} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-sm transition-colors w-full sm:w-auto">Remove Duplicate Words</button>

      {result && (
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col min-h-[200px]">
          <textarea readOnly value={result} rows={6} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 font-mono text-xs resize-none" />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-[var(--text-muted)]">{outWords} unique words ({inWords - outWords} removed)</span>
            <button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"><Copy size={14} /></button>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

// === 20. TextCleaner ===
export function TextCleaner() {
  const [text, setText] = useState(''); const [result, setResult] = useState('');
  const clean = () => { let t = text; t = t.replace(/\s+/g, ' '); t = t.replace(/\n{3,}/g, '\n\n'); t = t.replace(/[^\S\n]+$/gm, ''); t = t.replace(/^[^\S\n]+/gm, ''); setResult(t.trim()); };

  const presets = [
    { label: 'Messy', apply: () => { setText('  Hello    World  \n\n\n  This   is   a   test  '); } },
    { label: 'Extra newlines', apply: () => { setText('Line 1\n\n\n\nLine 2\n\n\nLine 3'); } },
    { label: 'Clear', apply: () => { setText(''); setResult(''); } },
  ];

  const resultText = result ? 'Text cleaned (whitespace normalized)' : 'Enter text to clean';

  return (
    <CalculatorShell title="Text Cleaner" result={resultText} onCalculate={clean} presets={presets} accent="cyan" downloadData={result} downloadFilename="cleaned.txt">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text</label>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={6} placeholder="Enter text to clean..."
        className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-y" />

      <button onClick={clean} className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-sm transition-colors w-full sm:w-auto">Clean Text</button>

      {result && (
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col min-h-[200px]">
          <textarea readOnly value={result} rows={6} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 resize-none" />
          <button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className="mt-2 p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors self-start"><Copy size={14} /></button>
        </div>
      )}
    </CalculatorShell>
  );
}

// === 21. TextSplitter ===
export function TextSplitter() {
  const [text, setText] = useState(''); const [delimiter, setDelimiter] = useState(','); const [result, setResult] = useState('');
  const split = () => { if (!delimiter) return; const parts = text.split(delimiter).map(s => s.trim()).filter(Boolean); setResult(parts.map((p, i) => `${i + 1}. ${p}`).join('\n')); };
  const count = result ? result.split('\n').length : 0;

  const presets = [
    { label: 'CSV', apply: () => { setText('apple, banana, cherry, date'); setDelimiter(','); } },
    { label: 'Lines', apply: () => { setText('line1\nline2\nline3'); setDelimiter('\n'); } },
    { label: 'Semicolon', apply: () => { setText('a;b;c;d'); setDelimiter(';'); } },
    { label: 'Clear', apply: () => { setText(''); setDelimiter(','); setResult(''); } },
  ];

  const resultText = result ? `Split into ${count} parts` : 'Enter text and delimiter to split';

  return (
    <CalculatorShell title="Text Splitter" result={resultText} onCalculate={split} presets={presets} accent="violet" downloadData={result} downloadFilename="split.txt">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text</label>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={6} placeholder="Enter text to split..."
        className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-y" />

      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Delimiter</label>
      <input type="text" value={delimiter} onChange={e => setDelimiter(e.target.value)} placeholder=","
        className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50" />

      <button onClick={split} className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-sm transition-colors w-full sm:w-auto">Split</button>

      {result && (
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col min-h-[200px]">
          <textarea readOnly value={result} rows={8} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 font-mono text-xs resize-none" />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-[var(--text-muted)]">{count} parts</span>
            <button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"><Copy size={14} /></button>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

// === 22. TrailingSpaceRemover ===
export function TrailingSpaceRemover() {
  const [text, setText] = useState(''); const [result, setResult] = useState('');
  const trim = () => { setResult(text.split('\n').map(l => l.trimEnd()).join('\n').trim()); };
  const trimmed = result ? text.split('\n').length - result.split('\n').length : 0;

  const presets = [
    { label: 'Sample', apply: () => { setText('Line 1   \nLine 2  \n  Line 3  \n\nLine 4'); } },
    { label: 'Code', apply: () => { setText('function hello() {  \n  console.log("test");  \n}  '); } },
    { label: 'Clear', apply: () => { setText(''); setResult(''); } },
  ];

  const resultText = result ? 'Trailing spaces removed' : 'Enter text to remove trailing spaces';

  return (
    <CalculatorShell title="Trailing Space Remover" result={resultText} onCalculate={trim} presets={presets} accent="orange" downloadData={result} downloadFilename="trimmed.txt">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text</label>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={6} placeholder="Enter text with trailing spaces..."
        className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-y" />

      <button onClick={trim} className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-sm transition-colors w-full sm:w-auto">Remove Trailing Spaces</button>

      {result && (
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col min-h-[200px]">
          <textarea readOnly value={result} rows={6} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 resize-none" />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-[var(--text-muted)]">Trailing spaces removed</span>
            <button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"><Copy size={14} /></button>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

// === 23. CanonicalUrlChecker ===
export function CanonicalUrlChecker() {
  const [url, setUrl] = useState('https://example.com/blog/my-article'); const [result, setResult] = useState('');
  const check = () => { try { new URL(url); } catch { setResult('Invalid URL'); return; } const u = new URL(url); setResult([`✓ Valid URL format`,`Protocol: ${u.protocol}`,`Domain: ${u.hostname}`,`Path: ${u.pathname}`,u.hash ? '⚠️ Has fragment (#) — search engines may ignore' : '✓ No fragment',u.search ? '⚠️ Has query params — ensure these are the canonical version' : '✓ No query params',u.pathname.endsWith('/') ? '✓ Ends with /' : 'ℹ️ No trailing slash',u.hostname.startsWith('www.') ? 'ℹ️ With www' : 'ℹ️ Without www'].join('\n')); };

  const presets = [
    { label: 'Article', apply: () => setUrl('https://example.com/blog/my-article') },
    { label: 'Product', apply: () => setUrl('https://shop.example.com/product/123?ref=email') },
    { label: 'Root', apply: () => setUrl('https://example.com/') },
    { label: 'Clear', apply: () => { setUrl(''); setResult(''); } },
  ];

  const resultText = result ? `URL checked: ${url}` : 'Enter URL to check canonical structure';

  return (
    <CalculatorShell title="Canonical URL Checker" result={resultText} onCalculate={check} calculateLabel="Check" presets={presets} accent="blue" downloadData={result} downloadFilename="url-check.txt">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">URL</label>
        <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/path"
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />

        <button onClick={check} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-colors w-full sm:w-auto">Check URL</button>

        {result && (
          <pre className="p-4 bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 font-mono text-sm whitespace-pre-wrap">{result}</pre>
        )}
      </div>
    </CalculatorShell>
  );
}

// === 24. BreadcrumbSchemaGenerator ===
export function BreadcrumbSchemaGenerator() {
  const [pages, setPages] = useState('Home,https://example.com\nProducts,https://example.com/products\nWidgets,https://example.com/widgets'); const [result, setResult] = useState('');
  const generate = () => { const items = pages.split('\n').filter(l => l.trim()).map(l => { const [name, url] = l.split(',').map(s => s.trim()); return { name, url }; }); if (items.length < 2) return; setResult(JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": items.map((item, i) => ({ "@type": "ListItem", "position": i + 1, "name": item.name, "item": item.url })) }, null, 2)); };

  const presets = [
    { label: 'E-commerce', apply: () => setPages('Home,https://example.com\nProducts,https://example.com/products\nWidgets,https://example.com/widgets') },
    { label: 'Blog', apply: () => setPages('Home,https://blog.example.com\nCategory,https://blog.example.com/category\nPost,https://blog.example.com/post') },
    { label: 'Documentation', apply: () => setPages('Home,https://docs.example.com\nGuides,https://docs.example.com/guides\nAPI,https://docs.example.com/api') },
    { label: 'Clear', apply: () => { setPages(''); setResult(''); } },
  ];

  const resultText = result ? 'Breadcrumb schema generated' : 'Enter pages to generate breadcrumb schema';

  return (
    <CalculatorShell title="Breadcrumb Schema Generator" result={resultText} onCalculate={generate} calculateLabel="Generate" presets={presets} accent="amber" downloadData={result} downloadFilename="breadcrumb-schema.json">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Pages (Name,URL per line)</label>
        <textarea value={pages} onChange={e => setPages(e.target.value)} rows={5} placeholder="Home,https://example.com\nProducts,https://example.com/products"
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-y" />

        <button onClick={generate} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm transition-colors w-full sm:w-auto">Generate Breadcrumb Schema</button>

        {result && (
          <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col min-h-[200px]">
            <textarea readOnly value={result} rows={10}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 font-mono text-xs resize-none" />
            <button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className="mt-2 p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"><Copy size={14} /></button>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}

// === 25. UtmBuilder ===
export function UtmBuilder() {
  const [baseUrl, setBaseUrl] = useState('https://example.com');
  const [source, setSource] = useState('newsletter');
  const [medium, setMedium] = useState('email');
  const [campaign, setCampaign] = useState('spring_sale');
  const [term, setTerm] = useState('');
  const [content, setContent] = useState('');
  const [result, setResult] = useState('');

  const build = () => {
    try {
      new URL(baseUrl);
    } catch { return; }
    const u = new URL(baseUrl);
    u.searchParams.set('utm_source', source);
    u.searchParams.set('utm_medium', medium);
    u.searchParams.set('utm_campaign', campaign);
    if (term) u.searchParams.set('utm_term', term);
    if (content) u.searchParams.set('utm_content', content);
    setResult(u.toString());
  };

  const presets = [
    { label: 'Email Campaign', apply: () => { setSource('newsletter'); setMedium('email'); setCampaign('weekly_digest'); } },
    { label: 'Social Media', apply: () => { setSource('facebook'); setMedium('social'); setCampaign('product_launch'); } },
    { label: 'Paid Search', apply: () => { setSource('google'); setMedium('cpc'); setCampaign('brand_terms'); setTerm('running shoes'); } },
    { label: 'Referral', apply: () => { setSource('partner_site'); setMedium('referral'); setCampaign('affiliate'); } },
    { label: 'Clear', apply: () => { setResult(''); } },
  ];

  const resultText = result ? `UTM URL built (${new URL(result).searchParams.toString()})` : 'Fill fields to build a UTM-tagged URL';

  const params = [
    { key: 'utm_source', label: 'Source', value: source, required: true, desc: 'Where traffic comes from' },
    { key: 'utm_medium', label: 'Medium', value: medium, required: true, desc: 'Marketing medium' },
    { key: 'utm_campaign', label: 'Campaign', value: campaign, required: true, desc: 'Specific campaign name' },
    { key: 'utm_term', label: 'Term', value: term, required: false, desc: 'Paid search keywords' },
    { key: 'utm_content', label: 'Content', value: content, required: false, desc: 'A/B test variant' },
  ];

  return (
    <CalculatorShell title="UTM Builder" result={resultText} onCalculate={build} presets={presets} accent="cyan" downloadData={result} downloadFilename="utm-url.txt">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Base URL</label>
        <input type="url" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder="https://example.com/page"
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {params.map(p => (
            <div key={p.key} className={p.required ? 'ring-1 ring-cyan-500/20' : ''}>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5 flex items-center gap-1">
                {p.label}
                {!p.required && <span className="text-xs text-[var(--text-muted)]">(optional)</span>}
              </label>
              <input type="text" value={p.value} onChange={e => {
                if (p.key === 'utm_source') setSource(e.target.value);
                else if (p.key === 'utm_medium') setMedium(e.target.value);
                else if (p.key === 'utm_campaign') setCampaign(e.target.value);
                else if (p.key === 'utm_term') setTerm(e.target.value);
                else if (p.key === 'utm_content') setContent(e.target.value);
              }} placeholder={p.desc}
                className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" />
            </div>
          ))}
        </div>

        <button onClick={build} className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-sm transition-colors w-full sm:w-auto">Build UTM URL</button>

        {result && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Result</label>
            <div className="flex gap-2">
              <input readOnly value={result} className="flex-1 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100" />
              <button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-sm transition-colors shrink-0">Copy</button>
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              <strong>Params:</strong> {new URL(result).searchParams.toString()}
            </div>
          </div>
        )}

        <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-zinc-200 dark:border-zinc-700">
          <div className="text-xs text-[var(--text-secondary)] mb-2">UTM Parameter Guide</div>
          <div className="grid grid-cols-2 gap-1 text-xs text-[var(--text-muted)]">
            <div><span className="font-mono text-cyan-600 dark:text-cyan-400">utm_source</span> — Traffic source (google, newsletter, facebook)</div>
            <div><span className="font-mono text-cyan-600 dark:text-cyan-400">utm_medium</span> — Medium (email, cpc, social, referral)</div>
            <div><span className="font-mono text-cyan-600 dark:text-cyan-400">utm_campaign</span> — Campaign name (spring_sale, product_launch)</div>
            <div><span className="font-mono text-cyan-600 dark:text-cyan-400">utm_term</span> — Search keywords (paid search)</div>
            <div><span className="font-mono text-cyan-600 dark:text-cyan-400">utm_content</span> — Ad/content variant (A/B testing)</div>
          </div>
        </div>
      </div>
    </CalculatorShell>
  );
}

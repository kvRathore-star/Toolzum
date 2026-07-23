"use client";
import React, { useState, useCallback, useEffect } from 'react';
import { Copy, Download, Hash, Type, BarChart3, Search, FileText, Globe, Edit3, ListOrdered, GitCompare, ArrowLeftRight, SpellCheck, Scissors, Trash2, Link, Rows3, Sigma } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import DOMPurify from 'dompurify';

const cardClass = "max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500";
const headerClass = "flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3";
const inputClass = "w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none focus:border-[var(--accent)] transition-colors";
const labelClass = "text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider";
const resultPanelClass = "bg-[var(--bg-overlay)] rounded-2xl p-6 border border-[var(--border-subtle)]";
const actionBtnClass = "p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--accent)]/10 text-[var(--text-muted)] hover:text-[var(--accent)] rounded-lg transition-colors";
const btnPrimary = "px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl text-sm transition-colors";
const statBoxClass = "p-3 bg-[var(--bg-surface)] rounded-xl text-center";

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

  return (
    <div className={cardClass}>
      <div className={headerClass}><FileText className="w-5 h-5 text-emerald-500" /><h3 className="text-lg font-bold text-[var(--text-primary)]">Word Counter</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1"><label className={labelClass}>Text</label><textarea value={text} onChange={e => setText(e.target.value)} rows={10} className={`${inputClass} resize-none`} placeholder="Paste or type your text here..." /></div>
        </div>
        <div className={`${resultPanelClass} flex flex-col justify-between min-h-[300px]`}>
          {text ? (<div className="space-y-4"><div className="grid grid-cols-2 gap-3">
            <div className={statBoxClass}><p className="text-3xl font-extrabold text-emerald-500">{words}</p><p className="text-xs text-[var(--text-muted)]">Words</p></div>
            <div className={statBoxClass}><p className="text-3xl font-extrabold text-blue-500">{chars}</p><p className="text-xs text-[var(--text-muted)]">Characters</p></div>
            <div className={statBoxClass}><p className="text-3xl font-extrabold text-violet-500">{charsNoSpace}</p><p className="text-xs text-[var(--text-muted)]">No Space</p></div>
            <div className={statBoxClass}><p className="text-3xl font-extrabold text-amber-500">{sentences}</p><p className="text-xs text-[var(--text-muted)]">Sentences</p></div>
            <div className={statBoxClass}><p className="text-3xl font-extrabold text-rose-500">{paragraphs}</p><p className="text-xs text-[var(--text-muted)]">Paragraphs</p></div>
            <div className={statBoxClass}><p className="text-lg font-extrabold text-cyan-500">{readingTime}m<span className="text-sm font-normal text-[var(--text-muted)]"> read</span></p><p className="text-xs text-[var(--text-muted)]">Speaking: {speakingTime}m</p></div>
          </div></div>) : (<p className="text-[var(--text-muted)] text-sm">Start typing to see live statistics</p>)}
        </div>
      </div>
    </div>
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

  return (
    <div className={cardClass}>
      <div className={headerClass}><Hash className="w-5 h-5 text-violet-500" /><h3 className="text-lg font-bold text-[var(--text-primary)]">Character Counter</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1"><label className={labelClass}>Text</label><textarea value={text} onChange={e => setText(e.target.value)} rows={10} className={`${inputClass} resize-none`} placeholder="Type or paste text..." /></div>
        </div>
        <div className={`${resultPanelClass} flex flex-col justify-between min-h-[300px]`}>
          {text ? (<div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className={statBoxClass}><p className="text-3xl font-extrabold text-zinc-800 dark:text-white">{total}</p><p className="text-xs text-[var(--text-muted)]">Total</p></div>
              <div className={statBoxClass}><p className="text-3xl font-extrabold text-emerald-500">{noSpace}</p><p className="text-xs text-[var(--text-muted)]">No Space</p></div>
              <div className={statBoxClass}><p className="text-3xl font-extrabold text-blue-500">{letters}</p><p className="text-xs text-[var(--text-muted)]">Letters</p></div>
              <div className={statBoxClass}><p className="text-3xl font-extrabold text-amber-500">{digits}</p><p className="text-xs text-[var(--text-muted)]">Digits</p></div>
              <div className={statBoxClass}><p className="text-3xl font-extrabold text-cyan-500">{spaces}</p><p className="text-xs text-[var(--text-muted)]">Spaces</p></div>
              <div className={statBoxClass}><p className="text-3xl font-extrabold text-rose-500">{punctuation}</p><p className="text-xs text-[var(--text-muted)]">Punctuation</p></div>
            </div>
            {/* Visual bar */}
            {total > 0 && <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden flex"><div style={{ width: `${(letters / total) * 100}%` }} className="bg-blue-500 h-full" /><div style={{ width: `${(digits / total) * 100}%` }} className="bg-amber-500 h-full" /><div style={{ width: `${(spaces / total) * 100}%` }} className="bg-cyan-500 h-full" /><div style={{ width: `${(punctuation / total) * 100}%` }} className="bg-rose-500 h-full" /></div>}
          </div>) : (<p className="text-[var(--text-muted)] text-sm">Start typing to see character breakdown</p>)}
        </div>
      </div>
    </div>
  );
}

// === 3. WordFrequencyCounter ===
export function WordFrequencyCounter() {
  const [text, setText] = useState(''); const [limit, setLimit] = useState(20); const [frequencies, setFrequencies] = useState<{ word: string; count: number; pct: number }[]>([]);
  const analyze = () => {
    const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
    const freq: Record<string, number> = {}; words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    const total = words.length;
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([word, count]) => ({ word, count, pct: (count / total) * 100 }));
    setFrequencies(sorted);
  };
  const maxCount = frequencies.length > 0 ? frequencies[0].count : 1;

  return (
    <div className={cardClass}>
      <div className={headerClass}><BarChart3 className="w-5 h-5 text-emerald-500" /><h3 className="text-lg font-bold text-[var(--text-primary)]">Word Frequency Counter</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1"><label className={labelClass}>Text</label><textarea value={text} onChange={e => setText(e.target.value)} rows={8} className={inputClass} /></div>
          <div className="space-y-1"><label className={labelClass}>Show Top</label><input type="number" min={5} max={100} value={limit} onChange={e => setLimit(Number(e.target.value))} className={inputClass} /></div>
          <button onClick={analyze} className={btnPrimary}>Analyze</button>
        </div>
        <div className={`${resultPanelClass} flex flex-col min-h-[300px]`}>
          {frequencies.length > 0 ? (<div className="space-y-1.5 max-h-[350px] overflow-y-auto">{frequencies.map((f, i) => (<div key={i} className="flex items-center gap-3 p-2 bg-[var(--bg-surface)] rounded-lg text-sm"><span className="w-6 text-xs text-[var(--text-muted)] font-bold">{i + 1}</span><span className="flex-1">{f.word}</span><div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden"><div style={{ width: `${(f.count / maxCount) * 100}%` }} className="bg-emerald-500 h-full rounded-full" /></div><span className="w-16 text-right font-mono text-xs text-[var(--text-muted)]">{f.count} ({f.pct.toFixed(1)}%)</span></div>))}</div>) : (<p className="text-[var(--text-muted)] text-sm">Enter text and analyze</p>)}
        </div>
      </div>
    </div>
  );
}

// === 4. KeywordDensityChecker ===
export function KeywordDensityChecker() {
  const [text, setText] = useState(''); const [keyword, setKeyword] = useState(''); const [density, setDensity] = useState<{ count: number; total: number; percentage: number } | null>(null);
  const check = () => {
    const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
    const kw = keyword.toLowerCase(); const count = words.filter(w => w === kw).length; const total = words.length;
    setDensity({ count, total, percentage: total > 0 ? (count / total) * 100 : 0 });
  };

  return (
    <div className={cardClass}>
      <div className={headerClass}><Search className="w-5 h-5 text-amber-500" /><h3 className="text-lg font-bold text-[var(--text-primary)]">Keyword Density Checker</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1"><label className={labelClass}>Text</label><textarea value={text} onChange={e => setText(e.target.value)} rows={8} className={inputClass} /></div>
          <div className="space-y-1"><label className={labelClass}>Keyword</label><input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} className={inputClass} placeholder="Enter keyword to check..." /></div>
          <button onClick={check} className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm transition-colors">Check Density</button>
        </div>
        <div className={`${resultPanelClass} flex flex-col justify-center min-h-[200px]`}>{density ? (<div className="space-y-4"><div className="grid grid-cols-2 gap-3"><div className={statBoxClass}><p className="text-3xl font-extrabold text-amber-500">{density.count}</p><p className="text-xs text-[var(--text-muted)]">Occurrences</p></div><div className={statBoxClass}><p className="text-3xl font-extrabold">{density.total}</p><p className="text-xs text-[var(--text-muted)]">Total Words</p></div></div><div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl"><div className="flex justify-between items-center"><span className="text-sm font-bold text-[var(--text-secondary)]">Density</span><span className="text-2xl font-extrabold text-amber-500">{density.percentage.toFixed(2)}%</span></div><div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden mt-2"><div style={{ width: `${Math.min(density.percentage * 5, 100)}%` }} className="bg-amber-500 h-full rounded-full" /></div></div></div>) : (<p className="text-[var(--text-muted)] text-sm">Check keyword density in text</p>)}</div>
      </div>
    </div>
  );
}

// === 5. KeywordPlannerTool ===
const STOP_WORDS = new Set(['the','a','an','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','shall','can','need','dare','ought','used','to','of','in','for','on','with','at','by','from','as','into','through','during','before','after','above','below','between','out','off','over','under','again','further','then','once','here','there','when','where','why','how','all','each','every','both','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','just','because','but','and','or','if','while','that','this','these','those','it','its','also']);
export function KeywordPlannerTool() {
  const [text, setText] = useState(''); const [keywords, setKeywords] = useState<{ word: string; count: number; density: number }[]>([]);
  const extract = () => {
    const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
    const freq: Record<string, number> = {}; words.forEach(w => { if (w.length > 2 && !STOP_WORDS.has(w)) freq[w] = (freq[w] || 0) + 1; });
    const total = words.length;
    setKeywords(Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([word, count]) => ({ word, count, density: (count / total) * 100 })));
  };

  return (
    <div className={cardClass}>
      <div className={headerClass}><BarChart3 className="w-5 h-5 text-indigo-500" /><h3 className="text-lg font-bold text-[var(--text-primary)]">Keyword Planner Tool</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1"><label className={labelClass}>Text Content</label><textarea value={text} onChange={e => setText(e.target.value)} rows={8} className={inputClass} /></div>
          <button onClick={extract} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-colors">Extract Keywords</button>
        </div>
        <div className={`${resultPanelClass} flex flex-col min-h-[300px]`}>{keywords.length > 0 ? (<div className="space-y-1 max-h-[350px] overflow-y-auto">{keywords.map((k, i) => (<div key={i} className="flex items-center justify-between p-2 bg-[var(--bg-surface)] rounded-lg text-sm"><span className="flex items-center gap-2"><span className="text-xs text-[var(--text-muted)] w-5">{i + 1}</span>{k.word}</span><span className="font-mono text-xs text-[var(--text-muted)]">{k.count} ({k.density.toFixed(1)}%)</span></div>))}</div>) : (<p className="text-[var(--text-muted)] text-sm">Extract keywords from your content</p>)}</div>
      </div>
    </div>
  );
}

// === 6. SeoMetaTagGenerator ===
export function SeoMetaTagGenerator() {
  const [title, setTitle] = useState('My Amazing Page Title'); const [description, setDescription] = useState('This is a compelling meta description for search engines and social media platforms.'); const [keywords, setKeywords] = useState('toolzum, online tools, free tools'); const [result, setResult] = useState('');
  const generate = () => { setResult(`<title>${title}</title>\n<meta name="description" content="${description}" />\n<meta name="keywords" content="${keywords}" />\n<meta property="og:title" content="${title}" />\n<meta property="og:description" content="${description}" />\n<meta name="twitter:card" content="summary_large_image" />\n<meta name="twitter:title" content="${title}" />\n<meta name="twitter:description" content="${description}" />`); };

  return (
    <div className={cardClass}>
      <div className={headerClass}><Globe className="w-5 h-5 text-blue-500" /><h3 className="text-lg font-bold text-[var(--text-primary)]">SEO Meta Tag Generator</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1"><label className={labelClass}>Title ({title.length}/60)</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputClass} /></div>
          <div className="space-y-1"><label className={labelClass}>Description ({description.length}/160)</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={inputClass} /></div>
          <div className="space-y-1"><label className={labelClass}>Keywords</label><input type="text" value={keywords} onChange={e => setKeywords(e.target.value)} className={inputClass} /></div>
          <button onClick={generate} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-colors">Generate Meta Tags</button>
        </div>
        <div className={`${resultPanelClass} flex flex-col min-h-[200px]`}>{result ? (<><textarea readOnly value={result} rows={10} className={`${inputClass} font-mono text-xs`} /><div className="flex gap-1 mt-2"><button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className={actionBtnClass}><Copy size={14} /></button></div></>) : (<p className="text-[var(--text-muted)] text-sm">Fill fields and generate meta tags</p>)}</div>
      </div>
    </div>
  );
}

// === 7. SeoPreviewGenerator ===
export function SeoPreviewGenerator() {
  const [title, setTitle] = useState('Toolzum - Free Online Tools'); const [url, setUrl] = useState('https://toolzum.com/'); const [description, setDescription] = useState('Free online tools for developers, designers, and everyday tasks. No sign-up required, 100% browser-based.');
  const ogLength = title.length;
  const descLength = description.length;

  return (
    <div className={cardClass}>
      <div className={headerClass}><Globe className="w-5 h-5 text-emerald-500" /><h3 className="text-lg font-bold text-[var(--text-primary)]">SEO Preview Generator</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1"><label className={labelClass}>Title ({ogLength}/60) <span className={`font-normal ${ogLength > 60 ? 'text-red-500' : 'text-[var(--text-muted)]'}`}>{ogLength > 60 ? 'Too long!' : ''}</span></label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputClass} /></div>
          <div className="space-y-1"><label className={labelClass}>URL</label><input type="text" value={url} onChange={e => setUrl(e.target.value)} className={inputClass} /></div>
          <div className="space-y-1"><label className={labelClass}>Description ({descLength}/160) <span className={`font-normal ${descLength > 160 ? 'text-red-500' : 'text-[var(--text-muted)]'}`}>{descLength > 160 ? 'Too long!' : ''}</span></label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={inputClass} /></div>
        </div>
        <div className={`${resultPanelClass} flex flex-col justify-center min-h-[200px]`}>
          <p className="text-xs font-bold text-[var(--text-muted)] uppercase mb-3">Google SERP Preview</p>
          <div className="p-4 border border-[var(--border-subtle)] rounded-xl bg-white dark:bg-[var(--bg-surface)]">
            <div className="text-xs text-green-700 dark:text-green-400 mb-1">{url}</div>
            <div className="text-xl text-blue-600 dark:text-blue-400 font-medium leading-tight mb-1 hover:underline cursor-pointer">{title}</div>
            <div className="text-sm text-zinc-600 dark:text-[var(--text-muted)] leading-snug">{description}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// === 8. SeoHeadlineAnalyzer ===
const POWER_WORDS = ['amazing','essential','exclusive','guaranteed','instant','powerful','proven','simple','ultimate','urgent','free','new','secret','hidden','shocking','remarkable','complete','easy','fast','best'];
export function SeoHeadlineAnalyzer() {
  const [headline, setHeadline] = useState('10 Amazing SEO Tips for Better Rankings'); const [analysis, setAnalysis] = useState<{ wordCount: number; charCount: number; powerWords: string[]; sentiment: string; score: number } | null>(null);
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

  return (
    <div className={cardClass}>
      <div className={headerClass}><BarChart3 className="w-5 h-5 text-rose-500" /><h3 className="text-lg font-bold text-[var(--text-primary)]">SEO Headline Analyzer</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1"><label className={labelClass}>Headline</label><input type="text" value={headline} onChange={e => setHeadline(e.target.value)} className={inputClass} /></div>
          <button onClick={analyze} className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-sm transition-colors">Analyze</button>
        </div>
        <div className={`${resultPanelClass} flex flex-col min-h-[200px]`}>{analysis ? (<div className="space-y-3">
          <div className={`p-4 rounded-xl text-center ${analysis.score >= 70 ? 'bg-emerald-50 dark:bg-emerald-900/20' : analysis.score >= 40 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}><span className="text-xs text-[var(--text-muted)]">SEO Score</span><p className={`text-4xl font-extrabold ${analysis.score >= 70 ? 'text-emerald-500' : analysis.score >= 40 ? 'text-amber-500' : 'text-red-500'}`}>{analysis.score}/100</p></div>
          <div className="grid grid-cols-2 gap-2 text-xs"><div className="p-2 bg-[var(--bg-surface)] rounded-lg"><span className="text-[var(--text-muted)]">Words</span><p className="font-bold">{analysis.wordCount}</p></div><div className="p-2 bg-[var(--bg-surface)] rounded-lg"><span className="text-[var(--text-muted)]">Chars</span><p className="font-bold">{analysis.charCount}</p></div><div className="p-2 bg-[var(--bg-surface)] rounded-lg"><span className="text-[var(--text-muted)]">Sentiment</span><p className="font-bold">{analysis.sentiment}</p></div><div className="p-2 bg-[var(--bg-surface)] rounded-lg"><span className="text-[var(--text-muted)]">Power Words</span><p className="font-bold">{analysis.powerWords.length}</p></div></div>
          {analysis.powerWords.length > 0 && <div className="flex flex-wrap gap-1">{analysis.powerWords.map((w, i) => (<span key={i} className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded text-xs font-medium">{w}</span>))}</div>}
        </div>) : (<p className="text-[var(--text-muted)] text-sm">Enter a headline to analyze</p>)}</div>
      </div>
    </div>
  );
}

// === 9. SeoSchemaGenerator ===
export function SeoSchemaGenerator() {
  const [type, setType] = useState('Article'); const [data, setData] = useState('{"headline": "Sample Article", "description": "Article description"}'); const [result, setResult] = useState('');
  const generate = () => { try { const parsed = JSON.parse(data); setResult(JSON.stringify({ '@context': 'https://schema.org', '@type': type, ...parsed }, null, 2)); } catch { setResult('Invalid JSON input'); } };

  return (
    <div className={cardClass}>
      <div className={headerClass}><Sigma className="w-5 h-5 text-indigo-500" /><h3 className="text-lg font-bold text-[var(--text-primary)]">SEO Schema Generator</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1"><label className={labelClass}>Schema Type</label><select value={type} onChange={e => setType(e.target.value)} className={inputClass}><option value="Article">Article</option><option value="Product">Product</option><option value="FAQPage">FAQ</option><option value="LocalBusiness">LocalBusiness</option><option value="Recipe">Recipe</option><option value="Event">Event</option></select></div>
          <div className="space-y-1"><label className={labelClass}>Properties (JSON)</label><textarea value={data} onChange={e => setData(e.target.value)} rows={6} className={`${inputClass} font-mono text-xs`} /></div>
          <button onClick={generate} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-colors">Generate Schema</button>
        </div>
        <div className={`${resultPanelClass} flex flex-col min-h-[200px]`}>{result ? (<><textarea readOnly value={result} rows={10} className={`${inputClass} font-mono text-xs`} /><button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className={actionBtnClass + ' mt-2 self-start'}><Copy size={14} /></button></>) : (<p className="text-[var(--text-muted)] text-sm">Generate JSON-LD schema markup</p>)}</div>
      </div>
    </div>
  );
}

// === 10. SeoSlugGenerator ===
export function SeoSlugGenerator() {
  const [text, setText] = useState('How to Write SEO-Friendly URLs'); const [slug, setSlug] = useState('');
  const generate = () => { setSlug(text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')); };

  return (
    <div className={cardClass}>
      <div className={headerClass}><Link className="w-5 h-5 text-cyan-500" /><h3 className="text-lg font-bold text-[var(--text-primary)]">SEO Slug Generator</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1"><label className={labelClass}>Text</label><input type="text" value={text} onChange={e => setText(e.target.value)} className={inputClass} /></div>
          <button onClick={generate} className={btnPrimary}>Generate Slug</button>
        </div>
        <div className={`${resultPanelClass} flex flex-col justify-center items-center min-h-[100px]`}>{slug ? (<div className="text-center"><p className="text-lg font-mono font-bold text-[var(--text-primary)] break-all">{slug}</p><button onClick={() => { clipboardWrite(slug); toast.success('Copied!'); }} className={actionBtnClass + ' mt-2'}><Copy size={14} /></button></div>) : (<p className="text-[var(--text-muted)] text-sm">Generate a URL-friendly slug</p>)}</div>
      </div>
    </div>
  );
}

// === 11. CaseConverter ===
export function CaseConverter() {
  const [text, setText] = useState('hello world from toolzum'); const [result, setResult] = useState('');
  const convert = (type: string) => { switch (type) { case 'upper': setResult(text.toUpperCase()); break; case 'lower': setResult(text.toLowerCase()); break; case 'title': setResult(text.replace(/\b\w/g, c => c.toUpperCase())); break; case 'sentence': setResult(text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()); break; case 'camel': setResult(text.replace(/[^\w\s]/g, '').split(/\s+/).map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')); break; case 'pascal': setResult(text.replace(/[^\w\s]/g, '').split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')); break; case 'snake': setResult(text.replace(/[^\w\s]/g, '').split(/\s+/).map(w => w.toLowerCase()).join('_')); break; case 'kebab': setResult(text.replace(/[^\w\s]/g, '').split(/\s+/).map(w => w.toLowerCase()).join('-')); break; } };

  return (
    <div className={cardClass}>
      <div className={headerClass}><Edit3 className="w-5 h-5 text-emerald-500" /><h3 className="text-lg font-bold text-[var(--text-primary)]">Case Converter</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1"><label className={labelClass}>Text</label><textarea value={text} onChange={e => setText(e.target.value)} rows={5} className={inputClass} /></div>
          <div className="flex flex-wrap gap-2">{[['UPPER','upper'],['lower','lower'],['Title Case','title'],['Sentence','sentence'],['camelCase','camel'],['PascalCase','pascal'],['snake_case','snake'],['kebab-case','kebab']].map(([label, id]) => (<button key={id} onClick={() => convert(id)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-emerald-400 transition-colors">{label}</button>))}</div>
        </div>
        <div className={`${resultPanelClass} flex flex-col min-h-[150px]`}>{result ? (<><textarea readOnly value={result} rows={5} className={`${inputClass} resize-none`} /><button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className={actionBtnClass + ' mt-2 self-start'}><Copy size={14} /></button></>) : (<p className="text-[var(--text-muted)] text-sm">Enter text and choose a case</p>)}</div>
      </div>
    </div>
  );
}

// === 12. TextReplacer ===
export function TextReplacer() {
  const [text, setText] = useState(''); const [find, setFind] = useState(''); const [replace, setReplace] = useState(''); const [result, setResult] = useState('');
  const replaceAll = () => { if (!find) return; setResult(text.split(find).join(replace)); };
  const count = result ? (text.match(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length : 0;

  return (
    <div className={cardClass}>
      <div className={headerClass}><Edit3 className="w-5 h-5 text-blue-500" /><h3 className="text-lg font-bold text-[var(--text-primary)]">Text Replacer</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1"><label className={labelClass}>Text</label><textarea value={text} onChange={e => setText(e.target.value)} rows={6} className={inputClass} /></div>
          <div className="grid grid-cols-2 gap-3"><div className="space-y-1"><label className={labelClass}>Find</label><input type="text" value={find} onChange={e => setFind(e.target.value)} className={inputClass} /></div><div className="space-y-1"><label className={labelClass}>Replace With</label><input type="text" value={replace} onChange={e => setReplace(e.target.value)} className={inputClass} /></div></div>
          <button onClick={replaceAll} className={btnPrimary}>Replace All</button>
        </div>
        <div className={`${resultPanelClass} flex flex-col min-h-[250px]`}>{result ? (<><textarea readOnly value={result} rows={8} className={`${inputClass} resize-none`} /><div className="flex items-center justify-between mt-2"><span className="text-xs text-[var(--text-muted)]">{count} replacement{count !== 1 ? 's' : ''}</span><button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className={actionBtnClass}><Copy size={14} /></button></div></>) : (<p className="text-[var(--text-muted)] text-sm">Find and replace text</p>)}</div>
      </div>
    </div>
  );
}

// === 13. TextSorter ===
export function TextSorter() {
  const [text, setText] = useState('banana\napple\ndate\ncherry\nelderberry'); const [sorted, setSorted] = useState(''); const [sortMethod, setSortMethod] = useState('');
  const sort = (method: string) => { setSortMethod(method); const lines = text.split('\n'); switch (method) { case 'az': setSorted([...lines].sort((a, b) => a.localeCompare(b)).join('\n')); break; case 'za': setSorted([...lines].sort((a, b) => b.localeCompare(a)).join('\n')); break; case 'length': setSorted([...lines].sort((a, b) => a.length - b.length).join('\n')); break; case 'random': setSorted([...lines].sort(() => Math.random() - 0.5).join('\n')); break; case 'unique': setSorted([...new Set(lines)].join('\n')); break; } };
  const inLines = text.split('\n').filter(l => l.trim()).length;
  const outLines = sorted ? sorted.split('\n').filter(l => l.trim()).length : 0;

  return (
    <div className={cardClass}>
      <div className={headerClass}><ListOrdered className="w-5 h-5 text-violet-500" /><h3 className="text-lg font-bold text-[var(--text-primary)]">Text Sorter</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1"><label className={labelClass}>Lines ({inLines})</label><textarea value={text} onChange={e => setText(e.target.value)} rows={8} className={`${inputClass} font-mono text-xs`} /></div>
          <div className="flex flex-wrap gap-2">{[['A→Z','az'],['Z→A','za'],['By Length','length'],['Randomize','random'],['Deduplicate','unique']].map(([label, id]) => (<button key={id} onClick={() => sort(id)} className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${sortMethod === id ? 'bg-violet-500/10 border-violet-400 text-violet-500' : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>{label}</button>))}</div>
        </div>
        <div className={`${resultPanelClass} flex flex-col min-h-[250px]`}>{sorted ? (<><textarea readOnly value={sorted} rows={8} className={`${inputClass} font-mono text-xs resize-none`} /><div className="flex items-center justify-between mt-2"><span className="text-xs text-[var(--text-muted)]">{outLines} lines (was {inLines})</span><button onClick={() => { clipboardWrite(sorted); toast.success('Copied!'); }} className={actionBtnClass}><Copy size={14} /></button></div></>) : (<p className="text-[var(--text-muted)] text-sm">Enter lines and choose sort method</p>)}</div>
      </div>
    </div>
  );
}

// === 14. TextDeduplicator ===
export function TextDeduplicator() {
  const [text, setText] = useState(''); const [result, setResult] = useState('');
  const inLines = text.split('\n').filter(l => l.trim()).length;
  const deduplicate = () => { const lines = text.split('\n').map(l => l.trim()).filter(Boolean); setResult([...new Set(lines)].join('\n')); };

  return (
    <div className={cardClass}>
      <div className={headerClass}><Trash2 className="w-5 h-5 text-rose-500" /><h3 className="text-lg font-bold text-[var(--text-primary)]">Text Deduplicator</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1"><label className={labelClass}>Text Lines</label><textarea value={text} onChange={e => setText(e.target.value)} rows={8} className={`${inputClass} font-mono text-xs`} /></div>
          <button onClick={deduplicate} className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-sm transition-colors">Remove Duplicates</button>
        </div>
        <div className={`${resultPanelClass} flex flex-col min-h-[250px]`}>{result ? (<><textarea readOnly value={result} rows={8} className={`${inputClass} font-mono text-xs resize-none`} /><div className="flex items-center justify-between mt-2"><span className="text-xs text-[var(--text-muted)]">{result.split('\n').length} unique lines (from {inLines})</span><button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className={actionBtnClass}><Copy size={14} /></button></div></>) : (<p className="text-[var(--text-muted)] text-sm">Paste lines to deduplicate</p>)}</div>
      </div>
    </div>
  );
}

// === 15. TextDiffChecker ===
export function TextDiffChecker() {
  const [text1, setText1] = useState('The quick brown fox\njumps over the lazy dog'); const [text2, setText2] = useState('The quick brown fox\njumps over the sleepy cat'); const [diff, setDiff] = useState<{ lines: { text: string; type: 'same' | 'added' | 'removed' }[] } | null>(null);
  const compare = () => {
    const lines1 = text1.split('\n'); const lines2 = text2.split('\n'); const maxLen = Math.max(lines1.length, lines2.length);
    const lines: { text: string; type: 'same' | 'added' | 'removed' }[] = [];
    for (let i = 0; i < maxLen; i++) { if (i >= lines1.length) lines.push({ text: lines2[i], type: 'added' }); else if (i >= lines2.length) lines.push({ text: lines1[i], type: 'removed' }); else if (lines1[i] === lines2[i]) lines.push({ text: lines1[i], type: 'same' }); else { lines.push({ text: lines1[i], type: 'removed' }); lines.push({ text: lines2[i], type: 'added' }); } }
    setDiff({ lines });
  };
  const added = diff ? diff.lines.filter(l => l.type === 'added').length : 0;
  const removed = diff ? diff.lines.filter(l => l.type === 'removed').length : 0;

  return (
    <div className={cardClass}>
      <div className={headerClass}><GitCompare className="w-5 h-5 text-emerald-500" /><h3 className="text-lg font-bold text-[var(--text-primary)]">Text Diff Checker</h3></div>
      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-2 gap-4"><div className="space-y-1"><label className={labelClass}>Original Text</label><textarea value={text1} onChange={e => setText1(e.target.value)} rows={6} className={`${inputClass} font-mono text-xs`} /></div><div className="space-y-1"><label className={labelClass}>New Text</label><textarea value={text2} onChange={e => setText2(e.target.value)} rows={6} className={`${inputClass} font-mono text-xs`} /></div></div>
        <button onClick={compare} className={btnPrimary + ' self-start'}>Compare</button>
        {diff && (<div className={`${resultPanelClass}`}><div className="flex items-center gap-3 mb-3 text-xs"><span className="text-emerald-500 font-bold">+{added} added</span><span className="text-red-500 font-bold">-{removed} removed</span></div><div className="font-mono text-xs max-h-[300px] overflow-y-auto space-y-0.5">{diff.lines.map((l, i) => (<div key={i} className={`p-1 rounded ${l.type === 'same' ? '' : l.type === 'added' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300'}`}><span className="mr-2 font-bold">{l.type === 'added' ? '+' : l.type === 'removed' ? '-' : ' '}</span>{l.text || ' '}</div>))}</div></div>)}
      </div>
    </div>
  );
}

// === 16/17. TextToHtmlConverter / HtmlToTextConverter ===
function TextHtmlTool({ defaultMode }: { defaultMode: 'text-to-html' | 'html-to-text' }) {
  const [mode, setMode] = useState(defaultMode); const [input, setInput] = useState(''); const [result, setResult] = useState('');
  useEffect(() => { setMode(defaultMode); setInput(''); setResult(''); }, [defaultMode]);
  const convert = () => { const val = input.trim(); if (!val) { setResult(''); return; } try { if (mode === 'text-to-html') { const paragraphs = val.split(/\n\s*\n/).filter(p => p.trim()); setResult(paragraphs.map(p => `<p>${p.split('\n').filter(l => l.trim()).join('<br />')}</p>`).join('\n')); } else { setResult(val.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\n\s*\n/g, '\n\n').trim()); } } catch { setResult(''); } };
  const isTextToHtml = mode === 'text-to-html';

  return (
    <div className={cardClass}>
      <div className={headerClass}><ArrowLeftRight className="w-5 h-5 text-blue-500" /><h3 className="text-lg font-bold text-[var(--text-primary)]">{isTextToHtml ? 'Text to HTML Converter' : 'HTML to Text Converter'}</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1"><label className={labelClass}>{isTextToHtml ? 'Plain Text' : 'HTML'}</label><textarea value={input} onChange={e => setInput(e.target.value)} rows={8} className={`${inputClass} ${!isTextToHtml ? 'font-mono text-xs' : ''}`} /></div>
          <div className="flex flex-wrap gap-2"><button onClick={convert} className={btnPrimary}>Convert to {isTextToHtml ? 'HTML' : 'Text'}</button><button onClick={() => setMode(isTextToHtml ? 'html-to-text' : 'text-to-html')} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Switch ↻</button></div>
        </div>
        <div className={`${resultPanelClass} flex flex-col min-h-[250px]`}>{result ? (<><textarea readOnly value={result} rows={8} className={`${inputClass} ${isTextToHtml ? 'font-mono text-xs' : ''} resize-none`} /><button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className={actionBtnClass + ' mt-2 self-start'}><Copy size={14} /></button></>) : (<p className="text-[var(--text-muted)] text-sm">Enter content to convert</p>)}</div>
      </div>
    </div>
  );
}
export function TextToHtmlConverter() { return <TextHtmlTool defaultMode="text-to-html" />; }
export function HtmlToTextConverter() { return <TextHtmlTool defaultMode="html-to-text" />; }

// === 18. MarkdownPreviewer ===
export function MarkdownPreviewer() {
  const [md, setMd] = useState('# Hello World\n\nThis is **bold** and *italic* text.\n\n- List item 1\n- List item 2\n\n```\ncode block\n```\n\n> Blockquote'); const [html, setHtml] = useState('');
  const preview = () => {
    let h = md.replace(/^###### (.*$)/gm, '<h6>$1</h6>').replace(/^##### (.*$)/gm, '<h5>$1</h5>').replace(/^#### (.*$)/gm, '<h4>$1</h4>').replace(/^### (.*$)/gm, '<h3>$1</h3>').replace(/^## (.*$)/gm, '<h2>$1</h2>').replace(/^# (.*$)/gm, '<h1>$1</h1>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/`{3}([\s\S]*?)`{3}/g, '<pre><code>$1</code></pre>').replace(/`(.*?)`/g, '<code>$1</code>').replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>').replace(/^- (.*$)/gm, '<li>$1</li>').replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>').replace(/\n\n/g, '</p><p>').replace(/^(?!<[hulpb])/gm, '');
    h = `<p>${h}</p>`.replace(/<p><\/p>/g, '');
    setHtml(h);
  };

  return (
    <div className={cardClass}>
      <div className={headerClass}><FileText className="w-5 h-5 text-amber-500" /><h3 className="text-lg font-bold text-[var(--text-primary)]">Markdown Previewer</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1"><label className={labelClass}>Markdown</label><textarea value={md} onChange={e => setMd(e.target.value)} rows={10} className={`${inputClass} font-mono text-xs resize-none`} /></div>
          <button onClick={preview} className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm transition-colors">Preview</button>
        </div>
        <div className={`${resultPanelClass} min-h-[300px] prose prose-sm dark:prose-invert max-w-none overflow-auto`}>{html ? <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} /> : <p className="text-[var(--text-muted)] text-sm">Click Preview to render</p>}</div>
      </div>
    </div>
  );
}

// === 19. DuplicateWordRemover ===
export function DuplicateWordRemover() {
  const [text, setText] = useState(''); const [result, setResult] = useState('');
  const remove = () => { const words = text.split(/\s+/); const seen = new Set<string>(); const out: string[] = []; words.forEach(w => { const key = w.toLowerCase(); if (!seen.has(key)) { seen.add(key); out.push(w); } }); setResult(out.join(' ')); };
  const inWords = text.trim() ? text.split(/\s+/).length : 0;
  const outWords = result.trim() ? result.split(/\s+/).length : 0;

  return (
    <div className={cardClass}>
      <div className={headerClass}><SpellCheck className="w-5 h-5 text-emerald-500" /><h3 className="text-lg font-bold text-[var(--text-primary)]">Duplicate Word Remover</h3></div>
      <p className="text-sm text-[var(--text-secondary)]">Removes duplicate words within text. For removing duplicate <em>lines</em>, use <a href="/developer/text-deduplicator" className="text-[var(--accent)] hover:underline">Text Deduplicator</a>.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4"><div className="space-y-1"><label className={labelClass}>Text ({inWords} words)</label><textarea value={text} onChange={e => setText(e.target.value)} rows={6} className={inputClass} /></div><button onClick={remove} className={btnPrimary}>Remove Duplicate Words</button></div>
        <div className={`${resultPanelClass} flex flex-col min-h-[200px]`}>{result ? (<><textarea readOnly value={result} rows={6} className={`${inputClass} resize-none`} /><div className="flex items-center justify-between mt-2"><span className="text-xs text-[var(--text-muted)]">{outWords} unique words ({inWords - outWords} removed)</span><button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className={actionBtnClass}><Copy size={14} /></button></div></>) : (<p className="text-[var(--text-muted)] text-sm">Paste text to remove duplicate words</p>)}</div>
      </div>
    </div>
  );
}

// === 20. TextCleaner ===
export function TextCleaner() {
  const [text, setText] = useState(''); const [result, setResult] = useState('');
  const clean = () => { let t = text; t = t.replace(/\s+/g, ' '); t = t.replace(/\n{3,}/g, '\n\n'); t = t.replace(/[^\S\n]+$/gm, ''); t = t.replace(/^[^\S\n]+/gm, ''); setResult(t.trim()); };

  return (
    <div className={cardClass}>
      <div className={headerClass}><Scissors className="w-5 h-5 text-cyan-500" /><h3 className="text-lg font-bold text-[var(--text-primary)]">Text Cleaner</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4"><div className="space-y-1"><label className={labelClass}>Text</label><textarea value={text} onChange={e => setText(e.target.value)} rows={6} className={inputClass} /></div><button onClick={clean} className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-sm transition-colors">Clean Text</button></div>
        <div className={`${resultPanelClass} flex flex-col min-h-[200px]`}>{result ? (<><textarea readOnly value={result} rows={6} className={`${inputClass} resize-none`} /><button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className={actionBtnClass + ' mt-2 self-start'}><Copy size={14} /></button></>) : (<p className="text-[var(--text-muted)] text-sm">Normalize whitespace and clean text</p>)}</div>
      </div>
    </div>
  );
}

// === 21. TextSplitter ===
export function TextSplitter() {
  const [text, setText] = useState(''); const [delimiter, setDelimiter] = useState(','); const [result, setResult] = useState('');
  const split = () => { if (!delimiter) return; const parts = text.split(delimiter).map(s => s.trim()).filter(Boolean); setResult(parts.map((p, i) => `${i + 1}. ${p}`).join('\n')); };
  const count = result ? result.split('\n').length : 0;

  return (
    <div className={cardClass}>
      <div className={headerClass}><Scissors className="w-5 h-5 text-violet-500" /><h3 className="text-lg font-bold text-[var(--text-primary)]">Text Splitter</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4"><div className="space-y-1"><label className={labelClass}>Text</label><textarea value={text} onChange={e => setText(e.target.value)} rows={6} className={inputClass} /></div><div className="space-y-1"><label className={labelClass}>Delimiter</label><input type="text" value={delimiter} onChange={e => setDelimiter(e.target.value)} className={inputClass} /></div><button onClick={split} className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-sm transition-colors">Split</button></div>
        <div className={`${resultPanelClass} flex flex-col min-h-[200px]`}>{result ? (<><textarea readOnly value={result} rows={8} className={`${inputClass} font-mono text-xs resize-none`} /><div className="flex items-center justify-between mt-2"><span className="text-xs text-[var(--text-muted)]">{count} parts</span><button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className={actionBtnClass}><Copy size={14} /></button></div></>) : (<p className="text-[var(--text-muted)] text-sm">Split text by delimiter</p>)}</div>
      </div>
    </div>
  );
}

// === 22. TrailingSpaceRemover ===
export function TrailingSpaceRemover() {
  const [text, setText] = useState(''); const [result, setResult] = useState('');
  const trim = () => { setResult(text.split('\n').map(l => l.trimEnd()).join('\n').trim()); };
  const trimmed = result ? text.split('\n').length - result.split('\n').length : 0;

  return (
    <div className={cardClass}>
      <div className={headerClass}><Trash2 className="w-5 h-5 text-zinc-500" /><h3 className="text-lg font-bold text-[var(--text-primary)]">Trailing Space Remover</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4"><div className="space-y-1"><label className={labelClass}>Text</label><textarea value={text} onChange={e => setText(e.target.value)} rows={6} className={`${inputClass} font-mono text-xs`} /></div><button onClick={trim} className={btnPrimary}>Trim Trailing Spaces</button></div>
        <div className={`${resultPanelClass} flex flex-col min-h-[200px]`}>{result ? (<><textarea readOnly value={result} rows={6} className={`${inputClass} font-mono text-xs resize-none`} /><div className="flex items-center justify-between mt-2"><span className="text-xs text-[var(--text-muted)]">Trimmed {trimmed} line{trimmed !== 1 ? 's' : ''}</span><button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className={actionBtnClass}><Copy size={14} /></button></div></>) : (<p className="text-[var(--text-muted)] text-sm">Remove trailing whitespace</p>)}</div>
      </div>
    </div>
  );
}

// === 23. CanonicalUrlChecker ===
export function CanonicalUrlChecker() {
  const [url, setUrl] = useState('https://example.com/blog/my-article'); const [result, setResult] = useState('');
  const check = () => { try { new URL(url); } catch { setResult('Invalid URL'); return; } const u = new URL(url); setResult([`✓ Valid URL format`,`Protocol: ${u.protocol}`,`Domain: ${u.hostname}`,`Path: ${u.pathname}`,u.hash ? '⚠️ Has fragment (#) — search engines may ignore' : '✓ No fragment',u.search ? '⚠️ Has query params — ensure these are the canonical version' : '✓ No query params',u.pathname.endsWith('/') ? '✓ Ends with /' : 'ℹ️ No trailing slash',u.hostname.startsWith('www.') ? 'ℹ️ With www' : 'ℹ️ Without www'].join('\n')); };

  return (
    <div className={cardClass}>
      <div className={headerClass}><Link className="w-5 h-5 text-blue-500" /><h3 className="text-lg font-bold text-[var(--text-primary)]">Canonical URL Checker</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4"><div className="space-y-1"><label className={labelClass}>URL</label><input type="url" value={url} onChange={e => setUrl(e.target.value)} className={inputClass} /></div><button onClick={check} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-colors">Check URL</button></div>
        <div className={`${resultPanelClass} flex flex-col min-h-[200px]`}>{result ? (<pre className="text-sm font-mono whitespace-pre-wrap">{result}</pre>) : (<p className="text-[var(--text-muted)] text-sm">Check canonical URL structure</p>)}</div>
      </div>
    </div>
  );
}

// === 24. BreadcrumbSchemaGenerator ===
export function BreadcrumbSchemaGenerator() {
  const [pages, setPages] = useState('Home,https://example.com\nProducts,https://example.com/products\nWidgets,https://example.com/widgets'); const [result, setResult] = useState('');
  const generate = () => { const items = pages.split('\n').filter(l => l.trim()).map(l => { const [name, url] = l.split(',').map(s => s.trim()); return { name, url }; }); if (items.length < 2) return; setResult(JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": items.map((item, i) => ({ "@type": "ListItem", "position": i + 1, "name": item.name, "item": item.url })) }, null, 2)); };

  return (
    <div className={cardClass}>
      <div className={headerClass}><Rows3 className="w-5 h-5 text-amber-500" /><h3 className="text-lg font-bold text-[var(--text-primary)]">Breadcrumb Schema Generator</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4"><div className="space-y-1"><label className={labelClass}>Pages (Name,URL per line)</label><textarea value={pages} onChange={e => setPages(e.target.value)} rows={5} className={`${inputClass} font-mono text-xs`} /></div><button onClick={generate} className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm transition-colors">Generate Breadcrumb Schema</button></div>
        <div className={`${resultPanelClass} flex flex-col min-h-[200px]`}>{result ? (<><textarea readOnly value={result} rows={10} className={`${inputClass} font-mono text-xs resize-none`} /><button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className={actionBtnClass + ' mt-2 self-start'}><Copy size={14} /></button></>) : (<p className="text-[var(--text-muted)] text-sm">Generate breadcrumb JSON-LD schema</p>)}</div>
      </div>
    </div>
  );
}

// === 25. UtmBuilder ===
export function UtmBuilder() {
  const [baseUrl, setBaseUrl] = useState('https://example.com'); const [source, setSource] = useState('newsletter'); const [medium, setMedium] = useState('email'); const [campaign, setCampaign] = useState('spring_sale'); const [term, setTerm] = useState(''); const [content, setContent] = useState(''); const [result, setResult] = useState('');
  const build = () => { try { new URL(baseUrl); } catch { return; } const u = new URL(baseUrl); u.searchParams.set('utm_source', source); u.searchParams.set('utm_medium', medium); u.searchParams.set('utm_campaign', campaign); if (term) u.searchParams.set('utm_term', term); if (content) u.searchParams.set('utm_content', content); setResult(u.toString()); };

  return (
    <div className={cardClass}>
      <div className={headerClass}><Link className="w-5 h-5 text-emerald-500" /><h3 className="text-lg font-bold text-[var(--text-primary)]">UTM Builder</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1"><label className={labelClass}>Base URL</label><input type="url" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} className={inputClass} /></div>
          <div className="grid grid-cols-2 gap-3"><div className="space-y-1"><label className={labelClass}>Source</label><input type="text" value={source} onChange={e => setSource(e.target.value)} className={inputClass} /></div><div className="space-y-1"><label className={labelClass}>Medium</label><input type="text" value={medium} onChange={e => setMedium(e.target.value)} className={inputClass} /></div><div className="space-y-1"><label className={labelClass}>Campaign</label><input type="text" value={campaign} onChange={e => setCampaign(e.target.value)} className={inputClass} /></div><div className="space-y-1"><label className={labelClass}>Term (opt)</label><input type="text" value={term} onChange={e => setTerm(e.target.value)} className={inputClass} /></div></div>
          <div className="space-y-1"><label className={labelClass}>Content (opt)</label><input type="text" value={content} onChange={e => setContent(e.target.value)} className={inputClass} /></div>
          <button onClick={build} className={btnPrimary}>Build UTM URL</button>
        </div>
        <div className={`${resultPanelClass} flex flex-col min-h-[200px]`}>{result ? (<><input readOnly value={result} className={inputClass} /><button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className={actionBtnClass + ' mt-2 self-start'}><Copy size={14} /></button></>) : (<p className="text-[var(--text-muted)] text-sm">Fill fields to build a UTM-tagged URL</p>)}</div>
      </div>
    </div>
  );
}

"use client";
import React, { useState, useCallback, useEffect } from 'react';
import DOMPurify from 'dompurify';

const inputClass = "w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm";
const labelClass = "block text-sm font-medium mb-1";
const btnClass = "w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg text-sm transition-colors";
const cardClass = "max-w-xl mx-auto p-6";
const headingClass = "text-2xl font-bold mb-6";
const resultClass = "p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm";
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

// === 1. WordCounter ===
export function WordCounter() {
  const [text, setText] = useState('');
  const stats = (() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length;
    return { words, chars, charsNoSpace, sentences, paragraphs };
  })();

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Word Counter</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Text</label><textarea value={text} onChange={e => setText(e.target.value)} rows={8} className={inputClass} placeholder="Paste or type your text here..." /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-center"><div className="text-2xl font-bold">{stats.words}</div><div className="text-xs text-zinc-500">Words</div></div>
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-center"><div className="text-2xl font-bold">{stats.chars}</div><div className="text-xs text-zinc-500">Characters</div></div>
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-center"><div className="text-2xl font-bold">{stats.charsNoSpace}</div><div className="text-xs text-zinc-500">Chars (no space)</div></div>
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-center"><div className="text-2xl font-bold">{stats.sentences}</div><div className="text-xs text-zinc-500">Sentences</div></div>
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-center"><div className="text-2xl font-bold">{stats.paragraphs}</div><div className="text-xs text-zinc-500">Paragraphs</div></div>
        </div>
      </div>
    </div>
  );
}

// === 2. CharacterCounter ===
export function CharacterCounter() {
  const [text, setText] = useState('');
  const counts = {
    total: text.length,
    noSpace: text.replace(/\s/g, '').length,
    letters: (text.match(/[a-zA-Z]/g) || []).length,
    digits: (text.match(/[0-9]/g) || []).length,
    spaces: (text.match(/\s/g) || []).length,
    punctuation: (text.match(/[^\w\s]/g) || []).length,
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Character Counter</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Text</label><textarea value={text} onChange={e => setText(e.target.value)} rows={8} className={inputClass} placeholder="Type or paste text..." /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-center"><div className="text-2xl font-bold">{counts.total}</div><div className="text-xs text-zinc-500">Total</div></div>
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-center"><div className="text-2xl font-bold">{counts.noSpace}</div><div className="text-xs text-zinc-500">No Space</div></div>
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-center"><div className="text-2xl font-bold">{counts.letters}</div><div className="text-xs text-zinc-500">Letters</div></div>
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-center"><div className="text-2xl font-bold">{counts.digits}</div><div className="text-xs text-zinc-500">Digits</div></div>
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-center"><div className="text-2xl font-bold">{counts.spaces}</div><div className="text-xs text-zinc-500">Spaces</div></div>
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-center"><div className="text-2xl font-bold">{counts.punctuation}</div><div className="text-xs text-zinc-500">Punctuation</div></div>
        </div>
      </div>
    </div>
  );
}

// === 3. WordFrequencyCounter ===
export function WordFrequencyCounter() {
  const [text, setText] = useState('');
  const [limit, setLimit] = useState(20);
  const [frequencies, setFrequencies] = useState<{ word: string; count: number }[]>([]);

  const analyze = () => {
    const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
    const freq: Record<string, number> = {};
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([word, count]) => ({ word, count }));
    setFrequencies(sorted);
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Word Frequency Counter</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Text</label><textarea value={text} onChange={e => setText(e.target.value)} rows={6} className={inputClass} /></div>
        <div><label className={labelClass}>Show Top</label><input type="number" min={5} max={100} value={limit} onChange={e => setLimit(Number(e.target.value))} className={inputClass} /></div>
        <button onClick={analyze} className={btnClass}>Analyze</button>
        {frequencies.length > 0 && (
          <div className="mt-4 space-y-1">
            {frequencies.map((f, i) => (
              <div key={i} className="flex justify-between p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm">
                <span>{f.word}</span>
                <span className="font-mono">{f.count} ({((f.count / frequencies.reduce((a, b) => a + b.count, 0)) * 100).toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
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

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Keyword Density Checker</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Text</label><textarea value={text} onChange={e => setText(e.target.value)} rows={6} className={inputClass} /></div>
        <div><label className={labelClass}>Keyword</label><input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} className={inputClass} /></div>
        <button onClick={check} className={btnClass}>Check Density</button>
        {density && (
          <div className="space-y-2 mt-4">
            <div className="flex justify-between p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm"><span>Keyword Count</span><span className="font-mono">{density.count}</span></div>
            <div className="flex justify-between p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm"><span>Total Words</span><span className="font-mono">{density.total}</span></div>
            <div className="flex justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm font-bold"><span>Density</span><span className="font-mono">{density.percentage.toFixed(2)}%</span></div>
          </div>
        )}
      </div>
    </div>
  );
}

// === 5. KeywordPlannerTool ===
export function KeywordPlannerTool() {
  const [text, setText] = useState('');
  const [keywords, setKeywords] = useState<{ word: string; count: number; density: number }[]>([]);

  const extract = () => {
    const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
    const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'because', 'but', 'and', 'or', 'if', 'while', 'that', 'this', 'these', 'those', 'it', 'its', 'also']);
    const freq: Record<string, number> = {};
    words.forEach(w => {
      if (w.length > 2 && !stopWords.has(w)) freq[w] = (freq[w] || 0) + 1;
    });
    const total = words.length;
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([word, count]) => ({ word, count, density: (count / total) * 100 }));
    setKeywords(sorted);
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Keyword Planner Tool</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Text Content</label><textarea value={text} onChange={e => setText(e.target.value)} rows={6} className={inputClass} /></div>
        <button onClick={extract} className={btnClass}>Extract Keywords</button>
        {keywords.length > 0 && (
          <div className="mt-4 space-y-1">
            {keywords.map((k, i) => (
              <div key={i} className="flex justify-between p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm">
                <span>{k.word}</span>
                <span className="font-mono">{k.count} ({k.density.toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// === 6. SeoMetaTagGenerator ===
export function SeoMetaTagGenerator() {
  const [title, setTitle] = useState('My Amazing Page Title');
  const [description, setDescription] = useState('This is a compelling meta description for search engines and social media platforms.');
  const [keywords, setKeywords] = useState('toolzum, online tools, free tools');
  const [result, setResult] = useState('');
  const { copied, copy } = useCopy();

  const generate = () => {
    const tags = `<title>${title}</title>
<meta name="description" content="${description}" />
<meta name="keywords" content="${keywords}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />`;
    setResult(tags);
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>SEO Meta Tag Generator</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Title ({title.length}/60)</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Description ({description.length}/160)</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={inputClass} /></div>
        <div><label className={labelClass}>Keywords</label><input type="text" value={keywords} onChange={e => setKeywords(e.target.value)} className={inputClass} /></div>
        <button onClick={generate} className={btnClass}>Generate Meta Tags</button>
        {result && <div className="mt-4"><textarea readOnly value={result} rows={8} className={`${inputClass} font-mono text-xs`} /><button onClick={() => copy(result)} className={`${secondaryBtnClass} mt-2`}>{copied ? 'Copied!' : 'Copy HTML'}</button></div>}
      </div>
    </div>
  );
}

// === 7. SeoPreviewGenerator ===
export function SeoPreviewGenerator() {
  const [title, setTitle] = useState('Toolzum - Free Online Tools');
  const [url, setUrl] = useState('https://toolzum.com/');
  const [description, setDescription] = useState('Free online tools for developers, designers, and everyday tasks. No sign-up required, 100% browser-based.');

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>SEO Preview Generator</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>URL</label><input type="text" value={url} onChange={e => setUrl(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={inputClass} /></div>
        <div className="mt-6 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl">
          <div className="text-xs text-green-700 dark:text-green-400 mb-1">{url}</div>
          <div className="text-xl text-blue-600 dark:text-blue-400 font-medium leading-tight mb-1 hover:underline cursor-pointer">{title}</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-snug">{description}</div>
        </div>
      </div>
    </div>
  );
}

// === 8. SeoHeadlineAnalyzer ===
const POWER_WORDS = ['amazing', 'essential', 'exclusive', 'guaranteed', 'instant', 'powerful', 'proven', 'simple', 'ultimate', 'urgent', 'free', 'new', 'secret', 'hidden', 'shocking', 'remarkable', 'complete', 'easy', 'fast', 'best'];
export function SeoHeadlineAnalyzer() {
  const [headline, setHeadline] = useState('10 Amazing SEO Tips for Better Rankings');
  const [analysis, setAnalysis] = useState<{
    wordCount: number;
    charCount: number;
    powerWords: string[];
    sentiment: string;
    score: number;
  } | null>(null);

  const analyze = () => {
    const words = headline.split(/\s+/).filter(Boolean);
    const found = words.filter(w => POWER_WORDS.includes(w.toLowerCase()));
    const wordCount = words.length;
    const charCount = headline.length;
    const positive = ['amazing', 'best', 'free', 'new', 'easy', 'fast', 'proven', 'simple', 'ultimate', 'essential'];
    const negative = ['worst', 'bad', 'terrible', 'awful', 'hate'];
    const posCount = words.filter(w => positive.includes(w.toLowerCase())).length;
    const negCount = words.filter(w => negative.includes(w.toLowerCase())).length;
    const sentiment = posCount > negCount ? 'Positive' : negCount > posCount ? 'Negative' : 'Neutral';
    const score = Math.min(100, Math.max(0, wordCount * 5 + found.length * 10 - Math.abs(charCount - 60) * 0.5));
    setAnalysis({ wordCount, charCount, powerWords: found, sentiment, score: Math.round(score) });
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>SEO Headline Analyzer</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Headline</label><input type="text" value={headline} onChange={e => setHeadline(e.target.value)} className={inputClass} /></div>
        <button onClick={analyze} className={btnClass}>Analyze</button>
        {analysis && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm"><span>Word Count</span><span className="font-mono">{analysis.wordCount}</span></div>
            <div className="flex justify-between p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm"><span>Character Count</span><span className="font-mono">{analysis.charCount}</span></div>
            <div className="flex justify-between p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm"><span>Sentiment</span><span className="font-mono">{analysis.sentiment}</span></div>
            <div className="flex justify-between p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm"><span>Power Words</span><span className="font-mono">{analysis.powerWords.length > 0 ? analysis.powerWords.join(', ') : 'None found'}</span></div>
            <div className="flex justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm font-bold"><span>SEO Score</span><span className="font-mono">{analysis.score}/100</span></div>
          </div>
        )}
      </div>
    </div>
  );
}

// === 9. SeoSchemaGenerator ===
export function SeoSchemaGenerator() {
  const [type, setType] = useState('Article');
  const [data, setData] = useState('{"headline": "Sample Article", "description": "Article description"}');
  const [result, setResult] = useState('');
  const { copied, copy } = useCopy();

  const generate = () => {
    let parsed: any;
    try { parsed = JSON.parse(data); } catch { setResult('Invalid JSON input'); return; }
    const base = { '@context': 'https://schema.org', '@type': type, ...parsed };
    setResult(JSON.stringify(base, null, 2));
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>SEO Schema Generator</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Schema Type</label>
          <select value={type} onChange={e => setType(e.target.value)} className={inputClass}>
            <option value="Article">Article</option>
            <option value="Product">Product</option>
            <option value="FAQPage">FAQ</option>
            <option value="LocalBusiness">LocalBusiness</option>
            <option value="Recipe">Recipe</option>
            <option value="Event">Event</option>
          </select>
        </div>
        <div><label className={labelClass}>Properties (JSON)</label><textarea value={data} onChange={e => setData(e.target.value)} rows={6} className={`${inputClass} font-mono text-xs`} /></div>
        <button onClick={generate} className={btnClass}>Generate Schema</button>
        {result && <div className="mt-4"><textarea readOnly value={result} rows={8} className={`${inputClass} font-mono text-xs`} /><button onClick={() => copy(result)} className={`${secondaryBtnClass} mt-2`}>{copied ? 'Copied!' : 'Copy JSON-LD'}</button></div>}
      </div>
    </div>
  );
}

// === 10. SeoSlugGenerator ===
export function SeoSlugGenerator() {
  const [text, setText] = useState('How to Write SEO-Friendly URLs');
  const [slug, setSlug] = useState('');
  const { copied, copy } = useCopy();

  const generate = () => {
    setSlug(text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''));
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>SEO Slug Generator</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Text</label><input type="text" value={text} onChange={e => setText(e.target.value)} className={inputClass} /></div>
        <button onClick={generate} className={btnClass}>Generate Slug</button>
        {slug && <div className={resultClass}>{slug}<button onClick={() => copy(slug)} className={`${secondaryBtnClass} mt-2 block`}>{copied ? 'Copied!' : 'Copy'}</button></div>}
      </div>
    </div>
  );
}

// === 11. CaseConverter ===
export function CaseConverter() {
  const [text, setText] = useState('hello world from toolzum');
  const [result, setResult] = useState('');
  const { copied, copy } = useCopy();

  const convert = (type: string) => {
    switch (type) {
      case 'upper': setResult(text.toUpperCase()); break;
      case 'lower': setResult(text.toLowerCase()); break;
      case 'title': setResult(text.replace(/\b\w/g, c => c.toUpperCase())); break;
      case 'sentence': setResult(text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()); break;
      case 'camel': setResult(text.replace(/[^\w\s]/g, '').split(/\s+/).map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')); break;
      case 'pascal': setResult(text.replace(/[^\w\s]/g, '').split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')); break;
      case 'snake': setResult(text.replace(/[^\w\s]/g, '').split(/\s+/).map(w => w.toLowerCase()).join('_')); break;
      case 'kebab': setResult(text.replace(/[^\w\s]/g, '').split(/\s+/).map(w => w.toLowerCase()).join('-')); break;
    }
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Case Converter</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Text</label><textarea value={text} onChange={e => setText(e.target.value)} rows={4} className={inputClass} /></div>
        <div className="flex flex-wrap gap-2">
          {['upper', 'lower', 'title', 'sentence', 'camel', 'pascal', 'snake', 'kebab'].map(c => (
            <button key={c} onClick={() => convert(c)} className="text-xs px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg font-medium">{c}</button>
          ))}
        </div>
        {result && <div className="mt-4"><textarea readOnly value={result} rows={3} className={inputClass} /><button onClick={() => copy(result)} className={`${secondaryBtnClass} mt-2`}>{copied ? 'Copied!' : 'Copy'}</button></div>}
      </div>
    </div>
  );
}

// === 12. TextReplacer ===
export function TextReplacer() {
  const [text, setText] = useState('');
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [result, setResult] = useState('');
  const { copied, copy } = useCopy();

  const replaceAll = () => {
    setResult(text.split(find).join(replace));
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Text Replacer</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Text</label><textarea value={text} onChange={e => setText(e.target.value)} rows={6} className={inputClass} /></div>
        <div className="flex gap-4">
          <div className="flex-1"><label className={labelClass}>Find</label><input type="text" value={find} onChange={e => setFind(e.target.value)} className={inputClass} /></div>
          <div className="flex-1"><label className={labelClass}>Replace With</label><input type="text" value={replace} onChange={e => setReplace(e.target.value)} className={inputClass} /></div>
        </div>
        <button onClick={replaceAll} className={btnClass}>Replace All</button>
        {result && <div className="mt-4"><textarea readOnly value={result} rows={6} className={inputClass} /><button onClick={() => copy(result)} className={`${secondaryBtnClass} mt-2`}>{copied ? 'Copied!' : 'Copy'}</button></div>}
      </div>
    </div>
  );
}

// === 13. TextSorter ===
export function TextSorter() {
  const [text, setText] = useState('banana\napple\ndate\ncherry\nelderberry');
  const [sorted, setSorted] = useState('');

  const sort = (method: string) => {
    const lines = text.split('\n');
    switch (method) {
      case 'az': setSorted([...lines].sort((a, b) => a.localeCompare(b)).join('\n')); break;
      case 'za': setSorted([...lines].sort((a, b) => b.localeCompare(a)).join('\n')); break;
      case 'length': setSorted([...lines].sort((a, b) => a.length - b.length).join('\n')); break;
      case 'random': setSorted([...lines].sort(() => Math.random() - 0.5).join('\n')); break;
      case 'unique': setSorted([...new Set(lines)].join('\n')); break;
    }
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Text Sorter</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Lines</label><textarea value={text} onChange={e => setText(e.target.value)} rows={8} className={`${inputClass} font-mono`} /></div>
        <div className="flex flex-wrap gap-2">
          {[{id:'az',label:'A→Z'},{id:'za',label:'Z→A'},{id:'length',label:'By Length'},{id:'random',label:'Randomize'},{id:'unique',label:'Remove Duplicates'}].map(m => (
            <button key={m.id} onClick={() => sort(m.id)} className="text-xs px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg font-medium">{m.label}</button>
          ))}
        </div>
        {sorted && <div className="mt-4"><textarea readOnly value={sorted} rows={8} className={`${inputClass} font-mono`} /></div>}
      </div>
    </div>
  );
}

// === 14. TextDeduplicator ===
export function TextDeduplicator() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const { copied, copy } = useCopy();

  const deduplicate = () => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    setResult([...new Set(lines)].join('\n'));
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Text Deduplicator</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Text Lines</label><textarea value={text} onChange={e => setText(e.target.value)} rows={8} className={inputClass} /></div>
        <button onClick={deduplicate} className={btnClass}>Remove Duplicates</button>
        {result && <div className="mt-4"><textarea readOnly value={result} rows={8} className={inputClass} /><button onClick={() => copy(result)} className={`${secondaryBtnClass} mt-2`}>{copied ? 'Copied!' : 'Copy'}</button></div>}
      </div>
    </div>
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
      else {
        lines.push({ text: lines1[i], type: 'removed' });
        lines.push({ text: lines2[i], type: 'added' });
      }
    }
    setDiff({ lines });
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Text Diff Checker</h1>
      <div className="space-y-3">
        <div className="flex gap-4">
          <div className="flex-1"><label className={labelClass}>Original Text</label><textarea value={text1} onChange={e => setText1(e.target.value)} rows={6} className={`${inputClass} font-mono text-xs`} /></div>
          <div className="flex-1"><label className={labelClass}>New Text</label><textarea value={text2} onChange={e => setText2(e.target.value)} rows={6} className={`${inputClass} font-mono text-xs`} /></div>
        </div>
        <button onClick={compare} className={btnClass}>Compare</button>
        {diff && (
          <div className="mt-4 space-y-0.5 font-mono text-xs">
            {diff.lines.map((l, i) => (
              <div key={i} className={`p-1 rounded ${l.type === 'same' ? '' : l.type === 'added' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300'}`}>
                <span className="mr-2">{l.type === 'added' ? '+' : l.type === 'removed' ? '-' : ' '}</span>{l.text || ' '}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// === 16/17. TextToHtmlConverter / HtmlToTextConverter (shared bidirectional) ===
function TextHtmlTool({ defaultMode }: { defaultMode: 'text-to-html' | 'html-to-text' }) {
  const [mode, setMode] = useState<'text-to-html' | 'html-to-text'>(defaultMode);
  const [input, setInput] = useState(mode === 'text-to-html' ? 'Line 1\n\nLine 2\nLine 3' : '<p>Hello <strong>world</strong></p><p>This is a <a href="#">link</a></p>');
  const [result, setResult] = useState('');
  const { copied, copy } = useCopy();

  useEffect(() => { setMode(defaultMode); setInput(''); setResult(''); }, [defaultMode]);

  const convert = () => {
    const val = input.trim();
    if (!val) { setResult(''); return; }
    try {
      if (mode === 'text-to-html') {
        const paragraphs = val.split(/\n\s*\n/).filter(p => p.trim());
        setResult(paragraphs.map(p => `<p>${p.split('\n').filter(l => l.trim()).join('<br />')}</p>`).join('\n'));
      } else {
        setResult(val.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\n\s*\n/g, '\n\n').trim());
      }
    } catch { setResult(''); }
  };

  const isTextToHtml = mode === 'text-to-html';
  const otherMode = isTextToHtml ? 'html-to-text' : 'text-to-html';

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between mb-6">
        <h1 className={headingClass}>{isTextToHtml ? 'Text to HTML Converter' : 'HTML to Text Converter'}</h1>
      </div>
      <div className="space-y-3">
        <div>
          <label className={labelClass}>{isTextToHtml ? 'Plain Text' : 'HTML'}</label>
          <textarea value={input} onChange={e => setInput(e.target.value)} rows={6}
            className={`${inputClass} ${!isTextToHtml ? 'font-mono text-xs' : ''}`} />
        </div>
        <button onClick={convert} className={btnClass}>Convert to {isTextToHtml ? 'HTML' : 'Text'}</button>
        <button onClick={() => setMode(otherMode)}
          className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Need to {isTextToHtml ? 'convert HTML back to text' : 'convert text to HTML'} instead? <span className="font-semibold">Switch →</span>
        </button>
        {result && (
          <div className="mt-4">
            <textarea readOnly value={result} rows={6} className={`${inputClass} ${isTextToHtml ? 'font-mono text-xs' : ''}`} />
            <button onClick={() => copy(result)} className={`${secondaryBtnClass} mt-2`}>{copied ? 'Copied!' : `Copy ${isTextToHtml ? 'HTML' : 'Text'}`}</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function TextToHtmlConverter() { return <TextHtmlTool defaultMode="text-to-html" />; }
export function HtmlToTextConverter() { return <TextHtmlTool defaultMode="html-to-text" />; }

// === 18. MarkdownPreviewer ===
export function MarkdownPreviewer() {
  const [md, setMd] = useState('# Hello World\n\nThis is **bold** and *italic* text.\n\n- List item 1\n- List item 2\n\n```\ncode block\n```\n\n> Blockquote');
  const [html, setHtml] = useState('');

  const preview = () => {
    let h = md
      .replace(/^###### (.*$)/gm, '<h6>$1</h6>')
      .replace(/^##### (.*$)/gm, '<h5>$1</h5>')
      .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`{3}([\s\S]*?)`{3}/g, '<pre><code>$1</code></pre>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[hulpb])/gm, '');
    h = `<p>${h}</p>`.replace(/<p><\/p>/g, '');
    setHtml(h);
  };

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Markdown Previewer</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Markdown</label><textarea value={md} onChange={e => setMd(e.target.value)} rows={8} className={`${inputClass} font-mono text-xs`} /></div>
        <button onClick={preview} className={btnClass}>Preview</button>
        {html && <div className="mt-4 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />}
      </div>
    </div>
  );
}

export function DuplicateWordRemover() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const { copied, copy } = useCopy();
  const remove = () => {
    const words = text.split(/\s+/);
    const seen = new Set<string>();
    const out: string[] = [];
    words.forEach(w => { const key = w.toLowerCase(); if (!seen.has(key)) { seen.add(key); out.push(w); } });
    setResult(out.join(' '));
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Duplicate Word Remover</h1>
      <p className="text-sm text-zinc-500 mb-4">Removes duplicate words within text. For removing duplicate <em>lines</em>, use <a href="/developer/text-deduplicator" className="text-blue-600 hover:underline">Text Deduplicator</a>.</p>
      <div className="space-y-3">
        <div><label className={labelClass}>Text</label><textarea value={text} onChange={e => setText(e.target.value)} rows={6} className={inputClass} /></div>
        <button onClick={remove} className={btnClass}>Remove Duplicate Words</button>
        {result && <div className="mt-4"><textarea readOnly value={result} rows={6} className={inputClass} /><button onClick={() => copy(result)} className={`${secondaryBtnClass} mt-2`}>{copied ? 'Copied!' : 'Copy'}</button></div>}
      </div>
    </div>
  );
}

export function TextCleaner() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const { copied, copy } = useCopy();
  const clean = () => {
    let t = text;
    t = t.replace(/\s+/g, ' ');
    t = t.replace(/\n{3,}/g, '\n\n');
    t = t.replace(/[^\S\n]+$/gm, '');
    t = t.replace(/^[^\S\n]+/gm, '');
    setResult(t.trim());
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Text Cleaner</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Text</label><textarea value={text} onChange={e => setText(e.target.value)} rows={6} className={inputClass} /></div>
        <button onClick={clean} className={btnClass}>Clean Text</button>
        {result && <div className="mt-4"><textarea readOnly value={result} rows={6} className={inputClass} /><button onClick={() => copy(result)} className={`${secondaryBtnClass} mt-2`}>{copied ? 'Copied!' : 'Copy'}</button></div>}
      </div>
    </div>
  );
}

export function TextSplitter() {
  const [text, setText] = useState('');
  const [delimiter, setDelimiter] = useState(' ');
  const [result, setResult] = useState('');
  const { copied, copy } = useCopy();
  const split = () => {
    if (!delimiter) return;
    const parts = text.split(delimiter).map(s => s.trim()).filter(Boolean);
    setResult(parts.map((p, i) => `${i + 1}. ${p}`).join('\n'));
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Text Splitter</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Text</label><textarea value={text} onChange={e => setText(e.target.value)} rows={6} className={inputClass} /></div>
        <div><label className={labelClass}>Delimiter</label><input type="text" value={delimiter} onChange={e => setDelimiter(e.target.value)} className={inputClass} /></div>
        <button onClick={split} className={btnClass}>Split</button>
        {result && <div className="mt-4"><textarea readOnly value={result} rows={6} className={inputClass} /><button onClick={() => copy(result)} className={`${secondaryBtnClass} mt-2`}>{copied ? 'Copied!' : 'Copy'}</button></div>}
      </div>
    </div>
  );
}

export function TrailingSpaceRemover() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const { copied, copy } = useCopy();
  const trim = () => {
    setResult(text.split('\n').map(l => l.trimEnd()).join('\n').trim());
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Trailing Space Remover</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Text</label><textarea value={text} onChange={e => setText(e.target.value)} rows={6} className={inputClass} /></div>
        <button onClick={trim} className={btnClass}>Trim Trailing Spaces</button>
        {result && <div className="mt-4"><textarea readOnly value={result} rows={6} className={inputClass} /><button onClick={() => copy(result)} className={`${secondaryBtnClass} mt-2`}>{copied ? 'Copied!' : 'Copy'}</button></div>}
      </div>
    </div>
  );
}

export function CanonicalUrlChecker() {
  const [url, setUrl] = useState('https://example.com/blog/my-article');
  const [result, setResult] = useState('');
  const check = () => {
    try { new URL(url); } catch { setResult('Invalid URL'); return; }
    const u = new URL(url);
    const checks = [
      '✓ Valid URL format',
      `Protocol: ${u.protocol}`,
      `Domain: ${u.hostname}`,
      `Path: ${u.pathname}`,
      u.hash ? '⚠️ Has fragment (#) — search engines may ignore' : '✓ No fragment',
      u.search ? '⚠️ Has query params — ensure these are the canonical version' : '✓ No query params',
      u.pathname.endsWith('/') ? '✓ Ends with /' : 'ℹ️ No trailing slash',
      u.hostname.startsWith('www.') ? 'ℹ️ With www' : 'ℹ️ Without www',
    ];
    setResult(checks.join('\n'));
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Canonical URL Checker</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>URL</label><input type="url" value={url} onChange={e => setUrl(e.target.value)} className={inputClass} /></div>
        <button onClick={check} className={btnClass}>Check URL</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function BreadcrumbSchemaGenerator() {
  const [pages, setPages] = useState('Home,https://example.com\nProducts,https://example.com/products\nWidgets,https://example.com/widgets');
  const [result, setResult] = useState('');
  const { copied, copy } = useCopy();
  const generate = () => {
    const items = pages.split('\n').filter(l => l.trim()).map(l => {
      const [name, url] = l.split(',').map(s => s.trim());
      return { name, url };
    });
    if (items.length < 2) return;
    const schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "name": item.name,
        "item": item.url,
      })),
    };
    setResult(JSON.stringify(schema, null, 2));
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Breadcrumb Schema Generator</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Pages (Name,URL per line)</label><textarea value={pages} onChange={e => setPages(e.target.value)} rows={4} className={`${inputClass} font-mono text-xs`} /></div>
        <button onClick={generate} className={btnClass}>Generate Breadcrumb Schema</button>
        {result && <div className="mt-4"><textarea readOnly value={result} rows={8} className={`${inputClass} font-mono text-xs`} /><button onClick={() => copy(result)} className={`${secondaryBtnClass} mt-2`}>{copied ? 'Copied!' : 'Copy'}</button></div>}
      </div>
    </div>
  );
}

export function UtmBuilder() {
  const [baseUrl, setBaseUrl] = useState('https://example.com');
  const [source, setSource] = useState('newsletter');
  const [medium, setMedium] = useState('email');
  const [campaign, setCampaign] = useState('spring_sale');
  const [term, setTerm] = useState('');
  const [content, setContent] = useState('');
  const [result, setResult] = useState('');
  const { copied, copy } = useCopy();
  const build = () => {
    try { new URL(baseUrl); } catch { return; }
    const u = new URL(baseUrl);
    u.searchParams.set('utm_source', source);
    u.searchParams.set('utm_medium', medium);
    u.searchParams.set('utm_campaign', campaign);
    if (term) u.searchParams.set('utm_term', term);
    if (content) u.searchParams.set('utm_content', content);
    setResult(u.toString());
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>UTM Builder</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>URL</label><input type="url" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} className={inputClass} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>Source</label><input type="text" value={source} onChange={e => setSource(e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>Medium</label><input type="text" value={medium} onChange={e => setMedium(e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>Campaign</label><input type="text" value={campaign} onChange={e => setCampaign(e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>Term (opt)</label><input type="text" value={term} onChange={e => setTerm(e.target.value)} className={inputClass} /></div>
        </div>
        <div><label className={labelClass}>Content (opt)</label><input type="text" value={content} onChange={e => setContent(e.target.value)} className={inputClass} /></div>
        <button onClick={build} className={btnClass}>Build UTM URL</button>
        {result && <div className="mt-4"><input readOnly value={result} className={inputClass} /><button onClick={() => copy(result)} className={`${secondaryBtnClass} mt-2`}>{copied ? 'Copied!' : 'Copy'}</button></div>}
      </div>
    </div>
  );
}

"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FileText, BarChart3, Search, Hash } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'text' | 'analysis' | 'seo' | 'schema';

export default function TextSeoToolkit() {
  const [tab, setTab] = useState<Tab>('text');
  const TabBtn = ({ v, label, icon: Icon }: { v: Tab; label: string; icon: React.ElementType }) => (
    <button onClick={() => setTab(v)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${tab === v ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );
  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2">
        <TabBtn v="text" label="Text Tools" icon={FileText} />
        <TabBtn v="analysis" label="Text Analysis" icon={BarChart3} />
        <TabBtn v="seo" label="SEO Preview" icon={Search} />
        <TabBtn v="schema" label="Schema & UTM" icon={Hash} />
      </div>
      {tab === 'text' && <TextTools />}
      {tab === 'analysis' && <AnalysisTools />}
      {tab === 'seo' && <SeoTools />}
      {tab === 'schema' && <SchemaTools />}
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

function Output({ value }: { value: string }) {
  if (!value) return null;
  return (
    <div className="relative">
      <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 max-h-32 overflow-y-auto text-emerald-600 dark:text-emerald-400 break-all whitespace-pre-wrap">{value}</pre>
      <button onClick={() => { clipboardWrite(value); toast.success('Copied!'); }} className="text-[10px] text-blue-500 hover:underline mt-0.5">Copy</button>
    </div>
  );
}

function TextTools() {
  const [input, setInput] = useState('The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog!');
  const [output, setOutput] = useState('');
  const [findText, setFindText] = useState('fox');
  const [replaceText, setReplaceText] = useState('cat');
  const [splitDelim, setSplitDelim] = useState(' ');
  const [slugIn, setSlugIn] = useState('Hello World! This is a Test Article.');

  const remDupWords = () => {
    const words = input.split(/\s+/);
    const seen = new Set<string>();
    const result: string[] = [];
    words.forEach(w => {
      const key = w.toLowerCase();
      if (!seen.has(key)) { seen.add(key); result.push(w); }
    });
    setOutput(result.join(' '));
    toast.success(`Removed ${words.length - result.length} duplicate(s)`);
  };

  const findReplace = () => {
    if (!findText) { toast.error('Enter search text'); return; }
    const re = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const result = input.replace(re, replaceText);
    const count = (input.match(re) || []).length;
    setOutput(result);
    toast.success(`Replaced ${count} occurrence(s)`);
  };

  const cleanText = () => {
    let t = input;
    t = t.replace(/\s+/g, ' ');
    t = t.replace(/\n{3,}/g, '\n\n');
    t = t.replace(/[^\S\n]+$/gm, '');
    t = t.replace(/^[^\S\n]+/gm, '');
    t = t.trim();
    setOutput(t);
    toast.success('Text cleaned');
  };

  const splitText = () => {
    if (!splitDelim) { toast.error('Enter delimiter'); return; }
    const parts = input.split(splitDelim).map(s => s.trim()).filter(Boolean);
    setOutput(parts.map((p, i) => `${i + 1}. ${p}`).join('\n'));
    toast.success(`Split into ${parts.length} parts`);
  };

  const remTrailing = () => {
    setOutput(input.split('\n').map(l => l.trimEnd()).join('\n').trim());
    toast.success('Trailing spaces removed');
  };

  const genSlug = () => {
    const slug = slugIn.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    setOutput(slug);
    toast.success('Slug generated');
  };

  const TA = ({ value: v }: { value: string }) => (
    <textarea value={v} onChange={e => setInput(e.target.value)}
      className="w-full h-20 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <Card title="Duplicate Word Remover">
        <TA value={input} />
        <CalcBtn onClick={remDupWords} label="Remove Duplicates" />
      </Card>
      <Card title="Find and Replace">
        <TA value={input} />
        <Inp label="Find" value={findText} onChange={setFindText} />
        <Inp label="Replace" value={replaceText} onChange={setReplaceText} />
        <CalcBtn onClick={findReplace} label="Replace All" />
      </Card>
      <Card title="Text Cleaner">
        <TA value={input} />
        <p className="text-[10px] text-zinc-400">Normalizes spaces, trims lines, removes excess newlines</p>
        <CalcBtn onClick={cleanText} label="Clean Text" />
      </Card>
      <Card title="Text Splitter">
        <TA value={input} />
        <Inp label="Delimiter" value={splitDelim} onChange={setSplitDelim} placeholder=" " />
        <CalcBtn onClick={splitText} label="Split" />
      </Card>
      <Card title="Trailing Space Remover">
        <TA value={input} />
        <CalcBtn onClick={remTrailing} label="Trim Spaces" />
      </Card>
      <Card title="Slug Generator">
        <textarea value={slugIn} onChange={e => setSlugIn(e.target.value)}
          className="w-full h-14 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="Your text here..." />
        <CalcBtn onClick={genSlug} label="Generate Slug" />
      </Card>
      {output && <div className="md:col-span-2 lg:col-span-3"><Output value={output} /></div>}
    </div>
  );
}

function AnalysisTools() {
  const [input, setInput] = useState('The quick brown fox jumps over the lazy dog. The dog was not amused. How many words are in these sentences?\n\nThis is a new paragraph with more text. It has several sentences. Some are long, some are short.');
  const [output, setOutput] = useState('');

  const analyze = (mode: string) => {
    if (!input.trim()) { toast.error('Enter text'); return; }
    const text = input;
    const lines = text.split('\n').filter(l => l.trim());
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const words = text.split(/\s+/).filter(w => w.trim());
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const syllables = words.reduce((sum, w) => {
      const s = w.toLowerCase().replace(/[^a-z]/g, '');
      if (!s) return sum;
      let count = 0;
      const vowels = 'aeiouy';
      for (let i = 0; i < s.length; i++) {
        if (vowels.includes(s[i]) && (!i || !vowels.includes(s[i - 1]))) count++;
      }
      return sum + Math.max(1, count);
    }, 0);

    switch (mode) {
      case 'lines': setOutput(`Lines: ${lines.length}`); break;
      case 'paragraphs': setOutput(`Paragraphs: ${paragraphs.length}`); break;
      case 'sentences': setOutput(`Sentences: ${sentences.length}`); break;
      case 'syllables': setOutput(`Syllables: ${syllables}\nWords: ${words.length}\nSyllables/word: ${(syllables / words.length).toFixed(2)}\nFlesch-Kincaid grade: ${Math.round(0.39 * (words.length / sentences.length) + 11.8 * (syllables / words.length) - 15.59)}`); break;
      case 'all': setOutput(`Lines: ${lines.length}\nParagraphs: ${paragraphs.length}\nSentences: ${sentences.length}\nWords: ${words.length}\nCharacters: ${chars}\nChars (no space): ${charsNoSpace}\nSyllables: ${syllables}\nAvg sentence: ${(words.length / sentences.length).toFixed(1)} words\nAvg word: ${(charsNoSpace / words.length).toFixed(1)} chars`); break;
    }
    toast.success('Analysis complete');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
        <h5 className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">Input Text</h5>
        <textarea value={input} onChange={e => setInput(e.target.value)}
          className="w-full h-24 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
      </div>
      <Card title="Line Counter">
        <CalcBtn onClick={() => analyze('lines')} label="Count Lines" />
      </Card>
      <Card title="Paragraph Counter">
        <CalcBtn onClick={() => analyze('paragraphs')} label="Count Paragraphs" />
      </Card>
      <Card title="Sentence Counter">
        <CalcBtn onClick={() => analyze('sentences')} label="Count Sentences" />
      </Card>
      <Card title="Syllable Counter">
        <p className="text-[10px] text-zinc-400">Also estimates Flesch-Kincaid grade level</p>
        <CalcBtn onClick={() => analyze('syllables')} label="Count Syllables" />
      </Card>
      <Card title="Full Analysis">
        <p className="text-[10px] text-zinc-400">All counts at once</p>
        <CalcBtn onClick={() => analyze('all')} label="Analyze All" />
      </Card>
      {output && <div className="md:col-span-2 lg:col-span-3"><Output value={output} /></div>}
    </div>
  );
}

function SeoTools() {
  const [canonicalUrl, setCanonicalUrl] = useState('https://example.com/blog/my-article');
  const [canonicalOut, setCanonicalOut] = useState('');
  const [serpTitle, setSerpTitle] = useState('My Amazing Article - Learn About This Topic | Example Blog');
  const [serpDesc, setSerpDesc] = useState('Discover the best information about this topic. Our comprehensive guide covers everything you need to know with expert insights and practical tips.');
  const [serpUrl, setSerpUrl] = useState('https://example.com/blog/my-article');
  const [ogTitle, setOgTitle] = useState('My Amazing Article');
  const [ogDesc, setOgDesc] = useState('Discover the best information about this topic.');
  const [ogUrl, setOgUrl] = useState('https://example.com/blog/my-article');
  const [ogImage, setOgImage] = useState('https://example.com/image.jpg');
  const [ogOut, setOgOut] = useState('');
  const [twCardType, setTwCardType] = useState('summary_large_image');
  const [twSite, setTwSite] = useState('@myhandle');
  const [twTitle, setTwTitle] = useState('My Amazing Article');
  const [twDesc, setTwDesc] = useState('Check out this amazing article!');
  const [twImage, setTwImage] = useState('https://example.com/image.jpg');
  const [twOut, setTwOut] = useState('');

  const checkCanonical = () => {
    try { new URL(canonicalUrl); } catch { toast.error('Invalid URL'); return; }
    const url = new URL(canonicalUrl);
    const checks = [
      '✓ Valid URL format',
      `Protocol: ${url.protocol}`,
      `Domain: ${url.hostname}`,
      `Path: ${url.pathname}`,
      url.hash ? `⚠️ Has fragment (#) — search engines may ignore` : '✓ No fragment',
      url.search ? `⚠️ Has query params — ensure these are the canonical version` : '✓ No query params',
      url.pathname.endsWith('/') ? '✓ Ends with /' : 'ℹ️ No trailing slash',
      url.hostname.startsWith('www.') ? 'ℹ️ With www' : 'ℹ️ Without www',
    ];
    setCanonicalOut(checks.join('\n'));
  };

  const serpPreview = () => {
    const title = serpTitle.slice(0, 70);
    const desc = serpDesc.slice(0, 160);
    const url = serpUrl.length > 70 ? serpUrl.slice(0, 67) + '...' : serpUrl;
    setCanonicalOut([
      '=== Google SERP Preview ===',
      '',
      `📱 Title (${title.length}/70 chars): ${serpTitle.length > 70 ? '⚠️ TRUNCATED' : '✓ OK'}`,
      `📝 Description (${desc.length}/160 chars): ${serpDesc.length > 160 ? '⚠️ TRUNCATED' : '✓ OK'}`,
      `🔗 URL (${serpUrl.length} chars)`,
      '',
      '━━━ Preview ━━━',
      title,
      url,
      desc,
    ].join('\n'));
  };

  const ogPreview = () => {
    const tags = [
      `<!-- Open Graph -->`,
      `<meta property="og:title" content="${ogTitle}" />`,
      `<meta property="og:description" content="${ogDesc}" />`,
      `<meta property="og:url" content="${ogUrl}" />`,
      `<meta property="og:image" content="${ogImage}" />`,
      `<meta property="og:type" content="website" />`,
      `<meta property="og:site_name" content="${new URL(ogUrl).hostname}" />`,
    ];
    const out = tags.join('\n') + '\n\n';
    const fbW = 1200, fbH = 630;
    const twW = twCardType === 'summary_large_image' ? 1200 : 800;
    const twH = twCardType === 'summary_large_image' ? 600 : 418;
    setOgOut(out + [
      '━━━ Preview Info ━━━',
      `OG Title: ${ogTitle.length} chars${ogTitle.length > 95 ? ' ⚠️ Long' : ''}`,
      `OG Desc: ${ogDesc.length} chars${ogDesc.length > 200 ? ' ⚠️ Long' : ''}`,
      `FB share: ${fbW}×${fbH}px`,
      `Twitter: ${twW}×${twH}px`,
    ].join('\n'));
  };

  const twCard = () => {
    const tags = [
      `<!-- Twitter Card -->`,
      `<meta name="twitter:card" content="${twCardType}" />`,
      twSite ? `<meta name="twitter:site" content="${twSite}" />` : '',
      `<meta name="twitter:title" content="${twTitle}" />`,
      `<meta name="twitter:description" content="${twDesc}" />`,
      `<meta name="twitter:image" content="${twImage}" />`,
    ].filter(Boolean);
    setTwOut(tags.join('\n') + '\n\n' + [
      '━━━ Preview Info ━━━',
      `Card: ${twCardType}`,
      `Title: ${twTitle.length} chars${twTitle.length > 70 ? ' ⚠️ Long' : ''}`,
      `Desc: ${twDesc.length} chars${twDesc.length > 200 ? ' ⚠️ Long' : ''}`,
    ].join('\n'));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Card title="Canonical URL Checker">
        <Inp label="URL" value={canonicalUrl} onChange={setCanonicalUrl} placeholder="https://example.com/page" />
        <CalcBtn onClick={checkCanonical} label="Check URL" />
        <Output value={canonicalOut} />
      </Card>
      <Card title="Google SERP Simulator">
        <Inp label="Title" value={serpTitle} onChange={setSerpTitle} />
        <Inp label="URL" value={serpUrl} onChange={setSerpUrl} />
        <textarea value={serpDesc} onChange={e => setSerpDesc(e.target.value)}
          className="w-full h-14 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="Meta description..." />
        <CalcBtn onClick={serpPreview} label="Preview SERP" />
        <Output value={canonicalOut} />
      </Card>
      <Card title="OG Preview Tester">
        <Inp label="Title" value={ogTitle} onChange={setOgTitle} />
        <Inp label="URL" value={ogUrl} onChange={setOgUrl} />
        <Inp label="Image" value={ogImage} onChange={setOgImage} />
        <textarea value={ogDesc} onChange={e => setOgDesc(e.target.value)}
          className="w-full h-12 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="Description..." />
        <CalcBtn onClick={ogPreview} label="Generate OG Tags" />
        <Output value={ogOut} />
      </Card>
      <Card title="Twitter Card Generator">
        <Sel label="Card" value={twCardType} onChange={setTwCardType} options={[{v:'summary_large_image',l:'Summary Large Image'},{v:'summary',l:'Summary'},{v:'app',l:'App'},{v:'player',l:'Player'}]} />
        <Inp label="Site" value={twSite} onChange={setTwSite} placeholder="@username" />
        <Inp label="Title" value={twTitle} onChange={setTwTitle} />
        <Inp label="Image" value={twImage} onChange={setTwImage} />
        <textarea value={twDesc} onChange={e => setTwDesc(e.target.value)}
          className="w-full h-12 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="Description..." />
        <CalcBtn onClick={twCard} label="Generate Card Tags" />
        <Output value={twOut} />
      </Card>
    </div>
  );
}

const Sel = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) => (
  <div className="flex items-center gap-1.5">
    <label className="text-[10px] text-zinc-500 shrink-0">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)}
      className="flex-1 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-1.5 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500">
      {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  </div>
);

function SchemaTools() {
  const [breadcrumbOut, setBreadcrumbOut] = useState('');
  const [bcPages, setBcPages] = useState('Home,https://example.com\nProducts,https://example.com/products\nWidgets,https://example.com/widgets');
  const [faqOut, setFaqOut] = useState('');
  const [faqItems, setFaqItems] = useState('What is this?,This is a FAQ schema generator.\nHow does it work?,Paste questions and answers separated by a comma.\nIs it free?,Yes, it is completely free.');
  const [utmUrl, setUtmUrl] = useState('https://example.com');
  const [utmSource, setUtmSource] = useState('newsletter');
  const [utmMedium, setUtmMedium] = useState('email');
  const [utmCampaign, setUtmCampaign] = useState('spring_sale');
  const [utmTerm, setUtmTerm] = useState('');
  const [utmContent, setUtmContent] = useState('');
  const [utmOut, setUtmOut] = useState('');
  const [colorImgOut, setColorImgOut] = useState('');

  const genBreadcrumb = () => {
    const items = bcPages.split('\n').filter(l => l.trim()).map(l => {
      const [name, url] = l.split(',').map(s => s.trim());
      return { name, url };
    });
    if (items.length < 2) { toast.error('Need at least 2 breadcrumb items'); return; }
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
    setBreadcrumbOut(JSON.stringify(schema, null, 2));
    toast.success('Breadcrumb schema generated');
  };

  const genFaq = () => {
    const items = faqItems.split('\n').filter(l => l.trim()).map(l => {
      const [q, ...a] = l.split(',').map(s => s.trim());
      return { question: q, answer: a.join(',') || 'Answer' };
    });
    if (!items.length) { toast.error('Enter at least one Q&A'); return; }
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": items.map(item => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": { "@type": "Answer", "text": item.answer },
      })),
    };
    setFaqOut(JSON.stringify(schema, null, 2));
    toast.success('FAQ schema generated');
  };

  const buildUtm = () => {
    try { new URL(utmUrl); } catch { toast.error('Invalid URL'); return; }
    const url = new URL(utmUrl);
    url.searchParams.set('utm_source', utmSource);
    url.searchParams.set('utm_medium', utmMedium);
    url.searchParams.set('utm_campaign', utmCampaign);
    if (utmTerm) url.searchParams.set('utm_term', utmTerm);
    if (utmContent) url.searchParams.set('utm_content', utmContent);
    setUtmOut(url.toString());
    toast.success('UTM URL built');
  };

  const imgToPalette = () => {
    const imgData = colorImgOut;
    if (!imgData) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">${['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD','#98D8C8','#F7DC6F','#BB8FCE','#85C1E9'].map((c, i) => `<rect x="${i * 20}" y="0" width="20" height="200" fill="${c}"/>`).join('')}</svg>`;
      const b64 = btoa(svg);
      const palette = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
      setColorImgOut(`data:image/svg+xml;base64,${b64}`);
      setBreadcrumbOut(`Image palette extracted (demo):\n${palette.map((c, i) => `  ${i + 1}. ${c}`).join('\n')}\n\nNote: Full image processing requires canvas API. Paste an SVG or use a color URL.`);
      toast.success('Sample palette generated');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Card title="Breadcrumb Schema Generator">
        <textarea value={bcPages} onChange={e => setBcPages(e.target.value)}
          className="w-full h-20 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="Name,URL" />
        <CalcBtn onClick={genBreadcrumb} label="Generate Schema" />
        <Output value={breadcrumbOut} />
      </Card>
      <Card title="FAQ Schema Generator">
        <textarea value={faqItems} onChange={e => setFaqItems(e.target.value)}
          className="w-full h-20 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="Question,Answer" />
        <CalcBtn onClick={genFaq} label="Generate Schema" />
        <Output value={faqOut} />
      </Card>
      <Card title="UTM Builder">
        <Inp label="URL" value={utmUrl} onChange={setUtmUrl} placeholder="https://example.com" />
        <Inp label="Source" value={utmSource} onChange={setUtmSource} placeholder="newsletter" />
        <Inp label="Medium" value={utmMedium} onChange={setUtmMedium} placeholder="email" />
        <Inp label="Campaign" value={utmCampaign} onChange={setUtmCampaign} placeholder="spring_sale" />
        <Inp label="Term" value={utmTerm} onChange={setUtmTerm} placeholder="(optional)" />
        <Inp label="Content" value={utmContent} onChange={setUtmContent} placeholder="(optional)" />
        <CalcBtn onClick={buildUtm} label="Build UTM URL" />
        <Output value={utmOut} />
      </Card>
      <Card title="Image to Color Palette">
        <p className="text-[10px] text-zinc-400">Extracts a color palette from an image (demo: sample palette)</p>
        <CalcBtn onClick={imgToPalette} label="Extract Palette" />
        {colorImgOut && <img src={colorImgOut} alt="palette preview" className="w-full h-8 rounded-lg object-cover" />}
        {breadcrumbOut && <Output value={breadcrumbOut} />}
      </Card>
    </div>
  );
}

"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { FileText, BarChart3, Search, Hash, ExternalLink } from 'lucide-react';
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

const LinkCard = ({ title, slug, desc }: { title: string; slug: string; desc: string }) => (
  <Link href={`/developer/${slug}`} className="block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all group">
    <div className="flex items-center gap-1">
      <h5 className="text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:underline">{title}</h5>
      <ExternalLink className="w-3 h-3 text-blue-400 shrink-0" />
    </div>
    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
  </Link>
);

function TextTools() {
  const [input, setInput] = useState('The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog!');
  const [output, setOutput] = useState('');
  const [splitDelim, setSplitDelim] = useState(' ');

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

  const TA = ({ value: v }: { value: string }) => (
    <textarea value={v} onChange={e => setInput(e.target.value)}
      className="w-full h-20 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <Card title="Remove Duplicate Words">
        <TA value={input} />
        <p className="text-[10px] text-zinc-400">Removes duplicate <em>words</em> within text. Use Text Deduplicator for duplicate <em>lines</em>.</p>
        <CalcBtn onClick={remDupWords} label="Remove Duplicates" />
      </Card>
      <LinkCard title="Text Replacer" slug="text-replacer" desc="Find and replace text in any string with one click. Fast bulk text replacement for content editing and data cleanup." />
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
      <LinkCard title="SEO Slug Generator" slug="seo-slug-generator" desc="Generate SEO-friendly URL slugs from any text. Removes special characters and converts spaces to hyphens." />
      {output && <div className="md:col-span-2 lg:col-span-3"><Output value={output} /></div>}
    </div>
  );
}

function AnalysisTools() {
  return (
    <LinkCard title="Word Counter" slug="word-counter" desc="Analyze your writing with real-time word count, sentence count, syllable count, paragraphs, and advanced readability metrics including Flesch-Kincaid." />
  );
}

function SeoTools() {
  const [canonicalUrl, setCanonicalUrl] = useState('https://example.com/blog/my-article');
  const [canonicalOut, setCanonicalOut] = useState('');

  const checkCanonical = () => {
    try { new URL(canonicalUrl); } catch { toast.error('Invalid URL'); return; }
    const url = new URL(canonicalUrl);
    const checks = [
      '✓ Valid URL format',
      `Protocol: ${url.protocol}`,
      `Domain: ${url.hostname}`,
      `Path: ${url.pathname}`,
      url.hash ? '⚠️ Has fragment (#) — search engines may ignore' : '✓ No fragment',
      url.search ? '⚠️ Has query params — ensure these are the canonical version' : '✓ No query params',
      url.pathname.endsWith('/') ? '✓ Ends with /' : 'ℹ️ No trailing slash',
      url.hostname.startsWith('www.') ? 'ℹ️ With www' : 'ℹ️ Without www',
    ];
    setCanonicalOut(checks.join('\n'));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Card title="Canonical URL Checker">
        <Inp label="URL" value={canonicalUrl} onChange={setCanonicalUrl} placeholder="https://example.com/page" />
        <CalcBtn onClick={checkCanonical} label="Check URL" />
        <Output value={canonicalOut} />
      </Card>
      <LinkCard title="SEO Preview Generator" slug="seo-preview-generator" desc="Preview how your page will appear in Google search results. Enter title, URL, and description to see the live snippet preview." />
      <LinkCard title="SEO Meta Tag Generator" slug="seo-meta-tag-generator" desc="Generate complete HTML meta tags including title, description, keywords, Open Graph, and Twitter Card tags from a simple form." />
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

"use client";

import React, { useState } from 'react';
import { Globe, Copy, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

export default function MetaTagGenerator() {
  const [title, setTitle] = useState('My Awesome Web App');
  const [description, setDescription] = useState('Create and modify professional metadata headers for search spiders.');
  const [author, setAuthor] = useState('Taylor Doe');
  const [url, setUrl] = useState('https://myapp.com');
  const [ogType, setOgType] = useState('website');

  const buildMeta = () => {
    return `<!-- Standard HTML Meta Tags -->
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="author" content="${author}">

<!-- Open Graph / Facebook Meta Tags -->
<meta property="og:type" content="${ogType}">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${url}/og-card.png">

<!-- Twitter Card Meta Tags -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="${url}">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${url}/og-card.png">`;
  };

  const handleCopy = () => {
    clipboardWrite(buildMeta());
    toast.success('Copied Meta Headers!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 border border-zinc-200 dark:border-white/5 rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-500" />
          SEO Meta Tag Header Builder
        </h2>
        <p className="text-xs text-zinc-500 mt-1">Configure and export search engine meta tags and social network OpenGraph header snippets offline.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Configurator */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase border-b border-zinc-800 pb-2">Parameters</h3>
          
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400 font-bold uppercase">Meta Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-white outline-none" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400 font-bold uppercase">Meta Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-white outline-none resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold uppercase">Author</label>
              <input type="text" value={author} onChange={e => setAuthor(e.target.value)} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold uppercase">OG Type</label>
              <select value={ogType} onChange={e => setOgType(e.target.value)} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2 py-2 outline-none">
                <option value="website">Website</option>
                <option value="article">Article</option>
                <option value="profile">Profile</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400 font-bold uppercase">Website Canonical URL</label>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 outline-none" />
          </div>
        </div>

        {/* Visual Preview Card & Code */}
        <div className="lg:col-span-7 space-y-6">
          {/* Simulated Google Search Preview */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl shadow-xl space-y-3">
            <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block border-b border-zinc-800 pb-2 flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Google Search Result Preview</span>
            <div className="space-y-1">
              <p className="text-sm font-bold text-indigo-400 hover:underline cursor-pointer font-serif">{title}</p>
              <p className="text-[10px] text-emerald-500 font-sans">{url}</p>
              <p className="text-xs text-zinc-400 leading-relaxed">{description.slice(0, 155)}...</p>
            </div>
          </div>

          {/* HTML Meta tag output */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl shadow-xl flex flex-col">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2 mb-2">
              <span className="text-xs text-zinc-400 font-bold uppercase">Generated Meta Tags</span>
              <button onClick={handleCopy} className="p-1.5 text-zinc-500 hover:text-white border border-zinc-800 rounded-lg" aria-label="Copy"><Copy className="w-4 h-4" /></button>
            </div>
            <textarea
              value={buildMeta()}
              readOnly
              className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-emerald-400 font-mono h-48 outline-none text-xs resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
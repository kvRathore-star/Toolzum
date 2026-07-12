"use client";

import React, { useState } from 'react';
import { FileText, Copy, Download, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { clipboardWrite } from "@/lib/clipboard";

interface UrlEntry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

export default function XmlSitemapGenerator() {
  const [siteUrl, setSiteUrl] = useState('https://mysite.com');
  const [entries, setEntries] = useState<UrlEntry[]>([
    { loc: '/', lastmod: new Date().toISOString().slice(0, 10), changefreq: 'daily', priority: '1.0' },
    { loc: '/about', lastmod: new Date().toISOString().slice(0, 10), changefreq: 'monthly', priority: '0.8' },
    { loc: '/blog', lastmod: new Date().toISOString().slice(0, 10), changefreq: 'weekly', priority: '0.8' }
  ]);

  const [newLoc, setNewLoc] = useState('');
  const [newFreq, setNewFreq] = useState('weekly');
  const [newPriority, setNewPriority] = useState('0.5');

  const addEntry = () => {
    if (!newLoc.trim()) {
      toast.error('Path cannot be empty');
      return;
    }
    const cleanPath = newLoc.trim().startsWith('/') ? newLoc.trim() : '/' + newLoc.trim();
    setEntries([...entries, {
      loc: cleanPath,
      lastmod: new Date().toISOString().slice(0, 10),
      changefreq: newFreq,
      priority: newPriority
    }]);
    setNewLoc('');
    toast.success('URL Path added!');
  };

  const removeEntry = (idx: number) => {
    setEntries(entries.filter((_, i) => i !== idx));
  };

  const buildXml = (): string => {
    const baseUrl = siteUrl.replace(/\/$/, '');
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    entries.forEach(e => {
      xml += `  <url>
    <loc>${baseUrl}${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>\n`;
    });

    xml += `</urlset>`;
    return xml;
  };

  const handleCopy = () => {
    clipboardWrite(buildXml());
    toast.success('Copied XML Sitemap!');
  };

  const handleDownload = () => {
    const blob = new Blob([buildXml()], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, 'sitemap.xml');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 border border-zinc-200 dark:border-white/5 rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500" />
          XML Sitemap Generator
        </h2>
        <p className="text-xs text-zinc-500 mt-1">Generate search-engine friendly XML sitemaps containing priorities and change intervals for SEO indexing.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Workspace */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase border-b border-zinc-800 pb-2">Configure URL Paths</h3>
          
          <div className="space-y-2">
            <label className="text-xs text-zinc-400 font-bold uppercase">Website base URL</label>
            <input 
              type="text" 
              value={siteUrl}
              onChange={e => setSiteUrl(e.target.value)}
              placeholder="https://mysite.com"
              className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-xs outline-none"
            />
          </div>

          <div className="border-t border-zinc-800 pt-3 space-y-3">
            <span className="text-xs text-zinc-400 font-bold uppercase block">Add Page Path</span>
            
            <div className="space-y-2 text-xs">
              <input 
                type="text" 
                value={newLoc}
                onChange={e => setNewLoc(e.target.value)}
                placeholder="/blog/my-post"
                className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-white outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500">Frequency</label>
                  <select value={newFreq} onChange={e => setNewFreq(e.target.value)} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1.5 outline-none">
                    <option value="always">Always</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500">Priority</label>
                  <select value={newPriority} onChange={e => setNewPriority(e.target.value)} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1.5 outline-none">
                    <option value="1.0">1.0 (Critical)</option>
                    <option value="0.8">0.8 (High)</option>
                    <option value="0.5">0.5 (Normal)</option>
                    <option value="0.1">0.1 (Low)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <button onClick={addEntry} className="w-full bg-[var(--accent)] hover:bg-indigo-600 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer">
              <Plus className="w-4 h-4" /> Add Path
            </button>
          </div>

          <div className="border-t border-zinc-800 pt-3 space-y-2">
            <span className="text-xs text-zinc-400 font-bold uppercase block">Current Paths ({entries.length})</span>
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {entries.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-[10px] bg-zinc-50 dark:bg-black/10 p-2 rounded-xl border border-[var(--border-subtle)]">
                  <div className="font-mono text-zinc-300">
                    <p className="font-bold text-zinc-100">{item.loc}</p>
                    <p className="text-zinc-500">Freq: {item.changefreq} | Pri: {item.priority}</p>
                  </div>
                  <button onClick={() => removeEntry(idx)} className="p-1 text-zinc-500 hover:text-rose-500 rounded" aria-label="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* XML output Preview */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl flex flex-col justify-between min-h-[450px]">
          <div className="space-y-2 flex-1 flex flex-col">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="text-xs text-zinc-400 font-bold uppercase">XML Output</span>
              <div className="flex gap-2">
                <button onClick={handleCopy} className="p-1.5 text-zinc-500 hover:text-white border border-zinc-800 rounded-lg" aria-label="Copy"><Copy className="w-4 h-4" /></button>
                <button onClick={handleDownload} className="p-1.5 text-zinc-500 hover:text-white border border-zinc-800 rounded-lg" aria-label="Download"><Download className="w-4 h-4" /></button>
              </div>
            </div>
            <textarea
              value={buildXml()}
              readOnly
              className="w-full flex-1 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-emerald-400 font-mono h-96 outline-none text-xs resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
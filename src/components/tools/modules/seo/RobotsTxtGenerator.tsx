"use client";

import React, { useState } from 'react';
import { ShieldAlert, Copy, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

export default function RobotsTxtGenerator() {
  const [sitemap, setSitemap] = useState('https://mysite.com/sitemap.xml');
  const [disallows, setDisallows] = useState<string[]>(['/admin', '/private', '/tmp']);
  const [newDisallow, setNewDisallow] = useState('');

  const addDisallow = () => {
    if (!newDisallow.trim()) return;
    const clean = newDisallow.trim().startsWith('/') ? newDisallow.trim() : '/' + newDisallow.trim();
    setDisallows([...disallows, clean]);
    setNewDisallow('');
    toast.success('Blocked path added!');
  };

  const removeDisallow = (idx: number) => {
    setDisallows(disallows.filter((_, i) => i !== idx));
  };

  const buildRobotsTxt = () => {
    let txt = `User-agent: *\n`;
    disallows.forEach(path => {
      txt += `Disallow: ${path}\n`;
    });
    txt += `Allow: /\n\n`;
    if (sitemap.trim()) {
      txt += `Sitemap: ${sitemap.trim()}\n`;
    }
    return txt;
  };

  const handleCopy = () => {
    clipboardWrite(buildRobotsTxt());
    toast.success('Copied robots.txt!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-overlay)] p-5 border border-zinc-200 dark:border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[var(--accent)]" />
          Robots.txt Generator
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Configure search spider crawler instructions and path allowances to index your pages correctly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Config panel */}
        <div className="lg:col-span-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase border-b border-[var(--border-subtle)] pb-2">Directives</h3>
          
          <div className="space-y-2">
            <label htmlFor="lbl-robotstxtgenerator-sitemap-url" className="text-xs text-[var(--text-muted)] font-bold uppercase">Sitemap URL</label>
            <input id="lbl-robotstxtgenerator-sitemap-url" aria-label="Sitemap URL" 
              type="text" 
              value={sitemap} 
              onChange={e => setSitemap(e.target.value)} 
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] text-xs focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
            />
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-3 space-y-3">
            <span className="text-xs text-[var(--text-muted)] font-bold uppercase block">Block Paths (Disallow)</span>
            <div className="flex gap-2">
              <input aria-label="Block Paths (Disallow)" 
                type="text" 
                value={newDisallow} 
                onChange={e => setNewDisallow(e.target.value)}
                placeholder="/admin-dashboard" 
                className="flex-1 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
              />
              <button onClick={addDisallow} className="bg-[var(--accent-ink)] px-3 py-2 rounded-xl text-xs font-bold text-white cursor-pointer">Add</button>
            </div>
            
            <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
              {disallows.map((path, idx) => (
                <div key={idx} className="flex justify-between items-center text-[10px] bg-[var(--bg-overlay)] p-2 rounded-xl border border-[var(--border-subtle)]">
                  <span className="font-mono text-zinc-300">Disallow: {path}</span>
                  <button onClick={() => removeDisallow(idx)} className="text-[10px] text-[var(--accent)] hover:underline">Remove</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-7 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl flex flex-col justify-between min-h-[400px]">
          <div className="space-y-2 flex-1 flex flex-col">
            <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-2">
              <span className="text-xs text-[var(--text-muted)] font-bold uppercase">Generated Robots.txt</span>
              <button onClick={handleCopy} className="p-1.5 text-[var(--text-secondary)] hover:text-white border border-[var(--border-subtle)] rounded-lg" aria-label="Copy robots.txt"><Copy className="w-4 h-4" /></button>
            </div>
            <textarea
              value={buildRobotsTxt()}
              readOnly
              aria-label="robots.txt output"
              className="w-full flex-1 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-emerald-700 dark:text-emerald-400 font-mono h-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 text-xs resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useState } from 'react';
import { AlignLeft, Copy, Download, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'sql-formatter';
import { downloadOrShare } from '@/utils/nativeShare';
import { clipboardWrite } from "@/lib/clipboard";

export default function SqlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [tabSize, setTabSize] = useState(2);
  const [uppercase, setUppercase] = useState(true);

  const formatSql = () => {
    if (!input.trim()) {
      toast.error('Please enter SQL query');
      return;
    }

    try {
      const formatted = format(input, {
        language: 'sql',
        tabWidth: tabSize,
        useTabs: false,
        keywordCase: uppercase ? 'upper' : 'preserve'
      });
      setOutput(formatted);
      toast.success('SQL Query Formatted!');
    } catch (err: any) {
      toast.error(err.message || 'Syntax error in SQL query');
    }
  };

  const handleCopy = () => {
    if (!output) return;
    clipboardWrite(output);
    toast.success('Copied!');
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, 'formatted.sql');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 border border-zinc-200 dark:border-white/5 rounded-2xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
            <AlignLeft className="w-5 h-5 text-indigo-500" />
            SQL Query Formatter
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Beautify and indent SQL queries with customizable spacing and case conventions client-side.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings and Input Column */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-xs text-zinc-400 font-bold uppercase block">Configuration Settings</span>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Indent Spacing</label>
                <select value={tabSize} onChange={e => setTabSize(parseInt(e.target.value))} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-white text-xs outline-none">
                  <option value="2">2 Spaces</option>
                  <option value="4">4 Spaces</option>
                  <option value="8">8 Spaces</option>
                </select>
              </div>

              <div className="space-y-1 flex items-center pt-5">
                <label className="text-xs text-zinc-400 flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={uppercase} onChange={e => setUppercase(e.target.checked)} className="rounded" />
                  Uppercase Keywords
                </label>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <span className="text-xs text-zinc-400 font-bold uppercase block">Original Query</span>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="SELECT * FROM users WHERE status = 'active' AND age > 21 JOIN orders ON orders.user_id = users.id..."
                className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white font-mono h-60 outline-none text-xs resize-none"
              />
            </div>
          </div>

          <button onClick={formatSql} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
            <Check className="w-4 h-4" /> Format SQL Query
          </button>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl shadow-xl flex flex-col justify-between min-h-[400px]">
          <div className="space-y-2 flex-1 flex flex-col">
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-400 font-bold uppercase">Formatted SQL Output</span>
              {output && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="p-1.5 text-zinc-500 hover:text-white border border-zinc-800 rounded-lg" aria-label="Copy"><Copy className="w-4 h-4" /></button>
                  <button onClick={handleDownload} className="p-1.5 text-zinc-500 hover:text-white border border-zinc-800 rounded-lg" aria-label="Download"><Download className="w-4 h-4" /></button>
                </div>
              )}
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="Formatted SQL output will appear here..."
              className="w-full flex-1 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white font-mono h-[380px] outline-none text-xs resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
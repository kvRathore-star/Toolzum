"use client";

import React, { useState } from 'react';
import { Eye, Download, Code, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import JSZip from 'jszip';
import { downloadOrShare } from '@/utils/nativeShare';

export default function GrammarCheckerExtension() {
  const [activeTab, setActiveTab] = useState<'manifest' | 'popupHtml' | 'contentJs'>('manifest');
  const [extName, setExtName] = useState('My Grammar Checker');

  const manifest = `{
  "manifest_version": 3,
  "name": "${extName}",
  "version": "1.0",
  "description": "Analyze text fields in any active tab and highlight grammar issues.",
  "permissions": [
    "activeTab",
    "scripting"
  ],
  "action": {
    "default_popup": "popup.html"
  }
}`;

  const popupHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { width: 220px; padding: 10px; font-family: sans-serif; background: #121214; color: white; }
    .title { font-size: 14px; font-weight: bold; color: #a855f7; text-align: center; margin-bottom: 8px; }
    button { width: 100%; background: #a855f7; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; }
    button:hover { background: #9333ea; }
  </style>
</head>
<body>
  <div className="title">Grammar Checker</div>
  <button id="checkBtn">Scan Webpage Inputs</button>
  <script src="popup.js"></script>
</body>
</html>`;

  const contentJs = `// Client side scan logic to find typos in webpage textareas
const textAreas = document.querySelectorAll('textarea, input[type="text"]');
textAreas.forEach(area => {
  area.addEventListener('blur', () => {
    const text = area.value;
    // Simple basic checks for common double words/typos
    if (/\\b(the the|and and|is is|a a)\\b/i.test(text)) {
      area.style.border = "2px solid #ef4444";
    }
  });
});`;

  const handleDownload = async () => {
    try {
      const zip = new JSZip();
      zip.file("manifest.json", manifest);
      zip.file("popup.html", popupHtml);
      zip.file("content.js", contentJs);

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      downloadOrShare(url, `grammar_checker_extension.zip`);
      toast.success('Grammar checker extension ZIP downloaded!');
    } catch (err) {
      toast.error('Failed to create package');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 border border-zinc-200 dark:border-white/5 rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          Grammar Checker Extension Builder
        </h2>
        <p className="text-xs text-zinc-500 mt-1">Configure and export a ready-to-load custom Chrome extension source package to find typos in webpage input fields.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl shadow-xl space-y-4">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block border-b border-zinc-800 pb-2">Settings</span>
          
          <div className="space-y-2">
            <label className="text-xs text-zinc-400 font-bold">Extension Name</label>
            <input 
              type="text" 
              value={extName} 
              onChange={e => setExtName(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-white text-xs outline-none"
            />
          </div>

          <button onClick={handleDownload} className="w-full mt-4 bg-[var(--accent)] hover:bg-indigo-600 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
            <Download className="w-4 h-4" /> Download Extension ZIP
          </button>
        </div>

        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl shadow-xl flex flex-col justify-between min-h-[450px]">
          <div className="space-y-3 flex-1 flex flex-col">
            <div className="flex bg-zinc-50 dark:bg-black/45 p-1 rounded-xl gap-1">
              <button onClick={() => setActiveTab('manifest')} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${activeTab === 'manifest' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500'}`}>
                manifest.json
              </button>
              <button onClick={() => setActiveTab('popupHtml')} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${activeTab === 'popupHtml' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500'}`}>
                popup.html
              </button>
              <button onClick={() => setActiveTab('contentJs')} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${activeTab === 'contentJs' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500'}`}>
                content.js
              </button>
            </div>

            <textarea
              value={activeTab === 'manifest' ? manifest : activeTab === 'popupHtml' ? popupHtml : contentJs}
              readOnly
              className="w-full flex-1 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-emerald-400 font-mono h-80 outline-none text-xs resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
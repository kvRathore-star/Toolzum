"use client";
import React, { useState } from 'react';

export default function HtmlPreview() {
  const [html, setHtml] = useState('<h1>Hello, World!</h1>\n<p>Start typing HTML above to see a live preview below.</p>');

  return (
    <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-1">
          <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">HTML Source</h4>
          <textarea value={html} onChange={e => setHtml(e.target.value)} placeholder="Type or paste HTML..." className="w-full h-[500px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none font-mono focus:border-blue-500 transition-colors" />
        </div>
        <div className="space-y-1">
          <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Preview</h4>
          <div className="w-full h-[500px] bg-white border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
            <iframe
              srcDoc={html}
              title="HTML Preview"
              className="w-full h-full border-0"
              sandbox="allow-scripts"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

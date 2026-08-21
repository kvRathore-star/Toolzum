"use client";

import React, { useState, useEffect } from 'react';
import { Download, FileCode, Play, Sparkles, RefreshCw, FileText, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DOMPurify from 'dompurify';
import { downloadOrShare } from '@/utils/nativeShare';

const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <!-- Background -->
  <rect width="100%" height="100%" fill="#1e1b4b" rx="20"/>
  
  <!-- Glowing Sphere -->
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#818cf8" stop-opacity="1"/>
      <stop offset="100%" stop-color="#312e81" stop-opacity="0.2"/>
    </radialGradient>
  </defs>
  
  <circle cx="200" cy="200" r="120" fill="url(#glow)"/>
  <circle cx="200" cy="200" r="80" fill="none" stroke="#6366f1" stroke-width="4" stroke-dasharray="10, 5"/>
  
  <!-- Text -->
  <text x="200" y="210" font-family="sans-serif" font-size="24" font-weight="bold" fill="#ffffff" text-anchor="middle">SVG EDITOR</text>
  <text x="200" y="240" font-family="sans-serif" font-size="12" fill="#a1a1aa" letter-spacing="3" text-anchor="middle">OFFLINE VECTOR</text>
</svg>`;

export default function SvgEditor() {
  const [svgCode, setSvgCode] = useState(DEFAULT_SVG);
  const [renderedSvg, setRenderedSvg] = useState(DEFAULT_SVG);

  const handleRun = () => {
    // Basic validation
    if (!svgCode.trim().toLowerCase().startsWith("<svg") || !svgCode.toLowerCase().includes("</svg>")) {
      return toast.error("Invalid SVG code. Ensure it starts with <svg> and ends with </svg>.");
    }
    setRenderedSvg(svgCode);
    toast.success("Render updated!");
  };

  const insertShape = (type: string) => {
    let snippet = "";
    if (type === 'rect') {
      snippet = `  <rect x="50" y="50" width="100" height="100" fill="#6366f1" rx="10" />\n`;
    } else if (type === 'circle') {
      snippet = `  <circle cx="150" cy="150" r="50" fill="#f43f5e" />\n`;
    } else if (type === 'text') {
      snippet = `  <text x="100" y="200" font-family="sans-serif" font-size="20" fill="#ffffff">Hello World</text>\n`;
    } else if (type === 'line') {
      snippet = `  <line x1="50" y1="50" x2="350" y2="350" stroke="#10b981" stroke-width="5" />\n`;
    } else if (type === 'star') {
      snippet = `  <polygon points="100,10 40,198 190,78 10,78 160,198" fill="#eab308" />\n`;
    }

    // Insert before the closing </svg> tag
    const closeIdx = svgCode.lastIndexOf("</svg>");
    if (closeIdx !== -1) {
      const updated = svgCode.substring(0, closeIdx) + snippet + svgCode.substring(closeIdx);
      setSvgCode(updated);
      setRenderedSvg(updated);
      toast.success(`Inserted ${type} element!`);
    }
  };

  const downloadSvgFile = () => {
    const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    downloadOrShare(url, "vector_design.svg");
    toast.success("Vector SVG downloaded!");
  };

  const clearAll = () => {
    setSvgCode(DEFAULT_SVG);
    setRenderedSvg(DEFAULT_SVG);
    toast.success("Reset to default canvas!");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Title */}
      <div className="bg-[var(--bg-overlay)] p-5 border border-zinc-200 dark:border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <FileCode className="w-5 h-5 text-[var(--accent)]" />
          Offline SVG Editor
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Write, preview, and build vector graphic layouts in real time. 100% offline.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Editor Code Panel */}
        <div className="lg:col-span-6 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-xl flex flex-col justify-between h-[600px]">
          <div className="space-y-4 flex-1 flex flex-col">
            <div className="flex justify-between items-center border-b border-[var(--border-subtle)] dark:border-zinc-800 pb-2">
               <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                 <FileCode className="w-4 h-4" />
                 SVG Source Code
               </h3>
               
               {/* Quick add items */}
               <div className="flex gap-1">
                 <button onClick={() => insertShape('rect')} className="p-1.5 bg-[var(--bg-overlay)] hover:bg-[var(--bg-surface)]/80 dark:hover:bg-[var(--bg-elevated)] rounded-lg text-xs font-semibold cursor-pointer border border-zinc-100 dark:border-zinc-700" title="Add Rectangle">Rect</button>
                 <button onClick={() => insertShape('circle')} className="p-1.5 bg-[var(--bg-overlay)] hover:bg-[var(--bg-surface)]/80 dark:hover:bg-[var(--bg-elevated)] rounded-lg text-xs font-semibold cursor-pointer border border-zinc-100 dark:border-zinc-700" title="Add Circle">Circle</button>
                 <button onClick={() => insertShape('text')} className="p-1.5 bg-[var(--bg-overlay)] hover:bg-[var(--bg-surface)]/80 dark:hover:bg-[var(--bg-elevated)] rounded-lg text-xs font-semibold cursor-pointer border border-zinc-100 dark:border-zinc-700" title="Add Text">Text</button>
                 <button onClick={() => insertShape('star')} className="p-1.5 bg-[var(--bg-overlay)] hover:bg-[var(--bg-surface)]/80 dark:hover:bg-[var(--bg-elevated)] rounded-lg text-xs font-semibold cursor-pointer border border-zinc-100 dark:border-zinc-700" title="Add Star">Star</button>
               </div>
            </div>

            <textarea
              value={svgCode}
              onChange={e => setSvgCode(e.target.value)}
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-zinc-900 dark:text-[var(--text-secondary)] font-mono text-xs leading-relaxed outline-none focus:border-indigo-500 resize-none flex-1 overflow-y-auto"
              placeholder="Write SVG code here..."
            />
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <button 
              onClick={clearAll}
              className="py-3 bg-[var(--bg-overlay)] hover:bg-[var(--bg-surface)] dark:hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold rounded-xl text-xs transition-all active:scale-[0.98] cursor-pointer flex justify-center items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset
            </button>
            <button 
              onClick={handleRun}
              className="py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-700 dark:hover:bg-[var(--bg-elevated)] text-white font-bold rounded-xl text-xs transition-all active:scale-[0.98] cursor-pointer flex justify-center items-center gap-1"
            >
              <Play className="w-3.5 h-3.5" />
              Render Live
            </button>
            <button 
              onClick={downloadSvgFile}
              className="py-3 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl text-xs transition-all active:scale-[0.98] cursor-pointer flex justify-center items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Export SVG
            </button>
          </div>
        </div>

        {/* Live Vector View Panel */}
        <div className="lg:col-span-6 flex flex-col bg-[var(--bg-overlay)]/45 border border-zinc-200 dark:border-[var(--border-subtle)] p-5 rounded-2xl h-[600px]">
          <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-3 mb-4">
             <span className="text-xs font-bold text-[var(--text-muted)]">VECTOR RENDER CANVAS (AUTO ASPECT)</span>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 bg-white dark:bg-zinc-950 border border-[var(--border-subtle)] dark:border-zinc-800 rounded-xl relative overflow-hidden shadow-2xl">
            {/* Checkerboard Grid pattern for transparent preview backing */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(#1f2937 1px, transparent 1px), radial-gradient(#1f2937 1px, #ffffff 1px)',
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 8px 8px'
              }}
            />
            
            {/* Render block */}
            <div 
              className="relative z-10 w-full max-w-[350px] aspect-square sm:max-w-[400px] flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderedSvg, { USE_PROFILES: { svg: true, svgFilters: true } }) }}
            />
          </div>
        </div>

      </div>

    </div>
  );
}

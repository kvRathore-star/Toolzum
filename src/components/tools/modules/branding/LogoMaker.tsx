"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Download, Sparkles, RefreshCw, Type, Layout, Sliders, Layers } from 'lucide-react';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';

interface LogoPreset {
  name: string;
  icon: string;
  color1: string;
  color2: string;
  font: string;
}

const PRESETS: LogoPreset[] = [
  { name: 'Apex Tech', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', color1: '#6366f1', color2: '#a855f7', font: 'sans-serif' },
  { name: 'Bloom Bio', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', color1: '#10b981', color2: '#06b6d4', font: 'serif' },
  { name: 'Nova Media', icon: 'M15 10l-9 5V5l9 5zm0 0v10l9-5-9-5z', color1: '#f43f5e', color2: '#e11d48', font: 'monospace' },
  { name: 'Volt Energy', icon: 'M13 10V3L4 14h7v7l9-11h-7z', color1: '#f59e0b', color2: '#d97706', font: 'sans-serif' },
  { name: 'Zenith Firm', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z', color1: '#1e1b4b', color2: '#312e81', font: 'serif' }
];

export default function LogoMaker() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [text, setText] = useState('My Brand');
  const [tagline, setTagline] = useState('INNOVATION FIRST');
  
  const [selectedIcon, setSelectedIcon] = useState(PRESETS[0]!.icon);
  const [color1, setColor1] = useState(PRESETS[0]!.color1);
  const [color2, setColor2] = useState(PRESETS[0]!.color2);
  const [fontFamily, setFontFamily] = useState(PRESETS[0]!.font);
  
  const [iconSize, setIconSize] = useState(60);
  const [textSize, setTextSize] = useState(36);
  const [taglineSize, setTaglineSize] = useState(14);
  const [spacing, setSpacing] = useState(15);
  const [layout, setLayout] = useState<'vertical' | 'horizontal'>('vertical');
  const [bgColor, setBgColor] = useState('transparent');

  useEffect(() => {
    drawLogo();
  }, [text, tagline, selectedIcon, color1, color2, fontFamily, iconSize, textSize, taglineSize, spacing, layout, bgColor]);

  const drawLogo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and draw background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Create Color Gradient for the Icon
    const gradient = ctx.createLinearGradient(centerX - 50, centerY - 50, centerX + 50, centerY + 50);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);

    ctx.save();

    if (layout === 'vertical') {
      // 1. Draw Icon
      const iconY = centerY - iconSize - spacing;
      ctx.translate(centerX, iconY);
      drawIconPath(ctx, selectedIcon, iconSize, gradient);
      ctx.restore();

      // 2. Draw Main Text
      ctx.save();
      ctx.fillStyle = bgColor === '#ffffff' ? '#18181b' : (bgColor === 'transparent' ? '#6366f1' : '#ffffff');
      ctx.font = `bold ${textSize}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const textY = centerY + spacing;
      ctx.fillText(text, centerX, textY);

      // 3. Draw Tagline
      if (tagline) {
        ctx.fillStyle = '#a1a1aa'; // Muted grey
        ctx.font = `tracking-widest uppercase ${taglineSize}px sans-serif`;
        ctx.fillText(tagline, centerX, textY + textSize / 2 + spacing);
      }
      ctx.restore();
    } else {
      // Horizontal Layout
      const totalWidth = iconSize + spacing + ctx.measureText(text).width;
      const startX = centerX - totalWidth / 2;

      // 1. Draw Icon
      ctx.translate(startX + iconSize / 2, centerY);
      drawIconPath(ctx, selectedIcon, iconSize, gradient);
      ctx.restore();

      // 2. Draw Main Text
      ctx.save();
      ctx.fillStyle = bgColor === '#ffffff' ? '#18181b' : (bgColor === 'transparent' ? '#6366f1' : '#ffffff');
      ctx.font = `bold ${textSize}px ${fontFamily}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const textX = startX + iconSize + spacing;
      ctx.fillText(text, textX, centerY - 5);

      // 3. Draw Tagline
      if (tagline) {
        ctx.fillStyle = '#a1a1aa';
        ctx.font = `tracking-widest uppercase ${taglineSize}px sans-serif`;
        ctx.fillText(tagline, textX, centerY + textSize / 2 + 5);
      }
      ctx.restore();
    }
  };

  const drawIconPath = (ctx: CanvasRenderingContext2D, pathStr: string, size: number, fillStyle: any) => {
    ctx.scale(size / 24, size / 24); // SVG paths are standard 24x24px scale
    ctx.translate(-12, -12); // Center path translation
    
    ctx.fillStyle = fillStyle;
    const path = new Path2D(pathStr);
    ctx.fill(path);
  };

  const loadPreset = (preset: LogoPreset) => {
    setText(preset.name);
    setSelectedIcon(preset.icon);
    setColor1(preset.color1);
    setColor2(preset.color2);
    setFontFamily(preset.font);
    toast.success(`Loaded preset: ${preset.name}`);
  };

  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    downloadOrShare(dataUrl, `${text.toLowerCase().replace(/\s+/g, '_')}_logo.png`);
    toast.success("Logo downloaded as PNG!");
  };

  const downloadSVG = () => {
    // Generate inline SVG structure
    const width = 500;
    const height = 500;
    const textFill = bgColor === '#ffffff' ? '#18181b' : '#ffffff';
    
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
        </linearGradient>
      </defs>
      ${bgColor !== 'transparent' ? `<rect width="100%" height="100%" fill="${bgColor}"/>` : ''}
      <g transform="translate(250, 200) scale(${iconSize / 24}) translate(-12, -12)">
        <path d="${selectedIcon}" fill="url(#grad)" />
      </g>
      <text x="250" y="320" font-family="${fontFamily}" font-size="${textSize}" font-weight="bold" fill="${textFill}" text-anchor="middle">${text}</text>
      ${tagline ? `<text x="250" y="360" font-family="sans-serif" font-size="${taglineSize}" letter-spacing="3" fill="#a1a1aa" text-anchor="middle">${tagline.toUpperCase()}</text>` : ''}
    </svg>`;

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, `${text.toLowerCase().replace(/\s+/g, '_')}_logo.svg`);
    toast.success("Logo downloaded as SVG!");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[var(--bg-overlay)] p-5 border border-zinc-200 dark:border-[var(--border-subtle)] rounded-2xl gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            Vector Logo Maker
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Design premium vector logos with icons, custom typography, and high-fidelity PNG/SVG downloads.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Editor Controls */}
        <div className="lg:col-span-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 max-h-[680px] overflow-y-auto pr-2">
          
          {/* Preset templates */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5"><Layout className="w-3.5 h-3.5" /> Quick Presets</h3>
            <div className="flex gap-2 flex-wrap">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => loadPreset(preset)}
                  className="px-3 py-1.5 text-xs font-bold bg-[var(--bg-overlay)] border border-[var(--border-subtle)]/60 rounded-xl hover:bg-zinc-100 dark:hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5"><Type className="w-3.5 h-3.5" /> Typography</h3>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Brand Name</label>
              <input aria-label="Brand Name"
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 text-sm focus:border-[var(--border-subtle)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Tagline</label>
              <input aria-label="Tagline"
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 text-sm focus:border-[var(--border-subtle)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Font Family</label>
                <select aria-label="Font Family"
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 text-xs"
                >
                  <option value="sans-serif">Sans Serif (Modern)</option>
                  <option value="serif">Serif (Traditional)</option>
                  <option value="monospace">Monospace (Minimal)</option>
                  <option value="cursive">Cursive (Elegant)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Layout Style</label>
                <select aria-label="Layout Style"
                  value={layout}
                  onChange={(e) => setLayout(e.target.value as any)}
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 text-xs"
                >
                  <option value="vertical">Stacked (Vertical)</option>
                  <option value="horizontal">Line (Horizontal)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sizing sliders */}
          <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5" /> Dimensions & Spacing</h3>
            
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-[var(--text-secondary)] uppercase font-bold">
                <span>Icon Size</span>
                <span>{iconSize}px</span>
              </div>
              <input aria-label="Icon Size" type="range" min="30" max="120" value={iconSize} onChange={e => setIconSize(parseInt(e.target.value))} className="w-full accent-indigo-650" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-[var(--text-secondary)] uppercase font-bold">
                <span>Text Size</span>
                <span>{textSize}px</span>
              </div>
              <input aria-label="Text Size" type="range" min="18" max="64" value={textSize} onChange={e => setTextSize(parseInt(e.target.value))} className="w-full accent-indigo-650" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-[var(--text-secondary)] uppercase font-bold">
                <span>Tagline Size</span>
                <span>{taglineSize}px</span>
              </div>
              <input aria-label="Tagline Size" type="range" min="8" max="24" value={taglineSize} onChange={e => setTaglineSize(parseInt(e.target.value))} className="w-full accent-indigo-650" />
            </div>
          </div>

          {/* Colors & Canvas BG */}
          <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> Palette & Canvas</h3>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Gradient Start</label>
                <input aria-label="Gradient Start" type="color" value={color1} onChange={e => setColor1(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Gradient End</label>
                <input aria-label="Gradient End" type="color" value={color2} onChange={e => setColor2(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Canvas BG</label>
                <select aria-label="Canvas BG"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full h-10 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-2 text-[10px] font-bold focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                >
                  <option value="transparent">Transparent</option>
                  <option value="#ffffff">White</option>
                  <option value="#18181b">Dark Grey</option>
                  <option value="#000000">Black</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Live Canvas Preview Panel */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-[var(--bg-overlay)]/45 border border-zinc-200 dark:border-[var(--border-subtle)] p-6 rounded-2xl min-h-[450px]">
          <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-3 mb-4">
             <span className="text-xs font-bold text-[var(--text-muted)]">CANVAS PREVIEW (500 x 500)</span>
          </div>

          <div className="flex-1 flex items-center justify-center">
            {/* Checked checkerboard pattern background for transparent canvas previews */}
            <div className="relative border-2 border-dashed border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-2xl p-1 bg-white dark:bg-zinc-950">
              {bgColor === 'transparent' && (
                <div 
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage: 'radial-gradient(#1f2937 1px, transparent 1px), radial-gradient(#1f2937 1px, #ffffff 1px)',
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 8px 8px'
                  }}
                />
              )}
              <canvas 
                ref={canvasRef} 
                width={500} 
                height={500} 
                className="relative z-10 w-full max-w-[350px] aspect-square sm:max-w-[400px]"
              />
            </div>
          </div>

          {/* Export triggers */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <button 
              onClick={downloadPNG}
              className="bg-zinc-900 hover:bg-zinc-800 dark:bg-[var(--bg-surface)] dark:hover:bg-[var(--bg-elevated)] text-white font-bold py-3.5 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2 cursor-pointer text-sm"
            >
              <Download className="w-4 h-4" />
              Download PNG
            </button>
            
            <button 
              onClick={downloadSVG}
              className="bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold py-3.5 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2 cursor-pointer text-sm"
            >
              <Download className="w-4 h-4" />
              Download Vector SVG
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

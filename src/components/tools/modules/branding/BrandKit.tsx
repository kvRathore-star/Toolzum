"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Palette, Plus, Trash2, Copy, Check, Download } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';

interface BrandColor {
  hex: string;
  name: string;
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

const STARTER_COLORS: BrandColor[] = [
  { hex: '#4F46E5', name: 'Primary' },
  { hex: '#10B981', name: 'Secondary' },
  { hex: '#F59E0B', name: 'Accent' },
  { hex: '#111827', name: 'Text' },
];

const STARTER_FONTS = ['Inter', 'Roboto'];

export default function BrandKit() {
  const [colors, setColors] = useState<BrandColor[]>([]);
  const [fonts, setFonts] = useState<string[]>([]);
  const [newColorHex, setNewColorHex] = useState('#000000');
  const [newColorName, setNewColorName] = useState('Primary');
  const [newFont, setNewFont] = useState('Inter');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const hydratedRef = useRef(false);

  // Load from local storage (seed with starter templates only when nothing stored)
  useEffect(() => {
    try {
      const savedColors = localStorage.getItem('brandKit_colors');
      const savedFonts = localStorage.getItem('brandKit_fonts');
      if (savedColors !== null) // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate colors from localStorage on mount
        setColors(JSON.parse(savedColors));
      else setColors(STARTER_COLORS);
      if (savedFonts !== null) setFonts(JSON.parse(savedFonts));
      else setFonts(STARTER_FONTS);
    } catch {
      setColors(STARTER_COLORS);
      setFonts(STARTER_FONTS);
    } finally {
      hydratedRef.current = true;
    }
  }, []);

  // Save to local storage when state changes (skip until hydrated so mount never overwrites storage with [])
  useEffect(() => {
    if (!hydratedRef.current) return;
    localStorage.setItem('brandKit_colors', JSON.stringify(colors));
    localStorage.setItem('brandKit_fonts', JSON.stringify(fonts));
  }, [colors, fonts]);

  const addColor = () => {
    if (!HEX_RE.test(newColorHex.trim())) { toast.error('Enter a valid 6-digit hex color, e.g. #4F46E5'); return; }
    if (newColorHex) {
      setColors([...colors, { hex: newColorHex, name: newColorName.trim() || 'Unnamed' }]);
      setNewColorName('');
    }
  };

  const removeColor = (index: number) => {
    const updated = [...colors];
    updated.splice(index, 1);
    setColors(updated);
  };

  const addFont = () => {
    if (newFont && !fonts.includes(newFont)) {
      setFonts([...fonts, newFont]);
      setNewFont('');
    }
  };

  const removeFont = (font: string) => {
    setFonts(fonts.filter(f => f !== font));
  };

  const copyToClipboard = (text: string) => {
    clipboardWrite(text).then(ok => { if (ok) { setCopiedId(text); setTimeout(() => setCopiedId(null), 2000); } else toast.error('Copy blocked by the browser — select the text manually.'); });
  };

  const exportKit = () => {
    const blob = new Blob([JSON.stringify({ colors, fonts }, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, 'brand-kit.json');
    setTimeout(() => URL.revokeObjectURL(url), 100);
    toast.success('Brand kit exported!');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-8 rounded-2xl shadow-xl space-y-8">
         <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-6">
           <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
             <Palette className="w-8 h-8 text-[var(--accent)]" />
           </div>
            <div>
              <h2 className="text-2xl font-bold">Your Brand Kit</h2>
              <p className="text-[var(--text-secondary)]">Save your brand colors and fonts locally to easily copy them when needed.</p>
            </div>
            <button onClick={exportKit} className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium rounded-xl transition-colors shrink-0" aria-label="Export brand kit as JSON">
              <Download className="w-4 h-4" /> Export
            </button>
         </div>

         {/* Colors Section */}
         <div className="space-y-6">
           <h3 className="text-xl font-bold border-b border-[var(--border-subtle)] pb-2">Brand Colors</h3>
           
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
             {colors.map((color, idx) => (
               <div key={idx} className="group relative border border-[var(--border-subtle)] rounded-xl overflow-hidden hover:shadow-lg transition-all bg-[var(--bg-overlay)]/50">
                  <div 
                    className="h-24 w-full cursor-pointer flex items-center justify-center transition-opacity hover:opacity-90" 
                    style={{ backgroundColor: color.hex }}
                    role="button" tabIndex={0}
                    onClick={() => copyToClipboard(color.hex)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); copyToClipboard(color.hex); } }}
                  >
                   {copiedId === color.hex && (
                     <div className="bg-black/50 text-white p-2 rounded-full backdrop-blur-sm">
                       <Check className="w-5 h-5" />
                     </div>
                   )}
                 </div>
                 <div className="p-3">
                   <div className="font-semibold text-sm truncate">{color.name || 'Unnamed'}</div>
                   <div className="text-xs text-[var(--text-secondary)] font-mono flex items-center justify-between">
                     {color.hex.toUpperCase()}
                     <button aria-label={`Copy ${color.hex}`} onClick={() => copyToClipboard(color.hex)} className="hover:text-[var(--text-primary)] dark:hover:text-white">
                       <Copy className="w-3 h-3" />
                     </button>
                   </div>
                 </div>
<button aria-label={`Remove color ${color.hex}`} 
                    onClick={() => removeColor(idx)}
                   className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
             ))}

             {/* Add Color Button */}
             <div className="border border-dashed border-[var(--border-subtle)] rounded-xl p-4 flex flex-col justify-center items-center bg-[var(--bg-overlay)]/20">
               <div className="flex gap-2 w-full mb-3">
                 <input 
                   type="color" aria-label="New color" 
                   value={newColorHex} 
                   onChange={e => setNewColorHex(e.target.value)} 
                   className="h-10 w-12 rounded cursor-pointer border-0 p-0 shrink-0"
                 />
                 <input 
                   type="text" 
                   placeholder="Name (e.g. Primary)" aria-label="Color name"
                   value={newColorName} 
                   onChange={e => setNewColorName(e.target.value)} 
                   className="w-full text-sm p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                 />
               </div>
               <button 
                 onClick={addColor}
                 className="w-full flex items-center justify-center gap-1 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 py-2 rounded-lg font-medium transition-colors text-sm"
               >
                 <Plus className="w-4 h-4" /> Add Color
               </button>
             </div>
           </div>
         </div>

         {/* Fonts Section */}
         <div className="space-y-6 pt-8">
           <h3 className="text-xl font-bold border-b border-[var(--border-subtle)] pb-2">Brand Fonts</h3>
           
           <div className="flex flex-wrap gap-3">
             {fonts.map((font, idx) => (
               <div key={idx} className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl group">
                 <div className="font-medium" style={{ fontFamily: font }}>{font}</div>
<button aria-label={`Copy font ${font}`}
                    onClick={() => copyToClipboard(`font-family: '${font}';`)}
                   className="text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:hover:text-white"
                 >
                   {copiedId === `font-family: '${font}';` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                 </button>
<button aria-label={`Remove font ${font}`}
                    onClick={() => removeFont(font)}
                   className="text-[var(--text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
             ))}
           </div>

           <div className="flex gap-3 max-w-sm">
             <input 
               type="text" 
               placeholder="Google Font Name (e.g. Roboto)" aria-label="Google font name"
               value={newFont} 
               onChange={e => setNewFont(e.target.value)} 
               className="flex-1 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
             />
             <button 
               onClick={addFont}
               className="bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white px-5 rounded-xl font-medium transition-colors"
             >
               Add
             </button>
           </div>
         </div>

      </div>
    </div>
  );
}

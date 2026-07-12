"use client";
import React, { useState, useEffect } from 'react';
import { Palette, Plus, Trash2, Copy, Check } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

interface BrandColor {
  hex: string;
  name: string;
}

export default function BrandKit() {
  const [colors, setColors] = useState<BrandColor[]>([]);
  const [fonts, setFonts] = useState<string[]>([]);
  const [newColorHex, setNewColorHex] = useState('#000000');
  const [newColorName, setNewColorName] = useState('Primary');
  const [newFont, setNewFont] = useState('Inter');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load from local storage
  useEffect(() => {
    const savedColors = localStorage.getItem('brandKit_colors');
    const savedFonts = localStorage.getItem('brandKit_fonts');
    if (savedColors) setColors(JSON.parse(savedColors));
    if (savedFonts) setFonts(JSON.parse(savedFonts));
  }, []);

  // Save to local storage when state changes
  useEffect(() => {
    localStorage.setItem('brandKit_colors', JSON.stringify(colors));
    localStorage.setItem('brandKit_fonts', JSON.stringify(fonts));
  }, [colors, fonts]);

  const addColor = () => {
    if (newColorHex) {
      setColors([...colors, { hex: newColorHex, name: newColorName }]);
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
    clipboardWrite(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-8 rounded-2xl shadow-xl space-y-8">
         <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-6">
           <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
             <Palette className="w-8 h-8 text-rose-500" />
           </div>
           <div>
             <h2 className="text-2xl font-bold">Your Brand Kit</h2>
             <p className="text-zinc-500">Save your brand colors and fonts locally to easily copy them when needed.</p>
           </div>
         </div>

         {/* Colors Section */}
         <div className="space-y-6">
           <h3 className="text-xl font-bold border-b border-zinc-200 dark:border-zinc-800 pb-2">Brand Colors</h3>
           
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
             {colors.map((color, idx) => (
               <div key={idx} className="group relative border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-lg transition-all bg-zinc-50 dark:bg-zinc-800/50">
                 <div 
                   className="h-24 w-full cursor-pointer flex items-center justify-center transition-opacity hover:opacity-90" 
                   style={{ backgroundColor: color.hex }}
                   onClick={() => copyToClipboard(color.hex)}
                 >
                   {copiedId === color.hex && (
                     <div className="bg-black/50 text-white p-2 rounded-full backdrop-blur-sm">
                       <Check className="w-5 h-5" />
                     </div>
                   )}
                 </div>
                 <div className="p-3">
                   <div className="font-semibold text-sm truncate">{color.name || 'Unnamed'}</div>
                   <div className="text-xs text-zinc-500 font-mono flex items-center justify-between">
                     {color.hex.toUpperCase()}
                     <button onClick={() => copyToClipboard(color.hex)} className="hover:text-zinc-900 dark:hover:text-white">
                       <Copy className="w-3 h-3" />
                     </button>
                   </div>
                 </div>
                 <button 
                   onClick={() => removeColor(idx)}
                   className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
             ))}

             {/* Add Color Button */}
             <div className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-4 flex flex-col justify-center items-center bg-zinc-50 dark:bg-zinc-800/20">
               <div className="flex gap-2 w-full mb-3">
                 <input 
                   type="color" 
                   value={newColorHex} 
                   onChange={e => setNewColorHex(e.target.value)} 
                   className="h-10 w-12 rounded cursor-pointer border-0 p-0 shrink-0"
                 />
                 <input 
                   type="text" 
                   placeholder="Name (e.g. Primary)"
                   value={newColorName} 
                   onChange={e => setNewColorName(e.target.value)} 
                   className="w-full text-sm p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 outline-none"
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
           <h3 className="text-xl font-bold border-b border-zinc-200 dark:border-zinc-800 pb-2">Brand Fonts</h3>
           
           <div className="flex flex-wrap gap-3">
             {fonts.map((font, idx) => (
               <div key={idx} className="flex items-center gap-3 px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl group">
                 <div className="font-medium" style={{ fontFamily: font }}>{font}</div>
                 <button 
                   onClick={() => copyToClipboard(`font-family: '${font}';`)}
                   className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                 >
                   {copiedId === `font-family: '${font}';` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                 </button>
                 <button 
                   onClick={() => removeFont(font)}
                   className="text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
             ))}
           </div>

           <div className="flex gap-3 max-w-sm">
             <input 
               type="text" 
               placeholder="Google Font Name (e.g. Roboto)"
               value={newFont} 
               onChange={e => setNewFont(e.target.value)} 
               className="flex-1 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 outline-none"
             />
             <button 
               onClick={addFont}
               className="bg-rose-600 hover:bg-rose-700 text-white px-5 rounded-xl font-medium transition-colors"
             >
               Add
             </button>
           </div>
         </div>

      </div>
    </div>
  );
}

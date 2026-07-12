"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAiProvider } from '@/hooks/useAiProvider';
import AiSettings from '../AiSettings';
import { Palette, Clipboard, Download, Sparkles } from 'lucide-react';
import { downloadOrShare } from '@/utils/nativeShare';
import { clipboardWrite } from "@/lib/clipboard";

const STYLES = [
  'Minimal & Modern', 'Bold & Vibrant', 'Luxury & Elegant', 
  'Earthy & Natural', 'Tech / Futuristic', 'Retro / Vintage',
  'Pastel Soft', 'Corporate / Professional'
];

export default function BrandColorPaletteGenerator() {
  const { isConfigured, generateCompletion } = useAiProvider();
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputText, setOutputText] = useState('');

  const [brandDesc, setBrandDesc] = useState('');
  const [style, setStyle] = useState('Minimal & Modern');

  const handleGenerate = async () => {
    if (!brandDesc.trim()) return toast.error('Please describe your brand');
    if (!isConfigured) return toast.error('Please configure your AI Provider API key first');

    setIsProcessing(true);
    try {
      const prompt = `You are a professional brand designer. Generate a complete brand color palette for: "${brandDesc}". Style: ${style}.

Return EXACTLY this JSON structure (no markdown, no code fences):
{
  "palette_name": "Name this palette",
  "colors": [
    { "name": "Primary", "hex": "#FFFFFF", "usage": "Headlines, buttons, main brand color" },
    { "name": "Secondary", "hex": "#FFFFFF", "usage": "Accents, hover states" },
    { "name": "Accent", "hex": "#FFFFFF", "usage": "CTAs, links, highlights" },
    { "name": "Background", "hex": "#FFFFFF", "usage": "Page backgrounds" },
    { "name": "Text", "hex": "#FFFFFF", "usage": "Body copy" },
    { "name": "Muted", "hex": "#FFFFFF", "usage": "Secondary text, borders" }
  ],
  "design_notes": "Brief explanation of why these colors work together."
}

Use real, harmonious hex codes appropriate for the brand and style.`;
      const response = await generateCompletion([{ role: 'user', content: prompt }], 0.7);
      
      let cleaned = response.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```json?\n?/g, '').replace(/```\n?/g, '');
      }
      
      try {
        const parsed = JSON.parse(cleaned);
        setOutputText(JSON.stringify(parsed, null, 2));
      } catch {
        setOutputText(cleaned);
      }
      
      toast.success('Palette generated!');
    } catch (e: any) {
      toast.error(e.message || "Failed to generate");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    clipboardWrite(outputText);
    toast.success('Copied to clipboard!');
  };

  const handleDownload = () => {
    const blob = new Blob([outputText], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, "brand_palette_" + new Date().toISOString().slice(0,10) + ".json");
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-6">
      <AiSettings />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <Palette className="w-5 h-5 text-pink-500" />
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Brand Color Palette Generator</h3>
            </div>

            <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-4">AI-powered color palettes that match your brand identity.</p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Describe Your Brand</label>
              <textarea
                value={brandDesc}
                onChange={e => setBrandDesc(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleGenerate()}
                placeholder="e.g., A premium organic skincare brand targeting eco-conscious millennials..."
                className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white h-32 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors text-sm resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Palette Style</label>
              <select
                value={style}
                onChange={e => setStyle(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none text-sm"
              >
                {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isProcessing}
            className="mt-6 w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:shadow-pink-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating palette...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Palette</span>
              </>
            )}
          </button>
        </div>

        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
            <h4 className="font-semibold text-zinc-900 dark:text-white">Generated Palette</h4>
            {outputText && (
              <div className="flex gap-2">
                <button onClick={handleCopy} className="p-2 text-zinc-500 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors" title="Copy to Clipboard">
                  <Clipboard className="w-4 h-4" />
                </button>
                <button onClick={handleDownload} className="p-2 text-zinc-500 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors" title="Download as JSON">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            {outputText ? (
              <div className="flex-1 overflow-y-auto max-h-[500px]">
                <pre className="p-4 rounded-xl bg-zinc-50 dark:bg-black/40 border border-zinc-100 dark:border-zinc-800/50 text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {outputText}
                </pre>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl p-8 text-center text-zinc-400">
                <Palette className="w-8 h-8 mb-3 text-zinc-300 dark:text-zinc-700 animate-pulse" />
                <p className="text-sm font-medium">Your color palette will appear here.</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Describe your brand and generate a professional color palette.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

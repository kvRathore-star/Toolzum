"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAiProvider } from '@/hooks/useAiProvider';
import AiSettings from '../../AiSettings';
import { Palette, Clipboard, Download, Sparkles } from 'lucide-react';
import { downloadOrShare } from '@/utils/nativeShare';
import { clipboardWrite } from "@/lib/clipboard";
import { AiPrivacyBanner } from '@/components/AiPrivacyBanner';
import { getErrorMessage } from '@/utils/error';

const STYLES = [
  'Minimal & Modern', 'Bold & Vibrant', 'Luxury & Elegant', 
  'Earthy & Natural', 'Tech / Futuristic', 'Retro / Vintage',
  'Pastel Soft', 'Corporate / Professional'
];

export default function BrandColorPaletteGenerator() {
  const { generateCompletion } = useAiProvider();
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputText, setOutputText] = useState('');

  const [brandDesc, setBrandDesc] = useState('');
  const [style, setStyle] = useState('Minimal & Modern');
  const [swatches, setSwatches] = useState<{ name: string; hex: string; usage: string }[]>([]);
  const [paletteName, setPaletteName] = useState('');
  const [designNotes, setDesignNotes] = useState('');
  const HEX_RE = /^#[0-9a-fA-F]{6}$/;

  const handleGenerate = async () => {
    if (!brandDesc.trim()) return toast.error('Please describe your brand');

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
        const list = Array.isArray(parsed?.colors) ? parsed.colors.filter((c: { hex?: string }) => typeof c?.hex === 'string' && HEX_RE.test(c.hex.trim())).map((c: { name?: string; hex: string; usage?: string }) => ({ name: c.name || 'Unnamed', hex: c.hex.trim(), usage: c.usage || '' })) : [];
        setSwatches(list);
        setPaletteName(typeof parsed?.palette_name === 'string' ? parsed.palette_name : '');
        setDesignNotes(typeof parsed?.design_notes === 'string' ? parsed.design_notes : '');
      } catch {
        setOutputText(cleaned);
        setSwatches([]);
        setPaletteName('');
        setDesignNotes('');
      }
      
      toast.success('Palette generated!');
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to generate"));
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
      <AiPrivacyBanner />
      <AiSettings />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
              <Palette className="w-5 h-5 text-pink-500" />
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Brand Color Palette Generator</h3>
            </div>

            <p className="text-xs text-[var(--text-muted)] mb-4">AI-powered color palettes that match your brand identity.</p>

            <div className="space-y-2">
              <label htmlFor="lbl-brandcolorpalettegenerator-describe-your-brand" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Describe Your Brand</label>
              <textarea id="lbl-brandcolorpalettegenerator-describe-your-brand" aria-label="Describe Your Brand"
                value={brandDesc}
                onChange={e => setBrandDesc(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleGenerate()}
                placeholder="e.g., A premium organic skincare brand targeting eco-conscious millennials..."
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] h-32 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--border-subtle)] dark:focus:border-[var(--border-subtle)] transition-colors text-sm resize-none"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lbl-brandcolorpalettegenerator-palette-style" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Palette Style</label>
              <select id="lbl-brandcolorpalettegenerator-palette-style" aria-label="Palette Style"
                value={style}
                onChange={e => setStyle(e.target.value)}
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 text-sm"
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

        <div className="lg:col-span-7 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-4">
            <h4 className="font-semibold text-[var(--text-primary)]">Generated Palette</h4>
            {outputText && (
              <div className="flex gap-2">
                <button onClick={handleCopy} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-elevated)] transition-colors" aria-label="Copy to Clipboard">
                  <Clipboard className="w-4 h-4" />
                </button>
                <button onClick={handleDownload} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-elevated)] transition-colors" aria-label="Download as JSON">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            {outputText ? (
              <div className="flex-1 overflow-y-auto max-h-[500px] space-y-4">
                {swatches.length > 0 && (
                  <div className="space-y-3">
                    {paletteName && <h5 className="font-bold text-[var(--text-primary)]">{paletteName}</h5>}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {swatches.map((c, i) => (
                        <button key={i} onClick={() => { clipboardWrite(c.hex); toast.success(`${c.name} ${c.hex} copied!`); }} className="rounded-xl overflow-hidden border border-[var(--border-subtle)] text-left hover:shadow-md transition-shadow" aria-label={`Copy ${c.name} ${c.hex}`}>
                          <div className="h-16 w-full" style={{ backgroundColor: c.hex }} />
                          <div className="p-2 bg-[var(--bg-overlay)]">
                            <div className="text-xs font-bold text-[var(--text-primary)]">{c.name}</div>
                            <div className="text-[11px] font-mono text-[var(--text-secondary)]">{c.hex}</div>
                            {c.usage && <div className="text-[10px] text-[var(--text-muted)] truncate">{c.usage}</div>}
                          </div>
                        </button>
                      ))}
                    </div>
                    {designNotes && <p className="text-xs text-[var(--text-secondary)] italic">{designNotes}</p>}
                  </div>
                )}
                <details className="group">
                  <summary className="text-xs font-bold text-[var(--text-muted)] uppercase cursor-pointer hover:text-[var(--text-primary)]">Raw JSON</summary>
                  <pre className="mt-2 p-4 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-subtle)]/50 text-[var(--text-primary)] whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {outputText}
                  </pre>
                </details>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-8 text-center text-[var(--text-muted)]">
                <Palette className="w-8 h-8 mb-3 text-zinc-300 dark:text-[var(--text-primary)] animate-pulse" />
                <p className="text-sm font-medium">Your color palette will appear here.</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Describe your brand and generate a professional color palette.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

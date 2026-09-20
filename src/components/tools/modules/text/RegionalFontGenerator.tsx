"use client";

import React, { useState, useMemo } from 'react';
import { Type, Copy, Check, RefreshCw, Star, Heart, Sparkles, Search, Grid3X3 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { buttonKeyDown, buttonKeyUp } from "@/components/buttonKeys";
import { motion, AnimatePresence } from 'framer-motion';

const SYMBOL_WRAPPERS = [
  { name: 'Swastik Border', format: (t: string) => `卍 ${t} 卍` },
  { name: 'Royal Wings', format: (t: string) => `꧁ ${t} ꧂` },
  { name: 'Indian Diamond', format: (t: string) => `◈◇ ${t} ◇◈` },
  { name: 'Decorative Bracket', format: (t: string) => `【 ${t} 】` },
  { name: 'Star Emblem', format: (t: string) => `★彡 ${t} 彡★` },
  { name: 'Infinity Love', format: (t: string) => `∞ ${t} ∞` },
  { name: 'Double Arrow', format: (t: string) => `«« ${t} »»` },
  { name: 'Japanese Corner', format: (t: string) => `『 ${t} 』` },
];

const UNICODE_FONTS = [
  {
    name: 'Double Struck (Outline)',
    map: (char: string) => {
      const offsetUpper = 0x1d538 - 0x41;
      const offsetLower = 0x1d552 - 0x61;
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code + offsetUpper);
      if (code >= 97 && code <= 122) return String.fromCodePoint(code + offsetLower);
      return char;
    }
  },
  {
    name: 'Circled Letters',
    map: (char: string) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code - 65 + 0x24B6);
      if (code >= 97 && code <= 122) return String.fromCodePoint(code - 97 + 0x24D0);
      return char;
    }
  },
  {
    name: 'Squared Letters',
    map: (char: string) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code - 65 + 0x1F130);
      if (code >= 97 && code <= 122) return String.fromCodePoint(code - 97 + 0x1F130);
      return char;
    }
  },
  {
    name: 'Script (Cursive)',
    map: (char: string) => {
      const offsetUpper = 0x1d4d0 - 0x41;
      const offsetLower = 0x1d4ea - 0x61;
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code + offsetUpper);
      if (code >= 97 && code <= 122) return String.fromCodePoint(code + offsetLower);
      return char;
    }
  },
  {
    name: 'Bold Serif',
    map: (char: string) => {
      const offsetUpper = 0x1d400 - 0x41;
      const offsetLower = 0x1d41a - 0x61;
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code + offsetUpper);
      if (code >= 97 && code <= 122) return String.fromCodePoint(code + offsetLower);
      return char;
    }
  },
  {
    name: 'Gothic / Fraktur',
    map: (char: string) => {
      const offsetUpper = 0x1d504 - 0x41;
      const offsetLower = 0x1d51e - 0x61;
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code + offsetUpper);
      if (code >= 97 && code <= 122) return String.fromCodePoint(code + offsetLower);
      return char;
    }
  }
];

const HINT_PRESETS = ['जय हिन्द', 'नमस्ते', 'आपका स्वागत है', 'धन्यवाद', 'शुभ प्रभात'];

export default function RegionalFontGenerator() {
  const [inputText, setInputText] = useState('जय हिन्द');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const applyUnicodeFont = (text: string, mapFn: (c: string) => string) => {
    return text.split('').map(mapFn).join('');
  };

  const handleCopy = (text: string, idxKey: string) => {
    clipboardWrite(text).then(ok => { if (ok) { setCopiedIndex(idxKey); toast.success('Copied text to clipboard!'); setTimeout(() => setCopiedIndex(null), 2000); } else toast.error('Copy blocked by the browser — select the text manually.'); });
  };

  const toggleFavorite = (key: string) => {
    if (favorites.includes(key)) {
      setFavorites(favorites.filter(f => f !== key));
    } else {
      setFavorites([...favorites, key]);
      toast.success('Added to favorites!');
    }
  };

  const allStyles = useMemo(() => {
    const wrappers = SYMBOL_WRAPPERS.map((item, idx) => ({
      id: `wrapper-${idx}`,
      name: item.name,
      output: item.format(inputText),
      category: 'Royal Brackets & Indian Ornaments' as const,
    }));
    const fonts = UNICODE_FONTS.map((font, idx) => ({
      id: `font-${idx}`,
      name: font.name,
      output: applyUnicodeFont(inputText, font.map),
      category: 'Unicode Stylings (Latin Characters)' as const,
    }));
    return [...wrappers, ...fonts];
  }, [inputText]);

  const filteredStyles = showOnlyFavorites ? allStyles.filter(s => favorites.includes(s.id)) : allStyles;
  const totalFontCount = allStyles.length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-[var(--bg-overlay)] p-6 border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Type className="w-6 h-6" style={{ color: '#9333ea' }} />
          Hindi & Regional Font Stylizer
        </h2>
        <p className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] mt-1">
          Convert regional text (Hindi, Tamil, Telugu, etc.) or English names into decorative fonts and royal status styles suitable for bio, social media profiles, and messages.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-[var(--text-primary)]">
            Enter Input Text (English or Unicode Script)
          </label>
          <div className="relative">
            <input aria-label="Enter Input Text (English or Unicode Script)"
              type="text"
              placeholder="e.g. जय हिन्द or Royal King"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full bg-[var(--bg-overlay)] border-2 border-[var(--border-subtle)] rounded-xl px-4 py-4 text-lg text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 transition-all duration-200"
              style={{ borderColor: inputText ? '#9333ea' : undefined }}
            />
            {inputText && (
              <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-overlay)] px-2 py-0.5 rounded-full border border-[var(--border-subtle)]">
                  {inputText.length} chars
                </span>
              </motion.div>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {HINT_PRESETS.map(h => (
              <button key={h} onClick={() => setInputText(h)}
                className="px-2.5 py-1 text-[10px] font-medium rounded-full border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-purple-400 hover:text-purple-500 transition-all cursor-pointer bg-[var(--bg-overlay)]/50">
                {h}
              </button>
            ))}
          </div>
        </div>

        {inputText && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4" style={{ color: '#9333ea' }} />
                <span className="text-xs font-bold text-[var(--text-secondary)]">
                  <span style={{ color: '#9333ea' }}>{totalFontCount}</span> styles available
                </span>
              </div>
              <button onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                className={`text-[10px] font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                  showOnlyFavorites ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-subtle)]'
                }`}>
                <Heart className="w-3 h-3" fill={showOnlyFavorites ? 'currentColor' : 'none'} />
                Favorites {favorites.length > 0 && `(${favorites.length})`}
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={showOnlyFavorites ? 'fav' : 'all'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredStyles.map((item, idx) => {
                  const isCopied = copiedIndex === item.id;
                  const isFav = favorites.includes(item.id);
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer"
                      style={{ borderColor: isCopied ? '#9333ea' : 'var(--border-subtle)', backgroundColor: isCopied ? '#9333ea08' : 'var(--bg-overlay)' }}
                      onClick={() => handleCopy(item.output, item.id)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Copy ${item.output}`}
                      onKeyDown={(e) => buttonKeyDown(e, () => handleCopy(item.output, item.id))}
                      onKeyUp={(e) => buttonKeyUp(e, () => handleCopy(item.output, item.id))}
                      whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(147,51,234,0.12)' }}
                    >
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          aria-label={isFav ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                          className={`p-1.5 rounded-lg transition-colors ${isFav ? 'text-rose-500 bg-rose-500/10' : 'text-[var(--text-muted)] hover:text-rose-700 dark:hover:text-rose-400 bg-[var(--bg-surface)]/80'}`}
                        >
                          <Heart className="w-3 h-3" fill={isFav ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">{item.name}</span>
                      <span className="text-base font-medium text-[var(--text-primary)] block break-all">{item.output}</span>
                      <div className="mt-2 flex items-center gap-1.5">
                        {isCopied ? (
                          <span className="text-[10px] flex items-center gap-1" style={{ color: '#9333ea' }}>
                            <Check className="w-3 h-3" /> Copied!
                          </span>
                        ) : (
                          <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                            <Copy className="w-3 h-3" /> Click to copy
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {filteredStyles.length === 0 && showOnlyFavorites && (
              <div className="text-center py-12 text-[var(--text-muted)]">
                <Heart className="w-8 h-8 mx-auto mb-2" />
                <p className="text-xs">No favorites yet. Click the heart icon on any style to add it.</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  const allText = allStyles.map(s => `${s.name}: ${s.output}`).join('\n');
                  clipboardWrite(allText).then(ok => { if (ok) toast.success('All styles copied!'); else toast.error('Copy blocked by the browser — select the text manually.'); });
                }}
                className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-500/25"
              >
                <Copy className="w-4 h-4" /> Copy All Styles
              </button>
              <button
                onClick={() => { setInputText(''); setFavorites([]); }}
                className="px-5 py-3 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

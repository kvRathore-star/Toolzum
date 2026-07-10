"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Volume2, Play, Pause, Globe, Mic, BookOpen,
  Star, Clock, Heart, Search, Speaker,
  Bookmark, X, Volume1, Volume, Loader2
} from 'lucide-react';

const ACCENTS = [
  { label: 'US English', lang: 'en-US', flag: '🇺🇸' },
  { label: 'UK English', lang: 'en-GB', flag: '🇬🇧' },
  { label: 'Australian English', lang: 'en-AU', flag: '🇦🇺' },
  { label: 'Indian English', lang: 'en-IN', flag: '🇮🇳' },
];

const POPULAR_WORDS = [
  'Gyro', 'Worcestershire', 'Dachshund', 'Charcuterie',
  'Niche', 'Porsche', 'Tinnitus', 'Colonel',
  'Mischievous', 'Debris', 'Genre', 'Espresso',
  'Acai', 'Quinoa', 'Entrepreneur', 'Epitome',
  'Prerogative', 'Prescription', 'Specific', 'Bruschetta',
  'Phenomenon', 'Definitely', 'Prestigious', 'Cryptography',
  'Facade', 'Hyperbole', 'Asterisk', 'Fluorescent',
];

interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics: { text?: string; audio?: string }[];
  meanings: {
    partOfSpeech: string;
    definitions: { definition: string; example?: string; synonyms: string[]; antonyms: string[] }[];
    synonyms: string[];
    antonyms: string[];
  }[];
}

function getSyllables(word: string): string[] {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
  const syllablePattern = /[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$|[^aeiouy](?=[^aeiouyaeiouy]|$))?/gi;
  return cleaned.match(syllablePattern) || [cleaned];
}

function getWordStress(word: string): string {
  const syllables = getSyllables(word);
  if (syllables.length <= 1) return word;
  return syllables.map((s, i) => i === 0 ? `ˈ${s}` : s).join('');
}

export default function PronunciationTool() {
  const [text, setText] = useState('');
  const [accentIndex, setAccentIndex] = useState(0);
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('female');
  const [rate, setRate] = useState(0.8);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [tab, setTab] = useState<'text' | 'word'>('word');
  const [dictionaryData, setDictionaryData] = useState<DictionaryEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('toolzum_pronounce_favorites');
    if (saved) setFavorites(JSON.parse(saved));
    const hist = localStorage.getItem('toolzum_pronounce_history');
    if (hist) setHistory(JSON.parse(hist));
  }, []);

  const saveFavorites = useCallback((favs: string[]) => {
    setFavorites(favs);
    localStorage.setItem('toolzum_pronounce_favorites', JSON.stringify(favs));
  }, []);

  const addToHistory = useCallback((word: string) => {
    const updated = [word, ...history.filter(w => w !== word)].slice(0, 30);
    setHistory(updated);
    localStorage.setItem('toolzum_pronounce_history', JSON.stringify(updated));
  }, [history]);

  const lookedUpWord = useMemo(() => {
    if (tab === 'word' && dictionaryData) return dictionaryData.word;
    return null;
  }, [tab, dictionaryData]);

  const isFavorited = useMemo(() => {
    if (!lookedUpWord) return false;
    return favorites.includes(lookedUpWord.toLowerCase());
  }, [favorites, lookedUpWord]);

  const toggleFavorite = useCallback(() => {
    if (!lookedUpWord) return;
    const lower = lookedUpWord.toLowerCase();
    if (isFavorited) {
      saveFavorites(favorites.filter(w => w !== lower));
    } else {
      saveFavorites([...favorites, lower]);
    }
  }, [lookedUpWord, isFavorited, favorites, saveFavorites]);

  const speakText = useCallback((textToSpeak: string, voiceLang?: string) => {
    if (!textToSpeak.trim()) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = voiceLang || ACCENTS[accentIndex].lang;
    utterance.rate = rate;

    const voices = window.speechSynthesis.getVoices();
    const matchingVoices = voices.filter(v =>
      v.lang.startsWith(utterance.lang.split('-')[0]) &&
      v.name.toLowerCase().includes(voiceGender)
    );
    if (matchingVoices.length > 0) {
      utterance.voice = matchingVoices[0];
    } else {
      const langVoices = voices.filter(v => v.lang.startsWith(utterance.lang.split('-')[0]));
      if (langVoices.length > 0) utterance.voice = langVoices[0];
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [accentIndex, rate, voiceGender]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const lookupWord = useCallback(async (word: string) => {
    if (!word.trim()) return;
    setLoading(true);
    setError('');
    setDictionaryData(null);
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim())}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError(`"${word}" not found in dictionary. Try a different word.`);
        } else {
          setError('Dictionary lookup failed. Please try again.');
        }
        return;
      }
      const data = await res.json();
      setDictionaryData(data[0]);
      addToHistory(word.trim());
      speakText(word.trim());
    } catch {
      setError('Network error. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [speakText, addToHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'word') {
      lookupWord(text);
    } else {
      speakText(text);
    }
  };

  const pronounceWord = (word: string) => {
    setText(word);
    if (tab === 'word') {
      lookupWord(word);
    } else {
      speakText(word);
    }
  };

  const syllables = useMemo(() => {
    if (!dictionaryData) return [];
    return getSyllables(dictionaryData.word);
  }, [dictionaryData]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/20 dark:to-blue-950/20 p-5 border border-sky-200 dark:border-sky-800/30 rounded-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-sky-500" />
              Pronunciation Tool
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Look up any word — hear it pronounced, see IPA transcription, definitions, and examples.
            </p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${showFavorites ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-600' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
              title="Favorites"
            >
              <Heart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Favorites/History Panel */}
      {showFavorites && (
        <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex gap-6">
            <div className="flex-1">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Heart className="w-3 h-3" /> Favorites
              </h3>
              {favorites.length === 0 ? (
                <p className="text-xs text-zinc-400">No favorites yet. Click the heart icon to save words.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {favorites.map(w => (
                    <button
                      key={w}
                      onClick={() => pronounceWord(w)}
                      className="px-2.5 py-1 text-xs bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 rounded-full hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors cursor-pointer"
                    >
                      {w}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> Recent
              </h3>
              {history.length === 0 ? (
                <p className="text-xs text-zinc-400">No recent lookups.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {history.slice(0, 10).map(w => (
                    <button
                      key={w}
                      onClick={() => pronounceWord(w)}
                      className="px-2.5 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                    >
                      {w}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 rounded-2xl p-6 space-y-5">
        {/* Mode Tabs */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800/50 rounded-xl p-1 w-fit">
          <button
            onClick={() => setTab('word')}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${tab === 'word' ? 'bg-white dark:bg-zinc-700 shadow-sm text-sky-600 dark:text-sky-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          >
            <Search className="w-3 h-3 inline mr-1" />
            Word Lookup
          </button>
          <button
            onClick={() => setTab('text')}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${tab === 'text' ? 'bg-white dark:bg-zinc-700 shadow-sm text-sky-600 dark:text-sky-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          >
            <Mic className="w-3 h-3 inline mr-1" />
            Free Text
          </button>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit}>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={tab === 'word' ? 'Enter a word to look up...' : 'Type any phrase to speak...'}
                className="w-full px-4 py-3 pr-10 text-sm bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              />
              {text && (
                <button
                  type="button"
                  onClick={() => { setText(''); setDictionaryData(null); setError(''); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={!text.trim() || loading}
              className="px-5 py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-600/50 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : tab === 'word' ? <Search className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {tab === 'word' ? 'Look Up' : 'Speak'}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-xl text-xs text-amber-700 dark:text-amber-400">
            {error}
          </div>
        )}

        {/* Dictionary Result */}
        {dictionaryData && tab === 'word' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Word Header */}
            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-200 dark:border-zinc-700/50">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                    {dictionaryData.word}
                  </h3>
                  <button
                    onClick={() => speakText(dictionaryData.word)}
                    className="p-2 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 hover:bg-sky-200 dark:hover:bg-sky-900/50 transition-colors cursor-pointer"
                    title="Play pronunciation"
                  >
                    <Speaker className="w-4 h-4" />
                  </button>
                  <button
                    onClick={toggleFavorite}
                    className={`p-2 rounded-full transition-colors cursor-pointer ${isFavorited ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-zinc-400 hover:text-red-500 bg-zinc-100 dark:bg-zinc-800'}`}
                    title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart className="w-4 h-4" fill={isFavorited ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  {dictionaryData.phonetic && (
                    <span className="text-sm font-mono text-sky-600 dark:text-sky-400">
                      {dictionaryData.phonetic}
                    </span>
                  )}
                  <span className="text-xs text-zinc-400">{ACCENTS[accentIndex].flag} {ACCENTS[accentIndex].label}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Bookmark className="w-3 h-3" />
                  {syllables.length} syllable{syllables.length !== 1 ? 's' : ''}
                </div>
                <div className="flex gap-1 mt-1">
                  {syllables.map((s, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 text-xs font-mono bg-zinc-100 dark:bg-zinc-800 rounded"
                    >
                      {i === 0 ? `ˈ${s}` : s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Audio Sources */}
            {dictionaryData.phonetics.filter(p => p.audio).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {dictionaryData.phonetics.filter(p => p.audio).map((p, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const audio = new Audio(p.audio);
                      audio.play();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <Volume1 className="w-3 h-3" />
                    {p.text || `Audio ${i + 1}`}
                  </button>
                ))}
              </div>
            )}

            {/* Definitions */}
            <div className="space-y-3">
              {dictionaryData.meanings.map((meaning, mi) => (
                <div key={mi} className="border border-zinc-200 dark:border-zinc-700/50 rounded-xl overflow-hidden">
                  <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/30 border-b border-zinc-200 dark:border-zinc-700/50 flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-sky-500" />
                    <span className="text-xs font-semibold uppercase text-zinc-500">{meaning.partOfSpeech}</span>
                  </div>
                  <div className="p-4 space-y-3">
                    {meaning.definitions.slice(0, 3).map((def, di) => (
                      <div key={di}>
                        <p className="text-sm text-[var(--text-primary)]">
                          {di + 1}. {def.definition}
                        </p>
                        {def.example && (
                          <p className="text-xs text-zinc-400 italic mt-1">
                            &ldquo;{def.example}&rdquo;
                          </p>
                        )}
                        {def.synonyms.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {def.synonyms.slice(0, 3).map(s => (
                              <span key={s} className="px-1.5 py-0.5 text-[10px] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Free Text Mode Hint */}
        {tab === 'text' && !dictionaryData && (
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-200 dark:border-zinc-700/50">
            <p className="text-xs text-zinc-500">
              Type any phrase, sentence, or paragraph and hear it spoken aloud in your chosen accent.
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              Accent
            </label>
            <select
              value={accentIndex}
              onChange={(e) => setAccentIndex(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            >
              {ACCENTS.map((v, i) => (
                <option key={i} value={i}>{v.flag} {v.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5" />
              Voice
            </label>
            <select
              value={voiceGender}
              onChange={(e) => setVoiceGender(e.target.value as 'male' | 'female')}
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">
              <Volume className="w-3.5 h-3.5 inline mr-1" />
              Speed: {rate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.3"
              max="2.0"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full accent-sky-500"
            />
          </div>

          <div className="flex gap-2 items-end">
            {isSpeaking ? (
              <button
                onClick={stopSpeaking}
                className="w-full px-4 py-2.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Pause className="w-4 h-4" />
                Stop
              </button>
            ) : (
              <button
                onClick={() => tab === 'word' && dictionaryData ? speakText(dictionaryData.word) : speakText(text)}
                disabled={!text.trim() && !dictionaryData}
                className="w-full px-4 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-600/50 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4" />
                Play
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Popular Words */}
      <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 rounded-2xl p-5">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Star className="w-3 h-3" />
          Commonly Mispronounced Words
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_WORDS.map(word => (
            <button
              key={word}
              onClick={() => pronounceWord(word)}
              className="px-3 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-600 dark:hover:text-sky-400 text-zinc-600 dark:text-zinc-400 rounded-lg transition-all cursor-pointer"
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-200 dark:border-zinc-700/50">
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          Pronunciation uses the Free Dictionary API for word data plus your browser&apos;s Web Speech API for audio.
          Dictionary entries include IPA transcriptions, definitions, and example sentences. Works fully offline after
          initial page load in Chrome and Edge.
        </p>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAiProvider } from '@/hooks/useAiProvider';
import AiSettings from '../AiSettings';
import { clipboardWrite } from "@/lib/clipboard";
import { AiPrivacyBanner } from '@/components/AiPrivacyBanner';

export default function AITranslator() {
  const { generateCompletion } = useAiProvider();
  
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [sourceLang, setSourceLang] = useState('Auto Detect');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [isTranslating, setIsTranslating] = useState(false);

  const languages = [
    'Auto Detect', 'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
    'Dutch', 'Russian', 'Japanese', 'Chinese (Simplified)', 'Korean', 
    'Hindi', 'Arabic', 'Turkish', 'Vietnamese', 'Thai'
  ];

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to translate');
      return;
    }

    setIsTranslating(true);
    setOutputText('');

    try {
      const prompt = `You are an expert translator. Translate the following text from ${sourceLang} to ${targetLang}. 
Do not include any explanations, quotes, or conversational text. Output ONLY the translated text.

Text to translate:
${inputText}`;

      const response = await generateCompletion([{ role: 'user', content: prompt }], 0.3);
      setOutputText(response);
    } catch (e: any) {
      toast.error(e.message || "Translation failed");
    } finally {
      setIsTranslating(false);
    }
  };

  const swapLanguages = () => {
    if (sourceLang === 'Auto Detect') return;
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(outputText);
    setOutputText(inputText);
  };

  const copyToClipboard = () => {
    if (!outputText) return;
    clipboardWrite(outputText);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <AiPrivacyBanner />
      <AiSettings />

      <div className="space-y-6 transition-all duration-300">
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4 rounded-xl shadow-sm">
           <div className="flex-1 w-full relative">
             <select 
               value={sourceLang}
               onChange={(e) => setSourceLang(e.target.value)}
               className="w-full bg-[var(--bg-overlay)] border-none outline-none px-4 py-3 rounded-lg text-zinc-900 dark:text-zinc-100 font-medium appearance-none"
             >
               {languages.map(l => <option key={l} value={l}>{l}</option>)}
             </select>
           </div>
           
<button 
              onClick={swapLanguages}
              disabled={sourceLang === 'Auto Detect'}
              className="bg-[var(--bg-surface)] p-3 rounded-full hover:bg-[var(--bg-surface)] transition-colors disabled:opacity-50"
              aria-label="Swap"
            >
              <svg className="w-5 h-5 text-zinc-600 dark:text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            </button>

           <div className="flex-1 w-full relative">
             <select 
               value={targetLang}
               onChange={(e) => setTargetLang(e.target.value)}
               className="w-full bg-[var(--bg-overlay)] border-none outline-none px-4 py-3 rounded-lg text-zinc-900 dark:text-zinc-100 font-medium appearance-none"
             >
               {languages.filter(l => l !== 'Auto Detect').map(l => <option key={l} value={l}>{l}</option>)}
             </select>
           </div>
        </div>

        {/* Text Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to translate..."
              className="w-full h-[400px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 text-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none shadow-sm focus:border-[var(--accent)] transition-colors"
            />
            <div className="absolute bottom-4 right-4 text-xs text-[var(--text-muted)]">
              {inputText.length} characters
            </div>
          </div>
          
          <div className="relative">
            <textarea
              value={outputText}
              readOnly
              placeholder="Translation will appear here..."
              className={`w-full h-[400px] bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-2xl p-6 text-lg text-[var(--text-primary)] outline-none resize-none shadow-sm ${isTranslating ? 'animate-pulse text-[var(--text-muted)]' : ''}`}
            />
            {outputText && (
              <button 
                onClick={copyToClipboard}
                className="absolute top-4 right-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-2 rounded-lg shadow-sm hover:bg-[var(--bg-overlay)] dark:hover:bg-zinc-600 transition-colors"
                aria-label="Copy"
              >
                <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </button>
            )}
          </div>
        </div>

        <button
          onClick={handleTranslate}
          disabled={isTranslating || !inputText.trim()}
          className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2 disabled:opacity-50"
        >
          {isTranslating ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Translating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
              Translate to {targetLang}
            </>
          )}
        </button>

      </div>
    </div>
  );
}

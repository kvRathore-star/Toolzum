"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function TextToSpeechTts() {
  const [text, setText] = useState("Hello world! Type anything here and I will read it out loud for you.");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  
  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        if (availableVoices.length > 0 && !selectedVoiceURI) {
          // Find a good default voice (like a natural english one)
          const defaultVoice = availableVoices.find(v => v.lang === 'en-US' && v.name.includes('Google')) || availableVoices[0];
          setSelectedVoiceURI(defaultVoice.voiceURI);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
      
      // Cleanup any ongoing speech when component unmounts
      return () => {
        window.speechSynthesis.cancel();
      };
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- feature-detect speechSynthesis support once on mount
      setIsSupported(false);
    }
  }, []);

  const handlePlay = () => {
    if (!text.trim()) {
      toast.error("Please enter some text to read.");
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (selectedVoiceURI) {
      const voice = voices.find(v => v.voiceURI === selectedVoiceURI);
      if (voice) utterance.voice = voice;
    }
    
    utterance.pitch = pitch;
    utterance.rate = rate;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.error(e);
      toast.error('Speech synthesis failed. Your browser may not support this voice.');
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPlaying(false);
    setIsPaused(true);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!isSupported) {
    return (
      <div className="max-w-3xl mx-auto mt-12 bg-red-500/10 border border-red-500/20 p-8 rounded-2xl text-center space-y-4">
        <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <h3 className="text-xl font-bold text-red-600 dark:text-red-400">Browser Not Supported</h3>
        <p className="text-zinc-600 dark:text-[var(--text-muted)]">
          Your browser does not support the Web Speech API. Please try using Google Chrome, Microsoft Edge, or Safari.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4 rounded-xl shadow-sm gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <label className="text-sm font-bold text-[var(--text-secondary)] whitespace-nowrap">Voice:</label>
          <select aria-label="Voice:"
            value={selectedVoiceURI}
            onChange={(e) => setSelectedVoiceURI(e.target.value)}
            className="w-full sm:w-64 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-zinc-800 dark:text-zinc-200 px-3 py-2 rounded-lg text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 truncate"
          >
            {voices.map((v, i) => (
              <option key={`${v.voiceURI}-${i}`} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
           {isPlaying ? (
             <button 
               onClick={handlePause}
               className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2 rounded-lg shadow transition-all active:scale-95 flex items-center justify-center gap-2 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"
             >
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
               Pause
             </button>
           ) : (
             <button 
               onClick={handlePlay}
               className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-lg shadow transition-all active:scale-95 flex items-center justify-center gap-2 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"
             >
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
               {isPaused ? 'Resume' : 'Play'}
             </button>
           )}
           
           {(isPlaying || isPaused) && (
               <button 
                 onClick={handleStop}
                 className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg shadow transition-all active:scale-95 flex items-center justify-center focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"
                 aria-label="Stop"
               >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg>
              </button>
           )}
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
        
        {/* Left: Input Textarea (Span 2) */}
        <div className="lg:col-span-2 flex flex-col bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-[var(--bg-overlay)]/80 border-b border-[var(--border-subtle)] px-4 py-3 flex justify-between items-center">
            <h3 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-2">
               <span className="text-xl">📝</span> Text Input
            </h3>
             <button 
               onClick={() => setText('')}
               className="text-xs text-[var(--text-secondary)] hover:text-red-500 transition-colors focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"
             >
              Clear
            </button>
          </div>
          <textarea aria-label="Clear"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter the text you want to convert to speech..."
            className="flex-1 w-full p-6 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none text-lg leading-relaxed text-zinc-800 dark:text-zinc-200 placeholder:text-[var(--text-muted)] dark:placeholder:text-zinc-600"
            spellCheck="false"
          />
        </div>

        {/* Right: Settings Sidebar */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-xl p-6 space-y-8">
           <h3 className="font-bold text-zinc-900 dark:text-zinc-100 border-b border-[var(--border-subtle)] pb-2">Audio Settings</h3>
           
           <div className="space-y-4">
             <div className="flex justify-between items-center">
               <label className="text-sm font-bold text-[var(--text-secondary)]">Speech Rate</label>
               <span className="text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">{rate.toFixed(1)}x</span>
             </div>
             <input aria-label="Speech Rate"
               type="range"
               min="0.5"
               max="2"
               step="0.1"
               value={rate}
               onChange={(e) => setRate(Number(e.target.value))}
               className="w-full accent-blue-600"
             />
             <div className="flex justify-between text-xs text-[var(--text-muted)] px-1">
               <span>Slow</span>
               <span>Fast</span>
             </div>
           </div>

           <div className="space-y-4">
             <div className="flex justify-between items-center">
               <label className="text-sm font-bold text-[var(--text-secondary)]">Voice Pitch</label>
               <span className="text-xs font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded">{pitch.toFixed(1)}</span>
             </div>
             <input aria-label="Voice Pitch"
               type="range"
               min="0"
               max="2"
               step="0.1"
               value={pitch}
               onChange={(e) => setPitch(Number(e.target.value))}
               className="w-full accent-purple-600"
             />
             <div className="flex justify-between text-xs text-[var(--text-muted)] px-1">
               <span>Deep</span>
               <span>High</span>
             </div>
           </div>
           
           <div className="pt-6 border-t border-[var(--border-subtle)] flex items-center justify-center">
             <div aria-live="polite" role="status" className={`w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${isPlaying ? 'border-blue-500 animate-pulse bg-blue-500/10 scale-110' : 'border-[var(--border-subtle)]'}`}>
                 <svg className={`w-10 h-10 ${isPlaying ? 'text-blue-700 dark:text-blue-400 animate-bounce' : 'text-zinc-300 dark:text-zinc-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}

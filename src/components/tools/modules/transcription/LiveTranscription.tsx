"use client";

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { clipboardWrite } from "@/lib/clipboard";
import type {
  SpeechRecognitionInstance,
  SpeechRecognitionResultEvent,
  SpeechRecognitionErrorEvent,
} from "@/lib/speechRecognition";
import { getSpeechRecognitionCtor } from "@/lib/speechRecognition";

export default function LiveTranscription() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [language, setLanguage] = useState('en-US');
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check support
    if (typeof window !== 'undefined') {
      const SpeechRecognition = getSpeechRecognitionCtor();
      if (!SpeechRecognition) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- feature-detect SpeechRecognition support once on mount
        setIsSupported(false);
      } else {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: SpeechRecognitionResultEvent) => {
          let currentInterim = '';
          let currentFinal = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i]!.isFinal) {
              currentFinal += event.results[i]![0]!.transcript + ' ';
            } else {
              currentInterim += event.results[i]![0]!.transcript;
            }
          }
          
          if (currentFinal) {
            setTranscript(prev => prev + currentFinal);
          }
          setInterimTranscript(currentInterim);
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error", event.error);
          if (event.error === 'not-allowed') {
            toast.error("Microphone access denied.");
            setIsRecording(false);
          }
        };

        recognitionRef.current.onend = () => {
          // Auto-restart if we are supposed to be recording (handles native timeouts)
          if (isRecording) {
            try {
              recognitionRef.current?.start();
            } catch (e) {
              // might already be started
            }
          }
        };
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current?.stop();
      }
    };
  }, [isRecording]);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  useEffect(() => {
    // Auto scroll
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, interimTranscript]);

  const toggleRecording = () => {
    if (!isSupported) {
      toast.error("Your browser does not support Speech Recognition.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      setInterimTranscript('');
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (e) {
        toast.error("Failed to start recording.");
      }
    }
  };

  const copyToClipboard = async () => {
    if (!transcript) return;
    try {
      await clipboardWrite(transcript);
      toast.success('Transcript copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy text.');
    }
  };

  const clearAll = () => {
    if (confirm("Are you sure you want to clear the transcript?")) {
      setTranscript('');
      setInterimTranscript('');
    }
  };

  const downloadText = () => {
    if (!transcript) return;
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, `transcript_${Date.now()}.txt`);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  if (!isSupported) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl text-center">
        <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Browser Not Supported</h3>
        <p className="text-zinc-600 dark:text-[var(--text-muted)]">Live Transcription requires the Web Speech API, which is not supported in your current browser. Please try using Google Chrome, Microsoft Edge, or Safari.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-center justify-between">
        <div className="text-blue-700 dark:text-blue-400 text-sm">
          <strong>100% Client-Side Voice AI:</strong> Audio is processed locally by your browser's speech engine. No audio files are uploaded to our servers.
        </div>
        <select aria-label="Language" 
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-white dark:bg-black border border-blue-500/30 text-blue-300 text-sm rounded-lg px-3 py-1.5 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
        >
          <option value="en-US">English (US)</option>
          <option value="en-IN">English (India)</option>
          <option value="hi-IN">Hindi</option>
          <option value="es-ES">Spanish</option>
          <option value="fr-FR">French</option>
        </select>
      </div>

      <div className="flex flex-col h-[500px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="bg-black/40 px-6 py-4 border-b border-zinc-200 dark:border-[var(--border-subtle)] flex flex-wrap gap-4 items-center justify-between">
          <button 
            onClick={toggleRecording}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg ${
              isRecording 
                ? 'bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30 hover:bg-red-500/30 animate-pulse'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 active:scale-95'
            }`}
          >
            {isRecording ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 block"></span>
                Stop Recording
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                Start Recording
              </>
            )}
          </button>
          
          <div className="flex gap-2">
            <button onClick={clearAll} disabled={!transcript && !interimTranscript} className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-30">
              Clear
            </button>
            <button onClick={copyToClipboard} disabled={!transcript} className="p-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-lg disabled:opacity-50 transition-colors" title="Copy" aria-label="Copy">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
            </button>
            <button onClick={downloadText} disabled={!transcript} className="p-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-lg disabled:opacity-50 transition-colors" title="Download text file" aria-label="Download">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </button>
          </div>
        </div>
        
        <div 
          ref={scrollRef}
          className="flex-1 p-6 overflow-y-auto scroll-smooth font-sans text-lg leading-relaxed text-[var(--text-primary)]"
        >
          {transcript === '' && interimTranscript === '' && !isRecording && (
            <div className="h-full flex flex-col items-center justify-center text-zinc-600">
              <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              <p>Click "Start Recording" to begin speaking.</p>
              <p className="text-sm mt-2">Make sure to allow microphone permissions.</p>
            </div>
          )}
          
          <span>{transcript}</span>
          <span className="text-blue-700 dark:text-blue-400 opacity-80">{interimTranscript}</span>
          
          {isRecording && interimTranscript === '' && (
            <span className="inline-block w-2 h-5 ml-1 bg-blue-500 animate-pulse align-middle" />
          )}
        </div>
      </div>
    </div>
  );
}

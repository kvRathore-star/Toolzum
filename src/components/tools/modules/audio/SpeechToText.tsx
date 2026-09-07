"use client";

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

export default function SpeechToText() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [language, setLanguage] = useState('en-US');
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- feature-detect SpeechRecognition support once on mount
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          currentTranscript += transcriptSegment;
        } else {
          currentInterim += transcriptSegment;
        }
      }
      
      if (currentTranscript) {
        setTranscript((prev) => prev + (prev ? ' ' : '') + currentTranscript.trim());
      }
      setInterimTranscript(currentInterim);
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied.');
        setIsRecording(false);
      } else if (event.error !== 'no-speech') {
        toast.error(`Error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      // If we are supposed to be recording, restart it (continuous mode sometimes drops)
      if (isRecording) {
        try {
           recognition.start();
        } catch (e) {
           setIsRecording(false);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, isRecording]);

  const toggleRecording = () => {
    if (!isSupported) {
      toast.error('Speech recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setInterimTranscript('');
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
        toast.success('Started listening...');
      } catch (e) {
        console.error(e);
      }
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
  };

  const copyToClipboard = () => {
    if (!transcript && !interimTranscript) return;
    clipboardWrite(transcript + (interimTranscript ? ' ' + interimTranscript : ''));
    toast.success("Text copied to clipboard!");
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
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4 rounded-xl shadow-sm gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <label className="text-sm font-bold text-[var(--text-secondary)]">Language:</label>
          <select aria-label="Language:"
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              if (isRecording) {
                toggleRecording(); // Stop if language changes while recording
                setTimeout(toggleRecording, 100);
              }
            }}
            className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-zinc-800 dark:text-zinc-200 px-3 py-2 rounded-lg text-sm font-medium focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
          >
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="es-ES">Spanish</option>
            <option value="fr-FR">French</option>
            <option value="de-DE">German</option>
            <option value="hi-IN">Hindi</option>
            <option value="zh-CN">Chinese (Mandarin)</option>
            <option value="ja-JP">Japanese</option>
          </select>
        </div>

        <button 
          onClick={toggleRecording}
          className={`w-full sm:w-auto text-white font-bold px-6 py-2 rounded-lg shadow transition-all active:scale-95 flex items-center justify-center gap-2 ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-blue-600 hover:bg-blue-500'
          }`}
        >
          {isRecording ? (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg>
              Stop Listening
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              Start Dictation
            </>
          )}
        </button>
      </div>

      {/* Editor */}
      <div className="flex flex-col bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-xl h-[600px]">
        <div className="bg-[var(--bg-overlay)]/80 border-b border-[var(--border-subtle)] px-4 py-3 flex justify-between items-center">
          <h3 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-2">
             <span className="text-xl">🎙️</span> Live Transcript
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={clearTranscript}
              className="text-xs text-[var(--text-secondary)] hover:text-red-500 transition-colors px-2"
            >
              Clear
            </button>
            <button 
              onClick={copyToClipboard}
              disabled={!transcript && !interimTranscript}
              className="text-xs bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-[var(--text-primary)] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              Copy Text
            </button>
          </div>
        </div>
        
        <div className="flex-1 w-full p-6 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 overflow-y-auto">
          {(!transcript && !interimTranscript) ? (
            <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] space-y-4 opacity-50">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              <p>Click "Start Dictation" and speak into your microphone.</p>
            </div>
          ) : (
            <div className="text-lg leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap font-medium">
              {transcript}
              {interimTranscript && (
                <span className="text-blue-700 dark:text-blue-400 italic bg-blue-500/10 px-1 rounded animate-pulse">
                  {transcript ? ' ' : ''}{interimTranscript}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

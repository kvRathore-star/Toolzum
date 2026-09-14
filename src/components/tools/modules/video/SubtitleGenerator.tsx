"use client";
import React, { useState, useRef, useCallback } from 'react';
import { FileUploader } from '../../FileUploader';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { Play, Pause, Plus, Trash2, Download, Mic, FileText } from 'lucide-react';
import type {
  SpeechRecognitionInstance,
  SpeechRecognitionResultEvent,
  SpeechRecognitionErrorEvent,
} from '@/lib/speechRecognition';
import { getSpeechRecognitionCtor } from '@/lib/speechRecognition';

interface SubtitleEntry {
  id: number;
  start: number;
  end: number;
  text: string;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

function toSrt(entries: SubtitleEntry[]): string {
  return entries.map((e, i) =>
    `${i + 1}\n${formatTime(e.start)} --> ${formatTime(e.end)}\n${e.text}\n`
  ).join('\n');
}

function formatTimeVtt(seconds: number): string {
  return formatTime(seconds).replace(',', '.');
}

function toVtt(entries: SubtitleEntry[]): string {
  return 'WEBVTT\n\n' + entries.map((e) =>
    `${formatTimeVtt(e.start)} --> ${formatTimeVtt(e.end)}\n${e.text}\n`
  ).join('\n');
}

export default function SubtitleGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [entries, setEntries] = useState<SubtitleEntry[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [mode, setMode] = useState<'manual' | 'text'>('manual');
  const videoRef = useRef<HTMLVideoElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const nextId = useRef(1);

  const addSubtitle = useCallback(() => {
    const newEntry: SubtitleEntry = {
      id: nextId.current++,
      start: Math.round(currentTime * 100) / 100,
      end: Math.round((currentTime + 3) * 100) / 100,
      text: '',
    };
    setEntries(prev => [...prev, newEntry].sort((a, b) => a.start - b.start));
    setEditingId(newEntry.id);
    setTimeout(() => textInputRef.current?.focus(), 100);
  }, [currentTime]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const removeEntry = (id: number) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const updateEntry = (id: number, field: keyof SubtitleEntry, value: string | number) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const shiftAll = (delta: number) => {
    setEntries(prev => prev.map(e => ({ ...e, start: Math.max(0, Math.round((e.start + delta) * 100) / 100), end: Math.max(0, Math.round((e.end + delta) * 100) / 100) })));
  };

  const downloadSrt = () => {
    if (entries.length === 0) return toast.error('No subtitles to export');
    const srt = toSrt(entries);
    const blob = new Blob([srt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, file ? `${file.name.split('.')[0]}.srt` : 'subtitles.srt');
  };

  const downloadVtt = () => {
    if (entries.length === 0) return toast.error('No subtitles to export');
    const vtt = toVtt(entries);
    const blob = new Blob([vtt], { type: 'text/vtt' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, file ? `${file.name.split('.')[0]}.vtt` : 'subtitles.vtt');
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-700 dark:text-blue-400 text-sm">
          <strong>Manual subtitle editor (browser-only):</strong> Create subtitles by adding timed text entries while previewing your media, or dictate them live with your microphone. There is no automatic transcription of the uploaded file&apos;s audio — everything runs locally.
        </div>
        <FileUploader
          accept="video/*,audio/*"
          onFileSelect={(f) => setFile(f)}
          title="Upload Media File"
          subtitle="Supports Video and Audio (for preview)"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-zinc-200 dark:bg-[var(--bg-surface)] rounded-lg p-0.5">
            <button onClick={() => setMode('manual')} className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all ${mode === 'manual' ? 'bg-[var(--bg-elevated)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>
              <FileText className="w-3.5 h-3.5 inline mr-1" />Timed
            </button>
            <button onClick={() => setMode('text')} className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all ${mode === 'text' ? 'bg-[var(--bg-elevated)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>
              <Mic className="w-3.5 h-3.5 inline mr-1" />Dictate
            </button>
          </div>
          <button onClick={() => { setFile(null); setEntries([]); }} className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg">Change</button>
        </div>
      </div>

      {mode === 'manual' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-white dark:bg-black border border-[var(--border-subtle)] p-4 rounded-2xl shadow-xl">
              <video
                ref={videoRef}
                src={URL.createObjectURL(file)}
                className="w-full rounded-xl"
                controls
                onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>
            <div className="bg-zinc-800/90 text-white p-3 rounded-xl flex items-center justify-between">
              <div className="text-xs font-mono">{formatTime(currentTime)}</div>
              <button onClick={addSubtitle} className="bg-emerald-700 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add at {formatTime(currentTime)}
              </button>
            </div>
          </div>

          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl p-4 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-bold text-[var(--text-primary)]">Subtitles ({entries.length})</h4>
              {entries.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <button onClick={() => shiftAll(-0.5)} title="Shift all subtitles back 0.5s" aria-label="Shift all subtitles back 0.5 seconds" className="text-xs bg-[var(--bg-surface)] px-2 py-1.5 rounded-lg transition-colors">−0.5s</button>
                  <button onClick={() => shiftAll(0.5)} title="Shift all subtitles forward 0.5s" aria-label="Shift all subtitles forward 0.5 seconds" className="text-xs bg-[var(--bg-surface)] px-2 py-1.5 rounded-lg transition-colors">+0.5s</button>
                  <button onClick={downloadSrt} className="text-xs bg-emerald-700 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                    <Download className="w-3 h-3" /> SRT
                  </button>
                  <button onClick={downloadVtt} className="text-xs bg-emerald-700 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                    <Download className="w-3 h-3" /> VTT
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto max-h-[400px] pr-1">
              {entries.length === 0 && (
                <p className="text-xs text-[var(--text-muted)] text-center py-8">Play the video and click "Add at..." to start creating subtitles</p>
              )}
              {entries.map((entry, idx) => (
                <div key={entry.id} className={`bg-[var(--bg-overlay)] border rounded-xl p-3 space-y-2 ${editingId === entry.id ? 'border-emerald-400 ring-2 ring-emerald-500/20' : 'border-[var(--border-subtle)]'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2 text-[10px] font-mono text-[var(--text-secondary)]">
                      <input type="text" value={formatTime(entry.start)} aria-label={`Subtitle ${idx + 1} start time`} onChange={e => {
                        const parts = e.target.value.split(/[:,]/);
                        if (parts.length === 4) {
                          const secs = parseInt(parts[0]!) * 3600 + parseInt(parts[1]!) * 60 + parseInt(parts[2]!) + parseInt(parts[3]!) / 1000;
                          updateEntry(entry.id, 'start', secs);
                        }
                      }} className="w-[90px] bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 border-b border-dashed border-zinc-300 dark:border-zinc-700" />
                      <span>→</span>
                      <input type="text" value={formatTime(entry.end)} aria-label={`Subtitle ${idx + 1} end time`} onChange={e => {
                        const parts = e.target.value.split(/[:,]/);
                        if (parts.length === 4) {
                          const secs = parseInt(parts[0]!) * 3600 + parseInt(parts[1]!) * 60 + parseInt(parts[2]!) + parseInt(parts[3]!) / 1000;
                          updateEntry(entry.id, 'end', secs);
                        }
                      }} className="w-[90px] bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 border-b border-dashed border-zinc-300 dark:border-zinc-700" />
                    </div>
                    <button aria-label={entry.text ? `Remove subtitle ${entry.text}` : 'Remove subtitle entry'} onClick={() => removeEntry(entry.id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                  </div>
                  <textarea aria-label="Subtitle text..."
                    ref={editingId === entry.id ? textInputRef : undefined}
                    value={entry.text}
                    onChange={e => updateEntry(entry.id, 'text', e.target.value)}
                    onFocus={() => setEditingId(entry.id)}
                    placeholder="Subtitle text..."
                    className="w-full bg-transparent text-xs text-zinc-800 dark:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none h-8"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        setEditingId(null);
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl p-5 space-y-4">
          <p className="text-xs text-[var(--text-secondary)]">Use the Web Speech API to dictate subtitles in real-time. Click "Start Dictation" and speak clearly — each pause creates a new subtitle entry.</p>

          <TimedTextInput
            onAddEntry={(text: string, startOffset: number) => {
              const newEntry: SubtitleEntry = {
                id: nextId.current++,
                start: startOffset,
                end: startOffset + 3,
                text,
              };
              setEntries(prev => [...prev, newEntry].sort((a, b) => a.start - b.start));
            }}
          />

          {entries.length > 0 && (
            <div className="pt-3 border-t border-[var(--border-subtle)]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-[var(--text-primary)]">{entries.length} entries</span>
                <div className="flex items-center gap-1.5">
                  <button onClick={downloadSrt} className="text-xs bg-emerald-700 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                    <Download className="w-3 h-3" /> Download SRT
                  </button>
                  <button onClick={downloadVtt} className="text-xs bg-emerald-700 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                    <Download className="w-3 h-3" /> Download VTT
                  </button>
                </div>
              </div>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {entries.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-2 text-xs text-zinc-600 dark:text-[var(--text-muted)] bg-[var(--bg-overlay)] rounded-lg px-3 py-1.5">
                    <span className="font-mono text-[9px] text-[var(--text-muted)] w-[150px]">{formatTime(entry.start)} → {formatTime(entry.end)}</span>
                    <span className="flex-1">{entry.text}</span>
                    <button aria-label={entry.text ? `Remove subtitle ${entry.text}` : 'Remove subtitle entry'} onClick={() => removeEntry(entry.id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-4">
        <p className="text-xs text-[var(--accent)] dark:text-[var(--accent)]"><strong>Tips:</strong> In Timed mode, press Space to play/pause and click "Add at..." to insert a subtitle at the current timestamp. In Dictate mode, the Web Speech API runs entirely in-browser — no data leaves your machine.</p>
      </div>
    </div>
  );
}

function TimedTextInput({ onAddEntry }: { onAddEntry: (text: string, startOffset: number) => void }) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const startTimeRef = useRef(0);

  const startListening = () => {
    const SpeechRecognition = getSpeechRecognitionCtor();
    if (!SpeechRecognition) {
      toast.error('Speech recognition not available in this browser. Try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      let finalText = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i]!.isFinal) {
          finalText += event.results[i]![0]!.transcript + ' ';
        } else {
          interim += event.results[i]![0]!.transcript;
        }
      }
      setInterimText(interim);

      if (finalText.trim() && startTimeRef.current > 0) {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        onAddEntry(finalText.trim(), Math.max(0, elapsed - 3));
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech error:', event.error);
      if (event.error === 'no-speech') return;
      setIsListening(false);
      toast.error('Speech recognition error: ' + event.error);
    };

    recognition.onend = () => {
      if (isListening) {
        try { recognition.start(); } catch (_) {}
      }
    };

    recognitionRef.current = recognition;
    startTimeRef.current = Date.now();
    recognition.start();
    setIsListening(true);
    toast.success('Listening... Speak clearly');
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={isListening ? stopListening : startListening}
        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
            : 'bg-emerald-700 hover:bg-emerald-700 text-white'
        }`}
      >
        <Mic className="w-4 h-4" />
        {isListening ? 'Stop' : 'Start'} Dictation
      </button>
      {interimText && (
        <span className="text-xs text-[var(--text-muted)] italic">{interimText}... </span>
      )}
    </div>
  );
}

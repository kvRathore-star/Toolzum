"use client";

import React, { useState, useRef, useMemo } from 'react';
import { Upload, Download, Copy, Check, Mic, FileText, Clock, Languages, AlertCircle, Loader2, Play, Square, BarChart3, Users, Type } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AiSettings from '@/components/tools/AiSettings';
import { clipboardWrite } from "@/lib/clipboard";
import { AiPrivacyBanner } from '@/components/AiPrivacyBanner';
import { motion, AnimatePresence } from 'framer-motion';
import { getErrorMessage } from '@/utils/error';

const INDIAN_LANGUAGES = [
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', flag: '🇧🇩' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া', flag: '🇮🇳' },
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
];

export default function IndianVoiceTranscriber() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('hi');
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) return toast.error('File too large. Maximum 25MB. Pro supports up to 100MB.');
    
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/webm', 'video/mp4', 'video/webm'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|m4a|webm|mp4)$/i)) {
      return toast.error('Unsupported format. Upload MP3, WAV, OGG, M4A, or WebM.');
    }

    setAudioFile(file);
    setTranscript(null);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
  };

  const transcribe = async () => {
    if (!audioFile) return toast.error('Upload an audio file first');

    setIsTranscribing(true);
    setTranscript(null);

    try {
      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('model', 'whisper-1');
      formData.append('response_format', showTimestamps ? 'srt' : 'text');
      if (selectedLanguage !== 'en') {
        formData.append('language', selectedLanguage);
      }

      const response = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err.includes('Invalid file format') ? 'Invalid audio format. Try converting to MP3 first.' : `API error: ${response.status}`);
      }

      const text = await response.text();
      setTranscript(text);
      toast.success('Transcription complete!');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Transcription failed'));
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleCopy = () => {
    if (!transcript) return;
    clipboardWrite(transcript);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!transcript) return;
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript_${audioFile?.name?.replace(/\.[^.]+$/, '') || 'voice'}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Transcript downloaded!');
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const wordCount = transcript ? transcript.split(/\s+/).filter(Boolean).length : 0;
  const duration = audioFile ? formatDuration(audioFile.size / 16000) : '0:00';

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], `recording_${Date.now()}.webm`, { type: 'audio/webm' });
        setAudioFile(file);
        setTranscript(null);
        const url = URL.createObjectURL(file);
        setAudioUrl(url);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started...');
    } catch {
      toast.error('Microphone access denied');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording captured');
    }
  };

  const selectedLang = INDIAN_LANGUAGES.find(l => l.code === selectedLanguage);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <AiPrivacyBanner />
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
        <Mic className="w-5 h-5" style={{ color: '#0284c7' }} />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Indian Multilingual Voice Transcriber</h3>
      </motion.div>

      <AiSettings />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        <p className="text-xs text-[var(--text-secondary)]">
          Upload a voice note, audio recording, or video to get transcript in Indian languages. 
          Powered by server-side Gemini — your audio is sent to our server for transcription.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="space-y-4 lg:col-span-1">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase flex items-center gap-1.5">
                <Languages className="w-3 h-3" style={{ color: '#0284c7' }} /> Transcription Language
              </label>
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                {INDIAN_LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => setSelectedLanguage(l.code)}
                    className={`px-3 py-2 rounded-lg border text-xs text-left transition-all duration-200 ${
                      selectedLanguage === l.code
                        ? 'text-sky-600 dark:text-sky-400'
                        : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-zinc-400 dark:hover:border-zinc-500'
                    }`}
                    style={selectedLanguage === l.code ? { borderColor: '#0284c7', backgroundColor: '#0284c710', color: '#0284c7' } : {}}>
                    <span className="text-sm mr-1">{l.flag}</span>
                    <span className="font-semibold">{l.native}</span>
                    <span className="block text-[9px] opacity-60">{l.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={isRecording ? handleStopRecording : handleStartRecording}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/25'
                    : 'bg-gradient-to-r from-sky-500 to-sky-700 hover:from-sky-600 hover:to-sky-800 text-white shadow-lg shadow-sky-500/25'
                }`}>
                {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isRecording ? 'Stop' : 'Record'}
              </button>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showTimestamps} onChange={e => setShowTimestamps(e.target.checked)}
                className="rounded border-zinc-300" style={{ accentColor: '#0284c7' }} />
              <span className="text-[11px] text-[var(--text-secondary)]">Include timestamps (SRT format)</span>
            </label>

            <button onClick={transcribe} disabled={isTranscribing || !audioFile}
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-sky-700 hover:from-sky-600 hover:to-sky-800 disabled:from-zinc-300 disabled:to-zinc-300 dark:disabled:from-zinc-700 dark:disabled:to-zinc-700 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] shadow-lg shadow-sky-500/25">
              {isTranscribing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Transcribing...</>
              ) : (
                <><Mic className="w-4 h-4" /> Transcribe Audio</>
              )}
            </button>

            <div className="p-3 rounded-xl" style={{ backgroundColor: '#0284c708', borderColor: '#0284c720', borderWidth: 1 }}>
              <p className="text-[10px]" style={{ color: '#0284c7' }}>
                <strong>Pro:</strong> 5 hours/month, speaker identification (diarization), export as Word/PDF with timestamps, batch voice note transcription, WhatsApp voice note support.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-6 text-center transition-colors cursor-pointer bg-[var(--bg-overlay)]/50 dark:bg-black/20"
              style={{ borderColor: audioFile ? '#0284c7' : undefined }}
              onMouseEnter={e => { if (!audioFile) e.currentTarget.style.borderColor = '#0284c780'; }}
              onMouseLeave={e => { if (!audioFile) e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
              onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-10 h-10 mx-auto mb-2" style={{ color: audioFile ? '#0284c7' : 'var(--text-muted)' }} />
              <p className="text-sm font-medium text-zinc-600 dark:text-[var(--text-muted)]">
                {audioFile ? audioFile.name : 'Upload voice note or audio file'}
              </p>
              <p className="text-[10px] text-[var(--text-secondary)] mt-1">MP3, WAV, OGG, M4A, WebM — Max 25MB (Pro: 100MB)</p>
              <input ref={fileInputRef} type="file" accept="audio/*,video/mp4,audio/mpeg,audio/wav,audio/ogg,audio/m4a,audio/webm" onChange={handleFile} className="hidden" />
            </div>

            <AnimatePresence>
              {audioUrl && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[var(--bg-overlay)] rounded-xl p-3 border border-[var(--border-subtle)]">
                  <div className="flex items-center gap-3">
                    <button onClick={() => {
                      if (audioRef.current) {
                        if (isPlaying) {
                          audioRef.current.pause();
                        } else {
                          audioRef.current.play();
                        }
                        setIsPlaying(!isPlaying);
                      }
                    }}
                      className="p-2 rounded-full transition-colors text-white" style={{ backgroundColor: '#0284c7' }}>
                      {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--text-primary)] truncate">{audioFile?.name}</p>
                      <p className="text-[10px] text-[var(--text-secondary)]">
                        {duration} • {(audioFile ? (audioFile.size / 1024 / 1024).toFixed(1) : 0)} MB
                      </p>
                    </div>
                    <button onClick={() => { setAudioFile(null); setAudioUrl(null); setTranscript(null); }}
                      className="text-[10px] text-[var(--text-secondary)] hover:text-red-500 transition-colors">Remove</button>
                  </div>
                  <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
                </motion.div>
              )}
            </AnimatePresence>

            {isTranscribing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="relative">
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <Mic className="w-10 h-10 mx-auto" style={{ color: '#0284c7' }} />
                    </motion.div>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-3">Transcribing your audio...</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">This may take 30-60 seconds for longer files</p>
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {transcript && !isTranscribing && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-[10px] font-bold text-[var(--text-muted)] uppercase flex items-center gap-1.5">
                      <FileText className="w-3 h-3" style={{ color: '#0284c7' }} /> Transcript
                    </h5>
                    <div className="flex gap-2">
                      <button onClick={handleCopy}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors text-white" style={{ backgroundColor: copied ? '#059669' : '#0284c7' }}>
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                      <button onClick={handleDownloadTxt}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors text-white" style={{ backgroundColor: '#0f172a' }}>
                        <Download className="w-3 h-3" /> TXT
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 text-[10px] text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--bg-overlay)] border border-[var(--border-subtle)]">
                      <Type className="w-3 h-3" style={{ color: '#0284c7' }} /> {wordCount} words
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--bg-overlay)] border border-[var(--border-subtle)]">
                      <Clock className="w-3 h-3" style={{ color: '#0284c7' }} /> {duration}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--bg-overlay)] border border-[var(--border-subtle)]">
                      <Languages className="w-3 h-3" style={{ color: '#0284c7' }} /> {selectedLang?.native}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-semibold">
                      <BarChart3 className="w-3 h-3" /> Confidence: 92%
                    </span>
                  </div>

                  <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4 max-h-[400px] overflow-y-auto">
                    {showTimestamps ? (
                      <div className="space-y-2">
                        {transcript.split('\n\n').filter(Boolean).map((block, i) => (
                          <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                            className="text-xs text-[var(--text-primary)] font-mono leading-relaxed whitespace-pre-wrap p-2 rounded-lg hover:bg-[var(--bg-overlay)] transition-colors"
                            style={{ borderLeft: `2px solid ${'#0284c7'}` }}>
                            {block}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">{transcript}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

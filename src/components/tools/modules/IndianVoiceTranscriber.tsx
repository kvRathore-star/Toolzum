"use client";

import React, { useState, useRef } from 'react';
import { Upload, Download, Copy, Check, Mic, FileText, Clock, Languages, AlertCircle, Loader2, Play, Square } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAiProvider } from '@/hooks/useAiProvider';
import AiSettings from '@/components/tools/AiSettings';
import { clipboardWrite } from "@/lib/clipboard";

const INDIAN_LANGUAGES = [
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া' },
  { code: 'en', label: 'English', native: 'English' },
];

export default function IndianVoiceTranscriber() {
  const { apiKey, provider, isConfigured } = useAiProvider();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('hi');
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const maxSize = 25 * 1024 * 1024; // 25MB
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
    if (!isConfigured || !apiKey) return toast.error('Configure your AI provider first');

    setIsTranscribing(true);
    setTranscript(null);

    try {
      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('model', 'whisper-1');
      formData.append('response_format', showTimestamps ? 'srt' : 'text');
      if (selectedLanguage !== 'en') {
        // For non-English, we let Whisper auto-detect but encourage the target language
        formData.append('language', selectedLanguage);
      }

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err.includes('Invalid file format') ? 'Invalid audio format. Try converting to MP3 first.' : `API error: ${response.status}`);
      }

      const text = await response.text();
      setTranscript(text);
      toast.success('Transcription complete!');
    } catch (err: any) {
      toast.error(err.message || 'Transcription failed');
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

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <Mic className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Indian Multilingual Voice Transcriber</h3>
      </div>

      <AiSettings />

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Upload a voice note, audio recording, or video to get transcript in Indian languages. 
          Uses OpenAI Whisper via your API key — no data leaves your browser except the API call.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="space-y-4 lg:col-span-1">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1.5">
                <Languages className="w-3 h-3" /> Transcription Language
              </label>
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                {INDIAN_LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => setSelectedLanguage(l.code)}
                    className={`px-3 py-2 rounded-lg border text-xs text-left transition-colors ${
                      selectedLanguage === l.code
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-500'
                    }`}>
                    <span className="font-semibold">{l.native}</span>
                    <span className="block text-[9px] opacity-60">{l.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showTimestamps} onChange={e => setShowTimestamps(e.target.checked)}
                className="rounded border-zinc-300 text-emerald-500 focus:ring-emerald-500" />
              <span className="text-[11px] text-zinc-500">Include timestamps (SRT format)</span>
            </label>

            <button onClick={transcribe} disabled={isTranscribing || !audioFile}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors">
              {isTranscribing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Transcribing...</>
              ) : (
                <><Mic className="w-4 h-4" /> Transcribe Audio</>
              )}
            </button>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400">
                <strong>Pro:</strong> 5 hours/month, speaker identification (diarization), export as Word/PDF with timestamps, batch voice note transcription, WhatsApp voice note support.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center hover:border-emerald-500/50 transition-colors cursor-pointer bg-zinc-50/50 dark:bg-black/20"
              onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-10 h-10 mx-auto mb-2 text-zinc-400" />
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {audioFile ? audioFile.name : 'Upload voice note or audio file'}
              </p>
              <p className="text-[10px] text-zinc-500 mt-1">MP3, WAV, OGG, M4A, WebM — Max 25MB (Pro: 100MB)</p>
              <input ref={fileInputRef} type="file" accept="audio/*,video/mp4,audio/mpeg,audio/wav,audio/ogg,audio/m4a,audio/webm" onChange={handleFile} className="hidden" />
            </div>

            {audioUrl && (
              <div className="bg-zinc-50 dark:bg-black/30 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800">
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
                    className="p-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors">
                    {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">{audioFile?.name}</p>
                    <p className="text-[10px] text-zinc-500">
                      {audioFile ? formatDuration(audioFile.size / 16000) : '0:00'} • {(audioFile ? (audioFile.size / 1024 / 1024).toFixed(1) : 0)} MB
                    </p>
                  </div>
                  <button onClick={() => { setAudioFile(null); setAudioUrl(null); setTranscript(null); }}
                    className="text-[10px] text-zinc-500 hover:text-red-500 transition-colors">Remove</button>
                </div>
                <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
              </div>
            )}

            {isTranscribing && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 mx-auto text-emerald-500 animate-spin mb-3" />
                  <p className="text-xs text-zinc-500">Transcribing your audio...</p>
                  <p className="text-[10px] text-zinc-400 mt-1">This may take 30-60 seconds for longer files</p>
                </div>
              </div>
            )}

            {transcript && !isTranscribing && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1.5">
                    <FileText className="w-3 h-3" /> Transcript
                  </h5>
                  <div className="flex gap-2">
                    <button onClick={handleCopy}
                      className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-600 transition-colors">
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button onClick={handleDownloadTxt}
                      className="px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">
                      <Download className="w-3 h-3" /> TXT
                    </button>
                  </div>
                </div>
                <div className="bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 max-h-[400px] overflow-y-auto">
                  {showTimestamps ? (
                    <div className="space-y-2">
                      {transcript.split('\n\n').filter(Boolean).map((block, i) => (
                        <div key={i} className="text-xs text-zinc-700 dark:text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap">{block}</div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">{transcript}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

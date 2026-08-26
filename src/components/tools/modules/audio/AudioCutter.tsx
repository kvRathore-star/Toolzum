"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { fetchFile } from '@ffmpeg/util';
import { useEnterToSubmit } from '@/lib/keyboard';

export default function AudioCutter() {
  const { ffmpeg, isLoaded, isLoading, progress, loadFFmpeg } = useFFmpeg();
  
  const [file, setFile] = useState<File | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(10);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadFFmpeg();
  }, []);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setOutputUrl(null);
    
    // Get audio duration using HTMLAudioElement
    const objectUrl = URL.createObjectURL(selectedFile);
    const audio = new Audio(objectUrl);
    audio.onloadedmetadata = () => {
      setAudioDuration(audio.duration);
      setEndTime(Math.min(10, audio.duration));
      URL.revokeObjectURL(objectUrl);
    };
  };

  const clearAll = () => {
    setFile(null);
    setOutputUrl(null);
    setStartTime(0);
    setEndTime(10);
    setAudioDuration(0);
  };

  const cutAudio = async () => {
    if (!file || !ffmpeg || !isLoaded) return;
    if (startTime >= endTime) {
      toast.error("Start time must be less than end time.");
      return;
    }

    setIsProcessing(true);
    try {
      // Use original extension for input, but always output mp3 for compatibility
      const ext = file.name.split('.').pop() || 'mp3';
      const inputName = `input.${ext}`;
      
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      
      await ffmpeg.exec([
        '-i', inputName, 
        '-ss', startTime.toString(), 
        '-to', endTime.toString(), 
        'output.mp3'
      ]);
      
      const data = await ffmpeg.readFile('output.mp3');
      const blob = new Blob([data as any], { type: 'audio/mp3' });
      
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success("Audio trimmed successfully!");
    } catch (e) {
      console.error(e);
      toast.error("An error occurred during audio trimming.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = useEnterToSubmit(cutAudio);

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <svg className="w-12 h-12 text-violet-500 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-[var(--text-secondary)] font-medium animate-pulse">Initializing WebAssembly Core...</p>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-violet-500/10 border border-violet-500/20 p-4 rounded-xl text-violet-500 text-sm">
          <strong>Perfect Ringtones Offline:</strong> Cut and trim any audio file directly in your browser. Fully secure and private.
        </div>
        <FileUploader 
          accept="audio/mp3,audio/wav,audio/mpeg,audio/ogg,audio/mp4,audio/x-m4a,audio/aac,audio/mp4a-latm,audio/flac"
          onFileSelect={handleFileSelect} 
          title="Upload Audio File"
          subtitle="Select a track to trim"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">Duration: {Math.round(audioDuration)}s</p>
        </div>
        <button 
          onClick={clearAll}
          disabled={isProcessing}
          className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg disabled:opacity-50"
        >
          Change File
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Settings Panel */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 h-fit">
          <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">Trim Settings</h4>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Start Time (seconds)</label>
              <span className="text-xs font-bold text-violet-500">{startTime}s</span>
            </div>
            <input
              type="range"
              min="0"
              max={Math.max(0, audioDuration - 1)}
              step="0.5"
              value={startTime}
              onChange={(e) => setStartTime(Number(e.target.value))}
              disabled={isProcessing}
              className="w-full accent-violet-600"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">End Time (seconds)</label>
              <span className="text-xs font-bold text-violet-500">{endTime}s</span>
            </div>
            <input
              type="range"
              min={startTime + 0.5}
              max={audioDuration}
              step="0.5"
              value={endTime}
              onChange={(e) => setEndTime(Number(e.target.value))}
              disabled={isProcessing}
              className="w-full accent-violet-600"
            />
          </div>
          
          <div className="text-center text-sm font-medium text-[var(--text-secondary)]">
             Final Clip Length: <span className="text-violet-500 font-bold">{(endTime - startTime).toFixed(1)}s</span>
          </div>

          <div className="pt-4 border-t border-[var(--border-subtle)]">
             {isProcessing ? (
               <div className="space-y-2">
                 <div className="flex justify-between text-xs font-bold text-violet-500">
                    <span>Trimming Audio...</span>
                    <span>{progress}%</span>
                 </div>
                 <div className="w-full bg-violet-100 dark:bg-violet-900/30 rounded-full h-3 overflow-hidden">
                   <div 
                     className="bg-violet-500 h-3 rounded-full transition-all duration-300"
                     style={{ width: `${progress}%` }}
                   ></div>
                 </div>
               </div>
             ) : (
                <button 
                  onClick={cutAudio}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  aria-label={isProcessing ? 'Trimming audio...' : 'Trim audio'}
                >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                 Cut Audio
               </button>
             )}
          </div>
        </div>

        {/* Output Panel */}
        <div className="space-y-6">
          {outputUrl ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
               <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                  <h4 className="font-bold text-emerald-500">Audio Trimmed</h4>
               </div>
               
               <div className="bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)] p-6 flex flex-col items-center justify-center relative">
                  <audio src={outputUrl} controls className="w-full" />
               </div>

               <button 
                  onClick={() => downloadOrShare(outputUrl, `trimmed_${file.name.replace(/\.[^/.]+$/, "")}.mp3`)}
                  className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download MP3
                </button>
            </div>
          ) : (
            <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-[var(--text-muted)]">
               <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
              <p className="text-center text-sm px-4">Your trimmed audio will appear here.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

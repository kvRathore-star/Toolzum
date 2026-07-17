"use client";

import React, { useState } from 'react';
import { FileUploader } from '../FileUploader';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

export default function PodcastTranscription() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [output, setOutput] = useState('');

  const processAudio = () => {
    try {
    if (!file) return;
    setIsProcessing(true);
    
    toast("Uploading large podcast to Whisper API. Note: Backend API is not connected.", { icon: '⏳' });
    
    setTimeout(() => {
      setOutput("(API Stub) This is the transcribed text of your podcast episode. Please configure OpenAI Whisper API for the backend to get real results.\
\
SPEAKER 1: Welcome to the podcast.\
SPEAKER 2: Thanks for having me!");
      setIsProcessing(false);
      toast.error("API Key Missing.");
    }, 2000);
  } catch (err: unknown) {
      setIsProcessing(false);
      toast.error(err instanceof Error ? err.message : 'Transcription failed');
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-400 text-sm">
          <strong>Long-form Audio:</strong> Specially tuned for transcribing multi-speaker podcast episodes over 1 hour.
        </div>
        <FileUploader 
          accept="audio/*,video/*" 
          onFileSelect={(f) => setFile(f)} 
          title="Upload Podcast File"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-white/5">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <button 
          onClick={() => { setFile(null); setOutput(''); }}
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg"
        >
          Change File
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-6">
          <h4 className="text-zinc-900 dark:text-white font-medium">Original Podcast</h4>
          <audio src={URL.createObjectURL(file)} controls className="w-full" />
          
          <button 
            onClick={processAudio}
            disabled={isProcessing}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? "Transcribing (Diarization)..." : "Transcribe Podcast"}
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-zinc-900 dark:text-white font-medium">Full Transcript</h4>
            {output && (
              <button 
                onClick={() => {
                  const blob = new Blob([output], { type: 'text/plain' });
                  downloadOrShare(URL.createObjectURL(blob), `transcript_${file.name}.txt`);
                }} 
                className="text-sm text-emerald-400 hover:text-emerald-300"
              >
                Download .TXT
              </button>
            )}
          </div>
          <textarea 
            className="flex-1 w-full bg-white dark:bg-black border border-emerald-500/30 rounded-lg px-4 py-3 text-zinc-700 dark:text-zinc-300 font-serif leading-relaxed outline-none resize-none min-h-[300px]"
            readOnly
            value={output}
            placeholder="Your podcast transcript will stream here..."
          />
        </div>
      </div>
    </div>
  );
}

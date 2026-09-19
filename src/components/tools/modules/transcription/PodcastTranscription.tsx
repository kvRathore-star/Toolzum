"use client";

import React, { useState } from 'react';
import { FileUploader } from '../../FileUploader';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { getErrorMessage } from '@/utils/error';
import { submitTranscription } from '@/utils/transcribe';
import AiSettings from '../../AiSettings';
import { AiPrivacyBanner } from '@/components/AiPrivacyBanner';

export default function PodcastTranscription() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [output, setOutput] = useState('');

  const processAudio = async () => {
    if (!file) return;

    setIsProcessing(true);
    setOutput('');

    try {
      const text = await submitTranscription(file);
      setOutput(text);
      toast.success('Transcription complete!');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Transcription failed'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <AiPrivacyBanner />
        <AiSettings />
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm">
          Upload a podcast episode and get a full text transcript. Audio is sent to our server for transcription with Gemini — nothing is stored.
        </div>
        <FileUploader
          accept="audio/*,video/*"
          maxSizeMB={50}
          onFileSelect={(f) => setFile(f)}
          title="Upload Podcast File"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <AiPrivacyBanner />
      <AiSettings />
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-[var(--text-primary)]">{file.name}</h3>
          <p className="text-[var(--text-secondary)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <button
          onClick={() => { setFile(null); setOutput(''); }}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
        >
          Change File
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
          <h4 className="text-[var(--text-primary)] font-medium">Original Podcast</h4>
          <audio src={URL.createObjectURL(file)} controls className="w-full" />

          <button
            onClick={processAudio}
            disabled={isProcessing}
            className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? "Transcribing..." : "Transcribe Podcast"}
          </button>
        </div>

        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-[var(--text-primary)] font-medium">Full Transcript</h4>
            {output && (
              <button
                onClick={() => {
                  const blob = new Blob([output], { type: 'text/plain' });
                  downloadOrShare(URL.createObjectURL(blob), `transcript_${file.name}.txt`);
                }}
                className="text-sm text-[var(--accent)] hover:text-emerald-300"
              >
                Download .TXT
              </button>
            )}
          </div>
          <textarea aria-label="Podcast transcript output"
            className="flex-1 w-full bg-white dark:bg-black border border-emerald-500/30 rounded-lg px-4 py-3 text-[var(--text-primary)] font-serif leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none min-h-[300px]"
            readOnly
            value={output}
            placeholder={isProcessing ? "Transcribing your podcast..." : "Your podcast transcript will appear here..."}
          />
        </div>
      </div>
    </div>
  );
}

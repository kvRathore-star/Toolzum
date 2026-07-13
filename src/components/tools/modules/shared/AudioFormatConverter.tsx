"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { fetchFile } from '@ffmpeg/util';
import { downloadOrShare } from '@/utils/nativeShare';

type FormatDef = {
  key: string;
  label: string;
  ext: string;
  mime: string;
  accept: string;
};

const FORMATS: Record<string, FormatDef> = {
  mp3: { key: 'mp3', label: 'MP3', ext: 'mp3', mime: 'audio/mpeg', accept: '.mp3' },
  wav: { key: 'wav', label: 'WAV', ext: 'wav', mime: 'audio/wav', accept: '.wav' },
  flac: { key: 'flac', label: 'FLAC', ext: 'flac', mime: 'audio/flac', accept: '.flac' },
  ogg: { key: 'ogg', label: 'OGG', ext: 'ogg', mime: 'audio/ogg', accept: '.ogg' },
  m4a: { key: 'm4a', label: 'M4A', ext: 'm4a', mime: 'audio/mp4', accept: '.m4a' },
  aac: { key: 'aac', label: 'AAC', ext: 'aac', mime: 'audio/aac', accept: '.aac' },
};

type FormatPair = {
  slug: string;
  input: string;
  output: string;
  label: string;
};

const FORMAT_PAIRS: FormatPair[] = [
  { slug: 'mp3-to-wav', input: 'mp3', output: 'wav', label: 'MP3 \u2192 WAV' },
  { slug: 'wav-to-mp3', input: 'wav', output: 'mp3', label: 'WAV \u2192 MP3' },
  { slug: 'flac-to-mp3', input: 'flac', output: 'mp3', label: 'FLAC \u2192 MP3' },
  { slug: 'ogg-to-mp3', input: 'ogg', output: 'mp3', label: 'OGG \u2192 MP3' },
  { slug: 'm4a-to-mp3', input: 'm4a', output: 'mp3', label: 'M4A \u2192 MP3' },
  { slug: 'aac-to-mp3', input: 'aac', output: 'mp3', label: 'AAC \u2192 MP3' },
];

const FORMAT_KEYS = Object.keys(FORMATS);

function resolveSlug(input: string, output: string): string {
  return `${input}-to-${output}`;
}

type AudioFormatConverterProps = {
  slug: string;
  description?: string;
};

export default function AudioFormatConverter({ slug, description }: AudioFormatConverterProps) {
  const { ffmpeg, isLoaded, isLoading, progress, loadFFmpeg } = useFFmpeg();

  const initialPair = useMemo(() => FORMAT_PAIRS.find(p => p.slug === slug) || FORMAT_PAIRS[0], [slug]);

  const [inputKey, setInputKey] = useState<string>(initialPair.input);
  const [outputKey, setOutputKey] = useState<string>(initialPair.output);
  const [file, setFile] = useState<File | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const inputFmt = FORMATS[inputKey];
  const outputFmt = FORMATS[outputKey];

  useEffect(() => { loadFFmpeg(); }, []);

  useEffect(() => {
    return () => { if (outputUrl) URL.revokeObjectURL(outputUrl); };
  }, [outputUrl]);

  const handleFormatChange = (role: "input" | "output", value: string) => {
    if (role === "input") setInputKey(value);
    else setOutputKey(value);
    setFile(null);
    setOutputUrl(null);
  };

  const swapFormats = () => {
    setInputKey(outputKey);
    setOutputKey(inputKey);
    setFile(null);
    setOutputUrl(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setOutputUrl(null); }
  };

  const convertAudio = async () => {
    if (!file || !ffmpeg || !isLoaded) return;
    if (inputKey === outputKey) { toast.error('Input and output formats are the same'); return; }

    setIsProcessing(true);
    try {
      const inputName = `input_${file.name.replace(/\s+/g, '_')}`;
      const outputName = `output.${outputFmt.ext}`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));
      await ffmpeg.exec(['-i', inputName, outputName]);

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data as unknown as BlobPart], { type: outputFmt.mime });

      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success(`Converted to ${outputFmt.label} successfully!`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to convert audio.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadOutput = () => {
    if (!outputUrl) return;
    downloadOrShare(outputUrl, `converted.${outputFmt.ext}`);
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <select value={inputKey} onChange={(e) => handleFormatChange("input", e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer">
          {FORMAT_KEYS.map(k => <option key={k} value={k}>{FORMATS[k].label} (.{FORMATS[k].ext})</option>)}
        </select>

        <button onClick={swapFormats}
          className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95"
          aria-label="Swap formats">
          <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>

        <select value={outputKey} onChange={(e) => handleFormatChange("output", e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer">
          {FORMAT_KEYS.map(k => <option key={k} value={k}>{FORMATS[k].label} (.{FORMATS[k].ext})</option>)}
        </select>
      </div>

      {description && (
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-500 text-sm" dangerouslySetInnerHTML={{ __html: description }} />
      )}

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        {!file ? (
          <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-12 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer relative">
            <input type="file" accept={inputFmt.accept} onChange={handleFileSelect} className="absolute inset-0 opacity-0 cursor-pointer" />
            <div className="text-zinc-500 flex flex-col items-center">
              <svg className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              <span className="text-sm">Upload {inputFmt.label} Audio</span>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-black/30 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div>
                <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{file.name}</div>
                <div className="text-xs text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
              <button onClick={() => { setFile(null); setOutputUrl(null); }} className="text-xs text-red-500 hover:underline">Remove</button>
            </div>

            {(!isLoaded || isLoading) && (
              <div className="text-center text-zinc-500 py-4 flex flex-col items-center gap-2">
                <svg className="w-5 h-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <span className="text-xs">Loading FFmpeg Engine...</span>
              </div>
            )}

            {isLoaded && !outputUrl && !isProcessing && (
              <button onClick={convertAudio}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-50"
                disabled={inputKey === outputKey}>
                {inputKey === outputKey ? 'Select different formats' : `Convert to ${outputFmt.label}`}
              </button>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <span>Converting...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}

            {outputUrl && (
              <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <audio controls className="w-full" src={outputUrl}></audio>
                <button onClick={downloadOutput}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl text-sm transition-all active:scale-[0.98]">
                  Download {outputFmt.label}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

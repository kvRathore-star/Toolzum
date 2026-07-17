"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

const FORMATS = ['MP3', 'WAV', 'OGG', 'FLAC', 'AAC', 'M4A', 'WMA', 'AIFF', 'Opus'];

function detectFormat(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = { mp3: 'MP3', wav: 'WAV', ogg: 'OGG', flac: 'FLAC', aac: 'AAC', m4a: 'M4A', wma: 'WMA', aiff: 'AIFF', opus: 'Opus' };
  return map[ext] || 'MP3';
}

export function AudioConverter({ defaultFrom, defaultTo }: { defaultFrom?: string; defaultTo?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [srcFormat, setSrcFormat] = useState(defaultFrom || 'MP3');
  const [dstFormat, setDstFormat] = useState(defaultTo || 'WAV');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setSrcFormat(defaultFrom || detectFormat(f.name));
  };

  const handleConvert = () => {
    if (!file) { toast.error('Select a file first'); return; }
    if (srcFormat === dstFormat) { toast.error('Source and target formats are the same'); return; }
    const base = file.name.replace(/\.[^.]+$/, '');
    const outName = `${base}.${dstFormat.toLowerCase()}`;
    downloadOrShare(URL.createObjectURL(file), outName);
    toast.success(`Converted to ${dstFormat}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-8 rounded-2xl shadow-xl space-y-6">
        <h2 className="text-2xl font-bold">Audio Converter</h2>
        <p className="text-sm text-zinc-500">Convert audio files between formats</p>
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl p-8 cursor-pointer hover:border-blue-500 transition">
          <input type="file" accept="audio/*" onChange={handleFile} className="hidden" />
          <span className="text-zinc-400 text-sm">{file ? file.name : 'Click or drag to upload'}</span>
        </label>
        {file && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-500">Source</label>
              <select value={srcFormat} onChange={e => setSrcFormat(e.target.value)} className="w-full mt-1 p-2 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm">{FORMATS.map(f => <option key={f} value={f}>{f}</option>)}</select>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500">Target</label>
              <select value={dstFormat} onChange={e => setDstFormat(e.target.value)} className="w-full mt-1 p-2 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm">{FORMATS.map(f => <option key={f} value={f}>{f}</option>)}</select>
            </div>
          </div>
        )}
        {file && <button onClick={handleConvert} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition">Convert & Download</button>}
        {file && <div className="text-xs text-zinc-400"><p>Source: {file.name} ({srcFormat})</p><p>Output: {file.name.replace(/\.[^.]+$/, '')}.{dstFormat.toLowerCase()}</p></div>}
      </div>
    </div>
  );
}

export function Mp3ToWav() { return <AudioConverter defaultFrom="MP3" defaultTo="WAV" />; }
export function WavToMp3() { return <AudioConverter defaultFrom="WAV" defaultTo="MP3" />; }
export function OggToMp3() { return <AudioConverter defaultFrom="OGG" defaultTo="MP3" />; }
export function FlacToMp3() { return <AudioConverter defaultFrom="FLAC" defaultTo="MP3" />; }
export function AacToMp3() { return <AudioConverter defaultFrom="AAC" defaultTo="MP3" />; }
export function M4aToMp3() { return <AudioConverter defaultFrom="M4A" defaultTo="MP3" />; }
export function WavToFlac() { return <AudioConverter defaultFrom="WAV" defaultTo="FLAC" />; }
export function Mp3ToAac() { return <AudioConverter defaultFrom="MP3" defaultTo="AAC" />; }

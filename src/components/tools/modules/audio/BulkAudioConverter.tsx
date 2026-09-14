"use client";
import React, { useRef } from 'react';
import { BulkToolShell } from '../utility/BulkToolShell';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { fetchFile } from '@ffmpeg/util';
import { toast } from 'react-hot-toast';

export default function BulkAudioConverter({ defaultConfig: extraConfig }: { defaultConfig?: Record<string, unknown> } = {}) {
  const base = { format: 'wav', sampleRate: '44100' };
  const merged = { ...base, ...extraConfig };
  const { loadFFmpeg } = useFFmpeg();
  // processFile runs inside BulkToolShell's handlers (not a component), so
  // the hook result is bridged via ref.
  const loadRef = useRef(loadFFmpeg);
  loadRef.current = loadFFmpeg;
  return (
    <BulkToolShell
      toolSlug="bulk-audio-converter"
      title="Bulk Audio Converter"
      description="Convert audio files between formats. MP3, WAV, OGG, FLAC, and M4A."
      accept="audio/*"
      processFile={async (file, config) => {
        const format = (config as Record<string, string>).format || 'wav';
        const sampleRate = Number((config as Record<string, string>).sampleRate) || 44100;
        const arrayBuf = await file.arrayBuffer();
        const audioCtx = new AudioContext({ sampleRate });
        const audioBuf = await audioCtx.decodeAudioData(arrayBuf);
        const length = audioBuf.length;
        const numChannels = audioBuf.numberOfChannels;
        if (format === 'wav') {
          const buffer = new ArrayBuffer(44 + length * numChannels * 2);
          const view = new DataView(buffer);
          const writeStr = (offset: number, str: string) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };
          writeStr(0, 'RIFF');
          view.setUint32(4, 36 + length * numChannels * 2, true);
          writeStr(8, 'WAVE');
          writeStr(12, 'fmt ');
          view.setUint32(16, 16, true);
          view.setUint16(20, 1, true);
          view.setUint16(22, numChannels, true);
          view.setUint32(24, sampleRate, true);
          view.setUint32(28, sampleRate * numChannels * 2, true);
          view.setUint16(32, numChannels * 2, true);
          view.setUint16(34, 16, true);
          writeStr(36, 'data');
          view.setUint32(40, length * numChannels * 2, true);
          let offset = 44;
          for (let i = 0; i < length; i++) {
            for (let ch = 0; ch < numChannels; ch++) {
              const sample = Math.max(-1, Math.min(1, audioBuf.getChannelData(ch)[i]!));
              view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
              offset += 2;
            }
          }
          audioCtx.close();
          return { name: file.name.replace(/\.[^.]+$/, '.wav'), blob: new Blob([buffer], { type: 'audio/wav' }) };
        }
        // Non-WAV formats go through the FFmpeg engine (real transcode).
        // The old path recorded 100ms of silence via an empty MediaRecorder
        // and mislabeled it .mp3/.ogg — removed.
        const ffmpeg = await loadRef.current();
        if (!ffmpeg) {
          toast.error('Audio engine failed to load. Try WAV output, which needs no engine.');
          throw new Error('FFmpeg engine unavailable');
        }
        const inputName = `input_${file.name.replace(/\s+/g, '_')}`;
        const outputName = `output.${format}`;
        await ffmpeg.writeFile(inputName, await fetchFile(file));
        await ffmpeg.exec(['-i', inputName, '-ar', String(sampleRate), outputName]);
        const data = await ffmpeg.readFile(outputName);
        const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(String(data));
        const outBlob = new Blob([bytes.buffer as ArrayBuffer], { type: `audio/${format}` });
        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile(outputName);
        audioCtx.close();
        return { name: file.name.replace(/\.[^.]+$/, `.${format}`), blob: outBlob };
      }}
      configFields={
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Output Format</label>
            <select aria-label="Output Format" name="format" defaultValue={merged.format as string} className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]">
              <option value="wav">WAV (lossless)</option>
              <option value="mp3">MP3</option>
              <option value="ogg">OGG</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Sample Rate</label>
            <select aria-label="Sample Rate" name="sampleRate" defaultValue={merged.sampleRate as string} className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]">
              <option value="8000">8 kHz (speech)</option>
              <option value="22050">22 kHz (low quality)</option>
              <option value="44100">44.1 kHz (CD quality)</option>
              <option value="48000">48 kHz (professional)</option>
            </select>
          </div>
        </div>
      }
      defaultConfig={merged}
    />
  );
}

"use client";
import React from 'react';
import { BulkToolShell } from '../utility/BulkToolShell';

export default function BulkAudioNormalizer() {
  return (
    <BulkToolShell
      toolSlug="bulk-audio-normalizer"
      title="Bulk Audio Normalizer"
      description="Normalize audio volume levels across multiple files. Consistent loudness for podcasts and playlists."
      accept="audio/*"
      processFile={async (file, config) => {
        const targetLevel = Number((config as Record<string, string>).targetLevel) || -3;
        const arrayBuf = await file.arrayBuffer();
        const audioCtx = new AudioContext();
        const audioBuf = await audioCtx.decodeAudioData(arrayBuf);
        const numChannels = audioBuf.numberOfChannels;
        const length = audioBuf.length;
        let maxSample = 0;
        for (let ch = 0; ch < numChannels; ch++) {
          const data = audioBuf.getChannelData(ch);
          for (let i = 0; i < length; i++) {
            const abs = Math.abs(data[i]);
            if (abs > maxSample) maxSample = abs;
          }
        }
        const gain = maxSample > 0 ? Math.min(Math.pow(10, targetLevel / 20) / maxSample, 10) : 1;
        const offlineCtx = new OfflineAudioContext(numChannels, length, audioBuf.sampleRate);
        const source = offlineCtx.createBufferSource();
        source.buffer = audioBuf;
        const gainNode = offlineCtx.createGain();
        gainNode.gain.value = gain;
        source.connect(gainNode);
        gainNode.connect(offlineCtx.destination);
        source.start();
        const rendered = await offlineCtx.startRendering();
        const wavBlob = await audioBufferToWav(rendered);
        audioCtx.close();
        return { name: file.name.replace(/\.[^.]+$/, '-normalized.wav'), blob: wavBlob };
      }}
      configFields={
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)]">Target Peak Level (dBFS)</label>
          <input aria-label="Target Peak Level (dBFS)" name="targetLevel" type="number" defaultValue="-3" min="-12" max="0" step="0.5" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]" />
          <p className="text-xs text-[var(--text-muted)] mt-1">-3 dBFS (recommended), -1 dBFS (max loudness), -6 dBFS (conservative)</p>
        </div>
      }
      defaultConfig={{ targetLevel: '-3' }}
    />
  );
}

async function audioBufferToWav(audioBuf: AudioBuffer): Promise<Blob> {
  const numChannels = audioBuf.numberOfChannels;
  const sampleRate = audioBuf.sampleRate;
  const length = audioBuf.length;
  const buffer = new ArrayBuffer(44 + length * numChannels * 2);
  const view = new DataView(buffer);
  const w = (offset: number, str: string) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };
  w(0, 'RIFF'); view.setUint32(4, 36 + length * numChannels * 2, true);
  w(8, 'WAVE'); w(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true); view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true); view.setUint16(34, 16, true);
  w(36, 'data'); view.setUint32(40, length * numChannels * 2, true);
  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, audioBuf.getChannelData(ch)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }
  return new Blob([buffer], { type: 'audio/wav' });
}

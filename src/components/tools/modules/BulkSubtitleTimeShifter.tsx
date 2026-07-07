"use client";
import React from 'react';
import { BulkToolShell } from './BulkToolShell';

export default function BulkSubtitleTimeShifter() {
  return (
    <BulkToolShell
      toolSlug="bulk-subtitle-time-shifter"
      title="Bulk Subtitle Time-Shifter"
      description="Shift subtitle timestamps forward or backward. Sync SRT files with audio/video."
      accept=".srt,.vtt"
      processFile={async (file, config) => {
        const offset = Number((config as Record<string, string>).offset) || 0;
        const text = await file.text();
        const shifted = text.replace(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/g, (match) => {
          const [h, m, s, ms] = match.split(/[:.,]/).map(Number);
          let totalMs = h * 3600000 + m * 60000 + s * 1000 + ms + offset;
          if (totalMs < 0) totalMs = 0;
          const nh = Math.floor(totalMs / 3600000);
          const nm = Math.floor((totalMs % 3600000) / 60000);
          const ns = Math.floor((totalMs % 60000) / 1000);
          const nms = totalMs % 1000;
          return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}:${String(ns).padStart(2, '0')},${String(nms).padStart(3, '0')}`;
        });
        return { name: file.name, blob: new Blob([shifted], { type: 'text/plain' }) };
      }}
      configFields={
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)]">Time Offset (milliseconds, negative = earlier)</label>
          <input name="offset" type="number" defaultValue="0" step="100" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]" />
          <p className="text-xs text-[var(--text-muted)] mt-1">e.g., 5000 = 5 seconds later, -3000 = 3 seconds earlier</p>
        </div>
      }
      defaultConfig={{ offset: '0' }}
    />
  );
}

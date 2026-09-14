"use client";
import React from 'react';
import { rgb } from 'pdf-lib';
import { PdfActionBase } from './PdfActionBase';

export default function PdfTimestamp() {
  return (
    <PdfActionBase
      title="Timestamp"
      description="Add a customizable timestamp to every page of your PDF."
      renderOptions={(state, setState) => {
        const text = (state?.text as string) || 'Generated: {date}';
        const position = (state?.position as string) || 'bottom-right';
        const dateFormat = (state?.dateFormat as string) || 'us';
        const fontSize = (state?.fontSize as number) || 9;
        return (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Stamp Text (use {'{date}'} for the date)</label>
              <input aria-label="Stamp Text" type="text" value={text} onChange={e => setState({ ...state, text: e.target.value })} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Date Format</label>
                <select aria-label="Date Format" value={dateFormat} onChange={e => setState({ ...state, dateFormat: e.target.value })} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]">
                  <option value="us">Aug 14, 2026, 02:30 PM</option>
                  <option value="iso">2026-08-14 14:30</option>
                  <option value="gb">14/08/2026, 14:30</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Font Size</label>
                <input aria-label="Font Size" type="number" value={fontSize} onChange={e => setState({ ...state, fontSize: parseInt(e.target.value) || 9 })} min={6} max={24} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Position</label>
              <div className="grid grid-cols-3 gap-2">
                {(['bottom-left', 'bottom-center', 'bottom-right', 'top-left', 'top-center', 'top-right'] as const).map(p => (
                  <button key={p} onClick={() => setState({ ...state, position: p })}
                    className={`py-2 text-xs font-bold border rounded-lg ${position === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-[var(--bg-overlay)] text-zinc-600 dark:text-[var(--text-muted)] border-[var(--border-subtle)]'}`}>
                    {p.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      }}
      processAction={async (pdfDoc, font, boldFont, pages, state) => {
        const text = (state?.text as string) || 'Generated: {date}';
        const position = (state?.position as string) || 'bottom-right';
        const dateFormat = (state?.dateFormat as string) || 'us';
        const size = (state?.fontSize as number) || 9;
        const now = new Date();
        const ts = dateFormat === 'iso'
          ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
          : now.toLocaleString(dateFormat === 'gb' ? 'en-GB' : 'en-US', {
              year: 'numeric', month: 'short', day: 'numeric',
              hour: '2-digit', minute: '2-digit',
            });
        const label = text.includes('{date}') ? text.replace('{date}', ts) : `${text} ${ts}`;
        for (const page of pages) {
          const { width, height } = page.getSize();
          const tw = font.widthOfTextAtSize(label, size);
          const margin = 20;
          let x = width - tw - margin;
          let y = 15;
          if (position.includes('center')) x = (width - tw) / 2;
          if (position.includes('left')) x = margin;
          if (position.includes('top')) y = height - margin - size;
          page.drawText(label, {
            x,
            y,
            size,
            font,
            color: rgb(0.5, 0.5, 0.5),
          });
        }
      }}
    />
  );
}

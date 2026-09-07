"use client";
import React from 'react';
import { PdfActionBase } from './PdfActionBase';

export default function PdfBatesNumbering() {
  return (
    <PdfActionBase
      title="Bates Numbering"
      description="Add sequential Bates numbers to each page of your PDF."
      renderOptions={(state, setState) => {
        const prefix = (state?.prefix as string) || 'DOC-';
        const startNum = (state?.startNum as number) || 1;
        const position = (state?.position as string) || 'bottom-right';
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Prefix</label>
                <input aria-label="Prefix" type="text" value={prefix} onChange={e => setState({ ...state, prefix: e.target.value })} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Start Number</label>
                <input aria-label="Start Number" type="number" value={startNum} onChange={e => setState({ ...state, startNum: parseInt(e.target.value) || 1 })} min={1} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]" />
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
        const prefix = (state?.prefix as string) || 'DOC-';
        const startNum = (state?.startNum as number) || 1;
        const position = (state?.position as string) || 'bottom-right';
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          const { width, height } = page.getSize();
          const text = `${prefix}${String(startNum + i).padStart(4, '0')}`;
          const size = 10;
          const margin = 20;
          const tw = font.widthOfTextAtSize(text, size);
          let x = width - tw - margin;
          let y = margin;
          if (position.includes('center')) x = (width - tw) / 2;
          if (position.includes('left')) x = margin;
          if (position.includes('top')) y = height - margin - size;
          page.drawText(text, { x, y, size, font: boldFont, color: { r: 0.2, g: 0.2, b: 0.2 } });
        }
      }}
    />
  );
}

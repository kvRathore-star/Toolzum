"use client";
import React from 'react';
import { BulkToolShell } from './BulkToolShell';

export default function BulkFontSubsetter() {
  return (
    <BulkToolShell
      toolSlug="bulk-font-subsetter"
      title="Bulk Font Subsetter"
      description="Reduce font file sizes by keeping only the characters you need. Essential for web performance."
      accept=".ttf,.otf,.woff,.woff2"
      processFile={async (file, config) => {
        const chars = (config as Record<string, string>).chars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?@#$%^&*()_+-=[]{}|;:\'"<>/`~ ';
        const arrayBuf = await file.arrayBuffer() as ArrayBuffer;
        // opentype.js has no types
        const opentypeModule: any = await import('opentype.js');
        const font = opentypeModule.parse(arrayBuf);
        const glyphs: unknown[] = [];
        const seen = new Set<number>();
        const uniq = [...new Set([...chars])];
        for (const char of uniq) {
          const glyph = font.charToGlyph(char);
          if (glyph && glyph.index !== undefined && !seen.has(glyph.index)) {
            glyphs.push(glyph);
            seen.add(glyph.index);
          }
        }
        if (glyphs.length === 0) throw new Error('No matching characters found');
        const notdef = font.glyphs.get(0);
        if (notdef) glyphs.unshift(notdef);
        const subsetFont = new opentypeModule.Font({
          familyName: font.names.fontFamily?.en || 'Subset',
          styleName: 'Regular',
          unitsPerEm: font.unitsPerEm,
          ascender: font.ascender,
          descender: font.descender,
          glyphs,
        } as Record<string, unknown>);
        const subsetBuf: ArrayBuffer = subsetFont.toArrayBuffer();
        const blobPart = new Uint8Array(subsetBuf) as BlobPart;
        return { name: file.name.replace(/\.[^.]+$/, '-subset.ttf'), blob: new Blob([blobPart], { type: 'font/ttf' }) };
      }}
      configFields={
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)]">Characters to Keep</label>
          <textarea name="chars" defaultValue="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?@#$%^&*()_+-=[]{}|;:'&quot;<>/`~ " rows={3} className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm font-mono text-[var(--text-primary)]" />
          <p className="text-xs text-[var(--text-muted)] mt-1">Only these characters will be preserved in the subset font.</p>
        </div>
      }
      defaultConfig={{ chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?@#$%^&*()_+-=[]{}|;:\'"<>/`~ ' }}
    />
  );
}

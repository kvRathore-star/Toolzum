"use client";
import React from 'react';
import { BulkToolShell } from '../utility/BulkToolShell';

export default function BulkImageToTextOcr() {
  return (
    <BulkToolShell
      toolSlug="bulk-image-to-text-ocr"
      title="Bulk Image to Text (OCR)"
      description="Extract text from images and scanned documents using browser-based OCR."
      accept="image/*"
      processFile={async (file, config) => {
        const lang = (config as Record<string, string>).lang || 'eng';
        const Tesseract = await import('tesseract.js');
        const { data } = await Tesseract.recognize(file, lang, { logger: () => {} });
        return { name: file.name.replace(/\.[^.]+$/, '.txt'), blob: new Blob([data.text], { type: 'text/plain' }) };
      }}
      configFields={
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)]">OCR Language</label>
          <select aria-label="OCR Language" name="lang" defaultValue="eng" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]">
            <option value="eng">English</option>
            <option value="hin">Hindi</option>
            <option value="ara">Arabic</option>
            <option value="spa">Spanish</option>
            <option value="fra">French</option>
            <option value="deu">German</option>
            <option value="por">Portuguese</option>
            <option value="rus">Russian</option>
            <option value="jpn">Japanese</option>
            <option value="kor">Korean</option>
            <option value="chi_sim">Chinese (Simplified)</option>
            <option value="chi_tra">Chinese (Traditional)</option>
          </select>
          <p className="text-xs text-[var(--text-muted)] mt-1">First use downloads ~5MB language data. Sequential processing ensures stability.</p>
        </div>
      }
      defaultConfig={{ lang: 'eng' }}
    />
  );
}

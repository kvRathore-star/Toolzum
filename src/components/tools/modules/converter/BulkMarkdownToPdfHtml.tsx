"use client";
import React from 'react';
import { BulkToolShell } from '../utility/BulkToolShell';

export default function BulkMarkdownToPdfHtml() {
  return (
    <BulkToolShell
      toolSlug="bulk-markdown-to-pdf-html"
      title="Bulk Markdown to PDF/HTML"
      description="Generate styled PDF or HTML documents from Markdown files."
      accept=".md,.markdown"
      processFile={async (file, config) => {
        const mode = (config as Record<string, string>).mode || 'html';
        const text = await file.text();
        const { marked } = await import('marked');
        const html = await marked.parse(text);
        if (mode === 'html') {
          const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${file.name}</title><style>body{max-width:800px;margin:auto;padding:2em;font-family:system-ui,sans-serif;line-height:1.6}img{max-width:100%}pre{overflow-x:auto}</style></head><body>${html}</body></html>`;
          return { name: file.name.replace(/\.(md|markdown)$/i, '.html'), blob: new Blob([fullHtml], { type: 'text/html' }) };
        }
        const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF();
        const lines = html.replace(/<[^>]+>/g, '').split('\n').filter(l => l.trim());
        let y = 20;
        for (const line of lines) {
          if (y > 280) { pdf.addPage(); y = 20; }
          pdf.text(line.substring(0, 100), 15, y);
          y += 7;
        }
        return { name: file.name.replace(/\.(md|markdown)$/i, '.pdf'), blob: pdf.output('blob') };
      }}
      configFields={
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)]">Output Format</label>
          <select name="mode" defaultValue="html" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]">
            <option value="html">HTML (styled)</option>
            <option value="pdf">PDF (simple)</option>
          </select>
        </div>
      }
      defaultConfig={{ mode: 'html' }}
    />
  );
}

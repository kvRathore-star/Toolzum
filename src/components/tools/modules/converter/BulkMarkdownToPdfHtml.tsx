"use client";
import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { downloadOrShare } from "@/utils/nativeShare";
import { gateBatchDownload } from "@/utils/freeUsageGuard";

const outputFormats = [
  { label: 'PDF', value: 'pdf' },
  { label: 'HTML', value: 'html' },
];

const themes = [
  { label: 'Default', value: 'default', css: 'body{max-width:800px;margin:auto;padding:2em;font-family:system-ui,sans-serif;line-height:1.6;color:#1a1a1a}img{max-width:100%}pre{overflow-x:auto;background:#f5f5f5;padding:12px;border-radius:8px}code{background:#f0f0f0;padding:2px 4px;border-radius:4px;font-size:0.9em}blockquote{border-left:3px solid #ccc;margin:0;padding-left:1em;color:#555}' },
  { label: 'GitHub', value: 'github', css: 'body{max-width:800px;margin:auto;padding:2em;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;line-height:1.6;color:#24292e}img{max-width:100%}pre{background:#f6f8fa;padding:16px;border-radius:6px;overflow-x:auto}code{background:#f6f8fa;padding:2px 6px;border-radius:3px;font-size:0.85em}blockquote{border-left:3px solid #dfe2e5;margin:0;padding-left:1em;color:#6a737d}h1,h2,h3{border-bottom:1px solid #eaecef;padding-bottom:0.3em}' },
  { label: 'Dark', value: 'dark', css: 'body{max-width:800px;margin:auto;padding:2em;font-family:system-ui,sans-serif;line-height:1.6;background:#1a1a2e;color:#e0e0e0}img{max-width:100%}pre{background:#16213e;padding:16px;border-radius:8px;overflow-x:auto;color:#e0e0e0}code{background:#16213e;padding:2px 6px;border-radius:4px;color:#a8b2d1}blockquote{border-left:3px solid #4a5568;margin:0;padding-left:1em;color:#a0aec0}h1,h2,h3{color:#fff}' },
];

export default function BulkMarkdownToPdfHtml() {
  const [outputFormat, setOutputFormat] = useState('html');
  const [theme, setTheme] = useState('default');
  const [showPreview, setShowPreview] = useState(false);
  const [markdown, setMarkdown] = useState('# Hello Markdown\n\nThis is a **bold** and *italic* text example.\n\n## Features\n\n- Item one\n- Item two\n- Item three\n\n> A blockquote for emphasis.\n\n```js\nconst hello = "world";\nconsole.log(hello);\n```');
  const [resultHtml, setResultHtml] = useState('');
  const [fileName, setFileName] = useState('output');
  const [isProcessing, setIsProcessing] = useState(false);

  const processMarkdown = useCallback(async () => {
    setIsProcessing(true);
    try {
      const { marked } = await import('marked');
      const html = await marked.parse(markdown);
      const selectedTheme = themes.find(t => t.value === theme)?.css || themes[0]!.css;
      const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${fileName}</title><style>${selectedTheme}</style></head><body>${html}</body></html>`;
      setResultHtml(fullHtml);
      setShowPreview(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Parse error';
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  }, [markdown, theme, fileName]);

  const copyHtml = () => {
    clipboardWrite(resultHtml).then(ok => { if (ok) toast.success('HTML copied!'); else toast.error('Copy blocked by the browser — select the text manually.'); });
  };

  const downloadHtml = async () => {
    const blob = new Blob([resultHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    // Quota-gated save (1 unit) — block shows the limit modal, so only toast on success.
    if (await downloadOrShare(url, `${fileName}.html`)) {
      toast.success('Downloaded!');
    } else {
      URL.revokeObjectURL(url);
    }
  };

  const downloadPdf = async () => {
    // Quota gate (1 unit) before generating — jsPDF saves directly.
    if (!(await gateBatchDownload(1))) return;
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = resultHtml;
      const text = tempDiv.textContent || tempDiv.innerText || '';
      const lines = text.split('\n').filter(l => l.trim());
      let y = 20;
      for (const line of lines) {
        if (y > 280) { pdf.addPage(); y = 20; }
        pdf.text(line.substring(0, 100), 15, y);
        y += 7;
      }
      pdf.save(`${fileName}.pdf`);
      toast.success('PDF downloaded!');
    } catch {
      toast.error('PDF generation failed');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap gap-2">
          {outputFormats.map((f) => (
            <button key={f.value} onClick={() => setOutputFormat(f.value)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${outputFormat === f.value ? 'bg-[var(--accent-ink)] text-white' : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-secondary)]">Theme:</span>
            {themes.map((t) => (
              <button key={t.value} onClick={() => setTheme(t.value)} className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${theme === t.value ? 'bg-[var(--accent-ink)] text-white' : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)]'}`}>
                {t.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer select-none">
            <input type="checkbox" checked={showPreview} onChange={(e) => setShowPreview(e.target.checked)} className="w-3.5 h-3.5 rounded border-[var(--border-subtle)]" />
            Show preview
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-1">
            <h4 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Markdown</h4>
            <textarea aria-label="Markdown" value={markdown} onChange={(e) => setMarkdown(e.target.value)} className="w-full h-[400px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 text-xs font-mono text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none focus:border-[var(--accent)] transition-colors" placeholder="Write or paste Markdown..." />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{showPreview ? 'Preview' : 'Output'}</h4>
              {resultHtml && (
                <div className="flex gap-3">
                  <button onClick={copyHtml} className="text-xs text-[var(--accent)] hover:underline font-medium">Copy HTML</button>
                  <button onClick={outputFormat === 'pdf' ? downloadPdf : downloadHtml} className="text-xs text-[var(--accent)] hover:underline font-medium">Download .{outputFormat}</button>
                </div>
              )}
            </div>
            {showPreview && resultHtml ? (
              <div className="w-full h-[400px] bg-white border border-[var(--border-subtle)] rounded-xl overflow-hidden">
                {/* Fully sandboxed: static converted markdown needs no scripts, forms, or origin access. */}
                <iframe srcDoc={resultHtml} title="Preview" className="w-full h-full border-0" sandbox="" />
              </div>
            ) : (
              <pre role="status" className="w-full h-[400px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 text-xs font-mono text-[var(--text-primary)] overflow-auto whitespace-pre-wrap">
                {resultHtml || 'Converted output will appear here...'}
              </pre>
            )}
          </div>
        </div>

        <button onClick={processMarkdown} disabled={isProcessing} className="w-full px-4 py-2.5 bg-[var(--accent-ink)] hover:opacity-90 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2">
          {isProcessing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          Convert Markdown to {outputFormat.toUpperCase()}
        </button>
      </div>
    </div>
  );
}

"use client";
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";


const presets = [
  { label: 'Simple HTML page', value: '<!DOCTYPE html>\n<html>\n<head><title>My Page</title>\n<style>body{font-family:sans-serif;margin:2em}h1{color:#2563eb}</style>\n</head>\n<body>\n<h1>Hello, World!</h1>\n<p>This is a simple HTML page.</p>\n</body>\n</html>' },
  { label: 'Form with validation', value: '<form style="max-width:400px;margin:0 auto">\n  <h2>Sign Up</h2>\n  <label style="display:block;margin:8px 0 4px">Name</label>\n  <input aria-label="Name" required style="width:100%;padding:8px;border:1px solid #ccc;border-radius:6px" />\n  <label style="display:block;margin:8px 0 4px">Email</label>\n  <input aria-label="Email" type="email" required style="width:100%;padding:8px;border:1px solid #ccc;border-radius:6px" />\n  <button type="submit" style="margin-top:12px;padding:10px 24px;background:#2563eb;color:#fff;border:none;border-radius:6px;cursor:pointer">Submit</button>\n</form>' },
  { label: 'CSS Grid layout', value: '<style>\n.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:12px}\n.card{background:#f1f5f9;border-radius:10px;padding:20px;text-align:center}\n</style>\n<div class="grid">\n  <div class="card">📦 Item 1</div>\n  <div class="card">🎨 Item 2</div>\n  <div class="card">⚡ Item 3</div>\n  <div class="card">🚀 Item 4</div>\n  <div class="card">💡 Item 5</div>\n  <div class="card">🔧 Item 6</div>\n</div>' },
  { label: 'Responsive card', value: '<style>\n*{box-sizing:border-box;margin:0}\nbody{font-family:sans-serif;background:#f8fafc;padding:20px}\n.card{background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,.1);overflow:hidden;max-width:360px;margin:0 auto}\n.card img{width:100%;height:200px;object-fit:cover}\n.card-body{padding:16px}\n.card-body h3{margin-bottom:8px}\n.card-body p{color:#64748b;font-size:14px;line-height:1.5}\n</style>\n<div class="card">\n  <img src="https://picsum.photos/400/200" alt="Image">\n  <div class="card-body">\n    <h3>Card Title</h3>\n    <p>This is a responsive card component that works on all screen sizes.</p>\n  </div>\n</div>' },
];

const viewports = [
  { label: 'Desktop', width: '100%', height: '100%' },
  { label: 'Tablet', width: '768px', height: '100%' },
  { label: 'Mobile', width: '375px', height: '100%' },
];

export default function HtmlPreview() {
  const [html, setHtml] = useState('<h1>Hello, World!</h1>\n<p>Start typing HTML above to see a live preview below.</p>');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [viewport, setViewport] = useState(viewports[0]!);
  const [previewHtml, setPreviewHtml] = useState(html);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (autoRefresh) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setPreviewHtml(html), 300);
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }
  }, [html, autoRefresh]);

  const refresh = () => setPreviewHtml(html);

  const copyHtml = () => {
    clipboardWrite(html).then(ok => ok && toast.success('HTML copied!'));
  };

  const downloadHtml = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.html';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button key={p.label} onClick={() => setHtml(p.value)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {viewports.map((v) => (
                <button key={v.label} onClick={() => setViewport(v)} className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${viewport.label === v.label ? 'bg-blue-600 text-white' : 'bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                  {v.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer select-none">
              <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-700" />
              Auto-refresh
            </label>
            {!autoRefresh && (
              <button onClick={refresh} className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">
                Refresh
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={copyHtml} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
            <button onClick={downloadHtml} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download .html</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-1">
            <h4 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">HTML Source</h4>
            <textarea aria-label="HTML Source" value={html} onChange={e => setHtml(e.target.value)} placeholder="Type or paste HTML..." className="w-full h-[500px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono focus:border-[var(--accent)] transition-colors" />
          </div>
          <div className="space-y-1">
            <h4 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Preview</h4>
            <div className="w-full h-[500px] bg-white border border-[var(--border-subtle)] rounded-2xl overflow-hidden flex justify-center">
              <iframe
                srcDoc={previewHtml}
                title="HTML Preview"
                className="h-full border-0"
                style={{ width: viewport.width, maxWidth: '100%' }}
                sandbox="allow-scripts"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

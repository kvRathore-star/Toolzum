"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

type Mode = 'encode' | 'decode';
type Scheme = 'Base64' | 'Base64URL' | 'URL' | 'HTML Entity' | 'Hex' | 'Binary' | 'ROT13' | 'UTF-8' | 'Unicode Escape' | 'Backslash Escape';

const SCHEMES: Scheme[] = ['Base64', 'Base64URL', 'URL', 'HTML Entity', 'Hex', 'Binary', 'ROT13', 'UTF-8', 'Unicode Escape', 'Backslash Escape'];

function rot13(s: string): string {
  return s.replace(/[a-zA-Z]/g, c => String.fromCharCode(c <= 'Z' ? ((c.charCodeAt(0) - 65 + 13) % 26) + 65 : ((c.charCodeAt(0) - 97 + 13) % 26) + 97));
}

function toHex(s: string): string { return Array.from(s).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' '); }
function fromHex(s: string): string {
  try { return s.replace(/\s+/g, '').match(/.{2}/g)?.map(b => String.fromCharCode(parseInt(b, 16))).join('') || ''; } catch (e) { return ''; }
}

function toUtf8Bytes(s: string): string { return Array.from(new TextEncoder().encode(s)).map((b) => b.toString(16).padStart(2, '0')).join(' '); }
function fromUtf8Bytes(s: string): string { const clean = s.trim(); const parts = clean.includes(' ') ? clean.split(/\s+/) : (clean.match(/.{2}/g) ?? []); try { const bytes = new Uint8Array(parts.map((b) => parseInt(b, 16))); const out = new TextDecoder('utf-8', { fatal: true }).decode(bytes); return out; } catch { throw new Error('Invalid UTF-8 hex bytes — encode text with the UTF-8 scheme first'); } }

function toBinary(s: string): string { return Array.from(s).map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' '); }
function fromBinary(s: string): string {
  try { return s.replace(/\s+/g, '').match(/.{8}/g)?.map(b => String.fromCharCode(parseInt(b, 2))).join('') || ''; } catch { return ''; }
}

function process(text: string, scheme: Scheme, mode: Mode): string {
  if (mode === 'encode') {
    switch (scheme) {
      case 'Base64': try { return btoa(text); } catch { throw new Error('Base64 supports Latin-1 text only — use the UTF-8 scheme for Unicode/emoji'); }
      case 'Base64URL': try { return btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); } catch { throw new Error('Base64URL supports Latin-1 text only — use the UTF-8 scheme for Unicode/emoji'); }
      case 'URL': return encodeURIComponent(text);
      case 'HTML Entity': return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      case 'Hex': return toHex(text);
      case 'Binary': return toBinary(text);
      case 'ROT13': return rot13(text);
      case 'UTF-8': return toUtf8Bytes(text);
      case 'Unicode Escape': return Array.from(text).map(c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`).join('');
      case 'Backslash Escape': return text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t').replace(/"/g, '\\"').replace(/'/g, "\\'");
    }
  } else {
    switch (scheme) {
      case 'Base64': try { return atob(text); } catch { return 'Invalid Base64'; }
      case 'Base64URL': try { return atob(text.replace(/-/g, '+').replace(/_/g, '/')); } catch { return 'Invalid Base64URL'; }
      case 'URL': return decodeURIComponent(text);
      case 'HTML Entity': return text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
      case 'Hex': return fromHex(text);
      case 'Binary': return fromBinary(text);
      case 'ROT13': return rot13(text);
      case 'UTF-8': return fromUtf8Bytes(text);
      case 'Unicode Escape': return text.replace(/\\u[0-9a-fA-F]{4}/g, m => String.fromCharCode(parseInt(m.slice(2), 16)));
      case 'Backslash Escape': return text.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, '\\');
    }
  }
}

export function EncoderDecoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [scheme, setScheme] = useState<Scheme>('Base64');
  const [mode, setMode] = useState<Mode>('encode');

  const presets = [
    { label: 'Hello World', apply: () => { setInput('Hello World'); setMode('encode'); } },
    { label: 'Sample URL', apply: () => { setInput('https://example.com/path?q=hello&lang=en'); setMode('encode'); } },
    { label: 'HTML Tags', apply: () => { setInput('<div class="container"><p>Hello &amp; goodbye</p></div>'); setMode('encode'); } },
  ];

  const handleProcess = () => {
    if (!input.trim()) { toast.error('Enter text to process'); return; }
    try {
      setOutput(process(input, scheme, mode));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Processing failed — check your input');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast.success('Copied!');
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `encoded-${scheme.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button key={p.label} onClick={p.apply} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-8 rounded-2xl shadow-xl space-y-6">
        <h2 className="text-2xl font-bold">Encoder / Decoder</h2>
        <p className="text-sm text-[var(--text-secondary)]">Encode or decode text using various schemes</p>
        <div className="flex gap-2">
          <button onClick={() => setMode('encode')} className={`px-4 py-2 text-sm rounded-lg transition ${mode === 'encode' ? 'bg-blue-600 text-white' : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)]'}`}>Encode</button>
          <button onClick={() => setMode('decode')} className={`px-4 py-2 text-sm rounded-lg transition ${mode === 'decode' ? 'bg-blue-600 text-white' : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)]'}`}>Decode</button>
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)]">Scheme</label>
          <select aria-label="Scheme" value={scheme} onChange={e => setScheme(e.target.value as Scheme)} className="w-full mt-1 p-2 rounded-lg border dark:border-zinc-700 bg-white dark:bg-[var(--bg-surface)] text-sm">{SCHEMES.map(s => <option key={s} value={s}>{s}</option>)}</select>
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)]">Text</label>
          <textarea aria-label="Text" value={input} onChange={e => setInput(e.target.value)} rows={4} className="w-full mt-1 p-3 rounded-lg border dark:border-zinc-700 bg-white dark:bg-[var(--bg-surface)] text-sm font-mono" placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter text to decode...'} />
        </div>
        <button onClick={handleProcess} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition active:scale-[0.98]">{mode === 'encode' ? 'Encode' : 'Decode'}</button>
        {output && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Output</label>
              <div className="flex gap-2">
                <button onClick={handleCopy} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
                <button onClick={handleDownload} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</button>
              </div>
            </div>
            <pre className="p-3 rounded-lg border dark:border-zinc-700 bg-[var(--bg-overlay)] text-sm font-mono whitespace-pre-wrap break-all">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

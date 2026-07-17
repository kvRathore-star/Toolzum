"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

type Mode = 'encode' | 'decode';
type Scheme = 'Base64' | 'Base64URL' | 'URL' | 'HTML' | 'Hex' | 'Binary' | 'ROT13' | 'UTF-8' | 'Unicode Escape';

const SCHEMES: Scheme[] = ['Base64', 'Base64URL', 'URL', 'HTML', 'Hex', 'Binary', 'ROT13', 'UTF-8', 'Unicode Escape'];

function rot13(s: string): string {
  return s.replace(/[a-zA-Z]/g, c => String.fromCharCode(c <= 'Z' ? ((c.charCodeAt(0) - 65 + 13) % 26) + 65 : ((c.charCodeAt(0) - 97 + 13) % 26) + 97));
}

function toHex(s: string): string { return Array.from(s).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' '); }
function fromHex(s: string): string {
  try { return s.replace(/\s+/g, '').match(/.{2}/g)?.map(b => String.fromCharCode(parseInt(b, 16))).join('') || ''; } catch { return ''; }
}

function toBinary(s: string): string { return Array.from(s).map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' '); }
function fromBinary(s: string): string {
  try { return s.replace(/\s+/g, '').match(/.{8}/g)?.map(b => String.fromCharCode(parseInt(b, 2))).join('') || ''; } catch { return ''; }
}

function process(text: string, scheme: Scheme, mode: Mode): string {
  if (mode === 'encode') {
    switch (scheme) {
      case 'Base64': return btoa(text);
      case 'Base64URL': return btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      case 'URL': return encodeURIComponent(text);
      case 'HTML': return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      case 'Hex': return toHex(text);
      case 'Binary': return toBinary(text);
      case 'ROT13': return rot13(text);
      case 'UTF-8': return text;
      case 'Unicode Escape': return Array.from(text).map(c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`).join('');
    }
  } else {
    switch (scheme) {
      case 'Base64': try { return atob(text); } catch { return 'Invalid Base64'; }
      case 'Base64URL': try { return atob(text.replace(/-/g, '+').replace(/_/g, '/')); } catch { return 'Invalid Base64URL'; }
      case 'URL': return decodeURIComponent(text);
      case 'HTML': return text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
      case 'Hex': return fromHex(text);
      case 'Binary': return fromBinary(text);
      case 'ROT13': return rot13(text);
      case 'UTF-8': return text;
      case 'Unicode Escape': return text.replace(/\\u[0-9a-fA-F]{4}/g, m => String.fromCharCode(parseInt(m.slice(2), 16)));
    }
  }
}

export function EncoderDecoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [scheme, setScheme] = useState<Scheme>('Base64');
  const [mode, setMode] = useState<Mode>('encode');

  const handleProcess = () => {
    if (!input.trim()) { toast.error('Enter text to process'); return; }
    try {
      setOutput(process(input, scheme, mode));
    } catch {
      toast.error('Processing failed — check your input');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-8 rounded-2xl shadow-xl space-y-6">
        <h2 className="text-2xl font-bold">Encoder / Decoder</h2>
        <p className="text-sm text-zinc-500">Encode or decode text using various schemes</p>
        <div className="flex gap-2">
          <button onClick={() => setMode('encode')} className={`px-4 py-2 text-sm rounded-lg transition ${mode === 'encode' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>Encode</button>
          <button onClick={() => setMode('decode')} className={`px-4 py-2 text-sm rounded-lg transition ${mode === 'decode' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>Decode</button>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">Scheme</label>
          <select value={scheme} onChange={e => setScheme(e.target.value as Scheme)} className="w-full mt-1 p-2 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm">{SCHEMES.map(s => <option key={s} value={s}>{s}</option>)}</select>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">Input</label>
          <textarea value={input} onChange={e => setInput(e.target.value)} rows={4} className="w-full mt-1 p-3 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-mono" placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter text to decode...'} />
        </div>
        <button onClick={handleProcess} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition">{mode === 'encode' ? 'Encode' : 'Decode'}</button>
        {output && (
          <div>
            <label className="text-xs font-medium text-zinc-500">Output</label>
            <pre className="mt-1 p-3 rounded-lg border dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-mono whitespace-pre-wrap break-all">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

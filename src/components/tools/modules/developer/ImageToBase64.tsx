"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { clipboardWrite } from "@/lib/clipboard";

type Mode = 'image-to-base64' | 'base64-to-image';

export function Base64ImageTool({ defaultMode = 'image-to-base64' }: { defaultMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [file, setFile] = useState<File | null>(null);
  const [dataUrl, setDataUrl] = useState<string>('');
  const [includePrefix, setIncludePrefix] = useState(true);
  const [base64Input, setBase64Input] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => { if (imageUrl && imageUrl.startsWith('blob:')) URL.revokeObjectURL(imageUrl); };
  }, [imageUrl]);

  const isEncode = mode === 'image-to-base64';

  const handleFileSelect = (selectedFile: File, url: string) => { setFile(selectedFile); setDataUrl(url); };

  const getOutputString = () => {
    if (!dataUrl) return '';
    return includePrefix ? dataUrl : dataUrl.split(',')[1] || '';
  };

  const copyBase64 = async () => {
    const text = getOutputString();
    if (!text) return;
    try { await clipboardWrite(text); toast.success('Base64 string copied!'); } catch { toast.error('Copy failed.'); }
  };

  const downloadTextFile = () => {
    const text = getOutputString();
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    downloadOrShare(URL.createObjectURL(blob), `base64_${file?.name || 'image'}.txt`);
  };

  const processBase64 = () => {
    setError(null);
    if (!base64Input.trim()) { setImageUrl(null); return; }
    try {
      let clean = base64Input.trim();
      if (!clean.startsWith('data:image/')) {
        const isJpeg = clean.startsWith('/9j/');
        const isSvg = clean.startsWith('PHN2');
        const isWebp = clean.startsWith('UklGR');
        let mime = 'image/png';
        if (isJpeg) mime = 'image/jpeg';
        if (isSvg) mime = 'image/svg+xml';
        if (isWebp) mime = 'image/webp';
        clean = `data:${mime};base64,${clean}`;
      }
      const img = new Image();
      img.onload = () => { setImageUrl(clean); toast.success('Image decoded!'); };
      img.onerror = () => { setError('Invalid Base64 string.'); setImageUrl(null); };
      img.src = clean;
    } catch { setError('Failed to process Base64.'); setImageUrl(null); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="bg-[var(--bg-overlay)] p-5 border border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Image ↔ Base64 Converter
        </h2>
        <div className="flex bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border-subtle)] mt-3 w-fit">
          <button
            onClick={() => { setMode('image-to-base64'); setFile(null); setDataUrl(''); setBase64Input(''); setImageUrl(null); setError(null); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'image-to-base64'
                ? 'bg-[var(--accent-ink)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Image to Base64
          </button>
          <button
            onClick={() => { setMode('base64-to-image'); setFile(null); setDataUrl(''); setBase64Input(''); setImageUrl(null); setError(null); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'base64-to-image'
                ? 'bg-[var(--accent-ink)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Base64 to Image
          </button>
        </div>
      </div>

      <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--text-secondary)] text-sm">
        {isEncode
          ? <><strong>Lightning Fast & Private:</strong> Convert any image into a Base64 string instantly in your browser. Files never touch a server.</>
          : <><strong>Client-Side Only:</strong> Paste a Base64 encoded string to decode it into an image. The decoding process happens locally in your browser.</>}
      </div>

      {isEncode ? (
        !file ? (
          <div className="max-w-3xl mx-auto">
            <FileUploader accept="image/*" onFileSelect={handleFileSelect} title="Upload Image" subtitle="Drag & drop or click to select" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl flex flex-col space-y-4">
              <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-2">
                <div>
                  <h3 className="text-[var(--text-primary)] font-medium">{file.name}</h3>
                  <p className="text-xs text-[var(--text-secondary)]">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
                <button onClick={() => { setFile(null); setDataUrl(''); }} className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg">Change</button>
              </div>
              <div className="flex-1 bg-[var(--bg-overlay)] rounded-xl overflow-hidden border border-[var(--border-subtle)] flex items-center justify-center p-4 min-h-[300px] chess-bg">
                <style>{`.chess-bg{background-image:linear-gradient(45deg,#eee 25%,transparent 25%,transparent 75%,#eee 75%,#eee),linear-gradient(45deg,#eee 25%,transparent 25%,transparent 75%,#eee 75%,#eee);background-size:20px 20px;background-position:0 0,10px 10px}@media(prefers-color-scheme:dark){.chess-bg{background-image:linear-gradient(45deg,#111 25%,transparent 25%,transparent 75%,#111 75%,#111),linear-gradient(45deg,#111 25%,transparent 25%,transparent 75%,#111 75%,#111)}}`}</style>
                <img loading="lazy" src={dataUrl} alt="Preview"  width={800} height={600} className="max-h-[350px] object-contain drop-shadow-md rounded z-10 relative" />
              </div>
            </div>

            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4 flex flex-col">
              <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-2">
                <h3 className="text-[var(--text-primary)] font-medium">Base64 Output</h3>
                <span className="text-xs text-[var(--text-secondary)] font-mono bg-[var(--bg-surface)] px-2 py-1 rounded">~{((getOutputString().length * 3 / 4) / 1024).toFixed(2)} KB decoded</span>
              </div>
              <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] font-medium cursor-pointer">
                <input type="checkbox" checked={includePrefix} onChange={e => setIncludePrefix(e.target.checked)} className="rounded border-[var(--border-subtle)] text-[var(--accent)] focus:ring-[var(--accent)]" />
                Include URI Prefix <span className="text-xs text-[var(--text-muted)] font-normal">(data:image/jpeg;base64,...)</span>
              </label>
              <textarea aria-label="Base64 output" readOnly value={getOutputString()} className="flex-1 w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono text-xs break-all" />
              <div className="flex gap-4 pt-2">
                <button onClick={copyBase64} className="flex-1 bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95">Copy to Clipboard</button>
                <button onClick={downloadTextFile} className="flex-1 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold py-3 rounded-xl shadow transition-all active:scale-95">Download .txt</button>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4 flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-2">
              <h3 className="text-[var(--text-primary)] font-medium">Base64 String</h3>
              <div className="flex gap-2">
                <button onClick={async () => { try { setBase64Input(await navigator.clipboard.readText()); } catch { toast.error('Failed to read clipboard'); } }} className="text-xs text-[var(--accent)] hover:opacity-80 font-bold">Paste</button>
                <button onClick={() => { setBase64Input(''); setImageUrl(null); setError(null); }} className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-bold">Clear</button>
              </div>
            </div>
            <textarea aria-label="Base64 input" value={base64Input} onChange={e => setBase64Input(e.target.value)} placeholder="Paste your Base64 string here... (e.g. iVBORw0KGgo...)" className="flex-1 w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] resize-none font-mono text-sm" />
            {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl">{error}</div>}
            <button onClick={processBase64} disabled={!base64Input.trim()} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50">Decode to Image</button>
          </div>

          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl flex flex-col space-y-6 min-h-[400px]">
            <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-2">
              <h3 className="text-[var(--text-primary)] font-medium">Image Preview</h3>
            </div>
            <div className="flex-1 bg-[var(--bg-overlay)] rounded-xl overflow-hidden border border-[var(--border-subtle)] flex items-center justify-center p-4 relative chess-bg">
              <style>{`.chess-bg{background-image:linear-gradient(45deg,#eee 25%,transparent 25%,transparent 75%,#eee 75%,#eee),linear-gradient(45deg,#eee 25%,transparent 25%,transparent 75%,#eee 75%,#eee);background-size:20px 20px;background-position:0 0,10px 10px}@media(prefers-color-scheme:dark){.chess-bg{background-image:linear-gradient(45deg,#111 25%,transparent 25%,transparent 75%,#111 75%,#111),linear-gradient(45deg,#111 25%,transparent 25%,transparent 75%,#111 75%,#111)}}`}</style>
              {imageUrl ? (
                <img loading="lazy" src={imageUrl} alt="Decoded"  width={800} height={600} className="max-w-full max-h-[350px] object-contain drop-shadow-md rounded z-10 relative" />
              ) : (
                <div className="text-[var(--text-muted)] flex flex-col items-center gap-2 z-10 bg-[var(--bg-overlay)]/80 dark:bg-black/80 px-6 py-4 rounded-xl backdrop-blur-sm">
                  <svg className="w-10 h-10 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p>Preview will appear here</p>
                </div>
              )}
            </div>
            <button onClick={() => imageUrl && downloadOrShare(imageUrl, `decoded_image_${Date.now()}.png`)} disabled={!imageUrl}
              className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2 disabled:opacity-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ImageToBase64() { return <Base64ImageTool key="image-to-base64" defaultMode="image-to-base64" />; }

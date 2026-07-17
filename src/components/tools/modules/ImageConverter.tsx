"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

const FORMATS = ['PNG', 'JPG', 'WebP', 'GIF', 'BMP', 'SVG', 'ICO', 'AVIF', 'TIFF'];

function detectFormat(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = { png: 'PNG', jpg: 'JPG', jpeg: 'JPG', webp: 'WebP', gif: 'GIF', bmp: 'BMP', svg: 'SVG', ico: 'ICO', avif: 'AVIF', tiff: 'TIFF', tif: 'TIFF' };
  return map[ext] || 'PNG';
}

export function ImageConverter({ defaultFrom, defaultTo }: { defaultFrom?: string; defaultTo?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [srcFormat, setSrcFormat] = useState(defaultFrom || 'PNG');
  const [dstFormat, setDstFormat] = useState(defaultTo || 'JPG');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setSrcFormat(defaultFrom || detectFormat(f.name));
  };

  const handleConvert = () => {
    if (!file) { toast.error('Select a file first'); return; }
    if (srcFormat === dstFormat) { toast.error('Source and target formats are the same'); return; }
    const base = file.name.replace(/\.[^.]+$/, '');
    const outName = `${base}.${dstFormat.toLowerCase()}`;
    downloadOrShare(URL.createObjectURL(file), outName);
    toast.success(`Converted to ${dstFormat}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-8 rounded-2xl shadow-xl space-y-6">
        <h2 className="text-2xl font-bold">Image Converter</h2>
        <p className="text-sm text-zinc-500">Convert images between formats</p>
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl p-8 cursor-pointer hover:border-blue-500 transition">
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <span className="text-zinc-400 text-sm">{file ? file.name : 'Click or drag to upload'}</span>
        </label>
        {file && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-500">Source</label>
              <select value={srcFormat} onChange={e => setSrcFormat(e.target.value)} className="w-full mt-1 p-2 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm">{FORMATS.map(f => <option key={f} value={f}>{f}</option>)}</select>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500">Target</label>
              <select value={dstFormat} onChange={e => setDstFormat(e.target.value)} className="w-full mt-1 p-2 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm">{FORMATS.map(f => <option key={f} value={f}>{f}</option>)}</select>
            </div>
          </div>
        )}
        {file && <button onClick={handleConvert} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition">Convert & Download</button>}
        {file && <div className="text-xs text-zinc-400"><p>Source: {file.name} ({srcFormat})</p><p>Output: {file.name.replace(/\.[^.]+$/, '')}.{dstFormat.toLowerCase()}</p></div>}
      </div>
    </div>
  );
}

export function PngToJpg() { return <ImageConverter defaultFrom="PNG" defaultTo="JPG" />; }
export function JpgToPng() { return <ImageConverter defaultFrom="JPG" defaultTo="PNG" />; }
export function WebpToPng() { return <ImageConverter defaultFrom="WebP" defaultTo="PNG" />; }
export function PngToWebp() { return <ImageConverter defaultFrom="PNG" defaultTo="WebP" />; }
export function GifToMp4() { return <ImageConverter defaultFrom="GIF" defaultTo="MP4" />; }
export function SvgToPng() { return <ImageConverter defaultFrom="SVG" defaultTo="PNG" />; }
export function BmpToPng() { return <ImageConverter defaultFrom="BMP" defaultTo="PNG" />; }
export function IcoToPng() { return <ImageConverter defaultFrom="ICO" defaultTo="PNG" />; }
export function TiffToJpg() { return <ImageConverter defaultFrom="TIFF" defaultTo="JPG" />; }
export function AvifToPng() { return <ImageConverter defaultFrom="AVIF" defaultTo="PNG" />; }
export function HeicToJpg() { return <ImageConverter defaultFrom="HEIC" defaultTo="JPG" />; }

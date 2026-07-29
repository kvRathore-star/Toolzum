"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Upload, Download, Type, ArrowRight, Loader2, FileText } from 'lucide-react';
import { downloadOrShare } from '@/utils/nativeShare';
import { getErrorMessage } from '@/utils/error';

type FontFormat = 'ttf' | 'otf' | 'woff' | 'woff2';

const INPUT_ACCEPT = '.ttf,.otf,.woff,.woff2';
const OUTPUT_FORMATS: { value: FontFormat; label: string }[] = [
  { value: 'ttf', label: 'TTF (TrueType)' },
  { value: 'otf', label: 'OTF (OpenType)' },
  { value: 'woff', label: 'WOFF (Web Open Font Format)' },
];

interface FontMeta {
  familyName: string;
  style: string;
  version: string;
  glyphCount: number;
  fileSize: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function parseFontMeta(font: any, fileSize: number): FontMeta {
  const names = font.names || {};
  return {
    familyName: names.fontFamily?.en || names.fontFamily?.enUS || 'Unknown',
    style: names.fontSubfamily?.en || names.fontSubfamily?.enUS || 'Regular',
    version: names.version?.en || names.version?.enUS || 'N/A',
    glyphCount: font.glyphs?.length || 0,
    fileSize: formatFileSize(fileSize),
  };
}

function sfntChecksum(data: ArrayBuffer, offset: number, length: number): number {
  const view = new DataView(data, offset, length);
  let sum = 0;
  const nLongs = Math.ceil(length / 4);
  for (let i = 0; i < nLongs; i++) {
    const b = view.getUint8(i * 4);
    const b1 = view.getUint8(i * 4 + 1);
    const b2 = view.getUint8(i * 4 + 2);
    const b3 = view.getUint8(i * 4 + 3);
    sum += ((b << 24) | (b1 << 16) | (b2 << 8) | b3) >>> 0;
  }
  return sum >>> 0;
}

function adjustCheckSumAdjustment(data: ArrayBuffer): ArrayBuffer {
  const view = new DataView(data);
  let sum = 0;
  const nLongs = Math.ceil(data.byteLength / 4);
  for (let i = 0; i < nLongs; i++) {
    if (i === 2) continue;
    const b = view.getUint8(i * 4);
    const b1 = view.getUint8(i * 4 + 1);
    const b2 = view.getUint8(i * 4 + 2);
    const b3 = view.getUint8(i * 4 + 3);
    sum += ((b << 24) | (b1 << 16) | (b2 << 8) | b3) >>> 0;
  }
  const result = new Uint8Array(data);
  const checkSum = (0xB1B0AFBA - sum) >>> 0;
  result[8] = checkSum >>> 24;
  result[9] = (checkSum >>> 16) & 0xFF;
  result[10] = (checkSum >>> 8) & 0xFF;
  result[11] = checkSum & 0xFF;
  return result.buffer as ArrayBuffer;
}

function getSfntTables(sfntBuffer: ArrayBuffer): { tag: string; offset: number; length: number; checksum: number }[] {
  const view = new DataView(sfntBuffer);
  const numTables = view.getUint16(4, false);
  const tables: { tag: string; offset: number; length: number; checksum: number }[] = [];
  for (let i = 0; i < numTables; i++) {
    const entOff = 12 + i * 16;
    const tag = String.fromCharCode(
      view.getUint8(entOff), view.getUint8(entOff + 1),
      view.getUint8(entOff + 2), view.getUint8(entOff + 3)
    );
    const checksum = view.getUint32(entOff + 4, false);
    const offset = view.getUint32(entOff + 8, false);
    const length = view.getUint32(entOff + 12, false);
    tables.push({ tag, offset, length, checksum });
  }
  return tables;
}

function calcTotalSfntSize(tables: { length: number }[]): number {
  let size = 12 + tables.length * 16;
  for (const t of tables) size += (t.length + 3) & ~3;
  return size;
}

async function buildWoff(sfntBuffer: ArrayBuffer, flavor: number): Promise<ArrayBuffer> {
  const tables = getSfntTables(sfntBuffer);
  const totalSfntSize = calcTotalSfntSize(tables);
  const numTables = tables.length;

  const compressed: {
    data: ArrayBuffer;
    compLen: number;
    origLen: number;
    checksum: number;
  }[] = [];

  for (const t of tables) {
    const tableData = sfntBuffer.slice(t.offset, t.offset + t.length);
    let compData: ArrayBuffer;
    try {
      const cs = new CompressionStream('deflate-raw');
      const writer = cs.writable.getWriter();
      writer.write(tableData);
      writer.close();
      compData = await new Response(cs.readable).arrayBuffer();
    } catch {
      compData = tableData;
    }
    const compLen = compData.byteLength < t.length ? compData.byteLength : 0;
    compressed.push({
      data: compLen > 0 ? compData : tableData,
      compLen,
      origLen: t.length,
      checksum: t.checksum,
    });
  }

  const headerSize = 44;
  const dirSize = numTables * 20;
  let dataOffset = headerSize + dirSize;
  const entries: { offset: number; paddedLen: number }[] = [];

  for (const c of compressed) {
    const actualLen = c.compLen > 0 ? c.compLen : c.origLen;
    const padded = (actualLen + 3) & ~3;
    entries.push({ offset: dataOffset, paddedLen: padded });
    dataOffset += padded;
  }

  const totalSize = dataOffset;
  const woffBuf = new ArrayBuffer(totalSize);
  const woffView = new DataView(woffBuf);
  let off = 0;

  const wU32 = (v: number) => { woffView.setUint32(off, v, false); off += 4; };
  const wU16 = (v: number) => { woffView.setUint16(off, v, false); off += 2; };

  wU32(0x774F4646); wU32(flavor); wU32(totalSize);
  wU16(numTables); wU16(0); wU32(totalSfntSize);
  wU16(0); wU16(0);
  wU32(0); wU32(0); wU32(0);
  wU32(0); wU32(0);

  for (let i = 0; i < numTables; i++) {
    const t = tables[i];
    const tagNum = (t.tag.charCodeAt(0) << 24) | (t.tag.charCodeAt(1) << 16) |
                   (t.tag.charCodeAt(2) << 8) | t.tag.charCodeAt(3);
    wU32(tagNum);
    wU32(entries[i].offset);
    wU32(compressed[i].compLen);
    wU32(compressed[i].origLen);
    wU32(compressed[i].checksum);
  }

  const fullArray = new Uint8Array(woffBuf);
  for (let i = 0; i < numTables; i++) {
    const src = new Uint8Array(compressed[i].data);
    fullArray.set(src, entries[i].offset);
  }

  return woffBuf;
}

export default function FontConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [fontMeta, setFontMeta] = useState<FontMeta | null>(null);
  const [outputFormat, setOutputFormat] = useState<FontFormat>('ttf');
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState('The quick brown fox jumps over the lazy dog 1234567890');
  const [parsedFont, setParsedFont] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const outputUrlRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    if (outputUrlRef.current) {
      URL.revokeObjectURL(outputUrlRef.current);
      outputUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  useEffect(() => {
    if (!parsedFont || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    try {
      const size = Math.min(48, Math.max(14, 800 / Math.max(previewText.length, 1)));
      const path = parsedFont.getPath(previewText, 16, 80, size);
      path.fill = '#18181b';
      path.draw(ctx);
    } catch {
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '16px sans-serif';
      ctx.fillText('Preview not available for this font format', 16, 80);
    }
  }, [parsedFont, previewText]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    cleanup();
    setFile(f);
    setOutputUrl(null);
    setFontMeta(null);
    setParsedFont(null);
    setIsProcessing(true);
    try {
      const arrayBuffer = await f.arrayBuffer();
      const opentypeModule: any = await import('opentype.js');
      const font = opentypeModule.parse(arrayBuffer);
      setParsedFont(font);
      setFontMeta(parseFontMeta(font, f.size));
      toast.success('Font loaded successfully');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to parse font file. Try TTF, OTF, or WOFF format.'));
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  }, [cleanup]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    if (!INPUT_ACCEPT.includes(f.name.split('.').pop()?.toLowerCase() || '')) {
      toast.error('Please drop a valid font file (TTF, OTF, WOFF, WOFF2)');
      return;
    }
    cleanup();
    setFile(f);
    setOutputUrl(null);
    setFontMeta(null);
    setParsedFont(null);
    setIsProcessing(true);
    try {
      const arrayBuffer = await f.arrayBuffer();
      const opentypeModule: any = await import('opentype.js');
      const font = opentypeModule.parse(arrayBuffer);
      setParsedFont(font);
      setFontMeta(parseFontMeta(font, f.size));
      toast.success('Font loaded successfully');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to parse font file'));
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  }, [cleanup]);

  const handleConvert = useCallback(async () => {
    if (!parsedFont || !file) return;
    setIsConverting(true);
    try {
      let resultBuffer: ArrayBuffer;
      let ext: string;
      let mimeType: string;

      if (outputFormat === 'woff') {
        const rawBuf = adjustCheckSumAdjustment(parsedFont.toArrayBuffer());
        const flavor = new DataView(rawBuf).getUint32(0, false);
        resultBuffer = await buildWoff(rawBuf, flavor);
        ext = 'woff';
        mimeType = 'font/woff';
      } else {
        resultBuffer = parsedFont.toArrayBuffer();
        ext = outputFormat;
        mimeType = outputFormat === 'otf' ? 'font/otf' : 'font/ttf';
      }

      cleanup();
      const blob = new Blob([resultBuffer], { type: mimeType });
      const url = URL.createObjectURL(blob);
      outputUrlRef.current = url;
      setOutputUrl(url);

      const baseName = file.name.replace(/\.[^.]+$/, '');
      toast.success(`${baseName}.${ext} ready for download`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Conversion failed'));
    } finally {
      setIsConverting(false);
    }
  }, [parsedFont, file, outputFormat, cleanup]);

  const handleDownload = useCallback(async () => {
    if (!outputUrl || !file) return;
    const baseName = file.name.replace(/\.[^.]+$/, '');
    await downloadOrShare(outputUrl, `${baseName}.${outputFormat}`);
  }, [outputUrl, file, outputFormat]);

  const inputFormat = file?.name.split('.').pop()?.toLowerCase() || '';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-sm space-y-1">
        <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-500" />
          Font Converter
        </h4>
        <p className="text-zinc-600 dark:text-[var(--text-muted)]">
          Convert fonts between TTF, OTF, WOFF, and WOFF2 formats. Perfect for web developers and designers.
        </p>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl p-6 space-y-5">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
        >
          <input ref={fileInputRef} type="file" accept={INPUT_ACCEPT} onChange={handleFileChange} className="hidden" />
          <Upload className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3" />
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            {file ? file.name : 'Click or drag a font file here'}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Supports TTF, OTF, WOFF, WOFF2</p>
        </div>

        {isProcessing && (
          <div className="flex items-center justify-center gap-2 text-sm text-[var(--text-secondary)]">
            <Loader2 className="w-4 h-4 animate-spin" />
            Parsing font...
          </div>
        )}

        {fontMeta && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[var(--bg-overlay)] rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
            <div>
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block">Family</span>
              <span className="text-sm font-medium text-[var(--text-primary)] truncate block">{fontMeta.familyName}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block">Style</span>
              <span className="text-sm font-medium text-[var(--text-primary)]">{fontMeta.style}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block">Glyphs</span>
              <span className="text-sm font-medium text-[var(--text-primary)]">{fontMeta.glyphCount.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block">Size</span>
              <span className="text-sm font-medium text-[var(--text-primary)]">{fontMeta.fileSize}</span>
            </div>
          </div>
        )}

        {parsedFont && (
          <>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">Input Format</label>
                <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--text-primary)]">
                  {inputFormat.toUpperCase()}
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[var(--text-muted)] mt-6" />
              <div className="flex-1">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">Output Format</label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value as FontFormat)}
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none cursor-pointer"
                >
                  {OUTPUT_FORMATS.map((fmt) => (
                    <option key={fmt.value} value={fmt.value}>{fmt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleConvert}
              disabled={isConverting}
              className="w-full px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:bg-indigo-600/50 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
            >
              {isConverting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Converting...</>
              ) : (
                <><Download className="w-4 h-4" /> Convert to {outputFormat.toUpperCase()}</>
              )}
            </button>

            {outputUrl && (
              <button
                onClick={handleDownload}
                className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download {file?.name?.replace(/\.[^.]+$/, '')}.{outputFormat}
              </button>
            )}
          </>
        )}
      </div>

      {parsedFont && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5 text-[var(--accent)]" />
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Font Preview</h3>
          </div>
          <input
            type="text"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="Type sample text here..."
            className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none"
          />
          <div className="bg-white border border-[var(--border-subtle)] rounded-xl overflow-hidden">
            <canvas ref={canvasRef} width={760} height={160} className="w-full h-auto" />
          </div>
        </div>
      )}
    </div>
  );
}

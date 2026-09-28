"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { fetchFile } from '@ffmpeg/util';
import { createDownloadBlob } from '@/utils/blob';


type FormatDef = {
  ext: string;
  mime: string;
  name: string;
  label: string;
  accept: string;
};

const FORMATS: Record<string, FormatDef> = {
  mkv: { ext: '.mkv', mime: 'video/x-matroska', name: 'MKV', label: '.MKV', accept: '.mkv,video/x-matroska' },
  mp4: { ext: '.mp4', mime: 'video/mp4', name: 'MP4', label: '.MP4', accept: '.mp4,video/mp4' },
  mov: { ext: '.mov', mime: 'video/quicktime', name: 'MOV', label: '.MOV', accept: '.mov,video/quicktime' },
  webm: { ext: '.webm', mime: 'video/webm', name: 'WebM', label: '.WEBM', accept: '.webm,video/webm' },
  avi: { ext: '.avi', mime: 'video/x-msvideo', name: 'AVI', label: '.AVI', accept: '.avi,video/x-msvideo' },
};

type FormatPair = {
  slug: string;
  input: string;
  output: string;
  label: string;
};

const FORMAT_PAIRS: FormatPair[] = [
  { slug: 'mkv-to-mp4', input: 'mkv', output: 'mp4', label: 'MKV \u2192 MP4' },
  { slug: 'mov-to-mp4', input: 'mov', output: 'mp4', label: 'MOV \u2192 MP4' },
  { slug: 'webm-to-mp4', input: 'webm', output: 'mp4', label: 'WebM \u2192 MP4' },
  { slug: 'avi-to-mp4', input: 'avi', output: 'mp4', label: 'AVI \u2192 MP4' },
  { slug: 'mp4-to-mkv', input: 'mp4', output: 'mkv', label: 'MP4 \u2192 MKV' },
  { slug: 'mp4-to-mov', input: 'mp4', output: 'mov', label: 'MP4 \u2192 MOV' },
  { slug: 'mkv-to-mov', input: 'mkv', output: 'mov', label: 'MKV \u2192 MOV' },
  { slug: 'mov-to-mkv', input: 'mov', output: 'mkv', label: 'MOV \u2192 MKV' },
  { slug: 'mkv-to-webm', input: 'mkv', output: 'webm', label: 'MKV \u2192 WebM' },
  { slug: 'mkv-to-avi', input: 'mkv', output: 'avi', label: 'MKV \u2192 AVI' },
  { slug: 'mp4-to-webm', input: 'mp4', output: 'webm', label: 'MP4 \u2192 WebM' },
  { slug: 'mp4-to-avi', input: 'mp4', output: 'avi', label: 'MP4 \u2192 AVI' },
  { slug: 'mov-to-webm', input: 'mov', output: 'webm', label: 'MOV \u2192 WebM' },
  { slug: 'mov-to-avi', input: 'mov', output: 'avi', label: 'MOV \u2192 AVI' },
  { slug: 'webm-to-mkv', input: 'webm', output: 'mkv', label: 'WebM \u2192 MKV' },
  { slug: 'webm-to-mov', input: 'webm', output: 'mov', label: 'WebM \u2192 MOV' },
  { slug: 'webm-to-avi', input: 'webm', output: 'avi', label: 'WebM \u2192 AVI' },
  { slug: 'avi-to-mkv', input: 'avi', output: 'mkv', label: 'AVI \u2192 MKV' },
  { slug: 'avi-to-mov', input: 'avi', output: 'mov', label: 'AVI \u2192 MOV' },
  { slug: 'avi-to-webm', input: 'avi', output: 'webm', label: 'AVI \u2192 WebM' },
];

export const DESCRIPTIONS: Record<string, string> = {
  'video-converter': "Convert between MKV, MP4, MOV, WebM, and AVI video formats.",
  'mkv-to-mp4': "<strong>MKV to MP4 Converter:</strong> Re-encapsulates Matroska (.mkv) video files into the more universally compatible MP4 container without re-encoding the underlying video stream. Your files never leave your device.",
  'mov-to-mp4': "<strong>Apple QuickTime Converter:</strong> Transcode QuickTime .MOV files (usually from iPhones or Macs) into universal MP4 format optimized for web playback and social media uploads. Your files never leave your device.",
  'webm-to-mp4': "<strong>WEBM to MP4 Converter:</strong> Transcode modern WebM videos (often from screen recorders or web exports) into universal MP4 files. Critical for users whose editing software or sharing platforms reject WebM. Your files never leave your device.",
  'avi-to-mp4': "<strong>AVI to MP4 Converter:</strong> Upgrade your old AVI video files into modern universal MP4 format with H.264 encoding for drastically smaller file sizes. Perfect for archiving and compatibility. Your files never leave your device.",
  'mp4-to-mkv': "<strong>MP4 to MKV Converter:</strong> Re-encapsulates MP4 video files into the versatile MKV container format without re-encoding. MKV supports advanced subtitle tracks, chapter markers, and multiple audio streams. Your files never leave your device.",
  'mp4-to-mov': "<strong>MP4 to MOV Converter:</strong> Convert MP4 video files to QuickTime MOV format while preserving quality. Ideal for Apple ecosystem workflows including Final Cut Pro, iMovie, and macOS QuickTime Player. Your files never leave your device.",
  'mkv-to-mov': "<strong>MKV to MOV Converter:</strong> Transcode Matroska MKV files into QuickTime MOV format for seamless editing in macOS applications. Perfect when you have high-quality MKV files but need to work in Final Cut Pro or iMovie. Your files never leave your device.",
  'mov-to-mkv': "<strong>MOV to MKV Converter:</strong> Convert QuickTime MOV videos into the open-source MKV container format. MKV offers broader codec support, embedded subtitles, and chapter markers — perfect for media archiving. Your files never leave your device.",
  'mkv-to-webm': "<strong>MKV to WebM Converter:</strong> Convert Matroska MKV files into WebM format for modern web-optimized video format for streaming. Your files never leave your device.",
  'mkv-to-avi': "<strong>MKV to AVI Converter:</strong> Convert Matroska MKV files into AVI format for legacy video format compatibility. Your files never leave your device.",
  'mp4-to-webm': "<strong>MP4 to WebM Converter:</strong> Convert MP4 files into WebM format for modern web-optimized video format for streaming. Your files never leave your device.",
  'mp4-to-avi': "<strong>MP4 to AVI Converter:</strong> Convert MP4 files into AVI format for legacy video format compatibility. Your files never leave your device.",
  'mov-to-webm': "<strong>MOV to WebM Converter:</strong> Convert QuickTime MOV files into WebM format for modern web-optimized video format for streaming. Your files never leave your device.",
  'mov-to-avi': "<strong>MOV to AVI Converter:</strong> Convert QuickTime MOV files into AVI format for legacy video format compatibility. Your files never leave your device.",
  'webm-to-mkv': "<strong>WebM to MKV Converter:</strong> Convert WebM files into MKV format for versatile video container with advanced subtitle and chapter support. Your files never leave your device.",
  'webm-to-mov': "<strong>WebM to MOV Converter:</strong> Convert WebM files into QuickTime MOV format for Apple ecosystem editing and playback compatibility. Your files never leave your device.",
  'webm-to-avi': "<strong>WebM to AVI Converter:</strong> Convert WebM files into AVI format for legacy video format compatibility. Your files never leave your device.",
  'avi-to-mkv': "<strong>AVI to MKV Converter:</strong> Convert AVI files into MKV format for versatile video container with advanced subtitle and chapter support. Your files never leave your device.",
  'avi-to-mov': "<strong>AVI to MOV Converter:</strong> Convert AVI files into QuickTime MOV format for Apple ecosystem editing and playback compatibility. Your files never leave your device.",
  'avi-to-webm': "<strong>AVI to WebM Converter:</strong> Convert AVI files into WebM format for modern web-optimized video format for streaming. Your files never leave your device.",
};

const RELATED: Record<string, string[]> = {
  'mkv-to-mp4': ['mov-to-mp4', 'webm-to-mp4', 'avi-to-mp4', 'mp4-to-mkv'],
  'mov-to-mp4': ['mkv-to-mp4', 'webm-to-mp4', 'avi-to-mp4', 'mp4-to-mov'],
  'webm-to-mp4': ['mkv-to-mp4', 'mov-to-mp4', 'avi-to-mp4', 'mp4-to-mkv'],
  'avi-to-mp4': ['mkv-to-mp4', 'mov-to-mp4', 'webm-to-mp4', 'mp4-to-mkv'],
  'mp4-to-mkv': ['mkv-to-mp4', 'mov-to-mkv', 'mp4-to-mov'],
  'mp4-to-mov': ['mov-to-mp4', 'mkv-to-mov', 'mp4-to-mkv'],
  'mkv-to-mov': ['mkv-to-mp4', 'mov-to-mkv', 'mp4-to-mov'],
  'mov-to-mkv': ['mkv-to-mp4', 'mov-to-mp4', 'mkv-to-mov'],
  'mkv-to-webm': ['mkv-to-mp4', 'webm-to-mkv', 'mp4-to-webm'],
  'mkv-to-avi': ['mkv-to-mp4', 'avi-to-mkv', 'mp4-to-avi'],
  'mp4-to-webm': ['mkv-to-webm', 'webm-to-mp4', 'mov-to-webm'],
  'mp4-to-avi': ['mkv-to-avi', 'avi-to-mp4', 'mov-to-avi'],
  'mov-to-webm': ['mov-to-mp4', 'webm-to-mov', 'mkv-to-webm'],
  'mov-to-avi': ['mov-to-mp4', 'avi-to-mov', 'mkv-to-avi'],
  'webm-to-mkv': ['webm-to-mp4', 'mkv-to-webm', 'mov-to-mkv'],
  'webm-to-mov': ['webm-to-mp4', 'mov-to-webm', 'mkv-to-mov'],
  'webm-to-avi': ['webm-to-mp4', 'avi-to-webm', 'mkv-to-avi'],
  'avi-to-mkv': ['avi-to-mp4', 'mkv-to-avi', 'webm-to-mkv'],
  'avi-to-mov': ['avi-to-mp4', 'mov-to-avi', 'webm-to-mov'],
  'avi-to-webm': ['avi-to-mp4', 'webm-to-avi', 'mkv-to-webm'],
};

function getFfmpegOutputArgs(outputKey: string): string[] {
  switch (outputKey) {
    case 'mp4':
      return ['-vcodec', 'libx264', '-crf', '23', '-preset', 'fast', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];
    case 'mkv':
      return ['-c:v', 'copy', '-c:a', 'copy'];
    case 'mov':
      return ['-vcodec', 'libx264', '-crf', '23', '-preset', 'fast', '-pix_fmt', 'yuv420p'];
    case 'webm':
      return ['-c:v', 'libvpx', '-crf', '10', '-b:v', '0', '-c:a', 'libvorbis'];
    case 'avi':
      return ['-vcodec', 'mpeg4', '-q:v', '5', '-c:a', 'libmp3lame'];
    default:
      return ['-vcodec', 'libx264', '-crf', '23', '-preset', 'fast', '-pix_fmt', 'yuv420p'];
  }
}

type VideoFormatConverterProps = {
  slug: string;
};

function resolveSlug(input: string, output: string): string {
  return `${input}-to-${output}`;
}

const FORMAT_KEYS = Object.keys(FORMATS);

export default function VideoFormatConverter({ slug }: VideoFormatConverterProps) {
  const { ffmpeg, isLoaded, isLoading, progress, loadError, loadFFmpeg } = useFFmpeg();
  const description = DESCRIPTIONS[slug];

  const initialPair = useMemo(() => FORMAT_PAIRS.find(p => p.slug === slug) || FORMAT_PAIRS[0]!, [slug]);

  const [inputKey, setInputKey] = useState<string>(initialPair.input);
  const [outputKey, setOutputKey] = useState<string>(initialPair.output);
  const [file, setFile] = useState<File | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const inputFmt = FORMATS[inputKey]!;
  const outputFmt = FORMATS[outputKey]!;

  useEffect(() => {
    loadFFmpeg();
  }, []);

  // Merge-redirect intent preservation: /converter/avi-to-mp4/ lands here as
  // /converter/video-converter/?from=avi — preselect the visitor's format.
  useEffect(() => {
    try {
      const from = new URLSearchParams(window.location.search).get("from");
      if (from && FORMATS[from]) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-time URL hydration for redirect intent
        setInputKey(from);
      }
    } catch {
      /* non-browser or malformed query — keep defaults */
    }
  }, []);

  const swapFormats = () => {
    setInputKey(outputKey);
    setOutputKey(inputKey);
    setFile(null);
    setOutputUrl(null);
    setOutputSize(null);
  };

  const handleFormatChange = (role: "input" | "output", value: string) => {
    if (role === "input") {
      setInputKey(value);
    } else {
      setOutputKey(value);
    }
    setFile(null);
    setOutputUrl(null);
    setOutputSize(null);
  };

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith(inputFmt.ext)) {
      toast.error(`Please upload a ${inputFmt.ext} file.`);
      return;
    }
    setFile(selectedFile);
    setOutputUrl(null);
    setOutputSize(null);
  };

  const clearAll = () => {
    setFile(null);
    setOutputUrl(null);
    setOutputSize(null);
  };

  const convertVideo = async () => {
    if (!file || !ffmpeg || !isLoaded) return;

    setIsProcessing(true);
    try {
      await ffmpeg.writeFile(`input${inputFmt.ext}`, await fetchFile(file));

      const outputArgs = getFfmpegOutputArgs(outputKey);
      await ffmpeg.exec([
        '-i', `input${inputFmt.ext}`,
        ...outputArgs,
        `output${outputFmt.ext}`
      ]);

      const data = await ffmpeg.readFile(`output${outputFmt.ext}`);
      const mimeType = outputFmt.ext === '.mp4' ? 'video/mp4' : 'application/octet-stream';
      const blob = createDownloadBlob(data, mimeType);

      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      setOutputSize(blob.size);
      toast.success(`Converted ${inputFmt.name} to ${outputFmt.name} successfully!`);
    } catch (e) {
      console.error(e);
      toast.error("An error occurred during conversion.");
    } finally {
      setIsProcessing(false);
    }
  };

  const related = useMemo(() => {
    if (inputKey && outputKey) {
      const s = resolveSlug(inputKey, outputKey);
      return RELATED[s] || [];
    }
    return [];
  }, [inputKey, outputKey]);

  if (!isLoaded) {
    if (loadError) {
      return (
        <div className="flex flex-col items-center justify-center p-12 space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          </div>
          <p className="text-red-500 font-medium">Failed to load video engine</p>
          <p className="text-xs text-[var(--text-muted)] max-w-sm">{loadError}</p>
          <button onClick={loadFFmpeg} className="px-4 py-2 bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white text-sm font-medium rounded-xl transition-colors">
            Retry
          </button>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <svg className="w-12 h-12 text-[var(--accent)] animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-[var(--text-secondary)] font-medium animate-pulse">Initializing WebAssembly Core...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <select
          value={inputKey}
          onChange={(e) => handleFormatChange("input", e.target.value)}
          aria-label="Input format"
          className="px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50 appearance-none cursor-pointer"
        >
          {FORMAT_KEYS.map(k => (
            <option key={k} value={k}>{FORMATS[k]!.name} ({FORMATS[k]!.ext})</option>
          ))}
        </select>

        <button
          onClick={swapFormats}
          className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] transition-all active:scale-95"
          aria-label="Swap formats"
        >
          <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>

        <select
          value={outputKey}
          onChange={(e) => handleFormatChange("output", e.target.value)}
          aria-label="Output format"
          className="px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50 appearance-none cursor-pointer"
        >
          {FORMAT_KEYS.map(k => (
            <option key={k} value={k}>{FORMATS[k]!.name} ({FORMATS[k]!.ext})</option>
          ))}
        </select>
      </div>

      {description && (
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm" dangerouslySetInnerHTML={{ __html: description }} />
      )}

      {!file ? (
        <FileUploader
          accept={inputFmt.accept}
          onFileSelect={handleFileSelect}
          title={`Upload ${inputFmt.name} Video`}
          subtitle={`Select a ${inputFmt.ext} file to convert to ${outputFmt.name}`}
        />
      ) : (
        <div className="space-y-8">
          <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
            <div>
              <h3 className="font-bold text-[var(--text-primary)]">{file.name}</h3>
              <p className="text-[var(--text-secondary)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button
              onClick={clearAll}
              disabled={isProcessing}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg disabled:opacity-50"
            >
              Change File
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6 h-fit flex flex-col justify-center">
              <div className="text-center space-y-4">
                <div className="flex justify-center items-center gap-4 text-[var(--text-muted)]">
                  <div className="bg-[var(--bg-surface)] p-4 rounded-2xl">
                    <span className="font-black text-xl text-[var(--text-primary)]">{inputFmt.label}</span>
                  </div>
                  <svg className="w-8 h-8 text-[var(--accent)] animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  <div className="bg-[var(--bg-surface)] p-4 rounded-2xl border-2 border-[var(--accent)]/30">
                    <span className="font-black text-xl text-[var(--accent)]">{outputFmt.label}</span>
                  </div>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">Video will be converted to {outputFmt.name} format.</p>
              </div>

              <div className="pt-4 border-t border-[var(--border-subtle)]">
                {isProcessing ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-[var(--accent)]">
                      <span>Converting...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-blue-100 dark:bg-[var(--accent)]/10 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-[var(--accent-ink)] h-3 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={convertVideo}
                    className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    Convert to {outputFmt.name}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {outputUrl ? (
                <div className="space-y-6 animate-in zoom-in-95 duration-300">
                  <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                    <h4 className="font-bold text-emerald-500">Conversion Complete</h4>
                  </div>

                  <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-inner flex flex-col items-center justify-center relative">
                    <video src={outputUrl} controls className="w-full max-h-[250px]" />
                  </div>

                  {outputSize && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">File Size:</span>
                      <span className="font-bold text-emerald-500">{(outputSize / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  )}

                  <button
                    onClick={() => downloadOrShare(outputUrl, `${file!.name.replace(/\.[^/.]+$/, "")}${outputFmt.ext}`)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download {outputFmt.name}
                  </button>
                </div>
              ) : (
                <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-[var(--text-muted)]">
                  <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  <p className="text-center text-sm px-4">Your {outputFmt.name} video will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div className="pt-6 border-t border-[var(--border-subtle)]">
          <p className="text-sm text-[var(--text-secondary)] mb-3 font-medium">Also popular:</p>
          <div className="flex flex-wrap gap-2">
            {related.map(s => {
              const p = FORMAT_PAIRS.find(fp => fp.slug === s);
              if (!p) return null;
              return (
                <Link
                  key={s}
                  href={`/converter/${s}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-blue-50 dark:hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] dark:hover:text-blue-400 transition-all"
                >
                  {p.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

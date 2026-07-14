"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { FileUploader } from '../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { fetchFile } from '@ffmpeg/util';

interface FormatConfig {
  ext: string;
  mime: string;
  label: string;
  name: string;
  description: string;
}

const FORMATS: Record<string, FormatConfig> = {
  mkv: { ext: 'mkv', mime: 'video/x-matroska', label: 'MKV', name: 'Matroska', description: 'Matroska video container' },
  mov: { ext: 'mov', mime: 'video/quicktime', label: 'MOV', name: 'QuickTime', description: 'Apple QuickTime video' },
  webm: { ext: 'webm', mime: 'video/webm', label: 'WEBM', name: 'WebM', description: 'WebM video format' },
  avi: { ext: 'avi', mime: 'video/x-msvideo', label: 'AVI', name: 'AVI', description: 'Legacy AVI container' },
  mp4: { ext: 'mp4', mime: 'video/mp4', label: 'MP4', name: 'MP4', description: 'Universal MP4 video' },
};

const VIDEO_INPUTS = ['mkv', 'mov', 'webm', 'avi', 'mp4'];
const VIDEO_OUTPUTS = ['mp4', 'webm', 'mov', 'avi'];

interface VideoConverterProps {
  defaultInput?: string;
  defaultOutput?: string;
}

export default function VideoConverter({ defaultInput = 'mkv', defaultOutput = 'mp4' }: VideoConverterProps) {
  const { ffmpeg, isLoaded, isLoading, progress, loadFFmpeg } = useFFmpeg();

  const [file, setFile] = useState<File | null>(null);
  const [inputFormat, setInputFormat] = useState(defaultInput);
  const [outputFormat, setOutputFormat] = useState(defaultOutput);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadFFmpeg();
  }, []);

  useEffect(() => {
    setInputFormat(defaultInput);
    setOutputFormat(defaultOutput);
  }, [defaultInput, defaultOutput]);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const handleFileSelect = (selectedFile: File) => {
    const parts = selectedFile.name.split('.');
    const detected = parts.length > 1 ? parts.pop()?.toLowerCase() : '';
    if (detected && detected !== inputFormat && VIDEO_INPUTS.includes(detected)) {
      setInputFormat(detected);
    } else if (detected && detected !== inputFormat) {
      toast.error(`Please upload a ${VIDEO_INPUTS.map(f => `.${f}`).join(', ')} file (detected .${detected}).`);
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

  const swapFormats = useCallback(() => {
    const tmp = inputFormat;
    setInputFormat(outputFormat);
    setOutputFormat(tmp);
    setFile(null);
    setOutputUrl(null);
    setOutputSize(null);
  }, [inputFormat, outputFormat]);

  const convertVideo = async () => {
    if (!file || !ffmpeg || !isLoaded) return;

    setIsProcessing(true);
    try {
      await ffmpeg.writeFile(`input.${inputFormat}`, await fetchFile(file));

      const outputExt = outputFormat;
      const codec = outputExt === 'webm' ? 'libvpx' : outputExt === 'avi' ? 'mpeg4' : 'libx264';
      const pixFmt = outputExt === 'webm' ? 'yuv420p' : 'yuv420p';
      await ffmpeg.exec([
        '-i', `input.${inputFormat}`,
        '-vcodec', codec,
        '-crf', '23',
        '-preset', 'fast',
        '-pix_fmt', pixFmt,
        `output.${outputExt}`
      ]);

      const data = await ffmpeg.readFile(`output.${outputExt}`);
      const mimeMap: Record<string, string> = { mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime', avi: 'video/x-msvideo' };
      const blob = new Blob([data as any], { type: mimeMap[outputExt] || 'video/mp4' });

      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      setOutputSize(blob.size);
      toast.success(`Converted ${inputFormat.toUpperCase()} to ${outputFormat.toUpperCase()} successfully!`);
    } catch (e) {
      console.error(e);
      toast.error("An error occurred during conversion.");
    } finally {
      setIsProcessing(false);
    }
  };

  const inConfig = FORMATS[inputFormat];
  const outConfig = FORMATS[outputFormat];

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <svg className="w-12 h-12 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-zinc-500 font-medium animate-pulse">Initializing WebAssembly Core...</p>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="flex items-center gap-2 mb-4">
          <select
            value={inputFormat}
            onChange={(e) => { setInputFormat(e.target.value); setFile(null); setOutputUrl(null); }}
            className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm font-mono"
          >
            {VIDEO_INPUTS.map(f => <option key={f} value={f}>.{f.toUpperCase()}</option>)}
          </select>
          <button
            onClick={swapFormats}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Swap formats"
          >
            <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
            className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm font-mono"
          >
            {VIDEO_OUTPUTS.map(f => <option key={f} value={f}>.{f.toUpperCase()}</option>)}
          </select>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-500 text-sm">
          <strong>{inConfig?.name} to {outConfig?.name} Converter:</strong> Convert {inConfig?.description} files into {outConfig?.description} format securely inside your browser. No files are uploaded.
        </div>
        <FileUploader
          accept={inConfig?.mime || `.${inputFormat}`}
          onFileSelect={handleFileSelect}
          title={`Upload ${inConfig?.label} Video`}
          subtitle={`Select a .${inputFormat} file to convert`}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-white/5">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <button
          onClick={clearAll}
          disabled={isProcessing}
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg disabled:opacity-50"
        >
          Change File
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Settings Panel */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-6 h-fit flex flex-col justify-center">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <select
                value={inputFormat}
                onChange={(e) => { setInputFormat(e.target.value); setFile(null); setOutputUrl(null); }}
                className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs font-mono"
              >
                {VIDEO_INPUTS.map(f => <option key={f} value={f}>.{f.toUpperCase()}</option>)}
              </select>
              <button
                onClick={swapFormats}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Swap formats"
              >
                <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs font-mono"
              >
                {VIDEO_OUTPUTS.map(f => <option key={f} value={f}>.{f.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="flex justify-center items-center gap-4 text-zinc-400">
              <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-2xl">
                <span className="font-black text-xl text-zinc-800 dark:text-zinc-200">.{inputFormat.toUpperCase()}</span>
              </div>
              <svg className="w-8 h-8 text-blue-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-2xl border-2 border-blue-500/30">
                <span className="font-black text-xl text-blue-500">.{outputFormat.toUpperCase()}</span>
              </div>
            </div>
            <p className="text-sm text-zinc-500">Video will be converted to H.264 {outputFormat.toUpperCase()} format for maximum device compatibility.</p>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
            {isProcessing ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-blue-500">
                  <span>Converting...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <button
                onClick={convertVideo}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Convert to {outputFormat.toUpperCase()}
              </button>
            )}
          </div>
        </div>

        {/* Output Panel */}
        <div className="space-y-6">
          {outputUrl ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <h4 className="font-bold text-emerald-500">Conversion Complete</h4>
              </div>

              <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-inner flex flex-col items-center justify-center relative">
                <video src={outputUrl} controls className="w-full max-h-[250px]" />
              </div>

              {outputSize && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">File Size:</span>
                  <span className="font-bold text-emerald-500">{(outputSize / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              )}

              <button
                onClick={() => downloadOrShare(outputUrl, `${file.name.replace(/\.[^/.]+$/, "")}.${outputFormat}`)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download {outputFormat.toUpperCase()}
              </button>
            </div>
          ) : (
            <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-zinc-400">
              <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              <p className="text-center text-sm px-4">Your converted video will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

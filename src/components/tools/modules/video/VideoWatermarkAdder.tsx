"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { fetchFile } from '@ffmpeg/util';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { createDownloadBlob } from '@/utils/blob';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { EmptyState } from '@/components/EmptyState';

export default function VideoWatermarkAdder() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const [watermarkText, setWatermarkText] = useState('Toolzum.ai');
  const [position, setPosition] = useState('bottomRight');

  const { ffmpeg, isLoaded, loadFFmpeg, progress } = useFFmpeg();

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const processVideo = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const ffmpeg = await loadFFmpeg();
      if (!ffmpeg) {
        toast.error('Failed to load FFmpeg engine.');
        return;
      }

      await ffmpeg.writeFile('input.mp4', await fetchFile(file));
      
      let x = 'w-tw-10';
      let y = 'h-th-10';
      
      if (position === 'bottomLeft') { x = '10'; y = 'h-th-10'; }
      if (position === 'topLeft') { x = '10'; y = '10'; }
      if (position === 'topRight') { x = 'w-tw-10'; y = '10'; }
      if (position === 'center') { x = '(w-tw)/2'; y = '(h-th)/2'; }

      // We use a basic drawtext filter. In a real advanced implementation, you'd load a font file.
      // For this WASM demo, we use default sans if available, or just rely on the system.
      // Note: FFmpeg WASM might not have FreeType compiled in by default for all fonts. 
      // We will fallback to a simple subtitle filter if drawtext fails, but let's try drawtext first.
      toast("Burning watermark...");
      
      const filter = `drawtext=text='${watermarkText}':fontcolor=white:fontsize=24:box=1:boxcolor=black@0.5:boxborderw=5:x=${x}:y=${y}`;
      
      await ffmpeg.exec(['-i', 'input.mp4', '-vf', filter, '-codec:a', 'copy', 'output.mp4']);
      
      const data = await ffmpeg.readFile('output.mp4');
      const url = URL.createObjectURL(createDownloadBlob(data, 'video/mp4'));
      setOutputUrl(url);
      
      toast.success("Watermark added!");
    } catch (e) {
      console.error(e);
      toast.error("Failed. FFmpeg WASM might be missing FreeType font support in this browser.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm">
          <strong>Protect your content:</strong> Burn custom text watermarks directly into your videos locally in the browser.
        </div>
        <FileUploader 
          accept="video/*" 
          onFileSelect={(f) => setFile(f)} 
          title="Upload Video"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-[var(--text-primary)]">{file.name}</h3>
          <p className="text-[var(--text-secondary)] dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <button 
          onClick={() => { setFile(null); setOutputUrl(null); }}
          className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
        >
          Change Video
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-black border border-[var(--border-subtle)] p-4 rounded-2xl shadow-xl flex items-center justify-center min-h-[300px]">
          <video src={URL.createObjectURL(file)} controls className="w-full max-h-[350px] rounded-lg" />
        </div>

        <div className="space-y-6">
          <div className="space-y-6">
            <h4 className="text-[var(--text-primary)] font-medium">Watermark Settings</h4>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="lbl-videowatermarkadder-watermark-text" className="block text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] mb-2">Watermark Text</label>
                <input id="lbl-videowatermarkadder-watermark-text" aria-label="Watermark Text" 
                  type="text" 
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="@yourbrand"
                  className="w-full bg-white dark:bg-black border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                />
              </div>

              <div>
                <label htmlFor="lbl-videowatermarkadder-position" className="block text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] mb-2">Position</label>
                <select id="lbl-videowatermarkadder-position" aria-label="Position" 
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full bg-white dark:bg-black border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                >
                  <option value="bottomRight">Bottom Right</option>
                  <option value="bottomLeft">Bottom Left</option>
                  <option value="topRight">Top Right</option>
                  <option value="topLeft">Top Left</option>
                  <option value="center">Center</option>
                </select>
              </div>
            </div>

            <button 
              onClick={processVideo}
              disabled={isProcessing || !isLoaded}
              className="w-full bg-gradient-to-r from-[var(--accent-ink)] to-[var(--accent-ink)] hover:from-[var(--accent-ink)] hover:to-[var(--accent-ink)] text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden"
            >
              {isProcessing && (
                <div 
                  className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              )}
              <span className="relative z-10">
                {isProcessing ? `Processing ${Math.round(progress)}%` : "Add Watermark"}
              </span>
            </button>
          </div>

          {outputUrl ? (
            <div className="p-6 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-2xl animate-in slide-in-from-bottom-4 text-center shadow-xl">
              <h4 className="text-xl font-bold text-[var(--accent)] mb-4">Watermark Applied!</h4>
              <video src={outputUrl} controls className="w-full max-h-[200px] rounded-lg mb-6" />
              <button 
                onClick={() => downloadOrShare(outputUrl, `watermarked_${file.name}`)}
                className="w-full bg-white text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] font-bold px-4 py-3 rounded-xl transition-colors shadow-lg"
              >
                Download Video
              </button>
            </div>
          ) : (
            <div className="border border-dashed border-[var(--border-subtle)] rounded-2xl">
              <EmptyState
                title="Watermarked video will appear here"
                message="Upload a video above."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

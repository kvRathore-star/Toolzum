"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Upload, Download, RefreshCw, Type, Image as ImageIcon, Sliders } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

interface MemeTemplate {
  name: string;
  url: string;
}

const POPULAR_TEMPLATES: MemeTemplate[] = [
  { name: 'Drake Hotline Bling', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop' },
  { name: 'Distracted Boyfriend', url: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=600&auto=format&fit=crop' },
  { name: 'Two Buttons', url: 'https://images.unsplash.com/photo-1598128558393-70ff21433be0?w=600&auto=format&fit=crop' },
  { name: 'Change My Mind', url: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=600&auto=format&fit=crop' },
];

export default function MemeGenerator() {
  const [templateUrl, setTemplateUrl] = useState<string>(POPULAR_TEMPLATES[0].url);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [topText, setTopText] = useState('WRITE CODES');
  const [bottomText, setBottomText] = useState('NO BUGS ALLOWED');
  const [fontSize, setFontSize] = useState<number>(36);
  const [uppercase, setUppercase] = useState(true);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const currentImageSrc = customImage || templateUrl;

  useEffect(() => {
    if (currentImageSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Prevent tainted canvas issues for external urls
      img.onload = () => {
        imageRef.current = img;
        drawMeme();
      };
      img.src = currentImageSrc;
    }
  }, [currentImageSrc, topText, bottomText, fontSize, uppercase]);

  useEffect(() => {
    return () => {
      if (processedUrl) URL.revokeObjectURL(processedUrl);
    };
  }, [processedUrl]);

  const drawMeme = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Standard square constraints for meme layouts
    canvas.width = 600;
    canvas.height = 600;

    // Draw background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Text formatting
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(3, fontSize / 7);
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';
    ctx.font = `900 ${fontSize}px Impact, sans-serif`;

    const finalTopText = uppercase ? topText.toUpperCase() : topText;
    const finalBottomText = uppercase ? bottomText.toUpperCase() : bottomText;

    // Draw top text
    if (finalTopText) {
      ctx.textBaseline = 'top';
      ctx.strokeText(finalTopText, canvas.width / 2, 20, canvas.width - 40);
      ctx.fillText(finalTopText, canvas.width / 2, 20, canvas.width - 40);
    }

    // Draw bottom text
    if (finalBottomText) {
      ctx.textBaseline = 'bottom';
      ctx.strokeText(finalBottomText, canvas.width / 2, canvas.height - 20, canvas.width - 40);
      ctx.fillText(finalBottomText, canvas.width / 2, canvas.height - 20, canvas.width - 40);
    }

    // Save as blob
    canvas.toBlob((blob) => {
      if (blob) {
        if (processedUrl) URL.revokeObjectURL(processedUrl);
        setProcessedUrl(URL.createObjectURL(blob));
      }
    }, 'image/jpeg', 0.95);
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomImage(url);
      toast.success('Custom meme template loaded!');
    }
  };

  const handleDownload = () => {
    if (!processedUrl) return;
    downloadOrShare(processedUrl, 'meme.jpg');
  };

  const reset = () => {
    setCustomImage(null);
    setTemplateUrl(POPULAR_TEMPLATES[0].url);
    setTopText('WRITE CODES');
    setBottomText('NO BUGS ALLOWED');
    setFontSize(36);
    setUppercase(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-overlay)] p-6 border border-zinc-200 dark:border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-[var(--accent)]" />
          Classic Meme Generator
        </h2>
        <p className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] mt-1">
          Pick a classic template or upload your own, type top/bottom captions, adjust font settings, and download your customized meme instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Settings */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 max-h-[600px] overflow-y-auto pr-1">
          {/* Template Selector */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-[var(--text-secondary)] block">Meme Templates</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {POPULAR_TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  onClick={() => {
                    setTemplateUrl(t.url);
                    setCustomImage(null);
                  }}
                  className={`p-2 bg-[var(--bg-overlay)] hover:bg-zinc-100 dark:hover:bg-[var(--bg-elevated)] text-zinc-700 dark:text-[var(--text-muted)] border rounded-lg text-center truncate cursor-pointer ${
                    templateUrl === t.url && !customImage
                      ? 'border-indigo-500 bg-indigo-500/5 text-[var(--accent)] font-bold'
                      : 'border-[var(--border-subtle)]'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>

            <label className="w-full py-2.5 bg-zinc-100 dark:bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-zinc-700 dark:text-[var(--text-muted)] font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-200 dark:border-[var(--border-subtle)]">
              <Upload className="w-4 h-4" />
              Upload Custom Template
              <input type="file" accept="image/*" className="hidden" onChange={handleCustomUpload} />
            </label>
          </div>

          <h4 className="font-bold text-xs text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1 border-t border-[var(--border-subtle)] pt-4">
            <Type className="w-4 h-4 text-[var(--accent)]" />
            Captions
          </h4>

          {/* Top text */}
          <div className="space-y-1 text-xs">
            <span className="font-bold text-[var(--text-secondary)] uppercase block">Top Caption</span>
            <input
              type="text" value={topText} onChange={e => setTopText(e.target.value)}
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500 text-[var(--text-primary)]"
            />
          </div>

          {/* Bottom text */}
          <div className="space-y-1 text-xs">
            <span className="font-bold text-[var(--text-secondary)] uppercase block">Bottom Caption</span>
            <input
              type="text" value={bottomText} onChange={e => setBottomText(e.target.value)}
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500 text-[var(--text-primary)]"
            />
          </div>

          <h4 className="font-bold text-xs text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1 border-t border-[var(--border-subtle)] pt-4">
            <Sliders className="w-4 h-4 text-[var(--accent)]" />
            Styling Settings
          </h4>

          {/* Font Size */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[var(--text-secondary)] dark:text-[var(--text-muted)]">
              <span>Text Size</span>
              <span className="text-[var(--accent)] font-bold">{fontSize} px</span>
            </div>
            <input
              type="range" min="20" max="70" value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          {/* Uppercase toggle */}
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] dark:text-[var(--text-muted)]">
            <span>Force Uppercase Text</span>
            <input
              type="checkbox" checked={uppercase} onChange={e => setUppercase(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-300 text-[var(--accent)] focus:ring-indigo-500 accent-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={reset}
              className="w-full py-2.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Reset Meme Settings
            </button>
          </div>
        </div>

        {/* View Workspace */}
        <div className="lg:col-span-2 bg-zinc-950 border border-[var(--border-subtle)] rounded-2xl overflow-hidden min-h-[350px] flex flex-col justify-between p-6">
          <div className="flex-1 flex justify-center items-center relative">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[350px] object-contain border border-zinc-800 rounded-xl"
            />
          </div>

          <div className="w-full mt-6 h-12 flex justify-center">
            {processedUrl ? (
              <button
                onClick={handleDownload}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Download className="w-4 h-4" />
                Download Custom Meme
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] justify-center">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Loading template drawing canvas...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
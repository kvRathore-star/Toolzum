"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FileText, Download, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

export default function TextToHandwriting() {
  const [text, setText] = useState('This is a simulated handwritten note. Write your text here to convert it into a handwritten sheet format.');
  const [inkColor, setInkColor] = useState('#0018a8'); // Royal blue
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const drawHandwritingSheet = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Lined paper background
    ctx.fillStyle = '#fdfbf7'; // Cream paper background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Margin lines
    ctx.strokeStyle = '#f87171'; // Red margin line
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(80, 0);
    ctx.lineTo(80, canvas.height);
    ctx.stroke();

    // Draw Horizontal lines
    ctx.strokeStyle = '#bae6fd'; // Sky blue ruling lines
    ctx.lineWidth = 1;
    const lineHeight = 35;
    for (let y = 60; y < canvas.height; y += lineHeight) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Write text with handwritten font style simulation
    ctx.fillStyle = inkColor;
    ctx.font = 'italic 20px Georgia, "Times New Roman", serif'; // Georgia offers a clean italic writing style
    ctx.textBaseline = 'bottom';

    const words = text.split(' ');
    let line = '';
    let currentY = 58; // Start below first line margin
    const marginX = 100;
    const maxWidth = canvas.width - 50;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testXWidth(testWidth, marginX, maxWidth) && n > 0) {
        ctx.fillText(line, marginX, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
        if (currentY > canvas.height - 20) break; // page limit check
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, marginX, currentY);
  };

  const testXWidth = (width: number, start: number, max: number) => {
    return start + width > max;
  };

  useEffect(() => {
    drawHandwritingSheet();
  }, [text, inkColor]);

  const downloadSheet = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    downloadOrShare(url, 'handwritten_note.png');
    toast.success('Handwritten sheet downloaded!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-overlay)] p-5 border border-zinc-200 dark:border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-[var(--accent)]" />
          Text to Handwriting Canvas Sheet Generator
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Convert typed text transcripts into custom styled handwritten sheets of ruled paper offline.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs">
        {/* Input Controls */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase border-b border-zinc-800 pb-2">Configuration</h3>
          
          <textarea aria-label="Configuration"
            value={text}
            onChange={e => setText(e.target.value)}
            className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] h-48 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none"
          />

          <div className="space-y-1">
            <label className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Ink Color</label>
            <div className="flex bg-[var(--bg-overlay)] p-1 rounded-xl gap-1 max-w-xs">
              <button onClick={() => setInkColor('#0018a8')} className={`flex-1 py-1 rounded text-[10px] font-bold cursor-pointer ${inkColor === '#0018a8' ? 'bg-indigo-600 text-white shadow' : 'text-[var(--text-secondary)]'}`}>Blue</button>
              <button onClick={() => setInkColor('#09090b')} className={`flex-1 py-1 rounded text-[10px] font-bold cursor-pointer ${inkColor === '#09090b' ? 'bg-indigo-600 text-white shadow' : 'text-[var(--text-secondary)]'}`}>Black</button>
              <button onClick={() => setInkColor('#991b1b')} className={`flex-1 py-1 rounded text-[10px] font-bold cursor-pointer ${inkColor === '#991b1b' ? 'bg-indigo-600 text-white shadow' : 'text-[var(--text-secondary)]'}`}>Red</button>
            </div>
          </div>

          <button onClick={downloadSheet} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
            <Download className="w-4 h-4" /> Download Sheet (PNG)
          </button>
        </div>

        {/* Visual Sheet Preview */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl flex justify-center items-center overflow-hidden min-h-[300px]">
          <canvas 
            ref={canvasRef} 
            width={500} 
            height={600} 
            className="border border-zinc-300 dark:border-zinc-800 shadow-xl max-w-full rounded bg-[#fdfbf7]"
          />
        </div>
      </div>
    </div>
  );
}

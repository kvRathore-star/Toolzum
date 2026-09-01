"use client";
import { useState, useRef, useEffect } from 'react';
import { Copy, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';
import { Input } from './GeneratorsShared';

export default function RandomDecisionMaker() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState('Yes\nNo\nMaybe');
  const [choice, setChoice] = useState('');
  const [spinning, setSpinning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [history, setHistory] = useState<string[]>([]);

  const decide = () => {
    const items = options.split('\n').map(s => s.trim()).filter(Boolean);
    if (items.length === 0) return;
    setSpinning(true);
    setChoice('');
    let i = 0;
    const interval = setInterval(() => {
      setChoice(items[i % items.length]);
      i++;
      if (i > items.length * 5) {
        clearInterval(interval);
        setSpinning(false);
        const final = items[Math.floor(Math.random() * items.length)];
        setChoice(final);
        const label = question.trim() ? 'Q: ' + question + ' → ' + final : final;
        setHistory(prev => [label, ...prev].slice(0, 10));
      }
    }, 80);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !choice) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cx = canvas.width / 2, cy = canvas.height / 2, r = 70;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(choice, cx, cy);
  }, [choice]);

  const presets = [
    { label: 'Yes/No', apply: () => { setOptions('Yes\nNo'); } },
    { label: 'Yes/No/Maybe', apply: () => { setOptions('Yes\nNo\nMaybe'); } },
    { label: '3 Options', apply: () => { setOptions('Option A\nOption B\nOption C'); } },
    { label: 'Clear', apply: () => { setChoice(''); setHistory([]); } },
  ];

  const resultText = choice ? 'Decision: ' + choice : 'Enter options and decide';

  return (
    <CalculatorShell category="Utility"
      title="Random Decision Maker"
      result={resultText}
      auto={true}
      presets={presets}
      accent="amber"
      downloadData={JSON.stringify({ question, options: options.split('\n').map(s => s.trim()).filter(Boolean), decision: choice, history }, null, 2)}
      downloadFilename="decision.json"
    >
      <div className="space-y-4">
        <Input label="What are you deciding? (optional)" value={question} onChange={v => setQuestion(v)} placeholder="e.g. Should I go out tonight?" />
        <Input label="Options (one per line)" value={options} onChange={v => setOptions(v)} rows={5} />
        <button onClick={decide} disabled={spinning} className={'px-5 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg w-full sm:w-auto ' + (spinning ? 'opacity-60' : '')}>{spinning ? 'Spinning...' : 'Decide'}</button>

        <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-4 flex flex-col justify-center items-center min-h-[160px]">
          <canvas ref={canvasRef} width={160} height={160} className="max-w-full" />
          {choice && <button onClick={() => { clipboardWrite(choice); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors mt-3" aria-label="Copy choice"><Copy size={14} /></button>}
        </div>

        {history.length > 0 && (
          <div className="border-t border-[var(--border-subtle)] pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase">History</h4>
              <button onClick={() => setHistory([])} className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent)]"><RotateCcw size={12} /> Clear</button>
            </div>
            <div className="space-y-1">
              {history.map((h, i) => (
                <div key={i} className="p-2 bg-[var(--bg-surface)] rounded-lg text-xs text-[var(--text-secondary)]">{h}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}

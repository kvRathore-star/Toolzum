"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Target, ListPlus, Play, Trophy } from 'lucide-react';

export default function WheelOfNames() {
  const [names, setNames] = useState<string>('Alice\nBob\nCharlie\nDavid\nEve');
  const [winner, setWinner] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const nameList = names.split('\n').filter(n => n.trim() !== '');
  
  // Wheel State
  const [rotation, setRotation] = useState(0);
  
  const colors = [
    '#f43f5e', // Rose
    '#8b5cf6', // Violet
    '#0ea5e9', // Sky
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#6366f1', // Indigo
    '#14b8a6', // Teal
  ];

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const cw = canvas.width;
    const ch = canvas.height;
    const cx = cw / 2;
    const cy = ch / 2;
    const radius = Math.min(cx, cy) - 10;
    
    ctx.clearRect(0, 0, cw, ch);
    
    if (nameList.length === 0) {
      // Draw empty placeholder wheel
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#f4f4f5'; // zinc-100
      ctx.fill();
      ctx.strokeStyle = '#e4e4e7'; // zinc-200
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#a1a1aa'; // zinc-400
      ctx.font = '16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Add names to spin', cx, cy);
      return;
    }
    
    const arc = Math.PI * 2 / nameList.length;
    
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    
    for (let i = 0; i < nameList.length; i++) {
      const angle = i * arc;
      
      // Draw slice
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle, angle + arc);
      ctx.lineTo(0, 0);
      ctx.fillStyle = colors[i % colors.length]!;
      ctx.fill();
      ctx.stroke();
      
      // Draw text
      ctx.save();
      ctx.translate(Math.cos(angle + arc / 2) * (radius * 0.6), Math.sin(angle + arc / 2) * (radius * 0.6));
      ctx.rotate(angle + arc / 2);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Truncate long names
      let text: string = nameList[i]!;
      if (text.length > 12) text = text.substring(0, 10) + '...';
      
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#e4e4e7';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.restore();
  };

  useEffect(() => {
    drawWheel();
  }, [names, rotation]);

  const spinWheel = () => {
    if (nameList.length < 2 || isSpinning) return;
    
    setWinner(null);
    setIsSpinning(true);
    
    const spins = 5 + Math.random() * 5; // 5-10 extra spins
    const randomAngle = Math.random() * Math.PI * 2;
    const totalRotation = spins * Math.PI * 2 + randomAngle;
    
    const duration = 5000;
    const start = performance.now();
    const initialRotation = rotation;
    
    const animate = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentRotation = initialRotation + totalRotation * easeProgress;
      setRotation(currentRotation);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        
        // Calculate winner
        // The pointer is at the right side (angle 0 in standard canvas)
        // Wait, pointer is usually at top (-PI/2) or right (0). Let's assume right (0).
        // Actual rotation applied moves slices clockwise.
        // A slice i is at angle: i*arc + currentRotation. 
        // We want the slice that is at angle 0.
        // Or if we put a pointer at the right. Let's put a pointer at the right.
        const normalizedRotation = currentRotation % (Math.PI * 2);
        const arc = Math.PI * 2 / nameList.length;
        
        // Find which slice overlaps 0 rad.
        // A slice starts at i*arc + normalizedRotation and ends at (i+1)*arc + normalizedRotation.
        // We want: i*arc + normalizedRotation = 2PI - offset.
        // Easier: The distance to 0 angle going backwards.
        const winningIndex = Math.floor(((Math.PI * 2 - normalizedRotation) % (Math.PI * 2)) / arc);
        
        setWinner(nameList[winningIndex]!);
      }
    };
    
    requestAnimationFrame(animate);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
        <div className="border-b border-[var(--border-subtle)] p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Wheel of Names</h2>
              <p className="text-sm text-[var(--text-secondary)]">Random name picker wheel</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
          {/* Wheel Area */}
          <div className="lg:col-span-8 p-8 flex flex-col items-center justify-center relative bg-[var(--bg-overlay)] dark:bg-[var(--bg-surface)]">
            {winner && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 animate-in slide-in-from-top-4 fade-in duration-500">
                <div className="bg-[var(--bg-elevated)] border-2 border-pink-500 rounded-2xl px-8 py-4 shadow-xl flex items-center gap-4">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">Winner!</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{winner}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="relative">
              {/* Pointer */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-0 h-0 border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent border-r-[30px] border-r-zinc-900 dark:border-r-white drop-shadow-md"></div>
              
              <canvas
                ref={canvasRef}
                width={500}
                height={500}
                className={`w-full max-w-[500px] h-auto drop-shadow-xl transition-transform ${isSpinning ? '' : 'hover:scale-[1.02]'}`}
              />
            </div>
            
            <button
              onClick={spinWheel}
              disabled={isSpinning || nameList.length < 2}
              className="mt-8 px-12 py-4 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:hover:bg-pink-600 text-white rounded-full font-bold text-xl transition-all shadow-lg shadow-pink-500/25 flex items-center gap-2 active:scale-[0.98]"
            >
              <Play className="w-6 h-6 fill-current" />
              {isSpinning ? 'SPINNING...' : 'SPIN!'}
            </button>
          </div>

          {/* Names Input */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-[var(--border-subtle)] flex flex-col bg-[var(--bg-elevated)]">
            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center gap-2">
              <ListPlus className="w-5 h-5 text-[var(--text-secondary)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">
                Entries ({nameList.length})
              </h3>
            </div>
            <textarea aria-label="Enter names here...\\nOne name per line"
              value={names}
              onChange={(e) => setNames(e.target.value)}
              placeholder="Enter names here...\\nOne name per line"
              className="flex-1 w-full p-4 bg-transparent resize-none focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 text-[var(--text-primary)] leading-relaxed font-medium"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';

type Mode = 'pomodoro' | 'shortBreak' | 'longBreak';

export default function PomodoroTimer() {
  const [mode, setMode] = useState<Mode>('pomodoro');
  const [seconds, setSeconds] = useState(1500); // 25 mins
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const modeLengths: Record<Mode, number> = {
    pomodoro: 1500,
    shortBreak: 300,
    longBreak: 900
  };

  useEffect(() => {
    if (isActive && seconds > 0) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => prev - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      setIsActive(false);
      triggerSound();
      toast.success('Session completed!');
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, seconds]);

  const triggerSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5 note
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      osc.start();
      setTimeout(() => osc.stop(), 800);
    } catch (_e) {
      /* noop */
    }
  };

  const changeMode = (newMode: Mode) => {
    setIsActive(false);
    setMode(newMode);
    setSeconds(modeLengths[newMode]);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3 justify-between">
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-[var(--accent)]" />
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Pomodoro Focus Timer</h3>
        </div>
      </div>

      <div className="flex bg-[var(--bg-overlay)] p-1.5 rounded-xl gap-1.5 max-w-md mx-auto">
        <button onClick={() => changeMode('pomodoro')} className={`flex-1 py-2 rounded-lg text-xs font-bold cursor-pointer ${mode === 'pomodoro' ? 'bg-indigo-600 text-white shadow' : 'text-[var(--text-secondary)]'}`}>Focus Session</button>
        <button onClick={() => changeMode('shortBreak')} className={`flex-1 py-2 rounded-lg text-xs font-bold cursor-pointer ${mode === 'shortBreak' ? 'bg-indigo-600 text-white shadow' : 'text-[var(--text-secondary)]'}`}>Short Break</button>
        <button onClick={() => changeMode('longBreak')} className={`flex-1 py-2 rounded-lg text-xs font-bold cursor-pointer ${mode === 'longBreak' ? 'bg-indigo-600 text-white shadow' : 'text-[var(--text-secondary)]'}`}>Long Break</button>
      </div>

      <div className="flex flex-col items-center justify-center py-6">
        <div className="text-7xl font-black font-mono tracking-wider text-[var(--text-primary)] mb-6">
          {formatTime(seconds)}
        </div>

        <div className="flex gap-4">
          {isActive ? (
            <button onClick={() => setIsActive(false)} className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-3 rounded-xl cursor-pointer text-xs transition-colors shadow">
              Pause Focus
            </button>
          ) : (
            <button onClick={() => setIsActive(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl cursor-pointer text-xs transition-colors shadow">
              Start Session
            </button>
          )}
          <button onClick={() => changeMode(mode)} className="bg-zinc-800 hover:bg-[var(--bg-elevated)] text-white font-bold p-3 rounded-xl cursor-pointer transition-colors shadow">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] p-6">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{title}</h2>
      {children}
    </div>
  );
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatTimeShort(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function useTimer() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const start = useCallback(() => setRunning(true), []);
  const stop = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => { setRunning(false); setElapsed(0); }, []);
  const toggle = useCallback(() => setRunning(r => !r), []);

  return { running, elapsed, start, stop, reset, toggle };
}

// === 1. Timer ===
export function Timer() {
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('5');
  const [seconds, setSeconds] = useState('0');
  const [remaining, setRemaining] = useState(0);
  const [active, setActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);

  useEffect(() => {
    if (active && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) { setActive(false); return 0; }
          return r - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [active]);

  const start = () => { setRemaining(total); setActive(true); };
  const pause = () => setActive(false);
  const reset = () => { setActive(false); setRemaining(0); };

  const progress = total > 0 ? ((total - remaining) / total) * 100 : 0;

  return (
    <Section title="Timer">
      <div className="space-y-3">
        <div className="flex gap-4">
          <div className="flex-1"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Hours</label><input type="number" min={0} value={hours} onChange={e => setHours(e.target.value)} disabled={active} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50" /></div>
          <div className="flex-1"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Minutes</label><input type="number" min={0} max={59} value={minutes} onChange={e => setMinutes(e.target.value)} disabled={active} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50" /></div>
          <div className="flex-1"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Seconds</label><input type="number" min={0} max={59} value={seconds} onChange={e => setSeconds(e.target.value)} disabled={active} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50" /></div>
        </div>
        <div className="text-center">
          <div className="text-5xl font-bold font-mono my-6">{formatTime(remaining)}</div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 mb-4">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="flex gap-3">
          {!active ? <button onClick={start} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Start</button> : <button onClick={pause} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Pause</button>}
          <button onClick={reset} className="px-4 py-2.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm font-medium transition-colors">Reset</button>
        </div>
      </div>
    </Section>
  );
}

// === 2. Stopwatch ===
export function Stopwatch() {
  const { elapsed, start, stop, reset } = useTimer();
  const [laps, setLaps] = useState<number[]>([]);

  const lap = () => setLaps(l => [...l, elapsed]);

  return (
    <Section title="Stopwatch">
      <div className="text-center">
        <div className="text-5xl font-bold font-mono my-6">{formatTime(elapsed)}</div>
        <div className="flex gap-3">
          <button onClick={start} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Start</button>
          <button onClick={stop} className="px-4 py-2.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm font-medium transition-colors">Stop</button>
          <button onClick={lap} className="px-4 py-2.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm font-medium transition-colors">Lap</button>
          <button onClick={reset} className="px-4 py-2.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm font-medium transition-colors">Reset</button>
        </div>
        {laps.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Laps</h3>
            <div className="space-y-1">
              {laps.map((l, i) => (
                <div key={i} className="flex justify-between text-sm p-2 bg-[var(--bg-surface)] rounded-lg">
                  <span>Lap {i + 1}</span>
                  <span className="font-mono">{formatTime(l)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}

// === 3. CountdownTimer ===
export function CountdownTimer() {
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 16);
  });
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setActive(false); setRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 }); clearInterval(interval); return; }
      setRemaining({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [active, targetDate]);

  return (
    <Section title="Countdown Timer">
      <div className="space-y-3">
        <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Target Date & Time</label><input type="datetime-local" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50" /></div>
        <button onClick={() => setActive(true)} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Start Countdown</button>
        <div className="grid grid-cols-4 gap-4 mt-6 text-center">
          <div className="p-4 bg-[var(--bg-surface)] rounded-xl">
            <div className="text-3xl font-bold font-mono">{remaining.days}</div>
            <div className="text-xs text-[var(--text-secondary)]">Days</div>
          </div>
          <div className="p-4 bg-[var(--bg-surface)] rounded-xl">
            <div className="text-3xl font-bold font-mono">{remaining.hours}</div>
            <div className="text-xs text-[var(--text-secondary)]">Hours</div>
          </div>
          <div className="p-4 bg-[var(--bg-surface)] rounded-xl">
            <div className="text-3xl font-bold font-mono">{remaining.minutes}</div>
            <div className="text-xs text-[var(--text-secondary)]">Minutes</div>
          </div>
          <div className="p-4 bg-[var(--bg-surface)] rounded-xl">
            <div className="text-3xl font-bold font-mono">{remaining.seconds}</div>
            <div className="text-xs text-[var(--text-secondary)]">Seconds</div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// === 4. PomodoroTimer ===
export function PomodoroTimer() {
  const [workTime, setWorkTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [cycles, setCycles] = useState(4);
  const [phase, setPhase] = useState<'work' | 'break'>('work');
  const [remaining, setRemaining] = useState(25 * 60);
  const [cycleCount, setCycleCount] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          if (phase === 'work') {
            const newCycle = cycleCount + 1;
            setCycleCount(newCycle);
            if (newCycle >= cycles) { setActive(false); return 0; }
            setPhase('break');
            return breakTime * 60;
          } else {
            setPhase('work');
            return workTime * 60;
          }
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [active, phase, cycleCount, cycles, workTime, breakTime]);

  const start = () => {
    setPhase('work');
    setRemaining(workTime * 60);
    setCycleCount(0);
    setActive(true);
  };

  const notify = () => {
    try { new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAgICAPz8/Pz8/P4B/f39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f39/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pw==').play();
    } catch {}
  };

  useEffect(() => {
    if (active && remaining === 0) notify();
  }, [active, remaining]);

  return (
    <Section title="Pomodoro Timer">
      <div className="space-y-3">
        <div className="flex gap-4">
          <div className="flex-1"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Work (min)</label><input type="number" min={1} value={workTime} onChange={e => setWorkTime(Number(e.target.value))} disabled={active} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50" /></div>
          <div className="flex-1"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Break (min)</label><input type="number" min={1} value={breakTime} onChange={e => setBreakTime(Number(e.target.value))} disabled={active} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50" /></div>
          <div className="flex-1"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Cycles</label><input type="number" min={1} value={cycles} onChange={e => setCycles(Number(e.target.value))} disabled={active} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50" /></div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-[var(--text-primary)] mb-1">{phase === 'work' ? 'Work' : 'Break'} &mdash; Cycle {cycleCount}/{cycles}</div>
          <div className="text-5xl font-bold font-mono text-[var(--text-primary)] my-4">{formatTimeShort(remaining)}</div>
        </div>
        {!active ? <button onClick={start} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Start Pomodoro</button> : <button onClick={() => setActive(false)} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Pause</button>}
      </div>
    </Section>
  );
}


// === 5. IntervalTimer ===
export function IntervalTimer() {
  const [sets, setSets] = useState(5);
  const [work, setWork] = useState(30);
  const [rest, setRest] = useState(15);
  const [currentSet, setCurrentSet] = useState(0);
  const [isWork, setIsWork] = useState(true);
  const [remaining, setRemaining] = useState(30);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          if (isWork) {
            setIsWork(false);
            return rest;
          } else {
            const nextSet = currentSet + 1;
            setCurrentSet(nextSet);
            if (nextSet >= sets) { setActive(false); return 0; }
            setIsWork(true);
            return work;
          }
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [active, isWork, work, rest, sets, currentSet]);

  const start = () => { setCurrentSet(0); setIsWork(true); setRemaining(work); setActive(true); };

  return (
    <Section title="Interval Timer">
      <div className="space-y-3">
        <div className="flex gap-4">
          <div className="flex-1"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Sets</label><input type="number" min={1} value={sets} onChange={e => setSets(Number(e.target.value))} disabled={active} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50" /></div>
          <div className="flex-1"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Work (sec)</label><input type="number" min={1} value={work} onChange={e => setWork(Number(e.target.value))} disabled={active} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50" /></div>
          <div className="flex-1"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Rest (sec)</label><input type="number" min={1} value={rest} onChange={e => setRest(Number(e.target.value))} disabled={active} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50" /></div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-[var(--text-primary)] mb-1">{isWork ? 'Work' : 'Rest'} &mdash; Set {currentSet}/{sets}</div>
          <div className="text-5xl font-bold font-mono text-[var(--text-primary)] my-4">{remaining}s</div>
        </div>
        {!active ? <button onClick={start} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Start</button> : <button onClick={() => setActive(false)} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Pause</button>}
      </div>
    </Section>
  );
}


// === 6. TabataTimer ===
export function TabataTimer() {
  const [work, setWork] = useState(20);
  const [rest, setRest] = useState(10);
  const [rounds, setRounds] = useState(8);
  const [currentRound, setCurrentRound] = useState(0);
  const [isWork, setIsWork] = useState(true);
  const [remaining, setRemaining] = useState(20);
  const [active, setActive] = useState(false);
  const [prep, setPrep] = useState(3);

  useEffect(() => {
    if (!active) return;
    if (prep > 0) {
      const t = setTimeout(() => setPrep(p => p - 1), 1000);
      return () => clearTimeout(t);
    }
    const interval = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          if (isWork) { setIsWork(false); return rest; }
          else {
            const next = currentRound + 1;
            setCurrentRound(next);
            if (next >= rounds) { setActive(false); return 0; }
            setIsWork(true);
            return work;
          }
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [active, prep, isWork, work, rest, rounds, currentRound]);

  const start = () => { setPrep(3); setCurrentRound(0); setIsWork(true); setRemaining(work); setActive(true); };

  return (
    <Section title="Tabata Timer">
      <div className="space-y-3">
        <div className="flex gap-4">
          <div className="flex-1"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Work (sec)</label><input type="number" min={1} value={work} onChange={e => setWork(Number(e.target.value))} disabled={active} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50" /></div>
          <div className="flex-1"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Rest (sec)</label><input type="number" min={1} value={rest} onChange={e => setRest(Number(e.target.value))} disabled={active} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50" /></div>
          <div className="flex-1"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Rounds</label><input type="number" min={1} value={rounds} onChange={e => setRounds(Number(e.target.value))} disabled={active} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50" /></div>
        </div>
        <div className="text-center">
          {prep > 0 && active ? <div className="text-2xl font-bold text-[var(--text-primary)] mb-2">Get ready... {prep}</div> : null}
          {(!active || prep === 0) && (
            <>
              <div className="text-sm font-medium text-[var(--text-primary)] mb-1">{isWork ? 'WORK!' : 'REST'} &mdash; Round {currentRound}/{rounds}</div>
              <div className="text-5xl font-bold font-mono text-[var(--text-primary)] my-4">{remaining}s</div>
            </>
          )}
        </div>
        {!active ? <button onClick={start} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Start Tabata</button> : <button onClick={() => setActive(false)} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Pause</button>}
      </div>
    </Section>
  );
}


// === 7. WorldClock ===
const TIMEZONES = [
  { label: 'New York', tz: 'America/New_York' },
  { label: 'London', tz: 'Europe/London' },
  { label: 'Tokyo', tz: 'Asia/Tokyo' },
  { label: 'Dubai', tz: 'Asia/Dubai' },
  { label: 'Sydney', tz: 'Australia/Sydney' },
  { label: 'Paris', tz: 'Europe/Paris' },
  { label: 'Mumbai', tz: 'Asia/Kolkata' },
  { label: 'Singapore', tz: 'Asia/Singapore' },
  { label: 'Los Angeles', tz: 'America/Los_Angeles' },
  { label: 'Berlin', tz: 'Europe/Berlin' },
  { label: 'Shanghai', tz: 'Asia/Shanghai' },
  { label: 'Sao Paulo', tz: 'America/Sao_Paulo' },
];
export function WorldClock() {
  const [selected, setSelected] = useState(['America/New_York', 'Europe/London', 'Asia/Tokyo', 'Asia/Kolkata']);
  const [time, setTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const add = (tz: string) => { if (!selected.includes(tz)) setSelected(s => [...s, tz]); };
  const remove = (tz: string) => setSelected(s => s.filter(t => t !== tz));

  return (
    <Section title="World Clock">
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap mb-4">
          {TIMEZONES.filter(t => !selected.includes(t.tz)).map(t => (
            <button key={t.tz} onClick={() => add(t.tz)} className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-lg text-xs font-medium transition-colors">{t.label} +</button>
          ))}
        </div>
        <div className="space-y-2">
          {selected.map(tz => {
            const t = TIMEZONES.find(t => t.tz === tz);
            return (
              <div key={tz} className="flex items-center justify-between p-3 bg-[var(--bg-surface)] rounded-lg">
                <div>
                  <div className="font-medium text-sm text-[var(--text-primary)]">{t?.label || tz}</div>
                  <div className="text-xs text-[var(--text-secondary)]">{tz}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-lg font-mono font-bold text-[var(--text-primary)]">{new Date(time).toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit' })}</div>
                  <button onClick={() => remove(tz)} className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium">&times;</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}


// === 8. TimeConverter ===
export function TimeConverter() {
  const [value, setValue] = useState('3600');
  const [from, setFrom] = useState('seconds');
  const [result, setResult] = useState<{ unit: string; value: number }[]>([]);

  const units: { unit: string; multiplier: number }[] = [
    { unit: 'Seconds', multiplier: 1 },
    { unit: 'Minutes', multiplier: 60 },
    { unit: 'Hours', multiplier: 3600 },
    { unit: 'Days', multiplier: 86400 },
    { unit: 'Weeks', multiplier: 604800 },
    { unit: 'Months (30d)', multiplier: 2592000 },
    { unit: 'Years (365d)', multiplier: 31536000 },
  ];

  const convert = () => {
    const v = parseFloat(value);
    if (isNaN(v)) return;
    const fromMultiplier = units.find(u => u.unit.toLowerCase().startsWith(from))?.multiplier || 1;
    const seconds = v * fromMultiplier;
    setResult(units.map(u => ({ unit: u.unit, value: seconds / u.multiplier })));
  };

  return (
    <Section title="Time Converter">
      <div className="space-y-3">
        <div className="flex gap-4">
          <div className="flex-1"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Value</label><input type="number" value={value} onChange={e => setValue(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50" /></div>
          <div className="flex-1"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">From</label>
            <select value={from} onChange={e => setFrom(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50">
              <option value="seconds">Seconds</option>
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
            </select>
          </div>
        </div>
        <button onClick={convert} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Convert</button>
        {result.length > 0 && (
          <div className="mt-4 space-y-1">
            {result.map(r => (
              <div key={r.unit} className="flex justify-between p-2 bg-[var(--bg-surface)] rounded-lg text-sm">
                <span className="text-[var(--text-primary)]">{r.unit}</span>
                <span className="font-mono text-[var(--text-primary)]">{r.value.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}


// === 9. TimeDurationCalculator ===
export function TimeDurationCalculator() {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:30');
  const [result, setResult] = useState('');

  const calc = () => {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const start = sh * 3600 + sm * 60;
    let end = eh * 3600 + em * 60;
    if (end < start) end += 86400;
    const diff = end - start;
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    setResult(`${h}h ${m}m ${s}s (${diff} seconds)`);
  };

  return (
    <Section title="Time Duration Calculator">
      <div className="space-y-3">
        <div className="flex gap-4">
          <div className="flex-1"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Start Time</label><input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50" /></div>
          <div className="flex-1"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">End Time</label><input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50" /></div>
        </div>
        <button onClick={calc} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Calculate Duration</button>
        {result && <div className="p-4 bg-[var(--bg-surface)] rounded-lg text-sm font-mono text-[var(--text-primary)]">{result}</div>}
      </div>
    </Section>
  );
}


// === 10. TimeAdditionCalculator ===
export function TimeAdditionCalculator() {
  const [startTime, setStartTime] = useState('14:30');
  const [addH, setAddH] = useState('2');
  const [addM, setAddM] = useState('15');
  const [result, setResult] = useState('');

  const calc = () => {
    const [sh, sm] = startTime.split(':').map(Number);
    const total = sh * 60 + sm + parseInt(addH) * 60 + parseInt(addM);
    const d = Math.floor(total / 1440);
    const m = total % 1440;
    const h = Math.floor(m / 60);
    const min = m % 60;
    setResult(d > 0 ? `${d}d ${h}h ${min}m` : `${h}h ${min}m`);
  };

  return (
    <Section title="Time Addition Calculator">
      <div className="space-y-3">
        <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Start Time</label><input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50" /></div>
        <div className="flex gap-4">
          <div className="flex-1"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Hours to Add</label><input type="number" min={0} value={addH} onChange={e => setAddH(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50" /></div>
          <div className="flex-1"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Minutes to Add</label><input type="number" min={0} value={addM} onChange={e => setAddM(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50" /></div>
        </div>
        <button onClick={calc} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Calculate</button>
        {result && <div className="p-4 bg-[var(--bg-surface)] rounded-lg text-sm font-mono text-[var(--text-primary)]">{result}</div>}
      </div>
    </Section>
  );
}


// === 11. TimeUntilCalculator ===
export function TimeUntilCalculator() {
  const [futureDate, setFutureDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 16);
  });
  const [remaining, setRemaining] = useState('');

  const calc = () => {
    const diff = new Date(futureDate).getTime() - Date.now();
    if (diff <= 0) { setRemaining('That time has passed!'); return; }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    setRemaining(`${days} days, ${hours} hours, ${minutes} minutes until that time.`);
  };

  return (
    <Section title="Time Until Calculator">
      <div className="space-y-3">
        <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Future Date & Time</label><input type="datetime-local" value={futureDate} onChange={e => setFutureDate(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50" /></div>
        <button onClick={calc} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Calculate</button>
        {remaining && <div className="p-4 bg-[var(--bg-surface)] rounded-lg text-sm font-mono text-[var(--text-primary)]">{remaining}</div>}
      </div>
    </Section>
  );
}


// === 12. MeetingTimePlanner ===
export function MeetingTimePlanner() {
  const [timezones, setTimezones] = useState(['America/New_York', 'Europe/London', 'Asia/Tokyo']);
  const [time, setTime] = useState('10:00');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [results, setResults] = useState<{ label: string; tz: string; time: string }[]>([]);

  const calc = () => {
    const dt = new Date(`${date}T${time}:00`);
    setResults(timezones.map(tz => {
      const t = dt.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: true });
      const label = TIMEZONES.find(t => t.tz === tz)?.label || tz.split('/').pop()?.replace('_', ' ') || tz;
      return { label, tz, time: t };
    }));
  };

  const toggleTz = (tz: string) => {
    setTimezones(t => t.includes(tz) ? t.filter(x => x !== tz) : [...t, tz]);
  };

  return (
    <Section title="Meeting Time Planner">
      <div className="space-y-3">
        <div className="flex gap-4">
          <div className="flex-1"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50" /></div>
          <div className="flex-1"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Time</label><input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50" /></div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Select Timezones</label>
          <div className="flex flex-wrap gap-2">
            {TIMEZONES.map(t => (
              <button key={t.tz} onClick={() => toggleTz(t.tz)} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${timezones.includes(t.tz) ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md' : 'bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100'}`}>{t.label}</button>
            ))}
          </div>
        </div>
        <button onClick={calc} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Show Times</button>
        {results.length > 0 && (
          <div className="mt-4 space-y-2">
            {results.map(r => (
              <div key={r.tz} className="flex justify-between p-3 bg-[var(--bg-surface)] rounded-lg">
                <span className="text-sm font-medium text-[var(--text-primary)]">{r.label}</span>
                <span className="text-sm font-mono font-bold text-[var(--text-primary)]">{r.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}

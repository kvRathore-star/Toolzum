"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';

const inputClass = "w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm";
const labelClass = "block text-sm font-medium mb-1";
const btnClass = "w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg text-sm transition-colors";
const cardClass = "max-w-xl mx-auto p-6";
const headingClass = "text-2xl font-bold mb-6";
const secondaryBtnClass = "px-4 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg text-sm font-medium transition-colors";
const resultClass = "p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-mono";

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
    <div className={cardClass}>
      <h1 className={headingClass}>Timer</h1>
      <div className="space-y-3">
        <div className="flex gap-4">
          <div className="flex-1"><label className={labelClass}>Hours</label><input type="number" min={0} value={hours} onChange={e => setHours(e.target.value)} disabled={active} className={inputClass} /></div>
          <div className="flex-1"><label className={labelClass}>Minutes</label><input type="number" min={0} max={59} value={minutes} onChange={e => setMinutes(e.target.value)} disabled={active} className={inputClass} /></div>
          <div className="flex-1"><label className={labelClass}>Seconds</label><input type="number" min={0} max={59} value={seconds} onChange={e => setSeconds(e.target.value)} disabled={active} className={inputClass} /></div>
        </div>
        <div className="text-center">
          <div className="text-5xl font-bold font-mono my-6">{formatTime(remaining)}</div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 mb-4">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="flex gap-3">
          {!active ? <button onClick={start} className={btnClass}>Start</button> : <button onClick={pause} className={btnClass}>Pause</button>}
          <button onClick={reset} className={secondaryBtnClass}>Reset</button>
        </div>
      </div>
    </div>
  );
}

// === 2. Stopwatch ===
export function Stopwatch() {
  const { elapsed, start, stop, reset } = useTimer();
  const [laps, setLaps] = useState<number[]>([]);

  const lap = () => setLaps(l => [...l, elapsed]);

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Stopwatch</h1>
      <div className="text-center">
        <div className="text-5xl font-bold font-mono my-6">{formatTime(elapsed)}</div>
        <div className="flex gap-3">
          <button onClick={start} className={btnClass}>Start</button>
          <button onClick={stop} className={secondaryBtnClass}>Stop</button>
          <button onClick={lap} className={secondaryBtnClass}>Lap</button>
          <button onClick={reset} className={secondaryBtnClass}>Reset</button>
        </div>
        {laps.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Laps</h3>
            <div className="space-y-1">
              {laps.map((l, i) => (
                <div key={i} className="flex justify-between text-sm p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <span>Lap {i + 1}</span>
                  <span className="font-mono">{formatTime(l)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
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
    <div className={cardClass}>
      <h1 className={headingClass}>Countdown Timer</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Target Date & Time</label><input type="datetime-local" value={targetDate} onChange={e => setTargetDate(e.target.value)} className={inputClass} /></div>
        <button onClick={() => setActive(true)} className={btnClass}>Start Countdown</button>
        <div className="grid grid-cols-4 gap-4 mt-6 text-center">
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
            <div className="text-3xl font-bold font-mono">{remaining.days}</div>
            <div className="text-xs text-zinc-500">Days</div>
          </div>
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
            <div className="text-3xl font-bold font-mono">{remaining.hours}</div>
            <div className="text-xs text-zinc-500">Hours</div>
          </div>
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
            <div className="text-3xl font-bold font-mono">{remaining.minutes}</div>
            <div className="text-xs text-zinc-500">Minutes</div>
          </div>
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
            <div className="text-3xl font-bold font-mono">{remaining.seconds}</div>
            <div className="text-xs text-zinc-500">Seconds</div>
          </div>
        </div>
      </div>
    </div>
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
    try { new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAgICAPz8/Pz8/P4B/f39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f39/Pz8/Pz8/P4B/f39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f39/Pz8/Pz8/P4B/f39/f38/Pz8/Pz+Af39/f39/Pz8/Pz8/P4B/f39/f38/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f39/Pz8/Pz8/gH9/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f39/Pz8/Pz8/gH9/f39/fz8/Pz8/P4B/f39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/P4B/f39/f38/Pz8/Pz8/gH9/f38/Pz8/Pz8/gH9/f39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8/Pz+Af39/f38/Pz8/Pz8/gH9/f39/fz8/Pz8Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pw==').play();
    } catch {}
  };

  useEffect(() => {
    if (active && remaining === 0) notify();
  }, [active, remaining]);

  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Pomodoro Timer</h1>
      <div className="space-y-3">
        <div className="flex gap-4">
          <div className="flex-1"><label className={labelClass}>Work (min)</label><input type="number" min={1} value={workTime} onChange={e => setWorkTime(Number(e.target.value))} disabled={active} className={inputClass} /></div>
          <div className="flex-1"><label className={labelClass}>Break (min)</label><input type="number" min={1} value={breakTime} onChange={e => setBreakTime(Number(e.target.value))} disabled={active} className={inputClass} /></div>
          <div className="flex-1"><label className={labelClass}>Cycles</label><input type="number" min={1} value={cycles} onChange={e => setCycles(Number(e.target.value))} disabled={active} className={inputClass} /></div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium mb-1">{phase === 'work' ? 'Work' : 'Break'} — Cycle {cycleCount}/{cycles}</div>
          <div className="text-5xl font-bold font-mono my-4">{formatTimeShort(remaining)}</div>
        </div>
        {!active ? <button onClick={start} className={btnClass}>Start Pomodoro</button> : <button onClick={() => setActive(false)} className={btnClass}>Pause</button>}
      </div>
    </div>
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
    <div className={cardClass}>
      <h1 className={headingClass}>Interval Timer</h1>
      <div className="space-y-3">
        <div className="flex gap-4">
          <div className="flex-1"><label className={labelClass}>Sets</label><input type="number" min={1} value={sets} onChange={e => setSets(Number(e.target.value))} disabled={active} className={inputClass} /></div>
          <div className="flex-1"><label className={labelClass}>Work (sec)</label><input type="number" min={1} value={work} onChange={e => setWork(Number(e.target.value))} disabled={active} className={inputClass} /></div>
          <div className="flex-1"><label className={labelClass}>Rest (sec)</label><input type="number" min={1} value={rest} onChange={e => setRest(Number(e.target.value))} disabled={active} className={inputClass} /></div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium mb-1">{isWork ? 'Work' : 'Rest'} — Set {currentSet}/{sets}</div>
          <div className="text-5xl font-bold font-mono my-4">{remaining}s</div>
        </div>
        {!active ? <button onClick={start} className={btnClass}>Start</button> : <button onClick={() => setActive(false)} className={btnClass}>Pause</button>}
      </div>
    </div>
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
    <div className={cardClass}>
      <h1 className={headingClass}>Tabata Timer</h1>
      <div className="space-y-3">
        <div className="flex gap-4">
          <div className="flex-1"><label className={labelClass}>Work (sec)</label><input type="number" min={1} value={work} onChange={e => setWork(Number(e.target.value))} disabled={active} className={inputClass} /></div>
          <div className="flex-1"><label className={labelClass}>Rest (sec)</label><input type="number" min={1} value={rest} onChange={e => setRest(Number(e.target.value))} disabled={active} className={inputClass} /></div>
          <div className="flex-1"><label className={labelClass}>Rounds</label><input type="number" min={1} value={rounds} onChange={e => setRounds(Number(e.target.value))} disabled={active} className={inputClass} /></div>
        </div>
        <div className="text-center">
          {prep > 0 && active ? <div className="text-2xl font-bold mb-2">Get ready... {prep}</div> : null}
          {(!active || prep === 0) && (
            <>
              <div className="text-sm font-medium mb-1">{isWork ? 'WORK!' : 'REST'} — Round {currentRound}/{rounds}</div>
              <div className="text-5xl font-bold font-mono my-4">{remaining}s</div>
            </>
          )}
        </div>
        {!active ? <button onClick={start} className={btnClass}>Start Tabata</button> : <button onClick={() => setActive(false)} className={btnClass}>Pause</button>}
      </div>
    </div>
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
  { label: 'São Paulo', tz: 'America/Sao_Paulo' },
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
    <div className={cardClass}>
      <h1 className={headingClass}>World Clock</h1>
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap mb-4">
          {TIMEZONES.filter(t => !selected.includes(t.tz)).map(t => (
            <button key={t.tz} onClick={() => add(t.tz)} className="text-xs px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded">{t.label} +</button>
          ))}
        </div>
        <div className="space-y-2">
          {selected.map(tz => {
            const t = TIMEZONES.find(t => t.tz === tz);
            return (
              <div key={tz} className="flex items-center justify-between p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                <div>
                  <div className="font-medium text-sm">{t?.label || tz}</div>
                  <div className="text-xs text-zinc-500">{tz}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-lg font-mono font-bold">{new Date(time).toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit' })}</div>
                  <button onClick={() => remove(tz)} className="text-xs text-red-500 hover:underline">×</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
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
    <div className={cardClass}>
      <h1 className={headingClass}>Time Converter</h1>
      <div className="space-y-3">
        <div className="flex gap-4">
          <div className="flex-1"><label className={labelClass}>Value</label><input type="number" value={value} onChange={e => setValue(e.target.value)} className={inputClass} /></div>
          <div className="flex-1"><label className={labelClass}>From</label>
            <select value={from} onChange={e => setFrom(e.target.value)} className={inputClass}>
              <option value="seconds">Seconds</option>
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
            </select>
          </div>
        </div>
        <button onClick={convert} className={btnClass}>Convert</button>
        {result.length > 0 && (
          <div className="mt-4 space-y-1">
            {result.map(r => (
              <div key={r.unit} className="flex justify-between p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm">
                <span>{r.unit}</span>
                <span className="font-mono">{r.value.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
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
    <div className={cardClass}>
      <h1 className={headingClass}>Time Duration Calculator</h1>
      <div className="space-y-3">
        <div className="flex gap-4">
          <div className="flex-1"><label className={labelClass}>Start Time</label><input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={inputClass} /></div>
          <div className="flex-1"><label className={labelClass}>End Time</label><input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={inputClass} /></div>
        </div>
        <button onClick={calc} className={btnClass}>Calculate Duration</button>
        {result && <div className={resultClass}>{result}</div>}
      </div>
    </div>
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
    <div className={cardClass}>
      <h1 className={headingClass}>Time Addition Calculator</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Start Time</label><input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={inputClass} /></div>
        <div className="flex gap-4">
          <div className="flex-1"><label className={labelClass}>Hours to Add</label><input type="number" min={0} value={addH} onChange={e => setAddH(e.target.value)} className={inputClass} /></div>
          <div className="flex-1"><label className={labelClass}>Minutes to Add</label><input type="number" min={0} value={addM} onChange={e => setAddM(e.target.value)} className={inputClass} /></div>
        </div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <div className={resultClass}>{result}</div>}
      </div>
    </div>
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
    <div className={cardClass}>
      <h1 className={headingClass}>Time Until Calculator</h1>
      <div className="space-y-3">
        <div><label className={labelClass}>Future Date & Time</label><input type="datetime-local" value={futureDate} onChange={e => setFutureDate(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {remaining && <div className={resultClass}>{remaining}</div>}
      </div>
    </div>
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
    <div className={cardClass}>
      <h1 className={headingClass}>Meeting Time Planner</h1>
      <div className="space-y-3">
        <div className="flex gap-4">
          <div className="flex-1"><label className={labelClass}>Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} /></div>
          <div className="flex-1"><label className={labelClass}>Time</label><input type="time" value={time} onChange={e => setTime(e.target.value)} className={inputClass} /></div>
        </div>
        <div>
          <label className={labelClass}>Select Timezones</label>
          <div className="flex flex-wrap gap-2">
            {TIMEZONES.map(t => (
              <button key={t.tz} onClick={() => toggleTz(t.tz)} className={`text-xs px-2 py-1 rounded border ${timezones.includes(t.tz) ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600'}`}>{t.label}</button>
            ))}
          </div>
        </div>
        <button onClick={calc} className={btnClass}>Show Times</button>
        {results.length > 0 && (
          <div className="mt-4 space-y-2">
            {results.map(r => (
              <div key={r.tz} className="flex justify-between p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                <span className="text-sm font-medium">{r.label}</span>
                <span className="text-sm font-mono font-bold">{r.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

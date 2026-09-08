"use client";
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { ac, btnClass } from './miscToolColors';

import { Section, Input, labelClass, selClass } from './MiscToolsShared';

export function CounterTool() {
  const clr = ac('CounterTool');
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const handleCopy = () => { navigator.clipboard.writeText(`Count: ${count}\nHistory: ${history.join(', ')}`); toast.success('Copied!'); };
  const handleDownload = () => { const blob = new Blob([`Count: ${count}\nHistory: ${history.join(', ')}`], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='counter-log.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); };
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
      <h2 className="text-lg font-bold text-[var(--text-primary)]">Counter</h2>
      <div className="text-4xl font-bold text-center text-[var(--text-primary)]">{count}</div>
      <div className="flex gap-2 justify-center">
        <button className={btnClass(clr)} onClick={() => { setHistory(h => [count, ...h.slice(0, 19)]); setCount(c => c - 1); }}>-</button>
        <button className={btnClass(clr)} onClick={() => { setCount(0); setHistory([]); }}>Reset</button>
        <button className={btnClass(clr)} onClick={() => { setHistory(h => [count, ...h.slice(0, 19)]); setCount(c => c + 1); }}>+</button>
      </div>
      {history.length > 0 && <div className="text-xs text-[var(--text-secondary)] max-h-24 overflow-auto"><div className="font-medium mb-1">History:</div>{history.map((h, i) => <span key={i} className="mr-2">{h}</span>)}</div>}
      <div className="flex gap-2">
        <button onClick={handleCopy} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
        <button onClick={handleDownload} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</button>
      </div>
    </div>
  );
}
// --- ListRandomizer ---
export function ListRandomizer() {
  const clr = ac('ListRandomizer');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string[]>([]);
  const presets = [
    { label: 'Fruits', apply: () => setInput('Apple\nBanana\nCherry\nDate\nElderberry') },
    { label: 'Colors', apply: () => setInput('Red\nBlue\nGreen\nYellow\nPurple') },
  ];
  const randomize = () => {
    const items = input.split('\n').map(s => s.trim()).filter(Boolean);
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setResult(shuffled);
  };
  const resultText = result.map((item, i) => `${i + 1}. ${item}`).join('\n');
  const handleCopy = () => { navigator.clipboard.writeText(resultText); toast.success('Copied!'); };
  const handleDownload = () => { const blob = new Blob([resultText], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='randomized-list.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button key={p.label} onClick={p.apply} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">List Randomizer</h2>
        <Input label="Enter items (one per line)" value={input} onChange={setInput} rows={5} />
        <button className={btnClass(clr)} onClick={randomize}>Randomize</button>
        {result.length > 0 && <div className="text-sm space-y-1">{result.map((item, i) => <div key={i} className="bg-[var(--bg-surface)] px-3 py-1 rounded">{i + 1}. {item}</div>)}</div>}
        {result.length > 0 && (
          <div className="flex gap-2">
            <button onClick={handleCopy} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
            <button onClick={handleDownload} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</button>
          </div>
        )}
      </div>
    </div>
  );
}
// --- ListSorter ---
export function ListSorter() {
  const clr = ac('ListSorter');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string[]>([]);
  const presets = [
    { label: 'Names', apply: () => setInput('Charlie\nAlice\nBob\nDiana\nEve') },
    { label: 'Words', apply: () => setInput('banana\napple\ncherry\ndate\nelderberry') },
  ];
  const sort = (mode: 'az' | 'za' | 'len') => {
    const items = input.split('\n').map(s => s.trim()).filter(Boolean);
    if (mode === 'az') items.sort();
    else if (mode === 'za') items.sort().reverse();
    else items.sort((a, b) => a.length - b.length);
    setResult(items);
  };
  const resultText = result.map((item, i) => `${i + 1}. ${item}`).join('\n');
  const handleCopy = () => { navigator.clipboard.writeText(resultText); toast.success('Copied!'); };
  const handleDownload = () => { const blob = new Blob([resultText], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='sorted-list.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); };
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
      <h2 className="text-lg font-bold text-[var(--text-primary)]">List Sorter</h2>
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button key={p.label} onClick={p.apply} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      <Input label="Enter items (one per line)" value={input} onChange={setInput} rows={5} />
      <div className="flex gap-2">
        <button className={btnClass(clr)} onClick={() => sort('az')}>A-Z</button>
        <button className={btnClass(clr)} onClick={() => sort('za')}>Z-A</button>
        <button className={btnClass(clr)} onClick={() => sort('len')}>By Length</button>
      </div>
      {result.length > 0 && <div className="text-sm space-y-1">{result.map((item, i) => <div key={i} className="bg-[var(--bg-surface)] px-3 py-1 rounded">{i + 1}. {item}</div>)}</div>}
      {result.length > 0 && (
        <div className="flex gap-2">
          <button onClick={handleCopy} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
          <button onClick={handleDownload} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</button>
        </div>
      )}
    </div>
  );
}

// --- CoinFlipper ---
export function CoinFlipper() {
  const clr = ac('CoinFlipper');
  const [side, setSide] = useState('');
  const [animating, setAnimating] = useState(false);
  const flip = () => {
    setAnimating(true);
    let i = 0;
    const interval = setInterval(() => { setSide(i % 2 === 0 ? 'Heads' : 'Tails'); i++; if (i > 8) { clearInterval(interval); setAnimating(false); setSide(Math.random() > 0.5 ? 'Heads' : 'Tails'); } }, 100);
  };
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
      <h2 className="text-lg font-bold text-[var(--text-primary)]">Coin Flipper</h2>
      <div className="text-center">
        <div className={'text-6xl mb-4' + (animating ? ' animate-spin' : '')}>&#x1FA99;</div>
        <div className="text-2xl font-bold mb-4 h-8">{side}</div>
        <button className={btnClass(clr)} onClick={flip} disabled={animating}>Flip Coin</button>
      </div>
    </div>
  );
}
// --- DiceRollerTool ---
export function DiceRollerTool() {
  const clr = ac('DiceRollerTool');
  const [sides, setSides] = useState(6);
  const [result, setResult] = useState<number | null>(null);
  const roll = () => setResult(Math.floor(Math.random() * sides) + 1);
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
      <h2 className="text-lg font-bold text-[var(--text-primary)]">Dice Roller (Custom)</h2>
      <div className="flex gap-3 items-center">
        <label className="text-sm">Sides:</label>
        <Input label="Sides:" type="number" min={2} max={100} value={sides} onChange={v => setSides(Number(v))} />
        <button className={btnClass(clr)} onClick={roll}>Roll</button>
      </div>
      {result !== null && <div className="text-5xl font-bold text-center text-blue-600">{result}</div>}
    </div>
  );
}
// --- NumberGuessingGame ---
export function NumberGuessingGame() {
  const clr = ac('NumberGuessingGame');
  const target = useRef(Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = useState('');
  const [hints, setHints] = useState<string[]>([]);
  const [won, setWon] = useState(false);
  const check = () => {
    const n = Number(guess);
    if (!n || n < 1 || n > 100) return;
    if (n === target.current) { setWon(true); setHints(h => [...h, n + ' - Correct!']); }
    else setHints(h => [...h, n + ' - ' + (n < target.current ? 'Too low' : 'Too high')]);
  };
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
      <h2 className="text-lg font-bold text-[var(--text-primary)]">Number Guessing Game</h2>
      <p className="text-sm text-[var(--text-secondary)]">Guess a number between 1 and 100</p>
      <div className="flex gap-2">
        <Input label="Your guess" type="number" min={1} max={100} value={guess} onChange={setGuess} />
        <button className={btnClass(clr)} onClick={check} disabled={won}>Guess</button>
      </div>
      {won && <div className="text-green-600 font-bold text-lg">You won in {hints.length} guesses!</div>}
      <div className="text-xs space-y-1 max-h-32 overflow-auto">{hints.map((h, i) => <div key={i} className={h.includes('Correct') ? 'text-green-600' : ''}>{h}</div>)}</div>
    </div>
  );
}
// --- RockPaperScissors ---
export function RockPaperScissors() {
  const clr = ac('RockPaperScissors');
  const [player, setPlayer] = useState('');
  const [computer, setComputer] = useState('');
  const [result, setResult] = useState('');
  const choices = ['Rock', 'Paper', 'Scissors'];
  const play = (p: string) => {
    const c = choices[Math.floor(Math.random() * 3)];
    setPlayer(p);
    setComputer(c);
    if (p === c) setResult('Draw');
    else if ((p === 'Rock' && c === 'Scissors') || (p === 'Paper' && c === 'Rock') || (p === 'Scissors' && c === 'Paper')) setResult('You Win!');
    else setResult('Computer Wins');
  };
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
      <h2 className="text-lg font-bold text-[var(--text-primary)]">Rock Paper Scissors</h2>
      <div className="flex gap-2 justify-center">
        {choices.map(c => <button className={btnClass(clr)} key={c} onClick={() => play(c)}>{c}</button>)}
      </div>
      {player && <div className="text-center text-sm"><div>You: {player}</div><div>Computer: {computer}</div><div className="text-lg font-bold mt-2">{result}</div></div>}
    </div>
  );
}
// --- HangmanGame ---
export function HangmanGame() {
  const clr = ac('HangmanGame');
  const words = ['react', 'typescript', 'javascript', 'hangman', 'developer', 'coding', 'puzzle', 'computer', 'python', 'rust'];
  const word = useRef(words[Math.floor(Math.random() * words.length)]);
  const [guessed, setGuessed] = useState<string[]>([]);
  const [wrong, setWrong] = useState(0);
  const display = word.current.split('').map(l => guessed.includes(l) ? l : '_').join(' ');
  const guess = (l: string) => {
    if (guessed.includes(l)) return;
    setGuessed([...guessed, l]);
    if (!word.current.includes(l)) setWrong(w => w + 1);
  };
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
      <h2 className="text-lg font-bold text-[var(--text-primary)]">Hangman Game</h2>
      <div className="text-2xl font-mono tracking-widest text-center mb-4">{display}</div>
      <div className="text-sm text-red-500 mb-2">Wrong: {wrong}/6</div>
      <div className="flex flex-wrap gap-1 justify-center max-w-xs mx-auto">
        {alphabet.map(l => (
          <button key={l} disabled={guessed.includes(l) || wrong >= 6 || !display.includes('_')}
            className={'w-7 h-7 text-xs rounded ' + (guessed.includes(l) ? 'bg-zinc-200 dark:bg-zinc-700 text-[var(--text-muted)]' : word.current.includes(l) ? 'bg-green-500 text-white' : 'bg-[var(--bg-surface)] hover:bg-blue-100') + ' disabled:opacity-40'}
            onClick={() => guess(l)}>{l}</button>
        ))}
      </div>
      {wrong >= 6 && <div className="text-red-500 font-bold text-center mt-2">Game Over! Word: {word.current}</div>}
      {!display.includes('_') && <div className="text-green-600 font-bold text-center mt-2">You Win!</div>}
    </div>
  );
}
// --- BinaryConverter ---

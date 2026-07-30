"use client";
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { ac, btnClass } from './miscToolColors';

import { Section, Input, labelClass, selClass } from './MiscToolsShared';

export function CounterTool() {
  const clr = ac('CounterTool');
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  return (
    <Section title="Counter">
      <div className="text-4xl font-bold text-center text-[var(--text-primary)]">{count}</div>
      <div className="flex gap-2 justify-center">
        <button className={btnClass(clr)} onClick={() => { setHistory(h => [count, ...h.slice(0, 19)]); setCount(c => c - 1); }}>-</button>
        <button className={btnClass(clr)} onClick={() => { setCount(0); setHistory([]); }}>Reset</button>
        <button className={btnClass(clr)} onClick={() => { setHistory(h => [count, ...h.slice(0, 19)]); setCount(c => c + 1); }}>+</button>
      </div>
      {history.length > 0 && <div className="text-xs text-[var(--text-secondary)] max-h-24 overflow-auto"><div className="font-medium mb-1">History:</div>{history.map((h, i) => <span key={i} className="mr-2">{h}</span>)}</div>}
    </Section>
  );
}
// --- ListRandomizer ---
export function ListRandomizer() {
  const clr = ac('ListRandomizer');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string[]>([]);
  const randomize = () => {
    const items = input.split('\n').map(s => s.trim()).filter(Boolean);
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setResult(shuffled);
  };
  return (
    <Section title="List Randomizer">
      <Input label="Enter items (one per line)" value={input} onChange={setInput} rows={5} />
      <button className={btnClass(clr)} onClick={randomize}>Randomize</button>
      {result.length > 0 && <div className="text-sm space-y-1">{result.map((item, i) => <div key={i} className="bg-[var(--bg-surface)] px-3 py-1 rounded">{i + 1}. {item}</div>)}</div>}
    </Section>
  );
}
// --- ListSorter ---
export function ListSorter() {
  const clr = ac('ListSorter');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string[]>([]);
  const sort = (mode: 'az' | 'za' | 'len') => {
    const items = input.split('\n').map(s => s.trim()).filter(Boolean);
    if (mode === 'az') items.sort();
    else if (mode === 'za') items.sort().reverse();
    else items.sort((a, b) => a.length - b.length);
    setResult(items);
  };
  return (
    <Section title="List Sorter">
      <Input label="Enter items (one per line)" value={input} onChange={setInput} rows={5} />
      <div className="flex gap-2">
        <button className={btnClass(clr)} onClick={() => sort('az')}>A-Z</button>
        <button className={btnClass(clr)} onClick={() => sort('za')}>Z-A</button>
        <button className={btnClass(clr)} onClick={() => sort('len')}>By Length</button>
      </div>
      {result.length > 0 && <div className="text-sm space-y-1">{result.map((item, i) => <div key={i} className="bg-[var(--bg-surface)] px-3 py-1 rounded">{i + 1}. {item}</div>)}</div>}
    </Section>
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
    <Section title="Coin Flipper">
      <div className="text-center">
        <div className={'text-6xl mb-4' + (animating ? ' animate-spin' : '')}>&#x1FA99;</div>
        <div className="text-2xl font-bold mb-4 h-8">{side}</div>
        <button className={btnClass(clr)} onClick={flip} disabled={animating}>Flip Coin</button>
      </div>
    </Section>
  );
}
// --- DiceRollerTool ---
export function DiceRollerTool() {
  const clr = ac('DiceRollerTool');
  const [sides, setSides] = useState(6);
  const [result, setResult] = useState<number | null>(null);
  const roll = () => setResult(Math.floor(Math.random() * sides) + 1);
  return (
    <Section title="Dice Roller (Custom)">
      <div className="flex gap-3 items-center">
        <label className="text-sm">Sides:</label>
        <Input label="Value" type="number" min={2} max={100} value={sides} onChange={v => setSides(Number(v))} />
        <button className={btnClass(clr)} onClick={roll}>Roll</button>
      </div>
      {result !== null && <div className="text-5xl font-bold text-center text-blue-600">{result}</div>}
    </Section>
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
    <Section title="Number Guessing Game">
      <p className="text-sm text-[var(--text-secondary)]">Guess a number between 1 and 100</p>
      <div className="flex gap-2">
        <Input label="Value" type="number" min={1} max={100} value={guess} onChange={setGuess} />
        <button className={btnClass(clr)} onClick={check} disabled={won}>Guess</button>
      </div>
      {won && <div className="text-green-600 font-bold text-lg">You won in {hints.length} guesses!</div>}
      <div className="text-xs space-y-1 max-h-32 overflow-auto">{hints.map((h, i) => <div key={i} className={h.includes('Correct') ? 'text-green-600' : ''}>{h}</div>)}</div>
    </Section>
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
    <Section title="Rock Paper Scissors">
      <div className="flex gap-2 justify-center">
        {choices.map(c => <button className={btnClass(clr)} key={c} onClick={() => play(c)}>{c}</button>)}
      </div>
      {player && <div className="text-center text-sm"><div>You: {player}</div><div>Computer: {computer}</div><div className="text-lg font-bold mt-2">{result}</div></div>}
    </Section>
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
    <Section title="Hangman Game">
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
    </Section>
  );
}
// --- BinaryConverter ---

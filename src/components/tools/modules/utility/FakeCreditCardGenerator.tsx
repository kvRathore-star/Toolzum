"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';
import { Input, randInt, randItem } from './GeneratorsShared';

const CARD_TYPES = [
  { name: 'Visa', prefix: '4', len: 16 }, { name: 'Mastercard', prefix: '5', len: 16 }, { name: 'Amex', prefix: '34', len: 15 }, { name: 'Discover', prefix: '6011', len: 16 }, { name: 'RuPay', prefix: '60', len: 16 },
];
function luhnCheck(num: string): boolean { let sum = 0; let alt = false; for (let i = num.length - 1; i >= 0; i--) { let d = parseInt(num[i] ?? ""); if (alt) { d *= 2; if (d > 9) d -= 9; } sum += d; alt = !alt; } return sum % 10 === 0; }
function genCardNum(prefix: string, len: number): string { let num = prefix; for (let i = num.length; i < len - 1; i++) num += randInt(0, 9); for (let c = 0; c <= 9; c++) { if (luhnCheck(num + c)) return num + c; } return num + '0'; }
export default function FakeCreditCardGenerator() {
  const [count, setCount] = useState(3); const [cards, setCards] = useState<{ type: string; number: string; expiry: string; cvv: string }[]>([]);
  const generate = () => { const c: typeof cards = []; for (let i = 0; i < count; i++) { const t = randItem(CARD_TYPES); c.push({ type: t.name, number: genCardNum(t.prefix, t.len), expiry: String(randInt(1, 12)).padStart(2, '0') + '/' + randInt(25, 30), cvv: String(randInt(100, 999)) }); } setCards(c); };
  const cardColors: Record<string, string> = { Visa: 'from-blue-600 to-blue-800', Mastercard: 'from-orange-500 to-red-600', Amex: 'from-cyan-600 to-blue-700', Discover: 'from-orange-400 to-yellow-600', RuPay: 'from-emerald-600 to-teal-700' };

  const presets = [
    { label: '3 Cards', apply: () => { setCount(3); generate(); } },
    { label: '5 Cards', apply: () => { setCount(5); generate(); } },
    { label: '10 Cards', apply: () => { setCount(10); generate(); } },
    { label: 'Clear', apply: () => { setCards([]); } },
  ];

  const resultText = cards.length > 0 ? 'Generated ' + cards.length + ' test cards (Luhn valid)' : 'Configure and generate';

  const customResult = cards.length > 0 ? (
    <div className="flex flex-col min-h-[200px]">
      <div className="space-y-3 max-h-[350px] overflow-y-auto">
        {cards.map((c, i) => (
          <div key={i} className={'p-4 rounded-xl bg-gradient-to-br ' + (cardColors[c.type] || 'from-zinc-600 to-zinc-800') + ' text-white shadow-md'}>
            <div className="flex justify-between items-start">
              <span className="text-xs font-medium opacity-80">{c.type}</span>
              <span className="text-[10px] opacity-60">CVV: {c.cvv}</span>
            </div>
            <div className="text-lg font-mono tracking-wider mt-3">{c.number.replace(/(\d{4})(?=\d)/g, '$1 ')}</div>
            <div className="flex justify-between mt-3 text-xs opacity-80"><span>Expires: {c.expiry}</span></div>
          </div>
        ))}
        <button onClick={() => { clipboardWrite(cards.map(c => c.number + '|' + c.expiry + '|' + c.cvv).join('\n')).then(ok => { if (ok) toast.success('Copied all!'); else toast.error('Copy blocked by the browser — select the text manually.'); }); }} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Copy All</button>
      </div>
    </div>
  ) : undefined;

  return (
    <CalculatorShell category="Utility"
      title="Fake Credit Card Generator"
      result={resultText}
      customResult={customResult}
      onCalculate={generate}
      calculateLabel="Generate"
      presets={presets}
      accent="amber"
      downloadData={cards.length > 0 ? JSON.stringify(cards, null, 2) : ''}
      downloadFilename="cards.json"
    >
      <div className="space-y-4">
        <Input label="Count" type="number" value={String(count)} onChange={v => setCount(Number(v))} />
      </div>
    </CalculatorShell>
  );
}

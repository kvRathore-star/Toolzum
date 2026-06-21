"use client";

import React, { useState } from 'react';
import { CreditCard, ShieldCheck, RefreshCw, Copy, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

interface CardInfo {
  number: string;
  brand: string;
  cvv: string;
  expiry: string;
  holder: string;
}

export default function CreditCardGenerator() {
  const Disclaimer = () => (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
      <p className="text-xs font-semibold text-amber-500 mb-1">Legal Disclaimer</p>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        This tool generates test card numbers that pass Luhn checksum validation for development and testing purposes only. 
        These numbers are not real, active, or usable for any financial transaction. Use only in sandbox/staging environments. 
        Misuse for fraud, unauthorized transactions, or any illegal activity is strictly prohibited.
      </p>
    </div>
  );
  const [brand, setBrand] = useState('visa');
  const [quantity, setQuantity] = useState(5);
  const [generatedCards, setGeneratedCards] = useState<CardInfo[]>([]);
  const [testNumber, setTestNumber] = useState('');
  const [validationResult, setValidationResult] = useState<{ checked: boolean; valid: boolean; brand: string }>({
    checked: false,
    valid: false,
    brand: ''
  });

  const cardPrefixes: Record<string, string[]> = {
    visa: ['4539', '4556', '4916', '4532', '4929'],
    mastercard: ['51', '52', '53', '54', '55'],
    amex: ['34', '37'],
    discover: ['6011', '644', '65'],
    jcb: ['3528', '3589']
  };

  // Luhn algorithm helper to generate valid checksum
  const generateLuhnCard = (prefix: string, length: number): string => {
    let num = prefix;
    while (num.length < length - 1) {
      num += Math.floor(Math.random() * 10);
    }

    // Calculate checksum digit
    let sum = 0;
    let alternate = true;
    for (let i = num.length - 1; i >= 0; i--) {
      let n = parseInt(num[i], 10);
      if (alternate) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alternate = !alternate;
    }

    const checksum = (10 - (sum % 10)) % 10;
    return num + checksum;
  };

  const validateLuhn = (num: string): boolean => {
    const clean = num.replace(/\D/g, '');
    if (!clean) return false;
    let sum = 0;
    let shouldDouble = false;
    for (let i = clean.length - 1; i >= 0; i--) {
      let digit = parseInt(clean[i], 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  const detectBrand = (num: string): string => {
    const clean = num.replace(/\D/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(clean)) return 'Mastercard';
    if (/^3[47]/.test(clean)) return 'American Express';
    if (/^(6011|622|64|65)/.test(clean)) return 'Discover';
    if (/^35[2-8]/.test(clean)) return 'JCB';
    return 'Unknown';
  };

  const generateCards = () => {
    const list: CardInfo[] = [];
    const len = brand === 'amex' ? 15 : 16;
    const names = ['John Doe', 'Jane Smith', 'Alex Carter', 'Taylor Vane', 'Morgan Reed'];

    for (let i = 0; i < quantity; i++) {
      const prefixes = cardPrefixes[brand];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const num = generateLuhnCard(prefix, len);
      
      // Random expiry (1-5 years in future)
      const expMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
      const expYear = String(new Date().getFullYear() + Math.floor(Math.random() * 5) + 1).slice(-2);
      
      const cvvLen = brand === 'amex' ? 4 : 3;
      let cvv = '';
      for (let c = 0; c < cvvLen; c++) cvv += Math.floor(Math.random() * 10);

      list.push({
        number: num.replace(/(.{4})/g, '$1 ').trim(),
        brand: brand.toUpperCase(),
        cvv,
        expiry: `${expMonth}/${expYear}`,
        holder: names[Math.floor(Math.random() * names.length)]
      });
    }
    setGeneratedCards(list);
    toast.success(`Generated ${quantity} valid cards!`);
  };

  const handleValidate = () => {
    const clean = testNumber.replace(/\D/g, '');
    if (!clean) {
      toast.error('Please enter a card number');
      return;
    }
    const isValid = validateLuhn(clean);
    const b = detectBrand(clean);
    setValidationResult({
      checked: true,
      valid: isValid,
      brand: b
    });
  };

  const handleCopy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    toast.success('Copied!');
  };

  const exportToJson = () => {
    const blob = new Blob([JSON.stringify(generatedCards, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, `test_cards_${brand}.json`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Disclaimer />
      
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-8 rounded-2xl shadow-xl space-y-8">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-indigo-500" />
          Luhn Card Generator & Validator
        </h2>
        <p className="text-xs text-zinc-500 mt-1">Generate valid credit card numbers for staging testing, checkout flow validation, and API testing.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Generator Panel */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-2">Generate Cards</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-bold">Card Brand</label>
              <select value={brand} onChange={e => setBrand(e.target.value)} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-xs outline-none">
                <option value="visa">Visa</option>
                <option value="mastercard">MasterCard</option>
                <option value="amex">American Express</option>
                <option value="discover">Discover</option>
                <option value="jcb">JCB</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-bold">Quantity</label>
              <select value={quantity} onChange={e => setQuantity(parseInt(e.target.value))} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-xs outline-none">
                <option value="5">5 Cards</option>
                <option value="10">10 Cards</option>
                <option value="20">20 Cards</option>
              </select>
            </div>
          </div>

          <button onClick={generateCards} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
            <RefreshCw className="w-4 h-4" />
            Generate Test Cards
          </button>

          {generatedCards.length > 0 && (
            <div className="space-y-3 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-400">Generated Cards</span>
                <button onClick={exportToJson} className="text-[10px] text-indigo-400 font-semibold flex items-center gap-1 hover:underline">
                  <Download className="w-3.5 h-3.5" /> Export JSON
                </button>
              </div>

              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {generatedCards.map((card, idx) => (
                  <div key={idx} className="bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-3 flex justify-between items-center text-xs">
                    <div className="space-y-1 font-mono">
                      <p className="font-bold text-zinc-900 dark:text-white">{card.number}</p>
                      <p className="text-[10px] text-zinc-500">CVV: {card.cvv} | EXP: {card.expiry} | {card.brand}</p>
                    </div>
                    <button onClick={() => handleCopy(`${card.number.replace(/\s/g, '')} | ${card.expiry} | ${card.cvv}`)} className="p-1.5 text-zinc-400 hover:text-white rounded-lg">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Validator Panel */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-2">Luhn Check Validator</h3>
          
          <div className="space-y-2">
            <label className="text-xs text-zinc-400 font-bold">Credit Card Number</label>
            <input 
              type="text" 
              value={testNumber}
              onChange={e => {
                setTestNumber(e.target.value);
                setValidationResult(prev => ({ ...prev, checked: false }));
              }}
              placeholder="Paste credit card number to validate..."
              className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-xs outline-none"
            />
          </div>

          <button onClick={handleValidate} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
            <ShieldCheck className="w-4 h-4" />
            Check Checksum
          </button>

          {validationResult.checked && (
            <div className={`p-4 border rounded-xl flex items-center justify-between gap-3 text-xs ${
              validationResult.valid 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
            }`}>
              <div>
                <p className="font-bold">{validationResult.valid ? 'Valid Checksum (Luhn Passed)' : 'Invalid Checksum (Luhn Failed)'}</p>
                <p className="text-[10px] opacity-80 mt-0.5">Detected Brand: {validationResult.brand}</p>
              </div>
              <ShieldCheck className="w-8 h-8 flex-shrink-0" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useState, useEffect } from 'react';
import { ArrowUpDown, RefreshCw, History, TrendingUp, Search, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ExchangeRates {
  [key: string]: number;
}

const POPULAR_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' }
];

// Offline fallback rates relative to 1 USD (May 2026 approximate rates)
const FALLBACK_RATES: ExchangeRates = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.5,
  AUD: 1.51,
  CAD: 1.36,
  SGD: 1.35,
  JPY: 156.0,
  CNY: 7.24,
  CHF: 0.91,
  AED: 3.67,
  NZD: 1.63
};

export default function CurrencyConverter() {
  const [rates, setRates] = useState<ExchangeRates>(FALLBACK_RATES);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  const [amount, setAmount] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('INR');
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [history, setHistory] = useState<{from: string, to: string, amount: number, result: number, date: string}[]>([]);

  // Fetch rates on mount
  useEffect(() => {
    fetchRates();
    // Load history from localStorage
    const saved = localStorage.getItem('currency_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!res.ok) throw new Error('Failed to fetch from API');
      const data = await res.json() as any;
      if (data && data.rates) {
        setRates(data.rates);
        const dateStr = new Date(data.time_last_update_utc).toLocaleString();
        setLastUpdated(dateStr);
        toast.success('Rates updated successfully!');
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') console.warn('Using offline fallback rates:', error);
      setLastUpdated('Offline (Using Fallback Rates)');
      toast.error('Network error. Using offline fallback rates.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getConversionRate = () => {
    const fromRate = rates[fromCurrency] || FALLBACK_RATES[fromCurrency] || 1;
    const toRate = rates[toCurrency] || FALLBACK_RATES[toCurrency] || 1;
    // convert from FROM to USD, then from USD to TO
    return toRate / fromRate;
  };

  const convert = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return 0;
    return numAmount * getConversionRate();
  };

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();
    const result = convert();
    if (result > 0) {
      const newEntry = {
        from: fromCurrency,
        to: toCurrency,
        amount: parseFloat(amount),
        result: result,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const updatedHistory = [newEntry, ...history.slice(0, 4)];
      setHistory(updatedHistory);
      localStorage.setItem('currency_history', JSON.stringify(updatedHistory));
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('currency_history');
  };

  // Filter currency lists based on search
  const allRatesKeys = Object.keys(rates);
  const filteredFrom = allRatesKeys.filter(code => 
    code.toLowerCase().includes(searchFrom.toLowerCase())
  );
  const filteredTo = allRatesKeys.filter(code => 
    code.toLowerCase().includes(searchTo.toLowerCase())
  );

  const finalResult = convert();
  const conversionRate = getConversionRate();

  // Multipliers for quick conversions grid
  const multipliers = [1, 5, 10, 50, 100, 500, 1000];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 p-4 border border-zinc-200 dark:border-white/5 rounded-2xl gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Live Currency Converter
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Convert between 160+ currencies with real-time accuracy</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-400 self-end sm:self-auto">
          <span>Rates updated: <strong className="text-zinc-600 dark:text-zinc-300">{lastUpdated || 'Loading...'}</strong></span>
          <button 
            onClick={fetchRates} 
            disabled={loading}
            className="p-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded-lg text-zinc-700 dark:text-[var(--text-secondary)] transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Converter Panel */}
        <form onSubmit={handleConvert} className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
            
            {/* Amount */}
            <div className="md:col-span-3 space-y-1">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Amount</label>
              <input 
                type="number" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                min="0.01" 
                step="any"
                className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 focus:border-[var(--border-subtle)] dark:focus:border-zinc-700 rounded-xl px-4 py-3.5 text-zinc-900 dark:text-white text-lg font-bold outline-none transition-colors"
                required
              />
            </div>

            {/* Swap Button for mobile */}
            <div className="md:hidden flex justify-center py-2">
              <button 
                type="button" 
                onClick={handleSwap} 
                className="p-3 bg-[var(--bg-overlay)] dark:bg-zinc-800 rounded-full hover:bg-zinc-200 dark:hover:bg-[var(--bg-elevated)] transition-all text-zinc-600 dark:text-zinc-300 shadow-md active:scale-95"
                aria-label="Swap"
              >
                <ArrowUpDown className="w-5 h-5" />
              </button>
            </div>

            {/* From */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">From</label>
              <div className="relative">
                <select 
                  value={fromCurrency} 
                  onChange={e => setFromCurrency(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-900 dark:text-white text-sm outline-none appearance-none"
                >
                  {POPULAR_CURRENCIES.map(c => (
                    <option key={`from-pop-${c.code}`} value={c.code}>{c.code} - {c.name}</option>
                  ))}
                  <option disabled>──────────</option>
                  {allRatesKeys.map(code => (
                    <option key={`from-${code}`} value={code}>{code}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
                  ▼
                </div>
              </div>
            </div>

            {/* Swap Button for desktop */}
            <div className="hidden md:flex justify-center items-center h-full pt-5">
              <button 
                type="button" 
                onClick={handleSwap} 
                className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all text-zinc-600 dark:text-zinc-300 shadow-sm hover:shadow-md cursor-pointer active:scale-95"
                title="Swap Currencies" aria-label="Swap"
              >
                <ArrowUpDown className="w-4 h-4 rotate-90" />
              </button>
            </div>

            {/* To */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">To</label>
              <div className="relative">
                <select 
                  value={toCurrency} 
                  onChange={e => setToCurrency(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-900 dark:text-white text-sm outline-none appearance-none"
                >
                  {POPULAR_CURRENCIES.map(c => (
                    <option key={`to-pop-${c.code}`} value={c.code}>{c.code} - {c.name}</option>
                  ))}
                  <option disabled>──────────</option>
                  {allRatesKeys.map(code => (
                    <option key={`to-${code}`} value={code}>{code}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
                  ▼
                </div>
              </div>
            </div>

          </div>

          <button 
            type="submit" 
            className="w-full bg-zinc-950 dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl shadow-lg transition-all hover:bg-zinc-800 dark:hover:bg-zinc-100 cursor-pointer active:scale-[0.99] text-base"
          >
            Convert Currency
          </button>

          {/* Results Box */}
          {finalResult > 0 && (
            <div className="bg-zinc-50 dark:bg-black/35 border border-[var(--border-subtle)]/50 dark:border-zinc-800/80 rounded-2xl p-6 space-y-4 animate-in fade-in duration-300">
              <div className="space-y-1">
                <span className="text-sm font-semibold text-zinc-400">
                  {parseFloat(amount).toLocaleString()} {fromCurrency} =
                </span>
                <h3 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
                  {finalResult.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {toCurrency}
                </h3>
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 flex flex-col sm:flex-row sm:justify-between text-xs text-zinc-400 gap-2">
                <span>1 {fromCurrency} = {conversionRate.toFixed(6)} {toCurrency}</span>
                <span>1 {toCurrency} = {(1 / conversionRate).toFixed(6)} {fromCurrency}</span>
              </div>
            </div>
          )}
        </form>

        {/* Quick rates grid & history */}
        <div className="space-y-6">
          {/* Quick Rates Table */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Quick Conversions
            </h3>
            
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 max-h-[220px] overflow-y-auto pr-1">
              {multipliers.map(mult => (
                <div key={mult} className="flex justify-between py-2 text-xs">
                  <span className="text-zinc-500 font-medium">{mult.toLocaleString()} {fromCurrency}</span>
                  <span className="text-zinc-900 dark:text-zinc-200 font-bold">
                    {(mult * conversionRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toCurrency}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* History Panel */}
          {history.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl shadow-xl space-y-3">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <History className="w-4 h-4 text-blue-400" />
                  Recent History
                </h3>
                <button 
                  onClick={clearHistory}
                  className="text-[10px] font-bold text-rose-500 hover:underline tracking-wide uppercase cursor-pointer"
                >
                  Clear
                </button>
              </div>

              <div className="space-y-2">
                {history.map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2.5 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-100 dark:border-zinc-800/30">
                    <div className="space-y-0.5">
                      <div className="font-bold text-zinc-800 dark:text-[var(--text-secondary)]">
                        {entry.amount.toLocaleString()} {entry.from} ➔ {entry.result.toLocaleString(undefined, { maximumFractionDigits: 2 })} {entry.to}
                      </div>
                      <div className="text-[10px] text-zinc-400">Rate: { (entry.result / entry.amount).toFixed(4) }</div>
                    </div>
                    <span className="text-[10px] text-zinc-400 bg-zinc-200/50 dark:bg-zinc-800 px-2 py-0.5 rounded-full font-medium">{entry.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

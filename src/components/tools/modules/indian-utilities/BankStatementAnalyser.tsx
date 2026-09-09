"use client";

import React, { useState, useMemo } from 'react';
import { Upload, Download, TrendingUp, TrendingDown, PieChart, Calendar, ArrowUpRight, ArrowDownRight, Filter, Search, Banknote, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  balance: number;
  category: string;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Food & Dining': ['swiggy', 'zomato', 'restaurant', 'hotel', 'cafe', 'food', 'dining', 'eat', 'mcdonald', 'domino', 'pizza', 'dosa', 'tiffin'],
  'Shopping': ['amazon', 'flipkart', 'myntra', 'meesho', 'ajio', 'nykaa', 'shopping', 'cloth', 'fashion', 'lifestyle', 'tata cliq'],
  'Transport': ['uber', 'ola', 'rapido', 'metro', 'bus', 'petrol', 'fuel', 'indian oil', 'bharat petroleum', 'hpc', 'parking', 'toll'],
  'Entertainment': ['netflix', 'prime video', 'hotstar', 'jio cinema', 'spotify', 'youtube', 'bookmyshow', 'movie', 'game', 'playstation'],
  'Bills & Utilities': ['electricity', 'water', 'gas', 'broadband', 'airtel', 'jio', 'vi', 'bsnl', 'phone bill', 'mobile recharge', 'dth'],
  'Healthcare': ['hospital', 'doctor', 'clinic', 'pharmacy', 'medicin', 'apollo', 'diagnostic', 'health', 'insurance'],
  'Education': ['fee', 'school', 'college', 'university', 'course', 'udemy', 'coursera', 'byju', 'vedantu', 'class', 'tution'],
  'EMI & Loans': ['emi', 'loan', 'hdfc loan', 'sbi loan', 'icici loan', 'bajaj finance', 'credit card bill'],
  'Transfers': ['neft', 'imps', 'upi', 'rtgs', 'transfer', 'paytm', 'phonepe', 'google pay', 'gpay', 'bhim'],
  'Salary & Income': ['salary', 'credit salary', 'income', 'freelance', 'payment received', 'refund', 'dividend'],
};

function categorizeTransaction(description: string): string {
  const lower = description.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return category;
  }
  if (/(credit|cr|deposit)/i.test(lower) && !/(debit|dr|withdraw)/i.test(lower)) return 'Income';
  return 'Other';
}

function parseStatement(text: string): { transactions: Transaction[]; error?: string } {
  const lines = text.split('\n').filter(l => l.trim());
  const transactions: Transaction[] = [];

  const patterns = [
    // Date | Description | Debit | Credit | Balance
    /^(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\s*[|,\t]\s*(.+?)\s*[|,\t]\s*([\d,]+\.?\d*)\s*[|,\t]\s*([\d,]+\.?\d*)?\s*[|,\t]\s*([\d,]+\.?\d*)?/,
    // Date Description Debit Amt Balance
    /^(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\s+(.+?)\s+([\d,]+\.?\d*)\s+(cr|dr|credit|debit)?\s*([\d,]+\.?\d*)?/i,
    // Standard: 01 Apr 2024 Description Rs 1,000.00 Dr 5,000.00
    /^(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})\s+(.+?)\s+(?:rs\.?\s*)?([\d,]+\.?\d*)\s*(dr|cr|debit|credit)?\s*(?:rs\.?\s*)?([\d,]+\.?\d*)?/i,
  ];

  for (const line of lines) {
    let matched = false;
    for (const pattern of patterns) {
      const m = line.match(pattern);
      if (m) {
        const date = m[1] ?? "";
        const desc = (m[2] ?? "").trim();
        const amtStr = (m[3] ?? "").replace(/,/g, '');
        const typeFlag = m[4]?.toLowerCase() || '';
        const balStr = m[5]?.replace(/,/g, '') || '';
        const amount = parseFloat(amtStr);
        const balance = balStr ? parseFloat(balStr) : 0;

        if (isNaN(amount)) continue;

        // Determine credit/debit
        let type: 'credit' | 'debit' = 'debit';
        if (typeFlag === 'cr' || typeFlag === 'credit') type = 'credit';
        // If in credit column (4th column in pipe-delimited)
        if (!typeFlag && m[4] && m[5]) {
          const creditAmt = parseFloat(m[4].replace(/,/g, ''));
          if (!isNaN(creditAmt) && creditAmt > 0 && amount === 0) {
            type = 'credit';
          }
        }

        transactions.push({
          date,
          description: desc,
          amount: Math.abs(amount),
          type,
          balance,
          category: categorizeTransaction(desc),
        });
        matched = true;
        break;
      }
    }
    // Fallback: try extracting date + amount
    if (!matched) {
      const dateMatch = line.match(/^(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/);
      const amtMatch = line.match(/([\d,]+\.\d{2})/g);
      if (dateMatch && amtMatch && amtMatch.length >= 1) {
        const amount = parseFloat(amtMatch[0].replace(/,/g, ''));
        if (!isNaN(amount) && amount > 0) {
          transactions.push({
            date: dateMatch[1] ?? "",
            description: line.slice(dateMatch[0].length).trim().slice(0, 60),
            amount,
            type: 'debit',
            balance: 0,
            category: 'Other',
          });
        }
      }
    }
  }

  if (transactions.length === 0) {
    return { transactions: [], error: 'Could not parse any transactions. Try CSV/PDF export from your bank.' };
  }

  return { transactions };
}

export default function BankStatementAnalyser() {
  const [rawText, setRawText] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setRawText(text.slice(0, 500000)); // cap at 500K chars
      const result = parseStatement(text);
      if (result.error) {
        setError(result.error);
        setTransactions([]);
      } else if (result.transactions.length > 0) {
        setTransactions(result.transactions);
        setError('');
        toast.success(`Parsed ${result.transactions.length} transactions`);
      } else {
        setError('No transactions found. Try a different file format.');
        setTransactions([]);
      }
    };
    reader.readAsText(file);
  };

  const filteredTxns = useMemo(() => {
    let t = transactions;
    if (dateFilter) t = t.filter(tx => tx.date.includes(dateFilter));
    if (categoryFilter) t = t.filter(tx => tx.category === categoryFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      t = t.filter(tx => tx.description.toLowerCase().includes(q));
    }
    return t;
  }, [transactions, dateFilter, categoryFilter, searchQuery]);

  const stats = useMemo(() => {
    if (transactions.length === 0) return null;
    const credits = transactions.filter(t => t.type === 'credit');
    const debits = transactions.filter(t => t.type === 'debit');
    const totalCredit = credits.reduce((s, t) => s + t.amount, 0);
    const totalDebit = debits.reduce((s, t) => s + t.amount, 0);
    const categorySummary: Record<string, { count: number; total: number }> = {};
    for (const t of transactions) {
      if (t.type === 'debit') {
        if (!categorySummary[t.category]) categorySummary[t.category] = { count: 0, total: 0 };
        categorySummary[t.category]!.count++;
        categorySummary[t.category]!.total += t.amount;
      }
    }
    const topCategories = Object.entries(categorySummary).sort((a, b) => b[1].total - a[1].total);
    const monthly: Record<string, { credit: number; debit: number }> = {};
    for (const t of transactions) {
      const month = t.date.split('/')[1] || t.date.split('-')[1] || '00';
      const year = t.date.split('/')[2]?.slice(-2) || t.date.split('-')[2]?.slice(-2) || '00';
      const key = `${month}/${year}`;
      if (!monthly[key]) monthly[key] = { credit: 0, debit: 0 };
      if (t.type === 'credit') monthly[key].credit += t.amount;
      else monthly[key].debit += t.amount;
    }

    return { totalCredit, totalDebit, netBalance: totalCredit - totalDebit, topCategories, monthly, savingsRate: totalCredit > 0 ? ((totalCredit - totalDebit) / totalCredit * 100) : 0 };
  }, [transactions]);

  const categories = useMemo(() => {
    const set = new Set(transactions.map(t => t.category));
    return Array.from(set).sort();
  }, [transactions]);

  const handleExport = () => {
    if (transactions.length === 0) return;
    const header = 'Date,Description,Type,Amount,Balance,Category';
    const rows = transactions.map(t => `"${t.date}","${t.description.replace(/"/g, '""')}",${t.type},${t.amount.toFixed(2)},${t.balance.toFixed(2)},"${t.category}"`);
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, `analysed_statement_${Date.now()}.csv`);
    toast.success('CSV exported!');
  };

  const maxCategoryTotal = stats ? Math.max(...stats.topCategories.map(([, c]) => c.total)) : 0;

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <Banknote className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Bank Statement Analyser</h3>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        {transactions.length === 0 ? (
          <div>
            <div className="border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-10 text-center hover:border-emerald-500/50 transition-colors cursor-pointer bg-[var(--bg-overlay)]/50 dark:bg-black/20"
              role="button" tabIndex={0} onClick={() => document.getElementById('bs-statement-file')?.click()}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById('bs-statement-file')?.click(); } }}>
              <Upload className="w-12 h-12 mx-auto mb-3 text-[var(--text-muted)]" />
              <p className="text-base font-semibold text-[var(--text-secondary)]">Upload bank statement</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">CSV, TXT — paste raw text below</p>
              <input aria-label="CSV, TXT — paste raw text below" id="bs-statement-file" type="file" accept=".csv,.txt" onChange={handleFile} className="sr-only" />
            </div>
            <div className="mt-4 space-y-1">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Or paste statement text</label>
              <textarea aria-label="Or paste statement text" value={rawText} onChange={e => {
                setRawText(e.target.value);
                if (e.target.value.length > 50) {
                  const result = parseStatement(e.target.value);
                  if (result.transactions.length > 0) {
                    setTransactions(result.transactions);
                    setError('');
                    toast.success(`Parsed ${result.transactions.length} transactions`);
                  }
                }
              }} rows={6} placeholder="Copy-paste your bank statement text here..."
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-emerald-500/30 resize-none font-mono" />
            </div>
            {error && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl mt-3">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[10px] text-amber-600 dark:text-amber-400">{error}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {stats && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 border border-emerald-200 dark:border-emerald-800/30">
                    <p className="text-[9px] text-emerald-600 dark:text-emerald-400 uppercase font-bold">Total Credits</p>
                    <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">₹{stats.totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 border border-red-200 dark:border-red-800/30">
                    <p className="text-[9px] text-red-600 dark:text-red-400 uppercase font-bold">Total Debits</p>
                    <p className="text-lg font-black text-red-600 dark:text-red-400 mt-1">₹{stats.totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800/30">
                    <p className="text-[9px] text-blue-600 dark:text-blue-400 uppercase font-bold">Net Balance</p>
                    <p className={`text-lg font-black mt-1 ${stats.netBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>₹{stats.netBalance.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 border border-purple-200 dark:border-purple-800/30">
                    <p className="text-[9px] text-purple-600 dark:text-purple-400 uppercase font-bold">Savings Rate</p>
                    <p className="text-lg font-black text-purple-600 dark:text-purple-400 mt-1">{stats.savingsRate.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)]">
                    <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-3 flex items-center gap-1.5"><PieChart className="w-3 h-3" /> Spending by Category</h4>
                    <div className="space-y-2">
                      {stats.topCategories.slice(0, 8).map(([cat, data]) => (
                        <div key={cat}>
                          <div className="flex justify-between text-[11px] mb-0.5">
                            <span className="text-zinc-600 dark:text-[var(--text-muted)]">{cat}</span>
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">₹{data.total.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-700 rounded-full" style={{ width: `${(data.total / maxCategoryTotal) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)]">
                    <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-3 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Monthly Summary</h4>
                    <div className="space-y-1.5 max-h-[240px] overflow-y-auto">
                      {Object.entries(stats.monthly).slice(-12).map(([month, data]) => (
                        <div key={month} className="flex items-center gap-2 text-[11px]">
                          <span className="text-[var(--text-secondary)] w-14">{month}</span>
                          <div className="flex-1 flex gap-0.5 h-4">
                            <div className="bg-emerald-400 rounded-l-sm" style={{ flex: data.credit || 0.1 }} title={`Credit: ₹${data.credit}`} />
                            <div className="bg-red-400 rounded-r-sm" style={{ flex: data.debit || 0.1 }} title={`Debit: ₹${data.debit}`} />
                          </div>
                          <span className="text-[var(--text-secondary)] font-mono w-20 text-right">₹{(data.credit - data.debit) > 0 ? '+' : ''}{(data.credit - data.debit).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
                <input aria-label="Search description..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search description..."
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-emerald-500/30" />
              </div>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-zinc-600 dark:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-emerald-500/30">
                <option value="">All categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input aria-label="All categories" type="text" value={dateFilter} onChange={e => setDateFilter(e.target.value)} placeholder="Filter date..."
                className="w-24 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-emerald-500/30" />
              <button onClick={handleExport}
                className="px-3 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
              <button onClick={() => setTransactions([])}
                className="px-3 py-2 bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] rounded-xl text-xs font-semibold hover:bg-[var(--bg-surface)] transition-colors">
                New
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto overflow-x-auto border border-[var(--border-subtle)] rounded-xl">
              <table className="w-full text-xs">
                <thead className="bg-[var(--bg-overlay)] sticky top-0">
                  <tr className="text-[9px] font-bold text-[var(--text-muted)] uppercase">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Description</th>
                    <th className="text-right p-2">Amount</th>
                    <th className="text-center p-2">Type</th>
                    <th className="text-right p-2">Balance</th>
                    <th className="text-left p-2">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filteredTxns.map((t, i) => (
                    <tr key={i} className="hover:bg-[var(--bg-overlay)] dark:hover:bg-black/20 transition-colors">
                      <td className="p-2 text-[var(--text-secondary)] whitespace-nowrap">{t.date}</td>
                      <td className="p-2 text-[var(--text-primary)] max-w-[200px] truncate" title={t.description}>{t.description}</td>
                      <td className={`p-2 text-right font-mono font-semibold ${t.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {t.type === 'credit' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 text-center">
                        <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          t.type === 'credit' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {t.type === 'credit' ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                          {t.type === 'credit' ? 'CR' : 'DR'}
                        </span>
                      </td>
                      <td className="p-2 text-right text-[var(--text-secondary)] font-mono">₹{t.balance.toLocaleString('en-IN')}</td>
                      <td className="p-2"><span className="text-[9px] px-1.5 py-0.5 bg-[var(--bg-surface)] text-[var(--text-secondary)] rounded-full whitespace-nowrap">{t.category}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-3">
              <p className="text-[10px] text-amber-600 dark:text-amber-400">
                <strong>Note:</strong> Parsing accuracy depends on your bank&apos;s statement format. Review transactions for correctness.
                <span className="block mt-1"><strong>Pro:</strong> XLSX/PDF support, AI-powered categorization, spending trend charts (12-month view), export as PDF report, budget alerts, multi-account merge.</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

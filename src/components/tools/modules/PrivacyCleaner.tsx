"use client";

import React, { useState, useEffect } from 'react';
import { Trash2, Shield, Database, Cookie, RefreshCw, Download, AlertTriangle, Search, Globe, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

interface StorageItem {
  key: string;
  value: string;
  type: 'cookie' | 'localStorage' | 'sessionStorage';
  size: number;
}

export default function PrivacyCleaner() {
  const [items, setItems] = useState<StorageItem[]>([]);
  const [scanning, setScanning] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({ cookies: 0, localStorage: 0, sessionStorage: 0, totalSize: 0 });

  const scanStorage = () => {
    setScanning(true);
    setTimeout(() => {
      const found: StorageItem[] = [];
      let totalSize = 0;

      // Scan cookies
      const cookies = document.cookie.split(';');
      for (const c of cookies) {
        const eq = c.indexOf('=');
        if (eq > 0) {
          const key = c.slice(0, eq).trim();
          const value = c.slice(eq + 1).trim();
          const size = key.length + value.length;
          totalSize += size;
          found.push({ key, value: value.slice(0, 100), type: 'cookie', size });
        }
      }

      // Scan localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key) || '';
          const size = key.length + value.length;
          totalSize += size;
          found.push({ key, value: value.slice(0, 100), type: 'localStorage', size });
        }
      }

      // Scan sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          const value = sessionStorage.getItem(key) || '';
          const size = key.length + value.length;
          totalSize += size;
          found.push({ key, value: value.slice(0, 100), type: 'sessionStorage', size });
        }
      }

      setItems(found);
      setStats({
        cookies: found.filter(i => i.type === 'cookie').length,
        localStorage: found.filter(i => i.type === 'localStorage').length,
        sessionStorage: found.filter(i => i.type === 'sessionStorage').length,
        totalSize,
      });
      setScanning(false);
      toast.success(`Found ${found.length} storage items (${(totalSize / 1024).toFixed(1)} KB)`);
    }, 500);
  };

  useEffect(() => { scanStorage(); }, []);

  const clearStorage = () => {
    setCleaning(true);
    setTimeout(() => {
      // Clear cookies by expiring them
      document.cookie.split(';').forEach(c => {
        const eq = c.indexOf('=');
        const key = eq > 0 ? c.slice(0, eq).trim() : c.trim();
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });

      // Clear selected or all localStorage
      const count = localStorage.length;
      localStorage.clear();

      // Clear sessionStorage
      sessionStorage.clear();

      setItems([]);
      setStats({ cookies: 0, localStorage: 0, sessionStorage: 0, totalSize: 0 });
      setCleaning(false);
      toast.success(`Cleared all storage! (${count} items removed)`);
    }, 300);
  };

  const filteredItems = items.filter(i =>
    i.key.toLowerCase().includes(search.toLowerCase()) ||
    i.value.toLowerCase().includes(search.toLowerCase())
  );

  const domain = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Privacy Cleaner</h3>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          View and clear your browser storage for this site. Cookies, localStorage, sessionStorage — all in one place. Everything runs locally, nothing leaves your device.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-zinc-50 dark:bg-black/30 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800 text-center">
            <Cookie className="w-4 h-4 mx-auto text-orange-500 mb-1" />
            <p className="text-lg font-black text-zinc-800 dark:text-white">{stats.cookies}</p>
            <p className="text-[9px] text-zinc-500 uppercase">Cookies</p>
          </div>
          <div className="bg-zinc-50 dark:bg-black/30 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800 text-center">
            <Database className="w-4 h-4 mx-auto text-blue-500 mb-1" />
            <p className="text-lg font-black text-zinc-800 dark:text-white">{stats.localStorage}</p>
            <p className="text-[9px] text-zinc-500 uppercase">localStorage</p>
          </div>
          <div className="bg-zinc-50 dark:bg-black/30 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800 text-center">
            <Clock className="w-4 h-4 mx-auto text-purple-500 mb-1" />
            <p className="text-lg font-black text-zinc-800 dark:text-white">{stats.sessionStorage}</p>
            <p className="text-[9px] text-zinc-500 uppercase">Session</p>
          </div>
          <div className="bg-zinc-50 dark:bg-black/30 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800 text-center">
            <Globe className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
            <p className="text-lg font-black text-zinc-800 dark:text-white">{(stats.totalSize / 1024).toFixed(1)}</p>
            <p className="text-[9px] text-zinc-500 uppercase">KB Total</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stored items..."
              className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>
          <button onClick={scanStorage} disabled={scanning}
            className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} /> Rescan
          </button>
          <button onClick={clearStorage} disabled={cleaning || items.length === 0}
            className="px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Clear All
          </button>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-[10px] text-amber-600 dark:text-amber-400">
            This clears all data stored by this website in your browser, including login sessions, preferences, and cached data. You may need to log in again.
          </p>
        </div>

        <div className="space-y-1.5 max-h-[350px] overflow-y-auto">
          {filteredItems.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-8">
              {search ? 'No matching items found.' : 'No storage items found. This site is clean!'}
            </p>
          ) : (
            filteredItems.map((item, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 bg-zinc-50 dark:bg-black/30 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase mt-0.5 ${
                  item.type === 'cookie' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                  item.type === 'localStorage' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                }`}>{item.type === 'localStorage' ? 'LS' : item.type === 'sessionStorage' ? 'SS' : 'CK'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 truncate">{item.key}</p>
                  <p className="text-[9px] text-zinc-500 truncate">{item.value}</p>
                </div>
                <span className="text-[9px] text-zinc-400 font-mono shrink-0">{(item.size / 1024).toFixed(2)} KB</span>
              </div>
            ))
          )}
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400">
            <strong>Pro:</strong> Cross-site privacy scan, tracker detection, auto-clean on browser close, scheduled cleanups, privacy score report, export storage report as PDF.
          </p>
        </div>
      </div>
    </div>
  );
}

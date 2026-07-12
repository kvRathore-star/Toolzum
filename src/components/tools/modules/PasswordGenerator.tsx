"use client";
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

export default function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  const generatePassword = () => {
    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    
    if (!charset) {
      toast.error('Select at least one character type');
      return;
    }

    let newPassword = '';
    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
      newPassword += charset[randomValues[i] % charset.length];
    }
    setPassword(newPassword);
  };

  useEffect(() => {
    generatePassword();
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

  const copyToClipboard = () => {
    clipboardWrite(password);
    toast.success("Password copied!");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-8 rounded-2xl shadow-xl space-y-8">
        
        <div className="relative">
          <input 
            type="text" 
            readOnly 
            value={password}
            className="w-full bg-zinc-50 dark:bg-black border-2 border-emerald-500/30 dark:border-emerald-500/50 rounded-xl px-6 py-5 text-2xl font-mono text-zinc-900 dark:text-emerald-400 outline-none text-center tracking-wider"
          />
          <button 
            onClick={copyToClipboard}
            className="absolute right-3 top-3 bottom-3 bg-emerald-500 hover:bg-emerald-600 text-white px-4 rounded-lg font-bold transition-colors"
          >
            COPY
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">Length: {length}</label>
            </div>
            <input 
              type="range" 
              min="4" 
              max="64" 
              value={length} 
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             {[
               { id: 'upper', label: 'Uppercase (A-Z)', state: includeUppercase, set: setIncludeUppercase },
               { id: 'lower', label: 'Lowercase (a-z)', state: includeLowercase, set: setIncludeLowercase },
               { id: 'nums', label: 'Numbers (0-9)', state: includeNumbers, set: setIncludeNumbers },
               { id: 'syms', label: 'Symbols (!@#$)', state: includeSymbols, set: setIncludeSymbols },
             ].map(opt => (
               <label key={opt.id} className="flex items-center space-x-3 bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                 <input 
                   type="checkbox" 
                   checked={opt.state} 
                   onChange={(e) => opt.set(e.target.checked)}
                   className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500"
                 />
                 <span className="font-medium text-zinc-700 dark:text-zinc-300">{opt.label}</span>
               </label>
             ))}
          </div>
        </div>

        <button
          onClick={generatePassword}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 text-lg"
        >
          Generate New Password
        </button>

      </div>
    </div>
  );
}
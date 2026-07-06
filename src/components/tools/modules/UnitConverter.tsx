"use client";

import React, { useState, useMemo, useEffect } from 'react';

const unitTypes = {
  Length: {
    base: 'meters',
    units: {
      meters: 1,
      kilometers: 1000,
      centimeters: 0.01,
      millimeters: 0.001,
      miles: 1609.34,
      yards: 0.9144,
      feet: 0.3048,
      inches: 0.0254,
    }
  },
  Weight: {
    base: 'grams',
    units: {
      grams: 1,
      kilograms: 1000,
      milligrams: 0.001,
      pounds: 453.592,
      ounces: 28.3495,
      stones: 6350.29,
    }
  },
  Temperature: {
    base: 'celsius',
    units: {
      celsius: 'C',
      fahrenheit: 'F',
      kelvin: 'K'
    }
  },
  Data: {
    base: 'bytes',
    units: {
      bytes: 1,
      kilobytes: 1024,
      megabytes: 1048576,
      gigabytes: 1073741824,
      terabytes: 1099511627776,
    }
  }
};

const TYPE_MAP: Record<string, keyof typeof unitTypes> = {
  weight: 'Weight',
  length: 'Length',
  temperature: 'Temperature',
  data: 'Data',
};

export default function UnitConverter() {
  const [category, setCategory] = useState<keyof typeof unitTypes>('Length');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const typeParam = params.get('type');
      if (typeParam && TYPE_MAP[typeParam]) {
        handleCategoryChange(TYPE_MAP[typeParam]);
      }
    }
  }, []);
  
  const [fromUnit, setFromUnit] = useState(Object.keys(unitTypes['Length'].units)[0]);
  const [toUnit, setToUnit] = useState(Object.keys(unitTypes['Length'].units)[1]);
  const [fromValue, setFromValue] = useState<string>('1');

  // Handle category change
  const handleCategoryChange = (cat: keyof typeof unitTypes) => {
    setCategory(cat);
    const keys = Object.keys(unitTypes[cat].units);
    setFromUnit(keys[0]);
    setToUnit(keys[1]);
  };

  const toValue = useMemo(() => {
    if (!fromValue || isNaN(Number(fromValue))) return '';
    const val = Number(fromValue);
    
    if (category === 'Temperature') {
      let c = 0;
      // Convert to Celsius first
      if (fromUnit === 'celsius') c = val;
      if (fromUnit === 'fahrenheit') c = (val - 32) * 5/9;
      if (fromUnit === 'kelvin') c = val - 273.15;
      
      // Convert C to target
      if (toUnit === 'celsius') return c.toFixed(4);
      if (toUnit === 'fahrenheit') return ((c * 9/5) + 32).toFixed(4);
      if (toUnit === 'kelvin') return (c + 273.15).toFixed(4);
    } else {
      const catData = unitTypes[category].units as Record<string, number>;
      const baseValue = val * catData[fromUnit];
      const result = baseValue / catData[toUnit];
      return result % 1 !== 0 ? result.toFixed(6).replace(/\\.?0+$/, '') : result.toString();
    }
  }, [category, fromValue, fromUnit, toUnit]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex justify-center space-x-2 bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded-2xl border border-zinc-200 dark:border-white/5 overflow-x-auto">
        {(Object.keys(unitTypes) as Array<keyof typeof unitTypes>).map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${category === cat ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-600 dark:text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
          
          <div className="col-span-2 space-y-4">
            <input 
              type="number"
              value={fromValue}
              onChange={(e) => setFromValue(e.target.value)}
              className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-6 text-3xl font-bold text-zinc-900 dark:text-white outline-none focus:border-blue-500"
              placeholder="0"
            />
            <select 
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none capitalize cursor-pointer font-medium"
            >
              {Object.keys(unitTypes[category].units).map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <div className="col-span-1 flex justify-center">
            <button 
              onClick={() => {
                const temp = fromUnit;
                setFromUnit(toUnit);
                setToUnit(temp);
                setFromValue(toValue || '0');
              }}
              className="p-4 rounded-full bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-inner active:scale-90"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            </button>
          </div>

          <div className="col-span-2 space-y-4">
            <input 
              type="text"
              value={toValue || ''}
              readOnly
              className="w-full bg-zinc-50/50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl px-4 py-6 text-3xl font-bold text-emerald-400 outline-none"
              placeholder="0"
            />
            <select 
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none capitalize cursor-pointer font-medium"
            >
              {Object.keys(unitTypes[category].units).map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

        </div>
        
        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-white/5 text-center text-sm text-zinc-500 font-medium">
          {fromValue || '0'} {fromUnit} = <span className="text-emerald-400">{toValue || '0'}</span> {toUnit}
        </div>
      </div>
    </div>
  );
}

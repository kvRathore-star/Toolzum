"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Barcode, Download, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import JsBarcode from 'jsbarcode';
import { downloadOrShare } from '@/utils/nativeShare';

export default function BarcodeGenerator() {
  const [value, setValue] = useState('123456789012');
  const [format, setFormat] = useState('CODE128');
  const [displayValue, setDisplayValue] = useState(true);
  const [barWidth, setBarWidth] = useState(2);
  const [barHeight, setBarHeight] = useState(80);
  
  const svgRef = useRef<SVGSVGElement | null>(null);

  const generateBarcode = () => {
    if (!value.trim()) {
      toast.error('Please enter barcode value');
      return;
    }

    try {
      if (svgRef.current) {
        JsBarcode(svgRef.current, value, {
          format: format,
          displayValue: displayValue,
          width: barWidth,
          height: barHeight,
          background: 'transparent',
          lineColor: '#ffffff'
        });
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Invalid value formatting for selected barcode standard.');
    }
  };

  useEffect(() => {
    generateBarcode();
  }, [value, format, displayValue, barWidth, barHeight]);

  const downloadBarcode = () => {
    const svg = svgRef.current;
    if (!svg) return;

    // Convert SVG to XML String
    const svgString = new XMLSerializer().serializeToString(svg);
    // Replace transparent background with solid white for high compatibility download
    const coloredSvg = svgString.replace('background:transparent', 'background:#ffffff').replace('#ffffff', '#000000');
    
    const blob = new Blob([coloredSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    downloadOrShare(url, `barcode_${format}_${value}.svg`);
    toast.success('Barcode SVG downloaded!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-overlay)] p-5 border border-zinc-200 dark:border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <Barcode className="w-5 h-5 text-[var(--accent)]" />
          Multi-Format Barcode Generator
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Generate vector standard barcodes offline (CODE128, EAN, UPC, CODE39) for printing and inventory.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--border-subtle)] pb-2">Configuration</h3>
          
          <div className="space-y-2">
            <label className="text-xs text-[var(--text-muted)] font-bold uppercase">Barcode Value</label>
            <input 
              type="text" 
              value={value} 
              onChange={e => setValue(e.target.value)}
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-xs outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-[var(--text-muted)] font-bold uppercase">Symbology Format</label>
              <select value={format} onChange={e => setFormat(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] text-xs outline-none">
                <option value="CODE128">CODE128 (General)</option>
                <option value="EAN13">EAN-13 (International)</option>
                <option value="UPC">UPC-A (Retail)</option>
                <option value="CODE39">CODE39 (Alphanumeric)</option>
                <option value="ITF">ITF (Interleaved 2 of 5)</option>
              </select>
            </div>
            
            <div className="space-y-1 flex items-center pt-5">
              <label className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={displayValue} onChange={e => setDisplayValue(e.target.checked)} className="rounded" />
                Show Code Text
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-zinc-800 pt-3">
            <div>
              <label className="text-[10px] text-[var(--text-muted)] font-bold">Bar Width ({barWidth}px)</label>
              <input type="range" min="1" max="4" step="1" value={barWidth} onChange={e => setBarWidth(parseInt(e.target.value))} className="w-full accent-indigo-600" />
            </div>
            <div>
              <label className="text-[10px] text-[var(--text-muted)] font-bold">Bar Height ({barHeight}px)</label>
              <input type="range" min="40" max="150" value={barHeight} onChange={e => setBarHeight(parseInt(e.target.value))} className="w-full accent-indigo-600" />
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl flex flex-col justify-between items-center min-h-[250px]">
          <div className="flex-1 flex items-center justify-center w-full p-4 bg-[var(--bg-overlay)] dark:bg-zinc-950 border border-[var(--border-subtle)] rounded-xl">
            <svg ref={svgRef} className="max-w-full h-auto" />
          </div>

          <button onClick={downloadBarcode} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
            <Download className="w-4 h-4" /> Download Barcode (SVG)
          </button>
        </div>
      </div>
    </div>
  );
}
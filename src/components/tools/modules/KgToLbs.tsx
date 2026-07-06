"use client";
import { useEffect } from 'react';
import Link from 'next/link';
import { Scale } from 'lucide-react';

export default function KgToLbsRedirect() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots'; meta.content = 'noindex';
    document.head.appendChild(meta);
    const t = setTimeout(() => window.location.replace('/tools/unit-converter'), 3000);
    return () => { clearTimeout(t); meta.remove(); };
  }, []);

  return (
    <div className="max-w-2xl mx-auto text-center py-24 animate-in fade-in duration-500">
      <Scale className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Kg to Lbs Converter has moved</h2>
      <p className="text-sm text-zinc-500 mb-4">Weight conversions are now in the <strong>Unit Converter</strong> — covering length, weight, temperature, and data all in one tool.</p>
      <Link href="/tools/unit-converter" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors">Go to Unit Converter</Link>
      <p className="text-[10px] text-zinc-400 mt-4">Redirecting in 3 seconds...</p>
    </div>
  );
}

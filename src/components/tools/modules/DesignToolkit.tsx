import React from 'react';
import Link from 'next/link';

export default function DesignToolkit() {
  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500 text-center py-12">
      <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">Design Tools</h3>
      <p className="text-sm text-zinc-500">These design tools are now available as standalone tools:</p>
      <div className="flex flex-col gap-3 items-center">
        <Link href="/tools/border-css-generator" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all">Border CSS Generator</Link>
        <Link href="/tools/typography-preview" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all">Typography Preview</Link>
      </div>
    </div>
  );
}


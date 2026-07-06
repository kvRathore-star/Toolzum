"use client";
import { useEffect } from 'react';
import Link from 'next/link';
import { FileText } from 'lucide-react';

export default function OrganizePdfRedirect() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots'; meta.content = 'noindex';
    document.head.appendChild(meta);
    const t = setTimeout(() => window.location.replace('/tools/pdf-page-manager'), 3000);
    return () => { clearTimeout(t); meta.remove(); };
  }, []);
  return (
    <div className="max-w-2xl mx-auto text-center py-24 animate-in fade-in duration-500">
      <FileText className="w-12 h-12 text-blue-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Organize PDF Pages has moved</h2>
      <p className="text-sm text-zinc-500 mb-4">Now part of the <strong>PDF Page Manager</strong> — crop, organize, extract, rotate, and delete pages in one tool.</p>
      <Link href="/tools/pdf-page-manager" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-colors">Go to PDF Page Manager</Link>
      <p className="text-[10px] text-zinc-400 mt-4">Redirecting in 3 seconds...</p>
    </div>
  );
}

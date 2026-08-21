import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface LinkCardProps {
  slug: string;
  name: string;
  description: string;
  category: string;
}

export function LinkCard({ slug, name, description, category }: LinkCardProps) {
  return (
    <Link
      href={`/${category}/${slug}/`}
      className="block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-4 rounded-xl space-y-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
    >
      <div className="flex items-center gap-1.5">
        <h5 className="text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:underline">{name}</h5>
        <ExternalLink className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400 shrink-0" />
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{description}</p>
    </Link>
  );
}

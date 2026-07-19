"use client";
import React from 'react';
import { LinkCard } from '@/components/tools/LinkCard';

const tools = [
  { slug: 'ulid-generator', name: 'ULID Generator', description: 'Generate time-ordered ULID identifiers with Crockford base32 encoding.', category: 'utility' },
  { slug: 'numeronym-generator', name: 'Numeronym Generator', description: 'Convert words to numeronyms (a11y-style) and acronyms.', category: 'utility' },
  { slug: 'mac-vendor-lookup', name: 'MAC Vendor Lookup', description: 'Look up device manufacturer from MAC address OUI prefix.', category: 'utility' },
];

export default function MiniGenerators() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Mini Generators</h1>
        <p className="text-zinc-400 mt-2">ULID, numeronyms, and MAC vendor lookup — each tool opens in its own page.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map(tool => (
          <LinkCard key={tool.slug} {...tool} />
        ))}
      </div>
    </div>
  );
}

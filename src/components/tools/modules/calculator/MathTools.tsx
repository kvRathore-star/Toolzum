"use client";
import React from 'react';
import { LinkCard } from '@/components/tools/LinkCard';

const tools = [
  { slug: 'eta-calculator', name: 'ETA Calculator', description: 'Estimate travel time from distance and speed — with optional arrival time.', category: 'utility' },
  { slug: 'scientific-calculator', name: 'Scientific Calculator', description: 'Evaluate math expressions with sin, cos, tan, log, sqrt and keypad.', category: 'calculator' },
  { slug: 'stopwatch', name: 'Stopwatch', description: 'Precision stopwatch with start, stop, lap recording, and lap-time table.', category: 'developer' },
];

export default function MathTools() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Math Tools</h1>
        <p className="text-[var(--text-muted)] mt-2">Calculator, travel ETA, and stopwatch — each tool opens in its own page.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map(tool => (
          <LinkCard key={tool.slug} {...tool} />
        ))}
      </div>
    </div>
  );
}

"use client";
import React from 'react';
import { Calculator, Ruler, FileImage, FileArchive } from 'lucide-react';

const sectionBtn = "inline-flex items-center gap-2 px-3 py-2 text-[11px] font-bold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-default";

interface HubCard {
  name: string;
  slug: string;
  desc: string;
  icon: React.ElementType;
  path?: string;
}

function ToolCard({ name, slug, desc, icon: Icon, path }: HubCard) {
  const href = path || `/utility/${slug}/`;
  return (
    <a href={href}
      className="group flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-md">
      <span className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
        <Icon className="w-4 h-4" />
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{name}</div>
        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{desc}</div>
      </div>
    </a>
  );
}

export default function CalcFileKit() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Calculators &amp; Converters</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
          Study, test score, ring size, shoe size, screen size calculators and more — all running locally in your browser.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Calculator className="w-3.5 h-3.5" /> Calculators</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="Study Time Calculator" slug="study-time-calculator" desc="Calculate total study hours and monthly projections." icon={Calculator} />
          <ToolCard name="Test Score Calculator" slug="test-score-calculator" desc="Convert correct answers to percentage and letter grade." icon={Calculator} />
          <ToolCard name="Words Per Page Calculator" slug="words-per-page-calculator" desc="Estimate page count from word count and font size." icon={Calculator} />
          <ToolCard name="Working Capital Calculator" slug="working-capital-calculator" desc="Calculate gross profit, net income, and margin." icon={Calculator} />
          <ToolCard name="Tip Calculator" slug="tip-calculator" desc="Calculate tip and split bills among multiple people." icon={Calculator} path="/finance/tip-calculator/" />
          <ToolCard name="Triangle Area Calculator" slug="triangle-area-calculator" desc="Calculate triangle area from base and height." icon={Calculator} path="/finance/triangle-area-calculator/" />
          <ToolCard name="Pythagorean Theorem Calculator" slug="pythagorean-theorem-calculator" desc="Calculate the hypotenuse of a right triangle." icon={Calculator} path="/finance/pythagorean-theorem-calculator/" />
          <ToolCard name="Scientific Calculator" slug="scientific-calculator" desc="Full scientific calculator with trig, log, and more." icon={Calculator} path="/developer/scientific-calculator/" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Ruler className="w-3.5 h-3.5" /> Size Converters</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="Ring Size Converter" slug="ring-size-converter" desc="Convert inner diameter in mm to US ring sizes." icon={Ruler} />
          <ToolCard name="Screen Size Calculator" slug="screen-size-converter" desc="Calculate width, height, and area from diagonal." icon={Ruler} />
          <ToolCard name="Shoe Size Converter" slug="shoe-size-converter" desc="Convert between US and UK shoe sizes." icon={Ruler} />
          <ToolCard name="Volume Converter" slug="volume-converter" desc="Convert between liters, gallons, cups, and more." icon={Ruler} path="/utility/volume-converter/" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><FileArchive className="w-3.5 h-3.5" /> File Tools</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="ZIP File Extractor" slug="zip-file-extractor" desc="View ZIP archive contents and file sizes." icon={FileArchive} />
        </div>
      </div>
    </div>
  );
}

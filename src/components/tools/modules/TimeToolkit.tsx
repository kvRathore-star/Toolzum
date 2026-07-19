"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, Hourglass, Clipboard, ExternalLink } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'date' | 'convert' | 'time';

export default function TimeToolkit() {
  const [tab, setTab] = useState<Tab>('date');
  const TabBtn = ({ v, label, icon: Icon }: { v: Tab; label: string; icon: React.ElementType }) => (
    <button onClick={() => setTab(v)} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${tab === v ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-800/50 p-1.5 rounded-xl w-fit">
        <TabBtn v="date" label="Date Math" icon={Calendar} />
        <TabBtn v="convert" label="Converters" icon={Clock} />
        <TabBtn v="time" label="Time Math" icon={Hourglass} />
      </div>
      {tab === 'date' && <DateMathTab />}
      {tab === 'convert' && <ConvertersTab />}
      {tab === 'time' && <TimeMathTab />}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
      <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{title}</h5>
      {children}
    </div>
  );
}

function Inp({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-zinc-500">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
    </div>
  );
}

function Output({ value }: { value: string }) {
  if (!value) return null;
  return (
    <div className="relative">
      <pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 break-all whitespace-pre-wrap max-h-48 overflow-y-auto">{value}</pre>
      <button onClick={() => { clipboardWrite(value); toast.success('Copied!'); }} className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"><Clipboard className="w-3 h-3" /> Copy</button>
    </div>
  );
}

const LinkCard = ({ title, slug, desc }: { title: string; slug: string; desc: string }) => (
  <Link href={`/developer/${slug}`} className="block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all group">
    <div className="flex items-center gap-1">
      <h5 className="text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:underline">{title}</h5>
      <ExternalLink className="w-3 h-3 text-blue-400 shrink-0" />
    </div>
    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
  </Link>
);

function DateMathTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <LinkCard title="Date Addition Calculator" slug="date-addition-calculator" desc="Add or subtract days from any date. Get the resulting date instantly for deadlines, scheduling, and planning." />
      <LinkCard title="Date Difference Calculator" slug="date-difference-calculator" desc="Calculate the exact difference between two dates in days, hours, minutes, and seconds." />
      <LinkCard title="Week Number Calculator" slug="week-number-calculator" desc="Find the ISO week number for any date. Shows day of the week and current week of the year." />
    </div>
  );
}

function ConvertersTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <LinkCard title="Unix Time Converter" slug="unix-time-converter" desc="Convert Unix timestamps to human-readable dates and back. Shows UTC, ISO 8601, and locale formats." />
      <LinkCard title="Time Converter" slug="time-converter" desc="Convert between milliseconds, seconds, minutes, hours, and days. Includes Unix timestamp and duration conversions." />
      <LinkCard title="Minutes to Hours Converter" slug="minutes-to-hours-converter" desc="Convert minutes to hours and minutes format. Shows decimal hours equivalent for payroll and billing." />
    </div>
  );
}

function TimeMathTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <LinkCard title="Time Addition Calculator" slug="time-addition-calculator" desc="Add or subtract hours and minutes from a starting time. Perfect for scheduling, project planning, and time tracking." />
      <LinkCard title="Time Duration Calculator" slug="time-duration-calculator" desc="Calculate the exact duration between two times. Handles overnight time spans and displays hours, minutes, seconds." />
    </div>
  );
}

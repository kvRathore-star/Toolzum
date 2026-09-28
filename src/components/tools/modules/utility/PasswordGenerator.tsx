"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { downloadOrShare } from '@/utils/nativeShare';
import { ToolPresetBar, type PresetOption } from '@/components/tools/ToolPresetBar';

type CharSet = 'upper' | 'lower' | 'numbers' | 'symbols';

const PRESETS: PresetOption[] = [
  { label: 'Web Login', description: '16 chars, all types' },
  { label: 'Bank/Secure', description: '24 chars, full complexity' },
  { label: 'App Password', description: '12 chars, readable' },
  { label: 'PIN Code', description: '6 digits' },
];

const PRESET_CONFIG: Record<string, Partial<Options>> = {
  'Web Login': { length: 16, upper: true, lower: true, numbers: true, symbols: true, excludeAmbiguous: false },
  'Bank/Secure': { length: 24, upper: true, lower: true, numbers: true, symbols: true, excludeAmbiguous: false },
  'App Password': { length: 12, upper: false, lower: true, numbers: true, symbols: false, excludeAmbiguous: true },
  'PIN Code': { length: 6, upper: false, lower: false, numbers: true, symbols: false, excludeAmbiguous: true },
};

interface Options {
  length: number;
  upper: boolean;
  lower: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

function calcEntropy(password: string, options: Options): number {
  let pool = 0;
  if (options.upper) pool += 26;
  if (options.lower) pool += 26;
  if (options.numbers) pool += 10;
  if (options.symbols) pool += 32;
  if (pool === 0) return 0;
  return Math.round(password.length * Math.log2(pool));
}

function getStrength(entropy: number): { label: string; color: string; bg: string } {
  if (entropy >= 120) return { label: 'Strong', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-700' };
  if (entropy >= 80) return { label: 'Good', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-500' };
  if (entropy >= 60) return { label: 'Fair', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-500' };
  return { label: 'Weak', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-500' };
}

function generatePassword(opts: Options): string {
  let charset = '';
  if (opts.upper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (opts.lower) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (opts.numbers) charset += '0123456789';
  if (opts.symbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

  if (opts.excludeAmbiguous) {
    charset = charset.replace(/[Il1O0]/g, '');
  }

  if (!charset) return '';

  const values = new Uint32Array(opts.length);
  window.crypto.getRandomValues(values);
  return Array.from(values).map(v => charset[v % charset.length]).join('');
}

// Compact wordlist for memorable passphrases (EFF-style: common,
// unambiguous, 4-8 lowercase letters). ~11 bits of entropy per word.
const WORDLIST = (
  'amber anchor apple april arrow ash atlas bacon badge bakery banana banner barley basil beach beard beast begin bench berry birch blade blanket blast blaze bloom blush board bonus boost booth bound breeze brick bridge bright brisk bronze brook brown brush bundle burst butter cabin cable cactus camel candy canyon cargo carpet carry castle cattle cedar chain chair chalk charm chart chase cherry chest chicken chief child choir cider city civil claim class clean clear cliff climb clock cloud clover coach coast cobra cocoa comet comfort comic compass copper coral couch cough count court cousin cover crack craft crash crater crawl crazy cream creek crest cricket crisis crisp cross crowd crown crude crush crust crystal curve cycle daily dairy daisy dance debut decay decor delay delta dense depot depth diary digital dinner diode direct dodge doing dolphin donor dozen draft drain drama dream dress drift drink drive drone drop drum dry duck dune dwarf eager eagle early earth eight elbow elder elect elite ember empty enact end enemy enjoy enter entry equal equip essay estate ethnic evoke exact exist extra fabric faint fairy faith fancy farmer fault favor fence festival fever fiber field fifth fifty fight final finger finish fire first flame flash fleet flesh flight flip float flock floor flour fluid focus force forest forge forget fork form fortune forum found frame fresh friend fringe frost fruit fuel funny giant given glass globe glory glove going gold good goose gorge glad gleam glide global glow gown grab grade grain grand grant grape grass grave great green greet grief grill grind grove grow guard guess guest guide guild habit happy harbor harsh hasty heart heavy hedge hello hidden hill hobby honey honor horse hotel house human hurry ideal image index inner input ivory jacket jaguar jelly jewel join judge juice jungle jumbo jump junior junk just keen keep kernel kitten knife knock known label labor ladder lamp land large laser latch later laugh layer learn least leave legal lemon level light limit linen lion liquid list listen little lively liver local lodge logic lonely long look loud lounge love loyal lucky lunar lunch magic major maker march marry match maybe mayor meadow medal media melody melt member memory mental mentor merry metal meter metro micro mid might minor minus minute mirror misery missed mix mobile model modem modern moisture money month moon moral motor mount mouse mouth movie music naive narrow nasty nation nature near neat never night noble noise north novel nurse ocean october offer often older olive ombre onion opera orbit order organ other otter ought outer owner oxide oyster pace pack paddle page paint pair palace palm panel panic paper parade parcel park parrot party pasta patch path pause peace peach pearl pedal penny pepper perch phase phone photo piano pick picnic piece pilot pinch pine pitch pizza place plain plumb plaza point polar porch pound power press price pride prime print prize proof proud prove pulse punch pupil puppy purple purse push puzzle quail quality quart queen query quest queue quick quiet quilt quite quota quote rabbit radar radio rain raise rally ranch random range rapid ratio reach ready realm rebel recipe reduce refer renew reply rider ridge rifle right rigid rinse risen river road roast robin robot rocket roman roof room root rope rose round route royal ruby ruler rumor rural salad salmon salon salsa salty sand scale scene score scout scrap screen screw sense serve seven shade shaft shake shall shame shape share shark sharp sheep sheet shelf shell shift shine shiny shirt shock shore short shout shown sight silly silver since sixth skill skirt sleep slice slide slim slope small smart smell smile smoke snack snake sneak solar solid solve sorry sound south space spare spark speak speed spell spend spice spill spine split spoke sport staff stage stair stand start state steam steel steep stick still stock stone stood store storm story stove strap straw stray stream street stress stretch strict strike string strip strive strong stuck study stuff style sugar sunny sunset super sweet swift sword table tackle taken tall tango tasty teach teeth tempo thank theater theme theory third thirst thirty thorn those three throw thumb thunder ticket tiger tight timer tired title toast today token tooth top topic torch total touch tough tower town trace track trade trail train trait tramp trash travel tray treat trend trial tribe trick trigger trim triple trophy truck truly trumpet trust truth twice twist ultra uncle under union unite unity until upper upset urban usual valid value video visit visual vital vivid vocal voice volume voter voyage waist waste watch water weave wedge weekly weigh weird whale wheat wheel where which while white whole whose wider width wife wild will wind window wine wing winter wire wisdom witch with woman women wonder wood wool word work world worry worth would wound woven wreck write wrong wrote yard year yellow yield young youth zebra zero zigzag zone'
).split(' ');

export interface PassphraseOptions {
  words: number;
  separator: string;
  capitalize: boolean;
  addNumber: boolean;
}

export function generatePassphrase(opts: PassphraseOptions): string {
  const values = new Uint32Array(opts.words);
  window.crypto.getRandomValues(values);
  const picked = Array.from(values).map((v) => {
    let w = WORDLIST[v % WORDLIST.length]!;
    if (opts.capitalize) w = w.charAt(0).toUpperCase() + w.slice(1);
    return w;
  });
  let out = picked.join(opts.separator);
  if (opts.addNumber) {
    const n = new Uint32Array(1);
    window.crypto.getRandomValues(n);
    out += opts.separator + String(n[0]! % 100);
  }
  return out;
}

export default function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [opts, setOpts] = useState<Options>({ length: 16, upper: true, lower: true, numbers: true, symbols: true, excludeAmbiguous: false });
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [mode, setMode] = useState<'random' | 'passphrase'>('random');
  const [ppOpts, setPpOpts] = useState<PassphraseOptions>({ words: 4, separator: '-', capitalize: false, addNumber: false });

  const generate = () => {
    if (mode === 'passphrase') {
      setPassword(generatePassphrase(ppOpts));
    } else {
      setPassword(generatePassword(opts));
    }
  };

  const toggle = (key: keyof Options) => {
    if (typeof opts[key] === 'boolean') {
      const newOpts = { ...opts, [key]: !opts[key] };
      setOpts(newOpts);
      setActivePreset(null);
      const pwd = generatePassword(newOpts);
      setPassword(pwd);
    }
  };

  const handlePreset = useCallback((preset: PresetOption) => {
    const config = PRESET_CONFIG[preset.label];
    if (config) {
      const merged = { ...opts, ...config };
      setOpts(merged);
      const pwd = generatePassword(merged);
      setPassword(pwd);
    }
    setActivePreset(preset.label);
  }, [opts]);

  const copy = async () => {
    if (!password) return;
    if (await clipboardWrite(password)) toast.success('Password copied!'); else toast.error('Copy blocked by the browser — select the text manually.');
  };

  const download = () => {
    if (!password) return;
    const blob = new Blob([password], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, 'generated-password.txt');
    setTimeout(() => URL.revokeObjectURL(url), 200);
  };

  const entropy = useMemo(() => (
    mode === 'passphrase'
      ? Math.round(ppOpts.words * 11 + (ppOpts.addNumber ? 6.6 : 0))
      : calcEntropy(password, opts)
  ), [password, opts, mode, ppOpts]);
  const strength = useMemo(() => getStrength(entropy), [entropy]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto">
      {/* Mode tabs: random vs memorable passphrase */}
      <div className="flex gap-2" role="tablist" aria-label="Password mode">
        {([
          { key: 'random' as const, label: 'Random' },
          { key: 'passphrase' as const, label: 'Memorable Passphrase' },
        ]).map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={mode === t.key}
            onClick={() => { setMode(t.key); setActivePreset(null); }}
            className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all border ${
              mode === t.key
                ? 'bg-[var(--accent-ink)] text-white border-transparent'
                : 'bg-[var(--bg-overlay)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Presets */}
      {mode === 'random' && (
        <ToolPresetBar presets={PRESETS} onSelect={handlePreset} activeLabel={activePreset} />
      )}

      {/* Password display */}
      <div className="space-y-4">
        <div className="relative">
          <input aria-label="Generated password"
            type="text"
            readOnly
            value={password}
            className="w-full bg-[var(--bg-base)] border-2 border-emerald-500/30 rounded-xl px-5 py-4 text-xl font-mono text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 text-center tracking-wider"
          />
        </div>

        {/* Strength meter */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-[var(--border-subtle)] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${strength.bg}`}
              style={{ width: `${Math.min((entropy / 150) * 100, 100)}%` }}
            />
          </div>
          <span className={`text-xs font-bold ${strength.color} shrink-0`}>
            {strength.label} ({entropy} bit)
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={copy} disabled={!password} className="flex-1 min-w-[100px] px-4 py-2.5 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.97]">
            Copy
          </button>
          <button onClick={download} disabled={!password} className="flex-1 min-w-[100px] px-4 py-2.5 bg-[var(--bg-overlay)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm font-semibold rounded-xl transition-all active:scale-[0.97]">
            Download
          </button>
          <button onClick={generate} className="flex-1 min-w-[100px] px-4 py-2.5 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.97]">
            Regenerate
          </button>
        </div>
      </div>

      {/* Options */}
      {mode === 'random' && (
      <div className="rounded-[var(--radius-xl)] space-y-5">
        {/* Length slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-[var(--text-primary)]">Password Length</label>
            <span className="text-sm font-mono text-[var(--accent)]">{opts.length}</span>
          </div>
          <input aria-label="Password Length"
            type="range"
            min="4" max="64" step="1"
            value={opts.length}
            onChange={(e) => { setOpts(prev => ({ ...prev, length: parseInt(e.target.value) })); setActivePreset(null); }}
            className="w-full accent-[var(--accent)]"
          />
          <div className="flex justify-between text-[10px] text-[var(--text-muted)]"><span>4</span><span>64</span></div>
        </div>

        {/* Character types */}
        <div className="grid grid-cols-2 gap-2">
          {([
            { key: 'upper' as keyof Options, label: 'Uppercase (A-Z)' },
            { key: 'lower' as keyof Options, label: 'Lowercase (a-z)' },
            { key: 'numbers' as keyof Options, label: 'Numbers (0-9)' },
            { key: 'symbols' as keyof Options, label: 'Symbols (!@#$)' },
          ]).map(opt => (
            <label key={opt.key} className="flex items-center gap-3 bg-[var(--bg-overlay)] p-3 rounded-xl cursor-pointer hover:bg-[var(--bg-elevated)] transition-colors border border-transparent hover:border-[var(--border-subtle)]">
              <input
                type="checkbox"
                checked={opts[opt.key] as boolean}
                onChange={() => toggle(opt.key)}
                className="w-4 h-4 text-[var(--accent)] rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-[var(--text-primary)]">{opt.label}</span>
            </label>
          ))}
        </div>

        {/* Exclude ambiguous */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={opts.excludeAmbiguous}
            onChange={() => toggle('excludeAmbiguous')}
            className="w-4 h-4 text-[var(--accent)] rounded focus:ring-emerald-500"
          />
          <span className="text-sm text-[var(--text-muted)]">Exclude ambiguous characters (I, l, 1, O, 0)</span>
        </label>
      </div>
      )}

      {/* Passphrase options */}
      {mode === 'passphrase' && (
      <div className="rounded-[var(--radius-xl)] space-y-5">
        {/* Word count */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-[var(--text-primary)]">Words</label>
            <span className="text-sm font-mono text-[var(--accent)]">{ppOpts.words}</span>
          </div>
          <input aria-label="Number of words"
            type="range"
            min="3" max="8" step="1"
            value={ppOpts.words}
            onChange={(e) => setPpOpts(prev => ({ ...prev, words: parseInt(e.target.value) }))}
            className="w-full accent-[var(--accent)]"
          />
          <div className="flex justify-between text-[10px] text-[var(--text-muted)]"><span>3</span><span>8</span></div>
        </div>

        {/* Separator */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--text-primary)]">Separator</label>
          <div className="flex gap-2 flex-wrap">
            {([
              { value: '-', label: 'Dash (-)' },
              { value: ' ', label: 'Space' },
              { value: '_', label: 'Underscore (_)' },
              { value: '.', label: 'Dot (.)' },
            ]).map((s) => (
              <button
                key={s.value}
                onClick={() => setPpOpts(prev => ({ ...prev, separator: s.value }))}
                className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all border ${
                  ppOpts.separator === s.value
                    ? 'bg-[var(--accent-ink)] text-white border-transparent'
                    : 'bg-[var(--bg-overlay)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Capitalize + number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label className="flex items-center gap-3 bg-[var(--bg-overlay)] p-3 rounded-xl cursor-pointer hover:bg-[var(--bg-elevated)] transition-colors border border-transparent hover:border-[var(--border-subtle)]">
            <input
              type="checkbox"
              checked={ppOpts.capitalize}
              onChange={() => setPpOpts(prev => ({ ...prev, capitalize: !prev.capitalize }))}
              className="w-4 h-4 text-[var(--accent)] rounded focus:ring-emerald-500"
            />
            <span className="text-sm text-[var(--text-primary)]">Capitalize words</span>
          </label>
          <label className="flex items-center gap-3 bg-[var(--bg-overlay)] p-3 rounded-xl cursor-pointer hover:bg-[var(--bg-elevated)] transition-colors border border-transparent hover:border-[var(--border-subtle)]">
            <input
              type="checkbox"
              checked={ppOpts.addNumber}
              onChange={() => setPpOpts(prev => ({ ...prev, addNumber: !prev.addNumber }))}
              className="w-4 h-4 text-[var(--accent)] rounded focus:ring-emerald-500"
            />
            <span className="text-sm text-[var(--text-primary)]">Append number</span>
          </label>
        </div>
      </div>
      )}

      {/* Stats */}
      <div className="flex gap-4 flex-wrap text-[11px] text-[var(--text-muted)] font-medium">
        <span>Length: {password.length}</span>
        <span>Entropy: {entropy} bits</span>
        {mode === 'random' ? (
          <span>Characters used: {new Set(password).size} unique</span>
        ) : (
          <span>Words: {(password.split(ppOpts.separator).filter(Boolean)).length}</span>
        )}
      </div>
    </div>
  );
}

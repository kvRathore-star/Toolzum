"use client";
import React from 'react';
import { Binary, Type, Wrench, Gauge } from 'lucide-react';

const sectionBtn = "inline-flex items-center gap-2 px-3 py-2 text-[11px] font-bold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-default";

interface HubCard {
  name: string;
  slug: string;
  desc: string;
  icon: React.ElementType;
  path?: string;
}

function ToolCard({ name, slug, desc, icon: Icon, path }: HubCard) {
  const href = path || `/developer/${slug}/`;
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

export default function ConverterToolkit() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Converter Toolkit</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
          Encoders, text tools, web utilities, and unit converters — all running locally in your browser.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Binary className="w-3.5 h-3.5" /> Encoders</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="Base32 Encoder / Decoder" slug="base32-encoder" desc="Encode and decode Base32 strings." icon={Binary} />
          <ToolCard name="Base64 to JSON Decoder" slug="base64-json-decoder" desc="Decode Base64 and pretty-print JSON." icon={Binary} />
          <ToolCard name="Hex to Text Converter" slug="hex-text-converter" desc="Convert between hex strings and text." icon={Binary} />
          <ToolCard name="SVG to Base64 Converter" slug="svg-base64-converter" desc="Convert SVG to data URIs." icon={Binary} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Type className="w-3.5 h-3.5" /> Text &amp; Format</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="Character Encoding Converter" slug="character-encoding-converter" desc="Analyze Unicode code points and ASCII status." icon={Type} />
          <ToolCard name="Unicode Converter" slug="unicode-converter" desc="Get code points, JS escapes, and HTML entities." icon={Type} />
          <ToolCard name="Markdown to Slack Converter" slug="markdown-slack-converter" desc="Convert Markdown to Slack mrkdwn syntax." icon={Type} />
          <ToolCard name="PX to REM Converter" slug="px-rem-converter" desc="Convert between PX and REM units." icon={Type} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Wrench className="w-3.5 h-3.5" /> Security &amp; Web</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="HMAC Generator" slug="hmac-generator" desc="Generate HMAC signatures for API auth." icon={Wrench} />
          <ToolCard name="SVG Optimizer" slug="svg-optimizer" desc="Minify SVG by removing whitespace and comments." icon={Wrench} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Gauge className="w-3.5 h-3.5" /> Unit Converters</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="Speed Converter" slug="speed-converter-advanced" desc="Convert between km/h, mph, m/s, knots, ft/s." icon={Gauge} path="/utility/speed-converter-advanced/" />
          <ToolCard name="Power Converter" slug="power-converter" desc="Convert between kW, hp, W, MW, BTU/hr." icon={Gauge} path="/utility/power-converter/" />
          <ToolCard name="Pressure Converter" slug="pressure-converter" desc="Convert between kPa, psi, bar, atm, Torr." icon={Gauge} path="/utility/pressure-converter/" />
        </div>
      </div>
    </div>
  );
}

"use client";
import React from 'react';
import { LinkCard } from '@/components/tools/LinkCard';

const tools = [
  { slug: 'emoji-picker', name: 'Emoji Picker', description: 'Browse 400+ emojis organized by category with search and copy.', category: 'utility' },
  { slug: 'ascii-art-generator', name: 'ASCII Art Generator', description: 'Convert text to ASCII art with multiple font styles.', category: 'developer' },
  { slug: 'ascii-font-generator', name: 'ASCII Font Generator', description: 'Generate large ASCII text banners with multiple font styles.', category: 'developer' },
  { slug: 'qr-code-generator', name: 'QR Code Generator', description: 'Create QR codes for text, URLs, and contact info.', category: 'utility' },
  { slug: 'color-palette-generator', name: 'Color Palette Generator', description: 'Generate harmonious color palettes from a base color.', category: 'utility' },
  { slug: 'gradient-generator', name: 'CSS Gradient Generator', description: 'Create linear and radial CSS gradients with visual preview.', category: 'utility' },
];

export default function CreativeTools() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Creative Tools</h1>
        <p className="text-[var(--text-muted)] mt-2">Emoji, ASCII art, fonts, QR codes, colors, and gradients — each tool opens in its own page.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map(tool => (
          <LinkCard key={tool.slug} {...tool} />
        ))}
      </div>
    </div>
  );
}

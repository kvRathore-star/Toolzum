"use client";
import React from 'react';
import { LinkCard } from '@/components/tools/LinkCard';

const tools = [
  { slug: 'wifi-qr-generator', name: 'WiFi QR Generator', description: 'Generate QR codes for WiFi network credentials — scan to connect.', category: 'utility' },
  { slug: 'phone-parser', name: 'Phone Number Parser', description: 'Parse and validate international phone numbers with country detection.', category: 'utility' },
  { slug: 'otp-generator', name: 'OTP Generator', description: 'Generate one-time passwords with configurable length and character type.', category: 'utility' },
  { slug: 'slugify-tool', name: 'Slugify', description: 'Convert text to URL-friendly slugs with configurable separators.', category: 'utility' },
  { slug: 'diff-checker', name: 'JSON Diff Checker', description: 'Compare two JSON objects side-by-side with color-coded differences.', category: 'developer' },
  { slug: 'image-placeholder-generator', name: 'SVG Placeholder Generator', description: 'Generate SVG placeholder images with custom dimensions and colors.', category: 'developer' },
];

export default function OtherUtilities() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Other Utilities</h1>
        <p className="text-zinc-400 mt-2">WiFi QR, phone parser, OTP, slugify, and more — each tool opens in its own page.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map(tool => (
          <LinkCard key={tool.slug} {...tool} />
        ))}
      </div>
    </div>
  );
}

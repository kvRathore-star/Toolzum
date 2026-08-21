"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { fetchFile } from '@ffmpeg/util';
import { downloadOrShare } from '@/utils/nativeShare';
import { createDownloadBlob } from '@/utils/blob';


type FormatDef = {
  key: string;
  label: string;
  ext: string;
  mime: string;
  accept: string;
};

const FORMATS: Record<string, FormatDef> = {
  mp3: { key: 'mp3', label: 'MP3', ext: 'mp3', mime: 'audio/mpeg', accept: '.mp3' },
  wav: { key: 'wav', label: 'WAV', ext: 'wav', mime: 'audio/wav', accept: '.wav' },
  flac: { key: 'flac', label: 'FLAC', ext: 'flac', mime: 'audio/flac', accept: '.flac' },
  ogg: { key: 'ogg', label: 'OGG', ext: 'ogg', mime: 'audio/ogg', accept: '.ogg' },
  m4a: { key: 'm4a', label: 'M4A', ext: 'm4a', mime: 'audio/mp4', accept: '.m4a' },
  aac: { key: 'aac', label: 'AAC', ext: 'aac', mime: 'audio/aac', accept: '.aac' },
  wma: { key: 'wma', label: 'WMA', ext: 'wma', mime: 'audio/x-ms-wma', accept: '.wma' },
  opus: { key: 'opus', label: 'Opus', ext: 'opus', mime: 'audio/ogg', accept: '.opus' },
  aiff: { key: 'aiff', label: 'AIFF', ext: 'aiff', mime: 'audio/aiff', accept: '.aiff' },
};

type FormatPair = {
  slug: string;
  input: string;
  output: string;
  label: string;
};

export const FORMAT_PAIRS: FormatPair[] = [
  { slug: 'mp3-to-wav', input: 'mp3', output: 'wav', label: 'MP3 \u2192 WAV' },
  { slug: 'wav-to-mp3', input: 'wav', output: 'mp3', label: 'WAV \u2192 MP3' },
  { slug: 'flac-to-mp3', input: 'flac', output: 'mp3', label: 'FLAC \u2192 MP3' },
  { slug: 'ogg-to-mp3', input: 'ogg', output: 'mp3', label: 'OGG \u2192 MP3' },
  { slug: 'm4a-to-mp3', input: 'm4a', output: 'mp3', label: 'M4A \u2192 MP3' },
  { slug: 'aac-to-mp3', input: 'aac', output: 'mp3', label: 'AAC \u2192 MP3' },
  { slug: 'wma-to-mp3', input: 'wma', output: 'mp3', label: 'WMA \u2192 MP3' },
  { slug: 'opus-to-mp3', input: 'opus', output: 'mp3', label: 'Opus \u2192 MP3' },
  { slug: 'aiff-to-mp3', input: 'aiff', output: 'mp3', label: 'AIFF \u2192 MP3' },
  { slug: 'mp3-to-flac', input: 'mp3', output: 'flac', label: 'MP3 \u2192 FLAC' },
  { slug: 'mp3-to-ogg', input: 'mp3', output: 'ogg', label: 'MP3 \u2192 OGG' },
  { slug: 'mp3-to-m4a', input: 'mp3', output: 'm4a', label: 'MP3 \u2192 M4A' },
  { slug: 'mp3-to-aac', input: 'mp3', output: 'aac', label: 'MP3 \u2192 AAC' },
  { slug: 'mp3-to-wma', input: 'mp3', output: 'wma', label: 'MP3 \u2192 WMA' },
  { slug: 'mp3-to-opus', input: 'mp3', output: 'opus', label: 'MP3 \u2192 Opus' },
  { slug: 'mp3-to-aiff', input: 'mp3', output: 'aiff', label: 'MP3 \u2192 AIFF' },
  { slug: 'wav-to-flac', input: 'wav', output: 'flac', label: 'WAV \u2192 FLAC' },
  { slug: 'wav-to-ogg', input: 'wav', output: 'ogg', label: 'WAV \u2192 OGG' },
  { slug: 'wav-to-m4a', input: 'wav', output: 'm4a', label: 'WAV \u2192 M4A' },
  { slug: 'wav-to-aac', input: 'wav', output: 'aac', label: 'WAV \u2192 AAC' },
  { slug: 'wav-to-wma', input: 'wav', output: 'wma', label: 'WAV \u2192 WMA' },
  { slug: 'wav-to-opus', input: 'wav', output: 'opus', label: 'WAV \u2192 Opus' },
  { slug: 'wav-to-aiff', input: 'wav', output: 'aiff', label: 'WAV \u2192 AIFF' },
  { slug: 'flac-to-wav', input: 'flac', output: 'wav', label: 'FLAC \u2192 WAV' },
  { slug: 'flac-to-ogg', input: 'flac', output: 'ogg', label: 'FLAC \u2192 OGG' },
  { slug: 'flac-to-m4a', input: 'flac', output: 'm4a', label: 'FLAC \u2192 M4A' },
  { slug: 'flac-to-aac', input: 'flac', output: 'aac', label: 'FLAC \u2192 AAC' },
  { slug: 'ogg-to-wav', input: 'ogg', output: 'wav', label: 'OGG \u2192 WAV' },
  { slug: 'ogg-to-flac', input: 'ogg', output: 'flac', label: 'OGG \u2192 FLAC' },
  { slug: 'ogg-to-m4a', input: 'ogg', output: 'm4a', label: 'OGG \u2192 M4A' },
  { slug: 'ogg-to-aac', input: 'ogg', output: 'aac', label: 'OGG \u2192 AAC' },
  { slug: 'm4a-to-wav', input: 'm4a', output: 'wav', label: 'M4A \u2192 WAV' },
  { slug: 'm4a-to-flac', input: 'm4a', output: 'flac', label: 'M4A \u2192 FLAC' },
  { slug: 'm4a-to-ogg', input: 'm4a', output: 'ogg', label: 'M4A \u2192 OGG' },
  { slug: 'm4a-to-aac', input: 'm4a', output: 'aac', label: 'M4A \u2192 AAC' },
  { slug: 'aac-to-wav', input: 'aac', output: 'wav', label: 'AAC \u2192 WAV' },
  { slug: 'aac-to-flac', input: 'aac', output: 'flac', label: 'AAC \u2192 FLAC' },
  { slug: 'aac-to-ogg', input: 'aac', output: 'ogg', label: 'AAC \u2192 OGG' },
  { slug: 'aac-to-m4a', input: 'aac', output: 'm4a', label: 'AAC \u2192 M4A' },
  { slug: 'aac-to-aiff', input: 'aac', output: 'aiff', label: 'AAC \u2192 AIFF' },
  { slug: 'aac-to-opus', input: 'aac', output: 'opus', label: 'AAC \u2192 Opus' },
  { slug: 'aac-to-wma', input: 'aac', output: 'wma', label: 'AAC \u2192 WMA' },
  { slug: 'aiff-to-aac', input: 'aiff', output: 'aac', label: 'AIFF \u2192 AAC' },
  { slug: 'aiff-to-flac', input: 'aiff', output: 'flac', label: 'AIFF \u2192 FLAC' },
  { slug: 'aiff-to-ogg', input: 'aiff', output: 'ogg', label: 'AIFF \u2192 OGG' },
  { slug: 'aiff-to-opus', input: 'aiff', output: 'opus', label: 'AIFF \u2192 Opus' },
  { slug: 'aiff-to-wav', input: 'aiff', output: 'wav', label: 'AIFF \u2192 WAV' },
  { slug: 'aiff-to-wma', input: 'aiff', output: 'wma', label: 'AIFF \u2192 WMA' },
  { slug: 'flac-to-aiff', input: 'flac', output: 'aiff', label: 'FLAC \u2192 AIFF' },
  { slug: 'flac-to-opus', input: 'flac', output: 'opus', label: 'FLAC \u2192 Opus' },
  { slug: 'flac-to-wma', input: 'flac', output: 'wma', label: 'FLAC \u2192 WMA' },
  { slug: 'ogg-to-aiff', input: 'ogg', output: 'aiff', label: 'OGG \u2192 AIFF' },
  { slug: 'ogg-to-opus', input: 'ogg', output: 'opus', label: 'OGG \u2192 Opus' },
  { slug: 'ogg-to-wma', input: 'ogg', output: 'wma', label: 'OGG \u2192 WMA' },
  { slug: 'opus-to-aac', input: 'opus', output: 'aac', label: 'Opus \u2192 AAC' },
  { slug: 'opus-to-aiff', input: 'opus', output: 'aiff', label: 'Opus \u2192 AIFF' },
  { slug: 'opus-to-flac', input: 'opus', output: 'flac', label: 'Opus \u2192 FLAC' },
  { slug: 'opus-to-ogg', input: 'opus', output: 'ogg', label: 'Opus \u2192 OGG' },
  { slug: 'opus-to-wav', input: 'opus', output: 'wav', label: 'Opus \u2192 WAV' },
  { slug: 'opus-to-wma', input: 'opus', output: 'wma', label: 'Opus \u2192 WMA' },
  { slug: 'wma-to-aac', input: 'wma', output: 'aac', label: 'WMA \u2192 AAC' },
  { slug: 'wma-to-aiff', input: 'wma', output: 'aiff', label: 'WMA \u2192 AIFF' },
  { slug: 'wma-to-flac', input: 'wma', output: 'flac', label: 'WMA \u2192 FLAC' },
  { slug: 'wma-to-ogg', input: 'wma', output: 'ogg', label: 'WMA \u2192 OGG' },
  { slug: 'wma-to-opus', input: 'wma', output: 'opus', label: 'WMA \u2192 Opus' },
  { slug: 'wma-to-wav', input: 'wma', output: 'wav', label: 'WMA \u2192 WAV' },
];

export const DESCRIPTIONS: Record<string, string> = {
  'audio-converter': "Convert between MP3, WAV, FLAC, OGG, M4A, and AAC audio formats.",
  'mp3-to-wav': "<strong>MP3 to WAV Converter:</strong> Transform compressed MP3 audio files into uncompressed WAV format for professional audio editing. WAV preserves full audio fidelity — essential for music production, podcast mastering, and audio restoration. Your files never leave your device.",
  'wav-to-mp3': "<strong>WAV to MP3 Converter:</strong> Compress large WAV audio files into space-saving MP3 format. Perfect for sharing music, podcasts, and voice recordings online where file size matters. Your files never leave your device.",
  'flac-to-mp3': "<strong>FLAC to MP3 Converter:</strong> Convert lossless FLAC audio files into universally compatible MP3 format. Ideal for loading high-res audio onto devices with limited storage or sharing on platforms that don't support FLAC. Your files never leave your device.",
  'ogg-to-mp3': "<strong>OGG to MP3 Converter:</strong> Convert OGG Vorbis audio files into the more widely supported MP3 format. Perfect when you need universal playback compatibility across devices, media players, and platforms. Your files never leave your device.",
  'm4a-to-mp3': "<strong>M4A to MP3 Converter:</strong> Convert M4A audio files (AAC/ALAC) into MP3 format for broader device compatibility. Ideal for moving Apple ecosystem audio to non-Apple devices and platforms. Your files never leave your device.",
  'aac-to-mp3': "<strong>AAC to MP3 Converter:</strong> Convert AAC audio files into universally compatible MP3 format. Perfect when your audio software, device, or platform needs MP3 but you have AAC files. Your files never leave your device.",
  'wma-to-mp3': "<strong>WMA to MP3 Converter:</strong> Convert Windows Media Audio (WMA) files into universally compatible MP3 format. Essential for playing WMA audio on non-Windows devices, media players, and streaming platforms. Your files never leave your device.",
  'opus-to-mp3': "<strong>Opus to MP3 Converter:</strong> Convert Opus audio files into the more widely supported MP3 format. Opus offers excellent compression but isn't universally supported — perfect for broad compatibility. Your files never leave your device.",
  'aiff-to-mp3': "<strong>AIFF to MP3 Converter:</strong> Convert Apple's AIFF audio files into space-saving MP3 format. AIFF files are uncompressed and massive — MP3 conversion dramatically reduces size while preserving good audio quality. Your files never leave your device.",
  'mp3-to-flac': "<strong>MP3 to FLAC Converter:</strong> Convert MP3 audio files into lossless FLAC format. Perfect for archiving purposes or when you need an uncompressed format for further editing and processing. Your files never leave your device.",
  'mp3-to-ogg': "<strong>MP3 to OGG Converter:</strong> Convert MP3 audio files into open-source OGG Vorbis format. OGG offers better quality at the same bitrate — ideal for open-source software and game development. Your files never leave your device.",
  'mp3-to-m4a': "<strong>MP3 to M4A Converter:</strong> Convert MP3 audio files into M4A format for better Apple ecosystem compatibility. M4A with AAC codec offers superior quality at similar bitrates — perfect for iTunes and Apple devices. Your files never leave your device.",
  'mp3-to-aac': "<strong>MP3 to AAC Converter:</strong> Convert MP3 audio files into AAC format with superior compression efficiency. AAC delivers better sound quality than MP3 at the same bitrate — the standard for modern streaming. Your files never leave your device.",
  'mp3-to-wma': "<strong>MP3 to WMA Converter:</strong> Convert MP3 audio files into Windows Media Audio format. Useful for compatibility with legacy Windows applications, media centers, and devices that primarily support WMA. Your files never leave your device.",
  'mp3-to-opus': "<strong>MP3 to Opus Converter:</strong> Convert MP3 audio files into cutting-edge Opus format for best-in-class compression. Opus delivers superior quality at lower bitrates — perfect for streaming and voice applications. Your files never leave your device.",
  'mp3-to-aiff': "<strong>MP3 to AIFF Converter:</strong> Convert MP3 audio files into Apple's AIFF format for professional audio editing. AIFF is uncompressed and lossless — essential for music production and audio post-processing. Your files never leave your device.",
  'wav-to-flac': "<strong>WAV to FLAC Converter:</strong> Convert uncompressed WAV audio files into lossless FLAC format with significant space savings. FLAC cuts file sizes by up to 60% while preserving every bit of audio quality — perfect for music archives. Your files never leave your device.",
  'wav-to-ogg': "<strong>WAV to OGG Converter:</strong> Convert WAV audio files into space-efficient OGG Vorbis format. OGG provides excellent compression for high-quality audio — ideal for web streaming and portable devices. Your files never leave your device.",
  'wav-to-m4a': "<strong>WAV to M4A Converter:</strong> Convert WAV audio files into M4A format for excellent compression with Apple compatibility. M4A dramatically reduces file size while maintaining high audio quality. Your files never leave your device.",
  'wav-to-aac': "<strong>WAV to AAC Converter:</strong> Convert WAV audio files into efficient AAC format. AAC is the industry standard for audio compression — perfect for streaming, mobile devices, and modern media players. Your files never leave your device.",
  'wav-to-wma': "<strong>WAV to WMA Converter:</strong> Convert WAV audio files into Windows Media Audio format to reduce file size. WMA is ideal for Windows-based media libraries, legacy devices, and business applications. Your files never leave your device.",
  'wav-to-opus': "<strong>WAV to Opus Converter:</strong> Convert WAV audio files into Opus format for the most efficient compression available. Opus excels at voice and music — great for podcasts, VoIP, and streaming. Your files never leave your device.",
  'wav-to-aiff': "<strong>WAV to AIFF Converter:</strong> Convert WAV audio files into Apple's AIFF format for seamless integration with macOS audio workflows. AIFF is essential for Logic Pro, GarageBand, and professional audio production. Your files never leave your device.",
  'flac-to-wav': "<strong>FLAC to WAV Converter:</strong> Convert FLAC audio files into uncompressed WAV format for professional audio editing and DAW compatibility. WAV is the universal standard for audio production software. Your files never leave your device.",
  'flac-to-ogg': "<strong>FLAC to OGG Converter:</strong> Convert FLAC audio files into space-efficient OGG Vorbis format. Ideal for streaming or portable use where you need smaller files than lossless FLAC while maintaining good quality. Your files never leave your device.",
  'flac-to-m4a': "<strong>FLAC to M4A Converter:</strong> Convert FLAC audio files into M4A format for Apple device compatibility. Perfect for playing your lossless FLAC collection on iPhones, iPads, and iTunes. Your files never leave your device.",
  'flac-to-aac': "<strong>FLAC to AAC Converter:</strong> Convert FLAC audio files into high-efficiency AAC format. Great for creating space-saving copies of your lossless music library for portable devices and streaming. Your files never leave your device.",
  'ogg-to-wav': "<strong>OGG to WAV Converter:</strong> Convert OGG Vorbis audio files into uncompressed WAV format for professional editing. Essential when your audio production software requires WAV input but you have OGG source files. Your files never leave your device.",
  'ogg-to-flac': "<strong>OGG to FLAC Converter:</strong> Convert OGG Vorbis audio files into lossless FLAC format for archival purposes. FLAC preserves audio quality without compression loss — ideal for long-term storage. Your files never leave your device.",
  'ogg-to-m4a': "<strong>OGG to M4A Converter:</strong> Convert OGG Vorbis audio files into M4A format for Apple ecosystem compatibility. Perfect for playing open-source audio files on iPhones, iPads, and Macs. Your files never leave your device.",
  'ogg-to-aac': "<strong>OGG to AAC Converter:</strong> Convert OGG Vorbis audio files into universal AAC format. AAC is supported by virtually all modern devices — essential for broad compatibility. Your files never leave your device.",
  'm4a-to-wav': "<strong>M4A to WAV Converter:</strong> Convert M4A audio files into uncompressed WAV format for professional editing. Perfect when you need to edit Apple audio files in software that requires WAV input. Your files never leave your device.",
  'm4a-to-flac': "<strong>M4A to FLAC Converter:</strong> Convert M4A audio files into lossless FLAC format for archiving and audiophile use. FLAC is open-source and preserves every detail of your audio without compression loss. Your files never leave your device.",
  'm4a-to-ogg': "<strong>M4A to OGG Converter:</strong> Convert M4A audio files into open-source OGG Vorbis format. Ideal for moving Apple ecosystem audio to open platforms, Linux systems, and games. Your files never leave your device.",
  'm4a-to-aac': "<strong>M4A to AAC Converter:</strong> Convert M4A audio files to pure AAC format. While M4A often uses AAC encoding, extracting the raw AAC stream ensures maximum compatibility with all devices. Your files never leave your device.",
  'aac-to-wav': "<strong>AAC to WAV Converter:</strong> Convert AAC audio files into uncompressed WAV format for professional audio editing. WAV is the standard format for DAWs, audio restoration, and post-production. Your files never leave your device.",
  'aac-to-flac': "<strong>AAC to FLAC Converter:</strong> Convert AAC audio files into lossless FLAC format for archival storage. FLAC preserves every audio detail — perfect for backing up your AAC collection without quality loss. Your files never leave your device.",
  'aac-to-ogg': "<strong>AAC to OGG Converter:</strong> Convert AAC audio files into open-source OGG Vorbis format. OGG is perfect for Linux, open-source software, and game development environments. Your files never leave your device.",
  'aac-to-m4a': "<strong>AAC to M4A Converter:</strong> Convert AAC audio files into the M4A container format. M4A offers better metadata support, album art, and chapter markers compared to raw AAC. Your files never leave your device.",
  'aac-to-opus': "<strong>AAC to Opus Converter:</strong> Convert AAC audio files into Opus format for superior compression efficiency. Your files never leave your device.",
  'aac-to-wma': "<strong>AAC to WMA Converter:</strong> Convert AAC audio files into Windows Media Audio format for Windows ecosystem compatibility. Your files never leave your device.",
  'aac-to-aiff': "<strong>AAC to AIFF Converter:</strong> Convert AAC audio files into AIFF format for Apple professional audio workflows. Your files never leave your device.",
  'flac-to-wma': "<strong>FLAC to WMA Converter:</strong> Convert lossless FLAC audio files into Windows Media Audio format for Windows ecosystem compatibility. Your files never leave your device.",
  'flac-to-opus': "<strong>FLAC to Opus Converter:</strong> Convert lossless FLAC audio files into Opus format for superior compression efficiency. Your files never leave your device.",
  'flac-to-aiff': "<strong>FLAC to AIFF Converter:</strong> Convert lossless FLAC audio files into AIFF format for Apple professional audio workflows. Your files never leave your device.",
  'ogg-to-wma': "<strong>OGG to WMA Converter:</strong> Convert OGG Vorbis audio files into Windows Media Audio format for Windows ecosystem compatibility. Your files never leave your device.",
  'ogg-to-opus': "<strong>OGG to Opus Converter:</strong> Convert OGG Vorbis audio files into Opus format for superior compression efficiency. Your files never leave your device.",
  'ogg-to-aiff': "<strong>OGG to AIFF Converter:</strong> Convert OGG Vorbis audio files into AIFF format for Apple professional audio workflows. Your files never leave your device.",
  'm4a-to-wma': "<strong>M4A to WMA Converter:</strong> Convert M4A audio files into Windows Media Audio format for Windows ecosystem compatibility. Your files never leave your device.",
  'm4a-to-opus': "<strong>M4A to Opus Converter:</strong> Convert M4A audio files into Opus format for superior compression efficiency. Your files never leave your device.",
  'm4a-to-aiff': "<strong>M4A to AIFF Converter:</strong> Convert M4A audio files into AIFF format for Apple professional audio workflows. Your files never leave your device.",
  'wma-to-wav': "<strong>WMA to WAV Converter:</strong> Convert Windows Media Audio (WMA) audio files into uncompressed WAV format for professional audio editing and production. Your files never leave your device.",
  'wma-to-flac': "<strong>WMA to FLAC Converter:</strong> Convert Windows Media Audio (WMA) audio files into lossless FLAC format for archival storage and audiophile playback. Your files never leave your device.",
  'wma-to-ogg': "<strong>WMA to OGG Converter:</strong> Convert Windows Media Audio (WMA) audio files into OGG Vorbis format for open-source platforms and applications. Your files never leave your device.",
  'wma-to-m4a': "<strong>WMA to M4A Converter:</strong> Convert Windows Media Audio (WMA) audio files into M4A format for Apple ecosystem compatibility. Your files never leave your device.",
  'wma-to-aac': "<strong>WMA to AAC Converter:</strong> Convert Windows Media Audio (WMA) audio files into AAC format for modern device and platform compatibility. Your files never leave your device.",
  'wma-to-opus': "<strong>WMA to Opus Converter:</strong> Convert Windows Media Audio (WMA) audio files into Opus format for superior compression efficiency. Your files never leave your device.",
  'wma-to-aiff': "<strong>WMA to AIFF Converter:</strong> Convert Windows Media Audio (WMA) audio files into AIFF format for Apple professional audio workflows. Your files never leave your device.",
  'opus-to-wav': "<strong>Opus to WAV Converter:</strong> Convert Opus audio files into uncompressed WAV format for professional audio editing and production. Your files never leave your device.",
  'opus-to-flac': "<strong>Opus to FLAC Converter:</strong> Convert Opus audio files into lossless FLAC format for archival storage and audiophile playback. Your files never leave your device.",
  'opus-to-ogg': "<strong>Opus to OGG Converter:</strong> Convert Opus audio files into OGG Vorbis format for open-source platforms and applications. Your files never leave your device.",
  'opus-to-m4a': "<strong>Opus to M4A Converter:</strong> Convert Opus audio files into M4A format for Apple ecosystem compatibility. Your files never leave your device.",
  'opus-to-aac': "<strong>Opus to AAC Converter:</strong> Convert Opus audio files into AAC format for modern device and platform compatibility. Your files never leave your device.",
  'opus-to-wma': "<strong>Opus to WMA Converter:</strong> Convert Opus audio files into Windows Media Audio format for Windows ecosystem compatibility. Your files never leave your device.",
  'opus-to-aiff': "<strong>Opus to AIFF Converter:</strong> Convert Opus audio files into AIFF format for Apple professional audio workflows. Your files never leave your device.",
  'aiff-to-wav': "<strong>AIFF to WAV Converter:</strong> Convert AIFF audio files into uncompressed WAV format for professional audio editing and production. Your files never leave your device.",
  'aiff-to-flac': "<strong>AIFF to FLAC Converter:</strong> Convert AIFF audio files into lossless FLAC format for archival storage and audiophile playback. Your files never leave your device.",
  'aiff-to-ogg': "<strong>AIFF to OGG Converter:</strong> Convert AIFF audio files into OGG Vorbis format for open-source platforms and applications. Your files never leave your device.",
  'aiff-to-m4a': "<strong>AIFF to M4A Converter:</strong> Convert AIFF audio files into M4A format for Apple ecosystem compatibility. Your files never leave your device.",
  'aiff-to-aac': "<strong>AIFF to AAC Converter:</strong> Convert AIFF audio files into AAC format for modern device and platform compatibility. Your files never leave your device.",
  'aiff-to-wma': "<strong>AIFF to WMA Converter:</strong> Convert AIFF audio files into Windows Media Audio format for Windows ecosystem compatibility. Your files never leave your device.",
  'aiff-to-opus': "<strong>AIFF to Opus Converter:</strong> Convert AIFF audio files into Opus format for superior compression efficiency. Your files never leave your device.",
};

const FORMAT_KEYS = Object.keys(FORMATS);

function resolveSlug(input: string, output: string): string {
  return `${input}-to-${output}`;
}

type AudioFormatConverterProps = {
  slug: string;
};

export default function AudioFormatConverter({ slug }: AudioFormatConverterProps) {
  const { ffmpeg, isLoaded, isLoading, progress, loadFFmpeg } = useFFmpeg();
  const description = DESCRIPTIONS[slug];

  const initialPair = useMemo(() => FORMAT_PAIRS.find(p => p.slug === slug) || FORMAT_PAIRS[0], [slug]);

  const [inputKey, setInputKey] = useState<string>(initialPair.input);
  const [outputKey, setOutputKey] = useState<string>(initialPair.output);
  const [file, setFile] = useState<File | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const inputFmt = FORMATS[inputKey];
  const outputFmt = FORMATS[outputKey];

  useEffect(() => { loadFFmpeg(); }, []);

  useEffect(() => {
    return () => { if (outputUrl) URL.revokeObjectURL(outputUrl); };
  }, [outputUrl]);

  const handleFormatChange = (role: "input" | "output", value: string) => {
    if (role === "input") setInputKey(value);
    else setOutputKey(value);
    setFile(null);
    setOutputUrl(null);
  };

  const swapFormats = () => {
    setInputKey(outputKey);
    setOutputKey(inputKey);
    setFile(null);
    setOutputUrl(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setOutputUrl(null); }
  };

  const convertAudio = async () => {
    if (!file || !ffmpeg || !isLoaded) return;
    if (inputKey === outputKey) { toast.error('Input and output formats are the same'); return; }

    setIsProcessing(true);
    try {
      const inputName = `input_${file.name.replace(/\s+/g, '_')}`;
      const outputName = `output.${outputFmt.ext}`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));
      await ffmpeg.exec(['-i', inputName, outputName]);

      const data = await ffmpeg.readFile(outputName);

      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(createDownloadBlob(data, outputFmt.mime)));
      toast.success(`Converted to ${outputFmt.label} successfully!`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to convert audio.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadOutput = () => {
    if (!outputUrl) return;
    downloadOrShare(outputUrl, `converted.${outputFmt.ext}`);
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <select value={inputKey} onChange={(e) => handleFormatChange("input", e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-zinc-900 dark:text-zinc-100 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 appearance-none cursor-pointer">
          {FORMAT_KEYS.map(k => <option key={k} value={k}>{FORMATS[k].label} (.{FORMATS[k].ext})</option>)}
        </select>

        <button onClick={swapFormats}
          className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] transition-all active:scale-95"
          aria-label="Swap formats">
          <svg className="w-5 h-5 text-zinc-600 dark:text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>

        <select value={outputKey} onChange={(e) => handleFormatChange("output", e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-zinc-900 dark:text-zinc-100 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 appearance-none cursor-pointer">
          {FORMAT_KEYS.map(k => <option key={k} value={k}>{FORMATS[k].label} (.{FORMATS[k].ext})</option>)}
        </select>
      </div>

      {description && (
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-700 dark:text-blue-400 text-sm" dangerouslySetInnerHTML={{ __html: description }} />
      )}

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        {!file ? (
          <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-12 hover:bg-[var(--bg-overlay)] dark:hover:bg-zinc-800 transition-colors cursor-pointer relative">
            <input type="file" accept={inputFmt.accept} onChange={handleFileSelect} className="absolute inset-0 opacity-0 cursor-pointer" />
            <div className="text-[var(--text-secondary)] flex flex-col items-center">
              <svg className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              <span className="text-sm">Upload {inputFmt.label} Audio</span>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-3 bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)]">
              <div>
                <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{file.name}</div>
                <div className="text-xs text-[var(--text-muted)]">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
              <button onClick={() => { setFile(null); setOutputUrl(null); }} className="text-xs text-red-500 hover:underline">Remove</button>
            </div>

            {(!isLoaded || isLoading) && (
              <div className="text-center text-[var(--text-secondary)] py-4 flex flex-col items-center gap-2">
                <svg className="w-5 h-5 animate-spin text-blue-700 dark:text-blue-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <span className="text-xs">Loading FFmpeg Engine...</span>
              </div>
            )}

            {isLoaded && !outputUrl && !isProcessing && (
              <button onClick={convertAudio}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-50"
                disabled={inputKey === outputKey}>
                {inputKey === outputKey ? 'Select different formats' : `Convert to ${outputFmt.label}`}
              </button>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <span>Converting...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-[var(--bg-surface)] rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}

            {outputUrl && (
              <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
                <audio controls className="w-full" src={outputUrl}></audio>
                <button onClick={downloadOutput}
                  className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all active:scale-[0.98]">
                  Download {outputFmt.label}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

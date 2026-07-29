"use client";
import ImageFormatConverter from '../shared/ImageFormatConverter';

const config = {
  accept: 'image/*',
  title: 'Image to JPG Converter',
  description: 'Convert any image (PNG, WebP, BMP, GIF) to standard JPG format.',
  hasWhiteBg: true,
  mimeType: 'image/jpeg' as const,
  quality: 0.9,
  outputFileName: 'converted.jpg',
  buttonText: 'Convert to JPG',
  dropZoneText: 'Click or Drag Any Image Here',
};

export default function ConvertToJpg() {
  return <ImageFormatConverter config={config} />;
}

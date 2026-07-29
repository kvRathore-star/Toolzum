"use client";
import ImageFormatConverter from '../shared/ImageFormatConverter';

const config = {
  accept: 'image/jpeg, .jfif',
  title: 'JFIF to PNG Converter',
  description: 'Easily convert JFIF files to standard PNG format without quality loss.',
  hasWhiteBg: false,
  mimeType: 'image/png' as const,
  quality: undefined,
  outputFileName: 'converted.png',
  buttonText: 'Convert to PNG',
  dropZoneText: 'Click or Drag JFIF Image Here',
};

export default function JfifToPng() {
  return <ImageFormatConverter config={config} />;
}

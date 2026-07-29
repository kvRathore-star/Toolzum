"use client";
import React from 'react';
import BulkImageCompressor from './BulkImageCompressor';

export default function BulkJpgToPng() {
  return <BulkImageCompressor defaultConfig={{ format: 'png' }} />;
}

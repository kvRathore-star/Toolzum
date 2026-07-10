"use client";
import React from 'react';
import BulkImageCompressor from './BulkImageCompressor';

export default function BulkCompressPng() {
  return <BulkImageCompressor defaultConfig={{ format: 'png' }} />;
}

"use client";
import React from 'react';
import BulkImageCompressor from './BulkImageCompressor';

export default function BulkPngToJpg() {
  return <BulkImageCompressor defaultConfig={{ format: 'jpeg' }} />;
}

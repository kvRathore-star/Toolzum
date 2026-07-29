"use client";
import React from 'react';
import BulkImageCompressor from './BulkImageCompressor';

export default function BulkCompressJpg() {
  return <BulkImageCompressor defaultConfig={{ format: 'jpeg' }} />;
}

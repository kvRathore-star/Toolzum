"use client";
import React from 'react';
import BulkWebpAvifModernizer from './BulkWebpAvifModernizer';

export default function BulkPngToWebp() {
  return <BulkWebpAvifModernizer defaultConfig={{ format: 'webp' }} />;
}

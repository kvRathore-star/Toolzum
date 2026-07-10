"use client";
import React from 'react';
import BulkWebpAvifModernizer from './BulkWebpAvifModernizer';

export default function BulkJpgToWebp() {
  return <BulkWebpAvifModernizer defaultConfig={{ format: 'webp' }} />;
}

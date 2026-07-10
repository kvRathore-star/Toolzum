"use client";
import React from 'react';
import BulkAudioConverter from './BulkAudioConverter';

export default function BulkWavToMp3() {
  return <BulkAudioConverter defaultConfig={{ format: 'mp3' }} />;
}

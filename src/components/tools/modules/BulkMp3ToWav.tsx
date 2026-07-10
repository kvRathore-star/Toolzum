"use client";
import React from 'react';
import BulkAudioConverter from './BulkAudioConverter';

export default function BulkMp3ToWav() {
  return <BulkAudioConverter defaultConfig={{ format: 'wav' }} />;
}

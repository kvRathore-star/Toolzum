"use client";

import React from 'react';
import { LinkCard } from './ConvertersEverydayWidgets';

export default function ConvertersEverydayKit() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-lg font-bold mb-3">Everyday Converters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <LinkCard title="Area Converter" slug="area-converter" desc="Convert between square meters, square feet, acres, hectares, square kilometers, and more." />
          <LinkCard title="Cooking Measurement Converter" slug="cooking-measurement-converter" desc="Convert between tsp, tbsp, cups, pints, quarts, gallons, mL, and L." />
          <LinkCard title="Fuel Consumption Converter" slug="fuel-consumption-converter" desc="Convert between L/100km, MPG (US), MPG (UK), and km/L." />
          <LinkCard title="Paper Size Converter" slug="paper-size-converter" desc="Compare A0, A1, A4, Letter, and Legal paper sizes." />
          <LinkCard title="Clothing Size Converter" slug="clothing-size-converter" desc="Convert clothing sizes between US, UK, EU, Japan, and France." />
          <LinkCard title="Data Size Converter" slug="data-size-converter" desc="Convert between B, KB, MB, GB, TB, PB, and bits." />
        </div>
      </div>
      <div>
        <h2 className="text-lg font-bold mb-3">File Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <LinkCard title="Large Text File Viewer" slug="large-text-viewer" desc="View and search large text files up to 100K characters." />
          <LinkCard title="Archive Converter" slug="archive-converter" desc="Compress files into a real ZIP archive using JSZip DEFLATE compression." />
        </div>
      </div>
      <div>
        <h2 className="text-lg font-bold mb-3">Generators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <LinkCard title="Avro Schema Generator" slug="avro-schema-generator" desc="Generate Apache Avro schemas from JSON field definitions." />
          <LinkCard title="Avro to JSON Sample" slug="avro-to-json-sample" desc="Generate sample JSON data from an Avro schema." />
          <LinkCard title="iCal Event Generator" slug="ical-event-generator" desc="Generate .ics calendar files with summary, dates, and location." />
        </div>
      </div>
    </div>
  );
}

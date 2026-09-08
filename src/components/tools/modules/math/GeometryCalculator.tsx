"use client";
import { useState } from 'react';
import { CalcActions } from '../shared/CalcActions';
import { ac, borderClass } from '../miscToolColors';
import { Section, Input, labelClass, selClass } from '../MiscToolsShared';

export default function GeometryCalculator() {
  const clr = ac('GeometryCalculator');
  const [shape, setShape] = useState('circle');
  const [r, setR] = useState('5');
  const [w, setW] = useState('4');
  const [h, setH] = useState('3');
  const radius = Number(r), width = Number(w), height = Number(h);
  const calc = () => {
    switch (shape) {
      case 'circle': return { area: Math.PI * radius * radius, perimeter: 2 * Math.PI * radius };
      case 'square': return { area: width * width, perimeter: 4 * width, volume: width * width * width };
      case 'triangle': return { area: 0.5 * width * height };
      case 'rectangle': return { area: width * height, perimeter: 2 * (width + height) };
      case 'sphere': return { area: 4 * Math.PI * radius * radius, volume: 4 / 3 * Math.PI * radius * radius * radius };
      case 'cylinder': return { area: 2 * Math.PI * radius * (radius + height), volume: Math.PI * radius * radius * height };
      case 'cone': return { area: Math.PI * radius * (radius + Math.sqrt(height * height + radius * radius)), volume: Math.PI * radius * radius * height / 3 };
      case 'cube': return { area: 6 * width * width, volume: width * width * width };
      default: return {};
    }
  };
  const result = calc();
  const resultLines = [
    result.area !== undefined && `Area: ${result.area.toFixed(4)}`,
    result.perimeter !== undefined && `Perimeter: ${result.perimeter.toFixed(4)}`,
    result.volume !== undefined && `Volume: ${result.volume.toFixed(4)}`,
  ].filter(Boolean);
  const resultText = `Shape: ${shape}\n${resultLines.join('\n')}`;
  const csvHeaders = ['Shape', 'Radius', 'Width', 'Height', 'Area', 'Perimeter', 'Volume'].join(',');
  const csvValues = [shape, r, w, h, result.area?.toFixed(4) ?? '', result.perimeter?.toFixed(4) ?? '', result.volume?.toFixed(4) ?? ''].join(',');
  const downloadData = `${csvHeaders}\n${csvValues}`;
  return (
    <Section title="Geometry Calculator">
      <select className={selClass} value={shape} onChange={e => setShape(e.target.value)} aria-label="Shape">
        <option value="circle">Circle</option><option value="square">Square</option><option value="triangle">Triangle</option>
        <option value="rectangle">Rectangle</option><option value="sphere">Sphere</option><option value="cylinder">Cylinder</option>
        <option value="cone">Cone</option><option value="cube">Cube</option>
      </select>
      <div className="flex gap-2 flex-wrap">
        {(shape === 'circle' || shape === 'sphere' || shape === 'cylinder' || shape === 'cone') && <div><label className={labelClass}>Radius</label><Input label="Radius" type="number" value={r} onChange={setR} /></div>}
        {(shape === 'square' || shape === 'rectangle' || shape === 'cube') && <div><label className={labelClass}>Width</label><Input label="Width" type="number" value={w} onChange={setW} /></div>}
        {(shape === 'triangle' || shape === 'rectangle' || shape === 'cylinder' || shape === 'cone') && <div><label className={labelClass}>Height</label><Input label="Height" type="number" value={h} onChange={setH} /></div>}
      </div>
      <div className="text-xs space-y-1">
        {result.area !== undefined && <div>Area: {result.area.toFixed(4)}</div>}
        {result.perimeter !== undefined && <div>Perimeter: {result.perimeter.toFixed(4)}</div>}
        {result.volume !== undefined && <div>Volume: {result.volume.toFixed(4)}</div>}
      </div>
      <CalcActions result={resultText} downloadData={downloadData} downloadFilename="geometry.csv" />
    </Section>
  );
}

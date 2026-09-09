"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react';

type VariantKey = 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

const CVD_MATRICES: Record<VariantKey, { label: string; description: string; matrix: [number, number, number, number, number, number, number, number, number] }> = {
  protanopia: {
    label: 'Protanopia',
    description: 'Red-blind — red cones absent',
    matrix: [0.56667, 0.43333, 0, 0.55833, 0.44167, 0, 0, 0.24167, 0.75833],
  },
  deuteranopia: {
    label: 'Deuteranopia',
    description: 'Green-blind — green cones absent',
    matrix: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7],
  },
  tritanopia: {
    label: 'Tritanopia',
    description: 'Blue-blind — blue cones absent',
    matrix: [0.95, 0.05, 0, 0, 0.43333, 0.56667, 0, 0.475, 0.525],
  },
  achromatopsia: {
    label: 'Achromatopsia',
    description: 'Monochrome — no color vision',
    matrix: [0.2126, 0.7152, 0.0722, 0.2126, 0.7152, 0.0722, 0.2126, 0.7152, 0.0722],
  },
};

function applyMatrix(imgData: ImageData, m: [number, number, number, number, number, number, number, number, number]): ImageData {
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    data[i] = m[0] * r! + m[1] * g! + m[2] * b!;
    data[i + 1] = m[3] * r! + m[4] * g! + m[5] * b!;
    data[i + 2] = m[6] * r! + m[7] * g! + m[8] * b!;
  }
  return imgData;
}

function drawSample(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#ff5f6d');
  grad.addColorStop(0.5, '#ffc371');
  grad.addColorStop(1, '#38ef7d');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const palette = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#800000'];
  for (let i = 0; i < palette.length; i++) {
    ctx.fillStyle = palette[i]!;
    ctx.beginPath();
    ctx.arc(30 + i * ((w - 60) / (palette.length - 1)), 70, 16, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#212121';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('Color Blindness Simulator', 24, 130);
  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#3d3d3d';
  ctx.fillText('Upload an image (or keep the sample) to see how it looks', 24, 158);
}

function render(source: HTMLImageElement | null, canvas: HTMLCanvasElement, matrix?: [number, number, number, number, number, number, number, number, number]) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  if (source && source.naturalWidth > 0) {
    const scale = Math.min(canvas.width / source.naturalWidth, canvas.height / source.naturalHeight);
    const dw = source.naturalWidth * scale, dh = source.naturalHeight * scale;
    const dx = (canvas.width - dw) / 2, dy = (canvas.height - dh) / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(source, dx, dy, dw, dh);
  } else {
    drawSample(canvas);
  }
  if (!matrix) return;
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.putImageData(applyMatrix(imgData, matrix), 0, 0);
}

export default function ColorBlindnessSimulator() {
  const [active, setActive] = useState<VariantKey>('deuteranopia');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const originalRef = useRef<HTMLCanvasElement>(null);
  const simulatedRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = originalRef.current;
    if (!canvas) return;
    canvas.width = 720;
    canvas.height = 420;
    render(imageEl, canvas);
  }, [imageEl]);

  useEffect(() => {
    const canvas = simulatedRef.current;
    if (!canvas) return;
    canvas.width = 720;
    canvas.height = 420;
    render(imageEl, canvas, CVD_MATRICES[active].matrix);
  }, [imageEl, active]);

  const onUpload = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => setImageEl(img);
    img.src = url;
    setImageSrc(url);
  }, []);

  const onDownload = () => {
    const canvas = simulatedRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `cvd-simulator-${active}.png`;
    a.click();
  };

  const inputClass = "w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2";

  return (
    <div className="p-6 space-y-4">
      <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Color Blindness Simulator</h2>
      <p className="text-sm mb-6 text-[var(--text-secondary)]">
        Simulate how your designs and images appear to people with protanopia, deuteranopia, tritanopia,
        and achromatopsia color vision deficiencies. Everything runs locally in your browser — nothing is uploaded.
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <label className="flex-1 min-w-[220px] cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
            }}
          />
          <span className={`${inputClass} inline-block text-center text-sm`}>Upload an image…</span>
        </label>
        {imageSrc && (
          <button
            onClick={() => { setImageSrc(null); setImageEl(null); }}
            className="text-sm text-blue-600 hover:underline"
          >
            Reset to sample
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.keys(CVD_MATRICES) as VariantKey[]).map(k => (
          <button
            key={k}
            onClick={() => setActive(k)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
              active === k
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-blue-500'
            }`}
          >
            {CVD_MATRICES[k].label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Original</span>
          </div>
          <canvas ref={originalRef} className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{CVD_MATRICES[active].label}</span>
            <span className="text-xs text-[var(--text-secondary)]">{CVD_MATRICES[active].description}</span>
          </div>
          <canvas ref={simulatedRef} className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]" />
        </div>
      </div>

      <button
        onClick={onDownload}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg"
      >
        Download simulated image
      </button>
      </div>
    </div>
  );
}

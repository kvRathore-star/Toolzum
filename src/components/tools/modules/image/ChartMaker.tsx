"use client";

import React, { useState, useEffect, useRef } from 'react';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';

type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'area' | 'horizontalBar';

interface DataRow {
  id: number;
  label: string;
  value: string;
}

interface Palette {
  name: string;
  colors: string[];
}

const PALETTES: Palette[] = [
  { name: 'Vibrant', colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#E7E9ED', '#7BC8A4', '#C9CBCF', '#FF6B6B'] },
  { name: 'Ocean', colors: ['#0077B6', '#00B4D8', '#90E0EF', '#48CAE4', '#023E8A', '#0096C7', '#ADE8F4', '#03045E', '#CAF0F8', '#00B4D8'] },
  { name: 'Forest', colors: ['#2D6A4F', '#52B788', '#95D5B2', '#40916C', '#1B4332', '#74C69D', '#D8F3DC', '#081C15', '#B7E4C7', '#52B788'] },
  { name: 'Sunset', colors: ['#FF6B35', '#F7C59F', '#EFEFD0', '#004E89', '#1A659E', '#FFB563', '#FFD166', '#E8553A', '#2F4858', '#FF9F1C'] },
  { name: 'Monochrome', colors: ['#212529', '#343A40', '#495057', '#6C757D', '#ADB5BD', '#CED4DA', '#DEE2E6', '#E9ECEF', '#F8F9FA', '#212529'] },
  { name: 'Pastel', colors: ['#B8E1FF', '#FFB3C6', '#FFD6A5', '#BFFCC6', '#C9B1FF', '#FDBCB4', '#FFF1A5', '#B5EAD7', '#FFC8DD', '#D0F4DE'] },
  { name: 'Neon', colors: ['#FF007F', '#00F5FF', '#FFFF00', '#00FF41', '#FF00FF', '#FF6600', '#00FFFF', '#FF0040', '#8B00FF', '#00FF80'] },
  { name: 'Earth', colors: ['#8B4513', '#A0522D', '#D2691E', '#CD853F', '#DEB887', '#D2B48C', '#BC8F8F', '#F5DEB3', '#FAEBD7', '#8B7355'] },
  { name: 'Berry', colors: ['#6B2D5C', '#8B3A6E', '#A84D8A', '#C2669B', '#DB8DB3', '#E8A9C4', '#F0C0D3', '#F5D6E3', '#FAEAF1', '#6B2D5C'] },
  { name: 'Slate', colors: ['#1E293B', '#334155', '#475569', '#64748B', '#94A3B8', '#CBD5E1', '#E2E8F0', '#F1F5F9', '#F8FAFC', '#0F172A'] },
];

const CHART_TYPES: { value: ChartType; label: string; icon: string }[] = [
  { value: 'bar', label: 'Bar', icon: '▏▏▏' },
  { value: 'line', label: 'Line', icon: '╱╱╱' },
  { value: 'pie', label: 'Pie', icon: '●' },
  { value: 'doughnut', label: 'Doughnut', icon: '○' },
  { value: 'area', label: 'Area', icon: '◢◢◢' },
  { value: 'horizontalBar', label: 'Horizontal Bar', icon: '■■■' },
];

const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function darken(hex: string, amount: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export default function ChartMaker() {
  const [step, setStep] = useState<'data' | 'preview'>('data');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [data, setData] = useState<DataRow[]>([{ id: 1, label: 'A', value: '50' }, { id: 2, label: 'B', value: '80' }, { id: 3, label: 'C', value: '35' }]);
  const [title, setTitle] = useState('My Chart');
  const [xLabel, setXLabel] = useState('');
  const [yLabel, setYLabel] = useState('');
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(500);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [showLabels, setShowLabels] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  let nextId = data.length + 1;

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const addRow = () => {
    setData([...data, { id: nextId++, label: '', value: '' }]);
  };

  const removeRow = (id: number) => {
    if (data.length <= 2) { toast.error('Need at least 2 data points'); return; }
    setData(data.filter(r => r.id !== id));
  };

  const updateRow = (id: number, field: 'label' | 'value', val: string) => {
    setData(data.map(r => r.id === id ? { ...r, [field]: val } : r));
  };

  const parsedData = data.map((r, i) => ({
    label: r.label || `Item ${i + 1}`,
    value: parseFloat(r.value) || 0,
    color: PALETTES[paletteIndex]!.colors[i % PALETTES[paletteIndex]!.colors.length] ?? "",
  }));

  const renderChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const pad = { top: 60, right: 30, bottom: 70, left: 70 };
    const hasTitle = !!title;
    if (hasTitle) pad.top = 70;
    if (showLegend) pad.right = 140;

    const chartW = width - pad.left - pad.right;
    const chartH = height - pad.top - pad.bottom;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    if (title) {
      ctx.fillStyle = '#111827';
      ctx.font = `bold 22px ${FONT_FAMILY}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(title, width / 2, 15);
    }

    const items = parsedData.filter(d => d.value > 0 || chartType === 'line' || chartType === 'area');
    if (items.length === 0) {
      ctx.fillStyle = '#9CA3AF';
      ctx.font = `16px ${FONT_FAMILY}`;
      ctx.textAlign = 'center';
      ctx.fillText('No data to display', width / 2, height / 2);
      return;
    }

    if (chartType === 'pie' || chartType === 'doughnut') {
      drawPieChart(ctx, items, chartW, chartH, pad);
    } else {
      drawAxisChart(ctx, items, chartW, chartH, pad);
    }

    if (showLegend) drawLegend(ctx, items, width - pad.right + 10, pad.top);
  };

  const drawAxisChart = (ctx: CanvasRenderingContext2D, items: { label: string; value: number; color: string }[], chartW: number, chartH: number, pad: { top: number; left: number; bottom: number; right: number }) => {
    const values = items.map(d => d.value);
    const maxVal = Math.max(...values, 1);
    const niceMax = Math.ceil(maxVal / 10) * 10 || 10;
    const isHorizontal = chartType === 'horizontalBar';
    const count = items.length;

    if (isHorizontal) {
      const barH = Math.min(40, (chartH - (count - 1) * 5) / count);
      const barGap = 5;

      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 1;
      const gridCount = 6;
      for (let i = 0; i <= gridCount; i++) {
        const x = pad.left + (chartW / gridCount) * i;
        ctx.beginPath();
        ctx.moveTo(x, pad.top);
        ctx.lineTo(x, pad.top + chartH);
        ctx.stroke();
        ctx.fillStyle = '#6B7280';
        ctx.font = `11px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(Math.round((niceMax / gridCount) * i).toString(), x, pad.top + chartH + 5);
      }
      if (xLabel) {
        ctx.fillStyle = '#374151';
        ctx.font = `13px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(xLabel, pad.left + chartW / 2, height - 20);
      }

      items.forEach((item, i) => {
        const y = pad.top + i * (barH + barGap);
        const barW = (item.value / niceMax) * chartW;
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.roundRect(pad.left, y, barW, barH, 3);
        ctx.fill();
        ctx.fillStyle = '#111827';
        ctx.font = `12px ${FONT_FAMILY}`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.label, pad.left - 10, y + barH / 2);
        if (showLabels) {
          ctx.fillStyle = '#111827';
          ctx.font = `bold 12px ${FONT_FAMILY}`;
          ctx.textAlign = 'left';
          ctx.fillText(item.value.toString(), pad.left + barW + 6, y + barH / 2);
        }
      });
      if (yLabel) {
        ctx.save();
        ctx.translate(15, pad.top + chartH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = '#374151';
        ctx.font = `13px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.fillText(yLabel, 0, 0);
        ctx.restore();
      }
      return;
    }

    // Vertical bar, line, area
    const barW = Math.min(50, (chartW - count * 4) / count);
    const barGap = chartType === 'bar' ? (chartW - count * barW) / (count + 1) : 0;

    // Grid lines
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    const gridCount = 6;
    for (let i = 0; i <= gridCount; i++) {
      const y = pad.top + chartH - (chartH / gridCount) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + chartW, y);
      ctx.stroke();
      ctx.fillStyle = '#6B7280';
      ctx.font = `11px ${FONT_FAMILY}`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.round((niceMax / gridCount) * i).toString(), pad.left - 8, y);
    }

    if (yLabel) {
      ctx.save();
      ctx.translate(18, pad.top + chartH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = '#374151';
      ctx.font = `13px ${FONT_FAMILY}`;
      ctx.textAlign = 'center';
      ctx.fillText(yLabel, 0, 0);
      ctx.restore();
    }
    if (xLabel) {
      ctx.fillStyle = '#374151';
      ctx.font = `13px ${FONT_FAMILY}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(xLabel, pad.left + chartW / 2, height - 20);
    }

    if (chartType === 'line' || chartType === 'area') {
      const points = items.map((item, i) => {
        const x = pad.left + (chartW / (count - 1 || 1)) * i;
        const y = pad.top + chartH - (item.value / niceMax) * chartH;
        return { x, y, ...item };
      });

      const area = chartType === 'area';
      ctx.beginPath();
      if (area) ctx.moveTo(points[0]!.x, pad.top + chartH);
      ctx.moveTo(points[0]!.x, points[0]!.y);
      points.forEach((p, i) => {
        if (i === 0) return;
        const prev = points[i - 1]!;
        const cpx = (prev.x + p.x) / 2;
        ctx.bezierCurveTo(cpx, prev.y, cpx, p.y, p.x, p.y);
      });
      if (area) {
        ctx.lineTo(points[points.length - 1]!.x, pad.top + chartH);
        ctx.closePath();
        const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
        gradient.addColorStop(0, hexToRgba(items[0]?.color || '#36A2EB', 0.3));
        gradient.addColorStop(1, hexToRgba(items[0]?.color || '#36A2EB', 0.02));
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      ctx.strokeStyle = items[0]?.color || '#36A2EB';
      ctx.lineWidth = 3;
      ctx.stroke();

      points.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        if (showLabels) {
          ctx.fillStyle = '#111827';
          ctx.font = `bold 12px ${FONT_FAMILY}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(p.value.toString(), p.x, p.y - 10);
        }
      });

      items.forEach((item, i) => {
        ctx.fillStyle = '#111827';
        ctx.font = `11px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(item.label, pad.left + (chartW / (count - 1 || 1)) * i, pad.top + chartH + 5);
      });
    } else {
      // Bar chart
      items.forEach((item, i) => {
        const x = pad.left + barGap + i * (barW + barGap);
        const barH = (item.value / niceMax) * chartH;
        const y = pad.top + chartH - barH;
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, [3, 3, 0, 0]);
        ctx.fill();
        if (showLabels) {
          ctx.fillStyle = '#111827';
          ctx.font = `bold 12px ${FONT_FAMILY}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(item.value.toString(), x + barW / 2, y - 5);
        }
        ctx.fillStyle = '#111827';
        ctx.font = `11px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(item.label, x + barW / 2, pad.top + chartH + 5);
      });
    }
  };

  const drawPieChart = (ctx: CanvasRenderingContext2D, items: { label: string; value: number; color: string }[], chartW: number, chartH: number, pad: { top: number; left: number; bottom: number; right: number }) => {
    const total = items.reduce((s, d) => s + d.value, 0);
    if (total === 0) return;
    const cx = pad.left + chartW / 2;
    const cy = pad.top + chartH / 2;
    const radius = Math.min(chartW, chartH) / 2 - 10;
    const isDoughnut = chartType === 'doughnut';
    let startAngle = -Math.PI / 2;

    items.forEach((item) => {
      const sliceAngle = (item.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.strokeStyle = bgColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      if (showLabels) {
        const midAngle = startAngle + sliceAngle / 2;
        const labelR = radius * 0.65;
        const lx = cx + Math.cos(midAngle) * labelR;
        const ly = cy + Math.sin(midAngle) * labelR;
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold 12px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const pct = ((item.value / total) * 100).toFixed(1);
        ctx.fillText(`${pct}%`, lx, ly);
      }

      // Outer label lines for small arcs
      const midAngle = startAngle + sliceAngle / 2;
      const outerR = radius + 12;
      const lx = cx + Math.cos(midAngle) * outerR;
      const ly = cy + Math.sin(midAngle) * outerR;
      ctx.fillStyle = '#111827';
      ctx.font = `11px ${FONT_FAMILY}`;
      ctx.textAlign = midAngle > -Math.PI / 2 && midAngle < Math.PI / 2 ? 'left' : 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.label, lx, ly);

      startAngle += sliceAngle;
    });

    if (isDoughnut) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = bgColor;
      ctx.fill();
      ctx.fillStyle = '#6B7280';
      ctx.font = `bold 14px ${FONT_FAMILY}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(total.toString(), cx, cy);
    }
  };

  const drawLegend = (ctx: CanvasRenderingContext2D, items: { label: string; value: number; color: string }[], x: number, y: number) => {
    ctx.fillStyle = '#111827';
    ctx.font = `bold 13px ${FONT_FAMILY}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('Legend', x, y);

    items.forEach((item, i) => {
      const ly = y + 22 + i * 22;
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.roundRect(x, ly, 12, 12, 2);
      ctx.fill();
      ctx.fillStyle = '#374151';
      ctx.font = `11px ${FONT_FAMILY}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${item.label} (${item.value})`, x + 18, ly + 6);
    });
  };

  const handleGenerate = async () => {
    if (parsedData.some(d => isNaN(d.value))) {
      toast.error('Please enter valid numeric values');
      return;
    }
    setIsProcessing(true);
    try {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          renderChart();
          resolve();
        });
      });
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not found');
      canvas.toBlob((blob) => {
        if (!blob) { toast.error('Failed to generate image'); return; }
        if (outputUrl) URL.revokeObjectURL(outputUrl);
        const url = URL.createObjectURL(blob);
        setOutputUrl(url);
        setStep('preview');
        toast.success('Chart generated successfully!');
      }, 'image/png');
    } catch (e) {
      toast.error('An error occurred while generating the chart.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    if (outputUrl) { URL.revokeObjectURL(outputUrl); setOutputUrl(null); }
    setStep('data');
  };

  if (step === 'preview') {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
          <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
            <h4 className="font-bold text-emerald-500">Chart Generated</h4>
          </div>
          <div className="flex justify-center bg-[var(--bg-overlay)]/50 rounded-xl overflow-hidden border border-[var(--border-subtle)] p-4">
            <canvas ref={canvasRef} className="max-w-full h-auto rounded-lg shadow-sm" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleBack} className="flex-1 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold px-4 py-3 rounded-xl transition-colors">
              Back to Editor
            </button>
            <button onClick={() => outputUrl && downloadOrShare(outputUrl, `${title || 'chart'}.png`)} className="flex-1 bg-emerald-700 hover:bg-emerald-700 text-white font-bold px-4 py-3 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download as PNG
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm">
        <strong>Create Beautiful Charts:</strong> Enter your data, customize appearance, and download as PNG. All processing happens in your browser.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Data Input */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4 h-fit">
          <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">Data Entry</h4>

          <div>
            <label htmlFor="lbl-chartmaker-chart-title" className="block text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] mb-1.5">Chart Title</label>
            <input id="lbl-chartmaker-chart-title" aria-label="Chart Title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]" placeholder="My Chart" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="lbl-chartmaker-x-axis-label" className="block text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] mb-1.5">X-Axis Label</label>
              <input id="lbl-chartmaker-x-axis-label" aria-label="X-Axis Label" type="text" value={xLabel} onChange={e => setXLabel(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]" placeholder="Category" />
            </div>
            <div>
              <label htmlFor="lbl-chartmaker-y-axis-label" className="block text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] mb-1.5">Y-Axis Label</label>
              <input id="lbl-chartmaker-y-axis-label" aria-label="Y-Axis Label" type="text" value={yLabel} onChange={e => setYLabel(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]" placeholder="Value" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)]">Data Table (Label, Value)</label>
              <button onClick={addRow} className="text-xs text-[var(--accent)] hover:text-[var(--accent)] dark:hover:text-[var(--accent)] font-medium px-2 py-1 bg-[var(--accent)]/10/30 rounded-lg transition-colors">+ Add Row</button>
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {data.map(row => (
                <div key={row.id} className="flex gap-2 items-center">
                  <input aria-label="Label" type="text" value={row.label} onChange={e => updateRow(row.id, 'label', e.target.value)} className="flex-1 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)] w-1/2" placeholder="Label" />
                  <input aria-label="Data value" type="text" value={row.value} onChange={e => updateRow(row.id, 'value', e.target.value)} className="flex-1 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)] w-1/3" placeholder="Value" />
                  <button aria-label={row.label ? `Remove row ${row.label}` : 'Remove chart row'} onClick={() => removeRow(row.id)} className="text-[var(--text-muted)] hover:text-red-500 transition-colors p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Chart Settings */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4 h-fit">
          <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">Chart Settings</h4>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] mb-1.5">Chart Type</label>
            <div className="grid grid-cols-3 gap-2">
              {CHART_TYPES.map(ct => (
                <button key={ct.value} onClick={() => setChartType(ct.value)} className={`py-2 px-1 rounded-lg text-xs font-bold transition-all border ${chartType === ct.value ? 'bg-[var(--accent-ink)] border-[var(--accent)] text-white shadow-md' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:border-[var(--accent)]/30'}`}>
                  <div className="text-base mb-0.5">{ct.icon}</div>
                  {ct.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] mb-1.5">Color Palette</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {PALETTES.map((p, i) => (
                <button key={p.name} onClick={() => setPaletteIndex(i)} className={`h-8 rounded-lg border-2 transition-all ${paletteIndex === i ? 'border-[var(--accent)] shadow-md scale-105' : 'border-[var(--border-subtle)]'}`} title={p.name} style={{ background: `linear-gradient(90deg, ${p.colors.slice(0, 5).join(', ')})` }} />
              ))}
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">{PALETTES[paletteIndex]!.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="lbl-chartmaker-width-width-px" className="block text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] mb-1.5">Width: {width}px</label>
              <input id="lbl-chartmaker-width-width-px" type="range" min={400} max={2000} step={50} value={width} onChange={e => setWidth(Number(e.target.value))} className="w-full accent-blue-600" />
            </div>
            <div>
              <label htmlFor="lbl-chartmaker-height-height-px" className="block text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] mb-1.5">Height: {height}px</label>
              <input id="lbl-chartmaker-height-height-px" type="range" min={300} max={1200} step={50} value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full accent-blue-600" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] mb-1.5">Background Color</label>
            <div className="flex gap-2 items-center">
              <input aria-label="Background Color" type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="h-9 w-12 rounded-lg border border-[var(--border-subtle)] cursor-pointer bg-transparent" />
              <input aria-label="Background Color" type="text" value={bgColor} onChange={e => setBgColor(e.target.value)} className="flex-1 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)] font-mono" />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-[var(--text-primary)] cursor-pointer">
              <input type="checkbox" checked={showLabels} onChange={e => setShowLabels(e.target.checked)} className="rounded border-[var(--border-subtle)] dark:border-[var(--border-subtle)] text-[var(--accent)] focus:ring-[var(--accent)]" />
              Data Labels
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--text-primary)] cursor-pointer">
              <input type="checkbox" checked={showLegend} onChange={e => setShowLegend(e.target.checked)} className="rounded border-[var(--border-subtle)] dark:border-[var(--border-subtle)] text-[var(--accent)] focus:ring-[var(--accent)]" />
              Legend
            </label>
          </div>

          <button onClick={handleGenerate} disabled={isProcessing} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            {isProcessing ? 'Generating...' : 'Generate Chart'}
          </button>

          <div className="bg-[var(--bg-overlay)]/50 border border-dashed border-[var(--border-subtle)] rounded-xl overflow-hidden min-h-[200px] flex items-center justify-center">
            <canvas ref={canvasRef} className="max-w-full h-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

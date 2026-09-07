"use client";
import React, { useState, useId } from 'react';

const inputClass = "w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2";
const labelClass = "block text-sm font-medium mb-1";
const btnClass = "w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg";
const cardClass = "max-w-4xl mx-auto p-6";
const headingClass = "text-2xl font-bold mb-6";
const previewClass = "w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl flex items-center justify-center mb-4";
const codeClass = "w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 font-mono text-xs h-32 overflow-auto whitespace-pre";

function Slider({ label, value, onChange, min, max, step = 1 }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number }) {
  const id = useId();
  return (
    <div className="flex items-center gap-3">
      <label htmlFor={id} className="text-xs font-medium w-24 shrink-0">{label}</label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="flex-1 accent-blue-600" />
      <input type="number" aria-label={`${label} value`} value={value} onChange={e => onChange(Number(e.target.value))} className="w-16 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-2 py-1 text-xs text-center" />
    </div>
  );
}

/* ─── Category / Mode config ─── */

type Mode = 'box-shadow' | 'gradient' | 'border-radius' | 'text-shadow' | 'transform' | 'filter' | 'flexbox' | 'grid' | 'animation' | 'glassmorphism' | 'neumorphism' | 'border-css';

const CATEGORIES: { key: string; label: string; modes: Mode[] }[] = [
  { key: 'shadows',  label: 'Shadows',  modes: ['box-shadow', 'text-shadow'] },
  { key: 'layout',   label: 'Layout',   modes: ['flexbox', 'grid'] },
  { key: 'effects',  label: 'Effects',  modes: ['transform', 'animation', 'filter'] },
  { key: 'shapes',   label: 'Shapes',   modes: ['border-radius', 'border-css', 'gradient'] },
  { key: 'special',  label: 'Special',  modes: ['glassmorphism', 'neumorphism'] },
];

const MODE_LABELS: Record<Mode, string> = {
  'box-shadow':     'Box Shadow',
  'text-shadow':    'Text Shadow',
  'flexbox':        'Flexbox',
  'grid':           'CSS Grid',
  'transform':      'Transform',
  'animation':      'Animation',
  'filter':         'Filter',
  'border-radius':  'Border Radius',
  'border-css':     'Border CSS',
  'gradient':       'Gradient',
  'glassmorphism':  'Glassmorphism',
  'neumorphism':    'Neumorphism',
};

function getCategoryForMode(mode: Mode): string {
  for (const cat of CATEGORIES) {
    if (cat.modes.includes(mode)) return cat.key;
  }
  return 'shadows';
}

/* ─── Inner Generators ─── */

function BoxShadowGeneratorInner() {
  const [x, setX] = useState(2); const [y, setY] = useState(2); const [blur, setBlur] = useState(4);
  const [spread, setSpread] = useState(0); const [color, setColor] = useState('#000000'); const [opacity, setOpacity] = useState(0.3);
  const [inset, setInset] = useState(false);
  const css = `box-shadow: ${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px ${color}${opacity < 1 ? Math.round(opacity * 100) : ''};`;
  return (
    <div className="space-y-4">
      <div className={previewClass} style={{ boxShadow: `${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}` }}>
        <div className="w-24 h-24 bg-[var(--bg-elevated)] rounded-lg" />
      </div>
      <Slider label="Offset X" value={x} onChange={setX} min={-20} max={20} />
      <Slider label="Offset Y" value={y} onChange={setY} min={-20} max={20} />
      <Slider label="Blur" value={blur} onChange={setBlur} min={0} max={40} />
      <Slider label="Spread" value={spread} onChange={setSpread} min={-20} max={20} />
      <div className="flex items-center gap-3">
        <label className="text-xs font-medium w-24 shrink-0">Color</label>
        <input aria-label="Color" type="color" value={color} onChange={e => setColor(e.target.value)} className="h-8 w-12 rounded cursor-pointer" />
        <input aria-label="Color" type="text" value={color} onChange={e => setColor(e.target.value)} className="w-24 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-2 py-1 text-xs" />
        <label className="text-xs font-medium ml-2">Opacity</label>
        <input aria-label="Opacity" type="range" min={0} max={1} step={0.05} value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="flex-1 accent-blue-600" />
        <span className="text-xs w-8">{Math.round(opacity * 100)}%</span>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={inset} onChange={e => setInset(e.target.checked)} className="accent-blue-600" /> Inset</label>
      <pre className={codeClass}>{css}</pre>
      <button onClick={() => navigator.clipboard.writeText(css)} className={btnClass}>Copy CSS</button>
    </div>
  );
}

function GradientGeneratorInner() {
  const [direction, setDirection] = useState('to bottom right');
  const [color1, setColor1] = useState('#3b82f6'); const [color2, setColor2] = useState('#8b5cf6');
  const css = `background: linear-gradient(${direction}, ${color1}, ${color2});`;
  return (
    <div className="space-y-4">
      <div className={previewClass} style={{ background: `linear-gradient(${direction}, ${color1}, ${color2})` }} />
      <div>
        <label className={labelClass}>Direction</label>
        <select aria-label="Direction" value={direction} onChange={e => setDirection(e.target.value)} className={inputClass}>
          <option value="to bottom">Top to Bottom</option>
          <option value="to top">Bottom to Top</option>
          <option value="to right">Left to Right</option>
          <option value="to left">Right to Left</option>
          <option value="to bottom right">Top-Left to Bottom-Right</option>
          <option value="to top left">Bottom-Right to Top-Left</option>
        </select>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className={labelClass}>Color 1</label>
          <input aria-label="Color 1" type="color" value={color1} onChange={e => setColor1(e.target.value)} className="w-full h-10 rounded cursor-pointer" />
        </div>
        <div className="flex-1">
          <label className={labelClass}>Color 2</label>
          <input aria-label="Color 2" type="color" value={color2} onChange={e => setColor2(e.target.value)} className="w-full h-10 rounded cursor-pointer" />
        </div>
      </div>
      <pre className={codeClass}>{css}</pre>
      <button onClick={() => navigator.clipboard.writeText(css)} className={btnClass}>Copy CSS</button>
    </div>
  );
}

function BorderRadiusGeneratorInner() {
  const [tl, setTl] = useState(8); const [tr, setTr] = useState(8); const [br, setBr] = useState(8); const [bl, setBl] = useState(8);
  const css = `border-radius: ${tl}px ${tr}px ${br}px ${bl}px;`;
  return (
    <div className="space-y-4">
      <div className={previewClass}>
        <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600" style={{ borderRadius: `${tl}px ${tr}px ${br}px ${bl}px` }} />
      </div>
      <Slider label="Top-Left" value={tl} onChange={setTl} min={0} max={60} />
      <Slider label="Top-Right" value={tr} onChange={setTr} min={0} max={60} />
      <Slider label="Bottom-Right" value={br} onChange={setBr} min={0} max={60} />
      <Slider label="Bottom-Left" value={bl} onChange={setBl} min={0} max={60} />
      <pre className={codeClass}>{css}</pre>
      <button onClick={() => navigator.clipboard.writeText(css)} className={btnClass}>Copy CSS</button>
    </div>
  );
}

function FlexboxGeneratorInner() {
  const [direction, setDirection] = useState('row'); const [wrap, setWrap] = useState('nowrap');
  const [justify, setJustify] = useState('flex-start'); const [align, setAlign] = useState('stretch');
  const [gap, setGap] = useState(8);
  const css = `display: flex;\nflex-direction: ${direction};\nflex-wrap: ${wrap};\njustify-content: ${justify};\nalign-items: ${align};\ngap: ${gap}px;`;
  return (
    <div className="space-y-4">
      <div className={previewClass} style={{ display: 'flex', flexDirection: direction as any, flexWrap: wrap as any, justifyContent: justify as any, alignItems: align as any, gap, padding: 8 }}>
        {[1, 2, 3].map(i => <div key={i} className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">{i}</div>)}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelClass}>Direction</label><select aria-label="Direction" value={direction} onChange={e => setDirection(e.target.value)} className={inputClass}><option value="row">Row</option><option value="column">Column</option><option value="row-reverse">Row Reverse</option><option value="column-reverse">Column Reverse</option></select></div>
        <div><label className={labelClass}>Wrap</label><select aria-label="Wrap" value={wrap} onChange={e => setWrap(e.target.value)} className={inputClass}><option value="nowrap">No Wrap</option><option value="wrap">Wrap</option></select></div>
        <div><label className={labelClass}>Justify</label><select aria-label="Justify" value={justify} onChange={e => setJustify(e.target.value)} className={inputClass}><option value="flex-start">Start</option><option value="center">Center</option><option value="flex-end">End</option><option value="space-between">Space Between</option><option value="space-around">Space Around</option></select></div>
        <div><label className={labelClass}>Align</label><select aria-label="Align" value={align} onChange={e => setAlign(e.target.value)} className={inputClass}><option value="stretch">Stretch</option><option value="flex-start">Start</option><option value="center">Center</option><option value="flex-end">End</option></select></div>
      </div>
      <Slider label="Gap" value={gap} onChange={setGap} min={0} max={40} />
      <pre className={codeClass}>{css}</pre>
      <button onClick={() => navigator.clipboard.writeText(css)} className={btnClass}>Copy CSS</button>
    </div>
  );
}

function GridGeneratorInner() {
  const [columns, setColumns] = useState(3); const [rows, setRows] = useState(2); const [gap, setGap] = useState(8);
  const css = `display: grid;\ngrid-template-columns: repeat(${columns}, 1fr);\ngrid-template-rows: repeat(${rows}, 1fr);\ngap: ${gap}px;`;
  const items = Array.from({ length: columns * rows });
  return (
    <div className="space-y-4">
      <div className={previewClass} style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)`, gap, padding: 8 }}>
        {items.map((_, i) => <div key={i} className="bg-blue-500 rounded flex items-center justify-center text-white font-bold text-sm min-h-[40px]">{i + 1}</div>)}
      </div>
      <Slider label="Columns" value={columns} onChange={setColumns} min={1} max={6} />
      <Slider label="Rows" value={rows} onChange={setRows} min={1} max={4} />
      <Slider label="Gap" value={gap} onChange={setGap} min={0} max={40} />
      <pre className={codeClass}>{css}</pre>
      <button onClick={() => navigator.clipboard.writeText(css)} className={btnClass}>Copy CSS</button>
    </div>
  );
}

function TextShadowGeneratorInner() {
  const [x, setX] = useState(1); const [y, setY] = useState(1); const [blur, setBlur] = useState(2);
  const [color, setColor] = useState('#000000'); const [opacity, setOpacity] = useState(0.5);
  const css = `text-shadow: ${x}px ${y}px ${blur}px ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')};`;
  return (
    <div className="space-y-4">
      <div className={previewClass}>
        <span className="text-4xl font-bold" style={{ textShadow: `${x}px ${y}px ${blur}px ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}` }}>Shadow</span>
      </div>
      <Slider label="Offset X" value={x} onChange={setX} min={-10} max={10} />
      <Slider label="Offset Y" value={y} onChange={setY} min={-10} max={10} />
      <Slider label="Blur" value={blur} onChange={setBlur} min={0} max={20} />
      <div className="flex items-center gap-3">
        <label className="text-xs font-medium w-24 shrink-0">Color</label>
        <input aria-label="Color" type="color" value={color} onChange={e => setColor(e.target.value)} className="h-8 w-12 rounded cursor-pointer" />
        <input aria-label="Color" type="text" value={color} onChange={e => setColor(e.target.value)} className="w-24 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-2 py-1 text-xs" />
        <label className="text-xs font-medium ml-2">Opacity</label>
        <input aria-label="Opacity" type="range" min={0} max={1} step={0.05} value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="flex-1 accent-blue-600" />
        <span className="text-xs w-8">{Math.round(opacity * 100)}%</span>
      </div>
      <pre className={codeClass}>{css}</pre>
      <button onClick={() => navigator.clipboard.writeText(css)} className={btnClass}>Copy CSS</button>
    </div>
  );
}

function TransformGeneratorInner() {
  const [rotate, setRotate] = useState(0); const [scaleX, setScaleX] = useState(1); const [scaleY, setScaleY] = useState(1);
  const [skewX, setSkewX] = useState(0); const [skewY, setSkewY] = useState(0); const [tx, setTx] = useState(0); const [ty, setTy] = useState(0);
  const css = `transform: translate(${tx}px, ${ty}px) rotate(${rotate}deg) scale(${scaleX}, ${scaleY}) skew(${skewX}deg, ${skewY}deg);`;
  return (
    <div className="space-y-4">
      <div className={previewClass}>
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold" style={{ transform: `translate(${tx}px, ${ty}px) rotate(${rotate}deg) scale(${scaleX}, ${scaleY}) skew(${skewX}deg, ${skewY}deg)` }}>
          Box
        </div>
      </div>
      <Slider label="Rotate" value={rotate} onChange={setRotate} min={-180} max={180} />
      <Slider label="Scale X" value={scaleX} onChange={setScaleX} min={0.1} max={3} step={0.1} />
      <Slider label="Scale Y" value={scaleY} onChange={setScaleY} min={0.1} max={3} step={0.1} />
      <Slider label="Skew X" value={skewX} onChange={setSkewX} min={-45} max={45} />
      <Slider label="Skew Y" value={skewY} onChange={setSkewY} min={-45} max={45} />
      <Slider label="Translate X" value={tx} onChange={setTx} min={-50} max={50} />
      <Slider label="Translate Y" value={ty} onChange={setTy} min={-50} max={50} />
      <pre className={codeClass}>{css}</pre>
      <button onClick={() => navigator.clipboard.writeText(css)} className={btnClass}>Copy CSS</button>
    </div>
  );
}

function AnimationGeneratorInner() {
  const [duration, setDuration] = useState(1); const [delay, setDelay] = useState(0); const [iterations, setIterations] = useState('infinite');
  const [direction, setDirection] = useState('normal'); const [timing, setTiming] = useState('ease');
  const [animType, setAnimType] = useState('fade-in');
  const keyframes = animType === 'fade-in' ? `@keyframes myAnim {\n  0% { opacity: 0; }\n  100% { opacity: 1; }\n}` : animType === 'slide-in' ? `@keyframes myAnim {\n  0% { transform: translateX(-20px); opacity: 0; }\n  100% { transform: translateX(0); opacity: 1; }\n}` : `@keyframes myAnim {\n  0% { transform: scale(1); }\n  50% { transform: scale(1.1); }\n  100% { transform: scale(1); }\n}`;
  const css = `${keyframes}\n\n.element {\n  animation: myAnim ${duration}s ${timing} ${delay}s ${iterations} ${direction};\n}`;
  const animStyle = { animation: `myAnim ${duration}s ${timing} ${delay}s ${iterations} ${direction}` };
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = keyframes;
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, [keyframes]);
  return (
    <div className="space-y-4">
      <div className={previewClass}>
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={animStyle}>Anim</div>
      </div>
      <div>
        <label className={labelClass}>Animation</label>
        <select aria-label="Animation" value={animType} onChange={e => setAnimType(e.target.value)} className={inputClass}>
          <option value="fade-in">Fade In</option>
          <option value="slide-in">Slide In</option>
          <option value="pulse">Pulse</option>
        </select>
      </div>
      <Slider label="Duration (s)" value={duration} onChange={setDuration} min={0.1} max={5} step={0.1} />
      <Slider label="Delay (s)" value={delay} onChange={setDelay} min={0} max={5} step={0.1} />
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelClass}>Iterations</label><select aria-label="Iterations" value={iterations} onChange={e => setIterations(e.target.value)} className={inputClass}><option value="infinite">Infinite</option><option value="1">1</option><option value="2">2</option><option value="3">3</option></select></div>
        <div><label className={labelClass}>Direction</label><select aria-label="Direction" value={direction} onChange={e => setDirection(e.target.value)} className={inputClass}><option value="normal">Normal</option><option value="reverse">Reverse</option><option value="alternate">Alternate</option></select></div>
      </div>
      <div><label className={labelClass}>Timing</label><select aria-label="Timing" value={timing} onChange={e => setTiming(e.target.value)} className={inputClass}><option value="ease">Ease</option><option value="linear">Linear</option><option value="ease-in">Ease In</option><option value="ease-out">Ease Out</option><option value="ease-in-out">Ease In Out</option></select></div>
      <pre className={codeClass}>{css}</pre>
      <button onClick={() => navigator.clipboard.writeText(css)} className={btnClass}>Copy CSS</button>
    </div>
  );
}

function FilterGeneratorInner() {
  const [blur, setBlur] = useState(0); const [brightness, setBrightness] = useState(100); const [contrast, setContrast] = useState(100);
  const [saturate, setSaturate] = useState(100); const [hueRotate, setHueRotate] = useState(0); const [sepia, setSepia] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const css = `filter: blur(${blur}px) brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) hue-rotate(${hueRotate}deg) sepia(${sepia}%) grayscale(${grayscale}%);`;
  return (
    <div className="space-y-4">
      <div className={previewClass}>
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%233b82f6'/%3E%3Ccircle cx='35' cy='40' r='5' fill='white'/%3E%3Ccircle cx='65' cy='40' r='5' fill='white'/%3E%3Cpath d='M30 60 Q50 75 70 60' stroke='white' stroke-width='3' fill='none' stroke-linecap='round'/%3E%3C/svg%3E" alt="preview" className="w-24 h-24 object-contain" style={{ filter: `blur(${blur}px) brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) hue-rotate(${hueRotate}deg) sepia(${sepia}%) grayscale(${grayscale}%)` }} />
      </div>
      <Slider label="Blur" value={blur} onChange={setBlur} min={0} max={10} step={0.5} />
      <Slider label="Brightness" value={brightness} onChange={setBrightness} min={0} max={200} />
      <Slider label="Contrast" value={contrast} onChange={setContrast} min={0} max={200} />
      <Slider label="Saturate" value={saturate} onChange={setSaturate} min={0} max={200} />
      <Slider label="Hue Rotate" value={hueRotate} onChange={setHueRotate} min={0} max={360} />
      <Slider label="Sepia" value={sepia} onChange={setSepia} min={0} max={100} />
      <Slider label="Grayscale" value={grayscale} onChange={setGrayscale} min={0} max={100} />
      <pre className={codeClass}>{css}</pre>
      <button onClick={() => navigator.clipboard.writeText(css)} className={btnClass}>Copy CSS</button>
    </div>
  );
}

function GlassmorphismGeneratorInner() {
  const [blur, setBlur] = useState(8);
  const [opacity, setOpacity] = useState(15);
  const css = `background: rgba(255,255,255,${(opacity / 100).toFixed(2)});\nbackdrop-filter: blur(${blur}px);\n-webkit-backdrop-filter: blur(${blur}px);\nborder: 1px solid rgba(255,255,255,0.18);\nborder-radius: 12px;`;
  return (
    <div className="space-y-4">
      <div className={previewClass} style={{ background: `rgba(255,255,255,${(opacity / 100).toFixed(2)})`, backdropFilter: `blur(${blur}px)`, border: '1px solid rgba(255,255,255,0.18)', borderRadius: 12 }}>
        <div className="w-24 h-24 bg-gradient-to-br from-blue-400/30 to-purple-500/30 rounded-lg flex items-center justify-center text-white font-bold backdrop-blur-sm border border-white/20">Glass</div>
      </div>
      <Slider label="Blur" value={blur} onChange={setBlur} min={1} max={20} />
      <Slider label="Opacity %" value={opacity} onChange={setOpacity} min={1} max={50} />
      <pre className={codeClass}>{css}</pre>
      <button onClick={() => navigator.clipboard.writeText(css)} className={btnClass}>Copy CSS</button>
    </div>
  );
}

function NeumorphismGeneratorInner() {
  const [size, setSize] = useState(120);
  const [blur, setBlur] = useState(20);
  const [color, setColor] = useState('#e0e0e0');
  const shadow = `${(blur * 0.6).toFixed(0)}px ${(blur * 0.6).toFixed(0)}px ${blur}px ${color === '#ffffff' ? '#d9d9d9' : 'rgba(0,0,0,0.1)'}`;
  const shadow2 = `${(blur * 0.6).toFixed(0)}px ${(blur * 0.6).toFixed(0)}px ${blur}px #ffffff`;
  const css = `background: ${color};\nborder-radius: ${(size * 0.1).toFixed(0)}px;\nbox-shadow: ${shadow}, -${shadow2};`;
  return (
    <div className="space-y-4">
      <div className={previewClass}>
        <div className="rounded-xl flex items-center justify-center text-gray-500 font-bold text-sm" style={{ width: size, height: size, background: color, borderRadius: size * 0.1, boxShadow: `${shadow}, -${shadow2}` }}>
          Neumorphic
        </div>
      </div>
      <Slider label="Size" value={size} onChange={setSize} min={60} max={200} />
      <Slider label="Blur" value={blur} onChange={setBlur} min={5} max={40} />
      <div className="flex items-center gap-3">
        <label className="text-xs font-medium w-24 shrink-0">Color</label>
        <input aria-label="Color" type="color" value={color} onChange={e => setColor(e.target.value)} className="h-8 w-12 rounded cursor-pointer" />
        <input aria-label="Color" type="text" value={color} onChange={e => setColor(e.target.value)} className="w-24 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-2 py-1 text-xs" />
      </div>
      <pre className={codeClass}>{css}</pre>
      <button onClick={() => navigator.clipboard.writeText(css)} className={btnClass}>Copy CSS</button>
    </div>
  );
}

function BorderCssGeneratorInner() {
  const [radius, setRadius] = useState(12);
  const [width, setWidth] = useState(1);
  const [color, setColor] = useState('#e4e4e7');
  const [style, setStyle] = useState('solid');
  const css = `border: ${width}px ${style} ${color};\nborder-radius: ${radius}px;`;
  return (
    <div className="space-y-4">
      <div className={previewClass}>
        <div className="w-32 h-24 rounded-xl flex items-center justify-center text-xs text-[var(--text-muted)]" style={{ borderRadius: radius, border: `${width}px ${style} ${color}` }}>
          Preview
        </div>
      </div>
      <Slider label="Radius" value={radius} onChange={setRadius} min={0} max={50} />
      <Slider label="Width" value={width} onChange={setWidth} min={0} max={10} />
      <div className="flex items-center gap-3">
        <label className="text-xs font-medium w-24 shrink-0">Color</label>
        <input aria-label="Color" type="color" value={color} onChange={e => setColor(e.target.value)} className="h-8 w-12 rounded cursor-pointer" />
        <input aria-label="Color" type="text" value={color} onChange={e => setColor(e.target.value)} className="w-24 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-2 py-1 text-xs" />
      </div>
      <div>
        <label className={labelClass}>Style</label>
        <select aria-label="Style" value={style} onChange={e => setStyle(e.target.value)} className={inputClass}>
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
          <option value="double">Double</option>
          <option value="groove">Groove</option>
          <option value="ridge">Ridge</option>
        </select>
      </div>
      <pre className={codeClass}>{css}</pre>
      <button onClick={() => navigator.clipboard.writeText(css)} className={btnClass}>Copy CSS</button>
    </div>
  );
}

const INNER_COMPONENTS: Record<Mode, React.FC> = {
  'box-shadow':     BoxShadowGeneratorInner,
  'gradient':       GradientGeneratorInner,
  'border-radius':  BorderRadiusGeneratorInner,
  'text-shadow':    TextShadowGeneratorInner,
  'transform':      TransformGeneratorInner,
  'filter':         FilterGeneratorInner,
  'flexbox':        FlexboxGeneratorInner,
  'grid':           GridGeneratorInner,
  'animation':      AnimationGeneratorInner,
  'glassmorphism':  GlassmorphismGeneratorInner,
  'neumorphism':    NeumorphismGeneratorInner,
  'border-css':     BorderCssGeneratorInner,
};

/* ─── Hub Component ─── */

export default function CssGeneratorHub({ defaultMode }: { defaultMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(defaultMode || 'box-shadow');
  const [category, setCategory] = useState(getCategoryForMode(mode));
  const ActiveComponent = INNER_COMPONENTS[mode];
  React.useEffect(() => { document.title = `${MODE_LABELS[mode]} Generator – Free Online Tool`; }, [mode]);
  return (
    <div className={cardClass}>
      <h2 className={headingClass}>{MODE_LABELS[mode]} Generator</h2>
      {/* Category pills */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {CATEGORIES.map(cat => (
          <button key={cat.key} onClick={() => { setCategory(cat.key); if (!cat.modes.includes(mode)) setMode(cat.modes[0]); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              category === cat.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-zinc-900 dark:hover:text-white border border-[var(--border-subtle)]'
            }`}>
            {cat.label}
          </button>
        ))}
      </div>
      {/* Generator pills within category */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {CATEGORIES.find(c => c.key === category)?.modes.map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === m
                ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/30'
                : 'text-[var(--text-secondary)] hover:text-zinc-900 dark:hover:text-white border border-transparent'
            }`}>
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>
      <ActiveComponent />
    </div>
  );
}

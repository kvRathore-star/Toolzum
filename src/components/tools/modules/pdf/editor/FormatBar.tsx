import { annoFlag, HIGHLIGHT_COLORS, INK_COLORS, type FlowAnno, type TextAnno } from './pdfEditorLogic';
import type { PdfFont } from '@/lib/pdfFonts';
import { usePdfEditor } from './pdfEditorContext';

/**
 * Contextual format bar: visible only when the Text tool is active
 * or a text/flow box is selected. Styles the selection if present,
 * else the defaults for the next box. Presentational — all patching
 * and eff* derivation live in Core (patchTextStyle commits annos).
 */
export function FormatBar() {
  const {
    selIsText, selAnno, effColor, effSize,
    textFont, textBold, textItalic, textUnderline, textStrike, textAlign,
    patchTextStyle,
  } = usePdfEditor();

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl px-4 py-2.5" role="toolbar" aria-label="Text formatting">
      <select
        value={selIsText ? ((selAnno as TextAnno | FlowAnno).font || 'sans') : textFont}
        onChange={(e) => patchTextStyle({ font: e.target.value as PdfFont })}
        aria-label="Font family"
        title="Font family"
        className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs font-bold"
      >
        <option value="sans">Sans (Arimo)</option>
        <option value="serif">Serif (Tinos)</option>
        <option value="mono">Mono (Cousine)</option>
      </select>
      <input
        type="range" min={8} max={48}
        value={effSize}
        onChange={(e) => patchTextStyle({ size: Number(e.target.value) })}
        className="w-24" aria-label="Text size" title={`Text size ${effSize}`}
      />
      <div className="flex gap-1" role="group" aria-label="Text style">
        {([
          ['bold', 'B', 'Bold', 'font-bold'],
          ['italic', 'I', 'Italic', 'italic'],
          ['underline', 'U', 'Underline', 'underline'],
          ['strike', 'S', 'Strikethrough', 'line-through'],
        ] as const).map(([key, label, title, cls]) => {
          const active = selIsText
            ? annoFlag(selAnno, key)
            : key === 'bold' ? textBold : key === 'italic' ? textItalic : key === 'underline' ? textUnderline : textStrike;
          return (
            <button
              key={key}
              onClick={() => patchTextStyle({ [key]: !active } as { bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean })}
              aria-pressed={active}
              title={title}
              className={`px-2.5 py-2 rounded-lg text-xs font-bold border ${cls} ${active ? 'bg-[var(--accent-ink)] text-white border-transparent' : 'border-[var(--border-subtle)]'}`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="flex gap-1" role="group" aria-label="Text alignment">
        {(['left', 'center', 'right'] as const).map((a) => {
          const active = selIsText ? ((selAnno as TextAnno).align || 'left') === a : textAlign === a;
          return (
            <button key={a} onClick={() => patchTextStyle({ align: a })} aria-pressed={active} title={`Align ${a}`} className={`px-2.5 py-2 rounded-lg text-xs font-bold border capitalize ${active ? 'bg-[var(--accent-ink)] text-white border-transparent' : 'border-[var(--border-subtle)]'}`}>
              {a[0]}
            </button>
          );
        })}
      </div>
      <div className="flex gap-1.5" role="group" aria-label="Text color">
        {INK_COLORS.map((c) => (
          <button key={c} onClick={() => patchTextStyle({ color: c })} aria-label={`Text color ${c}`} title={`Text color ${c}`} className={`w-6 h-6 rounded-full border-2 ${effColor === c ? 'border-[var(--accent)]' : 'border-transparent'}`} style={{ backgroundColor: c }} />
        ))}
      </div>
    </div>
  );
}

/**
 * Draw/highlight/shape options bar. Width/color/opacity state lives in
 * Core (it feeds drawOverlay and pushAnno); this leaf only wires inputs.
 */
export function DrawBar() {
  const {
    tool,
    brushWidth, setBrushWidth,
    inkColor, setInkColor,
    markColor, setMarkColor,
    markOpacity, setMarkOpacity,
    shapeVariant, setShapeVariant,
    shapeWidth, setShapeWidth,
  } = usePdfEditor();

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl px-4 py-2.5" role="toolbar" aria-label={`${tool} options`}>
      {tool === 'draw' && (
        <>
          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]" htmlFor="pdfed-brush">Brush</label>
          <input id="pdfed-brush" type="range" min={0.5} max={8} step={0.5} value={brushWidth} onChange={(e) => setBrushWidth(Number(e.target.value))} className="w-24" aria-label="Brush width" title={`Brush width ${brushWidth}pt`} />
          <div className="flex gap-1.5" role="group" aria-label="Ink color">
            {INK_COLORS.map((c) => (
              <button key={c} onClick={() => setInkColor(c)} aria-label={`Ink color ${c}`} title={`Ink color ${c}`} className={`w-6 h-6 rounded-full border-2 ${inkColor === c ? 'border-[var(--accent)]' : 'border-transparent'}`} style={{ backgroundColor: c }} />
            ))}
          </div>
        </>
      )}
      {tool === 'highlight' && (
        <>
          <div className="flex gap-1.5" role="group" aria-label="Marker color">
            {HIGHLIGHT_COLORS.map((c) => (
              <button key={c} onClick={() => setMarkColor(c)} aria-label={`Marker color ${c}`} title={`Marker color ${c}`} className={`w-6 h-6 rounded-full border-2 ${markColor === c ? 'border-[var(--accent)]' : 'border-transparent'}`} style={{ backgroundColor: c }} />
            ))}
          </div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]" htmlFor="pdfed-opacity">Opacity</label>
          <input id="pdfed-opacity" type="range" min={0.1} max={0.9} step={0.1} value={markOpacity} onChange={(e) => setMarkOpacity(Number(e.target.value))} className="w-24" aria-label="Highlight opacity" title={`Opacity ${Math.round(markOpacity * 100)}%`} />
        </>
      )}
      {tool === 'shape' && (
        <>
          <div className="flex gap-1" role="group" aria-label="Shape">
            {(['rect', 'ellipse', 'line', 'arrow'] as const).map((s) => (
              <button key={s} onClick={() => setShapeVariant(s)} aria-pressed={shapeVariant === s} title={s} className={`px-2 py-1.5 rounded-lg text-xs font-bold border capitalize ${shapeVariant === s ? 'bg-[var(--accent-ink)] text-white border-transparent' : 'border-[var(--border-subtle)]'}`}>{s}</button>
            ))}
          </div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]" htmlFor="pdfed-stroke">Stroke</label>
          <input id="pdfed-stroke" type="range" min={0.5} max={6} step={0.5} value={shapeWidth} onChange={(e) => setShapeWidth(Number(e.target.value))} className="w-24" aria-label="Shape stroke width" title={`Stroke ${shapeWidth}pt`} />
          <div className="flex gap-1.5" role="group" aria-label="Shape color">
            {INK_COLORS.map((c) => (
              <button key={c} onClick={() => setInkColor(c)} aria-label={`Shape color ${c}`} title={`Shape color ${c}`} className={`w-6 h-6 rounded-full border-2 ${inkColor === c ? 'border-[var(--accent)]' : 'border-transparent'}`} style={{ backgroundColor: c }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

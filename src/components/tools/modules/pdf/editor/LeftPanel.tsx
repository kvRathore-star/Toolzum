import { inputCls, labelCls } from '../../Calculators.shared';
import { EMOJI_ALL, EMOJI_SET, HIGHLIGHT_COLORS, INK_COLORS } from './pdfEditorLogic';
import { usePdfEditor } from './pdfEditorContext';
import { useState } from 'react';

/**
 * Left column: tool picker, emoji stamps, tool-specific settings, and the
 * selected-annotation property fields. Document truth (annos, tool, textDraft)
 * lives in Core — this leaf only mirrors and calls back. emojiQuery is
 * ephemeral view state (Core never reads it) so it lives here.
 */
export function LeftPanel() {
  const {
    tool, tools, toolGroups, pickTool,
    stampEmoji, recentEmoji,
    markColor, setMarkColor, inkColor, setInkColor,
    shapeVariant, setShapeVariant,
    redactCount, redactMode, setRedactMode,
    selAnno, selected, textDraft, setTextDraft, commitAnnos,
  } = usePdfEditor();
  const [emojiQuery, setEmojiQuery] = useState('');

  return (
        <div role="region" aria-label="Editing tools" className="lg:col-span-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-3 space-y-3 max-h-[720px] overflow-y-auto">
          {toolGroups.map((g) => (
            <div key={g} className="space-y-1.5">
              <p className="px-1 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{g}</p>
              {tools.filter((t) => t.group === g).map((t) => (
                <button
                  key={t.id}
                  onClick={() => pickTool(t.id)}
                  aria-pressed={tool === t.id}
                  aria-label={`${t.label} tool`}
                  title={t.label}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${tool === t.id ? 'bg-[var(--accent-ink)] text-white shadow' : 'bg-[var(--bg-overlay)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'}`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          ))}
          <details className="pt-1">
            <summary className="px-1 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-primary)]">Emoji stamps</summary>
            <div className="grid grid-cols-6 gap-1 mt-1.5">
              {EMOJI_SET.map((e) => (
                <button key={e} onClick={() => stampEmoji(e)} aria-label={`Stamp ${e}`} title="Stamp this emoji" className="text-lg leading-none p-1 rounded-lg hover:bg-[var(--bg-overlay)] transition-colors">
                  {e}
                </button>
              ))}
            </div>
            <input
              value={emojiQuery}
              onChange={(e) => setEmojiQuery(e.target.value)}
              placeholder="Search all emoji…"
              aria-label="Search emoji"
              className="mt-1.5 w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            />
            {(emojiQuery.trim() || recentEmoji.length > 0) && (
              <div className="mt-1.5 space-y-1.5 max-h-44 overflow-y-auto">
                {recentEmoji.length > 0 && !emojiQuery.trim() && (
                  <div>
                    <p className="px-1 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Recent</p>
                    <div className="grid grid-cols-8 gap-1 mt-1">
                      {recentEmoji.map((e) => (
                        <button key={e} onClick={() => stampEmoji(e)} aria-label={`Stamp ${e}`} title="Stamp this emoji" className="text-base leading-none p-1 rounded-lg hover:bg-[var(--bg-overlay)] transition-colors">
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {emojiQuery.trim() && (
                  <div className="grid grid-cols-8 gap-1">
                    {EMOJI_ALL.filter((e) => e.name.includes(emojiQuery.trim().toLowerCase()) || e.cat.toLowerCase().includes(emojiQuery.trim().toLowerCase()))
                      .slice(0, 32)
                      .map((e) => (
                        <button key={`${e.emoji}-${e.name}`} onClick={() => stampEmoji(e.emoji)} aria-label={`Stamp ${e.name}`} title={e.name} className="text-base leading-none p-1 rounded-lg hover:bg-[var(--bg-overlay)] transition-colors">
                          {e.emoji}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}
          </details>
          <div className="pt-2 space-y-2">
            {(tool === 'text') && (
              <p className="text-xs text-[var(--text-muted)]">Formatting lives in the bar above — it styles the selected box, or the next one you place.</p>
            )}
            {(tool === 'highlight') && (
              <>
                <span className={labelCls}>Marker color</span>
                <div className="flex gap-1.5 flex-wrap">
                  {HIGHLIGHT_COLORS.map((c) => (
                    <button key={c} onClick={() => setMarkColor(c)} aria-label={`Marker color ${c}`} className={`w-6 h-6 rounded-full border-2 ${markColor === c ? 'border-[var(--accent)]' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </>
            )}
            {(tool === 'draw') && (
              <>
                <span className={labelCls}>Ink color</span>
                <div className="flex gap-1.5 flex-wrap">
                  {INK_COLORS.map((c) => (
                    <button key={c} onClick={() => setInkColor(c)} aria-label={`Ink color ${c}`} className={`w-6 h-6 rounded-full border-2 ${inkColor === c ? 'border-[var(--accent)]' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </>
            )}
            {(tool === 'shape') && (
              <>
                <span className={labelCls}>Shape</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['rect', 'ellipse', 'line', 'arrow'] as const).map((s) => (
                    <button key={s} onClick={() => setShapeVariant(s)} aria-pressed={shapeVariant === s} className={`px-2 py-1.5 rounded-lg text-xs font-bold border capitalize ${shapeVariant === s ? 'bg-[var(--accent-ink)] text-white border-transparent' : 'border-[var(--border-subtle)]'}`}>{s}</button>
                  ))}
                </div>
                <span className={labelCls}>Color</span>
                <div className="flex gap-1.5 flex-wrap">
                  {INK_COLORS.map((c) => (
                    <button key={c} onClick={() => setInkColor(c)} aria-label={`Shape color ${c}`} className={`w-6 h-6 rounded-full border-2 ${inkColor === c ? 'border-[var(--accent)]' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
                <p className="text-xs text-[var(--text-muted)]">Drag on the page to draw. Line and arrow: drag from start to end. Click a shape with the Select tool to re-select it.</p>
              </>
            )}
            {(tool === 'note') && (
              <p className="text-xs text-[var(--text-muted)]">Click the page to drop a sticky note, then edit its text below.</p>
            )}
            {(tool === 'whiteout') && (
              <p className="text-xs text-[var(--text-muted)]">Covers an area with white. Hides visually — does not delete the underlying text.</p>
            )}
            {(tool === 'redact' || redactCount > 0) && (
              <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Redaction mode</span>
                <div className="space-y-1.5" role="radiogroup" aria-label="Redaction mode">
                  <button onClick={() => setRedactMode('selective')} aria-pressed={redactMode === 'selective'} role="radio" aria-checked={redactMode === 'selective'} className={`w-full text-left px-3 py-2 rounded-xl border text-xs ${redactMode === 'selective' ? 'border-[var(--accent)] bg-[var(--accent-ink)]/5' : 'border-[var(--border-subtle)]'}`}>
                    <span className="block font-bold text-[var(--text-primary)]">Selective</span>
                    <span className="block text-[var(--text-muted)] mt-0.5">Strips text bytes, keeps pages live and selectable.</span>
                  </button>
                  <p className="text-xs text-[var(--text-muted)] px-1">Maximum (raster) mode is temporarily disabled while it is reworked — Selective stays active and verified on export.</p>
                </div>
              </div>
            )}
          </div>
          {selAnno?.kind === 'text' && selected && (
            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
              <span className={labelCls}>Edit selected text</span>
              <input
                value={textDraft ?? selAnno.text}
                onChange={(e) => setTextDraft(e.target.value)}
                onBlur={() => {
                  if (textDraft !== null) {
                    const v = textDraft;
                    commitAnnos((prev) => ({
                      ...prev,
                      [selected.page]: (prev[selected.page] || []).map((a, i) => (i === selected.index && a.kind === 'text' ? { ...a, text: v } : a)),
                    }));
                    setTextDraft(null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                  if (e.key === 'Escape') setTextDraft(null);
                }}
                className={inputCls}
                aria-label="Selected annotation text. Enter commits, Escape reverts."
              />
            </div>
          )}
          {selAnno?.kind === 'flow' && selected && (
            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
              <span className={labelCls}>Flowing text (wraps automatically)</span>
              <textarea
                value={textDraft ?? selAnno.text}
                onChange={(e) => setTextDraft(e.target.value)}
                onBlur={() => {
                  if (textDraft !== null) {
                    const v = textDraft;
                    commitAnnos((prev) => ({
                      ...prev,
                      [selected.page]: (prev[selected.page] || []).map((a, i) => (i === selected.index && a.kind === 'flow' ? { ...a, text: v } : a)),
                    }));
                    setTextDraft(null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setTextDraft(null);
                }}
                className={inputCls}
                rows={6}
                autoFocus
                aria-label="Flowing text. Edits apply when you leave the field, Escape reverts."
              />
            </div>
          )}
          {selAnno?.kind === 'note' && selected && (
            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
              <span className={labelCls}>Edit note</span>
              <textarea
                value={selAnno.text}
                onChange={(e) => {
                  const v = e.target.value.slice(0, 240);
                  commitAnnos((prev) => ({
                    ...prev,
                    [selected.page]: (prev[selected.page] || []).map((a, i) => (i === selected.index && a.kind === 'note' ? { ...a, text: v } : a)),
                  }));
                }}
                className={inputCls}
                rows={3}
                maxLength={240}
                aria-label="Selected note text (max 240 characters)"
              />
            </div>
          )}
        </div>
  );
}

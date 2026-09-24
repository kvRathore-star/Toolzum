import { inputCls } from '../../Calculators.shared';
import { usePdfEditor } from './pdfEditorContext';

/**
 * Find & replace floating panel. Presentational: all state (findText,
 * replaceText, scope, findNav geometry) and all search/replace handlers
 * live in Core — findNav feeds drawOverlay, which Core owns. This leaf
 * only mirrors values and invokes callbacks via context.
 */
export function FindReplace() {
  const {
    findText, setFindText,
    replaceText, setReplaceText,
    replaceScope, setReplaceScope,
    replacing,
    findNav, setFindNav,
    setShowFind,
    findStep, findHighlight, findReplace,
  } = usePdfEditor();

  return (
    <div className="absolute top-4 right-4 z-20 w-72 p-4 space-y-2 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-xl" role="dialog" aria-label="Find and replace">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-[var(--text-primary)]">Find & replace</p>
        <button onClick={() => setShowFind(false)} aria-label="Close find panel" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm px-1">✕</button>
      </div>
      <input
        value={findText}
        onChange={(e) => { setFindText(e.target.value); setFindNav(null); }}
        onKeyDown={(e) => { if (e.key === 'Enter') findStep(1); }}
        placeholder="Find text"
        className={inputCls}
        aria-label="Text to find"
        autoFocus
      />
      <input
        value={replaceText}
        onChange={(e) => setReplaceText(e.target.value)}
        placeholder="Replace with"
        className={inputCls}
        aria-label="Replacement text"
      />
      <div className="flex gap-1.5" role="group" aria-label="Replace scope">
        {(['page', 'all'] as const).map((s) => (
          <button key={s} onClick={() => setReplaceScope(s)} aria-pressed={replaceScope === s} className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-bold border ${replaceScope === s ? 'bg-[var(--accent-ink)] text-white border-transparent' : 'border-[var(--border-subtle)]'}`}>
            {s === 'page' ? 'This page' : 'All pages'}
          </button>
        ))}
      </div>
      <button onClick={findReplace} disabled={replacing} className="w-full px-3 py-2 rounded-xl bg-[var(--accent-ink)] text-white text-xs font-bold disabled:opacity-50">
        {replacing ? 'Replacing…' : 'Replace all'}
      </button>
      <div className="flex gap-1.5" role="group" aria-label="Find navigation">
        <button onClick={findHighlight} aria-label="Highlight matches" title="Highlight all matches on this page" className="flex-1 px-2 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)]">
          Highlight
        </button>
        <button onClick={() => findStep(-1)} aria-label="Previous match" title="Previous match" className="flex-1 px-2 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)]">
          ↑ Prev
        </button>
        <button onClick={() => findStep(1)} aria-label="Next match" title="Next match" className="flex-1 px-2 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)]">
          Next ↓
        </button>
      </div>
      {findNav && (
        <p className="text-[11px] font-mono text-[var(--text-muted)] text-center" aria-live="polite">
          Match {findNav.idx + 1} of {findNav.rects.length}{replaceScope === 'all' ? ` · page ${findNav.page}` : ''}
        </p>
      )}
      <p className="text-[11px] text-[var(--text-muted)]">Case-insensitive match; retypeset in Helvetica at matched size.</p>
    </div>
  );
}

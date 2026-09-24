import { useRef, useState } from 'react';
import { Layers, Save, Download, Undo2, Files } from 'lucide-react';
import { usePdfEditor } from './pdfEditorContext';
import { PagesList } from './PagesList';

/**
 * Mobile quick-actions bar + the two bottom sheets. Leaf: renders Core
 * state via context, holds only ephemeral sheet-open state and the
 * long-press timer (view-only — not document truth).
 */
export function MobileActionBar() {
  const { saveFlushing, exportPdf, exporting, undo, redo, historyCount, redoCount, tools, tool, setTool, toolGroups } = usePdfEditor();
  // Sheets: below lg the permanent sidebar is hidden, so Pages lives
  // behind this sheet; Tools is the mobile fallback for the ribbon.
  const [showToolsSheet, setShowToolsSheet] = useState(false);
  const [showPagesSheet, setShowPagesSheet] = useState(false);
  // Mobile-bar Undo: tap = undo, long-press (550ms) = redo. Redo is too
  // rare to burn one of five thumb slots, so it rides on Undo instead.
  const undoPressRef = useRef<{ timer: ReturnType<typeof setTimeout> | null; fired: boolean }>({ timer: null, fired: false });
  const undoPressDown = () => {
    const st = undoPressRef.current;
    st.fired = false;
    st.timer = setTimeout(() => {
      st.fired = true;
      void redo();
    }, 550);
  };
  const undoPressUp = () => {
    const st = undoPressRef.current;
    if (st.timer) {
      clearTimeout(st.timer);
      st.timer = null;
    }
    if (!st.fired) void undo();
  };
  const undoPressCancel = () => {
    const st = undoPressRef.current;
    if (st.timer) {
      clearTimeout(st.timer);
      st.timer = null;
    }
  };

  return (
    <>
      {/* Mobile quick-actions bar: Tools · Undo · Save · Download · Pages.
          Below lg the Pages sidebar is hidden (behind the sheet), so this
          bar is what keeps Download and the document one thumb-reach away —
          the two most-cited mobile complaints. Desktop keeps the ribbon. */}
      <div
        className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)] pb-[env(safe-area-inset-bottom)]"
        role="toolbar"
        aria-label="Quick actions"
      >
        <div className="grid grid-cols-5">
          <button
            onClick={() => setShowToolsSheet(true)}
            aria-label="Tools"
            aria-haspopup="dialog"
            className="flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] select-none touch-manipulation"
          >
            <Layers className="w-5 h-5" />
            Tools
          </button>
          <button
            onPointerDown={undoPressDown}
            onPointerUp={undoPressUp}
            onPointerLeave={undoPressCancel}
            onPointerCancel={undoPressCancel}
            onContextMenu={(e) => e.preventDefault()}
            disabled={historyCount === 0 && redoCount === 0}
            aria-label="Undo — long-press for redo"
            title="Undo (long-press: redo)"
            className="flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40 select-none touch-manipulation"
          >
            <Undo2 className="w-5 h-5" />
            Undo
          </button>
          <button
            onClick={() => saveFlushing()}
            aria-label="Save working session"
            className="flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] select-none touch-manipulation"
          >
            <Save className="w-5 h-5" />
            Save
          </button>
          <button
            onClick={exportPdf}
            disabled={exporting}
            aria-label="Download flattened PDF"
            className="flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40 select-none touch-manipulation"
          >
            <Download className="w-5 h-5" />
            {exporting ? '…' : 'Download'}
          </button>
          <button
            onClick={() => setShowPagesSheet(true)}
            aria-label="Pages"
            aria-haspopup="dialog"
            className="flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] select-none touch-manipulation"
          >
            <Files className="w-5 h-5" />
            Pages
          </button>
        </div>
      </div>

      {/* Mobile sheets — same close contract as the shortcuts dialog:
          backdrop click + ✕ only (no window Escape binding; audit owns
          Escape outside inputs). */}
      {showToolsSheet && (
        <div className="fixed inset-0 z-[96] flex items-end lg:hidden" role="dialog" aria-modal="true" aria-label="Choose a tool">
          <button aria-label="Close tools" onClick={() => setShowToolsSheet(false)} tabIndex={-1} className="absolute inset-0 bg-black/50 cursor-default" />
          <div className="relative w-full max-h-[75vh] overflow-y-auto rounded-t-2xl bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-[var(--text-primary)]">Tools</p>
              <button onClick={() => setShowToolsSheet(false)} aria-label="Close tools" className="px-2 py-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]">✕</button>
            </div>
            {toolGroups.map((g) => (
              <div key={g} className="mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">{g}</p>
                <div className="grid grid-cols-3 gap-2">
                  {tools.filter((t) => t.group === g).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTool(t.id);
                        setShowToolsSheet(false);
                      }}
                      aria-pressed={tool === t.id}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-bold ${tool === t.id ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-[var(--border-subtle)] text-[var(--text-secondary)]'}`}
                    >
                      {t.icon}
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {showPagesSheet && (
        <div className="fixed inset-0 z-[96] flex items-end lg:hidden" role="dialog" aria-modal="true" aria-label="Pages">
          <button aria-label="Close pages" onClick={() => setShowPagesSheet(false)} tabIndex={-1} className="absolute inset-0 bg-black/50 cursor-default" />
          <div className="relative w-full max-h-[70vh] overflow-y-auto rounded-t-2xl bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-[var(--text-primary)]">Pages</p>
              <button onClick={() => setShowPagesSheet(false)} aria-label="Close pages" className="px-2 py-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]">✕</button>
            </div>
            <PagesList onPick={() => setShowPagesSheet(false)} />
          </div>
        </div>
      )}
    </>
  );
}

import { toast } from 'react-hot-toast';
import {
  ChevronLeft, ChevronRight, Search, Save, History, Minimize2, Maximize2,
  Download, Flag, Sparkles, MessageCircleQuestion, ScanText, RotateCw,
  CopyPlus, FileMinus2, MoveLeft, MoveRight, Undo2, Redo2, Keyboard,
  Trash2, BringToFront, SendToBack, Copy, ClipboardPaste, Layers,
} from 'lucide-react';
import { usePdfEditor } from './pdfEditorContext';

/**
 * Top ribbon: file nav/zoom + saved status, AI/OCR row, page ops, edit ops.
 * Presentational — every handler and every piece of document truth lives in
 * Core and arrives via context. OCR language select stays immediately above
 * the run button (claims-test asserts source order).
 */
export function Toolbar() {
  const api = usePdfEditor();
  const {
    file, page, pageCount, goPage, scale, setScale, fitZoom,
    fileBytes, savedAt, saving, dirty,
    setShowFind, saveFlushing,
    showVersions, setShowVersions, versions,
    toggleFocus, focus, exportPdf, exporting,
    runAiAction, aiWorking, isSignedIn, isPro, findSensitive,
    selection, setSelection, drawOverlay, askAboutDoc,
    ocrLang, setOcrLang, setOcrWords, runOcr, ocrRunning, ocrProgress,
    restructure, undo, redo, historyCount, redoCount, setShowShortcuts,
    deleteSelected, selected, moveLayer, copySelected, pasteClipboard,
    stampAllPages,
  } = api;

  return (
    <>
      {/* Ribbon: file row + grouped action rows. Wraps always — nothing clips. */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl px-4 py-3 space-y-2.5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold text-[var(--text-primary)] truncate max-w-[220px]" title={file?.name}>{file?.name}</span>
          <span className="text-xs text-[var(--text-muted)]">Page {page}/{pageCount}</span>
          <div className="flex items-center gap-1 ml-2">
            <button onClick={() => goPage(page - 1)} disabled={page <= 1} aria-label="Previous page" title="Previous page" className="p-2 rounded-lg border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-overlay)]">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => goPage(page + 1)} disabled={page >= pageCount} aria-label="Next page" title="Next page" className="p-2 rounded-lg border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-overlay)]">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-1" role="group" aria-label="Zoom">
            {[0.75, 1, 1.5, 2].map((z) => (
              <button
                key={z}
                onClick={() => setScale(z)}
                aria-pressed={scale === z}
                aria-label={`Zoom ${Math.round(z * 100)} percent`}
                title={`Zoom ${Math.round(z * 100)}%`}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border ${scale === z ? 'bg-[var(--accent-ink)] text-white border-transparent' : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)]'}`}
              >
                {Math.round(z * 100)}%
              </button>
            ))}
            <button onClick={() => fitZoom('width')} aria-label="Fit page width" title="Fit to width" className="px-2 py-1.5 rounded-lg text-[11px] font-bold border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)]">
              Fit
            </button>
            <button onClick={() => fitZoom('page')} aria-label="Fit whole page" title="Fit whole page" className="px-2 py-1.5 rounded-lg text-[11px] font-bold border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)]">
              Page
            </button>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {fileBytes && (
              <span className="text-[11px] font-mono text-[var(--text-muted)]" aria-live="polite" title={savedAt ? `Last saved ${new Date(savedAt).toLocaleTimeString()}` : 'Not saved yet'}>
                {saving ? 'Saving…' : dirty ? 'Unsaved changes' : savedAt ? `Saved ${new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
              </span>
            )}
            <button onClick={() => setShowFind(true)} aria-label="Find in document" title="Find & replace (Ctrl+F) — works with any tool" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)]">
              <Search className="w-4 h-4" /> Find
            </button>
            <button onClick={() => saveFlushing()} aria-label="Save working session" title="Save session (Ctrl+S) — persists edits without exporting" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)]">
              <Save className="w-4 h-4" /> Save
            </button>
            <button onClick={() => setShowVersions(!showVersions)} aria-pressed={showVersions} aria-label="Version history" title="Version history — restore earlier states" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)]">
              <History className="w-4 h-4" /> History{versions.length > 0 ? ` ${versions.length}` : ''}
            </button>
            <button onClick={toggleFocus} aria-pressed={focus} aria-label={focus ? 'Exit focus mode' : 'Enter focus mode (editor only)'} title={focus ? 'Exit focus mode' : 'Focus mode — editor only'} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)]">
              {focus ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />} {focus ? 'Exit focus' : 'Focus'}
            </button>
            <button onClick={exportPdf} disabled={exporting} aria-label="Download flattened PDF" title="Download — annotations are flattened permanently" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent-ink)] text-white text-xs font-bold hover:opacity-90 disabled:opacity-50">
              <Download className="w-4 h-4" /> {exporting ? 'Exporting…' : 'Download · flattened'}
            </button>
            <a
              href={`/contact?subject=general&message=${encodeURIComponent(`PDF Editor issue on ${typeof window !== 'undefined' ? window.location.pathname : '/pdf/pdf-editor'}: `)}`}
              title="Report a problem with this tool"
              aria-label="Report a problem with this tool"
              className="p-2 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)] text-[var(--text-secondary)]"
            >
              <Flag className="w-4 h-4" />
            </a>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2.5 border-t border-[var(--border-subtle)] max-sm:flex-nowrap max-sm:overflow-x-auto">
          <div className="flex items-center gap-1.5" role="group" aria-label="AI actions">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]" title="Editing is local. AI actions send only the page text to our server.">AI</span>
            <button onClick={() => runAiAction('summarize')} disabled={aiWorking} aria-label="Summarize this page with AI, 1 credit" title={isSignedIn ? 'Summarize page · 1 credit' : 'Sign in to use AI actions'} className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)] disabled:opacity-50">
              <Sparkles className="w-4 h-4" /> {aiWorking ? '…' : 'Summarize'} <span aria-hidden="true" className="px-1 py-0.5 text-[9px] font-mono rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30">1</span>
            </button>
            <button onClick={() => runAiAction('grammar')} disabled={aiWorking} aria-label="Fix grammar with AI, 1 credit" title={isSignedIn ? 'Fix grammar · 1 credit' : 'Sign in to use AI actions'} className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)] disabled:opacity-50">
              <Sparkles className="w-4 h-4" /> {aiWorking ? '…' : 'Fix grammar'} <span aria-hidden="true" className="px-1 py-0.5 text-[9px] font-mono rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30">1</span>
            </button>
            <button onClick={() => runAiAction('translate')} disabled={aiWorking} aria-label="Translate to English with AI, 1 credit" title={isSignedIn ? 'Translate to English · 1 credit' : 'Sign in to use AI actions'} className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)] disabled:opacity-50">
              <Sparkles className="w-4 h-4" /> {aiWorking ? '…' : 'Translate'} <span aria-hidden="true" className="px-1 py-0.5 text-[9px] font-mono rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30">1</span>
            </button>
            <button onClick={findSensitive} disabled={aiWorking} aria-label="Suggest sensitive-data cover boxes with AI, Pro, 1 credit" title={isPro ? 'Find sensitive data · 1 credit' : 'Pro feature — upgrade to unlock'} className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)] disabled:opacity-50">
              {!isPro && <span aria-hidden="true">👑</span>} {aiWorking ? '…' : 'Find sensitive'} <span aria-hidden="true" className="px-1 py-0.5 text-[9px] font-mono rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30">1</span>
            </button>
            {selection.length > 0 && (
              <button onClick={() => { setSelection([]); drawOverlay(); toast.success('Selection cleared — AI uses the whole page.'); }} aria-label="Clear text selection" title="Clear selection" className="px-2.5 py-2 rounded-lg border border-[var(--accent)]/40 text-xs font-bold text-[var(--accent)] hover:bg-[var(--accent)]/10">
                {selection.length} selected ✕
              </button>
            )}
            <button onClick={askAboutDoc} aria-label="Ask AI chat about this document" title="Open AI Chat with this file loaded" className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)]">
              <MessageCircleQuestion className="w-4 h-4" /> Ask doc
            </button>
            <select
              value={ocrLang}
              onChange={(e) => { setOcrLang(e.target.value); setOcrWords([]); }}
              aria-label="OCR language (choose before running OCR)"
              title="Recognition language — pick before you click OCR"
              className="px-1.5 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[11px] bg-[var(--bg-overlay)] text-[var(--text-secondary)]"
            >
              <option value="eng">OCR: English</option>
              <option value="hin">OCR: Hindi</option>
              <option value="tam">OCR: Tamil</option>
              <option value="deu">OCR: German</option>
              <option value="spa">OCR: Spanish</option>
              <option value="fra">OCR: French</option>
              <option value="pol">OCR: Polish</option>
              <option value="ara">OCR: Arabic</option>
            </select>
            <button onClick={runOcr} disabled={ocrRunning} aria-label="OCR this page" title="Recognize text on scanned pages in the selected language" className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--bg-overlay)] disabled:opacity-50">
              <ScanText className="w-4 h-4" /> {ocrRunning ? `${ocrProgress}%` : 'OCR'}
            </button>
          </div>
          <div className="flex items-center gap-1.5" role="group" aria-label="Page actions">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Page</span>
            <button onClick={() => restructure('rotate')} aria-label="Rotate current page" title="Rotate page 90°" className="p-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)]">
              <RotateCw className="w-4 h-4" />
            </button>
            <button onClick={() => restructure('duplicate')} aria-label="Duplicate current page" title="Duplicate page" className="p-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)]">
              <CopyPlus className="w-4 h-4" />
            </button>
            <button onClick={() => restructure('delete')} aria-label="Delete current page" title="Delete page" className="p-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)]">
              <FileMinus2 className="w-4 h-4" />
            </button>
            <button onClick={() => restructure('left')} disabled={page <= 1} aria-label="Move page earlier" title="Move page earlier" className="p-2 rounded-lg border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-overlay)]">
              <MoveLeft className="w-4 h-4" />
            </button>
            <button onClick={() => restructure('right')} disabled={page >= pageCount} aria-label="Move page later" title="Move page later" className="p-2 rounded-lg border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-overlay)]">
              <MoveRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-1.5" role="group" aria-label="Edit actions">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Edit</span>
            <button onClick={undo} disabled={historyCount === 0} aria-label={`Undo last change (${historyCount} in history)`} title="Undo (Ctrl+Z)" className="p-2 rounded-lg border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-overlay)]">
              <Undo2 className="w-4 h-4" />
            </button>
            <button onClick={redo} disabled={redoCount === 0} aria-label="Redo" title="Redo (Ctrl+Y)" className="p-2 rounded-lg border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-overlay)]">
              <Redo2 className="w-4 h-4" />
            </button>
            {historyCount > 0 && (
              <span className="px-2 py-1 text-[10px] font-mono text-[var(--text-muted)]" title="Edits you can undo">{historyCount}</span>
            )}
            <button onClick={() => setShowShortcuts(true)} aria-label="Keyboard shortcuts" title="Keyboard shortcuts (?)" className="p-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)]">
              <Keyboard className="w-4 h-4" />
            </button>
          <button onClick={deleteSelected} disabled={!selected} aria-label="Delete selected annotation" title="Delete selected (Del)" className="p-2 rounded-lg border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-overlay)]">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={() => moveLayer(1)} disabled={!selected} aria-label="Bring forward" title="Bring forward (on top)" className="p-2 rounded-lg border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-overlay)]">
            <BringToFront className="w-4 h-4" />
          </button>
          <button onClick={() => moveLayer(-1)} disabled={!selected} aria-label="Send backward" title="Send backward (behind)" className="p-2 rounded-lg border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-overlay)]">
            <SendToBack className="w-4 h-4" />
          </button>
            <button onClick={copySelected} disabled={!selected} aria-label="Copy selected annotation" title="Copy selected (Ctrl+C)" className="p-2 rounded-lg border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-overlay)]">
              <Copy className="w-4 h-4" />
            </button>
            <button onClick={pasteClipboard} aria-label="Paste copied annotation" title="Paste (Ctrl+V)" className="p-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)]">
              <ClipboardPaste className="w-4 h-4" />
            </button>
            <button onClick={stampAllPages} aria-label="Stamp selected image on all pages" title="Stamp on all pages (select an image/signature first)" className="p-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)]">
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </>
  );
}
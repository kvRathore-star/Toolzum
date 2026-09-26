import { useRef, useState } from 'react';
import { usePdfEditor } from './pdfEditorContext';

/**
 * Shared thumbnail list: the permanent sidebar (lg+) and the mobile Pages
 * sheet render THIS component — one source of truth for DnD reorder,
 * annos badges, and show-all, so a future fix can't land on one surface
 * and miss the other (the historical Find drift). onPick closes the sheet
 * after navigation.
 *
 * Drag hover is view-only (never document truth), so the ref/state live
 * here; the drop itself routes through Core's restructure.
 */
export function PagesList({ onPick }: { onPick?: () => void }) {
  const { thumbUrls, annos, page, pageCount, goPage, restructure, setThumbsAll } = usePdfEditor();
  const thumbDragRef = useRef<number | null>(null);
  const [thumbDragOver, setThumbDragOver] = useState<number | null>(null);
  return (
    <>
      {thumbUrls.map((u, i) => (
        <button
          key={i}
          draggable
          onDragStart={(e) => {
            thumbDragRef.current = i;
            e.dataTransfer.effectAllowed = 'move';
            // Firefox refuses to start a drag without payload data.
            e.dataTransfer.setData('text/plain', String(i));
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            setThumbDragOver((prev) => (prev === i ? prev : i));
          }}
          onDragLeave={() => setThumbDragOver((prev) => (prev === i ? null : prev))}
          onDrop={(e) => {
            e.preventDefault();
            const from = thumbDragRef.current;
            thumbDragRef.current = null;
            setThumbDragOver(null);
            if (from !== null && from !== i) void restructure('move', { from, to: i });
          }}
          onDragEnd={() => {
            thumbDragRef.current = null;
            setThumbDragOver(null);
          }}
          onClick={() => {
            goPage(i + 1);
            onPick?.();
          }}
          aria-label={`Go to page ${i + 1}${thumbDragOver === i ? ' (drop here to reorder)' : ''}`}
          aria-current={page === i + 1}
          // Keyboard page-delete: the window Del handler only acts when a
          // thumbnail holds real focus (both surfaces render this list).
          data-thumb-page={i + 1}
          className={`relative block w-full rounded-lg overflow-hidden border-2 ${page === i + 1 || thumbDragOver === i ? 'border-[var(--accent)]' : 'border-transparent'}`}
        >
          {u ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={u} alt={`Page ${i + 1}`} className="w-full" />
          ) : (
            <span className="flex items-center justify-center w-full h-16 bg-[var(--bg-overlay)] text-xs font-mono text-[var(--text-muted)]">…</span>
          )}
          {(annos[i + 1] || []).length > 0 && (
            <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[var(--accent-ink)] text-white">{(annos[i + 1] || []).length}</span>
          )}
          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[10px] font-mono rounded bg-black/50 text-white">{i + 1}</span>
        </button>
      ))}
      {thumbUrls.length < pageCount && (
        <button onClick={() => setThumbsAll(true)} className="w-full px-2 py-2 rounded-lg border border-[var(--border-subtle)] text-[11px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)]">
          Show all {pageCount} thumbnails
        </button>
      )}
    </>
  );
}

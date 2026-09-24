import { PagesList } from './PagesList';

/**
 * Right column: page thumbnails. Hidden below lg — the mobile Pages
 * sheet (MobileActionBar) takes over, and both render the SAME
 * PagesList so reorder/badge fixes can't land on one surface only.
 * The !focus gate lives in Core (focus is document-session state).
 */
export function Sidebar() {
  return (
    <div className="hidden lg:block lg:col-span-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-3 space-y-2 max-h-[560px] overflow-y-auto">
      <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Pages</p>
      <PagesList />
    </div>
  );
}

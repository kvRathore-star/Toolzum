// Core → leaf channel for the PDF editor split.
//
// Core (PdfEditorCore) owns document truth: annos, page ops, undo/redo,
// save/export, the window keyboard listener. Leaves (Toolbar, Sidebar,
// MobileActionBar, PagesList, …) render from this context and call back
// into it — they hold NO state that can drift from what Core knows.
//
// Exception, deliberate: ephemeral view state that is NOT document truth
// (sheet open/close, thumbnail drag-hover) lives with the surface that
// renders it. It cannot drift because Core never reads it.
import { createContext, useContext, type ReactNode } from 'react';
import type { Anno, Tool } from './pdfEditorLogic';

export interface ToolMeta {
  id: Tool;
  label: string;
  icon: ReactNode;
  group: string;
}

export interface PdfEditorApi {
  // Param names are type-position documentation; underscore-prefixed so
  // the repo's base no-unused-vars rule doesn't flag interface members.
  saveFlushing: (_silent?: boolean) => Promise<boolean | void>;
  exportPdf: () => Promise<void>;
  exporting: boolean;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  historyCount: number;
  redoCount: number;
  goPage: (_n: number) => void;
  restructure: (
    _op: 'rotate' | 'duplicate' | 'delete' | 'left' | 'right' | 'move',
    _move?: { from: number; to: number },
  ) => Promise<void>;
  setThumbsAll: (_v: boolean) => void;
  setTool: (_t: Tool) => void;
  tool: Tool;
  tools: ToolMeta[];
  toolGroups: string[];
  page: number;
  pageCount: number;
  annos: Record<number, Anno[]>;
  thumbUrls: (string | null)[];
}

export const PdfEditorCtx = createContext<PdfEditorApi | null>(null);

export function usePdfEditor(): PdfEditorApi {
  const v = useContext(PdfEditorCtx);
  if (!v) throw new Error('usePdfEditor must be used within PdfEditorCore');
  return v;
}

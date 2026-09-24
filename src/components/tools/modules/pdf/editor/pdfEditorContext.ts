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
import type { PdfFont } from '@/lib/pdfFonts';
import type { Anno, EditorVersion, Tool } from './pdfEditorLogic';

export interface ToolMeta {
  id: Tool;
  label: string;
  icon: ReactNode;
  group: string;
}

/** Find-highlight geometry (Core draws it on the overlay; panel only displays). */
export interface FindNav {
  page: number;
  rects: { x: number; y: number; w: number; h: number }[];
  idx: number;
}

/** Text-style patch accepted by Core.patchTextStyle (format bar). */
export interface TextStylePatch {
  color?: string;
  size?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  align?: 'left' | 'center' | 'right';
  font?: PdfFont;
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
  // Find & replace (state + handlers live in Core; panel is presentational)
  findText: string;
  setFindText: (_v: string) => void;
  replaceText: string;
  setReplaceText: (_v: string) => void;
  replaceScope: 'page' | 'all';
  setReplaceScope: (_v: 'page' | 'all') => void;
  replacing: boolean;
  findNav: FindNav | null;
  setFindNav: (_v: FindNav | null) => void;
  setShowFind: (_v: boolean) => void;
  findStep: (_dir: 1 | -1) => Promise<void>;
  findHighlight: () => Promise<void>;
  findReplace: () => Promise<void>;
  // Format bar (text tool / selected text): Core computes eff* and selIsText
  selIsText: boolean;
  selAnno: Anno | undefined;
  effColor: string;
  effSize: number;
  textFont: PdfFont;
  textBold: boolean;
  textItalic: boolean;
  textUnderline: boolean;
  textStrike: boolean;
  textAlign: 'left' | 'center' | 'right';
  patchTextStyle: (_patch: TextStylePatch) => void;
  // Draw bar (draw / highlight / shape tools) — `tool` already declared above
  brushWidth: number;
  setBrushWidth: (_v: number) => void;
  inkColor: string;
  setInkColor: (_v: string) => void;
  markColor: string;
  setMarkColor: (_v: string) => void;
  markOpacity: number;
  setMarkOpacity: (_v: number) => void;
  shapeVariant: 'rect' | 'ellipse' | 'line' | 'arrow';
  setShapeVariant: (_v: 'rect' | 'ellipse' | 'line' | 'arrow') => void;
  shapeWidth: number;
  setShapeWidth: (_v: number) => void;
  // Toolbar (ribbon): document nav, save/export, AI/OCR, edit actions
  file: File | null;
  scale: number;
  setScale: (_v: number) => void;
  fitZoom: (_mode: 'width' | 'page') => void;
  fileBytes: Uint8Array | null;
  savedAt: number | null;
  saving: boolean;
  dirty: boolean;
  showVersions: boolean;
  setShowVersions: (_v: boolean) => void;
  versions: EditorVersion[];
  toggleFocus: () => Promise<void>;
  focus: boolean;
  runAiAction: (_action: 'summarize' | 'grammar' | 'translate') => Promise<void>;
  aiWorking: boolean;
  isSignedIn: boolean;
  isPro: boolean;
  findSensitive: () => Promise<void>;
  selection: string[];
  setSelection: (_v: string[]) => void;
  drawOverlay: () => void;
  askAboutDoc: () => Promise<void>;
  ocrLang: string;
  setOcrLang: (_v: string) => void;
  setOcrWords: (_v: { text: string; x: number; y: number; size: number; conf: number }[]) => void;
  runOcr: () => Promise<void>;
  ocrRunning: boolean;
  ocrProgress: number;
  setShowShortcuts: (_v: boolean) => void;
  deleteSelected: () => void;
  selected: { page: number; index: number } | null;
  moveLayer: (_dir: 1 | -1) => void;
  copySelected: () => void;
  pasteClipboard: () => void;
  stampAllPages: () => void;
  // LeftPanel (tool picker, emoji stamps, tool settings, selected-anno fields)
  pickTool: (_id: Tool) => void;
  stampEmoji: (_emoji: string) => void;
  recentEmoji: string[];
  onPickImage: (_f: File | null) => void;
  redactCount: number;
  redactMode: 'selective' | 'maximum';
  setRedactMode: (_v: 'selective' | 'maximum') => void;
  textDraft: string | null;
  setTextDraft: (_v: string | null) => void;
  commitAnnos: (_updater: (_prev: Record<number, Anno[]>) => Record<number, Anno[]>) => void;
}

export const PdfEditorCtx = createContext<PdfEditorApi | null>(null);

export function usePdfEditor(): PdfEditorApi {
  const v = useContext(PdfEditorCtx);
  if (!v) throw new Error('usePdfEditor must be used within PdfEditorCore');
  return v;
}

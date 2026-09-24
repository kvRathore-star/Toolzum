"use client";

// Thin entry shim: DynamicModuleWrapper imports '@/.../pdf/PdfEditor',
// logic tests import named pure helpers from the same path. All editor
// source lives under editor/ so the claims-net test can readdir that
// directory and automatically grep every module (nothing escapes the net
// by moving). Do NOT add component logic here — the claims test asserts
// this file stays a re-export only.
export * from './editor/PdfEditorCore';
export { default } from './editor/PdfEditorCore';

"use client";

import React from "react";
import { X } from "lucide-react";
import { useDialogA11y } from "@/components/useDialogA11y";
import type { AuditLogEntry } from "./admin.types";

interface AuditLogModalProps {
  show: boolean;
  logs: AuditLogEntry[];
  onClose: () => void;
}

export function AuditLogModal({ show, logs, onClose }: AuditLogModalProps) {
  const dialogRef = useDialogA11y<HTMLDivElement>(show, onClose);
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        aria-label="Close dialog"
        onClick={onClose}
        tabIndex={-1}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in cursor-default"
      />
      <div ref={dialogRef} tabIndex={-1} className="relative bg-[var(--bg-base)] rounded-2xl border border-[var(--border-subtle)] max-w-2xl w-full mx-4 max-h-[85vh] overflow-hidden shadow-2xl animate-scale-in" role="dialog" aria-modal="true" aria-label="Audit log">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Audit Log</h2>
          <button aria-label="Close audit log dialog" onClick={onClose} className="p-1.5 hover:bg-[var(--bg-surface)] rounded-lg cursor-pointer transition-all duration-200 active:scale-95"><X className="w-5 h-5 text-[var(--text-muted)]" /></button>
        </div>
        <div className="p-6 space-y-2 overflow-y-auto max-h-[calc(85vh-88px)]">
          {logs.length === 0 ? (
            <p className="text-center text-[var(--text-muted)] py-12">No audit entries yet</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-3 bg-[var(--bg-surface)] rounded-xl text-sm transition-colors duration-200 hover:bg-[var(--bg-elevated)]">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[var(--text-primary)]">{log.actorUserName || log.actorEmail}</span>
                  <span className="text-[var(--text-muted)] text-xs tabular-nums">{log.createdAt}</span>
                </div>
                <p className="text-[var(--text-secondary)] mt-1">
                  {log.actorUserName || log.actorEmail} — {log.action} · {log.oldValue} → {log.newValue}
                  <span className="text-[var(--text-muted)] ml-2">({log.targetUserName || log.targetUserEmail || log.targetUserId})</span>
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

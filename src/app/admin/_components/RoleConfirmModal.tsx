"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface RoleConfirmModalProps {
  target: { userId: string; name: string; email: string; oldRole: string; newRole: string } | null;
  confirmEmail: string;
  onConfirmEmailChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RoleConfirmModal({ target, confirmEmail, onConfirmEmailChange, onConfirm, onCancel }: RoleConfirmModalProps) {
  if (!target) return null;
  const isAdminChange = target.newRole === "admin" || target.oldRole === "admin";
  const emailMatch = confirmEmail === target.email;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onCancel}>
      <div className="bg-[var(--bg-base)] rounded-2xl border border-[var(--border-subtle)] max-w-md w-full mx-4 p-6 space-y-4 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Confirm Role Change</h3>
        </div>
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
          Change <strong className="text-[var(--text-primary)]">{target.name}&apos;s</strong> role from{" "}
          <strong className="text-[var(--text-primary)]">{target.oldRole}</strong> to{" "}
          <strong className="text-[var(--accent)]">{target.newRole}</strong>?
        </p>
        {isAdminChange && (
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">
              Type <strong className="text-[var(--text-primary)]">{target.email}</strong> to confirm:
            </label>
            <input
              type="text"
              value={confirmEmail}
              onChange={(e) => onConfirmEmailChange(e.target.value)}
              placeholder={target.email}
              className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all duration-200"
              autoFocus
            />
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onCancel} className="px-4 py-2 border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] cursor-pointer transition-all duration-200 active:scale-95">Cancel</button>
          <button
            disabled={isAdminChange && !emailMatch}
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 active:scale-95 ${isAdminChange && !emailMatch ? "bg-[var(--bg-surface)] text-[var(--text-muted)] cursor-not-allowed" : "bg-[var(--accent)] text-white hover:opacity-90"}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

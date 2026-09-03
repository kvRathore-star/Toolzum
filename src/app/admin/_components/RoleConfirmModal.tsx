"use client";

import React from "react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div className="bg-[var(--bg-base)] rounded-2xl border border-[var(--border-subtle)] max-w-md w-full mx-4 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Confirm Role Change</h3>
        <p className="text-[var(--text-secondary)]">Change <strong>{target.name}&apos;s</strong> role from <strong>{target.oldRole}</strong> to <strong>{target.newRole}</strong>?</p>
        {isAdminChange && (
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Type <strong className="text-[var(--text-primary)]">{target.email}</strong> to confirm:</label>
            <input
              type="text"
              value={confirmEmail}
              onChange={(e) => onConfirmEmailChange(e.target.value)}
              placeholder={target.email}
              className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              autoFocus
            />
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] cursor-pointer">Cancel</button>
          <button
            disabled={isAdminChange && !emailMatch}
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer ${isAdminChange && !emailMatch ? "bg-[var(--bg-surface)] text-[var(--text-muted)] cursor-not-allowed" : "bg-[var(--accent)] text-white hover:opacity-90"}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

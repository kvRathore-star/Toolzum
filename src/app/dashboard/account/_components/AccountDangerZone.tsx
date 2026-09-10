"use client";

import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";

interface AccountDangerZoneProps {
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: Dispatch<SetStateAction<boolean>>;
  deletePassword: string;
  setDeletePassword: Dispatch<SetStateAction<string>>;
  deleting: boolean;
  deleteAccount: () => Promise<void>;
}

export function AccountDangerZone({
  showDeleteConfirm,
  setShowDeleteConfirm,
  deletePassword,
  setDeletePassword,
  deleting,
  deleteAccount,
}: AccountDangerZoneProps) {
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--danger)]/20 rounded-[var(--radius-xl)] p-8 shadow-[var(--shadow-sm)]">
      <h2 className="text-lg font-semibold text-[var(--danger)] mb-2 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" />
        Danger Zone
      </h2>
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>
      {showDeleteConfirm ? (
        <div className="max-w-md space-y-3">
          <p className="text-sm text-[var(--text-muted)]">
            Enter your password to confirm deletion:
          </p>
          <input
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Current password"
            className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-all duration-150 focus:border-[var(--danger)] focus:ring-1 focus:ring-[var(--danger)] px-4 h-11 text-sm"
            style={{ borderRadius: "var(--radius-md)" }}
          />
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={deleteAccount}
              disabled={deleting}
              className="bg-[var(--danger)] hover:bg-[var(--danger)]/80 text-white"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              {deleting ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDeleteConfirm(true)}
          className="text-[var(--danger)] border border-[var(--danger)]/30 hover:bg-[var(--danger)]/10"
        >
          <Trash2 className="w-4 h-4 mr-2" /> Delete Account
        </Button>
      )}
    </div>
  );
}

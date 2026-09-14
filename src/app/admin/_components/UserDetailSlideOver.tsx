"use client";

import React, { useState } from "react";
import { X, CreditCard, Activity, Clock, Monitor, ShieldOff, ShieldCheck, Trash2, Save } from "lucide-react";
import Image from "next/image";
import { useDialogA11y } from "@/components/useDialogA11y";
import type { UserDetail, Payment, ToolUsage, AuditEntry, Session } from "./admin.types";
import { inputCls, labelCls } from "./admin.utils";

interface UserDetailSlideOverProps {
  userDetail: UserDetail | null;
  loading: boolean;
  sessions: Session[];
  sessionsLoading: boolean;
  revokingSession: string | null;
  onClose: () => void;
  onRevokeSession: (sessionId: string) => void;
  onUpdateCredits: (userId: string, credits: number) => void;
  onChangePlan: (userId: string, plan: string) => void;
  onBanUser: (userId: string, status: string) => void;
  onDeleteUser: (userId: string) => void;
  onToast: (message: string, type?: "success" | "error") => void;
}

function ActionButton({ onClick, disabled, loading, icon: Icon, label, loadingLabel, variant, className = "" }: {
  onClick: () => void; disabled?: boolean; loading?: boolean;
  icon: React.ElementType; label: string; loadingLabel?: string;
  variant: "primary" | "danger" | "warning" | "ghost"; className?: string;
}) {
  const variants = {
    primary: "bg-[var(--accent)] text-white hover:opacity-90",
    danger: "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50",
    warning: "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50",
    ghost: "bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]",
  };
  return (
    <button
      disabled={disabled || loading}
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer disabled:opacity-50 transition-all duration-200 active:scale-95 min-h-[44px] ${variants[variant]} ${className}`}
    >
      {loading ? (
        <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        <Icon className="w-3.5 h-3.5" />
      )}
      {loading ? (loadingLabel || "Working...") : label}
    </button>
  );
}

export function UserDetailSlideOver({
  userDetail, loading, sessions, sessionsLoading, revokingSession,
  onClose, onRevokeSession, onUpdateCredits, onChangePlan, onBanUser, onDeleteUser, onToast,
}: UserDetailSlideOverProps) {
  const [editingCredits, setEditingCredits] = useState<number | null>(null);
  const [savingCredits, setSavingCredits] = useState(false);
  const [banningUser, setBanningUser] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);
  const [changingPlan, setChangingPlan] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Esc closes, Tab stays trapped, focus returns to the invoking row.
  // Stack-aware: Esc while the delete confirm is open closes only that.
  const dialogRef = useDialogA11y<HTMLDivElement>(!!(userDetail || loading), onClose);

  if (!userDetail && !loading) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        aria-label="Close user detail"
        onClick={onClose}
        tabIndex={-1}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in cursor-default"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-detail-title"
        className="relative bg-[var(--bg-base)] w-full max-w-2xl border-l border-[var(--border-subtle)] overflow-y-auto shadow-2xl animate-slide-in-right"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/95 backdrop-blur-xl">
          <h2 id="user-detail-title" className="text-lg font-bold text-[var(--text-primary)]">User Detail</h2>
          <button type="button" onClick={onClose} aria-label="Close user detail" className="relative z-20 p-2 hover:bg-[var(--bg-surface)] rounded-lg cursor-pointer transition-all duration-200 active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"><X className="w-5 h-5 text-[var(--text-muted)]" /></button>
        </div>
        {loading ? (
          <div className="p-12 text-center" role="status" aria-live="polite">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin mx-auto" />
            <p className="text-sm text-[var(--text-muted)] mt-3">Loading user details...</p>
          </div>
        ) : userDetail ? (
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              {userDetail.user.image ? (
                <Image src={userDetail.user.image} alt="" width={48} height={48} className="w-12 h-12 rounded-full ring-2 ring-[var(--border-subtle)]" unoptimized />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold ring-2 ring-[var(--accent)]/20">{userDetail.user.name.charAt(0).toUpperCase()}</div>
              )}
              <div>
                <p className="font-semibold text-[var(--text-primary)]">{userDetail.user.name}</p>
                <p className="text-sm text-[var(--text-secondary)]">{userDetail.user.email}</p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Role", value: userDetail.user.role, color: userDetail.user.role === "admin" ? "text-purple-500" : "text-[var(--text-primary)]" },
                { label: "Plan", value: userDetail.user.plan, color: userDetail.user.plan === "pro" ? "text-emerald-500" : "text-[var(--text-primary)]" },
                { label: "Status", value: userDetail.user.status, color: userDetail.user.status === "banned" ? "text-red-500" : "text-emerald-500" },
                { label: "Last Login", value: userDetail.user.lastLoginAt ? new Date(userDetail.user.lastLoginAt * 1000).toLocaleDateString() : "Never", color: "text-[var(--text-primary)]" },
              ].map((item) => (
                <div key={item.label} className="p-3 bg-[var(--bg-surface)] rounded-xl text-center">
                  <p className="text-xs text-[var(--text-muted)] uppercase">{item.label}</p>
                  <p className={`font-bold text-sm ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Credits */}
            <div className="p-4 bg-[var(--bg-surface)] rounded-xl">
              <label htmlFor="credits-input" className={labelCls}>Credits</label>
              <div className="flex gap-2 items-center">
                <input
                  id="credits-input"
                  type="number"
                  min={0}
                  max={99999}
                  value={editingCredits !== null ? editingCredits : userDetail.user.credits}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v < 0 || v > 99999) return;
                    setEditingCredits(v);
                  }}
                  className={`${inputCls} w-32`}
                />
                <button
                  disabled={savingCredits || editingCredits === null}
                  onClick={async () => {
                    if (editingCredits === null) return;
                    setSavingCredits(true);
                    try {
                      const res = await fetch("/api/admin/update-credits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: userDetail.user.id, credits: editingCredits }) });
                      if (res.ok) {
                        onUpdateCredits(userDetail.user.id, editingCredits);
                        setEditingCredits(null);
                        onToast("Credits updated");
                      } else onToast("Failed to update credits", "error");
                    } catch { onToast("Failed to update credits", "error"); } finally { setSavingCredits(false); }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:opacity-90 cursor-pointer disabled:opacity-50 transition-all duration-200 active:scale-95"
                >
                  {savingCredits ? <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {savingCredits ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <select
                value={userDetail.user.plan}
                disabled={changingPlan}
                aria-label="Change user plan"
                onChange={async (e) => {
                  const newPlan = e.target.value;
                  setChangingPlan(true);
                  try {
                    const res = await fetch("/api/admin/change-plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: userDetail.user.id, plan: newPlan }) });
                    const body = await res.json().catch(() => ({})) as { error?: string };
                    if (res.ok) { onChangePlan(userDetail.user.id, newPlan); onToast("Plan updated to " + newPlan + ". User must re-login for changes to take effect."); }
                    else onToast(body.error || "Failed to update plan", "error");
                  } catch { onToast("Failed to update plan — network error", "error"); } finally { setChangingPlan(false); }
                }}
                className="px-3 py-2 min-h-[44px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] cursor-pointer disabled:opacity-50 focus:ring-2 focus:ring-[var(--accent)]/50 transition-all duration-200"
              >
                {/* Stored billing tier (free|pro). 'signedin' is a server-effective
                    tier, never a stored plan — shown read-only if legacy data exists. */}
                <option value="free">Free</option>
                {userDetail.user.plan !== "free" && userDetail.user.plan !== "pro" && (
                  <option value={userDetail.user.plan} disabled>
                    {userDetail.user.plan} (legacy — switch to Free or Pro)
                  </option>
                )}
                <option value="pro">Pro</option>
              </select>

              {userDetail.user.status === "banned" ? (
                <ActionButton
                  loading={banningUser}
                  onClick={async () => {
                    setBanningUser(true);
                    try {
                      const res = await fetch("/api/admin/ban-user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: userDetail.user.id, status: "active" }) });
                      if (res.ok) { onBanUser(userDetail.user.id, "active"); onToast("User unbanned"); }
                      else onToast("Failed to unban user", "error");
                    } catch { onToast("Failed to unban user", "error"); } finally { setBanningUser(false); }
                  }}
                  icon={ShieldCheck} label="Unban User" variant="primary"
                />
              ) : (
                <ActionButton
                  loading={banningUser}
                  onClick={async () => {
                    setBanningUser(true);
                    try {
                      const res = await fetch("/api/admin/ban-user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: userDetail.user.id, status: "banned" }) });
                      if (res.ok) { onBanUser(userDetail.user.id, "banned"); onToast("User banned"); }
                      else onToast("Failed to ban user", "error");
                    } catch { onToast("Failed to ban user", "error"); } finally { setBanningUser(false); }
                  }}
                  icon={ShieldOff} label="Ban User" variant="warning"
                />
              )}

              <ActionButton
                loading={deletingUser}
                onClick={() => { setShowDeleteConfirm(true); setDeleteConfirmText(""); }}
                icon={Trash2} label="Delete (GDPR)" variant="danger"
              />
            </div>

            {userDetail.payments.length > 0 && <PaymentHistory payments={userDetail.payments} />}
            {userDetail.toolUsage.length > 0 && <TopTools tools={userDetail.toolUsage} />}
            <SessionsSection sessions={sessions} loading={sessionsLoading} revokingSession={revokingSession} onRevoke={onRevokeSession} />
            {userDetail.roleHistory.length > 0 && <RoleHistory entries={userDetail.roleHistory} />}
          </div>
        ) : null}
      </div>

      {showDeleteConfirm && (
        <DeleteConfirmDialog
          userName={userDetail?.user.name ?? ""}
          deleting={deletingUser}
          confirmText={deleteConfirmText}
          onConfirmText={setDeleteConfirmText}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={async () => {
            if (!userDetail) return;
            setDeletingUser(true);
            try {
              const res = await fetch("/api/admin/delete-user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: userDetail.user.id, confirm: "DELETE" }) });
              if (res.ok) { onDeleteUser(userDetail.user.id); onToast("User deleted"); setShowDeleteConfirm(false); }
              else onToast("Failed to delete user", "error");
            } catch { onToast("Failed to delete user", "error"); } finally { setDeletingUser(false); }
          }}
        />
      )}
    </div>
  );
}

function DeleteConfirmDialog({ userName, deleting, confirmText, onConfirmText, onCancel, onConfirm }: {
  userName: string;
  deleting: boolean;
  confirmText: string;
  onConfirmText: (v: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const ref = useDialogA11y<HTMLDivElement>(true, onCancel);
  return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <button
            aria-label="Cancel delete"
            onClick={onCancel}
            tabIndex={-1}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default"
          />
          <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="delete-confirm-title" className="relative bg-[var(--bg-base)] rounded-2xl border border-[var(--border-subtle)] max-w-md w-full mx-4 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 id="delete-confirm-title" className="text-lg font-bold text-[var(--text-primary)]">Delete User</h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              This will permanently delete <strong className="text-[var(--text-primary)]">{userName}</strong> and all their data across 6 tables. This cannot be undone.
            </p>
            <div>
              <label htmlFor="delete-confirm-input" className="block text-sm text-[var(--text-secondary)] mb-1">
                Type <strong className="text-red-500">DELETE</strong> to confirm:
              </label>
              <input
                id="delete-confirm-input"
                type="text"
                value={confirmText}
                onChange={(e) => onConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all duration-200"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={onCancel} className="px-4 py-2 border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] cursor-pointer transition-all duration-200 active:scale-95">Cancel</button>
              <button
                disabled={confirmText !== "DELETE" || deleting}
                onClick={onConfirm}
                className="px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 active:scale-95 disabled:bg-[var(--bg-surface)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed bg-red-600 text-white hover:bg-red-700"
              >
                {deleting ? "Deleting..." : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
  );
}

function PaymentHistory({ payments }: { payments: Payment[] }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] mb-3"><CreditCard className="w-4 h-4" /> Payment History</h3>
      <div className="space-y-2">
        {payments.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-3 bg-[var(--bg-surface)] rounded-xl text-sm transition-colors duration-200 hover:bg-[var(--bg-elevated)]">
            <div>
              <span className="font-medium text-[var(--text-primary)]">{p.gateway}</span>
              <span className="text-[var(--text-muted)] mx-2">·</span>
              <span className="text-[var(--text-secondary)] tabular-nums">{p.amount} {p.currency}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === "paid" ? "bg-emerald-100 text-emerald-700" : p.status === "failed" ? "bg-red-100 text-red-700" : "bg-zinc-100 text-zinc-700"}`}>{p.status}</span>
              <span className="text-[var(--text-muted)] text-xs tabular-nums">{new Date(p.createdAt * 1000).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopTools({ tools }: { tools: ToolUsage[] }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] mb-3"><Activity className="w-4 h-4" /> Top Tools</h3>
      <div className="space-y-1">
        {tools.map((t) => (
          <div key={t.toolSlug} className="flex justify-between text-sm px-3 py-1.5 rounded-lg hover:bg-[var(--bg-surface)] transition-colors duration-150">
            <span className="text-[var(--text-secondary)] truncate min-w-0 mr-2">{t.toolSlug}</span>
            <span className="text-[var(--text-muted)] tabular-nums shrink-0">{t.count}x</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SessionsSection({ sessions, loading, revokingSession, onRevoke }: { sessions: Session[]; loading: boolean; revokingSession: string | null; onRevoke: (id: string) => void }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] mb-3"><Monitor className="w-4 h-4" /> Active Sessions</h3>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] py-4" role="status" aria-live="polite"><div className="w-4 h-4 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" /> Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] py-4">No active sessions</p>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 bg-[var(--bg-surface)] rounded-xl text-sm transition-colors duration-200 hover:bg-[var(--bg-elevated)]">
              <div className="min-w-0">
                <p className="text-[var(--text-primary)] font-medium truncate">{s.userAgent || "Unknown device"}</p>
                <p className="text-xs text-[var(--text-muted)]">{s.ipAddress || "No IP"} · Expires {new Date(s.expiresAt * 1000).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => onRevoke(s.id)}
                disabled={revokingSession === s.id}
                className="px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer disabled:opacity-50 transition-all duration-200 active:scale-95 min-h-[44px]"
              >
                {revokingSession === s.id ? "Revoking..." : "Revoke"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RoleHistory({ entries }: { entries: AuditEntry[] }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] mb-3"><Clock className="w-4 h-4" /> Role Changes</h3>
      <div className="space-y-1">
        {entries.map((a, i) => (
          <div key={i} className="text-sm px-3 py-1.5 text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-surface)] transition-colors duration-150">
            <span className="text-[var(--text-muted)] tabular-nums">{a.createdAt}</span>
            <span className="mx-2">·</span>
            <span className="font-medium">{a.actorUserName || a.actorEmail}</span>
            <span className="mx-1">changed role from</span>
            <span className="font-medium">{a.oldValue}</span>
            <span className="mx-1">to</span>
            <span className="font-medium">{a.newValue}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

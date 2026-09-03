"use client";

import React, { useState } from "react";
import { X, CreditCard, Activity, Clock, Monitor, Copy } from "lucide-react";
import Image from "next/image";
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
  onBanUser: (userId: string, ban: boolean) => void;
  onDeleteUser: (userId: string) => void;
  onToast: (message: string, type?: "success" | "error") => void;
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
  const [resetResult, setResetResult] = useState<{ tempPassword: string; email: string } | null>(null);

  if (!userDetail && !loading) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 transition-opacity" />
      <div className="relative bg-[var(--bg-base)] w-full max-w-2xl border-l border-[var(--border-subtle)] overflow-y-auto animate-slide-in-right" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">User Detail</h2>
          <button onClick={onClose} className="p-1 hover:bg-[var(--bg-surface)] rounded-lg cursor-pointer"><X className="w-5 h-5 text-[var(--text-muted)]" /></button>
        </div>
        {loading ? (
          <div className="p-12 text-center"><div className="w-6 h-6 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin mx-auto" /></div>
        ) : userDetail ? (
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              {userDetail.user.image ? (
                <Image src={userDetail.user.image} alt="" width={48} height={48} className="w-12 h-12 rounded-full" unoptimized />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold">{userDetail.user.name.charAt(0).toUpperCase()}</div>
              )}
              <div>
                <p className="font-semibold text-[var(--text-primary)]">{userDetail.user.name}</p>
                <p className="text-sm text-[var(--text-secondary)]">{userDetail.user.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-[var(--bg-surface)] rounded-xl text-center">
                <p className="text-xs text-[var(--text-muted)] uppercase">Role</p>
                <p className="font-bold text-[var(--text-primary)]">{userDetail.user.role}</p>
              </div>
              <div className="p-3 bg-[var(--bg-surface)] rounded-xl text-center">
                <p className="text-xs text-[var(--text-muted)] uppercase">Plan</p>
                <p className="font-bold text-[var(--text-primary)]">{userDetail.user.plan}</p>
              </div>
              <div className="p-3 bg-[var(--bg-surface)] rounded-xl text-center">
                <p className="text-xs text-[var(--text-muted)] uppercase">Status</p>
                <p className={`font-bold ${userDetail.user.status === "banned" ? "text-red-500" : "text-[var(--text-primary)]"}`}>{userDetail.user.status}</p>
              </div>
              <div className="p-3 bg-[var(--bg-surface)] rounded-xl text-center">
                <p className="text-xs text-[var(--text-muted)] uppercase">Last Login</p>
                <p className="font-bold text-[var(--text-primary)] text-xs">{userDetail.user.lastLoginAt ? new Date(userDetail.user.lastLoginAt * 1000).toLocaleDateString() : "Never"}</p>
              </div>
            </div>

            {/* Credits */}
            <div className="p-4 bg-[var(--bg-surface)] rounded-xl">
              <label className={labelCls}>Credits</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={editingCredits !== null ? editingCredits : userDetail.user.credits}
                  onChange={(e) => setEditingCredits(Number(e.target.value))}
                  className={`${inputCls} w-32`}
                />
                <button
                  disabled={savingCredits}
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
                  className="px-3 py-2 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:opacity-90 cursor-pointer disabled:opacity-50"
                >{savingCredits ? "Saving..." : "Save"}</button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <select
                value={userDetail.user.plan}
                disabled={changingPlan}
                onChange={async (e) => {
                  const newPlan = e.target.value;
                  setChangingPlan(true);
                  try {
                    const res = await fetch("/api/admin/change-plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: userDetail.user.id, plan: newPlan }) });
                    if (res.ok) { onChangePlan(userDetail.user.id, newPlan); onToast("Plan updated"); }
                    else onToast("Failed to update plan", "error");
                  } catch { onToast("Failed to update plan", "error"); } finally { setChangingPlan(false); }
                }}
                className="px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] cursor-pointer disabled:opacity-50"
              >
                <option value="free">Free</option>
                <option value="signedin">Signed In</option>
                <option value="pro">Pro</option>
              </select>
              <button
                disabled={banningUser}
                onClick={async () => {
                  const newStatus = userDetail.user.status === "banned" ? "active" : "banned";
                  setBanningUser(true);
                  try {
                    const res = await fetch("/api/admin/ban-user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: userDetail.user.id, ban: newStatus === "banned" }) });
                    if (res.ok) { onBanUser(userDetail.user.id, newStatus === "banned"); onToast(newStatus === "banned" ? "User banned" : "User unbanned"); }
                    else onToast("Failed to change ban status", "error");
                  } catch { onToast("Failed to change ban status", "error"); } finally { setBanningUser(false); }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer disabled:opacity-50 ${userDetail.user.status === "banned" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-amber-100 text-amber-700 hover:bg-amber-200"}`}>
                {banningUser ? "Working..." : userDetail.user.status === "banned" ? "Unban User" : "Ban User"}
              </button>
              <button
                disabled={deletingUser}
                onClick={async () => {
                  if (!confirm("Permanently delete this user and ALL their data? This cannot be undone.")) return;
                  if (!confirm("FINAL CONFIRM: Type DELETE in your mind — this user will be irrecoverably removed.")) return;
                  setDeletingUser(true);
                  try {
                    const res = await fetch("/api/admin/delete-user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: userDetail.user.id, confirm: "DELETE" }) });
                    if (res.ok) { onDeleteUser(userDetail.user.id); onToast("User deleted"); }
                    else onToast("Failed to delete user", "error");
                  } catch { onToast("Failed to delete user", "error"); } finally { setDeletingUser(false); }
                }}
                className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-medium cursor-pointer disabled:opacity-50">{deletingUser ? "Deleting..." : "Delete User (GDPR)"}</button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/admin/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: userDetail.user.id }) });
                    if (res.ok) {
                      const data = await res.json() as { tempPassword: string; email: string };
                      setResetResult({ tempPassword: data.tempPassword, email: data.email });
                      onToast("Password reset generated");
                    } else onToast("Failed to reset password", "error");
                  } catch { onToast("Failed to reset password", "error"); }
                }}
                className="px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] cursor-pointer">Reset Password</button>
            </div>

            {resetResult && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-xl space-y-2">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Password reset for {resetResult.email}</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-white dark:bg-black rounded-lg text-sm font-mono text-[var(--text-primary)] border border-[var(--border-subtle)]">{resetResult.tempPassword}</code>
                  <button onClick={() => { navigator.clipboard.writeText(resetResult.tempPassword); }} className="p-2 hover:bg-[var(--bg-surface)] rounded-lg cursor-pointer"><Copy className="w-4 h-4 text-[var(--text-muted)]" /></button>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-500">Share this temp password with the user. They should change it on next login.</p>
                <button onClick={() => setResetResult(null)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">Dismiss</button>
              </div>
            )}

            {userDetail.payments.length > 0 && (
              <PaymentHistory payments={userDetail.payments} />
            )}

            {userDetail.toolUsage.length > 0 && (
              <TopTools tools={userDetail.toolUsage} />
            )}

            <SessionsSection sessions={sessions} loading={sessionsLoading} revokingSession={revokingSession} onRevoke={onRevokeSession} />

            {userDetail.roleHistory.length > 0 && (
              <RoleHistory entries={userDetail.roleHistory} />
            )}
          </div>
        ) : null}
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
          <div key={p.id} className="flex items-center justify-between p-3 bg-[var(--bg-surface)] rounded-xl text-sm">
            <div>
              <span className="font-medium text-[var(--text-primary)]">{p.gateway}</span>
              <span className="text-[var(--text-muted)] mx-2">·</span>
              <span className="text-[var(--text-secondary)]">{p.amount} {p.currency}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === "paid" ? "bg-emerald-100 text-emerald-700" : p.status === "failed" ? "bg-red-100 text-red-700" : "bg-zinc-100 text-zinc-700"}`}>{p.status}</span>
              <span className="text-[var(--text-muted)] text-xs">{new Date(p.createdAt * 1000).toLocaleDateString()}</span>
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
          <div key={t.toolSlug} className="flex justify-between text-sm px-3 py-1.5">
            <span className="text-[var(--text-secondary)]">{t.toolSlug}</span>
            <span className="text-[var(--text-muted)]">{t.count}x</span>
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
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]"><div className="w-4 h-4 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" /> Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">No active sessions</p>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 bg-[var(--bg-surface)] rounded-xl text-sm">
              <div className="min-w-0">
                <p className="text-[var(--text-primary)] font-medium truncate">{s.userAgent || "Unknown device"}</p>
                <p className="text-xs text-[var(--text-muted)]">{s.ipAddress || "No IP"} · Expires {new Date(s.expiresAt * 1000).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => onRevoke(s.id)}
                disabled={revokingSession === s.id}
                className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer disabled:opacity-50"
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
          <div key={i} className="text-sm px-3 py-1.5 text-[var(--text-secondary)]">
            <span className="text-[var(--text-muted)]">{a.createdAt}</span>
            <span className="mx-2">·</span>
            <span>{a.actorEmail}</span>
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

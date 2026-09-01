"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Shield, Users, TrendingUp, Search, ChevronLeft, ChevronRight, X, CreditCard, Clock, Activity } from "lucide-react";
import Image from "next/image";

interface AdminStats {
  totalUsers: number;
  proUsers: number;
  adminUsers: number;
  signupsLast7Days: number;
  signupsLast30Days: number;
  pageViewsLast7Days: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  credits: number;
  createdAt: number;
  image: string | null;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

interface Payment {
  id: string;
  gateway: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: number;
}

interface ToolUsage {
  toolSlug: string;
  count: number;
}

interface AuditEntry {
  actorEmail: string;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
}

interface UserDetail {
  user: User;
  payments: Payment[];
  toolUsage: ToolUsage[];
  auditLog: AuditEntry[];
}

interface AuditLogEntry {
  id: number;
  actorEmail: string;
  action: string;
  targetUserId: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [showAuditLog, setShowAuditLog] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    async function load() {
      try {
        const [statsRes, usersRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch(`/api/admin/users?page=${page}&limit=20${search ? `&search=${encodeURIComponent(search)}` : ""}`),
        ]);
        if (cancelled) return;
        if (statsRes.ok) {
          setStats(await statsRes.json());
        } else if (statsRes.status === 403 || statsRes.status === 401) {
          router.push("/dashboard");
          return;
        }
        if (usersRes.ok) {
          const data = (await usersRes.json()) as UsersResponse;
          setUsers(data.users);
          setTotal(data.total);
        }
      } catch {
        if (!cancelled) setError("Failed to load data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [session, page, search, router]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!selectedUserId) { setUserDetail(null); return; }
    let cancelled = false;
    async function load() {
      setDetailLoading(true);
      try {
        const res = await fetch(`/api/admin/user-detail?userId=${selectedUserId}`);
        if (!cancelled && res.ok) {
          setUserDetail(await res.json());
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [selectedUserId]);

  const fetchAuditLog = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/audit-log?limit=50");
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
      }
    } catch { /* ignore */ }
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingRole(userId);
    try {
      const res = await fetch("/api/admin/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      }
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  if (isPending || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[var(--bg-base)]">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[var(--bg-base)]">
        <div className="text-center space-y-4">
          <Shield className="w-12 h-12 text-red-500 mx-auto" />
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Access Denied</h1>
          <p className="text-[var(--text-secondary)]">{error}</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="min-h-[80vh] bg-[var(--bg-base)]">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-[var(--accent)]" />
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admin Dashboard</h1>
          </div>
          <button
            onClick={() => { setShowAuditLog(true); fetchAuditLog(); }}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            Audit Log
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Total Users", value: stats.totalUsers, icon: Users },
              { label: "Pro Users", value: stats.proUsers, icon: TrendingUp },
              { label: "Admins", value: stats.adminUsers, icon: Shield },
              { label: "Signups (7d)", value: stats.signupsLast7Days, icon: Users },
              { label: "Signups (30d)", value: stats.signupsLast30Days, icon: Users },
              { label: "Page Views (7d)", value: stats.pageViewsLast7Days, icon: TrendingUp },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Users</h2>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name or email..."
                  className="pl-9 pr-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer">
                Search
              </button>
            </form>
          </div>

          <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)]">
                    <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">User</th>
                    <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">Email</th>
                    <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">Role</th>
                    <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">Plan</th>
                    <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">Credits</th>
                    <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">Joined</th>
                    <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <Image src={user.image} alt="" width={32} height={32} className="w-8 h-8 rounded-full" unoptimized />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-[var(--text-primary)] font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          user.plan === "pro"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : user.plan === "signedin"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}>
                          {user.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{user.credits}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">
                        {new Date(user.createdAt * 1000).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <select
                          value={user.role}
                          onChange={e => handleRoleChange(user.id, e.target.value)}
                          disabled={updatingRole === user.id}
                          className="px-2 py-1 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] cursor-pointer disabled:opacity-50"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-[var(--text-muted)]">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-muted)]">
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-2 text-sm text-[var(--text-secondary)]">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedUserId(null)} onKeyDown={e => e.key === 'Escape' && setSelectedUserId(null)} role="button" tabIndex={-1}>
          <div className="bg-[var(--bg-base)] rounded-2xl border border-[var(--border-subtle)] max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">User Detail</h2>
              <button onClick={() => setSelectedUserId(null)} className="p-1 hover:bg-[var(--bg-surface)] rounded-lg cursor-pointer">
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>
            {detailLoading ? (
              <div className="p-12 text-center">
                <div className="w-6 h-6 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin mx-auto" />
              </div>
            ) : userDetail ? (
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  {userDetail.user.image ? (
                    <Image src={userDetail.user.image} alt="" width={48} height={48} className="w-12 h-12 rounded-full" unoptimized />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold">
                      {userDetail.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">{userDetail.user.name}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{userDetail.user.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-[var(--bg-surface)] rounded-xl text-center">
                    <p className="text-xs text-[var(--text-muted)] uppercase">Role</p>
                    <p className="font-bold text-[var(--text-primary)]">{userDetail.user.role}</p>
                  </div>
                  <div className="p-3 bg-[var(--bg-surface)] rounded-xl text-center">
                    <p className="text-xs text-[var(--text-muted)] uppercase">Plan</p>
                    <p className="font-bold text-[var(--text-primary)]">{userDetail.user.plan}</p>
                  </div>
                  <div className="p-3 bg-[var(--bg-surface)] rounded-xl text-center">
                    <p className="text-xs text-[var(--text-muted)] uppercase">Credits</p>
                    <p className="font-bold text-[var(--text-primary)]">{userDetail.user.credits}</p>
                  </div>
                </div>

                {userDetail.payments.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] mb-3">
                      <CreditCard className="w-4 h-4" /> Payment History
                    </h3>
                    <div className="space-y-2">
                      {userDetail.payments.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-[var(--bg-surface)] rounded-xl text-sm">
                          <div>
                            <span className="font-medium text-[var(--text-primary)]">{p.gateway}</span>
                            <span className="text-[var(--text-muted)] mx-2">·</span>
                            <span className="text-[var(--text-secondary)]">{p.amount} {p.currency}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              p.status === "paid" ? "bg-emerald-100 text-emerald-700" : p.status === "failed" ? "bg-red-100 text-red-700" : "bg-zinc-100 text-zinc-700"
                            }`}>{p.status}</span>
                            <span className="text-[var(--text-muted)] text-xs">{new Date(p.createdAt * 1000).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {userDetail.toolUsage.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] mb-3">
                      <Activity className="w-4 h-4" /> Top Tools
                    </h3>
                    <div className="space-y-1">
                      {userDetail.toolUsage.map(t => (
                        <div key={t.toolSlug} className="flex justify-between text-sm px-3 py-1.5">
                          <span className="text-[var(--text-secondary)]">{t.toolSlug}</span>
                          <span className="text-[var(--text-muted)]">{t.count}x</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {userDetail.auditLog.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] mb-3">
                      <Clock className="w-4 h-4" /> Role Changes
                    </h3>
                    <div className="space-y-1">
                      {userDetail.auditLog.map((a, i) => (
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
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {showAuditLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAuditLog(false)} onKeyDown={e => e.key === 'Escape' && setShowAuditLog(false)} role="button" tabIndex={-1}>
          <div className="bg-[var(--bg-base)] rounded-2xl border border-[var(--border-subtle)] max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Audit Log</h2>
              <button onClick={() => setShowAuditLog(false)} className="p-1 hover:bg-[var(--bg-surface)] rounded-lg cursor-pointer">
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>
            <div className="p-6 space-y-2">
              {auditLogs.length === 0 ? (
                <p className="text-center text-[var(--text-muted)] py-8">No audit entries yet</p>
              ) : (
                auditLogs.map(log => (
                  <div key={log.id} className="p-3 bg-[var(--bg-surface)] rounded-xl text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[var(--text-primary)]">{log.actorEmail}</span>
                      <span className="text-[var(--text-muted)] text-xs">{log.createdAt}</span>
                    </div>
                    <p className="text-[var(--text-secondary)] mt-1">
                      {log.action} — {log.oldValue} → {log.newValue}
                      <span className="text-[var(--text-muted)] ml-2">(user: {log.targetUserId})</span>
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Shield, Users, TrendingUp, Search, ChevronLeft, ChevronRight, X, CreditCard, Clock, Activity, ArrowLeft, Download, Copy, DollarSign, Target, Zap, AlertTriangle, BarChart3, Monitor } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const inputCls = "w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]";
const labelCls = "block text-sm font-medium text-[var(--text-secondary)] mb-1";

interface AdminStats { totalUsers: number; proUsers: number; signedinUsers: number; adminUsers: number; signupsLast7Days: number; signupsLast30Days: number; pageViewsLast7Days: number; mrr: number; arr: number; totalRevenue: number; revenueLast30Days: number; paidCountLast30Days: number; activeSubscribers: number; }
interface User { id: string; name: string; email: string; role: string; plan: string; credits: number; status: string; lastLoginAt: number | null; createdAt: number; image: string | null; }
interface UsersResponse { users: User[]; total: number; page: number; limit: number; }
interface Payment { id: string; gateway: string; orderId: string; amount: number; currency: string; status: string; createdAt: number; }
interface ToolUsage { toolSlug: string; count: number; }
interface AuditEntry { actorEmail: string; action: string; oldValue: string | null; newValue: string | null; createdAt: string; }
interface UserDetail { user: User; payments: Payment[]; toolUsage: ToolUsage[]; roleHistory: AuditEntry[]; }
interface AuditLogEntry { id: number; actorEmail: string; action: string; targetUserId: string; targetUserName: string | null; targetUserEmail: string | null; oldValue: string | null; newValue: string | null; createdAt: string; }

function relativeTime(ts: number | null): string {
  if (!ts) return "never";
  const diff = Math.floor(Date.now() / 1000) - ts;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(ts * 1000).toLocaleDateString();
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
  const [roleConfirmTarget, setRoleConfirmTarget] = useState<{ userId: string; name: string; email: string; oldRole: string; newRole: string } | null>(null);
  const [roleConfirmEmail, setRoleConfirmEmail] = useState("");
  const [userSessions, setUserSessions] = useState<{ id: string; ipAddress: string | null; userAgent: string | null; createdAt: number; expiresAt: number }[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [revokingSession, setRevokingSession] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<"ban" | "unban" | "delete" | null>(null);
  const [editingCredits, setEditingCredits] = useState<{ userId: string; value: number } | null>(null);
  const [creditSaveMsg, setCreditSaveMsg] = useState("");
  const [resetResult, setResetResult] = useState<{ tempPassword: string; email: string } | null>(null);
  const [activeSection, setActiveSection] = useState<"stats" | "users">("stats");
  const searchRef = useRef<HTMLInputElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const usersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
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
        if (statsRes.ok) setStats(await statsRes.json());
        else if (statsRes.status === 403 || statsRes.status === 401) { router.push("/dashboard"); return; }
        if (usersRes.ok) { const data = (await usersRes.json()) as UsersResponse; setUsers(data.users); setTotal(data.total); }
      } catch { if (!cancelled) setError("Failed to load data"); } finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [session, page, search, router]);

  const fetchAuditLog = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/audit-log?limit=50");
      if (res.ok) { const data = (await res.json()) as { logs: AuditLogEntry[] }; setAuditLogs(data.logs || []); }
    } catch { /* ignore */ }
  }, []);

  const fetchSessions = useCallback(async (userId: string) => {
    setSessionsLoading(true);
    try {
      const res = await fetch(`/api/admin/sessions?userId=${userId}`);
      if (res.ok) { const data = (await res.json()) as { sessions: typeof userSessions }; setUserSessions(data.sessions || []); }
    } catch { /* ignore */ }
    finally { setSessionsLoading(false); }
  }, []);

  const revokeSession = useCallback(async (sessionId: string) => {
    setRevokingSession(sessionId);
    try {
      const res = await fetch("/api/admin/sessions/revoke", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId }) });
      if (res.ok) { setUserSessions((prev) => prev.filter((s) => s.id !== sessionId)); }
    } catch { /* ignore */ }
    finally { setRevokingSession(null); }
  }, []);

  useEffect(() => {
    if (!selectedUserId) { return; }
    let cancelled = false;
    async function load() {
      setDetailLoading(true);
      setUserDetail(null);
      setUserSessions([]);
      try {
        const res = await fetch(`/api/admin/user-detail?userId=${selectedUserId}`);
        if (!cancelled && res.ok) setUserDetail(await res.json() as UserDetail);
      } finally { if (!cancelled) setDetailLoading(false); }
      if (!cancelled && selectedUserId) fetchSessions(selectedUserId);
    }
    load();
    return () => { cancelled = true; };
  }, [selectedUserId, fetchSessions]);

  useEffect(() => {
    if (!statsRef.current || !usersRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === statsRef.current) setActiveSection("stats");
            else if (entry.target === usersRef.current) setActiveSection("users");
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(statsRef.current);
    observer.observe(usersRef.current);
    return () => observer.disconnect();
  }, [loading]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT";
      if (e.key === "Escape") {
        if (roleConfirmTarget) { setRoleConfirmTarget(null); return; }
        if (selectedUserId) { setSelectedUserId(null); return; }
        if (showAuditLog) { setShowAuditLog(false); return; }
      }
      if (!isInput && e.key === "/") { e.preventDefault(); searchRef.current?.focus(); }
      if (!isInput && e.key === "g") {
        const handler = (e2: KeyboardEvent) => {
          document.removeEventListener("keydown", handler);
          if (e2.key === "s") document.getElementById("stats")?.scrollIntoView({ behavior: "smooth" });
          if (e2.key === "u") document.getElementById("users")?.scrollIntoView({ behavior: "smooth" });
        };
        document.addEventListener("keydown", handler, { once: true });
        setTimeout(() => document.removeEventListener("keydown", handler), 1000);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [roleConfirmTarget, selectedUserId, showAuditLog]);

  const handleRoleChange = async (userId: string, newRole: string, confirmEmail?: string) => {
    setUpdatingRole(userId);
    try {
      const res = await fetch("/api/admin/update-role", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, role: newRole, confirmEmail }) });
      if (res.ok) setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } finally { setUpdatingRole(null); }
  };

  const handleBulkAction = async (action: "ban" | "unban" | "delete") => {
    if (action === "delete") {
      if (!confirm(`Permanently delete ${selectedIds.size} user(s)? This cannot be undone.`)) return;
      if (!confirm(`FINAL CONFIRM: Delete ${selectedIds.size} users irrecoverably?`)) return;
    }
    setBulkAction(action);
    for (const uid of selectedIds) {
      try {
        if (action === "delete") {
          await fetch("/api/admin/delete-user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: uid, confirm: "DELETE" }) });
        } else {
          await fetch("/api/admin/ban-user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: uid, ban: action === "ban" }) });
          await new Promise((r) => setTimeout(r, 300));
        }
      } catch { /* continue */ }
    }
    setSelectedIds(new Set());
    setBulkAction(null);
    setPage(1);
    setSearch("");
  };

  const exportCSV = () => {
    const header = "Name,Email,Role,Plan,Credits,Status,Last Login,Created\n";
    const rows = users.map((u) => [
      `"${(u.name || "").replace(/"/g, '""')}"`,
      `"${u.email}"`,
      u.role,
      u.plan,
      u.credits,
      u.status,
      u.lastLoginAt ? new Date(u.lastLoginAt * 1000).toISOString() : "never",
      new Date(u.createdAt * 1000).toISOString(),
    ].join(",")).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `users-page${page}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); };
  const toggleSelectAll = () => {
    if (selectedIds.size === users.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(users.map((u) => u.id)));
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
  const sidebarBtnCls = (active: boolean) =>
    `w-full text-left px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer ${active ? "bg-[var(--accent)] text-white font-medium" : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"}`;

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex">
      <aside className="hidden md:flex w-56 border-r border-[var(--border-subtle)] p-4 flex-col gap-2 shrink-0">
        <div className="space-y-1">
          <div className="px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Admin</div>
          <button onClick={() => document.getElementById("stats")?.scrollIntoView({ behavior: "smooth" })} className={sidebarBtnCls(activeSection === "stats")}>
            <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Stats</div>
          </button>
          <button onClick={() => document.getElementById("users")?.scrollIntoView({ behavior: "smooth" })} className={sidebarBtnCls(activeSection === "users")}>
            <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Users</div>
          </button>
          <button onClick={() => { setShowAuditLog(true); fetchAuditLog(); }} className={sidebarBtnCls(false)}>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Audit Log</div>
          </button>
        </div>
        <Link href="/" className="mt-auto flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Toolzum
        </Link>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="md:hidden flex items-center gap-2 px-4 py-3 border-b border-[var(--border-subtle)]">
          <Link href="/" className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><ArrowLeft className="w-4 h-4" /> Back to Toolzum</Link>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-[var(--accent)]" />
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admin Dashboard</h1>
          </div>
          {stats && (
            <div ref={statsRef} id="stats" className="space-y-6">
              {/* Primary metrics — colored left-border accent cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-blue-500", badge: "ALL", badgeColor: "bg-blue-500/10 text-blue-400" },
                  { label: "Active Subs", value: stats.activeSubscribers, icon: Zap, color: "bg-emerald-500", badge: "PRO+SIGNEDIN", badgeColor: "bg-emerald-500/10 text-emerald-400" },
                  { label: "Pro Users", value: stats.proUsers, icon: TrendingUp, color: "bg-violet-500", badge: "PAID", badgeColor: "bg-violet-500/10 text-violet-400" },
                  { label: "Admins", value: stats.adminUsers, icon: Shield, color: "bg-amber-500", badge: "STAFF", badgeColor: "bg-amber-500/10 text-amber-400" },
                ].map((stat) => (
                  <div key={stat.label} className={`relative p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] overflow-hidden`}>
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${stat.color}`} />
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <stat.icon className="w-4 h-4 text-[var(--text-muted)]" />
                        <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{stat.label}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${stat.badgeColor}`}>{stat.badge}</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value.toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Revenue metrics — secondary row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "MRR", value: `₹${stats.mrr.toLocaleString()}`, sub: "Monthly Recurring", icon: DollarSign, color: "text-emerald-400" },
                  { label: "ARR", value: `₹${stats.arr.toLocaleString()}`, sub: "Annual Recurring", icon: BarChart3, color: "text-blue-400" },
                  { label: "Revenue (30d)", value: `₹${stats.revenueLast30Days.toLocaleString()}`, sub: `${stats.paidCountLast30Days} transactions`, icon: CreditCard, color: "text-violet-400" },
                  { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, sub: "All time", icon: TrendingUp, color: "text-amber-400" },
                ].map((stat) => (
                  <div key={stat.label} className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{stat.label}</span>
                    </div>
                    <p className="text-xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* Growth milestones — ARR target tracker */}
              <div className="p-5 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-[var(--accent)]" />
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">Growth Milestones</h3>
                </div>
                {(() => {
                  const milestones = [
                    { label: "First 100 Users", target: 100, current: stats.totalUsers, color: "bg-blue-500" },
                    { label: "10 Pro Subscribers", target: 10, current: stats.proUsers, color: "bg-violet-500" },
                    { label: "₹10K MRR", target: 10000, current: stats.mrr, color: "bg-emerald-500" },
                    { label: "₹1L ARR", target: 100000, current: stats.arr, color: "bg-amber-500" },
                    { label: "₹5L ARR", target: 500000, current: stats.arr, color: "bg-rose-500" },
                    { label: "₹10L ARR", target: 1000000, current: stats.arr, color: "bg-red-500" },
                  ];
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {milestones.map((m) => {
                        const pct = Math.min(100, Math.round((m.current / m.target) * 100));
                        const reached = m.current >= m.target;
                        return (
                          <div key={m.label} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-[var(--text-secondary)]">{m.label}</span>
                              <span className={`text-xs font-medium ${reached ? "text-emerald-400" : "text-[var(--text-muted)]"}`}>
                                {reached ? "✓ Reached" : `${pct}%`}
                              </span>
                            </div>
                            <div className="h-2 bg-[var(--bg-base)] rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-500 ${m.color}`} style={{ width: `${pct}%` }} />
                            </div>
                            <div className="flex justify-between text-xs text-[var(--text-muted)]">
                              <span>{m.current.toLocaleString()}</span>
                              <span>{m.target.toLocaleString()}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Quick activity summary */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Signups (7d)", value: stats.signupsLast7Days, icon: Users, color: "text-blue-400" },
                  { label: "Signups (30d)", value: stats.signupsLast30Days, icon: TrendingUp, color: "text-emerald-400" },
                  { label: "Page Views (7d)", value: stats.pageViewsLast7Days, icon: Activity, color: "text-violet-400" },
                ].map((stat) => (
                  <div key={stat.label} className="p-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2 mb-1">
                      <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                      <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{stat.label}</span>
                    </div>
                    <p className="text-lg font-bold text-[var(--text-primary)]">{stat.value.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div ref={usersRef} id="users" className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Users</h2>
              <div className="flex gap-2 items-center">
                <button onClick={exportCSV} className="px-3 py-2 border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer flex items-center gap-1.5">
                  <Download className="w-4 h-4" /> Export CSV
                </button>
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input ref={searchRef} type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email... ( / )" className="pl-9 pr-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
                  </div>
                  <button type="submit" className="px-4 py-2 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer">Search</button>
                </form>
              </div>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <th className="text-left px-4 py-3 w-10">
                        <input type="checkbox" checked={selectedIds.size === users.length && users.length > 0} onChange={toggleSelectAll} className="rounded cursor-pointer" />
                      </th>
                      <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">User</th>
                      <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">Email</th>
                      <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">Status</th>
                      <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">Role</th>
                      <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">Plan</th>
                      <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">Credits</th>
                      <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">Last Active</th>
                      <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">Joined</th>
                      <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-elevated)] transition-colors">
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(user.id)}
                            onChange={() => {
                              setSelectedIds((prev) => {
                                const next = new Set(prev);
                                if (next.has(user.id)) next.delete(user.id); else next.add(user.id);
                                return next;
                              });
                            }}
                            className="rounded cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3 cursor-pointer" onClick={() => setSelectedUserId(user.id)}>
                          <div className="flex items-center gap-3">
                            {user.image ? (
                              <Image src={user.image} alt="" width={32} height={32} className="w-8 h-8 rounded-full" unoptimized />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs font-bold">{user.name.charAt(0).toUpperCase()}</div>
                            )}
                            <span className="text-[var(--text-primary)] font-medium">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[var(--text-secondary)] cursor-pointer" onClick={() => setSelectedUserId(user.id)}>{user.email}</td>
                        <td className="px-4 py-3 cursor-pointer" onClick={() => setSelectedUserId(user.id)}>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${user.status === "banned" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"}`}>{user.status}</span>
                        </td>
                        <td className="px-4 py-3 cursor-pointer" onClick={() => setSelectedUserId(user.id)}>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${user.role === "admin" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"}`}>{user.role}</span>
                        </td>
                        <td className="px-4 py-3 cursor-pointer" onClick={() => setSelectedUserId(user.id)}>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${user.plan === "pro" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : user.plan === "signedin" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"}`}>{user.plan}</span>
                        </td>
                        <td className="px-4 py-3 text-[var(--text-secondary)] text-xs">{user.credits}</td>
                        <td className="px-4 py-3 text-[var(--text-muted)] text-xs cursor-pointer" onClick={() => setSelectedUserId(user.id)}>{relativeTime(user.lastLoginAt)}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)] text-xs cursor-pointer" onClick={() => setSelectedUserId(user.id)}>{new Date(user.createdAt * 1000).toLocaleDateString()}</td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={user.role}
                            onChange={(e) => { setRoleConfirmTarget({ userId: user.id, name: user.name, email: user.email, oldRole: user.role, newRole: e.target.value }); setRoleConfirmEmail(""); }}
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
                      <tr><td colSpan={10} className="px-4 py-8 text-center text-[var(--text-muted)]">No users found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-muted)]">Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
                  <span className="px-3 py-2 text-sm text-[var(--text-secondary)]">{page} / {totalPages}</span>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl px-6 py-3 flex items-center gap-4 text-sm">
          <span className="font-medium text-[var(--text-primary)]">{selectedIds.size} selected</span>
          <span className="text-[var(--border-subtle)]">|</span>
          <button onClick={() => handleBulkAction("ban")} disabled={bulkAction !== null} className="px-3 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg text-xs font-medium cursor-pointer disabled:opacity-50">Ban</button>
          <button onClick={() => handleBulkAction("unban")} disabled={bulkAction !== null} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-xs font-medium cursor-pointer disabled:opacity-50">Unban</button>
          <button onClick={() => handleBulkAction("delete")} disabled={bulkAction !== null} className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-medium cursor-pointer disabled:opacity-50">Delete</button>
          <button onClick={() => setSelectedIds(new Set())} className="p-1 hover:bg-[var(--bg-surface)] rounded-lg cursor-pointer"><X className="w-4 h-4 text-[var(--text-muted)]" /></button>
        </div>
      )}

      {roleConfirmTarget && (() => {
        const isAdminChange = roleConfirmTarget.newRole === "admin" || roleConfirmTarget.oldRole === "admin";
        const emailMatch = roleConfirmEmail === roleConfirmTarget.email;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setRoleConfirmTarget(null); setRoleConfirmEmail(""); }}>
            <div className="bg-[var(--bg-base)] rounded-2xl border border-[var(--border-subtle)] max-w-md w-full mx-4 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Confirm Role Change</h3>
              <p className="text-[var(--text-secondary)]">Change <strong>{roleConfirmTarget.name}&apos;s</strong> role from <strong>{roleConfirmTarget.oldRole}</strong> to <strong>{roleConfirmTarget.newRole}</strong>?</p>
              {isAdminChange && (
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Type <strong className="text-[var(--text-primary)]">{roleConfirmTarget.email}</strong> to confirm:</label>
                  <input
                    type="text"
                    value={roleConfirmEmail}
                    onChange={(e) => setRoleConfirmEmail(e.target.value)}
                    placeholder={roleConfirmTarget.email}
                    className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    autoFocus
                  />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button onClick={() => { setRoleConfirmTarget(null); setRoleConfirmEmail(""); }} className="px-4 py-2 border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] cursor-pointer">Cancel</button>
                <button
                  disabled={isAdminChange && !emailMatch}
                  onClick={() => { handleRoleChange(roleConfirmTarget.userId, roleConfirmTarget.newRole, isAdminChange ? roleConfirmEmail : undefined); setRoleConfirmTarget(null); setRoleConfirmEmail(""); }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer ${isAdminChange && !emailMatch ? "bg-[var(--bg-surface)] text-[var(--text-muted)] cursor-not-allowed" : "bg-[var(--accent)] text-white hover:opacity-90"}`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {selectedUserId && (
        <div className="fixed inset-0 z-40 flex justify-end" onClick={() => setSelectedUserId(null)}>
          <div className="absolute inset-0 bg-black/40 transition-opacity" />
          <div className="relative bg-[var(--bg-base)] w-full max-w-2xl border-l border-[var(--border-subtle)] overflow-y-auto animate-slide-in-right" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">User Detail</h2>
              <button onClick={() => setSelectedUserId(null)} className="p-1 hover:bg-[var(--bg-surface)] rounded-lg cursor-pointer"><X className="w-5 h-5 text-[var(--text-muted)]" /></button>
            </div>
            {detailLoading ? (
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

                <div className="p-4 bg-[var(--bg-surface)] rounded-xl">
                  <label className={labelCls}>Credits</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      value={editingCredits?.userId === userDetail.user.id ? editingCredits.value : userDetail.user.credits}
                      onChange={(e) => setEditingCredits({ userId: userDetail.user.id, value: Number(e.target.value) })}
                      className={`${inputCls} w-32`}
                    />
                    <button
                      onClick={async () => {
                        if (!editingCredits || editingCredits.userId !== userDetail.user.id) return;
                        const res = await fetch("/api/admin/update-credits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: userDetail.user.id, credits: editingCredits.value }) });
                        if (res.ok) {
                          setUserDetail((prev) => prev ? { ...prev, user: { ...prev.user, credits: editingCredits.value } } : prev);
                          setUsers((prev) => prev.map((u) => (u.id === userDetail.user.id ? { ...u, credits: editingCredits.value } : u)));
                          setEditingCredits(null);
                          setCreditSaveMsg("Saved!");
                          setTimeout(() => setCreditSaveMsg(""), 2000);
                        }
                      }}
                      className="px-3 py-2 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:opacity-90 cursor-pointer"
                    >Save</button>
                    {creditSaveMsg && <span className="text-xs text-emerald-500 font-medium">{creditSaveMsg}</span>}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <select
                    value={userDetail.user.plan}
                    onChange={async (e) => {
                      const res = await fetch("/api/admin/change-plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: userDetail.user.id, plan: e.target.value }) });
                      if (res.ok) {
                        setUserDetail((prev) => prev ? { ...prev, user: { ...prev.user, plan: e.target.value } } : prev);
                        setUsers((prev) => prev.map((u) => (u.id === userDetail.user.id ? { ...u, plan: e.target.value } : u)));
                      }
                    }}
                    className="px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] cursor-pointer"
                  >
                    <option value="free">Free</option>
                    <option value="signedin">Signed In</option>
                    <option value="pro">Pro</option>
                  </select>
                  <button onClick={async () => { const newStatus = userDetail.user.status === "banned" ? "active" : "banned"; const res = await fetch("/api/admin/ban-user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: userDetail.user.id, ban: newStatus === "banned" }) }); if (res.ok) { setUserDetail((prev) => prev ? { ...prev, user: { ...prev.user, status: newStatus } } : prev); setUsers((prev) => prev.map((u) => (u.id === userDetail.user.id ? { ...u, status: newStatus } : u))); } }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${userDetail.user.status === "banned" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-amber-100 text-amber-700 hover:bg-amber-200"}`}>
                    {userDetail.user.status === "banned" ? "Unban User" : "Ban User"}
                  </button>
                  <button onClick={async () => { if (!confirm("Permanently delete this user and ALL their data? This cannot be undone.")) return; if (!confirm("FINAL CONFIRM: Type DELETE in your mind — this user will be irrecoverably removed.")) return; const res = await fetch("/api/admin/delete-user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: userDetail.user.id, confirm: "DELETE" }) }); if (res.ok) { setSelectedUserId(null); setUsers((prev) => prev.filter((u) => u.id !== userDetail.user.id)); setTotal((prev) => prev - 1); } }}
                    className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-medium cursor-pointer">Delete User (GDPR)</button>
                  <button onClick={async () => { const res = await fetch("/api/admin/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: userDetail.user.id }) }); if (res.ok) { const data = await res.json() as { tempPassword: string; email: string }; setResetResult({ tempPassword: data.tempPassword, email: data.email }); } }}
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
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] mb-3"><CreditCard className="w-4 h-4" /> Payment History</h3>
                    <div className="space-y-2">
                      {userDetail.payments.map((p) => (
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
                )}

                {userDetail.toolUsage.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] mb-3"><Activity className="w-4 h-4" /> Top Tools</h3>
                    <div className="space-y-1">
                      {userDetail.toolUsage.map((t) => (
                        <div key={t.toolSlug} className="flex justify-between text-sm px-3 py-1.5">
                          <span className="text-[var(--text-secondary)]">{t.toolSlug}</span>
                          <span className="text-[var(--text-muted)]">{t.count}x</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] mb-3"><Monitor className="w-4 h-4" /> Active Sessions</h3>
                  {sessionsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]"><div className="w-4 h-4 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" /> Loading sessions...</div>
                  ) : userSessions.length === 0 ? (
                    <p className="text-sm text-[var(--text-muted)]">No active sessions</p>
                  ) : (
                    <div className="space-y-2">
                      {userSessions.map((s) => (
                        <div key={s.id} className="flex items-center justify-between p-3 bg-[var(--bg-surface)] rounded-xl text-sm">
                          <div className="min-w-0">
                            <p className="text-[var(--text-primary)] font-medium truncate">{s.userAgent || "Unknown device"}</p>
                            <p className="text-xs text-[var(--text-muted)]">{s.ipAddress || "No IP"} · Expires {new Date(s.expiresAt * 1000).toLocaleDateString()}</p>
                          </div>
                          <button
                            onClick={() => revokeSession(s.id)}
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

                {userDetail.roleHistory.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] mb-3"><Clock className="w-4 h-4" /> Role Changes</h3>
                    <div className="space-y-1">
                      {userDetail.roleHistory.map((a, i) => (
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAuditLog(false)}>
          <div className="bg-[var(--bg-base)] rounded-2xl border border-[var(--border-subtle)] max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Audit Log</h2>
              <button onClick={() => setShowAuditLog(false)} className="p-1 hover:bg-[var(--bg-surface)] rounded-lg cursor-pointer"><X className="w-5 h-5 text-[var(--text-muted)]" /></button>
            </div>
            <div className="p-6 space-y-2">
              {auditLogs.length === 0 ? (
                <p className="text-center text-[var(--text-muted)] py-8">No audit entries yet</p>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-[var(--bg-surface)] rounded-xl text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[var(--text-primary)]">{log.actorEmail}</span>
                      <span className="text-[var(--text-muted)] text-xs">{log.createdAt}</span>
                    </div>
                    <p className="text-[var(--text-secondary)] mt-1">
                      {log.action} — {log.oldValue} → {log.newValue}
                      <span className="text-[var(--text-muted)] ml-2">({log.targetUserName || log.targetUserEmail || log.targetUserId})</span>
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

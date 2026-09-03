"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Shield, Users, TrendingUp, Clock, ArrowLeft, Bug } from "lucide-react";
import Link from "next/link";
import { StatsSection } from "./_components/StatsSection";
import { UserTable } from "./_components/UserTable";
import { BulkActionsBar } from "./_components/BulkActionsBar";
import { RoleConfirmModal } from "./_components/RoleConfirmModal";
import { UserDetailSlideOver } from "./_components/UserDetailSlideOver";
import { AuditLogModal } from "./_components/AuditLogModal";
import { ErrorLogsSection } from "./_components/ErrorLogsSection";
import type { AdminStats, User, UsersResponse, UserDetail, AuditLogEntry, Session } from "./_components/admin.types";

export default function AdminPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsError, setStatsError] = useState("");
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
  const [userSessions, setUserSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [revokingSession, setRevokingSession] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<"ban" | "unban" | "delete" | null>(null);
  const [activeSection, setActiveSection] = useState<"stats" | "users">("stats");
  const [showErrors, setShowErrors] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const usersRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

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
        else setStatsError(`Stats API error: ${statsRes.status}`);
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
      if (res.ok) { const data = (await res.json()) as { sessions: Session[] }; setUserSessions(data.sessions || []); }
    } catch { /* ignore */ }
    finally { setSessionsLoading(false); }
  }, []);

  const revokeSession = useCallback(async (sessionId: string) => {
    setRevokingSession(sessionId);
    try {
      const res = await fetch("/api/admin/sessions/revoke", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId }) });
      if (res.ok) { setUserSessions((prev) => prev.filter((s) => s.id !== sessionId)); showToast("Session revoked"); }
      else showToast("Failed to revoke session", "error");
    } catch { showToast("Failed to revoke session", "error"); }
    finally { setRevokingSession(null); }
  }, [showToast]);

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
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
        showToast("Role updated");
      } else showToast("Failed to update role", "error");
    } catch { showToast("Failed to update role", "error"); } finally { setUpdatingRole(null); }
  };

  const handleBulkAction = async (action: "ban" | "unban" | "delete") => {
    if (action === "delete") {
      if (!confirm(`Permanently delete ${selectedIds.size} user(s)? This cannot be undone.`)) return;
      if (!confirm(`FINAL CONFIRM: Delete ${selectedIds.size} users irrecoverably?`)) return;
    }
    setBulkAction(action);
    let successCount = 0;
    let failCount = 0;
    for (const uid of selectedIds) {
      try {
        if (action === "delete") {
          const res = await fetch("/api/admin/delete-user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: uid, confirm: "DELETE" }) });
          if (res.ok) successCount++; else failCount++;
        } else {
          const res = await fetch("/api/admin/ban-user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: uid, status: action === "ban" ? "banned" : "active" }) });
          if (res.ok) successCount++; else failCount++;
          await new Promise((r) => setTimeout(r, 300));
        }
      } catch { failCount++; }
    }
    setSelectedIds(new Set());
    setBulkAction(null);
    setPage(1);
    setSearch("");
    if (failCount > 0) showToast(`${failCount} action(s) failed`, "error");
    else showToast(`${successCount} user(s) ${action === "delete" ? "deleted" : action === "ban" ? "banned" : "unbanned"}`);
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
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          <p className="text-sm text-[var(--text-muted)]">Loading dashboard...</p>
        </div>
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
    `w-full text-left px-3 py-2 rounded-xl text-sm transition-all duration-200 cursor-pointer ${active ? "bg-[var(--accent)] text-white font-medium shadow-lg shadow-[var(--accent)]/20" : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]"}`;

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
          <button onClick={() => setShowErrors(!showErrors)} className={sidebarBtnCls(showErrors)}>
            <div className="flex items-center gap-2"><Bug className="w-4 h-4" /> Errors</div>
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
          {statsError && !stats && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-xl">
              <p className="text-sm text-amber-700 dark:text-amber-400">{statsError}</p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">Stats section unavailable. Users table still works.</p>
            </div>
          )}
          {stats && <div ref={statsRef} id="stats"><StatsSection stats={stats} /></div>}
          <UserTable
            ref={usersRef}
            users={users}
            total={total}
            page={page}
            totalPages={totalPages}
            search={search}
            selectedIds={selectedIds}
            updatingRole={updatingRole}
            onSearch={handleSearch}
            onSearchChange={setSearch}
            onExportCSV={exportCSV}
            onPageChange={setPage}
            onSelectAll={toggleSelectAll}
            onSelectUser={setSelectedUserId}
            onToggleSelect={(id) => {
              setSelectedIds((prev) => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id); else next.add(id);
                return next;
              });
            }}
            onRoleSelect={(userId, name, email, oldRole, newRole) => {
              setRoleConfirmTarget({ userId, name, email, oldRole, newRole });
              setRoleConfirmEmail("");
            }}
            searchRef={searchRef}
          />
          {showErrors && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Error Logs</h2>
              <ErrorLogsSection />
            </div>
          )}
        </div>
      </main>

      <BulkActionsBar
        selectedCount={selectedIds.size}
        bulkAction={bulkAction}
        onBan={() => handleBulkAction("ban")}
        onUnban={() => handleBulkAction("unban")}
        onDelete={() => handleBulkAction("delete")}
        onClear={() => setSelectedIds(new Set())}
      />

      <RoleConfirmModal
        target={roleConfirmTarget}
        confirmEmail={roleConfirmEmail}
        onConfirmEmailChange={setRoleConfirmEmail}
        onConfirm={() => {
          if (roleConfirmTarget) {
            handleRoleChange(roleConfirmTarget.userId, roleConfirmTarget.newRole, roleConfirmTarget.newRole === "admin" || roleConfirmTarget.oldRole === "admin" ? roleConfirmEmail : undefined);
            setRoleConfirmTarget(null);
            setRoleConfirmEmail("");
          }
        }}
        onCancel={() => { setRoleConfirmTarget(null); setRoleConfirmEmail(""); }}
      />

      <UserDetailSlideOver
        userDetail={userDetail}
        loading={detailLoading}
        sessions={userSessions}
        sessionsLoading={sessionsLoading}
        revokingSession={revokingSession}
        onClose={() => setSelectedUserId(null)}
        onRevokeSession={revokeSession}
        onUpdateCredits={(userId, credits) => {
          setUserDetail((prev) => prev ? { ...prev, user: { ...prev.user, credits } } : prev);
          setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, credits } : u)));
        }}
        onChangePlan={(userId, plan) => {
          setUserDetail((prev) => prev ? { ...prev, user: { ...prev.user, plan } } : prev);
          setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, plan } : u)));
        }}
        onBanUser={(userId, status) => {
          setUserDetail((prev) => prev ? { ...prev, user: { ...prev.user, status } } : prev);
          setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status } : u)));
        }}
        onDeleteUser={(userId) => {
          setSelectedUserId(null);
          setUsers((prev) => prev.filter((u) => u.id !== userId));
          setTotal((prev) => prev - 1);
        }}
        onToast={showToast}
      />

      <AuditLogModal show={showAuditLog} logs={auditLogs} onClose={() => setShowAuditLog(false)} />

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[60] px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${toast.type === "error" ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}`}>
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translate(-50%, 20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slide-down {
          from { transform: translateY(-8px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-in-right { animation: slide-in-right 0.25s ease-out; }
        .animate-slide-up { animation: slide-up 0.25s ease-out; }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
        .animate-slide-down { animation: slide-down 0.2s ease-out; }
      `}</style>
    </div>
  );
}

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut, authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  CreditCard,
  Star,
  LogOut,
  Zap,
  Crown,
  Trash2,
  Loader2,
  Pencil,
  Check,
  X,
  Shield,
  Monitor,
  Smartphone,
  Globe,
  AlertTriangle,
  Key,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Session {
  id: string;
  token: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
}

function parseUserAgent(ua?: string): { device: string; browser: string } {
  if (!ua) return { device: "Unknown device", browser: "Unknown browser" };
  let device = "Desktop";
  if (/mobile|android|iphone/i.test(ua)) device = "Mobile";
  else if (/tablet|ipad/i.test(ua)) device = "Tablet";

  let browser = "Unknown";
  if (/chrome/i.test(ua) && !/edge|opr/i.test(ua)) browser = "Chrome";
  else if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/edge/i.test(ua)) browser = "Edge";
  else if (/curl/i.test(ua)) browser = "CLI";

  return { device, browser };
}

export default function AccountPage() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();

  // Profile state
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Sessions state
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [revokingToken, setRevokingToken] = useState<string | null>(null);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) setNameValue(session.user.name || "");
  }, [session]);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const { data } = await authClient.listSessions();
      if (data) setSessions(data as unknown as Session[]);
    } catch {
      // ignore
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      loadSessions();
    }
  }, [session, loadSessions]);

  const saveName = async () => {
    if (!nameValue.trim() || nameValue === session?.user.name) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    try {
      const { error } = await authClient.updateUser({ name: nameValue.trim() });
      if (error) {
        toast.error(error.message || "Failed to update name");
      } else {
        toast.success("Name updated");
        setEditingName(false);
        refetch();
      }
    } finally {
      setSavingName(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
      });
      if (error) {
        toast.error(error.message || "Failed to change password");
      } else {
        toast.success("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const revokeSession = async (token: string) => {
    setRevokingToken(token);
    try {
      const { error } = await authClient.revokeSession({ token });
      if (error) {
        toast.error("Failed to revoke session");
      } else {
        toast.success("Session revoked");
        setSessions((prev) => prev.filter((s) => s.token !== token));
      }
    } finally {
      setRevokingToken(null);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      const { error } = await authClient.deleteUser({
        password: deletePassword || undefined,
      });
      if (error) {
        toast.error(error.message || "Failed to delete account");
      } else {
        toast.success("Account deleted");
        await signOut();
        router.push("/");
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (isPending) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[var(--bg-base)]">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  const user = session.user;
  const credits = (user as { credits?: number }).credits ?? 0;
  const plan = (user as { plan?: string }).plan || "free";

  return (
    <div className="min-h-[90vh] bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-[var(--border-subtle)] pb-8">
          <div>
            <h1 className="font-[family-name:var(--font-serif)] text-4xl sm:text-5xl mb-2">
              Account
            </h1>
            <p className="text-[var(--text-secondary)] text-lg">
              Manage your profile, security, and tools.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" asChild>
              <Link href="/dashboard">
                <Zap className="w-4 h-4 mr-2" /> Dashboard
              </Link>
            </Button>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="text-[var(--danger)] hover:text-white hover:bg-[var(--danger)]"
            >
              <LogOut className="w-4 h-4 mr-2" /> Sign out
            </Button>
          </div>
        </div>

        {/* ===== PROFILE & PLAN ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">

          {/* Profile Card */}
          <div className="lg:col-span-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-8 shadow-[var(--shadow-sm)]">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-[var(--accent)]" />
              Profile
            </h2>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[var(--accent-ink)]/10 flex items-center justify-center text-[var(--accent)] text-2xl font-bold shrink-0">
                  {user.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveName()}
                        className="flex-1 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-primary)] px-3 py-1.5 text-sm outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
                        style={{ borderRadius: "var(--radius-md)" }}
                        autoFocus
                      />
                      <button
                        onClick={saveName}
                        disabled={savingName}
                        className="p-1.5 text-[var(--success)] hover:bg-[var(--success)]/10 rounded-md transition-colors"
                      >
                        {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => { setEditingName(false); setNameValue(user.name || ""); }}
                        className="p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-overlay)] rounded-md transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-semibold text-[var(--text-primary)] truncate">
                        {user.name || "Unnamed User"}
                      </p>
                      <button
                        onClick={() => setEditingName(true)}
                        className="p-1 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                        title="Edit name"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-[var(--text-muted)]">
                    Member since{" "}
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="border-t border-[var(--border-subtle)] pt-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-sm text-[var(--text-secondary)]">{user.email}</span>
                  {user.emailVerified ? (
                    <span className="text-[10px] font-semibold bg-[var(--success)]/10 text-[var(--success)] px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold bg-[var(--warning)]/10 text-[var(--warning)] px-2 py-0.5 rounded-full">
                      Unverified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Plan & Credits Card */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-8 shadow-[var(--shadow-sm)] flex flex-col">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <Crown className="w-5 h-5 text-[var(--warning)]" />
              Plan
            </h2>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span className="text-3xl font-bold capitalize text-[var(--text-primary)]">{plan}</span>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  {plan === "free" ? "10 AI credits per account" : "Unlimited AI credits"}
                </p>
              </div>
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-[var(--text-secondary)]">
                    <Zap className="w-3.5 h-3.5 inline mr-1" /> Credits
                  </span>
                  <span className="font-mono font-semibold text-[var(--text-primary)]">{credits}</span>
                </div>
                <div className="w-full bg-[var(--bg-overlay)] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[var(--accent-ink)] h-full transition-all duration-500"
                    style={{ width: `${Math.min((credits / 10) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <Link
                href="/pricing"
                className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium rounded-[var(--radius-md)] transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                {plan === "free" ? "Upgrade Plan" : "Manage Plan"}
              </Link>
            </div>
          </div>
        </div>

        {/* ===== FAVORITES LINK ===== */}
        <Link
          href="/dashboard/favorites"
          className="flex items-center justify-between p-6 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] mb-8 hover:border-[var(--accent)]/30 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Favorite Tools</h2>
              <p className="text-xs text-[var(--text-muted)]">Manage your saved tools</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all" />
        </Link>

        {/* ===== CHANGE PASSWORD ===== */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-8 shadow-[var(--shadow-sm)] mb-8">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
            <Key className="w-5 h-5 text-[var(--accent)]" />
            Change Password
          </h2>
          <form onSubmit={changePassword} className="max-w-md space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)] tracking-wide uppercase">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-all duration-150 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] px-4 pr-10 h-11 text-sm"
                  style={{ borderRadius: "var(--radius-md)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <X className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)] tracking-wide uppercase">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={8}
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-all duration-150 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] px-4 pr-10 h-11 text-sm"
                  style={{ borderRadius: "var(--radius-md)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  tabIndex={-1}
                >
                  {showNewPassword ? <X className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)] tracking-wide uppercase">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={8}
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-all duration-150 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] px-4 h-11 text-sm"
                style={{ borderRadius: "var(--radius-md)" }}
              />
            </div>
            <Button type="submit" variant="secondary" size="sm" disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}>
              {changingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Key className="w-4 h-4 mr-2" />}
              {changingPassword ? "Changing..." : "Update Password"}
            </Button>
          </form>
        </div>

        {/* ===== SESSIONS ===== */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-8 shadow-[var(--shadow-sm)] mb-8">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[var(--success)]" />
            Active Sessions
          </h2>
          {sessionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-[var(--accent)] animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No active sessions found.</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const { device, browser } = parseUserAgent(session.userAgent);
                const isCurrent = session.token === (session as unknown as { token: string }).token;
                const icon = /mobile|android|iphone/i.test(session.userAgent || "") ? Smartphone : /curl|cli/i.test(session.userAgent || "") ? Globe : Monitor;
                const Icon = icon;
                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-md)]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[var(--bg-surface)] flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-[var(--text-muted)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {browser} on {device}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] truncate">
                          {session.ipAddress || "Unknown IP"} · Started {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => revokeSession(session.token)}
                      disabled={revokingToken === session.token}
                      className="text-xs text-[var(--danger)] hover:bg-[var(--danger)]/10 px-3 py-1.5 rounded-md transition-colors shrink-0 disabled:opacity-50"
                    >
                      {revokingToken === session.token ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        "Revoke"
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ===== DANGER ZONE ===== */}
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

      </div>
    </div>
  );
}

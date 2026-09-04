"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Shield } from "lucide-react";
import { AdminSidebar } from "./_components/AdminSidebar";
import { StatsSection } from "./_components/StatsSection";
import type { AdminStats } from "./_components/admin.types";

export default function AdminPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsError, setStatsError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/stats");
        if (cancelled) return;
        if (res.ok) setStats(await res.json());
        else if (res.status === 403 || res.status === 401) { router.push("/dashboard"); return; }
        else setStatsError(`Stats API error: ${res.status}`);
      } catch { if (!cancelled) setError("Failed to load data"); } finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [session, router]);

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

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-[var(--accent)]" />
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admin Dashboard</h1>
          </div>
          {statsError && !stats && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-xl">
              <p className="text-sm text-amber-700 dark:text-amber-400">{statsError}</p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">Stats section unavailable.</p>
            </div>
          )}
          {stats && <StatsSection stats={stats} />}
          <div className="text-center py-8">
            <p className="text-sm text-[var(--text-muted)]">Use the sidebar to navigate to Users, Payments, Errors, and Audit Log.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

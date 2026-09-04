"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Shield, Clock } from "lucide-react";
import { AdminSidebar } from "../_components/AdminSidebar";
import type { AuditLogEntry } from "../_components/admin.types";

export default function AdminAuditPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    fetch("/api/admin/audit-log?limit=100")
      .then(async (r) => r.ok ? (await r.json()) as { logs: AuditLogEntry[] } : null)
      .then((data) => { if (!cancelled && data) setLogs(data.logs || []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [session]);

  if (isPending || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[var(--bg-base)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          <p className="text-sm text-[var(--text-muted)]">Loading audit log...</p>
        </div>
      </div>
    );
  }
  if (!session) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-[var(--accent)]" />
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Audit Log</h1>
          </div>
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
            {logs.length === 0 ? (
              <p className="text-center text-[var(--text-muted)] py-12">No audit entries yet</p>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)]">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-[var(--bg-elevated)] transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[var(--text-primary)]">{log.actorUserName || log.actorEmail}</span>
                      <span className="text-[var(--text-muted)] text-xs tabular-nums flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {log.createdAt}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">{log.action}</p>
                    {log.oldValue && log.newValue && (
                      <p className="text-xs text-[var(--text-muted)] mt-1">{log.oldValue} → {log.newValue}</p>
                    )}
                    {log.targetUserEmail && <p className="text-xs text-[var(--text-muted)] mt-1">Target: {log.targetUserEmail}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

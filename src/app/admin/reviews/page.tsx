"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Check, X, Loader2 } from "lucide-react";
import { AdminSidebar } from "../_components/AdminSidebar";

interface Row {
  id: string;
  name: string;
  text: string;
  toolSlug: string;
  status: string;
  createdAt: number;
}

/** Review moderation: pending first, one click to approve or reject.
 *  Nothing reaches the homepage without passing through here. */
export default function AdminReviewsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/testimonials");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = (await res.json()) as { ok?: boolean; testimonials?: Row[]; error?: string };
      if (data.ok) setRows(data.testimonials ?? []);
      else setError(data.error || "Couldn't load reviews.");
    } catch {
      setError("Couldn't load reviews.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!isPending) void load();
  }, [isPending, load]);

  const act = async (id: string, status: "approved" | "rejected") => {
    setActing(id + status);
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = (await res.json()) as { ok?: boolean };
      if (data.ok) {
        setRows((prev) =>
          status === "approved"
            ? prev.map((r) => (r.id === id ? { ...r, status } : r))
            : prev.filter((r) => r.id !== id),
        );
      }
    } catch {
      /* keep the row; try again */
    } finally {
      setActing(null);
    }
  };

  if (isPending) return null;
  if (!session?.user) {
    router.push("/login");
    return null;
  }

  const pending = rows.filter((r) => r.status === "pending");
  const approved = rows.filter((r) => r.status === "approved");

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      <AdminSidebar />
      <main className="flex-1 p-6 sm:p-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Reviews</h1>
        <p className="text-xs text-[var(--text-muted)] mb-6">
          {pending.length} pending · {approved.length} live on the homepage. Nothing publishes without your approval.
        </p>
        {loading && (
          <p className="text-sm text-[var(--text-muted)] flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </p>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {!loading && rows.length === 0 && (
          <p className="text-sm text-[var(--text-muted)]">No reviews yet. Share the homepage form to collect the first ones.</p>
        )}
        {pending.length > 0 && (
          <>
            <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-3">Pending</h2>
            <div className="space-y-3 mb-8">
              {pending.map((r) => (
                <div key={r.id} className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-4">
                  <p className="text-sm text-[var(--text-primary)]">“{r.text}”</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">— {r.name}{r.toolSlug ? ` · ${r.toolSlug}` : ""} · {new Date(r.createdAt * 1000).toLocaleDateString()}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => act(r.id, "approved")}
                      disabled={acting !== null}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 min-h-[32px]"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => act(r.id, "rejected")}
                      disabled={acting !== null}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50 min-h-[32px]"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {approved.length > 0 && (
          <>
            <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-3">Live</h2>
            <div className="space-y-2">
              {approved.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5">
                  <span className="text-[var(--text-secondary)] truncate">“{r.text}” <span className="text-[var(--text-muted)]">— {r.name}</span></span>
                  <button
                    onClick={() => act(r.id, "rejected")}
                    disabled={acting !== null}
                    className="text-xs text-[var(--text-muted)] hover:text-red-500 shrink-0"
                  >
                    Unpublish
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

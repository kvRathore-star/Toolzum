"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Flag, Loader2 } from "lucide-react";
import { AdminSidebar } from "../_components/AdminSidebar";

interface FlagMap {
  [key: string]: boolean;
}

const KNOWN_FLAGS: { key: string; desc: string }[] = [
  { key: "ai_generation", desc: "Master kill-switch — all /api/ai/* endpoints 503 while off." },
  { key: "ai_image_gemini", desc: "Gemini HD image engine toggle in the image generator." },
];

export default function AdminFlagsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [flags, setFlags] = useState<FlagMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/flags");
      if (res.status === 403 || res.status === 401) {
        router.push("/dashboard");
        return;
      }
      if (!res.ok) throw new Error(`Flags API error: ${res.status}`);
      const data = (await res.json()) as { flags: FlagMap };
      setFlags(data.flags || {});
    } catch {
      setError("Failed to load flags");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!session) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount (fetch-then-set, not derived state)
    load();
  }, [session, load]);

  const toggle = async (key: string) => {
    const next = !(flags[key] ?? true);
    // Confirm the kill direction — turning AI off affects all users now.
    if (!next && !window.confirm(`Turn OFF "${key}" for everyone immediately?`)) return;
    setToggling(key);
    try {
      const res = await fetch("/api/admin/flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, enabled: next }),
      });
      if (!res.ok) throw new Error(`Flag API error: ${res.status}`);
      setFlags((prev) => ({ ...prev, [key]: next }));
    } catch {
      setError(`Failed to update ${key}`);
    } finally {
      setToggling(null);
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[var(--bg-base)]">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!session) return null;

  const rows = KNOWN_FLAGS.map(({ key, desc }) => ({
    key,
    desc,
    enabled: flags[key] ?? (key === "ai_image_gemini" ? false : true),
  }));

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <div className="flex items-center gap-3">
            <Flag className="w-6 h-6 text-[var(--accent)]" />
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Feature Flags</h1>
              <p className="text-sm text-[var(--text-muted)]">
                Instant-disable without a rebuild. Changes take effect on the next request.
              </p>
            </div>
          </div>
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          <div className="space-y-3">
            {rows.map((row) => (
              <div
                key={row.key}
                className="p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-mono text-sm text-[var(--text-primary)]">{row.key}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{row.desc}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={row.enabled}
                  aria-label={`Toggle ${row.key}`}
                  disabled={toggling === row.key}
                  onClick={() => toggle(row.key)}
                  className={`relative w-12 h-7 rounded-full transition-colors shrink-0 cursor-pointer ${
                    row.enabled ? "bg-emerald-500" : "bg-[var(--bg-overlay)] border border-[var(--border-subtle)]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all flex items-center justify-center ${
                      row.enabled ? "left-[22px]" : "left-0.5"
                    }`}
                  >
                    {toggling === row.key && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" />}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { BarChart3, Shield } from "lucide-react";
import { AdminSidebar } from "../_components/AdminSidebar";
import { AnalyticsSection } from "../_components/AnalyticsSection";

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) setLoading(false);
  }, [session]);

  if (isPending || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[var(--bg-base)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          <p className="text-sm text-[var(--text-muted)]">Loading analytics...</p>
        </div>
      </div>
    );
  }
  if (!session) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-[var(--accent)]" />
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Analytics</h1>
          </div>
          <AnalyticsSection />
        </div>
      </main>
    </div>
  );
}

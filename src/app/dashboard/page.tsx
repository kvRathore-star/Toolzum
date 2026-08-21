"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { CreditCard, Activity, Save, Settings, LogOut, Zap } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[var(--bg-base)]">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="min-h-[90vh] bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header & Greeting */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-[var(--border-subtle)] pb-8">
          <div>
            <h1 className="font-[family-name:var(--font-serif)] text-4xl sm:text-5xl mb-2">
              Welcome back, {session.user.name?.split(" ")[0] || "User"}.
            </h1>
            <p className="text-[var(--text-secondary)] text-lg">
              Here is your workspace overview.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" asChild>
              <Link href="/pricing"><CreditCard className="w-4 h-4 mr-2" /> Upgrade Plan</Link>
            </Button>
            <Button variant="ghost" onClick={handleSignOut} className="text-[var(--danger)] hover:text-white hover:bg-[var(--danger)]">
              <LogOut className="w-4 h-4 mr-2" /> Sign out
            </Button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Credits Card */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--bg-overlay)] flex items-center justify-center text-[var(--accent)]">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-[var(--text-primary)]">AI Credits</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-semibold font-mono tracking-tight text-[var(--text-primary)]">
                {(session.user as { credits?: number }).credits ?? 0}
              </span>
              <span className="text-[var(--text-muted)] text-sm">remaining</span>
            </div>
            <div className="mt-4 w-full bg-[var(--bg-overlay)] rounded-full h-1.5 overflow-hidden">
              <div className="bg-[var(--accent-ink)] h-full w-[30%]" />
            </div>
          </div>

          {/* Activity Card */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--bg-overlay)] flex items-center justify-center text-[var(--success)]">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-[var(--text-primary)]">Tools Used</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-semibold font-mono tracking-tight text-[var(--text-primary)]">42</span>
              <span className="text-[var(--text-muted)] text-sm">this month</span>
            </div>
          </div>

          {/* Plan Card */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-sm)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-overlay)] flex items-center justify-center text-[var(--warning)]">
                  <Save className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-[var(--text-primary)]">Current Plan</h3>
              </div>
              <span className="text-2xl font-semibold capitalize text-[var(--text-primary)]">
                {(session.user as { plan?: string }).plan || "Free Tier"}
              </span>
            </div>
            <Link href="/billing" className="text-sm font-medium text-[var(--accent)] hover:underline mt-4 inline-block">
              Manage subscription →
            </Link>
          </div>
        </div>

        {/* Recent Activity List */}
        <h2 className="text-xl font-medium text-[var(--text-primary)] mb-6">Recent Activity</h2>
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden">
          <div className="divide-y divide-[var(--border-subtle)]">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-[var(--bg-overlay)] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-[var(--accent-ink)]" />
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">Used PDF Compressor</p>
                    <p className="text-[12px] text-[var(--text-muted)]">Saved 4.2 MB on local device</p>
                  </div>
                </div>
                <span className="text-xs text-[var(--text-muted)] font-mono">{i * 2} hours ago</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

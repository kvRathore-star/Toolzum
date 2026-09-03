"use client";

import React from "react";
import { Users, TrendingUp, Shield, Zap, DollarSign, BarChart3, CreditCard, Activity, Target } from "lucide-react";
import type { AdminStats } from "./admin.types";

interface StatsSectionProps {
  stats: AdminStats;
}

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <div className="space-y-6">
      {/* Primary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-blue-500", badge: "ALL", badgeColor: "bg-blue-500/10 text-blue-400" },
          { label: "Active Subs", value: stats.activeSubscribers, icon: Zap, color: "bg-emerald-500", badge: "PRO+SIGNEDIN", badgeColor: "bg-emerald-500/10 text-emerald-400" },
          { label: "Pro Users", value: stats.proUsers, icon: TrendingUp, color: "bg-violet-500", badge: "PAID", badgeColor: "bg-violet-500/10 text-violet-400" },
          { label: "Admins", value: stats.adminUsers, icon: Shield, color: "bg-amber-500", badge: "STAFF", badgeColor: "bg-amber-500/10 text-amber-400" },
        ].map((stat) => (
          <div key={stat.label} className="relative p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
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

      {/* Revenue metrics */}
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

      {/* Growth milestones */}
      <div className="p-5 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-[var(--accent)]" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Growth Milestones</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {([
            { label: "First 100 Users", target: 100, current: stats.totalUsers, color: "bg-blue-500" },
            { label: "10 Pro Subscribers", target: 10, current: stats.proUsers, color: "bg-violet-500" },
            { label: "₹10K MRR", target: 10000, current: stats.mrr, color: "bg-emerald-500" },
            { label: "₹1L ARR", target: 100000, current: stats.arr, color: "bg-amber-500" },
            { label: "₹5L ARR", target: 500000, current: stats.arr, color: "bg-rose-500" },
            { label: "₹10L ARR", target: 1000000, current: stats.arr, color: "bg-red-500" },
          ] as const).map((m) => {
            const pct = Math.min(100, Math.round((m.current / m.target) * 100));
            const reached = m.current >= m.target;
            return (
              <div key={m.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">{m.label}</span>
                  <span className={`text-xs font-medium ${reached ? "text-emerald-400" : "text-[var(--text-muted)]"}`}>
                    {reached ? "Reached" : `${pct}%`}
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
  );
}

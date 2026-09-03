"use client";

import React from "react";
import { Users, TrendingUp, Shield, Zap, DollarSign, BarChart3, CreditCard, Activity, Target } from "lucide-react";
import type { AdminStats } from "./admin.types";

function StatCard({ label, value, icon: Icon, color, badge, badgeColor, delay }: {
  label: string; value: string | number; icon: React.ElementType; color: string;
  badge?: string; badgeColor?: string; delay?: number;
}) {
  return (
    <div
      className="group relative p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] overflow-hidden transition-all duration-300 hover:border-[var(--accent)]/30 hover:shadow-lg hover:shadow-[var(--accent)]/5 hover:-translate-y-0.5"
      style={{ animationDelay: `${delay || 0}ms` }}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 group-hover:w-1.5 ${color}`} />
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-[var(--text-muted)] transition-colors group-hover:text-[var(--accent)]" />
          <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{label}</span>
        </div>
        {badge && <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${badgeColor}`}>{badge}</span>}
      </div>
      <p className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">{typeof value === "number" ? value.toLocaleString() : value}</p>
    </div>
  );
}

function RevenueCard({ label, value, sub, icon: Icon, color, delay }: {
  label: string; value: string; sub: string; icon: React.ElementType; color: string; delay?: number;
}) {
  return (
    <div className="group p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] transition-all duration-300 hover:border-[var(--accent)]/30 hover:shadow-lg hover:shadow-[var(--accent)]/5 hover:-translate-y-0.5" style={{ animationDelay: `${delay || 0}ms` }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 transition-colors group-hover:scale-110 ${color}`} />
        <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-bold text-[var(--text-primary)] tabular-nums">{value}</p>
      <p className="text-xs text-[var(--text-muted)] mt-1">{sub}</p>
    </div>
  );
}

function MilestoneBar({ label, current, target, color }: { label: string; current: number; target: number; color: string }) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  const reached = current >= target;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--text-secondary)]">{label}</span>
        <span className={`text-xs font-medium transition-colors ${reached ? "text-emerald-400" : "text-[var(--text-muted)]"}`}>
          {reached ? "✓ Reached" : `${pct}%`}
        </span>
      </div>
      <div className="h-2 bg-[var(--bg-base)] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
          style={{ width: `${pct}%`, transitionDelay: "300ms" }}
        />
      </div>
      <div className="flex justify-between text-xs text-[var(--text-muted)] tabular-nums">
        <span>{current.toLocaleString()}</span>
        <span>{target.toLocaleString()}</span>
      </div>
    </div>
  );
}

export function StatsSection({ stats }: { stats: AdminStats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers} icon={Users} color="bg-blue-500" badge="ALL" badgeColor="bg-blue-500/10 text-blue-400" delay={0} />
        <StatCard label="Active Subs" value={stats.activeSubscribers} icon={Zap} color="bg-emerald-500" badge="PRO+SIGNEDIN" badgeColor="bg-emerald-500/10 text-emerald-400" delay={50} />
        <StatCard label="Pro Users" value={stats.proUsers} icon={TrendingUp} color="bg-violet-500" badge="PAID" badgeColor="bg-violet-500/10 text-violet-400" delay={100} />
        <StatCard label="Admins" value={stats.adminUsers} icon={Shield} color="bg-amber-500" badge="STAFF" badgeColor="bg-amber-500/10 text-amber-400" delay={150} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <RevenueCard label="MRR" value={`₹${stats.mrr.toLocaleString()}`} sub="Monthly Recurring" icon={DollarSign} color="text-emerald-400" delay={200} />
        <RevenueCard label="ARR" value={`₹${stats.arr.toLocaleString()}`} sub="Annual Recurring" icon={BarChart3} color="text-blue-400" delay={250} />
        <RevenueCard label="Revenue (30d)" value={`₹${stats.revenueLast30Days.toLocaleString()}`} sub={`${stats.paidCountLast30Days} transactions`} icon={CreditCard} color="text-violet-400" delay={300} />
        <RevenueCard label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} sub="All time" icon={TrendingUp} color="text-amber-400" delay={350} />
      </div>

      <div className="p-5 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-[var(--accent)]" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Growth Milestones</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MilestoneBar label="First 100 Users" current={stats.totalUsers} target={100} color="bg-blue-500" />
          <MilestoneBar label="10 Pro Subscribers" current={stats.proUsers} target={10} color="bg-violet-500" />
          <MilestoneBar label="₹10K MRR" current={stats.mrr} target={10000} color="bg-emerald-500" />
          <MilestoneBar label="₹1L ARR" current={stats.arr} target={100000} color="bg-amber-500" />
          <MilestoneBar label="₹5L ARR" current={stats.arr} target={500000} color="bg-rose-500" />
          <MilestoneBar label="₹10L ARR" current={stats.arr} target={1000000} color="bg-red-500" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="group p-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] transition-all duration-300 hover:border-blue-500/30">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Signups (7d)</span>
          </div>
          <p className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{stats.signupsLast7Days.toLocaleString()}</p>
        </div>
        <div className="group p-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] transition-all duration-300 hover:border-emerald-500/30">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Signups (30d)</span>
          </div>
          <p className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{stats.signupsLast30Days.toLocaleString()}</p>
        </div>
        <div className="group p-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] transition-all duration-300 hover:border-violet-500/30">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Page Views (7d)</span>
          </div>
          <p className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{stats.pageViewsLast7Days.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

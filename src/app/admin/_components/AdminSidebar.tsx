"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Users, TrendingUp, Clock, ArrowLeft, Bug, CreditCard, BarChart3, Flag, Bell, Reply } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: TrendingUp },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/waitlist", label: "Waitlist", icon: Bell },
  { href: "/admin/reply", label: "Reply", icon: Reply },
  { href: "/admin/errors", label: "Errors", icon: Bug },
  { href: "/admin/audit", label: "Audit Log", icon: Clock },
  { href: "/admin/flags", label: "Feature Flags", icon: Flag },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-56 border-r border-[var(--border-subtle)] p-4 flex-col gap-2 shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Admin</div>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all duration-200 flex items-center gap-2 ${
                active
                  ? "bg-[var(--accent)] text-white font-medium shadow-lg shadow-[var(--accent)]/20"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
      <Link href="/" className="mt-auto flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Toolzum
      </Link>
    </aside>
  );
}

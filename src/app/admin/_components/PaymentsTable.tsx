"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, CreditCard, ChevronLeft, ChevronRight } from "lucide-react";
import type { PlatformPayment } from "./admin.types";

export function PaymentsTable() {
  const [payments, setPayments] = useState<PlatformPayment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const prevDeps = useRef({ page, search, statusFilter });

  useEffect(() => {
    const changed = prevDeps.current.page !== page || prevDeps.current.search !== search || prevDeps.current.statusFilter !== statusFilter;
    prevDeps.current = { page, search, statusFilter };
    if (changed) setLoading(true);
    let cancelled = false;
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/admin/payments?${params}`)
      .then(async (r) => r.ok ? (await r.json()) as { payments?: PlatformPayment[]; total?: number; error?: string } : null)
      .then((data) => {
        if (cancelled || !data) return;
        setPayments(data.payments || []);
        setTotal(data.total || 0);
        setTotalPages(Math.max(1, Math.ceil((data.total || 0) / 20)));
        if (data.error) setLoadError(data.error);
      })
      .catch(() => setLoadError("Failed to fetch payments"))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, search, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const statusStyles: Record<string, string> = {
    paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    refunded: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  };

  return (
    <div id="payments" className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2"><CreditCard className="w-5 h-5" /> Payments</h2>
        <div className="flex gap-2 items-center flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            aria-label="Filter by status"
            className="px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] cursor-pointer focus:ring-2 focus:ring-[var(--accent)]/50 transition-all duration-200"
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search name, email, or order ID..."
                className="pl-9 pr-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all duration-200"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:opacity-90 active:scale-95 transition-all duration-200 cursor-pointer">Search</button>
          </form>
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center" role="status" aria-live="polite">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin mx-auto" />
            <p className="text-sm text-[var(--text-muted)] mt-3">Loading payments...</p>
          </div>
        ) : loadError ? (
          <div className="p-12 text-center">
            <CreditCard className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-sm text-[var(--text-secondary)] mb-1">Payments data unavailable</p>
            <p className="text-xs text-[var(--text-muted)]">{loadError}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">User</th>
                  <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">Gateway</th>
                  <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">Order ID</th>
                  <th className="text-right px-4 py-3 text-[var(--text-muted)] font-medium">Amount</th>
                  <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-elevated)] transition-colors duration-150">
                    <td className="px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-[var(--text-primary)] font-medium truncate">{p.userName || "Unknown"}</p>
                        <p className="text-xs text-[var(--text-muted)] truncate">{p.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)] capitalize">{p.gateway}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-[var(--text-muted)] max-w-[120px] block truncate">{p.orderId}</span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium text-[var(--text-primary)]">{p.amount} {p.currency}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusStyles[p.status] || statusStyles.pending}`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)] text-xs tabular-nums">{new Date(p.createdAt * 1000).toLocaleDateString()}</td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-[var(--text-muted)]">No payments found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-muted)] tabular-nums">Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 hover:border-[var(--accent)]/30 active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
            <span className="px-3 py-2 text-sm text-[var(--text-secondary)] tabular-nums">{page} / {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 hover:border-[var(--accent)]/30 active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}

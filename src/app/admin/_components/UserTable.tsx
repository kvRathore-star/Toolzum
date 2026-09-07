"use client";

import React, { forwardRef } from "react";
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import type { User } from "./admin.types";
import { relativeTime } from "./admin.utils";
import { buttonKeyDown, buttonKeyUp } from "@/components/buttonKeys";

interface UserTableProps {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
  search: string;
  selectedIds: Set<string>;
  updatingRole: string | null;
  onSearch: (e: React.FormEvent) => void;
  onSearchChange: (value: string) => void;
  onExportCSV: () => void;
  onExportAllCSV: () => void;
  onPageChange: (page: number) => void;
  onSelectAll: () => void;
  onSelectUser: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onRoleSelect: (userId: string, name: string, email: string, oldRole: string, newRole: string) => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
}

function StatusBadge({ value }: { value: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    banned: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    user: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    pro: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    signedin: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    free: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  };
  return (
    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${styles[value] || styles.user}`}>
      {value}
    </span>
  );
}

export const UserTable = forwardRef<HTMLDivElement, UserTableProps>(function UserTable(
  { users, total, page, totalPages, search, selectedIds, updatingRole,
    onSearch, onSearchChange, onExportCSV, onExportAllCSV, onPageChange, onSelectAll,
    onSelectUser, onToggleSelect, onRoleSelect, searchRef },
  ref,
) {
  return (
    <div ref={ref} id="users" className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Users</h2>
        <div className="flex gap-2 items-center">
          <button onClick={onExportCSV} className="px-3 py-2 border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-all duration-200 cursor-pointer flex items-center gap-1.5 hover:border-[var(--accent)]/30">
            <Download className="w-4 h-4" /> Export Page
          </button>
          <button onClick={onExportAllCSV} className="px-3 py-2 border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-all duration-200 cursor-pointer flex items-center gap-1.5 hover:border-[var(--accent)]/30">
            <Download className="w-4 h-4" /> Export All
          </button>
          <form onSubmit={onSearch} className="flex gap-2">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" />
              <input ref={searchRef} type="text" value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search name or email... ( / )" className="pl-9 pr-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all duration-200" />
            </div>
            <button type="submit" className="px-4 py-2 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:opacity-90 active:scale-95 transition-all duration-200 cursor-pointer">Search</button>
          </form>
        </div>
      </div>
      <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="text-left px-4 py-3 w-10">
                  <input type="checkbox" checked={selectedIds.size === users.length && users.length > 0} onChange={onSelectAll} className="rounded cursor-pointer accent-[var(--accent)]" />
                </th>
                <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">User</th>
                <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">Email</th>
                <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">Status</th>
                <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">Role</th>
                <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">Plan</th>
                <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">Credits</th>
                <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">Last Active</th>
                <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">Joined</th>
                <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-elevated)] transition-colors duration-150 cursor-pointer"
                  onClick={() => onSelectUser(user.id)}
                  tabIndex={0}
                  aria-label={`Open details for ${user.name}`}
                  onKeyDown={(e) => buttonKeyDown(e, () => onSelectUser(user.id))}
                  onKeyUp={(e) => buttonKeyUp(e, () => onSelectUser(user.id))}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(user.id)}
                      onChange={() => onToggleSelect(user.id)}
                      className="rounded cursor-pointer accent-[var(--accent)]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <Image src={user.image} alt="" width={32} height={32} className="w-8 h-8 rounded-full ring-2 ring-[var(--border-subtle)]" unoptimized />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs font-bold ring-2 ring-[var(--accent)]/20">{user.name.charAt(0).toUpperCase()}</div>
                      )}
                      <span className="text-[var(--text-primary)] font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{user.email}</td>
                  <td className="px-4 py-3"><StatusBadge value={user.status} /></td>
                  <td className="px-4 py-3"><StatusBadge value={user.role} /></td>
                  <td className="px-4 py-3"><StatusBadge value={user.plan} /></td>
                  <td className="px-4 py-3 text-[var(--text-secondary)] text-xs tabular-nums">{user.credits}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)] text-xs tabular-nums">{relativeTime(user.lastLoginAt)}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)] text-xs tabular-nums">{new Date(user.createdAt * 1000).toLocaleDateString()}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={user.role}
                      onChange={(e) => onRoleSelect(user.id, user.name, user.email, user.role, e.target.value)}
                      disabled={updatingRole === user.id}
                      className="px-2 py-1 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] cursor-pointer disabled:opacity-50 focus:ring-2 focus:ring-[var(--accent)]/50 transition-all duration-200"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-12 text-center text-[var(--text-muted)]">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-muted)] tabular-nums">Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}</span>
          <div className="flex gap-2">
            <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className="p-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 hover:border-[var(--accent)]/30 active:scale-95"><ChevronLeft className="w-4 h-4" /></button>
            <span className="px-3 py-2 text-sm text-[var(--text-secondary)] tabular-nums">{page} / {totalPages}</span>
            <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 hover:border-[var(--accent)]/30 active:scale-95"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
});

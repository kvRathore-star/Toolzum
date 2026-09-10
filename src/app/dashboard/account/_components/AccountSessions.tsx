"use client";

import { Shield, Loader2, Monitor, Smartphone, Globe } from "lucide-react";

export interface Session {
  id: string;
  token: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
}

function parseUserAgent(ua?: string): { device: string; browser: string } {
  if (!ua) return { device: "Unknown device", browser: "Unknown browser" };
  let device = "Desktop";
  if (/mobile|android|iphone/i.test(ua)) device = "Mobile";
  else if (/tablet|ipad/i.test(ua)) device = "Tablet";

  let browser = "Unknown";
  if (/chrome/i.test(ua) && !/edge|opr/i.test(ua)) browser = "Chrome";
  else if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/edge/i.test(ua)) browser = "Edge";
  else if (/curl/i.test(ua)) browser = "CLI";

  return { device, browser };
}

interface AccountSessionsProps {
  sessions: Session[];
  sessionsLoading: boolean;
  revokingToken: string | null;
  revokeSession: (token: string) => Promise<void>;
}

export function AccountSessions({ sessions, sessionsLoading, revokingToken, revokeSession }: AccountSessionsProps) {
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-8 shadow-[var(--shadow-sm)] mb-8">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
        <Shield className="w-5 h-5 text-[var(--success)]" />
        Active Sessions
      </h2>
      {sessionsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-[var(--accent)] animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">No active sessions found.</p>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const { device, browser } = parseUserAgent(session.userAgent);
            const isCurrent = session.token === (session as unknown as { token: string }).token;
            const icon = /mobile|android|iphone/i.test(session.userAgent || "") ? Smartphone : /curl|cli/i.test(session.userAgent || "") ? Globe : Monitor;
            const Icon = icon;
            return (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-md)]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-surface)] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[var(--text-muted)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {browser} on {device}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {session.ipAddress || "Unknown IP"} · Started {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => revokeSession(session.token)}
                  disabled={revokingToken === session.token}
                  className="text-xs text-[var(--danger)] hover:bg-[var(--danger)]/10 px-3 py-1.5 rounded-md transition-colors shrink-0 disabled:opacity-50"
                >
                  {revokingToken === session.token ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    "Revoke"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

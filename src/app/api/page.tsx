"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Globe,
  Copy,
  Check,
  Key,
  Trash2,
  Plus,
  Terminal,
  Shield,
  Zap,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import type { SessionUser } from "@/types/tool";

interface ApiKeyInfo {
  id: string;
  name: string;
  plan: string;
  prefix: string;
  requestsUsed: number;
  requestsLimit: number;
  createdAt: number;
  revokedAt: number | null;
}

export default function ApiDocsPage() {
  const { data: session, isPending: authLoading } = useSession();
  const sessionUser = session?.user as unknown as SessionUser | undefined;
  const userId = sessionUser?.id;
  const userPlan = sessionUser?.plan || "free";

  const [keys, setKeys] = useState<ApiKeyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [keyName, setKeyName] = useState("");

  const apiBase = process.env.NEXT_PUBLIC_APP_URL || "";

  const fetchKeys = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/keys`, {
        headers: { "x-user-id": userId },
      });
      if (res.ok) {
        const data: { keys?: ApiKeyInfo[] } = await res.json();
        setKeys(data.keys || []);
      }
    } catch { }
    setLoading(false);
  }, [userId, apiBase]);

  useEffect(() => {
    if (userId) fetchKeys();
    else setLoading(false);
  }, [userId, fetchKeys]);

  const handleCreateKey = async () => {
    if (!userId) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/api/v1/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify({ name: keyName || "My API Key" }),
      });
      const data: { key?: string; error?: string } = await res.json();
      if (res.ok) {
        setNewKey(data.key || null);
        setKeyName("");
        await fetchKeys();
      } else {
        setError(data.error || "Failed to create key");
      }
    } catch {
      setError("Network error");
    }
    setCreating(false);
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!userId) return;
    try {
      await fetch(`${apiBase}/api/v1/keys/${keyId}`, {
        method: "DELETE",
        headers: { "x-user-id": userId },
      });
      setKeys(prev => prev.map(k => k.id === keyId ? { ...k, revokedAt: Date.now() } : k));
    } catch { }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const maxKeys = userPlan === "pro" ? 10 : 2;
  const activeKeys = keys.filter(k => !k.revokedAt);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="absolute inset-0 z-0 flex justify-center pointer-events-none opacity-[0.03]">
        <div className="w-full max-w-[1280px] h-full" style={{ backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto pt-32 pb-24 px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--accent)] mb-6">
            <Terminal className="w-3.5 h-3.5" /> Proxy API
          </div>
          <h1 className="font-[family-name:var(--font-serif)] text-5xl sm:text-7xl mb-6 tracking-tight leading-tight">
            URL Fetch API
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)]">
            Fetch any URL server-side. Bypass CORS, avoid rate limits, pipe remote content into your application. One endpoint, one header, unlimited possibilities.
          </p>
        </div>

        {/* Endpoint Reference */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-6 sm:p-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[var(--accent)]" /> Endpoint
            </h2>
            <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-4 font-mono text-sm">
              <span className="text-[var(--accent)] font-bold">GET</span>{" "}
              <span className="text-[var(--text-primary)]">/api/proxy-url?url=</span>
              <span className="text-[var(--text-muted)]">{"<encoded-remote-url>"}</span>
            </div>

            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-semibold">Authentication</h3>
              <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-4 font-mono text-sm">
                <span className="text-[var(--text-muted)]">Authorization: Bearer </span>
                <span className="text-[var(--accent)]">th_live_</span>
                <span className="text-[var(--text-muted)]">{"<your-api-key>"}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">Get your API key below. Pass it as a Bearer token in the Authorization header.</p>
            </div>

            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-semibold">Code Examples</h3>

              <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-4 font-mono text-xs text-[var(--text-secondary)] overflow-x-auto">
                <pre className="leading-relaxed">curl -X GET "https://gotoolhub.com/api/proxy-url?url=https://example.com/file.pdf" \
  -H "Authorization: Bearer th_live_your_key_here" \
  --output file.pdf</pre>
              </div>

              <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-4 font-mono text-xs text-[var(--text-secondary)] overflow-x-auto">
                <pre className="leading-relaxed">{`const res = await fetch("/api/proxy-url?url=" + encodeURIComponent("https://example.com/file.pdf"), {
  headers: { "Authorization": "Bearer th_live_your_key_here" }
});
const blob = await res.blob();`}</pre>
              </div>

              <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-4 font-mono text-xs text-[var(--text-secondary)] overflow-x-auto">
                <pre className="leading-relaxed">{`import requests
url = "https://gotoolhub.com/api/proxy-url"
params = {"url": "https://example.com/file.pdf"}
headers = {"Authorization": "Bearer th_live_your_key_here"}
response = requests.get(url, params=params, headers=headers)`}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Key Management */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-center">Your API Keys</h2>

          {authLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-[var(--text-muted)]" />
            </div>
          ) : !userId ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-8 text-center">
              <Key className="w-8 h-8 mx-auto mb-3 text-[var(--text-muted)]" />
              <p className="text-sm text-[var(--text-secondary)] mb-4">Sign in to create and manage API keys.</p>
              <Button onClick={() => window.location.href = "/sign-in"}>Sign In</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Create Key Form */}
              <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {activeKeys.length} / {maxKeys} active keys
                    </p>
                  </div>
                </div>

                {activeKeys.length < maxKeys && (
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                      placeholder="Key name (optional)"
                      className="flex-1 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    />
                    <Button onClick={handleCreateKey} disabled={creating} className="gap-2 shrink-0">
                      {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      Create Key
                    </Button>
                  </div>
                )}

                {error && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-red-400">
                    <AlertCircle className="w-3.5 h-3.5" /> {error}
                  </div>
                )}
              </div>

              {/* New Key Toast */}
              {newKey && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-[var(--radius-xl)] p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-amber-300 mb-1">Key created — copy it now</p>
                      <p className="text-xs text-amber-400/70 mb-2">You won't be able to see it again.</p>
                      <div className="flex items-center gap-2 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-3 py-2 font-mono text-xs">
                        <span className="truncate text-[var(--text-primary)]">{newKey}</span>
                        <button onClick={() => handleCopy(newKey, "new-key")} className="p-1 rounded hover:bg-[var(--bg-base)] text-[var(--text-muted)] hover:text-white shrink-0">
                          {copied === "new-key" ? <Check className="w-3.5 h-3.5 text-[var(--success)]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <button onClick={() => setNewKey(null)} className="text-[var(--text-muted)] hover:text-white shrink-0">&times;</button>
                  </div>
                </div>
              )}

              {/* Key List */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-[var(--text-muted)]" />
                </div>
              ) : keys.length === 0 ? (
                <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-8 text-center">
                  <Key className="w-8 h-8 mx-auto mb-3 text-[var(--text-muted)]" />
                  <p className="text-sm text-[var(--text-secondary)]">No API keys yet. Create one above.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {keys.map((key) => (
                    <div key={key.id} className={`bg-[var(--bg-elevated)] border ${key.revokedAt ? "border-red-500/20 opacity-60" : "border-[var(--border-subtle)]"} rounded-[var(--radius-xl)] p-4`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{key.name}</span>
                            {key.revokedAt ? (
                              <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">Revoked</span>
                            ) : (
                              <span className="text-[10px] text-[var(--accent)] bg-[var(--accent)]/10 px-1.5 py-0.5 rounded">Active</span>
                            )}
                          </div>
                          <div className="font-mono text-xs text-[var(--text-muted)]">
                            th_live_{key.prefix}...
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                            <span>{key.requestsUsed} / {key.requestsLimit} requests used</span>
                            <span>Plan: {key.plan}</span>
                          </div>
                          {/* Usage bar */}
                          <div className="mt-2 w-full h-1.5 bg-[var(--bg-base)] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, (key.requestsUsed / key.requestsLimit) * 100)}%`,
                                backgroundColor: key.requestsUsed / key.requestsLimit > 0.8 ? "rgb(239 68 68)" : "var(--accent)",
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {!key.revokedAt && (
                            <button
                              onClick={() => handleRevokeKey(key.id)}
                              className="p-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Revoke key"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Limits & Info */}
        <div className="max-w-3xl mx-auto mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
              <Globe className="w-5 h-5 text-[var(--accent)] mb-3" />
              <h4 className="text-sm font-semibold mb-1">Any URL</h4>
              <p className="text-xs text-[var(--text-secondary)]">HTTP/HTTPS only. Internal/private IPs are blocked for security.</p>
            </div>
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
              <Zap className="w-5 h-5 text-[var(--accent)] mb-3" />
              <h4 className="text-sm font-semibold mb-1">Edge Cached</h4>
              <p className="text-xs text-[var(--text-secondary)]">Responses are cached at the edge for 5 minutes. Repeated requests are fast.</p>
            </div>
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
              <Shield className="w-5 h-5 text-[var(--accent)] mb-3" />
              <h4 className="text-sm font-semibold mb-1">No Logging</h4>
              <p className="text-xs text-[var(--text-secondary)]">We proxy your request and stream the response. Nothing is stored permanently.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Mail, ArrowRight, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Turnstile } from "@marsidev/react-turnstile";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) {
      toast.error("Please complete the verification");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forget-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-captcha-response": turnstileToken,
        },
        body: JSON.stringify({
          email,
          redirectTo: "/reset-password",
        }),
      });
      const data = (await res.json()) as { error?: { message?: string } };
      if (data.error) {
        toast.error(data.error.message || "Failed to send reset email");
      } else {
        setSent(true);
        toast.success("Reset email sent! Check your inbox.");
      }
    } catch {
      toast.error("Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] relative overflow-hidden flex items-center justify-center">
      <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-[var(--accent-ink)]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-1/4 w-[600px] h-[600px] bg-[var(--success)]/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="absolute inset-0 z-0 flex justify-center pointer-events-none opacity-[0.03]">
        <div
          className="w-full max-w-[1280px] h-full"
          style={{
            backgroundImage:
              "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[420px] px-4">
        <div
          className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-8 sm:p-10"
          style={{ borderRadius: "var(--radius-xl)" }}
        >
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-12 h-12 bg-[var(--accent-ink)]/10 mb-5"
              style={{ borderRadius: "var(--radius-lg)" }}
            >
              <KeyRound className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <h1 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl tracking-tight mb-2">
              Forgot Password
            </h1>
            <p className="text-[var(--text-secondary)] text-sm">
              Enter your email to receive a reset link
            </p>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="bg-[var(--success)]/10 border border-[var(--success)]/20 p-4" style={{ borderRadius: "var(--radius-md)" }}>
                <p className="text-sm text-[var(--success)]">
                  Reset email sent to <strong>{email}</strong>. Check your inbox and follow the link.
                </p>
              </div>
              <Button
                variant="secondary"
                size="md"
                className="w-full"
                onClick={() => setSent(false)}
              >
                Send another email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-medium text-[var(--text-secondary)] tracking-wide uppercase"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-all duration-150 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] pl-10 pr-4 h-11 text-sm"
                    style={{ borderRadius: "var(--radius-md)" }}
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                />
              </div>

              <Button type="submit" variant="primary" size="md" className="w-full gap-2" disabled={loading || !turnstileToken}>
                {loading ? "Sending..." : "Send Reset Link"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </Button>
            </form>
          )}

          <p className="text-center text-xs text-[var(--text-muted)] mt-6">
            Remember your password?{" "}
            <Link
              href="/sign-in/"
              className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

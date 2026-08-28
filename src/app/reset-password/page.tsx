"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-[var(--danger)]/10 border border-[var(--danger)]/20 p-4" style={{ borderRadius: "var(--radius-md)" }}>
          <p className="text-sm text-[var(--danger)]">
            Invalid or missing reset token. Please request a new reset link.
          </p>
        </div>
        <Link
          href="/forgot-password/"
          className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors font-medium"
        >
          Request new reset link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password, token }),
      });
      const data = (await res.json()) as { error?: { message?: string } };
      if (data.error) {
        toast.error(data.error.message || "Failed to reset password");
      } else {
        setDone(true);
        toast.success("Password reset successfully!");
      }
    } catch {
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-[var(--success)]/10 border border-[var(--success)]/20 p-4 flex items-center gap-3" style={{ borderRadius: "var(--radius-md)" }}>
          <CheckCircle className="w-5 h-5 text-[var(--success)] shrink-0" />
          <p className="text-sm text-[var(--success)]">
            Your password has been reset successfully.
          </p>
        </div>
        <Link href="/sign-in/">
          <Button variant="primary" size="md" className="w-full">
            Sign in with new password
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="text-xs font-medium text-[var(--text-secondary)] tracking-wide uppercase"
        >
          New Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            required
            minLength={8}
            className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-all duration-150 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] pl-10 pr-10 h-11 text-sm"
            style={{ borderRadius: "var(--radius-md)" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="confirmPassword"
          className="text-xs font-medium text-[var(--text-secondary)] tracking-wide uppercase"
        >
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            autoComplete="new-password"
            required
            minLength={8}
            className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-all duration-150 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] pl-10 pr-4 h-11 text-sm"
            style={{ borderRadius: "var(--radius-md)" }}
          />
        </div>
      </div>

      <Button type="submit" variant="primary" size="md" className="w-full gap-2" disabled={loading}>
        {loading ? "Resetting..." : "Reset Password"}
        {!loading && <ArrowRight className="w-4 h-4" />}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
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
              <Lock className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <h1 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl tracking-tight mb-2">
              Reset Password
            </h1>
            <p className="text-[var(--text-secondary)] text-sm">
              Enter your new password below
            </p>
          </div>

          <Suspense fallback={<div className="text-center text-sm text-[var(--text-muted)]">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>

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

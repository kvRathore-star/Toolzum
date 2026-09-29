"use client";

import { useState, useCallback } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Globe,
  ArrowRight,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signUp, signIn } from "@/lib/auth-client";
import { Turnstile } from "@marsidev/react-turnstile";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // Guard against double-clicks: each click issues a fresh OAuth state and
  // overwrites the previous state cookie, so a second click guarantees the
  // first flow fails with state_mismatch.
  const [socialLoading, setSocialLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

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
    if (!turnstileToken) {
      toast.error("Please complete the verification");
      return;
    }
    setLoading(true);
    try {
      const result = await signUp.email(
        { name, email, password },
        { headers: { "x-captcha-response": turnstileToken } }
      );
      if (result.error) {
        toast.error(result.error.message || "Failed to create account");
      } else {
        toast.success("Account created! Check your email for a verification link.");
        window.location.href = "/dashboard";
      }
    } catch {
      toast.error("Failed to create account. Please try again.");
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
              <UserPlus className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <h1 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl tracking-tight mb-2">
              Create Account
            </h1>
            <p className="text-[var(--text-secondary)] text-sm">
              Sign up for a free account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="text-xs font-medium text-[var(--text-secondary)] tracking-wide uppercase"
              >
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  required
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-all duration-150 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] pl-10 pr-4 h-11 text-sm"
                  style={{ borderRadius: "var(--radius-md)" }}
                />
              </div>
            </div>

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

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-medium text-[var(--text-secondary)] tracking-wide uppercase"
              >
                Password
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
                <button aria-label={showPassword ? "Hide password" : "Show password"}
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

            <div className="flex justify-center">
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                onSuccess={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken(null)}
              />
            </div>

            <Button type="submit" variant="primary" size="md" className="w-full gap-2" disabled={loading || !turnstileToken}>
              {loading ? "Creating account..." : "Create Account"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[var(--border-subtle)]" />
            <span className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wide">
              or continue with
            </span>
            <div className="flex-1 h-px bg-[var(--border-subtle)]" />
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              aria-label="Sign up with Google"
              onClick={() => {
                if (socialLoading) return;
                setSocialLoading(true);
                signIn.social({ provider: "google", callbackURL: "/dashboard" });
              }}
              disabled={socialLoading}
              className="w-full flex items-center justify-center gap-2.5 h-11 text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-overlay)] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] transition-all duration-150"
              style={{ borderRadius: "var(--radius-md)" }}
            >
              <Globe className="w-4 h-4" />
              Sign up with Google
            </button>
          </div>

          <p className="text-center text-xs text-[var(--text-muted)] mt-6">
            Already have an account?{" "}
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

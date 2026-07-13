"use client";

import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Globe,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        toast.error(result.error.message || "Invalid credentials");
      } else {
        toast.success("Signed in successfully");
        window.location.href = "/dashboard";
      }
    } catch {
      toast.error("Failed to sign in. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] relative overflow-hidden flex items-center justify-center">
      {/* Ambient glow */}
      <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-[var(--accent)]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-1/4 w-[600px] h-[600px] bg-[var(--success)]/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Grid background */}
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
        {/* Card */}
        <div
          className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-8 sm:p-10"
          style={{ borderRadius: "var(--radius-xl)" }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-12 h-12 bg-[var(--accent)]/10 mb-5"
              style={{ borderRadius: "var(--radius-lg)" }}
            >
              <LogIn className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <h1 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl tracking-tight mb-2">
              Welcome Back
            </h1>
            <p className="text-[var(--text-secondary)] text-sm">
              Sign in to access your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
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
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-all duration-150 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] pl-10 pr-4 h-11 text-sm"
                  style={{ borderRadius: "var(--radius-md)" }}
                />
              </div>
            </div>

            {/* Password */}
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
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-all duration-150 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] pl-10 pr-10 h-11 text-sm"
                  style={{ borderRadius: "var(--radius-md)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button type="submit" variant="primary" size="md" className="w-full gap-2" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[var(--border-subtle)]" />
            <span className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wide">
              or continue with
            </span>
            <div className="flex-1 h-px bg-[var(--border-subtle)]" />
          </div>

          {/* Social buttons */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              aria-label="Sign in with Google"
              onClick={() => signIn.social({ provider: "google" })}
              className="w-full flex items-center justify-center gap-2.5 h-11 text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-overlay)] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] transition-all duration-150"
              style={{ borderRadius: "var(--radius-md)" }}
            >
              <Globe className="w-4 h-4" />
              Sign in with Google
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-[var(--text-muted)] mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-in"
              className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors font-medium"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

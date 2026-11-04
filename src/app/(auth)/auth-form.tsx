"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

export default function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL query params
  const rawNext = searchParams.get("next") || "/dashboard";
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") && !rawNext.includes("\\")
      ? rawNext
      : "/dashboard";

  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(urlError || null);

  // Email format validation helper
  function isValidEmail(val: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError(null);
    setMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    // 1. Validation
    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter to confirm.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === "signup") {
        const redirectOrigin =
          typeof window !== "undefined" ? window.location.origin : "";
        const emailRedirectTo = `${redirectOrigin}/auth/callback?next=${encodeURIComponent(
          next
        )}`;

        const { data, error: signupError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo,
          },
        });

        if (signupError) {
          // Provide friendly user feedback while preventing account enumeration leakage
          if (
            signupError.message.toLowerCase().includes("already registered") ||
            signupError.message.toLowerCase().includes("user already exists")
          ) {
            setError(
              "An account with this email already exists. Please log in instead or reset your password."
            );
          } else {
            setError(signupError.message || "Failed to create account. Please try again.");
          }
          return;
        }

        // If session was granted immediately (email confirmation disabled in Supabase)
        if (data.session) {
          router.replace(next);
          router.refresh();
        } else {
          // Email confirmation is required
          setMessage(
            "Account created successfully! ✨ We've sent a confirmation link to your email. Please check your inbox (and spam folder) to activate your account before logging in."
          );
          setEmail("");
          setPassword("");
          setConfirmPassword("");
        }
      } else {
        // Login mode
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (loginError) {
          if (
            loginError.message.toLowerCase().includes("invalid login credentials") ||
            loginError.message.toLowerCase().includes("invalid_grant")
          ) {
            setError("Incorrect email or password. Please double-check and try again.");
          } else if (loginError.message.toLowerCase().includes("email not confirmed")) {
            setError(
              "Your email address has not been confirmed yet. Please check your inbox for the verification link."
            );
          } else {
            setError(loginError.message || "Unable to log in. Please try again.");
          }
          return;
        }

        router.replace(next);
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="w-full space-y-4" noValidate>
        {/* Error notification banner */}
        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-rounded leading-relaxed shadow-xs flex items-start gap-2.5 animate-fadeIn"
          >
            <span className="text-base shrink-0">⚠️</span>
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* Success / Status message banner */}
        {message && (
          <div
            role="status"
            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-rounded leading-relaxed shadow-xs flex items-start gap-2.5 animate-fadeIn"
          >
            <span className="text-base shrink-0">💌</span>
            <div className="flex-1">{message}</div>
          </div>
        )}

        {/* Email field */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-rounded font-bold uppercase tracking-wider text-[var(--text-primary)] mb-1.5"
          >
            Email Address
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[var(--border-subtle)] bg-white/90 text-sm font-rounded text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--pink-primary)] focus:border-transparent transition-all shadow-xs disabled:opacity-60"
              placeholder="you@example.com"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)] pointer-events-none">
              ✉️
            </span>
          </div>
        </div>

        {/* Password field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-rounded font-bold uppercase tracking-wider text-[var(--text-primary)]"
            >
              Password
            </label>
            {mode === "login" && (
              <span className="text-[11px] font-rounded text-[var(--text-muted)]">
                Min. 8 characters
              </span>
            )}
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              minLength={8}
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-11 rounded-2xl border border-[var(--border-subtle)] bg-white/90 text-sm font-rounded text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--pink-primary)] focus:border-transparent transition-all shadow-xs disabled:opacity-60"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer select-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {/* Confirm Password field (signup mode only) */}
        {mode === "signup" && (
          <div className="animate-fadeIn">
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-rounded font-bold uppercase tracking-wider text-[var(--text-primary)] mb-1.5"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                autoComplete="new-password"
                minLength={8}
                required
                disabled={loading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 pr-11 rounded-2xl border border-[var(--border-subtle)] bg-white/90 text-sm font-rounded text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--pink-primary)] focus:border-transparent transition-all shadow-xs disabled:opacity-60"
                placeholder="Re-type your password"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)] pointer-events-none">
                🔒
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white font-rounded font-bold text-sm sm:text-base shadow-lg shadow-pink-300/40 hover:shadow-xl hover:shadow-pink-300/50 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100 cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <span className="animate-spin text-base">⏳</span>
              <span>Please wait...</span>
            </>
          ) : (
            <>
              <span>{mode === "signup" ? "Create Free Account" : "Log In"}</span>
              <span className="text-base">♡</span>
            </>
          )}
        </button>
      </form>

      {/* Switch between login & signup */}
      <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] text-center">
        {mode === "signup" ? (
          <p className="text-xs sm:text-sm font-rounded text-[var(--text-secondary)]">
            Already have an account?{" "}
            <Link
              href={`/login${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="font-bold text-[var(--pink-strong)] hover:underline inline-flex items-center gap-1"
            >
              Log in here →
            </Link>
          </p>
        ) : (
          <p className="text-xs sm:text-sm font-rounded text-[var(--text-secondary)]">
            Don&apos;t have an account yet?{" "}
            <Link
              href={`/signup${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="font-bold text-[var(--pink-strong)] hover:underline inline-flex items-center gap-1"
            >
              Create one for free →
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

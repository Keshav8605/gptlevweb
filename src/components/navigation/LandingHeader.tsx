"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function LandingHeader() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    // Check active auth session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (mounted) {
        setUser(user);
        setLoading(false);
      }
    });

    // Listen to real-time auth state transitions
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error("[LandingHeader] Sign out error:", err);
    } finally {
      setLoggingOut(false);
      router.replace("/");
      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-md border-b border-[var(--border-subtle)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="text-2xl sm:text-3xl animate-bounce-soft">💌</span>
          <div className="flex flex-col">
            <span className="font-rounded font-bold text-lg sm:text-2xl text-[var(--romantic-plum)] tracking-tight">
              A Little World <span className="text-[var(--pink-strong)]">♡</span>
            </span>
            <span className="hidden sm:inline-block font-handwritten text-xs sm:text-sm text-[var(--text-secondary)] -mt-1">
              For you &amp; your favorite person
            </span>
          </div>
        </Link>

        {/* Action Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Create your gift button */}
          <Link
            href="/create"
            className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white text-xs sm:text-sm font-rounded font-bold shadow-md shadow-pink-200/60 hover:opacity-95 hover:shadow-lg transition-all active:scale-[0.98] flex items-center gap-1.5"
          >
            <span>✨</span>
            <span>Create your gift</span>
          </Link>

          {/* Conditional Auth Navigation: Log in / Sign up vs Dashboard / Log out */}
          {!loading && (
            <>
              {user ? (
                // When creator IS signed in
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <Link
                    href="/dashboard"
                    className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border border-[var(--border-subtle)] bg-white/90 text-xs sm:text-sm font-rounded font-bold text-[var(--romantic-plum)] hover:bg-pink-50 hover:border-pink-200 transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <span>🌸</span>
                    <span>Dashboard</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border border-[var(--border-subtle)] bg-white/90 text-xs sm:text-sm font-rounded font-bold text-[var(--pink-strong)] hover:bg-rose-50 hover:border-rose-200 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span>👋</span>
                    <span>{loggingOut ? "Signing out..." : "Log out"}</span>
                  </button>
                </div>
              ) : (
                // When NO creator is signed in
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <Link
                    href="/login"
                    className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border border-[var(--border-subtle)] bg-white/90 text-xs sm:text-sm font-rounded font-bold text-[var(--romantic-plum)] hover:bg-rose-50 hover:border-rose-200 transition-all shadow-xs"
                  >
                    Log in
                  </Link>

                  <Link
                    href="/signup"
                    className="px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-full border border-pink-200 bg-pink-50 text-xs sm:text-sm font-rounded font-bold text-[var(--pink-strong)] hover:bg-pink-100 hover:border-pink-300 transition-all shadow-xs"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}


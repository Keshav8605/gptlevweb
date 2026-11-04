import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";

export const metadata = {
  title: "Creator Dashboard · My Stories ♡",
  description: "Manage your personalized romantic gift websites, customize stories, and track surprises.",
};

async function AuthenticatedDashboard() {
  const supabase = await createClient();

  // Strict server-side verification using verified JWT claims
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/login");
  }

  const claims = data.claims;
  const email = typeof claims.email === "string" ? claims.email : "Creator";

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFF0F5] via-[#FFE0EA]/30 to-[#FFF0F5] px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top bar with breadcrumb & Logout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-rounded font-bold text-[var(--pink-strong)] bg-pink-50 px-3 py-1 rounded-full border border-pink-200 mb-2">
              <span>🌸</span>
              <span>Creator Sanctuary</span>
            </div>
            <h1 className="font-rounded font-bold text-2xl sm:text-3xl text-[var(--romantic-plum)]">
              Welcome to Your Dashboard
            </h1>
            <p className="text-xs sm:text-sm font-rounded text-[var(--text-secondary)] mt-0.5">
              Logged in as <span className="font-bold text-[var(--romantic-plum)]">{email}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-full border border-[var(--border-subtle)] bg-white text-xs font-rounded font-semibold text-[var(--text-secondary)] hover:text-[var(--romantic-plum)] transition-colors"
            >
              Home
            </Link>
            <LogoutButton />
          </div>
        </div>

        {/* Status card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-[var(--border-subtle)] shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">✨</span>
            <div>
              <h2 className="font-rounded font-bold text-lg sm:text-xl text-[var(--romantic-plum)]">
                Authentication Active &amp; Verified
              </h2>
              <p className="text-xs sm:text-sm font-rounded text-[var(--text-muted)]">
                Your session is verified on the server via secure cookie-based Supabase Auth.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/create"
              className="p-5 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50/50 border border-pink-200/80 hover:border-pink-300 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl mb-2 block">🎨</span>
                <h3 className="font-rounded font-bold text-sm text-[var(--romantic-plum)] group-hover:text-[var(--pink-strong)] transition-colors">
                  Create / Edit Story
                </h3>
                <p className="text-xs font-rounded text-[var(--text-muted)] mt-1">
                  Launch the 6-step Creator Wizard to build a custom website.
                </p>
              </div>
              <span className="text-xs font-rounded font-bold text-[var(--pink-strong)] mt-4 inline-flex items-center gap-1">
                Open Wizard →
              </span>
            </Link>

            <Link
              href="/studio"
              className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50/50 border border-purple-200/80 hover:border-purple-300 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl mb-2 block">🪄</span>
                <h3 className="font-rounded font-bold text-sm text-[var(--romantic-plum)] group-hover:text-[var(--pink-strong)] transition-colors">
                  Creator Studio
                </h3>
                <p className="text-xs font-rounded text-[var(--text-muted)] mt-1">
                  Inspect proposals, claimed digital gifts, responses, and settings.
                </p>
              </div>
              <span className="text-xs font-rounded font-bold text-[var(--pink-strong)] mt-4 inline-flex items-center gap-1">
                Open Studio →
              </span>
            </Link>

            <Link
              href="/gift/sweetheart"
              className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-rose-50/50 border border-amber-200/80 hover:border-amber-300 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl mb-2 block">👀</span>
                <h3 className="font-rounded font-bold text-sm text-[var(--romantic-plum)] group-hover:text-[var(--pink-strong)] transition-colors">
                  Recipient Preview
                </h3>
                <p className="text-xs font-rounded text-[var(--text-muted)] mt-1">
                  Experience what your partner sees when opening their secret URL.
                </p>
              </div>
              <span className="text-xs font-rounded font-bold text-[var(--pink-strong)] mt-4 inline-flex items-center gap-1">
                Preview Gift →
              </span>
            </Link>
          </div>
        </div>

        {/* Recipient Privacy reassurance */}
        <div className="p-4 rounded-2xl bg-pink-100/40 border border-pink-200/60 flex items-center gap-3 text-xs font-rounded text-[var(--romantic-plum)]">
          <span className="text-base shrink-0">💌</span>
          <p>
            <strong>Note for Recipients:</strong> When you share your published website link, your partner will open it directly without needing to sign up or log in.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-b from-[#FFF0F5] to-white">
          <div className="p-6 rounded-3xl bg-white/80 border border-[var(--border-subtle)] shadow-sm text-center font-rounded text-sm text-[var(--pink-strong)] animate-pulse flex items-center gap-2">
            <span>✨</span>
            <span>Verifying session and loading dashboard...</span>
          </div>
        </div>
      }
    >
      <AuthenticatedDashboard />
    </Suspense>
  );
}

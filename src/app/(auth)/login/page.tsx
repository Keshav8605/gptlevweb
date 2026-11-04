import { Suspense } from "react";
import Link from "next/link";
import AuthForm from "../auth-form";

export const metadata = {
  title: "Log In · Welcome Back ♡",
  description: "Log in to your account to continue creating and editing your love story website.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-gradient-to-b from-[#FFF0F5] via-[#FFE0EA]/40 to-[#FFF0F5]">
      {/* Decorative background glow circles */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-pink-200/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-purple-200/30 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Top brand header */}
        <div className="text-center mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-rounded font-bold text-[var(--pink-strong)] hover:opacity-80 transition-opacity mb-3"
          >
            <span>←</span>
            <span>Back to Home</span>
          </Link>
          <div className="text-3xl mb-2 animate-bounce-soft">💌</div>
          <h1 className="font-rounded font-bold text-2xl sm:text-3xl text-[var(--romantic-plum)]">
            Welcome Back
          </h1>
          <p className="font-handwritten text-lg sm:text-xl text-[var(--text-secondary)] mt-1">
            Log in to continue creating your love story ♡
          </p>
        </div>

        {/* Auth card container */}
        <div className="bg-white/85 backdrop-blur-xl border border-[var(--border-subtle)] rounded-3xl p-6 sm:p-8 shadow-xl shadow-pink-100/60">
          <Suspense
            fallback={
              <div className="py-12 text-center text-sm font-rounded text-[var(--text-muted)] animate-pulse">
                Loading authentication form...
              </div>
            }
          >
            <AuthForm mode="login" />
          </Suspense>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs font-rounded text-[var(--text-muted)] mt-6">
          Your memories and private surprises are kept safe with us 🔐
        </p>
      </div>
    </main>
  );
}

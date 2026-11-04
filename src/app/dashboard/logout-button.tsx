"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error("[Logout] Sign out error:", err);
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="px-5 py-2.5 rounded-full border border-[var(--border-subtle)] bg-white/90 text-xs font-rounded font-bold text-[var(--pink-strong)] hover:bg-rose-50 hover:border-rose-200 transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
    >
      <span>{loading ? "Signing out..." : "Log out"}</span>
      <span>👋</span>
    </button>
  );
}

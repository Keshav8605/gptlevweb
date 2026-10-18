"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function HomeRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    router.replace(`/story/welcome${qs ? `?${qs}` : ""}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] text-[var(--pink-strong)] font-handwritten text-2xl">
      Opening our love story... ♡
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeRedirect />
    </Suspense>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import { StoryUniverseView } from "@/components/stories/StoryUniverseView";

export const metadata: Metadata = {
  title: "Story Universe — Romantic Stories | YOU & ME",
  description:
    "Immerse yourself in two complete romantic universes: The City's Most Feared Man Has One Weakness and I Hate Everyone. Unfortunately, I Notice You.",
};

export default function StoryUniversePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0508] text-rose-200 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <span className="text-3xl animate-pulse">✨</span>
            <p className="font-serif italic text-sm text-rose-300/80">Opening Story Universe...</p>
          </div>
        </div>
      }
    >
      <StoryUniverseView />
    </Suspense>
  );
}

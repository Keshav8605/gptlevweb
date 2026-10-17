"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { STORIES, type Story } from "@/lib/stories-data";
import { StoryCard } from "./StoryCard";
import { StoryPlayer } from "./StoryPlayer";

export function StoryUniverseView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const storyParam = searchParams.get("story");
  const sceneParam = searchParams.get("scene");
  const fromParam = searchParams.get("from");

  const [storedReturnTarget] = useState<string>(() => {
    if (typeof window === "undefined") return "/#deluluMode";
    return sessionStorage.getItem("story_universe_return_to") || "/#deluluMode";
  });

  const returnTarget = fromParam || storedReturnTarget || "/#deluluMode";

  useEffect(() => {
    if (fromParam && typeof window !== "undefined") {
      sessionStorage.setItem("story_universe_return_to", fromParam);
    }
  }, [fromParam]);

  // Derive active story and scene directly from URL search params
  const activeStoryId: Story["id"] | null =
    storyParam === "mafia-romance" || storyParam === "enemies-to-lovers"
      ? storyParam
      : null;

  const parsedScene = sceneParam ? parseInt(sceneParam, 10) : 1;
  const activeSceneIndex =
    !isNaN(parsedScene) && parsedScene >= 1 ? parsedScene - 1 : 0;

  const handleOpenStory = useCallback(
    (storyId: Story["id"]) => {
      const newParams = new URLSearchParams(window.location.search);
      newParams.set("story", storyId);
      newParams.set("scene", "1");
      if (fromParam) {
        newParams.set("from", fromParam);
      }
      router.push(`/story-universe?${newParams.toString()}`);
    },
    [router, fromParam]
  );

  const handleBackToStories = useCallback(() => {
    if (fromParam) {
      router.push(`/story-universe?from=${encodeURIComponent(fromParam)}`);
    } else {
      router.push("/story-universe");
    }
  }, [router, fromParam]);

  const handleSceneChange = useCallback(
    (sceneIdx: number) => {
      if (activeStoryId) {
        const newParams = new URLSearchParams(window.location.search);
        newParams.set("story", activeStoryId);
        newParams.set("scene", (sceneIdx + 1).toString());
        if (fromParam) {
          newParams.set("from", fromParam);
        }
        router.replace(`/story-universe?${newParams.toString()}`, { scroll: false });
      }
    },
    [activeStoryId, router, fromParam]
  );

  const handleReturnClick = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("scroll_to_delulu_on_load", "true");
    }
  }, []);

  const activeStory = STORIES.find((s) => s.id === activeStoryId);

  return (
    <div className="relative min-h-screen w-full bg-[#0a0508] text-zinc-100 overflow-x-hidden selection:bg-rose-950 selection:text-rose-200">
      {/* Background Grand Arched Gallery Image with Scoped Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Image
          src="/images/stories/gallery-backdrop.jpg"
          alt="Atmospheric gothic arched gallery backdrop"
          fill
          priority
          className="object-cover object-center opacity-25 filter contrast-125 brightness-75"
        />
        {/* Deep atmospheric gradients and candle glow accents */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0508]/85 via-[#0e070d]/90 to-[#070306]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(190,18,60,0.15)_0%,_transparent_70%)]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <header className="w-full px-4 sm:px-8 py-5 border-b border-white/10 backdrop-blur-md bg-black/40 flex items-center justify-between sticky top-0 z-40">
          <Link
            href={returnTarget}
            onClick={handleReturnClick}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-rose-200/90 hover:text-white transition-colors group cursor-pointer"
            id="nav-back-to-delulu"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-1">
              {activeStory
                ? "← Take Me Back to Reality 😂💕"
                : "← Okay, Enough Delulu for Today 😭💗"}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-serif italic text-rose-300/80 hidden sm:inline">
              YOU &amp; ME
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-rose-950/70 border border-rose-800/40 text-rose-300 font-semibold tracking-wider uppercase text-[10px]">
              Story Universe
            </span>
          </div>
        </header>

        {/* Dynamic Content: Gallery or Active Story Reading Player */}
        <main className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!activeStory ? (
              /* Story Universe Gallery View */
              <motion.div
                key="gallery-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-14"
              >
                {/* Gallery Title & Atmospheric Header */}
                <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-3">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-950/60 border border-rose-700/30 text-rose-300 text-xs font-medium tracking-wide">
                    <span>✨</span>
                    <span>Exclusive Romantic Universes</span>
                    <span>♡</span>
                  </div>

                  <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
                    Story Universe
                  </h1>

                  <p className="font-serif italic text-sm sm:text-base text-rose-200/80 leading-relaxed max-w-xl mx-auto">
                    Two romantic worlds waiting to unfold. Choose your story, step beyond the ordinary, and immerse yourself in the journey.
                  </p>
                </div>

                {/* Two Tall Portrait-Oriented Story Cards: Side by Side on Desktop/Tablet, Stacked on Mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-stretch max-w-4xl mx-auto">
                  {STORIES.map((story) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      onOpen={handleOpenStory}
                    />
                  ))}
                </div>

                {/* Return Helper */}
                <div className="mt-12 text-center">
                  <Link
                    href={returnTarget}
                    onClick={handleReturnClick}
                    className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-rose-300 transition-colors"
                  >
                    <span>← Okay, Enough Delulu for Today 😭💗</span>
                  </Link>
                </div>
              </motion.div>
            ) : (
              /* Dedicated Reading Player View */
              <motion.div
                key={`player-view-${activeStory.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
                className="w-full"
              >
                <StoryPlayer
                  story={activeStory}
                  initialSceneIndex={activeSceneIndex}
                  onBackToStories={handleBackToStories}
                  onSceneChange={handleSceneChange}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="w-full py-8 text-center border-t border-white/5 text-xs text-zinc-500 font-serif italic">
          <p>YOU &amp; ME — Handcrafted Romantic Universes</p>
        </footer>
      </div>
    </div>
  );
}

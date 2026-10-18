"use client";

import React, { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStoryScene } from "@/context/StorySceneContext";
import { HeartSceneTransition } from "@/components/transitions/HeartSceneTransition";

export interface SceneDefinition {
  id: string;
  node: ReactNode;
}

interface StorySceneContainerProps {
  scenes: SceneDefinition[];
}

export function StorySceneContainer({ scenes }: StorySceneContainerProps) {
  const {
    activeChapterId,
    activeChapter,
    canGoPrev,
    canGoNext,
    prevChapter,
    nextChapter,
    goToPrevChapter,
    goToNextChapter,
    currentChapterIndex,
    chapterList,
    isTransitioning,
  } = useStoryScene();

  const isCover = activeChapterId === "welcome";

  return (
    <div className="relative w-full min-h-screen">
      {/* 1. Global Heart Scene Transition Overlay */}
      <HeartSceneTransition />

      {/* 2. Top Chapter Navigation Bar (Visible on all chapters except the welcome cover) */}
      {!isCover && (
        <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-[var(--border-subtle)] px-4 py-2.5 transition-all shadow-2xs">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
            {/* Backward Chapter Button */}
            {canGoPrev ? (
              <button
                onClick={() => goToPrevChapter()}
                disabled={isTransitioning}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--pale-rose)] hover:bg-[var(--bg-blush)] text-[var(--pink-strong)] font-rounded font-semibold text-xs transition-all hover:-translate-x-0.5 active:scale-95 cursor-pointer disabled:opacity-50"
                aria-label={`Go back to ${prevChapter?.label || "previous chapter"}`}
              >
                <span>←</span>
                <span className="hidden sm:inline">Back: {prevChapter?.label}</span>
                <span className="sm:hidden">Back</span>
              </button>
            ) : (
              <div className="w-16" />
            )}

            {/* Current Chapter Badge & Title */}
            <div className="flex items-center gap-2 text-center">
              <span className="text-sm">{activeChapter?.emoji || "✨"}</span>
              <span className="text-xs font-rounded font-bold text-[var(--romantic-plum)] tracking-wider uppercase">
                {activeChapter?.chapterNumber ? `Chapter ${activeChapter.chapterNumber}` : "Prologue"}
              </span>
              <span className="text-xs text-[var(--text-muted)] hidden md:inline">
                · {activeChapter?.label}
              </span>
            </div>

            {/* Forward Chapter Button */}
            {canGoNext ? (
              <button
                onClick={() => goToNextChapter()}
                disabled={isTransitioning}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[var(--border-subtle)] hover:bg-[var(--pale-rose)] text-[var(--pink-strong)] font-rounded font-semibold text-xs transition-all hover:translate-x-0.5 active:scale-95 cursor-pointer shadow-2xs disabled:opacity-50"
                aria-label={`Continue to ${nextChapter?.label || "next chapter"}`}
              >
                <span className="hidden sm:inline">Next: {nextChapter?.label}</span>
                <span className="sm:hidden">Next</span>
                <span>→</span>
              </button>
            ) : (
              <div className="w-16" />
            )}
          </div>
        </header>
      )}

      {/* 3. Scenes Container */}
      <main className="relative w-full">
        {scenes.map((scene) => {
          const isActive = scene.id === activeChapterId;

          return (
            <div
              key={scene.id}
              id={`chapter-scene-${scene.id}`}
              role="region"
              aria-label={scene.id}
              aria-hidden={!isActive}
              className={isActive ? "block w-full min-h-[90vh] relative" : "hidden"}
            >
              {isActive && (
                <motion.div
                  key={`content-${scene.id}`}
                  initial={{ opacity: 0, y: 18, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.45,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="w-full"
                >
                  {scene.node}
                </motion.div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}

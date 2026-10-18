"use client";

import React from "react";
import { motion } from "framer-motion";
import { useStoryTransition } from "@/context/StoryTransitionContext";
import { getAdjacentChapters } from "@/lib/story-routes";

export function StoryChapterFooter() {
  const { currentChapter, navigateWithTransition, isTransitioning } = useStoryTransition();
  const { prev, next } = getAdjacentChapters(currentChapter.slug);

  return (
    <footer className="mt-16 pt-12 pb-16 px-4 border-t border-[var(--border-subtle)]/70 bg-gradient-to-b from-transparent via-white/50 to-white/80 relative z-10">
      <div className="max-w-xl mx-auto flex flex-col items-center text-center space-y-6">
        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-2">
          <div className="h-px w-12 bg-[var(--border-medium)] opacity-70" />
          <span className="text-xs text-[var(--pink-primary)]">♥</span>
          <div className="h-px w-12 bg-[var(--border-medium)] opacity-70" />
        </div>

        {/* Emotion cue prompt (when a next chapter exists) */}
        {next && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-rounded font-bold uppercase tracking-widest text-[var(--pink-strong)]">
              {currentChapter.transitionEyebrow || "A LITTLE SOMETHING NEXT"}
            </p>
            <p className="font-handwritten text-lg sm:text-xl text-[var(--text-secondary)]">
              {currentChapter.nextSubtitle || next.emotionalTheme}
            </p>
          </div>
        )}

        {/* Primary Destination Action Button (when a next chapter exists) */}
        {next && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigateWithTransition(next.slug)}
            disabled={isTransitioning}
            className="group relative px-8 py-3.5 rounded-full text-white font-rounded font-semibold text-base sm:text-lg bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] shadow-lg shadow-pink-300/40 hover:shadow-xl hover:shadow-pink-400/50 cursor-pointer transition-all duration-300 flex items-center gap-3 disabled:opacity-50"
          >
            <span>{currentChapter.nextLabel || `Continue to ${next.title}`}</span>
            <span className="text-xl group-hover:scale-125 transition-transform duration-300">
              {next.emoji || "♡"}
            </span>
          </motion.button>
        )}

        {/* Auxiliary Navigation: Back link & Start-over link */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-[var(--text-muted)]">
          {prev && (
            <button
              onClick={() => navigateWithTransition(prev.slug)}
              disabled={isTransitioning}
              className="hover:text-[var(--pink-strong)] hover:underline cursor-pointer transition-colors inline-flex items-center gap-1"
            >
              <span>← Back to {prev.title}</span>
            </button>
          )}

          {prev && currentChapter.slug !== "welcome" && <span>•</span>}

          {currentChapter.slug !== "welcome" && (
            <button
              onClick={() => navigateWithTransition("welcome")}
              disabled={isTransitioning}
              className="hover:text-[var(--pink-strong)] hover:underline cursor-pointer transition-colors"
            >
              Back to the beginning
            </button>
          )}
        </div>

        {/* Standardized emotional footer */}
        <p className="font-script text-base text-[var(--pink-strong)] pt-2 select-none">
          Made with all my love ♡
        </p>
      </div>
    </footer>
  );
}

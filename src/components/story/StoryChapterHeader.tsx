"use client";

import React from "react";
import { useStoryTransition } from "@/context/StoryTransitionContext";
import { STORY_CHAPTERS, getAdjacentChapters } from "@/lib/story-routes";

export function StoryChapterHeader() {
  const { currentChapter, navigateWithTransition, isTransitioning } = useStoryTransition();
  const { prev, next } = getAdjacentChapters(currentChapter.slug);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-[var(--border-subtle)]/70 py-2.5 px-4 pr-16 sm:px-6 sm:pr-20 transition-all duration-300">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Previous Chapter Button or Beginning badge */}
        <div className="flex items-center gap-2">
          {prev ? (
            <button
              onClick={() => navigateWithTransition(prev.slug)}
              disabled={isTransitioning}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-[var(--border-subtle)] text-[11px] font-rounded font-semibold text-[var(--text-secondary)] hover:text-[var(--pink-strong)] hover:border-[var(--pink-light)] hover:bg-[var(--soft-pink)] cursor-pointer transition-all shadow-2xs active:scale-95 disabled:opacity-50"
              title={`Previous: ${prev.title}`}
            >
              <span className="text-xs">←</span>
              <span className="hidden sm:inline">Ch. {prev.chapterNumber}</span>
              <span className="text-xs">{prev.emoji}</span>
            </button>
          ) : (
            <span className="px-3 py-1 rounded-full bg-[var(--soft-pink)]/60 text-[10px] font-bold tracking-widest uppercase font-rounded text-[var(--pink-strong)]">
              PROLOGUE
            </span>
          )}
        </div>

        {/* Center: Chapter Progress & Title */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold tracking-widest uppercase font-rounded text-[var(--pink-strong)]">
              CHAPTER {currentChapter.chapterNumber} OF {STORY_CHAPTERS.length}
            </span>
            <span className="text-xs">{currentChapter.emoji}</span>
          </div>

          {/* Interactive Progress dots */}
          <div className="flex items-center gap-1 mt-1">
            {STORY_CHAPTERS.map((ch) => {
              const isActive = ch.chapterNumber === currentChapter.chapterNumber;
              const isPast = ch.chapterNumber < currentChapter.chapterNumber;
              return (
                <button
                  key={ch.slug}
                  onClick={() => navigateWithTransition(ch.slug)}
                  disabled={isTransitioning}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "w-4 bg-[var(--pink-primary)] shadow-xs"
                      : isPast
                      ? "w-1.5 bg-[var(--pink-light)] hover:bg-[var(--pink-primary)]"
                      : "w-1.5 bg-[var(--border-medium)] hover:bg-[var(--pink-light)]"
                  }`}
                  title={`Chapter ${ch.chapterNumber}: ${ch.title}`}
                />
              );
            })}
          </div>
        </div>

        {/* Right: Next Chapter Button */}
        <div className="flex items-center gap-2">
          {next && (
            <button
              onClick={() => navigateWithTransition(next.slug)}
              disabled={isTransitioning}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white text-[11px] font-rounded font-semibold hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer transition-all shadow-xs disabled:opacity-50"
              title={`Next: ${next.title}`}
            >
              <span className="hidden sm:inline">Ch. {next.chapterNumber}</span>
              <span className="text-xs">{next.emoji}</span>
              <span className="text-xs">→</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

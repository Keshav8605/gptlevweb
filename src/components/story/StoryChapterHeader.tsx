"use client";

import React, { useState, useEffect } from "react";
import { useStoryTransition } from "@/context/StoryTransitionContext";
import { STORY_CHAPTERS, getAdjacentChapters } from "@/lib/story-routes";

interface StoryChapterHeaderProps {
  onOpenAccessModal?: () => void;
}

export function StoryChapterHeader({ onOpenAccessModal }: StoryChapterHeaderProps) {
  const { currentChapter, navigateWithTransition, isTransitioning } = useStoryTransition();
  const { prev, next } = getAdjacentChapters(currentChapter.slug);

  const [recipientName, setRecipientName] = useState<string>("Baby");

  useEffect(() => {
    const updateName = () => {
      const name = localStorage.getItem("gift_participant_name") || "Baby";
      setRecipientName(name);
    };
    updateName();
    window.addEventListener("storage", updateName);
    return () => window.removeEventListener("storage", updateName);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/85 backdrop-blur-md border-b border-[var(--border-subtle)]/70 py-2.5 px-4 pr-16 sm:px-6 sm:pr-20 transition-all duration-300">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Previous Navigation or Recipient Badge */}
        <div className="flex items-center gap-2">
          {prev ? (
            <button
              onClick={() => navigateWithTransition(prev.slug)}
              disabled={isTransitioning}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 border border-[var(--border-subtle)] text-[11px] sm:text-xs font-rounded font-semibold text-[var(--text-secondary)] hover:text-[var(--pink-strong)] hover:border-[var(--pink-light)] hover:bg-[var(--soft-pink)] cursor-pointer transition-all shadow-2xs active:scale-95 disabled:opacity-50"
              title={`Previous: ${prev.title}`}
            >
              <span>← Previous</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--soft-pink)]/80 text-[10px] sm:text-[11px] font-bold tracking-wide uppercase font-rounded text-[var(--pink-strong)] border border-[var(--pink-light)]/40 shadow-2xs">
              <span>Made for you ♡</span>
            </span>
          )}

          {/* Discreet recipient label when prev exists */}
          {prev && (
            <span
              onClick={onOpenAccessModal}
              className={`hidden md:inline-flex items-center gap-1 text-[11px] font-rounded text-[var(--text-muted)] ${
                onOpenAccessModal ? "cursor-pointer hover:text-[var(--pink-strong)] transition-colors" : ""
              }`}
              title={onOpenAccessModal ? `Signed in as ${recipientName} — Click to switch` : undefined}
            >
              <span>Made for you ♡</span>
            </span>
          )}
        </div>

        {/* Center: Chapter Progress & Title */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase font-rounded text-[var(--pink-strong)]">
              CHAPTER {currentChapter.chapterNumber} OF {STORY_CHAPTERS.length}
            </span>
            <span className="text-xs">{currentChapter.emoji}</span>
          </div>

          <p className="text-xs font-rounded font-semibold text-[var(--romantic-plum)] hidden sm:block truncate max-w-[220px] md:max-w-xs mt-0.5">
            {currentChapter.title}
          </p>

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

        {/* Right: Next Navigation or Ending Badge */}
        <div className="flex items-center gap-2">
          {next ? (
            <button
              onClick={() => navigateWithTransition(next.slug)}
              disabled={isTransitioning}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white text-[11px] sm:text-xs font-rounded font-semibold hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer transition-all shadow-xs disabled:opacity-50"
              title={`Next: ${next.title}`}
            >
              <span>Next chapter →</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--soft-pink)]/80 text-[10px] sm:text-[11px] font-bold tracking-wide uppercase font-rounded text-[var(--pink-strong)] border border-[var(--pink-light)]/40 shadow-2xs">
              <span>Made with all my love ♡</span>
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

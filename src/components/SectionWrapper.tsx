"use client";

import { motion } from "framer-motion";
import { ReactNode, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { scrollToChapter } from "@/lib/motion";
<<<<<<< HEAD
import { useStoryScene } from "@/context/StorySceneContext";
=======
import { useStoryTransitionSafe } from "@/context/StoryTransitionContext";
import { sectionIdToSlug, getChapterById, getChapterBySlug } from "@/lib/story-routes";
>>>>>>> d158bf5f03c3f4e4709a5dd17b3510469507a888

interface SectionWrapperProps {
  id: string;
  title?: string;
  subtitle?: string;
  eyebrowLabel?: string;
  introduction?: string;
  emoji?: string;
  chapterNumber?: number | string;
  nextSectionId?: string;
  nextSectionLabel?: string;
  nextSectionSubtitle?: string;
  nextSectionEmoji?: string;
  children: ReactNode;
  className?: string;
  bgVariant?: "default" | "surface" | "blush" | "cream" | "lavender";
}

const bgColors: Record<string, string> = {
  default: "var(--bg-main)",
  surface: "var(--bg-surface)",
  blush: "var(--pale-rose)",
  cream: "var(--warm-cream)",
  lavender: "var(--lavender-soft)",
};

export function SectionWrapper({
  id,
  title,
  subtitle,
  eyebrowLabel,
  introduction,
  emoji,
  chapterNumber,
  nextSectionId,
  nextSectionLabel,
  nextSectionSubtitle,
  nextSectionEmoji = "♡",
  children,
  className = "",
  bgVariant = "default",
}: SectionWrapperProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
<<<<<<< HEAD
  const [isLocalTransitioning, setIsLocalTransitioning] = useState(false);

  let sceneContext: ReturnType<typeof useStoryScene> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    sceneContext = useStoryScene();
  } catch {
    sceneContext = null;
  }
=======
  const [isTransitioning, setIsTransitioning] = useState(false);
  const storyCtx = useStoryTransitionSafe();

  const canonicalChapter = getChapterById(id) || getChapterBySlug(id) || (storyCtx ? storyCtx.currentChapter : undefined);
  const resolvedChapterNumber = canonicalChapter ? canonicalChapter.chapterNumber : chapterNumber;
  const resolvedTitle = title || (canonicalChapter ? canonicalChapter.title : undefined);
  const resolvedSubtitle = subtitle !== undefined ? subtitle : (canonicalChapter ? canonicalChapter.subtitle : undefined);
  const resolvedEmoji = emoji || (canonicalChapter ? canonicalChapter.emoji : undefined);
  const resolvedEyebrow =
    eyebrowLabel ||
    canonicalChapter?.eyebrowLabel ||
    (resolvedChapterNumber !== undefined
      ? `CHAPTER ${String(resolvedChapterNumber).padStart(2, "0")}`
      : undefined);
>>>>>>> d158bf5f03c3f4e4709a5dd17b3510469507a888

  const handleContinueNext = () => {
    if (!nextSectionId) return;

<<<<<<< HEAD
    if (sceneContext) {
      if (sceneContext.isTransitioning) return;
      sceneContext.goToChapter(nextSectionId);
      return;
    }

    if (isLocalTransitioning) return;
    setIsLocalTransitioning(true);
=======
    // Multi-page emotion transition if within StoryTransitionContext
    if (storyCtx) {
      const slug = sectionIdToSlug(nextSectionId);
      storyCtx.navigateWithTransition(slug);
      return;
    }

    // Single-page fallback
    if (isTransitioning) return;
    setIsTransitioning(true);
>>>>>>> d158bf5f03c3f4e4709a5dd17b3510469507a888
    scrollToChapter(nextSectionId, () => {
      setTimeout(() => setIsLocalTransitioning(false), 900);
    });
  };

  return (
    <section
      ref={ref}
      id={id}
      className={`py-16 md:py-24 px-4 sm:px-6 md:px-8 relative ${className}`}
      style={{ backgroundColor: bgColors[bgVariant] }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Section header (if title or chapterNumber is provided) */}
        {(resolvedTitle || resolvedChapterNumber !== undefined || resolvedEyebrow) && (
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className={`text-center ${resolvedTitle ? "mb-10 md:mb-14" : "mb-6"}`}
          >
            {/* Chapter eyebrow badge */}
            {resolvedEyebrow && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/80 backdrop-blur-xs border border-[var(--border-subtle)] shadow-2xs mb-3 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase font-rounded text-[var(--pink-strong)]"
              >
                <span>✨</span>
                <span>{resolvedEyebrow}</span>
                <span>✨</span>
              </motion.div>
            )}

            {resolvedEmoji && resolvedTitle && (
              <div>
                <motion.span
                  className="text-3xl md:text-4xl inline-block mb-3"
                  initial={{ scale: 0, rotate: -15 }}
                  animate={isInView ? { scale: 1, rotate: 0 } : {}}
                  transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 14 }}
                >
                  {resolvedEmoji}
                </motion.span>
              </div>
            )}

            {resolvedTitle && (
              <h2 className="font-rounded cute-love-stroke text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--romantic-plum)] tracking-tight select-none">
                {resolvedTitle}
              </h2>
            )}

            {resolvedSubtitle && (
              <p className="mt-2.5 font-handwritten text-lg sm:text-xl md:text-2xl text-[var(--text-secondary)] max-w-xl mx-auto">
                {resolvedSubtitle}
              </p>
            )}

            {introduction && (
              <p className="mt-3.5 text-sm sm:text-base md:text-lg text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
                {introduction}
              </p>
            )}

            {/* Cute Decorative heart line */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="h-px w-10 md:w-16 bg-[var(--border-medium)] opacity-70" />
              <span className="text-xs text-[var(--pink-primary)] animate-pulse-soft">♥</span>
              <div className="h-px w-10 md:w-16 bg-[var(--border-medium)] opacity-70" />
            </div>
          </motion.div>
        )}

        {/* Section content */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>

<<<<<<< HEAD
        {/* Cinematic Chapter Transition Cue (Bottom of Section) */}
        {(nextSectionId || sceneContext?.canGoPrev) && (
=======
        {/* Cinematic Chapter Transition Cue (Bottom of Section - single page fallback) */}
        {nextSectionId && nextSectionLabel && !storyCtx && (
>>>>>>> d158bf5f03c3f4e4709a5dd17b3510469507a888
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-14 sm:mt-16 pt-8 border-t border-[var(--border-subtle)]/70 flex flex-col items-center text-center"
          >
<<<<<<< HEAD
            <p className="text-[11px] font-rounded font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-4">
              Turn the page of our storybook
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-xl">
              {sceneContext?.canGoPrev && (
                <button
                  type="button"
                  onClick={() => sceneContext?.goToPrevChapter()}
                  disabled={sceneContext?.isTransitioning}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white/90 hover:bg-white border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--pink-strong)] font-rounded font-semibold text-xs transition-all hover:-translate-x-0.5 active:scale-95 cursor-pointer shadow-2xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <span>←</span>
                  <span>Back: {sceneContext.prevChapter?.label}</span>
                </button>
              )}

              {nextSectionId && nextSectionLabel && (
                <button
                  type="button"
                  onClick={handleContinueNext}
                  disabled={sceneContext?.isTransitioning || isLocalTransitioning}
                  className="w-full sm:w-auto group relative px-7 py-3 rounded-full bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white font-rounded font-bold text-xs sm:text-sm shadow-md hover:shadow-xl hover:shadow-pink-300/50 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <span className="text-sm group-hover:rotate-12 transition-transform duration-300">
                    {nextSectionEmoji}
                  </span>
                  <span>Continue Our Story: {nextSectionLabel}</span>
                  <span className="text-xs group-hover:translate-x-1 transition-transform duration-300">
                    {nextSectionId === "welcome" ? "✨" : "♡ →"}
                  </span>
                </button>
              )}
            </div>
=======
            <p className="text-[11px] font-rounded font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">
              Ready for the next moment?
            </p>
            {nextSectionSubtitle && (
              <p className="font-handwritten text-base sm:text-lg text-[var(--text-secondary)] mb-3.5 max-w-md">
                {nextSectionSubtitle}
              </p>
            )}
            <button
              onClick={handleContinueNext}
              disabled={isTransitioning}
              className="group relative px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-white/90 hover:bg-white border border-[var(--border-medium)] text-[var(--romantic-plum)] hover:text-[var(--pink-strong)] font-rounded font-bold text-xs sm:text-sm shadow-xs hover:shadow-lg hover:shadow-pink-200/50 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 flex items-center gap-2.5 cursor-pointer"
            >
              <span className="text-sm group-hover:rotate-12 transition-transform duration-300">
                {nextSectionEmoji}
              </span>
              <span>Continue Our Story: {nextSectionLabel}</span>
              <span className="text-xs group-hover:translate-y-0.5 transition-transform duration-300 text-[var(--pink-primary)]">
                {nextSectionId === "welcome" ? "↑" : "↓"}
              </span>
            </button>
>>>>>>> d158bf5f03c3f4e4709a5dd17b3510469507a888
          </motion.div>
        )}
      </div>
    </section>
  );
}

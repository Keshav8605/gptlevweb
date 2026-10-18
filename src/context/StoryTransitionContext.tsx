"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  STORY_CHAPTERS,
  StoryChapter,
  TransitionType,
  getChapterByPath,
  getChapterBySlug,
} from "@/lib/story-routes";

interface StoryTransitionContextValue {
  isTransitioning: boolean;
  transitionPhase: "idle" | "outgoing" | "bridge" | "incoming";
  activeTransition: TransitionType | null;
  outgoingChapter: StoryChapter | null;
  incomingChapter: StoryChapter | null;
  currentChapter: StoryChapter;
  direction: "forward" | "backward" | "direct";
  navigateWithTransition: (targetSlugOrPath: string, customTransition?: TransitionType) => void;
}

const StoryTransitionContext = createContext<StoryTransitionContextValue | null>(null);

export function StoryTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState<"idle" | "outgoing" | "bridge" | "incoming">("idle");
  const [activeTransition, setActiveTransition] = useState<TransitionType | null>(null);
  const [outgoingChapter, setOutgoingChapter] = useState<StoryChapter | null>(null);
  const [incomingChapter, setIncomingChapter] = useState<StoryChapter | null>(null);
  const [direction, setDirection] = useState<"forward" | "backward" | "direct">("forward");

  const currentChapter = getChapterByPath(pathname) || STORY_CHAPTERS[0];
  const isTransitioningRef = useRef(false);

  // Determine transition type based on outgoing and incoming chapter pair
  const resolveTransitionType = useCallback(
    (from: StoryChapter, to: StoryChapter, custom?: TransitionType): TransitionType => {
      if (custom) return custom;
      // If moving from one chapter to its direct next chapter, use its curated forwardTransition
      if (from.nextSlug === to.slug) {
        return from.forwardTransition;
      }
      // If moving backwards to the previous chapter, use gentle-fade or appropriate reverse
      if (from.prevSlug === to.slug) {
        return "gentle-fade";
      }
      // If arbitrary jump, default to gentle-fade
      return "gentle-fade";
    },
    []
  );

  const navigateWithTransition = useCallback(
    (targetSlugOrPath: string, customTransition?: TransitionType) => {
      if (isTransitioningRef.current) return;

      // Clean target slug / path
      let targetChapter: StoryChapter | undefined;
      let targetPath = targetSlugOrPath;

      if (targetSlugOrPath.startsWith("/")) {
        targetChapter = getChapterByPath(targetSlugOrPath);
        targetPath = targetSlugOrPath;
      } else {
        targetChapter = getChapterBySlug(targetSlugOrPath);
        targetPath = targetChapter ? targetChapter.path : `/story/${targetSlugOrPath}`;
      }

      if (!targetChapter) {
        targetChapter = STORY_CHAPTERS[0];
      }

      // If already on this exact page, do nothing
      if (pathname === targetPath || (pathname === "/" && targetChapter.slug === "welcome")) {
        return;
      }

      const fromChapter = currentChapter;
      const toChapter = targetChapter;

      // Determine navigation direction
      let dir: "forward" | "backward" | "direct" = "forward";
      if (toChapter.chapterNumber < fromChapter.chapterNumber) {
        dir = "backward";
      } else if (toChapter.chapterNumber > fromChapter.chapterNumber) {
        dir = "forward";
      } else {
        dir = "direct";
      }

      // Check prefers-reduced-motion
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const transType = prefersReducedMotion
        ? "gentle-fade"
        : resolveTransitionType(fromChapter, toChapter, customTransition);

      // Lock navigation
      isTransitioningRef.current = true;
      setIsTransitioning(true);
      setTransitionPhase("outgoing");
      setActiveTransition(transType);
      setOutgoingChapter(fromChapter);
      setIncomingChapter(toChapter);
      setDirection(dir);

      if (prefersReducedMotion) {
        // Fast accessible crossfade
        setTimeout(() => {
          router.push(targetPath);
          setTransitionPhase("incoming");
          setTimeout(() => {
            setTransitionPhase("idle");
            setIsTransitioning(false);
            setActiveTransition(null);
            isTransitioningRef.current = false;
          }, 200);
        }, 150);
        return;
      }

      // Phase 1: Outgoing scene begins graceful exit (250ms)
      setTimeout(() => {
        setTransitionPhase("bridge");

        // Phase 2: Bridge element connects scenes, route changes (400ms)
        setTimeout(() => {
          router.push(targetPath);
          // Scroll page to top for clean entrance
          if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "instant" });
          }

          // Phase 3: Incoming scene revealed (350ms)
          setTransitionPhase("incoming");

          setTimeout(() => {
            setTransitionPhase("idle");
            setIsTransitioning(false);
            setActiveTransition(null);
            setOutgoingChapter(null);
            setIncomingChapter(null);
            isTransitioningRef.current = false;
          }, 450);
        }, 400);
      }, 250);
    },
    [currentChapter, pathname, resolveTransitionType, router]
  );

  // Sync state if pathname changed through browser back/forward buttons
  useEffect(() => {
    isTransitioningRef.current = false;
    setIsTransitioning(false);
    setTransitionPhase("idle");
  }, [pathname]);

  return (
    <StoryTransitionContext.Provider
      value={{
        isTransitioning,
        transitionPhase,
        activeTransition,
        outgoingChapter,
        incomingChapter,
        currentChapter,
        direction,
        navigateWithTransition,
      }}
    >
      {children}
    </StoryTransitionContext.Provider>
  );
}

export function useStoryTransition() {
  const context = useContext(StoryTransitionContext);
  if (!context) {
    throw new Error("useStoryTransition must be used within a StoryTransitionProvider");
  }
  return context;
}

export function useStoryTransitionSafe() {
  return useContext(StoryTransitionContext);
}


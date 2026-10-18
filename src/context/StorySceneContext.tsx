"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";

export type TransitionType = "heart-portal" | "polaroid" | "envelope" | "dissolve";
export type TransitionDirection = "forward" | "backward";
export type TransitionPhase = "idle" | "enter" | "active" | "exit";

export interface ChapterInfo {
  id: string;
  chapterNumber?: number;
  label: string;
  title: string;
  emoji: string;
  transitionType?: TransitionType;
}

export const DEFAULT_STORY_CHAPTERS: ChapterInfo[] = [
  { id: "welcome", label: "You & Me", title: "You & Me", emoji: "🧸", transitionType: "heart-portal" },
  { id: "observations", chapterNumber: 1, label: "Things I Noticed", title: "Things I Noticed About You", emoji: "👀", transitionType: "heart-portal" },
  { id: "memories", chapterNumber: 2, label: "Polaroid Scrapbook", title: "Little moments, big feelings", emoji: "📸", transitionType: "polaroid" },
  { id: "secretWorld", chapterNumber: 3, label: "Secret World", title: "Our Secret World", emoji: "🔒", transitionType: "heart-portal" },
  { id: "deluluMode", chapterNumber: 4, label: "Delulu Mode", title: "Delulu Mode", emoji: "🦋", transitionType: "heart-portal" },
  { id: "quiz", chapterNumber: 5, label: "Do You Love Me?", title: "Do You Love Me?", emoji: "💖", transitionType: "heart-portal" },
  { id: "letters", chapterNumber: 6, label: "Love Letters", title: "Letters I Don't Say Enough", emoji: "💌", transitionType: "envelope" },
  { id: "notebook", chapterNumber: 7, label: "Our Notebook", title: "Our Little Notebook", emoji: "📖", transitionType: "heart-portal" },
  { id: "voice", chapterNumber: 8, label: "Voice Whispers", title: "Voice Notes Just For Us", emoji: "🎙️", transitionType: "heart-portal" },
  { id: "datePlanner", chapterNumber: 9, label: "Date Planner", title: "Plan Our Next Adventure", emoji: "🗺️", transitionType: "heart-portal" },
  { id: "openWhenLetters", chapterNumber: 10, label: "Open When...", title: "Open When Letters", emoji: "✉️", transitionType: "envelope" },
  { id: "littleReasons", chapterNumber: 11, label: "Why I Love You", title: "Reasons Why I Love You", emoji: "💗", transitionType: "heart-portal" },
  { id: "digitalGifts", chapterNumber: 12, label: "Gifts For You", title: "Little Gifts I Owe You", emoji: "🎁", transitionType: "heart-portal" },
  { id: "ourSong", chapterNumber: 13, label: "Our Song", title: "Our Song", emoji: "🎵", transitionType: "heart-portal" },
  { id: "finalHeart", chapterNumber: 14, label: "Heart Collage", title: "A Thousand Little Moments, One Big Love", emoji: "❤️", transitionType: "polaroid" },
];

interface StorySceneContextValue {
  activeChapterId: string;
  previousChapterId: string | null;
  targetChapterId: string | null;
  isTransitioning: boolean;
  transitionPhase: TransitionPhase;
  transitionType: TransitionType;
  direction: TransitionDirection;
  chapterList: ChapterInfo[];
  currentChapterIndex: number;
  activeChapter: ChapterInfo | undefined;
  canGoNext: boolean;
  canGoPrev: boolean;
  nextChapter: ChapterInfo | null;
  prevChapter: ChapterInfo | null;
  goToChapter: (
    chapterId: string,
    transition?: TransitionType,
    dir?: TransitionDirection
  ) => void;
  goToNextChapter: (transition?: TransitionType) => void;
  goToPrevChapter: (transition?: TransitionType) => void;
}

const StorySceneContext = createContext<StorySceneContextValue | null>(null);

export function StorySceneProvider({
  children,
  chapters = DEFAULT_STORY_CHAPTERS,
  initialChapterId,
}: {
  children: ReactNode;
  chapters?: ChapterInfo[];
  initialChapterId?: string;
}) {
  const [activeChapterId, setActiveChapterId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash && chapters.some((c) => c.id === hash)) {
        return hash;
      }
    }
    return initialChapterId || chapters[0]?.id || "welcome";
  });

  const [previousChapterId, setPreviousChapterId] = useState<string | null>(null);
  const [targetChapterId, setTargetChapterId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>("idle");
  const [transitionType, setTransitionType] = useState<TransitionType>("heart-portal");
  const [direction, setDirection] = useState<TransitionDirection>("forward");

  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const midpointTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentChapterIndex = chapters.findIndex((c) => c.id === activeChapterId);
  const activeChapter = chapters[currentChapterIndex];

  const canGoNext = currentChapterIndex >= 0 && currentChapterIndex < chapters.length - 1;
  const canGoPrev = currentChapterIndex > 0;
  const nextChapter = canGoNext ? chapters[currentChapterIndex + 1] : null;
  const prevChapter = canGoPrev ? chapters[currentChapterIndex - 1] : null;

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      if (midpointTimerRef.current) clearTimeout(midpointTimerRef.current);
    };
  }, []);

  const goToChapter = useCallback(
    (
      chapterId: string,
      customTransition?: TransitionType,
      customDirection?: TransitionDirection
    ) => {
      if (!chapterId) return;

      // Avoid redundant or conflicting transitions while one is running
      if (isTransitioning) return;
      if (chapterId === activeChapterId) return;

      const targetIndex = chapters.findIndex((c) => c.id === chapterId);
      if (targetIndex === -1) return;

      const currIndex = chapters.findIndex((c) => c.id === activeChapterId);
      const computedDirection: TransitionDirection =
        customDirection || (targetIndex >= currIndex ? "forward" : "backward");

      const targetInfo = chapters[targetIndex];
      const selectedTransition: TransitionType =
        customTransition || targetInfo?.transitionType || "heart-portal";

      // Check reduced motion preference
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion) {
        setPreviousChapterId(activeChapterId);
        setActiveChapterId(chapterId);
        window.scrollTo({ top: 0, behavior: "instant" });
        if (typeof window !== "undefined") {
          window.history.pushState({ chapterId }, "", `#${chapterId}`);
        }
        return;
      }

      // Initiate Scene Transition
      setIsTransitioning(true);
      setTargetChapterId(chapterId);
      setTransitionType(selectedTransition);
      setDirection(computedDirection);
      setTransitionPhase("enter");

      // Midpoint: screen is fully covered by the heart / portal overlay
      midpointTimerRef.current = setTimeout(() => {
        setPreviousChapterId(activeChapterId);
        setActiveChapterId(chapterId);
        setTransitionPhase("active");

        // Reset scroll position to top instantly while hidden behind transition
        window.scrollTo({ top: 0, behavior: "instant" });

        // Update URL hash without reload
        if (typeof window !== "undefined") {
          try {
            window.history.pushState({ chapterId }, "", `#${chapterId}`);
          } catch {}
        }

        // Transition exit phase (heart expands outward / reveals new chapter)
        setTransitionPhase("exit");
      }, 480);

      // Completion: new scene is completely revealed and interactive
      transitionTimerRef.current = setTimeout(() => {
        setIsTransitioning(false);
        setTransitionPhase("idle");
        setTargetChapterId(null);
      }, 980);
    },
    [activeChapterId, isTransitioning, chapters]
  );

  const goToNextChapter = useCallback(
    (customTransition?: TransitionType) => {
      if (nextChapter) {
        goToChapter(nextChapter.id, customTransition, "forward");
      }
    },
    [nextChapter, goToChapter]
  );

  const goToPrevChapter = useCallback(
    (customTransition?: TransitionType) => {
      if (prevChapter) {
        goToChapter(prevChapter.id, customTransition || "dissolve", "backward");
      }
    },
    [prevChapter, goToChapter]
  );

  // Sync with browser Back & Forward navigation
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const stateChapter = e.state?.chapterId;
      const hashChapter = window.location.hash.replace("#", "");
      const dest = stateChapter || hashChapter || chapters[0]?.id;

      if (dest && dest !== activeChapterId && chapters.some((c) => c.id === dest)) {
        goToChapter(dest, "dissolve");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeChapterId, chapters, goToChapter]);

  return (
    <StorySceneContext.Provider
      value={{
        activeChapterId,
        previousChapterId,
        targetChapterId,
        isTransitioning,
        transitionPhase,
        transitionType,
        direction,
        chapterList: chapters,
        currentChapterIndex,
        activeChapter,
        canGoNext,
        canGoPrev,
        nextChapter,
        prevChapter,
        goToChapter,
        goToNextChapter,
        goToPrevChapter,
      }}
    >
      {children}
    </StorySceneContext.Provider>
  );
}

export function useStoryScene() {
  const context = useContext(StorySceneContext);
  if (!context) {
    throw new Error("useStoryScene must be used within a StorySceneProvider");
  }
  return context;
}

import type { Variants, Transition } from "framer-motion";

// Romantic Cinematic Motion Design Tokens
export const romanticEasing = [0.16, 1, 0.3, 1] as const; // Custom spring-like cubic bezier
export const gentleEasing = [0.25, 0.1, 0.25, 1] as const;

export const romanticTransition: Transition = {
  duration: 0.65,
  ease: romanticEasing,
};

export const springTransition: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 20,
};

export const softSpringTransition: Transition = {
  type: "spring",
  stiffness: 180,
  damping: 24,
};

// Reusable Framer Motion Variants
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: romanticEasing },
  },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: romanticEasing },
  },
};

export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, ease: romanticEasing },
  },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springTransition,
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const cardHoverVariants: Variants = {
  rest: { scale: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  hover: {
    scale: 1.025,
    y: -4,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

export const buttonPress = {
  scale: 0.96,
  transition: { duration: 0.1 },
};

export const modalOverlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

export const modalContentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.93, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: softSpringTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 16,
    transition: { duration: 0.2 },
  },
};

export const letterUnfoldVariants: Variants = {
  hidden: { opacity: 0, y: 35, rotateX: -15 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.7, ease: romanticEasing },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: 0.25 },
  },
};

/**
 * Programmatically scrolls to a section with a smooth, cinematic ease
 * and triggers a romantic pulse on the destination section.
 */
export function scrollToChapter(sectionId: string, onStart?: () => void) {
  if (typeof window === "undefined") return;
  onStart?.();

  const element = document.getElementById(sectionId);
  if (!element) return;

  const yOffset = -20;
  const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

  window.scrollTo({
    top: y,
    behavior: "smooth",
  });

  // Brief romantic glow highlight on destination
  element.classList.add("chapter-destination-highlight");
  setTimeout(() => {
    element.classList.remove("chapter-destination-highlight");
  }, 1400);
}

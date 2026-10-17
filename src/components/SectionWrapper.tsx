"use client";

import { motion } from "framer-motion";
import { ReactNode, useRef } from "react";
import { useInView } from "framer-motion";

interface SectionWrapperProps {
  id: string;
  title: string;
  subtitle?: string;
  emoji?: string;
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
  emoji,
  children,
  className = "",
  bgVariant = "default",
}: SectionWrapperProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id={id}
      className={`py-16 md:py-24 px-6 md:px-8 relative ${className}`}
      style={{ backgroundColor: bgColors[bgVariant] }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12 md:mb-16"
        >
          {emoji && (
            <motion.span
              className="text-3xl md:text-4xl inline-block mb-4"
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 12 }}
            >
              {emoji}
            </motion.span>
          )}
          <h2
            className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className="mt-3 text-base md:text-lg max-w-xl mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              {subtitle}
            </p>
          )}
          {/* Decorative line */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="h-px w-12 md:w-16" style={{ background: "var(--border-medium)" }} />
            <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--pink-primary)">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <div className="h-px w-12 md:w-16" style={{ background: "var(--border-medium)" }} />
          </div>
        </motion.div>

        {/* Section content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}

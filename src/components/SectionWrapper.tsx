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
        {/* Section header (only if title is provided) */}
        {title && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-10 md:mb-14"
          >
            {emoji && (
              <motion.span
                className="text-3xl md:text-4xl inline-block mb-3"
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 12 }}
              >
                {emoji}
              </motion.span>
            )}
            <h2 className="font-rounded text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--romantic-plum)] tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2.5 font-handwritten text-lg sm:text-xl md:text-2xl text-[var(--text-secondary)] max-w-xl mx-auto">
                {subtitle}
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

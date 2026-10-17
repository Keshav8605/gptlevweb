"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "../SectionWrapper";
import { SharedInteractions } from "../interactions/SharedInteractions";
import type { ObservationCard } from "@/lib/gift-data";

interface ObservationsSectionProps {
  observations: ObservationCard[];
}

export function ObservationsSection({ observations }: ObservationsSectionProps) {
  return (
    <SectionWrapper
      id="observations"
      title="Things I Noticed About You"
      subtitle="The little habits, expressions, and details that make you completely unforgettable"
      emoji="👀"
      bgVariant="surface"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {observations.map((card, i) => {
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              className="rounded-2xl p-6 md:p-7 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group bg-white border border-[var(--border-subtle)] shadow-[0_4px_20px_var(--shadow-pink)] hover:shadow-[0_12px_36px_var(--shadow-pink-strong)] hover:-translate-y-1"
            >
              <div>
                {/* Header row: category tag & icon */}
                <div className="flex items-center justify-between mb-4">
                  {card.category ? (
                    <span className="text-xs font-medium uppercase tracking-wider px-3 py-1 rounded-full bg-[var(--pale-rose)] text-[var(--pink-strong)]">
                      {card.category}
                    </span>
                  ) : <div />}
                  <span className="text-2xl transform group-hover:scale-110 transition-transform">
                    {card.emoji || "✨"}
                  </span>
                </div>

                <h3 className="font-serif text-xl md:text-2xl font-semibold mb-3 text-[var(--text-primary)]">
                  {card.title}
                </h3>

                <p className="text-sm md:text-base leading-relaxed text-[var(--text-secondary)]">
                  {card.content}
                </p>

                {card.photo && (
                  <div className="mt-4 rounded-xl overflow-hidden aspect-video border border-[var(--border-subtle)]">
                    <img
                      src={card.photo}
                      alt={card.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Shared Persistent Reaction & Comment Bar */}
              <div className="mt-6">
                <SharedInteractions
                  targetType="observation"
                  targetId={card.id}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

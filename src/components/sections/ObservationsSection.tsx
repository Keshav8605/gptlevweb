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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
        {observations.map((card, i) => {
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              className="rounded-3xl p-6 sm:p-7 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group bg-white border border-[var(--border-subtle)] shadow-xs hover:shadow-xl hover:-translate-y-1.5"
            >
              {/* Cute Washi-tape sticker accent at top */}
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 rounded-xs opacity-75 pointer-events-none"
                style={{
                  background: i % 2 === 0 ? "rgba(255, 182, 193, 0.6)" : "rgba(230, 215, 250, 0.6)",
                  transform: `translateX(-50%) rotate(${i % 2 === 0 ? "-2deg" : "2deg"})`,
                }}
              />

              <div>
                {/* Header row: category tag & icon */}
                <div className="flex items-center justify-between mb-4 pt-1">
                  {card.category ? (
                    <span className="text-[11px] font-rounded font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[var(--soft-pink)] text-[var(--pink-strong)] border border-[var(--border-subtle)]">
                      {card.category}
                    </span>
                  ) : <div />}
                  <span className="text-2xl transform group-hover:scale-125 transition-transform duration-300">
                    {card.emoji || "✨"}
                  </span>
                </div>

                <h3 className="font-rounded text-xl sm:text-2xl font-bold mb-2.5 text-[var(--romantic-plum)]">
                  {card.title}
                </h3>

                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  {card.content}
                </p>

                {card.photo && (
                  <div className="mt-4 rounded-2xl overflow-hidden aspect-video border border-[var(--border-subtle)] shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={card.photo}
                      alt={card.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
              </div>

              {/* Shared Persistent Reaction & Comment Bar */}
              <div className="mt-6 pt-3 border-t border-[var(--border-subtle)]">
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

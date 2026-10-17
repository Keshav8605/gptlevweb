"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "../SectionWrapper";
import type { PersonalCard } from "@/lib/gift-data";

interface PersonalCardsSectionProps {
  cards: PersonalCard[];
}

export function PersonalCardsSection({ cards }: PersonalCardsSectionProps) {
  return (
    <SectionWrapper
      id="personalCards"
      title="The Little Things That Are So You"
      subtitle="These quirks and qualities that make you uniquely wonderful"
      emoji="🌸"
      bgVariant="lavender"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20, rotate: i % 2 === 0 ? -1 : 1 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            whileHover={{ y: -4, rotate: i % 2 === 0 ? 1 : -1 }}
            className="rounded-2xl p-6 md:p-8 relative overflow-hidden group"
            style={{
              background: "var(--white)",
              border: "1px solid var(--border-subtle)",
              boxShadow: "0 4px 20px var(--shadow-pink)",
            }}
          >
            {/* Category tag */}
            <span
              className="text-xs font-medium uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-4"
              style={{
                background: "var(--pale-rose)",
                color: "var(--pink-strong)",
              }}
            >
              {card.category}
            </span>

            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                {card.emoji || "🌸"}
              </span>
              <h3
                className="font-serif text-xl font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {card.title}
              </h3>
            </div>

            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}
            >
              {card.content}
            </p>

            {/* Subtle gradient on hover */}
            <div
              className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500"
              style={{ background: "var(--pink-primary)" }}
            />
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}

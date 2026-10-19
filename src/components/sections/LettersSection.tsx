"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { SectionWrapper } from "../SectionWrapper";
import { SharedInteractions } from "../interactions/SharedInteractions";
import { RomanticCharacter } from "../RomanticCharacter";
import type { Letter } from "@/lib/gift-data";

interface LettersSectionProps {
  letters: Letter[];
}

export function LettersSection({ letters }: LettersSectionProps) {
  const [openLetter, setOpenLetter] = useState<string | null>(null);

  return (
    <SectionWrapper
      id="letters"
      eyebrowLabel="WORDS FROM MY HEART"
      title="Love Letters"
      subtitle="For the things I feel deeply, even when I don't always say them well."
      emoji="💌"
      bgVariant="cream"
      chapterNumber={7}
      nextSectionId="notebook"
      nextSectionLabel="Our Little Notebook"
      nextSectionEmoji="📖"
    >
      {/* Gentle love letters character companion */}
      <div className="flex justify-center -mt-3 mb-6">
        <RomanticCharacter
          character="tenderCouple"
          size={180}
          animation="soft-breathe"
          sparkles
        />
      </div>

      <div className="space-y-8">
        {letters.map((letter, i) => (
          <LetterCard
            key={letter.id}
            letter={letter}
            index={i}
            isOpen={openLetter === letter.id}
            onToggle={() => setOpenLetter(openLetter === letter.id ? null : letter.id)}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}

function LetterCard({
  letter,
  index,
  isOpen,
  onToggle,
}: {
  letter: Letter;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.6 }}
      className="max-w-3xl mx-auto"
    >
      {/* Letter envelope / trigger */}
      <motion.button
        onClick={onToggle}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full text-left rounded-2xl p-6 md:p-8 cursor-pointer transition-all duration-300 group relative overflow-hidden"
        style={{
          background: isOpen
            ? "linear-gradient(135deg, var(--white) 0%, var(--pale-rose) 100%)"
            : "var(--white)",
          border: `1px solid ${isOpen ? "var(--pink-primary)" : "var(--border-subtle)"}`,
          boxShadow: isOpen
            ? "0 8px 40px var(--shadow-pink-strong)"
            : "0 2px 12px var(--shadow-pink)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
              style={{
                background: "linear-gradient(135deg, var(--pale-rose) 0%, var(--bg-blush) 100%)",
              }}
            >
              <span className="text-xl">💌</span>
            </div>
            <div>
              <h3
                className="font-serif text-xl md:text-2xl font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {letter.title}
              </h3>
              <p className="text-xs font-rounded font-semibold text-[var(--pink-strong)] mt-1 flex items-center gap-1">
                <span>{isOpen ? "Reading now ♡" : "Read this letter ♡"}</span>
              </p>
            </div>
          </div>

          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-lg"
            style={{ color: "var(--pink-primary)" }}
          >
            ♡
          </motion.div>
        </div>
      </motion.button>

      {/* Letter content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div
              className="mt-4 rounded-2xl p-8 md:p-12 relative"
              style={{
                background: "var(--white)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "inset 0 2px 10px var(--shadow-pink)",
              }}
            >
              {/* Decorative top line */}
              <div
                className="absolute top-0 left-8 right-8 h-0.5"
                style={{
                  background: "linear-gradient(to right, transparent, var(--pink-primary), transparent)",
                }}
              />

              {/* Letter text */}
              <div className="space-y-4">
                {letter.content.split("\n\n").map((paragraph, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="text-base md:text-lg leading-relaxed font-serif italic"
                    style={{
                      color: "var(--text-primary)",
                      lineHeight: 1.9,
                    }}
                  >
                    {paragraph}
                  </motion.p>
                ))}
              </div>

              {/* Signature */}
              {letter.signature && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-8 text-right"
                >
                  <p
                    className="font-script text-xl md:text-2xl"
                    style={{ color: "var(--pink-strong)" }}
                  >
                    — {letter.signature}
                  </p>
                </motion.div>
              )}

              {/* Fold letter action */}
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[var(--pale-rose)]/80 hover:bg-[var(--pale-rose)] border border-[var(--border-subtle)] text-[var(--pink-strong)] hover:text-[var(--pink-deep)] font-rounded text-xs sm:text-sm font-semibold transition-all duration-200 shadow-2xs hover:shadow-xs hover:scale-102 active:scale-98 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pink-primary)]"
                  aria-label="Fold the letter"
                >
                  <span>Fold the letter</span>
                  <span className="text-sm">💌</span>
                </button>
              </div>

              {/* Shared Persistent Reactions & Comments */}
              <div className="mt-8 pt-4 border-t border-[var(--border-subtle)]">
                <SharedInteractions
                  targetType="letter"
                  targetId={letter.id}
                />
              </div>

              {/* Bottom decoration */}
              <div className="flex justify-center mt-6">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--bg-blush)">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

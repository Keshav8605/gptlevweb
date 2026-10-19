"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { SectionWrapper } from "../SectionWrapper";
import { SharedInteractions } from "../interactions/SharedInteractions";
import { RomanticCharacter } from "../RomanticCharacter";
import type { OpenWhenLetter } from "@/lib/gift-data";

interface OpenWhenSectionProps {
  letters: OpenWhenLetter[];
}

export function OpenWhenSection({ letters }: OpenWhenSectionProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [openedIds, setOpenedIds] = useState<Set<string>>(new Set());

  const handleOpen = (id: string) => {
    if (openId === id) {
      setOpenId(null);
    } else {
      setOpenId(id);
      setOpenedIds((prev) => new Set(prev).add(id));
    }
  };

  return (
    <SectionWrapper
      id="openWhenLetters"
      eyebrowLabel="FOR WHATEVER TODAY FEELS LIKE"
      title="Open When…"
      subtitle="Little letters for the moments when you need a little extra love."
      emoji="✉️"
      bgVariant="lavender"
      chapterNumber={11}
      nextSectionId="littleReasons"
      nextSectionLabel="Discover the reasons I love you ♡"
      nextSectionSubtitle="There are more reasons than I could ever fit into one letter. So I started a list."
      nextSectionEmoji="💗"
    >
      {/* Cozy envelope companion */}
      <div className="flex justify-center -mt-3 mb-4">
        <RomanticCharacter
          character="cozyCouple"
          size={180}
          animation="soft-breathe"
          sparkles
        />
      </div>

      <p className="text-center font-rounded text-xs sm:text-sm text-[var(--pink-strong)] font-medium -mt-1 mb-6">
        Choose the letter you need today.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {letters.map((letter, i) => (
          <EnvelopeCard
            key={letter.id}
            letter={letter}
            index={i}
            isOpen={openId === letter.id}
            wasOpened={openedIds.has(letter.id)}
            onToggle={() => handleOpen(letter.id)}
          />
        ))}
      </div>

      {/* Open letter overlay */}
      <AnimatePresence>
        {openId && (
          <OpenLetterOverlay
            letter={letters.find((l) => l.id === openId)!}
            onClose={() => setOpenId(null)}
          />
        )}
      </AnimatePresence>
    </SectionWrapper>
  );
}

function EnvelopeCard({
  letter,
  index,
  isOpen,
  wasOpened,
  onToggle,
}: {
  letter: OpenWhenLetter;
  index: number;
  isOpen: boolean;
  wasOpened: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20, rotate: ((index % 3) - 1) * 1.5 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className="w-full text-left rounded-2xl p-5 md:p-6 cursor-pointer transition-all duration-300 relative overflow-hidden group"
      style={{
        background: wasOpened
          ? "linear-gradient(135deg, var(--white) 0%, var(--pale-rose) 100%)"
          : "var(--white)",
        border: `1px solid ${isOpen ? "var(--pink-primary)" : "var(--border-subtle)"}`,
        boxShadow: isOpen
          ? "0 8px 30px var(--shadow-pink-strong)"
          : "0 2px 12px var(--shadow-pink)",
      }}
    >
      {/* Emoji */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
          {letter.emoji}
        </span>
        {wasOpened && (
          <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ background: "var(--pale-rose)", color: "var(--pink-strong)" }}>
            Read and kept close
          </span>
        )}
      </div>

      <h3
        className="font-serif text-lg md:text-xl font-semibold leading-tight"
        style={{ color: "var(--text-primary)" }}
      >
        {letter.title}
      </h3>

      <p className="mt-2 text-xs font-medium" style={{ color: "var(--pink-strong)" }}>
        Open this letter ♡
      </p>

      {/* Corner fold */}
      <div
        className="absolute top-0 right-0 w-8 h-8"
        style={{
          background: "linear-gradient(135deg, transparent 50%, var(--bg-blush) 50%)",
        }}
      />
    </motion.button>
  );
}

function OpenLetterOverlay({
  letter,
  onClose,
}: {
  letter: OpenWhenLetter;
  onClose: () => void;
}) {
  const [isSavedNearby, setIsSavedNearby] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const saved = localStorage.getItem(`gift_saved_letter_${letter.id}`);
      return saved === "true";
    } catch {
      return false;
    }
  });

  const handleToggleSaveNearby = () => {
    const next = !isSavedNearby;
    setIsSavedNearby(next);
    try {
      localStorage.setItem(`gift_saved_letter_${letter.id}`, String(next));
    } catch {}
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50"
        style={{ background: "rgba(73, 50, 63, 0.4)", backdropFilter: "blur(8px)" }}
      />

      {/* Letter modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed inset-4 md:inset-x-auto md:inset-y-8 md:max-w-2xl md:mx-auto z-50 rounded-3xl overflow-y-auto"
        style={{
          background: "var(--white)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 20px 60px rgba(73, 50, 63, 0.3)",
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 p-6 pb-4 z-10"
          style={{
            background: "linear-gradient(180deg, var(--white) 80%, transparent 100%)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{letter.emoji}</span>
              <div>
                <h3
                  className="font-serif text-2xl md:text-3xl font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {letter.title}
                </h3>
                {letter.heading && (
                  <p className="font-handwritten text-lg text-[var(--pink-strong)] mt-0.5">
                    {letter.heading}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200"
              style={{ background: "var(--pale-rose)", color: "var(--pink-strong)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-blush)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--pale-rose)"; }}
              aria-label="Fold it for later"
              title="Fold it for later"
            >
              ✕
            </button>
          </div>
          <div
            className="mt-4 h-px"
            style={{ background: "linear-gradient(to right, var(--pink-primary), transparent)" }}
          />
        </div>

        {/* Letter content */}
        <div className="px-6 md:px-10 pb-8 space-y-5">
          {!letter.content || letter.content.trim() === "" ? (
            <p className="text-base md:text-lg font-serif italic text-center text-[var(--text-muted)] py-10">
              This little letter is still being written.
            </p>
          ) : (
            letter.content.split("\n\n").map((paragraph, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.12 }}
                className="text-base md:text-lg font-serif italic leading-relaxed"
                style={{
                  color: "var(--text-primary)",
                  lineHeight: 1.9,
                }}
              >
                {paragraph}
              </motion.p>
            ))
          )}

          {/* Sweet companion alongside revealed letter message */}
          <div className="flex justify-center pt-2 pb-2">
            <RomanticCharacter
              character="tenderCouple"
              size={160}
              animation="gentle-float"
              sparkles
            />
          </div>

          {/* Action Row: Save Nearby & Fold for Later */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={handleToggleSaveNearby}
              className={`px-4 py-2 rounded-full text-xs font-rounded font-semibold cursor-pointer transition-all inline-flex items-center gap-1.5 ${
                isSavedNearby
                  ? "bg-[var(--pink-primary)] text-white shadow-xs"
                  : "bg-[var(--pale-rose)] text-[var(--pink-strong)] hover:bg-[var(--bg-blush)]"
              }`}
            >
              <span>{isSavedNearby ? "📌" : "♡"}</span>
              <span>{isSavedNearby ? "Kept nearby ♡" : "Keep this letter nearby"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-white border border-[var(--border-subtle)] hover:bg-[var(--pale-rose)] text-xs font-rounded font-semibold text-[var(--text-secondary)] hover:text-[var(--pink-strong)] cursor-pointer transition-colors inline-flex items-center gap-1.5"
            >
              <span>Fold it for later</span>
            </button>
          </div>

          {/* Signature */}
          {letter.signature && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="pt-2 text-right"
            >
              <p
                className="font-script text-xl md:text-2xl"
                style={{ color: "var(--pink-strong)" }}
              >
                — {letter.signature}
              </p>
            </motion.div>
          )}

          {/* Shared Persistent Reactions & Comments */}
          <div className="pt-6 border-t border-[var(--border-subtle)]">
            <SharedInteractions
              targetType="openWhen"
              targetId={letter.id}
            />
          </div>

          {/* Bottom heart */}
          <div className="flex justify-center pt-6">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--pink-primary)" opacity={0.5}>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

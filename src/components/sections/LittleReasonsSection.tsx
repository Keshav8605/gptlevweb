"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { SectionWrapper } from "../SectionWrapper";
import { RomanticCharacter } from "../RomanticCharacter";
import type { LittleReason } from "@/lib/gift-data";

import { hundredReasonsList } from "@/lib/reasons-data";

export const defaultReasonsList: LittleReason[] = hundredReasonsList.slice(0, 5);

interface LittleReasonsSectionProps {
  reasons?: LittleReason[];
}

export function LittleReasonsSection({ reasons = defaultReasonsList }: LittleReasonsSectionProps) {
  const activeReasons = reasons.length > 0 ? reasons : defaultReasonsList;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

  const [savedFavorites, setSavedFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("gift_favorite_reasons");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const currentReason = activeReasons[currentIndex];
  const isFavorited = currentReason ? savedFavorites.includes(currentReason.id) : false;

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => Math.min(prev + 1, activeReasons.length - 1));
  };

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleRandom = useCallback(() => {
    const available = activeReasons
      .map((_, i) => i)
      .filter((i) => i !== currentIndex);
    if (available.length === 0) return;
    const randomIdx = available[Math.floor(Math.random() * available.length)];
    setDirection(1);
    setCurrentIndex(randomIdx);
  }, [currentIndex, activeReasons]);

  const toggleFavorite = () => {
    if (!currentReason) return;
    const updated = isFavorited
      ? savedFavorites.filter((id) => id !== currentReason.id)
      : [...savedFavorites, currentReason.id];

    setSavedFavorites(updated);
    try {
      localStorage.setItem("gift_favorite_reasons", JSON.stringify(updated));
    } catch {}
  };

  const favoriteReasonsList = activeReasons.filter((r) => savedFavorites.includes(r.id));

  return (
    <SectionWrapper
      id="littleReasons"
      eyebrowLabel="A LIST THAT COULD KEEP GROWING"
      title="Little Reasons I Love You"
      subtitle="I started counting. Then I remembered that loving you isn't something I can finish counting."
      emoji="💗"
      bgVariant="cream"
      chapterNumber={12}
      nextSectionId="digitalGifts"
      nextSectionLabel="Open your little gifts 🎁"
      nextSectionSubtitle="And because words are lovely, but showing up for each other matters too, I have a few little promises for you."
      nextSectionEmoji="🎁"
    >
      <div className="max-w-2xl mx-auto text-center">
        {/* Tender loving couple */}
        <div className="my-2 flex justify-center">
          <RomanticCharacter
            character="tenderCouple"
            size={200}
            animation="gentle-float"
            sparkles
          />
        </div>

        {/* Introduction line */}
        <p className="font-rounded text-sm sm:text-base font-semibold text-[var(--pink-strong)] mb-6">
          Here are a few of my favorites. ♡
        </p>

        {/* Top Control Bar: Progress Counter & Saved Reasons link */}
        <div className="flex items-center justify-between px-2 mb-4 pb-2 border-b border-[var(--border-subtle)] text-xs">
          <span className="font-rounded font-bold tracking-wider text-[var(--pink-strong)] uppercase">
            REASON {String(currentIndex + 1).padStart(2, "0")} OF {String(activeReasons.length).padStart(2, "0")}
          </span>

          <button
            onClick={() => setShowFavoritesModal(true)}
            className="font-rounded font-semibold text-[var(--pink-deep)] hover:underline cursor-pointer flex items-center gap-1.5"
          >
            <span>♥ Your saved reasons ({savedFavorites.length})</span>
          </button>
        </div>

        {/* Reason Card Display */}
        <div className="relative min-h-[240px] flex items-center justify-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentReason?.id || currentIndex}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -direction * 40, scale: 0.95 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="w-full bg-white rounded-3xl p-6 sm:p-10 text-center border border-[var(--border-subtle)] shadow-md relative overflow-hidden space-y-4"
            >
              {/* Emoji badge */}
              <div className="w-14 h-14 mx-auto rounded-full bg-[var(--soft-pink)] flex items-center justify-center text-3xl mb-2 shadow-2xs">
                {currentReason?.emoji || "💕"}
              </div>

              {/* Reason Title & Supporting line */}
              {currentReason?.title ? (
                <div className="space-y-2">
                  <h4 className="font-serif text-2xl sm:text-3xl font-bold leading-snug text-[var(--romantic-plum)]">
                    {currentReason.title}
                  </h4>
                  {currentReason.supportingText && (
                    <p className="font-serif italic text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-lg mx-auto">
                      &ldquo;{currentReason.supportingText}&rdquo;
                    </p>
                  )}
                </div>
              ) : (
                <p className="font-serif text-xl sm:text-2xl font-medium leading-relaxed text-[var(--romantic-plum)]">
                  &ldquo;{currentReason?.text}&rdquo;
                </p>
              )}

              {/* Card Footer: Favorite action */}
              <div className="flex items-center justify-center pt-2">
                <button
                  onClick={toggleFavorite}
                  className={`px-5 py-2 rounded-full text-xs font-rounded font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isFavorited
                      ? "bg-[var(--pink-primary)] text-white border-[var(--pink-strong)] shadow-xs"
                      : "bg-[var(--pale-rose)] text-[var(--pink-strong)] border-[var(--border-subtle)] hover:bg-[var(--bg-blush)]"
                  }`}
                >
                  <span>{isFavorited ? "♥ Tucked into your favorites" : "♡ Keep this one close ♡"}</span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls: Prev, Surprise Me, Next */}
        <div className="flex items-center justify-between mt-6 pt-2">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-rounded font-medium text-[var(--text-secondary)] hover:bg-white/60 disabled:opacity-30 cursor-pointer transition-colors"
          >
            ← Previous
          </button>

          <button
            onClick={handleRandom}
            className="px-6 py-2.5 rounded-full bg-white border border-[var(--border-medium)] text-[var(--pink-strong)] hover:bg-[var(--soft-pink)] text-xs font-rounded font-semibold cursor-pointer transition-all shadow-2xs hover:scale-105"
          >
            Surprise me ♡
          </button>

          {currentIndex === activeReasons.length - 1 ? (
            <button
              onClick={() => {
                setDirection(1);
                setCurrentIndex(0);
              }}
              className="px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-rounded font-semibold bg-gradient-to-r from-[var(--pink-strong)] to-[var(--pink-primary)] text-white hover:opacity-95 cursor-pointer transition-all shadow-xs hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pink-primary)]"
              aria-label="Read from Reason 1"
            >
              Read from Reason 01 ↺
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-rounded font-semibold bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white hover:opacity-95 cursor-pointer transition-all shadow-xs hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pink-primary)]"
              aria-label="Next reason"
            >
              Next reason →
            </button>
          )}
        </div>

        {/* Progress Line */}
        <div className="mt-5 h-1.5 rounded-full bg-[var(--border-subtle)] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)]"
            animate={{ width: `${((currentIndex + 1) / activeReasons.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Favorites Modal */}
      <AnimatePresence>
        {showFavoritesModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFavoritesModal(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg w-full z-50 bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[var(--border-subtle)] max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-4">
                <div>
                  <h3 className="font-rounded text-2xl font-bold text-[var(--romantic-plum)]">
                    Your saved reasons ♡
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    {favoriteReasonsList.length} moments kept close to your heart
                  </p>
                </div>
                <button
                  onClick={() => setShowFavoritesModal(false)}
                  className="w-8 h-8 rounded-full bg-[var(--pale-rose)] text-[var(--pink-strong)] flex items-center justify-center cursor-pointer hover:bg-[var(--bg-blush)]"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto space-y-3 flex-1 pr-1">
                {favoriteReasonsList.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[var(--text-muted)] space-y-2">
                    <span className="text-3xl block">💌</span>
                    <p>No favorites saved yet.</p>
                    <p className="italic">Click &ldquo;Keep this one close ♡&rdquo; on any reason to collect it here!</p>
                  </div>
                ) : (
                  favoriteReasonsList.map((reason) => (
                    <div
                      key={reason.id}
                      className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-start gap-3"
                    >
                      <span className="text-xl mt-0.5">{reason.emoji || "💗"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed">
                          &ldquo;{reason.text}&rdquo;
                        </p>
                        <button
                          onClick={() => {
                            const idx = activeReasons.findIndex((r) => r.id === reason.id);
                            if (idx !== -1) setCurrentIndex(idx);
                            setShowFavoritesModal(false);
                          }}
                          className="mt-2 text-[11px] font-semibold text-[var(--pink-strong)] hover:underline cursor-pointer"
                        >
                          Jump to this reason →
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </SectionWrapper>
  );
}

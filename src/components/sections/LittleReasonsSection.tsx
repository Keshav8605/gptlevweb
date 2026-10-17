"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { SectionWrapper } from "../SectionWrapper";
import type { LittleReason } from "@/lib/gift-data";

export const defaultReasonsList: LittleReason[] = [
  { id: "lr1", text: "The way you hold my hand a little tighter whenever we cross the street.", emoji: "🤝" },
  { id: "lr2", text: "How your entire face lights up when your food arrives at the table.", emoji: "😋" },
  { id: "lr3", text: "That tiny sleepy sigh you make right before you drift off to sleep.", emoji: "😴" },
  { id: "lr4", text: "The way you remember the smallest things I told you months ago.", emoji: "💭" },
  { id: "lr5", text: "How safe the whole world feels the second your arms are around me.", emoji: "🫂" },
  { id: "lr6", text: "Your ridiculous, contagious laugh that makes everyone in the room smile.", emoji: "😂" },
  { id: "lr7", text: "The way you check if I'm warm enough, even when you're freezing yourself.", emoji: "🧣" },
  { id: "lr8", text: "How passionate you get talking about the things you truly care about.", emoji: "✨" },
  { id: "lr9", text: "The gentle forehead kisses that heal even the heaviest days.", emoji: "🥺" },
  { id: "lr10", text: "The funny faces you make when you think no one is watching.", emoji: "🤪" },
  { id: "lr11", text: "How your hand fits so effortlessly and perfectly inside mine.", emoji: "🤍" },
  { id: "lr12", text: "The little notes and memes you send just to make my day brighter.", emoji: "💌" },
  { id: "lr13", text: "How deeply patient and kind you are, even when everything is stressful.", emoji: "🌸" },
  { id: "lr14", text: "The way you look at me across a crowded room and smile just for me.", emoji: "👀" },
  { id: "lr15", text: "Your unconditional loyalty and how fiercely you stand by the people you love.", emoji: "🛡️" },
  { id: "lr16", text: "How you make ordinary trips to the grocery store feel like our private adventure.", emoji: "🛒" },
  { id: "lr17", text: "The sound of your voice first thing in the morning.", emoji: "☀️" },
  { id: "lr18", text: "How you always believe in me, even when I forget to believe in myself.", emoji: "🌱" },
  { id: "lr19", text: "The way you dance with zero inhibition when your favorite song plays.", emoji: "💃" },
  { id: "lr20", text: "Simply because out of 8 billion people, loving you is the easiest choice I've ever made.", emoji: "💖" },
];

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
      title="Little Reasons Why I Love You"
      subtitle="A collection of the countless daily moments and habits that make my heart adore you"
      emoji="💗"
      bgVariant="cream"
    >
      <div className="max-w-xl mx-auto">
        {/* Top Control Bar: Counter & Favorites button */}
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--pink-strong)]">
              Reason {currentIndex + 1} of {activeReasons.length}
            </span>
          </div>

          <button
            onClick={() => setShowFavoritesModal(true)}
            className="text-xs font-semibold text-[var(--pink-deep)] hover:underline cursor-pointer flex items-center gap-1.5"
          >
            <span>♥ Saved Favorites ({savedFavorites.length})</span>
          </button>
        </div>

        {/* Reason Card Display */}
        <div className="relative min-h-[260px] flex items-center justify-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentReason?.id || currentIndex}
              custom={direction}
              initial={{ opacity: 0, x: direction * 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -direction * 50, scale: 0.95 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="w-full bg-white rounded-3xl p-8 sm:p-12 text-center border border-[var(--border-subtle)] shadow-[0_8px_30px_var(--shadow-pink)] relative overflow-hidden"
            >
              {/* Emoji badge */}
              <div className="w-16 h-16 mx-auto rounded-full bg-[var(--pale-rose)] flex items-center justify-center text-3xl mb-6 shadow-xs">
                {currentReason?.emoji || "💕"}
              </div>

              {/* Reason Text */}
              <p className="font-serif text-xl sm:text-2xl font-medium leading-relaxed text-[var(--text-primary)] mb-6">
                &ldquo;{currentReason?.text}&rdquo;
              </p>

              {/* Card Footer: Favorite heart */}
              <div className="flex items-center justify-center">
                <button
                  onClick={toggleFavorite}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isFavorited
                      ? "bg-[var(--pink-primary)] text-white border-[var(--pink-strong)] shadow-sm"
                      : "bg-[var(--pale-rose)] text-[var(--pink-strong)] border-[var(--border-subtle)] hover:bg-[var(--bg-blush)]"
                  }`}
                >
                  <span>{isFavorited ? "♥ Saved to Favorites" : "♡ Save to Favorites"}</span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls: Prev, Random, Next */}
        <div className="flex items-center justify-between mt-8 pt-2">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-[var(--text-secondary)] disabled:opacity-30 cursor-pointer"
          >
            ← Previous
          </button>

          <button
            onClick={handleRandom}
            className="px-5 py-2.5 rounded-full bg-[var(--pale-rose)] text-[var(--pink-strong)] hover:bg-[var(--bg-blush)] text-xs font-semibold cursor-pointer transition-colors shadow-xs"
          >
            🎲 Surprise Me
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === activeReasons.length - 1}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[var(--pink-strong)] text-white hover:bg-[var(--pink-deep)] disabled:opacity-30 cursor-pointer transition-colors"
          >
            Next Reason →
          </button>
        </div>

        {/* Subtle Progress Line */}
        <div className="mt-6 h-1 rounded-full bg-[var(--border-subtle)] overflow-hidden">
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
                  <h3 className="font-serif text-2xl font-semibold text-[var(--text-primary)]">
                    Your Saved Reasons ♥
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    {favoriteReasonsList.length} moments close to your heart
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
                    <p className="italic">Click &ldquo;♡ Save to Favorites&rdquo; on any reason to collect it here!</p>
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

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { SectionWrapper } from "../SectionWrapper";
import { RomanticCharacter } from "../RomanticCharacter";
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
      title=""
      subtitle=""
      emoji="💗"
      bgVariant="cream"
    >
      <div className="max-w-2xl mx-auto text-center">
        {/* Pink pill badge (Matching Reference 4) */}
        <div className="inline-block px-4 py-1.5 rounded-full bg-[var(--pink-strong)] text-white text-xs font-rounded font-semibold tracking-wide shadow-xs mb-4">
          a list. for u. only u.
        </div>

        {/* Multi-Font Styled Romantic Title (Matching Reference 4) */}
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--romantic-plum)] leading-tight select-none mb-3">
          <span className="font-rounded text-[#A588B8] pr-2">reasons</span>
          <span className="font-script text-[var(--pink-primary)] font-normal text-5xl sm:text-6xl pr-2">why</span>
          <span className="font-rounded text-[var(--romantic-plum)] pr-2">i love</span>
          <span className="font-script text-[var(--pink-strong)] font-normal text-5xl sm:text-6xl">you</span>
        </h2>

        {/* Tender loving couple (Authentic PNG Illustration) */}
        <div className="my-2 flex justify-center">
          <RomanticCharacter
            character="tenderCouple"
            size={155}
            animation="gentle-float"
            sparkles
          />
        </div>

        {/* Playful Subtitle (Matching Reference 4) */}
        <div className="space-y-1 mb-8">
          <p className="font-handwritten text-lg sm:text-xl text-[var(--text-secondary)]">
            i sat down, counted, it took a while.
          </p>
          <p className="font-rounded text-sm sm:text-base font-medium text-[var(--pink-strong)]">
            there&apos;s like a million okay, here&apos;s some 🥹
          </p>
        </div>

        {/* Top Control Bar: Reason Counter & Saved Favorites link */}
        <div className="flex items-center justify-between px-2 mb-4 pb-2 border-b border-[var(--border-subtle)] text-xs">
          <span className="font-rounded font-semibold tracking-wider text-[var(--pink-strong)] uppercase">
            Reason #{currentIndex + 1} of {activeReasons.length}
          </span>

          <button
            onClick={() => setShowFavoritesModal(true)}
            className="font-rounded font-semibold text-[var(--pink-deep)] hover:underline cursor-pointer flex items-center gap-1.5"
          >
            <span>♥ Saved Favorites ({savedFavorites.length})</span>
          </button>
        </div>

        {/* Reason Card Display */}
        <div className="relative min-h-[220px] flex items-center justify-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentReason?.id || currentIndex}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -direction * 40, scale: 0.95 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="w-full bg-white rounded-3xl p-6 sm:p-10 text-center border border-[var(--border-subtle)] shadow-md relative overflow-hidden"
            >
              {/* Emoji badge */}
              <div className="w-14 h-14 mx-auto rounded-full bg-[var(--soft-pink)] flex items-center justify-center text-3xl mb-4 shadow-2xs">
                {currentReason?.emoji || "💕"}
              </div>

              {/* Reason Text */}
              <p className="font-serif text-xl sm:text-2xl font-medium leading-relaxed text-[var(--romantic-plum)] mb-6">
                &ldquo;{currentReason?.text}&rdquo;
              </p>

              {/* Card Footer: Favorite heart */}
              <div className="flex items-center justify-center">
                <button
                  onClick={toggleFavorite}
                  className={`px-5 py-2 rounded-full text-xs font-rounded font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isFavorited
                      ? "bg-[var(--pink-primary)] text-white border-[var(--pink-strong)] shadow-xs"
                      : "bg-[var(--pale-rose)] text-[var(--pink-strong)] border-[var(--border-subtle)] hover:bg-[var(--bg-blush)]"
                  }`}
                >
                  <span>{isFavorited ? "♥ Saved in My Heart" : "♡ Save to Favorites"}</span>
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
            🎲 Surprise Me
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === activeReasons.length - 1}
            className="px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-rounded font-semibold bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white hover:opacity-95 disabled:opacity-30 cursor-pointer transition-all shadow-xs hover:scale-105"
          >
            Next Reason →
          </button>
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

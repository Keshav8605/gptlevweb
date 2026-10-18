"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStoryTransition } from "@/context/StoryTransitionContext";
import { RomanticCharacter } from "../RomanticCharacter";

export function StoryTransitionOverlay() {
  const {
    isTransitioning,
    transitionPhase,
    activeTransition,
    outgoingChapter,
    incomingChapter,
  } = useStoryTransition();

  if (!isTransitioning || transitionPhase === "idle") {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="transition-overlay-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center overflow-hidden"
      >
        {/* Soft atmospheric backdrop glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: transitionPhase === "bridge" ? 1 : 0.88 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-gradient-to-b from-[#FFF5F9]/95 via-[#FFF0F5]/98 to-[#EDE2FA]/95 backdrop-blur-md"
        />

        {/* Emotion-Driven Visual Bridges */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-lg">
          {/* 1. HEART PORTAL: Welcome -> Things I Notice */}
          {activeTransition === "heart-portal" && (
            <motion.div
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{
                scale: transitionPhase === "bridge" ? [0.6, 1.25, 2.8] : 1,
                opacity: 1,
              }}
              exit={{ scale: 3.5, opacity: 0 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-full h-full text-[var(--pink-primary)] drop-shadow-[0_10px_35px_rgba(255,95,150,0.45)] fill-current"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.1, 1] }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <RomanticCharacter
                    character="kissingCouple"
                    size={90}
                    decorative
                  />
                </motion.div>
              </div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 font-handwritten text-xl text-[var(--pink-strong)]"
              >
                Entering Chapter 2 · Things I Noticed About You ♡
              </motion.p>
            </motion.div>
          )}

          {/* 2. BLUSH POLAROID: Things I Notice -> Memories */}
          {activeTransition === "blush-polaroid" && (
            <motion.div
              initial={{ scale: 0.6, rotate: -12, opacity: 0, y: 40 }}
              animate={{
                scale: transitionPhase === "bridge" ? 1.05 : 1,
                rotate: transitionPhase === "bridge" ? 3 : -2,
                opacity: 1,
                y: 0,
              }}
              exit={{ scale: 1.2, opacity: 0, y: -30 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="p-4 pb-6 bg-white rounded-2xl shadow-2xl border-2 border-[var(--border-subtle)] w-64 transform"
            >
              <div className="aspect-square w-full rounded-xl overflow-hidden bg-[var(--soft-pink)] flex items-center justify-center relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80"
                  alt="Scrapbook Bridge"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 right-2 text-2xl">📸</span>
              </div>
              <p className="mt-3 font-handwritten text-center text-base text-[var(--romantic-plum)] font-semibold">
                Opening Our Scrapbook... ♡
              </p>
            </motion.div>
          )}

          {/* 3. HEART PADLOCK: Memories -> Secret World */}
          {activeTransition === "heart-padlock" && (
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.25, opacity: 0 }}
              transition={{ duration: 0.65 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{
                  rotate: [0, -8, 8, 0],
                  scale: [1, 1.08, 1],
                }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#FFCADB] to-[#EDE2FA] p-4 shadow-xl flex items-center justify-center text-5xl border border-white"
              >
                🔐
              </motion.div>
              <p className="mt-4 font-handwritten text-xl text-[var(--pink-strong)]">
                Unlocking Our Secret Haven... ✨
              </p>
            </motion.div>
          )}

          {/* 4. BOUNCING HEARTS: Secret World -> Delulu Mode */}
          {activeTransition === "bouncing-hearts" && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center gap-3">
                <motion.span
                  animate={{ y: [0, -18, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
                  className="text-5xl"
                >
                  🦋
                </motion.span>
                <motion.span
                  animate={{ y: [-10, 8, -10] }}
                  transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
                  className="text-6xl"
                >
                  💖
                </motion.span>
                <motion.span
                  animate={{ y: [0, -18, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                  className="text-5xl"
                >
                  ✨
                </motion.span>
              </div>
              <p className="mt-4 font-rounded font-bold text-lg text-[var(--pink-strong)]">
                Activating Delulu Mode 🦋
              </p>
            </motion.div>
          )}

          {/* 5. QUIZ SPARKLE: Delulu -> Quiz */}
          {activeTransition === "quiz-sparkle" && (
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.15, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center text-4xl border border-[var(--border-subtle)]"
              >
                ❓
              </motion.div>
              <p className="mt-4 font-handwritten text-xl text-[var(--pink-strong)]">
                How Well Do You Know Us? ♡
              </p>
            </motion.div>
          )}

          {/* 6. ENVELOPE UNFOLD: Quiz -> Love Letters */}
          {activeTransition === "envelope-unfold" && (
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.1, opacity: 0, y: -20 }}
              transition={{ duration: 0.65 }}
              className="flex flex-col items-center"
            >
              <div className="w-32 h-24 bg-[#FFF9F3] border-2 border-[#EAD5C3] rounded-lg shadow-xl relative flex items-center justify-center">
                <div className="absolute top-0 left-0 right-0 h-10 border-b-2 border-[#EAD5C3] bg-[#F7ECE1] rounded-t-lg flex items-center justify-center">
                  <span className="text-xl">💌</span>
                </div>
                <span className="text-xs font-handwritten text-[#9C6D58] mt-6 font-semibold">
                  To My Favorite Human
                </span>
              </div>
              <p className="mt-4 font-handwritten text-xl text-[var(--pink-strong)]">
                Unfolding Love Letters... ♡
              </p>
            </motion.div>
          )}

          {/* 7. JOURNAL FLIP: Love Letters -> Notebook */}
          {activeTransition === "journal-flip" && (
            <motion.div
              initial={{ rotateY: -70, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 70, opacity: 0 }}
              transition={{ duration: 0.65 }}
              className="flex flex-col items-center"
            >
              <div className="w-28 h-36 bg-[#FFF8FA] border-2 border-[#E8CCD7] rounded-r-xl shadow-2xl flex flex-col items-center justify-center p-3 relative">
                <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-[#DDAEBF] rounded-l" />
                <span className="text-3xl mb-1">📖</span>
                <span className="font-script text-base text-[var(--pink-strong)]">Our Diary</span>
              </div>
              <p className="mt-4 font-handwritten text-xl text-[var(--pink-strong)]">
                Turning to Our Shared Pages... ✨
              </p>
            </motion.div>
          )}

          {/* 8. VOICE RIPPLES: Notebook -> Voice Messages */}
          {activeTransition === "voice-ripples" && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className="flex flex-col items-center relative"
            >
              <div className="relative w-28 h-28 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full bg-[var(--pink-primary)]/30"
                />
                <motion.div
                  animate={{ scale: [1, 1.4], opacity: [0.8, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.3, ease: "easeOut" }}
                  className="absolute inset-2 rounded-full bg-[var(--pink-light)]/40"
                />
                <div className="relative z-10 w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center text-3xl border border-[var(--border-subtle)]">
                  🎙️
                </div>
              </div>
              <p className="mt-4 font-handwritten text-xl text-[var(--pink-strong)]">
                Tuning in to Voice Whispers... ♡
              </p>
            </motion.div>
          )}

          {/* 9. DATE POSTCARD: Voice -> Plan a Date */}
          {activeTransition === "date-postcard" && (
            <motion.div
              initial={{ rotate: -10, scale: 0.7, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 10, scale: 1.1, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="w-36 h-28 bg-white border-2 border-[var(--border-subtle)] rounded-xl shadow-xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-[var(--pink-deep)] font-bold font-rounded">
                  <span>🗺️ ADVENTURE</span>
                  <span>♡</span>
                </div>
                <div className="text-center font-handwritten text-lg text-[var(--romantic-plum)]">
                  Our Next Date
                </div>
                <div className="flex justify-end text-xs">✨</div>
              </div>
              <p className="mt-4 font-handwritten text-xl text-[var(--pink-strong)]">
                Planning Our Next Little Date... ♡
              </p>
            </motion.div>
          )}

          {/* 10. WAX ENVELOPE: Plan a Date -> Open When */}
          {activeTransition === "wax-envelope" && (
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="w-28 h-20 bg-[#FFF0F5] border-2 border-[#FFCADB] rounded-lg shadow-xl relative flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-[#E04D74] shadow-md flex items-center justify-center text-white text-xs font-bold">
                  ♥
                </div>
              </div>
              <p className="mt-4 font-handwritten text-xl text-[var(--pink-strong)]">
                Opening Sealed Letters... ✉️
              </p>
            </motion.div>
          )}

          {/* 11. PETAL SPIRAL: Open When -> Reasons I Love You */}
          {activeTransition === "petal-spiral" && (
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.25, opacity: 0 }}
              className="flex flex-col items-center relative"
            >
              <div className="relative w-32 h-32 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 flex items-center justify-between"
                >
                  <span className="text-2xl">🌸</span>
                  <span className="text-2xl">💗</span>
                </motion.div>
                <span className="text-5xl">💐</span>
              </div>
              <p className="mt-4 font-handwritten text-xl text-[var(--pink-strong)]">
                A Hundred Little Reasons Why... ♡
              </p>
            </motion.div>
          )}

          {/* 12. GIFT RIBBON: Reasons -> Little Gifts */}
          {activeTransition === "gift-ribbon" && (
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#FF5F96] to-[#FF8BA7] shadow-xl p-2 flex items-center justify-center text-4xl border-2 border-white">
                🎁
              </div>
              <p className="mt-4 font-handwritten text-xl text-[var(--pink-strong)]">
                Unwrapping Gifts I Owe You... ✨
              </p>
            </motion.div>
          )}

          {/* 13. VINYL MELODY: Little Gifts -> Our Song */}
          {activeTransition === "vinyl-melody" && (
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 rounded-full bg-stone-900 border-4 border-[#FFCADB] shadow-2xl flex items-center justify-center relative"
              >
                <div className="w-8 h-8 rounded-full bg-[#FF5F96] flex items-center justify-center text-white text-xs">
                  ♪
                </div>
              </motion.div>
              <p className="mt-4 font-handwritten text-xl text-[var(--pink-strong)]">
                Playing Our Melody... 🎵
              </p>
            </motion.div>
          )}

          {/* 14. GRAND PORTAL: Our Song -> Final Collage */}
          {activeTransition === "grand-portal" && (
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{
                scale: transitionPhase === "bridge" ? [0.8, 1.4, 2.6] : 1,
                opacity: 1,
              }}
              exit={{ scale: 3.5, opacity: 0 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-full h-full text-[var(--pink-primary)] drop-shadow-[0_15px_40px_rgba(255,95,150,0.6)] fill-current"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                  ❤️
                </div>
              </div>
              <p className="mt-4 font-handwritten text-2xl text-[var(--pink-strong)] font-bold">
                A Thousand Little Moments, One Big Love... ♡
              </p>
            </motion.div>
          )}

          {/* 15. GENTLE FADE: Fallback / Reverse / Accessibility */}
          {activeTransition === "gentle-fade" && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.05, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-white/90 shadow-md flex items-center justify-center text-3xl">
                {incomingChapter?.emoji || "♡"}
              </div>
              <p className="mt-3 font-handwritten text-lg text-[var(--pink-strong)]">
                {incomingChapter ? `Chapter ${incomingChapter.chapterNumber} · ${incomingChapter.title}` : "Continuing our story... ♡"}
              </p>
            </motion.div>
          )}

          {/* Emotional connecting subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 0.8, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-[var(--border-subtle)] text-[11px] font-rounded font-semibold text-[var(--text-secondary)] shadow-2xs"
          >
            <span>{outgoingChapter?.emoji}</span>
            <span>→</span>
            <span>{incomingChapter?.emoji}</span>
            <span className="text-[var(--pink-deep)]">
              {incomingChapter ? incomingChapter.navLabel : "Next Moment"}
            </span>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

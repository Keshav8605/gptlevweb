"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStoryScene } from "@/context/StorySceneContext";

export function HeartSceneTransition() {
  const {
    isTransitioning,
    transitionPhase,
    transitionType,
    targetChapterId,
    chapterList,
  } = useStoryScene();

  const targetChapter = useMemo(() => {
    return chapterList.find((c) => c.id === targetChapterId);
  }, [chapterList, targetChapterId]);

  // Generate deterministic floating mini-hearts for the constellation
  const floatingParticles = useMemo(() => {
    const emojis = ["💕", "💖", "✨", "🌸", "🤍", "🌷", "🎀", "💗"];
    return Array.from({ length: 14 }).map((_, i) => {
      const angle = (i / 14) * 2 * Math.PI;
      const distance = 110 + (i % 3) * 45;
      return {
        id: i,
        emoji: emojis[i % emojis.length],
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        delay: 0.05 + (i % 5) * 0.04,
        scale: 0.8 + (i % 3) * 0.25,
      };
    });
  }, []);

  if (!isTransitioning) return null;

  return (
    <div
      aria-live="polite"
      aria-busy={isTransitioning}
      className="fixed inset-0 z-50 overflow-hidden pointer-events-auto flex items-center justify-center select-none"
    >
      {/* 1. Romantic Dreamy Backdrop Tint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: transitionPhase === "exit" ? 0 : 1,
        }}
        transition={{
          duration: transitionPhase === "exit" ? 0.45 : 0.35,
          ease: "easeInOut",
        }}
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, #FFF5F9 0%, #FFEBF2 45%, #F5E8FF 100%)",
        }}
      />

      {/* 2. Signature Heart Portal */}
      {transitionType === "heart-portal" && (
        <div className="relative z-10 flex flex-col items-center justify-center">
          {/* Expanding Heart Portal Outer Rings */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{
              scale: transitionPhase === "exit" ? 38 : transitionPhase === "active" ? 32 : 1.25,
              opacity: transitionPhase === "exit" ? 0 : 0.4,
            }}
            transition={{
              duration: transitionPhase === "exit" ? 0.48 : 0.45,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="absolute w-72 h-72 rounded-full border-4 border-[var(--pink-primary)]/40 pointer-events-none"
          />

          {/* Core SVG Heart Portal (Scales up into an expansive romantic portal) */}
          <motion.div
            initial={{ scale: 0.15, opacity: 0 }}
            animate={{
              scale:
                transitionPhase === "exit"
                  ? 36
                  : transitionPhase === "active"
                  ? 30
                  : 1,
              opacity: transitionPhase === "exit" ? 0 : 1,
            }}
            transition={{
              duration: transitionPhase === "exit" ? 0.5 : 0.45,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative flex items-center justify-center"
          >
            <svg
              viewBox="0 0 100 100"
              className="w-56 h-56 sm:w-64 sm:h-64 drop-shadow-[0_0_35px_rgba(255,95,150,0.55)]"
            >
              <defs>
                <linearGradient id="portalHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF70A6" />
                  <stop offset="50%" stopColor="#FF477E" />
                  <stop offset="100%" stopColor="#FF2A6D" />
                </linearGradient>
                <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <path
                d="M50,88 C50,88 12,58 12,32 C12,18 24,10 36,10 C43,10 48,14 50,18 C52,14 57,10 64,10 C76,10 88,18 88,32 C88,58 50,88 50,88 Z"
                fill="url(#portalHeartGrad)"
                filter="url(#softGlow)"
              />

              {/* Inner Heart Highlight Silhouette */}
              <path
                d="M50,78 C50,78 20,52 20,32 C20,22 28,16 36,16 C42,16 46,19 48,22 C49,24 51,24 52,22 C54,19 58,16 64,16 C72,16 80,22 80,32 C80,52 50,78 50,78 Z"
                fill="none"
                stroke="rgba(255, 255, 255, 0.45)"
                strokeWidth="2.5"
                strokeDasharray="4 3"
              />
            </svg>
          </motion.div>

          {/* Constellation of Orbiting Floating Mini Hearts */}
          <AnimatePresence>
            {transitionPhase === "enter" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
              >
                {floatingParticles.map((p) => (
                  <motion.span
                    key={p.id}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                    animate={{
                      x: p.x,
                      y: p.y,
                      scale: p.scale,
                      opacity: [0, 1, 0.85],
                    }}
                    transition={{
                      delay: p.delay,
                      duration: 0.42,
                      ease: "easeOut",
                    }}
                    className="absolute text-xl sm:text-2xl filter drop-shadow-sm select-none"
                  >
                    {p.emoji}
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chapter Destination Eyebrow & Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{
              opacity: transitionPhase === "exit" ? 0 : 1,
              y: transitionPhase === "exit" ? -15 : 0,
            }}
            transition={{ duration: 0.32 }}
            className="absolute bottom-8 sm:bottom-12 flex flex-col items-center text-center px-4"
          >
            <div className="px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[var(--border-subtle)] shadow-md flex items-center gap-2">
              <span className="text-sm animate-pulse-soft">✨</span>
              <span className="text-xs sm:text-sm font-rounded font-bold text-[var(--pink-strong)] tracking-wider uppercase">
                {targetChapter?.chapterNumber
                  ? `Entering Chapter ${targetChapter.chapterNumber}`
                  : "Unfolding Next Chapter"}
              </span>
              <span className="text-sm animate-pulse-soft">✨</span>
            </div>
            {targetChapter && (
              <p className="mt-2 text-sm sm:text-base font-handwritten text-[var(--romantic-plum)] font-semibold">
                {targetChapter.title} ♡
              </p>
            )}
          </motion.div>
        </div>
      )}

      {/* 3. Polaroid Reveal Transition */}
      {transitionType === "polaroid" && (
        <div className="relative z-10 flex flex-col items-center justify-center">
          {/* Central Heart Portal behind polaroids */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{
              scale: transitionPhase === "exit" ? 36 : transitionPhase === "active" ? 30 : 1,
              opacity: transitionPhase === "exit" ? 0 : 1,
            }}
            transition={{ duration: 0.45 }}
            className="relative"
          >
            <div className="w-56 h-56 rounded-full bg-gradient-to-tr from-[#FF5F96] to-[#FFA6C9] flex items-center justify-center shadow-2xl">
              <span className="text-5xl">📸</span>
            </div>
          </motion.div>

          {/* Decorative Flying Polaroid Cards */}
          <AnimatePresence>
            {transitionPhase === "enter" && (
              <>
                <motion.div
                  initial={{ x: -220, y: -160, rotate: -25, opacity: 0 }}
                  animate={{ x: -110, y: -70, rotate: -8, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute w-28 h-36 bg-white p-2 pb-5 rounded-xl shadow-xl border border-pink-100 flex flex-col"
                >
                  <div className="w-full h-24 rounded-lg bg-pink-100/70 flex items-center justify-center text-xl">
                    🌸
                  </div>
                  <span className="mt-1 text-[8px] font-handwritten text-center text-pink-600">
                    cherished
                  </span>
                </motion.div>

                <motion.div
                  initial={{ x: 220, y: 140, rotate: 22, opacity: 0 }}
                  animate={{ x: 110, y: 60, rotate: 7, opacity: 1 }}
                  exit={{ x: 300, opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 }}
                  className="absolute w-28 h-36 bg-white p-2 pb-5 rounded-xl shadow-xl border border-pink-100 flex flex-col"
                >
                  <div className="w-full h-24 rounded-lg bg-purple-100/70 flex items-center justify-center text-xl">
                    ✨
                  </div>
                  <span className="mt-1 text-[8px] font-handwritten text-center text-pink-600">
                    forever
                  </span>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-8 px-4 py-1.5 rounded-full bg-white/90 shadow-md text-xs font-rounded font-bold text-[var(--pink-strong)]"
          >
            Developing Memories... 📷
          </motion.div>
        </div>
      )}

      {/* 4. Envelope Reveal Transition */}
      {transitionType === "envelope" && (
        <div className="relative z-10 flex flex-col items-center justify-center">
          {/* Animated Letter Envelope */}
          <motion.div
            initial={{ scale: 0.6, y: 30, opacity: 0 }}
            animate={{
              scale: transitionPhase === "exit" ? 28 : transitionPhase === "active" ? 22 : 1,
              opacity: transitionPhase === "exit" ? 0 : 1,
            }}
            transition={{ duration: 0.45 }}
            className="relative w-64 h-48 bg-gradient-to-br from-[#FFF9FB] to-[#FFE4EC] rounded-2xl shadow-2xl border-2 border-[var(--border-subtle)] flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Top flap */}
            <motion.div
              initial={{ rotateX: 0 }}
              animate={{ rotateX: 180 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#FFCADB] to-[#FFE0EA] origin-top border-b border-pink-200"
              style={{
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              }}
            />

            {/* Glowing Heart Wax Seal */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[var(--pink-primary)] to-[var(--pink-strong)] flex items-center justify-center text-xl shadow-md text-white z-10">
              💌
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-8 px-4 py-1.5 rounded-full bg-white/90 shadow-md text-xs font-rounded font-bold text-[var(--pink-strong)]"
          >
            Unsealing A Love Letter... ✉️
          </motion.div>
        </div>
      )}

      {/* 5. Floating Heart Dissolve Transition */}
      {transitionType === "dissolve" && (
        <div className="relative z-10 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: transitionPhase === "exit" ? 1.6 : 1,
              opacity: transitionPhase === "exit" ? 0 : 1,
            }}
            transition={{ duration: 0.4 }}
            className="w-40 h-40 rounded-full bg-gradient-to-tr from-[var(--pale-rose)] to-[var(--bg-blush)] flex items-center justify-center shadow-xl"
          >
            <span className="text-6xl animate-pulse-soft">💖</span>
          </motion.div>

          {floatingParticles.slice(0, 8).map((p) => (
            <motion.span
              key={p.id}
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: -120, opacity: [0, 1, 0] }}
              transition={{ duration: 0.7, delay: p.delay }}
              className="absolute text-2xl select-none"
              style={{ left: `calc(50% + ${p.x}px)` }}
            >
              {p.emoji}
            </motion.span>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface WelcomeExperienceProps {
  recipientNickname: string;
  title: string;
  subtitle: string;
  message: string;
  onEnter: () => void;
}

export function WelcomeExperience({
  recipientNickname,
  title,
  subtitle,
  message,
  onEnter,
}: WelcomeExperienceProps) {
  const [isRevealing, setIsRevealing] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const handleOpen = () => {
    setIsRevealing(true);
    setTimeout(() => setShowContent(true), 800);
  };

  return (
    <AnimatePresence mode="wait">
      {!showContent ? (
        <motion.section
          key="welcome-closed"
          id="welcome"
          className="min-h-screen flex flex-col items-center justify-center px-6 relative"
          exit={{ opacity: 0, scale: 0.95, y: -30 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Decorative circles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute -top-20 -right-20 w-80 h-80 rounded-full animate-float-slow"
              style={{ background: "radial-gradient(circle, var(--bg-blush) 0%, transparent 70%)" }}
            />
            <div
              className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full animate-float"
              style={{ background: "radial-gradient(circle, var(--pale-rose) 0%, transparent 70%)" }}
            />
            <div
              className="absolute top-1/3 right-10 w-40 h-40 rounded-full"
              style={{ background: "radial-gradient(circle, var(--lavender) 0%, transparent 70%)", opacity: 0.5 }}
            />
          </div>

          {/* Small greeting */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-script text-2xl md:text-3xl mb-4"
            style={{ color: "var(--pink-strong)" }}
          >
            Hey, {recipientNickname} 💕
          </motion.p>

          {/* Main title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="font-serif text-4xl md:text-6xl lg:text-7xl font-semibold text-center leading-tight max-w-3xl"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="mt-6 text-lg md:text-xl text-center max-w-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            {subtitle}
          </motion.p>

          {/* Gift Box / Envelope */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4, duration: 0.8, type: "spring", stiffness: 100 }}
            className="mt-12 relative"
          >
            {!isRevealing ? (
              <button
                onClick={handleOpen}
                className="group relative cursor-pointer"
                aria-label="Open your surprise"
              >
                {/* Envelope */}
                <div className="relative w-64 h-44 md:w-80 md:h-52 transition-transform duration-300 group-hover:scale-105">
                  {/* Envelope body */}
                  <div
                    className="absolute inset-0 rounded-2xl shadow-lg"
                    style={{
                      background: "linear-gradient(135deg, var(--pale-rose) 0%, var(--bg-blush) 100%)",
                      border: "2px solid var(--border-subtle)",
                    }}
                  />
                  {/* Envelope flap */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1/2 origin-top transition-transform duration-500 group-hover:-rotate-x-6"
                    style={{
                      background: "linear-gradient(180deg, var(--bg-blush) 0%, var(--pale-rose) 100%)",
                      clipPath: "polygon(0 0, 50% 60%, 100% 0)",
                      borderBottom: "2px solid var(--border-subtle)",
                    }}
                  />
                  {/* Heart seal */}
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
                    <div
                      className="w-10 h-10 flex items-center justify-center rounded-full animate-pulse-soft"
                      style={{ background: "var(--pink-primary)" }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </div>
                  </div>
                  {/* Text on envelope */}
                  <div className="absolute inset-0 flex items-end justify-center pb-6">
                    <span
                      className="font-script text-xl md:text-2xl"
                      style={{ color: "var(--pink-strong)" }}
                    >
                      For You ♡
                    </span>
                  </div>
                </div>

                {/* CTA text */}
                <motion.p
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="mt-8 text-center font-sans text-sm tracking-widest uppercase"
                  style={{ color: "var(--pink-primary)" }}
                >
                  Tap to open your surprise
                </motion.p>
              </button>
            ) : (
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 0.9, 1.05, 0], rotate: [0, -5, 5, -3, 0] }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="w-64 h-44 md:w-80 md:h-52 rounded-2xl flex items-center justify-center"
                style={{ background: "var(--bg-blush)" }}
              >
                <span className="text-6xl">💕</span>
              </motion.div>
            )}
          </motion.div>
        </motion.section>
      ) : (
        <motion.section
          key="welcome-open"
          id="welcome"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative"
        >
          {/* Sparkle burst */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.8] }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <span className="text-6xl md:text-8xl">✨</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-center max-w-2xl"
          >
            <p
              className="font-script text-3xl md:text-4xl mb-6"
              style={{ color: "var(--pink-strong)" }}
            >
              Welcome to our little world
            </p>
            <p
              className="text-base md:text-lg leading-relaxed mb-10"
              style={{ color: "var(--text-secondary)", lineHeight: 1.9 }}
            >
              {message}
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEnter}
            className="px-10 py-4 rounded-full font-sans font-medium text-white text-lg shadow-lg cursor-pointer transition-shadow hover:shadow-xl"
            style={{
              background: "linear-gradient(135deg, var(--pink-primary) 0%, var(--pink-strong) 100%)",
              boxShadow: "0 8px 30px var(--shadow-pink-strong)",
            }}
          >
            Begin Exploring ♡
          </motion.button>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface WizardWelcomeProps {
  onStart: () => void;
}

export function WizardWelcome({ onStart }: WizardWelcomeProps) {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-4 py-12 relative overflow-hidden">
      {/* Decorative floating hearts background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.span
          animate={{ y: [0, -18, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-12 left-[15%] text-2xl"
        >
          🌸
        </motion.span>
        <motion.span
          animate={{ y: [0, -25, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-28 right-[18%] text-3xl"
        >
          💕
        </motion.span>
        <motion.span
          animate={{ y: [0, -15, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-20 left-[20%] text-2xl"
        >
          ✨
        </motion.span>
        <motion.span
          animate={{ y: [0, -20, 0], opacity: [0.25, 0.7, 0.25] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute bottom-28 right-[22%] text-3xl"
        >
          💖
        </motion.span>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="max-w-xl w-full bg-white/80 backdrop-blur-xl border border-[var(--border-subtle)] rounded-3xl p-8 sm:p-14 shadow-2xl shadow-pink-200/40 relative z-10"
      >
        {/* Soft adorable illustration */}
        <div className="w-28 h-28 mx-auto mb-6 relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[var(--pale-rose)] via-pink-100 to-rose-50 blur-md opacity-80" />
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src="/images/519-5196830_cute-cat-png.png"
              alt="Romantic Website Creator"
              width={100}
              height={100}
              className="object-contain drop-shadow-md select-none"
              priority
            />
          </div>
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-[var(--pink-strong)] font-rounded block mb-3">
          Romantic Website Creator & Personalization
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] leading-tight mb-5">
          Let&apos;s make something that feels like us.
        </h1>

        <p className="font-rounded text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed mb-8 max-w-md mx-auto">
          A little world made from your favorite memories, your words, your photographs, and all the things you want your person to feel.
        </p>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onStart}
          className="w-full sm:w-auto px-10 py-4 rounded-full bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white font-rounded font-semibold text-base sm:text-lg shadow-lg shadow-pink-300/40 hover:shadow-xl hover:shadow-pink-400/50 cursor-pointer transition-all inline-flex items-center justify-center gap-2 mb-4"
        >
          <span>Create our little world ♡</span>
        </motion.button>

        <p className="text-xs font-rounded text-[var(--text-muted)]">
          You can change everything before your website is ready.
        </p>
      </motion.div>
    </div>
  );
}

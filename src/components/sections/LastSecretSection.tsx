"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { SectionWrapper } from "../SectionWrapper";
import { RomanticCharacter } from "../RomanticCharacter";

interface LastSecretSectionProps {
  revealHeading?: string;
  revealMessage?: string;
  surprisePhoto?: string;
  buttonLabel?: string;
  finalNote?: string;
  illustration?: string;
}

export function LastSecretSection({
  revealHeading = "One Last Little Secret ♡",
  revealMessage = "Before we reach the very end, there is one quiet truth I want you to carry in your heart: out of every place in the world, and every timeline in the universe, being loved by you is the greatest gift my life has ever known.",
  surprisePhoto,
  buttonLabel = "Tap to unlock my final secret 🤫",
  finalNote = "Forever tucked into our private universe. Just for you.",
  illustration = "/images/519-5196830_cute-cat-png.png",
}: LastSecretSectionProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <SectionWrapper
      id="lastSecret"
      title="One Last Little Secret"
      subtitle="A hidden surprise meant only for your eyes."
      emoji="🤫"
      bgVariant="blush"
      chapterNumber={17}
    >
      <div className="max-w-2xl mx-auto text-center">
        {/* Adorable illustration companion */}
        <div className="flex justify-center -mt-2 mb-6">
          <RomanticCharacter
            character="huggingCouple"
            size={180}
            animation="gentle-float"
            sparkles
          />
        </div>

        <AnimatePresence mode="wait">
          {!isRevealed ? (
            <motion.div
              key="sealed-box"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, rotate: -2 }}
              className="bg-white/90 backdrop-blur-md border border-[var(--border-subtle)] rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-tr from-[var(--pale-rose)] to-pink-100 flex items-center justify-center text-3xl shadow-inner border border-pink-200/50">
                🔒
              </div>

              <span className="text-xs font-bold uppercase tracking-widest text-[var(--pink-strong)] font-rounded block mb-2">
                A Sealed Note Just For You
              </span>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-4">
                {revealHeading}
              </h3>

              <p className="text-sm sm:text-base font-rounded text-[var(--text-secondary)] leading-relaxed mb-8 max-w-md mx-auto">
                I kept this little piece hidden until now. Whenever you&apos;re ready, open it to reveal what&apos;s inside.
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsRevealed(true)}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white font-rounded font-semibold shadow-lg hover:shadow-xl hover:shadow-pink-300/50 cursor-pointer transition-all inline-flex items-center gap-3 text-base"
              >
                <span>{buttonLabel}</span>
                <span className="text-xl">✨</span>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="revealed-content"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-white/95 backdrop-blur-md border border-[var(--border-subtle)] rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden text-left"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💌</span>
                  <span className="font-rounded text-xs font-bold uppercase tracking-wider text-[var(--pink-strong)]">
                    Secret Revealed
                  </span>
                </div>
                <span className="text-xs text-[var(--text-muted)] font-rounded">
                  Tucked in our world ♡
                </span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-6 text-center sm:text-left">
                {revealHeading}
              </h3>

              {surprisePhoto && (
                <div className="rounded-2xl overflow-hidden aspect-[4/3] border border-[var(--border-subtle)] mb-6 shadow-md bg-[var(--soft-pink)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={surprisePhoto}
                    alt="Our secret memory"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <p className="font-serif italic text-lg sm:text-xl text-[var(--text-primary)] leading-relaxed mb-8 whitespace-pre-line">
                &ldquo;{revealMessage}&rdquo;
              </p>

              {finalNote && (
                <div className="pt-4 border-t border-[var(--border-subtle)] text-center">
                  <p className="font-handwritten text-xl text-[var(--pink-strong)]">
                    {finalNote}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SectionWrapper>
  );
}

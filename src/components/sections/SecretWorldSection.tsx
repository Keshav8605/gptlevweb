"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { SectionWrapper } from "../SectionWrapper";
import { RomanticCharacter } from "../RomanticCharacter";

interface RevealedContent {
  title: string;
  letter: string;
  photos: string[];
}

export function SecretWorldSection({ initialHint }: { initialHint?: string }) {
  const [input, setInput] = useState("");
  const [hint, setHint] = useState(
    initialHint || "Three words, no spaces, all lowercase — the simplest truth I know 💕"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);
  const [revealedData, setRevealedData] = useState<RevealedContent | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const savedSession = sessionStorage.getItem("gift_secret_world_content");
      return savedSession ? JSON.parse(savedSession) : null;
    } catch {
      return null;
    }
  });
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return !!sessionStorage.getItem("gift_secret_world_content");
    } catch {
      return false;
    }
  });
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Fetch current public hint from server
  useEffect(() => {
    fetch("/api/secret/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.hint) setHint(data.hint);
      })
      .catch(() => {});
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  // Full-size photo lightbox Escape key & body scroll lock
  useEffect(() => {
    if (!activePhoto) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActivePhoto(null);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [activePhoto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || lockoutSeconds > 0) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/secret/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: input }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.content) {
        setRevealedData(data.content);
        setIsUnlocked(true);
        setInput("");
        try {
          sessionStorage.setItem("gift_secret_world_content", JSON.stringify(data.content));
        } catch {}
      } else {
        setErrorMessage(data.error || "Incorrect secret phrase.");
        if (typeof data.remainingAttempts === "number") {
          setRemainingAttempts(data.remainingAttempts);
        }
        if (data.lockedUntilSeconds) {
          setLockoutSeconds(data.lockedUntilSeconds);
        }
      }
    } catch {
      setErrorMessage("Network issue. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLockAgain = () => {
    setIsUnlocked(false);
    setRevealedData(null);
    try {
      sessionStorage.removeItem("gift_secret_world_content");
    } catch {}
  };

  return (
    <SectionWrapper
      id="secretWorld"
      eyebrowLabel="JUST BETWEEN US"
      title="Our Secret World"
      subtitle="A tiny corner of the universe that feels like ours."
      emoji="🔒"
      bgVariant="surface"
      chapterNumber={4}
      nextSectionId="deluluMode"
      nextSectionLabel="Enter our delulu universe 🦋"
      nextSectionEmoji="🦋"
    >
      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {!isUnlocked ? (
            <motion.div
              key="locked"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-[var(--romantic-plum)] shadow-[0_12px_40px_rgba(81,36,63,0.16)] text-center relative overflow-hidden"
            >
              {/* Cozy Snuggle Couple PNG Illustration */}
              <div className="flex justify-center mb-6">
                <RomanticCharacter
                  character="cozyCouple"
                  size={215}
                  animation="soft-breathe"
                  sparkles
                />
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] mb-2">
                A little secret, just for us
              </h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed mb-6">
                There&apos;s a little surprise waiting behind this door. Enter our special phrase, and let&apos;s see what&apos;s on the other side.
              </p>

              {/* Gentle Whisper Hint Toggle Button & Expandable Card */}
              {!showHint ? (
                <div className="mb-8">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setShowHint(true)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[var(--pale-rose)] via-[#FFF4F7] to-[var(--pale-rose)] hover:from-[#FFE4EC] hover:to-[#FFE4EC] border border-[var(--pink-primary)]/35 hover:border-[var(--pink-primary)] text-xs sm:text-sm font-rounded font-semibold text-[var(--pink-strong)] shadow-[0_2px_10px_rgba(255,95,150,0.12)] hover:shadow-[0_4px_16px_rgba(255,95,150,0.22)] transition-all duration-300 cursor-pointer group"
                  >
                    <span className="text-sm group-hover:scale-120 transition-transform">💌</span>
                    <span>Need a sweet little hint, my love?</span>
                    <span className="text-xs text-[var(--pink-strong)]">♡</span>
                  </motion.button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.96 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.96 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="mb-8 max-w-lg mx-auto overflow-hidden"
                >
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[var(--warm-cream)] via-[#FFF5F8] to-[var(--pale-rose)]/60 border border-[var(--pink-primary)]/30 shadow-sm relative text-left">
                    <div className="flex items-start gap-3">
                      <span className="text-xl mt-0.5">💌</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-[var(--pink-strong)] uppercase tracking-wider font-rounded">
                            A sweet little clue for you ♡
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowHint(false)}
                            className="text-xs text-[var(--text-muted)] hover:text-[var(--pink-strong)] font-rounded cursor-pointer px-2 py-0.5 rounded-full hover:bg-white/80 transition-colors"
                          >
                            hide ♡
                          </button>
                        </div>
                        <p className="font-serif italic text-sm sm:text-base text-[var(--romantic-plum)] leading-relaxed">
                          {hint}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Form Input */}
              <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    disabled={lockoutSeconds > 0 || isLoading}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Our secret phrase…"
                    className={`w-full px-5 py-3.5 rounded-2xl text-center text-sm sm:text-base border transition-all outline-none font-sans ${
                      errorMessage
                        ? "border-rose-400 bg-rose-50/50"
                        : "border-[var(--border-medium)] focus:border-[var(--pink-primary)] bg-[var(--bg-main)]"
                    }`}
                  />
                </div>

                {/* Error message & attempts */}
                <AnimatePresence>
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-rose-500 font-medium"
                    >
                      {errorMessage}
                      {remainingAttempts !== null && remainingAttempts > 0 && lockoutSeconds === 0 && (
                        <span className="block text-[11px] text-[var(--text-muted)] mt-0.5">
                          ({remainingAttempts} {remainingAttempts === 1 ? "attempt" : "attempts"} remaining before temporary cooldown)
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {lockoutSeconds > 0 && (
                  <div className="text-xs font-semibold text-[var(--pink-deep)] bg-[var(--pale-rose)] py-2 px-4 rounded-xl inline-block">
                    ⏱ Cooldown active: {lockoutSeconds}s
                  </div>
                )}

                <button
                  type="submit"
                  disabled={lockoutSeconds > 0 || isLoading || !input.trim()}
                  className="w-full py-3.5 rounded-2xl font-medium text-white text-sm sm:text-base bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin text-base">✨</span>
                      <span>Verifying our secret...</span>
                    </>
                  ) : (
                    <>
                      <span>Unlock our little world ♡</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            /* Unlocked View */
            <motion.div
              key="unlocked"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, type: "spring" }}
              className="bg-white rounded-3xl p-8 sm:p-12 border border-[var(--border-medium)] shadow-[0_12px_40px_var(--shadow-pink-strong)] relative overflow-hidden"
            >
              {/* Unlocked Header */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <RomanticCharacter
                    character="huggingCouple"
                    size={215}
                    animation="gentle-float"
                    sparkles
                  />
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest text-[var(--pink-strong)] px-3 py-1 rounded-full bg-[var(--pale-rose)]">
                  JUST BETWEEN US
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--text-primary)] mt-3">
                  You found your way in, my love. ♡
                </h3>
                <p className="text-sm sm:text-base font-handwritten text-xl sm:text-2xl text-[var(--pink-strong)] mt-2">
                  Some things are sweeter when only the two of us understand them.
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      const el = document.getElementById("secret-letter-box");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-1.5 px-6 py-2 rounded-full font-rounded font-semibold text-xs sm:text-sm text-white bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] shadow-sm hover:shadow-md cursor-pointer transition-all"
                  >
                    <span>Stay a little while</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {/* Secret Letter */}
              {revealedData?.letter && (
                <div id="secret-letter-box" className="space-y-4 max-w-xl mx-auto p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[var(--bg-main)] to-[var(--bg-surface)] border border-[var(--border-subtle)] font-serif italic text-base sm:text-lg leading-relaxed text-[var(--text-primary)] mb-8">
                  {revealedData.letter.split("\n\n").map((para, i) => (
                    <p key={i} className="leading-loose">
                      {para}
                    </p>
                  ))}
                </div>
              )}

              {/* Photos Gallery */}
              {revealedData?.photos && revealedData.photos.length > 0 && (
                <div className="mb-8">
                  <p className="text-center font-script text-2xl text-[var(--pink-strong)] mb-4">
                    Moments Only We Cherish ✨
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {revealedData.photos.map((src, i) => (
                      <div
                        key={i}
                        role="button"
                        tabIndex={0}
                        onClick={() => setActivePhoto(src)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setActivePhoto(src);
                          }
                        }}
                        aria-label={`View secret photo ${i + 1} in full size`}
                        className="rounded-2xl overflow-hidden aspect-[4/3] border border-[var(--border-subtle)] shadow-sm hover:shadow-md transition-all cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pink-primary)]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={`Secret memory moment ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lock again toggle */}
              <div className="text-center pt-2 border-t border-[var(--border-subtle)]">
                <button
                  onClick={handleLockAgain}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--pink-strong)] transition-colors cursor-pointer inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pink-primary)]"
                >
                  <span>🔒</span>
                  <span>Lock this haven again</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Photo Lightbox */}
      <AnimatePresence>
        {activePhoto && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePhoto(null)}
              className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md"
            />
            <div
              className="fixed inset-4 sm:inset-10 z-50 flex items-center justify-center"
              onClick={() => setActivePhoto(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 15 }}
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-3xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl relative bg-white p-2.5 sm:p-3 border border-white/20"
              >
                <button
                  onClick={() => setActivePhoto(null)}
                  className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer hover:bg-black/80 transition-colors shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pink-primary)]"
                  aria-label="Close full-size photo"
                >
                  ✕
                </button>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activePhoto}
                  alt="Secret memory in full resolution"
                  className="max-h-[78vh] w-auto rounded-2xl object-contain mx-auto"
                />

                <div className="text-center pt-2 pb-1">
                  <p className="font-handwritten text-lg text-[var(--pink-strong)]">
                    Our Secret World ♡
                  </p>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </SectionWrapper>
  );
}

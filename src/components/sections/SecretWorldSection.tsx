"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { SectionWrapper } from "../SectionWrapper";

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
      title="Our Secret World"
      subtitle="A sanctuary protected by a truth known only to the two of us"
      emoji="🔒"
      bgVariant="surface"
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
              className="bg-white rounded-3xl p-8 sm:p-12 border border-[var(--border-subtle)] shadow-[0_8px_30px_var(--shadow-pink)] text-center relative overflow-hidden"
            >
              {/* Floating padlock badge */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-[var(--pale-rose)] to-[var(--bg-blush)] flex items-center justify-center text-3xl shadow-sm border border-white mb-6"
              >
                🔐
              </motion.div>

              <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] mb-2">
                Protected with Love
              </h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed mb-6">
                Behind this door lies an intimate surprise I prepared just for you. Enter our secret phrase to unlock it.
              </p>

              {/* Gentle Hint Box */}
              <div className="inline-block px-5 py-3 rounded-2xl bg-[var(--warm-cream)] border border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--text-secondary)] mb-8 max-w-lg shadow-xs">
                <span className="font-semibold text-[var(--pink-strong)]">💡 Hint: </span>
                <span className="italic">{hint}</span>
              </div>

              {/* Form Input */}
              <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    disabled={lockoutSeconds > 0 || isLoading}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type our secret phrase..."
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
                      <span>Open Our Secret Haven</span>
                      <span>♡</span>
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
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-16 h-16 mx-auto rounded-full bg-[var(--pale-rose)] flex items-center justify-center text-3xl mb-4"
                >
                  🔓
                </motion.div>
                <span className="text-xs font-semibold uppercase tracking-widest text-[var(--pink-strong)] px-3 py-1 rounded-full bg-[var(--pale-rose)]">
                  Access Granted • Just For You
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--text-primary)] mt-3">
                  {revealedData?.title || "Our Private Haven"}
                </h3>
              </div>

              {/* Secret Letter */}
              {revealedData?.letter && (
                <div className="space-y-4 max-w-xl mx-auto p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[var(--bg-main)] to-[var(--bg-surface)] border border-[var(--border-subtle)] text-sm sm:text-base leading-relaxed text-[var(--text-secondary)] mb-8">
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
                        onClick={() => setActivePhoto(src)}
                        className="rounded-2xl overflow-hidden aspect-[4/3] border border-[var(--border-subtle)] shadow-sm hover:shadow-md transition-all cursor-pointer group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt="Secret memory"
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
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--pink-strong)] transition-colors cursor-pointer inline-flex items-center gap-1.5"
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
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            />
            <div className="fixed inset-4 sm:inset-10 z-50 flex items-center justify-center pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="max-w-2xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl pointer-events-auto relative bg-white p-2"
              >
                <button
                  onClick={() => setActivePhoto(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer hover:bg-black/80"
                >
                  ✕
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activePhoto}
                  alt="Enlarged secret photo"
                  className="max-h-[80vh] w-auto rounded-2xl object-contain mx-auto"
                />
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </SectionWrapper>
  );
}

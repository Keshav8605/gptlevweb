"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { SectionWrapper } from "../SectionWrapper";
import type { Milestone } from "@/lib/gift-data";

interface FinalHeartSectionProps {
  startDate?: string;
  milestones?: Milestone[];
  finalLetter?: string;
  finalMessage?: string;
  senderName: string;
}

interface TimeElapsed {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function FinalHeartSection({
  startDate = "2023-08-20",
  milestones = [],
  finalLetter,
  finalMessage,
  senderName,
}: FinalHeartSectionProps) {
  const [timeElapsed, setTimeElapsed] = useState<TimeElapsed>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [hasSentLove, setHasSentLove] = useState(false);
  const [loveCount, setLoveCount] = useState(0);
  const [floatingIcons, setFloatingIcons] = useState<
    { id: number; x: number; y: number; icon: string }[]
  >([]);

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(startDate).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, now - start);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeElapsed({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  const handleSendLove = () => {
    setHasSentLove(true);
    setLoveCount((prev) => prev + 1);

    const icons = ["💖", "💕", "🌸", "✨", "💌", "🥰"];
    const newItems = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 200,
      y: -Math.random() * 150 - 50,
      icon: icons[Math.floor(Math.random() * icons.length)],
    }));

    setFloatingIcons((prev) => [...prev, ...newItems]);
    setTimeout(() => {
      setFloatingIcons((prev) => prev.filter((item) => !newItems.includes(item)));
    }, 1500);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <SectionWrapper
      id="finalHeart"
      title="Forever & Always"
      subtitle="Every second since the day my life became intertwined with yours"
      emoji="❤️"
      bgVariant="blush"
    >
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Relationship Counter */}
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-script text-2xl md:text-3xl mb-6 text-[var(--pink-strong)]"
          >
            We have been loving each other for
          </motion.p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { label: "Days", value: timeElapsed.days },
              { label: "Hours", value: timeElapsed.hours },
              { label: "Minutes", value: timeElapsed.minutes },
              { label: "Seconds", value: timeElapsed.seconds },
            ].map((unit, i) => (
              <motion.div
                key={unit.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-[var(--border-subtle)] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="font-serif text-3xl md:text-4xl font-bold text-[var(--pink-deep)]">
                  {unit.value.toString().padStart(2, "0")}
                </div>
                <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium mt-1">
                  {unit.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Milestones chips */}
          {milestones && milestones.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-wrap items-center justify-center gap-2 mt-6"
            >
              {milestones.map((m) => (
                <div
                  key={m.id}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/70 border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] shadow-xs"
                >
                  <span className="text-[var(--pink-primary)]">✨</span>
                  <span className="font-medium text-[var(--text-primary)]">{m.label}</span>
                  <span className="text-[var(--text-muted)]">
                    ({new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })})
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Heart Photo Mosaic / Collage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-2xl mx-auto py-6"
        >
          <div className="relative aspect-[16/11] rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white via-[var(--bg-surface)] to-[var(--pale-rose)] border border-[var(--border-medium)] shadow-xl overflow-hidden flex flex-col items-center justify-center text-center">
            {/* Heart SVG Silhouette */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
              <svg width="340" height="340" viewBox="0 0 24 24" fill="var(--pink-primary)">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>

            {/* Collage of Floating Polaroid Moments */}
            <div className="relative z-10 space-y-4">
              <div className="inline-block p-3 rounded-full bg-[var(--pale-rose)] text-3xl animate-bounce">
                💖
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
                You Are My Favorite Story
              </h3>
              <p className="max-w-md mx-auto text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                Out of all the people, in all the places, in all the worlds... finding you will forever be the most wondrous thing that ever happened to me.
              </p>
              <div className="pt-2 flex items-center justify-center gap-2 text-xs text-[var(--pink-strong)] font-script text-xl">
                <span>Always & Forever</span>
                <span>•</span>
                <span>My Heart is Yours</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Personalized Final Letter */}
        {finalLetter && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-3xl p-8 sm:p-12 md:p-16 border border-[var(--border-subtle)] shadow-xl relative overflow-hidden"
          >
            {/* Elegant Header Accent */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--border-medium)]" />
              <span className="font-script text-3xl text-[var(--pink-strong)] px-2">One Last Love Note</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--border-medium)]" />
            </div>

            <div className="space-y-6 text-sm sm:text-base leading-relaxed text-[var(--text-secondary)] font-sans">
              {finalLetter.split("\n\n").map((para, idx) => (
                <p key={idx} className="leading-loose">
                  {idx === 0 ? (
                    <span className="float-left text-4xl sm:text-5xl font-serif text-[var(--pink-strong)] pr-3 pt-1 leading-none font-bold">
                      {para.charAt(0)}
                    </span>
                  ) : null}
                  {idx === 0 ? para.slice(1) : para}
                </p>
              ))}
            </div>

            {finalMessage && (
              <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] text-center sm:text-right">
                <p className="font-script text-2xl text-[var(--pink-strong)]">
                  {finalMessage}
                </p>
                <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mt-1">
                  — With endless love, {senderName}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Send Love Back & Interaction */}
        <div className="text-center pt-4 relative">
          {/* Floating celebratory icons */}
          <AnimatePresence>
            {floatingIcons.map((item) => (
              <motion.span
                key={item.id}
                initial={{ opacity: 1, y: 0, x: 0, scale: 0.5 }}
                animate={{ opacity: 0, y: item.y, x: item.x, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute text-2xl pointer-events-none left-1/2 top-0"
              >
                {item.icon}
              </motion.span>
            ))}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendLove}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white font-medium shadow-lg hover:shadow-xl transition-all cursor-pointer inline-flex items-center gap-3 text-base"
          >
            <span className="text-xl">💌</span>
            <span>{hasSentLove ? "Send More Love!" : "Send Love Back to Me"}</span>
            {loveCount > 0 && (
              <span className="bg-white/25 px-2 py-0.5 rounded-full text-xs font-bold">
                {loveCount}
              </span>
            )}
          </motion.button>

          {hasSentLove && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 font-script text-xl text-[var(--pink-strong)]"
            >
              Your love has been sent right to my heart! 🥺💕
            </motion.p>
          )}

          <div className="mt-12">
            <button
              onClick={scrollToTop}
              className="text-xs tracking-wider uppercase text-[var(--text-muted)] hover:text-[var(--pink-strong)] transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>↑</span>
              <span>Back to beginning of our world</span>
            </button>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { SectionWrapper } from "../SectionWrapper";
import { HeartPhotoCollage } from "../HeartPhotoCollage";
import { FramedPhotoCollage } from "../FramedPhotoCollage";
import { RomanticCharacter } from "../RomanticCharacter";
import { useStoryScene } from "@/context/StorySceneContext";
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
  const [collageStyle, setCollageStyle] = useState<"heart" | "polaroid">("heart");
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

  let sceneContext: ReturnType<typeof useStoryScene> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    sceneContext = useStoryScene();
  } catch {
    sceneContext = null;
  }

  const handleReturnToBeginning = () => {
    if (sceneContext) {
      sceneContext.goToChapter("welcome", "heart-portal");
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <SectionWrapper
      id="finalHeart"
      title="A Thousand Little Moments, One Big Love"
      subtitle="Every picture, every heartbeat, every step leading right to you ♡"
      emoji="❤️"
      bgVariant="blush"
      chapterNumber={14}
      nextSectionId="welcome"
      nextSectionLabel="Relive Our Love Story From the Beginning"
      nextSectionEmoji="✨"
    >
      <div className="max-w-4xl mx-auto space-y-16">
        {/* The Emotional Climax: Interactive Two-Style Photo Collage */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {collageStyle === "heart" ? (
              <motion.div
                key="heart-collage"
                id="panel-heart"
                role="tabpanel"
                aria-labelledby="tab-heart"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
              >
                <HeartPhotoCollage />
              </motion.div>
            ) : (
              <motion.div
                key="polaroid-collage"
                id="panel-polaroid"
                role="tabpanel"
                aria-labelledby="tab-polaroid"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
              >
                <FramedPhotoCollage />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Choose Our Memory Style Toggle directly below the collage */}
          <div className="mt-4 mb-2 flex flex-col items-center justify-center space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">✨</span>
              <h3 className="font-rounded font-bold text-base sm:text-lg text-[var(--plum-dark)] tracking-wide">
                Choose Our Memory Style ♡
              </h3>
              <span className="text-sm">✨</span>
            </div>

            <div
              role="tablist"
              aria-label="Collage Style Selector"
              className="inline-flex p-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[var(--border-subtle)] shadow-[0_4px_16px_rgba(81,36,63,0.08)] gap-1.5"
            >
              <button
                type="button"
                role="tab"
                id="tab-heart"
                aria-selected={collageStyle === "heart"}
                aria-controls="panel-heart"
                onClick={() => setCollageStyle("heart")}
                className={`relative px-4 sm:px-6 py-2 rounded-full font-rounded font-bold text-xs sm:text-sm transition-all duration-300 flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pink-primary)] ${
                  collageStyle === "heart"
                    ? "text-white shadow-md shadow-pink-500/20"
                    : "text-[var(--text-secondary)] hover:text-[var(--pink-strong)] hover:bg-white/60"
                }`}
              >
                {collageStyle === "heart" && (
                  <motion.div
                    layoutId="activeCollagePill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--pink-primary)] via-[#FF6584] to-[var(--pink-strong)] -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span>♡</span>
                <span>Heart Collage</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-polaroid"
                aria-selected={collageStyle === "polaroid"}
                aria-controls="panel-polaroid"
                onClick={() => setCollageStyle("polaroid")}
                className={`relative px-4 sm:px-6 py-2 rounded-full font-rounded font-bold text-xs sm:text-sm transition-all duration-300 flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pink-primary)] ${
                  collageStyle === "polaroid"
                    ? "text-white shadow-md shadow-pink-500/20"
                    : "text-[var(--text-secondary)] hover:text-[var(--pink-strong)] hover:bg-white/60"
                }`}
              >
                {collageStyle === "polaroid" && (
                  <motion.div
                    layoutId="activeCollagePill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--pink-primary)] via-[#FF6584] to-[var(--pink-strong)] -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span>♡</span>
                <span>Polaroid Frame</span>
              </button>
            </div>
          </div>
        </div>

        {/* Relationship Counter */}
        <div className="text-center pt-6 border-t border-[var(--border-subtle)]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center mb-6"
          >
            <div className="mb-2">
              <RomanticCharacter
                character="tenderCouple"
                size={195}
                animation="soft-breathe"
                sparkles
              />
            </div>
            <p className="font-handwritten text-2xl md:text-3xl text-[var(--pink-strong)]">
              We have been loving each other for
            </p>
          </motion.div>

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
                className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-[var(--border-subtle)] shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="font-rounded text-3xl md:text-4xl font-bold text-[var(--pink-deep)]">
                  {unit.value.toString().padStart(2, "0")}
                </div>
                <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-rounded font-semibold mt-1">
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] shadow-2xs font-rounded"
                >
                  <span className="text-[var(--pink-primary)]">✨</span>
                  <span className="font-semibold text-[var(--text-primary)]">{m.label}</span>
                  <span className="text-[var(--text-muted)]">
                    ({new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })})
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Personalized Final Letter / Last Secret */}
        {finalLetter && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-3xl p-8 sm:p-12 md:p-16 border border-[var(--border-subtle)] shadow-xl relative overflow-hidden"
          >
            {/* Adorable kissing couple companion */}
            <div className="flex justify-center mb-6">
              <RomanticCharacter
                character="kissingCouple"
                size={210}
                animation="gentle-float"
                sparkles
              />
            </div>

            {/* Elegant Header Accent */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--border-medium)]" />
              <span className="font-handwritten text-3xl sm:text-4xl text-[var(--pink-strong)] px-2">
                One Last Love Note ♡
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--border-medium)]" />
            </div>

            <div className="space-y-6 text-base sm:text-lg leading-relaxed text-[var(--text-primary)] font-serif italic">
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
                <p className="font-handwritten text-2xl text-[var(--pink-strong)]">
                  {finalMessage}
                </p>
                <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mt-1 font-rounded">
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
            className="px-8 py-4 rounded-full bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white font-rounded font-semibold shadow-lg hover:shadow-xl transition-all cursor-pointer inline-flex items-center gap-3 text-base shadow-pink-300/40"
          >
            <span className="text-xl">💌</span>
            <span>{hasSentLove ? "Send More Love!" : "Send Love Back to Me"}</span>
            {loveCount > 0 && (
              <span className="bg-white/25 px-2 py-0.5 rounded-full text-xs font-bold font-rounded">
                {loveCount}
              </span>
            )}
          </motion.button>

          {hasSentLove && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 font-handwritten text-2xl text-[var(--pink-strong)]"
            >
              Your love has been sent right to my heart! 🥺💕
            </motion.p>
          )}

          <div className="mt-12">
            <button
              onClick={handleReturnToBeginning}
              className="text-xs tracking-wider uppercase text-[var(--text-muted)] hover:text-[var(--pink-strong)] transition-colors cursor-pointer inline-flex items-center gap-1.5 font-rounded font-semibold"
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

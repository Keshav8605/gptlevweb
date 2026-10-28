"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { SectionWrapper } from "../SectionWrapper";
import { HeartPhotoCollage } from "../HeartPhotoCollage";
import { FramedPhotoCollage } from "../FramedPhotoCollage";
import { RomanticCharacter } from "../RomanticCharacter";
import type { Milestone } from "@/lib/gift-data";

interface FinalHeartSectionProps {
  startDate?: string;
  milestones?: Milestone[];
  closingHeading?: string;
  title?: string;
  subtitle?: string;
  finalLetter?: string;
  finalMessage?: string;
  senderName: string;
  signature?: string;
  closingButtonLabel?: string;
  photos?: { id: string; url: string; caption?: string }[];
  centerPhoto?: string;
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
  closingHeading,
  title,
  subtitle,
  finalLetter,
  finalMessage,
  senderName,
  signature,
  closingButtonLabel,
  photos,
  centerPhoto,
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


  const [responseText, setResponseText] = useState("");
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [responseSuccessMessage, setResponseSuccessMessage] = useState("");
  const [responseErrorMessage, setResponseErrorMessage] = useState("");

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseText.trim() || isSubmittingResponse) return;

    setIsSubmittingResponse(true);
    setResponseErrorMessage("");

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("gift_auth_token") || "" : "";
      const res = await fetch("/api/interactions/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "finalResponse",
          targetId: "finale",
          authorName: "My Love",
          authorRole: "recipient",
          content: responseText.trim(),
          token,
        }),
      });

      if (!res.ok) {
        // Fallback local persistence if offline / dev mode
        const existing = JSON.parse(localStorage.getItem("gift_recipient_final_responses") || "[]");
        existing.push({ content: responseText.trim(), date: new Date().toISOString() });
        localStorage.setItem("gift_recipient_final_responses", JSON.stringify(existing));
      }

      setResponseSuccessMessage("Your little message is safely tucked into our story. ♡");
      setResponseText("");
    } catch {
      // In case of network exception, also persist locally so words are never lost
      try {
        const existing = JSON.parse(localStorage.getItem("gift_recipient_final_responses") || "[]");
        existing.push({ content: responseText.trim(), date: new Date().toISOString() });
        localStorage.setItem("gift_recipient_final_responses", JSON.stringify(existing));
        setResponseSuccessMessage("Your little message is safely tucked into our story. ♡");
        setResponseText("");
      } catch {
        setResponseErrorMessage("Could not send right now. Your words are still safe above, please try again.");
      }
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  return (
    <SectionWrapper
      id="finalHeart"
      eyebrowLabel="EVERY LITTLE THING LED HERE"
      title={closingHeading || title || "A Thousand Little Moments, One Big Love"}
      subtitle={finalMessage || subtitle || "Every picture, every laugh, every little step that brought me closer to you."}
      emoji="❤️"
      bgVariant="blush"
      chapterNumber={15}
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
                <HeartPhotoCollage photos={photos} centerPhoto={centerPhoto} />
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

          {/* Style Selector */}
          <div className="mt-4 mb-2 flex flex-col items-center justify-center space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">✨</span>
              <h3 className="font-rounded font-bold text-base sm:text-lg text-[var(--plum-dark)] tracking-wide">
                How would you like to see our story?
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
                <span>Heart collage</span>
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
                <span>Polaroid memories</span>
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
              We&apos;ve been making memories for…
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
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-2.5 mt-6"
          >
            {(milestones.length > 0 ? milestones : [
              { id: "m1", label: "Our first date", date: "2023-07-02" },
              { id: "m2", label: "Our first adventure together", date: "2024-01-15" },
            ]).map((m) => (
              <div
                key={m.id}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/90 border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] shadow-2xs font-rounded"
              >
                <span className="text-[var(--pink-primary)]">✨</span>
                <span className="font-semibold text-[var(--text-primary)]">{m.label}</span>
                <span className="text-[var(--text-muted)]">
                  ({new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })})
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Closing Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-3xl p-8 sm:p-12 md:p-16 border border-[var(--border-subtle)] shadow-xl relative overflow-hidden text-center sm:text-left"
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
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--romantic-plum)] px-2 text-center">
              And this is still only the beginning.
            </h3>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--border-medium)]" />
          </div>

          <div className="space-y-5 text-base sm:text-lg leading-relaxed text-[var(--text-primary)] font-serif italic max-w-2xl mx-auto">
            <p className="leading-loose">
              Of all the things I could wish for, I hope we keep finding our way to each other in the little moments.
            </p>
            <p className="leading-loose">
              More laughs. More adventures. More ordinary days that turn out to be my favorites, simply because you&apos;re in them.
            </p>
            <p className="leading-loose">
              Thank you for being you, for being part of my life, and for giving me so many reasons to smile.
            </p>
            <p className="font-handwritten text-2xl sm:text-3xl text-[var(--pink-strong)] pt-4 font-normal text-center sm:text-right">
              If I had to choose again, I&apos;d still choose you. ♡
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] text-center sm:text-right">
            <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-rounded">
              — {signature || `With endless love, ${senderName}`}
            </p>
          </div>
        </motion.div>

        {/* Final Response Interaction */}
        <div className="bg-white/95 rounded-3xl p-6 sm:p-10 border border-[var(--border-subtle)] shadow-md max-w-2xl mx-auto text-left space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💌</span>
            <h4 className="font-serif text-xl sm:text-2xl font-bold text-[var(--romantic-plum)]">
              Your turn, my love
            </h4>
          </div>

          {responseSuccessMessage ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 rounded-2xl bg-[var(--pale-rose)] border border-[var(--pink-primary)] text-center space-y-2"
            >
              <span className="text-3xl block">💖</span>
              <p className="font-serif text-base font-semibold text-[var(--pink-strong)]">
                {responseSuccessMessage}
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSendResponse} className="space-y-4">
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Tell me what you're feeling…"
                rows={4}
                className="w-full p-4 rounded-2xl border border-[var(--border-medium)] focus:border-[var(--pink-primary)] focus:outline-none bg-[var(--bg-main)] text-sm text-[var(--text-primary)] resize-none"
              />

              {responseErrorMessage && (
                <p className="text-xs text-red-500 font-medium">
                  {responseErrorMessage}
                </p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingResponse || !responseText.trim()}
                  className="px-7 py-3 rounded-full bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white font-rounded font-semibold text-xs sm:text-sm hover:shadow-md cursor-pointer transition-all disabled:opacity-50"
                >
                  {isSubmittingResponse ? "Sending..." : "Send it back to me ♡"}
                </button>
              </div>
            </form>
          )}
        </div>

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
            <span>{closingButtonLabel || "Send a little love back ♡"}</span>
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
              Your love has been sent right to my heart! 🥹💕
            </motion.p>
          )}

        </div>
      </div>
    </SectionWrapper>
  );
}

"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { RomanticCharacter } from "../RomanticCharacter";
import { useStoryScene } from "@/context/StorySceneContext";

interface WelcomeExperienceProps {
  recipientNickname: string;
  title?: string;
  subtitle?: string;
  message?: string;
  startDate?: string;
  onEnter: () => void;
}

export function WelcomeExperience({
  recipientNickname,
  title,
  subtitle,
  message,
  onEnter,
}: WelcomeExperienceProps) {
  const [photoLoaded, setPhotoLoaded] = useState<Record<string, boolean>>({});

  let sceneContext: ReturnType<typeof useStoryScene> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    sceneContext = useStoryScene();
  } catch {
    sceneContext = null;
  }

  const handleStartStory = () => {
    if (sceneContext) {
      sceneContext.goToChapter("observations", "heart-portal");
      return;
    }
    onEnter();
  };

  // 4 Curated Romantic Hero Polaroids (matching Reference 2)
  const heroPolaroids = [
    {
      id: "p1",
      src: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80",
      caption: "A moment I'd keep forever",
      rotation: -5,
      delay: 0,
      positionClass: "hidden lg:block absolute top-6 lg:top-8 left-4 xl:left-12",
    },
    {
      id: "p2",
      src: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=600&q=80",
      caption: "Our favourite view",
      rotation: 4.5,
      delay: 0.5,
      positionClass: "hidden lg:block absolute top-8 lg:top-10 right-4 xl:right-12",
    },
    {
      id: "p3",
      src: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80",
      caption: "Anywhere is lovely with you",
      rotation: 4,
      delay: 1,
      positionClass: "hidden md:block absolute top-[44%] lg:top-[42%] left-4 xl:left-12",
    },
    {
      id: "p4",
      src: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80",
      caption: "Told mostly in bad jokes",
      rotation: -3.5,
      delay: 1.5,
      positionClass: "hidden md:block absolute top-[46%] lg:top-[44%] right-4 xl:right-12",
    },
  ];

  return (
    <section
      id="welcome"
      className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 sm:px-6 py-12 md:py-20 overflow-hidden text-center"
      style={{
        background: "radial-gradient(ellipse at 50% 30%, #FFF5F9 0%, #FFF0F5 50%, #EDE2FA 100%)",
      }}
    >
      {/* Decorative dreamy pastel floating clouds/glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-60 blur-3xl"
          style={{ background: "#FFE0EA" }}
        />
        <div
          className="absolute top-1/4 -right-20 w-80 h-80 rounded-full opacity-50 blur-3xl"
          style={{ background: "#EDE2FA" }}
        />
        <div
          className="absolute -bottom-20 left-1/3 w-96 h-96 rounded-full opacity-40 blur-3xl"
          style={{ background: "#FFCADB" }}
        />
      </div>

      {/* Floating Polaroid: Top-Left (Desktop) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
        animate={{ opacity: 1, scale: 1, rotate: heroPolaroids[0].rotation }}
        transition={{ duration: 0.9, delay: 0.3 }}
        whileHover={{ scale: 1.06, rotate: -2, zIndex: 30 }}
        className={`${heroPolaroids[0].positionClass} z-10 w-56 lg:w-64 xl:w-72 p-4 pb-5 bg-white rounded-2xl shadow-lg border-2 border-[var(--border-subtle)] transform cursor-pointer transition-shadow hover:shadow-2xl`}
      >
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[var(--soft-pink)] shadow-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroPolaroids[0].src}
            alt="Romantic memory moment"
            className="w-full h-full object-cover"
            onLoad={() => setPhotoLoaded((prev) => ({ ...prev, p1: true }))}
          />
          {!photoLoaded.p1 && (
            <div className="absolute inset-0 flex items-center justify-center text-3xl">📸</div>
          )}
        </div>
        <p className="mt-3 font-handwritten text-center text-base xl:text-lg text-[var(--romantic-plum)] font-semibold">
          {heroPolaroids[0].caption}
        </p>
      </motion.div>

      {/* Floating Polaroid: Top-Right (Desktop) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, rotate: 8 }}
        animate={{ opacity: 1, scale: 1, rotate: heroPolaroids[1].rotation }}
        transition={{ duration: 0.9, delay: 0.4 }}
        whileHover={{ scale: 1.06, rotate: 1, zIndex: 30 }}
        className={`${heroPolaroids[1].positionClass} z-10 w-56 lg:w-64 xl:w-72 p-4 pb-5 bg-white rounded-2xl shadow-lg border-2 border-[var(--border-subtle)] transform cursor-pointer transition-shadow hover:shadow-2xl`}
      >
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[var(--lavender)] shadow-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroPolaroids[1].src}
            alt="Romantic memory moment"
            className="w-full h-full object-cover"
            onLoad={() => setPhotoLoaded((prev) => ({ ...prev, p2: true }))}
          />
          {!photoLoaded.p2 && (
            <div className="absolute inset-0 flex items-center justify-center text-3xl">🌅</div>
          )}
        </div>
        <p className="mt-3 font-handwritten text-center text-base xl:text-lg text-[var(--romantic-plum)] font-semibold">
          {heroPolaroids[1].caption}
        </p>
      </motion.div>

      {/* Floating Polaroid: Bottom-Left (Tablet/Desktop) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, rotate: 6 }}
        animate={{ opacity: 1, scale: 1, rotate: heroPolaroids[2].rotation }}
        transition={{ duration: 0.9, delay: 0.5 }}
        whileHover={{ scale: 1.06, rotate: 0, zIndex: 30 }}
        className={`${heroPolaroids[2].positionClass} z-10 w-56 lg:w-64 xl:w-72 p-4 pb-5 bg-white rounded-2xl shadow-lg border-2 border-[var(--border-subtle)] transform cursor-pointer transition-shadow hover:shadow-2xl`}
      >
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[var(--soft-pink)] shadow-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroPolaroids[2].src}
            alt="Romantic memory moment"
            className="w-full h-full object-cover"
            onLoad={() => setPhotoLoaded((prev) => ({ ...prev, p3: true }))}
          />
          {!photoLoaded.p3 && (
            <div className="absolute inset-0 flex items-center justify-center text-3xl">✨</div>
          )}
        </div>
        <p className="mt-3 font-handwritten text-center text-base xl:text-lg text-[var(--romantic-plum)] font-semibold">
          {heroPolaroids[2].caption}
        </p>
      </motion.div>

      {/* Floating Polaroid: Bottom-Right (Tablet/Desktop) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
        animate={{ opacity: 1, scale: 1, rotate: heroPolaroids[3].rotation }}
        transition={{ duration: 0.9, delay: 0.6 }}
        whileHover={{ scale: 1.06, rotate: 0, zIndex: 30 }}
        className={`${heroPolaroids[3].positionClass} z-10 w-56 lg:w-64 xl:w-72 p-4 pb-5 bg-white rounded-2xl shadow-lg border-2 border-[var(--border-subtle)] transform cursor-pointer transition-shadow hover:shadow-2xl`}
      >
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[var(--pale-rose)] shadow-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroPolaroids[3].src}
            alt="Romantic memory moment"
            className="w-full h-full object-cover"
            onLoad={() => setPhotoLoaded((prev) => ({ ...prev, p4: true }))}
          />
          {!photoLoaded.p4 && (
            <div className="absolute inset-0 flex items-center justify-center text-3xl">💛</div>
          )}
        </div>
        <p className="mt-3 font-handwritten text-center text-base xl:text-lg text-[var(--romantic-plum)] font-semibold">
          {heroPolaroids[3].caption}
        </p>
      </motion.div>

      {/* Central Storybook Content */}
      <div className="relative z-20 max-w-2xl mx-auto flex flex-col items-center">
        {/* Adorable Illustrated Couple: Sweet Cheek Kiss & Daydreams (Reference 2 PNG) */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-3"
        >
          <RomanticCharacter
            character="kissingCouple"
            size={230}
            priority
            sparkles
            animation="gentle-float"
            className="cursor-pointer"
          />
        </motion.div>

        {/* Story Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-[var(--border-subtle)] shadow-2xs mb-4"
        >
          <span className="text-[11px] font-bold tracking-widest uppercase font-rounded text-[var(--pink-strong)]">
            CHAPTER ∞ · AN ONGOING STORY
          </span>
          <span className="text-xs">✨</span>
        </motion.div>

        {/* Main Title: "You & Me" in Chunky Rounded Display Font (Inspired by Reference) */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-display cute-love-outline text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight text-[var(--romantic-plum)] leading-none select-none my-2"
        >
          {title && !title.includes("&") ? (
            title
          ) : (
            <>
              {(title || "You & Me").split("&")[0].trim()}{" "}
              <span className="font-script text-[var(--pink-primary)] font-normal px-2 text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] align-middle">
                &amp;
              </span>{" "}
              {(title || "You & Me").split("&")[1]?.trim() || "Me"}
            </>
          )}
        </motion.h1>

        {/* Personalized dedication for recipient */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-3 font-handwritten text-xl sm:text-2xl text-[var(--pink-strong)]"
        >
          For my sweetest {recipientNickname} ♡
        </motion.p>

        {/* Subtitle / Romantic Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mt-3 text-sm sm:text-base md:text-lg text-[var(--text-secondary)] max-w-lg leading-relaxed font-sans"
        >
          {subtitle || "an entirely accidental love story told mostly in polaroids and bad jokes 🥹"}
        </motion.p>

        {/* Optional heartfelt personal message snippet if provided */}
        {message && message !== subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.85 }}
            className="mt-3 text-xs sm:text-sm text-[var(--text-muted)] italic max-w-md"
          >
            &ldquo;{message}&rdquo;
          </motion.p>
        )}

        {/* Primary Action Button: "Let's continue ♡" */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="mt-8 flex flex-col items-center gap-4"
        >
          <button
            onClick={handleStartStory}
            className="group relative px-9 py-3.5 rounded-full text-white font-rounded font-semibold text-base sm:text-lg bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] shadow-lg shadow-pink-300/40 hover:shadow-xl hover:shadow-pink-400/50 hover:scale-105 active:scale-95 cursor-pointer transition-all duration-300 flex items-center gap-2"
          >
            <span>Let&apos;s continue</span>
            <span className="text-xl group-hover:scale-125 transition-transform duration-300">♡</span>
          </button>

          {/* Story Cue */}
          <div className="flex flex-col items-center gap-1.5 pt-3">
            <span className="text-[10px] font-bold tracking-widest uppercase font-rounded text-[var(--pink-strong)]">
              BEGIN OUR LOVE STORYBOOK ♡
            </span>
            <button
              onClick={handleStartStory}
              className="px-3.5 py-1 rounded-full bg-[var(--pale-rose)]/70 text-[var(--pink-deep)] text-[11px] font-semibold animate-bounce cursor-pointer hover:bg-[var(--pale-rose)]"
            >
              open chapter 1 ✨
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

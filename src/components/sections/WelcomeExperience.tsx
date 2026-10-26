"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { RomanticCharacter } from "../RomanticCharacter";

export interface HeroPolaroid {
  id?: string;
  src?: string;
  caption?: string;
}

interface WelcomeExperienceProps {
  recipientNickname: string;
  title?: string;
  eyebrowLabel?: string;
  handwrittenNote?: string;
  subtitle?: string;
  message?: string;
  startDate?: string;
  onEnter: () => void;
  polaroids?: HeroPolaroid[];
  buttonText?: string;
  showPhotoBadges?: boolean;
  character?: string;
  deviceMode?: "desktop" | "mobile";
}

export function WelcomeExperience({
  recipientNickname,
  title,
  eyebrowLabel,
  handwrittenNote,
  subtitle,
  message,
  onEnter,
  polaroids,
  buttonText = "Come inside, my love ♡",
  showPhotoBadges = false,
  character,
  deviceMode,
}: WelcomeExperienceProps) {
  const [photoLoaded, setPhotoLoaded] = useState<Record<string, boolean>>({});
  const [clickedHeart, setClickedHeart] = useState<string | null>(null);

  const handleCardClick = (id: string) => {
    setClickedHeart(id);
    setTimeout(() => {
      setClickedHeart((curr) => (curr === id ? null : curr));
    }, 1200);
  };

  const isDesktopMode = deviceMode === "desktop";
  const isMobileMode = deviceMode === "mobile";

  const desktopCardVisibility = isDesktopMode
    ? "block"
    : isMobileMode
    ? "hidden"
    : "hidden lg:block";

  const mobileStripVisibility = isMobileMode
    ? "block"
    : isDesktopMode
    ? "hidden"
    : "block lg:hidden";

  // 4 Universal Romantic Hero Polaroids positioned in the 4 true corners around the welcome message
  const defaultPolaroidsData = [
    {
      id: "p1",
      src: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80",
      caption: "A moment I'd choose all over again.",
      rotation: -4,
      delay: 0,
      positionClass: "absolute top-4 lg:top-6 xl:top-8 left-3 lg:left-6 xl:left-8",
    },
    {
      id: "p2",
      src: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=600&q=80",
      caption: "Somehow, my heart always finds its way back to you.",
      rotation: 3.5,
      delay: 0.5,
      positionClass: "absolute top-4 lg:top-6 xl:top-8 right-3 lg:right-6 xl:right-8",
    },
    {
      id: "p3",
      src: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80",
      caption: "The world feels softer when I share it with you.",
      rotation: 3,
      delay: 1,
      positionClass: "absolute bottom-6 lg:bottom-8 xl:bottom-10 left-3 lg:left-6 xl:left-8",
    },
    {
      id: "p4",
      src: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80",
      caption: "My favorite person, in a thousand little ways.",
      rotation: -3,
      delay: 1.5,
      positionClass: "absolute bottom-6 lg:bottom-8 xl:bottom-10 right-3 lg:right-6 xl:right-8",
    },
  ];

  const heroPolaroids = defaultPolaroidsData.map((item, idx) => {
    const custom = polaroids?.[idx];
    return {
      ...item,
      src: custom?.src?.trim() || item.src,
      caption: custom?.caption?.trim() || item.caption,
    };
  });

  return (
    <section
      id="welcome"
      className="relative min-h-auto lg:min-h-[860px] flex flex-col items-center justify-center px-4 sm:px-6 py-10 md:py-16 overflow-hidden text-center"
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

      {/* Floating Polaroid: Top-Left (Desktop Corner 1) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
        animate={{ opacity: 1, scale: 1, rotate: heroPolaroids[0].rotation }}
        transition={{ duration: 0.9, delay: 0.3 }}
        whileHover={{ scale: 1.06, rotate: -2, zIndex: 30 }}
        onClick={() => handleCardClick(heroPolaroids[0].id)}
        className={`${desktopCardVisibility} ${heroPolaroids[0].positionClass} z-10 w-44 sm:w-48 lg:w-52 xl:w-56 p-3 sm:p-3.5 pb-4 sm:pb-4.5 bg-white rounded-2xl shadow-lg border-2 border-[var(--border-subtle)] transform cursor-pointer transition-shadow hover:shadow-2xl select-none`}
      >
        {showPhotoBadges && (
          <div className="absolute -top-2.5 -left-2 z-40 px-2.5 py-0.5 rounded-full bg-[var(--pink-strong)] text-white text-[10px] sm:text-[11px] font-bold font-rounded shadow-md border-2 border-white flex items-center gap-1">
            <span>📷</span>
            <span>Photo 1</span>
          </div>
        )}
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
          <AnimatePresence>
            {clickedHeart === heroPolaroids[0].id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.4, y: 10 }}
                animate={{ opacity: 1, scale: 1.3, y: -16 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
              >
                <span className="text-4xl drop-shadow-lg">💖</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="mt-2.5 font-handwritten text-center text-xs sm:text-sm lg:text-base text-[var(--romantic-plum)] font-semibold leading-tight line-clamp-2">
          {heroPolaroids[0].caption}
        </p>
      </motion.div>

      {/* Floating Polaroid: Top-Right (Desktop Corner 2) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, rotate: 8 }}
        animate={{ opacity: 1, scale: 1, rotate: heroPolaroids[1].rotation }}
        transition={{ duration: 0.9, delay: 0.4 }}
        whileHover={{ scale: 1.06, rotate: 1, zIndex: 30 }}
        onClick={() => handleCardClick(heroPolaroids[1].id)}
        className={`${desktopCardVisibility} ${heroPolaroids[1].positionClass} z-10 w-44 sm:w-48 lg:w-52 xl:w-56 p-3 sm:p-3.5 pb-4 sm:pb-4.5 bg-white rounded-2xl shadow-lg border-2 border-[var(--border-subtle)] transform cursor-pointer transition-shadow hover:shadow-2xl select-none`}
      >
        {showPhotoBadges && (
          <div className="absolute -top-2.5 -right-2 z-40 px-2.5 py-0.5 rounded-full bg-[var(--pink-strong)] text-white text-[10px] sm:text-[11px] font-bold font-rounded shadow-md border-2 border-white flex items-center gap-1">
            <span>📷</span>
            <span>Photo 2</span>
          </div>
        )}
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
          <AnimatePresence>
            {clickedHeart === heroPolaroids[1].id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.4, y: 10 }}
                animate={{ opacity: 1, scale: 1.3, y: -16 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
              >
                <span className="text-4xl drop-shadow-lg">💖</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="mt-2.5 font-handwritten text-center text-xs sm:text-sm lg:text-base text-[var(--romantic-plum)] font-semibold leading-tight line-clamp-2">
          {heroPolaroids[1].caption}
        </p>
      </motion.div>

      {/* Floating Polaroid: Bottom-Left (Desktop Corner 3) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, rotate: 6 }}
        animate={{ opacity: 1, scale: 1, rotate: heroPolaroids[2].rotation }}
        transition={{ duration: 0.9, delay: 0.5 }}
        whileHover={{ scale: 1.06, rotate: 0, zIndex: 30 }}
        onClick={() => handleCardClick(heroPolaroids[2].id)}
        className={`${desktopCardVisibility} ${heroPolaroids[2].positionClass} z-10 w-44 sm:w-48 lg:w-52 xl:w-56 p-3 sm:p-3.5 pb-4 sm:pb-4.5 bg-white rounded-2xl shadow-lg border-2 border-[var(--border-subtle)] transform cursor-pointer transition-shadow hover:shadow-2xl select-none`}
      >
        {showPhotoBadges && (
          <div className="absolute -top-2.5 -left-2 z-40 px-2.5 py-0.5 rounded-full bg-[var(--pink-strong)] text-white text-[10px] sm:text-[11px] font-bold font-rounded shadow-md border-2 border-white flex items-center gap-1">
            <span>📷</span>
            <span>Photo 3</span>
          </div>
        )}
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
          <AnimatePresence>
            {clickedHeart === heroPolaroids[2].id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.4, y: 10 }}
                animate={{ opacity: 1, scale: 1.3, y: -16 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
              >
                <span className="text-4xl drop-shadow-lg">💖</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="mt-2.5 font-handwritten text-center text-xs sm:text-sm lg:text-base text-[var(--romantic-plum)] font-semibold leading-tight line-clamp-2">
          {heroPolaroids[2].caption}
        </p>
      </motion.div>

      {/* Floating Polaroid: Bottom-Right (Desktop Corner 4) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
        animate={{ opacity: 1, scale: 1, rotate: heroPolaroids[3].rotation }}
        transition={{ duration: 0.9, delay: 0.6 }}
        whileHover={{ scale: 1.06, rotate: 0, zIndex: 30 }}
        onClick={() => handleCardClick(heroPolaroids[3].id)}
        className={`${desktopCardVisibility} ${heroPolaroids[3].positionClass} z-10 w-44 sm:w-48 lg:w-52 xl:w-56 p-3 sm:p-3.5 pb-4 sm:pb-4.5 bg-white rounded-2xl shadow-lg border-2 border-[var(--border-subtle)] transform cursor-pointer transition-shadow hover:shadow-2xl select-none`}
      >
        {showPhotoBadges && (
          <div className="absolute -top-2.5 -right-2 z-40 px-2.5 py-0.5 rounded-full bg-[var(--pink-strong)] text-white text-[10px] sm:text-[11px] font-bold font-rounded shadow-md border-2 border-white flex items-center gap-1">
            <span>📷</span>
            <span>Photo 4</span>
          </div>
        )}
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
          <AnimatePresence>
            {clickedHeart === heroPolaroids[3].id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.4, y: 10 }}
                animate={{ opacity: 1, scale: 1.3, y: -16 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
              >
                <span className="text-4xl drop-shadow-lg">💖</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="mt-2.5 font-handwritten text-center text-xs sm:text-sm lg:text-base text-[var(--romantic-plum)] font-semibold leading-tight line-clamp-2">
          {heroPolaroids[3].caption}
        </p>
      </motion.div>

      {/* Central Storybook Content */}
      <div className="relative z-20 max-w-xl lg:max-w-2xl mx-auto flex flex-col items-center px-4 w-full">
        {/* Adorable Illustrated Couple: Sweet Cheek Kiss & Daydreams */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-2"
        >
          <RomanticCharacter
            character={
              character === "cozyCouple" || character === "tenderCouple" || character === "huggingCouple"
                ? character
                : "kissingCouple"
            }
            size={200}
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
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 border border-[var(--border-subtle)] shadow-2xs mb-3"
        >
          <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase font-rounded text-[var(--pink-strong)]">
            {eyebrowLabel || "A LITTLE WORLD, JUST FOR YOU"}
          </span>
          <span className="text-xs">✨</span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-display cute-love-outline text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[var(--romantic-plum)] leading-tight select-none my-1.5 max-w-full break-words"
        >
          {title && !title.includes("&") ? (
            title
          ) : (
            <>
              {(title || "You & Me").split("&")[0].trim()}{" "}
              <span className="font-script text-[var(--pink-primary)] font-normal px-2 text-6xl sm:text-7xl md:text-8xl lg:text-9xl align-middle">
                &amp;
              </span>{" "}
              {(title || "You & Me").split("&")[1]?.trim() || "Me"}
            </>
          )}
        </motion.h1>

        {/* Handwritten line */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-1.5 font-handwritten text-lg sm:text-xl md:text-2xl text-[var(--pink-strong)] max-w-lg"
        >
          {handwrittenNote || "If I could put everything I feel into one place, it would look a little like this."}
        </motion.p>

        {/* Recipient dedication */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-1 font-handwritten text-base sm:text-lg md:text-xl text-[var(--romantic-plum)]"
        >
          For my sweetest {recipientNickname || "Baby"} ♡
        </motion.p>

        {/* Supporting text */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mt-2 text-xs sm:text-sm md:text-base text-[var(--text-secondary)] max-w-md lg:max-w-lg leading-relaxed font-sans"
        >
          {subtitle || "A little world made from my favorite person, our little moments, and all the things I sometimes struggle to put into words."}
        </motion.p>

        {/* Quote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-2 text-xs sm:text-sm text-[var(--text-muted)] italic max-w-sm lg:max-w-md"
        >
          &ldquo;{message || "Of all the stories life could give me, you're the one I'd choose to keep living."}&rdquo;
        </motion.p>

        {/* Mobile / Compact Screen 4 Hero Polaroids Ribbon */}
        <div className={`${mobileStripVisibility} mt-5 mb-2 w-full max-w-md px-2`}>
          <div className="flex items-center justify-center gap-1.5 mb-2.5">
            <span className="text-xs">📷</span>
            <span className="text-[11px] font-bold font-rounded text-[var(--pink-strong)] tracking-wider uppercase">
              Our 4 Memory Snapshots
            </span>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-2 px-1 scrollbar-thin snap-x snap-mandatory">
            {heroPolaroids.map((polaroid, idx) => (
              <div
                key={polaroid.id || idx}
                onClick={() => handleCardClick(polaroid.id || `p${idx + 1}`)}
                className="shrink-0 w-40 sm:w-44 snap-center bg-white p-2.5 sm:p-3 pb-3 sm:pb-3.5 rounded-2xl shadow-md border border-[var(--border-subtle)] relative cursor-pointer"
                style={{ transform: `rotate(${polaroid.rotation > 0 ? 1.5 : -1.5}deg)` }}
              >
                {showPhotoBadges && (
                  <div className="absolute -top-2 left-2 z-30 px-2 py-0.5 rounded-full bg-[var(--pink-strong)] text-white text-[10px] font-bold font-rounded shadow-xs flex items-center gap-1">
                    <span>📷</span>
                    <span>Photo {idx + 1}</span>
                  </div>
                )}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[var(--soft-pink)] shadow-2xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={polaroid.src}
                    alt={polaroid.caption || `Photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="mt-1.5 font-handwritten text-center text-xs text-[var(--romantic-plum)] font-semibold line-clamp-2">
                  {polaroid.caption}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Primary Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="mt-6 flex flex-col items-center gap-2"
        >
          <button
            onClick={onEnter}
            className="group relative px-8 py-3 rounded-full text-white font-rounded font-semibold text-sm sm:text-base bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] shadow-lg shadow-pink-300/40 hover:shadow-xl hover:shadow-pink-400/50 hover:scale-105 active:scale-95 cursor-pointer transition-all duration-300 flex items-center gap-2"
          >
            <span>{buttonText ? buttonText.replace("♡", "").trim() : "Come inside, my love"}</span>
            <span className="text-xl group-hover:scale-125 transition-transform duration-300">♡</span>
          </button>

          {/* Single subtle scroll hint */}
          <button
            onClick={onEnter}
            className="group inline-flex items-center gap-1.5 pt-1 text-xs font-rounded font-semibold text-[var(--pink-strong)] hover:text-[var(--pink-deep)] transition-colors cursor-pointer"
          >
            <span>There&apos;s more waiting for you ↓</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}

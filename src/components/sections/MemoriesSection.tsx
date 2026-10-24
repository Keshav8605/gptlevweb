"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { SectionWrapper } from "../SectionWrapper";
import { SharedInteractions } from "../interactions/SharedInteractions";
import { RomanticCharacter } from "../RomanticCharacter";
import { HeartPhotoCollage } from "../HeartPhotoCollage";
import { FramedPhotoCollage } from "../FramedPhotoCollage";
import type { Memory } from "@/lib/gift-data";

export interface MemoriesSectionProps {
  memories: Memory[];
  showPhotoBadges?: boolean;
  collageType?: "heart" | "polaroid";
  onCollageTypeChange?: (type: "heart" | "polaroid") => void;
  heartCenterPhoto?: string;
  heartCenterCaption?: string;
  heartPhotos?: string[];
  heartCaption?: string;
  polaroidCenterPhoto?: string;
  polaroidCenterCaption?: string;
  polaroidBorderPhotos?: string[];
}

// Curated romantic photos for scrapbook demo fallbacks matching Reference 1
const defaultPolaroids = [
  {
    id: "pol-1",
    src: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80",
    caption: "That little place that became ours.",
    rotation: -3,
    tint: "from-[#FCE7EF] to-[#EDE2FA]",
    emoji: "📸",
  },
  {
    id: "pol-2",
    src: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80",
    caption: "I wish I could step back into this afternoon.",
    rotation: 2.5,
    tint: "from-[#FFE0EA] to-[#FFCADB]",
    emoji: "🌸",
  },
  {
    id: "pol-3",
    src: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=600&q=80",
    caption: "One of those moments when everything felt right.",
    rotation: -2,
    tint: "from-[#EDE2FA] to-[#F7F0FF]",
    emoji: "🌅",
  },
  {
    id: "pol-4",
    src: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80",
    caption: "You weren't even trying, and I still couldn't stop looking at you.",
    rotation: 2,
    tint: "from-[#FFF9F3] to-[#FFE0EA]",
    emoji: "🏖️",
  },
  {
    id: "pol-5",
    src: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80",
    caption: "We were supposed to behave. We did not. ♡",
    rotation: -2.5,
    tint: "from-[#FFCADB] to-[#EDE2FA]",
    emoji: "☕",
  },
  {
    id: "pol-6",
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    caption: "A moment I'd choose all over again.",
    rotation: 3,
    tint: "from-[#FFE0EA] to-[#FF5F96]/30",
    emoji: "🌿",
  },
];

export function MemoriesSection({
  memories,
  showPhotoBadges = false,
  collageType: controlledCollageType,
  onCollageTypeChange,
  heartCenterPhoto,
  heartCenterCaption,
  heartPhotos,
  heartCaption,
  polaroidCenterPhoto,
  polaroidCenterCaption,
  polaroidBorderPhotos,
}: MemoriesSectionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [internalCollageStyle, setInternalCollageStyle] = useState<"heart" | "polaroid">(
    controlledCollageType || "heart"
  );

  useEffect(() => {
    if (controlledCollageType) {
      setInternalCollageStyle(controlledCollageType);
    }
  }, [controlledCollageType]);

  const activeCollageStyle = controlledCollageType || internalCollageStyle;

  const handleStyleChange = (style: "heart" | "polaroid") => {
    setInternalCollageStyle(style);
    onCollageTypeChange?.(style);
  };

  // Combine user memories with default layout
  const displayItems = memories && memories.length > 0
    ? memories.map((m, idx) => {
        const fallback = defaultPolaroids[idx % defaultPolaroids.length];
        return {
          ...m,
          photoUrl: m.photos && m.photos.length > 0 ? m.photos[0] : fallback.src,
          caption: m.title || fallback.caption,
          rotation: fallback.rotation,
          tint: fallback.tint,
        };
      })
    : defaultPolaroids.map((p) => ({
        id: p.id,
        title: p.caption,
        description: "A cherished memory forever kept in my heart ♡",
        photoUrl: p.src,
        caption: p.caption,
        rotation: p.rotation,
        tint: p.tint,
        emoji: p.emoji,
        date: undefined as string | undefined,
        location: undefined as string | undefined,
      }));

  const selectedMemory = selectedIndex !== null ? displayItems[selectedIndex] : null;

  const handlePrevMemory = () => {
    setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
  };

  const handleNextMemory = () => {
    setSelectedIndex((prev) => (prev !== null && prev < displayItems.length - 1 ? prev + 1 : prev));
  };

  // Keyboard navigation for scrapbook modal
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
      } else if (e.key === "ArrowRight") {
        setSelectedIndex((prev) => (prev !== null && prev < displayItems.length - 1 ? prev + 1 : prev));
      } else if (e.key === "Escape") {
        setSelectedIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, displayItems.length]);

  return (
    <SectionWrapper
      id="memories"
      eyebrowLabel="OUR LITTLE ARCHIVE"
      title="Our Memories Scrapbook"
      subtitle="A collection of little moments that mean the entire world to me."
      emoji="📸"
      bgVariant="default"
      chapterNumber={3}
      nextSectionId="secretWorld"
      nextSectionLabel="Enter our secret world 🔐"
      nextSectionEmoji="🔒"
    >
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Subtle character accent for memory scrapbook */}
        <div className="flex justify-center -mt-3 mb-4">
          <RomanticCharacter
            character="kissingCouple"
            size={175}
            animation="subtle-tilt"
            sparkles
          />
        </div>

        {/* Style selector heading & options */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">✨</span>
            <h3 className="font-rounded font-bold text-base sm:text-lg text-[var(--plum-dark)] tracking-wide">
              How shall we keep our memories?
            </h3>
            <span className="text-sm">✨</span>
          </div>

          <div
            role="tablist"
            aria-label="How shall we keep our memories?"
            className="inline-flex p-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[var(--border-subtle)] shadow-[0_4px_16px_rgba(81,36,63,0.08)] gap-1.5"
          >
            <button
              type="button"
              role="tab"
              id="tab-heart-collage"
              aria-selected={activeCollageStyle === "heart"}
              aria-controls="panel-heart-collage"
              onClick={() => handleStyleChange("heart")}
              className={`relative px-5 sm:px-7 py-2.5 rounded-full font-rounded font-bold text-xs sm:text-sm transition-all duration-300 flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pink-primary)] ${
                activeCollageStyle === "heart"
                  ? "bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white shadow-md shadow-pink-300/40 scale-102"
                  : "text-[var(--text-secondary)] hover:text-[var(--romantic-plum)] hover:bg-[var(--soft-pink)]/40"
              }`}
            >
              <span>❤️</span>
              <span>Heart collage</span>
            </button>

            <button
              type="button"
              role="tab"
              id="tab-polaroid-frame"
              aria-selected={activeCollageStyle === "polaroid"}
              aria-controls="panel-polaroid-frame"
              onClick={() => handleStyleChange("polaroid")}
              className={`relative px-5 sm:px-7 py-2.5 rounded-full font-rounded font-bold text-xs sm:text-sm transition-all duration-300 flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pink-primary)] ${
                activeCollageStyle === "polaroid"
                  ? "bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white shadow-md shadow-pink-300/40 scale-102"
                  : "text-[var(--text-secondary)] hover:text-[var(--romantic-plum)] hover:bg-[var(--soft-pink)]/40"
              }`}
            >
              <span>📷</span>
              <span>Polaroid frame</span>
            </button>
          </div>
        </div>

        {/* The Two Distinct Collage Presentations */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {activeCollageStyle === "heart" ? (
              <motion.div
                key="heart-collage"
                id="panel-heart-collage"
                role="tabpanel"
                aria-labelledby="tab-heart-collage"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
              >
                <HeartPhotoCollage
                  centerPhoto={heartCenterPhoto}
                  centerCaption={heartCenterCaption}
                  photos={heartPhotos}
                  caption={heartCaption}
                />
              </motion.div>
            ) : (
              <motion.div
                key="polaroid-collage"
                id="panel-polaroid-frame"
                role="tabpanel"
                aria-labelledby="tab-polaroid-frame"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
              >
                <FramedPhotoCollage
                  centralPhoto={{
                    src: polaroidCenterPhoto || "",
                    caption: polaroidCenterCaption || heartCaption || "You & Me, Always & Forever ♡",
                  }}
                  borderPhotos={polaroidBorderPhotos}
                  caption={polaroidCenterCaption || heartCaption}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Gallery Introduction & Instruction */}
        <div className="pt-8 text-center space-y-2 border-t border-[var(--border-subtle)]/70">
          <p className="font-handwritten text-xl sm:text-2xl text-[var(--pink-strong)]">
            Some moments last only a second. Somehow, the feeling stays forever.
          </p>
          <p className="text-xs sm:text-sm font-rounded font-semibold text-[var(--text-muted)] tracking-wide">
            Choose a picture to uncover its memory ♡
          </p>
        </div>

        {/* Scrapbook Polaroid Grid (Inspired by Reference 1) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 pt-2 pb-8">
          {displayItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              whileHover={{ scale: 1.05, rotate: 0, zIndex: 20 }}
              onClick={() => setSelectedIndex(idx)}
              className="group cursor-pointer select-none"
              style={{
                transform: `rotate(${item.rotation}deg)`,
              }}
            >
              <div className="bg-white p-4 pb-5 rounded-2xl shadow-md group-hover:shadow-2xl border border-[var(--border-subtle)] transition-all duration-300">
                {/* Photo Container */}
                <div className={`relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br ${item.tint} flex items-center justify-center`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.photoUrl}
                    alt={item.caption}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                    onError={(e) => {
                      // Graceful fallback to lovely icon gradient if image fails
                      e.currentTarget.style.display = "none";
                    }}
                  />

                  {/* Photo Number Badge if showPhotoBadges is true */}
                  {showPhotoBadges && (
                    <div className="absolute top-2.5 left-2.5 z-30 px-2.5 py-0.5 rounded-full bg-[var(--pink-strong)] text-white text-[10px] font-bold font-rounded shadow-md border border-white flex items-center gap-1">
                      <span>📷</span>
                      <span>Photo {idx + 1}</span>
                    </div>
                  )}

                  {/* Floating emoji icon badge */}
                  <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-sm shadow-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    💖
                  </div>

                  {/* Cute Classy Hover Story Reveal Overlay */}
                  <div className="absolute inset-0 p-4 sm:p-5 bg-gradient-to-b from-white/95 via-white/92 to-[var(--bg-surface)]/95 backdrop-blur-md rounded-xl flex flex-col justify-between opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300 ease-out shadow-inner border border-white/80 z-20">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2 pb-1.5 border-b border-[var(--border-subtle)]">
                        <span className="text-[11px] font-bold text-[var(--pink-strong)] uppercase tracking-wider font-rounded flex items-center gap-1">
                          <span>{item.emoji || "📸"}</span> Story
                        </span>
                        {item.date && (
                          <span className="text-[10px] text-[var(--text-muted)] font-rounded">
                            {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        )}
                      </div>
                      <p className="font-serif italic text-xs sm:text-sm text-[var(--romantic-plum)] leading-relaxed line-clamp-5 sm:line-clamp-6">
                        &ldquo;{item.description}&rdquo;
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--pink-deep)] font-rounded font-semibold">
                      <span>Tap to read more &amp; comment ♡</span>
                      <span className="text-sm animate-pulse-soft">✨</span>
                    </div>
                  </div>
                </div>

                {/* Handwritten Polaroid Caption */}
                <div className="pt-3.5 text-center">
                  <p className="font-handwritten text-lg sm:text-xl text-[var(--romantic-plum)] leading-snug">
                    {item.caption}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Cute Dot Navigation / Heart Indicators */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <span className="text-[var(--pink-primary)] text-xs">♥</span>
          <span className="text-[var(--pink-primary)] text-sm">♥</span>
          <span className="text-[var(--pink-strong)] text-base">♥</span>
          <span className="text-[var(--pink-primary)] text-sm">♥</span>
          <span className="text-[var(--pink-primary)] text-xs">♥</span>
        </div>
      </div>

      {/* Memory Lightbox Modal */}
      <AnimatePresence>
        {selectedMemory && selectedIndex !== null && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIndex(null)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-xl w-full z-50 bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[var(--border-subtle)] max-h-[90vh] overflow-y-auto"
            >
              {/* Top Bar: Emoji, Position Indicator, Close Button */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{selectedMemory.emoji || "📸"}</span>

                {/* Position Indicator */}
                <span className="text-xs font-rounded font-bold text-[var(--pink-strong)] bg-[var(--pale-rose)]/80 px-3.5 py-1 rounded-full border border-[var(--border-subtle)] shadow-2xs">
                  {selectedIndex + 1} of {displayItems.length} memories
                </span>

                <button
                  onClick={() => setSelectedIndex(null)}
                  className="w-8 h-8 rounded-full bg-[var(--pale-rose)] text-[var(--pink-strong)] flex items-center justify-center cursor-pointer hover:bg-[var(--bg-blush)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pink-primary)]"
                  aria-label="Close memory lightbox"
                >
                  ✕
                </button>
              </div>

              {/* Previous / Next Memory Navigation Buttons */}
              <div className="flex items-center justify-between gap-3 mb-4 pt-1">
                <button
                  type="button"
                  onClick={handlePrevMemory}
                  disabled={selectedIndex === 0}
                  className="px-3.5 py-1.5 rounded-full border border-[var(--border-subtle)] bg-white text-xs font-rounded font-semibold text-[var(--pink-strong)] hover:bg-[var(--pale-rose)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs hover:scale-102 active:scale-98 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pink-primary)]"
                  aria-label="Previous memory"
                >
                  <span>←</span>
                  <span>Previous</span>
                </button>

                <span className="text-[11px] text-[var(--text-muted)] font-rounded font-medium hidden sm:inline">
                  Use ← → keys to browse
                </span>

                <button
                  type="button"
                  onClick={handleNextMemory}
                  disabled={selectedIndex === displayItems.length - 1}
                  className="px-3.5 py-1.5 rounded-full border border-[var(--border-subtle)] bg-white text-xs font-rounded font-semibold text-[var(--pink-strong)] hover:bg-[var(--pale-rose)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs hover:scale-102 active:scale-98 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pink-primary)]"
                  aria-label="Next memory"
                >
                  <span>Next</span>
                  <span>→</span>
                </button>
              </div>

              <motion.div
                key={selectedMemory.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
              >
                <h3 className="font-rounded text-2xl font-bold text-[var(--romantic-plum)] mb-2">
                  {selectedMemory.title}
                </h3>

                {selectedMemory.date && (
                  <p className="text-xs text-[var(--text-muted)] mb-4 font-rounded">
                    {new Date(selectedMemory.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {selectedMemory.location && ` • 📍 ${selectedMemory.location}`}
                  </p>
                )}

                {/* Photo Preview in Modal */}
                {Boolean((selectedMemory as { photoUrl?: string }).photoUrl || ("photos" in selectedMemory && Array.isArray((selectedMemory as { photos?: string[] }).photos) && (selectedMemory as { photos?: string[] }).photos!.length > 0)) && (
                  <div className="rounded-2xl overflow-hidden aspect-[4/3] border border-[var(--border-subtle)] mb-5 shadow-xs bg-[var(--soft-pink)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={(selectedMemory as { photoUrl?: string }).photoUrl || (selectedMemory as { photos?: string[] }).photos![0]}
                      alt={selectedMemory.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <p className="text-base sm:text-lg font-serif italic text-[var(--text-primary)] leading-relaxed mb-6">
                  {selectedMemory.description}
                </p>

                {/* Shared Persistent Reactions & Comments (keyed by memory ID for correct association) */}
                <div className="pt-2 border-t border-[var(--border-subtle)]">
                  <SharedInteractions
                    key={selectedMemory.id}
                    targetType="memory"
                    targetId={selectedMemory.id}
                  />
                </div>
              </motion.div>

              <div className="text-center pt-4">
                <p className="font-handwritten text-xl text-[var(--pink-strong)]">
                  Forever saved in our imaginary scrapbook ♡
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </SectionWrapper>
  );
}

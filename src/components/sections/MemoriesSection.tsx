"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { SectionWrapper } from "../SectionWrapper";
import { SharedInteractions } from "../interactions/SharedInteractions";
import { RomanticCharacter } from "../RomanticCharacter";
import type { Memory } from "@/lib/gift-data";

interface MemoriesSectionProps {
  memories: Memory[];
}

// Curated romantic photos for scrapbook demo fallbacks matching Reference 1
const defaultPolaroids = [
  {
    id: "pol-1",
    src: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80",
    caption: "A moment I'd keep forever",
    rotation: -3,
    tint: "from-[#FCE7EF] to-[#EDE2FA]",
    emoji: "📸",
  },
  {
    id: "pol-2",
    src: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80",
    caption: "Little things, big feelings",
    rotation: 2.5,
    tint: "from-[#FFE0EA] to-[#FFCADB]",
    emoji: "🌸",
  },
  {
    id: "pol-3",
    src: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=600&q=80",
    caption: "Anywhere is lovely with you",
    rotation: -2,
    tint: "from-[#EDE2FA] to-[#F7F0FF]",
    emoji: "🌅",
  },
  {
    id: "pol-4",
    src: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80",
    caption: "One for our imaginary scrapbook",
    rotation: 2,
    tint: "from-[#FFF9F3] to-[#FFE0EA]",
    emoji: "🏖️",
  },
  {
    id: "pol-5",
    src: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80",
    caption: "The best kind of ordinary",
    rotation: -2.5,
    tint: "from-[#FFCADB] to-[#EDE2FA]",
    emoji: "☕",
  },
  {
    id: "pol-6",
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    caption: "My favourite view",
    rotation: 3,
    tint: "from-[#FFE0EA] to-[#FF5F96]/30",
    emoji: "🌿",
  },
];

export function MemoriesSection({ memories }: MemoriesSectionProps) {
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

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
      }));

  return (
    <SectionWrapper
      id="memories"
      title="Little moments, big feelings ♡"
      subtitle="Every picture holds a little story."
      emoji="📸"
      bgVariant="default"
    >
      <div className="max-w-5xl mx-auto">
        {/* Subtle character accent for memory scrapbook */}
        <div className="flex justify-center -mt-3 mb-6">
          <RomanticCharacter
            character="kissingCouple"
            size={175}
            animation="subtle-tilt"
            sparkles
          />
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
              onClick={() => setSelectedMemory(item as Memory)}
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
                  {/* Floating emoji icon badge */}
                  <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-sm shadow-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    💖
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
        {selectedMemory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMemory(null)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-xl w-full z-50 bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[var(--border-subtle)] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">{selectedMemory.emoji || "📸"}</span>
                <button
                  onClick={() => setSelectedMemory(null)}
                  className="w-8 h-8 rounded-full bg-[var(--pale-rose)] text-[var(--pink-strong)] flex items-center justify-center cursor-pointer hover:bg-[var(--bg-blush)] transition-colors"
                >
                  ✕
                </button>
              </div>

              <h3 className="font-rounded text-2xl font-bold text-[var(--romantic-plum)] mb-2">
                {selectedMemory.title}
              </h3>

              {selectedMemory.date && (
                <p className="text-xs text-[var(--text-muted)] mb-4">
                  {new Date(selectedMemory.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {selectedMemory.location && ` • 📍 ${selectedMemory.location}`}
                </p>
              )}

              {/* Photo Preview in Modal */}
              {selectedMemory.photos && selectedMemory.photos.length > 0 && (
                <div className="rounded-2xl overflow-hidden aspect-[4/3] border border-[var(--border-subtle)] mb-5 shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedMemory.photos[0]}
                    alt={selectedMemory.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <p className="text-base sm:text-lg font-serif italic text-[var(--text-primary)] leading-relaxed mb-6">
                {selectedMemory.description}
              </p>

              {/* Shared Persistent Reactions & Comments */}
              <div className="pt-2 border-t border-[var(--border-subtle)]">
                <SharedInteractions
                  targetType="memory"
                  targetId={selectedMemory.id}
                />
              </div>

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

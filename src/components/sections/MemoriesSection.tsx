"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { SectionWrapper } from "../SectionWrapper";
import { SharedInteractions } from "../interactions/SharedInteractions";
import type { Memory } from "@/lib/gift-data";

interface MemoriesSectionProps {
  memories: Memory[];
}

const categoryColors: Record<string, string> = {
  funny: "bg-[#FFE8D6] text-[#A75D27]",
  romantic: "bg-[var(--pale-rose)] text-[var(--pink-strong)]",
  memorable: "bg-[var(--lavender)] text-[#70529A]",
  "ordinary-but-special": "bg-[#E5F0E0] text-[#4A723D]",
};

const categoryLabels: Record<string, string> = {
  funny: "😂 Funny Moment",
  romantic: "💕 Pure Romance",
  memorable: "✨ Forever Cherished",
  "ordinary-but-special": "🤍 Ordinary but Special",
};

export function MemoriesSection({ memories }: MemoriesSectionProps) {
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  return (
    <SectionWrapper
      id="memories"
      title="Our Memories"
      subtitle="Every little adventure, quiet whisper, and belly laugh with you"
      emoji="📸"
      bgVariant="default"
    >
      <div className="space-y-16 md:space-y-24">
        {memories.map((memory, i) => {
          const isEven = i % 2 === 0;

          return (
            <motion.article
              key={memory.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} gap-8 md:gap-12 items-center`}
            >
              {/* Polaroid-style photo frame / scrapbook visual */}
              <div
                onClick={() => setSelectedMemory(memory)}
                className="w-full md:w-5/12 cursor-pointer group"
              >
                <div
                  className="bg-white p-4 pb-7 rounded-2xl shadow-lg border border-[var(--border-subtle)] transition-all duration-300 transform group-hover:scale-102 group-hover:-rotate-1 group-hover:shadow-2xl"
                  style={{
                    boxShadow: "0 10px 30px var(--shadow-pink)",
                  }}
                >
                  <div
                    className="aspect-[4/3] rounded-xl overflow-hidden relative flex items-center justify-center bg-gradient-to-br from-[var(--pale-rose)] via-[var(--bg-blush)] to-[var(--lavender)]"
                  >
                    {memory.photos && memory.photos.length > 0 ? (
                      <img
                        src={memory.photos[0]}
                        alt={memory.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="text-center p-6 flex flex-col items-center">
                        <span className="text-6xl mb-2 animate-bounce">
                          {memory.emoji || "📸"}
                        </span>
                        <p className="font-script text-xl text-[var(--pink-strong)]">
                          Captured in my heart ♡
                        </p>
                      </div>
                    )}

                    {memory.category && (
                      <div
                        className={`absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-semibold shadow-xs ${categoryColors[memory.category] || "bg-white text-[var(--text-primary)]"}`}
                      >
                        {categoryLabels[memory.category] || memory.category}
                      </div>
                    )}
                  </div>

                  {/* Caption line */}
                  <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-muted)] px-1">
                    <span className="font-script text-base text-[var(--pink-strong)]">
                      {memory.title}
                    </span>
                    {memory.date && (
                      <span>
                        {new Date(memory.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Memory Story Description and Reactions */}
              <div className="w-full md:w-7/12 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{memory.emoji || "✨"}</span>
                  <h3 className="font-serif text-2xl md:text-3xl font-semibold text-[var(--text-primary)]">
                    {memory.title}
                  </h3>
                </div>

                <p className="text-sm md:text-base leading-relaxed text-[var(--text-secondary)]">
                  {memory.description}
                </p>

                {memory.location && (
                  <p className="text-xs flex items-center gap-1.5 text-[var(--text-muted)]">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{memory.location}</span>
                  </p>
                )}

                {/* Shared Persistent Reactions & Comments */}
                <SharedInteractions
                  targetType="memory"
                  targetId={memory.id}
                />
              </div>
            </motion.article>
          );
        })}
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
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
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
                  className="w-8 h-8 rounded-full bg-[var(--pale-rose)] text-[var(--pink-strong)] flex items-center justify-center cursor-pointer hover:bg-[var(--bg-blush)]"
                >
                  ✕
                </button>
              </div>

              <h3 className="font-serif text-2xl font-semibold text-[var(--text-primary)] mb-2">
                {selectedMemory.title}
              </h3>

              {selectedMemory.date && (
                <p className="text-xs text-[var(--text-muted)] mb-4">
                  {new Date(selectedMemory.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {selectedMemory.location && ` • ${selectedMemory.location}`}
                </p>
              )}

              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                {selectedMemory.description}
              </p>

              {selectedMemory.photos && selectedMemory.photos.length > 0 && (
                <div className="rounded-2xl overflow-hidden aspect-[4/3] border border-[var(--border-subtle)] mb-4">
                  <img
                    src={selectedMemory.photos[0]}
                    alt={selectedMemory.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="text-center pt-2">
                <p className="font-script text-xl text-[var(--pink-strong)]">
                  Forever saved in our hearts ♡
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </SectionWrapper>
  );
}

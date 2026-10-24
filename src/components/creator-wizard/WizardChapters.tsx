"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ALL_18_CHAPTERS } from "@/lib/creator-defaults";
import type { CreatorConfig } from "@/lib/creator-types";

interface WizardChaptersProps {
  config: CreatorConfig;
  onChange: (updates: Partial<CreatorConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function WizardChapters({ config, onChange, onNext, onBack }: WizardChaptersProps) {
  const selectedSet = new Set(config.selectedChapterIds);

  const toggleChapter = (id: string) => {
    // Welcome and finalHeart are required structural chapters
    if (id === "welcome" || id === "finalHeart") return;

    if (selectedSet.has(id)) {
      const next = config.selectedChapterIds.filter((chId) => chId !== id);
      onChange({
        selectedChapterIds: next,
        chapterOrder: config.chapterOrder.filter((chId) => chId !== id),
      });
    } else {
      const next = [...config.selectedChapterIds, id];
      // Keep canonical order
      const ordered = ALL_18_CHAPTERS.filter((ch) => next.includes(ch.id)).map((ch) => ch.id);
      onChange({
        selectedChapterIds: ordered,
        chapterOrder: ordered,
      });
    }
  };

  const handleSelectAll = () => {
    const allIds = ALL_18_CHAPTERS.map((c) => c.id);
    onChange({ selectedChapterIds: allIds, chapterOrder: allIds });
  };

  const handleClearSelection = () => {
    // Keep minimum structural elements: welcome and finalHeart
    const minimal = ["welcome", "finalHeart"];
    onChange({ selectedChapterIds: minimal, chapterOrder: minimal });
  };

  const handleApplyRecommended = () => {
    const recommended = ALL_18_CHAPTERS.filter((c) => c.isRecommended).map((c) => c.id);
    onChange({ selectedChapterIds: recommended, chapterOrder: recommended });
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--pink-strong)] font-rounded block mb-2">
          Step 3 · Curate Your Universe
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
          Choose which chapters to include
        </h2>
        <p className="font-rounded text-sm sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto">
          Every chapter becomes its own page in your website. Only selected chapters will appear in the final generated website and navigation.
        </p>

        {/* Action presets & Live counter */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <div className="px-4 py-1.5 rounded-full bg-[var(--soft-pink)] border border-[var(--pink-light)]/50 text-xs font-rounded font-bold text-[var(--pink-strong)]">
            {config.selectedChapterIds.length} of 18 chapters selected
          </div>

          <button
            type="button"
            onClick={handleSelectAll}
            className="px-3.5 py-1.5 rounded-full border border-[var(--border-subtle)] bg-white text-xs font-rounded font-semibold text-[var(--text-secondary)] hover:text-[var(--pink-strong)] hover:border-[var(--pink-primary)] cursor-pointer transition-colors"
          >
            Select All
          </button>

          <button
            type="button"
            onClick={handleApplyRecommended}
            className="px-3.5 py-1.5 rounded-full border border-[var(--pink-primary)] bg-[var(--pale-rose)] text-xs font-rounded font-semibold text-[var(--pink-strong)] hover:bg-[var(--soft-pink)] cursor-pointer transition-colors"
          >
            Recommended Collection (14 chapters)
          </button>

          <button
            type="button"
            onClick={handleClearSelection}
            className="px-3.5 py-1.5 rounded-full border border-[var(--border-subtle)] bg-white text-xs font-rounded font-semibold text-[var(--text-muted)] hover:text-[var(--text-secondary)] cursor-pointer transition-colors"
          >
            Clear Selection
          </button>
        </div>
      </motion.div>

      {/* 18 Chapter Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {ALL_18_CHAPTERS.map((chapter) => {
          const isSelected = selectedSet.has(chapter.id);
          const isRequired = chapter.id === "welcome" || chapter.id === "finalHeart";

          return (
            <motion.div
              key={chapter.id}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleChapter(chapter.id)}
              className={`relative rounded-3xl p-5 border transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden select-none ${
                isSelected
                  ? "bg-gradient-to-br from-white via-white to-pink-50/50 border-[var(--pink-primary)] shadow-md shadow-pink-200/30 ring-2 ring-[var(--pink-primary)]/20"
                  : "bg-white/60 border-[var(--border-subtle)] opacity-70 hover:opacity-90 hover:border-pink-200"
              }`}
            >
              {/* Top Row: Chapter # & Thumbnail & Checkbox */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold font-rounded uppercase tracking-wider text-[var(--pink-strong)] bg-[var(--pale-rose)] px-2.5 py-0.5 rounded-full">
                    Chapter {chapter.chapterNumber}
                  </span>

                  <div className="flex items-center gap-2">
                    {isRequired && (
                      <span className="text-[10px] font-rounded font-bold text-[var(--text-muted)] bg-gray-100 px-2 py-0.5 rounded-full">
                        Required
                      </span>
                    )}

                    {/* Custom Styled Checkbox */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-gradient-to-tr from-[var(--pink-strong)] to-[var(--pink-primary)] text-white shadow-xs"
                          : "border-2 border-[var(--border-medium)] bg-white"
                      }`}
                    >
                      {isSelected && <span className="text-xs font-bold leading-none">✓</span>}
                    </div>
                  </div>
                </div>

                {/* Chapter Title & Emoji */}
                <div className="flex items-start gap-2.5 mb-2">
                  <span className="text-2xl mt-0.5 shrink-0">{chapter.emoji}</span>
                  <h3 className="font-serif text-lg font-bold text-[var(--text-primary)] leading-snug">
                    {chapter.title}
                  </h3>
                </div>

                {/* Short Description */}
                <p className="text-xs font-rounded text-[var(--text-secondary)] leading-relaxed mb-4">
                  {chapter.shortDesc}
                </p>
              </div>

              {/* Card Footer: Small Preview Thumbnail Badge */}
              <div className="pt-3 border-t border-[var(--border-subtle)]/50 flex items-center justify-between">
                <span className="text-[11px] font-rounded text-[var(--text-muted)]">
                  {isSelected ? "Included in website ♡" : "Excluded from website"}
                </span>

                <div className="w-7 h-7 relative opacity-70">
                  <Image
                    src={chapter.thumbnail}
                    alt={chapter.title}
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Chapters Summary Drawer */}
      <div className="mt-8 bg-white/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold font-rounded text-[var(--text-primary)] uppercase tracking-wider">
            Your Selected Journey ({config.selectedChapterIds.length} Chapters)
          </p>
          <p className="text-xs font-rounded text-[var(--text-muted)] mt-0.5">
            You can reorder chapters and fine-tune each one in the next step.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-full border border-[var(--border-subtle)] bg-white text-xs font-rounded font-semibold text-[var(--text-secondary)] hover:bg-[var(--pale-rose)] cursor-pointer transition-colors"
          >
            ← Back
          </button>

          <button
            type="button"
            onClick={onNext}
            className="px-7 py-3 rounded-full bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white text-xs sm:text-sm font-rounded font-semibold shadow-md hover:shadow-lg cursor-pointer transition-all inline-flex items-center gap-2"
          >
            <span>Personalize Selected Chapters →</span>
          </button>
        </div>
      </div>
    </div>
  );
}

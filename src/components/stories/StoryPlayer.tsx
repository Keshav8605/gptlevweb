"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { Story } from "@/lib/stories-data";

interface StoryPlayerProps {
  story: Story;
  initialSceneIndex?: number;
  onBackToStories: () => void;
  onSceneChange?: (sceneIndex: number) => void;
}

export function StoryPlayer({
  story,
  initialSceneIndex = 0,
  onBackToStories,
  onSceneChange,
}: StoryPlayerProps) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(initialSceneIndex);
  const [imageError, setImageError] = useState(false);

  const totalScenes = story.scenes.length;
  const currentScene = story.scenes[currentSceneIndex] || story.scenes[0];
  const isMafia = story.id === "mafia-romance";
  const isFirstScene = currentSceneIndex === 0;
  const isLastScene = currentSceneIndex === totalScenes - 1;

  const handleNext = useCallback(() => {
    if (currentSceneIndex < totalScenes - 1) {
      const nextIndex = currentSceneIndex + 1;
      setCurrentSceneIndex(nextIndex);
      setImageError(false);
      onSceneChange?.(nextIndex);
      // Scroll smoothly to top of player content
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentSceneIndex, totalScenes, onSceneChange]);

  const handlePrev = useCallback(() => {
    if (currentSceneIndex > 0) {
      const prevIndex = currentSceneIndex - 1;
      setCurrentSceneIndex(prevIndex);
      setImageError(false);
      onSceneChange?.(prevIndex);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentSceneIndex, onSceneChange]);

  // Keyboard navigation support: ArrowRight/Next, ArrowLeft/Prev, Escape/Back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        if (!isLastScene) handleNext();
      } else if (e.key === "ArrowLeft") {
        if (!isFirstScene) handlePrev();
      } else if (e.key === "Escape") {
        onBackToStories();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, isLastScene, isFirstScene, onBackToStories]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-10">
      {/* Top Header Bar: Back to Stories & Story Metadata */}
      <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-white/10">
        <button
          onClick={onBackToStories}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
          id="btn-back-to-stories"
        >
          <span>←</span>
          <span>Back to Stories</span>
        </button>

        <div className="flex items-center gap-3">
          <span
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md ${
              isMafia
                ? "bg-rose-950/70 border border-rose-600/40 text-rose-200"
                : "bg-sky-950/70 border border-sky-600/40 text-sky-200"
            }`}
          >
            {isMafia ? "🥀" : "✨"} {story.genre}
          </span>
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-zinc-300 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            Scene {currentSceneIndex + 1} of {totalScenes}
          </span>
        </div>
      </div>

      {/* Main Scene Presentation Container */}
      <div
        className={`rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 border ${
          isMafia
            ? "border-rose-900/40 bg-[#12070e]/90 shadow-[0_20px_50px_rgba(190,18,60,0.18)]"
            : "border-sky-900/40 bg-[#07131d]/90 shadow-[0_20px_50px_rgba(14,165,233,0.18)]"
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="flex flex-col"
          >
            {/* Scene Artwork Area */}
            <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] max-h-[420px] overflow-hidden bg-black/60">
              {!imageError ? (
                <Image
                  src={currentScene.image}
                  alt={currentScene.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 896px"
                  className="object-cover object-center transition-all duration-700"
                  onError={() => setImageError(true)}
                  priority
                />
              ) : (
                /* Polished Genre-Appropriate Fallback */
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
                  style={{
                    background: isMafia
                      ? "radial-gradient(circle at 50% 50%, #300813 0%, #0d0407 100%)"
                      : "radial-gradient(circle at 50% 50%, #08283a 0%, #050d14 100%)",
                  }}
                >
                  <span className="text-4xl sm:text-5xl mb-2">{isMafia ? "🥀" : "🌧️"}</span>
                  <p className="font-serif italic text-base sm:text-lg text-rose-100/90">
                    {currentScene.title}
                  </p>
                </div>
              )}

              {/* Ambient Cinematic Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#12070e] via-transparent to-black/40 pointer-events-none" />

              {/* Bottom Scene Indicator Badge on Image */}
              <div className="absolute bottom-4 left-4 sm:left-6 z-10">
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-black/60 backdrop-blur-md border border-white/10 text-white/90">
                  Scene {currentScene.sceneNumber}
                </span>
              </div>
            </div>

            {/* Scene Text & Content Body */}
            <div className="p-6 sm:p-10 md:p-12 space-y-6">
              {/* Scene Title */}
              <div>
                <span
                  className={`text-xs font-semibold uppercase tracking-widest ${
                    isMafia ? "text-rose-400" : "text-sky-400"
                  }`}
                >
                  {story.title}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-100 mt-2 tracking-tight leading-tight">
                  {currentScene.title}
                </h2>
              </div>

              {/* Ornamental Divider */}
              <div className="flex items-center gap-3 opacity-40">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-zinc-400" />
                <span className="text-xs text-zinc-400">❖</span>
                <div className="h-px flex-1 bg-gradient-to-r from-zinc-400 to-transparent" />
              </div>

              {/* Complete Scene Narrative Text */}
              <div className="prose prose-invert max-w-none">
                <p className="font-serif text-base sm:text-lg md:text-xl text-zinc-200/95 leading-relaxed tracking-normal selection:bg-rose-950 selection:text-rose-100">
                  {currentScene.text}
                </p>
              </div>

              {/* Progress Dots Indicator */}
              <div className="pt-4 flex items-center justify-center gap-2">
                {story.scenes.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setCurrentSceneIndex(idx);
                      setImageError(false);
                      onSceneChange?.(idx);
                    }}
                    className="h-1.5 rounded-full transition-all duration-300 cursor-pointer"
                    style={{
                      width: idx === currentSceneIndex ? "2rem" : "0.5rem",
                      background:
                        idx === currentSceneIndex
                          ? isMafia
                            ? "#f43f5e"
                            : "#38bdf8"
                          : idx < currentSceneIndex
                          ? isMafia
                            ? "rgba(244, 63, 94, 0.4)"
                            : "rgba(56, 189, 248, 0.4)"
                          : "rgba(255, 255, 255, 0.15)",
                    }}
                    aria-label={`Jump to scene ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Scene Navigation Controls */}
              <div className="pt-6 border-t border-white/10 flex items-center justify-between gap-4">
                {/* Previous Button */}
                <button
                  onClick={handlePrev}
                  disabled={isFirstScene}
                  className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isFirstScene
                      ? "opacity-30 cursor-not-allowed text-zinc-500 border border-transparent"
                      : "text-zinc-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 cursor-pointer"
                  }`}
                  aria-label="Previous Scene"
                  id="btn-scene-prev"
                >
                  ← Previous
                </button>

                {/* Next / Completion Button */}
                {isLastScene ? (
                  <button
                    onClick={onBackToStories}
                    className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide text-white shadow-lg cursor-pointer transition-all flex items-center gap-2 ${
                      isMafia
                        ? "bg-gradient-to-r from-rose-700 to-rose-500 hover:from-rose-600 hover:to-rose-400 shadow-rose-950/60"
                        : "bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-600 hover:to-sky-400 shadow-sky-950/60"
                    }`}
                    id="btn-scene-complete"
                  >
                    <span>Story Complete ♡ Back to Stories</span>
                    <span>→</span>
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide text-white shadow-lg cursor-pointer transition-all flex items-center gap-2 ${
                      isMafia
                        ? "bg-gradient-to-r from-rose-700 to-rose-500 hover:from-rose-600 hover:to-rose-400 shadow-rose-950/60"
                        : "bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-600 hover:to-sky-400 shadow-sky-950/60"
                    }`}
                    id="btn-scene-next"
                  >
                    <span>Next Scene</span>
                    <span>→</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
